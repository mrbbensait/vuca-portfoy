# Vercel Deploy Kontrol Listesi

Bu dosya, local'de yapılan değişikliklerin Vercel'e yüklenirken yapılması gereken işlemleri içerir.

---

## Telegram Entegrasyonu (Şubat 2026)

### 1. Vercel Environment Variables

Vercel Dashboard → Proje → Settings → Environment Variables bölümüne şu değişkeni ekle:

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `TELEGRAM_ENCRYPTION_KEY` | 64 hex karakter (32 byte). Bot token'larını şifrelemek için kullanılır. **Asla değiştirme** — değiştirirsen kayıtlı tüm token'lar bozulur. | `ec0409aa256c254cb29c8ced85b36ddf421681cc37512c95e6f7fb3d313a1ef0` |

> ⚠️ `.env` dosyasındaki mevcut key değerini kopyala — local ve Vercel'de AYNI key olmalı.

Zaten mevcut olan (kontrol et):
- `TELEGRAM_BOT_TOKEN` — Ana kanal bot token'ı
- `TELEGRAM_CHANNEL_ID` — Ana kanal ID'si (`@rontgentest1` gibi)
- `NEXT_PUBLIC_APP_URL` — Uygulama URL'i

---

### 2. Supabase Migration

Migration `015_portfolio_telegram_integration` Supabase'e uygulandı (Şubat 2026).
`portfolios` tablosuna şu alanlar eklendi:
- `telegram_enabled` (boolean)
- `telegram_bot_token` (text, şifrelenmiş)
- `telegram_channel_id` (text)

Production Supabase'de bu migration zaten çalıştırıldı — tekrar çalıştırmana gerek yok.

---

### 3. Yeni Dosyalar (Vercel'e otomatik gider, git push yeterli)

| Dosya | Açıklama |
|-------|----------|
| `lib/telegram/encryption.ts` | AES-256-GCM şifreleme/çözme |
| `lib/telegram/sendMessage.ts` | Hibrit bildirim gönderici + mesaj oluşturucular |
| `app/api/portfolios/[id]/telegram/route.ts` | Telegram ayarları GET/PUT/DELETE |
| `app/api/telegram/test/route.ts` | Test mesajı gönderme endpoint'i |
| `components/TelegramSettings.tsx` | Ayarlar sayfası Telegram paneli |
| `components/TelegramHelpModal.tsx` | Adım adım kurulum rehberi modal'ı |

---

### 4. Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `app/settings/page.tsx` | Telegram paneli eklendi |
| `app/api/transactions/route.ts` | Hibrit bildirim sistemine geçildi |
| `app/api/announcements/route.ts` | Hibrit bildirim sistemine geçildi |
| `.env.example` | `TELEGRAM_ENCRYPTION_KEY` alanı eklendi |

---

### 5. Nasıl Çalışıyor (Özet)

```
Public portföyde işlem/duyuru yapıldı
           │
           ▼
   Kullanıcının kendi telegram_enabled = true mi?
    ├── Evet → Kullanıcının kanalına bildirim gönder
    └── Hayır → Atla
           │
           ▼
   Her zaman → Ana kanala (TELEGRAM_BOT_TOKEN) bildirim gönder
```

Kullanıcılar `/settings` sayfasından kendi Telegram kanallarını bağlayabilir.

---

### 6. Private Kanal ID Formatı

Telegram private kanallar için ID formatı: `-100XXXXXXXXXX`

Örnek: Telegram'dan `-3563386613` geldiyse sisteme `-1003563386613` girilmeli.
(Kod otomatik düzeltiyor ama kullanıcıya da belirtmek iyi olur.)

---

## Deploy Adımları (Sırayla)

1. `git add -A`
2. `git commit -m "feat: Telegram per-portfolio integration"`
3. `git push`
4. Vercel Dashboard → **Environment Variables** → `TELEGRAM_ENCRYPTION_KEY` ekle
5. Vercel yeniden deploy eder (otomatik)
6. Deploy sonrası `/settings` sayfasında Telegram panelini test et

---

*Son güncelleme: Şubat 2026*
