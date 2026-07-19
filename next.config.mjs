/** @type {import('next').NextConfig} */

const SUPA = "https://kbzlpwuyalvalskwojqw.supabase.co";
const SUPA_WS = "wss://kbzlpwuyalvalskwojqw.supabase.co";

// Content-Security-Policy — uygulama yalnızca kendi kaynaklarını + Supabase'i kullanır.
// Not: Uygulama yoğun inline style kullandığından style-src 'unsafe-inline' gereklidir.
// script-src 'unsafe-inline' Next.js hydration içindir; harici script yoktur. unsafe-eval YOK.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `img-src 'self' data: blob: ${SUPA} https://loremflickr.com`,
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPA} ${SUPA_WS}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kbzlpwuyalvalskwojqw.supabase.co" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
