import { PlaygroundPage } from "@/pages/PlaygroundPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Interactive Playground | PyAnalypt",
    description: "Instant data visualization sandbox. Paste your raw CSV data for high-performance client-side rendering with ECharts.",
};

export default function Playground() {
    return <PlaygroundPage />;
}
