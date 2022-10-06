import {useReducer} from "react";
import './App.css';
import "antd/dist/antd.css"
import "./assets/styles/main.styles.css";
import "./assets/styles/responsive.styles.css";
import GlobalContext, {initialState} from "./store/context.store";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "./layout/auth/auth.layout";
import Login from "./layout/auth/Login.auth.js";
import Signup from "./components/forms/signup/signup";
import AppLayout, {LoadContent} from "./layout/app/app.layout";
import reducer from "./store/reducer.store.js";

function init(state) {
  return state
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
      <GlobalContext.Provider value={{
        state: state,
        dispatch: dispatch,
      }}>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<Login/>}/>
            <Route element={<AuthLayout/>}>
              <Route path="signup" element={<Signup/>}/>
            </Route>
            <Route path={"admin"} element={<AppLayout/>}>
              {LoadContent()}
            </Route>
            <Route
                path="*"
                element={<Navigate to="/admin" replace />}
            />
          </Routes>
        </BrowserRouter>
      </GlobalContext.Provider>

  )
}

export default App