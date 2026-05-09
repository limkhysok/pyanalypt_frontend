"use client";

import React, { useState } from "react";
import { Bell, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function ProfileSettingsPage() {
    const [highContrast, setHighContrast]         = useState(false);
    const [reduceMotion, setReduceMotion]         = useState(false);
    const [emailNotifs, setEmailNotifs]           = useState(true);
    const [desktopAlerts, setDesktopAlerts]       = useState(false);

    return (
        <>
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight">App Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Customize your workspace experience and notification preferences.
                </p>
            </div>

            {/* Appearance */}
            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Palette className="h-5 w-5 text-purple-500" />
                        Appearance
                    </CardTitle>
                    <CardDescription className="text-[12px]">
                        Manage how the application looks on your device.
                    </CardDescription>
                </CardHeader>
                <Separator className="opacity-40" />
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="high-contrast" className="text-[13px] font-bold cursor-pointer">
                                High Contrast Mode
                            </Label>
                            <p className="text-[11px] text-muted-foreground">Increase visibility of UI elements.</p>
                        </div>
                        <Switch
                            id="high-contrast"
                            checked={highContrast}
                            onCheckedChange={setHighContrast}
                            aria-label="Toggle high contrast mode"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="reduce-motion" className="text-[13px] font-bold cursor-pointer">
                                Reduce Motion
                            </Label>
                            <p className="text-[11px] text-muted-foreground">Minimize animations for better accessibility.</p>
                        </div>
                        <Switch
                            id="reduce-motion"
                            checked={reduceMotion}
                            onCheckedChange={setReduceMotion}
                            aria-label="Toggle reduce motion"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-[12px]">
                        Control which alerts you receive.
                    </CardDescription>
                </CardHeader>
                <Separator className="opacity-40" />
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifs" className="text-[13px] font-bold cursor-pointer">
                                Email Notifications
                            </Label>
                            <p className="text-[11px] text-muted-foreground">Daily digest and account alerts.</p>
                        </div>
                        <Switch
                            id="email-notifs"
                            checked={emailNotifs}
                            onCheckedChange={setEmailNotifs}
                            aria-label="Toggle email notifications"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="desktop-alerts" className="text-[13px] font-bold cursor-pointer">
                                Desktop Alerts
                            </Label>
                            <p className="text-[11px] text-muted-foreground">Real-time status updates.</p>
                        </div>
                        <Switch
                            id="desktop-alerts"
                            checked={desktopAlerts}
                            onCheckedChange={setDesktopAlerts}
                            aria-label="Toggle desktop alerts"
                        />
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
