import { ProfileAuthPage } from "@/pages/auth/ProfileAuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security & Authentication | PyAnalypt",
    description: "Manage your passwords and two-factor authentication settings.",
};

export default function ProfileAuth() {
    return <ProfileAuthPage />;
}
