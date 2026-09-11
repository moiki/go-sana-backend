import React, {useEffect} from "react";
import {Navigate, Outlet, Route, Routes, useLocation} from "react-router-dom";
import {appRoutes} from "../../services/constants/routes.js";
import {useMeQuery} from "../../services/query/api";
import {useAuthStore} from "../../store/useAuthStore";
import LoadingScreen from "../../components/loadings/loadingScreen";
import MainLayout from "./Main.layout";

export const LoadContent = () => appRoutes.map((routes, index) => {
    if (routes.layout === "admin") {
        if (routes.isIndex) {
            return <Route key={index} index element={React.createElement(routes.component)} exact/>
        }
        return (
            <Route
                key={index}
                path={`${routes.path}`}
                element={React.createElement(routes.component)}
                exact
            />
        );
    }
})

const RequireAuth = ({children}) => {
    const user = useAuthStore((state) => state.user);
    const location = useLocation();

    if (!user) {
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
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);
    const {data: me, isLoading, isError} = useMeQuery();

    useEffect(() => {
        if (me) {
            setUser(me);
        }
    }, [me, setUser]);

    useEffect(() => {
        if (isError) {
            clearUser();
        }
    }, [isError, clearUser]);

    if (isLoading) {
        return <LoadingScreen/>
    }
    return <RequireAuth>
        <MainLayout className={"container-fluid"}>
            <Outlet/>
        </MainLayout>
    </RequireAuth>
}