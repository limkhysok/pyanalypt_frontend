"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <div className="w-full border-b border-white/5 bg-black/50 backdrop-blur-xl fixed top-0 z-50">
            <div className="flex items-center justify-between px-6 md:px-12 h-16 max-w-[1700px] mx-auto">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-white text-black transition-transform group-hover:scale-110">
                        <Sparkles size={18} fill="black" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        PyAnalypt
                    </span>
                </Link>

                {/* Center Menu - Desktop */}
                <div className="hidden md:flex">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white data-[active]:bg-white/5 data-[state=open]:bg-white/5")}>
                                    <Link href="/">
                                        Home
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white data-[active]:bg-white/5 data-[state=open]:bg-white/5")}>
                                    <Link href="#">
                                        Product
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white data-[active]:bg-white/5 data-[state=open]:bg-white/5")}>
                                    <Link href="#">
                                        Pricing
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white data-[active]:bg-white/5 data-[state=open]:bg-white/5")}>
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
                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                        Log in
                    </Button>
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        Register
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl absolute w-full p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-5">
                    <Link href="/" className="p-3 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors">Home</Link>
                    <Link href="#" className="p-3 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors">Product</Link>
                    <Link href="#" className="p-3 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                    <Link href="#" className="p-3 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors">Docs</Link>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex gap-4 p-2">
                        <Button variant="ghost" className="flex-1 text-zinc-400 hover:text-white">Log in</Button>
                        <Button className="flex-1 bg-white text-black hover:bg-zinc-200">Register</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
