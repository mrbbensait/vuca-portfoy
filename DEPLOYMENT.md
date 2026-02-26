# 🚀 XPortfoy Deployment Rehberi

## Vercel Deployment

### 1. Environment Variables

Vercel Dashboard'da aşağıdaki environment variable'ları ekleyin:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram (Opsiyonel)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
TELEGRAM_ENCRYPTION_KEY=your_64_char_hex_key

# App URL
NEXT_PUBLIC_APP_URL=https://xportfoy.com
```

### 2. Domain Konfigürasyonu

#### xportfoy.com (Primary Domain)
1. Vercel Dashboard → Settings → Domains
2. `xportfoy.com` ekleyin
3. DNS ayarlarınızı Vercel'in verdiği değerlerle güncelleyin:
   - A Record: `76.76.21.21`
   - CNAME (www): `cname.vercel-dns.com`

#### portfoyrontgeni.com (Redirect)
1. Aynı şekilde `portfoyrontgeni.com` ekleyin
2. Vercel otomatik olarak `xportfoy.com`'a redirect edecektir

### 3. Build Settings

Vercel otomatik olarak Next.js'i algılar. Varsayılan ayarlar:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### 4. SEO & Analytics (Opsiyonel)

#### Google Search Console
1. https://search.google.com/search-console adresine gidin
2. Domain ekleyin: `xportfoy.com`
3. `app/layout.tsx` içindeki `verification.google` değerini güncelleyin

#### Google Analytics
Eğer kullanacaksanız, Google Analytics ID'sini environment variable olarak ekleyin:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 5. Supabase RLS Policies

Production'a geçmeden önce tüm RLS policy'lerinin aktif olduğundan emin olun:
```sql
-- Her tablo için RLS enable
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ... diğer tablolar
```

### 6. Deployment Adımları

1. **GitHub'a Push:**
   ```bash
   git add .
   git commit -m "Production ready - XPortfoy rebrand complete"
   git push origin main
   ```

2. **Vercel'e Deploy:**
   - Vercel otomatik olarak GitHub'dan deploy edecektir
   - Veya manuel: `vercel --prod`

3. **Domain DNS Ayarları:**
   - Domain sağlayıcınızda DNS ayarlarını yapın
   - Propagation süresi: 24-48 saat

### 7. Post-Deployment Checklist

- [ ] Ana sayfa yükleniyor mu? (`https://xportfoy.com`)
- [ ] Auth akışı çalışıyor mu? (Login/Register)
- [ ] Supabase bağlantısı aktif mi?
- [ ] Public portfolios görünüyor mu? (`/explore`)
- [ ] API endpoints çalışıyor mu?
- [ ] Telegram entegrasyonu test edildi mi?
- [ ] SEO meta tags doğru mu? (View Page Source)
- [ ] robots.txt erişilebilir mi? (`/robots.txt`)
- [ ] Sitemap erişilebilir mi? (`/sitemap.xml`)
- [ ] HTTPS çalışıyor mu?
- [ ] Redirect çalışıyor mu? (`portfoyrontgeni.com` → `xportfoy.com`)

### 8. Performance Monitoring

Vercel Analytics otomatik olarak aktiftir. Ayrıca:
- Web Vitals'ı kontrol edin
- Lighthouse audit çalıştırın
- Supabase Dashboard'dan query performance'ı izleyin

---

## 🔒 Güvenlik Notları

1. **Environment Variables:** `.env` dosyası asla commit edilmemeli (`.gitignore`'da var)
2. **Service Role Key:** Sadece server-side kullanılmalı
3. **RLS Policies:** Tüm tablolarda aktif olmalı
4. **HTTPS:** Vercel otomatik SSL sertifikası sağlar

---

## 📞 Destek

Sorun yaşarsanız:
- Vercel Logs: Dashboard → Deployments → [Deployment] → Logs
- Supabase Logs: Dashboard → Logs
- Email: bilgi@vucaborsa.com

---

**Son Güncelleme:** 26 Şubat 2026  
**Versiyon:** 1.0.0  
**Platform:** Next.js 16.1.6 + Supabase
