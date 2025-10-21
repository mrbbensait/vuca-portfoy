import { getMockAlerts } from '@/lib/mock-data'
import { BellOff, Target, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import ToggleAlertButton from './ToggleAlertButton'

interface AlertsListProps {
  userId: string
}

export default async function AlertsList({}: AlertsListProps) {
  // DEMO MODE: Mock veriler kullanılıyor
  const { data: alerts } = await getMockAlerts()

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600">Henüz uyarı eklenmemiş.</p>
        <p className="text-sm text-gray-500 mt-1">Yukarıdaki butona tıklayarak uyarı ekleyebilirsiniz.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y divide-gray-200">
        {alerts.map(alert => {
          const isActive = alert.is_active
          const isTargetPrice = alert.type === 'TARGET_PRICE'

          return (
            <div key={alert.id} className={`p-6 ${!isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className={`p-2 rounded-lg mr-4 ${
                    isTargetPrice ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {isTargetPrice ? (
                      <Target className={`w-5 h-5 ${isTargetPrice ? 'text-blue-600' : 'text-purple-600'}`} />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {isTargetPrice ? 'Hedef Fiyat Uyarısı' : 'Portföy Değişim Uyarısı'}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {isTargetPrice ? (
                        <>
                          <p><strong>Sembol:</strong> {(alert.payload as { symbol: string }).symbol}</p>
                          <p><strong>Hedef Fiyat:</strong> ₺{(alert.payload as { target: number }).target}</p>
                        </>
                      ) : (
                        <p><strong>Eşik Değeri:</strong> %{(alert.payload as { threshold: number }).threshold}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(alert.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <ToggleAlertButton alertId={alert.id} isActive={isActive} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
