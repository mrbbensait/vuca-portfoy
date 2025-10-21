'use client'

import { Download } from 'lucide-react'

interface PDFDownloadButtonProps {
  reportData?: Record<string, unknown>
}

export default function PDFDownloadButton({}: PDFDownloadButtonProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download className="w-4 h-4 mr-2" />
      PDF İndir
    </button>
  )
}
