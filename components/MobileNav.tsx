"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function MobileNav() {
  const sb = getSupabaseBrowser();
  const [, setUid] = useState<string | null>(null);
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUid(data.user?.id || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUid(s?.user?.id || null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="mobile-nav" aria-label="Mobil menü">
      <a href="/"><span>🏠</span>Ana sayfa</a>
      <a href="/ilanlar"><span>🔎</span>İlanlar</a>
      <a href="/ilan-ver" className="mn-add"><span>＋</span>İlan ver</a>
      <a href="/mesajlar"><span>✉️</span>Mesajlar</a>
      <a href="/hesabim"><span>👤</span>Hesabım</a>
    </nav>
  );
}
