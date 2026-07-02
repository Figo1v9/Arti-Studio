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

    // Return clean black background during auth load to prevent flash/flicker
    if (loading) {
        return <div className="min-h-screen bg-slate-950" />;
    }

    // Redirect logged-in users to explore
    if (user) {
        return <Navigate to="/explore" replace />;
    }

    // We could fetch real images here, or use high-quality static placeholders for the landing page for speed
    // For now, I'll use some placeholder URLs or real ones if available

    // Highly reliable, active Unsplash image URLs for landing page presentation
    const photoImages = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&q=60"
    ];

    const aiImages = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60"
    ];

    const artImages = [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1501472312651-726afd116ff1?w=600&auto=format&fit=crop&q=60"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden relative">
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
