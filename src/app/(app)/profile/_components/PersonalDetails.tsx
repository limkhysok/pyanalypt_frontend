"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserRound, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/api";

interface PersonalDetailsProps {
    user: User | null | undefined;
    editing: boolean;
    saving: boolean;
    fullName: string;
    username: string;
    setFullName: (val: string) => void;
    setUsername: (val: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
}

export function PersonalDetails({
    user,
    editing,
    saving,
    fullName,
    username,
    setFullName,
    setUsername,
    onEdit,
    onCancel,
    onSave
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
                <AnimatePresence mode="wait">
                    {editing ? (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                        Full Name
                                    </Label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                        Username
                                    </Label>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        placeholder="johndoe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                    Email Address (Protected)
                                </Label>
                                <Input
                                    value={user?.email ?? ""}
                                    disabled
                                    className="h-10 rounded-xl bg-muted/20 border-transparent opacity-60 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-muted-foreground/60 italic ml-1">
                                    Email verification is required for security changes.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6"
                        >
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</p>
                                <p className="text-[13.5px] font-semibold text-foreground">{user?.full_name || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Username</p>
                                <p className="text-[13.5px] font-semibold text-foreground">@{user?.username}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Status</p>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
