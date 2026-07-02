import { Sparkles, Zap, Shield, Globe, Layers, Command } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingContent() {
    const features = [
        {
            icon: Command,
            title: "Advanced Prompt Engineering",
            description: "Access thousands of meticulously crafted prompts for Midjourney, Stable Diffusion, and DALL-E. Learn the syntax of success from top curators.",
            className: "md:col-span-2"
        },
        {
            icon: Globe,
            title: "Creator Community",
            description: "Connect with AI artists worldwide. Share your workflow, get feedback, and collaborate on projects.",
            className: "md:col-span-1"
        },
        {
            icon: Shield,
            title: "Rights & Privacy",
            description: "Understand the usage rights of generated art. Clear guidelines on commercial use and intellectual property.",
            className: "md:col-span-1"
        },
        {
            icon: Zap,
            title: "High-Speed Generation",
            description: "Experience lightning-fast image viewing and caching. Our global CDN ensures that inspiration is never more than a single click away.",
            className: "md:col-span-2"
        },
        {
            icon: Layers,
            title: "Organized Collections",
            description: "Curate your own mood boards and collections. Keep your favorite prompts and references organized for your next big project.",
            className: "md:col-span-2"
        },
        {
            icon: Sparkles,
            title: "Daily Inspiration",
            description: "Fresh content delivered daily. Our algorithms surface the most trending and innovative AI art styles to keep you ahead.",
            className: "md:col-span-1"
        }
    ];

    return (
        <section className="py-32 bg-slate-950 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-28">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 border border-white/10 text-violet-300 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Next-Gen Features
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 mb-6">
                        The Ultimate Platform for AI Art
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Arti Studio is a comprehensive ecosystem designed to elevate your AI art journey. From prompt discovery to portfolio management, we provide the tools you need.
                    </p>
                </div>

                {/* Bento Grid Features Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: index * 0.05 }}
                            className={`${feature.className} p-2 rounded-[2rem] bg-white/5 border border-white/10 hover:border-violet-500/20 hover:bg-violet-500/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-2xl hover:shadow-violet-500/5 group`}
                        >
                            {/* Inner core - Double Bezel Architecture */}
                            <div className="h-full rounded-[calc(2rem-0.5rem)] bg-slate-900/40 dark:bg-black/40 backdrop-blur-md p-8 border border-white/5 flex flex-col justify-between">
                                <div>
                                    {/* Icon Container with subtle animation */}
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-500/10 group-hover:border-violet-500/20 transition-all duration-500">
                                        <feature.icon className="w-5 h-5 text-slate-300 group-hover:text-violet-400 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed font-light text-[15px]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* How It Works Section */}
                <div className="border-t border-white/5 pt-32">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 border border-white/10 text-blue-300 mb-6">
                            Workflow
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">How It Works</h2>
                        <p className="text-slate-400 font-light text-lg">Your journey from concept to masterpiece in three simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center max-w-5xl mx-auto">
                        {[
                            { step: "01", title: "Discover", desc: "Browse thousands of community-generated images. Filter by style, model, or category." },
                            { step: "02", title: "Analyze", desc: "View the exact prompt and parameters used to create the image. Copy with one click." },
                            { step: "03", title: "Create", desc: "Use the prompts in your favorite AI tool or remix them to create something entirely new." }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="text-9xl font-extrabold text-slate-900/30 absolute top-[-60px] left-1/2 -translate-x-1/2 z-0 select-none transition-colors duration-500 group-hover:text-violet-500/10">
                                    {item.step}
                                </div>
                                <div className="relative z-10 pt-4">
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-200 transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="border-t border-white/5 pt-32 mt-32">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Trusted by Creators Worldwide</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto font-light text-lg">
                            Join thousands of artists, designers, and creative professionals who use Arti Studio daily to find inspiration.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {[
                            { value: "500K+", label: "AI Artworks" },
                            { value: "10K+", label: "Active Creators" },
                            { value: "150+", label: "Countries" },
                            { value: "5K+", label: "Daily Uploads" }
                        ].map((stat, i) => (
                            <div key={i} className="p-2 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/20 transition-all duration-500">
                                <div className="rounded-[calc(1.5rem-0.25rem)] bg-slate-900/30 p-8">
                                    <div className="text-3xl md:text-4xl font-extrabold text-violet-400 mb-2 tracking-tight">{stat.value}</div>
                                    <div className="text-slate-400 text-sm font-light">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="border-t border-white/5 pt-32 mt-32">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Frequently Asked Questions</h2>
                        <p className="text-slate-400 font-light text-lg">Everything you need to know about Arti Studio.</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        {[
                            {
                                question: "What is Arti Studio?",
                                answer: "Arti Studio is the premier platform for discovering, sharing, and creating AI-generated art. We provide a comprehensive ecosystem where artists and enthusiasts can explore thousands of AI artworks, learn from expert prompts, and showcase their own creations to a global community."
                            },
                            {
                                question: "What AI models are supported?",
                                answer: "Arti Studio supports prompts and content from all major AI image generation platforms including Midjourney, Stable Diffusion, DALL-E 3, Leonardo AI, and more. You can discover prompts optimized for any AI art generator."
                            },
                            {
                                question: "Is Arti Studio free to use?",
                                answer: "Yes! Browsing and discovering AI art on Arti Studio is completely free. We also offer premium features for creators who want advanced tools, higher visibility, and commercial usage rights for their generated content."
                            },
                            {
                                question: "How do I share my AI art?",
                                answer: "Simply create a free account, upload your AI-generated images along with the prompts used to create them, and share with our global community. You can organize your work into collections, gain followers, and build your creative portfolio."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-2 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/20 hover:bg-violet-500/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                                <div className="rounded-[calc(1.5rem-0.25rem)] bg-slate-900/30 p-8">
                                    <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{faq.question}</h3>
                                    <p className="text-slate-400 leading-relaxed font-light text-sm">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About Section */}
                <div className="border-t border-white/5 pt-32 mt-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">About Arti Studio</h2>
                        <div className="text-slate-400 leading-relaxed space-y-6 font-light text-base md:text-center">
                            <p>
                                Founded in 2025, Arti Studio has quickly become the go-to destination for AI art enthusiasts and professionals alike. Our mission is to democratize AI creativity by providing a platform where anyone can discover inspiration, learn prompt engineering techniques, and share their unique digital creations with the world.
                            </p>
                            <p>
                                We believe that AI is not replacing human creativity—it's amplifying it. By combining the power of artificial intelligence with human imagination, we're witnessing a new renaissance in digital art. From photorealistic portraits to abstract masterpieces, from architectural concepts to fashion designs, Arti Studio showcases the full spectrum of what's possible when technology meets artistry.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
