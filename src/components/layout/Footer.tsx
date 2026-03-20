import Link from "next/link";
import {
    Sparkles, Home, BarChart3, FlaskConical, BookOpen, Send, Mail,
    GraduationCap, Info, Phone, LifeBuoy
} from "lucide-react";
import { GithubIcon, TiktokIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="relative border-t border-border/10 bg-background/50 backdrop-blur-3xl pt-12 pb-8 overflow-hidden">
            <div className="container relative z-10 mx-auto px-6 max-w-[1300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                                <Sparkles size={20} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-foreground transition-all duration-300">
                                PyAnalypt
                            </span>
                        </Link>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-bold opacity-70">
                            The bridge between complex data science and intuitive business decisions. Turn raw records into boardroom-ready intelligence.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-2">
                            {[
                                { name: "GitHub", icon: GithubIcon, href: "https://github.com/soklimkhy/pyanalypt", color: "hover:bg-zinc-800" },
                                { name: "TikTok", icon: TiktokIcon, href: "#", color: "hover:bg-pink-600" },
                            ].map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    className={`p-3 rounded-2xl bg-secondary/50 border border-border/10 text-muted-foreground transition-all duration-300 hover:text-white hover:scale-110 ${social.color}`}
                                >
                                    <social.icon size={18} className={social.name === "GitHub" ? "" : "fill-current"} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Home size={14} className="opacity-50 group-hover:opacity-100" /> Home</Link></li>
                            <li><Link href="/visuals" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BarChart3 size={14} className="opacity-50 group-hover:opacity-100" /> Visuals</Link></li>
                            <li><Link href="/pricing" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Sparkles size={14} className="opacity-50 group-hover:opacity-100" /> Pricing</Link></li>
                            <li><Link href="/tutorials" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><GraduationCap size={14} className="opacity-50 group-hover:opacity-100" /> Tutorials</Link></li>
                            <li><Link href="/playground" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><FlaskConical size={14} className="opacity-50 group-hover:opacity-100" /> Playground</Link></li>
                            <li><Link href="/docs" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BookOpen size={14} className="opacity-50 group-hover:opacity-100" /> Documentation</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/about" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Info size={14} className="opacity-50 group-hover:opacity-100" /> About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Phone size={14} className="opacity-50 group-hover:opacity-100" /> Contact Us</Link></li>
                            <li><Link href="/support" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><LifeBuoy size={14} className="opacity-50 group-hover:opacity-100" /> Help Center</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BarChart3 size={14} className="opacity-50 group-hover:opacity-100" /> Case Studies</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-4 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Stay Updated</h4>
                        <p className="text-sm font-bold text-muted-foreground leading-relaxed opacity-70">
                            Join 5,000+ data-driven teams receiving our weekly AI & Python reports.
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" size={16} />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-12 pl-12 bg-background/50 border-border/10 focus:border-blue-500/50 transition-all shadow-sm rounded-xl font-bold"
                                />
                            </div>
                            <Button className="h-12 w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all shadow-lg shadow-blue-500/20">
                                Subscribe <Send size={14} />
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-widest opacity-40">
                        © {new Date().getFullYear()} PyAnalypt Inc.
                    </p>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-30">
                        Built for Business Analysts &amp; Owners
                    </p>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </footer>
    );
}
