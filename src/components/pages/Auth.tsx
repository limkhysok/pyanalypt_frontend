"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Github, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox"; 
import { cn } from "@/lib/utils";

// Shared Layout Component
function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background text-foreground p-4">
            {/* Background Ambience */}
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px] translate-z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[100px] translate-z-0" />
            </div>

            <div className="relative z-10 w-full max-w-[420px] animation-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center flex flex-col items-center gap-2">
                    <Link href="/" className="p-2 rounded-xl bg-foreground text-background transition-transform hover:scale-110 mb-4">
                        <Sparkles size={24} fill="currentColor" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm max-w-xs">{subtitle}</p>
                </div>

                <div className="glass-card p-8 border border-border/50 bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl">
                    {children}
                </div>
            </div>
        </main>
    );
}

export function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000); // Mock API call
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your details to access your workspace."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none" htmlFor="password">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                </div>

                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>

                <div className="flex items-center gap-2 my-4">
                    <span className="h-px bg-muted flex-1" />
                    <span className="text-xs uppercase text-muted-foreground">Or continue with</span>
                    <span className="h-px bg-muted flex-1" />
                </div>

                <div className="w-full">
                    <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{" "}
                    <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                        Sign up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export function RegisterPage() {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your data journey with PyAnalypt today."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 pl-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                </div>

                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
                </Button>

                <div className="flex items-center gap-2 my-4">
                    <span className="h-px bg-muted flex-1" />
                    <span className="text-xs uppercase text-muted-foreground">Or continue with</span>
                    <span className="h-px bg-muted flex-1" />
                </div>

                <div className="w-full">
                    <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                        Sign in
                    </Link>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 px-4">
                    By clicking continue, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </p>
            </form>
        </AuthLayout>
    );
}
