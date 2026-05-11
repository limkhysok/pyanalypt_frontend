import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] w-full bg-background/50 backdrop-blur-sm relative z-50">
            {/* Precision Blueprint Grid Backdrop (matching AppShell) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none opacity-20" />
            
            <div className="relative flex flex-col items-center gap-6">
                {/* Outer spin ring */}
                <div className="absolute -inset-4 border-t-2 border-r-2 border-foreground/10 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute -inset-8 border-b-2 border-l-2 border-foreground/5 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-foreground animate-spin" strokeWidth={1.5} />
                    {/* Inner core pulse */}
                    <div className="absolute inset-0 h-12 w-12 bg-foreground/10 rounded-full animate-ping" />
                </div>
                
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black capitalize tracking-[0.3em] text-foreground/20 animate-pulse">
                        Synchronizing
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/80">
                        Accessing Core Data...
                    </h2>
                </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <div className="h-px w-32 bg-linear-to-r from-transparent via-border to-transparent" />
                <span className="text-[9px] font-mono text-muted-foreground/40 italic">
                    PyAnalypt v1.0.4.sys // Init_Sequence
                </span>
            </div>
        </div>
    );
}
