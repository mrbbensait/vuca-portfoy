'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  stat?: string
  gradient: string
  iconColor: string
  delay?: number
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  stat, 
  gradient, 
  iconColor,
  delay = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`group p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-2xl hover:shadow-${iconColor}-200/20 transition-all duration-300`}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
      {stat && (
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
          {stat}
        </span>
      )}
    </motion.div>
  )
}
