"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function FollowButton({ sellerId }: { sellerId: string }) {
  const sb = getSupabaseBrowser();
  const [uid, setUid] = useState<string | null>(null);
  const [f, setF] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const u = data.user?.id || null; setUid(u);
      if (u && u !== sellerId) {
        const { data: r } = await sb.from("follows").select("seller_id").eq("follower_id", u).eq("seller_id", sellerId).maybeSingle();
        setF(!!r);
      }
    });
  }, [sellerId]);

  async function toggle() {
    if (!uid) { alert("Takip etmek için giriş yap."); return; }
    if (uid === sellerId) return;
    setBusy(true);
    if (f) { await sb.from("follows").delete().eq("follower_id", uid).eq("seller_id", sellerId); setF(false); }
    else { await sb.from("follows").insert({ follower_id: uid, seller_id: sellerId }); setF(true); }
    setBusy(false);
  }
  if (uid && uid === sellerId) return null;
  return <button className="btn btn-primary" onClick={toggle} disabled={busy}>{f ? "✓ Takip ediliyor" : "Takip et"}</button>;
}
