import ModalForm from "../../components/forms/modalForm";
import {Form, Input} from "antd";


export default function CreatePresentation({open, closeModal, cb}) {
    return <ModalForm open={open} closeModal={closeModal} url={"/inventory/presentation"} title={"Agregue una nueva presentacion"} callback={cb}>
        <Form.Item
            name="name"
            label="Nombre de Presentacion"
            rules={[
                {
                    required: true,
                    message: 'Especifique la presentacion.',
                },
            ]}
        >
            <Input />
        </Form.Item>
        <Form.Item
            name="description"
            label="Descripcion"
        >
            <Input />
        </Form.Item>

    </ModalForm>
}