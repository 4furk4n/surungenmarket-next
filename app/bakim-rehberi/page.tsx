import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideCard from "@/components/GuideCard";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Bakım Rehberleri — Sürüngen ve Egzotik Hayvan Bakımı",
  description: "Leopar gecko, ball python, sakallı ejder, aksolotl ve daha fazlası için tür bazlı bakım rehberleri: terraryum, ısı, nem, beslenme ve sağlık.",
  alternates: { canonical: "/bakim-rehberi" },
  openGraph: { title: "Bakım Rehberleri", description: "Tür bazlı egzotik hayvan bakım rehberleri.", url: SITE_URL + "/bakim-rehberi" },
};

export default async function GuidesIndex() {
  const sb = getSupabasePublic();
  const [{ data: cats }, { data: guides }] = await Promise.all([
    sb.from("categories").select("slug,name,sort").order("sort", { ascending: true }),
    sb.from("guides").select("slug,name,latin,level,image_path,category_slug,sort").order("sort", { ascending: true }),
  ]);

  const all = guides || [];
  const groups = (cats || [])
    .map((c: any) => ({ cat: c, items: all.filter((g: any) => g.category_slug === c.slug) }))
    .filter((grp: any) => grp.items.length > 0);
  const grouped = new Set((cats || []).map((c: any) => c.slug));
  const others = all.filter((g: any) => !g.category_slug || !grouped.has(g.category_slug));

  return (
    <>
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Bakım Rehberleri", url: SITE_URL + "/bakim-rehberi", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } }} />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Bakım rehberleri</span></div>
        <div className="section-head"><h2>Bakım Rehberleri</h2></div>
        <p style={{ color: "var(--muted)", maxWidth: 640, lineHeight: 1.6, marginBottom: 8 }}>
          Sahiplenmeden önce türün ihtiyaçlarını öğren: doğru terraryum, ısı ve nem aralığı, beslenme ve sık görülen sağlık sorunları.
        </p>

        {groups.map((grp: any) => (
          <section key={grp.cat.slug} style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{grp.cat.name}</h3>
            <div className="guide-grid">
              {grp.items.map((g: any) => <GuideCard key={g.slug} g={g} />)}
            </div>
          </section>
        ))}

        {others.length ? (
          <section style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Diğer</h3>
            <div className="guide-grid">{others.map((g: any) => <GuideCard key={g.slug} g={g} />)}</div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
