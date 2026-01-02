import React, { useEffect, useRef, useCallback, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, AtSign, FileText, Loader2, Check, X, ChevronDown } from 'lucide-react';

interface EditProfileMobileProps {
    isOpen: boolean;
    editName: string;
    setEditName: (v: string) => void;
    editUsername: string;
    setEditUsername: (v: string) => void;
    editBio: string;
    setEditBio: (v: string) => void;
    onClose: () => void;
    isSaving: boolean;
    handleSaveProfile: () => void;
}

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
        const patterns = { light: 8, medium: 15, heavy: 25 };
        navigator.vibrate(patterns[style]);
    }
};

export const EditProfileMobile: React.FC<EditProfileMobileProps> = ({
    isOpen,
    editName,
    setEditName,
    editUsername,
    setEditUsername,
    editBio,
    setEditBio,
    onClose,
    isSaving,
    handleSaveProfile
}) => {
    // Generate unique IDs for form fields
    const baseId = useId();
    const nameInputId = `${baseId}-name`;
    const usernameInputId = `${baseId}-username`;
    const bioInputId = `${baseId}-bio`;

    const sheetRef = useRef<HTMLDivElement>(null);
    const scrollYRef = useRef(0);
    const [isClosing, setIsClosing] = useState(false);

    // Lock body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            scrollYRef.current = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollYRef.current}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollYRef.current);
            };
        }
    }, [isOpen]);

    // Handle close with animation
    const handleClose = useCallback(() => {
        if (isSaving) return;
        triggerHaptic('light');
        setIsClosing(true);
        // Wait for animation to complete
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    }, [onClose, isSaving]);

    // Save handler with haptic
    const handleSave = useCallback(() => {
        triggerHaptic('medium');
        handleSaveProfile();
    }, [handleSaveProfile]);

    // Backdrop click handler
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    // Validation
    const isNameValid = editName.trim().length > 0;
    const isUsernameValid = /^[a-zA-Z0-9_-]*$/.test(editUsername);
    const canSave = isNameValid && isUsernameValid && !isSaving;

    // Portal content
    const modalContent = (
        <AnimatePresence>
            {isOpen && !isClosing && (
                <div
                    className="fixed inset-0"
                    style={{ zIndex: 9999 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${baseId}-title`}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={handleBackdropClick}
                        aria-hidden="true"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 350,
                            mass: 0.8
                        }}
                        className="absolute bottom-0 left-0 right-0 max-h-[92vh] flex flex-col bg-[#0a0a0f] rounded-t-[28px] overflow-hidden"
                    >
                        {/* Top Glow Effect - Enhanced */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-600/20 to-transparent pointer-events-none" />

                        {/* Drag Handle */}
                        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSaving}
                                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                                aria-label="Close"
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>

                            {/* Title */}
                            <h2
                                id={`${baseId}-title`}
                                className="text-lg font-bold text-white"
                            >
                                Edit Profile
                            </h2>

                            {/* Save Button */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!canSave}
                                className="flex items-center justify-center h-10 px-5 -mr-2 text-sm font-bold rounded-full bg-violet-600 text-white disabled:bg-white/10 disabled:text-white/40 active:scale-95 transition-all"
                                aria-label={isSaving ? 'Saving...' : 'Save changes'}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="mx-5 h-px bg-white/10" />

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-6">
                            {/* Display Name Field */}
                            <div className="space-y-3">
                                <Label
                                    htmlFor={nameInputId}
                                    className="flex items-center gap-3 text-sm font-medium text-white/90"
                                >
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30">
                                        <User className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <span className="flex-1">Display Name</span>
                                    <span className="text-xs text-violet-400/70 font-normal">Required</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={nameInputId}
                                        name="displayName"
                                        type="text"
                                        autoComplete="name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Your display name"
                                        className="h-14 px-4 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/[0.07] rounded-2xl text-white text-base placeholder:text-white/30 transition-all"
                                        aria-required="true"
                                        aria-invalid={!isNameValid && editName.length > 0}
                                    />
                                    {isNameValid && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="space-y-3">
                                <Label
                                    htmlFor={usernameInputId}
                                    className="flex items-center gap-3 text-sm font-medium text-white/90"
                                >
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                        <AtSign className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span>Username</span>
                                </Label>
                                <div className="relative">
                                    <span
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/60 text-base font-medium pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        @
                                    </span>
                                    <Input
                                        id={usernameInputId}
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        className="h-14 pl-9 pr-4 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/[0.07] rounded-2xl text-white text-base placeholder:text-white/30 transition-all"
                                        placeholder="username"
                                        aria-describedby={`${usernameInputId}-hint`}
                                    />
                                    {editUsername && isUsernameValid && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <p
                                    id={`${usernameInputId}-hint`}
                                    className="text-xs text-white/40 pl-1"
                                >
                                    Letters, numbers, underscores, and dashes only
                                </p>
                            </div>

                            {/* Bio Field */}
                            <div className="space-y-3">
                                <Label
                                    htmlFor={bioInputId}
                                    className="flex items-center gap-3 text-sm font-medium text-white/90"
                                >
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30">
                                        <FileText className="w-4 h-4 text-fuchsia-400" />
                                    </div>
                                    <span>Bio</span>
                                </Label>
                                <Textarea
                                    id={bioInputId}
                                    name="bio"
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    className="min-h-[130px] px-4 py-4 bg-white/5 border-white/10 focus:border-violet-500/50 focus:bg-white/[0.07] rounded-2xl text-white text-base placeholder:text-white/30 resize-none transition-all"
                                    placeholder="Tell others about yourself..."
                                    maxLength={160}
                                    aria-describedby={`${bioInputId}-counter`}
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs text-white/40">
                                        Visible on your profile
                                    </span>
                                    <span
                                        id={`${bioInputId}-counter`}
                                        className={`text-xs font-medium tabular-nums ${editBio.length > 140
                                            ? 'text-amber-400'
                                            : 'text-white/50'
                                            }`}
                                        aria-live="polite"
                                    >
                                        {editBio.length}/160
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Safe Area Spacer */}
                            <div
                                className="h-6"
                                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                                aria-hidden="true"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Render via portal to ensure it appears above everything
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return null;
};
