# 🎯 Sembol Standardizasyonu Sistemi

## 📖 Genel Bakış

VUCA-PortFoy'da artık **tutarlı sembol formatı** kullanılıyor. Kullanıcılar istedikleri gibi girebilir (BTC, BTCUSD, BTCUSDT), sistem bunları otomatik olarak standart formata çevirir.

## 🎨 Kullanıcı Deneyimi

### Kripto Para İçin

**Kullanıcı ne girer:**
- `BTC`
- `btc`
- `BTCUSD`
- `btcusdt`

**Sistem ne kaydeder:**
- `BTCUSDT` ✅

**UI'da ne gösterir:**
- "✨ **BTC** → **BTCUSDT** olarak kaydedilecek"
- Girdi alanında yeşil ✓ ikonu

### Türk Hisse İçin

**Kullanıcı ne girer:**
- `ASELS`
- `asels`
- `ASELS.IS`

**Sistem ne kaydeder:**
- `ASELS.IS` ✅

### ABD Hisse İçin

**Kullanıcı ne girer:**
- `AAPL`
- `aapl`

**Sistem ne kaydeder:**
- `AAPL` ✅

---

## 🏗️ Teknik Mimari

### 1. Normalizasyon Katmanı

```typescript
// lib/normalizeSymbol.ts
normalizeSymbol('BTC', 'CRYPTO')
// → { normalized: 'BTCUSDT', displayName: 'BTC', base: 'BTC' }

normalizeSymbol('ASELS', 'TR_STOCK')
// → { normalized: 'ASELS.IS', displayName: 'ASELS', base: 'ASELS' }
```

### 2. API Katmanı

```typescript
// app/api/price/quote/route.ts

// Önce: symbol'ü olduğu gibi kullan
const symbol = request.query.symbol // "BTC", "BTCUSD", "BTCUSDT"

// Sonra: symbol'ü normalize et
const { normalized } = normalizeSymbol(symbol, assetType)
// normalized = "BTCUSDT" (hepsi için)
```

### 3. UI Katmanı

```typescript
// components/AddTransactionButton.tsx

// Kullanıcı "BTC" yazdığında:
1. Validasyon: ✅ Geçerli
2. Normalizasyon: "BTC" → "BTCUSDT"
3. UI Feedback: "✨ BTC → BTCUSDT olarak kaydedilecek"
4. Fiyat Çek: /api/price/quote?symbol=BTC (API normalize eder)
5. Submit: "BTCUSDT" olarak kaydedilir
```

---

## 📋 Standart Formatlar

| Asset Type | Girdi Örnekleri | Standart Format | Açıklama |
|------------|----------------|-----------------|----------|
| **CRYPTO** | BTC, BTCUSD, BTCUSDT | `BTCUSDT` | Tüm kripto USDT pair'i |
| **TR_STOCK** | ASELS, asels, ASELS.IS | `ASELS.IS` | Yahoo Finance formatı (.IS suffix) |
| **US_STOCK** | AAPL, aapl | `AAPL` | Büyük harf |
| **CASH** | TRY, try | `TRY` | Büyük harf |

---

## ✅ Avantajlar

### 1. Duplicate Önleme
❌ **Önce:**
```
User 1: XRPUSD (2 hafta önce)
User 1: XRPUSDT (bugün)
→ İki ayrı varlık, karışıklık!
```

✅ **Sonra:**
```
User 1: XRP girdi → XRPUSDT kaydedildi
User 1: XRPUSD girdi → XRPUSDT kaydedildi
→ Tek varlık, tutarlılık!
```

### 2. Otomatik Düzeltme
- Kullanıcı büyük/küçük harf yaparsa → Otomatik büyük harf
- Kullanıcı farklı pair girerse → Otomatik USDT'ye çevir
- Kullanıcı eksik suffix girerse → Otomatik ekle

### 3. Net UI Feedback
```
┌─────────────────────────────────────────┐
│ Sembol: BTC                              │
│ ✓ Sadece kripto adını girin             │
│                                          │
│ ✨ BTC → BTCUSDT olarak kaydedilecek    │
│                                          │
│ ✅ Bitcoin                               │
│    Güncel Fiyat: $43,250.00             │
└─────────────────────────────────────────┘
```

### 4. API Tutarlılığı
- Binance API: `BTCUSDT` bekler ✅
- Yahoo Finance: `BTC-USD` veya `ASELS.IS` bekler ✅
- Cache: Tek formatta saklanır ✅

---

## 🔒 Güvenlik ve Validasyon

### 1. Girdi Validasyonu
```typescript
validateSymbol('BTC$', 'CRYPTO')
// → { valid: false, error: 'Sadece harf ve sayı kullanın' }

validateSymbol('A', 'CRYPTO')
// → { valid: false, error: 'Sembol en az 2 karakter olmalı' }

validateSymbol('BTC', 'CRYPTO')
// → { valid: true }
```

### 2. Hata Mesajları
- **Boş sembol:** "Sembol boş olamaz"
- **Çok kısa:** "Sembol en az 2 karakter olmalı"
- **Geçersiz karakter:** "Sadece harf ve sayı kullanın (örn: BTC, ETH, XRP)"
- **Fiyat bulunamadı:** "Fiyat bilgisi bulunamadı. Lütfen sembolü kontrol edin."

### 3. Submit Engelleme
Submit butonu devre dışı kalır eğer:
- Sembol hatası varsa (kırmızı kenarlık)
- Fiyat çekiliyor ise (mavi loading)
- Form submit ediliyor ise (disabled)

---

## 🚀 Nasıl Kullanılır?

### Yeni İşlem Eklerken

1. **İşlem Ekle** butonuna tıkla
2. **Varlık Türü** seç (Kripto)
3. **Sembol** gir:
   - Sadece `BTC` yaz (önerilen)
   - Veya `BTCUSD` yaz
   - Veya `BTCUSDT` yaz
4. **Otomatik feedback** gör:
   - ✓ Yeşil tik (geçerli)
   - "BTC → BTCUSDT olarak kaydedilecek"
   - Güncel fiyat gösterilir
5. **Ekle** butonuna bas
6. Veritabanında `BTCUSDT` olarak kaydedilir ✅

### Mevcut Varlıklarda

Eski formatlar (BTC, BTCUSD) hala çalışır, ancak yeni kayıtlar standart formatta olacak. Migration rehberine bakarak eski kayıtları güncelleyebilirsiniz.

---

## 📚 İlgili Belgeler

- **Teknik Detaylar:** [`lib/normalizeSymbol.ts`](lib/normalizeSymbol.ts)
- **Migration Rehberi:** [`SYMBOL_NORMALIZATION_MIGRATION.md`](SYMBOL_NORMALIZATION_MIGRATION.md)
- **Fiyat Sistemi:** [`PRICE_SYSTEM_ARCHITECTURE.md`](PRICE_SYSTEM_ARCHITECTURE.md)

---

## 🔮 Gelecek İyileştirmeler

- [ ] Real-time sembol önerileri (autocomplete)
- [ ] Yaygın hatalar için otomatik düzeltme önerileri
- [ ] Coin logoları gösterme
- [ ] Multi-pair desteği (USDT, BUSD, EUR pairs)

---

## 🆘 SSS

### S: Eski işlemlerim ne olacak?
**C:** Eski işlemleriniz korunur. İsterseniz migration rehberini kullanarak standart formata çevirebilirsiniz.

### S: BTC yerine BTCUSD yazarsam sorun olur mu?
**C:** Hayır, sistem otomatik olarak BTCUSDT'ye çevirir.

### S: Neden USDT standardı seçildi?
**C:** 
- Binance'de en yaygın pair
- En yüksek likidite
- Endüstri standardı
- Yahoo Finance de destekliyor

### S: BUSD veya USDC kullanabilir miyim?
**C:** Girebilirsiniz, ancak sistem USDT'ye normalize eder. Bu fiyat tutarlılığı için gerekli.

### S: Fiyat neden USD gösteriliyor ama USDT kullanıyoruz?
**C:** USDT, USD'ye sabitlenmiş bir stablecoin. Fiyatlar pratikte aynı (1 USDT ≈ 1 USD).

---

**Güncelleme:** 2025-01-22  
**Versiyon:** 1.0.0  
**Yazar:** VUCA-PortFoy Development Team
