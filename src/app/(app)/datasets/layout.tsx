import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Datasets | PyAnalypt",
    description: "Manage and explore your data assets with PyAnalypt.",
};

export default function DatasetsLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <>{children}</>;
}
