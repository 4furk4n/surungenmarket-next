# SECURITY_AUDIT.md — SürüngenMarket Güvenlik Denetimi

> Kontrollü, kapsamlı bir güvenlik incelemesidir. Hiçbir denetim %100 güvenlik garantisi vermez; bilinen risk sınıfları kapsanmıştır. Production'da yıkıcı işlem yapılmamıştır; DB değişiklikleri öneri/hazır SQL olarak sunulmuştur, çalıştırma kullanıcıya bırakılmıştır.

## 1. Yönetici özeti
Uygulama Next.js 15 (App Router) + Supabase mimarisinde. **API route / server action yok**; tüm veri erişimi istemciden doğrudan Supabase'e gidiyor. Dolayısıyla **yetkilendirme güvenliğinin tamamı Supabase RLS + Storage policy'lerine dayanıyor.** İnceleme sonucunda RLS/Storage kurulumu büyük ölçüde **sağlam** bulundu (ownership, mesaj gizliliği, insert WITH CHECK'ler, storage klasör izolasyonu doğru). **Tek KRİTİK açık:** `profiles` UPDATE policy'sinin sütun kısıtı olmaması nedeniyle **her kullanıcının kendini admin yapabilmesi**. Ayrıca kod tarafında güvenlik başlıkları eksikti (eklendi) ve uygulama genelinde rate limiting/sunucu-tarafı girdi doğrulaması yok.

Sır sızıntısı, tehlikeli sink (eval/child_process), zararlı `dangerouslySetInnerHTML` kullanımı **bulunmadı**.

## 2. İncelenen mimari
- **Frontend/SSR:** Next.js App Router, 21 sayfa, 11 client component, 1 middleware (yalnızca www→apex 301).
- **Kimlik/Veri/Depolama:** Supabase. İstemci: `@supabase/ssr` (browser client, oturum çerezleri). SSR: anon key + oturumsuz public client (yalnızca RLS-public veriyi görür).
- **Admin:** `/admin` sayfası istemcide `role==='admin'` kontrol ediyor (yalnızca UX); gerçek koruma RLS (`is_admin()`).
- **Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable, public-safe), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. `service_role` anahtarı kodda **yok**.

## 3. Kritik bulgular
### K-1 · profiles rol yükseltme (kendini admin yapma)
- **Önem:** Kritik
- **Etkilenen:** Supabase `profiles` tablosu, `profiles_update` policy (USING/WITH CHECK = `(id=auth.uid()) OR is_admin()`).
- **Saldırı senaryosu:** Giriş yapmış kullanıcı, tarayıcıdan `supabase.from('profiles').update({role:'admin'}).eq('id', <kendi_id>)` çağırır. Policy satır düzeyinde olduğundan sütun (`role`) kısıtlanmaz; çağrı başarılı olur.
- **Etki:** Tam yönetici ele geçirme (blog/rehber/kategori/site görselleri yönetimi + tüm ilan/mesaj silme).
- **Düzeltme (hazır, non-destructive):** `protect_profile_role` BEFORE INSERT/UPDATE trigger'ı — giriş yapmış admin-olmayan kullanıcının `role` değişikliğini yok sayar; servis rolü/SQL Editor/signup trigger'ı (auth.uid() null) etkilenmez. (SQL aşağıda Bölüm 8/Ek.)
- **Test:** Normal hesapla rol değişimi denenir → `role` 'user' kalır. Admin ataması SQL Editor'den yapılabilir.
- **Durum:** SQL hazır; kullanıcının Supabase'de çalıştırması bekleniyor.

## 4. Yüksek riskli bulgular
### Y-1 · Güvenlik başlıkları eksik → DÜZELTİLDİ
- **Önem:** Yüksek
- **Etkilenen:** `next.config.mjs`
- **Sorun:** CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, clickjacking koruması yoktu.
- **Düzeltme:** `headers()` eklendi: CSP (script/style için `'unsafe-inline'`, `unsafe-eval` YOK; img/connect yalnızca self + Supabase), HSTS (2 yıl, preload), `nosniff`, `strict-origin-when-cross-origin`, Permissions-Policy (camera/mic/geo kapalı), `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'`.
- **Test:** Preview'da response header'ları kontrol; sayfa/görsel/Supabase çağrıları çalışmalı. **Not:** CSP canlıda test edilmeli — kırılırsa yalnızca `Content-Security-Policy` satırı kaldırılır (diğer 5 başlık güvenli).

### Y-2 · Rate limiting yok
- **Önem:** Yüksek (kötüye kullanım/DoS)
- **Etkilenen:** login/register/şifre (Supabase Auth'un yerleşik limiti kısmen korur), mesaj gönderme, yorum, arama, upload.
- **Durum:** İlan için haftalık limit trigger'ı var. Mesaj/yorum için sınır yok.
- **Öneri:** DB trigger ile hız sınırı (ör. mesaj: dakikada N), veya Vercel/Upstash rate limit. (Bölüm 8 — önerilen, uygulanmadı.)

## 5. Orta riskli bulgular
- **O-1 reviews kötüye kullanımı:** Kendine yorum ve aynı satıcıya tekrarlı yorum engellenmiyor. Öneri: `CHECK (author_id <> seller_id)` + `UNIQUE(author_id, seller_id)` (non-destructive ALTER, Bölüm 8).
- **O-2 Sunucu-tarafı girdi doğrulaması yok:** Uzunluk/format sınırı yok (aşırı büyük body/spam). Öneri: DB CHECK constraint'leri (başlık/açıklama/mesaj uzunluğu) + istemci sınırları.
- **O-3 Hata mesajı sızıntısı:** Formlar ham Supabase `error.message` gösteriyor. Öneri: kullanıcıya genel mesaj.
- **O-4 `ignoreBuildErrors` + `eslint.ignoreDuringBuilds` açık:** Tip/lint hatalarını gizliyor. Öneri: aşamalı olarak kapatıp hataları gider.

## 6. Düşük riskli bulgular
- **D-1** `profiles_select: true` → `role` dahil profiller herkese açık (admin kullanıcı adları görülebilir; küçük ifşa).
- **D-2** `messages` UPDATE alıcının mesaj gövdesini değiştirmesine izin veriyor (küçük bütünlük sorunu).
- **D-3** Instagram link oluşturma kullanıcı girdisini `instagram.com/` sonrasına ekliyor (rel=nofollow noopener var; düşük).

## 7. Düzeltilen sorunlar (bu denetimde)
- **Y-1** Güvenlik başlıkları → `next.config.mjs`'e eklendi.
- (K-1 için düzeltme SQL'i hazırlandı; çalıştırma kullanıcıda.)

## 8. Manuel yapılması gerekenler
1. **KRİTİK:** `protect_profile_role` trigger SQL'ini Supabase'de çalıştır (Ek-A).
2. Kod değişikliklerini **`security-audit`** branch'ine commit'le, **preview'da test et** (özellikle CSP: görseller, Supabase girişi, mesaj/ilan). Sorun yoksa main'e merge et.
3. (Öneri) Ek-B reviews kısıtları ve Ek-C uzunluk CHECK'lerini değerlendir.
4. (Öneri) Rate limiting ekle.

## 9. Rotate edilmesi gereken anahtarlar
- Kodda/geçmişte **secret sızıntısı bulunmadı**. `service_role` istemcide yok, `.env*.local` git'te izlenmiyor. **Zorunlu rotate yok.**
- Yine de en iyi uygulama olarak: Supabase `anon` anahtarı public'tir (RLS korur) — rotate şart değil. `service_role` anahtarını **asla** istemci/env `NEXT_PUBLIC_` içine koyma.

## 10. Uygulanan testler ve sonuçları
- Statik tarama: sır kalıpları (eyJ/sb_/sk_), `service_role`, `eval`/`child_process`/`fs` → **bulunmadı**.
- `dangerouslySetInnerHTML` denetimi → yalnızca güvenli (statik CSS + kendi JSON-LD).
- RLS/Storage policy dökümü canlı Supabase'den alınıp analiz edildi (Bölüm 3–6).
- Build/lint/typecheck: bu ortam npm registry'ye kısıtlı olduğundan yerelde çalıştırılamadı; **Vercel preview build'inde doğrulanmalı**.

## 11. Kalan riskler
- Rate limiting ve sunucu-tarafı girdi doğrulaması hâlâ zayıf (kötüye kullanım/spam).
- CSP `'unsafe-inline'` (style + script) içeriyor; XSS'e karşı ideal sertlikte değil (uygulama inline style yoğun olduğundan pragmatik seçim). Nonce tabanlı CSP ileride değerlendirilebilir.
- `is_admin()` `profiles.role`'e dayanıyor; K-1 fix'i çalıştırılmadan model açık kalır.

## 12. Değiştirilen dosyalar
- `next.config.mjs` — güvenlik başlıkları (CSP/HSTS/nosniff/Referrer/Permissions/X-Frame-Options).
- `SECURITY_AUDIT.md` — bu rapor.
- (DB) Çalıştırılacak SQL: Ek-A (kritik), Ek-B/Ek-C (öneri).

## 13. Production'a geçiş kontrol listesi
- [ ] Ek-A (profiles rol trigger) Supabase'de çalıştırıldı ve test edildi.
- [ ] `next.config.mjs` security-audit branch'inde, preview'da CSP dahil doğrulandı.
- [ ] Görseller (Supabase), giriş, ilan ver, mesajlaşma preview'da çalışıyor.
- [ ] (Öneri) reviews kısıtları ve uzunluk CHECK'leri değerlendirildi.
- [ ] (Öneri) rate limiting planlandı.
- [ ] `service_role` hiçbir yerde client'a sızmıyor (teyit edildi).

---

## Ek-A · KRİTİK: profiles rol koruması (çalıştır)
```sql
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'UPDATE' then
      new.role := old.role;
    elsif tg_op = 'INSERT' then
      new.role := 'user';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before insert or update on public.profiles
  for each row execute function public.protect_profile_role();
```
Geri alma: `drop trigger trg_protect_profile_role on public.profiles;`

## Ek-B · reviews kötüye kullanım (öneri)
```sql
-- Kendine yorum engelle + aynı satıcıya tek yorum
alter table public.reviews add constraint reviews_not_self check (author_id <> seller_id) not valid;
create unique index if not exists reviews_author_seller_uniq on public.reviews (author_id, seller_id);
```
Not: Mevcut veri ihlalliyse `not valid` sayesinde eski kayıtlar bloklanmaz; yeni kayıtlarda uygulanır.

## Ek-C · uzunluk sınırları (öneri, örnek)
```sql
alter table public.listings add constraint listings_title_len check (char_length(title) <= 140) not valid;
alter table public.listings add constraint listings_desc_len check (description is null or char_length(description) <= 5000) not valid;
alter table public.messages add constraint messages_body_len check (char_length(body) <= 2000) not valid;
alter table public.reviews add constraint reviews_body_len check (body is null or char_length(body) <= 2000) not valid;
```
