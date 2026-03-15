import { ProfilePage } from "@/pages/auth/ProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Profile | PyAnalypt",
    description: "View and manage your personal information, security settings, and connected accounts.",
};

export default function Profile() {
    return <ProfilePage />;
}
