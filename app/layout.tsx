import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { IframeModalProvider } from "@/components/IframeModal";
import "./globals.css";

/* Single brand family per the AC Boat Show mockups: Poppins carries display,
 * body, and the letterspaced eyebrow/caps styles (legacy font vars are
 * aliased to it in globals.css until the official brand sheet arrives). */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atlantic City In-Water Boat Show · Sept 10-13, 2026",
    template: "%s · AC In-Water Boat Show",
  },
  description:
    "The official virtual companion to the Atlantic City In-Water Boat Show. Browse boats and Marine Marketplace exhibitors, save your favorites, and plan your visit. Sept 10-13, 2026 · Farley State Marina, Atlantic City.",
  keywords: [
    "Atlantic City boat show",
    "in-water boat show",
    "boats for sale NJ",
    "marine marketplace",
    "boat show tickets",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <IframeModalProvider>{children}</IframeModalProvider>
      </body>
    </html>
  );
}
