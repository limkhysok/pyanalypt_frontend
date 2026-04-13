"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
    { label: "Home",    href: "/"           },
    { label: "Visuals", href: "/visuals"    },
    { label: "Lab",     href: "/playground" },
    { label: "Intel",   href: "/about"      },
];

const GITHUB_URL = "https://github.com/pyanalypt/pyanalypt";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const displayName =
        user?.full_name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.username ||
        "";
    const initials = user ? getInitials(user) : "";

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-8 px-6 pointer-events-none">

            {/* ── Pill HUD ── */}
            <header
                className={cn(
                    "relative pointer-events-auto flex items-center justify-between px-3 h-12 transition-all duration-300 rounded-full border shadow-2xl mx-auto w-fit min-w-[320px] md:min-w-160",
                    scrolled
                        ? "bg-background/95 backdrop-blur-2xl border-foreground/10 shadow-foreground/5"
                        : "bg-background/60 backdrop-blur-md border-border/80 shadow-none"
                )}
            >
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 px-3 group shrink-0">
                    <Logo className="w-6 h-6 transition-all duration-500 group-hover:rotate-12 grayscale group-hover:grayscale-0" />
                    <span className="text-[12px] font-black tracking-tighter text-foreground uppercase opacity-80 hidden sm:block">
                        PyAnalypt
                    </span>
                </Link>

                <div className="h-4 w-px bg-border/40 mx-1 hidden md:block" />

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-200",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="h-4 w-px bg-border/40 mx-1 hidden md:block" />

                {/* Actions */}
                <div className="flex items-center gap-0.5 pl-2">

                    {/* GitHub */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hidden sm:flex"
                        asChild
                    >
                        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <GithubIcon size={15} />
                        </a>
                    </Button>

                    {/* Theme toggle */}
                    <ModeToggle className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all" />

                    <div className="w-px h-4 bg-border/40 mx-1 hidden sm:block" />

                    {/* User / Auth */}
                    {!isLoading && isAuthenticated ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center outline-none rounded-full focus-visible:ring-2 focus-visible:ring-ring">
                                    <Avatar className="h-8 w-8 border border-border/60 hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-colors">
                                        <AvatarImage src={user?.profile_picture ?? undefined} />
                                        <AvatarFallback className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-52 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl mt-4"
                                align="end"
                            >
                                <DropdownMenuLabel className="px-3 py-3">
                                    <p className="text-[12px] font-semibold text-foreground truncate">{displayName}</p>
                                    {user?.email && (
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{user.email}</p>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer text-[12px] gap-2">
                                    <Link href="/dashboard" className="flex items-center justify-between w-full">
                                        <span>Dashboard</span>
                                        <LayoutDashboard size={13} className="opacity-40" />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer text-[12px] gap-2">
                                    <Link href="/profile" className="flex items-center justify-between w-full">
                                        <span>Profile</span>
                                        <UserIcon size={13} className="opacity-40" />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuItem
                                    className="rounded-xl px-3 py-2 cursor-pointer text-[12px] text-red-500/80 focus:text-red-500 focus:bg-red-500/5 gap-2"
                                    onClick={logout}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>Sign out</span>
                                        <LogOut size={13} className="opacity-40" />
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : !isLoading && (
                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href="/login"
                                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-1.5 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Start <UserIcon size={10} className="ml-2" />
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8 rounded-full hover:bg-muted ml-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </Button>
                </div>
            </header>

            {/* ── Mobile menu ── */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-[calc(100%+8px)] inset-x-6 z-40 bg-background/95 backdrop-blur-3xl border border-border/80 rounded-3xl p-3 flex flex-col gap-1 shadow-2xl pointer-events-auto max-w-[320px] mx-auto w-full">
                    <div className="flex items-center justify-between px-4 py-2 mb-2 border-b border-border/20">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Menu</span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" asChild>
                                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <GithubIcon size={14} />
                                </a>
                            </Button>
                            <ModeToggle />
                        </div>
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "p-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all text-left flex items-center justify-between",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {item.label}
                                <span className={isActive ? "text-blue-400 dark:text-blue-500" : "opacity-20"}>/</span>
                            </Link>
                        );
                    })}
                    {!isLoading && !isAuthenticated && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40">
                            <Link
                                href="/login"
                                className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-center text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Join
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
