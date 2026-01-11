import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, Eye, Settings, CheckCircle, Clock, Database, ChevronRight, Globe, Trash2 } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function CookiePolicyPage() {
    const lastUpdated = '2026-01-11';

    const cookieTypes = [
        {
            icon: Shield,
            title: 'Essential Cookies',
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20',
            description: 'These cookies are strictly necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as logging in or filling in forms.',
            examples: ['Session cookies', 'Authentication tokens', 'Security cookies', 'Load balancing'],
            retention: 'Session or up to 1 year'
        },
        {
            icon: Eye,
            title: 'Analytics Cookies',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20',
            description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our site.',
            examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis', 'Performance metrics'],
            retention: 'Up to 2 years'
        },
        {
            icon: Settings,
            title: 'Functional Cookies',
            gradient: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20',
            description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
            examples: ['Language preferences', 'Theme settings (Dark/Light mode)', 'User preferences', 'Remembered choices'],
            retention: 'Up to 1 year'
        },
        {
            icon: Globe,
            title: 'Advertising Cookies',
            gradient: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/20',
            description: 'These cookies are used to deliver relevant advertisements and to track ad campaign performance. They may be set by our advertising partners.',
            examples: ['Google AdSense', 'Personalized ads', 'Ad frequency capping', 'Conversion tracking'],
            retention: 'Up to 2 years'
        }
    ];

    const thirdPartyServices = [
        { name: 'Google AdSense', purpose: 'Advertising', link: 'https://policies.google.com/technologies/ads' },
        { name: 'Google Analytics', purpose: 'Analytics', link: 'https://policies.google.com/privacy' },
        { name: 'Supabase', purpose: 'Authentication & Database', link: 'https://supabase.com/privacy' },
        { name: 'Firebase', purpose: 'Push Notifications', link: 'https://firebase.google.com/support/privacy' },
        { name: 'Cloudflare', purpose: 'CDN & Security', link: 'https://www.cloudflare.com/privacypolicy/' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
            <Helmet>
                <title>Cookie Policy - Arti Studio</title>
                <meta name="description" content="Cookie Policy for Arti Studio. Learn how we use cookies and similar tracking technologies on our platform." />
                <link rel="canonical" href="https://artistudio.fun/cookies" />
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-orange-600/15 rounded-full blur-[100px]" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16">
                        {/* Back Button */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-8 group text-sm"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Link>
                        </motion.div>

                        {/* Hero Content */}
                        <div className="text-center max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-6"
                            >
                                <Cookie className="w-4 h-4" />
                                Cookie Notice
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                            >
                                Cookie
                                <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                    Policy
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-6"
                            >
                                We believe in transparency. This policy explains how we use cookies and similar technologies.
                            </motion.p>

                            {/* Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-sm font-medium">
                                    GDPR Compliant
                                </span>
                                <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-sm font-medium">
                                    CCPA Compliant
                                </span>
                                <span className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-sm">
                                    Updated: {lastUpdated}
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* What Are Cookies Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Cookie className="w-6 h-6 text-amber-400" />
                            What Are Cookies?
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful information about how their site is being used.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            On Arti Studio, we use cookies and similar technologies (such as local storage and pixels) to remember your preferences, keep you logged in, understand how you use our platform, and deliver relevant advertisements.
                        </p>
                    </motion.div>

                    {/* Cookie Types Grid */}
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {cookieTypes.map((cookie, index) => {
                            const Icon = cookie.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${cookie.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 group-hover:border-slate-700/50 transition-all h-full">
                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cookie.gradient} flex items-center justify-center shadow-lg ${cookie.shadowColor}`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{cookie.title}</h2>
                                                <div className="flex items-center gap-1 text-sm text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {cookie.retention}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-slate-400 text-sm mb-4">{cookie.description}</p>

                                        {/* Examples */}
                                        <div className="space-y-2">
                                            {cookie.examples.map((example, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                    {example}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Third Party Services */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Database className="w-6 h-6 text-blue-400" />
                            Third-Party Services
                        </h2>
                        <p className="text-slate-400 mb-6">
                            We use the following third-party services that may set cookies or collect data:
                        </p>
                        <div className="space-y-3">
                            {thirdPartyServices.map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                    <div>
                                        <h4 className="font-semibold text-white">{service.name}</h4>
                                        <p className="text-slate-400 text-sm">{service.purpose}</p>
                                    </div>
                                    <a
                                        href={service.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1"
                                    >
                                        Privacy Policy <ChevronRight className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Managing Cookies Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-orange-600/30 to-red-600/30 rounded-3xl blur-2xl" />
                        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-500/20 backdrop-blur-sm overflow-hidden">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />

                            <div className="relative text-center">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <Trash2 className="w-16 h-16 text-amber-400" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Managing Your Cookie Preferences</h2>
                                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                                    Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse cookies or delete certain cookies. Generally, you can also manage similar technologies in the same way that you manage cookies using your browser's preferences.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        <h4 className="font-bold mb-2">Browser Settings</h4>
                                        <p className="text-slate-400 text-sm">Access your browser's settings to manage cookie preferences, clear browsing data, or block third-party cookies.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        <h4 className="font-bold mb-2">Opt-Out Links</h4>
                                        <p className="text-slate-400 text-sm">Visit <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">optout.aboutads.info</a> to opt out of interest-based advertising.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 pt-8 border-t border-slate-800/50"
                    >
                        <p className="text-slate-500 text-sm mb-4">Related pages</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'Contact', href: '/contact' }
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="group px-5 py-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
                                >
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{link.label}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
