import {
    Button, Checkbox,
    Col,
    Form,
    Input, InputNumber,
    Modal,
    Popconfirm,
    Row,
    Space,
    Table,
    Tooltip
} from "antd";
import {DeleteOutlined, SearchOutlined} from "@ant-design/icons";
import React, {useState} from "react";
// import ModalContainer from "../../components/containers/modalContainer";
import EditableCell, {EditableRow} from "../../components/Editables/EditableCell";
import utilsServices, {DISCOUNT_TYPE, PARSE_TEXT} from "../../services/utils.services";
import "../../assets/styles/customTables.styles.css"
import saleServices from "../../services/sales/sales.services";
import openNotificationWithIcon from "../../components/alerts/notifications";
import {SearchInput} from "./MiniSearchProduct";
import Card from "antd/lib/card/Card";
import {debounce} from "lodash";

const {useSaleCreation, getProductByCode} = saleServices;

const _config = {
    title: (<><b>Confirmación de venta</b></>),
    content: (
        <>
            <p style={{fontSize: 18}}>¿Seguro que desea guardar esta venta?</p>
        </>
    ),
    okText: 'Sí',
    cancelText: 'No',
    onOk: () => {
       console.log("nextProps.file");
    },
};

export default function CreateSale() {
    const [hasDiscount, setHasDiscount] = useState(false);
    const [formAddProduct] = Form.useForm();
    const [productForAdd, setProductForAdd] = useState();
    const {
        handleAddItem,
        saleDetails,
        handleDeleteItem,
        handleSaveItem,
        totalPayment,
        resetBody,
        discount,
        setDiscount
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
            const newItem = {
                key: product?.product_code,
                product: product.name,
                cantidad: 1,
                subTotal: product.price,
                price: product.price
            }
            handleAddItem(newItem)
            setProductForAdd(null)
        }
        formAddProduct.resetFields();
    }

    return <Card title={"NUEVA VENTA"} extra={<Button type={"primary"} onClick={()=> {
        Modal.confirm(_config)
    }}>Generar Venta</Button>}>
        <Row gutter={[24, 0]}>
            <Col span={24}>
               <Row>
                   <Col span={24}>
                       <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                           <Form.Item
                               label={"Nombre de Cliente"}
                           >
                               <Input/>
                           </Form.Item>
                           <div style={{marginBottom: "1.2rem"}}>
                               <Space>
                                   <SearchInput
                                       placeholder={"Buscar por nombre o codigo"}
                                       setValue={(newProd) => {
                                           console.log(newProd)
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
                            <Checkbox value={hasDiscount} onChange={()=> setHasDiscount(!hasDiscount)}>Agregar Descuento</Checkbox>
                            <InputNumber value={discount} min={0} disabled={!hasDiscount} onChange={(e)=>setDiscount(e)}/>
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
                    footer={() => <b>Total a pagar: {utilsServices.ParseNumber(totalPayment, PARSE_TEXT.MONEY)}</b>}
                    columns={columns}
                    dataSource={saleDetails}
                    pagination={false}
                    scroll={{
                        y: 300,
                    }}

                />
            </Col>
        </Row>

    </Card>
}