'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  Briefcase, TrendingUp, TrendingDown, Calendar,
  ArrowUpDown, ChevronUp, ChevronDown, ReceiptText, Eye, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import { usePrices } from '@/lib/hooks/usePrices'

// Public view için kısmi tipler (Supabase select ile eşleşir)
export interface PublicHolding {
  id: string
  symbol: string
  asset_type: string
  quantity: number
  avg_price: number
  created_at: string
}

export interface PublicTransaction {
  id: string
  symbol: string
  asset_type: string
  side: string
  quantity: number
  price: number
  fee: number | null
  date: string
  created_at: string
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  TR_STOCK: 'TR Hisse',
  US_STOCK: 'ABD Hisse',
  CRYPTO: 'Kripto',
  CASH: 'Nakit',
}

const ASSET_GROUP_ORDER = [
  { key: 'TR_STOCK', label: 'BIST Hisseleri', icon: '🇹🇷', color: 'text-red-700 bg-red-50 border-red-200' },
  { key: 'US_STOCK', label: 'ABD Hisseleri', icon: '🇺🇸', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'CRYPTO', label: 'Kripto Paralar', icon: '₿', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'CASH', label: 'Nakit & Emtia', icon: '💰', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
]

const ASSET_TYPE_COLORS: Record<string, string> = {
  TR_STOCK: 'bg-red-50 text-red-700 border-red-200',
  US_STOCK: 'bg-blue-50 text-blue-700 border-blue-200',
  CRYPTO: 'bg-amber-50 text-amber-700 border-amber-200',
  CASH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

interface PortfolioData {
  id: string
  user_id?: string
  name: string
  slug: string | null
  description: string | null
  created_at: string
  owner_name: string
  owner_avatar: string | null
  owner_bio: string | null
}

interface PublicPortfolioViewProps {
  portfolio: PortfolioData
  holdings: PublicHolding[]
  transactions: PublicTransaction[]
}

type HoldingSortField = 'symbol' | 'avg_price' | 'current_price' | 'pnl_pct' | 'created_at'
type TxSortField = 'date' | 'symbol' | 'side' | 'price' | 'pnl_pct'
type SortDir = 'asc' | 'desc'

export default function PublicPortfolioView({
  portfolio,
  holdings,
  transactions,
}: PublicPortfolioViewProps) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings')
  const [hSortField, setHSortField] = useState<HoldingSortField>('symbol')
  const [hSortDir, setHSortDir] = useState<SortDir>('asc')
  const [tSortField, setTSortField] = useState<TxSortField>('date')
  const [tSortDir, setTSortDir] = useState<SortDir>('desc')

  // Güncel fiyatları çek
  const { prices, loading: pricesLoading } = usePrices(holdings)

  const getCurrentPrice = (symbol: string) => prices[symbol]?.price ?? null
  const getPnlPct = (h: PublicHolding) => {
    const cp = getCurrentPrice(h.symbol)
    if (cp === null || h.avg_price === 0) return null
    return ((cp - h.avg_price) / h.avg_price) * 100
  }

  // Holdings sıralama (grup içi)
  const sortWithinGroup = (items: PublicHolding[]) => {
    return [...items].sort((a, b) => {
      let cmp = 0
      switch (hSortField) {
        case 'symbol': cmp = a.symbol.localeCompare(b.symbol); break
        case 'avg_price': cmp = a.avg_price - b.avg_price; break
        case 'current_price': cmp = (getCurrentPrice(a.symbol) ?? 0) - (getCurrentPrice(b.symbol) ?? 0); break
        case 'pnl_pct': cmp = (getPnlPct(a) ?? 0) - (getPnlPct(b) ?? 0); break
        case 'created_at': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
      }
      return hSortDir === 'asc' ? cmp : -cmp
    })
  }

  // Gruplandırılmış holdings
  const groupedHoldings = ASSET_GROUP_ORDER
    .map(group => ({
      ...group,
      items: sortWithinGroup(holdings.filter(h => h.asset_type === group.key)),
    }))
    .filter(group => group.items.length > 0)

  // İşlem K/Z hesaplama
  const getTxPnlPct = (tx: PublicTransaction) => {
    const cp = getCurrentPrice(tx.symbol)
    if (cp === null || tx.price === 0) return null
    return ((cp - tx.price) / tx.price) * 100
  }

  // Transactions sıralama
  const sortedTransactions = [...transactions].sort((a, b) => {
    let cmp = 0
    switch (tSortField) {
      case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break
      case 'symbol': cmp = a.symbol.localeCompare(b.symbol); break
      case 'side': cmp = a.side.localeCompare(b.side); break
      case 'price': cmp = a.price - b.price; break
      case 'pnl_pct': cmp = (getTxPnlPct(a) ?? 0) - (getTxPnlPct(b) ?? 0); break
    }
    return tSortDir === 'asc' ? cmp : -cmp
  })

  const handleHSort = (field: HoldingSortField) => {
    if (hSortField === field) setHSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setHSortField(field); setHSortDir('asc') }
  }

  const handleTSort = (field: TxSortField) => {
    if (tSortField === field) setTSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setTSortField(field); setTSortDir('desc') }
  }

  const HSortIcon = ({ field }: { field: HoldingSortField }) => {
    if (hSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />
    return hSortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
  }

  const TSortIcon = ({ field }: { field: TxSortField }) => {
    if (tSortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />
    return tSortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
  }

  // Varlık dağılımı
  const assetDistribution = holdings.reduce((acc, h) => {
    acc[h.asset_type] = (acc[h.asset_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const createdDate = new Date(portfolio.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Portföy Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Public Portföy</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
              {portfolio.user_id ? (
                <Link href={`/profile/${portfolio.user_id}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors mt-1 inline-block">
                  {portfolio.owner_name}
                </Link>
              ) : (
                <p className="text-sm text-gray-500 mt-1">{portfolio.owner_name}</p>
              )}
              {portfolio.description && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-2xl">
                  {portfolio.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-semibold text-gray-700">{holdings.length}</span>
                  <span>varlık</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta bilgiler */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {createdDate}
            </div>
            {Object.entries(assetDistribution).map(([type, count]) => (
              <span key={type} className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${ASSET_TYPE_COLORS[type]}`}>
                {ASSET_TYPE_LABELS[type]} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'holdings'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Varlıklar ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ReceiptText className="w-4 h-4 inline mr-2" />
            İşlem Geçmişi ({transactions.length})
          </button>
        </div>

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <div className="overflow-x-auto">
            {holdings.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Henüz varlık bulunmuyor</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {([
                      { field: 'symbol' as HoldingSortField, label: 'Varlık', align: 'left' },
                      { field: 'avg_price' as HoldingSortField, label: 'Ort. Maliyet', align: 'right' },
                      { field: 'current_price' as HoldingSortField, label: 'Güncel Fiyat', align: 'right' },
                      { field: 'pnl_pct' as HoldingSortField, label: '% K/Z', align: 'right' },
                      { field: 'created_at' as HoldingSortField, label: 'Eklenme Tarihi', align: 'right' },
                    ]).map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleHSort(col.field)}
                        className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                          {col.label}
                          <HSortIcon field={col.field} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedHoldings.map((group, gi) => (
                    <React.Fragment key={group.key}>
                      {/* Grup başlık satırı */}
                      <tr className={`${gi > 0 ? 'border-t-2 border-gray-200' : ''}`}>
                        <td colSpan={5} className="px-4 py-2 bg-gray-50/80">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{group.icon}</span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${group.color.split(' ')[0]}`}>
                              {group.label}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">({group.items.length})</span>
                          </div>
                        </td>
                      </tr>
                      {/* Grup içi varlıklar */}
                      {group.items.map(h => {
                        const currency = (h.asset_type === 'TR_STOCK' || h.asset_type === 'CASH') ? '₺' : '$'
                        const currentPrice = getCurrentPrice(h.symbol)
                        const pnlPct = getPnlPct(h)
                        return (
                          <tr key={h.id} className="hover:bg-gray-50 transition-colors border-t border-gray-100">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{h.symbol}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-right font-mono whitespace-nowrap">
                              {currency}{formatPrice(h.avg_price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono whitespace-nowrap">
                              {pricesLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 ml-auto" />
                              ) : currentPrice !== null ? (
                                <span className="text-gray-800">{currency}{formatPrice(currentPrice)}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold whitespace-nowrap">
                              {pricesLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 ml-auto" />
                              ) : pnlPct !== null ? (
                                <span className={pnlPct >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                              {format(new Date(h.created_at), 'dd MMM yyyy', { locale: tr })}
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <ReceiptText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Henüz işlem bulunmuyor</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {([
                      { field: 'date' as TxSortField, label: 'Tarih', align: 'left' },
                      { field: 'symbol' as TxSortField, label: 'Varlık', align: 'left' },
                      { field: 'side' as TxSortField, label: 'İşlem', align: 'left' },
                      { field: 'price' as TxSortField, label: 'Fiyat', align: 'right' },
                      { field: 'pnl_pct' as TxSortField, label: '% K/Z', align: 'right' },
                    ]).map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleTSort(col.field)}
                        className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                          {col.label}
                          <TSortIcon field={col.field} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedTransactions.map(tx => {
                    const currency = (tx.asset_type === 'TR_STOCK' || tx.asset_type === 'CASH') ? '₺' : '$'
                    const txPnlPct = getTxPnlPct(tx)
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {format(new Date(tx.date), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{tx.symbol}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border ${ASSET_TYPE_COLORS[tx.asset_type]}`}>
                              {ASSET_TYPE_LABELS[tx.asset_type]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {tx.side === 'BUY' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              <TrendingUp className="w-3 h-3" /> ALIŞ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              <TrendingDown className="w-3 h-3" /> SATIŞ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-mono whitespace-nowrap">
                          {currency}{formatPrice(tx.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold whitespace-nowrap">
                          {pricesLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 ml-auto" />
                          ) : txPnlPct !== null ? (
                            <span className={txPnlPct >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {txPnlPct >= 0 ? '+' : ''}{txPnlPct.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {transactions.length >= 50 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">Son 50 işlem gösteriliyor</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
