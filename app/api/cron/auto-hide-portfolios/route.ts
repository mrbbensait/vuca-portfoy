import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Vercel Cron güvenlik kontrolü
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Public portföyleri getir
  const { data: publicPortfolios, error: fetchError } = await admin
    .from('portfolios')
    .select('id, name, user_id')
    .eq('is_public', true)

  if (fetchError) {
    console.error('auto-hide: portföy listesi alınamadı', fetchError)
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  if (!publicPortfolios || publicPortfolios.length === 0) {
    return Response.json({ hidden: 0, message: 'Public portföy yok' })
  }

  const hiddenPortfolios: string[] = []

  for (const portfolio of publicPortfolios) {
    // Son 14 günde işlem var mı?
    const { count: txCount } = await admin
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('portfolio_id', portfolio.id)
      .gte('created_at', cutoff)

    // Son 14 günde duyuru var mı?
    const { count: annCount } = await admin
      .from('portfolio_announcements')
      .select('id', { count: 'exact', head: true })
      .eq('portfolio_id', portfolio.id)
      .gte('created_at', cutoff)

    const hasActivity = (txCount ?? 0) > 0 || (annCount ?? 0) > 0
    if (hasActivity) continue

    // Gizliye al
    await admin
      .from('portfolios')
      .update({
        is_public: false,
        slug: null,
        auto_hidden_at: new Date().toISOString(),
        auto_hidden_reason: 'inactivity_14_days',
      })
      .eq('id', portfolio.id)

    // Kullanıcıya bildirim ekle
    await admin.from('user_notifications').insert({
      user_id: portfolio.user_id,
      type: 'portfolio_auto_hidden',
      title: 'Portföyünüz Otomatik Gizlendi',
      message: `"${portfolio.name}" portföyünüz 14 gündür işlem veya duyuru yapılmadığı için otomatik olarak gizliye alındı. Tekrar paylaşmak için portföy görünürlüğünü açabilirsiniz.`,
      metadata: { portfolio_id: portfolio.id, portfolio_name: portfolio.name },
    })

    hiddenPortfolios.push(portfolio.id)
    console.log(`auto-hide: ${portfolio.name} (${portfolio.id}) gizliye alındı`)
  }

  return Response.json({
    hidden: hiddenPortfolios.length,
    portfolioIds: hiddenPortfolios,
  })
}
