'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  Users,
  Bell,
  Rocket,
  Lock,
  DollarSign,
  MessageSquare,
  Target,
} from 'lucide-react'
import FadeInSection from '@/components/landing/FadeInSection'
import FeatureCard from '@/components/landing/FeatureCard'
import UseCaseCard from '@/components/landing/UseCaseCard'
import ComparisonTable from '@/components/landing/ComparisonTable'
import AnimatedCounter from '@/components/landing/AnimatedCounter'

export default function LandingPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

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
          <FadeInSection className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-200">
              <Rocket className="w-4 h-4" />
              Türkiye'nin İlk Sosyal Portföy Platformu
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Tüm Varlıklarınızı
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Tek Portföyde </span>
              Yönetin, Analiz Edin,
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Paylaşın</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              BIST, ABD, kripto, altın, gümüş, döviz — tüm varlıklarınızı tek platformda yönetin. 
              İsterseniz paylaşın isterseniz sadece kendiniz kullanın veya başkalarını takip edin.
            </p>

            {/* Asset Type Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {[
                { label: 'BIST Hisse', color: 'bg-red-50 text-red-700 border-red-200' },
                { label: 'ABD Hisse', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Kripto', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Altın', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Gümüş', color: 'bg-gray-100 text-gray-700 border-gray-300' },
                { label: 'Döviz', color: 'bg-green-50 text-green-700 border-green-200' },
              ].map((asset) => (
                <span
                  key={asset.label}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${asset.color}`}
                >
                  {asset.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 hover:scale-105"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                Örnek Portföyler
                <Users className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>%100 Ücretsiz</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <span>30 Saniyede Kurulum</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-500" />
                <span>Bank-Level Güvenlik</span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Benzersiz Özellikler Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Benzersiz Özellikler
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Türkiye'de ilk ve tek: Çoklu varlık + sosyal platform + Telegram entegrasyonu + enterprise performans
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Globe}
              title="6 Piyasa, 1 Portföy"
              description="BIST, ABD, kripto, altın, gümüş, döviz — hepsini tek portföyde yönetin. Farklı uygulamalar arasında geçiş yapmaya son!"
              stat="Türkiye'de ilk"
              gradient="bg-gradient-to-br from-blue-100 to-indigo-100"
              iconColor="text-blue-600"
              delay={0}
            />
            <FeatureCard
              icon={Users}
              title="Sosyal Portföy Platformu"
              description="İsterseniz portföyünüzü paylaşın, isterseniz paylaşıma açılmış portföyleri keşfedin ve takip edin. Tüm bildirimleri anlık olarak alın."
              stat="Sosyal yatırım ağı"
              gradient="bg-gradient-to-br from-purple-100 to-pink-100"
              iconColor="text-purple-600"
              delay={0.1}
            />
            <FeatureCard
              icon={Bell}
              title="Telegram Kanalı Entegrasyonu"
              description="Finfluencer mısınız? Ücretsiz ve güvenli bir şekilde Telegram kanalınızı portföyünüze entegre edebilirsiniz. Tüm işlemleriniz ve duyurularınız anında kanalınıza düşecektir."
              stat="Finfluencer aracı"
              gradient="bg-gradient-to-br from-cyan-100 to-blue-100"
              iconColor="text-cyan-600"
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="%90 Daha Hızlı"
              description="Akıllı cache sistemi ve batch API ile lightning-fast performans. Ortalama yanıt süresi 0.05 saniye."
              stat="0.05s yanıt"
              gradient="bg-gradient-to-br from-yellow-100 to-orange-100"
              iconColor="text-yellow-600"
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Gelişmiş Analiz Araçları"
              description="Sağlık skoru, volatilite analizi, korelasyon matrisi, çeşitlilik metrikleri. Portföyünüzü 360 derece analiz edin."
              stat="100 üzerinden skor"
              gradient="bg-gradient-to-br from-green-100 to-emerald-100"
              iconColor="text-green-600"
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Güvenlik"
              description="RBAC yetkilendirme, RLS database security, rate limiting, encrypted data. Bank-grade güvenlik katmanları."
              stat="Bank-grade"
              gradient="bg-gradient-to-br from-red-100 to-pink-100"
              iconColor="text-red-600"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Use Cases - Kimler İçin? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Kimler İçin?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bireysel yatırımcıdan finfluencer'a, öğrenciden profesyonele — herkes için
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UseCaseCard
              name="Ahmet, 32"
              role="Yazılımcı - Bireysel Yatırımcı"
              problem="Kripto Binance'te, hisseler mevcut bankamda. Toplam değerimi bile göremiyordum."
              solution="Artık her şey tek portföyde. Gün sonunda toplam kar/zarar net görünüyor."
              features={[
                'Çoklu varlık yönetimi',
                'Kar/zarar takibi',
                'Performans analizi',
                'Sağlık skoru',
              ]}
              delay={0}
            />
            <UseCaseCard
              name="Selin, 28"
              role="YouTuber (50K abone) - Finfluencer"
              problem="Portföyümü takipçilerime şeffaf göstermek istiyordum ama araç yoktu."
              solution="Portföyümü public yaptım. Kendi Telegram kanalıma otomatik bildirim gidiyor!"
              features={[
                'Public portföy paylaşımı',
                'Kendi Telegram botunu entegre et',
                'Duyuru sistemi',
                'Takipçi yönetimi',
              ]}
              delay={0.15}
            />
            <UseCaseCard
              name="Mehmet, 24"
              role="Üniversite Öğrencisi - Yatırım Öğrencisi"
              problem="Güvendiğim kişilerin gerçekten ne yaptığını görmek istiyordum."
              solution="3 profesyonel yatırımcıyı takip ediyorum. Her işlemlerini anında görüyorum."
              features={[
                'Takip sistemi',
                'Activity feed',
                'Telegram bildirimleri',
                'Ücretsiz öğrenme',
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır - Timeline */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              5 Adımda Başlayın
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hızlı kurulum, anında sonuçlar — her şey 2 dakikada hazır
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: '1', title: 'Kayıt Ol', desc: 'Email ile 30 saniyede hesap oluştur', icon: '👤' },
              { step: '2', title: 'Portföy Oluştur', desc: '10 adete kadar portföy oluşturabilirsin', icon: '📁' },
              { step: '3', title: 'Varlık Ekle', desc: 'BIST, ABD, kripto, altın — her şeyi ekle', icon: '➕' },
              { step: '4', title: 'Analiz Et', desc: 'Gerçek zamanlı analiz ve sağlık skoru', icon: '📊' },
              { step: '5', title: 'Paylaş (İsteğe Bağlı)', desc: 'İstersen portföyünü paylaş, Telegram kanalını bağla', icon: '🚀' },
            ].map((item, i) => (
              <FadeInSection key={i} delay={i * 0.1} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-600/30">
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sosyal Platform Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Sosyal Portföy Platformu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sadece portföy yönetimi değil — bir sosyal yatırım ağı. Keşfet, takip et, öğren.
              <span className="block mt-2 text-base text-blue-600 font-semibold">* Para miktarları paylaşılmaz, sadece işlemler, % oranlar ve stratejiler görünür. Paranız sadece size özeldir...</span>
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInSection delay={0.2}>
              <div className="space-y-6">
                {[
                  { icon: Globe, title: 'Keşfet Sayfası', desc: 'Tüm public portföyleri incele, popülerleri keşfet' },
                  { icon: Users, title: 'Takip Sistemi', desc: 'İlgilendiğin portföyleri takip et, her hareketini gör' },
                  { icon: Activity, title: 'Activity Feed', desc: 'Takip ettiklerinin tüm işlemleri tek sayfada' },
                  { icon: MessageSquare, title: 'Duyuru Sistemi', desc: 'Portföy sahipleri stratejilerini paylaşır' },
                  { icon: Bell, title: 'Web Bildirimleri', desc: 'Takip ettiklerinizin işlemlerini anında görün' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">Selin'in Kripto Portföyü</p>
                      <p className="text-sm text-gray-500">12K takipçi • 45 varlık</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span>+24.5% Son 30 Gün</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">Ahmet'in Uzun Vadeli Portföy</p>
                      <p className="text-sm text-gray-500">8K takipçi • 28 varlık</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <Activity className="w-4 h-4" />
                    <span>2 saat önce işlem yaptı</span>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Telegram Deep Dive */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Bell className="w-4 h-4" />
              Telegram Kanal Entegrasyonu
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Finfluencer'lar İçin: Kendi Kanalınıza Otomatik Bildirim
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Portföyünüzdeki her işlem, kendi Telegram kanalınıza otomatik bildirim olarak gider. <span className="font-bold text-cyan-600">Tamamen ücretsiz ve çok basit kurulum!</span>
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInSection delay={0.2}>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
                <div className="bg-white rounded-xl p-6 shadow-xl font-mono text-sm">
                  <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
                    <Bell className="w-5 h-5" />
                    <span>Portföy Röntgeni Bot</span>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-bold">📊 Yeni İşlem</p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Selin Yılmaz</span>, "Kripto Portföy" portföyüne bir <span className="text-green-600 font-semibold">ALIM</span> işlemi ekledi.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Sembol</p>
                      <p className="font-bold">BTC • Kripto</p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">25 Şubat 2026 · 14:30</p>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-sans font-semibold">
                        📊 Portföyü İncele
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <ul className="space-y-4">
                {[
                  { icon: '🤖', title: 'Kendi botunuzu kurun', desc: 'Telegram BotFather\'dan basitçe kendi botunuzu oluşturun' },
                  { icon: '⚡', title: 'Otomatik bildirimler', desc: 'Her işlem ve duyuru otomatik olarak kanalınıza gider' },
                  { icon: '🔗', title: 'Direkt link', desc: 'Takipçileriniz tek tıkla portföyünüze ulaşır' },
                  { icon: '🔒', title: 'Güvenli entegrasyon', desc: 'Token\'ınız güvenle saklanır, sadece siz erişirsiniz' },
                  { icon: '💰', title: 'Tamamen ücretsiz', desc: 'Hiçbir ücret yok, kolayca entegre edin' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Neden Portföy Röntgeni?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diğer uygulamalarla karşılaştırın
            </p>
          </FadeInSection>

          <ComparisonTable />
        </div>
      </section>

      {/* Güvenlik */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Güvenlik Katmanları
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Supabase Auth', desc: 'Enterprise-level kimlik doğrulama' },
                  { title: 'Row Level Security (RLS)', desc: 'Verileriniz tamamen izole' },
                  { title: 'Rate Limiting', desc: 'API kötüye kullanımı önleme' },
                  { title: 'Encrypted Data', desc: 'Tüm veriler şifreli saklanır' },
                  { title: 'RBAC Admin', desc: 'Granular yetkilendirme sistemi' },
                  { title: 'Audit Logs', desc: 'Tüm işlemler kayıt altında' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        <FadeInSection className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Portföy Yönetimini Bir Sonraki Seviyeye Taşıyın
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Türkiye'nin ilk sosyal portföy platformunda yerinizi alın. Ücretsiz, kolay ve güçlü.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-blue-700/50 backdrop-blur text-white border-2 border-white/20 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600/50 transition-all"
            >
              Örnek Portföy İncele
              <Target className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-white/90 mb-16">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Kredi kartı gerektirmez</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>30 saniyede kurulum</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>10 portföy oluşturabilirsiniz</span>
            </div>
          </div>

          {/* Footer içerik */}
          <div className="border-t border-white/20 pt-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Portföy Röntgeni</span>
              </div>
              <p>
                &copy; {new Date().getFullYear()} Portföy Röntgeni • <span className="text-white font-semibold">Beta Sürüm</span> • Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>
    </div>
  )
}
