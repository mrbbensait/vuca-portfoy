import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicPortfolioClient from './PublicPortfolioClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const supabase = await createClient()

  // Slug ile portföyü bul
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .select('id, name, slug, description, is_public, created_at, user_id, follower_count')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !portfolio) {
    notFound()
  }

  // Profil bilgisi (ayrı sorgu — FK yok)
  const { data: profile } = await supabase
    .from('users_public')
    .select('display_name, avatar_url, bio')
    .eq('id', portfolio.user_id)
    .single()

  // Holdings
  const { data: holdings } = await supabase
    .from('holdings')
    .select('id, symbol, asset_type, quantity, avg_price, currency, created_at')
    .eq('portfolio_id', portfolio.id)
    .order('created_at', { ascending: true })

  // Transactions (tümü - P&L hesabı için gerekli)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, symbol, asset_type, side, quantity, price, currency, fee, date, note, created_at')
    .eq('portfolio_id', portfolio.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Mevcut kullanıcı takip ediyor mu?
  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  let isOwnPortfolio = false

  if (user) {
    isOwnPortfolio = user.id === portfolio.user_id

    if (!isOwnPortfolio) {
      const { data: followRow } = await supabase
        .from('portfolio_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('portfolio_id', portfolio.id)
        .single()

      isFollowing = !!followRow
    }
  }

  const portfolioData = {
    ...portfolio,
    owner_name: profile?.display_name || 'Anonim',
    owner_avatar: profile?.avatar_url || null,
    owner_bio: profile?.bio || null,
  }

  return (
    <PublicPortfolioClient
      portfolio={portfolioData}
      holdings={holdings || []}
      transactions={transactions || []}
      followerCount={portfolio.follower_count || 0}
      isFollowing={isFollowing}
      isOwnPortfolio={isOwnPortfolio}
    />
  )
}
