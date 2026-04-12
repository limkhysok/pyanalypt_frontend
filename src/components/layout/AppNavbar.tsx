"use client";

import Link from "next/link";
import { LogOut, User as UserIcon, Settings, LayoutDashboard, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { GithubIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { User } from "@/types/api";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Returns the breadcrumb group + page label for the current route. */
function getBreadcrumb(pathname: string): { group: string; page: string } {
    if (pathname === "/dashboard")                return { group: "Workspace", page: "Dashboard" };
    if (pathname === "/framing")                  return { group: "Workspace", page: "Framing"   };
    if (pathname === "/issues")                   return { group: "Workspace", page: "Issues"    };
    if (pathname === "/clean")                    return { group: "Workspace", page: "Clean"     };
    if (pathname.startsWith("/datasets")) {
        const page = pathname.includes("/preview") ? "Preview" : "Datasets";
        return { group: "Workspace", page };
    }
    if (pathname === "/analysis")                 return { group: "Results",  page: "Analysis"  };
    if (pathname === "/insight")                  return { group: "Results",  page: "Insight"   };
    if (pathname === "/profile")                  return { group: "Account",  page: "Profile"   };
    if (pathname === "/profile/setting")          return { group: "Account",  page: "Settings"  };
    return { group: "Workspace", page: "Dashboard" };
}

/** Derives display initials with the same priority as the sidebar. */
function getInitials(user: User): string {
    if (user.first_name && user.last_name)
        return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.username)   return user.username.slice(0, 2).toUpperCase();
    if (user.email)      return user.email[0].toUpperCase();
    return "U";
}

// ─────────────────────────────────────────────
// AppNavbar
// ─────────────────────────────────────────────
export function AppNavbar() {
    const { user, logout } = useAuth();
    const { setTheme }     = useTheme();
    const pathname         = usePathname() ?? "";

    const { group, page } = getBreadcrumb(pathname);

    const displayName = user
        ? user.full_name ||
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          user.username
        : "";

    const initials = user ? getInitials(user) : "U";

    return (
        <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border/90 bg-background">

            {/* ── Left: trigger + breadcrumb ── */}
            <div className="flex items-center gap-3 sm:gap-4">
                <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" />
                <Separator orientation="vertical" className="h-4 w-px bg-border/40" />

                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="text-[12px] font-medium tracking-tight">
                                <Link href="/dashboard">{group}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[12px] font-bold tracking-tight">
                                {page}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ── Right: actions ── */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* GitHub + theme toggle — desktop only */}
                <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-border/40">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
                    >
                        <Link
                            href="https://github.com/soklimkhy/pyanalypt_frontend"
                            target="_blank"
                            aria-label="GitHub"
                        >
                            <GithubIcon size={14} className="grayscale" />
                        </Link>
                    </Button>

                    <div className="scale-75 opacity-40 hover:opacity-100 transition-opacity">
                        <ModeToggle />
                    </div>
                </div>

                {/* User dropdown */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 group outline-none">
                            {/* Name + email — desktop only */}
                            <div className="hidden sm:flex flex-col items-end gap-0.5">
                                <span className="text-[11px] font-bold text-foreground leading-none">
                                    {displayName}
                                </span>
                                <span className="text-[9px] font-semibold text-muted-foreground opacity-40 leading-none truncate max-w-30">
                                    {user?.email ?? ""}
                                </span>
                            </div>

                            <Avatar className="h-8 w-8 border border-border/60 rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:border-foreground/20">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt={displayName}
                                    className="grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <AvatarFallback className="bg-muted text-foreground text-[10px] font-black uppercase">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-56 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl mt-2"
                        align="end"
                    >
                        {/* Identity block */}
                        <DropdownMenuLabel className="px-4 py-4 pt-3">
                            <p className="text-[12px] font-bold text-foreground truncate">
                                {displayName}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5 truncate">
                                {user?.email ?? ""}
                            </p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/40" />

                        {/* Navigation items */}
                        <div className="p-1 space-y-1">
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/dashboard" className="flex items-center justify-between w-full">
                                    <span>Dashboard</span>
                                    <LayoutDashboard size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/profile" className="flex items-center justify-between w-full">
                                    <span>Profile</span>
                                    <UserIcon size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/profile/setting" className="flex items-center justify-between w-full">
                                    <span>Settings</span>
                                    <Settings size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                        </div>

                        {/* GitHub + theme — mobile only (in dropdown) */}
                        <div className="sm:hidden">
                            <DropdownMenuSeparator className="bg-border/40" />
                            <div className="p-1 space-y-1">
                                <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                    <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank" className="flex items-center justify-between w-full">
                                        <span>Source Code</span>
                                        <GithubIcon size={14} className="opacity-40" />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                    <div className="flex items-center justify-between w-full">
                                        <span>Light Mode</span>
                                        <Sun size={14} className="opacity-40" />
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                    <div className="flex items-center justify-between w-full">
                                        <span>Dark Mode</span>
                                        <Moon size={14} className="opacity-40" />
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                    <div className="flex items-center justify-between w-full">
                                        <span>System Theme</span>
                                        <Monitor size={14} className="opacity-40" />
                                    </div>
                                </DropdownMenuItem>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-border/40" />

                        {/* Sign out */}
                        <div className="p-1">
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-red-500/80 focus:text-red-500 focus:bg-red-500/5 cursor-pointer text-[11px] font-semibold transition-all"
                                onClick={() => logout()}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Sign out</span>
                                    <LogOut size={14} className="opacity-40" />
                                </div>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
