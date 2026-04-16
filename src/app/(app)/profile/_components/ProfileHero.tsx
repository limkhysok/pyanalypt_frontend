"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, AtSign, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { User } from "@/types/api";

interface ProfileHeroProps {
    user: User | null | undefined;
    displayName: string;
    initials: string;
}

export function ProfileHero({ user, displayName, initials }: Readonly<ProfileHeroProps>) {
    return (
        <div className="border border-border/50 overflow-hidden">
            {/* Banner */}
            <div className="relative h-28 sm:h-36 bg-linear-to-r from-blue-950/60 via-blue-900/40 to-background overflow-hidden">
                {/* Dot grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f620_1px,transparent_1px)] bg-size-[20px_20px]" />
                {/* Horizontal scan line */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-500/5 to-transparent" />
                {/* Right glow */}
                <div className="absolute -right-8 top-0 h-full w-48 bg-linear-to-l from-blue-500/10 to-transparent" />
                {/* Bottom fade into content */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-background/60 to-transparent" />
            </div>

            {/* Content area */}
            <div className="relative bg-background/80 backdrop-blur-xl px-6 sm:px-10 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
                    {/* Avatar with ring */}
                    <div className="shrink-0 ring-4 ring-background">
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-none border border-border/40">
                            <AvatarImage
                                src={user?.profile_picture ?? undefined}
                                alt={displayName}
                                className="object-cover rounded-none"
                            />
                            <AvatarFallback className="text-3xl font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-none">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Name & pills */}
                    <div className="flex-1 min-w-0 pt-2 sm:pb-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
                                {displayName}
                            </h1>
                            {user?.email_verified && (
                                <Badge
                                    variant="secondary"
                                    className="self-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 h-fit rounded-none"
                                >
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/50 border border-border/40 px-3 py-1">
                                <AtSign className="h-3 w-3 opacity-60" />
                                {user?.username}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/50 border border-border/40 px-3 py-1">
                                <Mail className="h-3 w-3 opacity-60" />
                                {user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="mt-6 pt-5 border-t border-border/20 flex flex-wrap gap-8">
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Member Since</p>
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            {formatDate(user?.date_joined)}
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Account Status</p>
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
