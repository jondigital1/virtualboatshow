import Link from "next/link";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY } from "@/components/ui";

/**
 * Shown when a boat slug does not exist, and it carries the real HTTP 404 the
 * old inline fallback could not: any unknown /boats/<slug> used to answer 200
 * with a friendly page, so search engines kept indexing withdrawn boats and no
 * status check of this site meant anything.
 *
 * It sits at app/boats/, one level ABOVE the [slug] segment that throws, because
 * the guard is in [slug]/layout.tsx and a notFound() raised inside a layout
 * resolves to a boundary in the PARENT segment. Moved into [slug]/ it is
 * silently ignored and Next serves its own bare 404 instead.
 */
export default function BoatNotFound() {
  return (
    <>
      <AnnouncementBar />
      <Nav active="/inventory" />
      <section style={{ background: "#fff", padding: "clamp(60px,10vw,120px) 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: "var(--navy)", margin: 0 }}>
          We couldn&rsquo;t find that boat.
        </h1>
        <p style={{ color: "#5a6c78", margin: "12px 0 22px" }}>
          The lineup changes as dealers confirm their boats, so it may have been updated.
        </p>
        <Link
          href="/inventory"
          className="h-brighten"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--navy)", color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: ".05em", textTransform: "uppercase", padding: "13px 22px", borderRadius: 8 }}
        >
          Browse Boats at the Show →
        </Link>
      </section>
      <Footer />
    </>
  );
}
