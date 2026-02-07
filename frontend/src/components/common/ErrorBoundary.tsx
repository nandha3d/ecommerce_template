import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-neutral-600 mb-8">
                            We're sorry, but an unexpected error occurred. Please try reloading the page.
                        </p>

                        <div className="bg-red-50 p-4 rounded-lg mb-8 text-left overflow-auto max-h-40">
                            <code className="text-xs text-red-800 font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>

                        <Button
                            onClick={this.handleReset}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
