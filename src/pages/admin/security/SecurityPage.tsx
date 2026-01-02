import React, { useEffect, useState } from 'react';
import { Shield, Clock, User, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { SecurityService } from '@/services/security.service';
import { AuditLog } from '@/types/database.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


type AuditLogWithProfile = AuditLog & {
    profiles: {
        full_name: string | null;
        email: string;
        avatar_url: string | null;
    } | null;
};

export default function SecurityPage() {
    const [logs, setLogs] = useState<AuditLogWithProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await SecurityService.getAuditLogs(100);
            setLogs(data as AuditLogWithProfile[] || []);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-400" />
                        Security Center
                    </h1>
                    <p className="text-gray-400 mt-1">Audit logs and security events tracking.</p>
                </div>
                <Button variant="outline" onClick={fetchLogs} className="bg-white/5 border-white/10 hover:bg-white/10">
                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Refresh Logs
                </Button>
            </div>

            {/* Logs Terminal View */}
            <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden font-mono text-sm shadow-2xl">
                <div className="bg-white/5 border-b border-white/5 p-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">audit_logs.log</span>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                    {loading && logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Loading security events...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No security events found.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row gap-4">
                                {/* Timestamp */}
                                <div className="min-w-[160px] text-gray-500 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(log.created_at).toLocaleString()}
                                </div>

                                {/* Action */}
                                <div className="min-w-[140px] font-bold text-violet-400">
                                    {log.action}
                                </div>

                                {/* User (Admin) */}
                                <div className="min-w-[140px] flex items-center gap-2 text-gray-300">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="truncate max-w-[120px]" title={log.profiles?.full_name || undefined}>
                                        {log.profiles?.full_name || 'System'}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 text-gray-400 break-all">
                                    {JSON.stringify(log.details)}
                                </div>

                                {/* IP Address (if available) */}
                                {log.ip_address && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 border border-white/5 px-2 py-0.5 rounded-full self-start">
                                        <Shield className="w-3 h-3" />
                                        {log.ip_address}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
