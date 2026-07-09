import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { getSupabasePublic } from "@/lib/supabase/public";
import { siteAssetUrl } from "@/lib/publicUrl";
import { catPath } from "@/lib/categories";

export const revalidate = 60;

export default async function Home() {
  const sb = getSupabasePublic();
  const [{ data: cats }, { data: assets }, { data: listings }] = await Promise.all([
    sb.from("categories").select("slug,name,sort").order("sort", { ascending: true }),
    sb.from("site_assets").select("key,storage_path"),
    sb.from("listings").select("slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)").order("created_at", { ascending: false }).limit(12),
  ]);

  const map: Record<string, string> = {};
  (assets || []).forEach((a: any) => { if (a.key) map[a.key] = a.storage_path; });
  const heroUrl = siteAssetUrl(map["hero"]);
  const rows = (listings || []).map((l: any) => ({
    ...l, cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null,
  }));

  return (
    <>
      <Header />
      <div id="home">
        <section className="hero">
          <div className="hero-inner">
            <div>
              <h1>Türkiye&apos;nin egzotik<br />hayvan pazarı</h1>
              <p>Sürüngenden amfibiye, güvenilir yetiştiricilerden binlerce ilan. Satın al, sat ya da ücretsiz sahiplendir.</p>
              <div className="actions">
                <Link href="/ilanlar"><button className="btn btn-primary">İlanlara göz at</button></Link>
                <button className="btn btn-ghost">Hesap oluştur</button>
              </div>
            </div>
            <div className="hero-img">
              {heroUrl ? <img src={heroUrl} alt="Egzotik hayvanlar" /> : <div style={{ height: 360, background: "var(--bg-3)" }} />}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Kategoriler</h2><Link href="/bakim-rehberi">Bakım rehberleri →</Link></div>
          <div className="cats">
            {(cats || []).map((c: any) => {
              const img = siteAssetUrl(map["cat_" + c.slug]);
              return (
                <Link className="cat" href={catPath(c.slug)} key={c.slug}>
                  <div className="thumb">
                    {img ? <img src={img} alt={`${c.name} ilanları`} loading="lazy" />
                         : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 140, color: "var(--muted)", fontSize: 13 }}>Görsel yakında</div>}
                  </div>
                  <div className="name">{c.name}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section" id="ilanlar">
          <div className="section-head"><h2>Güncel ilanlar</h2><Link href="/ilanlar">Tümünü gör →</Link></div>
          {rows.length ? (
            <div className="grid">{rows.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
          ) : (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "44px 0" }}>Henüz yayında ilan yok. Üye olup ilk ilanı verebilirsin.</p>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
