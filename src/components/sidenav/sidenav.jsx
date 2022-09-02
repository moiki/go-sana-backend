import "./sidenav.css"
import {Link} from "react-router-dom";
import {useAuth} from "../../store/context.store.jsx";

const adminLinks = [
    {
        name: "Inventario",
        path: "inventatio",
        layout: "admin",
        enabled: true
    },
    {
        name: "Ventas",
        path: "ventas",
        layout: "admin",
        enabled: false
    }
]


export default function Sidenav({children}) {
    const {state} = useAuth()
    const loadLinks = () => adminLinks.map((item, index) => {
        return <Link className="nav-link" to={`/${item.layout}/${item.path}`}>
            <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
            {item.name}
        </Link>
    })
    return <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav">
                        <div className="sb-sidenav-menu-heading">Core</div>
                        <Link className="nav-link" to={"/admin"}>
                            <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
                            Inicio
                        </Link>
                        <div className="sb-sidenav-menu-heading">Módulos</div>
                        {loadLinks()}
                    </div>
                </div>
                <div className="sb-sidenav-footer">
                    <div className="small">Conectado como:</div>
                    <i className="fa-solid fa-circle text-success"></i>
                    {` ${state.user?.first_name} ${state.user?.last_name}`}
                </div>
            </nav>
        </div>
        <div id="layoutSidenav_content">
            {children}
            <footer className="py-4 bg-light mt-auto">
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between small">
                        <div className="text-muted">Copyright &copy; Your Website 2022</div>
                        <div>
                            <a href="#">Privacy Policy</a>
                            &middot;
                            <a href="#">Terms &amp; Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
}