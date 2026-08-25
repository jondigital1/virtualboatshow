import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { IframeModalProvider } from "@/components/IframeModal";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atlantic City In-Water Boat Show · Sept 10-13, 2026",
    template: "%s · AC In-Water Boat Show",
  },
  description:
    "Preview every boat coming to the Atlantic City In-Water Boat Show, value your current boat, and book your appointment. Boat Show Pricing is revealed at the show. Sept 10-13, 2026 · Atlantic City.",
  keywords: [
    "Atlantic City boat show",
    "in-water boat show",
    "boats for sale NJ",
    "boat show pricing",
    "sell my boat",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable} ${spaceMono.variable}`}
    >
      <body>
        <IframeModalProvider>{children}</IframeModalProvider>
      </body>
    </html>
  );
}
