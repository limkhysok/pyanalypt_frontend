"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { toast } from "sonner";
import { User } from "@/types/api";
import { PersonalDetails } from "./_components/PersonalDetails";

// Returns only the fields that differ from the current user — never sends unchanged data.
function buildPayload(
    user: User | null | undefined,
    firstName: string,
    lastName: string,
): { first_name?: string; last_name?: string } {
    const payload: { first_name?: string; last_name?: string } = {};
    if (firstName.trim() !== (user?.first_name ?? "")) payload.first_name = firstName.trim();
    if (lastName.trim()  !== (user?.last_name  ?? "")) payload.last_name  = lastName.trim();
    return payload;
}

// Extracts per-field errors from a DRF validation response.
// Returns null when there are no field errors (e.g. a detail-only error).
function parseFieldErrors(data: unknown): Record<string, string> | null {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const errors: Record<string, string> = {};
    if (d.first_name) errors.first_name = [d.first_name].flat()[0] as string;
    if (d.last_name)  errors.last_name  = [d.last_name].flat()[0] as string;
    return Object.keys(errors).length > 0 ? errors : null;
}

export default function ProfilePage() {
    const { user, isLoading, login } = useAuth();

    const [editing, setEditing]         = useState(false);
    const [saving, setSaving]           = useState(false);
    const [firstName, setFirstName]     = useState("");
    const [lastName, setLastName]       = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name ?? "");
            setLastName(user.last_name ?? "");
        }
    }, [user]);

    const handleCancel = () => {
        setFirstName(user?.first_name ?? "");
        setLastName(user?.last_name ?? "");
        setFieldErrors({});
        setEditing(false);
    };

    const saveEdit = async () => {
        setFieldErrors({});
        const payload = buildPayload(user, firstName, lastName);
        if (Object.keys(payload).length === 0) {
            setEditing(false);
            return;
        }
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
                firstName={firstName}
                lastName={lastName}
                fieldErrors={fieldErrors}
                setFirstName={setFirstName}
                setLastName={setLastName}
                onEdit={() => setEditing(true)}
                onCancel={handleCancel}
                onSave={saveEdit}
            />

            <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">More settings coming soon</p>
                <p className="text-xs text-muted-foreground/60 max-w-sm">
                    We're working on expanding account management features, including advanced security controls and integration settings.
                </p>
            </div>
        </>
    );
}
