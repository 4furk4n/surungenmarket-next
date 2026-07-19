"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Msg = { id: string; listing_id: string | null; sender_id: string; recipient_id: string; body: string; read_at: string | null; created_at: string };
type Conv = { key: string; other: string; listingId: string | null; msgs: Msg[]; last: Msg; unread: number };

export default function Mesajlar() {
  const sb = getSupabaseBrowser();
  const [uid, setUid] = useState<string | undefined | null>(undefined);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [listings, setListings] = useState<Record<string, any>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const load = useCallback(async (u: string) => {
    const { data } = await sb.from("messages").select("*").or(`sender_id.eq.${u},recipient_id.eq.${u}`).order("created_at", { ascending: true });
    const list = (data || []) as Msg[];
    setMsgs(list);
    const ids = Array.from(new Set(list.flatMap((m) => [m.sender_id, m.recipient_id])));
    const lids = Array.from(new Set(list.map((m) => m.listing_id).filter(Boolean))) as string[];
    const [{ data: profs }, { data: lst }] = await Promise.all([
      ids.length ? sb.from("profiles").select("id,username,avatar_url").in("id", ids) : Promise.resolve({ data: [] as any[] }),
      lids.length ? sb.from("listings").select("id,slug,title").in("id", lids) : Promise.resolve({ data: [] as any[] }),
    ]);
    const pm: Record<string, any> = {}; (profs || []).forEach((p: any) => (pm[p.id] = p)); setProfiles(pm);
    const lm: Record<string, any> = {}; (lst || []).forEach((l: any) => (lm[l.id] = l)); setListings(lm);
  }, []);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { const u = data.session?.user?.id || null; setUid(u); if (u) load(u); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => { const u = s?.user?.id || null; setUid(u); if (u) load(u); });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const convMap: Record<string, Conv> = {};
  for (const m of msgs) {
    const other = m.sender_id === uid ? m.recipient_id : m.sender_id;
    const key = `${other}:${m.listing_id || ""}`;
    if (!convMap[key]) convMap[key] = { key, other, listingId: m.listing_id, msgs: [], last: m, unread: 0 };
    convMap[key].msgs.push(m); convMap[key].last = m;
    if (m.recipient_id === uid && !m.read_at) convMap[key].unread++;
  }
  const convs = Object.values(convMap).sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
  const current = sel ? convMap[sel] : null;

  async function openConv(key: string) {
    setSel(key);
    const c = convMap[key]; if (!c || !uid) return;
    const unread = c.msgs.filter((m) => m.recipient_id === uid && !m.read_at).map((m) => m.id);
    if (unread.length) { await sb.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread); load(uid); }
  }
  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !uid || !reply.trim()) return;
    await sb.from("messages").insert({ listing_id: current.listingId, sender_id: uid, recipient_id: current.other, body: reply.trim() });
    setReply(""); load(uid);
  }

  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 1100 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Mesajlar</span></div>
        <h1 style={{ fontSize: 28, marginBottom: 18 }}>Mesajlar</h1>

        {uid === undefined ? <p style={{ color: "var(--muted)" }}>Yükleniyor…</p> : null}
        {uid === null ? <p style={{ color: "var(--muted)" }}>Mesajlarını görmek için giriş yapmalısın.</p> : null}

        {uid ? (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start" }} className="msg-layout">
            {/* Konuşma listesi */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              {convs.length ? convs.map((c) => {
                const p = profiles[c.other]; const l = c.listingId ? listings[c.listingId] : null;
                const on = sel === c.key;
                return (
                  <div key={c.key} onClick={() => openConv(c.key)} style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: on ? "var(--bg-3)" : "transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{p?.username || "Kullanıcı"}</span>
                      {c.unread ? <span style={{ background: "#fff", color: "#0c0c0e", fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "1px 7px" }}>{c.unread}</span> : null}
                    </div>
                    {l ? <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>İlan: {l.title}</div> : null}
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.last.body}</div>
                  </div>
                );
              }) : <p style={{ color: "var(--muted)", padding: 16, fontSize: 14 }}>Henüz mesajın yok.</p>}
            </div>

            {/* Seçili konuşma */}
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, minHeight: 420, display: "flex", flexDirection: "column" }}>
              {current ? (
                <>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>{profiles[current.other]?.username || "Kullanıcı"}</b>
                    {current.listingId && listings[current.listingId] ? <Link href={`/ilan/${listings[current.listingId].slug}`} style={{ color: "var(--muted)", fontSize: 13 }}>İlanı gör →</Link> : null}
                  </div>
                  <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 440 }}>
                    {current.msgs.map((m) => {
                      const mine = m.sender_id === uid;
                      return (
                        <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%", background: mine ? "#fff" : "var(--bg-3)", color: mine ? "#0c0c0e" : "#e6e6ea", padding: "9px 13px", borderRadius: 12, fontSize: 14, lineHeight: 1.45 }}>
                          {m.body}
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={sendReply} style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                    <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Mesaj yaz…" maxLength={2000} style={{ flex: 1, padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, outline: "none" }} />
                    <button className="btn btn-primary" type="submit">Gönder</button>
                  </form>
                </>
              ) : <div style={{ margin: "auto", color: "var(--muted)", fontSize: 14 }}>Bir konuşma seç.</div>}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: "@media(max-width:760px){.msg-layout{grid-template-columns:1fr !important}}" }} />
    </>
  );
}
