"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Loader2, UserRound, Pencil, Check, X,
    Mail, AtSign, Cake, ShieldCheck, ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/api";
import { formatDate } from "@/lib/utils";
import * as React from "react";

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
    setProfilePictureFile: (file: File | null) => void;
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
                <div className="text-[13px] font-semibold text-foreground uppercase tracking-tight">{value}</div>
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
            {hint && !error && <p className="text-[10px] text-muted-foreground/50 italic ml-1 uppercase">{hint}</p>}
            {error && <p className="text-[10px] text-red-500 ml-1 uppercase">{error}</p>}
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
    setProfilePictureFile,
    onEdit,
    onCancel,
    onSave,
}: Readonly<PersonalDetailsProps>) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePictureFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProfilePicture(previewUrl);
        }
    };

    const handleRemovePicture = () => {
        setProfilePicture("");
        setProfilePictureFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const inputClass = (field: string) =>
        `h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 transition-all uppercase font-medium text-[13px] ${fieldErrors[field]
            ? "ring-1 ring-red-500/60 focus:ring-red-500/60"
            : "focus:ring-foreground/30"
        }`;

    return (
        <Card className="rounded-none border-border bg-background overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                    <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-widest">
                        <div className="h-7 w-7 bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                            <UserRound className="h-4 w-4 text-foreground/60" />
                        </div>
                        Identity Registry
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                        Core Account Data Management Interface
                    </CardDescription>
                </div>
                {!editing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="h-8 px-4 rounded-none text-[10px] font-black hover:bg-muted gap-1.5 uppercase border border-border/60 hover:border-foreground"
                    >
                        <Pencil className="h-3 w-3" />
                        Modify
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {editing ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <EditField label="Identity Name" error={fieldErrors.full_name}>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="ENTER NAME"
                                    className={inputClass("full_name")}
                                />
                            </EditField>

                            {/* Username */}
                            <EditField label="System Identifier" error={fieldErrors.username} hint="ALPHANUMERIC ONLY.">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/50 select-none">@</span>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="UNIQUE_ID"
                                        className={`${inputClass("username")} pl-7`}
                                    />
                                </div>
                            </EditField>

                            {/* Birthday */}
                            <EditField label="Chronology" error={fieldErrors.birthday}>
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
                                hint="Auto-cropped to 1:1 square. Max 2MB."
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-muted/40 border border-border/40 flex items-center justify-center shrink-0 overflow-hidden relative group/avatar">
                                        {profilePicture ? (
                                            <img
                                                src={profilePicture}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                                        )}
                                        {profilePicture && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePicture}
                                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-9 px-3 rounded-none text-[10px] font-black uppercase tracking-widest border-border/60 hover:border-foreground"
                                            >
                                                Select Image
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                            />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground/50 uppercase font-bold tracking-tighter">
                                            Accepted: JPG, PNG, WEBP
                                        </p>
                                    </div>
                                </div>
                            </EditField>
                        </div>

                        {/* Read-only: email */}
                        <EditField label="Communications Link" hint="READ-ONLY DATA.">
                            <p className="h-10 flex items-center px-3 bg-muted/20 text-[12px] text-muted-foreground/60 border border-dashed border-border select-none normal-case font-mono">
                                {user?.email}
                            </p>
                        </EditField>

                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                onClick={onSave}
                                disabled={saving}
                                className="h-10 px-6 rounded-none bg-foreground text-background hover:bg-foreground/90 font-black text-[11px] uppercase tracking-widest transition-all"
                            >
                                {saving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="mr-2 h-3.5 w-3.5" />
                                        Commit
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-10 px-6 rounded-none text-[11px] font-black uppercase tracking-widest border border-border hover:bg-muted"
                            >
                                <X className="mr-2 h-3.5 w-3.5" />
                                Discard
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FieldCard
                            icon={<UserRound className="h-3.5 w-3.5" />}
                            label="Full Name"
                            value={user?.full_name || <span className="text-muted-foreground/40 font-normal italic text-[13px] normal-case">Not set</span>}
                        />
                        <FieldCard
                            icon={<AtSign className="h-3.5 w-3.5" />}
                            label="Username"
                            value={<span className="font-mono">@{user?.username}</span>}
                        />
                        <FieldCard
                            icon={<Cake className="h-3.5 w-3.5" />}
                            label="Birthday"
                            value={formatDate(user?.birthday) || <span className="text-muted-foreground/40 font-normal italic text-[13px] normal-case">Not set</span>}
                        />
                        <FieldCard
                            icon={<Mail className="h-3.5 w-3.5" />}
                            label="Email"
                            value={
                                <div className="flex items-center gap-2 flex-wrap normal-case">
                                    <span className="truncate">{user?.email}</span>
                                    {user?.email_verified ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none h-4 px-1.5 rounded-none text-[9px] font-bold gap-0.5 shrink-0 uppercase">
                                            <ShieldCheck className="h-2.5 w-2.5" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none h-4 px-1.5 rounded-none text-[9px] font-bold gap-0.5 shrink-0 uppercase">
                                            <ShieldCheck className="h-2.5 w-2.5" />
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
                                user?.profile_picture ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 bg-muted shrink-0 overflow-hidden border border-border/40">
                                            <img src={user.profile_picture} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <span className="text-[11px] truncate opacity-60 normal-case">Image Configured</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/40 font-normal italic text-[13px] normal-case">Not set</span>
                                )
                            }
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
