import React, {useState} from "react";
import {Button, Card, Form, Input, Typography} from "antd";
import {LockOutlined, MailOutlined} from "@ant-design/icons";
import logo from "../../../assets/sana-logo.svg";
import openNotificationWithIcon from "../../alerts/notifications";

const {Title, Text} = Typography;

export default function Signup() {
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            openNotificationWithIcon(
                "info",
                "Registro no disponible",
                "Las cuentas solo se crean desde el administrador del sistema."
            );
        }, 600);
    };

    return (
        <div className="sana-auth-inner">
            <div className="sana-login-brand">
                <img src={logo} alt="Sana" width={64} height={64}/>
                <Title level={2} className="sana-login-title">Sana POS</Title>
                <Text className="sana-login-tagline">Crea tu cuenta de farmacia</Text>
            </div>
            <Card className="sana-login-card" bordered={false}>
                <Title level={3}>Registrarse</Title>
                <Text type="secondary">Complete sus datos para continuar</Text>
                <Form
                    onFinish={onFinish}
                    layout="vertical"
                    style={{marginTop: 24}}
                >
                    <Form.Item
                        label="Nombre completo"
                        name="full_name"
                        rules={[{required: true, message: "Por favor ingrese su nombre"}]}
                    >
                        <Input placeholder="Ej. Jane Doe" size="large"/>
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {required: true, message: "Por favor ingrese su correo"},
                            {type: "email", message: "Correo no válido"},
                        ]}
                    >
                        <Input prefix={<MailOutlined/>} placeholder="Email" size="large"/>
                    </Form.Item>
                    <Form.Item
                        label="Contraseña"
                        name="password"
                        rules={[{required: true, message: "Por favor ingrese su contraseña"}]}
                    >
                        <Input.Password prefix={<LockOutlined/>} placeholder="Contraseña" size="large"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            REGISTRARSE
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}