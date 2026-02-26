'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Tarayıcı geçmişi varsa geri dön, yoksa ana sayfaya
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, 100)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-blue max-w-none">
            {children}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Sorularınız için:{' '}
            <a
              href="mailto:bilgi@vucaborsa.com"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              bilgi@vucaborsa.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
