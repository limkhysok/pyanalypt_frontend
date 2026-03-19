import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "@/styles/globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-custom",
  display: "swap",
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
        className={`${jost.variable} antialiased VscScroolbar font-sans bg-background text-foreground relative`}
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
