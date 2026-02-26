'use client'

import { useState } from 'react'
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SPK_DISCLAIMER, SPK_RISK_DISCLOSURE } from '@/lib/legal/legal-texts'

interface ConsentModalProps {
  isOpen: boolean
  onConsentsAccepted: (consents: {
    spk_disclaimer_accepted: boolean
    spk_risk_disclosure_accepted: boolean
    kvkk_accepted: boolean
    terms_accepted: boolean
  }) => void
}

type Tab = 'spk' | 'risk'

export default function ConsentModal({ isOpen, onConsentsAccepted }: ConsentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('spk')
  const [consents, setConsents] = useState({
    spk: false,
    risk: false,
  })
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const tabs = [
    { id: 'spk' as Tab, label: 'SPK Bildirimi', icon: FileText, color: 'blue' },
    { id: 'risk' as Tab, label: 'Risk Bildirimi', icon: AlertTriangle, color: 'red' },
  ]

  const getContent = () => {
    switch (activeTab) {
      case 'spk':
        return SPK_DISCLAIMER
      case 'risk':
        return SPK_RISK_DISCLOSURE
    }
  }

  const allAccepted = Object.values(consents).every(v => v === true)
  const acceptedCount = Object.values(consents).filter(v => v === true).length

  const handleSubmit = () => {
    if (!allAccepted) return

    setSubmitting(true)
    onConsentsAccepted({
      spk_disclaimer_accepted: consents.spk,
      spk_risk_disclosure_accepted: consents.risk,
      kvkk_accepted: true,  // Registration'da onaylandı
      terms_accepted: true, // Registration'da onaylandı
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header - Sticky */}
        <div className="flex-shrink-0">
          <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hoş Geldiniz!</h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Devam etmeden önce aşağıdaki bildirimleri okumanız ve onaylamanız gerekmektedir
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-xs font-medium text-gray-600">İlerleme:</span>
                <span className="text-base font-bold text-blue-600">{acceptedCount}/2</span>
              </div>
            </div>
          </div>

          {/* Tabs - Sticky */}
          <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex gap-2 overflow-x-auto py-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const isAccepted = consents[tab.id]
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {tab.label}
                    {isAccepted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-sm">
            {getContent().split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-lg font-bold text-gray-900 mb-2 mt-3">{line.slice(2)}</h1>
              } else if (line.startsWith('## ')) {
                return <h2 key={i} className="text-base font-bold text-gray-800 mb-1.5 mt-3">{line.slice(3)}</h2>
              } else if (line.startsWith('### ')) {
                return <h3 key={i} className="text-sm font-semibold text-gray-700 mb-1 mt-2">{line.slice(4)}</h3>
              } else if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-gray-900 mb-1">{line.slice(2, -2)}</p>
              } else if (line.startsWith('- ')) {
                return <li key={i} className="text-gray-700 mb-0.5 ml-4 text-xs leading-relaxed">{line.slice(2)}</li>
              } else if (line.trim() === '') {
                return <div key={i} className="h-1" />
              } else if (line.startsWith('---')) {
                return <hr key={i} className="my-2 border-gray-200" />
              } else {
                return <p key={i} className="text-gray-700 mb-1 leading-relaxed text-xs">{line}</p>
              }
            })}
          </div>
        </div>

        {/* Checkbox - Sticky Bottom */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={consents[activeTab]}
              onChange={(e) => setConsents({ ...consents, [activeTab]: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {activeTab === 'spk' && 'SPK Yatırım Tavsiyesi Reddi Bildirimini okudum, anladım ve kabul ediyorum'}
                {activeTab === 'risk' && 'SPK Risk Bildirimini okudum, anladım ve kabul ediyorum'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Yukarıdaki metni dikkatlice okuyarak onayladığınızı beyan edersiniz
              </p>
            </div>
          </label>
        </div>

        {/* Footer - Sticky Bottom */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {!allAccepted && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                Lütfen tüm bildirimleri onaylayın ({acceptedCount}/2)
              </span>
            )}
            {allAccepted && (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tüm bildirimler onaylandı
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allAccepted || submitting}
            className={`
              px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${allAccepted && !submitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {submitting ? 'Kaydediliyor...' : 'Devam Et →'}
          </button>
        </div>
      </div>
    </div>
  )
}
