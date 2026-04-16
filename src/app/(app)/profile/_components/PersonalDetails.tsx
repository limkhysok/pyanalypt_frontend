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
        <div className="group relative flex items-start gap-3.5 p-4 bg-muted/20 border border-border/30 hover:border-foreground/30 hover:bg-muted/30 transition-all duration-300">
            {/* Hover Indicator */}
            <div className="absolute left-0 top-0 w-[2px] h-0 bg-foreground group-hover:h-full transition-all duration-300" />
            
            <div className="h-8 w-8 bg-background border border-border/40 flex items-center justify-center shrink-0 text-muted-foreground/60 mt-0.5 group-hover:text-foreground group-hover:border-foreground/40 transition-colors">
                {icon}
            </div>
            <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">{label}</p>
                <div className="text-[13px] font-bold text-foreground tracking-tight group-hover:translate-x-1 transition-transform">{value}</div>
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
            <Label className="text-[11px] font-bold tracking-wider text-muted-foreground ml-1">
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
        `h-10 rounded-none bg-muted/40 border-transparent focus:bg-background focus:ring-1 transition-all font-medium text-[13px] ${fieldErrors[field]
            ? "ring-1 ring-red-500/60 focus:ring-red-500/60"
            : "focus:ring-foreground/30"
        }`;

    return (
        <div className="space-y-6">
            <CardContent className="p-0 space-y-8">
                {editing ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between pb-4 border-b border-border/40">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-widest text-foreground">Edit profile</h3>
                                <p className="text-[10px] font-bold text-muted-foreground/40 tracking-[0.2em]">Update your personal information</p>
                            </div>
                            <div className="h-2 w-32 bg-muted/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-foreground/10 w-full" />
                                <div className="absolute inset-0 bg-foreground/20 w-1/3 animate-progress" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-10">
                            {/* Full Name */}
                            <EditField label="Full name" error={fieldErrors.full_name}>
                                <div className="relative group">
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter name"
                                        className={inputClass("full_name")}
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-foreground/10 group-focus-within:bg-foreground/40 transition-colors" />
                                </div>
                            </EditField>

                            {/* Username */}
                            <EditField label="Username" error={fieldErrors.username} hint="Only alphanumeric characters allowed.">
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/30 font-mono select-none">id:</span>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="unique_id"
                                        className={`${inputClass("username")} pl-10`}
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-foreground/10 group-focus-within:bg-foreground/40 transition-colors" />
                                </div>
                            </EditField>

                            {/* Birthday */}
                            <EditField label="Birthday" error={fieldErrors.birthday}>
                                <div className="relative group">
                                    <Input
                                        type="date"
                                        value={birthday}
                                        max={toDateInput(maxDate)}
                                        min={toDateInput(minDate)}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        className={inputClass("birthday")}
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-foreground/10 group-focus-within:bg-foreground/40 transition-colors" />
                                </div>
                            </EditField>

                            {/* Profile Picture */}
                            <EditField
                                label="Profile picture"
                                error={fieldErrors.profile_picture}
                                hint="Auto-cropped to 1:1 square. Max 2MB."
                            >
                                <div className="flex items-center gap-6 p-4 bg-muted/10 border border-dashed border-border/60">
                                    <div className="h-20 w-20 bg-background border border-border/40 flex items-center justify-center shrink-0 overflow-hidden relative group/avatar">
                                        {profilePicture ? (
                                            <img
                                                src={profilePicture}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/10" />
                                        )}
                                        {profilePicture && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePicture}
                                                className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-10 px-4 rounded-none text-[10px] font-black tracking-[0.2em] border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                                        >
                                            Upload image
                                        </Button>
                                        <p className="text-[9px] text-muted-foreground/40 font-bold tracking-tighter">
                                            drag and drop or select
                                        </p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </EditField>
                        </div>

                        {/* Read-only: email */}
                        <div className="pt-4">
                            <EditField label="Email address" hint="This field is locked.">
                                <div className="h-11 flex items-center px-4 bg-muted/10 text-[13px] text-muted-foreground/40 border border-border/40 font-mono">
                                    {user?.email}
                                    <div className="ml-auto flex items-center gap-2 opacity-40">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span className="text-[9px]">encrypted</span>
                                    </div>
                                </div>
                            </EditField>
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <Button
                                onClick={onSave}
                                disabled={saving}
                                className="h-12 px-10 rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold text-[12px] tracking-[0.2em] transition-all shadow-xl shadow-foreground/10"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving info...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Save changes
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                disabled={saving}
                                className="h-12 px-8 rounded-none text-[12px] font-bold tracking-[0.2em] border border-border hover:bg-muted/50 hover:border-foreground/20"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Identity Banner */}
                        <div className="relative group p-6 sm:p-8 border border-border/40 bg-muted/10 backdrop-blur-sm overflow-hidden">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-foreground/[0.02] -rotate-45 translate-x-1/2 -translate-y-1/2" />
                            
                            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="relative h-24 w-24 border-2 border-border/60 p-1 group-hover:border-foreground/40 transition-colors duration-500">
                                        <div className="h-full w-full bg-muted/40 overflow-hidden relative">
                                            {user?.profile_picture ? (
                                                <img src={user?.profile_picture || ""} alt="Avatar" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center font-black text-3xl text-muted-foreground/20">?</div>
                                            )}
                                        </div>
                                        {/* Avatar corner decors */}
                                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-foreground/20" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-foreground/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-3xl font-black tracking-tighter text-foreground group-hover:tracking-normal transition-all duration-500">{user?.full_name || "Unassigned"}</h3>
                                            <Badge variant="outline" className="h-5 px-1.5 rounded-none border-foreground/10 text-[9px] font-bold tracking-widest text-muted-foreground/40">Basic account</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/40 tracking-[0.2em]">
                                            <span>Personal account</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-emerald-500/60">Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={onEdit}
                                    className="h-11 px-8 rounded-none text-[11px] font-bold tracking-[0.2em] border-border/80 hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                                >
                                    Edit profile
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-3">
                            <FieldCard
                                icon={<UserRound className="h-3.5 w-3.5" />}
                                label="Full name"
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
                                label="Email address"
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
                                                <ShieldCheck className="h-2.5 w-2.5" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                }
                            />
                            <FieldCard
                                icon={<ImageIcon className="h-3.5 w-3.5" />}
                                label="Profile picture"
                                value={
                                    user?.profile_picture ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 bg-muted shrink-0 overflow-hidden border border-border/40">
                                                <img src={user?.profile_picture || ""} alt="Avatar" className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-[11px] truncate opacity-60">Image configured</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground/40 font-normal italic text-[13px]">Not set</span>
                                    )
                                }
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </div>
    );
}
