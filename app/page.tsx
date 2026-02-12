import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp,
  PieChart,
  Shield,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Activity,
  Wallet,
} from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctaHref = user ? '/dashboard' : '/auth/register'
  const ctaText = user ? 'Panele Git' : 'Ücretsiz Başla'

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Portföy Röntgeni</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Panele Git
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ücretsiz Başla
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Yatırımlarınızı tek ekrandan yönetin
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Portföyünüzün
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> röntgenini </span>
              çekin
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              BIST hisseleri, ABD borsası ve kripto varlıklarınızı tek bir panelden takip edin. 
              Gerçek zamanlı analizler, risk skorları ve akıllı önerilerle yatırımlarınızı kontrol altında tutun.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-6 py-4 text-lg font-medium transition-colors"
              >
                Özellikleri Keşfet
              </Link>
            </div>

            {/* Mini Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <p className="text-3xl font-bold text-gray-900">3+</p>
                <p className="text-sm text-gray-500 mt-1">Varlık Türü</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">%100</p>
                <p className="text-sm text-gray-500 mt-1">Ücretsiz</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">7/24</p>
                <p className="text-sm text-gray-500 mt-1">Anlık Takip</p>
              </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Preview */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-200 p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Portföy Değeri</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">₺284,500</p>
                  <p className="text-xs text-green-600 mt-1">+12.4% bu ay</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Çeşitlilik</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">85/100</p>
                  <p className="text-xs text-blue-600 mt-1">Mükemmel dağılım</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Sağlık Skoru</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">78/100</p>
                  <p className="text-xs text-purple-600 mt-1">İyi seviyede</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Varlık Sayısı</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-amber-600 mt-1">3 farklı piyasa</p>
                </div>
              </div>

              {/* Simulated chart area */}
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Portföy Performansı</span>
                  <span className="text-xs text-gray-400">Son 30 gün</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {[40, 45, 38, 52, 48, 60, 55, 70, 65, 72, 68, 80, 75, 85, 78, 90, 88, 82, 95, 92, 88, 96, 90, 100, 95, 98, 92, 105, 100, 108].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${(h / 108) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Yatırım yönetiminin her adımı için
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Portföy Röntgeni, yatırımlarınızı analiz etmek ve yönetmek için ihtiyacınız olan tüm araçları sunar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Çoklu Piyasa Desteği</h3>
              <p className="text-gray-600 leading-relaxed">
                BIST hisseleri, ABD borsası hisseleri ve kripto varlıklarınızı tek bir yerden takip edin ve yönetin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-green-100 hover:bg-green-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performans Analizi</h3>
              <p className="text-gray-600 leading-relaxed">
                Günlük, haftalık ve aylık getirilerinizi takip edin. En iyi ve en kötü performans gösteren varlıklarınızı görün.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-purple-200 transition-colors">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dağılım Görselleştirme</h3>
              <p className="text-gray-600 leading-relaxed">
                Portföyünüzün varlık dağılımını görsel grafiklerle analiz edin. Dengeli bir portföy oluşturun.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-200 transition-colors">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sağlık Skoru</h3>
              <p className="text-gray-600 leading-relaxed">
                Portföyünüzün genel sağlığını 100 üzerinden puanlayın. Getiri, çeşitlilik ve risk metriklerini takip edin.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-red-100 hover:bg-red-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-200 transition-colors">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Volatilite Takibi</h3>
              <p className="text-gray-600 leading-relaxed">
                Portföyünüzün risk seviyesini volatilite analizleriyle ölçün. Korelasyon matrisi ile ilişkileri görün.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detaylı Raporlar</h3>
              <p className="text-gray-600 leading-relaxed">
                Portföy verilerinizi PDF olarak dışa aktarın. İşlem geçmişinizi ve notlarınızı kayıt altında tutun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              3 adımda başlayın
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hızlı kurulum, anında sonuçlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hesap Oluşturun</h3>
              <p className="text-gray-600">
                E-posta adresinizle saniyeler içinde ücretsiz hesabınızı oluşturun.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-600/30">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Varlıklarınızı Ekleyin</h3>
              <p className="text-gray-600">
                Hisselerinizi, kriptolarınızı ve diğer varlıklarınızı portföyünüze ekleyin.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-600/30">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analiz Edin</h3>
              <p className="text-gray-600">
                Detaylı analizler, skor kartları ve görselleştirmelerle portföyünüzü optimize edin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist / Why Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Neden Portföy Röntgeni?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Yatırım portföyünüzü yönetmek hiç bu kadar kolay olmamıştı.
              </p>

              <div className="space-y-4">
                {[
                  'BIST, ABD ve kripto piyasaları tek panelde',
                  'Portföy sağlık skoru ile genel durum analizi',
                  'Varlık korelasyon matrisi ve risk ölçümü',
                  'PDF raporlama ve veri dışa aktarma',
                  'İşlem geçmişi ve not tutma',
                  'Mobil uyumlu modern arayüz',
                  'Tamamen ücretsiz kullanım',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-12 text-white">
              <h3 className="text-2xl font-bold mb-4">Portföy Sağlık Skoru</h3>
              <p className="text-blue-100 mb-8">
                Yapay zeka destekli skor sistemiyle portföyünüzün genel durumunu 100 üzerinden değerlendirin.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Getiri Skoru</span>
                    <span>36/40</span>
                  </div>
                  <div className="w-full bg-blue-500/30 rounded-full h-2.5">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Çeşitlilik Skoru</span>
                    <span>25/30</span>
                  </div>
                  <div className="w-full bg-blue-500/30 rounded-full h-2.5">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '83%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Skoru</span>
                    <span>22/30</span>
                  </div>
                  <div className="w-full bg-blue-500/30 rounded-full h-2.5">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '73%' }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-400/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Toplam Skor</span>
                    <span className="text-4xl font-bold">83<span className="text-lg text-blue-200">/100</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Yatırımlarınızı kontrol altına alın
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Binlerce yatırımcı portföylerini Portföy Röntgeni ile yönetiyor. Siz de hemen başlayın.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Portföy Röntgeni</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/auth/login" className="hover:text-white transition-colors">Giriş Yap</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Kayıt Ol</Link>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Portföy Röntgeni. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
