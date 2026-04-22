import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "DataLab",
    description: "Inspect and preview your datasets",
};

export default function DataLabLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <>{children}</>;
}
