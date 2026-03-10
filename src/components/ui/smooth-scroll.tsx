"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.08,             // Slower, smoother trailing effect
            wheelMultiplier: 0.8,   // Slightly reduces mouse wheel speed
            smoothWheel: true,      // Enables smooth scrolling for mouse wheels
            syncTouch: false,       // Let native touch scrolling remain to avoid jank on mobile
        });

        // Simple Request Animation Frame Loop for lenis
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Cleanup when component unmounts
        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
