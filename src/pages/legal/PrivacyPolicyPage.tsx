import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Server, Mail, Globe, Cookie, UserCheck, Database, Fingerprint, Bell, ChevronRight, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function PrivacyPolicyPage() {
    const lastUpdated = '2026-01-02';

    const sections = [
        {
            icon: Eye,
            title: 'Information We Collect',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20',
            items: [
                { icon: UserCheck, text: 'Account Information', desc: 'Name, email, username, password' },
                { icon: Fingerprint, text: 'Profile Information', desc: 'Avatar, bio, social links' },
                { icon: Database, text: 'Content', desc: 'Images, prompts, collections you upload' },
                { icon: Mail, text: 'Communications', desc: 'Messages with us or other users' },
                { icon: Lock, text: 'Payment Info', desc: 'Securely processed, never stored' }
            ]
        },
        {
            icon: Server,
            title: 'How We Use Your Information',
            gradient: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20',
            items: [
                { icon: CheckCircle2, text: 'Provide & improve services' },
                { icon: CheckCircle2, text: 'Process transactions securely' },
                { icon: CheckCircle2, text: 'Send important updates & alerts' },
                { icon: CheckCircle2, text: 'Respond to support requests' },
                { icon: CheckCircle2, text: 'Personalize your experience' },
                { icon: CheckCircle2, text: 'Detect & prevent fraud' }
            ]
        },
        {
            icon: Globe,
            title: 'Information Sharing',
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20',
            items: [
                { icon: UserCheck, text: 'With Your Consent', desc: 'Only when you explicitly agree' },
                { icon: Server, text: 'Service Providers', desc: 'Trusted vendors who assist us' },
                { icon: Shield, text: 'Legal Requirements', desc: 'When required by law' },
                { icon: Database, text: 'Aggregated Data', desc: 'Non-identifiable analytics only' }
            ]
        },
        {
            icon: Lock,
            title: 'Data Security',
            gradient: 'from-rose-500 to-pink-500',
            shadowColor: 'shadow-rose-500/20',
            items: [
                { icon: Lock, text: 'TLS 1.3 Encryption', desc: 'All data encrypted in transit' },
                { icon: Fingerprint, text: 'Access Controls', desc: 'Strict authentication protocols' },
                { icon: Shield, text: 'Regular Audits', desc: 'Periodic security assessments' },
                { icon: Server, text: 'Enterprise Infrastructure', desc: 'Supabase & Cloudflare powered' },
                { icon: Bell, text: '24/7 Monitoring', desc: 'Real-time incident response' }
            ]
        },
        {
            icon: Shield,
            title: 'Your Rights (GDPR & CCPA)',
            gradient: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/20',
            items: [
                { icon: Eye, text: 'Access', desc: 'Request a copy of your data' },
                { icon: CheckCircle2, text: 'Rectification', desc: 'Correct inaccurate data' },
                { icon: Database, text: 'Erasure', desc: 'Right to be forgotten' },
                { icon: ExternalLink, text: 'Portability', desc: 'Export your data' },
                { icon: Lock, text: 'Restriction', desc: 'Limit processing' },
                { icon: Bell, text: 'Withdraw Consent', desc: 'Anytime, for any reason' }
            ]
        },
        {
            icon: Cookie,
            title: 'Cookies & Tracking',
            gradient: 'from-indigo-500 to-blue-500',
            shadowColor: 'shadow-indigo-500/20',
            items: [
                { icon: Shield, text: 'Essential Cookies', desc: 'Required for core functionality' },
                { icon: Database, text: 'Analytics Cookies', desc: 'Help us improve the site' },
                { icon: UserCheck, text: 'Preference Cookies', desc: 'Remember your settings' },
                { icon: Bell, text: 'Marketing Cookies', desc: 'Personalized ads (optional)' }
            ]
        }
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
                <title>Privacy Policy - Arti Studio</title>
                <meta name="description" content="Privacy Policy for Arti Studio. Learn how we collect, use, and protect your personal information." />
                <link rel="canonical" href="https://artistudio.fun/privacy" />
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6"
                            >
                                <Shield className="w-4 h-4" />
                                Your Privacy Matters
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                            >
                                Privacy
                                <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    Policy
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-6"
                            >
                                We're committed to protecting your privacy and ensuring the security of your personal information.
                            </motion.p>

                            {/* Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                <span className="px-4 py-2 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 text-sm font-medium">
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

                {/* Content Sections */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 group-hover:border-slate-700/50 transition-all h-full">
                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg ${section.shadowColor}`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold">{section.title}</h2>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-3">
                                            {section.items.map((item, i) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.gradient} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                                            <ItemIcon className="w-4 h-4 text-white/80" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white text-sm">{item.text}</p>
                                                            {item.desc && (
                                                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Contact CTA */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-fuchsia-600/30 rounded-3xl blur-2xl" />
                        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/20 backdrop-blur-sm overflow-hidden text-center">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <Shield className="w-16 h-16 text-violet-400" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Questions About Your Privacy?</h2>
                                <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                                    Contact our Data Protection Officer anytime. We're here to help.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="mailto:privacy@artistudio.fun"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/20"
                                    >
                                        <Mail className="w-5 h-5" />
                                        privacy@artistudio.fun
                                    </a>
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl font-semibold transition-all border border-slate-700"
                                    >
                                        Contact Form
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
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
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'About Us', href: '/about' },
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
