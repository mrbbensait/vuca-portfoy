# Vercel Deployment Rehberi

Bu proje Vercel'de deploy edilmeye hazır. Ancak çalışması için Supabase environment variables'larını eklemeniz gerekiyor.

## Adım 1: Supabase Projesi Oluşturun (DETAYLI ANLATIM)

### 1.1. Supabase'e Kayıt Olun
1. Tarayıcınızda [https://supabase.com](https://supabase.com) adresine gidin
2. Sağ üstteki **"Start your project"** veya **"Sign Up"** butonuna tıklayın
3. GitHub hesabınızla giriş yapın (en kolay yol) veya e-posta ile kayıt olun
4. Ücretsiz, kredi kartı gerektirmez ✅

### 1.2. Yeni Proje Oluşturun
1. Giriş yaptıktan sonra **"New Project"** butonuna tıklayın
2. Bir **Organization** seçin (eğer ilk kez kullanıyorsanız otomatik oluşturulur)
3. Proje bilgilerini doldurun:
   - **Name:** `vuca-portfoy` (veya istediğiniz isim)
   - **Database Password:** Güçlü bir şifre girin ve **kaydedin** (önemli!)
   - **Region:** `Europe (Frankfurt)` veya size en yakın bölge
   - **Pricing Plan:** `Free` seçili olsun
4. **"Create new project"** butonuna tıklayın
5. Proje oluşturulurken 1-2 dakika bekleyin ☕

### 1.3. API Bilgilerini Alın
1. Proje hazır olduğunda, sol alttaki **⚙️ Settings** (Ayarlar) ikonuna tıklayın
2. Soldaki menüden **"API"** seçeneğine tıklayın
3. Sayfada şu bilgileri bulacaksınız:

   **📋 Kopyalamanız Gerekenler:**
   
   - **Project URL:** 
     - `Configuration` bölümünde, `URL` başlığı altında
     - Örnek: `https://abcdefghijklmnop.supabase.co`
     - Sağındaki 📋 kopyala ikonuna tıklayın
   
   - **anon public key:**
     - `Project API keys` bölümünde, `anon` `public` başlığı altında
     - Çok uzun bir metin (JWT token)
     - Sağındaki 📋 kopyala ikonuna tıklayın

4. Bu iki değeri bir yere not edin (Notepad, Word vs.) - sonra lazım olacak!

## Adım 2: Veritabanı Tablolarını Oluşturun (DETAYLI ANLATIM)

### 2.1. SQL Dosyasını Açın
1. Bilgisayarınızda bu projenin klasörünü açın
2. `supabase` klasörünü bulun
3. İçindeki `migrations` klasörünü açın
4. `001_initial_schema.sql` dosyasını bir metin editörü ile açın (VS Code, Notepad++ veya basit Notepad ile)
5. **Tüm içeriği kopyalayın** (Ctrl+A sonra Ctrl+C veya Cmd+A sonra Cmd+C)

### 2.2. Supabase'de SQL Editor'ü Açın
1. Tarayıcınızda [https://supabase.com/dashboard](https://supabase.com/dashboard) adresine gidin
2. Giriş yapın (eğer hesabınız yoksa ücretsiz hesap oluşturun)
3. Projenizi seçin (eğer yeni oluşturduysanız tek proje olacak)
4. Sol menüden **"SQL Editor"** yazısına tıklayın (📝 ikonu ile)

### 2.3. SQL Kodunu Çalıştırın
1. SQL Editor sayfası açıldığında, sağ üstte **"New query"** butonuna tıklayın
2. Açılan boş alana, kopyaladığınız SQL kodunu yapıştırın (Ctrl+V veya Cmd+V)
3. Sağ alt köşedeki **"Run"** (veya "Çalıştır") butonuna tıklayın
4. Yeşil bir "Success" mesajı görmelisiniz
5. Bu işlem 5-10 saniye sürebilir, bekleyin

### 2.4. Tabloların Oluştuğunu Kontrol Edin
1. Sol menüden **"Table Editor"** yazısına tıklayın (📊 ikonu ile)
2. Şu tabloları görmelisiniz:
   - `users_public`
   - `portfolios`
   - `holdings`
   - `transactions`
   - `price_history`
   - `notes`
   - `alerts`
3. Eğer bu tabloları görüyorsanız, başarılı! ✅

### ❗ Sorun Yaşarsanız:
- **"permission denied" hatası:** Projenin sahibi olduğunuzdan emin olun
- **"already exists" hatası:** Tablolar zaten oluşturulmuş, sorun yok
- **Başka bir hata:** SQL kodunu tekrar kopyalayıp yapıştırın ve tekrar deneyin

## Adım 3: Vercel'de Environment Variables Ekleyin (DETAYLI ANLATIM)

### 3.1. Vercel'e Gidin ve Projenizi Bulun
1. Tarayıcınızda [https://vercel.com/dashboard](https://vercel.com/dashboard) adresine gidin
2. GitHub ile giriş yapın (eğer yapmadıysanız)
3. Projenizi listede bulun (`vuca-portfoy` veya GitHub'dan import ettiğiniz isim)
4. Projeye tıklayın

### 3.2. Settings Sayfasına Gidin
1. Üstteki menüden **"Settings"** (Ayarlar) sekmesine tıklayın
2. Sol menüden **"Environment Variables"** seçeneğine tıklayın

### 3.3. İlk Environment Variable'ı Ekleyin (SUPABASE_URL)
1. **"Add New"** butonuna tıklayın
2. Açılan formda:
   - **Key (İsim):** `NEXT_PUBLIC_SUPABASE_URL` yazın (tam olarak bu şekilde, büyük-küçük harf önemli!)
   - **Value (Değer):** Supabase'den kopyaladığınız URL'yi yapıştırın (örn: `https://abcd.supabase.co`)
   - **Environments:** Üç seçeneği de işaretleyin:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. **"Save"** butonuna tıklayın

### 3.4. İkinci Environment Variable'ı Ekleyin (SUPABASE_KEY)
1. Tekrar **"Add New"** butonuna tıklayın
2. Açılan formda:
   - **Key (İsim):** `NEXT_PUBLIC_SUPABASE_ANON_KEY` yazın (tam olarak bu şekilde!)
   - **Value (Değer):** Supabase'den kopyaladığınız uzun anon key'i yapıştırın
   - **Environments:** Üç seçeneği de işaretleyin:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. **"Save"** butonuna tıklayın

### 3.5. Kontrol Edin
Şimdi sayfada 2 environment variable görmelisiniz:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**⚠️ UYARI:** 
- İsimleri tam olarak yukarıdaki gibi yazın, yoksa çalışmaz!
- Değerlerin başına veya sonuna boşluk koymayın
- Tırnak işareti eklemeyin, direkt yapıştırın

## Adım 4: Yeniden Deploy Edin (DETAYLI ANLATIM)

### 4.1. Deployments Sayfasına Gidin
1. Vercel Dashboard'da projenizin sayfasındayken
2. Üstteki menüden **"Deployments"** sekmesine tıklayın
3. En üstte, en son yapılan deployment'ı göreceksiniz (muhtemelen "Failed" - başarısız yazıyor)

### 4.2. Redeploy Yapın
1. En son deployment'ın **sağ tarafındaki üç nokta (⋯)** menüsüne tıklayın
2. Açılan menüden **"Redeploy"** seçeneğine tıklayın
3. Açılan popup'ta **"Redeploy"** butonuna tekrar tıklayın
4. Yeni bir build başlayacak, 2-3 dakika sürer

### 4.3. Build'in Tamamlanmasını Bekleyin
1. Sayfada "Building..." yazısını göreceksiniz
2. Tamamlandığında yeşil ✅ işareti ve "Ready" yazısı çıkacak
3. Artık siteniz yayında! 🎉

### 4.4. Sitenizi Açın
1. Deployment'ın üzerine tıklayın
2. Üstte sitenizin URL'sini göreceksiniz (örn: `vuca-portfoy.vercel.app`)
3. URL'ye tıklayarak sitenizi açın

## Adım 5: İlk Kullanıcıyı Oluşturun (DETAYLI ANLATIM)

### 5.1. Kayıt Olun
1. Siteniz açıldığında, sağ üstte **"Kayıt Ol"** veya **"Register"** linkine tıklayın
2. Veya direkt URL'nin sonuna `/auth/register` ekleyin
3. Formu doldurun:
   - **Ad Soyad:** İsteğe bağlı
   - **E-posta:** Gerçek e-posta adresinizi girin (doğrulama maili gelecek)
   - **Şifre:** En az 6 karakter
4. **"Kayıt Ol"** butonuna tıklayın

### 5.2. E-posta Doğrulaması
1. E-posta kutunuzu kontrol edin (Spam klasörüne de bakın)
2. Supabase'den gelen **"Confirm your signup"** (Kaydınızı onaylayın) mailine tıklayın
3. Maildeki **"Confirm your mail"** linkine tıklayın
4. Otomatik olarak giriş sayfasına yönlendirileceksiniz

### 5.3. Giriş Yapın
1. E-posta ve şifrenizi girerek giriş yapın
2. Ana sayfaya yönlendirileceksiniz

### 5.4. Örnek Verileri Yükleyin (Opsiyonel)
1. Ana sayfada **"Hızlı Başlangıç"** butonunu göreceksiniz
2. Bu butona tıklayın
3. Otomatik olarak:
   - Örnek bir portföy
   - Birkaç hisse senedi
   - İşlem geçmişi
   - Fiyat verileri
   - Notlar ve uyarılar oluşturulacak
4. Sayfa yenilenecek ve verilerinizi göreceksiniz!

**🎉 Tebrikler! Artık uygulamanız çalışıyor!**

## Sorun Giderme

### Build Hatası: "Supabase URL and API key are required"
- Environment variables'ları doğru eklediniz mi?
- `NEXT_PUBLIC_` prefix'ini kullandınız mı?
- Tüm ortamlar (Production, Preview, Development) için eklediniz mi?

### Veritabanı Hatası: "relation does not exist"
- SQL migration'ı çalıştırdınız mı?
- Supabase Dashboard'da **Table Editor** bölümünde tabloları görebiliyor musunuz?

### Auth Hatası: "Invalid login credentials"
- E-posta doğrulaması yaptınız mı?
- Supabase Dashboard'da **Authentication > Users** bölümünde kullanıcınızı görebiliyor musunuz?

## Demo Mode

Eğer Supabase kurmak istemiyorsanız, proje şu anda **Demo Mode**'da çalışıyor:
- Tüm veriler mock data'dan geliyor
- Değişiklikler kaydedilmiyor
- Sayfa yenilendiğinde veriler sıfırlanıyor

Gerçek bir uygulama için mutlaka Supabase kurulumu yapmalısınız.

## Destek

Sorun yaşarsanız:
1. `SETUP_GUIDE.md` dosyasını okuyun
2. `KULLANIM_TURU.md` dosyasını okuyun
3. GitHub Issues'da yeni bir issue açın
