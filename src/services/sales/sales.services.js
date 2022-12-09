import {useEffect, useState} from "react";
import {DISCOUNT_TYPE} from "../utils.services";
import {sumBy} from "lodash";
import {CustomAxios} from "../auth/rest";
import openNotificationWithIcon from "../../components/alerts/notifications";

const InitialSaleBody = {
    ClientName: '',
    Amount: 0,
    Details: [],
    Commentary: '',
    PaidWith: 0,
    Change: 0,
    DiscountType: DISCOUNT_TYPE.AMOUNT_DISCOUNT,
    Discount: 0
}

async function getProductByCode(product_code) {
    try {
        const productByCode = await CustomAxios(`/inventory/find-product`, {
            property: "product_code",
            value: product_code
        }, "POST");
        if (productByCode.error) {
            openNotificationWithIcon("error", "Ups!", productByCode.error?.message);
        }
        return {
            products: productByCode.data?.products
        }
    } catch (e) {
        openNotificationWithIcon("error", "Error al buscar", e.message);
        return {
            products: null
        }
    }
}

function useSaleCreation() {
    const [saleBody, setSaleBody] = useState(InitialSaleBody);
    const [saleDetails, setSaleDetails] = useState([]);
    const [totalPayment, setTotalPayment] = useState(0);
    const changeBodyValue = (value, name) => setSaleBody({...saleBody, [name]: value});

    const setDiscountType = (event) => changeBodyValue(event.target.value, 'DiscountType');

    const handleSaveItem = (row) => {
        const newData = [...saleDetails];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        const updated = {...item, ...row, subTotal: row['cantidad'] * newData[index]['price']}
        newData.splice(index, 1, updated);
        setSaleDetails(newData);
    };
    const handleAddItem = (newItem) => {
        const alreadyExist = saleDetails.find(item => item.key === newItem.key)
        if (alreadyExist) {
            handleSaveItem(newItem)
        } else {
            setSaleDetails([...saleDetails, newItem]);
        }
    };
    const handleDeleteItem = (key) => {
        const newData = saleDetails.filter((item) => item.key !== key);
        setSaleDetails(newData);
    };

    const resetBody = () => setSaleBody(InitialSaleBody)

    useEffect(() => {
        if (saleDetails.length > 0) {
            const total = sumBy(saleDetails, "subTotal")
            setTotalPayment(total)
        }
    }, [saleDetails]);


    return {
        setDiscountType,
        handleAddItem,
        handleSaveItem,
        handleDeleteItem,
        saleDetails,
        totalPayment,
        saleBody,
        resetBody
    }
}

export default {
    useSaleCreation,
    getProductByCode
}