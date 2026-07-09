"use client";
import { useState } from "react";

export default function StoreTabs({ tabs }: { tabs: { key: string; label: string; count?: number; node: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22, overflowX: "auto" }}>
        {tabs.map((t) => {
          const on = active === t.key;
          return (
            <button key={t.key} onClick={() => setActive(t.key)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", fontSize: 14.5, fontWeight: 600,
                color: on ? "#fff" : "var(--muted)", borderBottom: on ? "2px solid #fff" : "2px solid transparent", marginBottom: -1, whiteSpace: "nowrap" }}>
              {t.label}{typeof t.count === "number" ? <span style={{ color: "var(--muted)", fontWeight: 500 }}> · {t.count}</span> : null}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => <div key={t.key} style={{ display: active === t.key ? "block" : "none" }}>{t.node}</div>)}
    </div>
  );
}
