"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    classNameContent?: string;
}

export function TiltCard({ children, className, classNameContent }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia("(hover: none)").matches);
    }, []);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    // All hooks must be called unconditionally before any early return
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
    const sheenBg = useTransform(
        mouseXSpring,
        [-0.5, 0.5],
        [
            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)",
            "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 60%)",
        ]
    );
    const scale = useSpring(1, { stiffness: 300, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || isTouch) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
        scale.set(1.02);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        scale.set(1);
    };

    // On touch devices render a plain div — no 3D, no spring values, no repaint overhead
    if (isTouch) {
        return (
            <div className={cn(
                "relative h-full w-full rounded-xl border-[0.5px] border-white/10 overflow-hidden shadow-2xl bg-background/5",
                className
            )}>
                <div className={cn("h-full w-full relative z-20", classNameContent)}>
                    {children}
                </div>
                <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-30" />
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateY, rotateX, scale, transformStyle: "preserve-3d" }}
            className={cn(
                "relative h-full w-full rounded-xl transition-all duration-500 ease-out",
                "border-[0.5px] border-white/10 overflow-hidden shadow-2xl bg-background/5",
                className
            )}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className={cn("h-full w-full relative z-20", classNameContent)}
            >
                {children}
            </div>
            <motion.div
                style={{ background: sheenBg }}
                className="absolute inset-0 pointer-events-none z-10 opacity-100"
            />
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-30" />
        </motion.div>
    );
}
