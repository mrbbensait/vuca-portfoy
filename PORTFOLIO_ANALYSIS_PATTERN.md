# Portfolio Analysis Pattern

## 📘 Genel Bakış

Bu doküman, **yeni analiz ve istatistik componentleri eklerken** takip edilmesi gereken pattern'i açıklar.

**Temel Prensip:** Her analiz componenti `activePortfolio`'ya göre çalışmalıdır. Portfolio değiştiğinde tüm analizler otomatik güncellenir.

---

## 🎯 Method 1: usePortfolioData Hook (ÖNERİLEN)

### Kullanım

`usePortfolioData` hook'u kullanarak otomatik portfolio-aware veri çekme:

```tsx
'use client'

import { usePortfolioData } from '@/lib/hooks/usePortfolioData'
import type { Holding } from '@/lib/types/database.types'

export default function MyAnalysis() {
  // ⚡ Otomatik olarak activePortfolio'ya göre veri çeker
  const { data: holdings, loading, error, refetch } = usePortfolioData<Holding>('holdings')

  if (loading) return <div>Yükleniyor...</div>
  if (error) return <div>Hata: {error.message}</div>

  // Analizini yap
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.avg_price, 0)

  return (
    <div>
      <h2>Toplam Değer: ₺{totalValue.toLocaleString('tr-TR')}</h2>
    </div>
  )
}
```

### Hook Options

```tsx
usePortfolioData<T>(
  table: 'holdings' | 'transactions' | 'notes' | 'alerts',
  options?: {
    enabled?: boolean          // Otomatik veri çekmeyi devre dışı bırak
    orderBy?: {
      column: string
      ascending?: boolean
    }
    limit?: number
  }
)
```

### Örnek: Sıralama ve Limit

```tsx
// Son 10 işlemi getir, tarihe göre azalan sırada
const { data: recentTransactions } = usePortfolioData<Transaction>(
  'transactions',
  { 
    orderBy: { column: 'date', ascending: false },
    limit: 10
  }
)
```

---

## 🎯 Method 2: Manuel useEffect Pattern

Hook kullanmak istemiyorsanız, manuel pattern:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/contexts/PortfolioContext'
import { createClient } from '@/lib/supabase/client'

export default function MyAnalysis() {
  const { activePortfolio } = usePortfolio()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!activePortfolio) return

      setLoading(true)
      
      const { data: result } = await supabase
        .from('your_table')
        .select('*')
        .eq('portfolio_id', activePortfolio.id)  // ⚡ Key: portfolio_id filtresi

      setData(result || [])
      setLoading(false)
    }

    fetchData()
  }, [activePortfolio?.id])  // ⚡ Key: dependency

  // Rest of your component...
}
```

---

## ✅ Checklist: Yeni Analiz Eklerken

- [ ] Component'i `'use client'` olarak işaretle
- [ ] `usePortfolio()` hook'unu kullan
- [ ] Veri çekerken `portfolio_id` filtresi ekle
- [ ] `useEffect` dependency'sine `activePortfolio?.id` ekle
- [ ] Loading state ekle
- [ ] Portfolio yoksa boş state göster

---

## 📊 Örnek Componentler

### Basit İstatistik

```tsx
'use client'

import { usePortfolioData } from '@/lib/hooks/usePortfolioData'
import type { Transaction } from '@/lib/types/database.types'

export default function TransactionStats() {
  const { data: transactions, loading } = usePortfolioData<Transaction>('transactions')

  if (loading) return <div>Yükleniyor...</div>

  const buyCount = transactions.filter(t => t.side === 'BUY').length
  const sellCount = transactions.filter(t => t.side === 'SELL').length

  return (
    <div>
      <p>Alış: {buyCount}</p>
      <p>Satış: {sellCount}</p>
    </div>
  )
}
```

### Gelişmiş Analiz (Birden Fazla Tablo)

```tsx
'use client'

import { usePortfolioData } from '@/lib/hooks/usePortfolioData'
import type { Holding, Transaction } from '@/lib/types/database.types'

export default function AdvancedAnalysis() {
  const { data: holdings, loading: holdingsLoading } = usePortfolioData<Holding>('holdings')
  const { data: transactions, loading: transactionsLoading } = usePortfolioData<Transaction>('transactions')

  if (holdingsLoading || transactionsLoading) {
    return <div>Yükleniyor...</div>
  }

  // Karmaşık analizler yapabilirsiniz
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avg_price, 0)
  const totalTransactions = transactions.length

  return (
    <div>
      <p>Toplam Yatırım: ₺{totalInvested.toLocaleString('tr-TR')}</p>
      <p>İşlem Sayısı: {totalTransactions}</p>
    </div>
  )
}
```

---

## 🚫 YAPMAYIN

### ❌ user_id'ye göre filtreleme

```tsx
// YANLIŞ - Portfolio'ya özgü değil
const { data } = await supabase
  .from('holdings')
  .select('*')
  .eq('user_id', userId)  // ❌ Tüm portfolyoları getirir
```

### ❌ Dependency'de activePortfolio.id unutma

```tsx
// YANLIŞ - Portfolio değişince güncellenmez
useEffect(() => {
  fetchData()
}, [])  // ❌ Dependency eksik
```

---

## ✅ YAPIN

### ✅ portfolio_id'ye göre filtreleme

```tsx
// DOĞRU - Sadece aktif portfolio
const { data } = await supabase
  .from('holdings')
  .select('*')
  .eq('portfolio_id', activePortfolio.id)  // ✅ Aktif portfolio
```

### ✅ Doğru dependency

```tsx
// DOĞRU - Portfolio değişince güncellenir
useEffect(() => {
  fetchData()
}, [activePortfolio?.id])  // ✅ Doğru dependency
```

---

## 🔄 Data Flow

```
User Selects Portfolio
    ↓
PortfolioContext.activePortfolio değişir
    ↓
useEffect tetiklenir (dependency: activePortfolio.id)
    ↓
Yeni veriler çekilir (portfolio_id filtresiyle)
    ↓
Component otomatik güncellenir
```

---

## 📚 Referanslar

- **Custom Hook:** `/lib/hooks/usePortfolioData.ts`
- **Context:** `/lib/contexts/PortfolioContext.tsx`
- **Örnek Component:** `/components/PortfolioStatistics.tsx`
- **Mevcut Kullanımlar:** 
  - `/components/Dashboard.tsx`
  - `/components/HoldingsList.tsx`
  - `/components/TransactionsList.tsx`
  - `/components/NotesList.tsx`

---

## 💡 Pro Tips

1. **Multiple Tablodan Veri Çekmek:**
   ```tsx
   const { data: holdings } = usePortfolioData<Holding>('holdings')
   const { data: transactions } = usePortfolioData<Transaction>('transactions')
   ```

2. **Manuel Refetch:**
   ```tsx
   const { data, refetch } = usePortfolioData('holdings')
   
   // İşlem sonrası yeniden çek
   await addTransaction()
   await refetch()
   ```

3. **Conditional Fetching:**
   ```tsx
   const { data } = usePortfolioData('holdings', { enabled: someCondition })
   ```

4. **Portfolio Bilgilerine Erişim:**
   ```tsx
   const { portfolioId, portfolioName } = usePortfolioData('holdings')
   console.log(`Aktif portfolio: ${portfolioName}`)
   ```

---

## 🎨 UI Pattern

Her analiz componenti için önerilen yapı:

```tsx
export default function MyAnalysis() {
  const { data, loading, error } = usePortfolioData(...)

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6">
        <p className="text-red-600">Hata: {error.message}</p>
      </div>
    )
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <p>Bu portfolyoda veri bulunmuyor.</p>
      </div>
    )
  }

  // Normal State
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Your analysis UI */}
    </div>
  )
}
```
