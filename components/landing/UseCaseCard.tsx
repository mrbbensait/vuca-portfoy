'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface UseCaseCardProps {
  name: string
  role: string
  problem: string
  solution: string
  features: string[]
  delay?: number
}

export default function UseCaseCard({ name, role, problem, solution, features, delay = 0 }: UseCaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded mb-2">
            Problem
          </span>
          <p className="text-gray-600 text-sm italic">"{problem}"</p>
        </div>

        <div>
          <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded mb-2">
            Çözüm
          </span>
          <p className="text-gray-900 text-sm font-medium">"{solution}"</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Öne Çıkan Özellikler</p>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
