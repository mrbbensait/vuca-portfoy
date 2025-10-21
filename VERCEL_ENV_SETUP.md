# Vercel Environment Variable Kurulumu

## Sorun
"Load failed" hatası alıyorsanız, Vercel'de environment variable'lar eksik demektir.

## Çözüm Adımları

### 1. Supabase Bilgilerini Alın
1. https://supabase.com adresine gidin
2. Projenizi seçin
3. **Project Settings** > **API** bölümüne gidin
4. Şu bilgileri kopyalayın:
   - **Project URL** (örn: `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (uzun bir JWT token)

### 2. Vercel'de Environment Variable'ları Ekleyin
1. https://vercel.com adresine gidin
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. Şu değişkenleri ekleyin:

   **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Supabase Project URL'iniz
   - Environment: Production, Preview, Development (hepsini seçin)

   **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Supabase anon key'iniz
   - Environment: Production, Preview, Development (hepsini seçin)

### 3. Yeniden Deploy Edin
Environment variable'ları ekledikten sonra:
1. **Deployments** sekmesine gidin
2. En son deployment'ın yanındaki **⋮** menüsüne tıklayın
3. **Redeploy** seçeneğini seçin
4. **Use existing Build Cache** seçeneğini KAPATIN
5. **Redeploy** butonuna tıklayın

### 4. Kontrol Edin
Deploy tamamlandıktan sonra:
- `https://your-app.vercel.app/api/health` adresine gidin
- `supabaseUrl` ve `supabaseKey` değerlerinin "configured" olduğunu kontrol edin

## Önemli Notlar
- Environment variable'lar `NEXT_PUBLIC_` ile başlamalı (client-side'da kullanılacakları için)
- Her değişiklikten sonra yeniden deploy etmelisiniz
- Build cache'i temizlemeyi unutmayın

## Hala Sorun mu Var?
1. Browser console'u açın (F12)
2. Network sekmesinde hataları kontrol edin
3. `/api/health` endpoint'ine istek atın ve yanıtı kontrol edin
