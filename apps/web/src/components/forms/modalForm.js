import {Button, Form, Input, Modal, Radio, Spin} from 'antd';
import {useCreateMutation} from "../../services/query/api";
import openNotificationWithIcon from "../alerts/notifications.js";
import "../../assets/styles/modalForm.style.css"

export default function ModalForm({ title, open, closeModal, url, callback, children, full }) {
    const [form] = Form.useForm();
    const mutation = useCreateMutation(url, {
        onSuccess: () => {
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
            open={open}
            okText="Guardar"
            cancelText="Cancelar"
            className={full ?"full-modal": ""}
            bodyStyle={ full? {height: "calc(100vh - 110px)"}: {}}
            onCancel={closeModal}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        form.resetFields();
                        mutation.mutate(values);
                    })
                    .catch((info) => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Spin spinning={mutation.isLoading} tip={"Guardando..."} delay={500}>
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