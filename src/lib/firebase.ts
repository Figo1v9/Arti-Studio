import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile,
    User,
    UserCredential
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { getMessaging } from 'firebase/messaging';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Sign up with email and password
export const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (userCredential.user && displayName) {
        await updateProfile(userCredential.user, {
            displayName: displayName
        });
    }

    // Send verification email
    if (userCredential.user) {
        await sendEmailVerification(userCredential.user, {
            url: `${window.location.origin}/auth/callback`,
            handleCodeInApp: false
        });
    }

    return userCredential;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider);
};

// Sign out
export const signOut = async (): Promise<void> => {
    return firebaseSignOut(auth);
};

// Resend verification email
export const resendVerificationEmail = async (user: User): Promise<void> => {
    await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/callback`,
        handleCodeInApp: false
    });
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Check if email is verified
export const isEmailVerified = (user: User): boolean => {
    return user.emailVerified;
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
    await firebaseSendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
    });
};

export type { User, UserCredential };
