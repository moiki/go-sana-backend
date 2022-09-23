import {
    Row,
    Col,
    Card,
    Radio,
    Table,
    Upload,
    message,
    Progress,
    Button,
    Avatar,
    Typography,
} from "antd";

import {PlusCircleOutlined, ToTopOutlined} from "@ant-design/icons";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const columns = [
    {
        title: "Nombre de Producto",
        dataIndex: "name",
        key: "name",
        width: "32%",
    },
    {
        title: "Fecha Ingreso",
        dataIndex: "created_at",
        key: "created_at",
    },
    {
        title: "Código De Producto",
        dataIndex: "product_code",
        key: "product_code",
    },
    {
        title: "Precio",
        key: "price",
        dataIndex: "price",
        render: (text) => <b style={{color:"green"}}>{`C$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</b>,
    },
    {
        title: "Stock",
        key: "quantity",
        dataIndex: "quantity",
        render: (text) => <b className={"success"}>{`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</b>,
    },
];

export default function InventarioView() {
    const [tableInventory, setTableInventory] = useState({
        total: 0,
        docs: []
    });
    const {data, error} = useAuthorizedApi({
        url: "/inventory/list",
        automatic: true,
        onError: (err) => {
            console.log(err)
        }
    });

    useEffect(() => {
       if (data?.data) {
           const newState = data?.data?.shift();
           setTableInventory({...newState})
       }
    }, [data]);


    return (
        <>
            <div className="tabled">
                <Row gutter={[24, 0]}>
                    <Col xs="24" xl={24}>
                        <Card
                            bordered={false}
                            className="criclebox tablespace mb-24"
                            title="Tabla de Productos"
                            extra={
                                <>
                                   <Link to={"/admin/inventario/crear"} className={"ant-btn ant-btn-primary"} ><PlusCircleOutlined />Add Product</Link>
                                </>
                            }
                        >
                            <div className="table-responsive">
                                <Table
                                    columns={columns}
                                    dataSource={tableInventory.docs}
                                    pagination={false}
                                    className="ant-border-space"
                                />
                                <div><h6>Total: { tableInventory.total }</h6></div>
                            </div>
                        </Card>

                    </Col>
                </Row>
            </div>
        </>
    );
}