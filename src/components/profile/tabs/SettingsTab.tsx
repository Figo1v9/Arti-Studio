import React, { useState } from 'react';
import { LogOut, Shield, Bell, Eye, Lock, Trash2, AlertTriangle, Loader2, Mail, Key, ChevronRight, RefreshCw } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase, updateOwnProfile } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { UserProfile } from '../types';
import { cn } from '@/lib/utils';

import { User } from 'firebase/auth';

interface CurrentUserWithExtras extends User {
    is_premium?: boolean;
}

interface SettingsTabProps {
    viewedProfile: UserProfile;
    currentUser: CurrentUserWithExtras | null;
    updateProfile: ((updates: Partial<UserProfile>) => Promise<void>) | undefined;
    setViewedProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    handleSignOut: () => void;
}

interface SettingsCardProps {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    children: React.ReactNode;
    className?: string;
    danger?: boolean;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
    icon: Icon,
    iconColor,
    iconBg,
    title,
    children,
    className,
    danger = false
}) => (
    <div className={cn(
        "bg-card/30 backdrop-blur-sm border rounded-2xl p-4 h-full",
        danger ? "border-rose-500/20" : "border-white/5",
        className
    )}>
        <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2 rounded-xl", iconBg)}>
                <Icon className={cn("w-4 h-4", iconColor)} />
            </div>
            <h4 className="font-semibold text-white text-sm">{title}</h4>
        </div>
        {children}
    </div>
);

export const SettingsTab: React.FC<SettingsTabProps> = ({
    viewedProfile,
    currentUser,
    updateProfile,
    setViewedProfile,
    handleSignOut
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    // Send password reset email
    const handlePasswordReset = async () => {
        const email = currentUser?.email;
        if (!email) {
            toast.error('No email associated with this account');
            return;
        }

        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('Error sending reset email:', error);
            if (firebaseError.code === 'auth/too-many-requests') {
                toast.error('Too many requests. Please try again later.');
            } else {
                toast.error('Failed to send reset email');
            }
        } finally {
            setIsSendingReset(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        if (!currentUser || !deletePassword.trim()) {
            toast.error('Please enter your password to confirm');
            return;
        }

        setIsDeleting(true);
        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                deletePassword
            );
            await reauthenticateWithCredential(auth.currentUser!, credential);

            // Delete profile from Supabase
            await supabase.from('profiles').delete().eq('id', currentUser.uid);

            // Delete user's images
            await supabase.from('gallery_images').delete().eq('author_id', currentUser.uid);

            // Delete from favorites
            await supabase.from('favorites').delete().eq('user_id', currentUser.uid);

            // Delete from follows
            await supabase.from('follows').delete().or(`follower_id.eq.${currentUser.uid},following_id.eq.${currentUser.uid}`);

            // Delete Firebase auth user
            await auth.currentUser?.delete();

            toast.success('Account deleted successfully');
            handleSignOut();
        } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            console.error('Error deleting account:', error);
            if (firebaseError.code === 'auth/wrong-password') {
                toast.error('Incorrect password');
            } else if (firebaseError.code === 'auth/requires-recent-login') {
                toast.error('Please sign in again to delete your account');
            } else {
                toast.error('Failed to delete account');
            }
        } finally {
            setIsDeleting(false);
            setDeletePassword('');
        }
    };

    // Toggle setting handler - uses RPC function for reliable updates
    const handleToggleSetting = async (key: string, value: boolean) => {
        try {
            // Use RPC function to update profile (bypasses RLS issues)
            const result = await updateOwnProfile({ [key]: value });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Update local state
            await updateProfile?.({ [key]: value });
            setViewedProfile(prev => prev ? ({ ...prev, [key]: value }) : null);
            toast.success('Settings updated');
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Check console for details';
            console.error('Settings update error:', err);
            toast.error(`Update failed: ${error}`);
        }
    };

    return (
        <div className="w-full">
            {/* Grid Layout - 2 columns on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Notifications Card */}
                <SettingsCard
                    icon={Bell}
                    iconColor="text-violet-400"
                    iconBg="bg-violet-500/10"
                    title="Notifications"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium">Email Updates</p>
                            <p className="text-xs text-muted-foreground mt-0.5">News about features & updates</p>
                        </div>
                        <Switch
                            checked={viewedProfile.email_notifications ?? true}
                            onCheckedChange={(checked) => handleToggleSetting('email_notifications', checked)}
                        />
                    </div>
                </SettingsCard>

                {/* Privacy Card */}
                <SettingsCard
                    icon={Eye}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                    title="Privacy"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium flex items-center gap-2">
                                Public Profile
                                {(!currentUser?.is_premium && !viewedProfile.is_premium) && (
                                    <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded font-bold">PREMIUM</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {(!currentUser?.is_premium && !viewedProfile.is_premium)
                                    ? "Upgrade to Premium to hide your profile"
                                    : "Allow others to see your profile"}
                            </p>
                        </div>
                        <Switch
                            checked={viewedProfile.is_public ?? true}
                            disabled={!viewedProfile.is_premium}
                            onCheckedChange={(checked) => handleToggleSetting('is_public', checked)}
                        />
                    </div>
                </SettingsCard>

                {/* Reset Defaults Card */}
                <SettingsCard
                    icon={RefreshCw}
                    iconColor="text-gray-400"
                    iconBg="bg-gray-500/10"
                    title="Reset Settings"
                >
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-white hover:bg-white/5 justify-start h-10 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 mr-3" />
                                Restore Defaults
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0F0F16] border-white/10 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                    This will restore your notification and privacy settings to their default values. The page will reload.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-violet-600 hover:bg-violet-500"
                                    onClick={async () => {
                                        // Reset Logic - use RPC function
                                        try {
                                            const result = await updateOwnProfile({
                                                is_public: true,
                                                email_notifications: true
                                            });
                                            if (!result.success) {
                                                throw new Error(result.error);
                                            }
                                            window.location.reload();
                                        } catch (e) {
                                            toast.error('Failed to reset settings');
                                        }
                                    }}
                                >
                                    Confirm Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SettingsCard>

                {/* Security Card */}
                <SettingsCard
                    icon={Shield}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                    title="Security"
                >
                    <div className="space-y-3">
                        {/* Email */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Email</span>
                            </div>
                            <span className="text-white text-sm truncate max-w-[140px]">
                                {currentUser?.email || 'Not set'}
                            </span>
                        </div>
                        {/* Password */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Password</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePasswordReset}
                                disabled={isSendingReset}
                                className="border-white/10 hover:bg-white/5 h-7 rounded-lg text-xs px-3"
                            >
                                {isSendingReset ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    'Reset'
                                )}
                            </Button>
                        </div>
                    </div>
                </SettingsCard>

                {/* Account Card */}
                <SettingsCard
                    icon={Lock}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-500/10"
                    title="Account"
                >
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-white hover:bg-white/5 justify-start h-10 rounded-xl"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                    </Button>
                </SettingsCard>

                {/* Danger Zone Card - Spans 2 columns on sm, 2 on lg */}
                <SettingsCard
                    icon={AlertTriangle}
                    iconColor="text-rose-400"
                    iconBg="bg-rose-500/10"
                    title="Danger Zone"
                    danger
                    className="sm:col-span-2 lg:col-span-2"
                >
                    {!showDeleteConfirm ? (
                        <Button
                            variant="ghost"
                            className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 justify-start h-10 rounded-xl"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete Account Permanently
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <p className="text-xs text-rose-300">
                                    ⚠️ This action is permanent. All your data, images, and followers will be deleted forever.
                                </p>
                            </div>
                            <Input
                                type="password"
                                placeholder="Enter your password to confirm"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="bg-white/5 border-rose-500/30 focus:border-rose-500/50 h-10 rounded-xl"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                    }}
                                    className="flex-1 h-9 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || !deletePassword.trim()}
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 h-9 rounded-xl"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Confirm Delete'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </SettingsCard>
            </div>
        </div>
    );
};
