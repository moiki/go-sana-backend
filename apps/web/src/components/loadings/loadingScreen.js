import Lottie from "react-lottie";
import loadingJSON from "../../assets/JSON/cargando.json";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingJSON,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

export default function LoadingScreen() {
    return <div className={"d-flex justify-content-center align-items-center"} style={{height: "100vh", background: "white"}}>
        <div className={""}>
            <Lottie options={defaultOptions} height={300} width={300}/>
        </div>
    </div>
}