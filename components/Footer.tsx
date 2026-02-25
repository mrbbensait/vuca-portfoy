'use client'

import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

export default function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all animate-neon-pulse"
              >
                Geri Bildirim Gönder
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">© 2026 Portföy Röntgeni</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-gray-400">Privacy Policy</span>
              <span className="text-gray-400">Terms of Service</span>
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
