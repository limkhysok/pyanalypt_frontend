"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
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
import { motion } from "motion/react";

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
                        <GithubIcon size={18} />
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
