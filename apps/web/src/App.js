import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConfigProvider} from "antd";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import "dayjs/locale/es";
import './App.css';
import "./assets/styles/main.styles.css";
import "./assets/styles/responsive.styles.css";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "./layout/auth/auth.layout";
import Login from "./layout/auth/Login.auth.js";
import Signup from "./components/forms/signup/signup";
import AppLayout, {LoadContent} from "./layout/app/app.layout";
import ErrorBoundary from "./components/errors/ErrorBoundary";

dayjs.locale("es");

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
        <ConfigProvider
            locale={esES}
            theme={{
                token: {
                    colorPrimary: "#0F766E",
                    borderRadius: 8,
                    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif",
                },
            }}
        >
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
        </ConfigProvider>
      </QueryClientProvider>
      </ErrorBoundary>

  )
}

export default App