import {useMemo, useState} from "react";
import {useTableQuery} from "../../services/query/api";
import {Button, Card, Col, Input, Pagination, Table} from "antd";
import {PlusCircleOutlined, SearchOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import dayjs from "dayjs";
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
        render: (text) => <b>{ dayjs(text).format("ddd DD MMM YYYY hh:mm a") }</b>
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
];

const paramsInitialState = {perPage: 10, page: 1, filter: ""};

export default function ProductsPanel() {
    const [tableParams, setTableParams] = useState(paramsInitialState);
    const {data, isLoading: loading} = useTableQuery('/inventory/products-table', tableParams);

    const tableInventory = useMemo(() => {
        if (!data) return {total: 0, docs: []};
        return {
            total: data.total,
            docs: data.docs.map(item => ({
                ...item,
                price: item.prices.find(p => p.type === PRICE_TYPE.UNIT)?.amount || 0,
            })),
        };
    }, [data]);

    const searchProduct = (element) => setTableParams(p => ({...p, filter: element}));

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
                                <Link to={"/admin/inventario/crear"}>
                                    <Button type={"primary"} style={{borderRadius: 0}}>
                                        <PlusCircleOutlined />
                                        Agregar Producto
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
                                <h6>Total: {tableInventory.total}</h6>
                                <Pagination
                                    current={tableParams.page}
                                    pageSize={tableParams.perPage}
                                    onChange={(page) => setTableParams(p => ({...p, page}))}
                                    size="small"
                                    total={tableInventory.total}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </div>
        </div>
    );
}