import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatImagesForExport, exportToCSV } from '@/lib/exportUtils';
import { Category } from '@/types/gallery';
import { GalleryImageDB } from '@/types/database.types';

interface GalleryToolbarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    categories: Category[];
    filteredImages: GalleryImageDB[];
    imagesCount: number;
    categoryLabels: Record<string, string>;
    fetchImages: (load?: boolean) => void;
    onOpenAddModal: () => void;
    limit: number;
    setLimit: (val: number) => void;
}

export function GalleryToolbar({
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredImages,
    categoryLabels,
    fetchImages,
    onOpenAddModal,
    limit,
    setLimit
}: GalleryToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
                <Button
                    onClick={() => {
                        const formatted = formatImagesForExport(filteredImages, { categoryLabels });
                        exportToCSV(formatted, `gallery-export-${new Date().toISOString().split('T')[0]}`);
                        toast.success('Gallery exported successfully!');
                    }}
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
                <Button
                    onClick={() => fetchImages(true)}
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
                <Button
                    onClick={onOpenAddModal}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                        placeholder="Search by prompt or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                </div>

                {/* Limit Selector */}
                <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Show" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">Show 10</SelectItem>
                        <SelectItem value="50">Show 50</SelectItem>
                        <SelectItem value="100">Show 100</SelectItem>
                        <SelectItem value="0">Show All</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
