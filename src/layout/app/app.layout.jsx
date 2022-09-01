import GlobalContext, {useAuth} from "../../store/context.store.jsx";
import {Navigate, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Sidenav from "../../components/sidenav/sidenav";
import {appRoutes} from "../../services/constants/routes.js";
import {useContext, useEffect, useState} from "react";
import {useAuthorizedApi} from "../../services/auth/rest.js";
import actionsStore from "../../store/actions.store.jsx";
import LoadingScreen from "../../components/loadings/loadingScreen";

const RequireAuth = ({children}) => {
    const {state} = useContext(GlobalContext);
    const location = useLocation();
    const hist = useNavigate();

    const LoadContent = () =>  appRoutes.map((routes, index) => {
        console.log(routes.layout)
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
    // useEffect(() => {
    //    if (state.user) {
    //        console.log("logged...")
    //    }
    // }, [state.user]);

    if (!state.user) {
        return (
            <Navigate
                to={{pathname: "/login"}}
                state={{from: location}}
                replace
            />
        );
    }

    return <>{LoadContent()}</>;
};

function AppLayoutContainer() {
    return <RequireAuth>
        <Navbar/>
        <Sidenav>
            <main className={"container-fluid"}>
                <Outlet/>
            </main>
        </Sidenav>

    </RequireAuth>
}

export default function AppLayout() {
    const {dispatch} = useContext(GlobalContext);
    const [loading, setLoading] = useState(true);
    const {data, error} = useAuthorizedApi({
        url: "/me",
        automatic: true
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

    if (loading===false) {
        return <AppLayoutContainer/>
    }
    return <LoadingScreen verifyOff={()=>setLoading(false)}/>
}