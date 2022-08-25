import React, {createContext, useContext} from 'react'

export const initialState = {
    state: {
        userNavbarMini: false,
        user: null,
        viewTitle: 'Home',
    }
}

const GlobalContext = createContext(initialState)

export const useAuth = () => useContext(GlobalContext);
export default GlobalContext