import ModalContainer from "../../components/containers/modalContainer";
import {Form, Input, InputNumber, Radio} from "antd";
import {useState} from "react";

export const PRICE_TYPE = {UNIT: 'UNIT', PACK: 'PACK'}
export default function AddPrice({ closeModal, open, priceAction }) {
    const [form] = Form.useForm();
    const [extraUnitPrice, setExtraUnitPrice] = useState(PRICE_TYPE.UNIT);
    const onFinish = (data) => {
        console.log(data)
        priceAction && priceAction(data);
        form.resetFields();
        closeModal && closeModal()
    };

    return <ModalContainer
        title={"Agregar Precio de Producto"}
        closeModal={closeModal}
        open={open}
        callback={()=> onFinish(form.getFieldsValue())}
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
        >
            <Form.Item label="Tipo" name="type_price">
                <Radio.Group defaultValue={PRICE_TYPE.UNIT} buttonStyle="solid" onChange={opt => setExtraUnitPrice(opt.target.value)}>
                    <Radio.Button value={PRICE_TYPE.UNIT}>Unidad</Radio.Button>
                    <Radio.Button value={PRICE_TYPE.PACK}>Paquete/Sobre</Radio.Button>
                </Radio.Group>
            </Form.Item>

            <Form.Item label={"Descripcion"} name={"description"}>
                <Input/>
            </Form.Item>
            <Form.Item labelCol={12} label="Precio" name="price" required>
                <InputNumber
                    defaultValue={1}
                    min={1}
                    formatter={(value) =>
                        `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                />
            </Form.Item>
            {
                extraUnitPrice === PRICE_TYPE.PACK ?
                  <>
                      <Form.Item label={"Cantidad"} name={"quantity"} required>
                          <InputNumber
                              defaultValue={1}
                              min={1}
                              formatter={(value) =>
                                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                          />
                      </Form.Item>
                      <Form.Item labelCol={12} label="Precio por unidad de paquete/sobre" name="price" required>
                        <InputNumber
                            defaultValue={1}
                            min={1}
                            formatter={(value) =>
                                `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                  </>
                    : null
            }
        </Form>
    </ModalContainer>
}