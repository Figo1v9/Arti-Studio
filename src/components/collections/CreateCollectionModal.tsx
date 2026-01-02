/**
 * CreateCollectionModal Component
 * Clean, modern design without neon effects
 */

import { useState, useEffect } from 'react';
import { FolderPlus, Globe, Lock, Loader2, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Collection } from '@/types/database.types';

interface CreateCollectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (name: string, description?: string, isPublic?: boolean) => Promise<Collection | null>;
}

export function CreateCollectionModal({ open, onOpenChange, onCreate }: CreateCollectionModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setName('');
            setDescription('');
            setIsPublic(true);
            setLoading(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || loading) return;

        setLoading(true);
        try {
            const result = await onCreate(name.trim(), description.trim() || undefined, isPublic);
            if (result) {
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Error creating collection:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden border-border/40">
                {/* Header Section */}
                <div className="px-6 pt-6 pb-4 border-b border-border/30 bg-muted/20">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FolderPlus className="w-5 h-5 text-primary" />
                            </div>
                            Create New Collection
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2">
                            Organize your favorite images into a collection
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Collection Name */}
                    <div className="space-y-2">
                        <Label htmlFor="create-name" className="text-sm font-medium text-foreground">
                            Collection Name *
                        </Label>
                        <Input
                            id="create-name"
                            placeholder="e.g., My Favorite Landscapes"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            autoFocus
                            disabled={loading}
                            className="h-11 border-border/50 focus:border-primary bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                            {name.length}/100 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="create-desc" className="text-sm font-medium text-foreground">
                            Description <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            id="create-desc"
                            placeholder="Tell us what this collection is about..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            disabled={loading}
                            className="resize-none border-border/50 focus:border-primary bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-foreground">
                            Privacy Settings
                        </Label>

                        {/* Public Option */}
                        <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            disabled={loading}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${isPublic
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/40 hover:border-border bg-background'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPublic ? 'bg-primary/10' : 'bg-muted'
                                    }`}>
                                    <Globe className={`w-5 h-5 ${isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">Public Collection</p>
                                        {isPublic && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Anyone can view and discover this collection
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Private Option */}
                        <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            disabled={loading}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${!isPublic
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/40 hover:border-border bg-background'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${!isPublic ? 'bg-primary/10' : 'bg-muted'
                                    }`}>
                                    <Lock className={`w-5 h-5 ${!isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">Private Collection</p>
                                        {!isPublic && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Only you can see this collection
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 h-11"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FolderPlus className="w-4 h-4 mr-2" />
                                    Create Collection
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
