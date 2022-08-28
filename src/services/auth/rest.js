import axios from "axios";
import config from "../constants/config.js"
import {useContext, useState} from "react";
import { useNavigate } from 'react-router-dom';
import GlobalContext from "../../store/context.store.jsx";

const clt = axios.CancelToken;
const source = clt.source();

export const REST_URI =
    config.node_env === 'production'
        ? config.rest_uri_prod
        : config.rest_uri_prod

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

export const useAuthorizedApi = ({
     tokenAlready = false,
     url,
     method = 'get',
     contentType = 'application/json',
     automatic = false,
     onSuccess = null,
     onError = null,
 }) => {
    const { state, dispatch, dispatchSync } = useContext(GlobalContext);
    const hist = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

}