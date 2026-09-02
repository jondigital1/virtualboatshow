import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { IframeModalProvider } from "@/components/IframeModal";
import { MetaPixel } from "@/components/MetaPixel";
import { NAME_WITH_YEAR, SHORT_NAME, DATES_SHORT, WHEN_AND_WHERE, YEAR } from "@/lib/show";
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
  `The official virtual companion to the ${NAME_WITH_YEAR}. Browse boats and Marine Marketplace exhibitors and plan your visit. ${WHEN_AND_WHERE}.`;

export const metadata: Metadata = {
  // www is the canonical host: the apex 308-redirects to it, so every
  // canonical, OG url and sitemap entry has to name www or they all point at
  // a redirect.
  metadataBase: new URL("https://www.acvirtualboatshow.com"),
  // The year rides in the template, so every page states which show it belongs
  // to. Boat pages read "2027 Sailfish 316 DC · AC In-Water Boat Show 2026",
  // which correctly separates the hull's model year from the show's year.
  title: {
    default: `${NAME_WITH_YEAR} · ${DATES_SHORT}`,
    template: `%s · ${SHORT_NAME} ${YEAR}`,
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
    siteName: NAME_WITH_YEAR,
    title: `${NAME_WITH_YEAR} · ${DATES_SHORT}`,
    description: DESCRIPTION,
    images: [{ url: "/og-show.jpg", width: 1200, height: 630, alt: "Boats filling Farley State Marina at the Atlantic City In-Water Boat Show" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME_WITH_YEAR} · ${DATES_SHORT}`,
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
        <MetaPixel />
      </body>
    </html>
  );
}
