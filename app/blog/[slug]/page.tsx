import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

async function getPost(slug: string) {
  const sb = getSupabasePublic();
  const { data } = await sb.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data as any;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return { title: "Yazı bulunamadı" };
  const url = SITE_URL + "/blog/" + p.slug;
  const title = p.seo_title || p.title;
  const desc = p.seo_description || p.excerpt || "";
  const ogImg = listingImageUrl(p.og_image || p.cover_path);
  return {
    title, description: desc,
    alternates: { canonical: p.canonical_url || url },
    openGraph: { title: p.og_title || title, description: p.og_description || desc, url, type: "article", images: ogImg ? [ogImg] : undefined },
  };
}

const arr = (v: any): string[] => Array.isArray(v) ? v.map((x) => typeof x === "string" ? x : (x?.text ?? "")) : (v ? [String(v)] : []);
const faqArr = (v: any) => Array.isArray(v) ? v.map((x: any) => ({ q: x.q ?? x.question ?? "", a: x.a ?? x.answer ?? "" })).filter((x: any) => x.q && x.a) : [];

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) notFound();

  const url = SITE_URL + "/blog/" + p.slug;
  const img = listingImageUrl(p.cover_path);
  const paras = arr(p.body);
  const faqs = faqArr(p.faq);

  const graph: any[] = [
    { "@context": "https://schema.org", "@type": "Article", headline: p.seo_title || p.title, mainEntityOfPage: url,
      description: p.seo_description || p.excerpt || undefined, image: img ? [img] : undefined,
      datePublished: p.published_at || undefined, dateModified: p.updated_at || undefined,
      author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: SITE_URL + "/blog" },
      { "@type": "ListItem", position: 3, name: p.title, item: url },
    ] },
  ];
  if (faqs.length) graph.push({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f: any) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

  return (
    <>
      <Header />
      {graph.map((d, i) => <JsonLd key={i} data={d} />)}
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><a href="/blog">Blog</a><span>›</span><span>{p.title}</span></div>
        <h1 style={{ fontSize: 34, letterSpacing: "-0.6px", marginBottom: 16 }}>{p.title}</h1>
        {img ? <img src={img} alt={p.title} style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 22 }} /> : null}
        {paras.map((par, i) => <p key={i} style={{ lineHeight: 1.8, margin: "0 0 15px", color: "#d4d4da", fontSize: 16 }}>{par}</p>)}
        {faqs.length ? (
          <><h2 style={{ fontSize: 22, margin: "28px 0 12px" }}>Sık sorulan sorular</h2>
          <div className="faq">{faqs.map((f: any, i: number) => <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div></>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
