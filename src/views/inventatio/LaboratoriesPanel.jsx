import moment from "moment";

const columns = [
    {
        title: "Laboratorio",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Codigo",
        dataIndex: "auth_code",
        key: "auth_code",
    },
    {
        title: "Fecha Ingreso",
        dataIndex: "created_at",
        key: "created_at",
        render: (text) => <b>{ moment(text).format("ddd DD MMM YYYY hh:mm a") }</b>
    },
    {
        title: "Código De Producto",
        dataIndex: "product_code",
        key: "product_code",
    },

];