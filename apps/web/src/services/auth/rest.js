import axios from "axios";
import config from "../constants/config.js"
import {useContext, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import GlobalContext, {useAuth} from "../../store/context.store.js";
import actionsStore from "../../store/actions.store.js";

export const REST_URI =
    config.node_env === 'production'
        ? config.rest_uri_prod
        : config.rest_uri_dev

// --- In-memory access token ---

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// --- Axios client with credentials for cookie support ---

const api = axios.create({
    baseURL: REST_URI,
    withCredentials: true,
});

// --- Token refresh (singleflight) ---

let refreshing = null;

async function refreshAccessToken() {
    if (!refreshing) {
        refreshing = api
            .post("/refreshToken")
            .then((res) => res.data.token)
            .finally(() => (refreshing = null));
    }
    return refreshing;
}

// --- Interceptors ---

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retried) {
            original._retried = true;
            try {
                const token = await refreshAccessToken();
                setAccessToken(token);
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            } catch {
                setAccessToken(null);
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// --- Login / Logout API calls ---

export const loginRequest = async (email, password, rememberMe = false) => {
    const res = await api.post("/login", {
        email,
        password,
        remember_me: rememberMe,
    });
    setAccessToken(res.data.token);
    return res.data.token;
};

export const logoutRequest = async () => {
    try {
        await api.post("/logout");
    } finally {
        setAccessToken(null);
    }
};

/**
 * customAxios Hook for authorized endpoints.
 * Attaches the in-memory access token to each request.
 * The 401 interceptor handles refresh + retry automatically.
 * @param {object} configBody Configuration object to call endpoint.
 * @param {boolean} configBody.tokenAlready Skip refresh check (already verified).
 * @param {string} configBody.url endpoint url for request.
 * @param {string} configBody.method "GET"|"POST"|"PUT"|"DELETE"
 * @param {boolean} configBody.automatic Execute the hook automatically if true.
 * @param {function} configBody.onSuccess callback on a successful response
 * @param {function} configBody.onError callback on a failed response
 */
export const useAuthorizedApi = ({
     tokenAlready = false,
     url,
     method = 'get',
     contentType = 'application/json',
     automatic = false,
     onSuccess = null,
     onError = null,
 }) => {
    const { dispatch } = useAuth()
    const hist = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const executeService = async (body = {}) => {
        try {
            setLoading(true);
            const response = await api({
                method: method,
                url: url,
                data: body,
                params: method === 'get' ? body : null,
                headers: {
                    'Content-Type': contentType,
                },
            });
            setLoading(false);
            setError(null);
            setData(response.data);
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            setLoading(false);
            setData(null);
            setError({
                message: error.message || `Temporarily out of service`,
                statusText: error.response ? error.response.statusText : null,
                code: error.response ? error.response.status : 500,
            });
            if (onError) {
                onError({
                    message: error.message || `Temporarily out of service`,
                    statusText: error.response ? error.response.statusText : null,
                    code: error.response ? error.response.status : 500,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (automatic) {
            executeService()
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { data, loading, error, executeService };
}

/**
 * customAxios Hook for non-authorized (free) endpoints (e.g. login).
 * @param {string} url endpoint url for request.
 * @param {string} method "GET"|"POST"|"PUT"|"DELETE"
 * @param {object} options { onSuccess, onError, headers }
 */
export const useFreeApi = (
    url,
    method = 'get',
    options = { onSuccess: null, onError: null, headers: {} }
) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const executeService = async (body = {}) => {
        try {
            setLoading(true);
            const response = await api({
                method: method,
                url: url,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            setData(response.data);
            setError(null);
            setLoading(false);
            if (options.onSuccess) {
                options.onSuccess(response);
            }
        } catch (error) {
            setData(null);
            setLoading(false);
            setError({
                message: error.message || `Temporarily out of service`,
                statusText: error.response ? error.response.statusText : null,
                code: error.response ? error.response.status : 500,
            });
            if (options.onError) {
                options.onError({
                    message: error.message || `Temporarily out of service`,
                    statusText: error.response ? error.response.statusText : null,
                    code: error.response ? error.response.status : 500,
                });
            }
        }
    };

    return { data, loading, error, executeService };
};

/**
 * Standalone async function for authorized calls.
 * Uses the api instance (with interceptors) so 401s auto-refresh.
 * @param {string} url endpoint url
 * @param {object} bodyData request body
 * @param {string} method "GET"|"POST"|"PUT"|"DELETE"
 * @param {string} contentType optional content type
 */
export const CustomAxios = async (
    url = '',
    bodyData = {},
    method = 'post',
    contentType = 'application/json'
) => {
    try {
        return await api({
            method: method,
            url: url,
            data: bodyData,
            headers: {
                'Content-Type': contentType.toString(),
            },
        });
    } catch (error) {
        return {
            error: {
                message: error.message,
                statusText: error.response ? error.response.statusText : null,
                code: error.response ? error.response.status : 500,
                payload: error.response
                    ? error.response.data
                        ? error.response.data.payload
                            ? error.response.data.payload.message
                            : error.response.data.message
                        : `Temporarily out of service`
                    : `Temporarily Out Of Service`,
            },
        };
    }
};
