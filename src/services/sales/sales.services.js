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
    DiscountType: DISCOUNT_TYPE.PERCENT_DISCOUNT,
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
    const [discount, setDiscount] = useState(0);
    const [saleBody, setSaleBody] = useState(InitialSaleBody);
    const [saleDetails, setSaleDetails] = useState([]);
    const [totalPayment, setTotalPayment] = useState(0);
    const changeBodyValue = (value, name) => {
        setSaleBody({...saleBody, [name]: value});
    };
    const changeBodyValueByObject = (body) => {
        console.log(body)
        let hasUnknownElement = false;
        Object.keys(body).forEach(inc => {
            if (!Object.keys(InitialSaleBody).some(key => key === inc)) {
                console.error('Invalid value Key: ', inc);
                hasUnknownElement = true;
            }
        })
        if (!hasUnknownElement) setSaleBody({...saleBody, ...body});
    }

    const setDiscountType = (event) => changeBodyValue(event.target.value, 'DiscountType');

    const handleSaveItem = (row) => {
        const newData = [...saleDetails];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        const updated = {...item, ...row, subTotal: row['cantidad'] * row['price']}
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
            // setTotalPayment(total);
            // changeBodyValue(total, "Amount");
            // changeBodyValue(saleDetails, "Details");
            setSaleBody({...saleBody, Amount: total, Details: saleDetails});
        }
    }, [saleDetails]);


    return {
        setDiscountType,
        handleAddItem,
        handleSaveItem,
        handleDeleteItem,
        saleDetails,
        totalPayment,
        discount,
        setDiscount,
        saleBody,
        resetBody,
        changeBodyValue,
        changeBodyValueByObject
    }
}

export default {
    useSaleCreation,
    getProductByCode
}