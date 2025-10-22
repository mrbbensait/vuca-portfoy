# 🔧 Sembol Normalizasyon Migrasyonu

## 📋 Özet

Bu belge, mevcut veritabanındaki **duplicate kripto sembolleri** sorununu çözmek için gerekli adımları içerir.

## ❌ Problem

Kullanıcılar aynı kripto için farklı formatlar girebiliyordu:
- `BTC` (sadece base)
- `BTCUSD` (USD pair)
- `BTCUSDT` (USDT pair)

Bu, aynı varlık için birden fazla kayıt oluşturuyordu ve kullanıcı karmaşası yaratıyordu.

## ✅ Çözüm

**Tüm kripto sembolleri `USDT` standardına normalize edildi:**
- `BTC` → `BTCUSDT`
- `BTCUSD` → `BTCUSDT`
- `XRPUSD` → `XRPUSDT`

## 🚀 Yapılan Değişiklikler

### 1. Kod Tarafı
- ✅ `lib/normalizeSymbol.ts` - Sembol normalizasyon utility'si
- ✅ `app/api/price/quote/route.ts` - Price API güncellemesi
- ✅ `components/AddTransactionButton.tsx` - UI validasyonu

### 2. Veritabanı Tarafı

Mevcut verilerde duplicate sembolleri temizlemek için aşağıdaki adımları izleyin.

---

## 📊 1. Duplicate Sembolleri Tespit Etme

Önce hangi sembollerin duplicate olduğunu görelim:

```sql
-- Aynı portföyde, aynı asset_type'da, farklı sembol formatlarıyla kaydedilmiş holdings'leri bul
WITH normalized_symbols AS (
  SELECT 
    h.*,
    CASE 
      WHEN h.asset_type = 'CRYPTO' THEN
        -- Crypto için USDT'ye normalize et
        REGEXP_REPLACE(h.symbol, '(USD|BUSD|USDC|TUSD|DAI)$', '', 'i') || 'USDT'
      ELSE
        h.symbol
    END as normalized_symbol
  FROM holdings h
)
SELECT 
  portfolio_id,
  asset_type,
  normalized_symbol,
  array_agg(DISTINCT symbol) as variants,
  COUNT(DISTINCT symbol) as variant_count,
  array_agg(id) as holding_ids,
  SUM(quantity) as total_quantity
FROM normalized_symbols
WHERE asset_type = 'CRYPTO'
GROUP BY portfolio_id, asset_type, normalized_symbol
HAVING COUNT(DISTINCT symbol) > 1
ORDER BY variant_count DESC, portfolio_id;
```

**Çıktı örneği:**
```
portfolio_id | asset_type | normalized_symbol | variants              | variant_count | total_quantity
-------------|------------|-------------------|-----------------------|---------------|---------------
abc-123      | CRYPTO     | XRPUSDT           | {XRP, XRPUSD, XRPUSDT}| 3             | 1500
def-456      | CRYPTO     | BTCUSDT           | {BTC, BTCUSDT}        | 2             | 0.5
```

---

## 🔧 2. Manuel Temizleme Seçeneği

Eğer duplicate sayısı az ise, manuel olarak temizleyebilirsiniz:

### Adım 1: Duplicate İşlemleri Görüntüle

```sql
-- Örnek: XRPUSD ve XRPUSDT için tüm işlemleri göster
SELECT 
  t.id,
  t.symbol,
  t.side,
  t.quantity,
  t.price,
  t.date,
  t.created_at
FROM transactions t
WHERE 
  t.portfolio_id = 'YOUR_PORTFOLIO_ID'
  AND t.asset_type = 'CRYPTO'
  AND (t.symbol = 'XRPUSD' OR t.symbol = 'XRPUSDT')
ORDER BY t.date, t.created_at;
```

### Adım 2: Eski Formatları Güncelle

```sql
-- XRPUSD'yi XRPUSDT'ye çevir
UPDATE transactions
SET symbol = 'XRPUSDT'
WHERE 
  portfolio_id = 'YOUR_PORTFOLIO_ID'
  AND asset_type = 'CRYPTO'
  AND symbol = 'XRPUSD';

-- Diğer varyantlar için de tekrarla
UPDATE transactions
SET symbol = 'XRPUSDT'
WHERE 
  portfolio_id = 'YOUR_PORTFOLIO_ID'
  AND asset_type = 'CRYPTO'
  AND symbol = 'XRP';
```

### Adım 3: Holdings'i Yeniden Hesapla

Holdings'ler otomatik olarak transaction'lardan hesaplandığı için, backend'de bir refresh fonksiyonu çağırın veya sayfayı yeniden yükleyin.

---

## 🤖 3. Otomatik Toplu Temizleme

Birçok kullanıcı ve duplicate varsa, otomatik script kullanın:

```sql
-- ⚠️ DİKKAT: Bu script tüm crypto transaction'larını normalize eder
-- Önce BACKUP alın!

BEGIN;

-- 1. Crypto transaction'larını normalize et
UPDATE transactions
SET symbol = REGEXP_REPLACE(symbol, '(USD|BUSD|USDC|TUSD|DAI)$', '', 'i') || 'USDT'
WHERE 
  asset_type = 'CRYPTO'
  AND symbol !~ 'USDT$';

-- 2. Değişiklikleri kontrol et
SELECT 
  COUNT(*) as updated_count,
  COUNT(DISTINCT symbol) as unique_symbols
FROM transactions
WHERE asset_type = 'CRYPTO';

-- 3. Her şey yolundaysa commit et
-- COMMIT;

-- Sorun varsa rollback et
-- ROLLBACK;
```

---

## 🧪 4. Test ve Doğrulama

### Test 1: Duplicate Kalmadı mı?

```sql
-- Artık duplicate olmamalı
WITH normalized_symbols AS (
  SELECT 
    h.*,
    CASE 
      WHEN h.asset_type = 'CRYPTO' THEN
        REGEXP_REPLACE(h.symbol, '(USD|BUSD|USDC|TUSD|DAI)$', '', 'i') || 'USDT'
      ELSE
        h.symbol
    END as normalized_symbol
  FROM holdings h
)
SELECT 
  COUNT(*) as remaining_duplicates
FROM (
  SELECT portfolio_id, asset_type, normalized_symbol
  FROM normalized_symbols
  WHERE asset_type = 'CRYPTO'
  GROUP BY portfolio_id, asset_type, normalized_symbol
  HAVING COUNT(DISTINCT symbol) > 1
) duplicates;

-- Beklenen: 0
```

### Test 2: Yeni İşlemler Normalized mi?

Kullanıcı arayüzünden yeni bir kripto işlemi ekleyin:
- Girdi: `BTC`
- Beklenen: Veritabanında `BTCUSDT` olarak kaydedilmeli
- UI'da: `BTC → BTCUSDT olarak kaydedilecek` mesajı görünmeli

### Test 3: Fiyatlar Doğru mu?

```sql
-- Normalized sembollerin fiyatlarını kontrol et
SELECT 
  symbol,
  asset_type,
  price,
  updated_at
FROM price_cache
WHERE asset_type = 'CRYPTO'
AND symbol ~ 'USDT$'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 📝 5. Kullanıcı Bildirimi (Opsiyonel)

Eğer önemli değişiklikler yaptıysanız, kullanıcılara bilgi verin:

### UI Banner Ekleyin

```tsx
// components/SymbolNormalizationBanner.tsx
export default function SymbolNormalizationBanner() {
  const [dismissed, setDismissed] = useState(false)
  
  if (dismissed) return null
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <InfoIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700">
            <strong>Yenilik:</strong> Kripto sembolleri artık standart USDT formatında kaydediliyor. 
            Örneğin "BTC" otomatik olarak "BTCUSDT" olarak kaydedilecek. 
            Mevcut verileriniz etkilenmedi.
          </p>
        </div>
        <button onClick={() => setDismissed(true)}>
          <XIcon className="h-5 w-5 text-blue-400" />
        </button>
      </div>
    </div>
  )
}
```

---

## ⚠️ Önemli Notlar

### 1. Backup Alın
```bash
# Supabase Dashboard > Database > Backups
# Veya CLI ile:
supabase db dump > backup_before_normalization.sql
```

### 2. Test Ortamında Deneyin
Önce test/staging ortamında deneyin, sonra production'a geçin.

### 3. Holdings Yeniden Hesaplama
Holdings tablosu transaction'lardan hesaplandığı için, transaction'ları güncelledikten sonra holdings otomatik düzelir. Ancak cache'i temizlemek gerekebilir:

```sql
-- Holdings cache'i temizle (varsa)
DELETE FROM holdings_cache WHERE asset_type = 'CRYPTO';

-- Price cache'i temizle (varsa)
DELETE FROM price_cache WHERE asset_type = 'CRYPTO';
```

### 4. Migration Zamanlaması
En az kullanıcı trafiği olduğu saatte yapın (örn: gece 2-4 arası).

---

## 🎯 Sonuç

Bu migration sonrasında:
- ✅ Tüm kripto sembolleri `USDT` standardında
- ✅ Duplicate varlıklar birleştirildi
- ✅ Yeni işlemler otomatik normalize ediliyor
- ✅ UI kullanıcıya net rehberlik gösteriyor
- ✅ Fiyat API'si tutarlı çalışıyor

---

## 🆘 Sorun Giderme

### Sorun 1: "Fiyat bulunamadı" Hatası

**Neden:** Normalize edilmiş sembol Binance'de mevcut değil.

**Çözüm:**
```sql
-- Hangi semboller başarısız oluyor?
SELECT symbol, asset_type, COUNT(*) as error_count
FROM price_cache
WHERE asset_type = 'CRYPTO' 
  AND price IS NULL
GROUP BY symbol, asset_type;
```

Eğer bir coin gerçekten Binance'de yoksa (örn: küçük altcoin), Yahoo Finance fallback devreye girecek.

### Sorun 2: Holdings Miktarları Yanlış

**Neden:** Transaction'lar güncellenirken bir hata oldu.

**Çözüm:**
```sql
-- Transaction'ları tekrar gözden geçir
SELECT 
  symbol,
  side,
  SUM(quantity) as net_quantity
FROM transactions
WHERE 
  portfolio_id = 'YOUR_PORTFOLIO_ID'
  AND asset_type = 'CRYPTO'
  AND symbol = 'XRPUSDT'
GROUP BY symbol, side;
```

### Sorun 3: Cache Güncellenmiyor

**Çözüm:**
```sql
-- Cache'i manuel temizle
DELETE FROM price_cache 
WHERE asset_type = 'CRYPTO' 
  AND expires_at < NOW();
```

---

**Son Güncelleme:** 2025-01-22  
**Versiyon:** 1.0.0  
**Yazar:** VUCA-PortFoy Development Team
