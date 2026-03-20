"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Home, BarChart3, FlaskConical, BookOpen, LogOut, LayoutDashboard, User as UserIcon, Settings } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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

import { motion, useScroll, useMotionValueEvent } from "motion/react";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    return (
        <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 sm:pt-6 px-4 pointer-events-none">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                className={cn(
                    "relative pointer-events-auto flex items-center justify-between px-3 md:px-6 h-16 transition-all duration-500 rounded-full border mx-auto w-full max-w-3xl",
                    scrolled
                        ? "bg-background/85 backdrop-blur-xl border-border/50 shadow-2xl shadow-black/10 dark:shadow-white/5"
                        : "bg-background/20 sm:bg-background/40 backdrop-blur-sm sm:backdrop-blur-md border-border/10 sm:border-border/20 shadow-transparent"
                )}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group mr-2">
                <div className="p-1.5 rounded-full bg-blue-600 text-white dark:bg-foreground dark:text-background transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 dark:group-hover:bg-foreground/90 group-hover:ambient-glow-blue relative overflow-hidden">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Sparkles size={16} fill="currentColor" />
                        </motion.div>
                    </div>
                    {/* Hide text on scrolled mobile if space is tight, though max-w-3xl might fit it. Let's keep it visible. */}
                    <span className="text-lg font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-glow-blue hidden sm:block">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop */}
                <div className="hidden md:flex flex-1 justify-center">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-1 bg-secondary/30 rounded-full px-2 py-1">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "rounded-full bg-transparent text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-background focus:bg-background focus:text-foreground h-9 px-3")}>
                                    <Link href="/" className="flex items-center gap-1.5">
                                        <Home size={14} /> HOME
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "rounded-full bg-transparent text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-background focus:bg-background focus:text-foreground h-9 px-3")}>
                                    <Link href="/tutorials" className="flex items-center gap-1.5">
                                        <BookOpen size={14} /> TUTORIALS
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "rounded-full bg-transparent text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-background focus:bg-background focus:text-foreground h-9 px-3")}>
                                    <Link href="/visuals" className="flex items-center gap-1.5">
                                        <BarChart3 size={14} /> VISUALS
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "rounded-full bg-transparent text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-background focus:bg-background focus:text-foreground h-9 px-3")}>
                                    <Link href="/playground" className="flex items-center gap-1.5">
                                        <FlaskConical size={14} /> PLAY
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "rounded-full bg-transparent text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-background focus:bg-background focus:text-foreground h-9 px-3")}>
                                    <Link href="/docs" className="flex items-center gap-1.5">
                                        <BookOpen size={14} /> DOCS
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Actions - Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-2">
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground rounded-full h-9 w-9">
                        <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank" aria-label="GitHub">
                            <GithubIcon size={18} />
                        </Link>
                    </Button>
                    <div className="scale-90">
                        <ModeToggle />
                    </div>

                    {/* Auth Status Sections */}
                    {isLoading && (
                        <div className="h-9 w-20 rounded-full bg-accent/20 animate-pulse border border-border/50 ml-2" />
                    )}

                    {!isLoading && isAuthenticated && (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                                    <Avatar className="h-9 w-9 border border-border transition-all duration-300 hover:border-blue-500/50 hover:ambient-glow-blue">
                                        <AvatarImage src={user?.profile_picture ?? undefined} alt={user?.username} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {user?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-2xl" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-xl">
                                    <Link href="/dashboard" className="cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl">
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl">
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer rounded-xl"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {!isLoading && !isAuthenticated && (
                        <div className="flex items-center gap-1.5 ml-2">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:text-glow-mono transition-all rounded-full h-9 px-4 text-[11px] font-bold tracking-wider uppercase" asChild>
                                <Link href="/login">
                                    LOG IN
                                </Link>
                            </Button>
                            <Button className="bg-blue-600 text-white dark:bg-foreground dark:text-background hover:bg-blue-700 dark:hover:bg-foreground/90 transition-all duration-300 hover:ambient-glow-blue rounded-full h-9 px-4 text-[11px] font-bold tracking-wider uppercase" asChild>
                                <Link href="/register">
                                    REGISTER
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full">
                        <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank" aria-label="GitHub">
                            <GithubIcon size={18} />
                        </Link>
                    </Button>
                    <div className="scale-90">
                        <ModeToggle />
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </motion.div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 border border-border/50 bg-background/95 backdrop-blur-xl w-full max-w-sm mx-auto rounded-3xl p-4 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4 pointer-events-auto relative z-40">
                    <Link href="/" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <Home size={18} /> Home
                    </Link>
                    <Link href="/tutorials" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <BookOpen size={18} /> Tutorials
                    </Link>
                    <Link href="/visuals" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <BarChart3 size={18} /> Visuals
                    </Link>
                    <Link href="/playground" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <FlaskConical size={18} /> Playground
                    </Link>
                    <Link href="/docs" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <BookOpen size={18} /> Docs
                    </Link>
                    <div className="h-px bg-border/50 my-2 mx-2" />

                    {isAuthenticated ? (
                        <div className="space-y-2 p-2">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 mb-2">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={user?.profile_picture ?? undefined} />
                                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold truncate">{user?.username}</span>
                                    <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                                </div>
                            </div>
                            <Link href="/dashboard" className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="w-full text-left p-3 hover:bg-destructive/10 rounded-xl text-destructive transition-colors flex items-center gap-3"
                            >
                                <LogOut size={18} /> Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 p-2">
                            <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground hover:text-glow-mono rounded-xl transition-all text-xs font-bold tracking-wider uppercase" asChild>
                                <Link href="/login">LOG IN</Link>
                            </Button>
                            <Button className="flex-1 bg-blue-600 text-white dark:bg-foreground dark:text-background hover:bg-blue-700 dark:hover:bg-foreground/90 transition-all duration-300 hover:ambient-glow-blue rounded-xl text-xs font-bold tracking-wider uppercase" asChild>
                                <Link href="/register">REGISTER</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
