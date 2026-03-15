import { ProjectDetailPage } from "@/pages/auth/ProjectDetailPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Project Details | PyAnalypt",
    description: "Analyze, import data, and manage your data science project.",
};

export default function ProjectDetail() {
    return <ProjectDetailPage />;
}
