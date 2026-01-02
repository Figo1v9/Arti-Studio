import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SecurityService } from '@/services/security.service';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (could also send to error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Report to Server (Async - Fire & Forget)
        SecurityService.logError(error, errorInfo);

        this.setState({ errorInfo });
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Something went wrong
                        </h2>

                        {/* Description */}
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We're sorry, but something unexpected happened.
                            Please try refreshing the page or go back to the home page.
                        </p>

                        {/* Error details (dev only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-left">
                                <p className="text-sm font-mono text-red-400 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                onClick={this.handleRetry}
                                variant="outline"
                                className="border-white/10 hover:bg-white/5"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Smaller inline error boundary for sections
 */
export function SectionErrorFallback({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="p-6 text-center bg-white/5 rounded-xl border border-white/10">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
                Failed to load this section
            </p>
            {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Retry
                </Button>
            )}
        </div>
    );
}
