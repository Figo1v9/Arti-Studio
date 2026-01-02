import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Settings,
    Save,
    Globe,
    Shield,
    Palette,
    Database,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SettingsService, SiteSettings, DEFAULT_SETTINGS } from '@/services/settings.service';

interface SettingsSection {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
}

const sections: SettingsSection[] = [
    { id: 'general', title: 'General', icon: Globe, description: 'General site settings' },
    { id: 'security', title: 'Security', icon: Shield, description: 'Security and protection settings' },
    { id: 'appearance', title: 'Appearance', icon: Palette, description: 'Look and feel settings' },
    { id: 'storage', title: 'Storage', icon: Database, description: 'Cloud storage settings' },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('general');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    // Settings state
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [originalSettings, setOriginalSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    // Track changes
    useEffect(() => {
        const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setHasChanges(changed);
    }, [settings, originalSettings]);

    const fetchSettings = async () => {
        setFetching(true);
        try {
            const data = await SettingsService.getSettings();
            setSettings(data);
            setOriginalSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to fetch settings');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const success = await SettingsService.saveSettings(settings);
            if (success) {
                setOriginalSettings(settings);
                setHasChanges(false);
                toast.success('Settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings(originalSettings);
        setHasChanges(false);
        toast.info('Changes cancelled');
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-violet-400" />
                        Settings
                    </h1>
                    <p className="text-gray-400 mt-1">Manage site settings</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={loading || !hasChanges}
                        className={cn(
                            "transition-all",
                            hasChanges
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                                : "bg-gray-600 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-amber-400 text-sm">You have unsaved changes</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                                activeSection === section.id
                                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <section.icon className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="font-medium">{section.title}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3 rounded-2xl bg-white/5 border border-white/10 p-6">
                    {/* General Settings */}
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Site Name</Label>
                                    <Input
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Site Description</Label>
                                    <Input
                                        value={settings.siteDescription}
                                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Maintenance Mode</p>
                                        <p className="text-gray-400 text-sm">Show maintenance page to visitors</p>
                                    </div>
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Allow Registration</p>
                                        <p className="text-gray-400 text-sm">Allow new users to register</p>
                                    </div>
                                    <Switch
                                        checked={settings.allowRegistration}
                                        onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Email Verification</p>
                                        <p className="text-gray-400 text-sm">Require email confirmation upon registration</p>
                                    </div>
                                    <Switch
                                        checked={settings.requireEmailVerification}
                                        onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Google Login</p>
                                        <p className="text-gray-400 text-sm">Allow registration using Google account</p>
                                    </div>
                                    <Switch
                                        checked={settings.allowGoogleLogin}
                                        onCheckedChange={(checked) => setSettings({ ...settings, allowGoogleLogin: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Content Protection</p>
                                        <p className="text-gray-400 text-sm">Prevent image and text copying</p>
                                    </div>
                                    <Switch
                                        checked={settings.enableProtection}
                                        onCheckedChange={(checked) => setSettings({ ...settings, enableProtection: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Disable Right Click</p>
                                        <p className="text-gray-400 text-sm">Prevent right-click context menu</p>
                                    </div>
                                    <Switch
                                        checked={settings.disableRightClick}
                                        onCheckedChange={(checked) => setSettings({ ...settings, disableRightClick: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeSection === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4">Appearance Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Dark Mode by Default</p>
                                        <p className="text-gray-400 text-sm">Use dark mode as default</p>
                                    </div>
                                    <Switch
                                        checked={settings.darkModeDefault}
                                        onCheckedChange={(checked) => setSettings({ ...settings, darkModeDefault: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Show Views</p>
                                        <p className="text-gray-400 text-sm">Show view count on images</p>
                                    </div>
                                    <Switch
                                        checked={settings.showViews}
                                        onCheckedChange={(checked) => setSettings({ ...settings, showViews: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-white font-medium">Show Copies</p>
                                        <p className="text-gray-400 text-sm">Show copy count on images</p>
                                    </div>
                                    <Switch
                                        checked={settings.showCopies}
                                        onCheckedChange={(checked) => setSettings({ ...settings, showCopies: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Storage Settings */}
                    {activeSection === 'storage' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4">Storage Settings</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Cloudflare R2 Endpoint</Label>
                                    <Input
                                        value={settings.r2Endpoint}
                                        onChange={(e) => setSettings({ ...settings, r2Endpoint: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">R2 Bucket Name</Label>
                                    <Input
                                        value={settings.r2Bucket}
                                        onChange={(e) => setSettings({ ...settings, r2Bucket: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-amber-400 text-sm">
                                        ⚠️ Note: Changing storage settings may affect previously saved images
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
