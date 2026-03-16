import { DatasetPage } from "@/pages/auth/DatasetPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Datasets | PyAnalypt",
    description: "Manage and explore your data assets with PyAnalypt.",
};

export default function Datasets() {
    return <DatasetPage />;
}
