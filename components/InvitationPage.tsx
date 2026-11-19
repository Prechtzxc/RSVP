"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { BrandLockup } from "./BrandLockup";

const RSVP_NUMBER = "+639171489572";
const SMS_MESSAGE = encodeURIComponent(
  "Good day! I would like to confirm my attendance at Eyelectric and Eyelectrix's 28th Anniversary and Thanksgiving Celebration on November 20, 2026. Thank you!",
);
const VENUE_MAP =
  "https://www.google.com/maps/search/?api=1&query=83QC%2BC2%20Bi%C3%B1an%2C%20Laguna%2C%20Philippines";
const PARKING_MAP =
  "https://www.google.com/maps/search/?api=1&query=83P8%2BP7%20Bi%C3%B1an%2C%20Laguna%2C%20Philippines";

const particles = [
  { left: "7%", top: "18%", size: 3, delay: 0.2, duration: 8 },
  { left: "16%", top: "72%", size: 2, delay: 1.4, duration: 10 },
  { left: "25%", top: "31%", size: 4, delay: 2.1, duration: 9 },
  { left: "34%", top: "84%", size: 2, delay: 0.8, duration: 11 },
  { left: "46%", top: "14%", size: 2, delay: 3.2, duration: 12 },
  { left: "57%", top: "76%", size: 3, delay: 1.7, duration: 8.5 },
  { left: "68%", top: "24%", size: 2, delay: 0.4, duration: 10.5 },
  { left: "77%", top: "61%", size: 4, delay: 2.7, duration: 9.5 },
  { left: "88%", top: "17%", size: 2, delay: 1.1, duration: 11.5 },
  { left: "94%", top: "78%", size: 3, delay: 3.6, duration: 8.8 },
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, children, dark = false }: { eyebrow: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`section-heading ${dark ? "section-heading-dark" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <div className="heading-ornament" aria-hidden="true">
        <span />
        <i>✦</i>
        <span />
      </div>
      <h2>{children}</h2>
    </div>
  );
}

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  phase: "before" | "event-day" | "live" | "event-day-ended" | "past";
};

function getCountdown(now: number): CountdownState {
  const eventStart = Date.parse("2026-11-20T15:00:00+08:00");
  const eventEnd = Date.parse("2026-11-20T19:00:00+08:00");
  const dayStart = Date.parse("2026-11-20T00:00:00+08:00");
  const dayEnd = Date.parse("2026-11-21T00:00:00+08:00");
  const remaining = Math.max(0, eventStart - now);

  let phase: CountdownState["phase"] = "before";
  if (now >= dayStart && now < eventStart) phase = "event-day";
  if (now >= eventStart && now <= eventEnd) phase = "live";
  if (now > eventEnd && now < dayEnd) phase = "event-day-ended";
  if (now >= dayEnd) phase = "past";

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    phase,
  };
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = now === null ? null : getCountdown(now);
  const phase = countdown?.phase;

  if (phase === "live") {
    return (
      <div className="event-message" role="status">
        <span className="live-dot" aria-hidden="true" />
        <p>The celebration is now underway.</p>
        <small>We are delighted to welcome you today.</small>
      </div>
    );
  }

  if (phase === "event-day-ended") {
    return (
      <div className="event-message" role="status">
        <p>Thank you for celebrating with us today.</p>
        <small>Your presence made this milestone even more meaningful.</small>
      </div>
    );
  }

  if (phase === "past") {
    return (
      <div className="event-message" role="status">
        <p>With gratitude for a memorable celebration.</p>
        <small>Thank you for being part of our 28th anniversary.</small>
      </div>
    );
  }

  const values = [
    [countdown?.days, "Days"],
    [countdown?.hours, "Hours"],
    [countdown?.minutes, "Minutes"],
    [countdown?.seconds, "Seconds"],
  ] as const;

  return (
    <div aria-live="polite">
      <p className="countdown-intro">
        {phase === "event-day" ? "Today is the day — we look forward to welcoming you." : "Counting down to our celebration"}
      </p>
      <div className="countdown-grid">
        {values.map(([value, label]) => (
          <div className="countdown-unit" key={label}>
            <strong>{value === undefined ? "--" : String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationCard({
  type,
  title,
  subtitle,
  plusCode,
  href,
  icon,
}: {
  type: string;
  title: string;
  subtitle: string;
  plusCode: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <article className="location-card">
      <div className="location-card-top">
        <div className="location-icon" aria-hidden="true">
          {icon}
        </div>
        <span>{type}</span>
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <div className="plus-code">
        <small>Plus code</small>
        <strong>{plusCode}</strong>
      </div>
      <a className="button button-navy location-button" href={href} target="_blank" rel="noreferrer">
        <Navigation size={18} aria-hidden="true" />
        Get Directions to {type === "Main Event Location" ? "Venue" : "Parking"}
      </a>
    </article>
  );
}

export function InvitationPage() {
  const reducedMotion = useReducedMotion();
  const heroEase = [0.22, 1, 0.36, 1] as const;

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Eyelectric & Eyelectrix 28th Anniversary and Thanksgiving Celebration",
    startDate: "2026-11-20T15:00:00+08:00",
    endDate: "2026-11-20T19:00:00+08:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Eyelectric, Inc. Home Office",
      address: {
        "@type": "PostalAddress",
        streetAddress: "3340 San Francisco Road, Brgy. Halang",
        addressLocality: "Biñan City",
        addressRegion: "Laguna",
        addressCountry: "PH",
      },
    },
    organizer: [
      { "@type": "Organization", name: "Eyelectric Incorporated", url: "https://eyelectricinc.com/" },
      { "@type": "Organization", name: "Eyelectrix Construction Corporation" },
    ],
    image: "/invitation-artwork.jpg",
    description:
      "A celebration of 28 years of God's faithfulness, our people's dedication, and the continued growth of Eyelectric, Inc. and Eyelectrix.",
  };

  return (
    <main>
      <a className="skip-link" href="#details">
        Skip to celebration details
      </a>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="hero-frame" aria-hidden="true">
          <span className="corner corner-tl" />
          <span className="corner corner-tr" />
          <span className="corner corner-bl" />
          <span className="corner corner-br" />
        </div>
        <div className="particles" aria-hidden="true">
          {particles.map((particle, index) => (
            <motion.i
              key={index}
              style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
              animate={
                reducedMotion
                  ? undefined
                  : { y: [0, -18, 0], opacity: [0.25, 0.85, 0.25], scale: [1, 1.3, 1] }
              }
              transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="hero-content page-shell">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -16 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: heroEase }}
          >
            <BrandLockup className="hero-lockup" />
          </motion.div>

          <motion.div
            className="hero-invitation-line"
            initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
            animate={reducedMotion ? undefined : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: heroEase }}
          >
            <span aria-hidden="true" />
            <p>You are cordially invited</p>
            <span aria-hidden="true" />
          </motion.div>

          <motion.div
            className="anniversary-composition"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: heroEase }}
          >
            <div className="anniversary-number" aria-label="28th">
              <span>28</span>
              <sup>th</sup>
            </div>
            <h1 id="hero-title">Anniversary</h1>
            <p className="thanksgiving-script">
              <small>and</small> Thanksgiving
            </p>
          </motion.div>

          <motion.div
            className="hero-event-meta"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: heroEase }}
          >
            <div>
              <CalendarDays size={18} aria-hidden="true" />
              <time dateTime="2026-11-20">November 20, 2026</time>
            </div>
            <i aria-hidden="true" />
            <div>
              <Clock3 size={18} aria-hidden="true" />
              <time dateTime="15:00">3:00 PM–7:00 PM</time>
            </div>
          </motion.div>

          <motion.div
            className="hero-venue"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.98, ease: heroEase }}
          >
            <div className="hero-venue-name">
              <MapPin size={17} aria-hidden="true" />
              <strong>Eyelectric, Inc. Home Office</strong>
            </div>
            <address>3340 San Francisco Road, Brgy. Halang, Biñan City</address>
          </motion.div>

          <motion.a
            className="button button-gold hero-button"
            href="#details"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.12, ease: heroEase }}
          >
            View Celebration Details
          </motion.a>
        </div>

        <div className="hero-scroll-cue" aria-hidden="true">
          <span />
        </div>
      </section>

      <section className="gratitude-section section-padding" aria-labelledby="gratitude-title">
        <div className="page-shell narrow-shell">
          <Reveal>
            <SectionHeading eyebrow="A legacy held in gratitude">
              <span id="gratitude-title">28 Years of Faithfulness, Dedication &amp; Growth</span>
            </SectionHeading>
          </Reveal>

          <Reveal className="invitation-quote" delay={0.08}>
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <blockquote>
              We are pleased to invite you to join us as we celebrate 28 years of God&apos;s faithfulness, our
              people&apos;s dedication, and the continued growth of both Eyelectric, Inc and Eyelectrix.
            </blockquote>
          </Reveal>

          <div className="gratitude-themes">
            {[
              ["Faithfulness", "With gratitude for the grace that has sustained the journey."],
              ["Dedication", "Honoring the people whose commitment makes every year meaningful."],
              ["Continued Growth", "Looking ahead with purpose, partnership, and hope."],
            ].map(([title, copy], index) => (
              <Reveal className="gratitude-theme" delay={index * 0.08} key={title}>
                <span className="theme-symbol" aria-hidden="true">
                  {index === 0 ? "✦" : index === 1 ? "◇" : "❈"}
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="details" className="details-section section-padding" aria-labelledby="details-title">
        <div className="details-pattern" aria-hidden="true" />
        <div className="page-shell details-shell">
          <Reveal>
            <SectionHeading eyebrow="Save the date" dark>
              <span id="details-title">The Celebration Awaits</span>
            </SectionHeading>
          </Reveal>

          <div className="details-layout">
            <Reveal className="event-facts">
              <div className="event-fact date-fact">
                <div className="date-emblem" aria-hidden="true">
                  <strong>20</strong>
                  <span>Nov</span>
                </div>
                <div>
                  <small>Date</small>
                  <h3>Friday, November 20, 2026</h3>
                </div>
              </div>
              <div className="event-fact">
                <Clock3 aria-hidden="true" />
                <div>
                  <small>Time</small>
                  <h3>3:00 PM–7:00 PM</h3>
                  <p>Philippine Standard Time</p>
                </div>
              </div>
              <div className="event-fact">
                <MapPin aria-hidden="true" />
                <div>
                  <small>Venue</small>
                  <h3>Eyelectric, Inc. Home Office</h3>
                  <p>3340 San Francisco Road, Brgy. Halang, Biñan City</p>
                </div>
              </div>
              <a className="button button-outline calendar-button" href="/eyelectric-28th-anniversary.ics" download>
                <CalendarDays size={19} aria-hidden="true" />
                Add to Calendar
              </a>
            </Reveal>

            <Reveal className="countdown-panel" delay={0.12}>
              <div className="countdown-flourish" aria-hidden="true">✦</div>
              <Countdown />
              <p className="countdown-date">20 · 11 · 2026</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="rsvp-section section-padding" aria-labelledby="rsvp-title">
        <div className="page-shell narrow-shell">
          <Reveal>
            <SectionHeading eyebrow="Your presence is a gift">
              <span id="rsvp-title">We Would Be Honored by Your Presence</span>
            </SectionHeading>
          </Reveal>
          <Reveal className="rsvp-content" delay={0.08}>
            <p>Kindly confirm your attendance and join us for this special celebration.</p>
            <a className="rsvp-number" href={`tel:${RSVP_NUMBER}`} aria-label="Call 0917 148 9572">
              <small>RSVP</small>
              0917-148-9572
            </a>
            <div className="rsvp-actions">
              <a className="button button-navy" href={`tel:${RSVP_NUMBER}`}>
                <Phone size={19} aria-hidden="true" />
                Call to RSVP
              </a>
              <a className="button button-outline-navy" href={`sms:${RSVP_NUMBER}?body=${SMS_MESSAGE}`}>
                <MessageCircle size={19} aria-hidden="true" />
                Text to RSVP
              </a>
            </div>
            <small className="contact-note">Confirmation is handled directly with the organizers by phone or SMS.</small>
          </Reveal>
        </div>
      </section>

      <section className="location-section section-padding" aria-labelledby="location-title">
        <div className="page-shell">
          <Reveal>
            <SectionHeading eyebrow="Arrival & parking">
              <span id="location-title">Find Your Way to the Celebration</span>
            </SectionHeading>
          </Reveal>

          <div className="location-grid">
            <Reveal>
              <LocationCard
                type="Main Event Location"
                title="Eyelectric, Inc. Home Office"
                subtitle="3340 San Francisco Road, Brgy. Halang, Biñan City, Laguna"
                plusCode="83QC+C2, Biñan, Laguna"
                href={VENUE_MAP}
                icon={<MapPin size={24} />}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <LocationCard
                type="Additional Parking"
                title="Designated Guest Parking"
                subtitle="Overflow parking area with guest transport service to the venue"
                plusCode="83P8+P7, Biñan, Laguna"
                href={PARKING_MAP}
                icon={<CarFront size={24} />}
              />
            </Reveal>
          </div>

          <Reveal className="parking-reminder" delay={0.08}>
            <CarFront size={22} aria-hidden="true" />
            <p>
              Due to limited parking space, guests may use the designated additional parking area. A service vehicle
              will transport guests to the Eyelectric office.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="closing-section section-padding" aria-labelledby="closing-title">
        <div className="closing-radiance" aria-hidden="true" />
        <div className="closing-frame" aria-hidden="true" />
        <div className="page-shell closing-content">
          <Reveal>
            <BrandLockup className="closing-lockup" />
          </Reveal>
          <Reveal delay={0.06}>
            <span className="closing-kicker">28th Anniversary &amp; Thanksgiving</span>
            <h2 id="closing-title">Together in Gratitude.<br />Forward in Hope.</h2>
            <p>Let us come together in gratitude for the past, and with hope for the years ahead.</p>
          </Reveal>
          <Reveal className="closing-date" delay={0.1}>
            <span aria-hidden="true" />
            <time dateTime="2026-11-20">November 20, 2026</time>
            <span aria-hidden="true" />
          </Reveal>
          <Reveal delay={0.12}>
            <a className="button button-gold" href={`tel:${RSVP_NUMBER}`}>
              <Phone size={19} aria-hidden="true" />
              Call to RSVP
            </a>
          </Reveal>
          <div className="footer-ornament" aria-hidden="true">
            <span />
            <i>❈</i>
            <span />
          </div>
          <p className="copyright">Eyelectric Incorporated · Eyelectrix Construction Corporation</p>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
    </main>
  );
}
