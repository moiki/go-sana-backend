import {useMutation, useQuery, useQueryClient, keepPreviousData} from "@tanstack/react-query";
import {CustomAxios, loginRequest} from "../auth/rest";
import {createSale} from "../sales/sales.services";

export const queryKeys = {
    me: ['me'],
    collections: ['collections'],
    table: (url) => ['table', url],
};

const request = async (url, {method = 'get', body = {}} = {}) => {
    const res = await CustomAxios(url, body, method);
    if (res.error) {
        const msg = res.error.payload || res.error.message || 'Ocurrió un error';
        throw new Error(msg);
    }
    return res;
};

// --- Queries ---

const fetchTable = async (url, params = {}) => {
    const {perPage = 10, page = 1, filter = ''} = params;
    const qs = `per_page=${perPage}&page=${page}&filter=${encodeURIComponent(filter)}`;
    const res = await request(`${url}?${qs}`);
    const facets = Array.isArray(res.data?.data) ? res.data.data : [];
    const first = facets[0] || {};
    return {total: first.total ?? 0, docs: first.docs ?? []};
};

export function useTableQuery(url, params = {}) {
    return useQuery({
        queryKey: [...queryKeys.table(url), params],
        queryFn: () => fetchTable(url, params),
        placeholderData: keepPreviousData,
    });
}

const fetchCollections = async () => {
    const [providers, presentations, laboratories] = await Promise.all(
        ['/inventory/providers', '/inventory/presentations', '/inventory/labs']
            .map(u => request(u))
    );
    return {
        providers: providers.data?.data ?? [],
        presentations: presentations.data?.data ?? [],
        laboratories: laboratories.data?.data ?? [],
    };
};

export function useCollectionsQuery() {
    return useQuery({
        queryKey: queryKeys.collections,
        queryFn: fetchCollections,
    });
}

export function useMeQuery() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: () => request('/me').then(res => res.data),
        retry: false,
    });
}

// --- Mutations ---

export function useLoginMutation() {
    return useMutation({
        mutationFn: ({email, password, rememberMe}) => loginRequest(email, password, rememberMe),
    });
}

export function useCreateMutation(url, options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => request(url, {method: 'post', body}),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({queryKey: queryKeys.collections});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}

export function useCreateProductMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => request('/inventory/create', {method: 'post', body}),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({queryKey: queryKeys.collections});
            queryClient.invalidateQueries({queryKey: queryKeys.table('/inventory/products-table')});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}

export function useCreateSaleMutation(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => createSale(payload),
        onSuccess: (...args) => {
            queryClient.invalidateQueries({queryKey: queryKeys.table('/sales/sales-table')});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}