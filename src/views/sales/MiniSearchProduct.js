import React, { useState } from 'react';
import { Select } from 'antd';
import {debounce} from "lodash";

import openNotificationWithIcon from "../../components/alerts/notifications";

export const SearchInput = ({placeholder, onSearch, value, setValue}) => {
    const [data, setData] = useState([]);
    // const [value, setValue] = useState();
    const handleSearch = debounce((newValue) => {
        if (newValue) {
           onSearch && onSearch(newValue)
                .then(data => {
                    console.log(data)
                    setData(data.map((productElement) => ({
                        value: productElement.product_code,
                        label: productElement.name,
                    })))
                })
                .catch(err => openNotificationWithIcon("error", "Ups!", err))
        } else {
            setData([]);
        }
    },300);
    const handleChange = (newValue) => {
        console.log(newValue, "TT")
        setValue(newValue);
    };
    return (
        <Select
            showSearch
            value={value}
            placeholder={placeholder}
            style={{
                width: 200,
            }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={data.map((productElement) => ({
                value: productElement.product_code,
                label: productElement.name,
            }))}
        />
    );
};