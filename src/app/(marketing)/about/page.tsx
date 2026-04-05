"use client";

import * as React from "react";
import { 
  Sparkles, Mail, MapPin, Send 
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/Icons";

export default function AboutPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <main className="min-h-screen bg-background relative selection:bg-zinc-500/20 overflow-x-hidden pt-24 pb-16">
      
      {/* Precision Blueprint Grid Background - Consistent with Landing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent opacity-40" />

      {/* Decorative Monochrome Glows */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-foreground opacity-[0.015] blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-foreground opacity-[0.02] blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="container relative z-10 mx-auto px-6 max-w-5xl">
        
        {/* --- SECTION 1: ABOUT / MISSION --- */}
        <div className="py-12 md:py-20 space-y-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/60 mx-auto">
            <Sparkles size={14} className="text-foreground/40" />
            <span className="text-[10px] font-black text-muted-foreground tracking-tight uppercase">
              The Mission & Story
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-foreground">
              Built by Analysts. <br />
              <span className="text-muted-foreground opacity-60">Architected for Everyone.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto">
              PyAnalypt was born from a simple observation: Data is easy to collect but hard to understand. We bridged the gap between raw data and actionable strategy with high-fidelity analytics.
            </p>
          </div>
        </div>

        {/* --- SECTION 2: THE BACKSTORY (DETAILS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-border/10">
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight">The Origin</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Before PyAnalypt, professional data analysis required deep knowledge of Python, SQL, and Terminal interfaces. Business owners were forced to hire expensive developers just to read their own spreadsheets. 
            </p>
          </div>
          <div className="space-y-4 md:pt-0 pt-4">
            <h2 className="text-2xl font-black tracking-tight">The Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We envision a world where anyone can build boardroom-ready charts in seconds. Our engine handles the complexity of parsing Parquet, JSON, and CSV files so you can focus on leading your business.
            </p>
          </div>
        </div>

        {/* --- SECTION 3: CONTACT & INQUIRIES --- */}
        <div className="py-24 md:py-32 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20 items-start">
          
          {/* Contact Form */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Get In Touch.</h2>
              <p className="text-muted-foreground font-medium">
                Have questions about our data engine? Reach out below.
              </p>
            </div>

            <form className="space-y-4 max-w-lg" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-muted/30 border border-border/60 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-foreground/30 transition-colors"
                />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full bg-muted/30 border border-border/60 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
              <textarea 
                placeholder="How can we help?"
                rows={4}
                className="w-full bg-muted/30 border border-border/60 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              />
              <Button size="lg" className="h-14 px-10 rounded-xl gap-3 bg-foreground text-background font-black text-sm hover:scale-[1.02] transition-transform w-full sm:w-auto">
                Send Message <Send size={16} />
              </Button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-8">
             <div className="p-8 rounded-2xl border border-border/40 bg-zinc-50/5/50 backdrop-blur-sm space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Connect</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border/60 flex items-center justify-center group-hover:border-foreground transition-colors">
                        <Mail size={18} className="text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">General Info</p>
                        <p className="text-sm font-bold">hello@pyanalypt.com</p>
                      </div>
                    </div>

                    <a href="https://github.com/soklimkhy/pyanalypt" target="_blank" className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border/60 flex items-center justify-center group-hover:border-foreground transition-colors">
                        <GithubIcon size={18} className="text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Open Source</p>
                        <p className="text-sm font-bold">@soklimkhy/pyanalypt</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border/60 flex items-center justify-center group-hover:border-foreground transition-colors">
                        <MapPin size={18} className="text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">HQ</p>
                        <p className="text-sm font-bold">Phnom Penh, KH</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/10 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Support</h3>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    We reply to every message personally. Current response time: <span className="text-foreground font-black">~12 hours</span>.
                  </p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}
