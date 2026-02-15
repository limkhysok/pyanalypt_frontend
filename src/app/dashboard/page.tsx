import { DashboardPage } from "@/contents/pages/DashboardPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | PyAnalypt",
    description: "Manage your data analyses, datasets, and reports in your personal PyAnalypt workspace.",
};

export default function Dashboard() {
    return <DashboardPage />;
}
