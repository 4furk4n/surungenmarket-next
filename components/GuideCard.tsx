import Link from "next/link";
import { assetImg } from "@/lib/publicUrl";

type G = { slug: string; name: string; latin?: string | null; level?: string | null; image_path?: string | null };

export default function GuideCard({ g }: { g: G }) {
  const img = assetImg(g.image_path);
  const lvl = (g.level || "").toLowerCase();
  return (
    <Link className="g-card" href={`/bakim-rehberi/${g.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="gp">
        {img ? <img src={img} alt={`${g.name} bakımı`} loading="lazy" />
             : <div style={{ width: "100%", height: "100%", background: "var(--bg-3)" }} />}
      </div>
      <div className="gb">
        <div className="gn">{g.name}</div>
        {g.latin ? <div className="gl">{g.latin}</div> : null}
        {g.level ? <span className={"lvl" + (lvl.includes("ileri") ? " ileri" : "")}>{g.level}</span> : null}
      </div>
    </Link>
  );
}
