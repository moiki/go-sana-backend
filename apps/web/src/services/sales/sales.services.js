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
        const updated = {...item, ...row, subTotal: Number(row['cantidad'] || 1) * Number(row['price'] || 0)}
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

    const resetSale = () => {
        setSaleDetails([]);
        setSaleBody(InitialSaleBody);
        setDiscount(0);
    }

    useEffect(() => {
        if (saleDetails.length > 0) {
            const total = sumBy(saleDetails, "subTotal")
            setSaleBody({...saleBody, Amount: total, Details: saleDetails});
        }
    }, [saleDetails]);


    return {
        setDiscountType,
        handleAddItem,
        handleSaveItem,
        handleDeleteItem,
        resetSale,
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

export function computeDiscountedAmount(gross, discountType, discountValue) {
    const discount = Number(discountValue) || 0;
    if (discount <= 0) return gross;
    if (discountType === DISCOUNT_TYPE.PERCENT_DISCOUNT) {
        const off = Math.min(discount, 100);
        return gross - (gross * off / 100);
    }
    return Math.max(gross - discount, 0);
}

export function buildSalePayload(saleBody, details) {
    const gross = details.reduce((acc, d) => acc + (Number(d.subTotal) || 0), 0);
    const total = computeDiscountedAmount(gross, saleBody.DiscountType, saleBody.Discount);
    const factor = gross > 0 ? total / gross : 0;
    return {
        client_name: saleBody.ClientName,
        commentary: saleBody.Commentary,
        paid_with: Number(saleBody.PaidWith) || 0,
        change: Number(saleBody.Change) || 0,
        discount_type: saleBody.DiscountType,
        discount: Number(saleBody.Discount) || 0,
        details: details.map(d => ({
            product_id: d.productId,
            inner_quantity: Number(d.cantidad) || 1,
            sub_total: Math.round(((Number(d.subTotal) || 0) * factor) * 100) / 100,
        })),
    };
}

export async function createSale(payload) {
    const res = await CustomAxios("/sales/create", payload, "POST");
    if (res.error) {
        const err = new Error(res.error.payload || res.error.message);
        throw err;
    }
    return res;
}

export default {
    useSaleCreation,
    getProductByCode
}