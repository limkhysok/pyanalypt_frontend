import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Disabled for local fonts
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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

import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${customFont.variable} antialiased VscScroolbar font-sans`}
      >
        <TooltipProvider>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
