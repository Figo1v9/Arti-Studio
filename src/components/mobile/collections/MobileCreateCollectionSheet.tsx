/**
 * MobileCreateCollectionSheet Component
 * Bottom sheet for creating collections on mobile using Vaul Drawer
 */

import { useState, useEffect } from 'react';
import { FolderPlus, Globe, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import type { Collection } from '@/types/database.types';

interface MobileCreateCollectionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, description?: string, isPublic?: boolean) => Promise<Collection | null>;
}

export function MobileCreateCollectionSheet({
    open,
    onOpenChange,
    onCreate
}: MobileCreateCollectionSheetProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    // Reset form when opening
    useEffect(() => {
        if (open) {
            setName('');
            setDescription('');
            setIsPublic(true);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!name.trim() || loading) return;

        setLoading(true);
        try {
            const result = await onCreate(name.trim(), description.trim() || undefined, isPublic);
            if (result) {
                onOpenChange(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                className="max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DrawerHeader className="text-right">
                    <div className="flex items-center gap-2 justify-center">
                        <FolderPlus className="w-5 h-5 text-primary" />
                        <DrawerTitle>New Collection</DrawerTitle>
                    </div>
                    <DrawerDescription>
                        Organize your images into themed collections
                    </DrawerDescription>
                </DrawerHeader>

                {/* Form Content */}
                <div className="px-4 pb-4 space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Collection Name</label>
                        <Input
                            placeholder="e.g., Travel Photography"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            className="text-base h-12"
                            autoFocus
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description (optional)</label>
                        <Textarea
                            placeholder="What's this collection about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="text-base resize-none"
                        />
                    </div>

                    {/* Privacy Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl active:bg-muted transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {isPublic ? (
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-green-500" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                </div>
                            )}
                            <div className="text-left">
                                <p className="font-medium text-sm">
                                    {isPublic ? 'Public Collection' : 'Private Collection'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isPublic
                                        ? 'Anyone can view this collection'
                                        : 'Only you can see this collection'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isPublic ? 'bg-green-500' : 'bg-muted-foreground/30'}`}>
                            <div
                                className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                                style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }}
                            />
                        </div>
                    </button>
                </div>

                {/* Action Buttons */}
                <DrawerFooter className="pt-2 pb-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className="h-12 text-base font-medium"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            'Create Collection'
                        )}
                    </Button>
                    <DrawerClose asChild>
                        <Button
                            variant="outline"
                            className="h-12 text-base"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
