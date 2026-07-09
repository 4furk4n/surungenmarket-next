import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Güvenlik İpuçları',
  description: 'Güvenli alışveriş için öneriler.',
  alternates: { canonical: "/guvenlik" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Güvenlik İpuçları</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Güvenlik İpuçları</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Alıcıysan</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Mümkünse hayvanı yerinde gör. Sağlık ve beslenme geçmişini sor. Kapora/ön ödeme taleplerine karşı dikkatli ol; tanımadığın kişilere peşin para gönderme.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Satıcıysan</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Doğru ve dürüst bilgi ver. Hayvanın türüne uygun taşımayı sağla. Yasal belge gerektiren türlerde belgeleri hazır bulundur.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Şüpheli durumlar</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Yasaklı tür, sağlıksız koşul veya dolandırıcılık şüphesinde ilanı bize bildir.</p>
      </main>
      <Footer />
    </>
  );
}
