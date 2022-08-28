import Login from "../../components/forms/login/login.jsx";
import HomeView from "../../views/homeView/index.jsx";

export const authRoutes = [
    {
        path: 'login',
        name: 'Login',
        mini: 'L',
        component: Login,
        layout: '/auth',
    },
    {
        path: '/forgot-password',
        name: 'forgotPassword',
        mini: 'f',
        component: null,
        layout: '/auth',
    },
]

export const appRoutes = [
    {
        path: '/',
        name: 'home',
        mini: 'H',
        component: HomeView,
        layout: '/auth',
    },
]