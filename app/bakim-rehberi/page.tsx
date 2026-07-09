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
  const { data: guides } = await sb.from("guides")
    .select("slug,name,latin,level,image_path,sort")
    .order("sort", { ascending: true });

  const list = guides || [];
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: "Bakım Rehberleri", url: SITE_URL + "/bakim-rehberi",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <Header />
      <JsonLd data={jsonLd} />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Bakım rehberleri</span></div>
        <div className="section-head"><h2>Bakım Rehberleri</h2></div>
        <p style={{ color: "var(--muted)", maxWidth: 640, lineHeight: 1.6, marginBottom: 8 }}>
          Sahiplenmeden önce türün ihtiyaçlarını öğren: doğru terraryum, ısı ve nem aralığı, beslenme ve sık görülen sağlık sorunları.
        </p>
        <div className="guide-grid">
          {list.map((g: any) => <GuideCard key={g.slug} g={g} />)}
        </div>
        {list.length === 0 ? <p style={{ color: "var(--muted)" }}>Rehberler yakında.</p> : null}
      </main>
      <Footer />
    </>
  );
}
