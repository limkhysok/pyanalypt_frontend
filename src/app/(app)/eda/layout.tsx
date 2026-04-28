import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "EDA",
    description: "Exploratory Data Analysis — visualise distributions, correlations, and more",
};

export default function EDALayout({ children }: Readonly<{ children: ReactNode }>) {
    return <>{children}</>;
}
