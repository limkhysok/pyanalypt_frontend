"use client";

import { useState } from "react";
import {
    Lock,
    Key,
    ShieldCheck,
    Smartphone,
    RotateCcw,
    Eye,
    EyeOff,
    ShieldAlert,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authApi } from "@/services/auth.service";

export default function ProfileAuthPage() {
    const [showCurrent, setShowCurrent]   = useState(false);
    const [showNew, setShowNew]           = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [saving, setSaving]             = useState(false);

    const [oldPassword, setOldPassword]   = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword1 || !newPassword2) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword1 !== newPassword2) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword1.length < 8) {
            toast.error("New password must be at least 8 characters.");
            return;
        }

        setSaving(true);
        try {
            await authApi.changePassword({
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            });
            toast.success("Password updated successfully.");
            setOldPassword("");
            setNewPassword1("");
            setNewPassword2("");
        } catch (error: any) {
            const detail =
                error?.response?.data?.old_password?.[0] ||
                error?.response?.data?.new_password2?.[0] ||
                error?.response?.data?.detail ||
                "Failed to update password.";
            toast.error(detail);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight">Security & Authentication</h1>
                <p className="text-sm text-muted-foreground">
                    Protect your account with a strong password and multi-factor authentication.
                </p>
            </div>

            {/* Password Section */}
            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                    <Lock size={120} />
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Key className="h-5 w-5 text-amber-500" />
                        Change Password
                    </CardTitle>
                    <CardDescription className="text-[12px]">
                        Your password should be at least 8 characters with a mix of letters and symbols.
                    </CardDescription>
                </CardHeader>
                <Separator className="opacity-40" />
                <CardContent className="pt-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current"
                                    type={showCurrent ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new"
                                        type={showNew ? "text" : "password"}
                                        value={newPassword1}
                                        onChange={(e) => setNewPassword1(e.target.value)}
                                        className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        value={newPassword2}
                                        onChange={(e) => setNewPassword2(e.target.value)}
                                        className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2FA Section */}
            <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative border-t-2 border-t-blue-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                Two-Factor Authentication (2FA)
                            </CardTitle>
                            <CardDescription className="text-[12px]">
                                Secure your login with an extra verification layer.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="h-5 bg-destructive/10 text-destructive border-none px-2 font-bold text-[9px] uppercase tracking-widest rounded-full">
                            Disabled
                        </Badge>
                    </div>
                </CardHeader>
                <Separator className="opacity-40" />
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/40 hover:border-blue-500/40 transition-all">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center text-blue-500 shadow-sm border border-border/20">
                                <Smartphone size={18} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="font-bold text-[13px]">Authenticator App</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Use Google Authenticator or Authy for code-based security.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[10px] font-bold mt-2 hover:bg-blue-500 hover:text-white rounded-lg border-2"
                                    onClick={() => toast.info("2FA setup coming soon.")}
                                >
                                    Set up
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 opacity-60 cursor-not-allowed">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center text-muted-foreground shadow-sm border border-border/20">
                                <RotateCcw size={18} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="font-bold text-[13px]">Recovery Codes</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Emergency backup codes to access your account.
                                </p>
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/60 italic">Enable 2FA first</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/3 border border-blue-500/20">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                            <ShieldAlert size={16} />
                            Why enable 2FA?
                            <span className="text-xs text-muted-foreground font-normal">Account theft is reduced by 99% when active.</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
