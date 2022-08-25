import {useAuth} from "../../store/context.store.jsx";

export default function Navbar() {
    const {user} = useAuth();
    // return <nav className="navbar navbar-expand-lg sticky-top">
    //     <div className="container-fluid">
    //         <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
    //                 data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false"
    //                 aria-label="Toggle navigation">
    //             <span className="navbar-toggler-icon"></span>
    //         </button>
    //         <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
    //             <a className="navbar-brand" href="#">Hidden brand</a>
    //             <ul className="navbar-nav me-auto mb-2 mb-lg-0">
    //                 <li className="nav-item">
    //                     <a className="nav-link active" aria-current="page" href="#">Home</a>
    //                 </li>
    //                 <li className="nav-item">
    //                     <a className="nav-link" href="#">Link</a>
    //                 </li>
    //                 <li className="nav-item">
    //                     <a className="nav-link disabled">Disabled</a>
    //                 </li>
    //             </ul>
    //             <form className="d-flex" role="search">
    //                 <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
    //                 <button className="btn btn-outline-success" type="submit">Search</button>
    //             </form>
    //         </div>
    //     </div>
    // </nav>
    return <nav className="sb-topnav navbar navbar-expand navbar-light bg-light">
        <a className="navbar-brand ps-3" href="#"><b style={{fontWeight:800}}>Sana System</b></a>
        <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0"><i className="fas fa-bars"></i></button>
        <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
            <div className="input-group">
                <input className="form-control" type="text" placeholder="Search for..." aria-label="Search for..." aria-describedby="btnNavbarSearch"/>
                <button className="btn btn-primary" id="btnNavbarSearch" type="button"><i className="fas fa-search"></i>
                </button>
            </div>
        </form>
        <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button"
                   data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw"></i></a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><a className="dropdown-item" href="#!">Settings</a></li>
                    <li><a className="dropdown-item" href="#!">Activity Log</a></li>
                    <li>
                        <hr className="dropdown-divider"/>
                    </li>
                    <li><a className="dropdown-item" href="#!">Logout</a></li>
                </ul>
            </li>
        </ul>
    </nav>
}