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
    Copy,
    Check,
    Info,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authApi } from "@/services/auth.service";
import { TwoFactorSetupResponse } from "@/types/api";

type TwoFAView = "idle" | "setup" | "disable";

const RATE_LIMIT_MSG = "Too many attempts. Please try again later.";

export default function ProfileAuthPage() {
    // ── Password change ──────────────────────────────────────────────────────
    const [showCurrent, setShowCurrent]   = useState(false);
    const [showNew, setShowNew]           = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [saving, setSaving]             = useState(false);
    const [oldPassword, setOldPassword]   = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess]   = useState(false);

    const handleChangePassword = async () => {
        setOldPasswordError("");
        setPasswordSuccess(false);

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
            await authApi.changePassword({ old_password: oldPassword, new_password1: newPassword1, new_password2: newPassword2 });
            setPasswordSuccess(true);
            setOldPassword("");
            setNewPassword1("");
            setNewPassword2("");
        } catch (error: any) {
            if (error?.response?.status === 429) {
                toast.error(RATE_LIMIT_MSG);
                return;
            }
            const oldPwErr = error?.response?.data?.old_password?.[0];
            if (oldPwErr) {
                setOldPasswordError(oldPwErr);
                return;
            }
            const detail =
                error?.response?.data?.new_password2?.[0] ||
                error?.response?.data?.detail ||
                "Failed to update password.";
            toast.error(detail);
        } finally {
            setSaving(false);
        }
    };

    // ── 2FA state ────────────────────────────────────────────────────────────
    const [is2FAEnabled, setIs2FAEnabled]   = useState(false);
    const [twoFAView, setTwoFAView]         = useState<TwoFAView>("idle");
    const [setupData, setSetupData]         = useState<TwoFactorSetupResponse | null>(null);
    const [enableCode, setEnableCode]       = useState("");
    const [disableCode, setDisableCode]     = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [twoFALoading, setTwoFALoading]   = useState(false);
    const [copied, setCopied]               = useState(false);

    const handleStartSetup = async () => {
        setTwoFALoading(true);
        try {
            const data = await authApi.setup2FA();
            setSetupData(data);
            setEnableCode("");
            setTwoFAView("setup");
        } catch (error: any) {
            if (error?.response?.status === 429) { toast.error(RATE_LIMIT_MSG); return; }
            toast.error(error?.response?.data?.detail || "Failed to start 2FA setup.");
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (enableCode.length !== 6) {
            toast.error("Enter the 6-digit code from your authenticator app.");
            return;
        }
        setTwoFALoading(true);
        try {
            await authApi.enable2FA(enableCode);
            toast.success("Two-factor authentication is now active.");
            setIs2FAEnabled(true);
            setTwoFAView("idle");
            setSetupData(null);
            setEnableCode("");
        } catch (error: any) {
            if (error?.response?.status === 429) { toast.error(RATE_LIMIT_MSG); return; }
            const msg = error?.response?.data?.code?.[0] || error?.response?.data?.detail || "Invalid or expired code.";
            toast.error(msg);
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (disableCode.length !== 6) {
            toast.error("Enter the 6-digit code from your authenticator app.");
            return;
        }
        if (!disablePassword) {
            toast.error("Enter your current password.");
            return;
        }
        setTwoFALoading(true);
        try {
            await authApi.disable2FA(disableCode, disablePassword);
            toast.success("Two-factor authentication has been disabled.");
            setIs2FAEnabled(false);
            setTwoFAView("idle");
            setDisableCode("");
            setDisablePassword("");
        } catch (error: any) {
            if (error?.response?.status === 429) { toast.error(RATE_LIMIT_MSG); return; }
            const msg = error?.response?.data?.detail || "Invalid code or password.";
            toast.error(msg);
        } finally {
            setTwoFALoading(false);
        }
    };

    const copySecret = () => {
        if (!setupData) return;
        navigator.clipboard.writeText(setupData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            <Card className="rounded-none border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative">
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
                    {/* Post-success banner */}
                    {passwordSuccess && (
                        <div className="mb-5 flex items-start gap-3 p-3 bg-emerald-500/8 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Info size={15} className="shrink-0 mt-0.5" />
                            <p className="text-[12px] font-medium leading-relaxed">
                                Password updated. All other devices have been signed out.
                            </p>
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current"
                                    type={showCurrent ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => { setOldPassword(e.target.value); setOldPasswordError(""); }}
                                    className={`h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 transition-all pr-10 ${oldPasswordError ? "ring-1 ring-red-500/60 focus:ring-red-500/60" : "focus:ring-blue-500/30"}`}
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
                            {oldPasswordError && (
                                <p className="text-[11px] text-red-500 ml-1">{oldPasswordError}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new" className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new"
                                        type={showNew ? "text" : "password"}
                                        value={newPassword1}
                                        onChange={(e) => setNewPassword1(e.target.value)}
                                        className="h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
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
                                <Label htmlFor="confirm" className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        value={newPassword2}
                                        onChange={(e) => setNewPassword2(e.target.value)}
                                        className="h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
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
                                className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2FA Section */}
            <Card className="rounded-none border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden relative border-t-2 border-t-blue-500">
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
                        {is2FAEnabled ? (
                            <Badge variant="outline" className="h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-2 font-bold text-[9px] capitalize tracking-widest rounded-none">
                                Enabled
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="h-5 bg-destructive/10 text-destructive border-none px-2 font-bold text-[9px] capitalize tracking-widest rounded-none">
                                Disabled
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <Separator className="opacity-40" />
                <CardContent className="pt-6 space-y-6">

                    {/* ── IDLE: show actions ── */}
                    {twoFAView === "idle" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4 p-4 bg-muted/30 border border-border/40 hover:border-blue-500/40 transition-all">
                                    <div className="h-10 w-10 shrink-0 bg-background flex items-center justify-center text-blue-500 border border-border/20">
                                        <Smartphone size={18} />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <h4 className="font-bold text-[13px]">Authenticator App</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Use Google Authenticator or Authy for code-based security.
                                        </p>
                                        {is2FAEnabled ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold mt-2 hover:bg-destructive/10 hover:text-destructive rounded-none border-2"
                                                onClick={() => setTwoFAView("disable")}
                                            >
                                                Disable
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={twoFALoading}
                                                className="h-7 text-[10px] font-bold mt-2 hover:bg-blue-500 hover:text-white rounded-none border-2"
                                                onClick={handleStartSetup}
                                            >
                                                {twoFALoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set up"}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-muted/20 border border-border/40 opacity-60 cursor-not-allowed">
                                    <div className="h-10 w-10 shrink-0 bg-background flex items-center justify-center text-muted-foreground border border-border/20">
                                        <RotateCcw size={18} />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <h4 className="font-bold text-[13px]">Recovery Codes</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Emergency backup codes to access your account.
                                        </p>
                                        <span className="text-[9px] capitalize font-bold text-muted-foreground/60 italic">Enable 2FA first</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/3 border border-blue-500/20">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    Why enable 2FA?
                                    <span className="text-xs text-muted-foreground font-normal">Account theft is reduced by 99% when active.</span>
                                </p>
                            </div>
                        </>
                    )}

                    {/* ── SETUP: show QR + confirm code ── */}
                    {twoFAView === "setup" && setupData && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-[12px] text-muted-foreground text-center">
                                    Scan this QR code with <span className="font-bold text-foreground">Google Authenticator</span> or <span className="font-bold text-foreground">Authy</span>, then enter the 6-digit code below to confirm.
                                </p>
                                <div className="p-4 bg-white border border-border/40">
                                    <QRCodeSVG value={setupData.otpauth_uri} size={180} />
                                </div>
                                <div className="w-full space-y-1">
                                    <p className="text-[10px] font-bold capitalize tracking-wider text-muted-foreground/60 ml-1">Manual entry key</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-[11px] font-mono bg-muted/40 px-3 py-2 border border-border/40 tracking-widest select-all truncate">
                                            {setupData.secret}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-none border border-border/40 shrink-0"
                                            onClick={copySecret}
                                        >
                                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                    Verification Code
                                </Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    value={enableCode}
                                    onChange={(e) => setEnableCode(e.target.value.replaceAll(/\D/g, ""))}
                                    placeholder="000000"
                                    className="h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all font-mono tracking-[0.4em] text-center text-[13px]"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] text-muted-foreground rounded-none"
                                    onClick={() => { setTwoFAView("idle"); setSetupData(null); setEnableCode(""); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={twoFALoading || enableCode.length < 6}
                                    onClick={handleEnable2FA}
                                    className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none"
                                >
                                    {twoFALoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Activate 2FA"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── DISABLE: confirm with code + password ── */}
                    {twoFAView === "disable" && (
                        <div className="space-y-5">
                            <div className="p-4 bg-destructive/5 border border-destructive/20">
                                <p className="text-[12px] text-destructive font-medium">
                                    Disabling 2FA will reduce the security of your account. Confirm with your authenticator code and password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                    Authenticator Code
                                </Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    value={disableCode}
                                    onChange={(e) => setDisableCode(e.target.value.replaceAll(/\D/g, ""))}
                                    placeholder="000000"
                                    className="h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all font-mono tracking-[0.4em] text-center text-[13px]"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold capitalize tracking-wider text-muted-foreground/80 ml-1">
                                    Current Password
                                </Label>
                                <Input
                                    type="password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-[11px] text-muted-foreground rounded-none"
                                    onClick={() => { setTwoFAView("idle"); setDisableCode(""); setDisablePassword(""); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={twoFALoading || disableCode.length < 6 || !disablePassword}
                                    onClick={handleDisable2FA}
                                    className="h-9 px-6 bg-destructive hover:bg-destructive/90 text-white font-bold text-xs rounded-none"
                                >
                                    {twoFALoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Disable 2FA"}
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </>
    );
}
