import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sparkles, Info, FileText, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on navigation
    const handleNavigation = (path: string) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    const navLinks = [
        { label: 'About', href: '/about', icon: Info },
        { label: 'Contact', href: '/contact', icon: Mail },
    ];

    const legalLinks = [
        { label: 'Privacy', href: '/privacy', icon: Shield },
        { label: 'Terms', href: '/terms', icon: FileText },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/30"
                        : "bg-slate-950/70 backdrop-blur-md border-b border-white/5"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.img
                                src="/arti_studio.png"
                                alt="Arti Studio"
                                className="h-7 sm:h-8 w-auto"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Divider */}
                            <div className="w-px h-5 bg-slate-700 mx-2" />

                            {legalLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/explore')}
                                className="text-slate-300 hover:text-white hover:bg-white/5"
                            >
                                Explore
                            </Button>
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5"
                            >
                                Sign In
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-slate-950 border-l border-slate-800 md:hidden"
                        >
                            <div className="flex flex-col h-full">
                                {/* Menu Header */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                                    <img
                                        src="/arti_studio.png"
                                        alt="Arti Studio"
                                        className="h-7 w-auto"
                                    />
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Menu Content */}
                                <div className="flex-1 overflow-y-auto py-4">
                                    {/* Main Links */}
                                    <div className="px-4 mb-6">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-2">Navigation</p>
                                        <div className="space-y-1">
                                            {navLinks.map((link, index) => {
                                                const Icon = link.icon;
                                                return (
                                                    <motion.div
                                                        key={link.href}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <Link
                                                            to={link.href}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-200 hover:bg-white/5 transition-colors"
                                                        >
                                                            <Icon className="w-5 h-5 text-slate-400" />
                                                            <span className="font-medium">{link.label}</span>
                                                            <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Legal Links */}
                                    <div className="px-4 mb-6">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-2">Legal</p>
                                        <div className="space-y-1">
                                            {legalLinks.map((link, index) => {
                                                const Icon = link.icon;
                                                return (
                                                    <motion.div
                                                        key={link.href}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: (navLinks.length + index) * 0.05 }}
                                                    >
                                                        <Link
                                                            to={link.href}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-300 hover:bg-white/5 transition-colors"
                                                        >
                                                            <Icon className="w-5 h-5 text-slate-500" />
                                                            <span>{link.label}</span>
                                                            <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Explore Link */}
                                    <div className="px-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Link
                                                to="/explore"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                <span className="font-medium">Explore Gallery</span>
                                                <ChevronRight className="w-4 h-4 text-violet-400 ml-auto" />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Menu Footer - CTA */}
                                <div className="p-4 border-t border-slate-800 space-y-3">
                                    <Button
                                        onClick={() => handleNavigation('/login')}
                                        variant="outline"
                                        className="w-full border-slate-700 hover:bg-white/5"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        onClick={() => handleNavigation('/login?signup=true')}
                                        className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                                    >
                                        Get Started Free
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
