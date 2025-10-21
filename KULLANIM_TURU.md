# 📖 Portföy Röntgeni - Kullanım Turu

Uygulamanın tüm özelliklerini keşfedin!

## 🏠 Ana Panel

### Gördükleriniz:
- **Toplam Portföy Değeri**: Tüm varlıklarınızın güncel TRY değeri
- **Günlük/Haftalık/Aylık Getiri**: Zaman bazlı performans
- **Portföy Sağlık Skoru**: 0-100 arası kapsamlı değerlendirme
  - Getiri puanı (0-40)
  - Çeşitlilik puanı (0-30)
  - Risk puanı (0-30)

### Grafikler:
- **Varlık Dağılımı**: Pasta grafikte portföyünüzün kompozisyonu
- **En İyi 5 Varlık**: Kar/zarar bazında en iyi performans
- **En Zayıf 5 Varlık**: Dikkat edilmesi gereken pozisyonlar

### İpucu:
💡 Portföy Sağlık Skoru 80+ ise güçlü bir portföyünüz var demektir!

---

## 💼 Portföyüm

### Varlık Yönetimi

**Varlık Ekle:**
1. **Varlık Ekle** butonuna tıklayın
2. Bilgileri doldurun:
   - **Sembol**: ASELS.IS, AAPL, BTCUSDT gibi
   - **Tür**: TR Hisse / ABD Hisse / Kripto / Nakit
   - **Miktar**: Sahip olduğunuz adet
   - **Ortalama Fiyat**: TRY bazında maliyet fiyatı
   - **Not**: Opsiyonel açıklama

**Örnekler:**
```
TR Hisse:
- Sembol: ASELS.IS, THYAO.IS, GARAN.IS
- Miktar: 100, 500, 1000
- Fiyat: Alış fiyatınız (örn: 85.50)

ABD Hisse:
- Sembol: AAPL, GOOGL, MSFT
- Miktar: 10, 5, 15
- Fiyat: TRY karşılığı (örn: AAPL $175 × 34.5 = 6037.50)

Kripto:
- Sembol: BTCUSDT, ETHUSDT
- Miktar: 0.05, 0.5 (ondalıklı olabilir)
- Fiyat: TRY karşılığı

Nakit:
- Sembol: TRY
- Miktar: 50000
- Fiyat: 1 (her zaman 1)
```

**Varlık Sil:**
- Her varlığın yanındaki çöp kutusu ikonuna tıklayın
- Onay verin

### İşlem Geçmişi

- Son 20 işleminiz listelenir
- Alış/Satış işlemleri
- Tarih, miktar, fiyat detayları
- Otomatik olarak seed ile oluşturulur

### Notlar

**Not Ekle:**
1. **Not Ekle** butonuna tıklayın
2. Not kapsamı seçin:
   - **Pozisyon**: Belirli bir varlık için (sembol belirtin)
   - **Haftalık**: Haftalık gözlemler
   - **Genel**: Portföy hakkında genel notlar
3. İçeriği yazın
4. **Ekle**

**Kullanım Örnekleri:**
- "ASELS.IS pozisyonunu %10 artırmayı planlıyorum"
- "Bu hafta teknoloji hisseleri güçlü"
- "Nakit oranını %20'ye çıkarmak istiyorum"

---

## 📊 Analiz

### Portföy Sağlık Skoru Detayları

**3 ana bileşen:**
1. **Getiri Puanı (0-40)**
   - Aylık getiri %5+ ise maksimum puan
   - Negatif getiri düşük puan

2. **Çeşitlilik Puanı (0-30)**
   - Varlık sayısı (10+ varlık ideal)
   - Dağılım dengesi (eşit ağırlıklar tercih edilir)
   - Tür çeşitliliği (4 türden de olmalı)

3. **Risk Puanı (0-30)**
   - Düşük volatilite yüksek puan
   - %2 günlük volatilite altı ideal

### Metrikler

**Volatilite:**
- Günlük fiyat değişimlerinin standart sapması
- %2 altı: Düşük risk ✅
- %2-5 arası: Orta risk ⚠️
- %5 üzeri: Yüksek risk ❗

**Çeşitlilik Skoru:**
- 80+: Mükemmel çeşitlendirme
- 60-80: İyi çeşitlendirme
- 40-60: Orta seviye
- 40 altı: Zayıf çeşitlendirme

**Nakit Oranı:**
- %10-20 ideal
- Fırsatları değerlendirmek için
- Aşırı nakit getiriyi düşürür

**Risk Seviyesi:**
- Düşük / Orta / Yüksek
- Volatilite + nakit oranına göre

### Korelasyon Haritası

**Renkler:**
- 🔴 Kırmızı: Pozitif korelasyon (birlikte hareket eder)
- ⚪ Gri: Nötr (bağımsız)
- 🔵 Mavi: Negatif korelasyon (ters hareket eder)

**İdeal Portföy:**
- Düşük korelasyonlu varlıklar (mavi/gri)
- Risk dağıtımı sağlar
- Bir varlık düşerken diğeri yükselebilir

### Otomatik Öneriler

Sistem otomatik olarak önerir:
- ⚠️ Yüksek volatilite varsa
- ⚠️ Çeşitlilik düşükse
- ⚠️ Nakit oranı çok düşükse
- ✅ Portföy sağlıklıysa

---

## ⏰ Zaman Çizelgesi

### Değer Grafiği

- Son 60 günlük portföy değeri
- Başlangıç vs güncel karşılaştırma
- Yüzdelik değişim

**Not:** Grafik mevcut varlıklarınızın geçmiş fiyatlarına göre hesaplanır. Geçmişte satılan varlıklar dahil değildir.

**Kullanım:**
- Trend analizi yapın
- Hangi dönemlerde yükseliş/düşüş oldu?
- Kararlı mı yoksa dalgalı mı?

---

## 📄 Raporlar

### Aylık Özet

**İçerik:**
- Portföy özet kartları
- Performans metrikleri (günlük/haftalık/aylık)
- Varlık dağılımı (yüzde ve TRY değerleri)
- Tüm varlıkların detay tablosu
- Son 10 işlem

### PDF İndir

1. **PDF İndir** butonuna tıklayın
2. Tarayıcınızın print ekranı açılır
3. **Hedef**: "PDF olarak kaydet"
4. **Kaydet**

**İpucu:**
- Aylık raporlarınızı arşivleyin
- Performans takibi yapın
- Yatırım stratejinizi değerlendirin

---

## 🔔 Uyarılar

### Hedef Fiyat Uyarısı

**Nasıl Eklenir:**
1. **Uyarı Ekle** → **Hedef Fiyat**
2. Sembol: ASELS.IS
3. Hedef Fiyat: 95.00 TRY
4. **Ekle**

**Kullanım Senaryosu:**
"ASELS.IS'i 85 TRY'den aldım, 95 TRY'ye geldiğinde satış yapmayı düşünüyorum."

### Portföy Değişim Uyarısı

**Nasıl Eklenir:**
1. **Uyarı Ekle** → **Portföy Değişimi**
2. Eşik: 5% (örnek)
3. **Ekle**

**Kullanım Senaryosu:**
"Portföyüm günlük %5'ten fazla düşerse haberdar olmak istiyorum."

### Aktif/Pasif Durumu

- Yeşil güç düğmesi: Aktif
- Gri güç düğmesi: Pasif
- Tıklayarak durumu değiştirin

**Not:** V1 sürümünde uyarılar sadece UI'da görünür, e-posta/push bildirimi yoktur.

---

## ⚙️ Ayarlar

### Profil

- Ad Soyad güncelleme
- E-posta bilgisi (değiştirilemez)
- Hesap ID

### Para Birimi

- V1'de sadece TRY desteklenir
- Gelecek sürümlerde USD, EUR vs. eklenecek

---

## 💡 Pro İpuçları

### 1. Düzenli Takip
- Haftada bir "Analiz" sayfasını kontrol edin
- Önerilere dikkat edin
- Portföy skorunuzu takip edin

### 2. Not Alın
- Her önemli kararınızı not edin
- Haftalık gözlemlerinizi kaydedin
- Stratejinizi dokümante edin

### 3. Çeşitlendirin
- En az 8-10 farklı varlık bulundurun
- 4 varlık türünden de olsun
- Sektör çeşitliliğine dikkat edin

### 4. Nakit Rezervi
- %10-20 nakit bulundurun
- Fırsatlar için hazır olun
- Acil durumlar için tampon

### 5. Raporları Arşivleyin
- Her ay sonunda PDF indirin
- Yıllık performansınızı inceleyin
- Stratejinizi optimize edin

---

## ❓ Sık Sorulan Sorular

**S: Mock fiyat verisi ne demek?**
C: V1 sürümünde gerçek API kullanılmıyor, örnek fiyatlar üretiliyor. Gerçek portföyünüz için fiyatları manuel girmeniz gerekir.

**S: ABD hisse fiyatlarını nasıl girerim?**
C: Dolar fiyatını güncel TRY kuru ile çarpın. Örnek: AAPL $175 × 34.5 = 6037.50 TRY

**S: Kripto için hangi pair'i kullanmalıyım?**
C: USDT pair kullanın: BTCUSDT, ETHUSDT. Fiyatı dolar cinsinden alıp TRY'ye çevirin.

**S: Portföy Sağlık Skoru nasıl artırılır?**
C: 
- Getiri: Pozitif performans gösteren varlıklar ekleyin
- Çeşitlilik: Farklı türde varlıklar ekleyin
- Risk: Volatilitesi düşük varlıklar tercih edin

**S: Uyarılar e-posta ile geliyor mu?**
C: V1'de hayır, sadece UI'da görünür. V2'de bildirim sistemi eklenecek.

---

## 🎯 Başarılı Kullanım Örneği

### Örnek Senaryo:

**Başlangıç:**
- 50.000 TRY nakit
- Hiç varlık yok
- Skor: 0

**1. Ay:**
- 5 TR hisse + 3 ABD hisse + 2 kripto ekledim
- 10.000 TRY nakit bıraktım
- Skor: 65

**3. Ay:**
- Çeşitlendirdim (12 farklı varlık)
- Nakit %15'e çıkardım
- Haftalık notlar tutuyorum
- Skor: 82

**6. Ay:**
- Korelasyona dikkat ederek dengeli portföy
- Hedef fiyat uyarıları kurdum
- Aylık raporları arşivliyorum
- Skor: 89
- **Yıllık getiri: +18%**

---

**İyi yatırımlar! 📈**

Daha fazla bilgi için `README.md` ve `SETUP_GUIDE.md` dosyalarına bakın.
