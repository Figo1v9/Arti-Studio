
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Copy, Star } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { GalleryImageDB } from '@/types/database.types';
import { Category } from '@/types/gallery';

interface GalleryTableProps {
    images: GalleryImageDB[];
    filteredImages: GalleryImageDB[];
    loading: boolean;
    categories: Category[];
    onEdit: (image: GalleryImageDB) => void;
    onDelete: (id: string) => void;
    onToggleFeatured: (image: GalleryImageDB) => void;
}

export function GalleryTable({
    images,
    filteredImages,
    loading,
    categories,
    onEdit,
    onDelete,
    onToggleFeatured
}: GalleryTableProps) {
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-16">
                                <Star className="w-4 h-4 inline" />
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-16">
                                Preview
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Title / Prompt
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                                Category
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-20">
                                <Eye className="w-4 h-4 inline" />
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-20">
                                <Copy className="w-4 h-4 inline" />
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-28">
                                Date
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 rounded-lg bg-white/10" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="h-4 w-48 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-64 bg-white/5 rounded" />
                                    </td>
                                    <td className="px-4 py-3"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-8 bg-white/10 rounded mx-auto" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-8 bg-white/10 rounded mx-auto" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                                    <td className="px-4 py-3"><div className="h-4 w-16 bg-white/10 rounded mx-auto" /></td>
                                </tr>
                            ))
                        ) : filteredImages.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                    No images found
                                </td>
                            </tr>
                        ) : (
                            filteredImages.map((image) => (
                                <tr
                                    key={image.id}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-4 py-3 text-center">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={cn(
                                                "h-8 w-8 transition-colors",
                                                image.is_featured ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10" : "text-gray-600 hover:text-gray-400"
                                            )}
                                            onClick={() => onToggleFeatured(image)}
                                            title={image.is_featured ? "Remove from Featured" : "Add to Featured"}
                                        >
                                            <Star className={cn("w-4 h-4", image.is_featured && "fill-current")} />
                                        </Button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-white font-medium text-sm truncate max-w-xs">
                                            {image.title || 'Untitled'}
                                        </p>
                                        <p className="text-gray-500 text-xs truncate max-w-sm mt-0.5" dir="ltr">
                                            {image.prompt.slice(0, 80)}{image.prompt.length > 80 ? '...' : ''}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 whitespace-nowrap">
                                            {categories.find(c => c.id === image.category)?.label || image.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-gray-300 text-sm">{image.views.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-gray-300 text-sm">{image.copies.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-400 text-xs whitespace-nowrap">
                                            {formatDate(image.created_at)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:bg-white/10"
                                                onClick={() => onEdit(image)}
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4 text-gray-400" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:bg-red-500/20"
                                                onClick={() => onDelete(image.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {!loading && filteredImages.length > 0 && (
                <div className="px-4 py-3 bg-white/5 border-t border-white/10 text-gray-400 text-sm">
                    Showing {filteredImages.length} of {images.length} images
                </div>
            )}
        </div>
    );
}
