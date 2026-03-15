import { ProfileSettingPage } from "@/pages/auth/ProfileSettingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile Settings | PyAnalypt",
    description: "Update your personal information and profile details.",
};

export default function ProfileSetting() {
    return <ProfileSettingPage />;
}
