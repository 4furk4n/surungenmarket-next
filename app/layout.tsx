import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const DESC = "Sürüngenden amfibiye, güvenilir yetiştiricilerden binlerce ilan. Satın al, sat ya da ücretsiz sahiplendir.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME + " — Türkiye'nin egzotik hayvan pazarı", template: "%s · " + SITE_NAME },
  description: DESC,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "tr_TR", url: SITE_URL, siteName: SITE_NAME, title: SITE_NAME, description: DESC },
  robots: { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
