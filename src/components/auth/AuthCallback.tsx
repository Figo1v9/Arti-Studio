import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const checkAuth = async () => {
            // Give Firebase a moment to process the verification
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Reload the user to get updated emailVerified status
            if (auth.currentUser) {
                await auth.currentUser.reload();

                if (auth.currentUser.emailVerified) {
                    setStatus('success');
                    setTimeout(() => navigate('/explore'), 2000);
                } else {
                    setStatus('error');
                }
            } else {
                // No user logged in, check if this is email verification
                // After email verification, user needs to log in
                setStatus('success');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        checkAuth();
    }, [navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-4" />
                <p className="text-gray-400">Verifying your account...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950">
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                    <p className="text-gray-400 mb-4">Redirecting you to sign in...</p>
                    <Loader2 className="w-5 h-5 animate-spin text-violet-500 mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950">
            <div className="text-center max-w-sm">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-gray-400 mb-6">
                    The verification link may have expired or was already used.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium"
                    >
                        Go to Sign In
                    </Button>
                    <Button
                        onClick={() => navigate('/register')}
                        variant="outline"
                        className="w-full h-12 border-white/20 text-white hover:bg-white/10"
                    >
                        Create New Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
