"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
    LayoutDashboard,
    Database,
    AlertCircle,
    Settings,
    Trash2,
    BarChart3,
    Lightbulb,
    BrainCircuit,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";

type NavItemDef = {
    label: string;
    href: string;
    icon: React.ElementType;
    shortcut: string;
    badge?: number;
};

const WORKSPACE_ITEMS: NavItemDef[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
    { label: "Datasets",  href: "/datasets",  icon: Database,         shortcut: "G S" },
    { label: "Framing",   href: "/framing",   icon: BrainCircuit,     shortcut: "G F" },
    { label: "Issues",    href: "/issues",    icon: AlertCircle,      shortcut: "G I", badge: 3 },
    { label: "Clean",     href: "/clean",     icon: Trash2,           shortcut: "G C" },
];

const RESULTS_ITEMS: NavItemDef[] = [
    { label: "Analysis", href: "/analysis", icon: BarChart3,  shortcut: "G A" },
    { label: "Insight",  href: "/insight",  icon: Lightbulb,  shortcut: "G N" },
];

/** G + key → route */
const SHORTCUT_MAP: Record<string, string> = {
    D: "/dashboard",
    S: "/datasets",
    F: "/framing",
    I: "/issues",
    C: "/clean",
    A: "/analysis",
    N: "/insight",
    ",": "/profile/setting",
};

function isRouteActive(pathname: string, href: string): boolean {
    if (href === "/dashboard" || href === "/profile") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
}

// ─────────────────────────────────────────────
// NavItem
// ─────────────────────────────────────────────
const NavItem = React.memo(function NavItem({
    label,
    href,
    icon: Icon,
    pathname,
    shortcut,
    badge,
}: Readonly<NavItemDef & { pathname: string }>) {
    const isActive = isRouteActive(pathname, href);

    return (
        <SidebarMenuItem className={cn(
            "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center",
            isActive
                ? "group-data-[collapsible=icon]:bg-sidebar-accent"
                : "group-data-[collapsible=icon]:hover:bg-sidebar-accent/60"
        )}>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{
                    children: (
                        <span className="flex items-center gap-2">
                            {label}
                            <kbd className="rounded bg-sidebar-accent/80 px-1 py-0.5 text-[10px] font-mono text-sidebar-foreground/50">
                                {shortcut}
                            </kbd>
                        </span>
                    ),
                    side: "right",
                }}
                className={cn(
                    "h-11 gap-3 rounded-none px-4 text-[13px] tracking-[0.04em] font-medium transition-colors duration-150",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
            >
                <Link href={href}>
                    {/* Icon wrapper — badge is positioned relative to this */}
                    <span className="relative inline-flex shrink-0">
                        <Icon
                            className={cn(
                                "size-3.75 transition-all duration-150",
                                isActive
                                    ? "scale-110 text-sidebar-foreground"
                                    : "scale-100 text-sidebar-foreground/60"
                            )}
                        />
                        {badge !== undefined && badge > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white leading-none">
                                {badge > 9 ? "9+" : badge}
                            </span>
                        )}
                    </span>

                    {/* Label */}
                    <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>

                    {/* Inline badge pill (expanded only) */}
                    {badge !== undefined && badge > 0 && (
                        <span className="ml-auto group-data-[collapsible=icon]:hidden rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive leading-none">
                            {badge}
                        </span>
                    )}
                </Link>
            </SidebarMenuButton>

            {/* Active right-bar indicator — on the li so it spans full row in both expanded and collapsed */}
            {isActive && (
                <span
                    aria-hidden
                    className="sidebar-active-indicator pointer-events-none absolute right-0 top-0 h-full w-0.5 rounded-l-full bg-sidebar-foreground"
                />
            )}
        </SidebarMenuItem>
    );
});

// ─────────────────────────────────────────────
// UserFooter — replaces plain "Profile" nav item
// ─────────────────────────────────────────────
const UserFooter = React.memo(function UserFooter({ pathname }: Readonly<{ pathname: string }>) {
    const { user } = useAuth();
    if (!user) return null;

    const displayName = user.full_name || user.username;
    const initials  = getInitials(user);
    const isActive  = isRouteActive(pathname, "/profile");

    return (
        <SidebarMenuItem className={cn(
            "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center",
            isActive
                ? "group-data-[collapsible=icon]:bg-sidebar-accent"
                : "group-data-[collapsible=icon]:hover:bg-sidebar-accent/60"
        )}>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: displayName, side: "right" }}
                className={cn(
                    "h-11 gap-3 rounded-none px-4 text-[13px] transition-colors duration-150",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    isActive
                        ? "bg-sidebar-accent"
                        : "bg-transparent hover:bg-sidebar-accent/60"
                )}
            >
                <Link href="/profile">
                    <Avatar className="h-6 w-6 shrink-0">
                        {user.profile_picture && (
                            <AvatarImage src={user.profile_picture} alt={displayName} />
                        )}
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px] font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-[13px] font-medium leading-tight text-sidebar-foreground">
                            {displayName}
                        </span>
                        {user.email && (
                            <span className="truncate text-[11px] leading-tight text-sidebar-foreground/50">
                                {user.email}
                            </span>
                        )}
                    </span>
                </Link>
            </SidebarMenuButton>

            {/* Active right-bar indicator — on the li so it spans full row in both expanded and collapsed */}
            {isActive && (
                <span
                    aria-hidden
                    className="sidebar-active-indicator pointer-events-none absolute right-0 top-0 h-full w-0.5 rounded-l-full bg-sidebar-foreground"
                />
            )}
        </SidebarMenuItem>
    );
});

// ─────────────────────────────────────────────
// AppSidebar
// ─────────────────────────────────────────────
export function AppSidebar() {
    const pathname = usePathname() ?? "";
    const router   = useRouter();

    // G + key keyboard shortcuts
    useEffect(() => {
        let pendingG  = false;
        let clearTimer: ReturnType<typeof setTimeout>;

        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (
                ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
                target.isContentEditable
            ) return;

            const key = e.key.toUpperCase();

            if (pendingG) {
                const dest = SHORTCUT_MAP[key];
                if (dest) {
                    e.preventDefault();
                    router.push(dest);
                }
                pendingG = false;
                clearTimeout(clearTimer);
            } else if (key === "G" && !e.ctrlKey && !e.metaKey && !e.altKey) {
                pendingG = true;
                clearTimeout(clearTimer);
                clearTimer = setTimeout(() => { pendingG = false; }, 800);
            }
        };

        globalThis.addEventListener("keydown", onKeyDown);
        return () => {
            globalThis.removeEventListener("keydown", onKeyDown);
            clearTimeout(clearTimer);
        };
    }, [router]);

    return (
        <Sidebar collapsible="icon">

            {/* ── Header ── */}
            <SidebarHeader className="h-12 shrink-0 border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-0">
                <Link
                    href="/dashboard"
                    className="flex h-full items-center gap-2.5 group/logo overflow-hidden group-data-[collapsible=icon]:justify-center"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        <Logo className="h-5 w-5 transition-transform duration-500 group-hover/logo:rotate-12" />
                    </div>
                    <span className="truncate text-[14px] font-bold tracking-wide text-sidebar-active group-data-[collapsible=icon]:hidden">
                        PyAnalypt
                    </span>
                </Link>
            </SidebarHeader>

            {/* ── Navigation ── */}
            <SidebarContent>

                {/* Workspace group */}
                <SidebarGroup className="px-0 gap-0">
                    <SidebarGroupLabel className="h-8 px-4 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu >
                            {WORKSPACE_ITEMS.map((item) => (
                                <NavItem key={item.href} {...item} pathname={pathname} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Results group */}
                <SidebarGroup className="px-0 gap-0 mt-4">
                    <SidebarGroupLabel className="h-8 px-4 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
                        Results
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu >
                            {RESULTS_ITEMS.map((item) => (
                                <NavItem key={item.href} {...item} pathname={pathname} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="px-0 pb-3">
                <SidebarSeparator className="mb-1 bg-sidebar-border/60 mx-4" />
                <SidebarMenu>
                    <UserFooter pathname={pathname} />
                    <NavItem
                        label="Settings"
                        href="/profile/setting"
                        icon={Settings}
                        shortcut="G ,"
                        pathname={pathname}
                    />
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
