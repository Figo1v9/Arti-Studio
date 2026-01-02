import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Zap, Globe, Heart, Target, Lightbulb, Rocket, ChevronRight, Star, Shield, Award, TrendingUp, Palette, Camera, Code, Building, Crown } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function AboutPage() {
    const stats = [
        { label: 'Active Creators', value: '10K+', icon: Users, gradient: 'from-violet-500 to-purple-500' },
        { label: 'AI Artworks', value: '500K+', icon: Palette, gradient: 'from-blue-500 to-cyan-500' },
        { label: 'Countries', value: '150+', icon: Globe, gradient: 'from-emerald-500 to-teal-500' },
        { label: 'Daily Uploads', value: '5K+', icon: TrendingUp, gradient: 'from-rose-500 to-pink-500' }
    ];

    const values = [
        {
            icon: Lightbulb,
            title: 'Innovation First',
            description: 'Pushing the boundaries of AI creativity, constantly exploring new ways to empower artists.',
            gradient: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/20'
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Built by and for creators. Every feature designed with our community\'s needs in mind.',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20'
        },
        {
            icon: Heart,
            title: 'Passion for Art',
            description: 'AI amplifies human creativity, not replaces it. Art is at the heart of everything we do.',
            gradient: 'from-rose-500 to-pink-500',
            shadowColor: 'shadow-rose-500/20'
        },
        {
            icon: Globe,
            title: 'Global Accessibility',
            description: 'Creative tools available to everyone, everywhere. Building for a global audience.',
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20'
        }
    ];

    const features = [
        { icon: Camera, title: 'AI Photography', desc: 'Stunning photorealistic generations' },
        { icon: Palette, title: 'Digital Art', desc: 'Beautiful illustrations & paintings' },
        { icon: Code, title: 'Prompt Engineering', desc: 'Learn from the best prompts' },
        { icon: Building, title: 'Architecture', desc: 'Revolutionary design concepts' },
        { icon: Crown, title: 'Fashion', desc: 'Cutting-edge style creations' },
        { icon: Star, title: 'Trending', desc: 'Discover what\'s hot right now' }
    ];

    const team = {
        name: 'Mohamed Khedr',
        role: 'Founder & CEO',
        bio: 'Visionary technologist passionate about the intersection of AI and creativity. Building the future of digital art.',
        avatar: '/arti_studio_icon.png'
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
            <Helmet>
                <title>About Us - Arti Studio</title>
                <meta name="description" content="Learn about Arti Studio, the AI-powered creative platform. Our mission, values, and the team behind the vision." />
                <link rel="canonical" href="https://artistudio.fun/about" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Arti Studio",
                        "url": "https://artistudio.fun",
                        "logo": "https://artistudio.fun/arti_studio_icon.png",
                        "description": "AI-powered creative platform for discovering and sharing AI-generated art.",
                        "foundingDate": "2025"
                    })}
                </script>
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute top-20 right-1/3 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
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
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8"
                            >
                                <Sparkles className="w-4 h-4" />
                                About Arti Studio
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
                            >
                                <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                                    Empowering
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-violet-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                                    Creativity
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto"
                            >
                                Arti Studio is the world's leading platform for AI-generated art discovery, sharing, and inspiration.
                                We're building the future of creative expression.
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="relative border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="relative group text-center"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                        <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 group-hover:border-slate-700/50 transition-all">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                                {stat.value}
                                            </div>
                                            <div className="text-slate-400 mt-1 text-sm">{stat.label}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-sm mb-6 border border-rose-500/20">
                                <Target className="w-4 h-4" />
                                Our Mission
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                                Democratizing
                                <span className="block bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                                    AI Creativity
                                </span>
                            </h2>
                            <p className="text-lg text-slate-300 leading-relaxed mb-6">
                                We believe that AI-powered creativity should be accessible to everyone. Our mission is to build
                                a platform where artists, designers, and creators can discover inspiration, learn new techniques,
                                and share their work with a global community.
                            </p>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Whether you're a professional designer looking for inspiration or someone just starting their
                                creative journey, Arti Studio provides the tools and community to help you succeed.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Feature Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                                                <Icon className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                                            <p className="text-xs text-slate-400">{feature.desc}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Decorative */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-rose-500/20 rounded-full blur-3xl" />
                        </motion.div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="relative bg-slate-900/30 border-y border-slate-800/50">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent" />

                    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12 sm:mb-16"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm mb-4 border border-blue-500/20">
                                <Zap className="w-4 h-4" />
                                Our Values
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold">What We Stand For</h2>
                        </motion.div>

                        <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ y: -8 }}
                                        className="group relative"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                        <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 group-hover:border-slate-700/50 transition-all h-full">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 shadow-lg ${value.shadowColor}`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">{value.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Meet the Founder</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            The visionary behind Arti Studio's mission to democratize AI creativity.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-md mx-auto"
                    >
                        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 backdrop-blur-sm text-center">
                            {/* Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-rose-500/10 rounded-3xl blur-xl" />

                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-1 mx-auto mb-5 shadow-2xl shadow-violet-500/30">
                                    <img
                                        src={team.avatar}
                                        alt={team.name}
                                        className="w-full h-full rounded-full object-cover bg-slate-900"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{team.name}</h3>
                                <p className="text-violet-400 font-medium mb-4">{team.role}</p>
                                <p className="text-slate-400 leading-relaxed">{team.bio}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CTA Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-purple-600/30 to-rose-600/30 rounded-3xl blur-2xl" />
                        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/20 backdrop-blur-sm overflow-hidden text-center">
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl" />

                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="inline-block mb-6"
                                >
                                    <Rocket className="w-16 h-16 text-violet-400" />
                                </motion.div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Ready to Create?</h2>
                                <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">
                                    Join thousands of creators bringing their imagination to life with AI.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to="/login?signup=true"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/20 text-lg"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="/explore"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl font-semibold transition-all border border-slate-700 text-lg"
                                    >
                                        Explore Gallery
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
