# Vercel Deployment Rehberi

Bu proje Vercel'de deploy edilmeye hazır. Ancak çalışması için Supabase environment variables'larını eklemeniz gerekiyor.

## Adım 1: Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projenizi seçin
3. **Project Settings > API** bölümüne gidin
4. Aşağıdaki değerleri not edin:
   - **Project URL** (örn: `https://abcdefgh.supabase.co`)
   - **anon/public key** (uzun bir JWT token)

## Adım 2: Veritabanı Tablolarını Oluşturun

1. Supabase Dashboard'da **SQL Editor** bölümüne gidin
2. `supabase/migrations/001_initial_schema.sql` dosyasındaki SQL kodunu çalıştırın
3. Bu kod tüm gerekli tabloları ve ilişkileri oluşturacak

## Adım 3: Vercel'de Environment Variables Ekleyin

1. [Vercel Dashboard](https://vercel.com/dashboard) adresine gidin
2. Projenizi seçin
3. **Settings > Environment Variables** bölümüne gidin
4. Aşağıdaki değişkenleri ekleyin:

### Gerekli Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**ÖNEMLİ:** 
- Her iki değişken de **Production**, **Preview** ve **Development** ortamları için eklenmelidir
- `NEXT_PUBLIC_` prefix'i önemlidir, değiştirmeyin
- Değerleri tırnak işareti olmadan yapıştırın

## Adım 4: Yeniden Deploy Edin

Environment variables'ları ekledikten sonra:

1. Vercel Dashboard'da **Deployments** sekmesine gidin
2. En son deployment'ın yanındaki **⋯** menüsüne tıklayın
3. **Redeploy** seçeneğini seçin
4. Build başarılı olacak ve siteniz yayına girecek

## Adım 5: İlk Kullanıcıyı Oluşturun

1. Deploy edilen sitenize gidin
2. `/auth/register` sayfasından yeni bir hesap oluşturun
3. E-posta doğrulaması yapın (Supabase'den gelecek)
4. Giriş yapın ve "Hızlı Başlangıç" butonuna tıklayarak örnek verileri yükleyin

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
