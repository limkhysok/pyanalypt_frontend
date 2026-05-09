import localFont from "next/font/local";
import { Fredoka } from "next/font/google";

export const outfit = localFont({
  src: [
    {
      path: "../fonts/Outfit-Medium.ttf",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
});

export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});
