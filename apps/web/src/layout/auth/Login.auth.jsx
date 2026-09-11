import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button, Card, Checkbox, Col, Form, Input, Row, Typography} from "antd";
import {LockOutlined, MailOutlined} from "@ant-design/icons";
import logo from "../../assets/sana-logo.svg";
import {useLoginMutation} from "../../services/query/api";
import {PulseLoader} from "react-spinners";

const {Title, Text} = Typography;

const errorMessage = (err) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Hubo un error al iniciar sesión. Verifique sus credenciales.";

export default function SignIn() {
    const navigate = useNavigate();
    const [formError, setFormError] = useState(null);
    const mutation = useLoginMutation({
        onSuccess: () => {
            navigate("/admin");
        },
        onError: (err) => {
            setFormError(errorMessage(err));
        },
    });

    const onSubmit = (data) => {
        setFormError(null);
        mutation.mutate({
            email: data.email,
            password: data.password,
            rememberMe: data.remember_me || false,
        });
    };

    return (
        <div className="sana-login">
            <div className="sana-login-brand">
                <img src={logo} alt="Sana" width={64} height={64}/>
                <Title level={2} className="sana-login-title">Sana POS</Title>
                <Text className="sana-login-tagline">Sistema de punto de venta para tu farmacia</Text>
            </div>
            <Card className="sana-login-card" bordered={false}>
                <Title level={3}>Iniciar sesión</Title>
                <Text type="secondary">Ingrese su correo y contraseña para continuar</Text>
                {formError && (
                    <div className="ant-alert ant-alert-error sana-login-error">
                        {formError}
                    </div>
                )}
                <Form
                    onFinish={onSubmit}
                    layout="vertical"
                    className="row-col"
                    style={{marginTop: 24}}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{required: true, message: "Por favor ingrese su correo"}]}
                    >
                        <Input
                            prefix={<MailOutlined/>}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Contraseña"
                        name="password"
                        rules={[{required: true, message: "Por favor ingrese su contraseña"}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="Contraseña"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item name="remember_me" valuePropName="checked">
                        <Checkbox>Recordarme</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            {mutation.isLoading ? (
                                <PulseLoader color={"white"} loading/>
                            ) : (
                                "INICIAR SESIÓN"
                            )}
                        </Button>
                    </Form.Item>
                    <Text type="secondary">
                        ¿No tiene una cuenta?{" "}
                        <Link to="/signup" className="text-dark font-bold">Registrarse</Link>
                    </Text>
                </Form>
            </Card>
        </div>
    );
}