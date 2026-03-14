import { ProfileSessionsPage } from "@/pages/ProfileSessionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Active Sessions | PyAnalypt",
    description: "View and manage your active login sessions across all devices.",
};

export default function ProfileSessions() {
    return <ProfileSessionsPage />;
}
