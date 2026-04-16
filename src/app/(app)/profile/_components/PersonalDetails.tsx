"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Loader2, UserRound, Pencil, Check, X,
    Mail, AtSign, Cake, ShieldCheck, ShieldAlert, ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface PersonalDetailsProps {
    user: User | null | undefined;
    editing: boolean;
    saving: boolean;
    fullName: string;
    birthday: string;
    username: string;
    profilePicture: string;
    fieldErrors: Record<string, string>;
    setFullName: (val: string) => void;
    setBirthday: (val: string) => void;
    setUsername: (val: string) => void;
    setProfilePicture: (val: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
}

interface FieldCardProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

function FieldCard({ icon, label, value }: Readonly<FieldCardProps>) {
    return (
        <div className="flex items-start gap-3.5 p-4 bg-muted/20 border border-border/30 hover:border-border/60 transition-colors">
            <div className="h-8 w-8 bg-background border border-border/40 flex items-center justify-center shrink-0 text-muted-foreground/60 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">{label}</p>
                <div className="text-[13.5px] font-semibold text-foreground">{value}</div>
            </div>
        </div>
    );
}

// Max date = yesterday; min date = 120 years ago
const _today = new Date();
const maxDate = new Date(_today);
maxDate.setDate(maxDate.getDate() - 1);
const minDate = new Date(_today);
minDate.setFullYear(minDate.getFullYear() - 120);
const toDateInput = (d: Date) => d.toISOString().split("T")[0];

function EditField({
    label,
    error,
    children,
    hint,
}: Readonly<{ label: string; error?: string; children: React.ReactNode; hint?: string }>) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                {label}
            </Label>
            {children}
            {hint && !error && <p className="text-[10px] text-muted-foreground/50 italic ml-1">{hint}</p>}
            {error && <p className="text-[10px] text-red-500 ml-1">{error}</p>}
        </div>
    );
}

export function PersonalDetails({
    user,
    editing,
    saving,
    fullName,
    birthday,
    username,
    profilePicture,
    fieldErrors,
    setFullName,
    setBirthday,
    setUsername,
    setProfilePicture,
    onEdit,
    onCancel,
    onSave,
}: Readonly<PersonalDetailsProps>) {
    const inputClass = (field: string) =>
        `h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 transition-all ${
            fieldErrors[field]
                ? "ring-1 ring-red-500/60 focus:ring-red-500/60"
                : "focus:ring-blue-500/30"
        }`;

    return (
        <Card className="rounded-none border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <div className="h-7 w-7 bg-blue-500/10 flex items-center justify-center">
                            <UserRound className="h-3.5 w-3.5 text-blue-500" />
                        </div>
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
                        className="h-8 px-3 rounded-none text-xs font-semibold hover:bg-muted gap-1.5"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
                {editing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <EditField label="Full Name" error={fieldErrors.full_name}>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className={inputClass("full_name")}
                                />
                            </EditField>

                            {/* Username */}
                            <EditField label="Username" error={fieldErrors.username} hint="Letters, numbers, . _ - only.">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/50 select-none">@</span>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        className={`${inputClass("username")} pl-7`}
                                    />
                                </div>
                            </EditField>

                            {/* Birthday */}
                            <EditField label="Birthday" error={fieldErrors.birthday}>
                                <Input
                                    type="date"
                                    value={birthday}
                                    max={toDateInput(maxDate)}
                                    min={toDateInput(minDate)}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className={inputClass("birthday")}
                                />
                            </EditField>

                            {/* Profile Picture */}
                            <EditField
                                label="Profile Picture"
                                error={fieldErrors.profile_picture}
                                hint="Paste an https:// URL, or leave blank to clear."
                            >
                                <Input
                                    type="url"
                                    value={profilePicture}
                                    onChange={(e) => setProfilePicture(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    className={inputClass("profile_picture")}
                                />
                            </EditField>
                        </div>

                        {/* Read-only: email */}
                        <EditField label="Email Address" hint="Email cannot be changed.">
                            <p className="h-10 flex items-center px-3 bg-muted/20 text-[12px] text-muted-foreground/70 border border-dashed border-border/50 select-none">
                                {user?.email}
                            </p>
                        </EditField>

                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                onClick={onSave}
                                disabled={saving}
                                size="sm"
                                className="h-9 px-4 rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                                {saving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="mr-1.5 h-3.5 w-3.5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-9 px-4 rounded-none text-xs font-semibold"
                            >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FieldCard
                            icon={<UserRound className="h-3.5 w-3.5" />}
                            label="Full Name"
                            value={user?.full_name || <span className="text-muted-foreground/40 font-normal italic text-[13px]">Not set</span>}
                        />
                        <FieldCard
                            icon={<AtSign className="h-3.5 w-3.5" />}
                            label="Username"
                            value={<span className="font-mono">@{user?.username}</span>}
                        />
                        <FieldCard
                            icon={<Cake className="h-3.5 w-3.5" />}
                            label="Birthday"
                            value={formatDate(user?.birthday) || <span className="text-muted-foreground/40 font-normal italic text-[13px]">Not set</span>}
                        />
                        <FieldCard
                            icon={<Mail className="h-3.5 w-3.5" />}
                            label="Email"
                            value={
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="truncate">{user?.email}</span>
                                    {user?.email_verified ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none h-4 px-1.5 rounded-none text-[9px] font-bold gap-0.5 shrink-0">
                                            <ShieldCheck className="h-2.5 w-2.5" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none h-4 px-1.5 rounded-none text-[9px] font-bold gap-0.5 shrink-0">
                                            <ShieldAlert className="h-2.5 w-2.5" />
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            }
                        />
                        <FieldCard
                            icon={<ImageIcon className="h-3.5 w-3.5" />}
                            label="Profile Picture"
                            value={
                                user?.profile_picture
                                    ? <a href={user.profile_picture} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[12px] truncate block max-w-50">{user.profile_picture}</a>
                                    : <span className="text-muted-foreground/40 font-normal italic text-[13px]">Not set</span>
                            }
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
