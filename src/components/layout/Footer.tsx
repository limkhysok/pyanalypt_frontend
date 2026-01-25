import Link from "next/link";
import { Sparkles, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur-xl pt-16 pb-8">
            <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="p-1.5 rounded-lg bg-foreground text-background transition-transform group-hover:scale-110">
                                <Sparkles size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                PyAnalypt
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Advanced data analysis powered by Python & AI.
                            Turn your raw datasets into actionable insights in seconds.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground tracking-tight">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Templates</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground tracking-tight">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground tracking-tight">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground font-medium">
                        © {new Date().getFullYear()} PyAnalypt Inc. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            href="https://github.com/soklimkhy/pyanalypt_frontend"
                            target="_blank"
                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-white/5 hover:bg-foreground hover:text-background transition-all duration-300"
                        >
                            <Github size={18} />
                            <span className="text-xs font-semibold">Star on GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
