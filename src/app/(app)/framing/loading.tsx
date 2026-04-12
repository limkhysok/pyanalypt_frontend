import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] w-full bg-background relative z-0">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none opacity-20" />

            <div className="relative flex flex-col items-center gap-6">
                {/* Outer spin rings */}
                <div className="absolute -inset-4 border-t-2 border-r-2 border-blue-600/20 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute -inset-8 border-b-2 border-l-2 border-blue-600/10 rounded-full animate-[spin_4s_linear_infinite_reverse]" />

                <div className="relative">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" strokeWidth={1.5} />
                    <div className="absolute inset-0 h-12 w-12 bg-blue-600/20 rounded-full animate-ping" />
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/40 animate-pulse">
                        Initializing
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/80">
                        Loading Problem Framing…
                    </h2>
                </div>
            </div>

            {/* Bottom status */}
            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <div className="h-px w-32 bg-linear-to-r from-transparent via-border to-transparent" />
                <span className="text-[9px] font-mono text-muted-foreground/40 italic">
                    PyAnalypt v1.0.4.sys // AI_Framing_Module
                </span>
            </div>
        </div>
    );
}
