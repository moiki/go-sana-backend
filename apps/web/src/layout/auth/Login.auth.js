import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    Layout, Button, Row, Col, Typography, Form, Input, Checkbox,
} from "antd";
import signinbg from "../../assets/login-image.jpg";
import {useLoginMutation} from "../../services/query/api";
import {PulseLoader} from "react-spinners";

const {Title} = Typography;
const {Footer, Content} = Layout;

export default function SignIn() {
    const navigate = useNavigate();
    const [formError, setFormError] = useState(null);
    const mutation = useLoginMutation({
        onSuccess: () => {
            navigate("/admin");
        },
        onError: () => {
            setFormError("Hubo un error al iniciar sesión. Verifique sus credenciales.");
        },
    });

    const onSubmit = async (data) => {
        setFormError(null);
        mutation.mutate({
            email: data.email,
            password: data.password,
            rememberMe: data.remember_me || false,
        });
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };
    return (<>
        <Layout className="layout-default layout-signin" style={{height: "100vh"}}>
            <Content className="signin">
                <Row gutter={[24, 0]} justify="space-around">
                    <Col
                        xs={{span: 24, offset: 0}}
                        lg={{span: 6, offset: 2}}
                        md={{span: 12}}
                    >
                        <Title className="mb-15">Iniciar Sesión</Title>
                        {formError && <b className={"text-danger"}>
                            {formError}</b>}
                        <Title className="font-regular text-muted" level={5}>
                            Ingrese su correo y contraseña para iniciar sesión
                        </Title>
                        <Form
                            onFinish={onSubmit}
                            onFinishFailed={onFinishFailed}
                            layout="vertical"
                            className="row-col"
                        >
                            <Form.Item
                                className="username"
                                label="Email"
                                name="email"
                                rules={[{
                                    required: true, message: "Por favor ingrese su correo",
                                },]}
                            >
                                <Input placeholder="Email"/>
                            </Form.Item>
                            <Form.Item
                                label="Contraseña"
                                name="password"
                                rules={[{
                                    required: true, message: "Por favor ingrese su contraseña",
                                },]}
                            >
                                <Input.Password placeholder="Contraseña"/>
                            </Form.Item>
                            <Form.Item name="remember_me" valuePropName="checked">
                                <Checkbox>Recordarme</Checkbox>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{width: "100%"}}
                                >
                                    {
                                        mutation.isLoading ?
                                            <PulseLoader color={"white"} loading/>
                                            : "INICIAR SESIÓN"
                                    }
                                </Button>
                            </Form.Item>
                            <p className="font-semibold text-muted">
                                ¿No tiene una cuenta?{" "}
                                <Link to="/signup" className="text-dark font-bold">
                                    Registrarse
                                </Link>
                            </p>
                        </Form>
                    </Col>
                    <Col
                        className="sign-img"
                        style={{padding: 12}}
                        xs={{span: 24}}
                        lg={{span: 12}}
                        md={{span: 12}}
                    >
                        <img src={signinbg} alt=""/>
                    </Col>
                </Row>
            </Content>
            <Footer>

                <p className="copyright">
                    {" "}
                    Copyright (c) 2022 Sana System by <a href="#pablo">Moises & Linda</a>.{" "}
                </p>
            </Footer>
        </Layout>
    </>);

}