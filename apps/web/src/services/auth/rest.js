import axios from "axios";
import config from "../constants/config.js"

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
