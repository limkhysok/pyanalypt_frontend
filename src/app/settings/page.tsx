import { SettingsPage } from "@/pages/auth/SettingsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings | PyAnalypt",
    description: "Manage your account settings, security preferences, and active sessions.",
};

export default function Settings() {
    return <SettingsPage />;
}
