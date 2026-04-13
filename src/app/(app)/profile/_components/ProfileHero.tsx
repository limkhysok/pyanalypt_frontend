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
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-linear-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-2xl p-6 sm:p-10 shadow-xl shadow-black/5 ring-1 ring-white/5 dark:ring-white/4">
            {/* Abstract Background Elements */}
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/8 blur-[100px]" />
            <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-purple-500/8 blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-7 sm:gap-10">
                {/* Avatar */}
                <div className="shrink-0">
                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-md border border-border/40 shadow-md">
                        <AvatarImage
                            src={user?.profile_picture ?? undefined}
                            alt={displayName}
                            className="object-cover rounded-md"
                        />
                        <AvatarFallback className="text-3xl font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
                    {/* Name + badge */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
                                {displayName}
                            </h1>
                            {user?.email_verified && (
                                <Badge
                                    variant="secondary"
                                    className="self-center sm:self-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 h-fit rounded-full shadow-sm"
                                >
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>

                        {/* Username + email pills */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/40 border border-border/40 rounded-full px-3 py-1">
                                <AtSign className="h-3 w-3 opacity-60" />
                                {user?.username}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/40 border border-border/40 rounded-full px-3 py-1">
                                <Mail className="h-3 w-3 opacity-60" />
                                {user?.email}
                            </span>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="pt-3 border-t border-border/20 flex flex-wrap justify-center sm:justify-start gap-6">
                        <div className="space-y-0.5">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Member Since</p>
                            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                {formatDate(user?.date_joined)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
