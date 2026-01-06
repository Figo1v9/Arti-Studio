
import { Sparkles, Zap, Shield, Globe, Layers, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingContent() {
    const features = [
        {
            icon: Command,
            title: "Advanced Prompt Engineering",
            description: "Access thousands of meticulously crafted prompts for Midjourney, Stable Diffusion, and DALL-E. Learn the syntax of success."
        },
        {
            icon: Globe,
            title: "Global Creator Community",
            description: "Connect with AI artists from around the world. Share your workflow, get feedback, and collaborate on groundbreaking projects."
        },
        {
            icon: Shield,
            title: "Commercial Rights & Privacy",
            description: "Understand the usage rights of generated art. Our platform provides clear guidelines on commercial use and intellectual property."
        },
        {
            icon: Zap,
            title: "High-Speed Generation",
            description: "Experience lightning-fast image viewing and caching. Our global CDN ensures that inspiration is never more than a click away."
        },
        {
            icon: Layers,
            title: "Organized Collections",
            description: "Curate your own mood boards and collections. Keep your favorite prompts and references organized for your next big project."
        },
        {
            icon: Sparkles,
            title: "Daily Inspiration",
            description: "Fresh content delivered daily. Our algorithms surface the most trending and innovative AI art styles to keep you ahead of the curve."
        }
    ];

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6">
                        The Ultimate Platform for AI Art
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Arti Studio isn't just a gallery; it's a comprehensive ecosystem designed to elevate your AI art journey. From prompt discovery to portfolio management, we provide the tools you need.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* How It Works Section */}
                <div className="border-t border-white/5 pt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How It Works</h2>
                        <p className="text-slate-400">Your journey from concept to masterpiece in three simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { step: "01", title: "Discover", desc: "Browse thousands of community-generated images. Filter by style, model, or category." },
                            { step: "02", title: "Analyze", desc: "View the exact prompt and parameters used to create the image. Copy with one click." },
                            { step: "03", title: "Create", desc: "Use the prompts in your favorite AI tool or remix them to create something entirely new." }
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="text-8xl font-bold text-slate-900 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
