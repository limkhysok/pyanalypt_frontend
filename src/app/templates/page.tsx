import { VisualizationsPage } from "@/contents/pages/TemplatesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Visualizations Library | PyAnalypt",
    description: "Explore our library of high-performance, interactive charts powered by Python and ECharts. Choose from over 16 analytical templates.",
};

export default function Templates() {
    return <VisualizationsPage />;
}
