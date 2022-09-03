import React, {useContext, useEffect, useState} from "react";
import GlobalContext, {useAuth} from "../../store/context.store.jsx";
import {Navigate, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Sidenav from "../../components/sidenav/sidenav";
import {appRoutes} from "../../services/constants/routes.js";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import actionsStore from "../../store/actions.store.jsx";
import LoadingScreen from "../../components/loadings/loadingScreen";
import MainLayout from "./Main.layout";

export const LoadContent = () => appRoutes.map((routes, index) => {
    console.log(routes.layout, index)
    if (routes.layout === "admin") {
        if (routes.isIndex) {
            return <Route index element={React.createElement(routes.component)} exact/>
        }
        return (
            <Route
                key={index}
                path={`${routes.path}`}
                component={React.createElement(routes.component)}
                exact
            />
        );
    }
})

const RequireAuth = ({children}) => {
    const {state} = useContext(GlobalContext);
    const location = useLocation();

    if (!state.user) {
        return (
            <Navigate
                to={{pathname: "/login"}}
                state={{from: location}}
                replace
            />
        );
    }

    return <>{children}</>
};



export default function AppLayout() {
    const {dispatch} = useContext(GlobalContext);
    const [loading, setLoading] = useState(true);
    const hist = useNavigate()
    const {data, error} = useAuthorizedApi({
        url: "/me",
        automatic: true,
        onError: () => {
            hist("/login")
        }
    });

    useEffect(() => {
        if (data) {
            dispatch({
                type: actionsStore.SET_LOGGED_USER,
                payload: data
            })
        }
        if (error) {
            console.log("error is: ", error)
            dispatch({
                type: actionsStore.SET_INITIAL_STATE,
            })
            setLoading(false)
        }
        // console.log(user)

    }, [data, loading]);

    if (loading === false) {
        return <RequireAuth>
                <MainLayout className={"container-fluid"}>
                    <Outlet/>
                </MainLayout>
        </RequireAuth>
    }
    return <LoadingScreen verifyOff={() => setLoading(false)}/>
}