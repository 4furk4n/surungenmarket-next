import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { catPath } from "@/lib/categories";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Tüm İlanlar — Satılık ve Sahiplendirilecek Egzotik Hayvanlar",
  description: "Sürüngen, amfibi, egzotik memeli ve daha fazlası. Güvenilir yetiştiricilerden satılık ve ücretsiz sahiplendirme ilanları.",
  alternates: { canonical: "/ilanlar" },
};

export default async function AllListings() {
  const sb = getSupabasePublic();
  const [{ data: cats }, { data: listings }] = await Promise.all([
    sb.from("categories").select("slug,name,sort").order("sort", { ascending: true }),
    sb.from("listings").select("slug,title,species,morph,sex,age_text,price,city,category_id,created_at,listing_images(storage_path,position)").order("created_at", { ascending: false }).limit(48),
  ]);
  const rows = (listings || []).map((l: any) => ({
    ...l,
    cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null,
  }));

  return (
    <>
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Tüm ilanlar", url: SITE_URL + "/ilanlar", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } }} />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>İlanlar</span></div>
        <div className="section-head"><h2>Tüm İlanlar</h2></div>
        <div className="filters">
          {(cats || []).map((c: any) => (
            <Link key={c.slug} className="chip" href={catPath(c.slug)}>{c.name}</Link>
          ))}
        </div>
        {rows.length ? (
          <div className="grid">{rows.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
        ) : (
          <p style={{ color: "var(--muted)", padding: "24px 0" }}>Henüz ilan yok. İlk ilanı sen ver!</p>
        )}
      </main>
      <Footer />
    </>
  );
}
