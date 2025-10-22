/**
 * 🔧 Sembol Normalizasyon Utility
 * 
 * Kripto sembolleri için standart format sağlar.
 * 
 * AMAÇ:
 * - Kullanıcılar farklı formatlar girebilir (BTC, BTCUSD, BTCUSDT)
 * - Sistem bunları tek bir standarda normalize eder
 * - Duplicate varlık oluşumu engellenir
 * 
 * STANDART:
 * - Kripto: Base sembol + USDT (örn: BTCUSDT)
 * - TR Hisse: Sembol + .IS (örn: ASELS.IS)
 * - US Hisse: Orijinal sembol (örn: AAPL)
 */

import { AssetType } from './types/database.types'

export interface NormalizedSymbol {
  /** Normalized sembol (veritabanında saklanacak) */
  normalized: string
  /** Kullanıcı friendly display name */
  displayName: string
  /** Base sembol (örn: BTC, ETH) */
  base: string
  /** Pair currency (sadece kripto için, örn: USDT) */
  quoteCurrency?: string
}

/**
 * Kripto sembolleri için normalizasyon
 * 
 * Girdi örnekleri:
 * - "BTC" -> "BTCUSDT"
 * - "btcusd" -> "BTCUSDT"
 * - "BTCUSDT" -> "BTCUSDT"
 * - "eth" -> "ETHUSDT"
 * - "xrpbusd" -> "XRPUSDT"
 */
function normalizeCrypto(symbol: string): NormalizedSymbol {
  const upper = symbol.toUpperCase().trim()
  
  // Zaten USDT ile bitiyorsa, direkt kullan
  if (upper.endsWith('USDT')) {
    const base = upper.replace(/USDT$/, '')
    return {
      normalized: upper,
      displayName: base,
      base,
      quoteCurrency: 'USDT'
    }
  }
  
  // USD, BUSD, USDC gibi suffixleri kaldır ve USDT ekle
  const base = upper.replace(/(USD|BUSD|USDC|TUSD|DAI)$/i, '')
  
  // Eğer hiç suffix yoksa (sadece BTC, ETH gibi), direkt USDT ekle
  const normalized = base + 'USDT'
  
  return {
    normalized,
    displayName: base,
    base,
    quoteCurrency: 'USDT'
  }
}

/**
 * TR hisse sembolleri için normalizasyon
 * 
 * Girdi örnekleri:
 * - "ASELS" -> "ASELS.IS"
 * - "asels" -> "ASELS.IS"
 * - "ASELS.IS" -> "ASELS.IS"
 */
function normalizeTRStock(symbol: string): NormalizedSymbol {
  const upper = symbol.toUpperCase().trim()
  const base = upper.replace(/\.IS$/i, '')
  const normalized = base + '.IS'
  
  return {
    normalized,
    displayName: base,
    base
  }
}

/**
 * US hisse sembolleri için normalizasyon
 * 
 * Girdi örnekleri:
 * - "AAPL" -> "AAPL"
 * - "tsla" -> "TSLA"
 */
function normalizeUSStock(symbol: string): NormalizedSymbol {
  const upper = symbol.toUpperCase().trim()
  
  return {
    normalized: upper,
    displayName: upper,
    base: upper
  }
}

/**
 * Ana normalizasyon fonksiyonu
 * 
 * Asset type'a göre uygun normalizasyonu uygular
 */
export function normalizeSymbol(
  symbol: string,
  assetType: AssetType
): NormalizedSymbol {
  if (!symbol) {
    throw new Error('Sembol boş olamaz')
  }
  
  switch (assetType) {
    case 'CRYPTO':
      return normalizeCrypto(symbol)
    case 'TR_STOCK':
      return normalizeTRStock(symbol)
    case 'US_STOCK':
      return normalizeUSStock(symbol)
    case 'CASH':
      // CASH için normalizasyon gerekmiyor (USD, TRY, EUR gibi)
      const upper = symbol.toUpperCase().trim()
      return {
        normalized: upper,
        displayName: upper,
        base: upper
      }
    default:
      throw new Error(`Bilinmeyen asset type: ${assetType}`)
  }
}

/**
 * Sembol validasyonu
 * 
 * Temel kurallar:
 * - En az 2 karakter
 * - Sadece harfler ve sayılar (ve . için TR hisse)
 * - Boşluk yok
 */
export function validateSymbol(symbol: string, assetType: AssetType): {
  valid: boolean
  error?: string
} {
  if (!symbol || symbol.trim().length === 0) {
    return { valid: false, error: 'Sembol boş olamaz' }
  }
  
  const trimmed = symbol.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Sembol en az 2 karakter olmalı' }
  }
  
  // Kripto için: Sadece harfler ve sayılar
  if (assetType === 'CRYPTO') {
    if (!/^[A-Z0-9]+$/i.test(trimmed)) {
      return { valid: false, error: 'Sadece harf ve sayı kullanın (örn: BTC, ETH, XRP)' }
    }
  }
  
  // TR hisse için: Harfler, sayılar ve nokta
  if (assetType === 'TR_STOCK') {
    if (!/^[A-Z0-9.]+$/i.test(trimmed)) {
      return { valid: false, error: 'Geçersiz sembol formatı' }
    }
  }
  
  // US hisse için: Harfler, sayılar ve nokta
  if (assetType === 'US_STOCK') {
    if (!/^[A-Z0-9.]+$/i.test(trimmed)) {
      return { valid: false, error: 'Geçersiz sembol formatı' }
    }
  }
  
  return { valid: true }
}

/**
 * Helper: Kullanıcıya yardımcı mesaj göster
 */
export function getSymbolHint(assetType: AssetType): string {
  switch (assetType) {
    case 'CRYPTO':
      return 'Sadece kripto adını girin (örn: BTC, ETH, XRP). USDT otomatik eklenecek.'
    case 'TR_STOCK':
      return 'TR hisse kodu girin (örn: ASELS, THYAO, SAHOL)'
    case 'US_STOCK':
      return 'US hisse sembolu girin (örn: AAPL, TSLA, GOOGL)'
    case 'CASH':
      return 'Para birimi kodu (örn: TRY, USD, EUR)'
    default:
      return ''
  }
}
