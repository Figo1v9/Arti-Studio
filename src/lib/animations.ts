/**
 * Performance-Optimized Animation System
 * 
 * RULES FOR PERFORMANCE:
 * 1. ONLY animate `transform` (x, y, scale, rotate) and `opacity`
 * 2. NEVER animate width, height, top, left, margin, padding
 * 3. Use `will-change` sparingly (managed by Framer Motion)
 * 4. Respect `prefers-reduced-motion` for accessibility
 * 5. Keep spring physics light (low stiffness, high damping)
 * 
 * These presets work smoothly on devices as old as iPhone 6
 */

import { Transition, Variants, MotionProps } from 'framer-motion';

// Check if user prefers reduced motion
export const prefersReducedMotion =
    typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

// === SPRING PRESETS (Native-feel) ===

/**
 * Snappy spring - Quick and responsive
 * Use for: buttons, toggles, small UI elements
 */
export const springSnappy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
};

/**
 * Smooth spring - Gentle and elegant  
 * Use for: modals, sheets, page transitions
 */
export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
};

/**
 * Bouncy spring - Playful feedback
 * Use for: success states, celebrations
 */
export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 500,
    damping: 25,
    mass: 1,
};

/**
 * Gentle spring - Very subtle
 * Use for: background elements, low priority
 */
export const springGentle: Transition = {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
};

// === DURATION PRESETS ===

export const durationFast = 0.15;
export const durationNormal = 0.25;
export const durationSlow = 0.4;

// === EASING PRESETS ===

export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeInOutExpo = [0.87, 0, 0.13, 1];
export const easeOutBack = [0.34, 1.56, 0.64, 1];

// === FADE ANIMATIONS ===

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: durationFast }
    },
    exit: {
        opacity: 0,
        transition: { duration: durationFast }
    }
};

// === SLIDE ANIMATIONS (GPU optimized - uses transform) ===

export const slideUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20  // Uses transform, not top
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: springSmooth
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: { duration: durationFast }
    }
};

export const slideDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: springSmooth },
    exit: { opacity: 0, y: -20, transition: { duration: durationFast } }
};

export const slideLeft: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: springSmooth },
    exit: { opacity: 0, x: -20, transition: { duration: durationFast } }
};

export const slideRight: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: springSmooth },
    exit: { opacity: 0, x: 20, transition: { duration: durationFast } }
};

// === SCALE ANIMATIONS ===

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: springSnappy
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: durationFast }
    }
};

export const scalePop: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: springBouncy
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: durationFast }
    }
};

// === MODAL/SHEET ANIMATIONS ===

export const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.96,
        y: 10
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: springSmooth
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 10,
        transition: { duration: durationFast }
    }
};

export const bottomSheetVariants: Variants = {
    hidden: {
        y: '100%'  // Slides from bottom
    },
    visible: {
        y: 0,
        transition: springSmooth
    },
    exit: {
        y: '100%',
        transition: { duration: durationNormal, ease: easeOutExpo }
    }
};

export const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: durationFast } },
    exit: { opacity: 0, transition: { duration: durationFast } }
};

// === STAGGER CONTAINERS ===

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        }
    }
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: springSnappy
    }
};

// === TAP/PRESS FEEDBACK ===

export const tapScale: MotionProps = {
    whileTap: { scale: 0.97 },
    transition: springSnappy
};

export const tapScaleSmall: MotionProps = {
    whileTap: { scale: 0.98 },
    transition: springSnappy
};

// === GESTURE CONFIGS ===

export const swipeConfig = {
    power: 0.3,
    timeConstant: 200,
    modifyTarget: (target: number) => Math.round(target / 100) * 100
};

// === HELPER: Reduced Motion Safe ===

/**
 * Returns animation props that respect user's motion preferences
 */
export function safeAnimate(variants: Variants): Variants {
    if (prefersReducedMotion) {
        return {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 }
        };
    }
    return variants;
}

/**
 * Returns transition that respects user's motion preferences
 */
export function safeTransition(transition: Transition): Transition {
    if (prefersReducedMotion) {
        return { duration: 0.01 };
    }
    return transition;
}
