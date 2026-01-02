import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles, Palette, Globe } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    /** Variant changes the accent theme while maintaining site-wide violet primary */
    variant?: 'login' | 'register' | 'forgot';
}

// Smooth spring configuration
const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

export function AuthLayout({ children, title, subtitle, variant = 'login' }: AuthLayoutProps) {
    const location = useLocation();

    // Memoize variant config to prevent unnecessary re-renders
    const config = useMemo(() => {
        const configs = {
            login: {
                accentGradient: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
                orb1: 'bg-violet-500/30',
                orb2: 'bg-purple-500/20',
                tagline: (<>Where creativity<br />meets innovation</>),
                // Abstract purple/violet art - creativity theme
                backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
            },
            register: {
                accentGradient: 'from-violet-500/20 via-teal-500/10 to-emerald-500/20',
                orb1: 'bg-violet-500/30',
                orb2: 'bg-teal-500/20',
                tagline: (<>Join our<br />creative community</>),
                // Colorful abstract art - community/creative theme
                backgroundImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&q=80',
            },
            forgot: {
                accentGradient: 'from-purple-500/20 via-violet-500/10 to-indigo-500/20',
                orb1: 'bg-purple-500/30',
                orb2: 'bg-indigo-500/20',
                tagline: (<>We'll help you<br />recover access</>),
                // Abstract art painting - artistic theme
                backgroundImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80',
            },
        };
        return configs[variant];
    }, [variant]);

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left Panel - Branding Side (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Base gradient matching site background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

                {/* Background Image from Unsplash */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 0.8 }}
                    key={`bg-${variant}`}
                >
                    <img
                        src={config.backgroundImage}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </motion.div>

                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-slate-950/50" />

                {/* Accent gradient overlay - smooth color transition */}
                <motion.div
                    className={cn("absolute inset-0 bg-gradient-to-tr", config.accentGradient)}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    key={variant}
                />

                {/* Grid pattern matching HeroSection */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '40px 40px',
                        backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)'
                    }}
                />

                {/* Radial mask for faded grid effect */}
                <div className="pointer-events-none absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

                {/* Animated orbs */}
                <motion.div
                    className={cn("absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-700", config.orb1)}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className={cn("absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-700", config.orb2)}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Violet radial gradient - matching HeroSection */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link to="/" className="block group">
                        <motion.img
                            src="/arti_studio.png"
                            alt="Arti Studio"
                            className="h-10 w-auto group-hover:opacity-80 transition-opacity"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        />
                    </Link>

                    {/* Center content - tagline with AnimatePresence */}
                    <div className="flex-1 flex flex-col justify-center max-w-md">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={variant}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={springTransition}
                            >
                                <h2
                                    className="text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 mb-4 leading-tight"
                                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                                >
                                    {config.tagline}
                                </h2>
                                <p className="text-lg text-slate-400 leading-relaxed font-light">
                                    Discover, create, and share stunning AI-generated artwork with a global community of artists and enthusiasts.
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Feature highlights */}
                        <div className="mt-12 space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                </div>
                                <span className="text-sm font-medium">AI-powered image generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                    <Palette className="w-4 h-4 text-teal-400" />
                                </div>
                                <span className="text-sm font-medium">Professional editing tools</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-sm font-medium">Global creative community</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Arti Studio. All rights reserved.
                    </div>
                </div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            </div>

            {/* Right Panel - Form Side */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Background for right panel */}
                <div className="absolute inset-0 bg-slate-950">
                    {/* Subtle grid on mobile too */}
                    <div
                        className="absolute inset-0 opacity-50 lg:opacity-30"
                        style={{
                            backgroundSize: '40px 40px',
                            backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)'
                        }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_70%)]" />

                    {/* Subtle violet glow on right side */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Mobile header (visible only on mobile) */}
                <div className="lg:hidden p-6 flex items-center justify-center relative z-10">
                    <Link to="/">
                        <img
                            src="/arti_studio.png"
                            alt="Arti Studio"
                            className="h-8 w-auto"
                        />
                    </Link>
                </div>

                {/* Form container */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
                    <div className="w-full max-w-[420px]">
                        {/* Form card with glass effect */}
                        <motion.div
                            className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 shadow-2xl shadow-black/20"
                            layout
                            transition={springTransition}
                        >
                            {/* Form header with AnimatePresence for smooth title changes */}
                            <div className="mb-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={location.pathname}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 mb-2">
                                            {title}
                                        </h1>
                                        {subtitle && (
                                            <p className="text-slate-400 text-base">
                                                {subtitle}
                                            </p>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Form content with AnimatePresence */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.25, delay: 0.05 }}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile footer */}
                <div className="lg:hidden p-6 text-center text-slate-500 text-xs relative z-10">
                    © {new Date().getFullYear()} Arti Studio. All rights reserved.
                </div>
            </div>
        </div>
    );
}
