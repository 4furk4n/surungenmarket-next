import Link from "next/link";
import { catPath } from "@/lib/categories";
import AuthButtons from "@/components/AuthButtons";

// ── LOGO ─────────────────────────────────────────────────────────────
// Varsayılan: gömülü SVG (gecko). Bu bileşen veri ÇEKMEZ (statik) — bu yüzden
// hem sunucu hem client sayfalarında güvenle çalışır, döngü olmaz.
//
// KENDİ LOGONU KULLANMAK İÇİN (çok kolay):
//   1) Logonu WebP yap (squoosh.app) ve adını "logo.webp" koy.
//   2) Projedeki "public" klasörüne at (public/logo.webp).
//   3) Aşağıdaki <svg>...</svg> ve hemen altındaki <div>Sürüngen...</div> satırını
//      SİL, yerine tek satır koy:
//         <img src="/logo.webp" alt="SürüngenMarket" style={{ height: 34, width: "auto", display: "block" }} />
//   4) GitHub Desktop → Commit → Push. Bitti. Değiştirmek istersen public/logo.webp'i değiştir + push.
// ─────────────────────────────────────────────────────────────────────

export default function Header() {
  return (
    <header>
      <div className="topbar">
        <Link href="/" className="logo" title="Ana sayfa" style={{ textDecoration: "none" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SürüngenMarket logosu">
            <path d="M15.5 14 L10 9.5 M10 9.5 L7.8 8.6 M10 9.5 L8.6 11.2 M24.5 14 L30 9.5 M30 9.5 L32.2 8.6 M30 9.5 L31.4 11.2 M15.5 22.5 L10 27 M10 27 L7.8 27.9 M10 27 L8.6 25.3 M24.5 22.5 L30 27 M30 27 L32.2 27.9 M30 27 L31.4 25.3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx="20" cy="8" rx="5.4" ry="4.8" fill="#fff" />
            <circle cx="17.4" cy="7" r="1.05" fill="#0c0c0e" />
            <circle cx="22.6" cy="7" r="1.05" fill="#0c0c0e" />
            <ellipse cx="20" cy="18.5" rx="6.5" ry="8" fill="#fff" />
            <path d="M20 26 C 19.6 31.5, 21.5 35.5, 25.2 35.8 C 28.6 36, 29.8 32.4, 27.4 31.4 C 25.5 30.6, 24.8 33, 26.4 33.4" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <circle cx="18" cy="14.5" r="1" fill="#0c0c0e" />
            <circle cx="22.4" cy="16.5" r="1" fill="#0c0c0e" />
            <circle cx="18.6" cy="19.5" r="1" fill="#0c0c0e" />
            <circle cx="21.8" cy="22.3" r=".85" fill="#0c0c0e" />
            <circle cx="18.9" cy="24.3" r=".7" fill="#0c0c0e" />
          </svg>
          <div style={{ color: "#fff" }}>Sürüngen<span>Market</span></div>
        </Link>
        <div className="search"><input id="q" type="text" placeholder="Tür, morph veya şehir ara: leopar gecko, ankara..." /></div>
        <div className="auth">
          <AuthButtons />
        </div>
      </div>
      <nav>
        <ul>
          <li><Link href="/ilanlar" className="active">İlanlar</Link></li>
          <li><Link href={catPath("yilan")}>Yılanlar</Link></li>
          <li><Link href={catPath("kertenkele")}>Kertenkeleler</Link></li>
          <li><Link href={catPath("kaplumbaga")}>Kaplumbağalar</Link></li>
          <li><Link href={catPath("amfibi")}>Amfibiler</Link></li>
          <li><Link href={catPath("eklem")}>Eklem bacaklılar</Link></li>
          <li><Link href={catPath("memeli")}>Egzotik memeliler</Link></li>
          <li><Link href="/bakim-rehberi">Bakım rehberleri</Link></li>
          <li><Link href="/magazalar">Mağazalar</Link></li>
          <li><Link href="/hakkinda">Hakkında</Link></li>
        </ul>
      </nav>
    </header>
  );
}
