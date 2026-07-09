/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { remotePatterns: [
    { protocol: "https", hostname: "kbzlpwuyalvalskwojqw.supabase.co" },
    { protocol: "https", hostname: "loremflickr.com" }
  ] }
};
export default nextConfig;
