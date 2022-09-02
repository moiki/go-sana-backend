import Lottie from "react-lottie";
import loadingJSON from "../../assets/JSON/cargando.json";
import GlobalContext, {useAuth} from "../../store/context.store.jsx";
import {useContext, useEffect} from "react";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingJSON,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

export  default function LoadingScreen (props) {
    const {state} = useContext(GlobalContext);
    useEffect(() => {
        console.log(state)
       if (state.user) {
           console.log("reading changes",state.user)
           props?.verifyOff()
       }
    }, [state.user]);

    return <div className={"d-flex justify-content-center align-items-center"} style={{height:"100vh"}}>
        <div className={""}>
            <Lottie options={defaultOptions} height={300} width={300} />
        </div>
    </div>
}