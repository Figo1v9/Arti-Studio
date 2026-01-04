import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
    onFileSelect: (file: File) => void;
    currentImageUrl?: string;
    onRemoveImage?: () => void;
    uploading?: boolean;
    error?: string;
    disabled?: boolean;
}

export default function ImageDropzone({
    onFileSelect,
    currentImageUrl,
    onRemoveImage,
    uploading = false,
    error,
    disabled = false,
}: ImageDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || uploading) return;

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, [disabled, uploading]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (disabled || uploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
                onFileSelect(file);
            }
        }
    }, [disabled, uploading, onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || uploading) return;

        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
                onFileSelect(file);
            }
        }
    }, [disabled, uploading, onFileSelect]);

    const handleRemove = useCallback(() => {
        setPreviewUrl(null);
        if (onRemoveImage) {
            onRemoveImage();
        }
    }, [onRemoveImage]);



    const displayUrl = previewUrl || currentImageUrl;

    return (
        <div className="space-y-2">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden',
                    'min-h-[200px] flex items-center justify-center',
                    isDragActive
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/20 hover:border-white/40 bg-white/5',
                    disabled && 'opacity-50 cursor-not-allowed',
                    error && 'border-red-500/50'
                )}
            >
                {displayUrl ? (
                    // Image Preview
                    <div className="relative w-full h-full min-h-[200px]">
                        <img
                            src={displayUrl}
                            alt="Preview"
                            className="w-full h-full object-contain max-h-[300px]"
                        />
                        {!uploading && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <p className="text-sm">Uploading...</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Dropzone
                    <label className="flex flex-col items-center justify-center cursor-pointer p-6 text-center w-full h-full">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileInput}
                            className="hidden"
                            disabled={disabled || uploading}
                        />
                        <div className={cn(
                            'p-4 rounded-full mb-4 transition-colors',
                            isDragActive ? 'bg-violet-500/20' : 'bg-white/10'
                        )}>
                            {uploading ? (
                                <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                            ) : isDragActive ? (
                                <Upload className="w-10 h-10 text-violet-400" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <p className="text-white font-medium mb-1">
                            {isDragActive ? 'Drop image here' : 'Drag & drop or paste image here'}
                        </p>
                        <p className="text-gray-400 text-sm mb-3">
                            or click to select a file
                        </p>
                        <p className="text-gray-500 text-xs">
                            PNG, JPG, GIF, WebP - max 10MB
                        </p>
                    </label>
                )}
            </div>

            {error && (
                <p className="text-red-400 text-sm">{error}</p>
            )}
        </div>
    );
}
