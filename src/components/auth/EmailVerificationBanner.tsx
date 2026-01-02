import { useState } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthContext';
import { resendVerificationEmail } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Email Verification Banner
 * Shows a persistent banner for users who haven't verified their email.
 * Provides option to resend verification email.
 */
export function EmailVerificationBanner() {
    const { user } = useAuth();
    const [dismissed, setDismissed] = useState(false);
    const [resending, setResending] = useState(false);

    // Don't show if:
    // - No user logged in
    // - Email is verified
    // - User dismissed the banner this session
    // - User logged in with Google (always verified)
    if (!user || user.emailVerified || dismissed) {
        return null;
    }

    // Check if user signed in with Google (providerData)
    const isGoogleUser = user.providerData?.some(
        (provider) => provider?.providerId === 'google.com'
    );
    if (isGoogleUser) {
        return null;
    }

    const handleResend = async () => {
        setResending(true);
        try {
            await resendVerificationEmail(user);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            if (firebaseError.code === 'auth/too-many-requests') {
                toast.error('Please wait a moment before requesting another email.');
            } else {
                toast.error('Failed to send verification email. Please try again.');
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-amber-200 font-medium truncate">
                                Please verify your email address
                            </p>
                            <p className="text-xs text-amber-400/70 hidden sm:block">
                                Check your inbox for the verification link to unlock all features
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
                                resending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", resending && "animate-spin")} />
                            <span className="hidden sm:inline">
                                {resending ? 'Sending...' : 'Resend Email'}
                            </span>
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-1.5 rounded-lg text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/20 transition-colors"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
