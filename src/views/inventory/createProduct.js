import React, {useState} from "react";
import {Button, Card, Col, Form, Input, InputNumber, List, Row, Select, Skeleton} from "antd";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import openNotificationWithIcon from "../../components/alerts/notifications.js";
import {Link} from "react-router-dom";
import "../../assets/styles/customForm.styles.css";
import CreateProvider from "./createProvider";
import CreatePresentation from "./createPresentation";
import CreateLab from "./createLab";
import {DollarCircleOutlined} from "@ant-design/icons";

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
    const [formPrice] = Form.useForm();
    const [pricesState, setPricesState] = useState([]);
    const [providersState, setProvidersState] = useState([]);
    const [presentation, setPresentation] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [openAddProvider, setOpenAddProvider] = useState(false);
    const [openLaboratory, setOpenLaboratory] = useState(false);
    const [openPresentation, setOpenPresentation] = useState(false);
    const [precio, setPrecio] = useState({
        value: 1,
    });
    const [cantidad, setCantidad] = useState({
        value: 1,
    });

    const onPriceChange = (value) => {
        setPrecio({...validatePrimeNumber(value), value});
    };
    const onCantidadChange = (value) => {
        setCantidad({...validatePrimeNumber(value), value});
    };
    const onSubmitPrice = (_price) => {
        setPricesState([...pricesState, {..._price}]);
        formPrice.resetFields();
    }
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
            <div>
                <Col>
                    <Card bordered={false}>
                        <h3>Agrega un nuevo producto</h3>
                        <hr/>
                        <div style={{marginBottom: "3rem"}}></div>
                        <Form
                            title={"Agrega un nuevo producto"}
                            name="basic"
                            wrapperCol={{span: 16}}
                            form={form}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Row gutter={[8, 8]}>
                                <Col
                                    md={{span: 10}}
                                    xl={{span: 10}}
                                    lg={{span: 10}}
                                    xs={{span: 24}}
                                >
                                    <Input.Group>
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
                                    </Input.Group>
                                    <Input.Group>
                                        <Form.Item
                                            label="Código"
                                            name="product_code"
                                            rules={[
                                                {required: true, message: "Código es requerido."},
                                            ]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Input.Group>
                                    <Input.Group compact>
                                        <Form.Item labelCol={12} label="Cantidad por caja" name="quantity" required>
                                            <InputNumber
                                                defaultValue={1}
                                                min={1}
                                                value={cantidad.value}
                                                onChange={onCantidadChange}
                                                formatter={(value) =>
                                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }
                                                parser={(value) => value.replace(/(,*)/g, "")}
                                            />
                                        </Form.Item>
                                        <Form.Item labelCol={12} label="Cantidad dentro caja" name="box_quantity"
                                                   required style={{marginLeft: "1rem"}}>
                                            <InputNumber
                                                defaultValue={1}
                                                min={1}
                                                value={cantidad.value}
                                                onChange={onCantidadChange}
                                                formatter={(value) =>
                                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }
                                                parser={(value) => value.replace(/(,*)/g, "")}
                                            />
                                        </Form.Item>
                                    </Input.Group>
                                    <Input.Group compact style={{justifyContent: "space-between"}}>
                                        <Form.Item labelCol={12} label="Precio Unitario" name="price" required>
                                            <InputNumber
                                                defaultValue={1}
                                                min={1}
                                                value={precio.value}
                                                onChange={onPriceChange}
                                                formatter={(value) =>
                                                    `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }
                                                parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                                            />
                                        </Form.Item>
                                        <Form.Item labelCol={12} label="Precio Por Caja" name="box_price" required
                                                   style={{marginLeft: "1rem"}}>
                                            <InputNumber
                                                defaultValue={1}
                                                min={1}
                                                value={precio.value}
                                                onChange={onPriceChange}
                                                formatter={(value) =>
                                                    `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                }
                                                parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                                            />
                                        </Form.Item>
                                    </Input.Group>
                                    <fieldset style={{marginBottom: '3rem'}}>
                                        <legend>Agregar Precio</legend>
                                        <Form layout="inline" name={"price_adder"} form={formPrice}
                                              title={"Agregar Precio"}
                                              onFinish={onSubmitPrice}>
                                            <Form.Item name={'type'}>
                                                <Input placeholder="Tipo de precio"/>
                                            </Form.Item>
                                            <Form.Item name={'amount'}>
                                                <InputNumber
                                                    placeholder="Monto"
                                                    min={1}
                                                    onChange={onPriceChange}
                                                    formatter={(value) =>
                                                        `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                    }
                                                    parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                                                />
                                            </Form.Item>
                                            <Form.Item name={'description'}>
                                                <Input placeholder={"Descripcion"}/>
                                            </Form.Item>
                                            <Button type={"primary"} >Agregar</Button>
                                        </Form>
                                    </fieldset>

                                </Col>
                                <Col
                                    md={{span: 12}}
                                    xl={{span: 12}}
                                    lg={{span: 12}}
                                    xs={{span: 24}}
                                >
                                    <div className={"select-item-group-btn"}>
                                        <Form.Item
                                            label={"Presentacion"}
                                            labelCol={{span: 8}}
                                            wrapperCol={{span: 10, offset: 0}}
                                            name={"product_presentation_id"}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Defina una presentacion para el producto.",
                                                },
                                            ]}
                                        >
                                            <Select
                                                style={{width: 200}}
                                                placeholder="Seleccione una presentacion"
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
                                        <Button type={"primary"} onClick={(e) => {
                                            e.preventDefault();
                                            setOpenPresentation(true);
                                        }}>Agregue una nueva</Button>
                                    </div>
                                    <div className={"select-item-group-btn"}>
                                        <Form.Item
                                            label={"Laboratorio"}
                                            name={"laboratory_id"}
                                            labelCol={{span: 7}}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Defina un laboratorio.",
                                                },
                                            ]}
                                        >
                                            <Select
                                                style={{width: 200}}
                                                placeholder="Seleccione un laboratorio"
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
                                        <Button
                                            type={"primary"}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenLaboratory(true)
                                            }}
                                        >Agregue una nueva</Button>
                                    </div>
                                    <div className={"select-item-group-btn"}>
                                        <Form.Item
                                            label={"Proveedor"}
                                            labelCol={{span: 7}}
                                            name={"provider_id"}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Defina una proveedor.",
                                                },
                                            ]}
                                        >
                                            <Select
                                                style={{width: 200}}
                                                placeholder="Seleccione un proveedor"
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
                                        <Button
                                            type={"primary"}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenAddProvider(true);
                                            }}
                                        >
                                            Agregue una nueva
                                        </Button>
                                    </div>
                                    <div className={"price-list"}>
                                        <List
                                            className="demo-loadmore-list"
                                            itemLayout="horizontal"
                                            dataSource={pricesState}
                                            renderItem={(item) => (
                                                <List.Item
                                                    actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}
                                                >
                                                    <Skeleton avatar title={false} loading={item.loading} active>
                                                        <List.Item.Meta
                                                            avatar={<DollarCircleOutlined />}
                                                            title={<b>{item.type}</b>}
                                                            description={`Monto Unitario: C$ ${item.amount}`}
                                                        />
                                                        <div>content</div>
                                                    </Skeleton>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row gutter={[8, 8]}>
                                <Col span={12}>

                                    <Form.Item wrapperCol={{span: 16}}>
                                        <div>
                                            <Button
                                                style={{marginRight: 12}}
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
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
            </div>
        </div>
    );
}
