import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import ImageDropzone from '@/components/ui/ImageDropzone';
import { AI_PROVIDERS, AIProvider } from '@/services/ai.service';
import { Category } from '@/types/gallery';

interface GalleryFormState {
    formLoading: boolean;
    uploadingImage: boolean;
    uploadError: string | null;
    generatingTags: boolean;
    aiProvider: AIProvider;
    setAiProvider: (provider: AIProvider) => void;
    formData: { url: string; title: string; prompt: string; category: string; tags: string; aspect_ratio: number };
    setFormData: (data: { url: string; title: string; prompt: string; category: string; tags: string; aspect_ratio: number }) => void;
    handleFileSelect: (file: File) => void;
    handleGenerateTags: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    resetForm: () => void;
    setSelectedFile: (file: File | null) => void;
}

interface GalleryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    formState: GalleryFormState;
    categories: Category[];
}

export function GalleryFormDialog({
    open,
    onOpenChange,
    isEditing,
    formState,
    categories
}: GalleryFormDialogProps) {
    const {
        formLoading,
        uploadingImage,
        uploadError,
        generatingTags,
        aiProvider,
        setAiProvider,
        formData,
        setFormData,
        handleFileSelect,
        handleGenerateTags,
        handleSubmit,
        resetForm,
        setSelectedFile
    } = formState;

    const handleClose = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {isEditing ? 'Edit Image' : 'Add New Image'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Fill in the image details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Image File</Label>
                        <ImageDropzone
                            onFileSelect={handleFileSelect}
                            currentImageUrl={formData.url}
                            onRemoveImage={() => {
                                setFormData({ ...formData, url: '' });
                                setSelectedFile(null);
                            }}
                            uploading={uploadingImage}
                            error={uploadError || undefined}
                            disabled={formLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Image title..."
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Prompt</Label>
                        <Textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            placeholder="Enter full prompt here..."
                            className="bg-white/5 border-white/10 text-white min-h-24"
                            required
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-gray-300">Tags (comma separated)</Label>
                            <div className="flex items-center gap-2">
                                <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProvider)}>
                                    <SelectTrigger className="w-36 h-8 text-xs bg-white/5 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AI_PROVIDERS.filter(p => p.available).map((provider) => (
                                            <SelectItem key={provider.id} value={provider.id}>
                                                {provider.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleGenerateTags}
                                    disabled={generatingTags || !formData.prompt.trim()}
                                    className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-1.5"
                                >
                                    {generatingTags ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Generate
                                </Button>
                            </div>
                        </div>
                        <Input
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="design, modern, minimal"
                            className="bg-white/5 border-white/10 text-white"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">Aspect Ratio (Auto)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.aspect_ratio}
                            onChange={(e) => setFormData({ ...formData, aspect_ratio: parseFloat(e.target.value) })}
                            className="bg-white/5 border-white/10 text-white"
                            dir="ltr"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            className="bg-white/5 border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={formLoading}
                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {formLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                isEditing ? 'Update' : 'Add'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
