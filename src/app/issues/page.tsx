import { IssuesPage } from "@/pages/auth/IssuesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Issues | PyAnalypt",
    description: "Track system integrity and data quality issues with PyAnalypt.",
};

export default function Issues() {
    return <IssuesPage />;
}
