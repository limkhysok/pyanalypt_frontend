"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Home, BarChart2, FlaskConical, Info, ChevronRight, ArrowRight } from "lucide-react";
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
    { label: "Home",       href: "/",           icon: Home        },
    { label: "Visuals",    href: "/visuals",    icon: BarChart2   },
    { label: "Playground", href: "/playground", icon: FlaskConical},
    { label: "Intel",      href: "/about",      icon: Info        },
];

const GITHUB_URL = "https://github.com/soklimkhy/pyanalypt";

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

    const displayName = user?.full_name || user?.username || "";
    const initials = user ? getInitials(user) : "";

    return (
        <div className="fixed top-0 inset-x-0 z-50 pointer-events-none">

            {/* ── Bar Navbar ── */}
            <header
                className={cn(
                    "font-sans relative pointer-events-auto flex items-center justify-between px-4 sm:px-6 h-14 transition-all duration-300 border-b w-full",
                    scrolled
                        ? "bg-background/95 backdrop-blur-2xl border-foreground/10"
                        : "bg-background/70 backdrop-blur-md border-border/50"
                )}
            >
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <Logo className="w-6 h-6 transition-all duration-500 group-hover:rotate-12 grayscale group-hover:grayscale-0" />
                    <span className="text-sm sm:text-base font-black tracking-tight text-foreground hidden sm:block">
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
                                    "px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-200",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
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

                    {/* Sticky CTA */}
                    {scrolled && (
                        <Link
                            href="/dashboard"
                            className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-blue-600 dark:bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/25 animate-in fade-in slide-in-from-right-4 duration-300"
                        >
                            Launch Dashboard <ArrowRight size={12} />
                        </Link>
                    )}

                    <div className={cn("w-px h-4 bg-border/40 mx-1 hidden sm:block", !scrolled && "sm:hidden", scrolled && "lg:block")} />

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
                                className="px-3 py-1.5 text-xs sm:text-sm font-bold tracking-tight text-foreground/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center rounded-full text-xs sm:text-sm font-bold tracking-tight hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Get started <UserIcon size={12} className="ml-1.5" />
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
                <div className="md:hidden absolute top-full inset-x-0 z-40 bg-background/98 backdrop-blur-3xl border-b border-border/80 overflow-hidden shadow-lg pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Header row */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
                        <div className="flex items-center gap-2">
                            <Logo className="w-4 h-4 grayscale" />
                            <span className="text-sm font-black tracking-tight text-foreground">PyAnalypt</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" asChild>
                                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <GithubIcon size={13} />
                                </a>
                            </Button>
                            <ModeToggle className="h-7 w-7" />
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="p-1.5 space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all",
                                        isActive
                                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon size={13} className={cn("shrink-0", isActive ? "" : "opacity-40")} />
                                    <span className="flex-1">{item.label}</span>
                                    {isActive
                                        ? <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                                        : <ChevronRight size={12} className="opacity-20" />
                                    }
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth section */}
                    {!isLoading && (
                        <>
                            <div className="h-px bg-border/30 mx-2" />
                            {isAuthenticated ? (
                                <div className="p-1.5 space-y-0.5">
                                    {/* User card */}
                                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 mb-0.5">
                                        <Avatar className="h-6 w-6 shrink-0 border border-border/60">
                                            <AvatarImage src={user?.profile_picture ?? undefined} />
                                            <AvatarFallback className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate leading-tight text-foreground">{displayName}</p>
                                            {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                                        </div>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-all"
                                    >
                                        <span>Dashboard</span>
                                        <LayoutDashboard size={14} className="opacity-40" />
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-foreground/70 hover:bg-muted hover:text-foreground transition-all"
                                    >
                                        <span>Profile</span>
                                        <UserIcon size={14} className="opacity-40" />
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-red-500/70 hover:bg-red-500/5 hover:text-red-500 transition-all"
                                    >
                                        <span>Sign out</span>
                                        <LogOut size={14} className="opacity-50" />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-1.5 flex flex-col gap-1">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-3 text-center text-sm font-bold text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted transition-all"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-3 text-center text-sm font-bold text-white bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all shadow-md shadow-blue-500/20"
                                    >
                                        Get started
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
