"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
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
import { motion } from "framer-motion";

const SIDEBAR_EXPANDED = 230;
const SIDEBAR_COLLAPSED = 72;

interface AppNavbarProps {
    collapsed: boolean;
}

export function AppNavbar({ collapsed }: Readonly<AppNavbarProps>) {
    const { user, logout } = useAuth();

    return (
        <motion.header
            animate={{ left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed top-0 right-0 z-50 h-14 flex items-center justify-end px-4 border-b border-border bg-background/95 backdrop-blur-xl"
        >

            {/* Right — actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Link
                        href="https://github.com/soklimkhy/pyanalypt_frontend"
                        target="_blank"
                        aria-label="GitHub"
                    >
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-[18px] w-[18px]"
                        >
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                    </Link>
                </Button>

                <ModeToggle />

                {/* User dropdown */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-8 w-8 rounded-full"
                        >
                            <Avatar className="h-8 w-8 border border-border transition-all duration-300 hover:border-blue-500/50 hover:ambient-glow-blue">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt={user?.username}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {user?.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-52" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-semibold leading-none">
                                    {user?.full_name || user?.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile/setting" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => logout()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
}
