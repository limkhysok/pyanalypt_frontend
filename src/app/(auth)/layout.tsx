import { Navbar } from "@/components/layout/Navbar";

// Auth layout — providing public navbar for consistency across auth flows as requested.
export default function AuthLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="relative min-h-screen">
            <Navbar />
            {children}
        </div>
    );
}
