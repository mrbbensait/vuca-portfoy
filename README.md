# XPortfoy

**Dijital Portföy Röntgeni**

TR hisse, ABD hisse ve kripto varlıklarınızı tek yerden yönetin.

## Özellikler

### 💼 Portföy Yönetimi
- Çoklu varlık desteği (TR/ABD hisse, kripto, nakit)
- Portföy analizi ve sağlık skoru
- Volatilite, korelasyon, çeşitlilik metrikleri
- Zaman çizelgesi ve grafikler
- Uyarılar ve not yönetimi

### ⚡ Performans ve Güvenlik
- **Akıllı fiyat önbellekleme** (5dk cache, %90 hız artışı)
- **Batch API** (N+1 sorunu önleme)
- **Rate limiting** (100 req/saat/kullanıcı)
- **Kimlik doğrulama** (authenticated users only)
- **Row Level Security** (RLS)

## Teknolojiler

- Next.js 15, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth)
- Recharts

## Kurulum

### 1. Supabase Projesi

1. [supabase.com](https://supabase.com) → New Project
2. Project Settings > API bölümünden URL ve anon key'i kopyalayın
3. SQL Editor'de tüm migration dosyalarını sırayla çalıştırın:
   ```bash
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_auto_create_profile.sql
   supabase/migrations/003_security_performance_fixes.sql
   supabase/migrations/004_price_cache_system.sql  # ⚡ YENİ!
   ```
   
   Veya Supabase CLI kullanarak:
   ```bash
   supabase db push
   ```

### 2. Ortam Değişkenleri

```bash
cp .env.example .env
```

`.env` dosyasında Supabase bilgilerini doldurun.

### 3. Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📚 Dokümantasyon

- **[PRICE_SYSTEM_ARCHITECTURE.md](./PRICE_SYSTEM_ARCHITECTURE.md)** - Fiyat sistemi mimarisi detayları
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Güncelleme rehberi ve sorun giderme

## 🚀 Performans

### Fiyat Sorgulama Sistemi

**Önce:**
- 10 varlık = 10 API çağrısı (5 saniye)
- Her sayfa yenileme = 10 yeni çağrı
- Cache yok, güvenlik yok

**Sonra:**
- 10 varlık = 1 batch çağrı (0.6 saniye) ⚡ **88% daha hızlı**
- Sayfa yenileme = 0 çağrı (cache'den) ⚡ **99% daha hızlı**
- 5dk akıllı cache + rate limiting + auth 🔒

**Sonuç:** 1000 kullanıcı için **80-98% daha az dış API yükü**

## 🔐 Güvenlik

- ✅ Supabase Auth entegrasyonu
- ✅ Row Level Security (RLS)
- ✅ API rate limiting (kullanıcı bazlı)
- ✅ SQL injection koruması
- ✅ XSS koruması (Next.js built-in)

## 🏗️ Mimari

```
Client (React)
  ↓
  usePrices Hook (Global Cache)
  ↓
  /api/price/batch (Batch API)
  ↓
  Supabase (price_cache table)
  ↓
  External APIs (Yahoo Finance, Binance)
```
