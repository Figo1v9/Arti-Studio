import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Clock, Send, CheckCircle, Loader2, ChevronRight, HelpCircle, Headphones, Building, Zap, Shield, Users, Star, Phone, MapPin, Globe } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
        toast.success('Message sent successfully!');
    };

    const contactMethods = [
        {
            icon: Headphones,
            title: 'Support',
            description: 'Get help with your account',
            contact: 'support@artistudio.fun',
            link: 'mailto:support@artistudio.fun',
            gradient: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/20'
        },
        {
            icon: Building,
            title: 'Business',
            description: 'Partnerships & enterprise',
            contact: 'business@artistudio.fun',
            link: 'mailto:business@artistudio.fun',
            gradient: 'from-violet-500 to-purple-500',
            shadowColor: 'shadow-violet-500/20'
        },
        {
            icon: Clock,
            title: 'Response Time',
            description: 'We typically respond within',
            contact: '24-48 hours',
            link: null,
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20'
        }
    ];

    const features = [
        { icon: Zap, text: 'Lightning fast responses' },
        { icon: Shield, text: 'Secure & confidential' },
        { icon: Users, text: 'Dedicated support team' },
        { icon: Globe, text: 'Global 24/7 availability' }
    ];

    const faqs = [
        {
            question: 'How do I reset my password?',
            answer: 'Visit the login page and click "Forgot Password" to receive a reset link via email. The link expires in 24 hours for security.'
        },
        {
            question: 'Can I use Arti Studio commercially?',
            answer: 'Yes! With a Pro subscription, you get full commercial usage rights for all your generated content. Perfect for businesses and creators.'
        },
        {
            question: 'How do I report inappropriate content?',
            answer: 'Click the report button on any image or use this contact form with "Content Report" as the subject. Our moderation team reviews all reports within 24 hours.'
        },
        {
            question: 'Do you offer API access?',
            answer: 'Yes, we offer comprehensive API access for enterprise customers. Contact business@artistudio.fun for pricing and documentation.'
        },
        {
            question: 'What AI models do you support?',
            answer: 'We support prompts and content from all major AI platforms including Midjourney, DALL-E, Stable Diffusion, and more.'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
            <Helmet>
                <title>Contact Us - Arti Studio</title>
                <meta name="description" content="Get in touch with the Arti Studio team. We're here to help with any questions, feedback, or support needs." />
                <link rel="canonical" href="https://artistudio.fun/contact" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        "name": "Contact Arti Studio",
                        "url": "https://artistudio.fun/contact"
                    })}
                </script>
            </Helmet>

            <LandingHeader />

            <div className="min-h-full">
                {/* Hero Section */}
                <div className="relative overflow-hidden pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-slate-950 to-slate-950" />
                        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-teal-600/15 rounded-full blur-[100px]" />
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-6"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Get in Touch
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                            >
                                We'd Love to
                                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    Hear from You
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto"
                            >
                                Have a question, feedback, or just want to say hello? Our team is here to help.
                            </motion.p>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-4 mt-8"
                            >
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800/50">
                                            <Icon className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm text-slate-300">{feature.text}</span>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Contact Methods */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        className="grid sm:grid-cols-3 gap-5"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {contactMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                    <div className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 group-hover:border-slate-700/50 transition-all h-full">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 shadow-lg ${method.shadowColor}`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">{method.title}</h3>
                                        <p className="text-slate-400 text-sm mb-3">{method.description}</p>
                                        {method.link ? (
                                            <a
                                                href={method.link}
                                                className={`font-medium bg-gradient-to-r ${method.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                                            >
                                                {method.contact}
                                            </a>
                                        ) : (
                                            <span className="font-bold text-white">{method.contact}</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold">Send a Message</h2>
                            </div>

                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-8 sm:p-10 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.2 }}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30"
                                        >
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                        <p className="text-slate-300 mb-6">
                                            Thank you for reaching out. We'll get back to you within 24-48 hours.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setFormData({ name: '', email: '', subject: '', message: '' });
                                            }}
                                            className="border-emerald-500/30 hover:bg-emerald-500/10"
                                        >
                                            Send Another Message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Name <span className="text-rose-400">*</span>
                                                </label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Your name"
                                                    className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 h-12 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Email <span className="text-rose-400">*</span>
                                                </label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="your@email.com"
                                                    className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                                                Subject
                                            </label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="What's this about?"
                                                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 h-12 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                                                Message <span className="text-rose-400">*</span>
                                            </label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Tell us what's on your mind..."
                                                rows={5}
                                                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500 resize-none rounded-xl min-h-[140px]"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 text-lg rounded-xl font-semibold shadow-lg shadow-emerald-500/25"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* FAQs */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <HelpCircle className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold">FAQs</h2>
                            </div>

                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-2xl bg-slate-900/50 border border-slate-800/50 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors"
                                        >
                                            <span className="font-semibold pr-4">{faq.question}</span>
                                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expandedFaq === index ? 'rotate-90' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedFaq === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Extra Help */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Still have questions?</h3>
                                        <p className="text-slate-400 text-sm mb-3">
                                            Our support team is always happy to help you out!
                                        </p>
                                        <Link
                                            to="/explore"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Explore Platform
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-16 pt-8 border-t border-slate-800/50"
                    >
                        <p className="text-slate-500 text-sm mb-4">Related pages</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'About Us', href: '/about' }
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
