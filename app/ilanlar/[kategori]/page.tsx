import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { catFromSeo, CAT_SEO } from "@/lib/categories";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 120;

async function getCat(seo: string) {
  const dbSlug = catFromSeo(seo);
  const sb = getSupabasePublic();
  const { data: cat } = await sb.from("categories").select("*").eq("slug", dbSlug).maybeSingle();
  return { cat: cat as any, dbSlug };
}

export async function generateMetadata({ params }: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const { kategori } = await params;
  const { cat } = await getCat(kategori);
  const name = cat?.name || kategori;
  const url = SITE_URL + "/ilanlar/" + kategori;
  return {
    title: `${name} — Satılık ve Sahiplendirme İlanları`,
    description: `${name} kategorisinde güncel satılık ve ücretsiz sahiplendirme ilanları. Güvenilir yetiştiriciler, morph çeşitleri ve fiyatlar.`,
    alternates: { canonical: url },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  if (!CAT_SEO[catFromSeo(kategori)]) { /* geçersiz seo slug yine de deneriz */ }
  const { cat } = await getCat(kategori);
  if (!cat) notFound();

  const sb = getSupabasePublic();
  const { data: listings } = await sb.from("listings")
    .select("slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)")
    .eq("category_id", cat.id).order("created_at", { ascending: false });
  const rows = (listings || []).map((l: any) => ({
    ...l, cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null,
  }));

  const url = SITE_URL + "/ilanlar/" + kategori;
  const graph = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: cat.name, url, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "İlanlar", item: SITE_URL + "/ilanlar" },
      { "@type": "ListItem", position: 3, name: cat.name, item: url },
    ] },
  ];

  return (
    <>
      <Header />
      {graph.map((d, i) => <JsonLd key={i} data={d} />)}
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><a href="/ilanlar">İlanlar</a><span>›</span><span>{cat.name}</span></div>
        <div className="section-head"><h2>{cat.name}</h2></div>
        <p style={{ color: "var(--muted)", marginBottom: 18 }}>
          Almadan önce türün ihtiyaçlarını öğren: <a href="/bakim-rehberi" style={{ color: "#fff", textDecoration: "underline" }}>{cat.name} bakım rehberleri →</a>
        </p>
        {rows.length ? (
          <div className="grid">{rows.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
        ) : (
          <p style={{ color: "var(--muted)", padding: "24px 0" }}>Bu kategoride henüz ilan yok.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
