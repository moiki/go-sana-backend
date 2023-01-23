import React, {useState} from "react";
import {Button, Card, Col, Divider, Empty, Form, Input, InputNumber, List, Row, Select, Skeleton} from "antd";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import openNotificationWithIcon from "../../components/alerts/notifications.js";
import {Link} from "react-router-dom";
import "../../assets/styles/customForm.styles.css";
import CreateProvider from "./createProvider";
import CreatePresentation from "./createPresentation";
import CreateLab from "./createLab";
import {DollarCircleOutlined, PlusOutlined} from "@ant-design/icons";
import AddPrice from "./addPrice";

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
    const [providersState, setProvidersState] = useState([]);
    const [presentation, setPresentation] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [openAddProvider, setOpenAddProvider] = useState(false);
    const [openLaboratory, setOpenLaboratory] = useState(false);
    const [openPresentation, setOpenPresentation] = useState(false);
    const [openAddPrice, setOpenAddPrice] = useState(false);

    // Get Providers
    const {executeService: GetProviders} = useAuthorizedApi({
        url: "/inventory/providers",
        method: "GET",
        automatic: true,
        onSuccess: (response) => {
            // console.log(response.data)

            setProvidersState(response.data.data);
        },
        onError: (err) => {
            openNotificationWithIcon(
                "error",
                "No se pudo cargar proveedores.",
                err.message
            );
        },
    });
    // Get Presentation
    const {executeService: GetPresentation} = useAuthorizedApi({
        url: "/inventory/presentations",
        method: "GET",
        automatic: true,
        onSuccess: (response) => {
            setPresentation(response.data.data);
        },
        onError: (err) => {
            openNotificationWithIcon(
                "error",
                "No se pudo cargar proveedores.",
                err.message
            );
        },
    });
    // Get Laboratories
    const {executeService: GetLaboratories} = useAuthorizedApi({
        url: "/inventory/labs",
        method: "GET",
        automatic: true,
        onSuccess: (response) => {
            setLaboratories(response.data.data);
        },
        onError: (err) => {
            openNotificationWithIcon(
                "error",
                "No se pudo cargar proveedores.",
                err.message
            );
        },
    });
    // Post Create Product
    const {loading, error, executeService} = useAuthorizedApi({
        url: "/inventory/create",
        method: "POST",
        onSuccess: () => {
            form.resetFields();
            openNotificationWithIcon(
                "success",
                "Listo!",
                "Producto Creado Exitosamente."
            );
        },
        onError: (err) => {
            form.resetFields();
            openNotificationWithIcon("error", "Proceso Fallido", err.message);
        },
    });
    const onFinish = async (values) => {
        await executeService(values);
    };

    const closeLaboratoriesModal = () => {
        setOpenLaboratory(false);
        GetLaboratories();
    };

    const closeProviderModal = () => {
        setOpenAddProvider(false);
        GetProviders();
    };

    const closePresentationModal = () => {
        setOpenPresentation(false);
        GetPresentation();
    };

    return (
        <div className="layout-content">
            <CreatePresentation open={openPresentation} closeModal={closePresentationModal}/>
            <CreateProvider open={openAddProvider} closeModal={closeProviderModal}/>
            <CreateLab open={openLaboratory} closeModal={closeLaboratoriesModal}/>
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
                            <Card size={"small"} title={"Informacion general"}>
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
                                                type="text" icon={<PlusOutlined />}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpenLaboratory(true)
                                                }}
                                            >Agregue una nueva</Button>
                                        </>}
                                    >
                                        {laboratories.map((item, index) => {
                                            return (
                                                <Select.Option
                                                    value={item?.laboratory_id}
                                                    key={index}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
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
                                                type="text" icon={<PlusOutlined />}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpenAddProvider(true);
                                                }}
                                            >
                                                Agregue una nueva
                                            </Button>
                                        </>}
                                    >
                                        {providersState.map((item, index) => {
                                            return (
                                                <Select.Option
                                                    value={item?.provider_id}
                                                    key={index}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={12}>

                            <Card
                                size={"small"}
                                title={"Precio y presentacion"}
                            >
                                <Form.Item  label="Precio Unitario" name="price" required>
                                    <InputNumber
                                        defaultValue={1}
                                        min={1}
                                        formatter={(value) =>
                                            `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                                    />
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
                                            <Button block type="text" icon={<PlusOutlined />} onClick={(e) => {
                                                e.preventDefault();
                                                setOpenPresentation(true);
                                            }}>Agregue una nueva</Button>
                                        </>}
                                    >
                                        {presentation.map((item, index) => {
                                            return (
                                                <Select.Option
                                                    value={item?.product_presentation_id}
                                                    key={index}
                                                >
                                                    {item.name}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </Form.Item>
                                <Form.Item label={"Notas al precio"} name={"description"}>
                                    <Input/>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>
                    </Card>
                </Form>

        </div>
    );
}
