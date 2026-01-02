/**
 * AddToCollectionDropdown Component
 * Dropdown menu for adding an image to collections (used in ImageModal)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Check, Plus, Loader2 } from 'lucide-react';
import { useCollectionPicker } from '@/hooks/useCollections';
import { useAuth } from '@/components/auth';
import { createCollection } from '@/services/collections.service';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AddToCollectionDropdownProps {
    imageId: string;
    trigger?: React.ReactNode;
    align?: 'start' | 'center' | 'end';
}

export function AddToCollectionDropdown({
    imageId,
    trigger,
    align = 'end'
}: AddToCollectionDropdownProps) {
    const { user } = useAuth();
    const { collections, selectedIds, loading, toggle, refresh } = useCollectionPicker(imageId);
    const [open, setOpen] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    if (!user) return null;

    const handleCreate = async () => {
        if (!newName.trim() || !user?.uid) return;

        setCreating(true);
        try {
            const collection = await createCollection(user.uid, newName.trim());
            if (collection) {
                // Add the image to the new collection
                await toggle(collection.id);
                setNewName('');
                setShowCreate(false);
                await refresh();
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <FolderPlus className="w-4 h-4" />
                        Save
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent align={align} className="w-72 p-0">
                <div className="p-3 border-b border-border">
                    <h4 className="font-medium text-sm">Add to Collection</h4>
                </div>

                <ScrollArea className="max-h-64">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : collections.length === 0 && !showCreate ? (
                        <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                                No collections yet
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCreate(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Collection
                            </Button>
                        </div>
                    ) : (
                        <div className="p-2">
                            <AnimatePresence mode="popLayout">
                                {collections.map((collection) => {
                                    const isSelected = selectedIds.has(collection.id);
                                    return (
                                        <motion.button
                                            key={collection.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => toggle(collection.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                                isSelected
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-primary border-primary"
                                                    : "border-muted-foreground/30"
                                            )}>
                                                {isSelected && (
                                                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {collection.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {collection.image_count} images
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>

                {/* Create New Collection */}
                <div className="p-2 border-t border-border">
                    {showCreate ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                        >
                            <Input
                                placeholder="Collection name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                                disabled={creating}
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => { setShowCreate(false); setNewName(''); }}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleCreate}
                                    disabled={creating || !newName.trim()}
                                >
                                    {creating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Create'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={() => setShowCreate(true)}
                        >
                            <Plus className="w-4 h-4" />
                            New Collection
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
