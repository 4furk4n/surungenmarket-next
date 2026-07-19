"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ReviewForm({ sellerId }: { sellerId: string }) {
  const sb = getSupabaseBrowser();
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { sb.auth.getUser().then(({ data }) => setUid(data.user?.id || null)); }, []);

  if (!uid || uid === sellerId) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await sb.from("reviews").insert({ seller_id: sellerId, author_id: uid, rating, body });
    setBusy(false);
    if (!error) { setDone(true); setBody(""); router.refresh(); }
    else alert(error.message);
  }
  if (done) return <p style={{ color: "var(--muted)", fontSize: 14 }}>Değerlendirmen eklendi, teşekkürler.</p>;

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480, marginTop: 12 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} onClick={() => setRating(n)} style={{ cursor: "pointer", fontSize: 24, color: n <= rating ? "#ffce54" : "var(--border-2)" }}>★</span>
        ))}
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Deneyimini yaz…" required maxLength={2000}
        style={{ padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, minHeight: 80, outline: "none" }} />
      <button className="btn btn-primary" disabled={busy} type="submit" style={{ justifySelf: "start" }}>{busy ? "…" : "Değerlendir"}</button>
    </form>
  );
}
