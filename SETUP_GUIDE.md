# 🚀 Hızlı Kurulum Rehberi - Portföy Röntgeni

Bu rehber sizi 10 dakikada çalışır hale getirecek basit adımları içerir.

## ✅ Adım 1: Supabase Hesabı (2 dakika)

1. [supabase.com](https://supabase.com) → **Start your project** → Sign in (GitHub/Google ile hızlı giriş)
2. **New Project** butonu
3. **Organization** seçin (yoksa önce oluşturun)
4. Proje bilgileri:
   - **Name**: `portfolio-rontgen` (istediğiniz ismi verin)
   - **Database Password**: Güçlü bir şifre (kaydedin!)
   - **Region**: `Europe (Frankfurt)` (Türkiye'ye en yakın)
5. **Create new project** → 1-2 dakika bekleyin

## ✅ Adım 2: API Anahtarlarını Alın (1 dakika)

Proje hazır olduktan sonra:

1. Sol menüden **⚙️ Project Settings** → **API**
2. Şunları kopyalayın:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGc...
   ```

## ✅ Adım 3: Veritabanını Hazırlayın (2 dakika)

1. Sol menüden **🔨 SQL Editor**
2. **➕ New query** butonu
3. Proje klasöründeki `supabase/migrations/001_initial_schema.sql` dosyasını açın
4. **Tüm içeriği** kopyalayıp SQL editöre yapıştırın
5. **▶️ Run** butonu (sağ alt köşe)
6. **Success** mesajını bekleyin (yeşil tik ✓)

## ✅ Adım 4: Projeyi Çalıştırın (5 dakika)

### Terminal'de:

```bash
# 1. Bağımlılıkları yükle (ilk seferinde biraz sürer)
npm install

# 2. .env dosyası oluştur
cp .env.example .env

# 3. .env dosyasını düzenle (not defteri/VSCode ile aç)
# NEXT_PUBLIC_SUPABASE_URL= → Supabase'den aldığınız URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY= → Supabase'den aldığınız anon key

# 4. Uygulamayı başlat
npm run dev
```

### Tarayıcıda:

1. [http://localhost:3000](http://localhost:3000) adresine git
2. **Kayıt Ol** butonu
3. E-posta + şifre gir (istediğiniz değerleri)
4. **Kayıt Ol** (e-posta doğrulaması gerekmez)
5. **Giriş Yap** → aynı bilgilerle giriş
6. **Hızlı Başlangıç** butonuna bas → 5 saniye bekle
7. 🎉 Hazır! Portföyünüzü görüntüleyin

## 🎯 İlk Varlığınızı Ekleyin

1. Üst menüden **Portföyüm**
2. **Varlık Ekle** butonu
3. Örnek:
   - **Sembol**: `ASELS.IS`
   - **Tür**: TR Hisse
   - **Miktar**: `100`
   - **Ortalama Fiyat**: `85.50`
4. **Ekle** → Başarılı!

## ❓ Sorun mu Yaşıyorsunuz?

### "Invalid API Key" hatası
- `.env` dosyasındaki URL ve KEY'i tekrar kontrol edin
- URL'nin sonunda `/` olmamalı
- Boşluk olmamalı

### "Network Error" / Bağlantı hatası
- Supabase projenizin **aktif** olduğunu kontrol edin
- İnternet bağlantınızı kontrol edin

### SQL hataları
- SQL dosyasının **tamamını** kopyaladığınızdan emin olun
- İlk satırdan son satıra kadar hepsini seçin

### Grafik görünmüyor
- "Hızlı Başlangıç" butonuna bastınız mı?
- Sayfayı yenileyin (F5)

## 📱 Ekranlar

- **Ana Panel**: Portföy özeti, getiri, dağılım
- **Portföyüm**: Varlıklarınızı yönetin
- **Analiz**: Volatilite, korelasyon, öneriler
- **Zaman Çizelgesi**: Değer grafiği
- **Raporlar**: PDF çıktısı
- **Uyarılar**: Hedef fiyat bildirimleri
- **Ayarlar**: Profil bilgileri

## 💡 İpuçları

- **Hızlı Başlangıç** butonu örnek veriler ekler (deneme için ideal)
- Tüm fiyatlar **TRY** bazında olmalı
- TR hisse için `.IS` ekini unutmayın (`THYAO.IS`)
- Kripto için `USDT` pair kullanın (`BTCUSDT`)
- ABD hisse için sadece ticker (`AAPL`, `GOOGL`)

## 🚀 Hazırsınız!

Artık portföyünüzü eksiksiz yönetebilirsiniz. Mutlu yatırımlar! 📈

---

Daha detaylı bilgi için `README.md` dosyasına bakın.
