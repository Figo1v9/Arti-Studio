import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { sendPasswordReset } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordReset(email.trim());
            setSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('Password reset error:', error);

            // Handle specific Firebase errors
            if (firebaseError.code === 'auth/user-not-found') {
                toast.error('No account found with this email');
            } else if (firebaseError.code === 'auth/invalid-email') {
                toast.error('Please enter a valid email address');
            } else if (firebaseError.code === 'auth/too-many-requests') {
                toast.error('Too many requests. Please try again later.');
            } else {
                toast.error('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Success state
    if (sent) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle="We've sent you a password reset link"
                variant="forgot"
            >
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                        <CheckCircle2 className="w-10 h-10 text-violet-400" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                        Email Sent Successfully!
                    </h3>

                    <p className="text-slate-400 mb-6">
                        We've sent password reset instructions to<br />
                        <span className="text-violet-400 font-medium">{email}</span>
                    </p>

                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">
                            Click the link in the email to reset your password.
                            Don't forget to check your spam folder.
                        </p>

                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25"
                        >
                            Back to Sign In
                        </Button>

                        <button
                            type="button"
                            onClick={() => setSent(false)}
                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            Didn't receive it? Try again
                        </button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries, we'll send you reset instructions"
            variant="forgot"
        >
            <div className="space-y-6">
                {/* Back to login link */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to sign in
                </Link>

                {/* Reset Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-slate-300 text-sm font-medium">
                            Email address
                        </Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                            <Input
                                id="reset-email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                disabled={loading}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Enter the email associated with your account and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Send reset link
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>

                {/* Alternative options */}
                <div className="pt-4 border-t border-slate-800">
                    <p className="text-center text-slate-400 text-sm">
                        Remember your password?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                        >
                            Sign in
                        </button>
                    </p>
                    <p className="text-center text-slate-500 text-sm mt-2">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}

export default ForgotPasswordPage;
