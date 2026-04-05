import localFont from "next/font/local";

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
