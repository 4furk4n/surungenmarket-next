import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import FollowButton from "@/components/FollowButton";
import ReviewForm from "@/components/ReviewForm";
import StoreTabs from "@/components/StoreTabs";
import JsonLd from "@/components/JsonLd";
import { getSupabasePublic } from "@/lib/supabase/public";
import { listingImageUrl } from "@/lib/publicUrl";
import { SITE_URL } from "@/lib/site";

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
    description: `${p.username} satıcısının ${p.city ? p.city + " " : ""}egzotik hayvan ilanları, değerlendirmeleri ve mağaza bilgileri.`,
    alternates: { canonical: url },
  };
}

const Stat = ({ big, small }: { big: React.ReactNode; small: string }) => (
  <div style={{ flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{big}</div>
    <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{small}</div>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 11px", borderRadius: 99, background: "rgba(255,255,255,.08)", color: "#d8d8de", border: "1px solid var(--border-2)" }}>{children}</span>
);

export default async function StorePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const p = await getProfile(username);
  if (!p) notFound();

  const sb = getSupabasePublic();
  const [{ data: listings }, { data: reviews }, { count: followers }] = await Promise.all([
    sb.from("listings").select("slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)").eq("user_id", p.id).order("created_at", { ascending: false }),
    sb.from("reviews").select("id,rating,body,created_at").eq("seller_id", p.id).order("created_at", { ascending: false }),
    sb.from("follows").select("*", { count: "exact", head: true }).eq("seller_id", p.id),
  ]);
  const rows = (listings || []).map((l: any) => ({ ...l, cover: (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null }));
  const revs = reviews || [];
  const avg = revs.length ? revs.reduce((s: number, r: any) => s + (r.rating || 0), 0) / revs.length : 0;
  const since = p.created_at ? new Date(p.created_at).getFullYear() : null;
  const url = `${SITE_URL}/magaza/${p.username}`;
  const avatar = listingImageUrl(p.avatar_url);

  const shop = rows.length
    ? <div className="grid">{rows.map((l: any) => <ListingCard key={l.slug} l={l} />)}</div>
    : <p style={{ color: "var(--muted)", padding: "18px 0" }}>Bu satıcının aktif ilanı yok.</p>;

  const about = (
    <div style={{ maxWidth: 640, color: "#d4d4da", lineHeight: 1.75 }}>
      <p style={{ marginBottom: 12 }}>
        <b>{p.username}</b>, SürüngenMarket üzerinde {since ? `${since} yılından beri ` : ""}{p.city ? `${p.city} merkezli ` : ""}
        egzotik hayvan ilanları paylaşan bir satıcıdır.
      </p>
      <table className="spec-table" style={{ margin: "8px 0" }}><tbody>
        {p.city ? <tr><td>Konum</td><td>{p.city}</td></tr> : null}
        {since ? <tr><td>Üyelik</td><td>{since}’ten beri</td></tr> : null}
        <tr><td>Toplam ilan</td><td>{rows.length}</td></tr>
        <tr><td>Takipçi</td><td>{followers || 0}</td></tr>
        {revs.length ? <tr><td>Puan</td><td>★ {avg.toFixed(1)} ({revs.length} değerlendirme)</td></tr> : null}
      </tbody></table>
    </div>
  );

  const reviewsNode = (
    <div style={{ maxWidth: 680 }}>
      {revs.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {revs.map((r: any) => (
            <div key={r.id} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ color: "#ffce54", fontSize: 14 }}>{"★".repeat(r.rating || 0)}<span style={{ color: "var(--border-2)" }}>{"★".repeat(5 - (r.rating || 0))}</span></div>
              {r.body ? <p style={{ marginTop: 6, color: "#d4d4da", fontSize: 14, lineHeight: 1.6 }}>{r.body}</p> : null}
            </div>
          ))}
        </div>
      ) : <p style={{ color: "var(--muted)", marginBottom: 14 }}>Henüz değerlendirme yok. İlk değerlendirmeyi sen yaz.</p>}
      <ReviewForm sellerId={p.id} />
    </div>
  );

  return (
    <>
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Person", name: p.username, url }, url }} />
      <style dangerouslySetInnerHTML={{ __html: "@media(max-width:820px){.store-layout{grid-template-columns:1fr !important}.store-layout aside{position:static !important}}" }} />
      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "24px 32px 64px" }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><a href="/magazalar">Mağazalar</a><span>›</span><span>{p.username}</span></div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 26, alignItems: "start" }} className="store-layout">
          {/* Sol bilgi kartı */}
          <aside style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 18, padding: 22, position: "sticky", top: 90 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", background: "var(--bg-3)", flexShrink: 0, border: "2px solid var(--border-2)" }}>
                {avatar ? <img src={avatar} alt={p.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
              <div>
                <h1 style={{ fontSize: 20, lineHeight: 1.15 }}>{p.username}</h1>
                {p.city ? <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>📍 {p.city}</div> : null}
                {since ? <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{since}’ten beri üye</div> : null}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Stat big={revs.length ? <>★ {avg.toFixed(1)}</> : "—"} small={`${revs.length} değerlendirme`} />
              <Stat big={followers || 0} small="Takipçi" />
              <Stat big={rows.length} small="İlan" />
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {rows.length > 0 ? <Badge>Aktif satıcı</Badge> : null}
              {revs.length >= 3 && avg >= 4.5 ? <Badge>⭐ Yüksek puanlı</Badge> : null}
              {since && since <= new Date().getFullYear() - 1 ? <Badge>Köklü üye</Badge> : null}
            </div>

            <FollowButton sellerId={p.id} />
          </aside>

          {/* Sağ sekmeli panel */}
          <div style={{ minWidth: 0 }}>
            <StoreTabs tabs={[
              { key: "shop", label: "İlanlar", count: rows.length, node: shop },
              { key: "about", label: "Hakkında", node: about },
              { key: "reviews", label: "Değerlendirmeler", count: revs.length, node: reviewsNode },
            ]} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
