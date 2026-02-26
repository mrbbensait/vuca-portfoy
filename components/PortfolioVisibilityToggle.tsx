'use client'

import { useState, useEffect } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { Globe, Lock, Link2, Copy, Check, Loader2, X } from 'lucide-react'
import { slugify } from '@/lib/slugify'

interface PortfolioVisibilityToggleProps {
  onClose: () => void
}

export default function PortfolioVisibilityToggle({ onClose }: PortfolioVisibilityToggleProps) {
  const { activePortfolio, refreshPortfolios } = usePortfolio()

  const [isPublic, setIsPublic] = useState(false)
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (activePortfolio) {
      setIsPublic(activePortfolio.is_public || false)
      setSlug(activePortfolio.slug || '')
      setDescription(activePortfolio.description || '')
    }
  }, [activePortfolio])

  const handleTogglePublic = (value: boolean) => {
    setIsPublic(value)
    // Açık yapılıyorsa ve slug yoksa, otomatik slug öner
    if (value && !slug && activePortfolio) {
      setSlug(slugify(activePortfolio.name))
    }
  }

  const handleSlugChange = (value: string) => {
    // Sadece geçerli karakterlere izin ver (küçük harf, rakam, tire)
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(sanitized)
  }

  const handleSave = async () => {
    if (!activePortfolio) return

    // Slug validasyonu (public ise zorunlu)
    if (isPublic && !slug) {
      setError('Herkese açık portföy için bir URL slug gerekli')
      return
    }

    if (isPublic && slug.length < 3) {
      setError('Slug en az 3 karakter olmalı')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/portfolios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activePortfolio.id,
          is_public: isPublic,
          slug: isPublic ? slug : null,
          description: description.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Güncelleme başarısız')
      }

      setSuccess(true)
      await refreshPortfolios()
      // Kısa süre başarı mesajı göster, sonra modal'ı kapat
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (!slug) return
    const url = `${window.location.origin}/p/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!activePortfolio) return null

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Portföy Görünürlüğü</h3>
            <p className="text-sm text-gray-500 mt-0.5">{activePortfolio.name}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isPublic ? (
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isPublic ? 'Herkese Açık' : 'Gizli'}
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic
                    ? 'Herkes bu portföyü görebilir ve takip edebilir'
                    : 'Sadece siz görebilirsiniz'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTogglePublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Slug & Description (sadece public ise göster) */}
          {isPublic && (
            <>
              {/* Slug Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Paylaşım URL&apos;si
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                    <Link2 className="w-4 h-4 mr-1.5" />
                    /p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="ornek-portfoy"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    maxLength={80}
                  />
                  {slug && (
                    <button
                      onClick={handleCopyLink}
                      className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Linki kopyala"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {slug && (
                  <p className="mt-1 text-xs text-gray-400">
                    {window.location.origin}/p/{slug}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Açıklama <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bu portföy hakkında kısa bir açıklama..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                  rows={3}
                  maxLength={280}
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {description.length}/280
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg">
              Ayarlar başarıyla kaydedildi!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <span>Kaydet</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
