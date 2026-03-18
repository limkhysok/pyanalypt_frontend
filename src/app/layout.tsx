import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Disabled for local fonts
import localFont from "next/font/local";
import "@/styles/globals.css";
// Configuration for Local Fonts
// INSTRUCTIONS: Drop your font files in `src/fonts/` and update the paths below.
const customFont = localFont({
  src: [
    {
      path: "../fonts/Jost-Regular.ttf", // REPLACE with your font filename (e.g., "../fonts/MyFont-Regular.ttf")
      weight: "400",
      style: "normal",
    },
    // Add more weights/styles here if needed
    // {
    //   path: "../fonts/MyFont-Bold.ttf",
    //   weight: "700",
    //   style: "normal",
    // }
  ],
  variable: "--font-custom", // This variable will be used in Tailwind/CSS
});

export const metadata: Metadata = {
  title: "PyAnalypt",
  description: "Advanced Data Analysis Dashboard",
};

import { CursorFollower } from "@/components/ui/cursor-follower";
import { Providers } from "@/context/providers";
import { PublicShell } from "@/components/layout/PublicShell";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${customFont.variable} antialiased VscScroolbar font-sans bg-background text-foreground`}
      >
        <SmoothScroll>
          <Providers>
            <CursorFollower />
            <PublicShell>{children}</PublicShell>
            <Toaster position="bottom-right" richColors closeButton />
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
