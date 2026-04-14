"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { toast } from "sonner";
import { PersonalDetails } from "./_components/PersonalDetails";

export default function ProfilePage() {
    const { user, isLoading, login } = useAuth();

    const [editing, setEditing]       = useState(false);
    const [saving, setSaving]         = useState(false);
    const [firstName, setFirstName]   = useState("");
    const [lastName, setLastName]     = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Seed inputs from user when user loads or edit is cancelled
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name ?? "");
            setLastName(user.last_name ?? "");
        }
    }, [user]);

    const handleCancel = () => {
        // Reset inputs back to current user values
        setFirstName(user?.first_name ?? "");
        setLastName(user?.last_name ?? "");
        setFieldErrors({});
        setEditing(false);
    };

    const saveEdit = async () => {
        setFieldErrors({});

        // Only include fields the user actually changed — rule 1
        const payload: { first_name?: string; last_name?: string } = {};
        if (firstName.trim() !== (user?.first_name ?? "")) payload.first_name = firstName.trim();
        if (lastName.trim()  !== (user?.last_name  ?? "")) payload.last_name  = lastName.trim();

        if (Object.keys(payload).length === 0) {
            setEditing(false);
            return;
        }

        setSaving(true);
        try {
            const updated = await authApi.updateProfile(payload);
            // Rule 2: update local state from the response, not a refetch
            login(updated);
            toast.success("Profile updated successfully.");
            setEditing(false);
        } catch (error: any) {
            const data = error?.response?.data;
            // Rule 5: map field-level errors to their inputs
            if (data && typeof data === "object") {
                const errors: Record<string, string> = {};
                if (data.first_name) errors.first_name = [data.first_name].flat()[0];
                if (data.last_name)  errors.last_name  = [data.last_name].flat()[0];
                if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    return;
                }
                toast.error(data.detail ?? "Failed to update profile.");
            } else {
                toast.error("Failed to update profile.");
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
