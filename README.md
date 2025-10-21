# 📊 Portföy Röntgeni V1

TR hisse, ABD hisse ve kripto varlıklarınızı tek yerden yönetin. Değer, dağılım, getiri, risk, korelasyon ve portföy puanı gibi özetleri görsün.

## 🚀 Özellikler

- **Çoklu Varlık Desteği**: TR Hisse, ABD Hisse, Kripto ve Nakit
- **Ana Panel**: Portföy değeri, günlük/haftalık/aylık getiri, dağılım, en iyi/en zayıf varlıklar
- **Analiz**: Volatilite, çeşitlilik, korelasyon, portföy sağlık skoru
- **Zaman Çizelgesi**: Portföy değerinin tarihsel grafiği
- **Raporlar**: Aylık özet raporları ve PDF çıktısı
- **Uyarılar**: Hedef fiyat ve portföy değişim uyarıları
- **Not Yönetimi**: Pozisyon, haftalık ve genel notlar
- **Güvenlik**: Supabase Auth + RLS (Row Level Security)

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres + Auth)
- **Grafikler**: Recharts
- **UI**: Lucide Icons
- **Tarih İşlemleri**: date-fns

## 📋 Ön Gereksinimler

- Node.js 18+ yüklü olmalı
- Bir Supabase hesabı (ücretsiz plan yeterli)

## 🔧 Kurulum Adımları

### 1. Supabase Projesi Oluşturun

1. [https://supabase.com](https://supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje adı ve şifre belirleyin
4. Proje oluşturulduktan sonra:
   - Sol menüden **Project Settings** > **API** bölümüne gidin
   - **Project URL** değerini kopyalayın
   - **anon/public** key değerini kopyalayın

### 2. Veritabanı Şemasını Oluşturun

1. Supabase Dashboard'da sol menüden **SQL Editor** bölümüne gidin
2. "New Query" butonuna tıklayın
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayın
4. SQL editöre yapıştırın ve **Run** butonuna tıklayın
5. İşlemin başarılı olduğunu kontrol edin (yeşil tik işareti görünmeli)

### 3. Ortam Değişkenlerini Ayarlayın

1. Proje klasöründe `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cp .env.example .env
   ```

2. `.env` dosyasını açın ve değerleri doldurun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://sizin-proje-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sizin-anon-key-buraya
   ```

### 4. Bağımlılıkları Yükleyin

```bash
npm install
```

### 5. Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📱 İlk Kullanım

### 1. Kayıt Olun

- Ana sayfada "Kayıt Ol" butonuna tıklayın
- E-posta ve şifre ile kayıt oluşturun
- E-posta doğrulama linkini kontrol edin (Supabase ücretsiz planda gerekli değildir)

### 2. Giriş Yapın

- E-posta ve şifrenizle giriş yapın
- Alternatif olarak "Sihirli Link" ile giriş yapabilirsiniz

### 3. Hızlı Başlangıç

- İlk girişte "Hızlı Başlangıç" butonuna basın
- Bu işlem:
  - Örnek bir portföy oluşturur
  - 6-7 farklı varlık ekler (TR hisse, ABD hisse, kripto, nakit)
  - 60 günlük fiyat geçmişi ekler
  - Örnek notlar ve uyarılar oluşturur

### 4. Kendi Varlıklarınızı Ekleyin

- **Portföyüm** sayfasından "Varlık Ekle" butonuna tıklayın
- Sembol, tür, miktar ve ortalama fiyat bilgilerini girin
- Örnek semboller:
  - TR Hisse: `ASELS.IS`, `THYAO.IS`, `GARAN.IS`
  - ABD Hisse: `AAPL`, `GOOGL`, `MSFT`, `NVDA`
  - Kripto: `BTCUSDT`, `ETHUSDT`, `ADAUSDT`
  - Nakit: `TRY`

## 📊 Ekranlar

### Ana Panel
- Toplam portföy değeri
- Günlük/haftalık/aylık getiri
- Portföy sağlık skoru (0-100)
- Varlık dağılımı (pasta grafiği)
- En iyi 5 ve en zayıf 5 varlık

### Portföyüm
- Varlık listesi ve yönetimi
- İşlem geçmişi
- Not ekleme ve görüntüleme

### Analiz
- Portföy sağlık skoru detayları
- Volatilite analizi
- Çeşitlilik skoru
- Nakit oranı
- Risk seviyesi
- Korelasyon ısı haritası
- Otomatik öneriler

### Zaman Çizelgesi
- Portföy değerinin tarihsel grafiği
- Başlangıç ve güncel değer karşılaştırması

### Raporlar
- Aylık performans özeti
- Varlık dağılımı ve detayları
- Son işlemler
- PDF çıktısı (tarayıcı print özelliği ile)

### Uyarılar
- Hedef fiyat uyarıları
- Portföy değişim uyarıları
- Aktif/pasif durumu yönetimi

### Ayarlar
- Profil bilgileri
- Para birimi tercihi (V1'de sadece TRY)
- Hesap bilgileri

## 🧮 Hesaplama Formülleri

### Portföy Sağlık Skoru (0-100)
- **Getiri Puanı (0-40)**: Aylık getiri bazlı, %5+ = 40 puan
- **Çeşitlilik Puanı (0-30)**: Varlık sayısı, dağılım dengesi, tür çeşitliliği
- **Risk Puanı (0-30)**: Düşük volatilite = yüksek puan

### Volatilite
- Günlük portföy getirilerinin standart sapması
- Yıllıklaştırılmamış (V1)

### Çeşitlilik Skoru
- Varlık sayısı puanı (0-40)
- Ağırlık dengesi (HHI bazlı) (0-30)
- Tür çeşitliliği (0-30)

### Korelasyon
- Pearson korelasyon katsayısı
- Günlük getiriler bazlı
- -1 (ters korelasyon) ile +1 (tam korelasyon) arası

## 🔒 Güvenlik

- Tüm veriler Supabase'de şifreli olarak saklanır
- Row Level Security (RLS) aktif - kullanıcılar sadece kendi verilerini görebilir
- Supabase Auth ile güvenli kimlik doğrulama
- API anahtarları environment variable'larda saklanır

## 🐛 Sorun Giderme

### "Invalid API Key" Hatası
- `.env` dosyasının doğru doldurulduğundan emin olun
- Supabase URL'nin sonunda `/` olmamalı
- Anon key'in doğru kopyalandığını kontrol edin

### "RLS Policy" Hataları
- SQL migration dosyasının tamamen çalıştırıldığından emin olun
- Supabase Dashboard > Authentication > Policies bölümünden kontrol edin

### Fiyat Verisi Görünmüyor
- "Hızlı Başlangıç" butonuna bastığınızdan emin olun
- Bu işlem 60 günlük fiyat geçmişi oluşturur

### Grafik Görünmüyor
- Tarayıcı konsolunda JavaScript hatası olup olmadığını kontrol edin
- Sayfayı yenilemeyi deneyin

## 📝 Notlar

- **V1 Özellikleri**: Bu versiyon temel özellikleri içerir
- **Fiyat Verileri**: Mock veri kullanılmaktadır, gerçek API entegrasyonu yoktur
- **Para Birimi**: Tüm fiyatlar TRY bazındadır
- **Zaman Dilimi**: Europe/Istanbul (UTC+3)

## 🚀 Gelecek Özellikler (V2+)

- Gerçek zamanlı fiyat API entegrasyonu
- Çoklu portföy desteği
- Hedef belirleme ve takip
- Gelişmiş grafikler ve analizler
- Mobil uygulama
- Bildirim sistemi
- Daha fazla varlık türü desteği

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## 🤝 Destek

Herhangi bir sorun veya öneriniz için:
- GitHub Issues bölümünü kullanın
- Dokümantasyonu dikkatli okuyun
- `.env.example` dosyasındaki talimatları takip edin

---

**Mutlu Yatırımlar! 📈**
