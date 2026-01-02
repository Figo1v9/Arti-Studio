
import { FolderOpen, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoriesHeaderProps {
    count: number;
    onRefresh: () => void;
    onAdd: () => void;
}

export function CategoriesHeader({ count, onRefresh, onAdd }: CategoriesHeaderProps) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-violet-400" />
                    Categories Management
                </h1>
                <p className="text-gray-400 mt-1">
                    Total Categories: {count}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update
                </Button>
                <Button
                    onClick={onAdd}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>
        </div>
    );
}
