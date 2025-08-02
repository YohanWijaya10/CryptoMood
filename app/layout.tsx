import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoMood - Bitcoin Sentiment Analyzer',
  description: 'Real-time Bitcoin news sentiment analysis powered by AI. Track market sentiment through news analysis.',
  keywords: ['bitcoin', 'cryptocurrency', 'sentiment analysis', 'AI', 'market sentiment', 'crypto news'],
  authors: [{ name: 'CryptoMood' }],
  openGraph: {
    title: 'CryptoMood - Bitcoin Sentiment Analyzer',
    description: 'Real-time Bitcoin news sentiment analysis powered by AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoMood - Bitcoin Sentiment Analyzer',
    description: 'Real-time Bitcoin news sentiment analysis powered by AI',
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
        {children}
      </body>
    </html>
  );
}