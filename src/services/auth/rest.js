import axios from "axios";
import config from "../constants/config.js"
import {useContext, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import GlobalContext, {useAuth} from "../../store/context.store.js";
import {logout} from "./login.js";
import actionsStore from "../../store/actions.store.js";

const clt = axios.CancelToken;
const source = clt.source();

export const REST_URI =
    config.node_env === 'production'
        ? config.rest_uri_prod
        : config.rest_uri_dev

export const instanceAxios = axios.create({
    baseURL: REST_URI,
    responseType: 'json',
    cancelToken: source.token,
});

export const CancelRequest = () => {
    source.cancel('Service Request Aborted');
};

export const verifyTokenLogin = async () => {
    const TOKEN = localStorage.getItem('token');
    // alert(JSON.stringify(TOKEN))
    return await axios
        .post(
            config.rest_uri_dev + '/refreshToken',
            {token: TOKEN},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + TOKEN,
                },
            }
        )
        .then(
            response => {
                localStorage.setItem('token', response.data.token);
                //Cambiar la fecha de la ultima actualizacion del token
                const dateToString = new Date()?.toString();
                localStorage.setItem('latestTokenUpdate', dateToString);
                return true;
            },
            err => {
                localStorage.clear();
                return false;
            }
        )
        .catch(error => {
            localStorage.clear();
            console.error('Verify Token Error in Catch');
            return false;
        });
};

/**
 * <function description>
 * customAxios Hook for authorized endpoints
 * @moisesRadix
 * @param {object} configBody Configuration object to call endpoint.
 * @param {boolean} configBody.tokenAlready In case of multiple calls, set this to avoid a refreshToken verification.
 * @param {string} configBody.url  enpoint url for request.
 * @param {string} configBody.method "GET"|POST"|"PUT"|"DELETE"
 * @param {boolean} configBody.automatic Execute the hook automatically in case of true.
 * @param {function} configBody.onSuccess function callback on a successfull response
 * @param {function} configBody.onError function callback on a failed response
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
    const { state, dispatch } = useAuth()
    const hist = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const executeService = async (body = {}) => {
        try {
            setLoading(true);
            const TOKEN = localStorage.getItem('token');
            if (tokenAlready) {
                const response = await instanceAxios({
                    method: method,
                    url: url,
                    data: body,
                    params: method === 'get' ? body : null,
                    headers: {
                        'Content-Type': contentType,
                        Authorization: 'Bearer ' + TOKEN,
                    },
                });

                setLoading(false);
                setError(null);
                setData(response.data);
                if (onSuccess) {
                    onSuccess(response);
                }
            } else {
                const tkn = await verifyTokenLogin();
                if (tkn) {
                    const response = await instanceAxios({
                        method: method,
                        url: url,
                        data: body,
                        headers: {
                            'Content-Type': contentType,
                            Authorization: 'Bearer ' + TOKEN,
                        },
                    });
                    setLoading(false);
                    setError(null);
                    setData(response.data);
                    if (onSuccess) {
                        onSuccess(response);
                    }
                } else {
                    // CancelRequest();
                    setLoading(false);
                    dispatch({ type: actionsStore.SET_INITIAL_STATE });
                    logout(hist);
                }
            }
            // const  response = await
        } catch (error) {
            // console.log('Authorized Api Error:', error);

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
 * <function description>
 * customAxios Hook for non-authorized (free) endpoints.
 * @moisesRadix
 * @param {string} url  enpoint url for request.
 * @param {string} method "GET"|POST"|"PUT"|"DELETE"
 * @param {function} options.onSuccess function callback on a successfull response
 * @param {function} options.onError function callback on a failed response
 */
export const useFreeApi = (
    url,
    method = 'get',
    options = { onSuccess: null, onError: null, headers: {} }
) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const { state } = useContext(GlobalContext);

    const executeService = async (body = {}) => {
        try {
            setLoading(true);
            const response = await instanceAxios({
                method: method,
                url: url,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
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

// no Hook Axios Method
/**
 * <function description>
 * @moisesRadix
 * Normal axios endpoint fetch function (async)
 * @param {string} url enpoint url for request
 * @param {object} bodyData body object in case of a non-get method
 * @param {string} method "GET"|POST"|"PUT"|"DELETE"
 * @param {string} contentType [Optional] Content type
 */
export const CustomAxios = async (
    url = '',
    bodyData = {},
    method = 'post',
    contentType = 'application/json'
) => {
    try {
        const isLogin = await verifyTokenLogin();
        if (isLogin) {
            const TOKEN = localStorage.getItem('token');
            return await instanceAxios({
                method: method,
                url: url,
                data: bodyData,
                headers: {
                    'Content-Type': contentType.toString(),
                    Authorization: 'Bearer ' + TOKEN,
                },
            });
        } else {
            return {
                error: {
                    message: 'Token Expired',
                },
            };
        }
    } catch (error) {
        // console.log('CustomAxios Error:', error);
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

/**
 * <function description>
 * @moisesRadix
 * Alternative axios endpoint fetch function
 * @param {string} url endpoint url for request
 * @param {object} bodyData body object in case of a non-get method
 * @param {string} method "GET"|POST"|"PUT"|"DELETE"
 * @param {string} contentType [Optional] Content type
 * @returns {Promise<void>} Promise
 */
export const CustomAxiosPromise = (
    url = '',
    bodyData = {},
    method = 'post',
    authToken = null
) => {
    return new Promise(async (res, rej) => {
        try {
            const isLogin = await verifyTokenLogin();

            if (isLogin || authToken) {
                const TOKEN = authToken ? authToken : localStorage.getItem('token');

                const response = await instanceAxios({
                    method: method,
                    url: url,
                    data: bodyData,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + TOKEN,
                    },
                });
                res(response);
            } else {
                rej({
                    error: {
                        message: 'Token Expired',
                    },
                });
            }
        } catch (error) {
            rej({ message: error });
        }
    });
};
