"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { listingImageUrl } from "@/lib/publicUrl";

export default function Hesabim() {
  const sb = getSupabaseBrowser();
  const [user, setUser] = useState<any>(undefined);
  const [prof, setProf] = useState<any>(null);
  const [city, setCity] = useState("");
  const [savingP, setSavingP] = useState(false);
  const [pMsg, setPMsg] = useState("");
  const [mine, setMine] = useState<any[]>([]);
  const [favs, setFavs] = useState<any[]>([]);

  async function load(uid: string) {
    const [{ data: pr }, { data: m }, { data: fv }] = await Promise.all([
      sb.from("profiles").select("id,username,city,avatar_url").eq("id", uid).maybeSingle(),
      sb.from("listings").select("id,slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)").eq("user_id", uid).order("created_at", { ascending: false }),
      sb.from("favorites").select("listing_id, listings(slug,title,species,morph,sex,age_text,price,city,listing_images(storage_path,position))").eq("user_id", uid),
    ]);
    const cov = (l: any) => (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null;
    if (pr) { setProf(pr); setCity(pr.city || ""); }
    setMine((m || []).map((l: any) => ({ ...l, cover: cov(l) })));
    setFavs((fv || []).map((x: any) => x.listings).filter(Boolean).map((l: any) => ({ ...l, cover: cov(l) })));
  }

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => { setUser(data.user ?? null); if (data.user) load(data.user.id); });
  }, []);

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !user) return;
    setPMsg("Yükleniyor…");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/profile/${Date.now()}.${ext}`;
    const up = await sb.storage.from("listing-images").upload(path, file, { upsert: true });
    if (up.error) { setPMsg("Yüklenemedi: " + up.error.message); return; }
    await sb.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setProf((p: any) => ({ ...p, avatar_url: path })); setPMsg("Avatar güncellendi ✓");
  }
  async function saveProfile() {
    if (!user) return; setSavingP(true); setPMsg("");
    const { error } = await sb.from("profiles").update({ city }).eq("id", user.id);
    setSavingP(false); setPMsg(error ? "Kaydedilemedi: " + error.message : "Kaydedildi ✓");
  }

  return (
    <>
      <Header />
      <main className="section">
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Hesabım</span></div>
        <h1 style={{ fontSize: 28, marginBottom: 18 }}>Hesabım</h1>

        {user === undefined ? <p style={{ color: "var(--muted)" }}>Yükleniyor…</p> : null}
        {user === null ? <p style={{ color: "var(--muted)" }}>Bu sayfa için giriş yapmalısın.</p> : null}

        {user ? (
          <>
            {/* Profilim */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 30 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "var(--bg-3)", flexShrink: 0 }}>
                {prof?.avatar_url ? <img src={listingImageUrl(prof.avatar_url) || ""} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{prof?.username || "—"}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir"
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 13, outline: "none" }} />
                  <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }} onClick={saveProfile} disabled={savingP}>{savingP ? "…" : "Kaydet"}</button>
                  <label className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 14px", cursor: "pointer" }}>
                    Avatar yükle<input type="file" accept="image/*" onChange={onAvatar} style={{ display: "none" }} />
                  </label>
                  {prof?.username ? <a className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }} href={`/magaza/${prof.username}`}>Mağaza profilimi gör →</a> : null}
                </div>
                {pMsg ? <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{pMsg}</p> : null}
              </div>
            </div>

            <div className="section-head"><h2>İlanlarım</h2><a href="/ilan-ver">+ Yeni ilan</a></div>
            {mine.length ? (
              <div className="grid">
                {mine.map((l) => (
                  <div key={l.id}>
                    <ListingCard l={l} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <a className="btn btn-ghost" style={{ flex: 1, textAlign: "center", fontSize: 13, padding: "7px 0" }} href={`/ilan-ver?id=${l.id}`}>Düzenle</a>
                      <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13, padding: "7px 0" }} onClick={async () => { if (confirm("Bu ilanı silmek istediğine emin misin?")) { await sb.from("listing_images").delete().eq("listing_id", l.id); await sb.from("listings").delete().eq("id", l.id); setMine((p) => p.filter((x) => x.id !== l.id)); } }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "var(--muted)", padding: "12px 0" }}>Henüz ilanın yok. <a href="/ilan-ver" style={{ color: "#fff" }}>İlk ilanını ver →</a></p>}

            <div className="section-head" style={{ marginTop: 36 }}><h2>Favorilerim</h2></div>
            {favs.length ? <div className="grid">{favs.map((l, i) => <ListingCard key={i} l={l} />)}</div>
                         : <p style={{ color: "var(--muted)", padding: "12px 0" }}>Favori ilanın yok.</p>}
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
