import React, {Component} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    Layout, Menu, Button, Row, Col, Typography, Form, Input, Switch,
} from "antd";
import signinbg from "../../assets/login-image.jpg";
import {useForm} from "react-hook-form";
import {useFreeApi} from "../../services/auth/rest.js";
import {PulseLoader} from "react-spinners";

function onChange(checked) {
    console.log(`switch to ${checked}`);
}

const {Title} = Typography;
const {Footer, Content} = Layout;

export default function SignIn() {
    let navigate = useNavigate();
    const {error, loading, executeService} = useFreeApi(
        '/login',
        "POST",
        {
            onSuccess: ({data}) => {
                localStorage.setItem("token", data.token);
                navigate("/admin")
            },
        }
    )
    const onSubmit = async (data) => {
        await executeService({
            email: data.email,
            password: data.password
        })
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
                        {error && <b className={"text-danger"}>
                            "Hubo un error al iniciar sesion."</b>}
                        <Title className="font-regular text-muted" level={5}>
                            Ingrese su correo y constraseña para iniciar sesión
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
                                    required: true, message: "Please input your email!",
                                },]}
                            >
                                <Input placeholder="Email"/>
                            </Form.Item>
                            <Form.Item
                                label="Contraseña"
                                name="password"
                                rules={[{
                                    required: true, message: "Please input your password!",
                                },]}
                            >
                                <Input.Password placeholder="Password"/>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{width: "100%"}}
                                >
                                    {
                                        loading === true ?
                                            <PulseLoader color={"white"} loading/>
                                            : "INICIAR SESION"
                                    }
                                </Button>
                            </Form.Item>
                            <p className="font-semibold text-muted">
                                Don't have an account?{" "}
                                <Link to="/sign-up" className="text-dark font-bold">
                                    Sign Up
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
                    Copyright © 2022 Sana System by <a href="#pablo">Moises & Linda</a>.{" "}
                </p>
            </Footer>
        </Layout>
    </>);

}
