"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { listingImageUrl, siteAssetUrl } from "@/lib/publicUrl";

const inS: React.CSSProperties = { padding: "9px 13px", borderRadius: 8, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, outline: "none", width: "100%" };
const lbl: React.CSSProperties = { fontSize: 12.5, color: "var(--muted)", marginBottom: 5, display: "block", fontWeight: 600 };
const paras = (s: string) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const parseFaq = (s: string) => s.split("\n").map((l) => l.split("::")).filter((a) => a.length >= 2).map((a) => ({ q: a[0].trim(), a: a.slice(1).join("::").trim() })).filter((x) => x.q && x.a);

export default function Admin() {
  const sb = getSupabaseBrowser();
  const [uid, setUid] = useState<string | undefined | null>(undefined);
  const [role, setRole] = useState<string | null>(null);
  const [tab, setTab] = useState<"blog" | "guide" | "images" | "cats">("blog");

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const u = data.user?.id || null; setUid(u);
      if (u) { const { data: p } = await sb.from("profiles").select("role").eq("id", u).maybeSingle(); setRole((p as any)?.role || null); }
    });
  }, []);

  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 900 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Admin</span></div>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Yönetim Paneli</h1>

        {uid === undefined ? <p style={{ color: "var(--muted)" }}>Yükleniyor…</p> : null}
        {uid && role !== "admin" ? <p style={{ color: "var(--red)" }}>Bu sayfaya erişim yetkin yok.</p> : null}
        {uid === null ? <p style={{ color: "var(--muted)" }}>Giriş yapmalısın.</p> : null}

        {uid && role === "admin" ? (
          <>
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22 }}>
              {([["blog", "Blog"], ["guide", "Rehber SEO"], ["images", "Site Görselleri"], ["cats", "Kategoriler"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: "11px 16px", fontSize: 14.5, fontWeight: 600, color: tab === k ? "#fff" : "var(--muted)", borderBottom: tab === k ? "2px solid #fff" : "2px solid transparent", marginBottom: -1 }}>{l}</button>
              ))}
            </div>
            {tab === "blog" ? <BlogAdmin uid={uid} /> : tab === "guide" ? <GuideSeoAdmin /> : tab === "images" ? <SiteAssetsAdmin uid={uid} /> : <CategoriesAdmin />}
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function BlogAdmin({ uid }: { uid: string }) {
  const sb = getSupabaseBrowser();
  const [posts, setPosts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const empty = { id: null, title: "", slug: "", excerpt: "", category_slug: "", bodyText: "", faqText: "", status: "draft", seo_title: "", seo_description: "", canonical_url: "", og_title: "", og_description: "", cover_path: "" };
  const [f, setF] = useState<any>(empty);

  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      sb.from("blog_posts").select("*").order("created_at", { ascending: false }),
      sb.from("categories").select("slug,name").order("sort", { ascending: true }),
    ]);
    setPosts(p || []); setCats(c || []);
  }
  useEffect(() => { load(); }, []);

  const set = (k: string) => (e: any) => setF((p: any) => ({ ...p, [k]: e.target.value }));

  function edit(post: any) {
    setEditing(post);
    setF({
      id: post.id, title: post.title || "", slug: post.slug || "", excerpt: post.excerpt || "",
      category_slug: post.category_slug || "", status: post.status || "draft",
      bodyText: Array.isArray(post.body) ? post.body.join("\n\n") : "",
      faqText: Array.isArray(post.faq) ? post.faq.map((x: any) => `${x.q} :: ${x.a}`).join("\n") : "",
      seo_title: post.seo_title || "", seo_description: post.seo_description || "", canonical_url: post.canonical_url || "",
      og_title: post.og_title || "", og_description: post.og_description || "", cover_path: post.cover_path || "",
    });
    setCover(null); setMsg("");
  }
  function reset() { setEditing(null); setF(empty); setCover(null); setMsg(""); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      let cover_path = f.cover_path;
      if (cover) {
        const ext = (cover.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${uid}/blog/${Date.now()}.${ext}`;
        const up = await sb.storage.from("listing-images").upload(path, cover, { upsert: true });
        if (up.error) throw up.error;
        cover_path = path;
      }
      const row: any = {
        title: f.title, slug: f.slug || null, excerpt: f.excerpt || null, category_slug: f.category_slug || null,
        body: paras(f.bodyText), faq: parseFaq(f.faqText), status: f.status, cover_path: cover_path || null,
        seo_title: f.seo_title || null, seo_description: f.seo_description || null, canonical_url: f.canonical_url || null,
        og_title: f.og_title || null, og_description: f.og_description || null,
      };
      if (editing) { const { error } = await sb.from("blog_posts").update(row).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await sb.from("blog_posts").insert(row); if (error) throw error; }
      setMsg("Kaydedildi ✓"); reset(); load();
    } catch (e: any) { setMsg("Hata: " + (e.message || e)); }
    setBusy(false);
  }
  async function del(id: string) {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
    await sb.from("blog_posts").delete().eq("id", id); load();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
      <form onSubmit={save} style={{ display: "grid", gap: 12, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
        <h3 style={{ fontSize: 17 }}>{editing ? "Yazıyı düzenle" : "Yeni blog yazısı"}</h3>
        <div><label style={lbl}>Başlık</label><input style={inS} value={f.title} onChange={set("title")} required /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Slug (boş bırak = otomatik)</label><input style={inS} value={f.slug} onChange={set("slug")} placeholder="leopar-gecko-yem-yemiyor" /></div>
          <div><label style={lbl}>Kategori</label>
            <select style={inS} value={f.category_slug} onChange={set("category_slug")}><option value="">—</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          </div>
        </div>
        <div><label style={lbl}>Özet</label><input style={inS} value={f.excerpt} onChange={set("excerpt")} /></div>
        <div><label style={lbl}>İçerik (paragrafları boş satırla ayır)</label><textarea style={{ ...inS, minHeight: 140, resize: "vertical" }} value={f.bodyText} onChange={set("bodyText")} /></div>
        <div><label style={lbl}>SSS — her satır: soru :: cevap</label><textarea style={{ ...inS, minHeight: 80, resize: "vertical" }} value={f.faqText} onChange={set("faqText")} placeholder="Ne sıklıkta beslenir? :: Genç bireyler günde bir kez beslenir." /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Durum</label><select style={inS} value={f.status} onChange={set("status")}><option value="draft">Taslak</option><option value="published">Yayında</option></select></div>
          <div><label style={lbl}>Kapak görseli</label><input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} style={{ color: "var(--muted)", fontSize: 13 }} />
            {f.cover_path && !cover ? <img src={listingImageUrl(f.cover_path) || ""} alt="" style={{ height: 40, marginTop: 6, borderRadius: 6 }} /> : null}
          </div>
        </div>
        <details style={{ background: "var(--bg-3)", borderRadius: 8, padding: "8px 12px" }}>
          <summary style={{ cursor: "pointer", fontSize: 13.5, color: "var(--muted)" }}>SEO alanları (opsiyonel)</summary>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <div><label style={lbl}>SEO başlık</label><input style={inS} value={f.seo_title} onChange={set("seo_title")} /></div>
            <div><label style={lbl}>SEO açıklama</label><input style={inS} value={f.seo_description} onChange={set("seo_description")} /></div>
            <div><label style={lbl}>Canonical URL</label><input style={inS} value={f.canonical_url} onChange={set("canonical_url")} /></div>
            <div><label style={lbl}>OG başlık</label><input style={inS} value={f.og_title} onChange={set("og_title")} /></div>
            <div><label style={lbl}>OG açıklama</label><input style={inS} value={f.og_description} onChange={set("og_description")} /></div>
          </div>
        </details>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "…" : editing ? "Güncelle" : "Yayınla / Kaydet"}</button>
          {editing ? <button type="button" className="btn btn-ghost" onClick={reset}>İptal</button> : null}
          {msg ? <span style={{ fontSize: 13, color: "var(--muted)" }}>{msg}</span> : null}
        </div>
      </form>

      <div>
        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Yazılar ({posts.length})</h3>
        {posts.length ? posts.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 8, background: "var(--bg-2)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.status === "published" ? "Yayında" : "Taslak"} · /{p.slug}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => edit(p)}>Düzenle</button>
              <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => del(p.id)}>Sil</button>
            </div>
          </div>
        )) : <p style={{ color: "var(--muted)", fontSize: 14 }}>Henüz yazı yok.</p>}
      </div>
    </div>
  );
}

function GuideSeoAdmin() {
  const sb = getSupabaseBrowser();
  const [guides, setGuides] = useState<any[]>([]);
  const [sel, setSel] = useState<string>("");
  const [f, setF] = useState<any>({ seo_title: "", seo_description: "", canonical_url: "", og_title: "", og_description: "", og_image: "", faqText: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { sb.from("guides").select("id,slug,name").order("sort", { ascending: true }).then(({ data }) => setGuides(data || [])); }, []);

  async function pick(id: string) {
    setSel(id); setMsg("");
    if (!id) return;
    const { data: g } = await sb.from("guides").select("*").eq("id", id).maybeSingle();
    if (g) setF({
      seo_title: g.seo_title || "", seo_description: g.seo_description || "", canonical_url: g.canonical_url || "",
      og_title: g.og_title || "", og_description: g.og_description || "", og_image: g.og_image || "",
      faqText: Array.isArray(g.faq) ? g.faq.map((x: any) => `${x.q} :: ${x.a}`).join("\n") : "",
    });
  }
  const set = (k: string) => (e: any) => setF((p: any) => ({ ...p, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!sel) return; setBusy(true); setMsg("");
    const row = {
      seo_title: f.seo_title || null, seo_description: f.seo_description || null, canonical_url: f.canonical_url || null,
      og_title: f.og_title || null, og_description: f.og_description || null, og_image: f.og_image || null,
      faq: parseFaq(f.faqText),
    };
    const { error } = await sb.from("guides").update(row).eq("id", sel);
    setBusy(false); setMsg(error ? "Hata: " + error.message : "Kaydedildi ✓");
  }

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 12, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, maxWidth: 640 }}>
      <div><label style={lbl}>Rehber seç</label>
        <select style={inS} value={sel} onChange={(e) => pick(e.target.value)}><option value="">—</option>{guides.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
      </div>
      {sel ? (
        <>
          <div><label style={lbl}>SEO başlık</label><input style={inS} value={f.seo_title} onChange={set("seo_title")} /></div>
          <div><label style={lbl}>SEO açıklama</label><textarea style={{ ...inS, minHeight: 60 }} value={f.seo_description} onChange={set("seo_description")} /></div>
          <div><label style={lbl}>Canonical URL</label><input style={inS} value={f.canonical_url} onChange={set("canonical_url")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={lbl}>OG başlık</label><input style={inS} value={f.og_title} onChange={set("og_title")} /></div>
            <div><label style={lbl}>OG görsel (yol/URL)</label><input style={inS} value={f.og_image} onChange={set("og_image")} /></div>
          </div>
          <div><label style={lbl}>OG açıklama</label><input style={inS} value={f.og_description} onChange={set("og_description")} /></div>
          <div><label style={lbl}>SSS — her satır: soru :: cevap</label><textarea style={{ ...inS, minHeight: 90 }} value={f.faqText} onChange={set("faqText")} /></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "…" : "Kaydet"}</button>
            {msg ? <span style={{ fontSize: 13, color: "var(--muted)" }}>{msg}</span> : null}
          </div>
        </>
      ) : null}
    </form>
  );
}

function SiteAssetsAdmin({ uid }: { uid: string }) {
  const sb = getSupabaseBrowser();
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [cats, setCats] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const [{ data: a }, { data: c }] = await Promise.all([
      sb.from("site_assets").select("key,storage_path"),
      sb.from("categories").select("slug,name").order("sort", { ascending: true }),
    ]);
    const m: Record<string, string> = {}; (a || []).forEach((x: any) => (m[x.key] = x.storage_path)); setAssets(m); setCats(c || []);
  }
  useEffect(() => { load(); }, []);

  async function upload(key: string, file: File) {
    setMsg(`${key} yükleniyor…`);
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${key}/${Date.now()}.${ext}`;
    const up = await sb.storage.from("site-assets").upload(path, file, { upsert: true });
    if (up.error) { setMsg("Hata: " + up.error.message); return; }
    const { error } = await sb.from("site_assets").upsert({ key, storage_path: path }, { onConflict: "key" });
    if (error) { setMsg("Hata: " + error.message); return; }
    setAssets((p) => ({ ...p, [key]: path })); setMsg(`${key} güncellendi ✓`);
  }

  const items = [
    { key: "hero", label: "Hero (ana görsel)" },
    { key: "logo", label: "Logo" },
    ...cats.map((c: any) => ({ key: "cat_" + c.slug, label: "Kategori: " + c.name })),
  ];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>Görseller Supabase'e yüklenir; site birkaç dakikada günceller.</p>
      {msg ? <p style={{ fontSize: 13, color: "var(--muted)" }}>{msg}</p> : null}
      {items.map((it) => (
        <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-2)" }}>
          <div style={{ width: 80, height: 54, borderRadius: 8, overflow: "hidden", background: "var(--bg-3)", flexShrink: 0 }}>
            {assets[it.key] ? <img src={siteAssetUrl(assets[it.key]) || ""} alt={it.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{it.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{assets[it.key] ? "Yüklü" : "Görsel yok"}</div>
          </div>
          <label className="btn btn-ghost" style={{ fontSize: 13, cursor: "pointer" }}>
            Değiştir<input type="file" accept="image/*" onChange={(e) => { const fi = e.target.files?.[0]; if (fi) upload(it.key, fi); }} style={{ display: "none" }} />
          </label>
        </div>
      ))}
    </div>
  );
}

function CategoriesAdmin() {
  const sb = getSupabaseBrowser();
  const [cats, setCats] = useState<any[]>([]);
  const [nw, setNw] = useState({ slug: "", name: "" });
  const [msg, setMsg] = useState("");

  async function load() { const { data } = await sb.from("categories").select("id,slug,name,sort").order("sort", { ascending: true }); setCats(data || []); }
  useEffect(() => { load(); }, []);

  function setField(id: string, k: string, v: string) { setCats((p) => p.map((c) => (c.id === id ? { ...c, [k]: v } : c))); }
  async function save(c: any) { const { error } = await sb.from("categories").update({ name: c.name, sort: c.sort ? parseInt(String(c.sort), 10) : 0 }).eq("id", c.id); setMsg(error ? "Hata: " + error.message : "Kaydedildi ✓"); }
  async function add(e: React.FormEvent) { e.preventDefault(); if (!nw.slug || !nw.name) return; const { error } = await sb.from("categories").insert({ slug: nw.slug, name: nw.name, sort: cats.length + 1 }); if (error) { setMsg("Hata: " + error.message); return; } setNw({ slug: "", name: "" }); load(); }
  async function del(id: string) { if (!confirm("Kategoriyi silmek istediğine emin misin? Bu kategorideki ilanlar kategorisiz kalabilir.")) return; const { error } = await sb.from("categories").delete().eq("id", id); if (error) setMsg("Silinemedi: " + error.message); else load(); }

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 640 }}>
      {msg ? <p style={{ fontSize: 13, color: "var(--muted)" }}>{msg}</p> : null}
      {cats.map((c) => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-2)" }}>
          <input value={c.name} onChange={(e) => setField(c.id, "name", e.target.value)} style={{ ...inS, flex: 1 }} />
          <input value={c.sort ?? ""} onChange={(e) => setField(c.id, "sort", e.target.value)} style={{ ...inS, width: 64 }} title="Sıra" />
          <span style={{ fontSize: 12, color: "var(--muted)", width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/{c.slug}</span>
          <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => save(c)}>Kaydet</button>
          <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => del(c.id)}>Sil</button>
        </div>
      ))}
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <input value={nw.name} onChange={(e) => setNw((p) => ({ ...p, name: e.target.value }))} placeholder="Yeni kategori adı" style={{ ...inS, flex: 1 }} />
        <input value={nw.slug} onChange={(e) => setNw((p) => ({ ...p, slug: e.target.value }))} placeholder="slug (ör. yilan)" style={{ ...inS, width: 160 }} />
        <button className="btn btn-primary" type="submit">Ekle</button>
      </form>
      <p style={{ fontSize: 12, color: "var(--muted)" }}>Not: Yeni kategorinin slug&apos;ı URL&apos;de kullanılır; sade, küçük harf ve Türkçesiz yaz (ör. kus, memeli).</p>
    </div>
  );
}
