import {
    Card,
    Tabs,
} from "antd";
import 'moment/min/moment-with-locales'
import moment from "moment";
import 'moment/locale/es';
import 'moment/min/moment-with-locales'
import ProductsPanel from "./ProductsPanel.jsx";
import LaboratoriesPanel from "./LaboratoriesPanel";
moment.locale("es")

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
