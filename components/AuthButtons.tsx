"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const inS: React.CSSProperties = { padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--bg-3)", color: "#fff", fontSize: 14, outline: "none", width: "100%" };

export default function AuthButtons() {
  const sb = getSupabaseBrowser();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState<null | "login" | "register">(null);
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [username, setUsername] = useState(""); const [city, setCity] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setMsg(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
    else setOpen(null);
  }
  async function register(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { username, city } } });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    if (data.user) { try { await sb.from("profiles").upsert({ id: data.user.id, username, city }); } catch {} }
    setMsg("Kaydın alındı. E-postana gelen doğrulama bağlantısına tıkla, sonra giriş yap.");
  }

  return (
    <>
      {user ? (
        <>
          <a className="btn btn-ghost" href="/mesajlar">✉ Mesajlar</a>
          <a className="btn btn-ghost" href="/hesabim">👤 Hesabım</a>
          <button className="btn btn-ghost" onClick={() => sb.auth.signOut()}>Çıkış</button>
        </>
      ) : (
        <>
          <button className="btn btn-ghost" onClick={() => { setOpen("login"); setMsg(""); }}>Giriş yap</button>
          <button className="btn btn-ghost" onClick={() => { setOpen("register"); setMsg(""); }}>Üye ol</button>
        </>
      )}
      <a className="btn btn-primary" href="/ilan-ver">+ İlan ver</a>

      {open ? (
        <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 380, maxWidth: "100%" }}>
            <h3 style={{ marginBottom: 14, fontSize: 20 }}>{open === "login" ? "Giriş yap" : "Üye ol"}</h3>
            <form onSubmit={open === "login" ? login : register} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {open === "register" ? (
                <>
                  <input style={inS} placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  <input style={inS} placeholder="Şehir" value={city} onChange={(e) => setCity(e.target.value)} />
                </>
              ) : null}
              <input style={inS} type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input style={inS} type="password" placeholder="Şifre" value={pw} onChange={(e) => setPw(e.target.value)} required />
              <button className="btn btn-primary" disabled={busy} type="submit" style={{ marginTop: 4 }}>{busy ? "..." : open === "login" ? "Giriş yap" : "Üye ol"}</button>
            </form>
            {msg ? <p style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{msg}</p> : null}
            <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
              {open === "login"
                ? <>Hesabın yok mu? <span style={{ color: "#fff", cursor: "pointer" }} onClick={() => { setOpen("register"); setMsg(""); }}>Üye ol</span></>
                : <>Zaten üye misin? <span style={{ color: "#fff", cursor: "pointer" }} onClick={() => { setOpen("login"); setMsg(""); }}>Giriş yap</span></>}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
