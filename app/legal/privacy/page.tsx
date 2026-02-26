import { KVKK_PRIVACY_POLICY } from '@/lib/legal/legal-texts'
import ReactMarkdown from 'react-markdown'

export const metadata = {
  title: 'Gizlilik Politikası - Portföy Röntgeni',
  description: 'KVKK uyarınca kişisel verilerin korunması ve gizlilik politikası',
}

export default function PrivacyPage() {
  return (
    <div>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
              {children}
            </ul>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {KVKK_PRIVACY_POLICY}
      </ReactMarkdown>
    </div>
  )
}
