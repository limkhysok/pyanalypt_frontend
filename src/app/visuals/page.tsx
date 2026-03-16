import { VisualizationsPage } from "@/pages/public/VisualsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Visual Forge | PyAnalypt",
    description: "Explore our modular library of interactive data architectures. Optimized for high-throughput intelligence.",
};

export default function VisualsPage() {
    return <VisualizationsPage />;
}
