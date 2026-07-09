import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Mağazalar — Güvenilir Satıcılar ve Yetiştiriciler",
  description: "SürüngenMarket'teki satıcı ve yetiştiricileri keşfet, ilanlarına ve değerlendirmelerine göz at.",
  alternates: { canonical: "/magazalar" },
};

export default async function Magazalar() {
  const sb = getSupabasePublic();
  const { data: listings } = await sb.from("listings").select("user_id");
  const counts: Record<string, number> = {};
  (listings || []).forEach((l: any) => { if (l.user_id) counts[l.user_id] = (counts[l.user_id] || 0) + 1; });
  const ids = Object.keys(counts);
  const { data: profs } = ids.length
    ? await sb.from("profiles").select("id,username,city,avatar_url").in("id", ids)
    : { data: [] as any[] };

  const stores = (profs || []).sort((a: any, b: any) => (counts[b.id] || 0) - (counts[a.id] || 0));

  return (
    <>
      <Header />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Mağazalar</span></div>
        <div className="section-head"><h2>Mağazalar</h2></div>
        {stores.length ? (
          <div className="store-grid">
            {stores.map((s: any) => (
              <Link key={s.id} href={`/magaza/${s.username}`} className="g-card" style={{ textDecoration: "none", color: "inherit", padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: "var(--bg-3)", flexShrink: 0 }}>
                  {s.avatar_url ? <img src={listingImageUrl(s.avatar_url) || ""} alt={s.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{s.username}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.city ? s.city + " · " : ""}{counts[s.id]} ilan</div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p style={{ color: "var(--muted)", padding: "18px 0" }}>Henüz mağaza yok.</p>}
      </main>
      <Footer />
    </>
  );
}
