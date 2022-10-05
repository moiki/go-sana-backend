import Login from "../../components/forms/login/login.js";
import HomeView from "../../views/homeView";
import CreateProduct from "../../views/inventory/createProduct.js";
import MainInventory from "../../views/inventory";

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
        isIndex: true,
        mini: 'H',
        component: HomeView,
        layout: 'admin',
    },
    {
        path: 'inventario',
        name: 'Inventario',
        isIndex: false,
        mini: 'H',
        component: MainInventory,
        layout: 'admin',
    },
    {
        path: 'inventario/crear',
        name: 'Crear Producto',
        isIndex: false,
        mini: 'H',
        component: CreateProduct,
        layout: 'admin',
    },
]