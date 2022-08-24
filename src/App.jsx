import { useState } from 'react'
import reactLogo from './assets/react.svg'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from "./components/navbar/navbar";
import Login from "./components/forms/login/login.jsx";
import Signup from "./components/forms/signup/signup";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
        <Navbar />
        <div className={"container"}>
        <Signup />
      </div>
    </div>
  )
}

export default App
