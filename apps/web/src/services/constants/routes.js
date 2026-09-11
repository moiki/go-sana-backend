import HomeView from "../../views/homeView";
import CreateProduct from "../../views/inventory/createProduct";
import MainInventory from "../../views/inventory";
import MainSales from "../../views/sales";

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
        path: 'ventas',
        name: 'Ventas',
        isIndex: false,
        mini: 'H',
        component: MainSales,
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