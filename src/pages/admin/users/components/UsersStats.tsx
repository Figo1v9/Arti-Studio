import { Users, UserPlus, Shield, TrendingUp } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface UsersStatsProps {
    stats: {
        total: number;
        admins: number;
        newUsers: number;
        chartData: { name: string; count: number }[];
    };
}

export function UsersStats({ stats }: UsersStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Users Card */}
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                </div>
            </div>

            {/* New Users Card */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">New This Month</p>
                    <h3 className="text-2xl font-bold text-white">{stats.newUsers}</h3>
                </div>
            </div>

            {/* Admins Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Administrators</p>
                    <h3 className="text-2xl font-bold text-white">{stats.admins}</h3>
                </div>
            </div>

            {/* Growth Chart (Mini) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-[100px] md:h-auto">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-muted-foreground">Registration Trend (7 Days)</span>
                </div>
                <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {stats.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#8b5cf6' : '#334155'} />
                                ))}
                            </Bar>
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4c1d95', borderRadius: '8px', padding: '4px 8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                                labelStyle={{ display: 'none' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
