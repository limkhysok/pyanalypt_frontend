import type { Metadata } from "next";
import "@/styles/globals.css";
import { outfit } from "@/styles/fonts";
import { Providers } from "@/context/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "PyAnalypt",
    description: "Advanced Data Analysis Dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning className={outfit.variable}>
            <body className={`${outfit.className} antialiased VscScrollbar bg-background text-foreground relative`}>
                <Providers>
                    {children}
                    <Toaster position="bottom-right" richColors closeButton />
                </Providers>
            </body>
        </html>
    );
}
