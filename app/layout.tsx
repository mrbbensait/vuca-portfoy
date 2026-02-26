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
  title: "Portföy Röntgeni - Yatırım Portföy Yönetimi",
  description: "BIST hisse, ABD hisse, altın, gümüş, döviz ve kripto — tüm varlıklarınızı tek portföyde yönetin",
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
