import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, RefreshCw, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatUsersForExport, exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { USER_SORT_OPTIONS, UserWithStats } from '../types/user.types';

interface UsersToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    roleFilter: string;
    setRoleFilter: (role: string) => void;
    filteredUsers: UserWithStats[];
    fetchUsers: () => void;
    loading: boolean;
    currentSortKey: string;
    onSortChange: (value: string) => void;
}

export function UsersToolbar({
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    fetchUsers,
    loading,
    currentSortKey,
    onSortChange
}: UsersToolbarProps) {
    /**
     * Export users with enhanced stats
     */
    const handleExport = () => {
        // Create enhanced export data including stats
        const exportData = filteredUsers.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name || '',
            username: user.username || '',
            role: user.role,
            created_at: user.created_at,
            followers: user.stats.followersCount,
            total_copies: user.stats.totalCopies,
            total_favorites: user.stats.totalFavorites,
            images_count: user.stats.imagesCount
        }));

        exportToCSV(exportData, `users-export-${new Date().toISOString().split('T')[0]}`);
        toast.success('Users exported successfully with statistics!');
    };

    return (
        <>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div></div>
                <div className="flex gap-2 self-end">
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        onClick={fetchUsers}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 rounded-t-2xl">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, ID or Link..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/40 transition-colors"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                    {/* Role Filter */}
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-black/20 border-white/10 text-white">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="user">Users</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Filter */}
                    <Select value={currentSortKey} onValueChange={onSortChange}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-black/20 border-white/10 text-white">
                            <ArrowUpDown className="w-4 h-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            {USER_SORT_OPTIONS.map((option) => (
                                <SelectItem
                                    key={`${option.field}-${option.direction}`}
                                    value={`${option.field}-${option.direction}`}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    );
}
