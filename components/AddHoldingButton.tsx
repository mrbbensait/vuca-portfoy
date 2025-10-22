'use client'

import { useState, useEffect } from 'react'
import { Plus, X, TrendingUp } from 'lucide-react'
import { AssetType } from '@/lib/types/database.types'

interface AddHoldingButtonProps {
  userId: string
  portfolioId?: string
}

export default function AddHoldingButton({ userId, portfolioId }: AddHoldingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [priceInfo, setPriceInfo] = useState<{ price: number; name: string } | null>(null)

  const [formData, setFormData] = useState({
    symbol: '',
    asset_type: 'TR_STOCK' as AssetType,
    quantity: '',
    avg_price: '',
    note: '',
  })

  // Sembol değiştiğinde fiyat çek
  useEffect(() => {
    const fetchPrice = async () => {
      if (!formData.symbol || formData.symbol.length < 2) {
        setPriceInfo(null)
        return
      }

      setFetchingPrice(true)
      setError(null)

      try {
        // Cache'i bypass et - her zaman yeni fiyat çek
        const response = await fetch(
          `/api/price/quote?symbol=${encodeURIComponent(formData.symbol)}&asset_type=${formData.asset_type}&t=${Date.now()}`,
          { cache: 'no-store' }
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setPriceInfo({
              price: result.data.price,
              name: result.data.name,
            })
            // Otomatik fiyat doldur
            setFormData(prev => ({ ...prev, avg_price: result.data.price.toString() }))
            setError(null) // Başarılıysa hatayı temizle
          }
        } else {
          // API'den hata mesajı al
          try {
            const errorData = await response.json()
            console.error('Fiyat API hatası:', errorData)
            // Kullanıcıya gösterme, sadece console'a yaz
            setPriceInfo(null)
          } catch {
            setPriceInfo(null)
          }
        }
      } catch (err) {
        console.error('Fiyat çekme hatası:', err)
        setPriceInfo(null)
      } finally {
        setFetchingPrice(false)
      }
    }

    // Debounce: 800ms bekle
    const timer = setTimeout(() => {
      fetchPrice()
    }, 800)

    return () => clearTimeout(timer)
  }, [formData.symbol, formData.asset_type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!portfolioId) {
      setError('Portföy ID bulunamadı')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          portfolio_id: portfolioId,
          user_id: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Varlık eklenemedi')
      }

      // Başarılı - formu sıfırla ve kapat
      setFormData({
        symbol: '',
        asset_type: 'TR_STOCK',
        quantity: '',
        avg_price: '',
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Varlık Ekle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Yeni Varlık Ekle</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Varlık Türü - BUTONLAR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Varlık Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, asset_type: 'TR_STOCK', symbol: '', avg_price: '' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.asset_type === 'TR_STOCK'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇹🇷 TR Hisse
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, asset_type: 'US_STOCK', symbol: '', avg_price: '' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.asset_type === 'US_STOCK'
                    ? 'bg-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇺🇸 ABD Hisse
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, asset_type: 'CRYPTO', symbol: '', avg_price: '' })}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  formData.asset_type === 'CRYPTO'
                    ? 'bg-orange-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ₿ Kripto
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sembol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ASELS, TSLA, XRPUSDT"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.asset_type === 'TR_STOCK' && 'TR hisse için sadece kodu girin (örn: ASELS, THYAO)'}
              {formData.asset_type === 'US_STOCK' && 'ABD hisse sembolu (örn: TSLA, AAPL, NVDA)'}
              {formData.asset_type === 'CRYPTO' && 'Kripto pair (örn: BTCUSDT, XRPUSDT, ETHUSDT)'}
              {formData.asset_type === 'CASH' && 'Para birimi kodu (örn: TRY, USD, EUR)'}
            </p>
            
            {/* Fiyat bilgisi göster */}
            {fetchingPrice && (
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <TrendingUp className="w-4 h-4 mr-1 animate-pulse" />
                Fiyat bilgisi çekiliyor...
              </div>
            )}
            {priceInfo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-medium text-green-900">{priceInfo.name}</p>
                <p className="text-green-700">
                  Güncel Fiyat: ${priceInfo.price.toLocaleString('en-US', { 
                    minimumFractionDigits: formData.asset_type === 'CRYPTO' ? 4 : 2,
                    maximumFractionDigits: formData.asset_type === 'CRYPTO' ? 4 : 2 
                  })}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miktar
            </label>
            <input
              type="number"
              step="any"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alış Fiyatı (USD)
            </label>
            <input
              type="number"
              step="any"
              value={formData.avg_price}
              onChange={(e) => setFormData({ ...formData, avg_price: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="95.50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Otomatik doldurulan fiyat güncel piyasa fiyatıdır (USD). Değiştirebilirsiniz.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Not (opsiyonel)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bu varlık hakkında notlarınız..."
            />
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || fetchingPrice}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
