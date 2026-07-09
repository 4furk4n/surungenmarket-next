import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Yasaklı Türler',
  description: 'İlanı yasak olan tür ve durumlar.',
  alternates: { canonical: "/yasakli" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="section" style={{ maxWidth: 820 }}>
        <div className="crumb"><a href="/">Ana sayfa</a><span>›</span><span>Yasaklı Türler</span></div>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.6px", marginBottom: 18 }}>Yasaklı Türler</h1>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Neden bazı türler yasak?</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>CITES sözleşmesi ve 5199 sayılı Hayvanları Koruma Kanunu kapsamında koruma altındaki veya izne tabi türlerin ticareti/ilanı yasaktır. Yerli yaban hayatına ait türler de dahildir.</p>
        <h2 style={{ fontSize: 20, margin: "24px 0 10px" }}>Genel kural</h2>
        <p style={{ lineHeight: 1.75, color: "#d4d4da", margin: "0 0 12px" }}>Koruma altındaki türler, yasa dışı yollarla elde edilmiş bireyler ve gerekli belgeleri olmayan CITES Ek-I/II türleri ilan edilemez. Emin değilsen ilan vermeden önce bize danış.</p>
      </main>
      <Footer />
    </>
  );
}
