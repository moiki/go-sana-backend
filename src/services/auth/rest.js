import axios from "axios";
import config from "../constants/config.js"
import {useContext, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import GlobalContext, {useAuth} from "../../store/context.store.jsx";
import {logout} from "./login.js";
import actionsStore from "../../store/actions.store.jsx";

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
            config.rest_uri + '/user/refreshToken',
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
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

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
                        ...importHeaders(),
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
                            'client-ip': localStorage.getItem('client-ip') || '',
                            'client-browser': localStorage.getItem('client-browser') || '',
                            'client-country': '',
                            'client-os': localStorage.getItem('client-os') || '',
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
            executeService().then();
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