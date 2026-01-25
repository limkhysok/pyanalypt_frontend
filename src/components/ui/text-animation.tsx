"use client";

import { motion } from "framer-motion";

export function TypewriterEffect() {
    const text = "Actionable Insights";
    const characters = text.split("");

    return (
        <span className="inline-block relative">
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: index * 0.1,
                        repeat: Infinity,
                        repeatDelay: 5,
                        duration: 0.2,
                    }}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"
                >
                    {char}
                </motion.span>
            ))}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[3px] h-[1em] bg-foreground ml-1 align-middle"
            />
        </span>
    );
}

export function GradientTextLoop() {
    return (
        <span className="bg-clip-text text-transparent bg-[size:200%] bg-gradient-to-r from-red-500 via-purple-500 to-orange-500 animate-gradient-text">
            Actionable Insights
        </span>
    )
}
