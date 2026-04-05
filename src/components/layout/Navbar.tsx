"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Settings } from "lucide-react";
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

// Remove motion entry animations as per user desire for motion-lite experience
// But keep subtle hover/scroll states via static CSS or standard framer-motion props if necessary
// Actually, user said 'no using motion', so I'll minimize it.

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Visuals", href: "/visuals" },
    { label: "Playground", href: "/playground" },
    { label: "About", href: "/about" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-5 px-6 pointer-events-none">
            <header
                className={cn(
                    "relative pointer-events-auto flex items-center justify-between pl-4 pr-3 h-14 transition-all duration-500 rounded-2xl border border-border/80 mx-auto w-full max-w-7xl",
                    scrolled
                        ? "bg-background/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-border/100"
                        : "bg-background/40 backdrop-blur-sm shadow-none border-transparent"
                )}
            >
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <Logo className="transition-transform duration-300 group-hover:scale-105" />
                    <span className="text-md font-black tracking-tighter text-foreground selection:bg-none hidden md:block">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop - SHADCN MONOCHROME STYLE */}
                <nav className="hidden lg:flex items-center gap-0.5">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="px-4 py-2 rounded-lg text-[10px] font-black tracking-widest text-muted-foreground uppercase hover:text-foreground hover:bg-muted/50 transition-all text-center flex items-center"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isLoading && isAuthenticated ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative flex items-center gap-3 h-9 rounded-xl px-2 hover:bg-muted">
                                    <span className="hidden sm:flex flex-col items-end leading-tight pr-1">
                                        <span className="text-[10px] font-black tracking-tight text-foreground/90 max-w-28 truncate">
                                            {user?.full_name || user?.username}
                                        </span>
                                        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Status: Active</span>
                                    </span>
                                    <Avatar className="h-8 w-8 shrink-0 border border-border/20 transition-all duration-300 hover:border-foreground/40">
                                        <AvatarImage src={user?.profile_picture ?? undefined} alt={user?.username} />
                                        <AvatarFallback className="bg-muted text-foreground text-[10px] font-black">
                                            {user?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52 rounded-xl p-1.5 bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-foreground/5 mt-2" align="end">
                                <DropdownMenuLabel className="px-3 py-2.5">
                                    <p className="text-[11px] font-black tracking-tight truncate">{user?.full_name || user?.username}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground truncate opacity-60">@{user?.username}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-muted cursor-pointer transition-colors font-black text-[10px] tracking-widest uppercase">
                                    <Link href="/dashboard" className="flex items-center">
                                        <LayoutDashboard className="mr-3 h-3.5 w-3.5 opacity-50" />
                                        <span>DASHBOARD</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-muted cursor-pointer transition-colors font-black text-[10px] tracking-widest uppercase">
                                    <Link href="/profile" className="flex items-center">
                                        <UserIcon className="mr-3 h-3.5 w-3.5 opacity-50" />
                                        <span>PROFILE</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 hover:bg-muted cursor-pointer transition-colors font-black text-[10px] tracking-widest uppercase">
                                    <Link href="/settings" className="flex items-center">
                                        <Settings className="mr-3 h-3.5 w-3.5 opacity-50" />
                                        <span>SETTINGS</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem
                                    className="text-red-500/80 focus:text-red-500 focus:bg-red-500/5 cursor-pointer rounded-lg px-3 py-2 font-black text-[10px] tracking-widest uppercase transition-colors"
                                    onClick={logout}
                                >
                                    <LogOut className="mr-3 h-3.5 w-3.5 opacity-40 text-red-400" />
                                    <span>LOG OUT</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : !isLoading && (
                        <div className="hidden lg:flex items-center gap-1 text-[10px] font-black tracking-widest text-muted-foreground">
                            <Link href="/login" className="px-3 py-1.5 hover:text-foreground hover:bg-muted rounded-lg transition-all uppercase">LOGIN</Link>
                            <span className="opacity-20 select-none">|</span>
                            <Link href="/register" className="px-3 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-all uppercase">GET STARTED</Link>
                        </div>
                    )}

                    {/* Theme toggle — always visible on all breakpoints */}
                    <div className="scale-90 opacity-60 hover:opacity-100 transition-opacity">
                        <ModeToggle />
                    </div>

                    {/* Burger — visible below lg */}
                    <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </Button>
                </div>
            </header>

            {/* Mobile Menu Dropdown — SIMPLIFIED REFINED STYLE */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-[calc(100%+12px)] inset-x-6 z-40 bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl p-3 flex flex-col gap-1 shadow-2xl shadow-foreground/5 pointer-events-auto overflow-hidden">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-4 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center justify-center text-[10px] font-black tracking-widest uppercase"
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div className="h-px bg-border/20 my-2 mx-4" />

                    {!isLoading && isAuthenticated ? (
                        <div className="space-y-1">
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-4 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center justify-center text-[10px] font-black tracking-widest uppercase"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => { logout(); setMobileMenuOpen(false); }}
                                className="w-full p-4 hover:bg-red-500/5 rounded-xl text-red-500/60 hover:text-red-500 transition-all flex items-center justify-center text-[10px] font-black tracking-widest uppercase"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 p-2">
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-4 bg-muted/30 border border-border/40 rounded-xl text-foreground transition-all flex items-center justify-center text-[10px] font-black tracking-widest uppercase"
                            >
                                LOGIN
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-4 bg-foreground text-background rounded-xl transition-all flex items-center justify-center text-[10px] font-black tracking-widest uppercase"
                            >
                                REGISTER
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
