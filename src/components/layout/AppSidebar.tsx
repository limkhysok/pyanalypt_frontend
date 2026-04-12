"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Database,
    AlertCircle,
    Settings,
    User,
    Trash2,
    BarChart3,
    Lightbulb,
    BrainCircuit,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
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

const WORKSPACE_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Datasets",  href: "/datasets",  icon: Database         },
    { label: "Framing",   href: "/framing",   icon: BrainCircuit     },
    { label: "Issues",    href: "/issues",    icon: AlertCircle      },
    { label: "Clean",     href: "/clean",     icon: Trash2           },
    { label: "Analysis",  href: "/analysis",  icon: BarChart3        },
    { label: "Insight",   href: "/insight",   icon: Lightbulb        },
];

const FOOTER_ITEMS = [
    { label: "Profile",  href: "/profile",         icon: User     },
    { label: "Settings", href: "/profile/setting",  icon: Settings },
];

function isRouteActive(pathname: string, href: string): boolean {
    if (href === "/dashboard" || href === "/profile") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
}

function NavItem({
    label,
    href,
    icon: Icon,
    pathname,
}: Readonly<{ label: string; href: string; icon: React.ElementType; pathname: string }>) {
    const isActive = isRouteActive(pathname, href);

    return (
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: label, side: "right" }}
                className={cn(
                    "h-11 gap-3 rounded-none px-4 text-[12px] tracking-tight font-semibold transition-colors duration-150 relative",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    isActive
                        // Active: blue text + subtle blue-tinted bg
                        ? "bg-sidebar-active-bg text-sidebar-active"
                        // Default: muted grey → hover: full foreground (black/white)
                        : "text-sidebar-foreground/40 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
            >
                <Link href={href}>
                    <Icon
                        className={cn(
                            "shrink-0 size-4 transition-all duration-150",
                            isActive
                                ? "opacity-100 scale-110 text-sidebar-active"
                                : "opacity-40 scale-100 group-hover/menu-button:opacity-80"
                        )}
                    />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>

                    {isActive && (
                        <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-sidebar-active [box-shadow:0_0_8px_color-mix(in_srgb,var(--sidebar-active)_50%,transparent)]"
                        />
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
    const pathname = usePathname() ?? "";

    return (
        <Sidebar collapsible="icon">
            {/* ── Header ── */}
            <SidebarHeader className="h-14 border-b border-sidebar-border/60 px-4 group-data-[collapsible=icon]:px-0">
                <Link
                    href="/dashboard"
                    className="flex h-full items-center gap-3 group/logo overflow-hidden group-data-[collapsible=icon]:justify-center"
                >
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                        <Logo className="h-4 w-4 transition-transform duration-500 group-hover/logo:rotate-12" />
                    </div>

                    <div className="grid gap-0.5 leading-none group-data-[collapsible=icon]:hidden min-w-0">
                        <span className="truncate text-[13px] font-bold tracking-tight text-sidebar-active">
                            PyAnalypt
                        </span>
                        <span className="truncate text-[10px] font-medium tracking-tight text-sidebar-foreground/35">
                            Data Platform
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Navigation ── */}
            <SidebarContent className="px-0">
                {/* Workspace group */}
                <SidebarGroup className="px-0 py-2">
                    <SidebarGroupLabel className="mb-2 h-auto px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/30 group-data-[collapsible=icon]:hidden">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0">
                            {WORKSPACE_ITEMS.map((item) => (
                                <NavItem key={item.href} {...item} pathname={pathname} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="px-0 pb-2">
                <SidebarSeparator className="mb-2 bg-sidebar-border/30 mx-4" />
                <SidebarMenu className="gap-0">
                    {FOOTER_ITEMS.map((item) => (
                        <NavItem key={item.href} {...item} pathname={pathname} />
                    ))}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
