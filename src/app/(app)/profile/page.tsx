"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { toast } from "sonner";
import { PersonalDetails } from "./_components/PersonalDetails";

// Client-side field validators — return an error string or null.
function validateUsername(v: string): string | null {
    if (!v) return null;
    if (v.length < 3) return "Username must be at least 3 characters.";
    if (v.length > 150) return "Username must be at most 150 characters.";
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) return "Only letters, numbers, . _ - are allowed.";
    return null;
}

function validateFullName(v: string): string | null {
    if (!v) return null;
    if (v.trim().length < 2) return "Full name must be at least 2 characters.";
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

// Extracts per-field errors from a DRF validation response.
function parseFieldErrors(data: unknown): Record<string, string> | null {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const errors: Record<string, string> = {};
    if (d.full_name) errors.full_name = [d.full_name].flat()[0] as string;
    if (d.birthday) errors.birthday = [d.birthday].flat()[0] as string;
    if (d.username) errors.username = [d.username].flat()[0] as string;
    if (d.profile_picture) errors.profile_picture = [d.profile_picture].flat()[0] as string;
    return Object.keys(errors).length > 0 ? errors : null;
}

function getProfileFormData(
    user: any,
    fullName: string,
    birthday: string,
    username: string,
    profilePicture: string,
    profilePictureFile: File | null
): FormData | null {
    const formData = new FormData();
    let hasChanges = false;

    if (fullName.trim() !== (user?.full_name ?? "")) {
        formData.append("full_name", fullName.trim());
        hasChanges = true;
    }
    if (birthday !== (user?.birthday ?? "")) {
        formData.append("birthday", birthday || "");
        hasChanges = true;
    }
    if (username.trim() !== (user?.username ?? "")) {
        formData.append("username", username.trim());
        hasChanges = true;
    }
    if (profilePictureFile) {
        formData.append("profile_picture", profilePictureFile);
        hasChanges = true;
    } else if (!profilePicture && user?.profile_picture) {
        formData.append("profile_picture", "");
        hasChanges = true;
    }

    return hasChanges ? formData : null;
}

export default function ProfilePage() {
    const { user, isLoading, login } = useAuth();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [username, setUsername] = useState("");
    const [profilePicture, setProfilePicture] = useState(""); // This stores the preview URL or initial URL
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFullName(user.full_name ?? "");
            setBirthday(user.birthday ?? "");
            setUsername(user.username ?? "");
            setProfilePicture(user.profile_picture ?? "");
            setProfilePictureFile(null);
        }
    }, [user]);

    const handleCancel = () => {
        setFullName(user?.full_name ?? "");
        setBirthday(user?.birthday ?? "");
        setUsername(user?.username ?? "");
        setProfilePicture(user?.profile_picture ?? "");
        setProfilePictureFile(null);
        setFieldErrors({});
        setEditing(false);
    };

    const validateFields = (): Record<string, string> | null => {
        const errs: Record<string, string> = {};
        const usernameErr = validateUsername(username);
        const fullNameErr = validateFullName(fullName);
        const birthdayErr = validateBirthday(birthday);
        
        if (usernameErr) errs.username = usernameErr;
        if (fullNameErr) errs.full_name = fullNameErr;
        if (birthdayErr) errs.birthday = birthdayErr;
        
        if (profilePictureFile && profilePictureFile.size > 2 * 1024 * 1024) {
            errs.profile_picture = "Image must be less than 2MB.";
        }

        return Object.keys(errs).length > 0 ? errs : null;
    };

    const saveEdit = async () => {
        const validationErrors = validateFields();
        if (validationErrors) {
            setFieldErrors(validationErrors);
            return;
        }

        const formData = getProfileFormData(user, fullName, birthday, username, profilePicture, profilePictureFile);
        if (!formData) {
            setEditing(false);
            return;
        }

        setFieldErrors({});
        setSaving(true);
        try {
            const updated = await authApi.updateProfile(formData);
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
            setProfilePictureFile={setProfilePictureFile}
            onEdit={() => setEditing(true)}
            onCancel={handleCancel}
            onSave={saveEdit}
        />
    );
}
