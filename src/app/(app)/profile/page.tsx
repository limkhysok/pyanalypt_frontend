"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { toast } from "sonner";
import { User } from "@/types/api";
import { PersonalDetails } from "./_components/PersonalDetails";

// Returns only the fields that differ from the current user — never sends unchanged data.
function buildPayload(
    user: User | null | undefined,
    fullName: string,
    birthday: string,
    username: string,
    profilePicture: string,
): Partial<Pick<User, "full_name" | "birthday" | "username" | "profile_picture">> {
    const payload: Partial<Pick<User, "full_name" | "birthday" | "username" | "profile_picture">> = {};
    if (fullName.trim() !== (user?.full_name ?? ""))           payload.full_name = fullName.trim();
    if (birthday !== (user?.birthday ?? ""))                   payload.birthday = birthday || undefined;
    if (username.trim() !== (user?.username ?? ""))            payload.username = username.trim();
    const newPic = profilePicture.trim() || null;
    if (newPic !== (user?.profile_picture ?? null))            payload.profile_picture = newPic;
    return payload;
}

// Client-side field validators — return an error string or null.
function validateUsername(v: string): string | null {
    if (!v) return null;
    if (v.length < 3)   return "Username must be at least 3 characters.";
    if (v.length > 150) return "Username must be at most 150 characters.";
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) return "Only letters, numbers, . _ - are allowed.";
    return null;
}

function validateFullName(v: string): string | null {
    if (!v) return null;
    if (v.trim().length < 2)   return "Full name must be at least 2 characters.";
    if (v.trim().length > 255) return "Full name must be at most 255 characters.";
    if (!/^[a-zA-Z\s\-']+$/.test(v.trim())) return "Only letters, hyphens, apostrophes, and spaces are allowed.";
    return null;
}

function validateBirthday(v: string): string | null {
    if (!v) return null;
    const date = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date >= today) return "Birthday must be in the past.";
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 120);
    if (date < maxAge) return "Enter a valid date of birth.";
    return null;
}

function validateProfilePicture(v: string): string | null {
    if (!v) return null; // empty = clear
    if (!v.startsWith("https://")) return "Profile picture URL must start with https://.";
    return null;
}

// Extracts per-field errors from a DRF validation response.
function parseFieldErrors(data: unknown): Record<string, string> | null {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const errors: Record<string, string> = {};
    if (d.full_name)       errors.full_name       = [d.full_name].flat()[0] as string;
    if (d.birthday)        errors.birthday        = [d.birthday].flat()[0] as string;
    if (d.username)        errors.username        = [d.username].flat()[0] as string;
    if (d.profile_picture) errors.profile_picture = [d.profile_picture].flat()[0] as string;
    return Object.keys(errors).length > 0 ? errors : null;
}

export default function ProfilePage() {
    const { user, isLoading, login } = useAuth();

    const [editing, setEditing]               = useState(false);
    const [saving, setSaving]                 = useState(false);
    const [fullName, setFullName]             = useState("");
    const [birthday, setBirthday]             = useState("");
    const [username, setUsername]             = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFullName(user.full_name ?? "");
            setBirthday(user.birthday ?? "");
            setUsername(user.username ?? "");
            setProfilePicture(user.profile_picture ?? "");
        }
    }, [user]);

    const handleCancel = () => {
        setFullName(user?.full_name ?? "");
        setBirthday(user?.birthday ?? "");
        setUsername(user?.username ?? "");
        setProfilePicture(user?.profile_picture ?? "");
        setFieldErrors({});
        setEditing(false);
    };

    const saveEdit = async () => {
        // Client-side validation
        const errs: Record<string, string> = {};
        const usernameErr      = validateUsername(username);
        const fullNameErr      = validateFullName(fullName);
        const birthdayErr      = validateBirthday(birthday);
        const profilePictureErr = validateProfilePicture(profilePicture);
        if (usernameErr)       errs.username        = usernameErr;
        if (fullNameErr)       errs.full_name       = fullNameErr;
        if (birthdayErr)       errs.birthday        = birthdayErr;
        if (profilePictureErr) errs.profile_picture = profilePictureErr;
        if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

        setFieldErrors({});
        const payload = buildPayload(user, fullName, birthday, username, profilePicture);
        if (Object.keys(payload).length === 0) { setEditing(false); return; }

        setSaving(true);
        try {
            const updated = await authApi.updateProfile(payload);
            login(updated);
            toast.success("Profile updated successfully.");
            setEditing(false);
        } catch (error: any) {
            const fieldErrs = parseFieldErrors(error?.response?.data);
            if (fieldErrs) {
                setFieldErrors(fieldErrs);
            } else {
                toast.error(error?.response?.data?.detail ?? "Failed to update profile.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PersonalDetails
                user={user}
                editing={editing}
                saving={saving}
                fullName={fullName}
                birthday={birthday}
                username={username}
                profilePicture={profilePicture}
                fieldErrors={fieldErrors}
                setFullName={setFullName}
                setBirthday={setBirthday}
                setUsername={setUsername}
                setProfilePicture={setProfilePicture}
                onEdit={() => setEditing(true)}
                onCancel={handleCancel}
                onSave={saveEdit}
            />

            <div className="relative overflow-hidden p-6 border border-dashed border-border/50 bg-muted/5 flex flex-col items-center justify-center text-center gap-2">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/3 to-transparent pointer-events-none" />
                <div className="h-8 w-8 bg-muted/60 border border-border/40 flex items-center justify-center mb-1">
                    <span className="text-base">🛠️</span>
                </div>
                <p className="text-sm font-semibold text-foreground/70">More settings coming soon</p>
                <p className="text-xs text-muted-foreground/50 max-w-sm leading-relaxed">
                    Advanced security controls, integrations, and notification preferences are on the way.
                </p>
            </div>
        </>
    );
}
