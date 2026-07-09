import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Egzotik Hayvan Bakımı, İpuçları ve Rehberler",
  description: "Sürüngen ve egzotik hayvanlarla ilgili problem çözümleri, beslenme, sağlık ve satın alma rehberleri.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const sb = getSupabasePublic();
  const { data: posts } = await sb.from("blog_posts")
    .select("slug,title,excerpt,cover_path,published_at")
    .eq("status", "published").order("published_at", { ascending: false });
  const list = posts || [];

  return (
    <>
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Blog", name: SITE_NAME + " Blog", url: SITE_URL + "/blog" }} />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Blog</span></div>
        <div className="section-head"><h2>Blog</h2></div>
        {list.length ? (
          <div className="guide-grid">
            {list.map((p: any) => {
              const img = listingImageUrl(p.cover_path);
              return (
                <Link key={p.slug} className="g-card" href={`/blog/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div className="gp">{img ? <img src={img} alt={p.title} loading="lazy" /> : <div style={{ width: "100%", height: "100%", background: "var(--bg-3)" }} />}</div>
                  <div className="gb"><div className="gn">{p.title}</div>{p.excerpt ? <div className="gl" style={{ fontStyle: "normal" }}>{p.excerpt}</div> : null}</div>
                </Link>
              );
            })}
          </div>
        ) : <p style={{ color: "var(--muted)", padding: "24px 0" }}>Yazılar yakında.</p>}
      </main>
      <Footer />
    </>
  );
}
