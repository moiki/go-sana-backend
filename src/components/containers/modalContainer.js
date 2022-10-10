import {Modal} from "antd";

export default function ModalContainer({ title, open, closeModal, callback, children, full }) {

    return <Modal
        title={title}
        open={open}
        okText="Cerrar"
        className={full ?"full-modal": ""}
        bodyStyle={ full? {height: "calc(100vh - 110px)"}: {}}
        onCancel={closeModal}
        onOk={()=> {
        callback && callback()
        }
        }
    >
        {children}
    </Modal>
}