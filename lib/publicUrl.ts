const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
function pub(bucket: string, path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, "")}`;
}
export const siteAssetUrl   = (p?: string | null) => pub("site-assets", p);
export const listingImageUrl = (p?: string | null) => pub("listing-images", p);
export const assetImg        = (p?: string | null) => pub("site-assets", p);
