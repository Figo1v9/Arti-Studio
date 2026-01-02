import { Users } from 'lucide-react';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';

import { useUsersManagement } from './hooks/useUsersManagement';
import { UsersStats } from './components/UsersStats';
import { UsersToolbar } from './components/UsersToolbar';
import { UsersTable } from './components/UsersTable';

export default function UsersManagement() {
    const {
        loading,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        selectedUser,
        setSelectedUser,
        detailsOpen,
        setDetailsOpen,
        fetchUsers,
        handleDeleteUser,
        stats,
        filteredUsers,
        getCurrentSortKey,
        handleSortChange
    } = useUsersManagement();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-violet-500" />
                        Users Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage accounts, tracking growth, and user roles.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <UsersStats stats={stats} />

            {/* Main Content */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                <UsersToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    filteredUsers={filteredUsers}
                    fetchUsers={fetchUsers}
                    loading={loading}
                    currentSortKey={getCurrentSortKey()}
                    onSortChange={handleSortChange}
                />

                <UsersTable
                    users={filteredUsers}
                    loading={loading}
                    onViewDetails={(user) => {
                        setSelectedUser(user);
                        setTimeout(() => setDetailsOpen(true), 100);
                    }}
                    onDeleteUser={handleDeleteUser}
                />
            </div>

            <UserDetailsModal
                user={selectedUser}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onDelete={handleDeleteUser}
            />
        </div>
    );
}
