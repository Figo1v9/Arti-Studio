import { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Share2, Sparkles, Image, Check, Heart, Shield, Edit3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/avatar';
import { supabase } from '@/lib/supabase';
import { GalleryImage } from '@/types/gallery';
import { transformImage } from '@/services/gallery.service';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GalleryGrid = lazy(() => import('@/components/gallery/GalleryGrid').then(module => ({ default: module.GalleryGrid })));

interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    bio: string | null;
}

export default function PublicProfile() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // State
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [creations, setCreations] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'creations' | 'favorites'>('creations');

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editBio, setEditBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const isOwner = currentUser && profile && currentUser.uid === profile.id;

    useEffect(() => {
        if (username) {
            fetchProfileAndCreations(username);
        }
    }, [username]);

    const fetchProfileAndCreations = async (usernameStr: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch Profile
            let profileData: UserProfile | null = null;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usernameStr);

            let query = supabase.from('profiles').select('*');
            if (isUUID) {
                query = query.eq('id', usernameStr);
            } else {
                query = query.eq('username', usernameStr);
            }

            const { data, error } = await query.single();

            if (error || !data) {
                setError('User not found');
                return;
            }
            profileData = data as UserProfile;
            setProfile(profileData);

            // Pre-fill edit form
            setEditName(profileData.full_name || '');
            setEditUsername(profileData.username || '');
            setEditBio(profileData.bio || '');

            // 2. Fetch Creations
            const { data: imagesData, error: imagesError } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('author_id', profileData.id)
                .order('created_at', { ascending: false });

            if (imagesError) throw imagesError;
            setCreations((imagesData || []).map(transformImage));

        } catch (err) {
            console.error('Error fetching public profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveProfile = async () => {
        if (!isOwner || !profile) return;
        if (!editName.trim()) {
            toast.error('Name is required');
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(editUsername)) {
            toast.error('Username can only contain letters, numbers, underscores and dashes');
            return;
        }

        setIsSaving(true);
        try {
            // Check uniqueness if username changed
            if (editUsername !== profile.username) {
                const { data } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', editUsername)
                    .single();
                if (data) {
                    toast.error('Username already taken');
                    setIsSaving(false);
                    return;
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editName,
                    username: editUsername,
                    bio: editBio
                })
                .eq('id', profile.id);

            if (error) throw error;

            toast.success('Profile updated');
            setProfile(prev => prev ? ({ ...prev, full_name: editName, username: editUsername, bio: editBio }) : null);
            setIsEditing(false);

            // If username changed, navigate to new URL
            if (editUsername !== profile.username) {
                navigate(`/user/${editUsername}`, { replace: true });
            }

        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <Helmet><title>User Not Found - Arti Studio</title></Helmet>
                <div className="max-w-md w-full text-center">
                    <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
                    <p className="text-gray-400 mb-6">{error || "The user you're looking for doesn't exist or has been removed."}</p>
                    <Button onClick={() => navigate('/explore')} variant="outline">Back to Home</Button>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Creations', value: creations.length, icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Likes', value: creations.reduce((acc, img) => acc + (img.likes || 0), 0), icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            <Helmet><title>{profile.full_name} (@{profile.username}) - Arti Studio</title></Helmet>

            {/* === HERO SECTION === */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-black z-0" />
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-600/20 blur-[100px] rounded-full" />

                <div className="absolute top-4 left-4 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/explore')}
                        className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full h-10 w-10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full px-4"
                    >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied' : 'Share'}
                    </Button>
                </div>
            </div>

            {/* === CONTENT === */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">

                    {/* User Info Card */}
                    <div className="flex flex-col items-center md:items-start shrink-0 w-full md:w-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl p-1 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                                <img
                                    src={getAvatarUrl(profile.email || 'user', profile.avatar_url)}
                                    alt={profile.full_name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover rounded-[20px]"
                                />
                            </div>
                        </motion.div>

                        <div className="mt-4 text-center md:text-left w-full md:max-w-xs">
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                {profile.full_name}
                                {profile.role === 'admin' && <Shield className="w-5 h-5 text-amber-400 fill-amber-400/20" />}
                            </h1>
                            <p className="text-violet-300 font-medium">@{profile.username || 'user'}</p>

                            {/* Short Bio */}
                            {profile.bio && (
                                <p className="text-gray-300 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                            )}

                            <p className="text-muted-foreground text-xs mt-3 flex items-center justify-center md:justify-start gap-1">
                                <span>Joined {formatDate(profile.created_at)}</span>
                            </p>

                            {/* Owner Actions */}
                            {isOwner && (
                                <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white/5 border-white/10 hover:bg-white/10"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mini Stats */}
                        <div className="flex gap-3 mt-6 w-full justify-center md:justify-start">
                            {stats.map(stat => (
                                <div key={stat.label} className={cn("flex flex-col items-center p-3 rounded-2xl bg-card/50 border border-white/5 min-w-[100px]", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
                                    <span className="text-lg font-bold text-white">{stat.value}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="flex-1 w-full pt-4 md:pt-20">
                        {/* Tabs */}
                        <div className="flex items-center gap-6 mb-6 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('creations')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'creations' ? "text-white" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Creations
                                </div>
                                {activeTab === 'creations' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
                            </button>

                            {/* Only show favorites if owner (or public preferences allow - sticking to owner for now) */}
                            {isOwner && (
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={cn(
                                        "pb-3 text-sm font-medium transition-colors relative",
                                        activeTab === 'favorites' ? "text-white" : "text-muted-foreground hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        Favorites
                                    </div>
                                    {activeTab === 'favorites' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />}
                                </button>
                            )}
                        </div>

                        {activeTab === 'creations' && (
                            creations.length > 0 ? (
                                <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500" /></div>}>
                                    <GalleryGrid
                                        images={creations}
                                        onImageClick={(img) => navigate(`/image/${img.id}`)}
                                    />
                                </Suspense>
                            ) : (
                                <div className="py-12 text-center bg-card/20 rounded-3xl border border-white/5">
                                    <Image className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-white mb-1">No creations yet</h3>
                                    <p className="text-muted-foreground">
                                        {isOwner ? "You haven't published any work yet." : "This user hasn't published any work yet."}
                                    </p>
                                    {isOwner && (
                                        <Button className="mt-4" onClick={() => navigate('/create')}>
                                            Start Creating
                                        </Button>
                                    )}
                                </div>
                            )
                        )}

                        {activeTab === 'favorites' && (
                            <div className="py-12 text-center bg-card/20 rounded-3xl border border-white/5">
                                <Heart className="w-12 h-12 text-white/10 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-white mb-1">Empty Favorites</h3>
                                <p className="text-muted-foreground">Go to Favorites page to manage them.</p>
                                <Button variant="link" onClick={() => navigate('/favorites')}>Go to Favorites</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Edit Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Display Name</Label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Username</Label>
                                <div className="relative mt-1.5">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                    <Input
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="pl-7"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Bio</Label>
                                <Textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    className="mt-1.5 resize-none h-24"
                                    placeholder="Tell the world about yourself..."
                                    maxLength={160}
                                />
                                <p className="text-xs text-muted-foreground text-right mt-1">{editBio.length}/160</p>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
