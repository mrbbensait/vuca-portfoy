'use client'

import { X, Bot, Hash, UserPlus, FlaskConical, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react'

interface TelegramHelpModalProps {
  onClose: () => void
}

const steps = [
  {
    icon: Bot,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Adım 1 — Bot Oluşturun',
    lines: [
      'Telegram uygulamasını açın.',
      'Arama çubuğuna <strong>@BotFather</strong> yazın ve "BotFather" hesabını açın (mavi tik ile doğrulanmış olmalı).',
      '<strong>/newbot</strong> komutunu gönderin.',
      'Bot&#39;unuza bir isim verin (örn: <em>Portföy Bildirimlerim</em>).',
      'Ardından bir kullanıcı adı girin — sonunda <strong>bot</strong> kelimesi geçmeli (örn: <em>portfoyim_bot</em>).',
      'BotFather size bir <strong>TOKEN</strong> verecek. Bunu kopyalayın, birazdan kullanacaksınız.',
    ],
    note: '💡 Token şuna benzer görünür: <code class="bg-gray-100 px-1 rounded text-xs">7123456789:AAFxxxx...</code>',
  },
  {
    icon: Hash,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'Adım 2 — Telegram Kanalı Oluşturun',
    lines: [
      'Telegram&#39;da sol menüden <strong>"Yeni Kanal Oluştur"</strong> seçeneğine tıklayın.',
      'Kanalınıza bir isim verin (örn: <em>Portföy Takip</em>).',
      'Kanal türünü <strong>Herkese Açık (Public)</strong> olarak seçin.',
      'Kanalınıza bir bağlantı adresi belirleyin (örn: <em>portfoy_takibim</em>).',
      'Bu adres sizin <strong>Kanal ID&#39;niz</strong> olacak: <code class="bg-gray-100 px-1 rounded text-xs">@portfoy_takibim</code>',
    ],
    note: '💡 <strong>Private kanal</strong> kullanıyorsanız: @userinfobot&#39;a kanalı forward ederek sayısal ID&#39;yi öğrenin. Aldığınız ID&#39;yi <strong>-100 öneki ile</strong> girin. Örnek: ID -3563386613 ise Kanal ID alanına <code class="bg-gray-100 px-1 rounded text-xs">-1003563386613</code> yazın.',
  },
  {
    icon: UserPlus,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Adım 3 — Botu Kanala Admin Olarak Ekleyin',
    lines: [
      'Oluşturduğunuz <strong>kanala</strong> gidin.',
      'Kanal adına tıklayıp <strong>"Kanal Bilgileri"</strong>&#39;ni açın.',
      '<strong>"Yöneticiler"</strong> (Administrators) bölümüne girin.',
      '<strong>"Yönetici Ekle"</strong>&#39;ye tıklayın ve oluşturduğunuz botu aratın.',
      'Botu bulunca seçin, <strong>"Mesaj Gönder"</strong> izninin açık olduğundan emin olup kaydedin.',
    ],
    note: '⚠️ Bu adımı atlarsanız bot mesaj gönderemez ve test başarısız olur.',
  },
  {
    icon: FlaskConical,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Adım 4 — Bilgileri Girin ve Test Edin',
    lines: [
      'Ayarlar sayfasına dönün, portföyünüzü seçin.',
      '<strong>Bot Token</strong> alanına BotFather&#39;dan aldığınız token&#39;ı yapıştırın.',
      '<strong>Kanal ID</strong> alanına @ ile başlayan kanal adresinizi girin (örn: <code class="bg-gray-100 px-1 rounded text-xs">@portfoy_takibim</code>).',
      '<strong>"Test Mesajı Gönder"</strong> butonuna tıklayın.',
      'Kanalınızda "Bağlantı Başarılı" mesajını gördüyseniz her şey hazır!',
      'Son olarak <strong>"Bildirimleri Aktif Et"</strong> kutucuğunu işaretleyip kaydedin.',
    ],
    note: '✅ Artık portföyünüzdeki her işlem ve duyuru otomatik olarak kanalınıza iletilecek.',
  },
]

export default function TelegramHelpModal({ onClose }: TelegramHelpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Telegram Nasıl Bağlanır?</h2>
              <p className="text-xs text-gray-500">4 adımda kurulum rehberi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Adımlar */}
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                  <ol className="space-y-1.5 mb-2">
                    {step.lines.map((line, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                      </li>
                    ))}
                  </ol>
                  <p
                    className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                    dangerouslySetInnerHTML={{ __html: step.note }}
                  />
                </div>
              </div>
            )
          })}

          {/* Güvenlik Bölümü */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <h3 className="text-sm font-bold text-green-800">Güvenlik Garantileri</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Bot token&#39;ınız <strong>AES-256-GCM</strong> şifrelemesi ile saklanır. Kimse düz metin olarak göremez.',
                'Portföy Röntgeni ekibi dahil <strong>hiç kimse</strong> token&#39;ınıza erişemez.',
                'Token yalnızca bildirim gönderilirken kısa süreliğine çözülür ve bellekte tutulmaz.',
                'İstediğiniz zaman entegrasyonu <strong>kaldırabilir</strong> veya BotFather&#39;dan botu silebilirsiniz.',
                'Ekran görüntülerinde token&#39;ınız asla gösterilmez; her zaman <strong>gizlidir (••••)</strong>.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-green-800">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>

          {/* Uyarı */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <h3 className="text-sm font-bold text-amber-800">Önemli Uyarı</h3>
            </div>
            <p className="text-sm text-amber-700">
              Bot token&#39;ınızı <strong>kimseyle paylaşmayın</strong> ve ekran görüntüsünü internette yayınlamayın. Token&#39;ınız ele geçirilirse BotFather&#39;dan yeni token üretebilirsiniz (<code className="bg-amber-100 px-1 rounded text-xs">/revoke</code> komutu).
            </p>
          </div>

          {/* Sorun Giderme */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Test Başarısız mı Oluyor?</h3>
            <ul className="space-y-1.5">
              {[
                ['Bot bulunamadı / Unauthorized', 'BotFather&#39;dan aldığınız token&#39;ı doğru kopyaladığınızdan emin olun.'],
                ['Kanal bulunamadı (chat not found)', 'Kanal ID&#39;sini @ işareti ile birlikte girin: @kanaladi'],
                ['Bot mesaj gönderemiyor (Forbidden)', 'Botu kanala admin olarak eklemeyi unutmuş olabilirsiniz (Adım 3).'],
                ['Hâlâ çalışmıyor', 'Kanalı silip yeniden oluşturmayı deneyin veya destek@portfoyrontgeni.com adresine yazın.'],
              ].map(([title, desc], i) => (
                <li key={i} className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">❌ {title}:</span> {desc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
