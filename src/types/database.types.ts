
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    username: string | null;
                    avatar_url: string | null;
                    role: 'user' | 'admin';
                    created_at: string;
                    is_public: boolean;
                    email_notifications: boolean;
                    bio: string | null;
                    verification_tier: 'none' | 'blue' | 'gold';
                    is_premium: boolean;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    username?: string | null;
                    avatar_url?: string | null;
                    role?: 'user' | 'admin';
                    created_at?: string;
                    is_public?: boolean;
                    email_notifications?: boolean;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    username?: string | null;
                    avatar_url?: string | null;
                    role?: 'user' | 'admin';
                    created_at?: string;
                    is_public?: boolean;
                    email_notifications?: boolean;
                };
                Relationships: [];
            };
            follows: {
                Row: {
                    follower_id: string;
                    following_id: string;
                    created_at: string;
                };
                Insert: {
                    follower_id: string;
                    following_id: string;
                    created_at?: string;
                };
                Update: {
                    follower_id?: string;
                    following_id?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "follows_follower_id_fkey";
                        columns: ["follower_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "follows_following_id_fkey";
                        columns: ["following_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            favorites: {
                Row: {
                    id: string;
                    user_id: string;
                    image_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    image_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    image_id?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "favorites_image_id_fkey";
                        columns: ["image_id"];
                        referencedRelation: "gallery_images";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "favorites_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            gallery_images: {
                Row: {
                    id: string;
                    title: string;
                    prompt: string;
                    url: string;
                    category: string;
                    author_id: string;
                    width: number;
                    height: number;
                    likes: number;
                    views: number;
                    downloads: number;
                    copies: number;
                    aspect_ratio: number;
                    created_at: string;
                    is_featured: boolean;
                    tags: string[];
                    author_name?: string;
                    author?: {
                        username: string | null;
                        full_name: string | null;
                        avatar_url: string | null;
                    } | null;
                };
                Insert: {
                    id?: string;
                    title: string;
                    prompt: string;
                    url: string;
                    category: string;
                    author_id: string;
                    width: number;
                    height: number;
                    likes?: number;
                    views?: number;
                    downloads?: number;
                    created_at?: string;
                    is_featured?: boolean;
                    tags?: string[];
                };
                Update: {
                    id?: string;
                    title?: string;
                    prompt?: string;
                    url?: string;
                    category?: string;
                    author_id?: string;
                    width?: number;
                    height?: number;
                    likes?: number;
                    views?: number;
                    downloads?: number;
                    created_at?: string;
                    is_featured?: boolean;
                    tags?: string[];
                };
                Relationships: [
                    {
                        foreignKeyName: "gallery_images_author_id_fkey";
                        columns: ["author_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            categories: {
                Row: {
                    id: string;
                    label: string;
                    label_ar: string;
                    icon: string;
                    color: string;
                    sort_order: number;
                };
                Insert: {
                    id?: string;
                    label: string;
                    label_ar: string;
                    icon: string;
                    color: string;
                    sort_order?: number;
                };
                Update: {
                    id?: string;
                    label?: string;
                    label_ar?: string;
                    icon?: string;
                    color?: string;
                    sort_order?: number;
                };
            };
            site_stats: {
                Row: {
                    id: string;
                    total_views: number;
                    total_copies: number;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    total_views?: number;
                    total_copies?: number;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    total_views?: number;
                    total_copies?: number;
                    updated_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    title: string;
                    message: string;
                    type: 'info' | 'warning' | 'success' | 'promo';
                    target_audience: 'all' | 'admins' | 'users';
                    link?: string | null;
                    created_at: string;
                    expires_at?: string | null;
                };
                Insert: {
                    id?: string;
                    title: string;
                    message: string;
                    type: 'info' | 'warning' | 'success' | 'promo';
                    target_audience: 'all' | 'admins' | 'users';
                    link?: string | null;
                    created_at?: string;
                    expires_at?: string | null;
                };
                Update: {
                    id?: string;
                    title?: string;
                    message?: string;
                    type?: 'info' | 'warning' | 'success' | 'promo';
                    target_audience?: 'all' | 'admins' | 'users';
                    link?: string | null;
                    created_at?: string;
                    expires_at?: string | null;
                };
            };
            notification_reads: {
                Row: {
                    id: string;
                    notification_id: string;
                    user_id: string;
                    read_at: string;
                };
                Insert: {
                    id?: string;
                    notification_id: string;
                    user_id: string;
                    read_at?: string;
                };
                Update: {
                    id?: string;
                    notification_id?: string;
                    user_id?: string;
                    read_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    admin_id: string | null;
                    action: string;
                    details: Json | null;
                    ip_address: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    admin_id?: string | null;
                    action: string;
                    details?: Json | null;
                    ip_address?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    admin_id?: string | null;
                    action?: string;
                    details?: Json | null;
                    ip_address?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "audit_logs_admin_id_fkey";
                        columns: ["admin_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            search_analytics: {
                Row: {
                    id: string;
                    query: string;
                    user_id: string | null;
                    results_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    query: string;
                    user_id?: string | null;
                    results_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    query?: string;
                    user_id?: string | null;
                    results_count?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "search_analytics_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            reports: {
                Row: {
                    id: string;
                    reporter_id: string | null;
                    target_id: string;
                    target_type: string;
                    reason: string;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    reporter_id?: string | null;
                    target_id: string;
                    target_type: string;
                    reason: string;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    reporter_id?: string | null;
                    target_id?: string;
                    target_type?: string;
                    reason?: string;
                    status?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "reports_reporter_id_fkey";
                        columns: ["reporter_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            announcements: {
                Row: {
                    id: string;
                    title: string;
                    message: string | null;
                    link: string | null;
                    is_active: boolean;
                    start_date: string | null;
                    end_date: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    message?: string | null;
                    link?: string | null;
                    is_active?: boolean;
                    start_date?: string | null;
                    end_date?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    message?: string | null;
                    link?: string | null;
                    is_active?: boolean;
                    start_date?: string | null;
                    end_date?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            collections: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    cover_image_url: string | null;
                    is_public: boolean;
                    image_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    cover_image_url?: string | null;
                    is_public?: boolean;
                    image_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    cover_image_url?: string | null;
                    is_public?: boolean;
                    image_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "collections_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            collection_images: {
                Row: {
                    id: string;
                    collection_id: string;
                    image_id: string;
                    added_at: string;
                    sort_order: number;
                };
                Insert: {
                    id?: string;
                    collection_id: string;
                    image_id: string;
                    added_at?: string;
                    sort_order?: number;
                };
                Update: {
                    id?: string;
                    collection_id?: string;
                    image_id?: string;
                    added_at?: string;
                    sort_order?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "collection_images_collection_id_fkey";
                        columns: ["collection_id"];
                        referencedRelation: "collections";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "collection_images_image_id_fkey";
                        columns: ["image_id"];
                        referencedRelation: "gallery_images";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            // Moderation Service
            update_report_status: {
                Args: {
                    p_report_id: string;
                    p_status: string;
                };
                Returns: void;
            };
            submit_report: {
                Args: {
                    p_reporter_id: string | null;
                    p_target_id: string;
                    p_target_type: string;
                    p_reason: string;
                };
                Returns: void;
            };
            get_pending_reports: {
                Args: {
                    p_status: string;
                };
                Returns: Database['public']['Tables']['reports']['Row'][];
            };

            // Gallery Service
            increment_views_batch: {
                Args: {
                    payload: Json;
                };
                Returns: void;
            };
            increment_copies_batch: {
                Args: {
                    payload: Json;
                };
                Returns: void;
            };

            // Recommendations Service
            get_trending_images_v2: {
                Args: {
                    p_limit: number;
                    p_offset: number;
                    p_category: string | null;
                };
                Returns: {
                    id: string;
                    url: string;
                    prompt: string;
                    category: string;
                    tags: string[] | null;
                    author_id: string;
                    author_name?: string;
                    author_username?: string;
                    author_avatar?: string;
                    views: number;
                    copies: number;
                    aspect_ratio: number;
                    created_at: string;
                    trending_score: number;
                }[];
            };
            update_trending_cache: {
                Args: Record<string, never>;
                Returns: { images_processed: number; execution_ms: number };
            };
            get_trending_stats: {
                Args: Record<string, never>;
                Returns: {
                    total_cached: number;
                    last_updated: string;
                    avg_score: number;
                };
            };

            // Analytics Service
            get_analytics_summary: {
                Args: {
                    start_date: string;
                    end_date: string;
                };
                Returns: {
                    new_users: number;
                    new_images: number;
                    total_views: number;
                    total_copies: number;
                    period_views: number;
                    total_searches: number;
                };
            };
            get_growth_data: {
                Args: {
                    start_date: string;
                    end_date: string;
                };
                Returns: { day: string; users_count: number; images_count: number }[];
            };
            get_top_searches_in_period: {
                Args: {
                    start_date: string;
                    end_date: string;
                    limit_count: number;
                };
                Returns: { term: string; search_count: number }[];
            };
            get_most_active_users: {
                Args: {
                    limit_count: number;
                };
                Returns: {
                    id: string;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    images_count: number;
                    total_views: number;
                    total_copies: number;
                }[];
            };
            get_category_stats: {
                Args: Record<string, never>;
                Returns: {
                    category: string;
                    images_count: number;
                    total_views: number;
                    total_copies: number;
                }[];
            };
            get_top_images: {
                Args: {
                    order_by_field: string;
                    limit_count: number;
                };
                Returns: {
                    id: string;
                    title: string;
                    url: string;
                    views: number;
                    copies: number;
                    category: string;
                }[];
            };

            // Profile Service
            admin_update_profile: {
                Args: {
                    p_admin_id: string;
                    p_target_user_id: string;
                    p_updates: Json; // Using Json to be flexible
                };
                Returns: { success: boolean; data?: Json; error?: string };
            };
            update_own_profile: {
                Args: {
                    p_user_id: string;
                    p_updates: Json;
                };
                Returns: { success: boolean; data?: Json; error?: string };
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

export type CategoryDB = Database['public']['Tables']['categories']['Row'];
export type GalleryImageDB = Database['public']['Tables']['gallery_images']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type SearchAnalytic = Database['public']['Tables']['search_analytics']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Collection = Database['public']['Tables']['collections']['Row'];
export type CollectionImage = Database['public']['Tables']['collection_images']['Row'];

