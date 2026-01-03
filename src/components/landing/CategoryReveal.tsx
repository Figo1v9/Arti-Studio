
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { cn, getCategorySlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

interface CategoryRevealProps {
    title: string;
    subtitle: string;
    description: string;
    images: string[]; // URLs
    categoryId: string;
    theme?: 'violet' | 'blue' | 'rose' | 'amber';
}

const THEMES = {
    violet: { bg: 'from-violet-500/10', text: 'text-violet-200', border: 'border-violet-500/30' },
    blue: { bg: 'from-blue-500/10', text: 'text-blue-200', border: 'border-blue-500/30' },
    rose: { bg: 'from-rose-500/10', text: 'text-rose-200', border: 'border-rose-500/30' },
    amber: { bg: 'from-amber-500/10', text: 'text-amber-200', border: 'border-amber-500/30' },
};

export function CategoryReveal({ title, subtitle, description, images, categoryId, theme = 'violet' }: CategoryRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const style = THEMES[theme];

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=150%", // Pins for a while
                pin: true,
                scrub: 1,
                // markers: true, // debug
            }
        });

        // 1. Text Scale Down & Fade 
        // We start with HUGE text, then it shrinks to make space for images
        tl.to(textRef.current, {
            scale: 0.6,
            y: -100,
            opacity: 0.8,
            duration: 1
        });

        // 2. Images Reveal Staggered
        // Select all image containers
        const imageCards = gsap.utils.toArray('.image-card-' + categoryId);

        tl.fromTo(imageCards,
            { y: 400, opacity: 0, rotate: 5, scale: 0.8 },
            {
                y: 0,
                opacity: 1,
                rotate: 0,
                scale: 1,
                stagger: 0.1,
                duration: 1.5,
                ease: "power2.out"
            },
            "<+=0.2" // Overlap slightly with text animation
        );

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="h-screen w-full relative overflow-hidden bg-slate-950 flex flex-col items-center justify-center py-20">
            {/* Background Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none", style.bg)} />

            {/* Central Typography */}
            <div ref={textRef} className="z-20 text-center relative px-4 text-white">
                <p className={cn("text-xl md:text-2xl font-light tracking-[0.2em] uppercase mb-4", style.text)}>
                    {subtitle}
                </p>
                <h2 className="text-[12vw] leading-none font-bold tracking-tighter opacity-90">
                    {title}
                </h2>
                <p className="mt-6 text-slate-400 max-w-xl mx-auto text-lg opacity-0 transition-opacity duration-500 delay-300">
                    {description}
                </p>
                <div className="mt-8 opacity-0">
                    {/* Hidden initially, maybe we fade in a button later or keep it minimal */}
                </div>
            </div>

            {/* Images Grid - Absolute Positioned floating around */}
            <div ref={imagesRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                {images.slice(0, 6).map((src, i) => (
                    <div
                        key={i}
                        className={cn(
                            `image-card-${categoryId} absolute rounded-xl overflow-hidden shadow-2xl border ${style.border}`,
                            // Different positions for 6 images to frame the text
                            // This is a manual layout for 'organized chaos'
                            i === 0 ? "w-[20vw] h-[25vw] left-[5%] top-[15%]" :
                                i === 1 ? "w-[18vw] h-[24vw] right-[5%] top-[10%]" :
                                    i === 2 ? "w-[22vw] h-[18vw] left-[15%] bottom-[10%]" :
                                        i === 3 ? "w-[18vw] h-[22vw] right-[15%] bottom-[15%]" :
                                            i === 4 ? "w-[14vw] h-[14vw] left-[35%] -top-[5%] blur-[2px]" : // varied depth
                                                "w-[16vw] h-[20vw] right-[40%] -bottom-[5%] blur-[1px]"
                        )}
                    >
                        <img
                            src={src}
                            alt={`Gallery ${i}`}
                            width="800"
                            height="800"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Explore Button (Optional, can be placed bottom or integrated) */}
            <div className="absolute bottom-10 z-30">
                <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/10 text-white rounded-full"
                    onClick={() => navigate(`/category/${getCategorySlug(categoryId)}`)}
                >
                    Explore {title}
                </Button>
            </div>
        </div>
    );
}
