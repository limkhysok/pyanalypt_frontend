"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Clock } from "lucide-react";

const NAV_ITEMS = [
    { label: "General", href: "/profile", icon: User, description: "Personal info" },
    { label: "Authentication", href: "/profile/authentication", icon: ShieldCheck, description: "Password & 2FA" },
    { label: "Active Sessions", href: "/profile/sessions", icon: Clock, description: "Logged-in devices" },
];

export function ProfileNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-0.5 p-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex items-center gap-3 px-3 py-3 text-[13px] font-medium transition-all duration-300 group border-l-2",
                            isActive
                                ? "bg-foreground text-background border-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent hover:border-border/60"
                        )}
                    >
                        {/* Active Indicator Pulse */}
                        {isActive && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-3 bg-background/30 animate-pulse" />
                        )}
                        
                        <div className={cn(
                            "h-7 w-7 flex items-center justify-center shrink-0 transition-all duration-300",
                            isActive
                                ? "text-background scale-110"
                                : "text-muted-foreground/60 group-hover:text-foreground group-hover:scale-110"
                        )}>
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="leading-none font-bold tracking-tight text-[13px]">{item.label}</p>
                            <p className={cn(
                                "text-[10px] mt-1.5 leading-none transition-colors opacity-60",
                                isActive ? "text-background/70" : "text-muted-foreground/50"
                            )}>
                                {item.description}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
