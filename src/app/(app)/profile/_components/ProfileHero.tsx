"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, AtSign, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils"; // Assuming I'll move formatDate to utils or just redefine it for now

interface ProfileHeroProps {
    user: any;
    displayName: string;
    initials: string;
}

export function ProfileHero({ user, displayName, initials }: Readonly<ProfileHeroProps>) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/50 backdrop-blur-xl p-6 sm:p-8">
            {/* Abstract Background Elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/5 blur-[80px]" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-border/40 shadow-2xl">
                    <AvatarImage
                        src={user?.profile_picture ?? undefined}
                        alt={displayName}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {displayName}
                            </h1>
                            {user?.email_verified && (
                                <Badge
                                    variant="secondary"
                                    className="self-center sm:self-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-fit rounded-full"
                                >
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                                <AtSign className="h-3.5 w-3.5" />
                                <span>{user?.username}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-border/20 flex flex-wrap justify-center sm:justify-start gap-6">
                        <div className="space-y-0.5">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Member Since</p>
                            <div className="flex items-center gap-2 text-[13px] font-medium">
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                {formatDate(user?.date_joined)}
                            </div>
                        </div>
                        {/* Placeholder for more stats if needed */}
                    </div>
                </div>
            </div>
        </div>
    );
}
