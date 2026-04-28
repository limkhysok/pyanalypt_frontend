"use client";

import Link from "next/link";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
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
import { getInitials } from "@/lib/utils";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const GROUP_HREFS: Record<string, string> = {
    Workspace: "/dashboard",
    Results:   "/analysis",
    Account:   "/profile",
};

function getBreadcrumb(pathname: string): { group: string; page: string } {
    if (pathname === "/dashboard")                return { group: "Workspace", page: "Dashboard" };
    if (pathname.startsWith("/framing"))          return { group: "Workspace", page: "Framing"   };
    if (pathname === "/issues")                   return { group: "Workspace", page: "Issues"    };
    if (pathname === "/clean")                    return { group: "Workspace", page: "Clean"     };
    if (pathname.startsWith("/datasets")) {
        const page = pathname.includes("/preview") ? "Preview" : "Datasets";
        return { group: "Workspace", page };
    }
    if (pathname.startsWith("/datalab"))           return { group: "Workspace", page: "DataLab"  };
    if (pathname.startsWith("/eda"))              return { group: "Workspace", page: "EDA"      };
    if (pathname === "/analysis")                 return { group: "Results",  page: "Analysis"  };
    if (pathname === "/insight")                  return { group: "Results",  page: "Insight"   };
    if (pathname === "/profile")                  return { group: "Account",  page: "Profile"   };
    if (pathname === "/profile/setting")          return { group: "Account",  page: "Settings"  };
    return { group: "Workspace", page: "Dashboard" };
}

// ─────────────────────────────────────────────
// AppNavbar
// ─────────────────────────────────────────────
export function AppNavbar() {
    const { user, logout } = useAuth();
    const pathname         = usePathname() ?? "";
    const { group, page }  = getBreadcrumb(pathname);

    const displayName = user?.full_name || user?.username || "";
    const initials = user ? getInitials(user) : "U";

    return (
        <header className="sticky top-0 z-50 h-12 flex items-center justify-between px-4 sm:px-6 border-b border-sidebar-border bg-background">

            {/* ── Left: trigger + breadcrumb ── */}
            <div className="flex items-center gap-3 sm:gap-4">
                <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all" />
                <Separator orientation="vertical" className="h-4 w-px bg-border/40" />

                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="text-[13px] font-medium tracking-normal">
                                <Link href={GROUP_HREFS[group] ?? "/dashboard"}>{group}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[13px] font-semibold tracking-normal">
                                {page}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ── Right: actions ── */}
            <div className="flex items-center gap-1">

                {/* GitHub */}
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    <Link
                        href="https://github.com/soklimkhy/pyanalypt_frontend"
                        target="_blank"
                        aria-label="GitHub"
                    >
                        <GithubIcon size={15} />
                    </Link>
                </Button>

                {/* Theme toggle */}
                <ModeToggle className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" />

                <Separator orientation="vertical" className="h-4 w-px bg-border/40 mx-1" />

                {/* User avatar → dropdown */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring">
                            <Avatar className="h-8 w-8 border border-border/60 transition-all duration-200 hover:border-foreground/20 hover:scale-105">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt={displayName}
                                />
                                <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-56 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl mt-2"
                        align="end"
                    >
                        {/* Identity card */}
                        <DropdownMenuLabel className="px-2 py-2">
                            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                                <Avatar className="h-8 w-8 shrink-0 border border-border/40">
                                    <AvatarImage src={user?.profile_picture ?? undefined} alt={displayName} />
                                    <AvatarFallback className="bg-muted text-foreground text-[10px] font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-[13px] font-semibold text-foreground leading-tight">
                                        {displayName}
                                    </span>
                                    {user?.email && (
                                        <span className="truncate text-[11px] text-muted-foreground leading-tight mt-0.5">
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/40 my-1" />

                        {/* Mobile-only shortcuts — sidebar is behind a sheet on mobile */}
                        <div className="sm:hidden space-y-0.5 mb-1">
                            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer text-[13px] font-medium">
                                <Link href="/profile" className="flex items-center justify-between w-full">
                                    <span>Profile</span>
                                    <UserIcon size={13} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer text-[13px] font-medium">
                                <Link href="/profile/setting" className="flex items-center justify-between w-full">
                                    <span>Settings</span>
                                    <Settings size={13} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/40 my-1" />
                        </div>

                        {/* Sign out */}
                        <DropdownMenuItem
                            className="rounded-xl px-3 py-2.5 cursor-pointer text-[13px] font-medium text-red-500/80 focus:text-red-500 focus:bg-red-500/5"
                            onClick={logout}
                        >
                            <span className="flex-1">Sign out</span>
                            <LogOut size={13} className="opacity-40" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
