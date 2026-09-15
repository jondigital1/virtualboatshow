"use client";

import { track } from "@vercel/analytics";
import { DISPLAY, Eyebrow } from "@/components/ui";
import type { Faq } from "@/lib/faq";

/**
 * Questions and answers, on every page (Jon, 2026-09-15), written for the
 * questions people type into search engines and ask AI assistants. The sets
 * live in lib/faq.ts and are built from the site's own data.
 *
 * Answers sit in native <details> elements: they are in the HTML for
 * crawlers and open without JavaScript. The FAQPage structured data repeats
 * them for machines. Google shows FAQ rich results only for a small set of
 * authoritative sites, so the value is the visible answers themselves. Use
 * this once per page; FAQPage data is meant to appear once.
 */
export function FaqSection({
  items,
  title,
  eyebrow = "Questions and answers",
  intro,
  tone = "tint",
  id = "questions",
}: {
  items: Faq[];
  title: string;
  eyebrow?: string;
  intro?: string;
  tone?: "tint" | "white";
  id?: string;
}) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section id={id} style={{ scrollMarginTop: 82, background: tone === "tint" ? "var(--bluetint)" : "#fff", padding: "clamp(48px,6vw,88px) clamp(18px,3vw,44px)", borderTop: "1px solid rgba(20,46,81,.08)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Eyebrow style={{ textAlign: "center" }}>{eyebrow}</Eyebrow>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,3.4vw,40px)", lineHeight: 1.08, letterSpacing: "-.01em", margin: "14px 0 0", textAlign: "center", color: "var(--navy)", textWrap: "balance" }}>
          {title}
        </h2>
        {intro && (
          <p style={{ textAlign: "center", fontSize: 16, lineHeight: 1.6, color: "#4c6270", margin: "14px auto 0", maxWidth: "58ch" }}>{intro}</p>
        )}
        <div className="faq-list">
          {items.map(({ q, a }) => (
            <details
              key={q}
              className="faq-item"
              onToggle={(e) => {
                if (e.currentTarget.open) track("faq_opened", { q: q.slice(0, 60), page: window.location.pathname });
              }}
            >
              <summary>
                <h3 className="faq-q">{q}</h3>
                <span aria-hidden className="faq-mark">+</span>
              </summary>
              <p className="faq-a">{a}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
