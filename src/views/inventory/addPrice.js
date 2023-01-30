import ModalContainer from "../../components/containers/modalContainer";
import {Form, Input, InputNumber, Radio} from "antd";
import {useState} from "react";
import openNotificationWithIcon from "../../components/alerts/notifications";

export const PRICE_TYPE = {UNIT: 'UNIT', PACK: 'PACK', OTHER: 'OTHER'}
export default function AddPrice({closeModal, open, priceAction}) {
    const [form] = Form.useForm();
    const [extraUnitPrice, setExtraUnitPrice] = useState(PRICE_TYPE.UNIT);
    const onFinish = (data) => {
        form.validateFields().then(_data => {
                priceAction && priceAction({
                    ...data,
                    description: extraUnitPrice === PRICE_TYPE.OTHER ?
                        data.description :
                        data.type === PRICE_TYPE.UNIT ? 'Precio por unidad' : 'Precio por paquete/sobre.'
                });
                form.resetFields();
                closeModal && closeModal()
            })
            .catch(errorInfo => {
                if (errorInfo?.errorFields.length > 0) {
                    form.resetFields();
                    openNotificationWithIcon('error', 'Ups!', 'Hay campos necesarios por llenar.')
                }
            })
        setExtraUnitPrice(PRICE_TYPE.UNIT)
    };

    return <ModalContainer
        title={"Agregar Precio de Producto"}
        closeModal={() => {
            setExtraUnitPrice(PRICE_TYPE.UNIT);
            closeModal && closeModal();
        }}
        open={open}
        callback={() => onFinish(form.getFieldsValue())}
    >
        <Form
            layout={"horizontal"}
            form={form}
            autoComplete="off"
            labelCol={{
                span: 4,
            }}
            wrapperCol={{
                span: 14,
            }}
            initialValues={{
                type: PRICE_TYPE.UNIT,
                quantity: 1,
                amount: 1,
                description: ''
            }}
            name={"Add Price"}
            title={"Add Price"}
        >
            <Form.Item label="Tipo" name="type" fieldId={"type"}>
                <Radio.Group
                    name={"type"}
                    defaultValue={PRICE_TYPE.UNIT}
                    buttonStyle="solid"
                    onChange={event => {
                        // form.setFieldValue('type', event.target.value);
                        setExtraUnitPrice(event.target.value)
                    }}
                >
                    <Radio.Button value={PRICE_TYPE.UNIT}>Unidad</Radio.Button>
                    <Radio.Button value={PRICE_TYPE.PACK}>Paquete/Sobre</Radio.Button>
                    <Radio.Button value={PRICE_TYPE.OTHER}>Otro</Radio.Button>
                </Radio.Group>
            </Form.Item>

            {
                extraUnitPrice === PRICE_TYPE.OTHER ?
                    <Form.Item label={"Descripcion"} name={"description"}
                               rules={[{required: true, message: 'Especifique una descripcion del tipo de precio.'}]}>
                        <Input/>
                    </Form.Item> : null
            }
            <Form.Item labelCol={12} label="Cantidad" name="quantity" required>
                <InputNumber
                    min={1}
                    formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                />
            </Form.Item>
            <Form.Item labelCol={12} label="Precio" name="amount" required>
                <InputNumber
                    min={1}
                    formatter={(value) =>
                        `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                />
            </Form.Item>
        </Form>
    </ModalContainer>
}