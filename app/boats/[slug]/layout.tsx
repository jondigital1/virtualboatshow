import type { Metadata } from "next";
import { boatBySlug, boatTitle } from "@/lib/showboats";

/**
 * Per-boat share cards: a shared boat link unfurls with THAT boat's photo,
 * name, and description instead of the generic site card. Metadata is
 * resolved server-side here; the page itself stays a client component.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const boat = boatBySlug(slug);
  if (!boat) {
    return { title: "Browse Boats at the Show" };
  }
  const title = boatTitle(boat);
  const dealerNames = boat.dealers.map((d) => d.name).join(" and ");
  const description = boat.blurb
    ? boat.blurb.slice(0, 200)
    : `See the ${title} in the water at the Atlantic City In-Water Boat Show, Sept 10-13, 2026, presented by ${dealerNames}.`;
  const image = boat.photos[0];
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: `${title} · Atlantic City In-Water Boat Show`,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Atlantic City In-Water Boat Show`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function BoatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
