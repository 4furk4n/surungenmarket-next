import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { catPath } from "@/lib/categories";

const cats = [
  { db: "kertenkele", name: "Leopar geckolar", count: "124 ilan", img: "https://loremflickr.com/480/360/leopardgecko?lock=1", alt: "Leopar gecko satılık ilanları" },
  { db: "yilan", name: "Top pitonlar", count: "86 ilan", img: "https://loremflickr.com/480/360/ballpython?lock=2", alt: "Top piton satılık ilanları" },
  { db: "kertenkele", name: "Sakallı ejderler", count: "57 ilan", img: "https://loremflickr.com/480/360/beardeddragon?lock=3", alt: "Sakallı ejder satılık ilanları" },
  { db: "kertenkele", name: "Bukalemunlar", count: "34 ilan", img: "https://loremflickr.com/480/360/chameleon?lock=4", alt: "Bukalemun satılık ilanları" },
  { db: "kaplumbaga", name: "Kaplumbağalar", count: "43 ilan", img: "https://loremflickr.com/480/360/tortoise?lock=5", alt: "Kaplumbağa ilanları" },
  { db: "amfibi", name: "Amfibiler", count: "31 ilan", img: "https://loremflickr.com/480/360/axolotl?lock=6", alt: "Aksolotl ve amfibi ilanları" },
  { db: "eklem", name: "Tarantulalar", count: "28 ilan", img: "https://loremflickr.com/480/360/tarantula?lock=7", alt: "Tarantula satılık ilanları" },
  { db: "memeli", name: "Egzotik memeliler", count: "19 ilan", img: "https://loremflickr.com/480/360/hedgehog?lock=8", alt: "Kirpi ve egzotik memeli ilanları" },
];

export default function Home() {
  return (
    <>
      <Header />
      <div id="home">
        <section className="hero">
          <div className="hero-inner">
            <div>
              <h1>Türkiye&apos;nin egzotik<br />hayvan pazarı</h1>
              <p>Sürüngenden amfibiye, güvenilir yetiştiricilerden binlerce ilan. Satın al, sat ya da ücretsiz sahiplendir.</p>
              <div className="actions">
                <Link href="/ilanlar"><button className="btn btn-primary">İlanlara göz at</button></Link>
                <button className="btn btn-ghost">Hesap oluştur</button>
              </div>
            </div>
            <div className="hero-img"><img src="https://loremflickr.com/1120/720/greentreepython?lock=11" alt="Yeşil ağaç pitonu" /></div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Kategoriler</h2><Link href="/ilanlar">Tüm kategorileri gör →</Link></div>
          <div className="cats">
            {cats.map((c, i) => (
              <Link className="cat" href={catPath(c.db)} key={i}>
                <div className="thumb"><img src={c.img} alt={c.alt} loading="lazy" /></div>
                <div className="name">{c.name}</div>
                <div className="count">{c.count}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
