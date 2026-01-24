"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Github } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="w-full border-b border-border/40 bg-background/80 backdrop-blur-xl fixed top-0 z-50 transition-colors duration-300">
            <div className="flex items-center justify-between px-6 md:px-12 h-16 max-w-[1700px] mx-auto">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-foreground text-background transition-transform group-hover:scale-110">
                        <Sparkles size={18} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop */}
                <div className="hidden md:flex">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="/">
                                        Home
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="#">
                                        Templates
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="#">
                                        Product
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="#">
                                        Pricing
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground")}>
                                    <Link href="#">
                                        Docs
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
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Log in
                    </Button>
                    <Button className="bg-foreground text-background hover:bg-foreground/90">
                        Register
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
                    <Link href="/" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                    <Link href="#" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
                    <Link href="#" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">Product</Link>
                    <Link href="#" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="#" className="p-3 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
                    <div className="h-px bg-border my-2" />
                    <div className="flex gap-4 p-2">
                        <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground">Log in</Button>
                        <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">Register</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
