import {useAuth} from "../../store/context.store.jsx";
import {Navigate, Outlet, Route, useLocation} from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Sidenav from "../../components/sidenav/sidenav";
import {appRoutes} from "../../services/constants/routes.js";
import {useState} from "react";

const RequireAuth = ({children}) => {
    const {state} = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const LoadContent = () => appRoutes.map((routes, index) => {
        if (routes.layout === "admin") {
            return (
                <Route
                    key={index}
                    path={`/admin/${routes.path}`}
                    component={routes.component}
                    exact
                />
            );
        }
    })
    if (state.user) {
        return (
            <Navigate
                to={{pathname: "/login"}}
                state={{from: location}}
                replace
            />
        );
    }

    return loading ? (<>{

    }</>): <>{LoadContent()}</>;
};

export default function AppLayout() {
    return <RequireAuth>
        <Navbar />
        <Sidenav>
            <main className={"container-fluid"}>
                <Outlet/>
            </main>
        </Sidenav>

    </RequireAuth>
}