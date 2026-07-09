import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { catPath } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 60;

async function getListing(slug: string) {
  const sb = getSupabasePublic();
  const { data } = await sb.from("listings")
    .select("*, listing_images(storage_path,position), categories(slug,name), profiles(username,city,avatar_url)")
    .eq("slug", slug).maybeSingle();
  return data as any;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l) return { title: "İlan bulunamadı" };
  const url = SITE_URL + "/ilan/" + l.slug;
  const imgs = (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
  const cover = listingImageUrl(imgs[0]?.storage_path);
  const price = (!l.price || l.price <= 0) ? "Ücretsiz sahiplendirme" : formatPrice(l.price);
  const title = `${l.title}${l.city ? " · " + l.city : ""}`;
  const desc = (l.description ? String(l.description).slice(0, 155) : `${l.title} — ${price}. ${l.species || ""} ${l.morph || ""}`).trim();
  return {
    title, description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: "website", images: cover ? [cover] : undefined },
  };
}

export default async function ListingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l) notFound();

  const url = SITE_URL + "/ilan/" + l.slug;
  const imgs = (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
  const cover = listingImageUrl(imgs[0]?.storage_path);
  const seller = l.profiles || {};
  const cat = l.categories || {};
  const free = !l.price || l.price <= 0;

  const specs: [string, any][] = [
    ["Tür", l.species], ["Morph", l.morph], ["Cinsiyet", l.sex === "m" ? "Erkek" : l.sex === "f" ? "Dişi" : l.sex],
    ["Yaş", l.age_text], ["Doğum yılı", l.birth_year], ["Şehir", l.city], ["Kategori", cat.name],
  ];

  const product = {
    "@context": "https://schema.org", "@type": "Product",
    name: l.title, description: l.description || undefined,
    image: imgs.map((im: any) => listingImageUrl(im.storage_path)).filter(Boolean),
    category: cat.name || undefined,
    offers: {
      "@type": "Offer", url, priceCurrency: "TRY",
      price: free ? 0 : l.price, availability: "https://schema.org/InStock",
      seller: { "@type": "Person", name: seller.username || "Satıcı" },
    },
  };
  const crumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "İlanlar", item: SITE_URL + "/ilanlar" },
      { "@type": "ListItem", position: 3, name: l.title, item: url },
    ],
  };

  return (
    <>
      <Header />
      <JsonLd data={product} /><JsonLd data={crumb} />
      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 32px 64px" }}>
        <div className="crumb">
          <a href="/">Ana sayfa</a><span>›</span><a href="/ilanlar">İlanlar</a><span>›</span>
          {cat.name && cat.slug ? <><a href={catPath(cat.slug)}>{cat.name}</a><span>›</span></> : null}
          <span>{l.title}</span>
        </div>
        <div className="d-grid">
          <div>
            <div className="d-photo">
              {cover ? <img src={cover} alt={l.title} style={{ width: "100%", display: "block" }} />
                     : <div style={{ height: 360, background: "var(--bg-3)" }} />}
            </div>
            {imgs.length > 1 ? (
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {imgs.slice(0, 6).map((im: any, i: number) => (
                  <img key={i} src={listingImageUrl(im.storage_path) || ""} alt={`${l.title} ${i + 1}`} loading="lazy"
                       style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                ))}
              </div>
            ) : null}
            {l.description ? (
              <div style={{ marginTop: 22 }}>
                <h2 style={{ fontSize: 20, marginBottom: 10 }}>Açıklama</h2>
                <p style={{ lineHeight: 1.75, color: "#d4d4da", whiteSpace: "pre-wrap" }}>{l.description}</p>
              </div>
            ) : null}
          </div>
          <div>
            <h1 style={{ fontSize: 26, letterSpacing: "-0.4px", marginBottom: 8 }}>{l.title}</h1>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{formatPrice(l.price)}</div>
            <table className="spec-table" style={{ margin: "0 0 18px" }}><tbody>
              {specs.filter(([, v]) => v).map(([k, v]) => (<tr key={k}><td>{k}</td><td>{String(v)}</td></tr>))}
            </tbody></table>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-3)", overflow: "hidden" }}>
                {seller.avatar_url ? <img src={seller.avatar_url} alt={seller.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{seller.username || "Satıcı"}</div>
                {seller.city ? <div style={{ fontSize: 12, color: "var(--muted)" }}>{seller.city}</div> : null}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              <button className="btn btn-primary">💬 Mesaj gönder</button>
              {l.whatsapp ? <a className="btn btn-ghost" href={`https://wa.me/${String(l.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="nofollow noopener">WhatsApp'tan yaz</a> : null}
              {l.instagram ? <a className="btn btn-ghost" href={`https://instagram.com/${String(l.instagram).replace(/^@/, "")}`} target="_blank" rel="nofollow noopener">Instagram · @{String(l.instagram).replace(/^@/, "")}</a> : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
