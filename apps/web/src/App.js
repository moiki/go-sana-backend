import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import './App.css';
import "antd/dist/antd.css"
import "./assets/styles/main.styles.css";
import "./assets/styles/responsive.styles.css";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "./layout/auth/auth.layout";
import Login from "./layout/auth/Login.auth.js";
import Signup from "./components/forms/signup/signup";
import AppLayout, {LoadContent} from "./layout/app/app.layout";
import ErrorBoundary from "./components/errors/ErrorBoundary";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
    },
});

function App() {
  return (
      <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
      </ErrorBoundary>

  )
}

export default App