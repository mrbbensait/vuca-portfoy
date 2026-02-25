'use client'

import Link from 'next/link'
import { Send } from 'lucide-react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'

export default function TelegramConnectBanner() {
  const { activePortfolio, loading } = usePortfolio()

  // Yükleniyorsa veya portföy yoksa gösterme
  if (loading || !activePortfolio) return null

  // Sadece public portföyler için anlamlı
  if (!activePortfolio.is_public) return null

  // Telegram bağlıysa (enabled=true VE token kaydedilmiş) gösterme
  const isLinked = !!(activePortfolio.telegram_enabled && activePortfolio.telegram_bot_token)
  if (isLinked) return null

  return (
    <Link
      href="/settings#telegram"
      className="flex items-center gap-4 px-5 py-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Send className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">
          Bu portföyü Telegram kanalınıza bağlayın
        </p>
        <p className="text-xs text-blue-600 mt-0.5">
          İşlem ya da duyuru yayınladığınızda takipçileriniz kendi Telegram kanalınızdan anında haberdar olsun. Birkaç dakikada kurabilirsiniz.
        </p>
      </div>
      <span className="text-xs font-medium text-blue-700 bg-white border border-blue-200 px-3 py-1 rounded-full flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
        Bağla →
      </span>
    </Link>
  )
}
