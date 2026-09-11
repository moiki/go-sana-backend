import {useMutation, useQuery, useQueryClient, keepPreviousData} from "@tanstack/react-query";
import {CustomAxios, loginRequest} from "../auth/rest";
import {createSale} from "../sales/sales.services";

export const queryKeys = {
    me: ['me'],
    collections: ['collections'],
    dashboard: ['dashboard'],
    table: (url: string) => ['table', url] as const,
};

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const request = async (url: string, {method = 'get' as HttpMethod, body = {} as any} = {}) => {
    const res = await CustomAxios(url, body, method);
    if (res.error) {
        const msg = res.error.payload || res.error.message || 'Ocurrió un error';
        throw new Error(msg);
    }
    return res;
};

// --- Queries ---

interface TableParams {
    perPage?: number;
    page?: number;
    filter?: string;
}

const fetchTable = async (url: string, params: TableParams = {}) => {
    const {perPage = 10, page = 1, filter = ''} = params;
    const qs = `per_page=${perPage}&page=${page}&filter=${encodeURIComponent(filter)}`;
    const res = await request(`${url}?${qs}`);
    const facets = Array.isArray(res.data?.data) ? res.data.data : [];
    const first = facets[0] || {};
    return {total: first.total ?? 0, docs: first.docs ?? []};
};

export function useTableQuery(url: string, params: TableParams = {}) {
    return useQuery({
        queryKey: [...queryKeys.table(url), params],
        queryFn: () => fetchTable(url, params),
        placeholderData: keepPreviousData,
    });
}

interface Collections {
    providers: any[];
    presentations: any[];
    laboratories: any[];
}

const fetchCollections = async (): Promise<Collections> => {
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

export function useDashboardQuery() {
    return useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: () => request('/sales/dashboard').then(res => res.data?.data),
    });
}

// --- Mutations ---

interface MutationOptions {
    onSuccess?: (...args: any[]) => void;
    onError?: (err: Error) => void;
}

export function useLoginMutation() {
    return useMutation({
        mutationFn: ({email, password, rememberMe}: {email: string; password: string; rememberMe: boolean}) =>
            loginRequest(email, password, rememberMe),
    });
}

export function useCreateMutation(url: string, options: MutationOptions = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => request(url, {method: 'post', body}),
        onSuccess: (...args: any[]) => {
            queryClient.invalidateQueries({queryKey: queryKeys.collections});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}

export function useCreateProductMutation(options: MutationOptions = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: any) => request('/inventory/create', {method: 'post', body}),
        onSuccess: (...args: any[]) => {
            queryClient.invalidateQueries({queryKey: queryKeys.collections});
            queryClient.invalidateQueries({queryKey: queryKeys.table('/inventory/products-table')});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}

export function useCreateSaleMutation(options: MutationOptions = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => createSale(payload),
        onSuccess: (...args: any[]) => {
            queryClient.invalidateQueries({queryKey: queryKeys.table('/sales/sales-table')});
            options.onSuccess?.(...args);
        },
        onError: options.onError,
    });
}