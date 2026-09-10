import {useEffect, useState} from "react";
import {useAuthorizedApi} from "../../../services/auth/rest.js";
import utilsServices from "../../../services/utils.services.js";


export default function useGetInventoryTables(url) {
    const paramsInitialState = {
        perPage: 10,
        page: 1,
        filter: ""
    }
    const [tableParams, setTableParams] = useState(paramsInitialState);

    const [table, setTable] = useState({
        total: 0,
        docs: [],
    });
    const { loading, data, executeService } = useAuthorizedApi({
        url: `${url}?per_page=${tableParams.perPage}&page=${tableParams.page}&filter=${tableParams.filter}`,
        onError: (err) => {
            console.log(err);
        },
    });

    const  onChangePage = (page) => setTableParams({...tableParams, page})

    const onSearch = element => {
        // console.log(element)
        setTableParams({...tableParams, filter: element})
    }

    const reloadTable = () => {
       const paramsHaveChanged = utilsServices.checkObjectEquality(tableParams, paramsInitialState)
        if (paramsHaveChanged) {
            setTableParams(paramsInitialState)
        } else {
            executeService()
        }
    }

    useEffect(() => {
        if (data?.data) {
            const newState = data?.data?.shift();
            setTable({ ...newState });
        }
    }, [data]);

    useEffect(() => {
        executeService()
    }, [tableParams]);

    return {
        table,
        loading,
        onSearch,
        onChangePage,
        reloadTable
    }
}