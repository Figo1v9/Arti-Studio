import React, { useEffect, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, User, AtSign, FileText, Loader2, Check, Sparkles } from 'lucide-react';

interface EditProfileDesktopProps {
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

export const EditProfileDesktop: React.FC<EditProfileDesktopProps> = ({
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

    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // Validation states
    const isNameValid = editName.trim().length > 0;
    const isUsernameValid = /^[a-zA-Z0-9_-]*$/.test(editUsername);
    const canSave = isNameValid && isUsernameValid && !isSaving;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${baseId}-title`}
                >
                    {/* Backdrop with gradient */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        aria-hidden="true"
                    />

                    {/* Modal Container */}
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.92, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 30 }}
                        transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                            mass: 0.8
                        }}
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background with gradient overlay */}
                        <div className="absolute inset-0 bg-[hsl(var(--card))]" />
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-purple-500/[0.05]" />
                        <div className="absolute inset-0 border border-white/[0.08] rounded-3xl pointer-events-none" />

                        {/* Content Container */}
                        <div className="relative">
                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-4">
                                {/* Header gradient line */}
                                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" aria-hidden="true" />

                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                                            <Sparkles className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h2
                                                id={`${baseId}-title`}
                                                className="text-xl font-semibold text-white tracking-tight"
                                            >
                                                Edit Profile
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Customize your public presence
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-muted-foreground hover:text-white transition-all duration-200 group"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mx-6 h-[1px] bg-gradient-to-r from-white/[0.02] via-white/[0.08] to-white/[0.02]" aria-hidden="true" />

                            {/* Form */}
                            <div className="px-6 py-6 space-y-5">
                                {/* Display Name */}
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor={nameInputId}
                                        className="text-sm font-medium text-foreground/80 flex items-center gap-2.5"
                                    >
                                        <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                            <User className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        Display Name
                                        <span className="text-violet-400/80 text-xs font-normal">Required</span>
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id={nameInputId}
                                            name="displayName"
                                            type="text"
                                            autoComplete="name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Your display name"
                                            className="h-12 px-4 bg-white/[0.02] border-white/[0.08] hover:border-violet-500/30 focus:border-violet-500/50 focus:bg-white/[0.04] rounded-xl text-white placeholder:text-muted-foreground/60 transition-all duration-200 ring-0 focus:ring-2 focus:ring-violet-500/20"
                                            aria-required="true"
                                            aria-invalid={!isNameValid && editName.length > 0}
                                        />
                                        {isNameValid && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                aria-hidden="true"
                                            >
                                                <div className="p-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor={usernameInputId}
                                        className="text-sm font-medium text-foreground/80 flex items-center gap-2.5"
                                    >
                                        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <AtSign className="w-3.5 h-3.5 text-purple-400" />
                                        </div>
                                        Username
                                    </Label>
                                    <div className="relative group">
                                        <span
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400/60 text-sm font-medium pointer-events-none"
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
                                            className="h-12 pl-8 pr-4 bg-white/[0.02] border-white/[0.08] hover:border-violet-500/30 focus:border-violet-500/50 focus:bg-white/[0.04] rounded-xl text-white placeholder:text-muted-foreground/60 transition-all duration-200 ring-0 focus:ring-2 focus:ring-violet-500/20"
                                            placeholder="username"
                                            aria-describedby={`${usernameInputId}-hint`}
                                        />
                                        {editUsername && isUsernameValid && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                aria-hidden="true"
                                            >
                                                <div className="p-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                    <p
                                        id={`${usernameInputId}-hint`}
                                        className="text-xs text-muted-foreground/70 pl-1 flex items-center gap-1.5"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                                        Letters, numbers, underscores, and dashes only
                                    </p>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor={bioInputId}
                                        className="text-sm font-medium text-foreground/80 flex items-center gap-2.5"
                                    >
                                        <div className="p-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                                            <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
                                        </div>
                                        Bio
                                    </Label>
                                    <Textarea
                                        id={bioInputId}
                                        name="bio"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="min-h-[110px] px-4 py-3.5 bg-white/[0.02] border-white/[0.08] hover:border-violet-500/30 focus:border-violet-500/50 focus:bg-white/[0.04] rounded-xl text-white placeholder:text-muted-foreground/60 resize-none transition-all duration-200 ring-0 focus:ring-2 focus:ring-violet-500/20"
                                        placeholder="Tell the world about yourself..."
                                        maxLength={160}
                                        aria-describedby={`${bioInputId}-hint ${bioInputId}-counter`}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <span
                                            id={`${bioInputId}-hint`}
                                            className="text-xs text-muted-foreground/60"
                                        >
                                            Visible on your public profile
                                        </span>
                                        <span
                                            id={`${bioInputId}-counter`}
                                            className={`text-xs font-medium tabular-nums transition-colors ${editBio.length > 140
                                                    ? 'text-amber-400'
                                                    : editBio.length > 0
                                                        ? 'text-violet-400/70'
                                                        : 'text-muted-foreground/50'
                                                }`}
                                            aria-live="polite"
                                        >
                                            {editBio.length}/160
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="relative px-6 py-5">
                                {/* Footer gradient line */}
                                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden="true" />

                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="h-11 px-6 rounded-xl text-muted-foreground hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all duration-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={!canSave}
                                        className="h-11 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 border border-violet-400/20"
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
