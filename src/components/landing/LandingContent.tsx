
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

                {/* Statistics Section */}
                <div className="border-t border-white/5 pt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Trusted by Creators Worldwide</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Join thousands of artists, designers, and creative professionals who use Arti Studio daily to find inspiration and share their AI-generated masterpieces.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "500K+", label: "AI Artworks" },
                            { value: "10K+", label: "Active Creators" },
                            { value: "150+", label: "Countries" },
                            { value: "5K+", label: "Daily Uploads" }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-3xl md:text-4xl font-bold text-violet-400 mb-2">{stat.value}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="border-t border-white/5 pt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                        <p className="text-slate-400">Everything you need to know about Arti Studio.</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
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
                                question: "Can I use prompts commercially?",
                                answer: "With a Pro subscription, you get full commercial usage rights for all prompts you create and share. This is perfect for businesses, freelancers, and content creators who need AI-generated assets for their professional work."
                            },
                            {
                                question: "How do I share my AI art?",
                                answer: "Simply create a free account, upload your AI-generated images along with the prompts used to create them, and share with our global community. You can organize your work into collections, gain followers, and build your creative portfolio."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                                <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About Section */}
                <div className="border-t border-white/5 pt-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About Arti Studio</h2>
                        <div className="text-slate-400 leading-relaxed space-y-4 text-left md:text-center">
                            <p>
                                Founded in 2025, Arti Studio has quickly become the go-to destination for AI art enthusiasts and professionals alike. Our mission is to democratize AI creativity by providing a platform where anyone can discover inspiration, learn prompt engineering techniques, and share their unique digital creations with the world.
                            </p>
                            <p>
                                We believe that AI is not replacing human creativity—it's amplifying it. By combining the power of artificial intelligence with human imagination, we're witnessing a new renaissance in digital art. From photorealistic portraits to abstract masterpieces, from architectural concepts to fashion designs, Arti Studio showcases the full spectrum of what's possible when technology meets artistry.
                            </p>
                            <p>
                                Our platform is built with creators in mind. We offer powerful tools for organizing your work into collections, tracking engagement on your posts, and connecting with like-minded artists from around the globe. Whether you're a seasoned professional or just starting your AI art journey, Arti Studio provides the resources and community you need to thrive.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
