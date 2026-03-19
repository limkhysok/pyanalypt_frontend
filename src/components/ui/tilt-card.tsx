"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    classNameContent?: string;
}

export function TiltCard({ children, className, classNameContent }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const scale = useSpring(1, { stiffness: 300, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
        scale.set(1.02);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        scale.set(1);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                scale,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative h-full w-full rounded-xl transition-all duration-500 ease-out",
                "border-[0.5px] border-white/10 overflow-hidden shadow-2xl bg-background/5",
                className
            )}
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className={cn("h-full w-full relative z-20", classNameContent)}
            >
                {children}
            </div>

            {/* Premium Sheen/Light Effect */}
            <motion.div
                style={{
                    background: useTransform(
                        mouseXSpring,
                        [-0.5, 0.5],
                        [
                            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)",
                            "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 60%)"
                        ]
                    )
                }}
                className="absolute inset-0 pointer-events-none z-10 opacity-100"
            />

            {/* Sharp Border Trace */}
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-30" />

        </motion.div>
    );
}
