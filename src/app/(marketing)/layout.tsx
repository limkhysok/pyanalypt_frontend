import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

// Marketing layout — wraps all public landing pages with Navbar + Footer.
// SmoothScroll (Lenis) only runs on marketing pages, not on the app or auth routes.
export default function MarketingLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <SmoothScroll>
            <Navbar />
            <div className="min-h-screen relative">{children}</div>
            <Footer />
        </SmoothScroll>
    );
}
