import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ListingCard from "@/components/ListingCard";
import GuideCard from "@/components/GuideCard";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { catPath } from "@/lib/categories";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 600;

async function getGuide(slug: string) {
  const sb = getSupabasePublic();
  const { data } = await sb.from("guides").select("*").eq("slug", slug).maybeSingle();
  return data as any;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) return { title: "Rehber bulunamadı" };
  const url = SITE_URL + "/bakim-rehberi/" + g.slug;
  const title = g.seo_title || `${g.name} Bakımı — Terraryum, Isı, Beslenme`;
  const desc = g.seo_description || `${g.name} (${g.latin || ""}) bakım rehberi: terraryum kurulumu, sıcaklık ve nem, beslenme, sağlık ve sık sorulanlar.`;
  const ogImg = listingImageUrl(g.og_image || g.image_path);
  return {
    title, description: desc,
    alternates: { canonical: g.canonical_url || url },
    openGraph: { title: g.og_title || title, description: g.og_description || desc, url, type: "article", images: ogImg ? [ogImg] : undefined },
  };
}

const arr = (v: any): string[] => Array.isArray(v) ? v : (v ? [String(v)] : []);
const faqArr = (v: any): { q: string; a: string }[] =>
  Array.isArray(v) ? v.map((x: any) => ({ q: x.q ?? x.question ?? "", a: x.a ?? x.answer ?? "" })).filter((x) => x.q && x.a) : [];

export default async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) notFound();

  const url = SITE_URL + "/bakim-rehberi/" + g.slug;
  const img = listingImageUrl(g.image_path);
  const paras = arr(g.body);
  const tips = arr(g.tips);
  const faqs = faqArr(g.faq);

  const specs: [string, any][] = [
    ["Latince adı", g.latin], ["Seviye", g.level], ["Ömür", g.lifespan],
    ["Boyut", g.size], ["Yaşam alanı", g.habitat], ["Sıcaklık", g.temperature],
    ["Nem", g.humidity], ["Beslenme", g.diet],
  ];

  const graph: any[] = [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: g.seo_title || `${g.name} Bakımı`, mainEntityOfPage: url,
      description: g.seo_description || undefined,
      image: img ? [img] : undefined, dateModified: g.updated_at || undefined,
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Bakım rehberleri", item: SITE_URL + "/bakim-rehberi" },
        { "@type": "ListItem", position: 3, name: g.name, item: url },
      ],
    },
  ];
  if (faqs.length) graph.push({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  });

  // İç linkleme: ilgili ilanlar + kardeş rehberler
  const sb2 = getSupabasePublic();
  const { data: cat } = g.category_slug
    ? await sb2.from("categories").select("id,slug,name").eq("slug", g.category_slug).maybeSingle()
    : { data: null };
  let relListings: any[] = [];
  let sibGuides: any[] = [];
  if (cat) {
    const [{ data: ls }, { data: gs }] = await Promise.all([
      sb2.from("listings").select("slug,title,species,morph,sex,age_text,price,city,listing_images(storage_path,position)").eq("category_id", (cat as any).id).order("created_at", { ascending: false }).limit(4),
      sb2.from("guides").select("slug,name,latin,level,image_path").eq("category_slug", g.category_slug).neq("slug", g.slug).order("sort", { ascending: true }).limit(6),
    ]);
    relListings = (ls || []).map((l: any) => ({ ...l, cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null }));
    sibGuides = gs || [];
  }

  return (
    <>
      <Header />
      {graph.map((d, i) => <JsonLd key={i} data={d} />)}
      <main className="section" style={{ maxWidth: 900 }}>
        <div className="crumb">
          <a href="/">Ana sayfa</a><span>›</span>
          <a href="/bakim-rehberi">Bakım rehberleri</a><span>›</span><span>{g.name}</span>
        </div>
        <h1 style={{ fontSize: 34, letterSpacing: "-0.6px", marginBottom: 4 }}>{g.name} Bakımı</h1>
        {g.latin ? <p style={{ color: "var(--muted)", fontStyle: "italic", marginBottom: 18 }}>{g.latin}</p> : null}
        {img ? <img src={img} alt={`${g.name} bakımı`} style={{ width: "100%", maxHeight: 380, objectFit: "cover", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 22 }} /> : null}

        {g.legal_warning ? (
          <div style={{ background: "rgba(255,107,107,.10)", border: "1px solid rgba(255,107,107,.3)", borderRadius: 12, padding: "12px 16px", margin: "0 0 22px", color: "#ffd0d0", fontSize: 14 }}>
            ⚠ {g.legal_warning}
          </div>
        ) : null}

        {specs.some(([, v]) => v) ? (
          <table className="spec-table"><tbody>
            {specs.filter(([, v]) => v).map(([k, v]) => (<tr key={k}><td>{k}</td><td>{String(v)}</td></tr>))}
          </tbody></table>
        ) : null}

        {paras.map((p, i) => <p key={i} style={{ lineHeight: 1.75, margin: "0 0 14px", color: "#d4d4da", fontSize: 15.5 }}>{p}</p>)}

        {tips.length ? (
          <>
            <h2 style={{ fontSize: 22, margin: "26px 0 12px" }}>Bakım ipuçları</h2>
            <ul style={{ lineHeight: 1.8, color: "#d4d4da", paddingLeft: 20 }}>
              {tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        ) : null}

        {faqs.length ? (
          <>
            <h2 style={{ fontSize: 22, margin: "28px 0 12px" }}>Sık sorulan sorular</h2>
            <div className="faq">
              {faqs.map((f, i) => (
                <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </>
        ) : null}

        {cat ? (
          <section style={{ marginTop: 38 }}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 22 }}>Satılık {(cat as any).name}</h2>
              <Link href={catPath((cat as any).slug)}>Tümünü gör →</Link>
            </div>
            {relListings.length
              ? <div className="grid">{relListings.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
              : <p style={{ color: "var(--muted)" }}>Şu an bu türde ilan yok. <Link href={catPath((cat as any).slug)} style={{ color: "#fff" }}>Kategoriye göz at →</Link></p>}
          </section>
        ) : null}

        {sibGuides.length ? (
          <section style={{ marginTop: 30 }}>
            <div className="section-head" style={{ marginBottom: 16 }}><h2 style={{ fontSize: 22 }}>İlgili rehberler</h2></div>
            <div className="guide-grid">{sibGuides.map((gg: any) => <GuideCard key={gg.slug} g={gg} />)}</div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
