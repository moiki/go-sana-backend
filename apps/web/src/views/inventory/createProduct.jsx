import React, {useState} from "react";
import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    List,
    Popconfirm,
    Row,
    Select,
} from "antd";
import {useCreateProductMutation, useCollectionsQuery} from "../../services/query/api";
import openNotificationWithIcon from "../../components/alerts/notifications.js";
import {Link} from "react-router-dom";
import "../../assets/styles/customForm.styles.css";
import CreateProvider from "./createProvider";
import CreatePresentation from "./createPresentation";
import CreateLab from "./createLab";
import {DollarCircleOutlined, PlusOutlined} from "@ant-design/icons";
import AddPrice, {PRICE_TYPE} from "./addPrice";

const validatePrimeNumber = (number) => {
    // const data = Number(number.replace(/C\$\s?|(,*)/g, ''))
    if (number < 1) {
        return {
            validateStatus: "success",
            errorMsg: null,
        };
    }
    return {
        validateStatus: "error",
        errorMsg: "Debe especificar un mínimo",
    };
};
/* eslint-enable no-template-curly-in-string */

export default function CreateProduct() {
    const [form] = Form.useForm();
    const [pricesState, setPricesState] = useState([]);
    // const [laboratories, setLaboratories] = useState([]);
    const [openAddProvider, setOpenAddProvider] = useState(false);
    const [openLaboratory, setOpenLaboratory] = useState(false);
    const [openPresentation, setOpenPresentation] = useState(false);
    const [openAddPrice, setOpenAddPrice] = useState(false);

    const {data: collections, refetch: loadCollection} = useCollectionsQuery();
    const {presentations = [], laboratories = [], providers = []} = collections ?? {};

    // Post Create Product
    const mutation = useCreateProductMutation({
        onSuccess: () => {
            form.resetFields();
            openNotificationWithIcon(
                "success",
                "Listo!",
                "Producto Creado Exitosamente."
            );
            setPricesState([]);
        },
        onError: (err) => {
            form.resetFields();
            openNotificationWithIcon("error", "Proceso Fallido", err.message);
        },
    });
    const onFinish = async (values) => {
        if (pricesState.length === 0) {
            openNotificationWithIcon('error', 'Ups!', 'Necesitas agregar al menos un precio para este producto antes de registrarlo.')
            return;
        }
        await mutation.mutateAsync({
            ...values,
            prices: pricesState
        });
    };

    const onSubmitPrice = (_price) => {
        if (pricesState.some(p => p.type === _price.type)) {
            openNotificationWithIcon('error', 'Ups!', 'Ya existe este tipo de precio.');
            return;
        }
        setPricesState([...pricesState,
            {..._price, index: pricesState.length + 1}]);
    }

    const removePrice = (index) => setPricesState(pricesState.filter(p => p.index !== index))

    const closeLaboratoriesModal = () => {
        setOpenLaboratory(false);
        loadCollection();
    };

    const closeProviderModal = () => {
        setOpenAddProvider(false);
        loadCollection();
    };

    const closePresentationModal = () => {
        setOpenPresentation(false);
        loadCollection();
    };

    return (
        <div className="layout-content">
            <CreatePresentation open={openPresentation} closeModal={closePresentationModal}/>
            <CreateProvider open={openAddProvider} closeModal={closeProviderModal}/>
            <CreateLab open={openLaboratory} closeModal={closeLaboratoriesModal}/>
            <AddPrice open={openAddPrice} closeModal={() => setOpenAddPrice(false)} priceAction={onSubmitPrice}/>
            <Form
                name="basic"
                layout={"horizontal"}
                form={form}
                onFinish={onFinish}
                autoComplete="off"
                labelCol={{
                    span: 4,
                }}
                wrapperCol={{
                    span: 14,
                }}
            >
                <Card
                    title={"Agrega un nuevo producto"}
                    actions={[
                        <Form.Item wrapperCol={{span: 16}} style={{marginBottom: 1}}>
                            <div className={"product-main-action"}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                >
                                    GUARDAR Y CONTINUAR
                                </Button>
                                <Link to={"/admin/inventario"}>
                                    <Button type="primary" danger>
                                        REGRESAR
                                    </Button>
                                </Link>
                            </div>
                        </Form.Item>
                    ]}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title={"Informacion general"} size={"small"}>
                                <Form.Item
                                    label="Producto"
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "El nombre del producto es requerido.",
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item
                                    label="Código"
                                    name="product_code"
                                    rules={[
                                        {required: true, message: "Código es requerido."},
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item label={"Descripcion"} name={"description"}>
                                    <Input/>
                                </Form.Item>
                                <Form.Item
                                    label={"Presentacion"}
                                    name={"product_presentation_id"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Defina una presentacion para el producto.",
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{width: 300}}
                                        placeholder="Seleccione una presentacion"
                                        dropdownRender={(menu) => <>
                                            {menu}
                                            <Button block type="text" icon={<PlusOutlined/>} onClick={(e) => {
                                                e.preventDefault();
                                                setOpenPresentation(true);
                                            }}>Agregue una nueva</Button>
                                        </>}
                                        options={presentations.map((item, index) => ({
                                            value: item?.product_presentation_id,
                                            label: item.name,
                                            key: index,
                                        }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={"Laboratorio"}
                                    name={"laboratory_id"}
                                    // labelCol={{span: 7}}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Defina un laboratorio.",
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{width: 300}}
                                        placeholder="Seleccione un laboratorio"
                                        dropdownRender={(menu) => <>
                                            {menu}
                                            <Button
                                                block
                                                type="text" icon={<PlusOutlined/>}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpenLaboratory(true)
                                                }}
                                            >Agregue una nueva</Button>
                                        </>}
                                        options={laboratories.map((item, index) => ({
                                            value: item?.laboratory_id,
                                            label: item.name,
                                            key: index,
                                        }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={"Proveedor"}
                                    name={"provider_id"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Defina una proveedor.",
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{width: 300}}
                                        placeholder="Seleccione un proveedor"
                                        dropdownRender={(menu) => <>
                                            {menu}
                                            <Button
                                                block
                                                type="text" icon={<PlusOutlined/>}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpenAddProvider(true);
                                                }}
                                            >
                                                Agregue una nueva
                                            </Button>
                                        </>}
                                        options={providers.map((item, index) => ({
                                            value: item?.provider_id,
                                            label: item.name,
                                            key: index,
                                        }))}
                                    />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card
                                size={"small"}
                                title={"Precios"}
                                extra={
                                    <Button
                                        type="text" icon={<PlusOutlined/>}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpenAddPrice(true);
                                        }}
                                    >Agregar Precio</Button>
                                }
                            >
                                {
                                    pricesState.length > 0 ?
                                        <List
                                            className="demo-loadmore-list"
                                            itemLayout="horizontal"
                                            dataSource={pricesState}
                                            renderItem={(item) => (
                                                <List.Item
                                                    actions={[
                                                        <Popconfirm
                                                            description={"Eliminar Precio"}
                                                            title={"¿Está seguro de elminar este precio?"}
                                                            okText="Sí"
                                                            cancelText="No"
                                                            onConfirm={() => removePrice(item.index)}>
                                                            <Button type={"primary"} color={"red"} shape={"round"}>eliminar</Button>
                                                        </Popconfirm>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<DollarCircleOutlined/>}
                                                        title={
                                                            <b>{`C$ ${item?.amount || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>}
                                                        description={item?.description}
                                                    />
                                                    <div>{item?.type}</div>
                                                </List.Item>
                                            )}
                                        />
                                        : <Empty description={"Aun no hay precios"}/>
                                }
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Form>

        </div>
    );
}
