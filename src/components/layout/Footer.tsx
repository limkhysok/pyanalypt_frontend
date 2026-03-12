import Link from "next/link";
import { Sparkles, Github, Home, BarChart3, FlaskConical, BookOpen, Twitter, Linkedin, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="relative border-t border-border/40 bg-background/95 backdrop-blur-xl pt-20 pb-10 overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10 blur-3xl" />

            <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 relative z-10">

                    {/* Brand Section */}
                    <div className="space-y-6 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="p-2 rounded-xl bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:ambient-glow-blue group-hover:-rotate-3">
                                <Sparkles size={20} className="fill-current" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-glow-blue">
                                PyAnalypt
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Advanced data analysis powered by Python & AI.
                            Turn your raw datasets into actionable insights in seconds with our premium platform.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-2">
                            <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank" className="p-2.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                <Github size={18} />
                            </Link>
                            <Link href="#" className="p-2.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                <Twitter size={18} className="fill-current" />
                            </Link>
                            <Link href="#" className="p-2.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:bg-blue-700 hover:text-white hover:border-blue-700 hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                <Linkedin size={18} className="fill-current" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-5">
                        <h4 className="font-semibold text-foreground tracking-tight text-base">Platform</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2.5 group">
                                    <Home size={15} className="group-hover:text-primary transition-colors text-muted-foreground/70" />
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/templates" className="hover:text-primary transition-colors flex items-center gap-2.5 group">
                                    <BarChart3 size={15} className="group-hover:text-primary transition-colors text-muted-foreground/70" />
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Visualizations</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/playground" className="hover:text-primary transition-colors flex items-center gap-2.5 group">
                                    <FlaskConical size={15} className="group-hover:text-primary transition-colors text-muted-foreground/70" />
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Playground</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="hover:text-primary transition-colors flex items-center gap-2.5 group">
                                    <BookOpen size={15} className="group-hover:text-primary transition-colors text-muted-foreground/70" />
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">API Reference</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div className="space-y-5">
                        <h4 className="font-semibold text-foreground tracking-tight text-base">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="https://github.com/soklimkhy/pyanalypt_frontend" target="_blank" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors group-hover:scale-125"></span>
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">GitHub Repo</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors group-hover:scale-125"></span>
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Discussions</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors group-hover:scale-125"></span>
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Changelog</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors group-hover:scale-125"></span>
                                    <span className="group-hover:translate-x-1 transition-transform inline-block">Blog</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Container */}
                    <div className="space-y-5">
                        <h4 className="font-semibold text-foreground tracking-tight text-base">Stay Updated</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Subscribe to our newsletter for the latest updates, AI insights, and Python tips.
                        </p>
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="relative group/input">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" size={16} />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors shadow-sm"
                                />
                            </div>
                            <Button className="w-full gap-2 group/btn shadow-sm">
                                Subscribe
                                <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <p className="text-sm text-muted-foreground font-medium">
                        © {new Date().getFullYear()} PyAnalypt Inc. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>

            {/* Ambient decorative elements */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none -z-10" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none -z-10" />
        </footer>
    );
}
