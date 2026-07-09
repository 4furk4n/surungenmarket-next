"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function FavButton({ listingId }: { listingId: string }) {
  const sb = getSupabaseBrowser();
  const [uid, setUid] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      const u = data.user?.id || null; setUid(u);
      if (u) {
        const { data: f } = await sb.from("favorites").select("listing_id").eq("user_id", u).eq("listing_id", listingId).maybeSingle();
        setFav(!!f);
      }
    });
  }, [listingId]);

  async function toggle() {
    if (!uid) { alert("Favorilere eklemek için giriş yap."); return; }
    setBusy(true);
    if (fav) { await sb.from("favorites").delete().eq("user_id", uid).eq("listing_id", listingId); setFav(false); }
    else { await sb.from("favorites").insert({ user_id: uid, listing_id: listingId }); setFav(true); }
    setBusy(false);
  }
  return <button className="btn btn-ghost" onClick={toggle} disabled={busy}>{fav ? "♥ Favorilerde" : "♡ Favorilere ekle"}</button>;
}
