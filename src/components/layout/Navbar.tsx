"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, User as UserIcon, Settings } from "lucide-react";
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

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "Visuals", href: "/visuals" },
    { label: "Playground", href: "/playground" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Docs", href: "/docs" },
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                className={cn(
                    "relative pointer-events-auto flex items-center justify-between pl-4 pr-3 h-14 transition-all duration-700 rounded-full border-2 border-black dark:border-white/20 mx-auto w-full max-w-325",
                    scrolled
                        ? "bg-background/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                        : "bg-background/10 backdrop-blur-xl shadow-none"
                )}
            >
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <Sparkles size={16} />
                    </div>
                    <span className="text-lg font-black tracking-tight text-foreground/90 hidden sm:block">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop */}
                <div className="hidden lg:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase text-foreground/70 hover:text-blue-500 hover:bg-blue-500/5 transition-all text-center flex items-center"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isLoading && isAuthenticated ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative flex items-center gap-2.5 h-9 rounded-full px-2 hover:bg-blue-500/5">
                                    {/* Greeting — hidden on small screens */}
                                    <span className="hidden sm:flex flex-col items-end leading-tight">
                                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground/60">Hello!</span>
                                        <span className="text-[11px] font-black tracking-tight text-foreground/80 max-w-25 truncate">
                                            {user?.full_name || user?.username}
                                        </span>
                                    </span>
                                    <Avatar className="h-8 w-8 shrink-0 border border-border/10 transition-all duration-300 hover:border-blue-500/30">
                                        <AvatarImage src={user?.profile_picture ?? undefined} alt={user?.username} />
                                        <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs font-black">
                                            {user?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-4xl p-2 bg-background/90 backdrop-blur-2xl border-border/10 shadow-2xl" align="end">
                                <DropdownMenuLabel className="px-4 py-3">
                                    <p className="text-sm font-black tracking-tight truncate">{user?.full_name || user?.username}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground truncate">@{user?.username}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/5" />
                                <DropdownMenuItem asChild className="rounded-xl px-4 py-2 hover:bg-blue-500/5 hover:text-blue-500 cursor-pointer transition-colors font-bold text-sm">
                                    <Link href="/dashboard" className="flex items-center">
                                        <LayoutDashboard className="mr-3 h-4 w-4 opacity-40" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl px-4 py-2 hover:bg-blue-500/5 hover:text-blue-500 cursor-pointer transition-colors font-bold text-sm">
                                    <Link href="/profile" className="flex items-center">
                                        <UserIcon className="mr-3 h-4 w-4 opacity-40" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl px-4 py-2 hover:bg-blue-500/5 hover:text-blue-500 cursor-pointer transition-colors font-bold text-sm">
                                    <Link href="/settings" className="flex items-center">
                                        <Settings className="mr-3 h-4 w-4 opacity-40" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/5" />
                                <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500 focus:bg-red-500/5 cursor-pointer rounded-xl px-4 py-2 font-bold text-sm transition-colors"
                                    onClick={logout}
                                >
                                    <LogOut className="mr-3 h-4 w-4 opacity-40" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : !isLoading && (
                        <div className="hidden lg:flex items-center gap-1 text-[11px] font-black tracking-widest text-foreground/70">
                            <Link href="/login" className="hover:text-blue-500 transition-colors uppercase">LOGIN</Link>
                            <span className="opacity-30">/</span>
                            <Link href="/register" className="hover:text-blue-500 transition-colors uppercase">REGISTER</Link>
                        </div>
                    )}

                    {/* Theme toggle — always visible on all breakpoints */}
                    <div className="scale-90">
                        <ModeToggle />
                    </div>

                    {/* Burger — visible below lg */}
                    <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </motion.div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="lg:hidden absolute top-[calc(100%+12px)] inset-x-6 z-40 bg-background/80 backdrop-blur-3xl border-2 border-black dark:border-white/20 rounded-[2.5rem] p-4 flex flex-col gap-1 shadow-2xl pointer-events-auto"
                >
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-4 hover:bg-blue-500/5 rounded-3xl text-muted-foreground hover:text-blue-500 transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase"
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div className="h-px bg-border/10 my-2 mx-4" />

                    {!isLoading && isAuthenticated ? (
                        <div className="space-y-1">
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-4 hover:bg-blue-500/5 rounded-3xl text-muted-foreground hover:text-blue-500 transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => { logout(); setMobileMenuOpen(false); }}
                                className="w-full p-4 hover:bg-red-500/5 rounded-3xl text-red-500/70 hover:text-red-500 transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 px-2 pb-2">
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 p-4 hover:bg-blue-500/5 rounded-3xl text-muted-foreground hover:text-blue-500 transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase border border-border/20"
                            >
                                LOGIN
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 p-4 bg-blue-600 hover:bg-blue-700 rounded-3xl text-white transition-all flex items-center justify-center text-xs font-black tracking-widest uppercase"
                            >
                                REGISTER
                            </Link>
                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
