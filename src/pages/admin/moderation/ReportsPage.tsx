import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, User, Image as ImageIcon } from 'lucide-react';
import { ModerationService } from '@/services/moderation.service';
import { Report } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';


type ReportWithProfile = Report & {
    reporter: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await ModerationService.getReports('pending');
            setReports(data as ReportWithProfile[] || []);
        } catch (error) {
            toast.error('Could not load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (report: Report, action: 'ban' | 'delete' | 'dismiss') => {
        if (!confirm(`Are you sure you want to ${action}?`)) return;
        setProcessingId(report.id);

        try {
            if (action === 'dismiss') {
                await ModerationService.updateReportStatus(report.id, 'dismissed');
                toast.success('Report dismissed');
            } else if (action === 'delete') {
                await ModerationService.resolveReport(report.id, report.target_type as 'image' | 'user', report.target_id);
                toast.success('Content deleted & report resolved');
            }
            // Add Ban Logic here if needed via SecurityService

            // Remove from list locally
            setReports((prev) => prev.filter((r) => r.id !== report.id));
        } catch (error) {
            toast.error('Action failed');
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    Moderation Queue
                </h1>
                <p className="text-gray-400 mt-1">Review and action user reports.</p>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">All Clean!</h3>
                        <p className="text-gray-400">No pending reports at this time.</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row gap-6">
                            {/* Icon */}
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    {report.target_type === 'user' ? (
                                        <User className="w-6 h-6 text-amber-500" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-amber-500" />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                        report.target_type === 'user' ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                                    )}>
                                        {report.target_type}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Reported by {report.reporter?.username || 'Anonymous'} • {formatDate(report.created_at)}
                                    </span>
                                </div>
                                <h3 className="text-white font-medium text-lg leading-tight mb-2">
                                    Reason: {report.reason}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5 font-mono">
                                        Target ID: {report.target_id}
                                    </div>
                                    <a
                                        href={report.target_type === 'image'
                                            ? `/explore?imageId=${report.target_id}`
                                            : `/${report.target_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-colors"
                                        title={`View ${report.target_type}`}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 shrink-0 md:w-40 border-l border-white/10 md:pl-6">
                                <Button
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                    disabled={!!processingId}
                                    onClick={() => handleResolve(report, 'delete')}
                                >
                                    Delete Content
                                </Button>
                                <Button
                                    className="w-full" variant="outline"
                                    disabled={!!processingId}
                                    onClick={() => handleResolve(report, 'dismiss')}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
