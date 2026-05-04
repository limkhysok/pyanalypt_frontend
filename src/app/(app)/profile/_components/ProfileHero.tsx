"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, AtSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { User } from "@/types/api";

interface ProfileHeroProps {
    user: User | null | undefined;
    displayName: string;
    initials: string;
}

export function ProfileHero({ user, displayName, initials }: Readonly<ProfileHeroProps>) {
    return (
        <div className="border border-border overflow-hidden bg-background">
            {/* Minimalist Banner */}
            <div className="relative h-28 sm:h-36 bg-muted border-b border-border">
                {/* Subtle Grid Pattern only */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
            </div>

            {/* Content area */}
            <div className="relative px-6 sm:px-10 pb-10">
                <div className="flex flex-col md:flex-row md:items-start lg:items-end gap-6 -mt-16 sm:-mt-20">
                    {/* Avatar with clean border */}
                    <div className="relative shrink-0">
                        <div className="relative ring-8 ring-background bg-background border border-border overflow-hidden">
                            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 rounded-none">
                                <AvatarImage
                                    src={user?.profile_picture ?? undefined}
                                    alt={displayName}
                                    className="object-cover rounded-none grayscale transition-all duration-300 hover:grayscale-0"
                                />
                                <AvatarFallback className="text-4xl font-black bg-muted text-foreground/40 rounded-none capitalize">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Identity Info */}
                    <div className="flex-1 min-w-0 pt-4 md:pt-0">
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-[0.05em] text-foreground truncate capitalize">
                                    {displayName}
                                </h1>
                                {user?.email_verified && (
                                    <Badge
                                        variant="outline"
                                        className="bg-foreground/5 text-foreground border-foreground/20 text-[9px] font-black capitalize tracking-[0.2em] px-2.5 py-1 rounded-none"
                                    >
                                        VERIFIED
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-muted-foreground capitalize opacity-70">
                                <span className="flex items-center gap-1.5 font-mono">
                                    <AtSign className="h-3 w-3" />
                                    {user?.username}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono">
                                    <Mail className="h-3 w-3" />
                                    {user?.email}
                                </span>
                            </div>
                        </div>

                        {/* Segmented Data Grid - Black & White */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
                            <div className="bg-background hover:bg-muted/30 transition-colors p-4 space-y-1.5">
                                <p className="text-[9px] font-black capitalize tracking-[0.2em] text-muted-foreground/40">Joined</p>
                                <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
                                    {formatDate(user?.date_joined)}
                                </div>
                            </div>
                            <div className="bg-background hover:bg-muted/30 transition-colors p-4 space-y-1.5">
                                <p className="text-[9px] font-black capitalize tracking-[0.2em] text-muted-foreground/40">Status</p>
                                <div className="flex items-center gap-2 text-[13px] font-bold capitalize tracking-tight">
                                    <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                                    ACTIVE
                                </div>
                            </div>
                            <div className="hidden lg:block bg-background hover:bg-muted/30 transition-colors p-4 space-y-1.5">
                                <p className="text-[9px] font-black capitalize tracking-[0.2em] text-muted-foreground/40">Identity Tier</p>
                                <div className="text-[13px] font-bold capitalize tracking-tight text-foreground">
                                    PRIMARY
                                </div>
                            </div>
                            <div className="hidden lg:block bg-background hover:bg-muted/30 transition-colors p-4 space-y-1.5">
                                <p className="text-[9px] font-black capitalize tracking-[0.2em] text-muted-foreground/40">Network Score</p>
                                <div className="text-[13px] font-bold capitalize tracking-tight text-foreground">
                                    98.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
