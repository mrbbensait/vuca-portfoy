import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivacyProvider } from "@/lib/contexts/PrivacyContext";
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
  description: "TR hisse, ABD hisse ve kripto varlıklarınızı tek yerden yönetin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivacyProvider>
          {children}
        </PrivacyProvider>
      </body>
    </html>
  );
}
