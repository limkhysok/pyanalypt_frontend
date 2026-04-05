"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Settings, ChevronDown, Rocket } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
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
    { label: "Home", href: "/" },
    { label: "Visuals", href: "/visuals" },
    { label: "Lab", href: "/playground" },
    { label: "Intel", href: "/about" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-8 px-6 pointer-events-none">
            
            {/* ── Single-Pill Integrated HUD ── */}
            <header
                className={cn(
                    "relative pointer-events-auto flex items-center justify-between px-3 h-12 transition-all duration-700 rounded-full border shadow-2xl mx-auto w-fit min-w-[320px] md:min-w-[640px]",
                    scrolled
                        ? "bg-background/95 backdrop-blur-2xl border-foreground/10 shadow-foreground/5"
                        : "bg-background/60 backdrop-blur-md border-border/80 shadow-none scale-105"
                )}
            >
                {/* ── Brand Unit (Integrated) ── */}
                <Link href="/" className="flex items-center gap-2.5 px-3 group shrink-0">
                    <Logo className="w-6 h-6 transition-transform duration-500 group-hover:rotate-12 grayscale" />
                    <span className="text-[12px] font-black tracking-tighter text-foreground uppercase opacity-80 hidden sm:block">
                        PyAnalypt
                    </span>
                </Link>

                <div className="h-4 w-px bg-border/40 mx-1 hidden md:block" />

                {/* ── Navigation HUD Cluster ── */}
                <nav className="flex items-center gap-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="h-4 w-px bg-border/40 mx-1 hidden md:block" />

                {/* ── Actions Cluster ── */}
                <div className="flex items-center gap-1.5 pl-3">
                    {!isLoading && isAuthenticated ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center outline-none hover:scale-105 transition-transform">
                                    <Avatar className="h-8 w-8 border border-border/60 rounded-full">
                                        <AvatarImage src={user?.profile_picture ?? undefined} className="grayscale" />
                                        <AvatarFallback className="bg-muted text-foreground text-[10px] font-black uppercase">
                                            {user?.username?.substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl mt-4" align="end">
                                <DropdownMenuLabel className="px-3 py-3">
                                    <p className="text-[11px] font-black tracking-tight text-foreground">{user?.full_name || user?.username}</p>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mt-1 truncate">ID: {user?.id}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuItem asChild className="rounded-xl px-4 py-2.5 hover:bg-muted cursor-pointer transition-all text-[9px] font-black uppercase tracking-widest">
                                    <Link href="/dashboard" className="flex items-center justify-between w-full">
                                        <span>DASHBOARD</span>
                                        <LayoutDashboard size={12} className="opacity-40" />
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="rounded-xl px-4 py-2.5 text-red-500/80 focus:text-red-500 focus:bg-red-500/5 cursor-pointer text-[9px] font-black uppercase tracking-widest"
                                    onClick={logout}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>EXIT LINK</span>
                                        <LogOut size={12} className="opacity-40" />
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : !isLoading && (
                        <div className="hidden lg:flex items-center gap-1">
                            <Link href="/login" className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                                Login
                            </Link>
                            <Link href="/register" className="px-4 py-1.5 bg-foreground text-background flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-foreground/5">
                                Start <Rocket size={10} className="ml-2" />
                            </Link>
                        </div>
                    )}

                    <div className="scale-75 opacity-50 hover:opacity-100 transition-opacity">
                        <ModeToggle />
                    </div>

                    <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-full hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </Button>
                </div>
            </header>

            {/* ── Mobile Pill Menu ── */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-[calc(100%+12px)] inset-x-12 z-40 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-[2rem] p-3 flex flex-col gap-1 shadow-2xl pointer-events-auto">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-4 hover:bg-muted rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-all text-center"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {!isLoading && !isAuthenticated && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40">
                             <Link href="/login" className="p-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">Login</Link>
                             <Link href="/register" className="p-3 bg-foreground text-background rounded-full text-center text-[9px] font-black uppercase tracking-widest">Join</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
