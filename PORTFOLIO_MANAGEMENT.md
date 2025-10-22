# Çoklu Portfolio Yönetimi

## Genel Bakış

Kullanıcılar artık birden fazla portfolio oluşturabilir ve yönetebilir. Her portfolio tamamen izole edilmiş durumda:
- Varlıklar (holdings)
- İşlem geçmişi (transactions)
- Notlar (notes)  
- Uyarılar (alerts)

## Database Yapısı

### ✅ Mevcut Yapı Zaten Uygun!

Tüm tablolar `portfolio_id` foreign key ile bağlı:

```sql
holdings    → portfolio_id (CASCADE DELETE)
transactions → portfolio_id (CASCADE DELETE)
notes       → portfolio_id (CASCADE DELETE)
alerts      → portfolio_id (CASCADE DELETE)
```

### Yeni Migration

**`007_unique_portfolio_per_user.sql`** - Aynı kullanıcı aynı isimde iki portfolio oluşturamaz.

```sql
ALTER TABLE portfolios
ADD CONSTRAINT unique_user_portfolio_name UNIQUE (user_id, name);
```

## Yeni Özellikler

### 1. Portfolio Context (`PortfolioContext.tsx`)

Global state yönetimi:
- `portfolios`: Kullanıcının tüm portfolyoları
- `activePortfolio`: Seçili portfolio
- `loading`: Yükleme durumu
- CRUD operasyonları (create, update, delete, refresh)

```typescript
const { activePortfolio, portfolios, createPortfolio, deletePortfolio } = usePortfolio()
```

### 2. Portfolio Seçici (`PortfolioSelector.tsx`)

Navigation'da görünen dropdown component:
- Portfolio seçme
- Yeni portfolio oluşturma
- Portfolio adını düzenleme
- Portfolio silme (en az 1 portfolio kalmalı)

### 3. API Endpoints (`/api/portfolios/route.ts`)

- `GET` - Kullanıcının portfolyolarını listele
- `POST` - Yeni portfolio oluştur
- `PATCH` - Portfolio adını güncelle
- `DELETE` - Portfolio sil (CASCADE ile tüm ilişkili veriler de silinir)

## Güncellenen Componentler

### `Dashboard.tsx`
- Client component'e dönüştürüldü
- `activePortfolio`'ya göre filtreleme yapıyor
- Portfolio değiştiğinde otomatik yenileniyor

### `AddTransactionButton.tsx`
- Artık `activePortfolio` kullanıyor
- Gereksiz portfolio fetch kodu kaldırıldı

### `Navigation.tsx`
- PortfolioSelector component eklendi

### Pages
- `app/page.tsx` - PortfolioProvider eklendi
- `app/portfolio/page.tsx` - PortfolioProvider eklendi

## Kullanım

### Yeni Portfolio Oluşturma

1. Navigation'daki portfolio selector'a tıkla
2. "Yeni Portfolio" butonuna bas
3. İsim gir ve "Oluştur"a tıkla

### Portfolio Seçme

1. Navigation'daki portfolio selector'a tıkla
2. Listeden bir portfolio seç
3. Tüm sayfa otomatik olarak seçili portfolio'ya göre güncellenir

### Portfolio Silme

1. Portfolio selector'ı aç
2. Silmek istediğin portfolio'nun yanındaki çöp kutusu ikonuna tıkla
3. Onay ver
4. ⚠️ **DİKKAT:** Portfolio ve içindeki TÜM veriler silinir (CASCADE)

## Güvenlik

- **RLS Politikaları**: Her kullanıcı sadece kendi portfolyolarını görebilir
- **UNIQUE Constraint**: Aynı kullanıcı aynı isimde birden fazla portfolio oluşturamaz
- **Minimum Portfolio**: En az 1 portfolio bulunmalıdır (silinemez)

## Migration Talimatları

1. Supabase Dashboard'a git → SQL Editor
2. `supabase/migrations/007_unique_portfolio_per_user.sql` içeriğini kopyala
3. SQL Editor'e yapıştır ve çalıştır

```sql
-- Duplicate kayıtları temizle
DELETE FROM portfolios
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM portfolios
  ORDER BY user_id, name, created_at ASC
);

-- UNIQUE constraint ekle
ALTER TABLE portfolios
ADD CONSTRAINT unique_user_portfolio_name UNIQUE (user_id, name);
```

## LocalStorage

Aktif portfolio ID localStorage'da saklanır:
- Key: `activePortfolioId`
- Kullanıcı sayfayı yenilediğinde son seçtiği portfolio hatırlanır

## Gelecek Geliştirmeler

- [ ] Portfolio raporları (PDF export)
- [ ] Portfolio karşılaştırma
- [ ] Portfolio paylaşma (read-only link)
- [ ] Portfolio arşivleme
- [ ] Bulk varlık transfer (portfolio'lar arası)
