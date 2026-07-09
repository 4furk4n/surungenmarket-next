import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import FollowButton from "@/components/FollowButton";
import ReviewForm from "@/components/ReviewForm";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 120;

async function getProfile(username: string) {
  const sb = getSupabasePublic();
  const { data } = await sb.from("profiles").select("id,username,city,avatar_url,role,created_at").eq("username", username).maybeSingle();
  return data as any;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const p = await getProfile(username);
  if (!p) return { title: "Mağaza bulunamadı" };
  const url = `${SITE_URL}/magaza/${p.username}`;
  return {
    title: `${p.username} — Satıcı Profili ve İlanları`,
    description: `${p.username} satıcısının ${p.city ? p.city + " " : ""}egzotik hayvan ilanları ve değerlendirmeleri.`,
    alternates: { canonical: url },
  };
}

export default async function StorePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const p = await getProfile(username);
  if (!p) notFound();

  const sb = getSupabasePublic();
  const [{ data: listings }, { data: reviews }, { count: followers }] = await Promise.all([
    sb.from("listings").select("slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)").eq("user_id", p.id).order("created_at", { ascending: false }),
    sb.from("reviews").select("id,rating,body,author_id,created_at").eq("seller_id", p.id).order("created_at", { ascending: false }),
    sb.from("follows").select("*", { count: "exact", head: true }).eq("seller_id", p.id),
  ]);
  const rows = (listings || []).map((l: any) => ({ ...l, cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null }));
  const revs = reviews || [];
  const avg = revs.length ? (revs.reduce((s: number, r: any) => s + (r.rating || 0), 0) / revs.length) : 0;
  const url = `${SITE_URL}/magaza/${p.username}`;

  return (
    <>
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Person", name: p.username, url }, url }} />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><a href="/ilanlar">İlanlar</a><span>›</span><span>{p.username}</span></div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "8px 0 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "var(--bg-3)", flexShrink: 0 }}>
            {p.avatar_url ? <img src={listingImageUrl(p.avatar_url) || p.avatar_url} alt={p.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>{p.username}</h1>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              {p.city ? p.city + " · " : ""}{rows.length} ilan · {followers || 0} takipçi
              {revs.length ? <> · ★ {avg.toFixed(1)} ({revs.length})</> : null}
            </div>
          </div>
          <FollowButton sellerId={p.id} />
        </div>

        <div className="section-head"><h2>İlanlar</h2></div>
        {rows.length ? <div className="grid">{rows.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
                     : <p style={{ color: "var(--muted)", padding: "18px 0" }}>Bu satıcının aktif ilanı yok.</p>}

        <div className="section-head" style={{ marginTop: 36 }}><h2>Değerlendirmeler</h2></div>
        {revs.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
            {revs.map((r: any) => (
              <div key={r.id} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ color: "#ffce54", fontSize: 14 }}>{"★".repeat(r.rating || 0)}<span style={{ color: "var(--border-2)" }}>{"★".repeat(5 - (r.rating || 0))}</span></div>
                {r.body ? <p style={{ marginTop: 6, color: "#d4d4da", fontSize: 14, lineHeight: 1.6 }}>{r.body}</p> : null}
              </div>
            ))}
          </div>
        ) : <p style={{ color: "var(--muted)" }}>Henüz değerlendirme yok.</p>}
        <ReviewForm sellerId={p.id} />
      </main>
      <Footer />
    </>
  );
}
