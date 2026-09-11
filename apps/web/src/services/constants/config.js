export default {
    rest_uri_prod: import.meta.env.VITE_API_URL,
    rest_uri_dev: import.meta.env.VITE_API_URL,
    node_env: import.meta.env.PROD ? "production" : "development",
}