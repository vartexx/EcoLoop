import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in EcoLoop component:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div 
          className="card" 
          style={{ 
            margin: "3rem auto", 
            maxWidth: "540px", 
            padding: "2.5rem", 
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
          }}
          role="alert"
          aria-live="assertive"
        >
          <h2 style={{ color: "var(--accent)", marginTop: 0, fontSize: "1.4rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--muted)", margin: "1.2rem 0 2rem", fontSize: "0.95rem", lineHeight: "1.6" }}>
            The platform encountered an unexpected error. Your saved history is preserved in your browser.
          </p>
          <button
            className="btn"
            onClick={this.handleReload}
            style={{ padding: "0.7rem 1.5rem" }}
          >
            Reload EcoLoop
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
