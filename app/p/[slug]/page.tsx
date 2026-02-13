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
    .select(`
      id, name, slug, description, follower_count, is_public, created_at, user_id,
      users_public!portfolios_user_id_fkey(display_name, avatar_url, bio)
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !portfolio) {
    notFound()
  }

  // Holdings
  const { data: holdings } = await supabase
    .from('holdings')
    .select('id, symbol, asset_type, quantity, avg_price, created_at')
    .eq('portfolio_id', portfolio.id)
    .order('created_at', { ascending: true })

  // Transactions (son 50)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, symbol, asset_type, side, quantity, price, fee, date, created_at')
    .eq('portfolio_id', portfolio.id)
    .order('date', { ascending: false })
    .limit(50)

  // Profil bilgisi
  const profile = Array.isArray(portfolio.users_public)
    ? portfolio.users_public[0]
    : portfolio.users_public

  // Mevcut kullanıcı kontrol
  const { data: { user } } = await supabase.auth.getUser()
  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from('portfolio_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('portfolio_id', portfolio.id)
      .single()
    isFollowing = !!follow
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
      initialIsFollowing={isFollowing}
      isLoggedIn={!!user}
      portfolioId={portfolio.id}
    />
  )
}
