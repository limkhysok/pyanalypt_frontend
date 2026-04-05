"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
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
import { motion } from "motion/react";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;

interface AppNavbarProps {
    collapsed: boolean;
}

export function AppNavbar({ collapsed }: Readonly<AppNavbarProps>) {
    const { user, logout } = useAuth();

    return (
        <motion.header
            animate={{ left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl"
        >
            {/* Left — Contextual Identifier */}
            <div className="flex items-center gap-4">

            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-border/40">
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
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[11px] font-bold text-foreground leading-none">
                                    {user?.username}
                                </span>
                                <span className="text-[9px] font-semibold text-muted-foreground opacity-40 leading-none">
                                    Authorized Access
                                </span>
                            </div>
                            <Avatar className="h-8 w-8 border border-border/60 rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:border-foreground/20">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt={user?.username}
                                    className="grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <AvatarFallback className="bg-muted text-foreground text-[10px] font-black uppercase">
                                    {user?.username?.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-2 shadow-2xl mt-2" align="end">
                        <DropdownMenuLabel className="px-4 py-4 pt-3">
                            <p className="text-[12px] font-bold text-foreground truncate">{user?.full_name || user?.username}</p>
                            <p className="text-[9px] font-semibold text-muted-foreground opacity-30 mt-1 truncate">ID: {user?.id ? String(user.id).substring(0, 16) : "Guest"}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/40" />

                        <div className="p-1 space-y-1">
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/dashboard" className="flex items-center justify-between w-full">
                                    <span>Workspace HUD</span>
                                    <LayoutDashboard size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/profile" className="flex items-center justify-between w-full">
                                    <span>Profile Core</span>
                                    <UserIcon size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl px-4 py-3 hover:bg-muted cursor-pointer transition-all text-[11px] font-semibold">
                                <Link href="/profile/setting" className="flex items-center justify-between w-full">
                                    <span>System Config</span>
                                    <Settings size={14} className="opacity-40" />
                                </Link>
                            </DropdownMenuItem>
                        </div>

                        <DropdownMenuSeparator className="bg-border/40" />

                        <div className="p-1">
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-red-500/80 focus:text-red-500 focus:bg-red-500/5 cursor-pointer text-[11px] font-semibold transition-all"
                                onClick={() => logout()}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Terminate Session</span>
                                    <LogOut size={14} className="opacity-40" />
                                </div>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
}
