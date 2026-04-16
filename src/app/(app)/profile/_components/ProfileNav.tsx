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
                            "relative flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group",
                            isActive
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                    >
                        {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-blue-500" />
                        )}
                        <div className={cn(
                            "h-7 w-7 flex items-center justify-center shrink-0 transition-all",
                            isActive
                                ? "bg-blue-500/15 text-blue-500"
                                : "bg-muted/50 text-muted-foreground/60 group-hover:bg-muted group-hover:text-muted-foreground"
                        )}>
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="leading-none">{item.label}</p>
                            <p className={cn(
                                "text-[10px] mt-0.5 leading-none transition-colors",
                                isActive ? "text-blue-500/60" : "text-muted-foreground/50"
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
