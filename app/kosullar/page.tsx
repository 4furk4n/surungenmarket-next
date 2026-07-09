import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'SürüngenMarket kullanım koşulları.',
  alternates: { canonical: "/kosullar" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Kullanım Koşulları</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Kullanım Koşulları</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Genel</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>SürüngenMarket'i kullanarak bu koşulları kabul etmiş olursun. Platform bir ilan hizmetidir; taraflar arasındaki alışverişten, ödemeden veya teslimden sorumlu değildir.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>İlan kuralları</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>İlanlar doğru ve güncel bilgi içermelidir. Yasaklı, koruma altındaki veya izne tabi türlerin ilanı yasaktır. Yanıltıcı, hakaret içeren veya yasa dışı içerikler kaldırılır.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Sorumluluk</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Kullanıcılar paylaştıkları içerikten kendileri sorumludur. SürüngenMarket, kuralları ihlal eden ilan ve hesapları önceden bildirimde bulunmaksızın kaldırma hakkını saklı tutar.</p>
      </main>
      <Footer />
    </>
  );
}
