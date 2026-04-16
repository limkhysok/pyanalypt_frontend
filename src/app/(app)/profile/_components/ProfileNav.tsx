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
                            "relative flex items-center gap-3 px-3 py-3 text-[13px] font-medium transition-all duration-200 group uppercase border border-transparent",
                            isActive
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                    >
                        <div className={cn(
                            "h-7 w-7 flex items-center justify-center shrink-0 transition-all",
                            isActive
                                ? "text-background"
                                : "text-muted-foreground/60 group-hover:text-foreground"
                        )}>
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="leading-none font-black uppercase tracking-widest text-[11px]">{item.label}</p>
                            <p className={cn(
                                "text-[8.5px] mt-1.5 leading-none transition-colors font-bold uppercase tracking-tighter opacity-50",
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
