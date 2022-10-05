// import 'dotenv/config'

export default {
    rest_uri_prod: process.env.REACT_APP_REST_DEV_URL || import.meta.env.VITE_REACT_APP_REST_PROD_URL,
    rest_uri_dev: process.env.REACT_APP_REST_DEV_URL || import.meta.env.VITE_REACT_APP_REST_PROD_URL,
    node_env: process.env.NODE_ENV || import.meta.env.VITE_NODE_ENV
}