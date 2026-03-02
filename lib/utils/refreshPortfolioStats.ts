/**
 * Background portfolio stats refresh utility
 * 
 * Triggers stats cache update without blocking UI
 * Used when transactions are added or portfolio changes
 */

export async function refreshPortfolioStats(portfolioId: string): Promise<void> {
  try {
    const response = await fetch('/api/portfolio-stats/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_id: portfolioId }),
    })

    if (!response.ok) {
      console.warn(`Stats refresh failed for portfolio ${portfolioId}:`, response.status)
    }
  } catch (err) {
    console.error('Background stats refresh error:', err)
  }
}
