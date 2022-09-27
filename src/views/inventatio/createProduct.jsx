import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { useAuthorizedApi } from "../../services/auth/rest.js";
import openNotificationWithIcon from "../../components/alerts/notifications.jsx";
import { Link } from "react-router-dom";
import AddProvider from "../../components/forms/providers/addProvider.jsx";
import "../../assets/styles/customForm.styles.css";

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
  const [openAddProvider, setOpenAddProvider] = useState(false);
  const [precio, setPrecio] = useState({
    value: 1,
  });
  const [cantidad, setCantidad] = useState({
    value: 1,
  });

  const onPriceChange = (value) => {
    setPrecio({ ...validatePrimeNumber(value), value });
  };
  const onCantidadChange = (value) => {
    setCantidad({ ...validatePrimeNumber(value), value });
  };

  // Get Providers
  const { executeService: GetProviders } = useAuthorizedApi({
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
  // Post Create Product
  const { loading, error, executeService } = useAuthorizedApi({
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

  const closeProviderModal = () => {
    setOpenAddProvider(false);
    GetProviders();
  };

  return (
    <div className="layout-content">
      <AddProvider open={openAddProvider} closeModal={closeProviderModal} />
      <div>
        <Col xs={"24"} xl={"24"}>
          <Card bordered={false}>
            <h3>Agrega un nuevo producto</h3>
            <hr />
            <div style={{ marginBottom: "3rem" }}></div>
            <Form
              title={"Agrega un nuevo producto"}
              name="basic"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 16 }}
              form={form}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={[8, 8]}>
                <Col
                  md={{ span: 8 }}
                  xl={{ span: 8 }}
                  lg={{ span: 8 }}
                  xs={{ span: 24 }}
                >
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
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Código"
                    name="product_code"
                    rules={[
                      { required: true, message: "Código es requerido." },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item label="Cantidad" name="quantity">
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
                  <Form.Item label="Precio Unitario" name="price">
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

                  <Form.Item wrapperCol={{ offset: 2, span: 16 }}>
                    <div>
                      <Button
                        style={{ marginRight: 12 }}
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
                <Col
                  md={{ span: 10 }}
                  xl={{ span: 12 }}
                  lg={{ span: 10 }}
                  xs={{ span: 24 }}
                >
                  <div className={"select-item-group-btn"}>
                    <Form.Item
                      label={"Presentacion"}
                      labelCol={{span:8}}
                      name={"presentation"}
                      rules={[
                        {
                          required: true,
                          message: "Defina una presentacion para el producto.",
                        },
                      ]}
                    >
                        <Select
                          style={{ width: 200 }}
                          placeholder="Seleccione una presentacion"
                        >
                          <Select.Option value="Tableta">Tableta</Select.Option>
                          <Select.Option value="Jarabe">Jarabe</Select.Option>
                          <Select.Option value="Crema/Gel">
                            Crema/Gel
                          </Select.Option>
                          <Select.Option value="Ampolla">Ampolla</Select.Option>
                        </Select>
                    </Form.Item>
                      <Button type={"primary"}>Agregue una nueva</Button>
                  </div>
                  <div className={"select-item-group-btn"}>
                    <Form.Item
                      label={"Laboratorio"}
                      name={"laboratorio"}
                      labelCol={{span:7}}
                      rules={[
                        {
                          required: true,
                          message: "Defina una presentacion para el producto.",
                        },
                      ]}
                    >
                      <Select
                        style={{ width: 200 }}
                        placeholder="Seleccione una presentacion"
                      >
                        <Select.Option value="Ramos">Ramos</Select.Option>
                        <Select.Option value="Lasantee">Lasantee</Select.Option>
                        <Select.Option value="Bayern">Bayern</Select.Option>
                      </Select>
                    </Form.Item>
                    <Button type={"primary"}>Agregue una nueva</Button>
                  </div>
                  <div className={"select-item-group-btn"}>
                    <Form.Item
                      label={"Proveedor"}
                      labelCol={{span:7}}
                      name={"proveedor"}
                      rules={[
                        {
                          required: true,
                          message: "Defina una presentacion para el producto.",
                        },
                      ]}
                    >
                      <Select
                        style={{ width: 200 }}
                        placeholder="Seleccione una presentacion"
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
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </div>
    </div>
  );
}
