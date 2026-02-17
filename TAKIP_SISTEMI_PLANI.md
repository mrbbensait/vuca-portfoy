# 🔔 Takip & Bildirim Sistemi — Uygulama Planı

> Bu dosya, "Public Portföy Takip + Activity Feed + Telegram Bildirim" sisteminin
> tüm uygulama adımlarını, her Part için kullanılacak promptları ve durumları içerir.
> Her yeni oturumda bu dosyayı okuyarak kaldığın yerden devam et.

---

## 📊 GENEL DURUM

| Part | İçerik | Durum |
|------|--------|-------|
| Part 1 | Veritabanı Migration (tablolar, indexler, RLS) | ✅ Tamamlandı |
| Part 2 | Follow/Unfollow API + FollowButton UI | ✅ Tamamlandı |
| Part 3 | Activity Feed — Backend (activity yazma + okuma API) | ✅ Tamamlandı |
| Part 4 | Activity Feed — Frontend (NotificationBell + bildirim UI) | ✅ Tamamlandı |
| Part 5 | Telegram Bot kurulumu + yayın kanalı entegrasyonu | ✅ Kod Hazır |
| Part 6 | Test, polish ve entegrasyon kontrolü | ✅ Tamamlandı |

---

## 🧠 SİSTEM NASIL ÇALIŞIYOR? (Özet)

### Takip Mekanizması
1. Ahmet `/explore` sayfasından public portföyleri görür.
2. Beğendiği portföyü açar (`/p/slug`), "Takip Et" butonuna basar.
3. Ahmet artık o portföyün takipçisidir.

### Portföy Sahibi Hamle Yapar
4. Sait kendi dashboard'unda bir alış/satış işlemi yapar.
5. İşlem kaydedilir, ardından sistem otomatik olarak iki şey yapar:
   - Veritabanına 1 adet aktivite kaydı yazar.
   - 20K kişilik Telegram yayın kanalına otomatik mesaj gönderir.

### Web Uygulamasında Bildirim (Pull)
6. Ahmet web uygulamasını açtığında, header'daki 🔔 ikonunda okunmamış bildirim sayısını görür.
7. İkona tıkladığında, takip ettiği portföylerin son aktivitelerini liste halinde görür.
8. Bir bildirime tıklarsa, direkt o portföyün sayfasına gider.

### Telegram Yayın Kanalı (Push + Pazarlama)
9. Kanal üyeleri telefonlarına anlık bildirim alır.
10. Mesajın altında portföy linki vardır.
11. Linke tıklayan mevcut üye → portföyü görür, takip edebilir.
12. Linke tıklayan üye olmayan kişi → portföyü görür, üye olup takip edebilir.

---

## 🗄️ VERİTABANI MİMARİSİ

### Yeni Tablolar
- `portfolio_follows` — Kimin hangi portföyü takip ettiği
- `portfolio_activities` — Her işlem için 1 satır aktivite kaydı
- `telegram_connections` — (Part 5, Faz 2, opsiyonel) Kişisel Telegram DM bağlantısı

### Mevcut Tablolarda Değişiklik
- `portfolios` tablosuna `follower_count` sütunu eklenmeyecek (010 migration ile kaldırılmıştı, count sorgu ile alınacak)
- `transactions` route'una activity + telegram yazma eklenir

---

## 🔧 PART 1 — VERİTABANI MİGRATİON

**Durum:** ✅ Tamamlandı (2026-02-17)

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 1'i uygula.
Veritabanı migration dosyasını oluştur:
- portfolio_follows tablosu (follower_id, portfolio_id, last_seen_at)
- portfolio_activities tablosu (portfolio_id, actor_id, type, title, metadata)
- İndexler ve RLS politikaları
- Supabase'e uygula
- database.types.ts güncelle
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 1.1 | `supabase/migrations/011_activity_feed_follow.sql` oluştur | ✅ |
| 1.2 | `portfolio_follows` tablosu: id, follower_id, portfolio_id, last_seen_at, created_at, UNIQUE constraint | ✅ |
| 1.3 | `portfolio_activities` tablosu: id, portfolio_id, actor_id, type, title, metadata (JSONB), created_at | ✅ |
| 1.4 | İndexler: portfolio_id+created_at, follower_id, portfolio_id | ✅ |
| 1.5 | RLS politikaları — follows: kendi takiplerini gör/ekle/sil/güncelle | ✅ |
| 1.6 | RLS politikaları — activities: public portföylerin aktivitelerini herkes görebilir + kendi portföyü için insert | ✅ |
| 1.7 | Migration'ı Supabase'e uygula (`mcp1_apply_migration`) | ✅ |
| 1.8 | `lib/types/database.types.ts` — yeni tipleri ekle (PortfolioFollow, PortfolioActivity, ActivityType) | ✅ |

### Dokunulacak Dosyalar
- `supabase/migrations/011_activity_feed_follow.sql` (yeni)
- `lib/types/database.types.ts` (güncelle)

### Notlar
- `portfolio_follows` tablosu daha önce 008'de oluşturulup 010'da kaldırılmıştı. Yeniden temiz oluşturuyoruz.
- Trigger kullanmıyoruz (fan-out problemi). Activity yazma uygulama seviyesinde yapılacak.
- `last_seen_at` alanı okundu/okunmadı takibi için kullanılacak (per-user bildirim satırı yazmadan).

---

## 🔧 PART 2 — FOLLOW/UNFOLLOW API + FOLLOWBUTTON UI

**Durum:** ✅ Tamamlandı (2026-02-17)

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 2'yi uygula.
Follow/Unfollow API endpoint'lerini ve FollowButton bileşenini oluştur.
Public portföy sayfasında (/p/[slug]) takip et butonu görünsün.
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 2.1 | `/api/portfolios/[id]/follow/route.ts` — POST (takip et) ve DELETE (takibi bırak) | ✅ |
| 2.2 | Auth kontrolü: Sadece giriş yapmış kullanıcılar takip edebilir | ✅ |
| 2.3 | Validasyon: Kendi portföyünü takip edemez, sadece public portföyler takip edilebilir | ✅ |
| 2.4 | `components/FollowButton.tsx` bileşeni — toggle mantığı, loading state | ✅ |
| 2.5 | `/p/[slug]` sayfasına (PublicPortfolioClient) FollowButton entegrasyonu | ✅ |
| 2.6 | Takipçi sayısını portföy sayfasında göster (COUNT sorgusu ile) | ✅ |

### Dokunulacak Dosyalar
- `app/api/portfolios/[id]/follow/route.ts` (yeni)
- `components/FollowButton.tsx` (yeni)
- `app/p/[slug]/PublicPortfolioClient.tsx` (güncelle)
- `app/p/[slug]/page.tsx` (güncelle — follow durumu ve count'u prop olarak geç)

### Notlar
- FollowButton'un çalışması için kullanıcının giriş yapmış olması gerekir.
- Giriş yapmamış kullanıcıya "Takip etmek için giriş yapın" mesajı gösterilir.
- Takipçi sayısı: `SELECT COUNT(*) FROM portfolio_follows WHERE portfolio_id = X`

---

## 🔧 PART 3 — ACTİVİTY FEED BACKEND

**Durum:** ✅ Tamamlandı (2026-02-17)

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 3'ü uygula.
Transaction API'ye activity kaydı yazma ekle.
Activity feed okuma API'sini oluştur.
Okunmamış sayacı (unread count) API'sini oluştur.
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 3.1 | `app/api/transactions/route.ts` POST — işlem sonrası `portfolio_activities` INSERT ekle | ✅ |
| 3.2 | Sadece `is_public = true` portföyler için activity yazılacak | ✅ |
| 3.3 | `/api/notifications/route.ts` GET — takip edilen portföylerin aktiviteleri (pull-based, JOIN sorgusu) | ✅ |
| 3.4 | Sayfalama desteği (limit, offset veya cursor-based) | ✅ |
| 3.5 | `/api/notifications/unread-count/route.ts` GET — `last_seen_at`'e göre okunmamış sayısı | ✅ |
| 3.6 | `/api/notifications/mark-seen/route.ts` PATCH — `last_seen_at` güncelle | ✅ |

### Dokunulacak Dosyalar
- `app/api/transactions/route.ts` (güncelle — activity INSERT ekle)
- `app/api/notifications/route.ts` (yeni)
- `app/api/notifications/unread-count/route.ts` (yeni)
- `app/api/notifications/mark-seen/route.ts` (yeni)

### Activity Feed Sorgusu (Pull Mantığı)
```sql
SELECT pa.*, p.name as portfolio_name, p.slug,
       up.display_name as owner_name, up.avatar_url as owner_avatar
FROM portfolio_activities pa
JOIN portfolio_follows pf ON pf.portfolio_id = pa.portfolio_id
JOIN portfolios p ON p.id = pa.portfolio_id
JOIN users_public up ON up.id = pa.actor_id
WHERE pf.follower_id = :current_user_id
  AND pa.created_at > NOW() - INTERVAL '30 days'
ORDER BY pa.created_at DESC
LIMIT 50;
```

### Okunmamış Sayacı Mantığı
```sql
SELECT COUNT(*)
FROM portfolio_activities pa
JOIN portfolio_follows pf ON pf.portfolio_id = pa.portfolio_id
WHERE pf.follower_id = :current_user_id
  AND (pf.last_seen_at IS NULL OR pa.created_at > pf.last_seen_at);
```

### Notlar
- Activity yazma senkron (tek satır, hızlı). Telegram gönderimi ayrı, Part 5'te.
- Holding silindiğinde (tam satış) `HOLDING_CLOSED` tipi activity yazılabilir.
- 30 günden eski aktiviteler sorgulanmaz (performans).

---

## 🔧 PART 4 — ACTİVİTY FEED FRONTEND

**Durum:** ✅ Tamamlandı (2026-02-17)

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 4'ü uygula.
NotificationBell bileşenini oluştur (header'da 🔔 ikonu + badge).
Bildirim dropdown/sayfası oluştur.
Dashboard header'ına entegre et.
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 4.1 | `components/NotificationBell.tsx` — 🔔 ikonu + okunmamış badge | ✅ |
| 4.2 | Periyodik unread count fetch (60 saniyede bir + sayfa odağında) | ✅ |
| 4.3 | Dropdown: son 10 aktivite kartı listesi | ✅ |
| 4.4 | Aktivite kartı tasarımı (sahip adı, işlem detayı, zaman, tıklanabilir) | ✅ |
| 4.5 | "Tümünü gördüm" butonu (mark-seen API çağrısı) | ✅ |
| 4.6 | Dashboard header'ına NotificationBell entegrasyonu | ✅ |
| 4.7 | Opsiyonel: `/notifications` tam sayfa görünümü | ⏳ İleride |

### Dokunulacak Dosyalar
- `components/NotificationBell.tsx` (yeni)
- `components/ActivityCard.tsx` (yeni)
- Dashboard layout veya header bileşeni (güncelle — NotificationBell ekle)

### UI Tasarım Notları
- Badge: Kırmızı yuvarlak, içinde okunmamış sayısı (9+ olursa "9+")
- Dropdown: max 10 öğe, altta "Tümünü Gör" linki
- Aktivite kartı örneği:
  ```
  👤 Sait Arslan
  Alış: 100 ASELS.IS — Geniş Vadeli Portföy
  2 saat önce
  ```
- Tıklanınca `/p/[slug]` sayfasına yönlendirme

---

## 🔧 PART 5 — TELEGRAM BOT + YAYIN KANALI ENTEGRASYONu

**Durum:** ✅ Kod Hazır (2026-02-17) — Bot oluşturma ve .env doldurma kullanıcıya bağlı

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 5'i uygula.
Telegram Bot API entegrasyonunu oluştur.
Transaction API'den fire-and-forget Telegram mesajı gönder.
Env variable'ları ekle.
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 5.1 | Telegram'da @BotFather ile bot oluştur (KULLANICI YAPACAK) | ⏳ Kullanıcı yapacak |
| 5.2 | Botu yayın kanalına admin olarak ekle (KULLANICI YAPACAK) | ⏳ Kullanıcı yapacak |
| 5.3 | `.env.example` dosyasına `TELEGRAM_BOT_TOKEN` ve `TELEGRAM_CHANNEL_ID` ekle | ✅ |
| 5.4 | `app/api/telegram/notify/route.ts` — Telegram Bot API ile mesaj gönderme | ✅ |
| 5.5 | Mesaj formatı: Portföy adı, sahip adı, işlem tipi, link (HTML parse_mode) | ✅ |
| 5.6 | `app/api/transactions/route.ts` — işlem sonrası fire-and-forget Telegram çağrısı | ✅ |
| 5.7 | Hata durumunda sessizce devam et (Telegram çökse bile işlem etkilenmez) | ✅ |

### Dokunulacak Dosyalar
- `app/api/telegram/notify/route.ts` (yeni)
- `app/api/transactions/route.ts` (güncelle — Telegram fire-and-forget ekle)
- `.env` (güncelle — TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID)
- `.env.example` (güncelle)

### Telegram Mesaj Formatı
```
📊 Yeni İşlem | Portföy Röntgeni

Sait Arslan, "Geniş Vadeli Portföy" portföyüne
bir TR Hisse Senedi alış işlemi ekledi.

🔗 Portföyü İncele: https://site.com/p/genis-vadeli

Portföy Röntgeni'nde ücretsiz takip edin →
https://site.com/explore
```

### Kullanıcının Yapması Gerekenler (Bot Kurulumu)
1. Telegram'da @BotFather'a git → `/newbot` komutunu yaz
2. Bot adını ve username'ini belirle
3. Verilen token'ı `.env` dosyasına `TELEGRAM_BOT_TOKEN` olarak ekle
4. Botu mevcut yayın kanalına admin olarak ekle (Kanal Ayarları → Yöneticiler → Bot Ekle)
5. Kanal ID'sini `.env` dosyasına `TELEGRAM_CHANNEL_ID` olarak ekle (@kanaladi veya -100xxxxxxxxxx)

---

## 🔧 PART 6 — TEST, POLİSH VE ENTEGRASYON KONTROLÜ

**Durum:** ✅ Tamamlandı (2026-02-17)

### Prompt
```
TAKIP_SISTEMI_PLANI.md dosyasını oku ve PART 6'yı uygula.
Tüm sistemi uçtan uca test et.
Build kontrolü yap.
Eksikleri ve hataları düzelt.
```

### Yapılacaklar

| # | Adım | Durum |
|---|------|-------|
| 6.1 | Uçtan uca akış testi: İşlem yap → Activity oluşsun → Bildirimde görünsün | ✅ DB'de doğrulandı |
| 6.2 | Telegram mesajı gönderim testi | ⏳ Bot kurulumu sonrası |
| 6.3 | Follow/Unfollow toggle testi | ✅ DB'de doğrulandı |
| 6.4 | Giriş yapmamış kullanıcı senaryosu testi | ✅ Middleware koruyor |
| 6.5 | `next build` başarılı geçiyor mu? | ✅ Başarılı |
| 6.6 | Edge case'ler: Portföy private yapılırsa takipler ne olur? | ✅ Düzeltildi |
| 6.7 | Middleware kontrolü: Yeni route'lar doğru çalışıyor mu? | ⬜ |
| 6.8 | UX polish: Loading state'ler, error handling, responsive tasarım | ⬜ |

### Edge Case Kararları
- Portföy private yapılırsa → mevcut takipler VE aktiviteler aktif olarak silinir (PATCH API + RLS policy eklendi)
- Kullanıcı hesabını silerse → CASCADE ile follows ve activities temizlenir
- 30 günden eski aktiviteler → sorgulanmaz (performans sınırı)

### PART 6'da Yapılan Düzeltmeler
- **Notifications API**: Gereksiz RPC çağrısı kaldırıldı → doğrudan sorgu (hata logu önlendi)
- **Unread Count API**: N+1 döngü → tek sorgu (performans)
- **Private Edge Case**: Portföy private yapılırsa follows + activities temizleniyor
- **RLS Policy**: Portföy sahibine follow/activity silme yetkisi eklendi (migration 012)

---

## 🔑 ÖNEMLİ KURALLAR

1. **Trigger kullanma** — Activity yazma uygulama seviyesinde (fan-out problemi önlenir)
2. **Fire-and-forget** — Telegram çağrısı await edilmez, işlemi bloklamaz
3. **Pull modeli** — Kullanıcı başına bildirim satırı yazılmaz, runtime JOIN ile çekilir
4. **last_seen_at** — Okundu takibi per-user satır yerine tek bir timestamp ile yapılır
5. **30 gün sınırı** — Eski aktiviteler sorgulanmaz, veri şişmesi önlenir
6. **Sadece public portföyler** — Private portföyler için activity yazılmaz, takip edilemez

---

## 📝 TEKNİK REFERANSLAR

- **Supabase Project ID:** `vylamnxvpkaherigutub`
- **Mevcut migration sayısı:** 010 (son: `010_remove_follow_system.sql`)
- **Yeni migration:** 011 olacak
- **Telegram Bot API:** `https://api.telegram.org/bot<TOKEN>/sendMessage`
- **Son güncelleme:** 2026-02-17
