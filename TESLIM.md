# SürüngenMarket — Teslim Belgesi

Türkiye'nin egzotik hayvan ilan platformu. Next.js (App Router + TypeScript) + Supabase, Vercel'de yayında.

## Canlı yapı
- **Site:** https://sürüngenmarket.com  (teknik/punycode karşılığı: `xn--srngenmarket-dlbb.com`)
- **Kod deposu:** GitHub → `4furk4n/surungenmarket-next`
- **Hosting:** Vercel (GitHub'a her push'ta otomatik derler ve yayınlar)
- **Veritabanı + depolama + kimlik:** Supabase (tek proje; eski statik site ile ortak)

## Nasıl güncelleme yaparım? (en önemli kısım)
Kod bilgisayarında `C:\Users\4furk\OneDrive\Masaüstü\surungenmarket-next` klasöründe.
1. Dosyayı değiştir.
2. **GitHub Desktop** → değişiklikleri gör → alta özet yaz → **Commit to main** → **Push origin**.
3. Vercel 1-2 dk içinde otomatik yayınlar.

> "A lock file already exists" hatası çıkarsa: sağ altta **OneDrive → Eşitlemeyi duraklat**, GitHub Desktop'ı kapat, `...\.git\index.lock` dosyasını sil, tekrar aç ve commit et. (Kalıcı çözüm: repoyu OneDrive dışı bir klasöre taşımak, ör. `C:\dev`.)

## Yönetim paneli — /admin
Sadece `profiles.role = 'admin'` olan hesapta açılır (giriş yapınca header'da **⚙ Admin** linki çıkar). Sekmeler:
- **Blog:** yazı ekle/düzenle/sil (başlık, içerik, SSS, kapak, taslak/yayında, SEO alanları). Yayınlanınca otomatik `/blog/[slug]` SEO sayfası olur.
- **Rehber SEO:** her bakım rehberinin SEO başlık/açıklama/canonical/OG ve SSS'ini düzenle.
- **Site Görselleri:** hero, **logo** ve kategori görsellerini değiştir.
- **Kategoriler:** kategori adı/sıra düzenle, ekle, sil.

Hesabı admin yapmak için (Supabase → SQL Editor):
```sql
update public.profiles set role='admin' where username='KULLANICI_ADIN';
```

## SEO altyapısı (kurulan)
- Her rehber/blog/ilan/kategori/mağaza için ayrı, indexlenebilir URL + `generateMetadata` (title, description, canonical, OpenGraph).
- JSON-LD: Article, FAQPage, BreadcrumbList, Product/Offer, CollectionPage, ProfilePage.
- Dinamik **`/sitemap.xml`** (rehberler, bloglar, kategoriler, aktif ilanlar, mağazalar) + **`/robots.txt`**.
- İç linkleme: rehber → ilgili ilanlar + kategori + kardeş rehberler; kategori → bakım rehberi.
- www → asıl domain 301, özel 404, canonical host **www'siz** (`sürüngenmarket.com`).

## Özellikler
Üyelik (e-posta doğrulamalı giriş/kayıt), ilan ver + düzenle/sil (çoklu foto), favori, takip, karşılıklı mesajlaşma (`/mesajlar`), mağaza profilleri (`/magaza/[kullanıcı]` — sekmeli: İlanlar/Hakkında/Değerlendirmeler), değerlendirme/puan, 70 bakım rehberi (türlere göre gruplu), blog, statik sayfalar (Hakkında, Koşullar, Gizlilik, Güvenlik, İletişim, Yardım, Yasaklı türler).

## Supabase — tablolar & bucket'lar
- Tablolar: `profiles, listings, listing_images, categories, guides, blog_posts, favorites, follows, messages, reviews, site_assets`.
- Storage: `listing-images` (ilan/profil/blog görselleri), `site-assets` (hero/logo/kategori görselleri).
- İlan görünürlüğü (RLS): `status='active' OR sahibi OR admin`. Yeni ilanlar `active` yayınlanır.
- İlan `slug`'ı ekleme anında otomatik üretilir (trigger).

## Kalan opsiyonel işler
1. **Google Search Console** (domain artık bağlı olduğu için yapılabilir):
   - search.google.com/search-console → `sürüngenmarket.com` ekle (DNS ile doğrula) → **Sitemaps** → `sitemap.xml` gönder.
   - HTML-etiketi yöntemi istersen: Vercel → Settings → Environment Variables → `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = <kod>` → Redeploy.
2. **Görsel optimizasyonu (opsiyonel):** `<img>`'leri `next/image`'a çevirip otomatik WebP + lazy-load. Tasarım testi gerektirir; şu an güvenli `<img>` kullanılıyor.
3. **Eski statik site:** yedek olarak duruyor; sorun çıkmazsa bir süre sonra kaldırabilirsin.

## Sorun giderme
- **Build hatası:** Vercel → proje → **Deployments** → kırmızı deployment → **Build Logs**'taki `Failed to compile` mesajına bak. En sık sebep: JSX metninde çıplak `<` veya `>` (metinde `>` yerine `&gt;` yaz).
- **İçerik güncellenmiyor:** sayfalar önbellekli (ISR); değişiklik ~1-10 dk içinde yansır ya da yeni deploy ile.
- **Domain açılmıyor / çok fazla yönlendirme:** Vercel Domains'te apex = Production, www = apex'e redirect olmalı (ters kurulum döngü yapar).

## Kritik kural
Canonical/sitemap/SEO'da **her zaman** `sürüngenmarket.com` (ü'lü / punycode `xn--srngenmarket-dlbb.com`) kullanılır; ü'süz `surungenmarket.com` **asla** kullanılmaz.
