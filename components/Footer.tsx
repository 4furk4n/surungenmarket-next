import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <Link href="/" className="logo" style={{ marginBottom: 10, textDecoration: "none" }}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14 L10 9.5 M24.5 14 L30 9.5 M15.5 22.5 L10 27 M24.5 22.5 L30 27" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              <ellipse cx="20" cy="8" rx="5.4" ry="4.8" fill="#fff" />
              <circle cx="17.4" cy="7" r="1.05" fill="#0c0c0e" />
              <circle cx="22.6" cy="7" r="1.05" fill="#0c0c0e" />
              <ellipse cx="20" cy="18.5" rx="6.5" ry="8" fill="#fff" />
              <path d="M20 26 C 19.6 31.5, 21.5 35.5, 25.2 35.8 C 28.6 36, 29.8 32.4, 27.4 31.4" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <circle cx="18" cy="14.5" r="1" fill="#0c0c0e" />
              <circle cx="22.4" cy="16.5" r="1" fill="#0c0c0e" />
              <circle cx="18.6" cy="19.5" r="1" fill="#0c0c0e" />
            </svg>
            <div style={{ color: "#fff" }}>Sürüngen<span>Market</span></div>
          </Link>
          <p style={{ maxWidth: 260, lineHeight: 1.6 }}>Türkiye'nin egzotik hayvan ilan platformu. Güvenli, yasal, şeffaf.</p>
        </div>
        <div><h4>Keşfet</h4><ul>
          <li><Link href="/ilanlar">İlanlar</Link></li>
          <li><Link href="/ilanlar">Kategoriler</Link></li>
          <li><Link href="/magazalar">Mağazalar</Link></li>
          <li><Link href="/bakim-rehberi">Bakım rehberleri</Link></li>
        </ul></div>
        <div><h4>Destek</h4><ul>
          <li><Link href="/yardim">Yardım merkezi</Link></li>
          <li><Link href="/guvenlik">Güvenlik ipuçları</Link></li>
          <li><Link href="/iletisim">İletişim</Link></li>
        </ul></div>
        <div><h4>Yasal</h4><ul>
          <li><Link href="/kosullar">Kullanım koşulları</Link></li>
          <li><Link href="/gizlilik">Gizlilik</Link></li>
          <li><Link href="/yasakli">Yasaklı türler listesi</Link></li>
        </ul></div>
      </div>
      <div className="legal"><p>SürüngenMarket yalnızca ilan yayınlayan bir platformdur; taraflar arasındaki alışverişten sorumlu değildir. CITES ve 5199 sayılı Hayvanları Koruma Kanunu kapsamında izne tabi türlerin ilanı yasaktır. © 2026 SürüngenMarket</p></div>
    </footer>
  );
}
