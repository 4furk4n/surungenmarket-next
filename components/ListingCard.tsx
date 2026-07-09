import Link from "next/link";
import { listingImageUrl } from "@/lib/publicUrl";
import { formatPrice, sexLabel } from "@/lib/format";

type L = {
  slug: string; title: string; species?: string | null; morph?: string | null;
  sex?: string | null; age_text?: string | null; price?: number | null; city?: string | null;
  cover?: string | null; seller?: string | null;
};

export default function ListingCard({ l }: { l: L }) {
  const img = listingImageUrl(l.cover);
  const sx = sexLabel(l.sex);
  const free = !l.price || l.price <= 0;
  return (
    <Link className="card" href={`/ilan/${l.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="photo">
        {img ? <img src={img} alt={l.title} loading="lazy" />
             : <div style={{ width: "100%", height: "100%", background: "var(--bg-3)" }} />}
      </div>
      <div className="body">
        <div className="title">{l.title}</div>
        {l.seller ? <div className="seller">{l.seller}</div> : null}
        <div className="row">
          <div className="info">
            {sx.sym ? <span className={"sex " + sx.cls}>{sx.sym}</span> : null}
            {l.age_text ? <span>{l.age_text}</span> : null}
            {l.city ? <span>· {l.city}</span> : null}
          </div>
          <div className={"price" + (free ? " free" : "")}>{formatPrice(l.price)}</div>
        </div>
      </div>
    </Link>
  );
}
