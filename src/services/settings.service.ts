/**
 * Settings Service
 * Handles site-wide settings persistence in Supabase
 * Uses a key-value approach in site_settings table
 */

import { supabase } from '@/lib/supabase';

export interface SiteSettings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    allowGoogleLogin: boolean;
    darkModeDefault: boolean;
    showViews: boolean;
    showCopies: boolean;
    enableProtection: boolean;
    disableRightClick: boolean;
    r2Endpoint: string;
    r2Bucket: string;
}

// Default settings - used when no settings exist yet
export const DEFAULT_SETTINGS: SiteSettings = {
    siteName: 'Prompt Gallery',
    siteDescription: 'An inspiration platform for Prompts and Images',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    allowGoogleLogin: true,
    darkModeDefault: true,
    showViews: true,
    showCopies: true,
    enableProtection: true,
    disableRightClick: true,
    r2Endpoint: import.meta.env.VITE_R2_ENDPOINT,
    r2Bucket: import.meta.env.VITE_R2_BUCKET,
};

// Settings key constant
const SETTINGS_KEY = 'site_settings';

export const SettingsService = {
    /**
     * Fetches site settings from Supabase
     * Falls back to default settings if none exist
     */
    getSettings: async (): Promise<SiteSettings> => {
        try {
            const { data, error } = await supabase
                .from('site_stats')
                .select('*')
                .eq('id', SETTINGS_KEY)
                .single();

            if (error) {
                // Settings don't exist yet, return defaults
                if (error.code === 'PGRST116') {
                    return DEFAULT_SETTINGS;
                }
                console.warn('Error fetching settings:', error);
                return DEFAULT_SETTINGS;
            }

            // Parse settings from JSON stored in the details field
            // We're reusing site_stats table with id='site_settings'
            // This is a pragmatic approach - alternatively create a dedicated table
            return data?.settings || DEFAULT_SETTINGS;
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            return DEFAULT_SETTINGS;
        }
    },

    /**
     * Saves site settings to Supabase
     * Creates the row if it doesn't exist, updates if it does
     */
    saveSettings: async (settings: SiteSettings): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('site_stats')
                .upsert({
                    id: SETTINGS_KEY,
                    settings: settings,
                    updated_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error saving settings:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Failed to save settings:', err);
            return false;
        }
    },

    /**
     * Updates a single setting value
     */
    updateSetting: async <K extends keyof SiteSettings>(
        key: K,
        value: SiteSettings[K]
    ): Promise<boolean> => {
        const currentSettings = await SettingsService.getSettings();
        const updatedSettings = { ...currentSettings, [key]: value };
        return SettingsService.saveSettings(updatedSettings);
    },
};
