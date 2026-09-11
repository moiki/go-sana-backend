import {Modal} from "antd";

export default function ModalContainer({title, open, closeModal, callback, children, full}) {

    return <Modal
        title={title}
        open={open}
        okText="Aceptar"
        cancelText={"Cancelar"}
        okButtonProps={{name: "Cerrar"}}
        className={full ? "full-modal" : ""}
        styles={full ? {body: {height: "calc(100vh - 110px)"}} : {}}
        onCancel={closeModal}
        destroyOnClose={true}
        onOk={() => {
            callback && callback()
        }
        }
    >
        {children}
    </Modal>
}