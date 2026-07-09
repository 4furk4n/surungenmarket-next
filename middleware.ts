import { NextRequest, NextResponse } from "next/server";

// Sadece asıl alan adının www varyantını köke 301 yönlendirir.
// Punycode karşılığı: xn--srngenmarket-dlbb.com  (= sürüngenmarket.com)
// Vercel preview (*.vercel.app) ve localhost etkilenmez.
const PRIMARY = "xn--srngenmarket-dlbb.com";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  if (host === `www.${PRIMARY}` || host === "www.sürüngenmarket.com") {
    const url = req.nextUrl.clone();
    url.host = PRIMARY;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = { matcher: "/((?!_next|.*\\..*).*)" };
