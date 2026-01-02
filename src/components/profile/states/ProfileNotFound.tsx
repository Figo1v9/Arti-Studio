import React from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileNotFoundProps {
    error?: string;
}

export const ProfileNotFound: React.FC<ProfileNotFoundProps> = ({ error }) => {
    const navigate = useNavigate();
    const isPrivate = error?.toLowerCase().includes('private');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <Helmet><title>{isPrivate ? 'Private Profile' : 'User Not Found'} - Arti Studio</title></Helmet>
            <div className="max-w-md w-full text-center">
                {isPrivate ? (
                    <Lock className="w-16 h-16 text-amber-500/80 mx-auto mb-4 p-3 bg-amber-500/10 rounded-full border border-amber-500/20" />
                ) : (
                    <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                )}

                <h1 className="text-2xl font-bold text-white mb-2">{isPrivate ? 'This Account is Private' : 'User Not Found'}</h1>
                <p className="text-gray-400 mb-6 max-w-xs mx-auto">
                    {isPrivate
                        ? "The user has set their profile to private. Only they can see their content."
                        : (error || "The user you are looking for doesn't exist.")}
                </p>
                <Button onClick={() => navigate('/explore')} variant="outline" className="border-white/10 hover:bg-white/5">Back to Home</Button>
            </div>
        </div>
    );
};
