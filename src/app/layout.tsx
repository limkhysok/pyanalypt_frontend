import type { Metadata } from "next";
import "@/styles/globals.css";
import { outfit } from "@/styles/fonts";
import { CursorFollower } from "@/components/ui/cursor-follower";
import { Providers } from "@/context/providers";
import { PublicShell } from "@/components/layout/PublicShell";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PyAnalypt",
  description: "Advanced Data Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body
        className={`${outfit.className} antialiased VscScrollbar bg-background text-foreground relative`}
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
