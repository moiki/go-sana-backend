import ModalContainer from "../../components/containers/modalContainer";
import {Form, InputNumber} from "antd";
import React from "react";


export default function ConfirmSale({PaidWith, Amount, Change, onChangePaid, open, closeModal}) {
    return <ModalContainer
        open={open}
        title={<b>Confirmación de venta</b>}
        closeModal={() => {
            closeModal && closeModal();
            onChangePaid({
                Change: 0,
                PaidWith: 0
            })
        }
        }
    >
        <div>
            <p style={{fontSize: 18}}>¿Seguro que desea guardar esta venta?</p>
            <Form.Item
                label="Paga con"
                name="PaidWith"
            >
                <InputNumber
                    min={0}
                    value={PaidWith}
                    onChange={data => {
                        onChangePaid({
                            Change: Math.abs(Number(data) - Amount),
                            PaidWith: Number(data)
                        })
                    }}
                    formatter={(value) =>
                        `C$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/C\$\s?|(,*)/g, "")}
                />
            </Form.Item>

            <Form.Item
                label="Vuelto"
                name="Change"
            >
                <b>{`C$ ${Change}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>
            </Form.Item>
        </div>
    </ModalContainer>
}