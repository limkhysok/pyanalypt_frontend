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

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Datasets",  href: "/datasets",  icon: Database         },
    { label: "Issues",    href: "/issues",    icon: AlertCircle      },
    { label: "Clean",     href: "/clean",     icon: Trash2           },
    { label: "Analysis",  href: "/analysis",  icon: BarChart3        },
    { label: "Insight",   href: "/insight",   icon: Lightbulb        },
];

const FOOTER_ITEMS = [
    { label: "Profile",  href: "/profile",        icon: User     },
    { label: "Settings", href: "/profile/setting", icon: Settings },
];

function NavItem({
    label,
    href,
    icon: Icon,
}: Readonly<{ label: string; href: string; icon: React.ElementType }>) {
    const pathname = usePathname() ?? "";
    const isActive =
        pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: label, side: "right" }}
                className={cn(
                    "h-10 gap-3 rounded-none px-4 text-[12px] tracking-tight font-medium transition-all duration-150 relative",
                    "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                    isActive
                        ? "bg-sidebar-accent/80 text-sidebar-foreground border-r border-sidebar-border"
                        : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
            >
                <Link href={href}>
                    <Icon
                        className={cn(
                            "shrink-0 size-4 transition-all duration-150",
                            isActive ? "opacity-100 scale-110" : "opacity-45 scale-100"
                        )}
                    />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>

                    {/* Precision Left Accent Bar */}
                    {isActive && (
                        <span 
                            aria-hidden
                            className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
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
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sidebar-border/80 bg-sidebar-accent shadow-xs">
                        <Logo className="h-4 w-4 grayscale transition-all duration-500 group-hover/logo:rotate-12 group-hover/logo:grayscale-0" />
                    </div>

                    <div className="grid gap-0.5 leading-none group-data-[collapsible=icon]:hidden min-w-0">
                        <span className="truncate text-[13px] font-bold tracking-tight text-sidebar-foreground">
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
                <SidebarGroup className="px-0 py-2">
                    <SidebarGroupLabel className="mb-2 h-auto px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/30 group-data-[collapsible=icon]:hidden">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0">
                            {NAV_ITEMS.map((item) => (
                                <NavItem key={item.href} {...item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="px-0 pb-2">
                <SidebarSeparator className="mb-2 bg-sidebar-border/30 mx-4" />
                <SidebarMenu className="gap-0">
                    {FOOTER_ITEMS.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            pathname === href || pathname.startsWith(href + "/");

                        return (
                            <SidebarMenuItem key={href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: label, side: "right" }}
                                    className={cn(
                                        "h-10 gap-3 rounded-none px-4 text-[12px] tracking-tight font-medium transition-all duration-150 relative",
                                        "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                                        isActive
                                            ? "bg-sidebar-accent/80 text-sidebar-foreground border-r border-sidebar-border"
                                            : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )}
                                >
                                    <Link href={href}>
                                        <Icon
                                            className={cn(
                                                "shrink-0 size-4 transition-all duration-150",
                                                isActive ? "opacity-100 scale-110" : "opacity-45 scale-100"
                                            )}
                                        />
                                        <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>

                                        {/* Precision Left Accent Bar */}
                                        {isActive && (
                                            <span 
                                                aria-hidden
                                                className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                                            />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
