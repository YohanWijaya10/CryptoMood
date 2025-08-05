import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from './lib/language-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoTune - Cryptocurrency Intelligence Platform',
  description: 'Comprehensive cryptocurrency intelligence platform with AI-powered sentiment analysis, multi-source news aggregation, and economic calendar. Track Bitcoin market sentiment and major economic events.',
  keywords: ['bitcoin', 'cryptocurrency', 'sentiment analysis', 'AI', 'market sentiment', 'crypto news', 'economic calendar', 'financial intelligence', 'market analysis', 'trading insights'],
  authors: [{ name: 'CryptoTune' }],
  openGraph: {
    title: 'CryptoTune - Cryptocurrency Intelligence Platform',
    description: 'AI-powered crypto intelligence with sentiment analysis, news aggregation, and economic calendar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoTune - Cryptocurrency Intelligence Platform',
    description: 'AI-powered crypto intelligence with sentiment analysis, news aggregation, and economic calendar',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}