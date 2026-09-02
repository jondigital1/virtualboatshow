import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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

const DESCRIPTION =
  "The official virtual companion to the Atlantic City In-Water Boat Show. Browse boats and Marine Marketplace exhibitors and plan your visit. Sept 10-13, 2026 · Farley State Marina, Atlantic City.";

export const metadata: Metadata = {
  // www is the canonical host: the apex 308-redirects to it, so every
  // canonical, OG url and sitemap entry has to name www or they all point at
  // a redirect.
  metadataBase: new URL("https://www.acvirtualboatshow.com"),
  // The year rides in the template, so every page states which show it belongs
  // to. Boat pages read "2027 Sailfish 316 DC · AC In-Water Boat Show 2026",
  // which correctly separates the hull's model year from the show's year.
  title: {
    default: "2026 Atlantic City In-Water Boat Show · Sept 10-13",
    template: "%s · AC In-Water Boat Show 2026",
  },
  description: DESCRIPTION,
  // Self-referencing canonical. Route layouts override it with their own path;
  // without one, every page claimed to be the homepage.
  alternates: { canonical: "/" },
  keywords: [
    "Atlantic City boat show",
    "in-water boat show",
    "boats for sale NJ",
    "marine marketplace",
    "boat show tickets",
  ],
  openGraph: {
    type: "website",
    url: "https://www.acvirtualboatshow.com",
    siteName: "Atlantic City In-Water Boat Show",
    title: "2026 Atlantic City In-Water Boat Show · Sept 10-13",
    description: DESCRIPTION,
    images: [{ url: "/og-show.jpg", width: 1200, height: 630, alt: "Boats filling Farley State Marina at the Atlantic City In-Water Boat Show" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Atlantic City In-Water Boat Show · Sept 10-13",
    description: DESCRIPTION,
    images: ["/og-show.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <IframeModalProvider>{children}</IframeModalProvider>
        <Analytics />
      </body>
    </html>
  );
}
