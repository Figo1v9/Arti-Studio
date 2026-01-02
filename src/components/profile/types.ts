export interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    bio: string | null;
    is_public: boolean;
    email_notifications: boolean;
    verification_tier: 'none' | 'blue' | 'gold';
    is_premium: boolean;
}
