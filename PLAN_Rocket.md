# 🚀 VUCA-PortFoy: Kapsamlı İş Planı ve Teknik Mimari Dokümantasyonu

> **Proje Vizyonu:** Türkiye'de ilk profesyonel, çoklu piyasa portföy takip ve sosyal yatırım platformu

**Hazırlayan:** VUCA-PortFoy Development Team  
**Tarih:** 24 Ekim 2025

---

## 📋 İçindekiler

1. [Proje Özeti ve Vizyon](#1-proje-özeti-ve-vizyon)
2. [Mevcut Sistem Analizi](#2-mevcut-sistem-analizi)
3. [Teknik Altyapı](#3-teknik-altyapı)
4. [Database Mimarisi](#4-database-mimarisi)
5. [Sosyal Platform Özellikleri](#5-sosyal-platform-özellikleri)
6. [Genişletilmiş Piyasa Desteği](#6-genişletilmiş-piyasa-desteği)
7. [Gelişmiş Analiz Araçları](#7-gelişmiş-analiz-araçları)
8. [Bildirim Sistemi](#8-bildirim-sistemi)
9. [Ödeme ve Monetizasyon](#9-ödeme-ve-monetizasyon)
10. [Mobil Uygulama](#10-mobil-uygulama)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Maliyet ve Kaynak Planı](#12-maliyet-ve-kaynak-planı)

---

## 1. Proje Özeti ve Vizyon

### 1.1 Problem Statement

**Türkiye pazarındaki boşluklar:**

1. **Çoklu piyasa desteği eksikliği**
   - Kullanıcılar BİST, Nasdaq, kripto, altın, döviz yatırımlarını farklı platformlarda takip ediyor
   - Tek bir yerden portföy görüntüleme yok
   - Konsolide kar/zarar hesabı zorlaşıyor

2. **Sosyal yatırım platformu yok**
   - YouTuber'lar, finansal influencer'lar portföylerini şeffaf paylaşamıyor
   - Takipçiler güvendikleri kişilerin yatırımlarını takip edemiyor
   - Eğitim amaçlı portfolio sharing altyapısı yok

3. **Amatör yatırımcılar için araçlar yetersiz**
   - Karmaşık portföy analizi araçları profesyoneller için tasarlanmış
   - Basit, anlaşılır metrikler sunan platform eksikliği
   - Risk yönetimi ve diversifikasyon rehberliği yok

### 1.2 Çözüm: VUCA-PortFoy

**Tek cümlelik değer önerisi:**
> "Sevdiğin influencer'ların portföylerini takip et, kendi portföyünü yönet, tüm piyasaları tek yerden izle."

**Benzersiz özellikler:**
- ✅ **Çoklu piyasa:** BİST, Nasdaq, Avrupa borsaları, kripto, altın, döviz, ETF
- ✅ **Sosyal platform:** Influencer profilleri, portföy paylaşımı, takip/abonelik
- ✅ **Real-time bildirimler:** Portföy değişiklikleri, fiyat alertleri, yeni işlemler
- ✅ **Monetizasyon:** Influencer'lar ücretli aboneliklerle gelir sağlar
- ✅ **Amatör dostu:** Basit metrikler, görsel grafikler, eğitici içerik

### 1.3 Hedef Kitle

**Primer kullanıcılar:**

1. **Content Creator'lar (Influencer'lar)**
   - YouTuber'lar, finans bloggerları
   - 18-45 yaş, 10K+ takipçisi olan
   - Portföyünü şeffaf paylaşarak gelir elde etmek isteyen
   - **Örnek:** "Kripto Yatırımcı Ahmet" - 50K aboneli YouTube kanalı, aylık 100 ücretli abone × ₺50 = ₺5,000 gelir

2. **Abone Kullanıcılar (Takipçiler)**
   - İnfluencer portföylerini takip etmek isteyen
   - Yatırım eğitimi almak isteyen
   - 20-40 yaş, orta-üst gelir seviyesi
   - **Örnek:** Aylık ₺50-100 ödeyerek 2-3 influencer'ı takip eder

3. **Bireysel Yatırımcılar**
   - Kendi portföyünü profesyonel araçlarla yönetmek isteyen
   - Çoklu piyasada işlem yapan
   - **Örnek:** Hem BİST'te, hem Nasdaq'ta, hem kriptoda yatırımı olan kullanıcı

**Sekonder kullanıcılar:**
- Finansal danışmanlar ve müşterileri
- Yatırım kulüpleri
- Üniversite öğrencileri (yatırım öğrenme)

### 1.4 Pazar Büyüklüğü (Türkiye)

**Potansiyel kullanıcı tabanı:**
- Bireysel yatırımcı sayısı (BİST): ~2.5M
- Kripto yatırımcısı: ~5M (tahmini)
- Yatırım ile ilgilenen sosyal medya takipçisi: ~10M
- **TAM (Total Addressable Market):** ~5-7M kişi
- **SAM (Serviceable Addressable Market):** ~1M kişi (aktif, teknoloji kullanabilen)
- **SOM (Serviceable Obtainable Market):** İlk 3 yılda 50K-100K kullanıcı

**Gelir potansiyeli:**
- Freemium model: %90 ücretsiz, %10 ücretli
- Influencer abonelik: Ortalama ₺50/ay
- Premium özellikler: ₺20-30/ay
- İlk yıl hedef: 5K ücretli kullanıcı × ₺50 = ₺250K/ay = ₺3M/yıl

---

## 2. Mevcut Sistem Analizi

### 2.1 Çalışan Özellikler ✅

#### A. Temel Portföy Yönetimi
**Çoklu portföy desteği:**
- Kullanıcı sınırsız portföy oluşturabilir
- Portfolio switching navigation bar'dan tek tıkla
- Her portföy izole: varlıklar, işlemler, notlar, alertler ayrı

**Desteklenen varlıklar:**
- ✅ TR Hisse (BİST): `.IS` suffix ile (örn: ASELS.IS)
- ✅ US Hisse: Ticker sembol (örn: AAPL, GOOGL)
- ✅ Kripto: USDT pair'leri (örn: BTCUSDT, ETHUSDT)
- ✅ Nakit: TRY, USD, EUR

**Transaction management:**
- BUY/SELL işlemleri
- Commission/fee tracking
- Otomatik holdings hesaplama (FIFO)
- Transaction history

#### B. Enterprise-Level Fiyat Sistemi
**Mimari:**
- Batch API: 10 varlık = 1 API çağrısı (N+1 problemi yok)
- Akıllı cache: 15 dakika TTL, %90+ cache hit rate
- Rate limiting: 200 req/saat/kullanıcı
- Multi-source: Yahoo Finance + Binance API

**Performans metrikleri:**
```
İlk yükleme (10 varlık): 0.6s
Cache'den yükleme: 0.05s (99% hızlı)
API çağrı azalması: %90-95
Cache hit rate: %80-90
```

**Güvenlik:**
- Authenticated users only
- RPC-based rate limiting
- Graceful degradation (migration yoksa çalışır)

#### C. Güvenlik ve Authentication
- **Supabase Auth:** Email/password, magic link ready
- **Row Level Security (RLS):** Her kullanıcı sadece kendi verilerine erişir
- **API protection:** Rate limiting, auth token validation
- **SQL injection prevention:** Parametrize queries

#### D. Portföy Analizi (Temel)
- Toplam değer hesaplama
- Kar/zarar metrikleri
- Asset distribution (pie chart)
- Basic statistics

#### E. Yardımcı Özellikler
- **Not sistemi:** Pozisyon, haftalık, genel notlar
- **Alert sistemi:** Fiyat hedefi, portföy değişimi
- **Sembol normalizasyonu:** BTC → BTCUSDT otomatik
- **Transaction history:** Filtreleme, sıralama

### 2.2 Eksik Özellikler (Kritik Öncelikli) ⚠️

#### A. Sosyal Platform (YOK)
- ❌ Influencer profil sayfaları
- ❌ Portfolio sharing (public/subscriber-only)
- ❌ Takip/follow sistemi
- ❌ Ücretli abonelik sistemi
- ❌ Aktivite feed'i
- ❌ Portfolio değişiklik bildirim

#### B. Bildirim Sistemi (PASİF)
- ❌ Real-time push notifications
- ❌ Email notifications
- ❌ SMS alerts (opsiyonel)
- ❌ In-app notification center
- Alert kayıtları database'de var ama tetiklenmiyor

#### C. Ödeme Sistemi (YOK)
- ❌ Stripe/İyzico entegrasyonu
- ❌ Abonelik yönetimi
- ❌ Faturalama
- ❌ Influencer payout sistemi
- ❌ Platform komisyon mekanizması

#### D. Gelişmiş Piyasa Desteği (SINIRLI)
Mevcut: TR_STOCK, US_STOCK, CRYPTO, CASH

Eksik:
- ❌ Avrupa borsaları (DAX, FTSE, CAC40)
- ❌ Emtia detayları (Altın gram/ons, Gümüş, Petrol)
- ❌ Forex pairs (USDTRY, EURTRY detaylı)
- ❌ ETF'ler
- ❌ Tahviller
- ❌ Yatırım fonları

#### E. Gelişmiş Analiz (TEMEL SEVİYEDE)
Eksik:
- ❌ Sharpe ratio, Sortino ratio
- ❌ Beta, Alpha hesaplamaları
- ❌ Volatilite analizi (detaylı)
- ❌ Korelasyon matrisi
- ❌ Benchmark karşılaştırması (XU100, S&P500)
- ❌ Sektör analizi
- ❌ Risk skorlaması (detaylı)
- ❌ Portfolio backtesting
- ❌ What-if senaryoları

#### F. Mobil Uygulama (YOK)
- ❌ iOS app
- ❌ Android app
- ❌ Push notification desteği
- ❌ Offline mode

#### G. Real-Time Features (YOK)
- ❌ WebSocket price updates
- ❌ Live portfolio value
- ❌ Real-time follower activity
- ❌ Live trade notifications

---

## 3. Teknik Altyapı

### 3.1 Mevcut Stack

**Frontend:**
```yaml
Framework: Next.js 15 (App Router)
Language: TypeScript 5
UI: 
  - TailwindCSS 4 (styling)
  - Lucide Icons (iconography)
  - Recharts (charting)
React: v19
State Management:
  - React Context API (portfolio, theme)
  - TanStack Query v5 (server state)
```

**Backend:**
```yaml
Framework: Next.js API Routes (serverless ready)
Runtime: Node.js 20+
Authentication: Supabase Auth
Database: Supabase (PostgreSQL 15)
ORM/Query: Supabase JS Client
Storage: Supabase Storage (unused currently)
Real-time: Supabase Realtime (unused currently)
```

**External APIs:**
```yaml
Stock Prices:
  - Yahoo Finance API (free, TR & US stocks)
  - Binance API (free, crypto spot prices)

Rate Limits:
  - Yahoo: ~2000 req/hour
  - Binance: ~1200 req/minute
```

**Infrastructure:**
```yaml
Hosting: Vercel (önerilen)
  - Edge Functions
  - Automatic HTTPS
  - Global CDN
Database: Supabase Cloud
  - PostgreSQL 15
  - Built-in auth
  - Real-time subscriptions
  - Row Level Security (RLS)
```

**Development:**
```yaml
Package Manager: npm
Linting: ESLint 9
Type Checking: TypeScript strict mode
Git: Git + GitHub (önerilen)
```

### 3.2 Önerilen Yeni Teknolojiler

#### A. Ödeme Sistemi

**Global Payments:**
```yaml
Provider: Stripe
Use Cases:
  - Kredi kartı ödemeleri
  - Abonelik yönetimi (recurring billing)
  - Otomatik faturalandırma
  - Webhook'lar (ödeme durumu)
  - Customer portal
Pricing: %2.9 + ₺0.30 per transaction
```

**Turkey-Specific Payments:**
```yaml
Provider: İyzico (önerilen) / Param / PayTR
Use Cases:
  - Türk kredi kartları
  - Havale/EFT
  - Taksitli ödeme
  - 3D Secure
Pricing: %2-3 + ₺0.25 per transaction
```

**Kripto Ödemeler (Opsiyonel):**
```yaml
Provider: CoinPayments / BTCPay Server
Use Cases:
  - BTC, ETH, USDT ile ödeme
  - Decentralized
  - Düşük komisyon
Pricing: %0.5-1
```

#### B. Real-Time ve Bildirim Sistemi

**WebSocket ve Real-Time:**
```yaml
Provider: Supabase Realtime
Use Cases:
  - Portfolio değişiklik subscription
  - Live fiyat güncellemeleri (opsiyonel, expensive)
  - New follower notifications
  - Live chat (gelecek)
Pricing: Included in Supabase plan
```

**Push Notifications:**
```yaml
Web Push: 
  - Provider: OneSignal (free tier: 10K subscribers)
  - Use Case: Browser push notifications
  - Pricing: Free < 10K, then $9/month

Mobile Push:
  - Provider: Firebase Cloud Messaging (FCM)
  - Use Case: iOS & Android push
  - Pricing: Free (Google sponsorlu)

Alternative: Expo Push (React Native kullanırsa)
```

**Email Notifications:**
```yaml
Provider: Resend (önerilen) / SendGrid
Use Cases:
  - Hesap doğrulama
  - Ödeme bildirimleri
  - Weekly digest
  - Portfolio change summary
Pricing: 
  - Resend: Free < 3K/month, then $20/month
  - SendGrid: Free < 100/day, then $20/month
```

**SMS Notifications (Türkiye):**
```yaml
Provider: Netgsm / İleti Merkezi / Twilio
Use Cases:
  - Kritik fiyat alertleri (opsiyonel)
  - 2FA (opsiyonel)
Pricing: ₺0.10-0.15 per SMS
Note: Kullanıcı tercihine bağlı, ücretli feature olabilir
```

#### C. Analytics ve Monitoring

**Application Monitoring:**
```yaml
Error Tracking: Sentry
  - Frontend errors
  - Backend errors
  - Performance monitoring
  - Release tracking
  Pricing: Free < 5K errors/month, then $26/month

Performance: Vercel Analytics
  - Real User Monitoring (RUM)
  - Core Web Vitals
  - Page speed
  Pricing: Free tier available
```

**Business Analytics:**
```yaml
Product Analytics: PostHog (self-hosted option)
  - Event tracking
  - Funnel analysis
  - Retention
  - A/B testing
  Pricing: Free self-hosted, cloud $0-450/month

Traffic Analytics: Google Analytics 4
  - Page views
  - User demographics
  - Acquisition channels
  Pricing: Free

Custom Dashboard: Metabase + Supabase
  - Business metrics
  - Revenue tracking
  - User growth
  Pricing: Free (self-hosted)
```

#### D. Mobil Platform (Gelecek)

**React Native:**
```yaml
Framework: Expo (önerilen başlangıç)
  - Hızlı development
  - OTA updates
  - Push notifications built-in
  - Easy publishing

Alternative: React Native CLI
  - Daha fazla native control
  - Daha karmaşık setup
```

**Native Geliştirme (Advanced):**
```yaml
iOS: Swift + SwiftUI
Android: Kotlin + Jetpack Compose
Use Case: Maksimum performans gerekirse
Note: Daha yüksek maliyet, daha uzun development
```

### 3.3 Üçüncü Taraf API Entegrasyonları

#### A. Fiyat Veri Kaynakları

**Mevcut:**
```yaml
Yahoo Finance API:
  - TR & US stocks
  - Free
  - Rate limit: ~2000 req/hour
  - Güvenilir

Binance API:
  - Crypto spot prices
  - Free
  - Rate limit: 1200 req/minute
  - Real-time data
```

**Eklenecek:**
```yaml
Twelve Data API:
  - Global stocks (EU, Asia, vs)
  - Forex pairs
  - Commodities (gold, silver, oil)
  - ETFs
  Pricing: Free < 800 req/day, Pro $49/month (unlimited)

CoinGecko API:
  - Crypto prices (alternative/backup to Binance)
  - Market cap, volume
  - Historical data
  Pricing: Free tier available, Pro $129/month

TCMB (Türkiye Cumhuriyet Merkez Bankası) API:
  - Resmi döviz kurları (USDTRY, EURTRY, vs)
  - Altın fiyatları
  - Free
  - Günlük update

Alternative: Alpha Vantage
  - Stocks, Forex, Crypto
  - Free tier: 5 req/minute
  - Premium: $49.99/month
```

#### B. Finansal Veri ve Analiz

```yaml
Financial Modeling Prep API:
  - Company fundamentals
  - Financial statements
  - Analyst ratings
  Pricing: Free < 250 req/day, $29/month

OpenAI API (opsiyonel):
  - Portfolio analysis AI assistant
  - Natural language queries
  - Investment insights
  Pricing: Pay per use, ~$0.002/1K tokens

News API:
  - Financial news
  - Symbol-specific news
  Pricing: Free < 100 req/day, $449/month unlimited
```

---

## 4. Database Mimarisi

### 4.1 Mevcut Tablolar (Özet)

```
users_public: Kullanıcı profilleri
portfolios: Portföy listesi
holdings: Pozisyonlar (özet)
transactions: İşlem geçmişi
price_cache: Fiyat önbelleği (15dk TTL)
api_rate_limits: Rate limiting
notes: Kullanıcı notları
alerts: Fiyat/portföy alertleri
price_history: Historical prices (mock data)
```

**İlişkiler:**
- Her tablo `user_id` ile bağlı
- Portfolios → Holdings → Transactions (CASCADE DELETE)
- RLS aktif (her kullanıcı sadece kendi verisi)

### 4.2 Yeni Tablolar (Sosyal Platform)

Selector>
  <option value="TR_STOCK">🇹🇷 BİST</option>
  <option value="US_STOCK">🇺🇸 ABD</option>
  <option value="EU_STOCK">🇪🇺 Avrupa</option> {/* YENİ */}
  <option value="CRYPTO">₿ Kripto</option>
  <option value="COMMODITY">🥇 Emtia</option> {/* YENİ */}
  <option value="FOREX">💱 Döviz</option> {/* YENİ */}
</AssetTypeSelector>
```

### 6.2 Emtia (Commodity) Desteği

**Desteklenecek emtialar:**
```
Altın:
  - GOLD (ons/dolar)
  - GOLDGR (gram/TL) - TCMB'den
  
Gümüş:
  - SILVER (ons/dolar)
  
Petrol:
  - BRENT (varil/dolar)
  - WTI (varil/dolar)
  
Diğer:
  - PLATINUM
  - COPPER
  - NATURAL_GAS
```

**Veri kaynakları:**
- TCMB API: Altın gram fiyatı (resmi)
- Twelve Data: Global emtia fiyatları
- Yahoo Finance: Backup

### 6.3 Forex (Döviz) Desteği

**Para birimleri:**
```
Majör çiftler:
  - USDTRY (Dolar/TL)
  - EURTRY (Euro/TL)
  - GBPTRY (Sterlin/TL)
  
Minör çiftler:
  - EURUSD
  - GBPUSD
  - USDJPY
```

**Veri kaynağı:**
- TCMB API (resmi kurlar)
- Forex API providers (real-time)

---

## 7. Gelişmiş Analiz Araçları

### 7.1 Risk Metrikleri

**Sharpe Ratio:**
```typescript
// Portfolio'nun risk-adjusted return'ü
// Formül: (Return - RiskFreeRate) / Volatility
sharpeRatio = (portfolioReturn - 0.15) / volatility
// > 1: İyi, > 2: Çok iyi
```

**Sortino Ratio:**
```typescript
// Sadece downside volatiliteyi hesaba katar
sortinoRatio = (portfolioReturn - 0.15) / downsideVolatility
```

**Beta:**
```typescript
// Piyasaya göre volatilite
// Beta = 1: Piyasa ile aynı hareket
// Beta > 1: Daha volatil
// Beta < 1: Daha stabil
```

**VaR (Value at Risk):**
```typescript
// %95 confidence ile maksimum kayıp
// "95% olasılıkla 1 günde en fazla ₺5,000 kayıp"
```

### 7.2 Portfolio Optimization

**Modern Portfolio Theory:**
- Efficient frontier hesaplama
- Optimal allocation suggestion
- Risk/return trade-off visualizasyonu

**Rebalancing önerileri:**
```typescript
// Hedef allocation: 60% hisse, 30% kripto, 10% nakit
// Mevcut: 70% hisse, 20% kripto, 10% nakit
// Öneri: Hisse sat, kripto al
```

### 7.3 Benchmark Karşılaştırması

**Desteklenecek benchmarklar:**
```
- XU100 (BİST 100)
- S&P 500
- NASDAQ 100
- Bitcoin (kripto portfolyolar için)
- Altın (emtia için)
```

**Gösterim:**
```tsx
<BenchmarkComparison>
  <Chart>
    - Mavi: Portfolio değeri
    - Gri: XU100
  </Chart>
  <Stats>
    - Portfolio return: +15.3%
    - XU100 return: +12.1%
    - Alpha: +3.2% (outperformance)
  </Stats>
</BenchmarkComparison>
```

---

## 8. Bildirim Sistemi

### 8.1 Bildirim Tipleri

**1. Sosyal Bildirimler:**
- Yeni takipçi
- Yeni abone
- Abonelik bitti/yenilendi

**2. Portfolio Bildirimleri:**
- Takip ettiğin influencer yeni işlem yaptı
- Portfolio hedef değere ulaştı
- Pozisyon %X kar/zarar

**3. Fiyat Alertleri:**
- Symbol X hedef fiyata ulaştı
- Sembol %Y düştü/yükseldi

**4. Sistem Bildirimleri:**
- Ödeme başarılı/başarısız
- Hesap doğrulama
- Güvenlik uyarıları

### 8.2 Bildirim Kanalları

**In-App (Öncelik 1):**
```tsx
<NotificationBell>
  <Badge>5</Badge> {/* Okunmamış */}
  <Dropdown>
    {notifications.map(n => (
      <NotificationItem>
        <Icon type={n.type} />
        <Content>
          <Title>{n.title}</Title>
          <Message>{n.message}</Message>
          <Time>{n.created_at}</Time>
        </Content>
        <Actions>
          <MarkAsRead />
          <Delete />
        </Actions>
      </NotificationItem>
    ))}
  </Dropdown>
</NotificationBell>
```

**Browser Push (Öncelik 2):**
- OneSignal entegrasyonu
- Kullanıcı izni gerekli
- Background'da çalışır

**Email (Öncelik 3):**
- Resend/SendGrid
- Önemli bildirimler için
- Günlük/haftalık digest opsiyonel

**Mobile Push (Gelecek):**
- FCM (Firebase)
- Mobil app gerekli

### 8.3 Kullanıcı Tercihleri

```tsx
<NotificationSettings>
  <Section title="Sosyal">
    <Toggle>Yeni takipçi</Toggle>
    <Toggle>Yeni abone</Toggle>
  </Section>
  
  <Section title="Portfolio">
    <Toggle>Takip ettiğim influencer işlem yaptı</Toggle>
    <Select>
      <option>Tüm işlemler</option>
      <option>Sadece önemli (>₺10K)</option>
      <option>Kapalı</option>
    </Select>
  </Section>
  
  <Section title="Fiyat Alertleri">
    <Toggle>Hedef fiyat</Toggle>
    <Toggle>%10+ değişim</Toggle>
  </Section>
  
  <Section title="Kanallar">
    <Toggle>In-app bildirimleri</Toggle>
    <Toggle>Browser push</Toggle>
    <Toggle>Email</Toggle>
    <Input type="email" label="Email adresi" />
  </Section>
</NotificationSettings>
```

---

## 9. Ödeme ve Monetizasyon

### 9.1 Gelir Modeli

**A. Freemium Kullanıcılar (Ücretsiz):**
- Kendi portföylerini yönetebilir
- PUBLIC influencer portfolyolarını görüntüleyebilir
- Temel analiz araçları
- Sınırlı bildirim

**B. Ücretli Abonelikler:**
```
Influencer Abonelikleri:
  - Fiyat: ₺30-150/ay (influencer belirler)
  - Platform komisyonu: %20
  - Avantajlar:
    ✓ SUBSCRIBERS_ONLY portfolyolar
    ✓ Tüm işlem geçmişi
    ✓ Öncelikli bildirimler
    ✓ Özel içerikler

Platform Premium (Opsiyonel):
  - Fiyat: ₺30/ay veya ₺300/yıl
  - Avantajlar:
    ✓ Gelişmiş analiz araçları
    ✓ Portfolio optimization
    ✓ API access
    ✓ Reklamsız deneyim
    ✓ Öncelikli destek
```

**C. Influencer Ödemeleri:**
```
Hesaplama:
  - Brüt gelir = subscriber_count × subscription_price
  - Platform fee = brüt × 0.20
  - Net gelir = brüt - platform_fee
  
Ödeme periyodu: Aylık
Ödeme yöntemi: Banka havalesi (IBAN)
Minimum ödeme: ₺100

Örnek:
  - 50 abone × ₺50 = ₺2,500 brüt
  - Platform fee: ₺500
  - Net ödeme: ₺2,000
```

### 9.2 Ödeme Entegrasyonu

**Stripe (Global):**
```typescript
// 1. Customer oluştur
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { user_id: user.id }
})

// 2. Subscription oluştur
const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: 'price_influencer_monthly' }],
  metadata: {
    user_id: user.id,
    influencer_id: influencer.id
  }
})

// 3. Webhook dinle
app.post('/api/webhooks/stripe', async (req) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    webhookSecret
  )
  
  switch (event.type) {
    case 'invoice.paid':
      // subscriptions UPDATE (period_end)
      // payments INSERT (COMPLETED)
      break
    
    case 'invoice.payment_failed':
      // subscriptions UPDATE (SUSPENDED)
      // Notification gönder
      break
    
    case 'customer.subscription.deleted':
      // subscriptions UPDATE (EXPIRED)
      break
  }
})
```

**İyzico (Türkiye):**
```typescript
// Benzer akış, İyzico API kullanarak
const payment = await iyzico.payment.create({
  locale: 'tr',
  price: '50.00',
  paidPrice: '50.00',
  currency: 'TRY',
  buyer: { ... },
  billingAddress: { ... },
  paymentCard: { ... }
})
```

---

## 10. Mobil Uygulama

### 10.1 Platform Seçimi

**React Native + Expo (Önerilen):**
```
Avantajlar:
  ✓ Web ile kod paylaşımı (%60-70)
  ✓ Hızlı development
  ✓ OTA updates (app store gerektirmeden güncelleme)
  ✓ Cross-platform (iOS + Android tek codebase)
  ✓ Push notification built-in
  ✓ Expo Go ile test kolay

Dezavantajlar:
  ✗ Native modüllere sınırlı erişim
  ✗ Bundle size biraz büyük

Timeline: 3-4 ay (MVP)
Maliyet: Orta
```

**Native (Swift + Kotlin):**
```
Avantajlar:
  ✓ Maksimum performans
  ✓ Tüm platform özelliklerine erişim
  ✓ Best practices

Dezavantajlar:
  ✗ İki ayrı codebase
  ✗ Daha uzun development
  ✗ Daha pahalı

Timeline: 6-8 ay
Maliyet: Yüksek
```

### 10.2 Mobil Özellikler

**MVP Features:**
- ✅ Login/register
- ✅ Portfolio görüntüleme
- ✅ Holdings listesi + fiyatlar
- ✅ Transaction ekleme
- ✅ Influencer discovery
- ✅ Portfolio paylaşımları görüntüleme
- ✅ Push notifications
- ✅ Abonelik satın alma

**V2 Features:**
- Portfolio analiz grafikleri
- Detaylı metrikler
- Influencer profile editing
- In-app chat (opsiyonel)

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Ay 1-2)

**Öncelik: Sosyal Platform Altyapısı**

**Sprint 1 (Hafta 1-2): Database + Auth**
- [ ] Yeni database tablolarını oluştur (influencer_profiles, follows, subscriptions, vs)
- [ ] Migration'ları yaz ve test et
- [ ] RLS policies ekle
- [ ] Trigger'ları implement et
- [ ] Admin panel için basic CRUD API'ler

**Sprint 2 (Hafta 3-4): Influencer Profil Sistemi**
- [ ] Influencer başvuru formu
- [ ] Admin onay paneli
- [ ] Influencer profile page UI
- [ ] Avatar/cover image upload (Supabase Storage)
- [ ] Username validation ve slug generation
- [ ] Profile edit functionality

**Sprint 3 (Hafta 5-6): Portfolio Sharing**
- [ ] Portfolio share modal UI
- [ ] shared_portfolios CRUD API
- [ ] Public portfolio page
- [ ] Visibility control (PUBLIC/SUBSCRIBERS/PRIVATE)
- [ ] Anonymization logic
- [ ] SEO optimization (meta tags)

**Sprint 4 (Hafta 7-8): Takip Sistemi**
- [ ] Follow/unfollow functionality
- [ ] Follower count trigger
- [ ] Following list page
- [ ] Follower list page
- [ ] Follow notifications

### Phase 2: Monetization (Ay 3-4)

**Sprint 5 (Hafta 9-10): Ödeme Entegrasyonu**
- [ ] Stripe hesap setup
- [ ] İyzico hesap setup
- [ ] Subscription API endpoints
- [ ] Checkout page UI
- [ ] Webhook handlers
- [ ] Payment testing (test mode)

**Sprint 6 (Hafta 11-12): Abonelik Sistemi**
- [ ] Subscribe flow (frontend + backend)
- [ ] Subscription management page
- [ ] Cancel subscription flow
- [ ] RLS policies (subscribers_only content)
- [ ] Subscription status cron job

**Sprint 7 (Hafta 13-14): Influencer Payouts**
- [ ] Payout calculation logic
- [ ] Payout dashboard (influencer)
- [ ] Bank info collection (encrypted)
- [ ] Manual payout processing (admin)
- [ ] Payout history
- [ ] Invoice generation

**Sprint 8 (Hafta 15-16): Polish + Testing**
- [ ] Error handling
- [ ] Edge cases
- [ ] Security audit
- [ ] Load testing
- [ ] Beta user testing

### Phase 3: Bildirimler + Piyasa Genişlemesi (Ay 5-6)

**Sprint 9 (Hafta 17-18): Bildirim Sistemi**
- [ ] Notification table + API
- [ ] In-app notification UI
- [ ] Supabase Realtime subscriptions
- [ ] OneSignal entegrasyonu
- [ ] Email notification (Resend)
- [ ] Notification preferences UI

**Sprint 10 (Hafta 19-20): Portfolio Change Tracking**
- [ ] portfolio_change_logs otomasyonu
- [ ] Activity feed UI
- [ ] Real-time updates (Supabase Realtime)
- [ ] Change notification trigger
- [ ] Batch notification job

**Sprint 11 (Hafta 21-22): Genişletilmiş Piyasa**
- [ ] EU_STOCK support (DAX, FTSE, CAC40)
- [ ] COMMODITY support (altın, gümüş, petrol)
- [ ] FOREX support (döviz çiftleri)
- [ ] ETF support
- [ ] Twelve Data API entegrasyonu
- [ ] TCMB API entegrasyonu

**Sprint 12 (Hafta 23-24): Gelişmiş Analiz**
- [ ] Sharpe ratio hesaplama
- [ ] Volatilite analizi
- [ ] Korelasyon matrisi
- [ ] Benchmark karşılaştırması
- [ ] Risk skorlama
- [ ] Analiz UI componentleri

### Phase 4: Mobil + İyileştirmeler (Ay 7-9)

**Sprint 13-16 (Hafta 25-32): Mobil Uygulama**
- [ ] React Native + Expo setup
- [ ] Navigation architecture
- [ ] Shared components
- [ ] Auth flow
- [ ] Portfolio screens
- [ ] Influencer discovery
- [ ] Push notifications (FCM)
- [ ] App Store + Play Store publish

**Sprint 17-18 (Hafta 33-36): Optimizasyon**
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Analytics integration (PostHog)
- [ ] A/B testing setup
- [ ] Monitoring (Sentry)
- [ ] Documentation

### Phase 5: Scale + Growth (Ay 10-12)

**Sprint 19-20: Scale Hazırlığı**
- [ ] Database optimization
- [ ] Caching strategy (Redis opsiyonel)
- [ ] CDN setup
- [ ] Rate limiting revizyon
- [ ] Load balancing

**Sprint 21-22: Marketing Features**
- [ ] Referral system
- [ ] Influencer discovery algorithms
- [ ] Trending portfolios
- [ ] Leaderboard
- [ ] Shareable reports/certificates

**Sprint 23-24: Advanced Features**
- [ ] Portfolio backtesting
- [ ] AI-powered insights (OpenAI)
- [ ] Social feed (posts system)
- [ ] Live streaming (opsiyonel)
- [ ] Community features

---

## 12. Maliyet ve Kaynak Planlaması

### 12.1 Teknik Altyapı Maliyetleri

**Hosting ve Infrastructure (Aylık):**
```
Vercel Pro: $20
Supabase Pro: $25
Stripe: %2.9 + ₺0.30 per transaction (değişken)
İyzico: %2-3 per transaction (değişken)
OneSignal: $0-9 (< 10K push)
Resend/SendGrid: $0-20
Sentry: $0-26
Domain + SSL: $10/year (ihmal edilebilir)

Toplam (başlangıç): ~$70-100/ay
Toplam (scale ile): $200-500/ay
```

**Üçüncü Taraf API'ler:**
```
Twelve Data Pro: $49/ay
CoinGecko (opsiyonel): $0-129/ay
Alpha Vantage (opsiyonel): $50/ay

Toplam: $50-230/ay
```

**Geliştirme Araçları:**
```
GitHub: $0 (public) veya $4/user (private)
Figma: $12/user
Linear/Jira: $8/user
Postman: $0-12/user

Toplam: ~$25-50/ay (küçük takım için)
```

### 12.2 Geliştirme Maliyetleri

**Senaryo 1: Tek Geliştirici (Freelance)**
```
Saat ücreti: ₺150-300/saat
Haftalık saat: 40 saat
Aylık maliyet: ₺24K-48K
12 ay proje: ₺288K-576K
```

**Senaryo 2: Küçük Takım (3 kişi)**
```
1 Senior Full-stack: ₺40K/ay
1 Mid-level Frontend: ₺25K/ay
1 Junior Backend: ₺15K/ay
Aylık maliyet: ₺80K/ay
12 ay proje: ₺960K
```

**Senaryo 3: Ajans**
```
Proje bazlı fiyat: ₺500K-1.5M
Süre: 6-9 ay
Destek: +₺50K/yıl
```

### 12.3 Gelir Projeksiyonu

**Yıl 1 (Conservative):**
```
Hedef kullanıcı: 10K kayıtlı
Aktif influencer: 50
Ortalama influencer başına abone: 30
Toplam ücretli abonelik: 1,500
Ortalama abonelik fiyatı: ₺50/ay
Brüt gelir/ay: ₺75K
Platform payı (%20): ₺15K/ay
Yıllık platform geliri: ₺180K

İlk yıl kar/zarar: -₺400K (investment phase)
```

**Yıl 2 (Growth):**
```
Kayıtlı kullanıcı: 50K
Aktif influencer: 200
Toplam abonelik: 8,000
Brüt gelir/ay: ₺400K
Platform payı: ₺80K/ay
Yıllık gelir: ₺960K

Maliyet:
  - Infrastructure: ₺100K
  - İşletme: ₺300K
  - Pazarlama: ₺200K
  Toplam: ₺600K

Yıllık kar: ₺360K
```

**Yıl 3 (Profitable):**
```
Kayıtlı kullanıcı: 200K
Aktif influencer: 500
Toplam abonelik: 25,000
Brüt gelir/ay: ₺1.25M
Platform payı: ₺250K/ay
Yıllık gelir: ₺3M

Maliyet: ₺1.5M
Yıllık kar: ₺1.5M
ROI: Break-even + profit
```

### 12.4 Gerekli Kaynaklar

**Minimum Viable Team:**
```
Ay 1-6 (MVP):
  - 1 Full-stack developer
  - 1 UI/UX designer (part-time)
  
Ay 7-12 (Growth):
  - 2 Full-stack developers
  - 1 Mobile developer
  - 1 UI/UX designer
  - 1 Product manager (part-time)
  
Yıl 2:
  - 3 Full-stack developers
  - 1 Mobile developer
  - 1 DevOps engineer
  - 1 UI/UX designer
  - 1 Product manager
  - 1 Marketing specialist
  - 1 Customer support
```

---

## 13. Sonuç ve Öneriler

### 13.1 Kritik Başarı Faktörleri

**1. Influencer Onboarding:**
- İlk 50-100 influencer kritik (network effect)
- Kaliteli, güvenilir influencer'lar seç
- Incentive programı düşün (ilk 3 ay komisyon yok)

**2. Kullanıcı Deneyimi:**
- Basit, sezgisel UI
- Hızlı sayfa yükleme
- Mobil-first design
- Accessibility

**3. Güvenilirlik:**
- Güvenlik öncelikli
- Ödeme güvenliği
- Veri privacy
- Şeffaflık

**4. Pazarlama:**
- Influencer partnerships
- Content marketing
- SEO optimization
- Social media presence

### 13.2 Riskler ve Azaltma Stratejileri

**Risk 1: Düşük influencer katılımı**
- Azaltma: Agresif influencer onboarding, incentive'ler
- Alternatif: Platform premium features (B2C odaklı)

**Risk 2: Ödeme sistemi sorunları**
- Azaltma: Kapsamlı test, gradual rollout
- Alternatif: Manuel onay süreci başlangıçta

**Risk 3: Scale problemleri**
- Azaltma: Sağlam mimari, monitoring
- Alternatif: Gradual growth, waiting list

**Risk 4: Regülasyon**
- Azaltma: Legal danışmanlık, T&C hazırlık
- Alternatif: Pilot bölge (sadece Türkiye)

### 13.3 Next Steps

**Hemen yapılacaklar:**
1. ✅ Bu dokümanı review et
2. ✅ Teknik ekibi kur veya freelancer bul
3. ✅ Development environment setup
4. ✅ Database migration'ları başlat
5. ✅ Design system hazırla

**İlk 2 hafta:**
1. ✅ Influencer profile sistemi
2. ✅ Portfolio sharing basic
3. ✅ Public portfolio page
4. ✅ Alpha testing

**İlk ay:**
1. ✅ Takip sistemi
2. ✅ Beta influencer onboarding (5-10 kişi)
3. ✅ User feedback
4. ✅ Iteration

---

## 14. Referanslar ve Kaynaklar

**Mevcut Dokümantasyon:**
- `README.md` - Proje genel bakış
- `PORTFOLIO_MANAGEMENT.md` - Portföy sistemi
- `PRICE_SYSTEM_ARCHITECTURE.md` - Fiyat sistemi
- `SYMBOL_STANDARDIZATION.md` - Sembol normalizasyonu
- Database migrations: `supabase/migrations/`

**Yararlı Linkler:**
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)
- [İyzico API](https://dev.iyzipay.com/)
- [Twelve Data API](https://twelvedata.com/docs)
- [React Native](https://reactnative.dev/)

**Benchmark Platformlar:**
- eToro (social trading)
- Public.com (social investing, US)
- Robinhood (commission-free, US)
- Trade Republic (EU)
- Midas (Türkiye, kripto)

---

**📌 SON NOT:**

Bu dokümantasyon, VUCA-PortFoy projesinin sıfırdan kurulması için gereken tüm teknik ve iş detaylarını içermektedir. Yeni geliştirici bu dokümanı takip ederek:

1. Mevcut sistemi anlayabilir
2. Yeni özellikleri (sosyal platform) implement edebilir
3. Database mimarisini genişletebilir
4. Ödeme sistemini kurabilir
5. Mobil uygulamayı geliştirebilir
6. Sistemin scale edilmesini planlayabilir

Her bölüm detaylı açıklamalar, kod örnekleri, SQL şemaları ve implementation adımlarını içermektedir.

**İyi çalışmalar! 🚀**

