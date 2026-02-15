"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Github, Home, BarChart3, FlaskConical, BookOpen } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className={cn(
                "w-full fixed top-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "border-border/40 bg-background/80 backdrop-blur-xl py-2"
                    : "border-transparent bg-transparent py-4"
            )}
        >
            <div className="flex items-center justify-between px-6 md:px-12 h-16 max-w-[1700px] mx-auto">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-foreground text-background transition-transform group-hover:scale-110 relative overflow-hidden">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Sparkles size={16} fill="currentColor" />
                        </motion.div>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop */}
                <div className="hidden md:flex">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-2">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="/" className="flex items-center gap-2">
                                        <Home size={16} /> Home
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="/templates" className="flex items-center gap-2">
                                        <BarChart3 size={16} /> Visualizations
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="/playground" className="flex items-center gap-2">
                                        <FlaskConical size={16} /> Playground
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="/docs" className="flex items-center gap-2">
                                        <BookOpen size={16} /> Docs
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Actions - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank">
                            <Github size={20} />
                        </Link>
                    </Button>
                    <ModeToggle />
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/login">
                            Log in
                        </Link>
                    </Button>
                    <Button className="bg-foreground text-background hover:bg-foreground/90" asChild>
                        <Link href="/register">
                            Register
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank">
                            <Github size={20} />
                        </Link>
                    </Button>
                    <ModeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl absolute w-full p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-5">
                    <Link href="/" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <Home size={18} /> Home
                    </Link>
                    <Link href="/templates" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <BarChart3 size={18} /> Visualizations
                    </Link>
                    <Link href="/playground" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <FlaskConical size={18} /> Playground
                    </Link>
                    <Link href="/docs" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <BookOpen size={18} /> Docs
                    </Link>
                    <div className="h-px bg-border my-2" />
                    <div className="flex gap-4 p-2">
                        <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground">Log in</Button>
                        <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">Register</Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
