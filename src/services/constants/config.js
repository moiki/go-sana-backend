import dotenv from "dotenv"
dotenv.config()

export default {
    rest_uri_prod: import.meta.env.VITE_REACT_APP_REST_PROD_URL,
    rest_uri_dev: import.meta.env.VITE_REACT_APP_REST_PROD_URL,
    node_env: import.meta.env.VITE_NODE_ENV
}