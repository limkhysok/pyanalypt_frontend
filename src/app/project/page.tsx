import { ProjectPage } from "@/pages/auth/ProjectPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Projects | PyAnalypt",
    description: "Manage, organize and collaborate on your data science projects with PyAnalypt.",
};

export default function Project() {
    return <ProjectPage />;
}
