export const CAT_SEO: Record<string, string> = { yilan:"yilanlar", kertenkele:"geckolar", kaplumbaga:"kaplumbagalar", amfibi:"amfibiler", eklem:"eklembacaklilar", memeli:"egzotik-memeliler", kus:"egzotik-kuslar" };
export const SEO_CAT: Record<string, string> = Object.fromEntries(Object.entries(CAT_SEO).map(([db, seo]) => [seo, db]));
export const catPath = (dbSlug: string) => `/ilanlar/${CAT_SEO[dbSlug] || dbSlug}`;
export const catFromSeo = (seo: string) => SEO_CAT[seo] || seo;
