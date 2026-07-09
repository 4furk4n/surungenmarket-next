import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Bize nasıl ulaşırsın?',
  alternates: { canonical: "/iletisim" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>İletişim</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>İletişim</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>İletişim</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Soru, öneri ve bildirimlerin için bize e-posta ile ulaşabilirsin: info@sürüngenmarket.com</p>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>İlanlarla ilgili şikayetlerini ilgili ilanın sayfasındaki bildir seçeneğiyle de iletebilirsin.</p>
      </main>
      <Footer />
    </>
  );
}
