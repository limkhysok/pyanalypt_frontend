"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Clock, Settings } from "lucide-react";

const NAV_ITEMS = [
    { label: "General", href: "/profile", icon: User },
    { label: "Authentication", href: "/profile/authentication", icon: ShieldCheck },
    { label: "Active Sessions", href: "/profile/sessions", icon: Clock },
    { label: "Settings", href: "/profile/setting", icon: Settings },
];

export function ProfileNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                            isActive
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Icon className={cn("h-4 w-4", isActive ? "text-blue-500" : "text-muted-foreground/60")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
