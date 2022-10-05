import {
    Card,
    Tabs,
} from "antd";
import ProductsPanel from "./ProductsPanel.jsx";
import LaboratoriesPanel from "./LaboratoriesPanel";

const TabsViews = [
    {
        label: `Productos`,
        key: "1",
        children: <ProductsPanel/>,
    },
    {
        label: "Incomming",
        key: "2",
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
