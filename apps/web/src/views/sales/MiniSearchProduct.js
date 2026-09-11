import React, {useState} from 'react';
import {Button, Select} from 'antd';
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
    return (
        <div>
            <Select
                showSearch
                value={value?.value || null}
                placeholder={placeholder}
                options={data.map((optionSelect, index) => ({
                    value: optionSelect?.value || '',
                    label: optionSelect.label,
                    key: index,
                }))}
                style={{
                    width: 240,
                }}
                // defaultActiveFirstOption={false}
                // showArrow={false}
                filterOption={false}
                onSearch={(value)=> onSearch(value, setData)}
                onChange={handleChange}
            />
            <Button icon={<PlusOutlined />} type={"primary"} onClick={addAction}>{acceptText}</Button>
        </div>
    );
};
