import ModalForm from "../../components/forms/modalForm";
import {
    Badge,
    Button, Card,
    Col,
    Form,
    Input,
    InputNumber,
    List,
    Popconfirm, Radio,
    Row,
    Skeleton,
    Space,
    Table,
    Tooltip
} from "antd";
import {DeleteOutlined, EditOutlined, ProfileOutlined, SearchOutlined, StopOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import ModalContainer from "../../components/containers/modalContainer";
import EditableCell, {EditableRow} from "../../components/Editables/EditableCell";
import utilsServices, {DISCOUNT_TYPE, PARSE_TEXT} from "../../services/utils.services";
import "../../assets/styles/customTables.styles.css"
import saleServices from "../../services/sales/sales.services";
import openNotificationWithIcon from "../../components/alerts/notifications";

const {useSaleCreation, getProductByCode} = saleServices

export default function CreateSale({open, closeModal}) {
    const [formAddProduct] = Form.useForm();
    const [productForAdd, setProductForAdd] = useState({});
    const {
        handleAddItem,
        saleDetails,
        handleDeleteItem,
        handleSaveItem,
        totalPayment,
        resetBody
    } = useSaleCreation()

    const columns = [
        {
            title: "Producto",
            dataIndex: "product",
            key: "product",
        },
        {
            title: "Precio Unitario",
            dataIndex: "price",
            key: "price",
            render: (text) => (
                <b style={{color: "green"}}>
                    {utilsServices.ParseNumber(text, PARSE_TEXT.MONEY)}
                </b>
            ),
        },
        {
            editable: true,
            title: <div className={"sn-editable-header"}><b>Candidad</b><small><b>Click para Editar</b></small></div>,
            dataIndex: "cantidad",
            key: "cantidad",
            onCell: (record) => ({
                record,
                editable: true,
                title: "Cantidad",
                dataIndex: "cantidad",
                inputType: "number",
                handleSave: handleSaveItem,
            }),
            render: (text) => (
                <Space>
                    <b>
                        {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </b>
                </Space>
            ),
        },
        {
            title: "Sub Total",
            key: "subTotal",
            dataIndex: "subTotal",
            render: (text) => (
                <b style={{color: "green"}}>
                    {utilsServices.ParseNumber(text, PARSE_TEXT.MONEY)}
                </b>
            ),
        },
        {
            title: 'Opciones',
            key: 'action',
            render: (_, record) =>
                saleDetails.length >= 1 ? (
                    <Space size="middle">
                        <Popconfirm title="¿Desea quitar este producto de la lista?" cancelText={"No"} okText={"Sí"}
                                    onConfirm={() => handleDeleteItem(record.key)}>
                            <Tooltip title="Quitar producto">
                                <Button danger={true} type={"link"} shape={"circle"}
                                        icon={<DeleteOutlined size={18} color={"red"}/>}/>
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                ) : null,
        },
    ]

    const updateQuantityBox = (element) => setProductForAdd({...productForAdd, cantidad: element})

    const onProductSearch = (code) => {
        getProductByCode(code).then(data => {
            const newProd = data?.product;
                setProductForAdd({...newProd, cantidad: 1})
            formAddProduct.setFieldsValue({
                name: newProd.name,
                cantidad: 1,
                discount_type: DISCOUNT_TYPE.AMOUNT_DISCOUNT,
                discount: 0

            })
            })
            .catch(data => console.log("Product could not be found."))
    }

    const onAddProduct = () => {
        const dataFromForm = formAddProduct.getFieldsValue()
        if (!utilsServices.hasProperties(productForAdd)) {
            openNotificationWithIcon("error", "Item no valido", "Verifique el producto")
        } else {
            const newItem = {
                key: productForAdd?.product_code,
                product: productForAdd.name,
                cantidad: dataFromForm?.cantidad || 1,
                subTotal: productForAdd.price * (dataFromForm?.cantidad || 1),
                price: productForAdd.price
            }
            handleAddItem(newItem)
            setProductForAdd({})
        }
        formAddProduct.resetFields();
    }

    return <ModalContainer full={true} open={open} closeModal={closeModal} title={"NUEVA VENTA"} callback={resetBody}>
        <Row gutter={[24, 0]}>
            <Col xs={24} xxl={18} xl={18} sm={24} md={18} lg={18}>
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
                    rowClassName={() => 'editable-row'}
                    title={() => "PRODUCTOS A FACTURAR"}
                    footer={() => <b>Total a pagar: {utilsServices.ParseNumber(totalPayment, PARSE_TEXT.MONEY)}</b>}
                    columns={columns}
                    dataSource={saleDetails}
                    pagination={false}
                    scroll={{
                        y: 300,
                    }}

                />
            </Col>
            <Col xs={24} xxl={6} xl={6} sm={6} md={6} lg={6}>
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
                        onSearch={onProductSearch}
                        prefix={<SearchOutlined/>}
                    />
                </div>
                <Form
                    form={formAddProduct}
                    name="addProduct"
                    wrapperCol={{ span: 16 }}
                    form={formAddProduct}
                    autoComplete="off"
                >
                    <Row gutter={[8, 8]} align={"middle"}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                style={{marginRight: "2rem"}}
                                label="Producto"
                            >
                                <Input disabled/>
                            </Form.Item>
                            <Form.Item label="Cantidad" name="cantidad" required>
                                <InputNumber
                                    defaultValue={0}
                                    min={0}
                                    onChange={updateQuantityBox}
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                    parser={(value) => value.replace(/(,*)/g, "")}
                                />
                            </Form.Item>
                            <Form.Item label="Descuento" name="discount" required>
                                <InputNumber
                                    defaultValue={0}
                                    min={0}
                                    // value={cantidad.value}
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                    parser={(value) => value.replace(/(,*)/g, "")}
                                />
                            </Form.Item>
                            <Form.Item
                            label={"Tipo de Descuento"}
                            name={"discount_type"}
                            >
                                <Radio.Group buttonStyle={"solid"}>
                                    <Radio.Button
                                        value={DISCOUNT_TYPE.AMOUNT_DISCOUNT}>{DISCOUNT_TYPE.AMOUNT_DISCOUNT}</Radio.Button>
                                    <Radio.Button
                                        value={DISCOUNT_TYPE.PERCENT_DISCOUNT}>{DISCOUNT_TYPE.PERCENT_DISCOUNT}</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Button block type={"primary"} color={"green"} onClick={onAddProduct}>Agregar a Factura</Button>
                        </Col>
                    </Row>
                </Form>

                {/*<Form.Item name="direction" label="Agrega un comentario">*/}
                {/*    <Input.TextArea type="textarea"/>*/}
                {/*</Form.Item>*/}

            </Col>
        </Row>

    </ModalContainer>
}