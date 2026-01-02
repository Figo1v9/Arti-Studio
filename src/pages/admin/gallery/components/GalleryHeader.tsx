
import { Images } from 'lucide-react';

interface GalleryHeaderProps {
    totalImages: number;
}

export function GalleryHeader({ totalImages }: GalleryHeaderProps) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Images className="w-6 h-6 text-violet-400" />
                Gallery Management
            </h1>
            <p className="text-gray-400 mt-1">
                Total Items: {totalImages}
            </p>
        </div>
    );
}
