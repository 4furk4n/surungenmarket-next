import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Yardım Merkezi',
  description: 'Sık sorulan sorular ve yardım.',
  alternates: { canonical: "/yardim" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Yardım Merkezi</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Yardım Merkezi</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Nasıl ilan veririm?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Üye ol, e-postanı doğrula, giriş yap ve sağ üstteki + İlan ver butonuna tıkla. Kategori, başlık, fiyat ve fotoğrafları ekleyip yayınla.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>İlanımı nasıl düzenlerim?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Hesabım > İlanlarım bölümünden ilanının altındaki Düzenle'ye tıkla.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Sahiplendirme ücretsiz mi?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Evet, ilan tipini 'Ücretsiz sahiplendirme' seçersen fiyat 0 olarak yayınlanır.</p>
      </main>
      <Footer />
    </>
  );
}
