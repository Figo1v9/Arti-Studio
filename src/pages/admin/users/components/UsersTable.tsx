import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    MoreHorizontal,
    Shield,
    User,
    Trash2,
    Calendar,
    Mail,
    Copy,
    ExternalLink,
    Users,
    Heart,
    Image as ImageIcon,
    UserCheck
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/avatar';
import { toast } from 'sonner';
import { UserWithStats } from '../types/user.types';

interface UsersTableProps {
    users: UserWithStats[];
    loading: boolean;
    onViewDetails: (user: UserWithStats) => void;
    onDeleteUser: (userId: string) => void;
}

/**
 * Format number with K/M suffix for large numbers
 */
function formatCompactNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

/**
 * Stats badge component for consistent styling
 */
function StatBadge({
    icon: Icon,
    value,
    label,
    colorClass
}: {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    label: string;
    colorClass: string;
}) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-default transition-colors",
                        colorClass
                    )}>
                        <Icon className="w-3 h-3" />
                        <span>{formatCompactNumber(value)}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-900 text-white border-white/10">
                    <p>{value.toLocaleString()} {label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function UsersTable({ users, loading, onViewDetails, onDeleteUser }: UsersTableProps) {
    return (
        <Table>
            <TableHeader className="bg-black/20">
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400 pl-6">User Profile</TableHead>
                    <TableHead className="text-gray-400">User ID</TableHead>
                    <TableHead className="text-gray-400">Link</TableHead>
                    <TableHead className="text-gray-400 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            Followers
                        </div>
                    </TableHead>
                    <TableHead className="text-gray-400 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Copy className="w-3.5 h-3.5" />
                            Copies
                        </div>
                    </TableHead>
                    <TableHead className="text-gray-400 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            Favorites
                        </div>
                    </TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Joined Date</TableHead>
                    <TableHead className="text-gray-400 text-right pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                                Loading user data...
                            </div>
                        </TableCell>
                    </TableRow>
                ) : users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="w-8 h-8 opacity-20" />
                                No users found matching your criteria.
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                            {/* User Profile */}
                            <TableCell className="pl-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                            <img
                                                src={getAvatarUrl(user.email || 'user', user.avatar_url)}
                                                alt={user.full_name || 'User'}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Images count badge */}
                                        {user.stats.imagesCount > 0 && (
                                            <div className="absolute -bottom-1 -right-1 bg-violet-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black">
                                                {user.stats.imagesCount > 99 ? '99+' : user.stats.imagesCount}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            {user.full_name || 'No Name'}
                                            {user.stats.imagesCount > 0 && (
                                                <TooltipProvider delayDuration={300}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-0.5 text-violet-400 text-xs">
                                                                <ImageIcon className="w-3 h-3" />
                                                                <span>{user.stats.imagesCount}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="bg-gray-900 text-white border-white/10">
                                                            <p>{user.stats.imagesCount} images uploaded</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>

                            {/* User ID */}
                            <TableCell>
                                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group/id">
                                    <span className="truncate max-w-[100px]" title={user.id}>
                                        {user.id}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 opacity-0 group-hover/id:opacity-100 transition-opacity bg-white/5 hover:bg-white/10"
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.id);
                                            toast.success('ID copied to clipboard');
                                        }}
                                    >
                                        <Copy className="w-2.5 h-2.5" />
                                    </Button>
                                </div>
                            </TableCell>

                            {/* Link */}
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <a
                                        href={`/${user.username || user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-violet-400 border border-white/10 transition-colors"
                                        title="Open Public Profile"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Visit
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-white bg-transparent hover:bg-white/10"
                                        title="Copy Profile Link"
                                        onClick={() => {
                                            const link = `${window.location.origin}/${user.username || user.id}`;
                                            navigator.clipboard.writeText(link);
                                            toast.success('Link copied');
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </TableCell>

                            {/* Followers Count */}
                            <TableCell className="text-center">
                                <StatBadge
                                    icon={UserCheck}
                                    value={user.stats.followersCount}
                                    label="followers"
                                    colorClass={
                                        user.stats.followersCount >= 100
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                            : user.stats.followersCount >= 10
                                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                : "bg-white/5 text-gray-400 border-white/10"
                                    }
                                />
                            </TableCell>

                            {/* Total Copies */}
                            <TableCell className="text-center">
                                <StatBadge
                                    icon={Copy}
                                    value={user.stats.totalCopies}
                                    label="total copies"
                                    colorClass={
                                        user.stats.totalCopies >= 1000
                                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            : user.stats.totalCopies >= 100
                                                ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                                : "bg-white/5 text-gray-400 border-white/10"
                                    }
                                />
                            </TableCell>

                            {/* Total Favorites */}
                            <TableCell className="text-center">
                                <StatBadge
                                    icon={Heart}
                                    value={user.stats.totalFavorites}
                                    label="total favorites"
                                    colorClass={
                                        user.stats.totalFavorites >= 100
                                            ? "bg-pink-500/20 text-pink-400 border-pink-500/30"
                                            : user.stats.totalFavorites >= 10
                                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                                : "bg-white/5 text-gray-400 border-white/10"
                                    }
                                />
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                    user.role === 'admin'
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {user.role === 'admin' ? 'Administrator' : 'User'}
                                </span>
                            </TableCell>

                            {/* Joined Date */}
                            <TableCell>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(user.created_at)}
                                </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right pr-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => onViewDetails(user)}
                                        >
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDeleteUser(user.id)}
                                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
