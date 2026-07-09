const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export function siteAssetUrl(path?: string | null): string | null { return path ? `${BASE}/storage/v1/object/public/site-assets/${path}` : null; }
export function listingImageUrl(path?: string | null): string | null { return path ? `${BASE}/storage/v1/object/public/listing-images/${path}` : null; }
