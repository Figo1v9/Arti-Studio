"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * FlipWords Component - Aceternity UI
 * تأثير تبديل الكلمات بشكل سلس مع حركة انقلاب
 * يدعم ألوان مختلفة لكل كلمة
 */
export const FlipWords = ({
    words,
    colors,
    duration = 3000,
    className,
}: {
    words: string[];
    /** Optional array of colors matching each word */
    colors?: string[];
    duration?: number;
    className?: string;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    const currentWord = words[currentIndex];
    const currentColor = colors?.[currentIndex];

    // تبديل الكلمة التالية بشكل دوري
    const startAnimation = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(true);
    }, [words.length]);

    useEffect(() => {
        if (!isAnimating) {
            const timer = setTimeout(() => {
                startAnimation();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isAnimating, duration, startAnimation]);

    return (
        <AnimatePresence
            onExitComplete={() => {
                setIsAnimating(false);
            }}
        >
            <motion.span
                initial={{
                    opacity: 0,
                    y: 10,
                    filter: "blur(8px)",
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                }}
                exit={{
                    opacity: 0,
                    y: -40,
                    x: 40,
                    filter: "blur(8px)",
                    scale: 2,
                    position: "absolute",
                }}
                className={cn(
                    "inline-block relative z-10",
                    className
                )}
                style={currentColor ? { color: currentColor } : undefined}
                key={currentWord}
            >
                {currentWord.split("").map((letter, index) => (
                    <motion.span
                        key={currentWord + index}
                        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            delay: index * 0.08,
                            duration: 0.4,
                        }}
                        className="inline-block"
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                ))}
            </motion.span>
        </AnimatePresence>
    );
};
