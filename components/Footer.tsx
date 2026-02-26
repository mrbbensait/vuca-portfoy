'use client'

import { useState } from 'react'
import Link from 'next/link'
import FeedbackModal from './FeedbackModal'

export default function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Platform */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">XPortfoy</h3>
              <p className="text-sm text-gray-600 mb-4">
                Dijital Portföy Röntgeni
              </p>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all text-sm animate-neon-pulse"
              >
                Geri Bildirim Gönder
              </button>
            </div>

            {/* Yasal */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Yasal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Kullanım Şartları
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Çerez Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/disclaimer" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Feragat Beyanı
                  </Link>
                </li>
              </ul>
            </div>

            {/* Destek */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Destek</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <a href="mailto:bilgi@vucaborsa.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                    İletişim
                  </a>
                </li>
                <li>
                  <a href="mailto:bilgi@vucaborsa.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                    KVKK Başvurusu
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p>© 2026 VUCA Borsa LTD. Tüm hakları saklıdır.</p>
              <p className="text-xs">
                ⚠️ Bu platform yatırım tavsiyesi vermez. Tüm yatırım kararlarınızın sorumluluğu size aittir.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  )
}
