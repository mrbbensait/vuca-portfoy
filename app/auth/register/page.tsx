'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LegalModal from '@/components/legal/LegalModal'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [invitationCode, setInvitationCode] = useState<string | null>(null)
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null)
  const [validatingInvite, setValidatingInvite] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy'>('terms')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Davet kodu kontrolü
  useEffect(() => {
    const code = searchParams.get('invite')
    
    if (code) {
      // URL'de kod varsa localStorage'a kaydet
      localStorage.setItem('pending_invitation', code)
      setInvitationCode(code)
      validateInvitation(code)
    } else {
      // URL'de kod yoksa localStorage'dan kontrol et
      const savedCode = localStorage.getItem('pending_invitation')
      
      if (savedCode) {
        // Daha önce kaydedilmiş kod varsa kullan
        setInvitationCode(savedCode)
        validateInvitation(savedCode)
        setMessage('Daha önce aldığınız davet kodu hatırlandı.')
      } else {
        // Hiç kod yoksa hata göster
        setError('Bu platform sadece davetiye ile üyelik kabul etmektedir. Lütfen geçerli bir davet linki kullanın.')
        setInvitationValid(false)
      }
    }
  }, [searchParams])

  // Environment variable kontrolü
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      setError('Supabase yapılandırması eksik. Lütfen environment variable\'ları kontrol edin.')
    }
  }, [])

  const validateInvitation = async (code: string) => {
    setValidatingInvite(true)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/validate?code=${code}`)
      const data = await response.json()

      if (data.valid) {
        setInvitationValid(true)
      } else {
        setInvitationValid(false)
        setError(data.error || 'Geçersiz davet kodu')
      }
    } catch (err) {
      setInvitationValid(false)
      setError('Davet kodu doğrulanamadı')
    } finally {
      setValidatingInvite(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitationValid || !invitationCode) {
      setError('Geçerli bir davet kodu gerekli')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: {
          display_name: displayName || email.split('@')[0],
          invitation_code: invitationCode,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      try {
        const validateResponse = await fetch(`/api/invitations/validate?code=${invitationCode}`)
        const validateData = await validateResponse.json()

        if (!validateData.valid || !validateData.invitation) {
          setError('Davet kodu artık geçerli değil')
          setLoading(false)
          return
        }

        const useResponse = await fetch('/api/invitations/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitation_id: validateData.invitation.id,
            user_id: authData.user.id,
          }),
        })

        const useData = await useResponse.json()

        if (!useData.success) {
          console.error('Failed to record invitation use:', useData.error)
        }
      } catch (inviteError) {
        console.error('Invitation tracking error:', inviteError)
      }

      // Davet kodu kullanıldı, localStorage'dan temizle
      localStorage.removeItem('pending_invitation')
      
      if (authData.session) {
        setMessage('Kayıt başarılı! Yönlendiriliyorsunuz...')
        // Session'ın tam oturması ve trigger'ın tamamlanması için daha uzun bekle
        setTimeout(() => {
          router.push('/dashboard')
        }, 2500)
      } else {
        setMessage('Kayıt başarılı! E-posta adresinizi doğrulayın.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            XPortfoy
          </h1>
          <p className="text-gray-600">Yeni hesap oluşturun</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad (opsiyonel)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre (en az 6 karakter)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {/* Implicit Consent */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed text-center">
              <strong>&quot;Kayıt Ol&quot;</strong> butonuna basarak <strong>18 yaşından büyük</strong> olduğunuzu,{' '}
              <button
                type="button"
                onClick={() => {
                  setLegalModalType('terms')
                  setLegalModalOpen(true)
                }}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Kullanım Şartları
              </button>
              {' '}ve{' '}
              <button
                type="button"
                onClick={() => {
                  setLegalModalType('privacy')
                  setLegalModalOpen(true)
                }}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Gizlilik Politikası
              </button>
              &apos;nı okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylamış olursunuz.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !invitationValid || validatingInvite}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {validatingInvite ? 'Davet kodu doğrulanıyor...' : loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={legalModalType}
      />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
