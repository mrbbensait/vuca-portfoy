'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, X, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { AssetType, TransactionSide } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/formatPrice'
import { normalizeSymbol, validateSymbol, getSymbolHint } from '@/lib/normalizeSymbol'

interface AddTransactionButtonProps {
  userId: string
}

export default function AddTransactionButton({ userId }: AddTransactionButtonProps) {
  const { activePortfolio } = usePortfolio()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [symbolError, setSymbolError] = useState<string | null>(null)
  const [priceInfo, setPriceInfo] = useState<{ price: number; name: string } | null>(null)
  const [normalizedSymbol, setNormalizedSymbol] = useState<string>('')
  const [priceJustUpdated, setPriceJustUpdated] = useState(false)

  const [formData, setFormData] = useState<{
    symbol: string
    asset_type: AssetType
    side: TransactionSide
    quantity: string
    price: string
    fee: string
    date: string
    note: string
  }>({
    symbol: '',
    asset_type: 'TR_STOCK',
    side: 'BUY',
    quantity: '',
    price: '',
    fee: '0',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  // URL'den ?action=add parametresi ile otomatik modal açma
  useEffect(() => {
    if (searchParams.get('action') === 'add' && activePortfolio) {
      setIsOpen(true)
      // URL'den parametreyi temizle
      router.replace('/portfolio', { scroll: false })
    }
  }, [searchParams, activePortfolio, router])

  // Sembol değiştiğinde validasyon ve fiyat çek
  useEffect(() => {
    const fetchPrice = async () => {
      // TRY için fiyat çekme yapma (referans değer)
      if (formData.asset_type === 'CASH' && formData.symbol === 'TRY') {
        setPriceInfo({ price: 1, name: 'Türk Lirası' })
        setFormData(prev => ({ ...prev, price: '1' }))
        setSymbolError(null)
        setNormalizedSymbol('')
        return
      }

      if (!formData.symbol || formData.symbol.length < 2) {
        setPriceInfo(null)
        setSymbolError(null)
        setNormalizedSymbol('')
        return
      }

      // CASH için validasyon ve normalizasyon atla
      if (formData.asset_type !== 'CASH') {
        // ✅ 1. Validasyon kontrolü
        const validation = validateSymbol(formData.symbol, formData.asset_type)
        if (!validation.valid) {
          setSymbolError(validation.error || 'Geçersiz sembol')
          setPriceInfo(null)
          setNormalizedSymbol('')
          return
        }

        setSymbolError(null)

        // ✅ 2. Sembolü normalize et
        let normalized
        try {
          const normalizedData = normalizeSymbol(formData.symbol, formData.asset_type)
          normalized = normalizedData.normalized
          setNormalizedSymbol(normalized)
        } catch (err) {
          setSymbolError(err instanceof Error ? err.message : 'Geçersiz sembol')
          setPriceInfo(null)
          return
        }
      }

      // ✅ 3. Fiyat çek
      setFetchingPrice(true)
      setError(null)

      try {
        // ⚡ Cache'den yararlan (15dk cache)
        const response = await fetch(
          `/api/price/quote?symbol=${encodeURIComponent(formData.symbol)}&asset_type=${formData.asset_type}`
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setPriceInfo({
              price: result.data.price,
              name: result.data.name,
            })
            setFormData(prev => ({ ...prev, price: result.data.price.toString() }))
            
            // Fiyat güncellendiğinde yeşil animasyon göster
            setPriceJustUpdated(true)
            setTimeout(() => setPriceJustUpdated(false), 2500) // 2.5 saniye sonra normal hale dön
          }
        } else {
          setPriceInfo(null)
          const errorData = await response.json()
          setSymbolError(errorData.error || 'Fiyat bulunamadı')
        }
      } catch (err) {
        console.error('Fiyat çekme hatası:', err)
        setPriceInfo(null)
        setSymbolError('Fiyat çekilemedi')
      } finally {
        setFetchingPrice(false)
      }
    }

    const timer = setTimeout(() => {
      fetchPrice()
    }, 800)

    return () => clearTimeout(timer)
  }, [formData.symbol, formData.asset_type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activePortfolio) {
      setError('Portföy seçilmedi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // ✅ Normalize edilmiş sembolü kullan
      const symbolToSubmit = normalizedSymbol || formData.symbol
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          symbol: symbolToSubmit, // Normalize edilmiş sembolü gönder
          portfolio_id: activePortfolio.id,
          user_id: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'İşlem eklenemedi')
      }

      // Başarılı - formu sıfırla ve kapat
      setFormData({
        symbol: '',
        asset_type: 'TR_STOCK',
        side: 'BUY',
        quantity: '',
        price: '',
        fee: '0',
        date: new Date().toISOString().split('T')[0],
        note: '',
      })
      setPriceInfo(null)
      setIsOpen(false)
      
      // Sayfayı yenile
      window.location.reload()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    // Modal açılırken formu sıfırla
    setFormData({
      symbol: '',
      asset_type: 'TR_STOCK',
      side: 'BUY',
      quantity: '',
      price: '',
      fee: '0',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setPriceInfo(null)
    setError(null)
    setIsOpen(true)
  }

  const handleClose = () => {
    // Modal kapanırken formu sıfırla
    setFormData({
      symbol: '',
      asset_type: 'TR_STOCK',
      side: 'BUY',
      quantity: '',
      price: '',
      fee: '0',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setPriceInfo(null)
    setError(null)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        İşlem Ekle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Compact */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5">
          <h3 className="text-base font-bold text-white">Yeni İşlem Ekle</h3>
          <button 
            onClick={handleClose} 
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-2.5 overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Varlık Türü & İşlem Tipi - Yan Yana */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Varlık Türü
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'TR_STOCK', symbol: '', price: '' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.asset_type === 'TR_STOCK'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  🇹🇷 TR Hisse
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'US_STOCK', symbol: '', price: '' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.asset_type === 'US_STOCK'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg ring-2 ring-indigo-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  🇺🇸 ABD Hisse
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'CRYPTO', symbol: '', price: '' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.asset_type === 'CRYPTO'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg ring-2 ring-amber-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  ₿ Kripto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asset_type: 'CASH', symbol: 'TRY', price: '1' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.asset_type === 'CASH'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg ring-2 ring-emerald-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  💰 Nakit/Değerli M.
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                İşlem Tipi
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, side: 'BUY' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.side === 'BUY'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg ring-2 ring-emerald-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  ✓ ALIŞ
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, side: 'SELL' })}
                  className={`w-full px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.side === 'SELL'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg ring-2 ring-red-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  ✕ SATIŞ
                </button>
              </div>
            </div>
          </div>

          {/* Sembol Input/Select - CASH için özel */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {formData.asset_type === 'CASH' ? 'Para Birimi / Varlık' : 'Sembol'}
            </label>
            
            {formData.asset_type === 'CASH' ? (
              <>
                <div className="relative">
                  <select
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 border-2 border-gray-200 bg-gray-50 rounded-lg font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-900 text-sm"
                  >
                    <option value="TRY">🇹🇷 Türk Lirası (TRY)</option>
                    <option value="USD">🇺🇸 Amerikan Doları (USD)</option>
                    <option value="EUR">🇪🇺 Euro (EUR)</option>
                    <option value="GOLD">🥇 Gram Altın</option>
                    <option value="SILVER">🥈 Gram Gümüş</option>
                  </select>
                  {fetchingPrice && (
                    <div className="absolute right-3 top-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
                {fetchingPrice ? (
                  <p className="text-[10px] text-blue-600 mt-1 flex items-center animate-pulse">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Güncel kur alınıyor...
                  </p>
                ) : priceInfo ? (
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {priceInfo.name} • ₺{formatPrice(priceInfo.price)}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    required
                    className={`w-full px-3 py-1.5 border-2 rounded-lg font-medium transition-all text-gray-900 text-sm ${
                      symbolError 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : priceInfo
                        ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                        : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                    placeholder={
                      formData.asset_type === 'CRYPTO' ? 'ör: BTC, ETH' :
                      formData.asset_type === 'TR_STOCK' ? 'ör: ASELS, THYAO' :
                      'ör: AAPL, TSLA'
                    }
                  />
                  {fetchingPrice && (
                    <div className="absolute right-3 top-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 animate-pulse" />
                    </div>
                  )}
                  {normalizedSymbol && normalizedSymbol !== formData.symbol && !fetchingPrice && (
                    <div className="absolute right-3 top-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {symbolError ? (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {symbolError}
                  </p>
                ) : fetchingPrice ? (
                  <p className="text-[10px] text-blue-600 mt-1 flex items-center animate-pulse">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {normalizedSymbol && normalizedSymbol !== formData.symbol
                      ? `${formData.symbol} → ${normalizedSymbol} • Fiyat alınıyor...`
                      : 'Fiyat alınıyor...'}
                  </p>
                ) : priceInfo ? (
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {priceInfo.name} • {formData.asset_type === 'TR_STOCK' ? '₺' : '$'}{formatPrice(priceInfo.price)}
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {getSymbolHint(formData.asset_type)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Miktar, Fiyat, Komisyon, Tarih - Kompakt Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {formData.asset_type === 'CASH' ? 'Miktar' : 'Miktar'}
              </label>
              <input
                type="number"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full px-3 py-1.5 border-2 border-gray-200 bg-gray-50 rounded-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 text-sm"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {formData.asset_type === 'TR_STOCK' || formData.asset_type === 'CASH' ? 'Fiyat (₺)' : 'Fiyat ($)'}
              </label>
              <input
                type="number"
                step="any"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className={`w-full px-3 py-1.5 border-2 rounded-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-1000 text-gray-900 text-sm ${
                  priceJustUpdated 
                    ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="95.50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Komisyon
              </label>
              <input
                type="number"
                step="any"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full px-3 py-1.5 border-2 border-gray-200 bg-gray-50 rounded-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-1.5 border-2 border-gray-200 bg-gray-50 rounded-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 text-sm"
              />
            </div>
          </div>

          {/* Not - Tek satır */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Not <span className="text-gray-400 normal-case font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-1.5 border-2 border-gray-200 bg-gray-50 rounded-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 text-sm"
              placeholder="İşlem notu..."
            />
          </div>

          {/* Toplam - Minimal */}
          <div className="px-3 py-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-slate-600">Toplam</span>
              <span className="text-base font-bold text-slate-900">
                {(formData.asset_type === 'TR_STOCK' || formData.asset_type === 'CASH') ? '₺' : '$'}
                {formData.quantity && formData.price 
                  ? (parseFloat(formData.quantity) * parseFloat(formData.price) + parseFloat(formData.fee || '0')).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '0.00'
                }
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Buttons - Compact */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-1.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || fetchingPrice || !!symbolError}
              className="flex-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 shadow-lg shadow-blue-500/30 transition-all text-sm"
            >
              {loading ? 'Ekleniyor...' : '✓ Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
