
import { Sparkles, Twitter, Instagram, Github, Heart, Shield, FileText, Mail, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export function Footer() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const productLinks = [
        { label: 'Gallery', href: '/explore' },
        { label: 'Trending', href: '/trends' },
        { label: 'Search', href: '/search' },
        { label: 'Collections', href: '/explore' }
    ];

    const companyLinks = [
        { label: 'About Us', href: '/about', icon: Users },
        { label: 'Contact', href: '/contact', icon: Mail },
        { label: 'Blog', href: '#', icon: FileText }
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '/privacy', icon: Shield },
        { label: 'Terms of Service', href: '/terms', icon: FileText },
        { label: 'Cookie Policy', href: '/privacy#cookies', icon: FileText }
    ];

    const supportLinks = [
        { label: 'Help Center', href: '/contact', icon: HelpCircle },
        { label: 'Report Issue', href: '/contact', icon: Mail },
        { label: 'DMCA', href: '/terms#dmca', icon: Shield }
    ];

    return (
        <footer className="w-full bg-slate-950 text-white pt-20 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link to="/" className="inline-block">
                            <img
                                src="/arti_studio.png"
                                alt="Arti Studio"
                                width="32"
                                height="32"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering creators with the most advanced AI generation tools.
                            Turn your imagination into reality instantly.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            <Button size="icon" variant="ghost" className="rounded-full w-9 h-9 hover:bg-white/10 hover:text-white text-slate-400" aria-label="Follow us on Twitter">
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full w-9 h-9 hover:bg-white/10 hover:text-white text-slate-400" aria-label="Follow us on Instagram">
                                <Instagram className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full w-9 h-9 hover:bg-white/10 hover:text-white text-slate-400" aria-label="View our Github">
                                <Github className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Product</h4>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            {productLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Company</h4>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            {companyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            {legalLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Support</h4>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                            {supportLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-xs text-slate-500">
                            © {currentYear} Arti Studio. All rights reserved.
                        </p>

                        {/* Quick Legal Links (Mobile Friendly) */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                            <Link to="/privacy" className="hover:text-white transition-colors">
                                Privacy
                            </Link>
                            <span className="text-slate-700">•</span>
                            <Link to="/terms" className="hover:text-white transition-colors">
                                Terms
                            </Link>
                            <span className="text-slate-700">•</span>
                            <Link to="/contact" className="hover:text-white transition-colors">
                                Contact
                            </Link>
                        </div>

                        {/* Made with Love */}
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Arti Team
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
