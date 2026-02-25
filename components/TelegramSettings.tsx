'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Eye, EyeOff, CheckCircle, XCircle, Loader2, Trash2, HelpCircle, Bot, Hash, ToggleLeft, ToggleRight } from 'lucide-react'
import TelegramHelpModal from './TelegramHelpModal'

interface Portfolio {
  id: string
  name: string
  is_public: boolean
}

interface TelegramSettingsProps {
  portfolios: Portfolio[]
}

interface TelegramState {
  telegram_enabled: boolean
  telegram_channel_id: string
  telegram_bot_token_set: boolean
}

export default function TelegramSettings({ portfolios }: TelegramSettingsProps) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')
  const [state, setState] = useState<TelegramState>({
    telegram_enabled: false,
    telegram_channel_id: '',
    telegram_bot_token_set: false,
  })
  const [botToken, setBotToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const publicPortfolios = portfolios.filter(p => p.is_public)

  const fetchSettings = useCallback(async (portfolioId: string) => {
    setLoading(true)
    setTestResult(null)
    setSaveResult(null)
    setBotToken('')
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/telegram`)
      if (res.ok) {
        const data = await res.json()
        setState(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedPortfolioId) {
      fetchSettings(selectedPortfolioId)
    }
  }, [selectedPortfolioId, fetchSettings])

  async function handleTest() {
    if (!selectedPortfolioId || !state.telegram_channel_id) return
    const tokenToUse = botToken.trim() || undefined
    if (!tokenToUse && !state.telegram_bot_token_set) {
      setTestResult({ ok: false, message: 'Test için bot token girmeniz gerekiyor.' })
      return
    }

    setTestLoading(true)
    setTestResult(null)
    try {
      const body: Record<string, string> = {
        portfolio_id: selectedPortfolioId,
        channel_id: state.telegram_channel_id,
      }
      if (tokenToUse) body.bot_token = tokenToUse

      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ ok: true, message: 'Test mesajı gönderildi! Kanalınızı kontrol edin.' })
      } else {
        setTestResult({ ok: false, message: data.error || 'Test başarısız oldu.' })
      }
    } finally {
      setTestLoading(false)
    }
  }

  async function handleSave() {
    if (!selectedPortfolioId) return
    setSaveLoading(true)
    setSaveResult(null)
    try {
      const body: Record<string, unknown> = {
        telegram_enabled: state.telegram_enabled,
        telegram_channel_id: state.telegram_channel_id,
      }
      if (botToken.trim()) {
        body.telegram_bot_token = botToken.trim()
      }

      const res = await fetch(`/api/portfolios/${selectedPortfolioId}/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setSaveResult({ ok: true, message: 'Telegram ayarları kaydedildi.' })
        setBotToken('')
        await fetchSettings(selectedPortfolioId)
      } else {
        setSaveResult({ ok: false, message: data.error || 'Kaydetme başarısız.' })
      }
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedPortfolioId) return
    if (!confirm('Telegram entegrasyonunu kaldırmak istediğinizden emin misiniz?')) return
    setDeleteLoading(true)
    setSaveResult(null)
    try {
      const res = await fetch(`/api/portfolios/${selectedPortfolioId}/telegram`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setState({ telegram_enabled: false, telegram_channel_id: '', telegram_bot_token_set: false })
        setBotToken('')
        setSaveResult({ ok: true, message: 'Telegram entegrasyonu kaldırıldı.' })
      } else {
        setSaveResult({ ok: false, message: data.error || 'Silme başarısız.' })
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const canTest = selectedPortfolioId && state.telegram_channel_id && (botToken.trim() || state.telegram_bot_token_set)
  const canSave = selectedPortfolioId && (botToken.trim() || state.telegram_bot_token_set) && state.telegram_channel_id

  return (
    <>
      {showHelp && <TelegramHelpModal onClose={() => setShowHelp(false)} />}

      <div className="space-y-5">
        {/* Portföy Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Portföy Seçin
          </label>
          {publicPortfolios.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Telegram entegrasyonu yalnızca <strong>herkese açık (public)</strong> portföyler için geçerlidir. Önce bir portföyünüzü herkese açık yapın.
            </div>
          ) : (
            <select
              value={selectedPortfolioId}
              onChange={e => setSelectedPortfolioId(e.target.value)}
              className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Portföy seçin —</option>
              {publicPortfolios.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {portfolios.some(p => !p.is_public) && (
            <p className="text-xs text-gray-400 mt-1">
              Yalnızca herkese açık portföyler listelenmektedir.
            </p>
          )}
        </div>

        {/* Ayar formu */}
        {selectedPortfolioId && (
          loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ayarlar yükleniyor...
            </div>
          ) : (
            <div className="space-y-5 pt-1">
              {/* Bağlantı Durumu */}
              {(state.telegram_bot_token_set || state.telegram_channel_id) ? (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                  state.telegram_enabled
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    state.telegram_enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      state.telegram_enabled ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {state.telegram_enabled ? 'Telegram bağlı ve aktif' : 'Telegram bağlı ama pasif'}
                    </p>
                    {state.telegram_channel_id && (
                      <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                        Kanal: {state.telegram_channel_id}
                      </p>
                    )}
                  </div>
                  {state.telegram_bot_token_set && (
                    <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      Bot: ••••••
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber-400" />
                  <p className="text-sm text-amber-700">
                    Bu portföy henüz Telegram&#39;a bağlanmamış. Aşağıdaki bilgileri doldurun.
                  </p>
                </div>
              )}

              {/* Aktif/Pasif Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Telegram Bildirimlerini Aktif Et</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Açık olduğunda portföyünüzdeki işlemler ve duyurular kanalınıza iletilir.
                  </p>
                </div>
                <button
                  onClick={() => setState(s => ({ ...s, telegram_enabled: !s.telegram_enabled }))}
                  className="flex-shrink-0 ml-4"
                >
                  {state.telegram_enabled
                    ? <ToggleRight className="w-9 h-9 text-blue-600" />
                    : <ToggleLeft className="w-9 h-9 text-gray-400" />
                  }
                </button>
              </div>

              {/* Bot Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-500" />
                  Bot Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={botToken}
                    onChange={e => setBotToken(e.target.value)}
                    placeholder={state.telegram_bot_token_set ? '••••••••••••  (kayıtlı token var, değiştirmek için yeni token girin)' : 'Örn: 7123456789:AAFxxxxxxx...'}
                    className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Token&#39;ınız <strong>AES-256-GCM</strong> ile şifrelenerek saklanır. Hiç kimse erişemez.
                </p>
              </div>

              {/* Kanal ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-purple-500" />
                  Kanal ID
                </label>
                <input
                  type="text"
                  value={state.telegram_channel_id}
                  onChange={e => setState(s => ({ ...s, telegram_channel_id: e.target.value }))}
                  placeholder="Örn: @kanaliniz veya -100123456789"
                  className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Public kanallar için @ ile başlayan adres (örn: @portfoyim). Private kanallar için sayısal ID.
                </p>
              </div>

              {/* Test & Kaydet Butonları */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={!canTest || testLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                  Test Mesajı Gönder
                </button>

                <button
                  onClick={handleSave}
                  disabled={!canSave || saveLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />
                  }
                  Kaydet
                </button>

                {(state.telegram_bot_token_set || state.telegram_channel_id) && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleteLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                    Entegrasyonu Kaldır
                  </button>
                )}
              </div>

              {/* Test Sonucu */}
              {testResult && (
                <div className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${
                  testResult.ok
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {testResult.ok
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  }
                  {testResult.message}
                </div>
              )}

              {/* Kaydet Sonucu */}
              {saveResult && (
                <div className={`flex items-start gap-2 px-4 py-3 rounded-lg text-sm border ${
                  saveResult.ok
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {saveResult.ok
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  }
                  {saveResult.message}
                </div>
              )}
            </div>
          )
        )}

        {/* Yardım Linki */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Telegram nasıl bağlanır? Adım adım kurulum rehberi
          </button>
        </div>
      </div>
    </>
  )
}
