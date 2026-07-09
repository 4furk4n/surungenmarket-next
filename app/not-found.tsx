import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="section" style={{ textAlign: "center", padding: "90px 32px" }}>
        <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-2px" }}>404</div>
        <p style={{ color: "var(--muted)", margin: "8px 0 26px", fontSize: 17 }}>Aradığın sayfa bulunamadı ya da kaldırılmış.</p>
        <Link href="/" className="btn btn-primary">Ana sayfaya dön</Link>
      </main>
      <Footer />
    </>
  );
}
