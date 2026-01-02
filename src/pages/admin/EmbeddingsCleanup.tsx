import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SemanticSearchService } from '@/services/semantic-search.service';
import { toast } from 'sonner';

export default function EmbeddingsCleanup() {
    const [stats, setStats] = useState({
        totalImages: 0,
        missingImageEmbeddings: 0,
        totalProfiles: 0,
        missingProfileEmbeddings: 0
    });
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<'images' | 'profiles' | null>(null);
    const [progress, setProgress] = useState(0);
    const [currentBatch, setCurrentBatch] = useState(0);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Images Stats
            const { count: totalImgs } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });
            const { count: missingImgs } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true }).is('embedding', null);

            // Profiles Stats
            const { count: totalProfs } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: missingProfs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).is('embedding', null);

            setStats({
                totalImages: totalImgs || 0,
                missingImageEmbeddings: missingImgs || 0,
                totalProfiles: totalProfs || 0,
                missingProfileEmbeddings: missingProfs || 0
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const generateImageEmbeddings = async () => {
        if (stats.missingImageEmbeddings === 0) return;
        setProcessing('images');
        setProgress(0);

        try {
            let processed = 0;
            const total = stats.missingImageEmbeddings;
            const BATCH_SIZE = 20; // Increased from 5 to 20

            while (processed < total) {
                // Fetch batch
                const { data: images } = await supabase
                    .from('gallery_images')
                    .select('id, title, prompt, category, tags')
                    .is('embedding', null)
                    .limit(BATCH_SIZE);

                if (!images || images.length === 0) break;

                // Process batch
                const adminSecret = import.meta.env.VITE_ADMIN_UPLOAD_SECRET;
                const updates: { id: string, embedding: number[] }[] = [];

                await Promise.all(images.map(async (img) => {
                    const text = `${img.title} ${img.prompt} ${Array.isArray(img.tags) ? img.tags.join(' ') : img.tags} ${img.category}`;
                    try {
                        const embedding = await SemanticSearchService.generateEmbedding(text, adminSecret);
                        if (embedding) {
                            updates.push({ id: img.id, embedding });
                        }
                    } catch (err) {
                        console.error(`Failed to generate embedding for image ${img.id}`, err);
                    }
                }));

                // Bulk update (Upsert) - N updates -> 1 update
                if (updates.length > 0) {
                    const { error } = await supabase
                        .from('gallery_images')
                        .upsert(updates);

                    if (error) {
                        console.error('Batch update failed:', error);
                        toast.error(`Batch update failed: ${error.message}`);
                    }
                }

                processed += images.length;
                setProgress((processed / total) * 100);
                setCurrentBatch(prev => prev + 1);

                // Small breathing room for the worker
                await new Promise(r => setTimeout(r, 200));
            }

            toast.success("Image embeddings generation complete!");
            fetchStats();
        } catch (e) {
            console.error(e);
            toast.error("Process interrupted");
        } finally {
            setProcessing(null);
            setProgress(0);
            setCurrentBatch(0);
        }
    };

    const generateProfileEmbeddings = async () => {
        if (stats.missingProfileEmbeddings === 0) return;
        setProcessing('profiles');
        setProgress(0);

        try {
            let processed = 0;
            const total = stats.missingProfileEmbeddings;
            const BATCH_SIZE = 20;

            while (processed < total) {
                // Fetch batch
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, username, bio, role')
                    .is('embedding', null)
                    .limit(BATCH_SIZE);

                if (!profiles || profiles.length === 0) break;

                // Process batch
                const adminSecret = import.meta.env.VITE_ADMIN_UPLOAD_SECRET;
                const updates: { id: string, embedding: number[] }[] = [];

                await Promise.all(profiles.map(async (profile) => {
                    const text = `Creator ${profile.full_name} (@${profile.username}). Bio: ${profile.bio || ''} Role: ${profile.role}`;
                    try {
                        const embedding = await SemanticSearchService.generateEmbedding(text, adminSecret);
                        if (embedding) {
                            updates.push({ id: profile.id, embedding });
                        }
                    } catch (err) {
                        console.error(`Failed to generate embedding for profile ${profile.username}`, err);
                    }
                }));

                // Bulk update (Upsert)
                if (updates.length > 0) {
                    const { error } = await supabase
                        .from('profiles')
                        .upsert(updates);

                    if (error) {
                        console.error('Batch update failed:', error);
                        toast.error(`Batch update failed: ${error.message}`);
                    }
                }

                processed += profiles.length;
                setProgress((processed / total) * 100);
                setCurrentBatch(prev => prev + 1);

                await new Promise(r => setTimeout(r, 200));
            }

            toast.success("Profile embeddings generation complete!");
            fetchStats();
        } catch (e) {
            console.error(e);
            toast.error("Process interrupted");
        } finally {
            setProcessing(null);
            setProgress(0);
            setCurrentBatch(0);
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#0a0a0f]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Semantic Search Migration</h1>
                    <p className="text-gray-400">Generate embeddings for existing data to enable AI search.</p>
                </div>
                <Button onClick={fetchStats} disabled={loading || !!processing} variant="outline">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images Card */}
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Gallery Images
                            <Badge variant={stats.missingImageEmbeddings === 0 ? "secondary" : "destructive"}>
                                {stats.missingImageEmbeddings} Missing
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Total: {stats.totalImages} images
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {processing === 'images' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Processing...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={!!processing || stats.missingImageEmbeddings === 0}
                            onClick={generateImageEmbeddings}
                        >
                            {processing === 'images' ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                <><Smartphone className="w-4 h-4 mr-2" /> Generate Embeddings</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Profiles Card */}
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            User Profiles
                            <Badge variant={stats.missingProfileEmbeddings === 0 ? "secondary" : "destructive"}>
                                {stats.missingProfileEmbeddings} Missing
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Total: {stats.totalProfiles} profiles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {processing === 'profiles' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Processing...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={!!processing || stats.missingProfileEmbeddings === 0}
                            onClick={generateProfileEmbeddings}
                        >
                            {processing === 'profiles' ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                <><Smartphone className="w-4 h-4 mr-2" /> Generate Embeddings</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
