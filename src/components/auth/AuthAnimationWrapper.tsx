/**
 * AuthAnimationWrapper - Simple wrapper for auth routes
 * 
 * Using Outlet directly without AnimatePresence to avoid route conflicts.
 * The shared layout animations are handled by layoutId in AuthLayout.
 */

import { Outlet } from 'react-router-dom';

export function AuthAnimationWrapper() {
    // Simple pass-through - animations are handled by AuthLayout's layoutId
    return <Outlet />;
}
