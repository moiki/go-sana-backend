import React, {createContext, useContext} from 'react'

export const initialState = {
    user: null,
    dispatch: ()=> {}
}

const GlobalContext = createContext(initialState)

export const useAuth = () => useContext(GlobalContext);
export default GlobalContext