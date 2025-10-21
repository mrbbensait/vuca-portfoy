'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PortfolioDistribution } from '@/lib/types/database.types'

interface DistributionChartProps {
  distribution: PortfolioDistribution[]
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

export default function DistributionChart({ distribution }: DistributionChartProps) {
  if (distribution.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Henüz veri bulunmuyor
      </div>
    )
  }

  const chartData = distribution.map(d => ({
    name: ASSET_TYPE_LABELS[d.asset_type] || d.asset_type,
    value: d.value,
    percentage: d.percentage,
    count: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Pasta Grafiği */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: { name?: string; payload?: { percentage: number } }) => {
                const name = props.name || ''
                const percentage = props.payload?.percentage || 0
                return `${name}: ${percentage.toFixed(1)}%`
              }}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
                'Değer'
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend - Düzgün Hizalanmış */}
      <div className="grid grid-cols-2 gap-3">
        {distribution.map((d, index) => (
          <div key={d.asset_type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {ASSET_TYPE_LABELS[d.asset_type]}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {d.count} varlık • {d.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
