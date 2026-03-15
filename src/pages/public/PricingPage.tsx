"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "Starter",
        price: "Free",
        desc: "For individuals exploring data.",
        features: ["1 User", "5 Active Projects", "Basic Charts (Line, Bar)", "Community Support", "100MB Storage"],
        highlight: false
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        desc: "For analysts and small teams.",
        features: ["5 Users", "Unlimited Projects", "All Chart Types", "Priority Support", "10GB Storage", "Export to PDF/PPT"],
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For large organizations.",
        features: ["Unlimited Users", "SSO & Advanced Security", "On-premise Deployment", "Dedicated Success Manager", "Unlimited Storage", "Custom Integrations"],
        highlight: false
    }
];

export function PricingPage() {
    const [annual, setAnnual] = useState(true);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-6 overflow-hidden">
            <div className="max-w-[1200px] mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Start for free, upgrade when you need power.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm ${!annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>Monthly</span>
                        <div
                            className="w-14 h-8 rounded-full bg-secondary border border-border relative cursor-pointer transition-colors"
                            onClick={() => setAnnual(!annual)}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-foreground transition-transform ${annual ? "translate-x-6" : "translate-x-0"}`} />
                        </div>
                        <span className={`text-sm ${annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            Yearly <span className="text-xs text-primary ml-1 font-normal">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, i) => (
                        <TiltCard
                            key={i}
                            classNameContent={`p-8 rounded-3xl border flex flex-col gap-6 h-full relative ${plan.highlight ? "bg-secondary/20 border-primary/50 shadow-2xl shadow-primary/10" : "bg-background/50 border-border glass-card"}`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                            </div>

                            <div className="h-px bg-border/50" />

                            <ul className="space-y-4 flex-grow">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-muted-foreground">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className={`w-full rounded-xl py-6 font-semibold ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                            </Button>
                        </TiltCard>
                    ))}
                </div>

            </div>
        </main>
    );
}
