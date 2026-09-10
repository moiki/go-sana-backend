import React from "react";
import { Card, Tabs} from "antd";
import CreateSale from "./createSale";
import SalesPanel from "../homeView/SalesPanel";

const TabsViews = [
    {
        label: `Nueva venta`,
        key: "1",
        children: <CreateSale/>,
    },
    {
        label: "Historial de Ventas",
        key: "2",
        children: <SalesPanel/>
    }
]


export default function MainSales() {
    return  <Card>
        <Tabs
            defaultActiveKey="1"
            centered
            items={TabsViews}
        />
    </Card>
}