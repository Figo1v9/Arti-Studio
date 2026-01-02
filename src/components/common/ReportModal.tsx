
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ModerationService } from '@/services/moderation.service';
import { useAuth } from '@/components/auth';

interface ReportModalProps {
    open: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'image' | 'user';
}

const REPORT_REASONS = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'harmful', label: 'Harmful or Dangerous' },
    { value: 'other', label: 'Other' },
];

export function ReportModal({ open, onClose, targetId, targetType }: ReportModalProps) {
    const { profile } = useAuth();
    const [reason, setReason] = useState<string>('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!profile) {
            toast.error('You must be logged in to submit a report');
            return;
        }

        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        setLoading(true);
        try {
            const finalReason = reason === 'other' ? `Other: ${details}` : `${reason} - ${details}`;

            // Use profile.id (which is the Firebase UID stored in Supabase profiles table)
            // This ensures compatibility with the reports table foreign key
            await ModerationService.submitReport(
                profile?.id || null,
                targetId,
                targetType,
                finalReason.trim()
            );

            toast.success('Report submitted. Thank you for helping keep our community safe.');
            onClose();
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#0c0c0e] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                        Report Content
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Help us understand what's wrong with this content.
                        Reports are anonymous and reviewed by our moderation team.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Reason</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Additional Details (Optional)</Label>
                        <Textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide more context..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 text-gray-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                        ) : (
                            'Submit Report'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
