import ModalForm from "../../components/forms/modalForm";
import {Button, Col, Form, Input, InputNumber, List, Popconfirm, Row, Skeleton, Space, Table, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined, ProfileOutlined, SearchOutlined, StopOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import ModalContainer from "../../components/containers/modalContainer";
import EditableCell, {EditableRow} from "../../components/Editables/EditableCell";

const data = [
    {
        key: 1,
        product: "Cerafon",
        cantidad: 10,
        subTotal: 100
    },
    {
        key: 2,
        product: "Cerafon",
        cantidad: 10,
        subTotal: 100
    },
    {
        key: 3,
        product: "Cerafon",
        cantidad: 10,
        subTotal: 100
    }, {
    key: 4,
    product: "Cerafon",
        cantidad: 10,
        subTotal: 100
    },

];

export default function CreateSale({open, closeModal, cb}) {

    const [saleDetails, setSaleDetails] = useState([...data]);
    const [count, setCount] = useState(5);


    const handleAdd = () => {
        const newData = {
            key: count,
            name: `Edward King ${count}`,
            age: '32',
            address: `London, Park Lane no. ${count}`,
        };
        setSaleDetails([...saleDetails, newData]);
        setCount(count + 1);
    };

    const handleSave = (row) => {
        const newData = [...saleDetails];
        const index = newData.findIndex((item) => row.key === item.key);
        console.log(newData, row)
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setSaleDetails(newData);
    };
    const columns = [
        {
            title: "Nombre de Producto",
            dataIndex: "product",
            key: "product",
        },
        {
            editable: true,
            title: "Cantidad",
            dataIndex: "cantidad",
            key: "cantidad",
            onCell: (record) => ({
                record,
                editable: true,
                title: "Cantidad",
                dataIndex: "cantidad",
                handleSave: handleSave,
            }),
            // render: (text) => (
            //     <b>
            //         {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            //     </b>
            // ),
        },
        {
            title: "Sub Total",
            key: "subTotal",
            dataIndex: "subTotal",
            render: (text) => (
                <b style={{color: "green"}}>
                    {`C$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </b>
            ),
        },
        {
            title: 'Opciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Quitar producto">
                        <Button danger={true} type={"link"} shape={"circle"}
                                icon={<DeleteOutlined size={18} color={"red"}/>}/>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return <ModalContainer full={true} open={open} closeModal={closeModal} title={"NUEVA VENTA"}
                      callback={cb}>
        <Row gutter={[24, 0]}>
            <Col xs={24} xxl={16} xl={16} sm={24} md={16} lg={16}>
                <Space>
                    <Form.Item
                    label={"Nombre de Cliente"}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                            row: EditableRow
                        }
                    }}
                    title={() => "PRODUCTOS A FACTURAR"}
                    footer={() => <b>Total a pagar: C$100</b>}
                    bordered={true}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    scroll={{
                        y: 440,
                    }}

                />
            </Col>
            <Col xs={24} xxl={8} xl={8} sm={24} md={8} lg={8}>
                <div style={{marginBottom: "1.2rem"}}>
                    <Input.Search
                        size={50}
                        className="header-search"
                        placeholder="Escanea el producto..."
                        onSearch={(text) => console.log(text)}
                        prefix={<SearchOutlined/>}
                    />
                </div>
                <div style={{marginBottom: "1.2rem"}}>
                    <Input.Search
                        className="header-search"
                        placeholder="Busca por codigo de producto..."
                        onSearch={(text) => console.log(text)}
                        prefix={<SearchOutlined/>}
                    />
                </div>
                <Row gutter={[8, 8]} align={"middle"}>
                    <Col md={16} xl={16} lg={16} sm={24} xxl={16} xs={24}>
                        <Space
                            style={{
                                display: 'flex',
                                marginBottom: 8,
                            }}
                            align="baseline">
                            <Form.Item
                                name="auth_code"
                                style={{marginRight: "2rem"}}
                                label="Producto"
                                s
                            >
                                <Input/>
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
                        </Space>
                    </Col>
                    <Col md={8} xl={8} lg={8} sm={24} xxl={8} xs={24}>
                        <Button type={"primary"} color={"green"}>Agregar a Factura</Button>
                    </Col>
                </Row>

                <Form.Item name="direction" label="Agrega un comentario">
                    <Input.TextArea type="textarea"/>
                </Form.Item>

            </Col>
        </Row>

    </ModalContainer>
}