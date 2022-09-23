import {Button, Card, Col, Form, Input, InputNumber, Row} from "antd";
import React, {useState} from "react";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import openNotificationWithIcon from "../../components/alerts/notifications.jsx";
import {Link} from "react-router-dom";

const layout = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
}

const validatePrimeNumber = (number) => {
    // const data = Number(number.replace(/C\$\s?|(,*)/g, ''))
    if (number < 1) {
        return {
            validateStatus: 'success',
            errorMsg: null,
        };
    }
    return {
        validateStatus: 'error',
        errorMsg: 'Debe especificar un mínimo',
    };
};
/* eslint-enable no-template-curly-in-string */

export default function CreateProduct() {
    const [form] = Form.useForm();
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

    const {loading, error, executeService} = useAuthorizedApi({
        url: "/inventory/create",
        method: "POST",
        onSuccess: ()=> {
            form.resetFields();
            openNotificationWithIcon("success", "Listo!", "Producto Creado Exitosamente.")
        },
        onError: (err) => {
            form.resetFields();
            openNotificationWithIcon("error", "Proceso Fallido", err.message)
        }
    });
  const onFinish = async (values) => {
      await executeService(values);
  };

  const onFinishFailed = (data) => console.log(data)

  return (
  <div className="layout-content">
      <div >
          <Col xs={"24"} xl={"24"}>
              <Card bordered={false} >
                  <h3>Agrega un nuevo producto</h3>
                  <hr/>
                  <div style={{marginBottom: "3rem"}}></div>
                  <Form
                      title={"Agrega un nuevo producto"}
                      name="basic"
                      labelCol={{ span: 2 }}
                      wrapperCol={{ span: 10 }}
                      form={form}
                      onFinish={onFinish}
                      onFinishFailed={onFinishFailed}
                      autoComplete="off"
                  >
                      <Form.Item
                          label="Producto"
                          name="name"
                          rules={[{ required: true, message: 'El nombre del producto es requerido.' }]}
                      >
                          <Input />
                      </Form.Item>

                      <Form.Item
                          label="Código"
                          name="product_code"
                          rules={[{ required: true, message: 'Código es requerido.' }]}
                      >
                          <Input />
                      </Form.Item>
                      <Form.Item
                          label="Cantidad"
                          name="quantity"
                      >
                          <InputNumber
                              defaultValue={1}
                              min={1}
                              value={cantidad.value}
                              onChange={onCantidadChange}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/(,*)/g, '')}
                          />
                      </Form.Item>
                      <Form.Item
                          label="Precio Unitario"
                          name="price"
                      >
                          <InputNumber
                              defaultValue={1}
                              min={1}
                              value={precio.value}
                              onChange={onPriceChange}
                              formatter={value => `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/C\$\s?|(,*)/g, '')}

                          />
                      </Form.Item>

                      <Form.Item wrapperCol={{ offset: 2, span: 16 }}>
                         <div >
                             <Button style={{marginRight: 12}} type="primary" htmlType="submit">
                                 GUARDAR
                             </Button>
                             <Link to={"/admin/inventario"}>
                                 <Button type="primary" danger>
                                     REGRESAR
                                 </Button>
                             </Link>
                         </div>
                      </Form.Item>
                  </Form>
              </Card>
          </Col>

      </div>
  </div>
  );
}
