import React, {useState} from 'react';
import {Button, Select} from 'antd';
import {debounce} from "lodash";
import openNotificationWithIcon from "../../components/alerts/notifications";
import {PlusOutlined} from "@ant-design/icons";

export const SearchInput = ({placeholder, onSearch, value, setValue, onAccept, acceptText = 'Agregar'}) => {
    const [data, setData] = useState([]);
    const handleChange = (newValue) => {
        setValue(data.find(item => item.value === newValue));
        // onAccept && onAccept(value);
    };
    const addAction = () => {
        // openNotificationWithIcon('info', "hola")
        onAccept && onAccept(value)
    }
    const renderOptions = () => data.map((optionSelect, index) => {
        return <Select.Option key={index} value={optionSelect?.value || ''}>
            {optionSelect.label}
        </Select.Option>
    })
    return (
        <div>
            <Select
                showSearch
                value={value?.value || null}
                placeholder={placeholder}
                style={{
                    width: 240,
                }}
                // defaultActiveFirstOption={false}
                // showArrow={false}
                filterOption={false}
                onSearch={(value)=> onSearch(value, setData)}
                onChange={handleChange}
            >
                {renderOptions()}
            </Select>
            <Button icon={<PlusOutlined />} type={"primary"} onClick={addAction}>{acceptText}</Button>
        </div>
    );
};
