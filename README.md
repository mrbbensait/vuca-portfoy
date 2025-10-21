# Portföy Röntgeni

TR hisse, ABD hisse ve kripto varlıklarınızı tek yerden yönetin.

## Özellikler

- Çoklu varlık desteği (TR/ABD hisse, kripto, nakit)
- Portföy analizi ve sağlık skoru
- Volatilite, korelasyon, çeşitlilik metrikleri
- Zaman çizelgesi ve grafikler
- Uyarılar ve not yönetimi

## Teknolojiler

- Next.js 15, TypeScript, Tailwind CSS
- Supabase (Postgres + Auth)
- Recharts

## Kurulum

### 1. Supabase Projesi

1. [supabase.com](https://supabase.com) → New Project
2. Project Settings > API bölümünden URL ve anon key'i kopyalayın
3. SQL Editor'de `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın

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
