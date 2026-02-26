/**
 * Yasal Metinler ve Sabitler
 * SPK, KVKK ve diğer yasal gereklilikler
 * 
 * ÖNEMLİ: Bu metinler bir hukuk uzmanı tarafından gözden geçirilmelidir!
 */

export const COMPANY_INFO = {
  name: 'VUCA Borsa LTD',
  legalType: 'Private Company Limited by Shares',
  address: {
    street: '284 CHASE ROAD',
    building: 'A BLOCK 2ND FLOOR',
    city: 'LONDON',
    country: 'ENGLAND',
    postalCode: 'N14 6HF',
  },
  contact: {
    email: 'bilgi@vucaborsa.com',
    website: 'https://xportfoy.com',
  },
  lastUpdated: '26 Şubat 2026',
} as const;

export const SPK_DISCLAIMER = `
# Yatırım Tavsiyesi Reddi Bildirimi

Bu platform, **${COMPANY_INFO.name}** tarafından işletilmekte olup, yalnızca **bilgilendirme ve portföy yönetim aracı** olarak hizmet vermektedir.

## Önemli Açıklama

Bu platformda yer alan:
- Tüm bilgiler, analizler, grafikler ve içerikler
- Portföy performans raporları
- Varlık dağılım önerileri
- Kullanıcılar tarafından paylaşılan portföyler ve işlemler
- Herhangi bir analiz veya hesaplama

**YALNIZCA BİLGİLENDİRME AMAÇLIDIR** ve hiçbir şekilde **yatırım tavsiyesi niteliği taşımaz**.

## SPK Düzenlemeleri Uyarınca

**Sermaye Piyasası Kurulu (SPK)** düzenlemeleri uyarınca, bu platform **yatırım danışmanlığı faaliyeti yapmamaktadır**. Platform, Sermaye Piyasası Kanunu kapsamında yetkilendirilmiş bir kuruluş değildir.

## Kullanıcı Sorumluluğu

1. **Kendi Kararınız:** Tüm yatırım kararlarınızın sorumluluğu tamamen size aittir.

2. **Profesyonel Danışmanlık:** Yatırım kararlarınızı vermeden önce lisanslı yatırım danışmanlarından bilgi almanız şiddetle önerilir.

3. **Sosyal Özellikler:** Kullanıcılar tarafından paylaşılan portföyler ve işlemler, o kullanıcıların kişisel tercihleridir. Başkalarının işlemlerini taklit etmek yüksek risk içerir ve kendi araştırmanızı yapmadan bu tür işlemleri uygulamaktan kaçınmalısınız.

4. **Veri Doğruluğu:** Platform üzerindeki fiyat ve piyasa verileri üçüncü taraf kaynaklardan alınmaktadır. Veri doğruluğu garanti edilemez.

## Risk Uyarısı

Finansal piyasalarda işlem yapmak yüksek risk içerir. Yatırım yaptığınız sermayenin tamamını kaybedebilirsiniz. Sadece kaybetmeyi göze alabileceğiniz fonlarla yatırım yapın.

---

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}
`.trim();

export const SPK_RISK_DISCLOSURE = `
# SPK Risk Bildirimi

## Sayın Yatırımcı,

Menkul kıymetler, kambiyo, kripto varlıklar ve emtia piyasalarında yapacağınız işlemler sonucunda kar elde edebileceğiniz gibi **zarar riskiniz de bulunmaktadır**.

Bu nedenle, işlem yapmaya karar vermeden önce, piyasalarda karşılaşabileceğiniz riskleri anlamanız, mali durumunuzu ve kısıtlarınızı dikkate alarak karar vermeniz gerekmektedir.

## Temel Risk Faktörleri

### 1. Portföy Takibi Hizmeti
Bu platform bir **portföy takip ve yönetim aracıdır**, yatırım danışmanlığı değildir. Platformun sağladığı hesaplamalar ve analizler bilgilendirme amaçlıdır.

### 2. Geçmiş Performans
**Geçmiş performans, gelecek performansın garantisi değildir.** Bir portföy veya varlığın geçmişte iyi performans göstermiş olması, gelecekte de aynı performansı göstereceği anlamına gelmez.

### 3. Piyasa Riski
Tüm finansal piyasalar **volatiliteye tabidir**. Değerler aniden ve öngörülemez şekilde artabilir veya düşebilir. Piyasa koşulları hızla değişebilir.

### 4. Likidite Riski
Bazı varlıkları satmak istediğinizde alıcı bulamayabilir veya **kayda değer bir fiyat düşüşü** ile satmak zorunda kalabilirsiniz.

### 5. Kaldıraç Riski
Eğer kaldıraçlı işlem yapıyorsanız, **tüm yatırımınızdan daha fazlasını kaybedebilirsiniz**. Kaldıraç kullanımı hem kazançları hem de kayıpları büyütür.

### 6. Döviz Kuru Riski
Yabancı para cinsinden varlıklara yatırım yapıyorsanız, **döviz kuru dalgalanmaları** portföy değerinizi etkileyebilir.

### 7. Kripto Varlık Riskleri
Kripto varlıklar:
- **Düzenlemeye tabi değildir**
- **Aşırı yüksek volatiliteye sahiptir**
- **Tamamen değersiz hale gelebilir**
- **Siber saldırılara açıktır**
- **Yasal koruma sınırlıdır**

### 8. Sosyal Platform Riskleri
Bu platform kullanıcıların portföylerini paylaşmasına izin vermektedir. **DİKKAT:**
- Başkalarının portföylerini taklit etmek **yüksek risk** içerir
- Paylaşılan bilgiler **yanlış veya yanıltıcı** olabilir
- Her yatırımcının risk profili ve hedefleri farklıdır
- **Kendi araştırmanızı yapmadan** işlem yapmayın

### 9. Teknik Riskler
- Platform kesintisi yaşanabilir
- Veri kaybı meydana gelebilir
- Fiyat verilerinde gecikmeler olabilir
- Üçüncü taraf API'lar çalışmayabilir

### 10. Kayıp Riski
**Yatırım yaptığınız sermayenin tamamını kaybedebilirsiniz.** Sadece kaybetmeyi göze alabileceğiniz fonlarla yatırım yapın.

## Sorumluluk Reddi

${COMPANY_INFO.name}, bu platformu kullanmanız sonucunda oluşabilecek hiçbir **maddi veya manevi zarardan sorumlu değildir**. Tüm yatırım kararlarınızın sorumluluğu size aittir.

## Onay

Bu risk bildirimini okuyup anladığınızı ve kabul ettiğinizi onaylayarak, yukarıda belirtilen tüm riskleri anladığınızı ve bu riskleri almayı kabul ettiğinizi beyan etmiş olursunuz.

---

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}
`.trim();

export const KVKK_PRIVACY_POLICY = `
# Gizlilik ve Kişisel Verilerin Korunması Politikası

**${COMPANY_INFO.name}** olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin güvenliği konusunda azami hassasiyeti göstermekteyiz.

## 1. Veri Sorumlusu

**Veri Sorumlusu:** ${COMPANY_INFO.name}  
**Adres:** ${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.building}, ${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}, ${COMPANY_INFO.address.postalCode}  
**E-posta:** ${COMPANY_INFO.contact.email}

## 2. Toplanan Kişisel Veriler

Platformumuzu kullanırken aşağıdaki kişisel verileriniz toplanmaktadır:

### 2.1 Kimlik ve İletişim Bilgileri
- Ad, soyad
- E-posta adresi
- Şifre (şifreli olarak saklanır)

### 2.2 İşlem Bilgileri
- Portföy bilgileri (varlık türleri, miktarlar, işlem geçmişi)
- Alım-satım işlemleri
- Not ve uyarılar
- Duyurular

### 2.3 Teknik Veriler
- IP adresi
- Tarayıcı türü ve versiyonu
- İşletim sistemi
- Cihaz bilgileri
- Erişim zamanları ve sayfalar
- Çerez verileri

### 2.4 Sosyal Etkileşim Verileri (İsteğe Bağlı)
- Public portföy paylaşımları
- Takip ettikleriniz ve takipçileriniz
- Telegram bot token'ı (şifreli)

## 3. Kişisel Verilerin İşlenme Amaçları

Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

### 3.1 Hizmet Sunumu
- Kullanıcı hesabınızı oluşturmak ve yönetmek
- Portföy takibi ve yönetim hizmeti sunmak
- Platform özelliklerini sağlamak
- Telegram entegrasyonu hizmeti vermek

### 3.2 Güvenlik
- Hesap güvenliğini sağlamak
- Yetkisiz erişimi önlemek
- Sahtekarlık ve kötüye kullanımı tespit etmek
- Yasal yükümlülükleri yerine getirmek

### 3.3 İyileştirme ve Analiz
- Platform performansını ölçmek
- Kullanıcı deneyimini iyileştirmek
- Hata ayıklama ve sorun giderme
- İstatistiksel analizler yapmak

### 3.4 İletişim
- Önemli platform güncellemeleri hakkında bilgilendirme
- Güvenlik uyarıları
- Destek talepleri

## 4. Verilerin Saklanma Süresi

Kişisel verileriniz:
- **Aktif kullanım süresince:** Hesabınız aktif olduğu sürece
- **Hesap silindikten sonra:** KVKK ve diğer yasal yükümlülükler gereği **30 gün** içinde silinir
- **Yasal zorunluluklar:** İlgili mevzuat uyarınca daha uzun süre saklanması gerekiyorsa o süre boyunca

## 5. Verilerin Paylaşılması

Kişisel verileriniz aşağıdaki durumlar dışında **üçüncü taraflarla paylaşılmaz**:

### 5.1 Hizmet Sağlayıcılar
- **Supabase:** Veritabanı ve kimlik doğrulama (veri şifreleme ile)
- **Vercel/Hosting:** Platform barındırma
- **Fiyat veri sağlayıcıları:** Yahoo Finance, Binance API (sadece sembol bilgisi)

### 5.2 Yasal Zorunluluklar
- Mahkeme kararı
- Yasal düzenleme gereği
- Kamu otoritelerinin talebi

### 5.3 Sosyal Özellikler (Sizin İzninizle)
- Public olarak ayarladığınız portföy bilgileriniz diğer kullanıcılarla paylaşılır
- **Para miktarlarınız asla paylaşılmaz**, sadece oran ve sembol bilgileri

## 6. KVKK Kapsamındaki Haklarınız

KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

### 6.1 Bilgi Talep Etme
Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme

### 6.2 Düzeltme Talep Etme
Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme

### 6.3 Silme Talep Etme (Right to be Forgotten)
Kişisel verilerinizin silinmesini veya yok edilmesini isteme

### 6.4 İtiraz Etme
Kişisel verilerinizin kanuna aykırı olarak işlenmesi halinde bundan kaynaklanan zararın giderilmesini talep etme

### 6.5 Aktarım Talep Etme
Kişisel verilerinizin başka bir veri sorumlusuna aktarılmasını isteme (veri taşınabilirliği)

## 7. Haklarınızı Nasıl Kullanabilirsiniz?

KVKK haklarınızı kullanmak için:

📧 **E-posta:** ${COMPANY_INFO.contact.email}  
📝 **Konu:** KVKK Başvurusu  
📄 **Gerekli Bilgiler:** Ad, soyad, e-posta, talep türü, açıklama

**Yanıt Süresi:** Başvurunuz en geç **30 gün** içinde yanıtlanacaktır (KVKK m.13).

## 8. Veri Güvenliği

Kişisel verilerinizin güvenliği için aşağıdaki önlemler alınmıştır:

### 8.1 Teknik Önlemler
- **SSL/TLS Şifreleme:** Tüm veri iletimi şifreli
- **Şifre Hashleme:** Şifreler bcrypt ile hashlenmiş
- **Row Level Security (RLS):** Veritabanı seviyesinde izolasyon
- **Rate Limiting:** Kötüye kullanım önleme
- **2FA Desteği:** İki faktörlü kimlik doğrulama (yakında)

### 8.2 İdari Önlemler
- Sınırlı erişim yetkisi
- Düzenli güvenlik denetimleri
- Veri erişim kayıtları (audit logs)
- Personel eğitimleri

## 9. Çerezler (Cookies)

Platformumuz çerez kullanmaktadır. Detaylı bilgi için [Çerez Politikası](/legal/cookies) sayfasını inceleyiniz.

## 10. Değişiklikler

Bu politika gerektiğinde güncellenebilir. Önemli değişiklikler için kullanıcılar bilgilendirilecektir.

## 11. İletişim

Gizlilik politikamız hakkında sorularınız için:  
📧 ${COMPANY_INFO.contact.email}

---

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}  
**Versiyon:** 1.0
`.trim();

export const TERMS_OF_SERVICE = `
# Kullanım Şartları

Portföy Röntgeni platformunu kullanarak aşağıdaki şartları kabul etmiş olursunuz.

## 1. Hizmet Tanımı

**XPortfoy** (Dijital Portföy Röntgeni), ${COMPANY_INFO.name} tarafından sunulan bir **portföy takip ve yönetim aracıdır**. Platform:
- Çoklu varlık portföy yönetimi (BIST, ABD, kripto, altın, gümüş, döviz)
- Performans analizi ve raporlama
- Sosyal portföy paylaşımı (isteğe bağlı)
- Telegram entegrasyonu (isteğe bağlı)

sağlar.

## 2. Kullanıcı Sorumlulukları

### 2.1 Hesap Güvenliği
- Hesap bilgilerinizi gizli tutmakla yükümlüsünüz
- Şifrenizi başkalarıyla paylaşmamalısınız
- Yetkisiz erişim tespit ederseniz derhal bildirmelisiniz
- Hesabınızdan yapılan tüm işlemlerden siz sorumlusunuz

### 2.2 Doğru Bilgi Sağlama
- Kayıt sırasında doğru ve güncel bilgi vermelisiniz
- Sahte kimlik veya bilgi kullanmak yasaktır
- 18 yaşından küçükseniz platform kullanılamaz

### 2.3 Yasaklı Aktiviteler
Aşağıdaki aktiviteler **kesinlikle yasaktır**:

❌ Platformu yasadışı amaçlarla kullanmak  
❌ Başkalarının hesaplarına yetkisiz erişim  
❌ Kötü amaçlı yazılım yaymak  
❌ Platform güvenliğini tehdit etmek  
❌ Spam veya taciz edici içerik paylaşmak  
❌ Sistemleri aşırı yüklemek (DDoS vb.)  
❌ Tersine mühendislik yapmak  
❌ Verileri otomatik olarak çekmek (scraping)  

## 3. Platform Sorumluluk Reddi

${COMPANY_INFO.name} aşağıdaki konularda **sorumluluk kabul etmez**:

### 3.1 Yatırım Kayıpları
Platform bir yatırım tavsiyesi aracı değildir. Tüm yatırım kararlarınızın sorumluluğu size aittir.

### 3.2 Veri Doğruluğu
Üçüncü taraf kaynaklardan alınan fiyat ve piyasa verilerinin doğruluğunu garanti edemeyiz.

### 3.3 Hizmet Kesintileri
Platform:
- Geçici olarak erişilemez olabilir
- Bakım için kapatılabilir
- Herhangi bir zamanda değiştirilebilir veya sonlandırılabilir

### 3.4 Veri Kaybı
Düzenli yedekleme yapılsa da, teknik sorunlar nedeniyle veri kaybı yaşanabilir. Önemli verilerinizi düzenli olarak dışa aktarmanız önerilir.

### 3.5 Üçüncü Taraf Hizmetler
Platform, üçüncü taraf hizmetleri (Yahoo Finance, Binance API, Telegram vb.) kullanır. Bu hizmetlerin kesintisi veya hataları bizim kontrolümüz dışındadır.

### 3.6 Sosyal İçerik
Kullanıcılar tarafından paylaşılan portföyler ve içeriklerden sorumlu değiliz. Başkalarının içeriğine güvenmeden önce kendi araştırmanızı yapın.

## 4. Fikri Mülkiyet Hakları

Platform ve tüm içeriği (kod, tasarım, logo, metin) ${COMPANY_INFO.name}'nin mülkiyetindedir. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.

**Ancak:**
- Kendi portföy verileriniz size aittir
- Kendi verilerinizi istediğiniz zaman dışa aktarabilirsiniz

## 5. Hesap Dondurma ve Kapatma

${COMPANY_INFO.name}, aşağıdaki durumlarda **herhangi bir bildirimde bulunmaksızın** hesabınızı dondurma veya kapatma hakkını saklı tutar:

- Kullanım şartlarını ihlal etmeniz
- Yasal gerekliliklere aykırı davranışlar
- Platform güvenliğini tehdit eden aktiviteler
- Uzun süre inaktif hesaplar (1 yıl+)

## 6. Hesap Silme (KVKK Hakkı)

Hesabınızı istediğiniz zaman silebilirsiniz:
- Settings → Hesap Sil
- KVKK uyarınca verileriniz 30 gün içinde silinir
- Yasal zorunluluklar nedeniyle bazı veriler daha uzun süre saklanabilir

## 7. Değişiklik Hakkı

${COMPANY_INFO.name}, bu kullanım şartlarını istediği zaman değiştirme hakkını saklı tutar. Önemli değişiklikler için kullanıcılar bilgilendirilecektir.

**Son değişiklikleri takip etmek sizin sorumluluğunuzdadır.**

## 8. Uygulanacak Hukuk

Bu sözleşme **Türkiye Cumhuriyeti** yasalarına tabidir.

## 9. İhtilaf Çözümü

Platform kullanımından kaynaklanan ihtilaflar öncelikle **dostane yollarla** çözülmeye çalışılacaktır. Anlaşmaya varılamaması halinde **İstanbul Mahkemeleri ve İcra Daireleri** yetkilidir.

## 10. İletişim

Kullanım şartları hakkında sorularınız için:  
📧 ${COMPANY_INFO.contact.email}

---

**Kabul Tarihi:** Hesap oluşturma tarihiniz  
**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}  
**Versiyon:** 1.0
`.trim();

export const COOKIE_POLICY = `
# Çerez Politikası

${COMPANY_INFO.name} olarak, platformumuzda kullanıcı deneyimini iyileştirmek ve hizmetlerimizi sağlamak amacıyla çerezler kullanmaktayız.

## 1. Çerez Nedir?

**Çerez (Cookie)**, web sitelerini ziyaret ettiğinizde tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin sizi hatırlamasını ve tercihlerinizi kaydetmesini sağlar.

## 2. Çerez Türleri

### 2.1 Zorunlu Çerezler ⚠️
Bu çerezler platformun çalışması için **zorunludur** ve kapatılamaz.

| Çerez Adı | Amaç | Süre |
|-----------|------|------|
| \`sb-auth-token\` | Kimlik doğrulama (Supabase) | Oturum |
| \`sb-refresh-token\` | Oturum yenileme | 30 gün |
| \`privacy-mode\` | Gizlilik modu tercihi | Kalıcı |
| \`cookie-consent\` | Çerez tercihiniz | 1 yıl |

### 2.2 Performans Çerezleri 📊 (Opsiyonel)
Platform performansını ölçmek ve iyileştirmek için kullanılır.

| Çerez Adı | Amaç | Süre |
|-----------|------|------|
| \`_ga\` | Google Analytics (varsa) | 2 yıl |
| \`_gid\` | Google Analytics oturum | 24 saat |
| \`vercel-analytics\` | Vercel Analytics | Oturum |

### 2.3 İşlevsellik Çerezleri 🎨 (Opsiyonel)
Tercihlerinizi hatırlamak için kullanılır.

| Çerez Adı | Amaç | Süre |
|-----------|------|------|
| \`theme\` | Tema tercihi (açık/koyu) | Kalıcı |
| \`language\` | Dil tercihi | Kalıcı |
| \`portfolio-view\` | Portföy görünüm tercihi | Kalıcı |

## 3. Çerezleri Yönetme

### 3.1 Platform Üzerinden
Settings → Çerez Tercihleri sayfasından istediğiniz zaman tercihlerinizi değiştirebilirsiniz.

### 3.2 Tarayıcı Ayarları
Çerezleri tarayıcınızın ayarlarından tamamen engelleyebilir veya silebilirsiniz:

- **Chrome:** Ayarlar → Gizlilik ve Güvenlik → Çerezler
- **Firefox:** Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri
- **Safari:** Tercihler → Gizlilik → Çerezleri Yönet
- **Edge:** Ayarlar → Gizlilik ve Hizmetler → Çerezler

**⚠️ Uyarı:** Zorunlu çerezleri engellerseniz platform düzgün çalışmayabilir.

## 4. Üçüncü Taraf Çerezleri

Platformumuz şu üçüncü taraf hizmetlerini kullanabilir:
- **Supabase:** Kimlik doğrulama ve veritabanı
- **Vercel:** Hosting ve analytics
- **Google Analytics:** (varsa) Kullanım istatistikleri

Bu hizmetlerin kendi gizlilik politikaları vardır.

## 5. Çerezlerin Yasal Dayanağı

Çerezler KVKK ve 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Hakkında Kanun kapsamında kullanılmaktadır.

**Zorunlu çerezler:** Hizmet sunumu için meşru menfaat  
**Opsiyonel çerezler:** Açık rızanız (cookie banner)

## 6. İletişim

Çerez politikamız hakkında sorularınız için:  
📧 ${COMPANY_INFO.contact.email}

---

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}
`.trim();

export const DISCLAIMER = `
# Feragat Beyanı (Disclaimer)

## 1. Genel Sorumluluk Reddi

**XPortfoy** (Dijital Portföy Röntgeni) platformu, ${COMPANY_INFO.name} tarafından "**OLDUĞU GİBİ**" sunulmaktadır. Platform kullanımından kaynaklanan hiçbir **doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan zarardan** sorumlu değiliz.

## 2. Yatırım Tavsiyesi Değildir

⚠️ **ÇOK ÖNEMLİ:**

Bu platform ve içeriği:
- **Yatırım tavsiyesi değildir**
- **Alım-satım önerisi değildir**
- **Finansal danışmanlık değildir**

Sermaye Piyasası Kurulu (SPK) düzenlemeleri uyarınca, bu platform **yatırım danışmanlığı lisansına sahip değildir**.

**Tüm yatırım kararlarınızın sorumluluğu tamamen size aittir.**

## 3. Geçmiş Performans Garantisi Değildir

Platformda gösterilen:
- Portföy performansları
- Geçmiş getiriler
- Kar/zarar hesaplamaları
- İstatistikler ve grafikler

**Gelecek performansın garantisi DEĞİLDİR.** Geçmişte kar etmiş olmak, gelecekte de kar edeceğiniz anlamına gelmez.

## 4. Veri Doğruluğu Reddi

Platform, fiyat ve piyasa verilerini üçüncü taraf kaynaklardan (Yahoo Finance, Binance API vb.) almaktadır.

**Garanti edemeyiz:**
- ✗ Verilerin %100 doğruluğu
- ✗ Verilerin gerçek zamanlı olması
- ✗ Verilerin eksiksiz olması
- ✗ Hesaplamaların hatasız olması

**Önemli kararlar almadan önce resmi kaynaklardan teyit alın.**

## 5. Sosyal Platform Riskleri

### 5.1 Kullanıcı İçeriği
Kullanıcılar tarafından paylaşılan:
- Portföyler
- İşlemler
- Duyurular
- Yorumlar

**Bizim tarafımızdan onaylanmamıştır** ve doğruluğu garanti edilmemektedir.

### 5.2 Taklit Riski
**UYARI:** Başkalarının portföylerini veya işlemlerini taklit etmek **son derece risklidir**:

❌ Her yatırımcının risk profili farklıdır  
❌ Mali durumlar farklıdır  
❌ Yatırım hedefleri farklıdır  
❌ Paylaşılan bilgiler yanıltıcı olabilir  
❌ Zarar riski çok yüksektir  

**Kendi araştırmanızı yapın. Körü körüne takip etmeyin.**

## 6. Telegram Entegrasyonu

Telegram bot entegrasyonu:
- Kullanıcı tarafından kurulur
- Kullanıcı sorumluluğundadır
- Telegram'ın kullanım şartlarına tabidir
- Bot token güvenliği kullanıcıya aittir

**Telegram hesabınızın güvenliği sorumluluğumuzda değildir.**

## 7. Teknik Sorumluluk Reddi

### 7.1 Hizmet Kesintileri
Platform:
- Geçici olarak erişilemez olabilir
- Bakım nedeniyle kapatılabilir
- Hata verebilir
- Yavaşlayabilir

**Kesintilerden kaynaklanan kayıplardan sorumlu değiliz.**

### 7.2 Veri Kaybı
Teknik sorunlar nedeniyle:
- Veriler kaybolabilir
- İşlemler kaydedilmeyebilir
- Yedeklemeler başarısız olabilir

**Önemli verilerinizi düzenli olarak dışa aktarın.**

### 7.3 Güvenlik İhlalleri
Maksimum güvenlik önlemleri alınsa da:
- Siber saldırılar olabilir
- Veri ihlalleri yaşanabilir
- Hesaplar tehlikeye girebilir

**2FA kullanın ve güçlü şifre seçin.**

## 8. Üçüncü Taraf Hizmetler

Platform şu üçüncü taraf hizmetleri kullanır:
- Supabase (veritabanı)
- Vercel (hosting)
- Yahoo Finance (fiyat verileri)
- Binance API (kripto fiyatları)
- Telegram API (bot entegrasyonu)

**Bu hizmetlerin kesintisi veya hatalarından sorumlu değiliz.**

## 9. Yasal Sorumluluk Sınırlaması

Türkiye Cumhuriyeti yasaları çerçevesinde, platform kullanımından kaynaklanan:
- Maddi zararlar
- Manevi zararlar
- İş kaybı
- Kar kaybı
- Veri kaybı

için ${COMPANY_INFO.name} **sorumluluk kabul etmez**.

## 10. Değişiklik Hakkı

Bu feragat beyanı herhangi bir zamanda değiştirilebilir. Platformu kullanmaya devam ederek değişiklikleri kabul etmiş olursunuz.

## 11. Soru ve İletişim

Feragat beyanı hakkında sorularınız için:  
📧 ${COMPANY_INFO.contact.email}

---

**⚠️ ÖZETLE:**
- Platform bir araçtır, tavsiye değildir
- Kendi araştırmanızı yapın
- Profesyonel danışman kullanın
- Sadece kaybetmeyi göze alabileceğiniz parayla yatırım yapın
- Tüm sorumluluk sizdedir

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}
`.trim();

export const ABOUT_US = `
# Hakkımızda

## XPortfoy

**Dijital Portföy Röntgeni**

**Türkiye'nin ilk sosyal portföy yönetim platformu** 🚀

### Misyonumuz

Yatırımcıların tüm varlıklarını (BIST, ABD, kripto, altın, gümüş, döviz) **tek bir platformda** yönetmesini, analiz etmesini ve isteğe bağlı olarak **paylaşmasını** sağlamak.

### Vizyonumuz

Şeffaf, sosyal ve güçlü bir yatırım topluluğu oluşturmak. Bilgiyi demokratikleştirmek ve yatırımcıları bir araya getirmek.

## Neden XPortfoy?

### 🌍 Çoklu Varlık Desteği
6 farklı piyasayı tek portföyde: BIST hisse, ABD hisse, kripto, altın, gümüş, döviz

### 👥 Sosyal Platform
İsterseniz portföyünüzü paylaşın, isterseniz başkalarını takip edin. Tamamen size kalmış!

### 📱 Telegram Entegrasyonu
Finfluencer mısınız? Kendi Telegram kanalınıza otomatik bildirim gönderin.

### ⚡ Yüksek Performans
Akıllı cache sistemi ve batch API ile lightning-fast deneyim.

### 🔒 Bank-Level Güvenlik
Row Level Security, encryption, rate limiting - enterprise güvenlik standartları.

## Şirket Bilgileri

**${COMPANY_INFO.name}**  
${COMPANY_INFO.legalType}

**Adres:**  
${COMPANY_INFO.address.street}  
${COMPANY_INFO.address.building}  
${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}  
${COMPANY_INFO.address.postalCode}

**İletişim:**  
📧 E-posta: ${COMPANY_INFO.contact.email}  
🌐 Web: ${COMPANY_INFO.contact.website}

## İletişim

### Genel Sorular
📧 ${COMPANY_INFO.contact.email}

### KVKK Başvuruları
📄 Kişisel verilerinizle ilgili talepleriniz için [KVKK Başvuru Formu](/legal/kvkk-request) kullanabilirsiniz.

### Teknik Destek
Platform kullanımı ile ilgili sorunlarınız için Geri Bildirim butonu kullanın (footer'da).

## Yasal

- [Gizlilik Politikası](/legal/privacy)
- [Kullanım Şartları](/legal/terms)
- [Çerez Politikası](/legal/cookies)
- [Feragat Beyanı](/legal/disclaimer)
- [SPK Risk Bildirimi](#) (Modal)

## Topluluk

Platform hala **beta aşamasındadır** ve aktif olarak geliştirilmektedir. Geri bildirimleriniz çok değerli!

🙏 **Teşekkürler** - Türkiye'nin ilk sosyal portföy platformuna güvendiğiniz için!

---

**Son Güncelleme:** ${COMPANY_INFO.lastUpdated}
`.trim();
