'use client'

import { usePrivacy } from '@/lib/contexts/PrivacyContext'

interface BlurProps {
  children: React.ReactNode
  className?: string
}

export default function Blur({ children, className = '' }: BlurProps) {
  const { isPrivate } = usePrivacy()

  if (!isPrivate) return <>{children}</>

  return (
    <span className={`privacy-blur ${className}`}>
      {children}
    </span>
  )
}
