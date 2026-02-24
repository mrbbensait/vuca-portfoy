'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Holding, PriceHistory } from '@/lib/types/database.types'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface PortfolioValueChartProps {
  holdings: Holding[]
  priceHistory: PriceHistory[]
}

export default function PortfolioValueChart({ holdings, priceHistory }: PortfolioValueChartProps) {
  const mockUSDTRY = 34.50

  // Tüm tarihleri al
  const dates = [...new Set(priceHistory.map(p => p.date))].sort()

  // Her tarih için portföy değerini hesapla
  const chartData = dates.map(date => {
    const totalValue = holdings.reduce((sum, holding) => {
      const price = priceHistory.find(p => p.symbol === holding.symbol && p.date === date)
      if (!price) return sum

      const priceInTRY = price.currency === 'USD' ? price.close * mockUSDTRY : price.close
      return sum + (holding.quantity * priceInTRY)
    }, 0)

    return {
      date,
      value: totalValue,
      formattedDate: format(new Date(date), 'dd MMM', { locale: tr }),
    }
  }).filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Grafik için yeterli veri bulunmuyor.</p>
      </div>
    )
  }

  const minValue = Math.min(...chartData.map(d => d.value))
  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portföy Değer Grafiği</h3>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[minValue * 0.95, maxValue * 1.05]}
              tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value: any) => [
                `₺${(value as number).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
                'Portföy Değeri'
              ]}
              labelFormatter={(label: any) => `Tarih: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Portföy Değeri"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500">Başlangıç</p>
          <p className="font-semibold text-gray-900">
            ₺{chartData[0].value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500">Güncel</p>
          <p className="font-semibold text-gray-900">
            ₺{chartData[chartData.length - 1].value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-gray-500">Değişim</p>
          <p className={`font-semibold ${
            chartData[chartData.length - 1].value >= chartData[0].value ? 'text-green-600' : 'text-red-600'
          }`}>
            {((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  )
}
