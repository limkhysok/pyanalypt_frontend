import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Framing",
    description: "Define your analysis goal and research questions",
};

export default function FramingLayout({ children }: Readonly<{ children: ReactNode }>) {
    return <>{children}</>;
}
