export const DEFAULT_VIEW_ADMIN = '/admin';
export const DEFAULT_VIEW_LOG = '/login';

export const logout = history => {
    history.push(DEFAULT_VIEW_LOG)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
}

export const login = (token, refreshToken, history) => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    history.push(DEFAULT_VIEW_ADMIN)
}
