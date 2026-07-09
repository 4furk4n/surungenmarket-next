export function formatPrice(price?: number | null): string {
  if (!price || price <= 0) return "Ücretsiz · Sahiplendirme";
  return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
}
export function sexLabel(s?: string | null): { sym: string; cls: string } {
  if (s === "m" || s === "erkek") return { sym: "♂", cls: "m" };
  if (s === "f" || s === "disi" || s === "dişi") return { sym: "♀", cls: "f" };
  return { sym: "⚥", cls: "" };
}
