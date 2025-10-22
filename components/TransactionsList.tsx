import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { TrendingUp, TrendingDown } from 'lucide-react'
import AddTransactionButton from './AddTransactionButton'
import { formatPrice } from '@/lib/formatPrice'
import { AssetType } from '@/lib/types/database.types'
import { calculateTransactionProfitLoss } from '@/lib/calculations'

interface TransactionsListProps {
  userId: string
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

export default async function TransactionsList({ userId }: TransactionsListProps) {
  const supabase = await createClient()
  
  // Tüm işlemleri çek (kar/zarar hesabı için gerekli)
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true }) // Kronolojik sıra
  
  // Son 20 işlemi göster
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(20)
  
  // Kar/zarar hesapla
  const profitLossMap = allTransactions ? calculateTransactionProfitLoss(allTransactions) : new Map()

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">İşlem Geçmişi</h2>
            <p className="text-sm text-gray-600 mt-1">Son 20 işlem</p>
          </div>
          <AddTransactionButton userId={userId} />
        </div>
      </div>

      <div className="overflow-x-auto">
        {!transactions || transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Henüz işlem bulunmuyor.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sembol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ort. Maliyet
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kar/Zarar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => {
                const profitLoss = profitLossMap.get(tx.id)
                const currency = tx.asset_type === 'TR_STOCK' ? '₺' : '$'
                
                // Satır arka plan rengini belirle
                let rowBgColor = 'hover:bg-gray-50'
                if (tx.side === 'SELL' && profitLoss?.profit_loss !== null) {
                  if (profitLoss.profit_loss > 0) {
                    rowBgColor = 'bg-green-50 hover:bg-green-100'
                  } else if (profitLoss.profit_loss < 0) {
                    rowBgColor = 'bg-red-50 hover:bg-red-100'
                  }
                }
                
                return (
                  <tr key={tx.id} className={rowBgColor}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tx.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {ASSET_TYPE_LABELS[tx.asset_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tx.side === 'BUY' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-600">ALIŞ</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-sm font-medium text-red-600">SATIŞ</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {tx.quantity.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {currency}{formatPrice(tx.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {currency}{(tx.quantity * tx.price).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </td>
                    
                    {/* Kar/Zarar Kolonları - Sadece satış işlemleri için */}
                    {tx.side === 'SELL' && profitLoss ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {currency}{formatPrice(profitLoss.avg_cost_price || 0)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                          profitLoss.profit_loss && profitLoss.profit_loss > 0 
                            ? 'text-green-600' 
                            : profitLoss.profit_loss && profitLoss.profit_loss < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {profitLoss.profit_loss !== null
                            ? `${profitLoss.profit_loss >= 0 ? '+' : ''}${currency}${formatPrice(Math.abs(profitLoss.profit_loss))}`
                            : '-'
                          }
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                          profitLoss.profit_loss_percent && profitLoss.profit_loss_percent > 0 
                            ? 'text-green-600' 
                            : profitLoss.profit_loss_percent && profitLoss.profit_loss_percent < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {profitLoss.profit_loss_percent !== null
                            ? `${profitLoss.profit_loss_percent >= 0 ? '+' : ''}${profitLoss.profit_loss_percent.toFixed(2)}%`
                            : '-'
                          }
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
