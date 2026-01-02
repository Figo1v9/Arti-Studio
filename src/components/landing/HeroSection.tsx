
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-borders-button';
import { VariableProximity } from '@/components/ui/variable-proximity';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlipWords } from '@/components/ui/flip-words';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroTextRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Check if desktop (for Variable Proximity effect)
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    useGSAP(() => {
        const tl = gsap.timeline();

        // Initial state with blur
        gsap.set([textRef.current, subtextRef.current, ctaRef.current], {
            y: 50,
            opacity: 0,
            filter: "blur(15px)"
        });

        // Reveal animation with blur removal
        tl.to(textRef.current, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.8,
            ease: 'power4.out',
            delay: 0.1
        })
            .to(subtextRef.current, {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.5,
                ease: 'power3.out'
            }, '-=1.4')
            .to(ctaRef.current, {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.2,
                ease: 'power3.out'
            }, '-=1.2');

    }, { scope: containerRef });



    return (
        <div ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Grid Background Pattern */}
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:40px_40px]",
                    "[background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"
                )}
            />

            {/* Radial gradient mask for faded grid effect */}
            <div className="pointer-events-none absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

            {/* Cinematic Background Gradient - violet accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />

            {/* Left Decorative Image - Clean Design */}
            <div
                className="absolute -left-8 xl:-left-4 2xl:left-8 top-1/2 z-0 hidden lg:block opacity-80 hover:opacity-100 transition-opacity duration-500"
                style={{
                    transform: 'translateY(-50%) rotate(-8deg)',
                    animation: 'float-left 8s ease-in-out infinite'
                }}
            >
                <div className="relative group">
                    <img
                        src="https://pub-d1b86c05aa324c30b2a76b02f0d102ae.r2.dev/gallery/1767356091423-b6kmn81647.webp"
                        alt="AI Generated Art"
                        className="w-44 h-60 lg:w-48 lg:h-64 xl:w-56 xl:h-72 2xl:w-64 2xl:h-80 object-cover rounded-2xl shadow-2xl shadow-black/50 transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-3xl"
                    />
                </div>
            </div>

            {/* Right Decorative Image - Clean Design */}
            <div
                className="absolute -right-8 xl:-right-4 2xl:right-8 top-1/2 z-0 hidden lg:block opacity-80 hover:opacity-100 transition-opacity duration-500"
                style={{
                    transform: 'translateY(-50%) rotate(8deg)',
                    animation: 'float-right 8s ease-in-out infinite'
                }}
            >
                <div className="relative group">
                    <img
                        src="https://pub-d1b86c05aa324c30b2a76b02f0d102ae.r2.dev/gallery/1766680008618-vjp5i93cap.webp"
                        alt="AI Generated Art"
                        className="w-56 h-72 lg:w-64 lg:h-80 xl:w-72 xl:h-96 2xl:w-80 2xl:h-[420px] object-cover rounded-2xl shadow-2xl shadow-black/50 transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-3xl"
                    />
                </div>
            </div>


            <div className="relative z-10 px-6 max-w-7xl mx-auto text-center">
                {/* Logo */}
                <div className="mb-8 md:mb-10">
                    <img
                        src="/arti_studio.png"
                        alt="Arti Studio"
                        className="h-12 md:h-16 lg:h-20 w-auto mx-auto opacity-0"
                        ref={(el) => {
                            if (el) {
                                gsap.set(el, { y: 30, opacity: 0, filter: "blur(10px)" });
                                gsap.to(el, {
                                    y: 0,
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    duration: 1.2,
                                    ease: 'power3.out',
                                    delay: 0.05
                                });
                            }
                        }}
                    />
                </div>

                <div
                    ref={heroTextRef}
                    className="overflow-hidden mb-6 py-2"
                    style={{ position: 'relative' }}
                >
                    <h1
                        ref={textRef}
                        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[1.1]"
                    >
                        {/* Desktop: Variable Proximity Effect */}
                        <span className="hidden lg:block">
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400"
                                style={{ fontFamily: "'Roboto Flex', sans-serif" }}
                            >
                                <VariableProximity
                                    label="Browse and create"
                                    fromFontVariationSettings="'wght' 300"
                                    toFontVariationSettings="'wght' 900"
                                    containerRef={heroTextRef}
                                    radius={200}
                                    falloff="gaussian"
                                />
                            </span>
                            <br />
                            <span
                                className="text-violet-200"
                                style={{ fontFamily: "'Roboto Flex', sans-serif" }}
                            >
                                <VariableProximity
                                    label="the best"
                                    fromFontVariationSettings="'wght' 300"
                                    toFontVariationSettings="'wght' 900"
                                    containerRef={heroTextRef}
                                    radius={200}
                                    falloff="gaussian"
                                />
                            </span>{' '}
                            <span className="ai-shimmer-text" style={{ fontFamily: "'Roboto Flex', sans-serif" }}>
                                <VariableProximity
                                    label="AI"
                                    fromFontVariationSettings="'wght' 300"
                                    toFontVariationSettings="'wght' 900"
                                    containerRef={heroTextRef}
                                    radius={200}
                                    falloff="gaussian"
                                />
                            </span>{' '}
                            <span className="inline-block whitespace-nowrap text-white" style={{ fontFamily: "'Roboto Flex', sans-serif" }}>
                                <FlipWords
                                    words={['Results', 'Posters', 'Fashion', 'Design', 'Visual Art', 'Creative']}
                                    colors={['#a78bfa', '#fb923c', '#4ade80', '#facc15', '#22d3ee', '#f472b6']}
                                    duration={1500}
                                />
                            </span>
                        </span>

                        {/* Mobile: Static Text */}
                        <span className="lg:hidden text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400">
                            Browse and create
                            <br />
                            <span className="text-violet-200">the best</span>{' '}
                            <span className="ai-shimmer-text">AI</span>{' '}
                            <span className="inline-block whitespace-nowrap">
                                <FlipWords
                                    words={['Results', 'Posters', 'Fashion', 'Design', 'Visual Art', 'Creative']}
                                    colors={['#a78bfa', '#fb923c', '#4ade80', '#facc15', '#22d3ee', '#f472b6']}
                                    duration={1500}
                                />
                            </span>
                        </span>
                    </h1>
                </div>

                <div className="overflow-hidden mb-12">
                    <p
                        ref={subtextRef}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light tracking-wide"
                    >
                        Experience a new era of digital creativity. Where imagination meets intelligence.
                    </p>
                </div>

                <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <RainbowButton
                        onClick={() => navigate('/login?signup=true')}
                        className="group"
                    >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </RainbowButton>

                    <Button
                        variant="ghost"
                        onClick={() => navigate('/explore')}
                        className="h-14 px-8 rounded-full text-lg text-white/70 hover:text-white hover:bg-white/10"
                    >
                        Explore Gallery
                    </Button>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float-left {
                    0%, 100% {
                        transform: translateY(-50%) rotate(-8deg);
                    }
                    50% {
                        transform: translateY(-53%) rotate(-6deg);
                    }
                }
                
                @keyframes float-right {
                    0%, 100% {
                        transform: translateY(-50%) rotate(8deg);
                    }
                    50% {
                        transform: translateY(-47%) rotate(10deg);
                    }
                }
            `}</style>
        </div>
    );
}
