/**
 * Akıllı Fiyat Formatlayıcı
 * Fiyat büyüklüğüne göre dinamik ondalık basamak sayısı belirler
 */

export function formatPrice(price: number): string {
  const absPrice = Math.abs(price)
  
  // Çok düşük fiyatlar (< 0.01) - Micro-cap coinler (FLOKI, SHIB vb.)
  if (absPrice < 0.01 && absPrice > 0) {
    // Anlamlı ilk rakamı bul ve 6 hane göster
    const decimals = Math.max(2, Math.ceil(-Math.log10(absPrice)) + 5)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.min(decimals, 8)
    })
  }
  
  // Düşük fiyatlar (0.01 - 1) - Altcoinler
  if (absPrice < 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    })
  }
  
  // Orta fiyatlar (1 - 100) - Çoğu coin
  if (absPrice < 100) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  // Yüksek fiyatlar (100 - 10,000) - ETH, BNB
  if (absPrice < 10000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  // Çok yüksek fiyatlar (>= 10,000) - Bitcoin, hisseler
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * Büyük sayılar için formatlayıcı (toplam değerler, kar/zarar)
 * Tam sayı olarak gösterir
 * TRY için Türkiye formatı (1.234.567), USD için ABD formatı (1,234,567)
 */
export function formatLargeNumber(num: number): string {
  // TRY için - Türkiye formatı (nokta binlik ayraç)
  return num.toLocaleString('tr-TR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })
}

/**
 * USD için büyük sayı formatlayıcı
 * ABD formatı (virgül binlik ayraç)
 */
export function formatLargeNumberUSD(num: number): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })
}

/**
 * Yüzde formatı (kar/zarar yüzdesi)
 */
export function formatPercent(value: number): string {
  return value.toFixed(2)
}
