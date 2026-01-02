import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface RateLimitBannerProps {
    retryAfterSeconds?: number;
    onRetry?: () => void;
    message?: string;
}

/**
 * Rate Limit Banner Component
 * Shows when user has exceeded rate limits with countdown timer
 */
export function RateLimitBanner({
    retryAfterSeconds = 60,
    onRetry,
    message = "You're doing that too fast. Please wait a moment."
}: RateLimitBannerProps) {
    const [countdown, setCountdown] = useState(retryAfterSeconds);
    const [canRetry, setCanRetry] = useState(false);

    useEffect(() => {
        setCountdown(retryAfterSeconds);
        setCanRetry(false);
    }, [retryAfterSeconds]);

    useEffect(() => {
        if (countdown <= 0) {
            setCanRetry(true);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanRetry(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const handleRetry = useCallback(() => {
        if (canRetry && onRetry) {
            onRetry();
        }
    }, [canRetry, onRetry]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-amber-200 mb-1">
                        Slow down!
                    </h4>
                    <p className="text-xs text-amber-400/80 mb-3">
                        {message}
                    </p>

                    <div className="flex items-center gap-3">
                        {!canRetry ? (
                            <div className="flex items-center gap-2 text-xs text-amber-300">
                                <Clock className="w-4 h-4" />
                                <span>Retry in <strong>{formatTime(countdown)}</strong></span>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleRetry}
                                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Hook for handling rate limit state
 */
export function useRateLimit() {
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [retryAfter, setRetryAfter] = useState(60);

    const triggerRateLimit = useCallback((seconds: number = 60) => {
        setRetryAfter(seconds);
        setIsRateLimited(true);
    }, []);

    const clearRateLimit = useCallback(() => {
        setIsRateLimited(false);
    }, []);

    // Check for rate limit errors from API responses
    interface RateLimitError {
        status?: number;
        code?: string;
        headers?: { get?: (name: string) => string | null };
    }
    const handleApiError = useCallback((error: RateLimitError) => {
        if (error?.status === 429 || error?.code === 'RATE_LIMITED') {
            const retryAfterHeader = error?.headers?.get?.('retry-after');
            const seconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
            triggerRateLimit(seconds);
            return true;
        }
        return false;
    }, [triggerRateLimit]);

    return {
        isRateLimited,
        retryAfter,
        triggerRateLimit,
        clearRateLimit,
        handleApiError
    };
}
