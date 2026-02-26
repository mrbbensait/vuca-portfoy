'use client'

import { motion } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'

const comparisons = [
  { feature: 'Çoklu varlık desteği', others: false, us: '6 varlık türü tek portföyde' },
  { feature: 'Sosyal özellikler', others: false, us: 'Takip, keşfet, paylaş' },
  { feature: 'Telegram entegrasyonu', others: false, us: 'Anlık push bildirimler' },
  { feature: 'Influencer araçları', others: false, us: 'Duyuru sistemi, public portföy' },
  { feature: 'Gelişmiş analiz', others: 'partial', us: 'Sağlık skoru, volatilite, korelasyon' },
  { feature: 'Performans', others: 'partial', us: '%90 hız artışı (cache + batch)' },
  { feature: 'Fiyat', others: 'paid', us: '%100 Ücretsiz' },
]

export default function ComparisonTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="overflow-x-auto"
    >
      <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700"></th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Diğer Uygulamalar</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700 bg-blue-50">XPortfoy</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((item, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.feature}</td>
              <td className="px-6 py-4 text-center">
                {item.others === false && (
                  <div className="inline-flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5" />
                    <span className="text-sm">Yok</span>
                  </div>
                )}
                {item.others === 'partial' && (
                  <div className="inline-flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Sınırlı</span>
                  </div>
                )}
                {item.others === 'paid' && (
                  <div className="inline-flex items-center gap-2 text-amber-600">
                    <span className="text-lg">💰</span>
                    <span className="text-sm">Ücretli</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-center bg-blue-50/50">
                <div className="inline-flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5 font-bold" />
                  <span className="text-sm font-medium">{item.us}</span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
