"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserRound, Edit2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface PersonalDetailsProps {
    user: User | null | undefined;
    editing: boolean;
    saving: boolean;
    fullName: string;
    fieldErrors: Record<string, string>;
    setFullName: (val: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
}

export function PersonalDetails({
    user,
    editing,
    saving,
    fullName,
    fieldErrors,
    setFullName,
    onEdit,
    onCancel,
    onSave,
}: Readonly<PersonalDetailsProps>) {
    return (
        <Card className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-blue-500" />
                        Personal Information
                    </CardTitle>
                    <CardDescription className="text-[12px]">
                        Review and update your basic account details.
                    </CardDescription>
                </div>
                {!editing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="h-8 px-3 rounded-lg text-xs font-semibold hover:bg-muted"
                    >
                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
                {editing ? (
                    <div className="space-y-5">
                        {/* Editable: full_name */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                Full Name
                            </Label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className={`h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 transition-all ${
                                    fieldErrors.full_name
                                        ? "ring-1 ring-red-500/60 focus:ring-red-500/60"
                                        : "focus:ring-blue-500/30"
                                }`}
                            />
                            {fieldErrors.full_name && (
                                <p className="text-[10px] text-red-500 ml-1">{fieldErrors.full_name}</p>
                            )}
                        </div>

                        {/* Read-only: email */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                Email Address
                            </Label>
                            <p className="h-10 flex items-center px-3 rounded-xl bg-muted/20 text-[12px] text-muted-foreground/70 border border-transparent select-none">
                                {user?.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 italic ml-1">
                                Email cannot be changed.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                onClick={onSave}
                                disabled={saving}
                                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                                    <>
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-9 px-4 rounded-xl text-xs font-semibold"
                            >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</p>
                            <p className="text-[13.5px] font-semibold text-foreground">{user?.full_name || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Birthday</p>
                            <p className="text-[13.5px] font-semibold text-foreground">{formatDate(user?.birthday) || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Username</p>
                            <p className="text-[13.5px] font-semibold text-foreground">@{user?.username}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
                            <div className="flex items-center gap-2">
                                <p className="text-[13.5px] font-semibold text-foreground">{user?.email}</p>
                                {user?.email_verified ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none h-4 px-1 rounded-sm text-[9px] font-bold">
                                        VERIFIED
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none h-4 px-1 rounded-sm text-[9px] font-bold">
                                        PENDING
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
