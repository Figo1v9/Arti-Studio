import { Compass, Flame, Heart, Folder, Upload, Trash2, FolderPlus, User, Users } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'explore', label: 'Explore', icon: Compass, gradient: 'from-violet-500 to-purple-600' },
    { id: 'following', label: 'Following', icon: Users, gradient: 'from-blue-600 to-indigo-600', requiresAuth: true },
    { id: 'trends', label: 'Trend now', icon: Flame, gradient: 'from-orange-500 to-red-500' },
    { id: 'favorites', label: 'Favorites', icon: Heart, gradient: 'from-rose-500 to-pink-500', requiresAuth: true },
    { id: 'profile', label: 'Profile', icon: User, gradient: 'from-blue-500 to-cyan-500', requiresAuth: true },
];

export const LIBRARY_ITEMS = [
    { id: 'my-media', label: 'My media', icon: Folder, gradient: 'from-amber-500 to-orange-500' },
    { id: 'uploads', label: 'Uploads', icon: Upload, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'trash', label: 'Trash', icon: Trash2, gradient: 'from-gray-500 to-slate-600' },
    { id: 'new-folder', label: 'New folder', icon: FolderPlus, gradient: 'from-indigo-500 to-violet-500' },
];
