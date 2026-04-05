import Link from "next/link";
import {
    Home, BarChart3, FlaskConical, Info,
    Mail, Globe
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { GithubIcon } from "@/components/ui/Icons";

export function Footer() {
    return (
        <footer className="relative bg-background border-t border-border/80 pt-10 pb-8 overflow-hidden selection:bg-foreground/10">

            {/* Precision Blueprint Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40 shadow-inner" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4">

                    {/* ── Brand Unit ── */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/" className="flex items-center gap-3 group/logo relative">
                            <Logo className="w-8 h-8 transition-all duration-500 group-hover/logo:scale-110 grayscale" />
                            <div className="flex flex-col -gap-0.5">
                                <span className="text-[13px] font-black tracking-tighter text-foreground uppercase opacity-80">
                                    PyAnalypt
                                </span>
                                <span className="text-[7px] font-black tracking-[0.3em] text-muted-foreground uppercase opacity-40">Intelligence OS</span>
                            </div>
                        </Link>
                        <div className="h-4 w-px bg-border/40 hidden xl:block" />
                        <p className="hidden xl:block text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 max-w-[160px] leading-tight">
                            Intelligence built for modern engineering.
                        </p>
                    </div>

                    {/* ── Navigation HUD Cluster ── */}
                    <nav aria-label="Footer" className="md:px-2">
                        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <li><Link href="/" className="hover:text-foreground transition-all flex items-center gap-2 group/link"><Home size={11} className="opacity-40 group-hover/link:opacity-100 transition-opacity" /> Home</Link></li>
                            <li><Link href="/visuals" className="hover:text-foreground transition-all flex items-center gap-2 group/link"><BarChart3 size={11} className="opacity-40 group-hover/link:opacity-100 transition-opacity" /> Visuals</Link></li>
                            <li><Link href="/playground" className="hover:text-foreground transition-all flex items-center gap-2 group/link"><FlaskConical size={11} className="opacity-40 group-hover/link:opacity-100 transition-opacity" /> Laboratory</Link></li>
                            <li><Link href="/about" className="hover:text-foreground transition-all flex items-center gap-2 group/link"><Info size={11} className="opacity-40 group-hover/link:opacity-100 transition-opacity" /> Intelligence</Link></li>
                        </ul>
                    </nav>

                    {/* ── Operational Network ── */}
                    <div className="flex items-center gap-8 md:gap-12 shrink-0">
                        <div className="flex items-center gap-4">
                            {[
                                { name: "GitHub", icon: GithubIcon, href: "https://github.com/soklimkhy/pyanalypt" },
                                { name: "Email", icon: Mail, href: "/about" },
                                { name: "Global", icon: Globe, href: "/about" },
                            ].map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    target={social.href.startsWith('http') ? "_blank" : undefined}
                                    className="text-muted-foreground/30 hover:text-foreground transition-all duration-300 hover:scale-110"
                                >
                                    <social.icon size={13} className={social.name === "GitHub" ? "grayscale" : "fill-current grayscale"} />
                                </Link>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-border/40 hidden md:block" />

                        <div className="flex flex-col items-end gap-1.5 pt-0.5">
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-30">
                                © {new Date().getFullYear()} PyAnalypt
                            </p>
                            <div className="flex items-center gap-2 opacity-20 cursor-default">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-foreground">Operational Status Nom.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Aesthetic Bottom Base */}
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-linear-to-r from-transparent via-foreground/5 to-transparent pointer-events-none" />
        </footer>
    );
}
