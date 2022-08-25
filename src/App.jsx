import {useContext, useMemo, useReducer, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Signup from "./components/forms/signup/signup";
import GlobalContext, {initialState} from "./store/context.store.jsx";
import reducer from "./store/reducer.store.jsx";
import AuthLayout from "./layout/auth/auth.layout";
import Login from "./components/forms/login/login";
import {createBrowserHistory} from "history";
import AppLayout from "./layout/app/app.layout";
import HomeView from "./views/homeView";

export const hist = createBrowserHistory();

function init(state) {
    return state
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState, init);


    return (
        <GlobalContext.Provider value={{
            state: state,
            dispatch: dispatch,
        }}>
                <BrowserRouter>
                    <Routes>
                        <Route element={<AuthLayout/>}>
                            <Route path="login" element={<Login/>}/>
                            <Route path="signup" element={<Signup/>}/>
                        </Route>
                        <Route path={"admin"} element={<AppLayout/>}>
                            <Route index element={<HomeView/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
        </GlobalContext.Provider>

    )
}

export default App
