import {Button, Form, Input, Modal, Radio, Spin} from 'antd';
import {useAuthorizedApi} from "../../services/auth/rest.js";
import openNotificationWithIcon from "../alerts/notifications.jsx";

export default function ModalForm({ title, open, closeModal, url, callback, children }) {
    const [form] = Form.useForm();
    const {loading, executeService} = useAuthorizedApi({
        url: url,
        method: "POST",
        onSuccess:() => {
            form.resetFields()
            openNotificationWithIcon("success", "Listo!", "Elemento Creado Exitosamente.")
            if (callback) {
                callback()
            }
            closeModal()
        },
        onError: (err) => {
            form.resetFields();
            openNotificationWithIcon("error", "Proceso Fallido", err.message)
            closeModal()
        }
    })

    return (
        <Modal
            title={title}
            visible={open}
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
            <Spin spinning={loading} tip={"Guardando..."} delay={500}>
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                >
                    {children}
                </Form>
            </Spin>
        </Modal>
    );
};


