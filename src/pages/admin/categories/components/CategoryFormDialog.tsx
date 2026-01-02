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
import { Loader2 } from 'lucide-react';
import { getIconByName } from '@/lib/icons';

interface CategoryFormState {
    formLoading: boolean;
    formData: { id: string; label: string; icon: string; color: string; sort_order: number };
    setFormData: (data: { id: string; label: string; icon: string; color: string; sort_order: number }) => void;
    handleSubmit: (e: React.FormEvent) => void;
    resetForm: () => void;
}

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    formState: CategoryFormState;
}

const iconNames = [
    'Palette', 'Building2', 'Sofa', 'Shirt', 'Brush', 'Code',
    'Heart', 'Zap', 'Boxes', 'Flame', 'Image', 'Star', 'Sparkles'
];

const colorOptions = [
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'amber', class: 'bg-amber-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'rose', class: 'bg-rose-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'cyan', class: 'bg-cyan-500' },
    { name: 'orange', class: 'bg-orange-500' },
];

export function CategoryFormDialog({ open, onOpenChange, isEditing, formState }: CategoryFormDialogProps) {
    const {
        formLoading,
        formData,
        setFormData,
        handleSubmit,
        resetForm
    } = formState;

    const getIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-5 h-5" />;
    };

    const handleClose = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {isEditing ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Form to manage category details
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ID */}
                    {!isEditing && (
                        <div className="space-y-2">
                            <Label className="text-gray-300">Identifier (ID)</Label>
                            <Input
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
                                placeholder="design"
                                className="bg-white/5 border-white/10 text-white"
                                required
                                dir="ltr"
                            />
                        </div>
                    )}

                    {/* Label */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Name</Label>
                        <Input
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="Design"
                            className="bg-white/5 border-white/10 text-white"
                            required
                            dir="ltr"
                        />
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Icon</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {iconNames.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`p-3 rounded-lg border transition-colors ${formData.icon === icon
                                        ? 'bg-violet-500/20 border-violet-500'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {getIcon(icon)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.name })}
                                    className={`w-8 h-8 rounded-full ${color.class} ${formData.color === color.name
                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                        : ''
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                        <Label className="text-gray-300">Display Order</Label>
                        <Input
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                            className="bg-white/5 border-white/10 text-white"
                            dir="ltr"
                        />
                    </div>

                    {/* Actions */}
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
