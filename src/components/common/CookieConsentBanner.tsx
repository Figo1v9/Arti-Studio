import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, ChevronRight, Settings, Check, X, Sparkles, Lock, BarChart3, Target, Palette, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CONSENT_STORAGE_KEY = 'arti_cookie_consent';
const CONSENT_VERSION = '1.0';

interface ConsentPreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    version: string;
    timestamp: number;
}

// Premium Toggle Switch with Liquid Animation
function PremiumToggle({
    checked,
    onChange,
    disabled = false,
    id
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id: string;
}) {
    return (
        <motion.button
            id={id}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full p-1",
                "transition-all duration-500 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
                checked
                    ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-violet-500/30"
                    : "bg-slate-700/80 hover:bg-slate-600/80",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {/* Track glow effect */}
            {checked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-lg"
                />
            )}

            {/* Thumb */}
            <motion.span
                layout
                initial={false}
                animate={{
                    x: checked ? 24 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
                className={cn(
                    "relative flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg",
                    "ring-0 transition-all duration-300",
                    checked && "shadow-violet-500/20"
                )}
            >
                {/* Inner icon */}
                <AnimatePresence mode="wait">
                    {checked ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Check className="h-3.5 w-3.5 text-violet-600" strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="x"
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.span>
        </motion.button>
    );
}

// Premium Cookie Category Card
function CookieCategory({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
    required = false,
    gradient,
    delay = 0
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    checked: boolean;
    onChange?: (checked: boolean) => void;
    required?: boolean;
    gradient: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.01 }}
            className={cn(
                "group relative p-4 rounded-2xl cursor-pointer",
                "transition-all duration-300 ease-out",
                "bg-white/[0.02]",
                "border border-white/[0.05]",
                "hover:bg-white/[0.05] hover:border-white/[0.1]",
                checked && !required && "bg-violet-500/[0.08] border-violet-500/30",
                "overflow-hidden"
            )}
            onClick={() => !required && onChange?.(!checked)}
        >
            {/* Hover glow */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-r from-transparent via-white/[0.02] to-transparent"
            )} />

            {/* Active glow ring */}
            {checked && !required && (
                <motion.div
                    layoutId={`glow-${title}`}
                    className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 opacity-60 blur-sm"
                />
            )}

            <div className="relative flex items-center gap-4">
                {/* Icon Container */}
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                        "bg-gradient-to-br shadow-lg",
                        gradient,
                        checked && !required && "shadow-lg"
                    )}
                    style={{
                        boxShadow: checked && !required ? `0 8px 24px -4px var(--shadow-color, rgba(139, 92, 246, 0.3))` : undefined
                    }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-white text-sm tracking-tight">{title}</h4>
                        {required && (
                            <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                Always On
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400/90 leading-relaxed">{description}</p>
                </div>

                {/* Toggle / Status */}
                <div className="flex-shrink-0">
                    {required ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                    ) : (
                        <PremiumToggle
                            id={`cookie-toggle-${title.toLowerCase()}`}
                            checked={checked}
                            onChange={onChange || (() => { })}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Floating Particles Background
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-violet-400/30"
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: '100%',
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                        y: '-10%',
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 4,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
}

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [preferences, setPreferences] = useState<ConsentPreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        version: CONSENT_VERSION,
        timestamp: Date.now()
    });

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ConsentPreferences;
                if (parsed.version !== CONSENT_VERSION) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                    applyPreferences(parsed);
                }
            } catch {
                setIsVisible(true);
            }
        } else {
            setTimeout(() => setIsVisible(true), 800);
        }
    }, []);

    const applyPreferences = (prefs: ConsentPreferences) => {
        if (prefs.analytics) console.log('✅ Analytics enabled');
        if (prefs.marketing) console.log('✅ Marketing enabled');
        if (prefs.preferences) console.log('✅ Preferences enabled');
    };

    const closeWithAnimation = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
        }, 500);
    }, []);

    const saveConsent = useCallback((prefs: ConsentPreferences) => {
        const updatedPrefs = { ...prefs, timestamp: Date.now() };
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedPrefs));
        applyPreferences(updatedPrefs);
        closeWithAnimation();
    }, [closeWithAnimation]);

    const handleAcceptAll = () => {
        saveConsent({
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
            version: CONSENT_VERSION,
            timestamp: Date.now()
        });
    };

    const handleRejectAll = () => {
        saveConsent({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
            version: CONSENT_VERSION,
            timestamp: Date.now()
        });
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const cookieCategories = [
        {
            icon: Shield,
            title: 'Essential',
            description: 'Required for the website to function properly.',
            key: 'necessary' as const,
            required: true,
            gradient: 'from-emerald-500 to-teal-600'
        },
        {
            icon: BarChart3,
            title: 'Analytics',
            description: 'Help us understand how visitors use our site.',
            key: 'analytics' as const,
            required: false,
            gradient: 'from-blue-500 to-cyan-600'
        },
        {
            icon: Target,
            title: 'Marketing',
            description: 'Enable personalized advertisements.',
            key: 'marketing' as const,
            required: false,
            gradient: 'from-rose-500 to-pink-600'
        },
        {
            icon: Palette,
            title: 'Preferences',
            description: 'Remember your settings and personalization.',
            key: 'preferences' as const,
            required: false,
            gradient: 'from-amber-500 to-orange-600'
        }
    ];

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isClosing ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:p-6 pointer-events-none"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClosing ? 0 : 1 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
                    onClick={handleRejectAll}
                />

                {/* Main Card */}
                <motion.div
                    initial={{ y: 150, opacity: 0, scale: 0.9 }}
                    animate={{
                        y: isClosing ? 150 : 0,
                        opacity: isClosing ? 0 : 1,
                        scale: isClosing ? 0.9 : 1
                    }}
                    transition={{
                        type: "spring",
                        damping: 28,
                        stiffness: 350
                    }}
                    className={cn(
                        "relative w-full max-w-xl pointer-events-auto",
                        "rounded-[28px] overflow-hidden"
                    )}
                >
                    {/* Multi-layer glass background */}
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-transparent to-fuchsia-950/30" />

                    {/* Animated border gradient */}
                    <div className="absolute inset-0 rounded-[28px] p-[1px]">
                        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                    </div>

                    {/* Decorative orbs */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-violet-600/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-fuchsia-600/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl" />

                    {/* Floating particles */}
                    <FloatingParticles />

                    {/* Content */}
                    <div className="relative p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            {/* Cookie Icon with Animation */}
                            <motion.div
                                animate={{
                                    rotate: [0, -5, 5, 0],
                                    y: [0, -3, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative flex-shrink-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl blur-lg opacity-60" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/25">
                                    <Cookie className="w-7 h-7 text-white drop-shadow-sm" />
                                </div>
                            </motion.div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                        Cookie Preferences
                                    </h2>
                                    <motion.div
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    >
                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                    </motion.div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    We use cookies to enhance your browsing experience.{' '}
                                    <Link
                                        to="/privacy"
                                        className="text-violet-400 hover:text-violet-300 underline underline-offset-2 decoration-violet-400/30 hover:decoration-violet-300/50 transition-all"
                                    >
                                        Learn more
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Customize Panel */}
                        <AnimatePresence>
                            {showCustomize && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 mb-6 p-3 rounded-2xl bg-black/20 border border-white/[0.03]">
                                        {cookieCategories.map((category, index) => (
                                            <CookieCategory
                                                key={category.key}
                                                icon={category.icon}
                                                title={category.title}
                                                description={category.description}
                                                checked={preferences[category.key]}
                                                onChange={category.required ? undefined : (checked) =>
                                                    setPreferences(prev => ({ ...prev, [category.key]: checked }))
                                                }
                                                required={category.required}
                                                gradient={category.gradient}
                                                delay={index * 0.08}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Accept All - Primary CTA */}
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -12px rgba(139, 92, 246, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAcceptAll}
                                className={cn(
                                    "relative flex-1 group overflow-hidden",
                                    "px-6 py-4 rounded-2xl font-semibold text-white",
                                    "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600",
                                    "shadow-xl shadow-violet-500/20",
                                    "transition-all duration-300"
                                )}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />

                                <span className="relative flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" strokeWidth={2.5} />
                                    Accept All
                                </span>
                            </motion.button>

                            {/* Customize / Save */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => showCustomize ? handleSavePreferences() : setShowCustomize(true)}
                                className={cn(
                                    "flex-1 group",
                                    "px-6 py-4 rounded-2xl font-semibold",
                                    "bg-white/[0.05] hover:bg-white/[0.08]",
                                    "border border-white/10 hover:border-white/20",
                                    "text-white transition-all duration-300"
                                )}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {showCustomize ? (
                                        <>
                                            <Fingerprint className="w-5 h-5" />
                                            Save My Choices
                                        </>
                                    ) : (
                                        <>
                                            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                                            Customize
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>

                            {/* Reject Button */}
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRejectAll}
                                className={cn(
                                    "sm:px-5 py-4 rounded-2xl font-medium",
                                    "text-slate-400 hover:text-slate-200",
                                    "transition-all duration-300"
                                )}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <X className="w-4 h-4" />
                                    <span className="sm:hidden">Reject All</span>
                                    <span className="hidden sm:inline">Decline</span>
                                </span>
                            </motion.button>
                        </div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 pt-5 border-t border-white/[0.05]"
                        >
                            <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>GDPR Compliant</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Data Protected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-violet-400" />
                                    <span>Your Choice Matters</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for checking consent
export function useCookieConsent(type: 'analytics' | 'marketing' | 'preferences'): boolean {
    const [hasConsent, setHasConsent] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ConsentPreferences;
                setHasConsent(parsed[type]);
            } catch {
                setHasConsent(false);
            }
        }
    }, [type]);

    return hasConsent;
}
