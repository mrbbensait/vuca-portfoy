'use client'

import { useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { ChevronDown, Plus, Edit2, Trash2, Check, Globe, Lock } from 'lucide-react'
import PortfolioVisibilityToggle from './PortfolioVisibilityToggle'

export default function PortfolioSelector() {
  const { portfolios, activePortfolio, loading, setActivePortfolio, createPortfolio, updatePortfolio, deletePortfolio } = usePortfolio()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Portfolio adı boş olamaz')
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      await createPortfolio(newName.trim())
      setShowCreateModal(false)
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!newName.trim()) {
      setError('Portfolio adı boş olamaz')
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      await updatePortfolio(id, newName.trim())
      setEditingId(null)
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu portfolio ve içindeki tüm veriler silinecek. Emin misiniz?')) {
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      await deletePortfolio(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Yükleniyor...</div>
  }

  return (
    <div className="relative">
      {/* Seçili Portfolio - Modern & Attention-grabbing */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-medium text-blue-100 uppercase tracking-wider">
            Aktif Portföy
          </span>
          <span className="text-sm font-semibold text-white flex items-center">
            {activePortfolio?.name || 'Portfolio Seç'}
            {activePortfolio?.is_public && (
              <Globe className="w-3 h-3 ml-1.5 text-blue-200" />
            )}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-white`} />
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Portfolyolar
                </div>
                <div className="text-xs text-gray-400">
                  {portfolios.length} adet
                </div>
              </div>
              
              {/* Portfolio Listesi */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                      activePortfolio?.id === portfolio.id ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' : 'border border-transparent'
                    }`}
                  >
                    {editingId === portfolio.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(portfolio.id)
                            if (e.key === 'Escape') {
                              setEditingId(null)
                              setNewName('')
                            }
                          }}
                        />
                        <button
                          onClick={() => handleUpdate(portfolio.id)}
                          disabled={isProcessing}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setActivePortfolio(portfolio)
                            setIsOpen(false)
                          }}
                          className="flex-1 text-left text-sm font-medium text-gray-900"
                        >
                          {portfolio.name}
                          {activePortfolio?.id === portfolio.id && (
                            <Check className="inline-block w-4 h-4 ml-2 text-blue-600" />
                          )}
                        </button>
                        <div className="flex items-center space-x-1">
                          <span title={portfolio.is_public ? 'Herkese Açık' : 'Gizli'}>
                            {portfolio.is_public ? (
                              <Globe className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-gray-300" />
                            )}
                          </span>
                          <button
                            onClick={() => {
                              setEditingId(portfolio.id)
                              setNewName(portfolio.name)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {portfolios.length > 1 && (
                            <button
                              onClick={() => handleDelete(portfolio.id)}
                              disabled={isProcessing}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Hata Mesajı */}
              {error && (
                <div className="mt-2 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              {/* Portföy Paylaş Butonu */}
              <button
                onClick={() => {
                  setShowVisibilityModal(true)
                  setIsOpen(false)
                }}
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              >
                {activePortfolio?.is_public ? (
                  <Globe className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <span>Portföy Paylaş</span>
              </button>

              {/* Yeni Portfolio Butonu */}
              {portfolios.length >= 10 ? (
                <div className="mt-3 px-3 py-2 text-xs text-gray-500 bg-gray-50 rounded-lg text-center">
                  Maksimum 10 portföy oluşturabilirsiniz.
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Portfolio Oluştur ({portfolios.length}/10)</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Yeni Portfolio Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-30" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Portfolio Oluştur</h3>
              
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Portfolio adı"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') setShowCreateModal(false)
                }}
              />

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewName('')
                    setError(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isProcessing || !newName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Görünürlük Modal */}
      {showVisibilityModal && (
        <PortfolioVisibilityToggle onClose={() => setShowVisibilityModal(false)} />
      )}
    </div>
  )
}
