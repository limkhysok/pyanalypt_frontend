import { TutorialsPage } from "@/pages/TutorialsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tutorials | PyAnalypt",
    description: "Expand your data science and analytics skills with the PyAnalypt library of tutorials and courses.",
};

export default function Tutorials() {
    return <TutorialsPage />;
}
