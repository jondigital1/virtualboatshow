import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    alternates: { canonical: `/boats/${slug}` },
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

/**
 * The 404 is issued here rather than in the page, because the page is a client
 * component and cannot set a response status.
 *
 * Every unknown slug used to answer HTTP 200 with a "we couldn't find that boat"
 * body. That is a soft 404: search engines go on indexing withdrawn boats, and
 * checking the site by status code proves nothing, because an invented slug
 * looks exactly like a real one. It is how three not-at-show boats stayed live
 * and crawlable without anyone noticing.
 */
export default async function BoatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!boatBySlug(slug)) notFound();
  return <>{children}</>;
}
