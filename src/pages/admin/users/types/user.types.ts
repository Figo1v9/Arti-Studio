/**
 * Extended User Profile with computed statistics
 * Used in the Admin Users Management section
 */

import { Profile } from '@/types/database.types';

/**
 * User statistics computed from related tables
 */
export interface UserStats {
    /** Number of users following this user */
    followersCount: number;
    /** Total copies across all images uploaded by this user */
    totalCopies: number;
    /** Total times this user's images were added to favorites by others */
    totalFavorites: number;
    /** Total images uploaded by this user */
    imagesCount: number;
}

/**
 * Extended Profile with computed statistics
 */
export interface UserWithStats extends Profile {
    stats: UserStats;
}

/**
 * Sort options for user list
 */
export type UserSortField =
    | 'created_at'
    | 'followers'
    | 'copies'
    | 'favorites'
    | 'images';

export type SortDirection = 'asc' | 'desc';

export interface UserSortOption {
    field: UserSortField;
    direction: SortDirection;
    label: string;
}

/**
 * Predefined sort options for the UI
 */
export const USER_SORT_OPTIONS: UserSortOption[] = [
    { field: 'created_at', direction: 'desc', label: 'Newest First' },
    { field: 'created_at', direction: 'asc', label: 'Oldest First' },
    { field: 'followers', direction: 'desc', label: 'Most Followers' },
    { field: 'followers', direction: 'asc', label: 'Least Followers' },
    { field: 'copies', direction: 'desc', label: 'Most Copies' },
    { field: 'copies', direction: 'asc', label: 'Least Copies' },
    { field: 'favorites', direction: 'desc', label: 'Most Favorites' },
    { field: 'favorites', direction: 'asc', label: 'Least Favorites' },
    { field: 'images', direction: 'desc', label: 'Most Images' },
    { field: 'images', direction: 'asc', label: 'Least Images' },
];
