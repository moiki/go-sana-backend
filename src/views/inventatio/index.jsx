import {
    Card,
    Tabs,
} from "antd";
import 'moment/min/moment-with-locales'
import moment from "moment";
import 'moment/locale/es';
import 'moment/min/moment-with-locales'
import ProductsPanel from "./ProductsPanel.jsx";
moment.locale("es")

const TabsViews = [
    {
        label: `Productos`,
        key: "1",
        children: <ProductsPanel/>,
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
