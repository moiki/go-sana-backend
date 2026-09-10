import React, {useState} from "react";
import useGetInventoryTables from "../../customHooks/moduleHooks/inventory/useGetInventoryTables";
import {Button, Card, Col, Input, Pagination, Row, Space, Table, Tooltip} from "antd";
import {EditOutlined, PlusCircleOutlined, ProfileOutlined, SearchOutlined} from "@ant-design/icons";

const columns = [
    {
        title: "Fecha de Venta",
        dataIndex: "created_at",
        key: "created_at",
    },
    {
        title: "Numero de Factura",
        dataIndex: "invoice_number",
        key: "invoice_number",
        render: (text) => <b>{`F-${text}`}</b>
    },
    {
        title: "Monto Total",
        dataIndex: "amount",
        key: "amount",
    },
    {
        title: "Cantidad de Productos",
        dataIndex: "quantity",
        key: "quantity",
    },
    {
        title: 'Opciones',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Tooltip title="Mostrar Factura">
                    <Button type="primary" type={"link"}  shape={"circle"} icon={<ProfileOutlined size={18}/>} />
                </Tooltip>
                <Tooltip title="Editar venta">
                    <Button type="primary" type={"link"}  shape={"circle"} icon={<EditOutlined size={18} />} />
                </Tooltip>
            </Space>
        ),
    },
];

export default function SalesPanel() {

    const [openSale, setOpenSale] = useState(false);
    const {
        loading,
        onChangePage,
        onSearch,
        table,
        reloadTable
    } = useGetInventoryTables("/sales/sales-table")
    const closeSaleModal = () => {
        setOpenSale(false);
        reloadTable();
    };
    return <div>
        <Row gutter={[12,12]}>
            <Col span={24}>
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title="Tabla de Ventas"
                    extra={
                        <div style={{display: "flex", marginRight: "1rem"}}>
                            <Input.Search
                                className="header-search"
                                placeholder="Buscar..."
                                onSearch={onSearch}
                                prefix={<SearchOutlined/>}
                            />
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenSale(true)
                                }}
                                type={"primary"} style={{borderRadius: 0}}>
                                <PlusCircleOutlined />
                                Agregar
                            </Button>
                        </div>
                    }
                >
                    <div className="table-responsive">
                        <Table
                            loading={loading}
                            columns={columns}
                            dataSource={table.docs}
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
                            <h6>Total: {table.total}</h6>{" "}
                            <Pagination onChange={(page)=> onChangePage(page)} size="small" total={table.total} />
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
}