'use client'

interface CorrelationHeatmapProps {
  matrix: Record<string, Record<string, number>>
  symbols: string[]
}

export default function CorrelationHeatmap({ matrix, symbols }: CorrelationHeatmapProps) {
  if (symbols.length < 2) {
    return <p className="text-gray-500 text-sm">Korelasyon analizi için en az 2 varlık gereklidir.</p>
  }

  // Korelasyon değerine göre renk
  const getColor = (value: number) => {
    if (value >= 0.8) return 'bg-red-600'
    if (value >= 0.6) return 'bg-red-400'
    if (value >= 0.4) return 'bg-orange-400'
    if (value >= 0.2) return 'bg-yellow-400'
    if (value >= -0.2) return 'bg-gray-300'
    if (value >= -0.4) return 'bg-blue-300'
    if (value >= -0.6) return 'bg-blue-400'
    return 'bg-blue-600'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="p-2"></th>
            {symbols.map((symbol) => (
              <th key={symbol} className="p-2 text-xs font-medium text-gray-700">
                {symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((symbol1) => (
            <tr key={symbol1}>
              <td className="p-2 text-xs font-medium text-gray-700">{symbol1}</td>
              {symbols.map((symbol2) => {
                const value = matrix[symbol1]?.[symbol2] ?? 0
                return (
                  <td key={symbol2} className="p-1">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded ${getColor(value)} text-white text-xs font-medium`}
                      title={`${symbol1} - ${symbol2}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span className="text-gray-600">Korelasyon:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Negatif</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Nötr</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Pozitif</span>
        </div>
      </div>
    </div>
  )
}
