import {
    Button, Checkbox,
    Col,
    Form,
    Input, InputNumber,
    Modal,
    Popconfirm,
    Row, Select,
    Space,
    Table,
    Tooltip
} from "antd";
import {DeleteOutlined, PercentageOutlined, SearchOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
// import ModalContainer from "../../components/containers/modalContainer";
import EditableCell, {EditableRow} from "../../components/Editables/EditableCell";
import utilsServices, {DISCOUNT_TYPE, PARSE_TEXT} from "../../services/utils.services";
import "../../assets/styles/customTables.styles.css"
import saleServices from "../../services/sales/sales.services";
import openNotificationWithIcon from "../../components/alerts/notifications";
import {SearchInput} from "./MiniSearchProduct";
import Card from "antd/lib/card/Card";
import {debounce} from "lodash";
import ConfirmSale from "./confirmSale";
import {PRICE_TYPE} from "../inventory/addPrice";

const {useSaleCreation, getProductByCode} = saleServices;

export default function CreateSale() {
    const [hasDiscount, setHasDiscount] = useState(false);
    const [formAddProduct] = Form.useForm();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [productForAdd, setProductForAdd] = useState();
    const {
        handleAddItem,
        saleDetails,
        handleDeleteItem,
        handleSaveItem,
        totalPayment,
        saleBody,
        resetBody,
        changeBodyValue,
        changeBodyValueByObject,
        discount,
        setDiscount
    } = useSaleCreation();

    const handlePriceTypeOnList = (priceTypeId, key) => {
        const product = saleDetails.find(item => item.key === key) || [];
        if (!product) return;
        const price = product.prices.find(item => item.id_price === priceTypeId);
        const newItem = {
            ...product,
            price: price?.amount || 0,
            type: price
        }
        handleSaveItem(newItem)
    }

    const columns = [
        {
            title: "Producto",
            dataIndex: "product",
            key: "product",
        },
        {
            title: "Tipo de Precio",
            dataIndex: "type",
            key: "prices",
            render: (text, data) => {
                return ( <Space wrap>
                    <Select
                        style={{ width: 120 }}
                        onChange={(value) => handlePriceTypeOnList(value, data.key)}
                        value={text.id_price}
                    >
                        {data.prices.map(item => (<Select.Option value={item.id_price}>{item.description}</Select.Option>))}
                    </Select>
                </Space>)
            },
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

    const handleSearch = debounce((newValue, setData) => {
        if (newValue) {
            getProductByCode(newValue)
                .then(data => {
                    const productList = data.products ?? []
                    setData(productList.map(item => ({...item, value: item.product_code, label: item.name})))
                })
                .catch(err => openNotificationWithIcon("error", "Ups!", err))
        } else {
            setData([]);
        }
    }, 300);

    const onAddProduct = (product) => {
        if (!utilsServices.hasProperties(product)) {
            openNotificationWithIcon("error", "Item no valido", "Verifique el producto")
        } else {
            const defaultPrice = product.prices.find(item => item.type === PRICE_TYPE.UNIT)
            const newItem = {
                key: product?.product_code,
                product: product.name,
                cantidad: 1,
                subTotal:defaultPrice?.amount || 0,
                price: defaultPrice?.amount || 0,
                prices: product?.prices || [],
                type: defaultPrice
            }
            handleAddItem(newItem)
            setProductForAdd(null)
        }
        formAddProduct.resetFields();
    }

    return <Card title={"NUEVA VENTA"} extra={<Button type={"primary"} onClick={() => {
        setOpenConfirm(true);
    }}>Generar Venta</Button>}>
        <ConfirmSale open={openConfirm} Change={saleBody.Change} Amount={saleBody.Amount}
                     onChangePaid={changeBodyValueByObject} PaidWith={saleBody.PaidWith}
                     closeModal={()=> setOpenConfirm(false)}
        />
        <Row gutter={[24, 0]}>
            <Col span={24}>
                <Row>
                    <Col span={24}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Form.Item
                                label={"Nombre de Cliente"}
                            >
                                <Input value={saleBody.ClientName}
                                       onChange={(data => changeBodyValue(data.target.value, "ClientName"))}/>
                            </Form.Item>
                            <div style={{marginBottom: "1.2rem"}}>
                                <Space>
                                    <SearchInput
                                        placeholder={"Buscar por nombre o codigo"}
                                        setValue={(newProd) => {
                                            setProductForAdd({...newProd, cantidad: 1})
                                        }
                                        }
                                        value={productForAdd}
                                        onSearch={handleSearch}
                                        acceptText={"Agregar a Factura"}
                                        onAccept={onAddProduct}
                                    />
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} aria-disabled={hasDiscount}>
                        <Input.Group>
                            <Checkbox value={hasDiscount} onChange={() => setHasDiscount(!hasDiscount)}>Agregar
                                Descuento</Checkbox>
                            <InputNumber
                                value={saleBody.Discount}
                                onChange={(data => changeBodyValue(data.target.value, "Discount"))}
                                min={0}
                                disabled={!hasDiscount}
                            />
                            <PercentageOutlined style={{marginLeft: 10}}/>
                        </Input.Group>
                    </Col>
                </Row>

                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                            row: EditableRow
                        }
                    }}
                    rowClassName={() => 'editable-row'}
                    footer={() => <b>Total a pagar: {utilsServices.ParseNumber(saleBody.Amount, PARSE_TEXT.MONEY)}</b>}
                    columns={columns}
                    dataSource={saleDetails}
                    pagination={false}
                    scroll={{
                        y: 300,
                    }}
                />
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Form.Item
                    label={"Notas acerca de la venta"}
                >
                    <Input.TextArea allowClear={true} size={"middle"} value={saleBody.Commentary}
                                    onChange={(data => changeBodyValue(data.target.value, "Commentary"))}/>
                </Form.Item>
            </Col>
        </Row>

    </Card>
}