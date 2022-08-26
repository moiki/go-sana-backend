import {useAuth} from "../../store/context.store.jsx";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Sidenav from "../../components/sidenav/sidenav";

const RequireAuth = ({children}) => {
    const {user} = useAuth();
    const location = useLocation();

    if (user) {
        return (
            <Navigate
                to={{pathname: "/login"}}
                state={{from: location}}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default function AppLayout() {
    return <RequireAuth>
        <Navbar />
        <Sidenav/>
        <main className={"container-fluid"}>
            <Outlet/>
        </main>
    </RequireAuth>
}