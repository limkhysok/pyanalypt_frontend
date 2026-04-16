"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Monitor,
    Smartphone,
    Laptop,
    Shield,
    Globe,
    Clock,
    Trash2,
    ChevronRight,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authApi } from "@/services/auth.service";
import { Session } from "@/types/api";
import { formatRelative } from "@/lib/utils";

function DeviceIcon({ device }: Readonly<{ device: string }>) {
    const d = device.toLowerCase();
    if (d.includes("iphone") || d.includes("android") || d.includes("mobile")) return <Smartphone size={22} />;
    if (d.includes("mac") || d.includes("laptop")) return <Laptop size={22} />;
    return <Monitor size={22} />;
}

export default function ProfileSessionsPage() {
    const [sessions, setSessions]       = useState<Session[]>([]);
    const [loading, setLoading]         = useState(true);
    const [revoking, setRevoking]       = useState<number | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authApi.getSessions();
            setSessions(data);
        } catch {
            toast.error("Could not load sessions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const handleRevoke = async (id: number) => {
        setRevoking(id);
        try {
            await authApi.revokeSession(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
            toast.success("Session revoked.");
        } catch {
            toast.error("Failed to revoke session.");
        } finally {
            setRevoking(null);
        }
    };

    // Per-session DELETE for every non-current session — does NOT kill the active session.
    const handleRevokeAll = async () => {
        const others = sessions.filter((s) => !s.is_current);
        if (others.length === 0) return;
        setRevokingAll(true);
        try {
            await Promise.all(others.map((s) => authApi.revokeSession(s.id)));
            setSessions((prev) => prev.filter((s) => s.is_current));
            toast.success("All other devices have been signed out.");
        } catch {
            toast.error("Failed to sign out all devices.");
        } finally {
            setRevokingAll(false);
        }
    };

    const otherSessionCount = sessions.filter((s) => !s.is_current).length;

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight">Active Sessions</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and track your active logins across different devices.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none border border-border/40"
                        onClick={fetchSessions}
                        disabled={loading}
                        aria-label="Refresh sessions"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </Button>
                    {otherSessionCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={handleRevokeAll}
                            disabled={revokingAll}
                            className="h-9 px-4 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-none border border-destructive/20 transition-all"
                        >
                            {revokingAll ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                            Sign out all other devices
                        </Button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && sessions.length === 0 && (
                <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                    No active sessions found.
                </div>
            )}

            {!loading && sessions.length > 0 && (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <Card
                            key={session.id}
                            className={`group rounded-none border-border/60 overflow-hidden transition-all duration-300 ${
                                session.is_current
                                    ? "bg-blue-500/3 border-blue-500/20"
                                    : "bg-background/50 backdrop-blur-xl hover:border-blue-500/20"
                            }`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 flex items-center justify-center border transition-all ${
                                            session.is_current
                                                ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                                                : "bg-muted/40 border-border/40 text-muted-foreground group-hover:border-blue-500/20"
                                        }`}>
                                            <DeviceIcon device={session.device} />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[14px] font-bold tracking-tight">{session.device}</h3>
                                                {session.is_current && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none">
                                                        This device
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                                                <span className="flex items-center gap-1.5 font-mono opacity-80">
                                                    <Globe size={13} className="opacity-70" /> {session.ip_address}
                                                </span>
                                                <span className="opacity-30">•</span>
                                                <span className="flex items-center gap-1.5 italic">
                                                    <Clock size={13} className="opacity-70" /> {formatRelative(session.last_active)}
                                                </span>
                                            </div>

                                            <div className="pt-2 flex items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] font-bold bg-muted/20 border-border/40 uppercase px-2 py-0 rounded-none">
                                                    {session.browser}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {!session.is_current && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={revoking === session.id}
                                            onClick={() => handleRevoke(session.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none shrink-0"
                                            aria-label="Revoke session"
                                        >
                                            {revoking === session.id
                                                ? <Loader2 size={15} className="animate-spin" />
                                                : <Trash2 size={16} />
                                            }
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex items-start gap-4 p-5 bg-blue-500/3 border border-blue-500/10">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 shrink-0">
                    <Shield size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-[13px] uppercase tracking-tight">Security Recommendations</h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                        Notice any sessions from unfamiliar locations? Revoke them immediately and reset your password for maximum protection.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-1">
                        Security Checklist <ChevronRight size={14} className="ml-1 inline" />
                    </Button>
                </div>
            </div>
        </>
    );
}
