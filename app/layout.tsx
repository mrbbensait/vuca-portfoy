import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivacyProvider } from "@/lib/contexts/PrivacyContext";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://xportfoy.com'),
  title: {
    default: "XPortfoy - Dijital Portföy Röntgeni",
    template: "%s | XPortfoy"
  },
  description: "BIST hisse, ABD hisse, altın, gümüş, döviz ve kripto — tüm varlıklarınızı tek portföyde yönetin. Türkiye'nin ilk sosyal portföy yönetim platformu.",
  keywords: ["portföy yönetimi", "hisse senedi takibi", "kripto portföy", "BIST", "borsa", "yatırım", "portföy analizi", "XPortfoy", "fintech", "sosyal portföy"],
  authors: [{ name: "VUCA Borsa LTD" }],
  creator: "VUCA Borsa LTD",
  publisher: "VUCA Borsa LTD",
  applicationName: "XPortfoy",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://xportfoy.com',
    siteName: 'XPortfoy',
    title: 'XPortfoy - Dijital Portföy Röntgeni',
    description: 'BIST hisse, ABD hisse, altın, gümüş, döviz ve kripto — tüm varlıklarınızı tek portföyde yönetin',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XPortfoy - Dijital Portföy Röntgeni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPortfoy - Dijital Portföy Röntgeni',
    description: 'BIST hisse, ABD hisse, altın, gümüş, döviz ve kripto — tüm varlıklarınızı tek portföyde yönetin',
    images: ['/og-image.png'],
    creator: '@xportfoy',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://xportfoy.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <PrivacyProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <CookieBanner />
        </PrivacyProvider>
      </body>
    </html>
  );
}
