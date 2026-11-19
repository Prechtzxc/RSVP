import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eyelectric-28th-anniversary.mutedcrocus16.chatgpt.site"),
  title: "28th Anniversary & Thanksgiving | Eyelectric & Eyelectrix",
  description:
    "You are cordially invited to the 28th Anniversary and Thanksgiving Celebration of Eyelectric Incorporated and Eyelectrix Construction Corporation on November 20, 2026.",
  keywords: [
    "Eyelectric",
    "Eyelectrix",
    "28th Anniversary",
    "Thanksgiving Celebration",
    "Biñan Laguna",
  ],
  authors: [{ name: "Eyelectric Incorporated" }],
  creator: "Eyelectric Incorporated",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_PH",
    title: "Eyelectric 28th Anniversary & Thanksgiving",
    description:
      "Join us as we celebrate 28 years of faithfulness, dedication, and continued growth.",
    images: [
      {
        url: "/invitation-artwork.jpg",
        width: 1536,
        height: 1024,
        alt: "Eyelectric and Eyelectrix 28th Anniversary and Thanksgiving invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eyelectric 28th Anniversary & Thanksgiving",
    description: "November 20, 2026 · 3:00 PM–7:00 PM · Biñan, Laguna",
    images: ["/invitation-artwork.jpg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#061a35",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
