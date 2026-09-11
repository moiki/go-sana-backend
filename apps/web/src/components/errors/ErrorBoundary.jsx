import React from "react";
import { Button, Result } from "antd";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0f2f5",
                        padding: "24px",
                    }}
                >
                    <Result
                        status="error"
                        title="Algo salio mal"
                        subTitle="Ocurrio un error inesperado. Puedes intentar recargar la pagina o volver al inicio."
                        extra={[
                            <Button
                                type="primary"
                                key="reload"
                                onClick={this.handleReload}
                                style={{ background: "#1890ff", borderColor: "#1890ff" }}
                            >
                                Recargar pagina
                            </Button>,
                            <Button
                                key="reset"
                                onClick={() => {
                                    this.handleReset();
                                    window.location.href = "/login";
                                }}
                            >
                                Volver al inicio
                            </Button>,
                        ]}
                    >
                        {this.state.error && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 16,
                                    background: "#fff1f0",
                                    borderRadius: 8,
                                    border: "1px solid #ffa39e",
                                    textAlign: "left",
                                }}
                            >
                                <details style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }}>
                                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#cf1322" }}>
                                        Detalles del error
                                    </summary>
                                    <p style={{ marginTop: 8, color: "#595959" }}>
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <p style={{ marginTop: 8, color: "#8c8c8c" }}>
                                            {this.state.errorInfo.componentStack}
                                        </p>
                                    )}
                                </details>
                            </div>
                        )}
                    </Result>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
