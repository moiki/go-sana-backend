import {useAuth} from "../../store/context.store.jsx";
import {Navigate, Outlet, Route, useLocation} from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Sidenav from "../../components/sidenav/sidenav";
import {appRoutes} from "../../services/constants/routes.js";
import {useEffect, useState} from "react";
import Lottie from "react-lottie";
import loadingJSON from "../../assets/JSON/cargando.json"
import {useAuthorizedApi} from "../../services/auth/rest.js";
import actionsStore from "../../store/actions.store.jsx";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingJSON,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const RequireAuth = ({children}) => {
    const {state, dispatch} = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const {data, error, loading: exLoading} = useAuthorizedApi({
        url: "/me",
        automatic: true
    });

    useEffect(() => {
       if (data) {
           dispatch({
               type: actionsStore.SET_LOGGED_USER,
               payload: data
           })
           setLoading(false)
       }
    }, [data]);


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

    return loading ?
        (<div className={"d-flex justify-content-center align-items-center"} style={{height:"100vh"}}>
        <div className={""}>
            <Lottie options={defaultOptions} height={300} width={300} />
        </div>
    </div>) : <>{LoadContent()}</>;
};

export default function AppLayout() {
    return <RequireAuth>
        <Navbar/>
        <Sidenav>
            <main className={"container-fluid"}>
                <Outlet/>
            </main>
        </Sidenav>

    </RequireAuth>
}