import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {queryKeys, useTableQuery} from "../../../services/query/api";

const paramsInitialState = {
    perPage: 10,
    page: 1,
    filter: "",
};

export default function useGetInventoryTables(url) {
    const [tableParams, setTableParams] = useState(paramsInitialState);
    const queryClient = useQueryClient();
    const {data, isLoading} = useTableQuery(url, tableParams);

    const table = data ?? {total: 0, docs: []};

    const onChangePage = (page) => setTableParams((prev) => ({...prev, page}));

    const onSearch = (filter) => setTableParams((prev) => ({...prev, filter, page: 1}));

    const reloadTable = () => queryClient.invalidateQueries({queryKey: queryKeys.table(url)});

    return {
        table,
        loading: isLoading,
        onSearch,
        onChangePage,
        reloadTable,
    };
}