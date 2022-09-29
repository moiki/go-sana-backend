import moment from "moment";

const columns = [
    {
        title: "Laboratorio",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Presentacion",
        dataIndex: "presentation",
        key: "presentation",
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
    {
        title: "Precio",
        key: "price",
        dataIndex: "price",
        render: (text) => (
            <b style={{ color: "green" }}>
                {`C$ ${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
    {
        title: "Stock",
        key: "quantity",
        dataIndex: "quantity",
        render: (text) => (
            <b className={"success"}>
                {`${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </b>
        ),
    },
];