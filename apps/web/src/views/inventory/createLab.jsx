import ModalForm from "../../components/forms/modalForm";
import {Form, Input} from "antd";


export default function CreateLab({open, closeModal, cb}) {
    return <ModalForm open={open} closeModal={closeModal} url={"/inventory/lab"} title={"Agregue un nuevo laboratorio"} callback={cb}>
        <Form.Item
            name="name"
            label="Nombre de laboratorio"
            rules={[
                {
                    required: true,
                    message: 'Especifique el nombre del laboratorio.',
                },
            ]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="auth_code"
            label="Codigo de laboratorio"
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
        <Form.Item name="direction" label="Direccion" >
            <Input.TextArea type="textarea" />
        </Form.Item>
    </ModalForm>
}