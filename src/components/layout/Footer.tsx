import Link from "next/link";
import {
    Home, BarChart3, FlaskConical, BookOpen,
    GraduationCap, Info, Phone, LifeBuoy, CreditCard
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { GithubIcon, TiktokIcon } from "@/components/ui/Icons";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export function Footer() {
    return (
        <footer className="relative border-t border-border bg-background pt-12 pb-8 overflow-hidden">
            <div className="container relative z-10 mx-auto px-6 max-w-325">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <Logo className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3" />
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
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className={`p-3 rounded-xl border border-border text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-110 ${social.color}`}
                                >
                                    <social.icon size={18} className={social.name === "GitHub" ? "" : "fill-current"} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <nav aria-label="Platform" className="lg:col-span-2 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Home size={14} className="opacity-50 group-hover:opacity-100" /> Home</Link></li>
                            <li><Link href="/visuals" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BarChart3 size={14} className="opacity-50 group-hover:opacity-100" /> Visuals</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><CreditCard size={14} className="opacity-50 group-hover:opacity-100" /> Pricing</Link></li>
                            <li><Link href="/tutorials" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><GraduationCap size={14} className="opacity-50 group-hover:opacity-100" /> Tutorials</Link></li>
                            <li><Link href="/playground" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><FlaskConical size={14} className="opacity-50 group-hover:opacity-100" /> Playground</Link></li>
                            <li><Link href="/docs" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BookOpen size={14} className="opacity-50 group-hover:opacity-100" /> Documentation</Link></li>
                        </ul>
                    </nav>

                    {/* Resources */}
                    <nav aria-label="Company" className="lg:col-span-2 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link href="/about" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Info size={14} className="opacity-50 group-hover:opacity-100" /> About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><Phone size={14} className="opacity-50 group-hover:opacity-100" /> Contact Us</Link></li>
                            <li><Link href="/docs" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><LifeBuoy size={14} className="opacity-50 group-hover:opacity-100" /> Help Center</Link></li>
                            <li><Link href="/tutorials" className="hover:text-blue-500 transition-colors flex items-center gap-2 group"><BarChart3 size={14} className="opacity-50 group-hover:opacity-100" /> Case Studies</Link></li>
                        </ul>
                    </nav>

                    {/* Newsletter */}
                    <div className="lg:col-span-4 space-y-6">
                        <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest">Stay Updated</h4>
                        <p className="text-sm font-bold text-muted-foreground leading-relaxed opacity-70">
                            Join 5,000+ data-driven teams receiving our weekly AI & Python reports.
                        </p>
                        <NewsletterForm />
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-widest opacity-40">
                        © {new Date().getFullYear()} PyAnalypt Inc.
                    </p>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-30">
                        Built for Business Analysts &amp; Owners
                    </p>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </footer>
    );
}
