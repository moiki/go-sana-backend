import React, {useEffect} from "react";
import {useForm} from "react-hook-form";
import './login.css'
import {useFreeApi} from "../../../services/auth/rest.js";
import {PulseLoader} from "react-spinners";
import {useNavigate} from "react-router-dom";

export default function Login(props) {
    const {register, handleSubmit, formState: {errors}} = useForm();
    let navigate = useNavigate();
    const {error, loading, executeService} = useFreeApi(
        '/login',
        "POST",
        {
            onSuccess: ({data}) => {
                localStorage.setItem("token", data.token);
                    navigate("/admin")
            },
        }
    )
    const onSubmit = async (data) => {
        await executeService({
            email: data.email,
            password: data.password
        })
    };


    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Iniciar Sesión</h3>
                    {error && <b className={"text-danger"}>
                        "Hubo un error al iniciar sesion."</b>}
                    <div className="form-group mt-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control mt-1"
                            placeholder="Escriba su correo electrónico"
                            {...register("email", {required: true, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i})}
                        />
                        <small>
                            <b className={"text-danger"}>
                                {errors.email?.type === 'pattern' && "Email incorrecto"}
                                {errors.email?.type === 'required' && "Email es requerido."}
                            </b>
                        </small>
                    </div>
                    <div className="form-group mt-3">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Escriba su contraseña"
                            {...register("password", {required: true})}
                        />
                        <small>
                            <b className={"text-danger"}>
                                {errors.password?.type === 'required' && "La contraseña es requerida."}
                            </b>
                        </small>
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                            {
                                loading === true ?
                                <PulseLoader color={"white"} loading/>
                                    : "Entrar"
                            }
                        </button>
                    </div>
                    <p className="forgot-password text-right mt-2">
                        <a href="#">¿Has olvidado tu contraseña?</a>
                    </p>
                </div>
            </form>
        </div>
    )
}