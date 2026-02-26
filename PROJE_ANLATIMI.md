# 📊 XPortfoy - Proje Anlatımı

**Dijital Portföy Röntgeni**

> Tüm varlıklarınızı tek platformda yönetin, paylaşın ve takip edin

**Son Güncelleme:** 25 Şubat 2026  
**Durum:** Aktif Geliştirme

---

## 📋 İçindekiler

1. [Proje Özeti](#-proje-özeti)
2. [Ana Özellikler](#-ana-özellikler)
3. [Sistem Mimarisi](#-sistem-mimarisi)
4. [Nasıl Çalışır](#-nasıl-çalışır)
5. [Admin Yönetim Sistemi](#-admin-yönetim-sistemi)
6. [Performans ve Güvenlik](#-performans-ve-güvenlik)
7. [Veritabanı Yapısı](#-veritabanı-yapısı)
8. [Sosyal Platform](#-sosyal-platform)
9. [Gelecek Özellikler](#-gelecek-özellikler)

---

## 🎯 Proje Özeti

### Nedir?

**XPortfoy** (Dijital Portföy Röntgeni), Türkiye'de ilk defa çoklu piyasa varlıklarınızı tek platformda yönetmenizi, analiz etmenizi ve başkalarıyla paylaşmanızı sağlayan bir finans teknolojisi uygulamasıdır.

### Hangi Problemi Çözüyor?

**Problem:**
- Yatırımcılar BİST, Nasdaq, kripto ve döviz yatırımlarını farklı platformlarda takip ediyor
- Toplam portföy değerini görmek için manuel hesaplama gerekiyor
- Influencer'lar portföylerini şeffaf şekilde paylaşamıyor
- Güvenilir portföy takip araçları eksik veya pahalı

**Çözüm:**
- ✅ Tüm varlıkları tek platformda yönetme
- ✅ Otomatik fiyat güncellemeleri ve analiz
- ✅ Portföy paylaşımı ve sosyal takip sistemi
- ✅ Ücretsiz ve kullanıcı dostu arayüz

### Kimler İçin?

1. **Bireysel Yatırımcılar**
   - Çoklu piyasada işlem yapan herkes
   - Portföyünü profesyonelce yönetmek isteyenler
   - Kar/zarar takibi yapanlar

2. **Content Creator'lar (Influencer)**
   - Finans YouTuber'ları
   - Yatırım bloggerları
   - Portföyünü şeffaf paylaşmak isteyen herkes

3. **Takipçiler**
   - Güvendiği kişilerin portföylerini takip etmek isteyenler
   - Yatırım eğitimi almak isteyenler

---

## 🚀 Ana Özellikler

### 1. 💼 Çoklu Portföy Yönetimi

**Ne Yapıyor:**
- Sınırsız sayıda portföy oluşturabilirsiniz
- Her portföy tamamen izole (ayrı varlıklar, işlemler, notlar)
- Tek tıkla portföyler arasında geçiş

**Kullanım Senaryosu:**
```
Örnek:
- "Ana Portföy" → Gerçek yatırımlarınız
- "Kripto Portföy" → Sadece kripto varlıklar
- "Deneme Portföy" → Test amaçlı işlemler
```

### 2. 📊 Desteklenen Varlık Türleri

**Mevcut Destek:**
- 🇹🇷 **BİST Hisseleri** (Örn: ASELS, THYAO, BIMAS)
- 🇺🇸 **ABD Hisseleri** (Örn: AAPL, GOOGL, TSLA)
- ₿ **Kripto Paralar** (Örn: BTC, ETH, SOL)
- 💵 **Nakit** (TRY, USD, EUR)

**Nasıl Çalışır:**
- Otomatik fiyat çekimi (Yahoo Finance + Binance)
- Güncel kurlar ve piyasa fiyatları
- Sembol otomatik düzeltme (BTC → BTCUSDT)

### 3. 💰 İşlem Yönetimi

**Özellikler:**
- **Alış İşlemleri:** Varlık satın alma kaydı
- **Satış İşlemleri:** Varlık satma ve kar/zarar hesaplama
- **Komisyon Takibi:** İşlem ücretlerini dahil etme
- **Otomatik Holding Hesaplama:** Ortalama alış fiyatı (FIFO yöntemi)

**İşlem Akışı:**
1. "Yeni İşlem" butonuna tıklayın
2. Varlık sembolü, miktar, fiyat girin
3. İşlem otomatik olarak holding'leri günceller
4. Geçmiş işlemler saklanır
5. İstenirse işlem silinebilir (geri alınır)

**Doğrulama:**
- Satış yapmadan önce holding kontrolü
- Yetersiz miktar uyarısı
- Olmayan varlık satışını engelleme

### 4. ⚡ Akıllı Fiyat Sistemi

**Teknik Özellikler:**
- **Batch API:** 10 varlık = 1 API çağrısı (90% azalma)
- **Cache Sistemi:** 15 dakika TTL, otomatik yenileme
- **Rate Limiting:** 100 istek/saat/kullanıcı
- **Multi-Source:** Yahoo Finance + Binance API fallback

**Performans:**
```
Önceki Sistem:
→ 10 varlık = 10 API çağrısı = 5 saniye
→ Her sayfa yenileme = 10 yeni çağrı

Yeni Sistem:
→ 10 varlık = 1 batch çağrı = 0.6 saniye (88% hızlı)
→ Cache'den yükleme = 0.05 saniye (99% hızlı)
→ 5 dakika boyunca 0 dış API çağrısı
```

### 5. 📈 Portföy Analizi

**Metrikler:**
- **Toplam Değer:** Tüm varlıkların güncel değeri
- **Kar/Zarar:** Gerçekleşmemiş kazanç/kayıp
- **Yüzde Getiri:** Portfolio performansı
- **Varlık Dağılımı:** Pasta grafiği ile görselleştirme
- **Asset Mix:** Hisse, kripto, nakit oranları

**Görselleştirme:**
- Pasta grafik (asset dağılımı)
- Zaman çizgisi (geliştirmede)
- Kar/zarar trendi (geliştirmede)

### 6. 📝 Not ve Uyarı Sistemi

**Not Yönetimi:**
- **Pozisyon Notları:** Belirli bir varlık için not
- **Haftalık Notlar:** Haftalık strateji/düşünceler
- **Genel Notlar:** Portfolio ile ilgili tüm notlar

**Alert Sistemi:**
- Fiyat hedefi uyarıları (henüz aktif değil)
- Portfolio değişim bildirimleri (planlı)

### 7. 🌐 Sosyal Portföy Paylaşımı

**Public Portföy:**
- Portföyünüzü herkese açık yapabilirsiniz
- Benzersiz URL (slug) ile paylaşım
- Açıklama ve başlık ekleme

**Keşfet Sayfası:**
- Tüm public portföyleri görüntüleme
- Arama ve filtreleme
- Popüler portföyler

**Takip Sistemi:**
- İlgilendiğiniz portföyleri takip edin
- Takip ettiğiniz portföyler ayrı sayfada
- Takipçi sayısı gösterimi

**Aktivite Feed:**
- Takip ettiğiniz portföylerdeki işlemler
- Yeni holding'ler
- Portfolio değişiklikleri
- Telegram bildirimleri (opsiyonel)

### 8. 📢 Duyuru Sistemi

**Özellikler:**
- Portföy sahipleri duyuru yayınlayabilir
- Takipçiler duyuruları görür
- Başlık + içerik desteği
- Zaman damgası

**Kullanım:**
- Önemli işlem açıklamaları
- Strateji değişiklikleri
- Takipçilerle iletişim

### 9. 🛡️ Admin Paneli (RBAC)

**Rol Tabanlı Yetkilendirme:**
- Super Admin rolü
- Granüler izin sistemi
- Kullanıcılara rol atama/kaldırma

**Yönetim Özellikleri:**
- Kullanıcı listesi ve detayları
- Portföy izleme
- İşlem geçmişi görüntüleme
- Sistem istatistikleri
- Denetim logları

---

## 🏗️ Sistem Mimarisi

### Teknoloji Stack

**Frontend:**
- **Framework:** Next.js 16 (App Router)
- **Dil:** TypeScript 5
- **Styling:** TailwindCSS 4
- **İkonlar:** Lucide React
- **Grafikler:** Recharts
- **State:** React Context + TanStack Query v5

**Backend:**
- **API:** Next.js API Routes (Serverless)
- **Runtime:** Node.js 20+
- **Veritabanı:** Supabase (PostgreSQL 15)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (kullanıma hazır)
- **Real-time:** Supabase Realtime (kullanıma hazır)

**Dış Servisler:**
- **Fiyat Verileri:** Yahoo Finance API, Binance API
- **Bildirimler:** Telegram Bot API
- **Hosting:** Vercel (önerilen)

### Mimari Katmanlar

```
┌─────────────────────────────────────┐
│   Client (Browser / React)          │
│   - UI Components                   │
│   - Context Providers               │
│   - Custom Hooks                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   API Layer (Next.js Routes)        │
│   - /api/portfolios                 │
│   - /api/transactions               │
│   - /api/price/batch                │
│   - /api/admin/*                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Database (Supabase/PostgreSQL)    │
│   - Row Level Security (RLS)        │
│   - Triggers & Functions            │
│   - Real-time Subscriptions         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   External APIs                     │
│   - Yahoo Finance (stocks)          │
│   - Binance (crypto)                │
│   - Telegram (notifications)        │
└─────────────────────────────────────┘
```

---

## 🔄 Nasıl Çalışır

### Kullanıcı Kaydı ve Giriş

1. **Kayıt Olma:**
   - Email ve şifre ile kayıt
   - Email doğrulama (opsiyonel)
   - Otomatik profil oluşturma (database trigger)
   - Varsayılan "Ana Portföy" otomatik oluşur

2. **Giriş:**
   - Email/şifre ile authentication
   - Supabase Auth token yönetimi
   - Güvenli session yönetimi

### Portföy Oluşturma

1. Navigation'daki portföy seçiciyi aç
2. "Yeni Portföy" butonuna tıkla
3. Portföy adı gir (benzersiz olmalı)
4. Portföy oluşturulur ve aktif hale gelir

### İşlem Ekleme Akışı

**Alış İşlemi:**
```
1. "Yeni İşlem" → Alış seç
2. Sembol gir (örn: AAPL)
3. Miktar ve fiyat gir
4. Komisyon ekle (opsiyonel)
5. Tarih seç
6. İşlemi kaydet

→ Sistem ne yapar:
  - Transaction tablosuna kayıt
  - Holding oluşturur veya günceller
  - Ortalama alış fiyatı hesaplar
  - Aktivite kaydı oluşturur (public portföyse)
  - Telegram bildirimi gönderir (public portföyse)
```

**Satış İşlemi:**
```
1. "Yeni İşlem" → Satış seç
2. Mevcut holdingleri kontrol et
3. Satış miktarı kontrol edilir
4. Yetersizse hata mesajı

→ Sistem ne yapar:
  - Transaction kaydı
  - Holding'den miktar düşer
  - Holding 0 olursa silinir
  - Kar/zarar hesaplanır
  - Aktivite + bildirim (public portföyse)
```

### Fiyat Güncelleme Mekanizması

**İlk Yükleme:**
```
1. Kullanıcı dashboard'u açar
2. Frontend tüm holdingleri toplar
3. Batch API'ye tek istek gönderir
4. Backend her sembol için:
   a. Cache'e bakar (15 dk içinde var mı?)
   b. Varsa cache'den döner
   c. Yoksa dış API'ye gider
   d. Fiyatı cache'e yazar
   e. Kullanıcıya döner
5. Frontend fiyatları gösterir
```

**Sonraki Yüklemeler:**
```
1. Kullanıcı sayfayı yeniler
2. Batch API çağrısı
3. Tüm fiyatlar cache'de → 0.05 saniyede döner
4. 15 dakika sonra cache expire olur
5. Yeni istek gelince tekrar dış API'ye gidilir
```

### Sosyal Paylaşım Akışı

**Portföy Paylaşma:**
```
1. Portföy ayarlarına git
2. "Herkese Açık Yap" switch'ini aç
3. Benzersiz slug oluştur (örn: "benim-portfoyum")
4. Açıklama ekle
5. Kaydet

→ Portföy artık:
  - /p/benim-portfoyum URL'inde erişilebilir
  - Keşfet sayfasında görünür
  - Takip edilebilir
```

**Takip Etme:**
```
1. Keşfet sayfasından portföy bul
2. "Takip Et" butonuna tıkla
3. Takip kaydı oluşur
4. Portföy sahibinin takipçi sayısı artar
5. "Takip Ettiklerim" sayfasında görünür
```

**Aktivite Feed:**
```
1. Public portföyde yeni işlem yapılır
2. portfolio_activities tablosuna kayıt
3. Telegram bildirimi gönderilir (varsa)
4. Takipçiler aktiviteyi "Takip Ettiklerim" sayfasında görür
```

---

## 👨‍💼 Admin Yönetim Sistemi

### RBAC (Role-Based Access Control)

**Roller:**
- **Super Admin:** Tüm izinler (`{"*": true}`)
- **Gelecek roller:** Moderator, Support, Analyst (hazır altyapı)

**Veritabanı Yapısı:**
- `roles` tablosu → Rol tanımları
- `user_roles` tablosu → Kullanıcı-rol ilişkisi
- `admin_audit_log` → Tüm admin aksiyonları

### Admin Panel Özellikleri

**Dashboard:**
- Toplam kullanıcı sayısı
- Toplam portföy sayısı
- Toplam işlem sayısı
- Sistem sağlığı metrikleri

**Kullanıcı Yönetimi:**
- Kullanıcı listesi (arama, filtreleme, sayfalama)
- Kullanıcı detayları:
  - Profil bilgileri
  - Portföyleri
  - Aktif holding'ler
  - Son 50 işlem
  - Atanmış roller
- Rol atama/kaldırma
- Super admin yapma

**Portföy İzleme:**
- Tüm portföyleri görüntüleme
- Public/private durumu
- Takipçi sayıları
- Varlık detayları

**İşlem Geçmişi:**
- Tüm kullanıcı işlemleri
- Filtreleme (sembol, kullanıcı, tarih)
- Detaylı görünüm

**Sistem Yönetimi:**
- Cache istatistikleri
- API rate limit durumu
- Denetim logları
- Hata raporları

**Denetim Logları:**
- Tüm admin aksiyonları kaydedilir
- Kim, ne zaman, ne yaptı
- Hedef kullanıcı/kayıt
- Metadata (ek bilgiler)

### Güvenlik

**Authentication:**
- Normal kullanıcı girişi (Supabase Auth)
- Admin rolü database'de kontrol edilir
- Middleware'de public/protected route ayrımı

**Authorization:**
- Her API endpoint'de admin kontrolü
- `withAdminAuth` wrapper fonksiyonu
- `assertAdmin()` fonksiyonu
- `hasPermission()` granular kontrol

**Audit Trail:**
- Her admin aksiyonu loglanır
- Silinmez kayıtlar
- Tarih damgası ve metadata

---

## 🔐 Performans ve Güvenlik

### Performans Optimizasyonları

**1. Akıllı Cache Sistemi**
```
Özellikler:
- 15 dakika TTL (Time To Live)
- Otomatik expire
- Database-level cache (Supabase)
- %80-90 cache hit rate

Sonuç:
- İlk yükleme: 0.6 saniye
- Cache'den: 0.05 saniye
- %88-99 hız artışı
```

**2. Batch API**
```
Öncesi: 10 varlık = 10 API çağrısı
Sonrası: 10 varlık = 1 API çağrısı

Avantajlar:
- N+1 sorunu çözüldü
- 90% daha az dış API kullanımı
- Paralel işleme
```

**3. Rate Limiting**
```
Limitler:
- /api/price/quote: 100 req/saat
- /api/price/batch: 50 req/saat
- Kullanıcı bazlı takip
- RPC fonksiyon ile kontrol

Sonuç: API kötüye kullanımı engellendi
```

**4. Database Optimizasyonları**
```
- Index'ler: symbol, user_id, portfolio_id
- Foreign key constraints
- CASCADE DELETE (veri tutarlılığı)
- UNIQUE constraints (duplikasyon önleme)
```

### Güvenlik Katmanları

**1. Authentication (Kimlik Doğrulama)**
```
- Supabase Auth entegrasyonu
- Email/password
- Magic link (hazır)
- Session yönetimi
- Token refresh
```

**2. Authorization (Yetkilendirme)**
```
- Row Level Security (RLS)
- Her kullanıcı sadece kendi verilerine erişir
- Admin rolleri için özel politikalar
- Public portföyler için read-only erişim
```

**3. API Security**
```
- Tüm endpoint'ler authenticated
- Rate limiting (kötüye kullanım önleme)
- Input validation
- SQL injection koruması (parametrize queries)
- XSS koruması (Next.js built-in)
```

**4. RLS (Row Level Security) Örnekleri**
```
portfolios tablosu:
→ SELECT: Kendi portföyler + public portföyler
→ INSERT/UPDATE/DELETE: Sadece kendi portföyler

holdings tablosu:
→ SELECT: Kendi holdings + public portföy holdings
→ Write: Sadece kendi holdings

transactions tablosu:
→ SELECT: Kendi işlemler + public portföy işlemleri
→ Write: Sadece kendi işlemler

notes/alerts:
→ Tamamen private, asla public değil
```

**5. Data Privacy**
```
- Notlar asla paylaşılmaz
- Alertler private
- Email adresleri gizli
- Profile privacy ayarları
- Portföy gizliye alındığında:
  → Slug silinir
  → Takipler silinir
  → Aktivite kayıtları silinir
```

---

## 🗄️ Veritabanı Yapısı

### Ana Tablolar

**1. users_public (Kullanıcı Profilleri)**
```
Alanlar:
- id (UUID, auth.users ile bağlı)
- display_name (gösterilen ad)
- bio (kısa açıklama)
- avatar_url (profil resmi)
- is_profile_public (profil görünürlüğü)
- created_at, updated_at

Not: Otomatik trigger ile oluşturulur
```

**2. portfolios (Portföyler)**
```
Alanlar:
- id (UUID, primary key)
- user_id (sahibi)
- name (portföy adı)
- is_public (herkese açık mı)
- slug (benzersiz URL)
- description (açıklama)
- follower_count (takipçi sayısı, trigger ile güncellenir)

Constraints:
- UNIQUE (user_id, name) → Aynı kullanıcı aynı isimde 2 portföy oluşturamaz
- UNIQUE (slug) → Her slug benzersiz
```

**3. holdings (Pozisyonlar)**
```
Alanlar:
- id
- portfolio_id (hangi portföy)
- user_id (sahibi)
- symbol (sembol, örn: AAPL)
- asset_type (TR_STOCK, US_STOCK, CRYPTO, CASH)
- quantity (miktar)
- avg_price (ortalama alış fiyatı)

İlişkiler:
- portfolios'a bağlı (CASCADE DELETE)
```

**4. transactions (İşlemler)**
```
Alanlar:
- id
- portfolio_id
- user_id
- symbol
- asset_type
- side (BUY veya SELL)
- quantity (miktar)
- price (fiyat)
- fee (komisyon)
- date (işlem tarihi)
- note (not, opsiyonel)

İlişkiler:
- portfolios'a bağlı (CASCADE DELETE)
```

**5. price_cache (Fiyat Önbelleği)**
```
Alanlar:
- symbol
- asset_type
- price
- currency
- expires_at (15 dk sonra)
- fetched_at
- source (YAHOO, BINANCE)

Constraints:
- UNIQUE (symbol, asset_type)
```

**6. api_rate_limits (Rate Limiting)**
```
Alanlar:
- user_id
- endpoint
- request_count
- window_start (saat başlangıcı)
- window_end

Fonksiyon: check_rate_limit(user_id, endpoint, max_requests, window_minutes)
```

### Sosyal Özellikler Tabloları

**7. portfolio_follows (Takip Sistemi)**
```
Alanlar:
- id
- follower_id (takip eden kullanıcı)
- portfolio_id (takip edilen portföy)
- created_at

Constraints:
- UNIQUE (follower_id, portfolio_id)
- Follower count trigger ile güncellenir
```

**8. portfolio_activities (Aktivite Feed)**
```
Alanlar:
- id
- portfolio_id
- actor_id (işlemi yapan)
- type (NEW_TRADE, HOLDING_CLOSED, vb)
- title
- metadata (JSON, ek bilgiler)
- created_at

Not: Sadece public portföyler için
```

**9. portfolio_announcements (Duyurular)**
```
Alanlar:
- id
- portfolio_id
- user_id
- title
- content
- created_at
- updated_at

Not: Portföy sahipleri duyuru yayınlayabilir
```

### Admin Tabloları

**10. roles (Roller)**
```
Alanlar:
- id
- slug (super_admin, moderator, vb)
- name (görünen ad)
- description
- permissions (JSONB, {"*": true} veya granular)
- is_system (sistem rolü, silinemez)
```

**11. user_roles (Kullanıcı-Rol İlişkisi)**
```
Alanlar:
- id
- user_id
- role_id
- assigned_by (kim atadı)
- assigned_at

Constraints:
- UNIQUE (user_id, role_id)
```

**12. admin_audit_log (Denetim Logları)**
```
Alanlar:
- id
- admin_id (işlemi yapan admin)
- action (user_role_assigned, vb)
- target_type (user, portfolio, vb)
- target_id
- metadata (JSON)
- created_at

Not: Asla silinmez, sadece INSERT
```

### Database Triggers

**1. auto_create_profile**
```
Ne zaman: Yeni kullanıcı kaydolduğunda
Ne yapar: users_public tablosuna profil oluşturur
```

**2. increment_follower_count**
```
Ne zaman: Yeni takip yapıldığında
Ne yapar: portfolios.follower_count +1
```

**3. decrement_follower_count**
```
Ne zaman: Takip bırakıldığında
Ne yapar: portfolios.follower_count -1
```

---

## 🌐 Sosyal Platform

### Özellikler

**1. Portföy Paylaşımı**
- Public/private toggle
- Benzersiz slug (URL)
- Açıklama ve başlık
- SEO optimizasyonu

**2. Keşfet Sayfası**
- Tüm public portföyler
- Arama (portföy adı, açıklama)
- Sıralama (yeni, popüler)
- Sayfalama

**3. Takip Sistemi**
- Takip et/takibi bırak butonu
- Takipçi sayısı gösterimi
- "Takip Ettiklerim" sayfası
- Takip ettiğin portföyler listesi

**4. Aktivite Feed**
- Yeni işlemler
- Holding açma/kapama
- Gerçek zamanlı güncelleme (planlı)
- Telegram bildirimleri (opsiyonel)

**5. Profil Sayfaları**
- Kullanıcı profili (/profile/[id])
- Public portföyler listesi
- Bio ve avatar (gelecek)
- İstatistikler

**6. Duyuru Sistemi**
- Portföy sahipleri duyuru yayınlar
- Takipçiler duyuruları görür
- Başlık + içerik
- Timestamp

### Telegram Entegrasyonu

**Aktivite Bildirimleri:**
```
Örnek Mesaj:
━━━━━━━━━━━━━━━━━━━━━
🟢 BIST

"Benim Portföy" portföyüne yeni bir işlem eklendi.

📅 25 Şubat 2026 · 12:30
📌 ASELS

━━━━━━━━━━━━━━━━━━━━━

[📊 Portföyü İncele] [🌐 Portföy Röntgeni]
```

**Özellikler:**
- Public portföyler için otomatik
- Inline butonlar (portföy linki)
- Emoji ile kategori gösterimi
- Temiz ve profesyonel format

---

## 🔮 Gelecek Özellikler

### Faz 1: Stripe Entegrasyonu (Yakında)

**Amaç:** Portföy sahipleri ücretli abonelik sistemi

**Özellikler:**
- Ücretli portföy abonelikleri
- Influencer'lar gelir elde eder
- Platform komisyonu (%20 önerilen)
- Stripe Checkout + webhook
- Customer Portal
- Abonelik yönetimi

**Kullanım Senaryosu:**
```
1. Influencer portföyünü premium yapar
2. Aylık abonelik fiyatı belirler (örn: ₺50)
3. Takipçi abone olmak ister
4. Stripe ile ödeme yapar
5. Premium içeriğe erişir
6. Influencer aylık gelir elde eder
```

### Faz 2: Gelişmiş Analiz Araçları

**Risk Metrikleri:**
- Sharpe Ratio (risk-adjusted return)
- Sortino Ratio (downside risk)
- Beta (piyasa volatilitesi)
- VaR (Value at Risk)

**Portfolio Optimization:**
- Modern Portfolio Theory
- Efficient frontier
- Rebalancing önerileri
- Optimal allocation

**Benchmark Karşılaştırması:**
- XU100 (BİST 100)
- S&P 500
- NASDAQ 100
- Bitcoin
- Alpha/Beta hesaplama

### Faz 3: Bildirim Sistemi

**Kanallar:**
- In-app bildirimler
- Browser push (OneSignal)
- Email bildirimleri (Resend/SendGrid)
- Mobile push (gelecekte)

**Bildirim Tipleri:**
- Yeni takipçi
- Yeni işlem (takip ettiğin portföyler)
- Fiyat alertleri
- Abonelik durumu
- Sistem bildirimleri

### Faz 4: Genişletilmiş Piyasa Desteği

**Yeni Varlık Türleri:**
- 🇪🇺 Avrupa Borsaları (DAX, FTSE, CAC40)
- 🥇 Emtia (Altın gram/ons, Gümüş, Petrol)
- 💱 Forex Detaylı (USDTRY, EURTRY, majör çiftler)
- 📈 ETF'ler
- 📊 Tahviller
- 💼 Yatırım Fonları

**API Entegrasyonları:**
- Twelve Data API (global stocks)
- TCMB API (resmi döviz kurları)
- CoinGecko (crypto backup)

### Faz 5: Mobil Uygulama

**Platform:**
- React Native + Expo
- iOS ve Android
- Code sharing (%60-70)
- Push notification

**Özellikler:**
- Tüm web özellikleri
- Mobile-first UI
- Offline mod (planlı)
- Face ID / Touch ID

### Faz 6: Yapay Zeka Özellikleri

**AI Portfolio Assistant:**
- OpenAI entegrasyonu
- Doğal dil sorguları
- Portföy analizi ve öneriler
- Risk değerlendirmesi
- Yatırım fikirleri

**Örnek Kullanım:**
```
Kullanıcı: "Portföyüm çok riskli mi?"
AI: "Portföyünüzün %70'i kripto varlıklardan 
oluşuyor, bu yüksek volatilite demektir. 
Riskinizi azaltmak için..."
```

### Faz 7: Advanced Features

**Portfolio Backtesting:**
- Geçmiş performans simülasyonu
- What-if senaryoları
- Historical data analizi

**Sosyal Özellikler:**
- Kullanıcı arası mesajlaşma
- Yorum sistemi
- Grup portföyleri
- Yatırım yarışmaları

**Community Features:**
- Forum/tartışma alanları
- Eğitim içerikleri
- Webinar entegrasyonu
- Referral program

---

## 📊 Mevcut Durum ve İstatistikler

### Tamamlanan Özellikler ✅

- ✅ Kullanıcı kaydı ve giriş sistemi
- ✅ Çoklu portföy yönetimi
- ✅ İşlem yönetimi (BUY/SELL)
- ✅ Otomatik holding hesaplama
- ✅ Akıllı fiyat sistemi (cache + batch)
- ✅ Rate limiting ve güvenlik
- ✅ Portföy analizi (temel)
- ✅ Not ve alert sistemi (altyapı)
- ✅ Sosyal portföy paylaşımı
- ✅ Takip sistemi
- ✅ Aktivite feed
- ✅ Telegram bildirimleri
- ✅ Duyuru sistemi
- ✅ Admin paneli (RBAC)
- ✅ Denetim logları

### Geliştirme Aşamasında 🚧

- 🚧 Gelişmiş analiz grafikleri
- 🚧 Real-time fiyat güncellemeleri
- 🚧 Alert tetikleme sistemi
- 🚧 Profil ayarları (avatar, bio)

### Planlanan Özellikler 📋

- 📋 Stripe entegrasyonu
- 📋 Bildirim sistemi
- 📋 Genişletilmiş piyasa desteği
- 📋 Mobil uygulama
- 📋 AI portfolio assistant
- 📋 Advanced analytics

---

## 🎨 Kullanıcı Deneyimi

### Tasarım Prensipleri

**1. Basitlik**
- Sade ve temiz arayüz
- Kolay navigasyon
- Açık butonlar ve linkler

**2. Responsive Design**
- Mobil uyumlu
- Tablet desteği
- Desktop optimize

**3. Performans**
- Hızlı yükleme
- Smooth animasyonlar
- Minimal gecikme

**4. Accessibility**
- Keyboard navigasyonu
- Screen reader uyumlu
- Yüksek kontrast (gelecek)

### Renkler ve Branding

**Ana Renkler:**
- Primary: Kırmızı (vurgu)
- Secondary: Gri tonları
- Success: Yeşil (kar)
- Danger: Kırmızı (zarar)
- Warning: Sarı (uyarılar)

**Tipografi:**
- Clean sans-serif fontlar
- Okunabilir boyutlar
- Hiyerarşi net

---

## 🔧 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 20+
- npm veya yarn
- Supabase hesabı
- (Opsiyonel) Vercel hesabı

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
TELEGRAM_BOT_TOKEN= (opsiyonel)
TELEGRAM_CHANNEL_ID= (opsiyonel)
```

### Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Development server
npm run dev

# Production build
npm run build
npm start
```

### Database Setup

1. Supabase'de yeni proje oluştur
2. Migration dosyalarını sırayla çalıştır
3. RLS politikalarını doğrula
4. Service role key'i al

---

## 📝 Notlar

### Önemli Kurallar

1. **Notlar ve Alertler asla public olmaz** - her zaman private
2. **Write işlemleri sadece sahip** - takipçiler read-only
3. **Slug benzersiz olmalı** - Türkçe karakter desteği
4. **Rate limiting aktif** - kötüye kullanım önleme
5. **Her faz bağımsız** - kademeli deploy

### Güvenlik Best Practices

- Asla API key'leri commit etme
- Environment variables kullan
- RLS politikalarını test et
- Input validation her zaman
- Rate limiting monitör et

### Performans Best Practices

- Cache'i akıllıca kullan
- Batch API'leri tercih et
- Gereksiz re-render'ları önle
- Image optimizasyonu
- Bundle size düşük tut

---

## 📞 İletişim ve Destek

### Geliştirici

Proje: XPortfoy (Dijital Portföy Röntgeni)  
Durum: Aktif Geliştirme  
Tarih: 2026

### Teknoloji Stack Özeti

- Frontend: Next.js 16 + TypeScript + TailwindCSS
- Backend: Next.js API Routes + Supabase
- Database: PostgreSQL 15 (Supabase)
- Hosting: Vercel (önerilen)
- External: Yahoo Finance, Binance, Telegram

---

## 🏆 Sonuç

**XPortfoy** (Dijital Portföy Röntgeni), Türkiye'de ilk defa çoklu piyasa varlıklarını tek platformda yönetmenizi, analiz etmenizi ve sosyal olarak paylaşmanızı sağlayan yenilikçi bir fintech uygulamasıdır.

**Temel Özellikler:**
- ✅ Çoklu portföy yönetimi
- ✅ Akıllı fiyat sistemi (%90 performans artışı)
- ✅ Sosyal paylaşım ve takip
- ✅ Admin yönetim sistemi
- ✅ Enterprise-level güvenlik

**Gelecek Vizyon:**
- 🔮 Ücretli abonelik sistemi (Stripe)
- 🔮 Gelişmiş analiz araçları
- 🔮 Mobil uygulama
- 🔮 AI portfolio assistant

**Hedef:**
Türkiye'de yatırımcıların güvenle kullanabileceği, şeffaf ve kullanıcı dostu bir portföy yönetim ve sosyal yatırım platformu olmak.

---

**Bu belge, projenin teknik detaylarına girmeden genel işleyişini ve özelliklerini anlatmaktadır. Kod örnekleri ve implementasyon detayları için diğer dokümantasyon dosyalarına bakınız.**
