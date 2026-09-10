import ModalForm from "../../components/forms/modalForm";
import {Form, Input} from "antd";


export default function CreateProvider({open, closeModal, cb}) {
    return <ModalForm open={open} closeModal={closeModal} url={"/inventory/provider"} title={"Agregue un nuevo proveedor"} callback={cb}>
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
        <Form.Item name="direction" label="Direccion" >
            <Input.TextArea type="textarea" />
        </Form.Item>
    </ModalForm>
}