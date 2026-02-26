import { COOKIE_POLICY } from '@/lib/legal/legal-texts'
import ReactMarkdown from 'react-markdown'

export const metadata = {
  title: 'Çerez Politikası - XPortfoy',
  description: 'Platform çerez kullanımı ve yönetimi politikası',
}

export default function CookiesPage() {
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
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
              {children}
            </code>
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
        {COOKIE_POLICY}
      </ReactMarkdown>
    </div>
  )
}
