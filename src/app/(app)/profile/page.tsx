"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { toast } from "sonner";
import { PersonalDetails } from "./_components/PersonalDetails";

export default function ProfilePage() {
    const { user, isLoading, refreshUser } = useAuth();

    const [editing, setEditing]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim());
        }
    }, [user]);

    const saveEdit = async () => {
        const trimmed = fullName.trim();
        if (!trimmed) return;
        // Split "First Last" → first_name + last_name (only these two are writable)
        const spaceIdx = trimmed.indexOf(" ");
        const first_name = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
        const last_name  = spaceIdx === -1 ? ""       : trimmed.slice(spaceIdx + 1).trim();
        setSaving(true);
        try {
            await authApi.updateProfile({ first_name, last_name });
            await refreshUser();
            toast.success("Profile updated successfully.");
            setEditing(false);
        } catch (error) {
            console.error("Profile update failed", error);
            toast.error("Failed to update profile details.");
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
                setFullName={setFullName}
                onEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
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
