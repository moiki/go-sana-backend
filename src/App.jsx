import {useContext, useMemo, useReducer, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {BrowserRouter} from "react-router-dom";
import Signup from "./components/forms/signup/signup";
import GlobalContext, {initialState} from "./store/context.store.jsx";
import reducer from "./store/reducer.store.jsx";

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [userState, setUserState] = useState({
        fullName: null,
        email: null,
        role: [],
        profession: null,
        phoneNumber: null,
    });

    return (
        <GlobalContext.Provider value={{
            state: state,
            dispatch: dispatch,
            user: userState,
            setUser: (data) => {
                setUserState({ ...userState, ...data });
            },
        }}>
            <div className="App">
                <BrowserRouter>
                    <div className={"container"}>
                        <Signup/>
                    </div>
                </BrowserRouter>
            </div>
        </GlobalContext.Provider>

    )
}

export default App
