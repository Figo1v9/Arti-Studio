import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertTriangle, Scale, Gavel, Copyright, ChevronRight, Shield, Ban, Sparkles, CreditCard, Users, Globe, MessageSquare, Zap, Award, Flag } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function TermsOfServicePage() {
    const lastUpdated = '2026-01-02';

    const sections = [
        {
            icon: CheckCircle,
            title: 'Acceptance of Terms',
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20',
            content: 'By accessing or using Arti Studio, you agree to be bound by these Terms.',
            highlights: [
                { icon: Users, text: 'Must be 13+ years old' },
                { icon: Globe, text: 'Applies to all visitors' },
                { icon: CheckCircle, text: 'Binding agreement' }
            ]
        },
        {
            icon: Sparkles,
            title: 'Description of Service',
            gradient: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20',
            content: 'Arti Studio is an AI-powered creative platform for discovering and sharing AI art.',
            highlights: [
                { icon: Zap, text: 'Browse & discover AI art' },
                { icon: Award, text: 'Upload & share content' },
                { icon: Users, text: 'Join creator community' },
                { icon: CreditCard, text: 'Premium subscriptions' }
            ]
        },
        {
            icon: Copyright,
            title: 'Intellectual Property',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20',
            content: 'You retain all rights to your uploaded content with platform license.',
            highlights: [
                { icon: Shield, text: 'You own your content' },
                { icon: Globe, text: 'Non-exclusive license' },
                { icon: Copyright, text: 'Trademarks protected' },
                { icon: Gavel, text: 'AI content responsibility' }
            ]
        },
        {
            icon: Ban,
            title: 'Prohibited Content',
            gradient: 'from-rose-500 to-red-500',
            shadowColor: 'shadow-rose-500/20',
            content: 'The following content is strictly prohibited on Arti Studio:',
            list: [
                { icon: XCircle, text: 'Illegal content' },
                { icon: XCircle, text: 'Copyright infringement' },
                { icon: XCircle, text: 'Explicit sexual content' },
                { icon: XCircle, text: 'Violence or gore' },
                { icon: XCircle, text: 'Hate speech' },
                { icon: XCircle, text: 'Malware' }
            ]
        },
        {
            icon: Flag,
            title: 'Content Moderation',
            gradient: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/20',
            content: 'We actively moderate content and respect intellectual property rights.',
            highlights: [
                { icon: Shield, text: 'Active moderation' },
                { icon: Flag, text: 'Report system' },
                { icon: MessageSquare, text: 'DMCA takedowns' },
                { icon: Globe, text: 'dmca@artistudio.fun' }
            ]
        },
        {
            icon: AlertTriangle,
            title: 'Limitation of Liability',
            gradient: 'from-yellow-500 to-amber-500',
            shadowColor: 'shadow-yellow-500/20',
            content: 'Service provided "as is" without warranties.',
            highlights: [
                { icon: Shield, text: 'No warranties' },
                { icon: CreditCard, text: 'Limited liability' },
                { icon: Globe, text: 'Third-party disclaimer' },
                { icon: AlertTriangle, text: 'Use at own risk' }
            ]
        },
        {
            icon: Gavel,
            title: 'Dispute Resolution',
            gradient: 'from-indigo-500 to-blue-500',
            shadowColor: 'shadow-indigo-500/20',
            content: 'Disputes resolved through binding arbitration.',
            highlights: [
                { icon: Scale, text: 'Binding arbitration' },
                { icon: Users, text: 'Individual basis' },
                { icon: Globe, text: 'Governing law' },
                { icon: Gavel, text: 'Class action waiver' }
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
            <Helmet>
                <title>Terms of Service - Arti Studio</title>
                <meta name="description" content="Terms of Service for Arti Studio. Read our terms and conditions for using the platform." />
                <link rel="canonical" href="https://artistudio.fun/terms" />
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[100px]" />
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6"
                            >
                                <FileText className="w-4 h-4" />
                                Legal Agreement
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                            >
                                Terms of
                                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Service
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-6"
                            >
                                Please read these terms carefully before using Arti Studio.
                            </motion.p>

                            {/* Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-sm font-medium">
                                    Legally Binding
                                </span>
                                <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-sm font-medium">
                                    Updated Regularly
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
                            const isProhibited = section.title === 'Prohibited Content';
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
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg ${section.shadowColor}`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h2 className="text-lg font-bold">{section.title}</h2>
                                        </div>

                                        {/* Content */}
                                        <p className="text-slate-400 text-sm mb-4">{section.content}</p>

                                        {/* Highlights or List */}
                                        <div className={`grid ${isProhibited ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
                                            {section.highlights && section.highlights.map((item, i) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30"
                                                    >
                                                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${section.gradient} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                                            <ItemIcon className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-xs text-slate-300">{item.text}</span>
                                                    </div>
                                                );
                                            })}

                                            {section.list && section.list.map((item, i) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10"
                                                    >
                                                        <ItemIcon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                                        <span className="text-xs text-slate-300">{item.text}</span>
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

                {/* CTA Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-teal-600/30 rounded-3xl blur-2xl" />
                        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/20 backdrop-blur-sm overflow-hidden text-center">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />

                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <CheckCircle className="w-16 h-16 text-blue-400" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Start Creating?</h2>
                                <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                                    By using Arti Studio, you acknowledge that you have read and agree to these Terms.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/explore"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/20"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        I Agree - Explore Gallery
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl font-semibold transition-all border border-slate-700"
                                    >
                                        Questions? Contact Us
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
                                { label: 'Privacy Policy', href: '/privacy' },
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
