import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Hakkında',
  description: 'SürüngenMarket nedir, nasıl çalışır ve neyi amaçlar?',
  alternates: { canonical: "/hakkinda" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Hakkında</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Hakkında</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>SürüngenMarket nedir?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>SürüngenMarket, Türkiye'de sürüngen, amfibi ve egzotik hayvanlar için ilan ve ücretsiz sahiplendirme platformudur. Amacımız, meraklıları ve sorumlu yetiştiricileri güvenli, şeffaf ve yasalara uygun bir ortamda buluşturmak.</p>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Platform yalnızca ilan yayınlar; alışveriş tarafları arasında gerçekleşir. Her ilanın sorumluluğu ilan sahibine aittir.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Neye önem veriyoruz?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Hayvan refahı, yasal uyum (CITES ve 5199 sayılı Hayvanları Koruma Kanunu) ve doğru bilgilendirme önceliğimizdir. Bu yüzden tür bazlı bakım rehberleri sunuyor, yasaklı türlerin ilanına izin vermiyoruz.</p>
      </main>
      <Footer />
    </>
  );
}
