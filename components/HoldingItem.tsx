'use client'

import { useState, useEffect, useCallback } from 'react'
import { Holding } from '@/lib/types/database.types'
import { Trash2, AlertTriangle, TrendingUp, TrendingDown, Pencil } from 'lucide-react'

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

interface HoldingItemProps {
  holding: Holding
  userId: string
  portfolioId: string
}

export default function HoldingItem({ holding }: HoldingItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [editForm, setEditForm] = useState({
    quantity: holding.quantity.toString(),
    avg_price: holding.avg_price.toString(),
  })

  // Güncel fiyat çek
  const fetchCurrentPrice = useCallback(async () => {
    try {
      // Cache'i bypass et - her zaman yeni fiyat çek
      const response = await fetch(
        `/api/price/quote?symbol=${encodeURIComponent(holding.symbol)}&asset_type=${holding.asset_type}&t=${Date.now()}`,
        { cache: 'no-store' }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setCurrentPrice(result.data.price)
        }
      }
    } catch (error) {
      console.error('Fiyat çekme hatası:', error)
    } finally {
      setLoadingPrice(false)
    }
  }, [holding.symbol, holding.asset_type])
  
  // Fiyat formatı - Kripto için 4 hane, diğerleri için 2 hane
  const formatPrice = (price: number) => {
    const decimals = holding.asset_type === 'CRYPTO' ? 4 : 2
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    })
  }
  
  // Büyük sayılar için format (Toplam Alış, Güncel Toplam, Kar/Zarar) - tam sayı
  const formatLargeNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // İlk yükleme
  useEffect(() => {
    fetchCurrentPrice()
  }, [fetchCurrentPrice])

  // 30 dakikada bir yenile
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentPrice()
    }, 30 * 60 * 1000) // 30 dakika

    return () => clearInterval(interval)
  }, [fetchCurrentPrice])

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/holdings/${holding.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      // Sayfayı yenile
      window.location.reload()
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Varlık silinemedi. Lütfen tekrar deneyin.')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)

    try {
      const response = await fetch(`/api/holdings/${holding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: editForm.quantity,
          avg_price: editForm.avg_price,
        }),
      })

      if (!response.ok) {
        throw new Error('Güncelleme işlemi başarısız')
      }

      // Sayfayı yenile
      window.location.reload()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Varlık güncellenemedi. Lütfen tekrar deneyin.')
    } finally {
      setUpdating(false)
      setShowEditModal(false)
    }
  }

  // Hesaplamalar
  const costBasis = holding.quantity * holding.avg_price // Toplam Alış
  const currentTotal = currentPrice ? holding.quantity * currentPrice : null // Güncel Toplam
  const profitLoss = currentTotal ? currentTotal - costBasis : null // Kar/Zarar miktarı
  const profitLossPercent = profitLoss ? (profitLoss / costBasis) * 100 : null // % Kar/Zarar

  return (
    <>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{holding.symbol}</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {ASSET_TYPE_LABELS[holding.asset_type]}
              </span>
            </div>
            
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
              {/* Miktar */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Miktar</p>
                <p className="font-medium text-gray-900">{holding.quantity.toLocaleString('en-US')}</p>
              </div>
              
              {/* Maliyet (Alış Fiyatı) */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Maliyet</p>
                <p className="font-medium text-gray-900">${formatPrice(holding.avg_price)}</p>
              </div>
              
              {/* Güncel Fiyat */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Güncel Fiyat</p>
                {loadingPrice ? (
                  <p className="text-gray-400 text-xs">Yükleniyor...</p>
                ) : currentPrice ? (
                  <p className="font-medium text-gray-900">${formatPrice(currentPrice)}</p>
                ) : (
                  <p className="text-gray-400 text-xs">N/A</p>
                )}
              </div>
              
              {/* Toplam Alış */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Toplam Alış</p>
                <p className="font-medium text-gray-900">${formatLargeNumber(costBasis)}</p>
              </div>
              
              {/* Güncel Toplam */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Güncel Toplam</p>
                {currentTotal ? (
                  <p className="font-medium text-gray-900">${formatLargeNumber(currentTotal)}</p>
                ) : (
                  <p className="text-gray-400 text-xs">N/A</p>
                )}
              </div>
              
              {/* Kar/Zarar % */}
              <div>
                <p className="text-gray-500 text-xs mb-1">% Kar/Zarar</p>
                {profitLossPercent !== null ? (
                  <div className="flex items-center gap-1">
                    {profitLossPercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <p className={`font-semibold ${profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">N/A</p>
                )}
              </div>
              
              {/* Kar/Zarar USD */}
              <div>
                <p className="text-gray-500 text-xs mb-1">Kar/Zarar</p>
                {profitLoss !== null ? (
                  <p className={`font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss >= 0 ? '+' : ''}${formatLargeNumber(Math.abs(profitLoss))}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs">N/A</p>
                )}
              </div>
            </div>

            {holding.note && (
              <p className="mt-1 text-xs text-gray-600 italic">Not: {holding.note}</p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Düzenleme Modalı */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Varlığı Düzenle</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-base font-semibold text-gray-900">{holding.symbol}</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {ASSET_TYPE_LABELS[holding.asset_type]}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar
                </label>
                <input
                  type="number"
                  step="any"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
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
                  value={editForm.avg_price}
                  onChange={(e) => setEditForm({ ...editForm, avg_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="95.50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={updating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updating ? 'Güncelleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Varlığı Sil
              </h3>
              
              <p className="text-gray-600 mb-1">
                <strong>{holding.symbol}</strong> varlığını silmek istediğinizden emin misiniz?
              </p>
              
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg w-full">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Bu işlem geri alınamaz!
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Bu varlıkla ilgili tüm veriler kalıcı olarak silinecektir.
                </p>
              </div>
              
              <div className="flex gap-3 mt-6 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
