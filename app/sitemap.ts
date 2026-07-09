import type { MetadataRoute } from "next";
import { getSupabasePublic } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/site";
import { catPath } from "@/lib/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = getSupabasePublic();
  const [{ data: guides }, { data: cats }, { data: posts }, { data: listings }, { data: sellers }] = await Promise.all([
    sb.from("guides").select("slug,updated_at"),
    sb.from("categories").select("slug"),
    sb.from("blog_posts").select("slug,updated_at").eq("status", "published"),
    sb.from("listings").select("slug,updated_at"),
    sb.from("profiles").select("username").not("username", "is", null),
  ]);
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ilanlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/bakim-rehberi`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];
  (cats || []).forEach((c: any) => urls.push({ url: `${SITE_URL}${catPath(c.slug)}`, changeFrequency: "daily", priority: 0.8 }));
  (guides || []).forEach((g: any) => urls.push({ url: `${SITE_URL}/bakim-rehberi/${g.slug}`, lastModified: g.updated_at ? new Date(g.updated_at) : now, changeFrequency: "monthly", priority: 0.7 }));
  (posts || []).forEach((p: any) => urls.push({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "monthly", priority: 0.6 }));
  (listings || []).forEach((l: any) => urls.push({ url: `${SITE_URL}/ilan/${l.slug}`, lastModified: l.updated_at ? new Date(l.updated_at) : now, changeFrequency: "weekly", priority: 0.6 }));
  (sellers || []).forEach((s2: any) => urls.push({ url: `${SITE_URL}/magaza/${s2.username}`, changeFrequency: "weekly", priority: 0.5 }));
  return urls;
}
