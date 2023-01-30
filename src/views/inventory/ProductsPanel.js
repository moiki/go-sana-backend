import {useEffect, useState} from "react";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import {Button, Card, Col, Input, Pagination, Table} from "antd";
import {PlusCircleOutlined, SearchOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import moment from "moment/moment.js";
import {PRICE_TYPE} from "./addPrice";

const columns = [
    {
        title: "Nombre de Producto",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Presentacion",
        dataIndex: "presentation",
        key: "presentation",
    },
    {
        title: "Fecha Ingreso",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => <b>{ moment(text).format("ddd DD MMM YYYY hh:mm a") }</b>
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
        render: (text) => (
            <b style={{ color: "green" }}>
                {`C$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
    {
        title: "Stock",
        key: "quantity",
        dataIndex: "quantity",
        render: (text) => (
            <b className={"success"}>
                {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
];
export default function ProductsPanel() {
    const [tableParams, setTableParams] = useState({
        perPage: 10,
        page: 1,
        filter: ""
    });
    const [tableInventory, setTableInventory] = useState({
        total: 0,
        docs: [],
    });
    const { loading, data, executeService } = useAuthorizedApi({
        url: `/inventory/products-table?per_page=${tableParams.perPage}&page=${tableParams.page}&filter=${tableParams.filter}`,
        onError: (err) => {
            console.log(err);
        },
    });

    const searchProduct = element => {
        // console.log(element)
        setTableParams({...tableParams, filter: element})
    }

    useEffect(() => {
        if (data?.data) {
            const newState = data?.data?.shift();
            const tableState = {
                ...newState,
                docs: newState.docs.map(item => {
                    return {
                        ...item,
                        price: item.prices.find(p => p.type === PRICE_TYPE.UNIT)?.amount || 0
                    }
                })
            }
            setTableInventory(tableState);
        }
    }, [data]);

    useEffect(() => {
        executeService()
    }, [tableParams]);


    return (
        <div className="tabled">
            <div>
                <Col xs="24" xl={24}>
                    <Card
                        bordered={false}
                        className="criclebox tablespace mb-24"
                        title="Tabla de Productos"
                        extra={
                            <div style={{display: "flex", marginRight: "1rem"}}>
                                <Input.Search
                                    className="header-search"
                                    placeholder="Busca por nombre..."
                                    onSearch={searchProduct}
                                    prefix={<SearchOutlined/>}
                                />
                                <Link
                                    to={"/admin/inventario/crear"}
                                >
                                    <Button type={"primary"} style={{borderRadius: 0}}>
                                        <PlusCircleOutlined />
                                        Add Product
                                    </Button>
                                </Link>
                            </div>
                        }
                    >
                        <div className="table-responsive">
                            <Table
                                loading={loading}
                                columns={columns}
                                dataSource={tableInventory.docs}
                                pagination={false}
                                className="ant-border-space"
                            />
                            <div
                                style={{
                                    marginLeft: ".5rem",
                                    marginRight: ".5rem",
                                    display: "flex",
                                    marginTop: "1rem",
                                    justifyContent: "space-between",
                                }}
                            >
                                <h6>Total: {tableInventory.total}</h6>{" "}
                                <Pagination  size="small" total={tableInventory.total} />
                            </div>
                        </div>
                    </Card>
                </Col>
            </div>
        </div>
    );
}