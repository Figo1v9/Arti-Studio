/**
 * MobileAddToCollectionSheet Component
 * Bottom sheet for adding image to collection on mobile
 * Uses Drawer for proper z-index handling and inline creation mode
 * Features beautiful shared layout animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FolderPlus, Check, Plus, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useCollectionPicker } from '@/hooks/useCollections';
import { useAuth } from '@/components/auth';
import { createCollection } from '@/services/collections.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface MobileAddToCollectionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageId: string;
}

type ViewMode = 'list' | 'create';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.15 }
    }
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 100 : -100,
        opacity: 0,
        transition: { duration: 0.2 }
    })
};

export function MobileAddToCollectionSheet({
    open,
    onOpenChange,
    imageId
}: MobileAddToCollectionSheetProps) {
    const { user } = useAuth();
    const { collections, selectedIds, loading, toggle, refresh } = useCollectionPicker(imageId);

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [slideDirection, setSlideDirection] = useState(1);

    // Reset state when closing
    useEffect(() => {
        if (!open) {
            // Delay reset to allow exit animation
            const timer = setTimeout(() => {
                setViewMode('list');
                setNewName('');
                setSlideDirection(1);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Handle creating new collection
    const handleCreate = async () => {
        if (!newName.trim() || !user?.uid || creating) return;

        setCreating(true);
        try {
            const collection = await createCollection(user.uid, newName.trim());
            if (collection) {
                await toggle(collection.id);
                setNewName('');
                setSlideDirection(-1);
                setViewMode('list');
                await refresh();
            }
        } finally {
            setCreating(false);
        }
    };

    // Switch to create mode
    const handleNewCollection = () => {
        setSlideDirection(1);
        setViewMode('create');
        setNewName('');
    };

    // Go back to list
    const handleBackToList = () => {
        setSlideDirection(-1);
        setViewMode('list');
        setNewName('');
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                className="max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <LayoutGroup>
                    {/* Animated Header */}
                    <DrawerHeader className="pb-2">
                        <AnimatePresence mode="wait" initial={false}>
                            {viewMode === 'list' ? (
                                <motion.div
                                    key="list-header"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className="flex items-center gap-2 justify-center"
                                        layoutId="header-icon-container"
                                    >
                                        <motion.div layoutId="header-icon">
                                            <FolderPlus className="w-5 h-5 text-primary" />
                                        </motion.div>
                                        <DrawerTitle>
                                            {selectedIds.size > 0 ? 'Manage Collections' : 'Save to Collection'}
                                        </DrawerTitle>
                                    </motion.div>
                                    <DrawerDescription>
                                        {selectedIds.size > 0
                                            ? `This image is in ${selectedIds.size} collection${selectedIds.size > 1 ? 's' : ''} • Tap to remove`
                                            : 'Choose a collection or create a new one'
                                        }
                                    </DrawerDescription>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="create-header"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.button
                                            onClick={handleBackToList}
                                            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
                                            whileTap={{ scale: 0.9 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </motion.button>
                                        <motion.div
                                            className="flex items-center gap-2"
                                            layoutId="header-icon-container"
                                        >
                                            <motion.div layoutId="header-icon">
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            </motion.div>
                                            <DrawerTitle>New Collection</DrawerTitle>
                                        </motion.div>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <DrawerDescription className="text-left pl-10">
                                            Name your new collection
                                        </DrawerDescription>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </DrawerHeader>

                    {/* Animated Content */}
                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
                            {viewMode === 'list' ? (
                                <motion.div
                                    key="list-content"
                                    custom={slideDirection}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="px-4 pb-8"
                                >
                                    {loading ? (
                                        <motion.div
                                            className="flex items-center justify-center py-12"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </motion.div>
                                    ) : collections.length === 0 ? (
                                        // Empty state with animation
                                        <motion.div
                                            className="py-8 text-center"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <motion.div
                                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FolderPlus className="w-8 h-8 text-primary" />
                                            </motion.div>
                                            <motion.p
                                                className="text-muted-foreground mb-4"
                                                variants={itemVariants}
                                            >
                                                No collections yet
                                            </motion.p>
                                            <motion.div variants={itemVariants}>
                                                <Button
                                                    onClick={handleNewCollection}
                                                    className="px-6"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Your First Collection
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {/* Collections list with stagger animation */}
                                            <motion.div
                                                className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                {collections.map((collection, index) => {
                                                    const isSelected = selectedIds.has(collection.id);
                                                    return (
                                                        <motion.button
                                                            key={collection.id}
                                                            variants={itemVariants}
                                                            custom={index}
                                                            onClick={() => toggle(collection.id)}
                                                            whileTap={{ scale: 0.98 }}
                                                            layout
                                                            className={cn(
                                                                "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
                                                                isSelected
                                                                    ? "bg-primary/10 ring-2 ring-primary/30"
                                                                    : "bg-muted/30 active:bg-muted/50"
                                                            )}
                                                        >
                                                            <motion.div
                                                                className={cn(
                                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0",
                                                                    isSelected
                                                                        ? "bg-primary border-primary"
                                                                        : "border-muted-foreground/30"
                                                                )}
                                                                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <AnimatePresence mode="wait">
                                                                    {isSelected && (
                                                                        <motion.div
                                                                            initial={{ scale: 0, rotate: -90 }}
                                                                            animate={{ scale: 1, rotate: 0 }}
                                                                            exit={{ scale: 0, rotate: 90 }}
                                                                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                                        >
                                                                            <Check className="w-4 h-4 text-primary-foreground" />
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </motion.div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className={cn(
                                                                    "font-medium truncate transition-colors",
                                                                    isSelected && "text-primary"
                                                                )}>
                                                                    {collection.name}
                                                                </p>
                                                                <p className={cn(
                                                                    "text-sm transition-colors",
                                                                    isSelected
                                                                        ? "text-primary/70"
                                                                        : "text-muted-foreground"
                                                                )}>
                                                                    {isSelected
                                                                        ? '✓ Saved • Tap to remove'
                                                                        : `${collection.image_count} images`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </motion.div>

                                            {/* New Collection Button */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12"
                                                    onClick={handleNewCollection}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    New Collection
                                                </Button>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                // ==== CREATE MODE ====
                                <motion.div
                                    key="create-content"
                                    custom={slideDirection}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="px-4 pb-8 space-y-4"
                                >
                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="text-sm font-medium">Collection Name</label>
                                        <Input
                                            placeholder="e.g., Travel Photography"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="h-12 text-base"
                                            autoFocus
                                            disabled={creating}
                                            maxLength={100}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newName.trim()) {
                                                    handleCreate();
                                                }
                                            }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className="flex gap-3 pt-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12"
                                            onClick={handleBackToList}
                                            disabled={creating}
                                        >
                                            Cancel
                                        </Button>
                                        <motion.div
                                            className="flex-1"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                className="w-full h-12"
                                                onClick={handleCreate}
                                                disabled={creating || !newName.trim()}
                                            >
                                                {creating ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create & Add'
                                                )}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </LayoutGroup>
            </DrawerContent>
        </Drawer>
    );
}
