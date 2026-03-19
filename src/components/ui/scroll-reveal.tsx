"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1.2 1"],
    });

    const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
    const opacityProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const yProgress = useTransform(scrollYProgress, [0, 1], [100, 0]);

    return (
        <motion.div
            ref={ref}
            style={{
                scale: scaleProgress,
                opacity: opacityProgress,
                y: yProgress,
            }}
            className="mb-8"
        >
            {children}
        </motion.div>
    );
}
