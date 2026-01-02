import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';
import { useAuth } from '@/components/auth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle, ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RegisterPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/explore', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Password strength validation
    const passwordChecks = {
        length: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    };

    const isPasswordValid = passwordChecks.length && passwordChecks.hasLetter;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signUpWithEmail(email, password, fullName);
            setRegistrationSuccess(true);
            toast.success('Account created! Check your email to verify.');
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            const errorMessages: Record<string, string> = {
                'auth/email-already-in-use': 'An account with this email already exists',
                'auth/invalid-email': 'Invalid email address',
                'auth/weak-password': 'Password is too weak. Use at least 6 characters',
                'auth/operation-not-allowed': 'Email/password registration is disabled'
            };
            toast.error(errorMessages[firebaseError.code || ''] || firebaseError.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome!');
            navigate('/explore');
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            if (firebaseError.code !== 'auth/popup-closed-by-user') {
                toast.error(firebaseError.message || 'Failed to sign up with Google');
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    // Success state after registration
    if (registrationSuccess) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle="We've sent you a verification link"
                variant="register"
            >
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                        <CheckCircle className="w-10 h-10 text-teal-400" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                        Verification Email Sent!
                    </h3>

                    <p className="text-slate-400 mb-6">
                        We've sent a verification link to<br />
                        <span className="text-teal-400 font-medium">{email}</span>
                    </p>

                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">
                            Click the link in the email to verify your account, then come back to sign in.
                        </p>

                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25"
                        >
                            Go to Sign In
                        </Button>

                        <button
                            type="button"
                            onClick={() => setRegistrationSuccess(false)}
                            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                        >
                            Didn't receive email? Try again
                        </button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Join our community of creators"
            variant="register"
        >
            <div className="space-y-6">
                {/* Google Sign Up */}
                <Button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading}
                    className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-medium flex items-center justify-center gap-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
                >
                    {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-4 bg-slate-900/30 text-slate-500 font-medium tracking-wider">
                            or register with email
                        </span>
                    </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="register-fullName" className="text-slate-300 text-sm font-medium">
                            Full name
                        </Label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                            <Input
                                id="register-fullName"
                                name="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-slate-300 text-sm font-medium">
                            Email address
                        </Label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                            <Input
                                id="register-email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-slate-300 text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                            <Input
                                id="register-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                className="pl-12 pr-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password strength indicators */}
                        <AnimatePresence>
                            {password.length > 0 && (
                                <motion.div
                                    className="flex flex-wrap gap-2 pt-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <PasswordCheck passed={passwordChecks.length} label="6+ characters" />
                                    <PasswordCheck passed={passwordChecks.hasLetter} label="Has letter" />
                                    <PasswordCheck passed={passwordChecks.hasNumber} label="Has number" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword" className="text-slate-300 text-sm font-medium">
                            Confirm password
                        </Label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                            <Input
                                id="register-confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className={`pl-12 pr-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500/50' : ''
                                    }`}
                                required
                                autoComplete="new-password"
                            />
                            {confirmPassword.length > 0 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {passwordsMatch ? (
                                        <Check className="w-5 h-5 text-teal-400" />
                                    ) : (
                                        <X className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Login Link */}
                <p className="text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

// Helper component for password validation checks
function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors ${passed ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-500'
            }`}>
            {passed ? (
                <Check className="w-3 h-3" />
            ) : (
                <div className="w-3 h-3 rounded-full border border-current" />
            )}
            {label}
        </div>
    );
}
