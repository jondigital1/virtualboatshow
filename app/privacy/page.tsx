"use client";

import Link from "next/link";
import { AnnouncementBar, Nav, Footer } from "@/components/SiteChrome";
import { DISPLAY, Eyebrow } from "@/components/ui";

const FONT = "var(--font-poppins), sans-serif";

/**
 * Privacy policy.
 *
 * Written to describe what this site ACTUALLY does, not a generic template:
 * the walkthrough form, the consent gate, the fact that contact details go to
 * the dealer whose boat was chosen, and the specific processors involved.
 *
 * If the data flow changes, change this page in the same commit. A policy that
 * describes last month's behaviour is worse than none, because it is a
 * statement people rely on.
 */

const UPDATED = "September 2, 2026";

const h2: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: 19,
  color: "var(--navy)",
  textTransform: "uppercase",
  letterSpacing: ".02em",
  margin: "34px 0 0",
};

const p: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.7,
  color: "rgba(20,46,81,.78)",
  margin: "12px 0 0",
};

const li: React.CSSProperties = { ...p, margin: "8px 0 0" };

export default function Privacy() {
  return (
    <>
      <AnnouncementBar />
      <Nav active="" />

      <section style={{ background: "#fff", padding: "clamp(28px,4vw,52px) clamp(18px,3vw,44px) clamp(52px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Eyebrow>Legal</Eyebrow>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.05, letterSpacing: "-.018em", margin: "12px 0 0", color: "var(--navy)", textTransform: "uppercase" }}>
            Privacy policy
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(20,46,81,.55)", margin: "12px 0 0" }}>
            Last updated {UPDATED}
          </p>

          <p style={{ ...p, marginTop: 22 }}>
            This site is the official virtual companion to the Atlantic City In-Water Boat Show. You can browse
            every boat and exhibitor without giving us anything at all. This page explains what happens when you
            do choose to give us something.
          </p>

          <h2 style={h2}>What you give us</h2>
          <p style={p}>
            We ask for personal details in two places. The dockside walkthrough form on a boat page asks for
            your first and last name, mobile number, email address, the day you plan to attend, and whether you
            expect to come in the morning or the afternoon. And on your way to the ticket window we ask for a
            first name and email address, used to send the two updates you agree to there and to let the show
            recognise its own referrals among ticket sales.
          </p>
          <p style={p}>
            We do not ask you to create an account, and we do not have one to create.
          </p>

          <h2 style={h2}>What we record automatically</h2>
          <p style={p}>
            When you submit either form we also record the page address, the page you arrived from, and any
            campaign tags in the link you followed; the walkthrough form additionally records the boat and
            dealer you were looking at and their dock or slip assignment. This is how we tell a dealer which
            boat someone is coming to see, and how we understand which boats draw interest.
          </p>

          <h2 style={h2}>Who sees your details</h2>
          <p style={p}>
            <strong style={{ color: "var(--navy)" }}>The dealer showing the boat you chose.</strong> That is the
            entire point of the form: we tell them you plan to visit, and we pass on your name, email, and phone
            so they can recognise you or reply. Their handling of your details is governed by their own
            practices, not ours.
          </p>
          <p style={p}>
            We do not sell your personal information, and we do not pass your name, email address, or phone
            number to dealers you did not choose. We do advertise the show, and the section on cookies below
            explains exactly what Meta learns when you arrive from one of those ads.
          </p>

          <h2 style={h2}>What we keep, and what we do not</h2>
          <p style={p}>
            The walkthrough form has a checkbox asking whether we may send you show updates. That checkbox is
            optional, and it decides what we store:
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>If you leave it unticked</strong>, we keep a record of the
            enquiry itself, which boat, which dealer, which day, and where you came from, but your name, email
            address, and phone number are not saved to our database at all. They are used to send the dealer
            their notification and to send you a confirmation, and that is the end of it.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>If you tick it</strong>, we also keep your name, email, and
            phone so we can contact you about the show.
          </p>
          <p style={p}>
            The ticket form works differently: its box is required to continue, and it says exactly what you
            are agreeing to, an email when show access goes live and an email when Buoy launches. We keep your
            first name and email address to send them, and every email we send includes a one-click
            unsubscribe.
          </p>
          <p style={p}>
            In both cases we store a one-way fingerprint of your email address. It cannot be turned back into an
            address, and we use it only to avoid counting one person as several.
          </p>

          <h2 style={h2}>Services we rely on</h2>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Vercel</strong> hosts the site and provides visitor
            analytics. The analytics are aggregate and do not use cookies to follow you between sites.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Meta</strong> receives the advertising measurement
            described under cookies below, when you reach us from a Facebook or Instagram ad or browse the site
            afterwards.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Supabase</strong> stores enquiries.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Resend</strong> delivers the emails to you and to the
            dealer, and retains sent messages for a limited period.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Interactive Ticketing</strong> sells show tickets. When you
            open the ticket window you are dealing with them directly, under their privacy policy. We never see
            your payment details.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Visit Atlantic City</strong> provides the hotel listings on
            our Plan Your Visit page, on the same basis.
          </p>
          <p style={li}>
            <strong style={{ color: "var(--navy)" }}>Google Fonts</strong> serves the typefaces, which means
            Google receives your IP address when a page loads.
          </p>

          <h2 style={h2}>Cookies and advertising</h2>
          <p style={p}>
            We advertise the show on Facebook and Instagram, so this site carries the Meta pixel and we can see
            which ads actually sold tickets. The pixel sets cookies in your browser and tells Meta which pages
            you looked at here and whether you completed the ticket form. If you have a Facebook or Instagram
            account, Meta can connect that activity to it. We do not send Meta your name, email address, or
            phone number.
          </p>
          <p style={p}>
            The pixel cannot see inside the ticket window, so it does not know whether you bought a ticket or
            what you paid. You can limit what Meta does with this in your Facebook ad preferences, and most
            browsers will block these cookies outright without breaking anything here.
          </p>
          <p style={p}>
            Nothing else on this site sets an advertising cookie. If you arrive from a campaign link, the
            campaign tags are held in your browser&rsquo;s session storage so they can travel with an enquiry
            you submit. They are discarded when you close the tab.
          </p>

          <h2 style={h2}>How long we keep it</h2>
          <p style={p}>
            Contact details kept under the checkbox are held until you ask us to remove them, or twelve months
            after the show, whichever comes first. Records of enquiries with no contact details attached are kept
            indefinitely, because they no longer identify anyone.
          </p>

          <h2 style={h2}>Your choices</h2>
          <p style={p}>
            Write to us at{" "}
            <a href="mailto:customerinquiry@acvirtualboatshow.com" style={{ color: "var(--linkblue)", fontWeight: 600 }}>
              customerinquiry@acvirtualboatshow.com
            </a>{" "}
            and we will tell you what we hold about you, correct it, or delete it. You do not need to give a
            reason. Note that once a dealer has your enquiry, you will need to contact them directly about their
            copy of it.
          </p>
          <p style={p}>
            Depending on where you live you may have additional rights under laws such as the California Consumer
            Privacy Act or the GDPR. We will honour those requests at the address above.
          </p>
          <p style={p}>
            California residents: passing browsing activity to Meta for advertising counts as
            &ldquo;sharing&rdquo; under that state&rsquo;s law. Write to the address above to opt out, or block
            the cookies in your browser, which takes effect immediately.
          </p>

          <h2 style={h2}>Children</h2>
          <p style={p}>
            This site is meant for adults shopping for boats. We do not knowingly collect details from anyone
            under 16, and we will delete them if we learn we have.
          </p>

          <h2 style={h2}>If the business changes hands</h2>
          <p style={p}>
            If the show or this site is sold or merged, enquiry records may transfer to the new owner as part of
            that transaction. Any new owner would be bound by this policy until they tell you otherwise.
          </p>

          <h2 style={h2}>Changes</h2>
          <p style={p}>
            When what we do with your details changes, this page changes with it, and the date at the top moves.
          </p>

          <div style={{ borderTop: "1px solid rgba(20,46,81,.12)", marginTop: 40, paddingTop: 22 }}>
            <p style={{ ...p, margin: 0 }}>
              Questions about anything here:{" "}
              <a href="mailto:customerinquiry@acvirtualboatshow.com" style={{ color: "var(--linkblue)", fontWeight: 600 }}>
                customerinquiry@acvirtualboatshow.com
              </a>
            </p>
            <Link href="/" style={{ display: "inline-block", marginTop: 18, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--linkblue)" }}>
              <span aria-hidden>&larr;</span> Back to the show
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
