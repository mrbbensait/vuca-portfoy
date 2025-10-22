'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { TrendingUp, TrendingDown } from 'lucide-react'
import AddTransactionButton from './AddTransactionButton'
import { formatPrice } from '@/lib/formatPrice'
import type { Transaction } from '@/lib/types/database.types'
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

const CASH_SYMBOL_NAMES: Record<string, string> = {
  TRY: 'Türk Lirası',
  USD: 'Amerikan Doları',
  EUR: 'Euro',
  GOLD: 'Gram Altın',
  SILVER: 'Gram Gümüş',
}

export default function TransactionsList({ userId }: TransactionsListProps) {
  const { activePortfolio } = usePortfolio()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!activePortfolio) return

      setLoading(true)
      
      // Tüm işlemleri çek (kar/zarar hesabı için gerekli)
      const { data: all } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)
        .order('date', { ascending: true })
      
      // Son 20 işlemi göster
      const { data: recent } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)
        .order('date', { ascending: false })
        .limit(20)

      setAllTransactions(all || [])
      setTransactions(recent || [])
      setLoading(false)
    }

    fetchTransactions()
  }, [activePortfolio?.id])
  
  // Kar/zarar hesapla
  const profitLossMap = allTransactions ? calculateTransactionProfitLoss(allTransactions) : new Map()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">İşlem Geçmişi</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Son 20 işlem</p>
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
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Tarih
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Sembol
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Tür
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  İşlem
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Miktar
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Fiyat
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Toplam
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Ort. Maliyet
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  Kar/Zarar
                </th>
                <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => {
                const profitLoss = profitLossMap.get(tx.id)
                const currency = (tx.asset_type === 'TR_STOCK' || tx.asset_type === 'CASH') ? '₺' : '$'
                
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
                  <tr key={tx.id} className={`transition-colors border-b ${rowBgColor}`}>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tx.asset_type === 'CASH' && CASH_SYMBOL_NAMES[tx.symbol]
                          ? CASH_SYMBOL_NAMES[tx.symbol]
                          : tx.symbol}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded">
                        {ASSET_TYPE_LABELS[tx.asset_type]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center">
                        {tx.side === 'BUY' ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-600">ALIŞ</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-red-600 mr-1" />
                            <span className="text-sm font-medium text-red-600">SATIŞ</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900 text-right">
                      {tx.quantity.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900 text-right">
                      {currency}{formatPrice(tx.price)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {currency}{(tx.quantity * tx.price).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </td>
                    
                    {/* Kar/Zarar Kolonları - Sadece satış işlemleri için */}
                    {tx.side === 'SELL' && profitLoss ? (
                      <>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600 text-right">
                          {currency}{formatPrice(profitLoss.avg_cost_price || 0)}
                        </td>
                        <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-right ${
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
                        <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-right ${
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
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-400 text-right">-</td>
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
