import React, { createContext } from 'react'

export const initialState = {
    userNavbarMini: false,
    user: null,
    viewTitle: 'Home',
}

const GlobalContext = createContext(initialState)
export default GlobalContext