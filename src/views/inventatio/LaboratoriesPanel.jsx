import moment from "moment";
import {Button, Card, Col, Input, Pagination, Row, Table} from "antd";
import {PlusCircleOutlined, SearchOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import useGetInventoryTables from "../../customHooks/moduleHooks/inventory/useGetInventoryTables.js";
import CreateProvider from "./createProvider.jsx";
import CreateLab from "./createLab.jsx";

const columnsLab = [
    {
        title: "Laboratorio",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Codigo",
        dataIndex: "auth_code",
        key: "auth_code",
    },
    {
        title: "Fecha Ingreso",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => <b>{ moment(text).format("ddd DD MMM YYYY hh:mm a") }</b>
    },
];

const columnsProv = [
    {
        title: "Proveedor",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Codigo",
        dataIndex: "auth_code",
        key: "auth_code",
    },
    {
        title: "Fecha Ingreso",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => <b>{ moment(text).format("ddd DD MMM YYYY hh:mm a") }</b>
    },
];

export default function LaboratoriesPanel() {

    const [openAddProvider, setOpenAddProvider] = useState(false);
    const [openLaboratory, setOpenLaboratory] = useState(false);

    const {
        table: labTable,
        onChangePage: labOnChange,
        loading: labLoading,
        onSearch: labOnSearch,
        reloadTable: labReload
    } = useGetInventoryTables("/inventory/labs-table")
    const {
        table: provTable,
        onChangePage: provOnChange,
        loading: provLoading,
        onSearch: provOnSearch,
        reloadTable: provReload
    } = useGetInventoryTables("/inventory/providers-table")

    const closeLaboratoriesModal = () => {
        setOpenLaboratory(false);
        labReload();
    };

    const closeProviderModal = () => {
        setOpenAddProvider(false);
        provReload();
    };


    return  <div className="tabled">
        <CreateProvider open={openAddProvider} closeModal={closeProviderModal} />
        <CreateLab open={openLaboratory} closeModal={closeLaboratoriesModal} />
        <Row gutter={[16,16]}>
            <Col md={12} xs={24} xl={12} lg={12}  sm={24}>
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title="Tabla de Laboratorios"
                    extra={
                        <div style={{display: "flex", marginRight: "1rem"}}>
                            <Input.Search
                                className="header-search"
                                placeholder="Buscar..."
                                onSearch={labOnSearch}
                                prefix={<SearchOutlined/>}
                            />
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenLaboratory(true)}}
                                    type={"primary"} style={{borderRadius: 0}}>
                                    <PlusCircleOutlined />
                                    Agregar
                                </Button>
                        </div>
                    }
                >
                    <div className="table-responsive">
                        <Table
                            loading={labLoading}
                            columns={columnsLab}
                            dataSource={labTable.docs}
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
                            <h6>Total: {labTable.total}</h6>{" "}
                            <Pagination onChange={(page)=> labOnChange(page)} size="small" total={labTable.total} />
                        </div>
                    </div>
                </Card>
            </Col>
            <Col  md={12} xs={24} xl={12} lg={12}  sm={24}>
                <Card
                    bordered={false}
                    className="criclebox tablespace mb-24"
                    title="Tabla de Proveedores"
                    extra={
                        <div style={{display: "flex", marginRight: "1rem"}}>
                            <Input.Search
                                className="header-search"
                                placeholder="Buscar..."
                                onSearch={provOnSearch}
                                prefix={<SearchOutlined/>}
                            />
                             <Button
                                 onClick={(e) => {
                                     e.preventDefault();
                                     setOpenAddProvider(true)}}
                                 type={"primary"} style={{borderRadius: 0}}>
                                    <PlusCircleOutlined />
                                    Agregar
                                </Button>
                        </div>
                    }
                >
                    <div className="table-responsive">
                        <Table
                            loading={provLoading}
                            columns={columnsProv}
                            dataSource={provTable.docs}
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
                            <h6>Total: {provTable.total}</h6>{" "}
                            <Pagination onChange={(page)=> provOnChange(page)} size="small" total={provTable.total} />
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>

    </div>
}