import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SidebarAuthProps {
    isCollapsed: boolean;
}

export function SidebarAuth({ isCollapsed }: SidebarAuthProps) {
    const navigate = useNavigate();

    return (
        <div className={cn("pb-4", isCollapsed ? "px-2" : "px-4")}>
            <motion.button
                onClick={() => navigate('/login')}
                title={isCollapsed ? 'Sign In' : undefined}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    'w-full flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all',
                    isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'
                )}
            >
                <LogIn className={cn(isCollapsed ? "w-5 h-5" : "w-5 h-5")} />
                {!isCollapsed && <span className="font-medium">Sign In</span>}
            </motion.button>
        </div>
    );
}
