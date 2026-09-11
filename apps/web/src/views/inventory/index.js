import React from 'react'
import {
    Card,
    Tabs,
} from "antd";
import ProductsPanel from "./ProductsPanel.js";
import LaboratoriesPanel from "./LaboratoriesPanel";

const TabsViews = [
    {
        label: `Catálogo de Productos`,
        key: "1",
        children: <ProductsPanel/>,
    },
    {
        label: "Inventario",
        key: "2",
        children: <><h1>Inventario</h1></>
    },
    {
        label: 'Fuentes y Proveedores',
        key: '3',
        children: <LaboratoriesPanel/>
    }
]

export default function MainInventory() {
    return  <Card>
        <Tabs
            defaultActiveKey="1"
            centered
            items={TabsViews}
        />
    </Card>
}
