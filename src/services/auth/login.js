import {setAccessToken, logoutRequest} from "./rest.js";

export const DEFAULT_VIEW_ADMIN = '/admin';
export const DEFAULT_VIEW_LOG = '/login';

export const logout = async (history) => {
    try {
        await logoutRequest();
    } catch {
        // Even if the API call fails, clear local state
    }
    history(DEFAULT_VIEW_LOG);
};

export const login = (token, history) => {
    setAccessToken(token);
    history.push(DEFAULT_VIEW_ADMIN);
};
