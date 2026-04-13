"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/services/auth.service";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

// Sub-components
import { ProfileNav } from "./_components/ProfileNav";
import { ProfileHero } from "./_components/ProfileHero";
import { PersonalDetails } from "./_components/PersonalDetails";

export default function ProfilePage() {
    const { user, isLoading, refreshUser } = useAuth();

    const [editing, setEditing]       = useState(false);
    const [saving, setSaving]         = useState(false);
    const [fullName, setFullName]     = useState("");
    const [username, setUsername]     = useState("");

    // Update state when user data is available
    useEffect(() => {
        if (user) {
            setFullName(user.full_name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim());
            setUsername(user.username || "");
        }
    }, [user]);

    const displayName =
        user?.full_name ||
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
        user?.username ||
        "User";

    const initials = user ? getInitials(user) : "U";

    const saveEdit = async () => {
        if (!fullName.trim() && !username.trim()) return;
        setSaving(true);
        try {
            await authApi.updateProfile({
                full_name: fullName.trim() || undefined,
                username:  username.trim()  || undefined,
            });
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
            <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProfileHero 
                        user={user} 
                        displayName={displayName} 
                        initials={initials} 
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Sidebar Navigation */}
                    <motion.aside 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-3 lg:sticky lg:top-20"
                    >
                        <div className="p-1 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md">
                            <ProfileNav />
                        </div>
                    </motion.aside>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <PersonalDetails
                                user={user}
                                editing={editing}
                                saving={saving}
                                fullName={fullName}
                                username={username}
                                setFullName={setFullName}
                                setUsername={setUsername}
                                onEdit={() => setEditing(true)}
                                onCancel={() => setEditing(false)}
                                onSave={saveEdit}
                            />
                        </motion.div>

                        {/* Additional Sections could go here (e.g. Account Security Summary) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/5 flex flex-col items-center justify-center text-center space-y-2"
                        >
                            <p className="text-sm font-semibold text-muted-foreground">More settings coming soon</p>
                            <p className="text-xs text-muted-foreground/60 max-w-sm">
                                We're working on expanding account management features, including advanced security controls and integration settings.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
