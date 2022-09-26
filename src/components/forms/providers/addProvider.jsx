import { Button, Form, Input, Modal, Radio } from 'antd';
import {useAuthorizedApi} from "../../../services/auth/rest.js";
import openNotificationWithIcon from "../../alerts/notifications.jsx";

export default function AddProvider({ open, closeModal }) {
    const [form] = Form.useForm();

    const {loading, executeService} = useAuthorizedApi({
        url: "",
        method: "POST",
        onSuccess:() => {
            form.resetFields()
            openNotificationWithIcon("success", "Listo!", "Proveedor Creado Exitosamente.")
            closeModal()
        },
        onError: (err) => {
            form.resetFields();
            openNotificationWithIcon("error", "Proceso Fallido", err.message)
            closeModal()
        }
    })
    const onFinish = async (values) => {
        await executeService(values);
    };
    return (
        <Modal
            title="Crea un nuevo proveedor"
            visible={open}
            // confirmLoading={true}
            okText="Guardar"
            cancelText="Cancelar"
            onCancel={closeModal}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        form.resetFields();
                        executeService(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
            >
                <Form.Item
                    name="name"
                    label="Nombre de Proveedor"
                    rules={[
                        {
                            required: true,
                            message: 'Especifique el nombre del proveedor.',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="auth_code"
                    label="Codigo de Proveedor"
                    rules={[
                        {
                            required: true,
                            message: 'Especifique el codigo del proveedor.',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="telephone"
                    label="Telefono"
                    rules={[
                        {
                            required: true,
                            message: 'Especifique el telefono del proveedor.',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="direction" label="Direccion">
                    <Input type="textarea" />
                </Form.Item>
            </Form>
        </Modal>
    );
};


