import { Helmet } from 'react-helmet-async';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoryReveal } from '@/components/landing/CategoryReveal';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { LandingContent } from '@/components/landing/LandingContent';


export default function LandingPage() {
    const { user, loading } = useAuth();

    // Show minimal loader while checking auth to prevent flash
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
                    {/* Spinner */}
                    <div className="relative w-10 h-10 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
                </div>
            </div>
        );
    }

    // Redirect logged-in users to explore
    if (user) {
        return <Navigate to="/explore" replace />;
    }

    // We could fetch real images here, or use high-quality static placeholders for the landing page for speed
    // For now, I'll use some placeholder URLs or real ones if available

    // Example placeholders - replace with curated best-of-platform images
    const photoImages = [
        "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=60",
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=60",
        "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=600&q=60",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=60",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=60",
        "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=60"
    ];

    const aiImages = [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=60", // AI brain
        "https://images.unsplash.com/photo-1686191129966-4d343466db9d?w=600&q=60", // Abstract 3D
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=60", // Cyberpunk
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=60", // Liquid
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=60", // Gradient
        "https://images.unsplash.com/photo-1614728446136-69735186b4d9?w=600&q=60"  // Abstract
    ];

    const artImages = [
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=60",
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=60",
        "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=60",
        "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=600&q=60",
        "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=60",
        "https://images.unsplash.com/photo-1578301978018-77f2892d9612?w=600&q=60"
    ];

    return (
        <div className="bg-slate-950 min-h-screen text-white">
            <Helmet>
                <title>Arti Studio - AI Creative Suite & Prompt Marketplace</title>
                <meta name="description" content="The ultimate AI creative suite. Generate, share, and discover top-tier AI art and prompts for Midjourney, Stable Diffusion, and DALL-E." />
                <link rel="canonical" href="https://artistudio.fun/" />
                <script type="application/ld+json">
                    {`
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Arti Studio",
                        "url": "https://artistudio.fun",
                        "logo": "https://artistudio.fun/arti_studio_icon.png",
                        "sameAs": [
                            "https://twitter.com/artistudio",
                            "https://instagram.com/artistudio"
                        ]
                    }
                    `}
                </script>
            </Helmet>

            {/* Header */}
            <LandingHeader />

            <HeroSection />

            <CategoryReveal
                categoryId="photography"
                title="PHOTO"
                subtitle="Capturing Moments"
                description="High-fidelity photography powered by AI. Generate realistic scenes, portraits, and landscapes."
                images={photoImages}
                theme="violet"
            />

            <CategoryReveal
                categoryId="ai-art"
                title="CONCEPT"
                subtitle="Artificial Intelligence"
                description="Push the boundaries of imagination with abstract and conceptual AI art generations."
                images={aiImages}
                theme="blue"
            />

            <CategoryReveal
                categoryId="art"
                title="ART"
                subtitle="Digital Masterpieces"
                description="Create stunning digital paintings, illustrations, and artistic compositions instantly."
                images={artImages}
                theme="rose"
            />

            {/* Rich Content Section for SEO & AdSense */}
            <LandingContent />

            {/* Final CTA Section could go here, or handled by Footer */}
            <div className="h-[50vh] flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <h3 className="text-4xl font-bold mb-6">Ready to Create?</h3>
                    <a href="/login?signup=true" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                        Join Arti Studio
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
}
