"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const inS: React.CSSProperties = { padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, outline: "none", width: "100%" };
const lbl: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginBottom: 6, display: "block", fontWeight: 600 };

export default function IlanVer() {
  const sb = getSupabaseBrowser();
  const router = useRouter();
  const [user, setUser] = useState<any>(undefined);
  const [cats, setCats] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState<any>({ category_id: "", title: "", species: "", morph: "", sex: "", age_text: "", birth_year: "", price: "", city: "", description: "", whatsapp: "", instagram: "", type: "satis" });

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    sb.from("categories").select("id,name,sort").order("sort", { ascending: true }).then(({ data }) => setCats(data || []));
  }, []);

  const set = (k: string) => (e: any) => setF((p: any) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const uid = user.id;
      const price = f.type === "sahiplendirme" ? 0 : (f.price ? parseInt(f.price, 10) : 0);
      const row: any = {
        user_id: uid, category_id: f.category_id || null, title: f.title,
        species: f.species || null, morph: f.morph || null, sex: f.sex || null,
        age_text: f.age_text || null, birth_year: f.birth_year ? parseInt(f.birth_year, 10) : null,
        price, city: f.city || null, description: f.description || null,
        whatsapp: f.whatsapp || null, instagram: f.instagram || null, status: "active",
      };
      const { data: ins, error } = await sb.from("listings").insert(row).select("id,slug").single();
      if (error) throw error;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${uid}/${ins.id}/${Date.now()}-${i}.${ext}`;
        const up = await sb.storage.from("listing-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (!up.error) await sb.from("listing_images").insert({ listing_id: ins.id, storage_path: path, position: i });
      }
      router.push(`/ilan/${ins.slug}`);
    } catch (e: any) {
      setErr(e.message || "İlan kaydedilemedi. Alanları kontrol et.");
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 720 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>İlan ver</span></div>
        <h1 style={{ fontSize: 28, marginBottom: 18 }}>İlan ver</h1>

        {user === undefined ? <p style={{ color: "var(--muted)" }}>Yükleniyor…</p> : null}

        {user === null ? (
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
            <p style={{ marginBottom: 8 }}>İlan vermek için giriş yapmalısın.</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Sağ üstteki <b>Giriş yap</b> / <b>Üye ol</b> ile hesabına gir, sonra bu sayfaya dön.</p>
          </div>
        ) : null}

        {user ? (
          <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={lbl}>İlan tipi</label>
              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#d4d4da" }}><input type="radio" name="type" checked={f.type === "satis"} onChange={() => setF((p: any) => ({ ...p, type: "satis" }))} /> Satılık</label>
                <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#d4d4da" }}><input type="radio" name="type" checked={f.type === "sahiplendirme"} onChange={() => setF((p: any) => ({ ...p, type: "sahiplendirme" }))} /> Ücretsiz sahiplendirme</label>
              </div>
            </div>
            <div>
              <label style={lbl}>Kategori</label>
              <select style={inS} value={f.category_id} onChange={set("category_id")} required>
                <option value="">Seç…</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Başlık</label><input style={inS} value={f.title} onChange={set("title")} placeholder="Örn: Leopar gecko — Tangerine morph" required /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Tür</label><input style={inS} value={f.species} onChange={set("species")} placeholder="Leopar gecko" /></div>
              <div><label style={lbl}>Morph</label><input style={inS} value={f.morph} onChange={set("morph")} placeholder="Tangerine" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Cinsiyet</label>
                <select style={inS} value={f.sex} onChange={set("sex")}><option value="">—</option><option value="m">Erkek</option><option value="f">Dişi</option><option value="x">Belirsiz</option></select>
              </div>
              <div><label style={lbl}>Yaş</label><input style={inS} value={f.age_text} onChange={set("age_text")} placeholder="6 aylık" /></div>
              <div><label style={lbl}>Doğum yılı</label><input style={inS} type="number" value={f.birth_year} onChange={set("birth_year")} placeholder="2025" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Fiyat (₺)</label><input style={inS} type="number" value={f.price} onChange={set("price")} placeholder="2500" disabled={f.type === "sahiplendirme"} /></div>
              <div><label style={lbl}>Şehir</label><input style={inS} value={f.city} onChange={set("city")} placeholder="İstanbul" /></div>
            </div>
            <div><label style={lbl}>Açıklama</label><textarea style={{ ...inS, minHeight: 110, resize: "vertical" }} value={f.description} onChange={set("description")} placeholder="Hayvan hakkında detaylar…" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>WhatsApp (opsiyonel)</label><input style={inS} value={f.whatsapp} onChange={set("whatsapp")} placeholder="905321112233" /></div>
              <div><label style={lbl}>Instagram (opsiyonel)</label><input style={inS} value={f.instagram} onChange={set("instagram")} placeholder="kullaniciadi" /></div>
            </div>
            <div>
              <label style={lbl}>Fotoğraflar</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ color: "var(--muted)", fontSize: 13 }} />
              {files.length ? <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{files.length} fotoğraf seçildi</p> : null}
            </div>
            {err ? <p style={{ color: "var(--red)", fontSize: 14 }}>{err}</p> : null}
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifySelf: "start", padding: "12px 28px" }}>{busy ? "Kaydediliyor…" : "İlanı yayınla"}</button>
          </form>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
