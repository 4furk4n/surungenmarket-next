-- ============================================================================
-- SürüngenMarket — Haftalık ilan sınırı: 1 hesap 7 günde en fazla 5 ilan
-- Supabase > SQL Editor'de çalıştır. Idempotent (tekrar çalıştırılabilir).
-- Adminler bu sınırdan muaftır.
-- ============================================================================

create or replace function public.enforce_weekly_listing_limit()
returns trigger language plpgsql security definer as $$
declare cnt int;
begin
  -- Admin muafiyeti
  if exists (select 1 from public.profiles p where p.id = new.user_id and p.role = 'admin') then
    return new;
  end if;

  select count(*) into cnt
  from public.listings
  where user_id = new.user_id
    and created_at > now() - interval '7 days';

  if cnt >= 5 then
    raise exception 'Haftalık ilan sınırına ulaştın: 7 günde en fazla 5 ilan verebilirsin. Lütfen birkaç gün sonra tekrar dene.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_weekly_listing_limit on public.listings;
create trigger trg_weekly_listing_limit
  before insert on public.listings
  for each row execute function public.enforce_weekly_listing_limit();

-- Kontrol: bir kullanıcının son 7 gündeki ilan sayısı
-- select user_id, count(*) from public.listings
-- where created_at > now() - interval '7 days' group by user_id;
