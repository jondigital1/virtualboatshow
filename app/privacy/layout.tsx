import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What the 2026 Atlantic City In-Water Boat Show virtual companion collects, what it stores only with your consent, who sees it, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
