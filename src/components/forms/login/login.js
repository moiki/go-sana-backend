import React from "react";
import {useForm} from "react-hook-form";
import './login.css'
import {useFreeApi, setAccessToken} from "../../../services/auth/rest.js";
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
                setAccessToken(data.token);
                navigate("/admin")
            },
        }
    )
    const onSubmit = async (data) => {
        await executeService({
            email: data.email,
            password: data.password,
            remember_me: data.remember_me || false,
        })
    };


    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Iniciar Sesion</h3>
                    {error && <b className={"text-danger"}>
                        "Hubo un error al iniciar sesion."</b>}
                    <div className="form-group mt-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control mt-1"
                            placeholder="Escriba su correo electronico"
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
                        <label>Contrasena</label>
                        <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Escriba su contrasena"
                            {...register("password", {required: true})}
                        />
                        <small>
                            <b className={"text-danger"}>
                                {errors.password?.type === 'required' && "La contrasena es requerida."}
                            </b>
                        </small>
                    </div>
                    <div className="form-group mt-3">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="remember_me"
                                {...register("remember_me")}
                            />
                            <label className="form-check-label" htmlFor="remember_me">
                                Recordarme
                            </label>
                        </div>
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
                        <a href="#">Has olvidado tu contrasena?</a>
                    </p>
                </div>
            </form>
        </div>
    )
}
