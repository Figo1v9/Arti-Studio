import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertTriangle, Mail, ChevronRight, Scale, Gavel, Copyright, CheckCircle, Clock, Send, ExternalLink } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function DMCAPage() {
    const lastUpdated = '2026-01-11';

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

    const dmcaSteps = [
        {
            step: '01',
            title: 'Identify the Content',
            description: 'Identify the copyrighted work that you believe has been infringed. Provide URLs of the specific pages containing the allegedly infringing content.'
        },
        {
            step: '02',
            title: 'Provide Your Information',
            description: 'Include your full legal name, mailing address, telephone number, and email address for contact purposes.'
        },
        {
            step: '03',
            title: 'Submit Statement',
            description: 'Include a statement that you have a good faith belief that the use of the material is not authorized by the copyright owner.'
        },
        {
            step: '04',
            title: 'Sign Under Penalty of Perjury',
            description: 'Include a statement that the information in your notice is accurate and that you are the copyright owner or authorized to act on behalf of the owner.'
        }
    ];

    const noticeRequirements = [
        'A physical or electronic signature of the copyright owner or authorized representative',
        'Identification of the copyrighted work claimed to have been infringed',
        'Identification of the material that is claimed to be infringing with sufficient detail to locate it',
        'Your contact information (address, telephone number, and email address)',
        'A statement that you have a good faith belief that the use is not authorized',
        'A statement, under penalty of perjury, that the information is accurate and you are authorized to act'
    ];

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
            <Helmet>
                <title>DMCA Policy - Arti Studio</title>
                <meta name="description" content="Digital Millennium Copyright Act (DMCA) Policy for Arti Studio. Learn how to submit copyright infringement notices and counter-notices." />
                <link rel="canonical" href="https://artistudio.fun/dmca" />
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/30 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[100px]" />
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm mb-6"
                            >
                                <Copyright className="w-4 h-4" />
                                Copyright Protection
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                            >
                                DMCA
                                <span className="block bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                                    Policy
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-6"
                            >
                                We respect the intellectual property rights of others and expect our users to do the same.
                            </motion.p>

                            {/* Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-3"
                            >
                                <span className="px-4 py-2 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-sm font-medium">
                                    DMCA Compliant
                                </span>
                                <span className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-sm">
                                    Updated: {lastUpdated}
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Introduction Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-rose-400" />
                            About This Policy
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Arti Studio respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA). We respond to valid notices of alleged copyright infringement that comply with the DMCA and other applicable intellectual property laws.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on this site, you may notify our copyright agent as set forth in this policy. For your complaint to be valid under the DMCA, you must provide the following information.
                        </p>
                    </motion.div>

                    {/* Steps Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {dmcaSteps.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50"
                            >
                                <div className="text-5xl font-bold text-slate-800 absolute top-4 right-4">{item.step}</div>
                                <h3 className="text-lg font-bold mb-3 relative">{item.title}</h3>
                                <p className="text-slate-400 text-sm relative">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Requirements Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-400" />
                            DMCA Notice Requirements
                        </h2>
                        <p className="text-slate-400 mb-6">
                            To be effective, a notification of claimed infringement must include the following:
                        </p>
                        <div className="space-y-3">
                            {noticeRequirements.map((req, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300 text-sm">{req}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Counter Notice Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Scale className="w-6 h-6 text-amber-400" />
                            Counter-Notice Procedure
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the content, you may send a counter-notice.
                        </p>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            A counter-notice must include:
                        </p>
                        <ul className="space-y-2 text-slate-400 text-sm mb-6">
                            <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                                Your physical or electronic signature
                            </li>
                            <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                                Identification of the content that was removed and its location before removal
                            </li>
                            <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                                A statement under penalty of perjury that you have a good faith belief the content was removed by mistake
                            </li>
                            <li className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                                Your name, address, telephone number, and consent to jurisdiction
                            </li>
                        </ul>
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-300 font-medium">Important Notice</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/30 via-red-600/30 to-orange-600/30 rounded-3xl blur-2xl" />
                        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-rose-900/50 to-red-900/50 border border-rose-500/20 backdrop-blur-sm overflow-hidden text-center">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-red-500/20 rounded-full blur-3xl" />

                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <Gavel className="w-16 h-16 text-rose-400" />
                                </motion.div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Submit a DMCA Notice</h2>
                                <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                                    Send your DMCA takedown requests to our designated copyright agent. We typically respond within 24-48 hours.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="mailto:dmca@artistudio.fun"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/20"
                                    >
                                        <Mail className="w-5 h-5" />
                                        dmca@artistudio.fun
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
                                { label: 'Privacy Policy', href: '/privacy' },
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
