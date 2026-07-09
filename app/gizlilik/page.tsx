import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Kişisel verilerinin nasıl işlendiği.',
  alternates: { canonical: "/gizlilik" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Gizlilik Politikası</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Gizlilik Politikası</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Topladığımız veriler</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Hesap oluştururken e-posta, kullanıcı adı ve şehir gibi bilgileri; ilan verirken ilan içeriğini ve görselleri toplarız.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Kullanım amacı</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Verilerini hesabını yönetmek, ilanları yayınlamak ve platform güvenliğini sağlamak için kullanırız. Verilerini üçüncü taraflara satmıyoruz.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Haklarım</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Hesabını ve ilanlarını dilediğin zaman düzenleyebilir veya silebilirsin. Veri talepleri için iletişim sayfasından bize ulaşabilirsin.</p>
      </main>
      <Footer />
    </>
  );
}
