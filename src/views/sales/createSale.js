import ModalForm from "../../components/forms/modalForm";
import {Button, Col, Form, Input, InputNumber, List, Row, Skeleton, Space, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined, ProfileOutlined, SearchOutlined} from "@ant-design/icons";
import React from "react";

const data = [
    {
        product: "Cerafon",
        cantidad: 10,
        subTotal: 100
    }
];

const columns = [
    {
        title: "Nombre de Producto",
        dataIndex: "product",
        key: "product",
    },
    {
        title: "Cantidad",
        key: "cantidad",
        dataIndex: "cantidad",
        render: (text) => (
            <b>
                {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
    {
        title: "Sub Total",
        key: "subTotal",
        dataIndex: "subTotal",
        render: (text) => (
            <b style={{ color: "green" }}>
                {`C$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
    {
        title: 'Opciones',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Tooltip title="Editar cantidad">
                    <Button type="primary" type={"link"}  shape={"circle"} icon={<EditOutlined size={18} />} />
                </Tooltip>
                <Tooltip title="Quitar producto">
                    <Button danger={true} type={"link"}  shape={"circle"} icon={<DeleteOutlined size={18} color={"red"}/>} />
                </Tooltip>
            </Space>
        ),
    },
]

export default function CreateSale({open, closeModal, cb}) {

    return <ModalForm full={true} open={open} closeModal={closeModal} url={"/sales/create"} title={"NUEVA VENTA"} callback={cb}>
        <Row gutter={[24,0]}>
            <Col xs={24} xxl={12} xl={12} sm={24} md={12} lg={12}>
                <Table
                    title={()=>"PRODUCTOS A FACTURAR"}
                    footer={()=><b>Total a pagar: C$100</b>}
                    bordered={true}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    scroll={{
                        y: 240,
                    }}
                />
            </Col>
            <Col xs={24} xxl={12} xl={12} sm={24} md={12} lg={12}>
               <div style={{marginBottom: "1.2rem"}}>
                   <Input.Search
                       className="header-search"
                       placeholder="Busca por codigo de producto..."
                       onSearch={(text)=>console.log(text)}
                       prefix={<SearchOutlined/>}
                   />
               </div>
                <div style={{display: "flex", justifyContent: "start"}}>
                    <Form.Item
                        name="auth_code"
                        style={{ marginRight: "2rem" }}
                        label="Producto"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Cantidad" name="quantity" required>
                        <InputNumber
                            defaultValue={1}
                            min={1}
                            // value={cantidad.value}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/(,*)/g, "")}
                        />
                    </Form.Item>
                </div>

                <Form.Item name="direction" label="Agrega un comentario" >
                    <Input.TextArea type="textarea" />
                </Form.Item>
                <Button type={"primary"} color={"green"}>Agregar a Factura</Button>
            </Col>
        </Row>

    </ModalForm>
}