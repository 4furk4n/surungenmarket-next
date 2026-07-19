"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function MessageSeller({ listingId, sellerId, sellerName }: { listingId: string; sellerId: string; sellerName?: string }) {
  const sb = getSupabaseBrowser();
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { sb.auth.getUser().then(({ data }) => setUid(data.user?.id || null)); }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) { alert("Mesaj göndermek için giriş yap."); return; }
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await sb.from("messages").insert({ listing_id: listingId, sender_id: uid, recipient_id: sellerId, body: body.trim() });
    setBusy(false);
    if (error) alert(error.message); else { setSent(true); setBody(""); }
  }

  if (uid && uid === sellerId) return null; // kendi ilanına mesaj gönderilmez

  return (
    <>
      <button className="btn btn-primary" onClick={() => (uid ? setOpen(true) : alert("Mesaj göndermek için giriş yap."))}>💬 Mesaj gönder</button>

      {open ? (
        <div onClick={() => { setOpen(false); setSent(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 420, maxWidth: "100%" }}>
            <h3 style={{ marginBottom: 12, fontSize: 19 }}>{sellerName ? `${sellerName} — Mesaj` : "Satıcıya mesaj"}</h3>
            {sent ? (
              <div>
                <p style={{ color: "#d4d4da", marginBottom: 14 }}>Mesajın gönderildi. Yanıtları <b>Mesajlar</b> bölümünden takip edebilirsin.</p>
                <a className="btn btn-primary" href="/mesajlar">Mesajlar'a git</a>
              </div>
            ) : (
              <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Merhaba, ilanınız hâlâ mevcut mu?" required maxLength={2000}
                  style={{ padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, minHeight: 100, outline: "none", resize: "vertical" }} />
                <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Gönderiliyor…" : "Gönder"}</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
