"use client";

import { motion } from "motion/react";
import {
    LineChart,
    BarChart3,
    PieChart,
    ScatterChart,
    AreaChart,
    Activity,
    CandlestickChart,
    Radar,
    Target,
    Network
} from "lucide-react";

const chartIcons = [
    { id: 'line', icon: LineChart },
    { id: 'bar', icon: BarChart3 },
    { id: 'pie', icon: PieChart },
    { id: 'scatter', icon: ScatterChart },
    { id: 'area', icon: AreaChart },
    { id: 'activity', icon: Activity },
    { id: 'candle', icon: CandlestickChart },
    { id: 'radar', icon: Radar },
    { id: 'target', icon: Target },
    { id: 'network', icon: Network },
];

export function LogoTicker() {
    return (
        <div className="w-full py-8 bg-transparent overflow-hidden relative">

            {/* Fade Gradients for smooth Edges */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-12 pr-12 items-center flex-shrink-0"
                >
                    {[...chartIcons, ...chartIcons, ...chartIcons].map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex flex-col items-center gap-3 group min-w-[50px]">
                            <div className="p-3 rounded-full bg-secondary/30 dark:bg-secondary/40 border border-border/10 dark:border-white/5 backdrop-blur-sm group-hover:bg-foreground group-hover:text-background transition-all duration-300 hover:scale-110 shadow-sm dark:shadow-lg dark:group-hover:shadow-foreground/20">
                                <item.icon size={24} strokeWidth={1.5} />
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
