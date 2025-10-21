# 🚀 Hızlı Başlangıç Rehberi

## ⚠️ ÖNEMLİ: Şu Anda Durum

Projeniz Vercel'de **deploy olmuş** ama **çalışmıyor** çünkü:
- ❌ Supabase environment variables eksik
- ❌ Veritabanı tabloları oluşturulmamış

**Placeholder değerler** kullanıldığı için build başarılı oldu ama site açılmıyor.

---

## 📋 Yapmanız Gerekenler (15 Dakika)

### 1️⃣ Supabase Hesabı Oluştur (5 dk)

1. **https://supabase.com** → Sign Up (GitHub ile giriş yapın)
2. **New Project** → İsim: `vuca-portfoy`
3. **Database Password** girin ve **kaydedin** (önemli!)
4. **Region:** Europe (Frankfurt)
5. **Create** → 1-2 dakika bekleyin

### 2️⃣ API Bilgilerini Al (2 dk)

1. Sol altta **⚙️ Settings** → **API**
2. İki değeri kopyalayın:
   - **URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Uzun JWT token

### 3️⃣ Veritabanı Tablolarını Oluştur (3 dk)

1. **Bilgisayarınızda:** `supabase/migrations/001_initial_schema.sql` dosyasını açın
2. **Tüm içeriği kopyalayın** (Ctrl+A → Ctrl+C)
3. **Supabase'de:** Sol menü → **SQL Editor** → **New query**
4. **Yapıştırın** ve **Run** butonuna tıklayın
5. **Kontrol:** Table Editor'de 7 tablo görmelisiniz ✅

### 4️⃣ Vercel'de Environment Variables Ekle (3 dk)

#### KOLAY YOL (Önerilen):

1. **Bilgisayarınızda** proje klasöründe `.env.local` dosyası oluşturun
2. İçine şunu yazın:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...uzun-key
```
3. **Vercel'de:** Settings → Environment Variables → **Import .env**
4. Dosyayı seçin veya içeriği yapıştırın → Import

#### MANUEL YOL:

1. **Vercel:** Settings → Environment Variables → **Add New**
2. İki değişken ekleyin:
   - Key: `NEXT_PUBLIC_SUPABASE_URL` → Value: URL'niz
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: Key'iniz
3. Her ikisi için de **Production, Preview, Development** seçin

### 5️⃣ Redeploy (2 dk)

1. **Vercel:** Deployments sekmesi
2. En son deployment → **⋯** menü → **Redeploy**
3. 2-3 dakika bekleyin → Yeşil ✅ Ready

### 6️⃣ Siteyi Kullanmaya Başla

1. Sitenizi açın (örn: `vuca-portfoy.vercel.app`)
2. **Kayıt Ol** → E-posta doğrula
3. **Giriş Yap** → **Hızlı Başlangıç** butonuna tıkla
4. Örnek veriler yüklenecek! 🎉

---

## 🔍 Sorun mu Var?

### "Site açılmıyor / beyaz sayfa"
→ Environment variables eklediniz mi? Redeploy yaptınız mı?

### "relation does not exist" hatası
→ SQL migration'ı çalıştırdınız mı? Table Editor'de tabloları görüyor musunuz?

### "Invalid login credentials"
→ E-posta doğrulaması yaptınız mı? Spam klasörüne bakın.

### Vercel'de "Import .env" butonunu bulamıyorum
→ Settings → Environment Variables sayfasında sağ üstte olmalı. Görmüyorsanız manuel ekleme yapın.

---

## 📚 Detaylı Rehberler

- **VERCEL_DEPLOYMENT.md** - Tam deployment rehberi
- **SETUP_GUIDE.md** - Kurulum rehberi
- **KULLANIM_TURU.md** - Kullanım kılavuzu

---

## ✅ Kontrol Listesi

- [ ] Supabase hesabı oluşturdum
- [ ] API bilgilerini aldım (URL + Key)
- [ ] SQL migration'ı çalıştırdım (7 tablo var)
- [ ] Vercel'de environment variables ekledim
- [ ] Redeploy yaptım
- [ ] Site açılıyor ve çalışıyor
- [ ] Kayıt oldum ve giriş yaptım
- [ ] Hızlı başlangıç ile örnek verileri yükledim

**Hepsi tamamsa: 🎉 Tebrikler! Uygulamanız hazır!**
