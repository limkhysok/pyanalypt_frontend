import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";

const customFont = localFont({
  src: [
    {
      path: "../fonts/Jost-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-custom",
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
        className={`${customFont.variable} antialiased VscScroolbar font-sans bg-background text-foreground relative`}
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
