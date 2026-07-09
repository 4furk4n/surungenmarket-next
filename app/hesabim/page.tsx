"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function Hesabim() {
  const sb = getSupabaseBrowser();
  const [user, setUser] = useState<any>(undefined);
  const [mine, setMine] = useState<any[]>([]);
  const [favs, setFavs] = useState<any[]>([]);

  async function load(uid: string) {
    const [{ data: m }, { data: fv }] = await Promise.all([
      sb.from("listings").select("id,slug,title,species,morph,sex,age_text,price,city,created_at,listing_images(storage_path,position)").eq("user_id", uid).order("created_at", { ascending: false }),
      sb.from("favorites").select("listing_id, listings(slug,title,species,morph,sex,age_text,price,city,listing_images(storage_path,position))").eq("user_id", uid),
    ]);
    const cov = (l: any) => (l.listing_images || []).sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.storage_path || null;
    setMine((m || []).map((l: any) => ({ ...l, cover: cov(l) })));
    setFavs((fv || []).map((x: any) => x.listings).filter(Boolean).map((l: any) => ({ ...l, cover: cov(l) })));
  }

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) load(data.user.id);
    });
  }, []);

  async function del(id: string) {
    if (!confirm("Bu ilanı silmek istediğine emin misin?")) return;
    await sb.from("listing_images").delete().eq("listing_id", id);
    await sb.from("listings").delete().eq("id", id);
    setMine((p) => p.filter((l) => l.id !== id));
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
            <div className="section-head"><h2>İlanlarım</h2><a href="/ilan-ver">+ Yeni ilan</a></div>
            {mine.length ? (
              <div className="grid">
                {mine.map((l) => (
                  <div key={l.id} style={{ position: "relative" }}>
                    <ListingCard l={l} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <a className="btn btn-ghost" style={{ flex: 1, textAlign: "center", fontSize: 13, padding: "7px 0" }} href={`/ilan-ver?id=${l.id}`}>Düzenle</a>
                      <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13, padding: "7px 0" }} onClick={() => del(l.id)}>Sil</button>
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
