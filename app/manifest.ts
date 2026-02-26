import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XPortfoy - Dijital Portföy Röntgeni',
    short_name: 'XPortfoy',
    description: 'BIST hisse, ABD hisse, altın, gümüş, döviz ve kripto — tüm varlıklarınızı tek portföyde yönetin',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['finance', 'productivity', 'business'],
    lang: 'tr',
  }
}
