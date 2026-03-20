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
    { id: 'line',     icon: LineChart,        label: "Line Chart" },
    { id: 'bar',      icon: BarChart3,         label: "Bar Chart" },
    { id: 'pie',      icon: PieChart,          label: "Pie Chart" },
    { id: 'scatter',  icon: ScatterChart,      label: "Scatter Plot" },
    { id: 'area',     icon: AreaChart,         label: "Area Chart" },
    { id: 'activity', icon: Activity,          label: "Activity" },
    { id: 'candle',   icon: CandlestickChart,  label: "Candlestick" },
    { id: 'radar',    icon: Radar,             label: "Radar Chart" },
    { id: 'target',   icon: Target,            label: "Target" },
    { id: 'network',  icon: Network,           label: "Network" },
];

// Alternate blue tones for each icon slot so adjacent items never share the same shade
const blueShades = [
    "text-blue-500",
    "text-blue-400",
    "text-blue-600",
    "text-sky-400",
    "text-blue-500",
    "text-indigo-400",
    "text-blue-400",
    "text-blue-600",
    "text-sky-500",
    "text-indigo-500",
];

const bgShades = [
    "bg-blue-500/10",
    "bg-blue-400/10",
    "bg-blue-600/10",
    "bg-sky-400/10",
    "bg-blue-500/10",
    "bg-indigo-400/10",
    "bg-blue-400/10",
    "bg-blue-600/10",
    "bg-sky-500/10",
    "bg-indigo-500/10",
];

const borderShades = [
    "border-blue-500/20",
    "border-blue-400/20",
    "border-blue-600/20",
    "border-sky-400/20",
    "border-blue-500/20",
    "border-indigo-400/20",
    "border-blue-400/20",
    "border-blue-600/20",
    "border-sky-500/20",
    "border-indigo-500/20",
];

export function LogoTicker() {
    // Duplicate twice so the seamless loop works at x: "-50%"
    const items = [...chartIcons, ...chartIcons];

    return (
        <div className="w-full py-6 bg-transparent overflow-hidden relative">

            {/* Fade edges */}
            <div className="absolute top-0 left-0 h-full w-28 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-28 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                    className="flex gap-8 items-center shrink-0"
                >
                    {items.map((item, index) => {
                        const slot = index % chartIcons.length;
                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className="flex flex-col items-center gap-2.5 group min-w-14"
                            >
                                <div
                                    className={`relative p-3.5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-sm ${bgShades[slot]} ${borderShades[slot]}`}
                                >
                                    {/* Subtle inner glow on hover */}
                                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500/10 blur-md`} />
                                    <item.icon
                                        size={22}
                                        strokeWidth={1.5}
                                        className={`relative z-10 transition-colors duration-300 ${blueShades[slot]} group-hover:brightness-125`}
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${blueShades[slot]}`}>
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
