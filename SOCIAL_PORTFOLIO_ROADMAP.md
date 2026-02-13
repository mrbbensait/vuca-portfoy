# 🗺️ Sosyal Portföy & Stripe Entegrasyonu — Yol Haritası

> Bu dosya, projenin "Sosyal Portföy" ve "Ücretli İzleme (Stripe)" özelliklerinin
> tüm fazlarını, adımlarını ve her adım için kullanılacak promptları içerir.
> Cascade her yeni oturumda bu dosyayı okuyarak kaldığı yerden devam edebilir.

---

## 📊 GENEL DURUM

| Özellik | Durum |
|---------|-------|
| Bireysel Portföy Yönetimi | ✅ Tamamlandı |
| Sosyal Portföy (Faz 1-4) | ✅ FAZ 4 Tamamlandı |
| Stripe Entegrasyonu (Faz 5-7) | ⬜ Başlanmadı |

---

## BÖLÜM A: SOSYAL PORTFÖY (Ücretsiz)

### FAZ 1 — Veritabanı Altyapısı
> Portföylerin herkese açık yapılabilmesi için DB şemasını genişlet

| # | Adım | Durum |
|---|------|-------|
| 1.1 | `008_social_portfolio.sql` migration dosyası oluştur | ✅ |
|     | — `portfolios` tablosuna `is_public`, `slug`, `description`, `follower_count` ekle | |
|     | — `portfolio_follows` tablosu oluştur | |
|     | — `users_public` tablosuna `avatar_url`, `bio`, `is_profile_public` ekle | |
|     | — Follower count trigger oluştur | |
|     | — Gerekli indexleri ekle | |
| 1.2 | RLS politikalarını güncelle (public portföylerin görünmesi için) | ✅ |
|     | — `portfolios` SELECT: kendi + is_public=true | |
|     | — `holdings` SELECT: kendi + public portföylerin holdingleri | |
|     | — `transactions` SELECT: kendi + public portföylerin işlemleri | |
|     | — `users_public` SELECT: kendi + is_profile_public=true | |
|     | — `portfolio_follows` için CRUD politikaları | |
| 1.3 | `database.types.ts` — yeni alanları TypeScript tiplerine ekle | ✅ |
| 1.4 | Migration'ı Supabase'e uygula ve test et | ✅ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 1'i uygula.
Veritabanı migration dosyasını oluştur, TypeScript tiplerini güncelle.
```

---

### FAZ 2 — Portföy Görünürlük Ayarları
> Kullanıcının kendi portföyünü "Herkese Açık" yapabilmesi

| # | Adım | Durum |
|---|------|-------|
| 2.1 | `/api/portfolios` PATCH endpoint'ine `is_public`, `slug`, `description` desteği ekle | ✅ |
| 2.2 | `PortfolioVisibilityToggle` bileşeni oluştur | ✅ |
|     | — is_public switch (açık/kapalı) | |
|     | — slug input (URL-friendly, benzersiz) | |
|     | — description textarea (kısa açıklama) | |
| 2.3 | Portföy ayarları UI'ına toggle'ı entegre et (mevcut PortfolioSelector veya ayrı modal) | ✅ |
| 2.4 | Slug oluşturma yardımcı fonksiyonu (Türkçe karakter desteği) | ✅ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 2'yi uygula.
Portföy görünürlük ayarları — is_public toggle, slug ve description alanlarını ekle.
```

---

### FAZ 3 — Keşfet Sayfası & Public Portföy Görünümü
> Public portföyleri listelemek ve read-only görüntülemek

| # | Adım | Durum |
|---|------|-------|
| 3.1 | `/api/explore` GET endpoint'i — public portföyleri listele (sayfalama, sıralama) | ✅ |
| 3.2 | `/api/portfolios/[id]/public` GET — tek bir public portföy detayı (holdings + transactions) | ✅ |
| 3.3 | `/explore` sayfası — portföy kartları grid, arama, filtre | ✅ |
| 3.4 | `PublicPortfolioCard` bileşeni (ad, sahip, takipçi, varlık sayısı) | ✅ |
| 3.5 | `/p/[slug]` sayfası — read-only portföy görünümü | ✅ |
| 3.6 | `PublicPortfolioView` bileşeni (mevcut Dashboard'un read-only versiyonu) | ✅ |
| 3.7 | Middleware güncelle — `/explore` ve `/p/[slug]` rotalarını public yap | ✅ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 3'ü uygula.
Keşfet sayfası ve public portföy görünümünü oluştur.
```

---

### FAZ 4 — Takip Sistemi
> Giriş yapmış kullanıcıların public portföyleri takip etmesi

| # | Adım | Durum |
|---|------|-------|
| 4.1 | `/api/portfolios/[id]/follow` POST/DELETE — takip et / takibi bırak | ✅ |
| 4.2 | `/api/my-follows` GET — takip ettiğim portföyleri listele | ✅ |
| 4.3 | `FollowButton` bileşeni (takip et / takibi bırak toggle) | ✅ |
| 4.4 | `/following` sayfası — takip ettiğim portföylerin listesi | ✅ |
| 4.5 | Dashboard'a "Takip Ettiklerim" + "Keşfet" navigasyon linkleri ekle | ✅ |
| 4.6 | Middleware kontrol — `/following` zaten auth-required (public path'te değil) | ✅ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 4'ü uygula.
Takip sistemi — follow/unfollow API, FollowButton bileşeni ve /following sayfası.
```

---

### FAZ 4.5 — Profil & Navigasyon
> Kullanıcı profili ve sosyal navigasyon

| # | Adım | Durum |
|---|------|-------|
| 4.5.1 | `/profile/[id]` sayfası — kullanıcının public portföyleri | ✅ |
| 4.5.2 | Ana navigasyona "Keşfet" ve "Takip Ettiklerim" linkleri ekle | ✅ (FAZ 4'te yapıldı) |
| 4.5.3 | Responsive tasarım ve UX polish (profil linki, sahip adı tıklanabilir) | ✅ |
| 4.5.4 | Sosyal portföy end-to-end test | ✅ (build başarılı) |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 4.5'i uygula.
Profil sayfası, navigasyon güncellemeleri ve UX polish.
```

---

## BÖLÜM B: STRIPE ENTEGRASYONu (Ücretli)

> ⚠️ Bu bölüme Bölüm A tamamen bittikten sonra başlanacak.
> Monetizasyon modeli (Creator Economy vs Platform Aboneliği vs Hybrid) henüz belirlenmedi.

### FAZ 5 — Stripe Temel Entegrasyon
| # | Adım | Durum |
|---|------|-------|
| 5.1 | Monetizasyon modeline karar ver | ⬜ |
| 5.2 | Stripe SDK kurulumu (stripe, @stripe/stripe-js) | ⬜ |
| 5.3 | Stripe environment variables (.env) | ⬜ |
| 5.4 | DB migration — `is_premium`, `subscription_price`, `stripe_price_id`, `portfolio_subscriptions` tablosu | ⬜ |
| 5.5 | Stripe Connect onboarding (portföy sahibi için) — model bağımlı | ⬜ |
| 5.6 | Stripe Checkout session oluşturma API | ⬜ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 5'i uygula.
Stripe temel entegrasyon — SDK kurulumu, migration ve Checkout API.
```

---

### FAZ 6 — Subscription Yönetimi & Webhooks
| # | Adım | Durum |
|---|------|-------|
| 6.1 | `/api/webhooks/stripe` — Stripe webhook handler | ⬜ |
| 6.2 | Subscription lifecycle yönetimi (active, canceled, past_due) | ⬜ |
| 6.3 | Customer Portal entegrasyonu (abonelik yönetimi) | ⬜ |
| 6.4 | Premium portföy fiyatlandırma UI | ⬜ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 6'yı uygula.
Stripe webhook handler, subscription yönetimi ve Customer Portal.
```

---

### FAZ 7 — Premium Erişim Kontrolü
| # | Adım | Durum |
|---|------|-------|
| 7.1 | RLS güncelle — premium portföy verilerine sadece aktif aboneler erişebilsin | ⬜ |
| 7.2 | Public view'da free vs premium ayrımı (özet vs detay) | ⬜ |
| 7.3 | "Premium Ol" / "Abone Ol" CTA bileşeni | ⬜ |
| 7.4 | Portföy sahibi gelir dashboard'u (kazanç özeti) | ⬜ |
| 7.5 | End-to-end test — ödeme akışı | ⬜ |

**Prompt:**
```
SOCIAL_PORTFOLIO_ROADMAP.md dosyasını oku ve FAZ 7'yi uygula.
Premium erişim kontrolü — RLS, free/premium ayrımı ve abone ol CTA.
```

---

## 🔑 ÖNEMLİ KURALLAR

1. **Notes ve Alerts asla public olmayacak** — bunlar her zaman kişisel
2. **Write işlemleri (INSERT/UPDATE/DELETE) sadece portföy sahibine ait** — takipçiler read-only
3. **Slug benzersiz olmalı** ve Türkçe karakter desteği (ş→s, ç→c, vb.)
4. **Rate limiting** — explore ve follow API'lerinde kötüye kullanımı önle
5. **Her faz bağımsız deploy edilebilir olmalı** — kademeli yayın

---

## 📝 NOTLAR

- Supabase Project ID: `vylamnxvpkaherigutub` (mrbbensait@gmail.com's Project, us-east-1)
- Stripe hesabı: (Faz 5'te gerekecek)
- Son güncelleme: 2026-02-13
