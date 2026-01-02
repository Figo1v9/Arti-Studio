// Shared category constants to avoid duplication
// Used by Sidebar.tsx, Header.tsx, and other components

import {
    Palette,
    Building2,
    Sofa,
    Shirt,
    Brush,
    Code,
    Heart,
    Zap,
    Boxes,
    Flame,
    LucideIcon,
} from 'lucide-react';

// Category gradient mappings for styling
export const CATEGORY_GRADIENTS: Record<string, string> = {
    design: 'from-violet-500 to-purple-600',
    architecture: 'from-blue-500 to-cyan-500',
    interior: 'from-amber-500 to-orange-500',
    fashion: 'from-pink-500 to-rose-500',
    art: 'from-red-500 to-pink-500',
    coding: 'from-emerald-500 to-teal-500',
    lovable: 'from-rose-500 to-red-500',
    bolt: 'from-yellow-400 to-amber-500',
    base44: 'from-cyan-500 to-blue-500',
    vite: 'from-orange-500 to-yellow-500',
};

// Category icon mappings
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    design: Palette,
    architecture: Building2,
    interior: Sofa,
    fashion: Shirt,
    art: Brush,
    coding: Code,
    lovable: Heart,
    bolt: Zap,
    base44: Boxes,
    vite: Flame,
};

// Category shadow colors for hover effects
export const CATEGORY_SHADOW_COLORS: Record<string, string> = {
    design: 'rgba(139, 92, 246, 0.4)',
    architecture: 'rgba(59, 130, 246, 0.4)',
    interior: 'rgba(245, 158, 11, 0.4)',
    fashion: 'rgba(236, 72, 153, 0.4)',
    art: 'rgba(239, 68, 68, 0.4)',
    coding: 'rgba(16, 185, 129, 0.4)',
    lovable: 'rgba(244, 63, 94, 0.4)',
    bolt: 'rgba(234, 179, 8, 0.4)',
    base44: 'rgba(6, 182, 212, 0.4)',
    vite: 'rgba(249, 115, 22, 0.4)',
};

// Map database color names to specific gradients
export const COLOR_GRADIENTS: Record<string, string> = {
    purple: 'from-violet-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    pink: 'from-pink-500 to-rose-500',
    red: 'from-red-500 to-pink-500',
    green: 'from-emerald-500 to-teal-500', // Nice coding green
    rose: 'from-rose-500 to-red-500',
    yellow: 'from-yellow-400 to-amber-500',
    cyan: 'from-cyan-500 to-blue-500',
    orange: 'from-orange-500 to-red-500',
};

export function getCategoryGradient(color: string | undefined): string {
    if (!color) return COLOR_GRADIENTS['purple'];
    return COLOR_GRADIENTS[color] || `from-${color}-500 to-${color}-600`;
}

// Helper function to get gradient shadow color
export function getGradientShadow(gradient: string): string {
    if (gradient.includes('violet') || gradient.includes('purple')) return 'rgba(139, 92, 246, 0.5)';
    if (gradient.includes('blue')) return 'rgba(59, 130, 246, 0.5)';
    if (gradient.includes('amber')) return 'rgba(245, 158, 11, 0.5)';
    if (gradient.includes('pink') || gradient.includes('rose')) return 'rgba(236, 72, 153, 0.5)';
    if (gradient.includes('red')) return 'rgba(239, 68, 68, 0.5)';
    if (gradient.includes('emerald') || gradient.includes('green') || gradient.includes('teal')) return 'rgba(16, 185, 129, 0.5)';
    if (gradient.includes('yellow')) return 'rgba(234, 179, 8, 0.5)';
    if (gradient.includes('cyan')) return 'rgba(6, 182, 212, 0.5)';
    if (gradient.includes('orange')) return 'rgba(249, 115, 22, 0.5)';
    return 'rgba(107, 114, 128, 0.5)';
}

// Helper function to get category color for shadow
// Now uses the gradient helper to ensure consistency
export function getCategoryColor(id: string): string {
    // Legacy fallback for ID-based lookup if needed, but we prefer gradient-based shadow derivation
    return CATEGORY_SHADOW_COLORS[id] || 'rgba(107, 114, 128, 0.4)';
}
