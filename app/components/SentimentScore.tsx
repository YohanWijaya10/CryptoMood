'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentScoreProps {
  score: number;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  totalItems?: number;
}

export default function SentimentScore({ score, sentiment, totalItems }: SentimentScoreProps) {
  const getColorClasses = () => {
    if (sentiment === 'POSITIVE') return 'text-crypto-green border-crypto-green bg-crypto-green/10';
    if (sentiment === 'NEGATIVE') return 'text-crypto-red border-crypto-red bg-crypto-red/10';
    return 'text-crypto-yellow border-crypto-yellow bg-crypto-yellow/10';
  };

  const getIcon = () => {
    if (sentiment === 'POSITIVE') return <TrendingUp className="w-8 h-8" />;
    if (sentiment === 'NEGATIVE') return <TrendingDown className="w-8 h-8" />;
    return <Minus className="w-8 h-8" />;
  };

  const getSentimentText = () => {
    if (sentiment === 'POSITIVE') return 'Bullish';
    if (sentiment === 'NEGATIVE') return 'Bearish';
    return 'Neutral';
  };

  const getProgressWidth = () => {
    return `${score}%`;
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getColorClasses()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h2 className="text-2xl font-bold">Bitcoin Market Sentiment</h2>
            <p className="text-sm opacity-75">
              {totalItems ? `Based on ${totalItems} news articles` : 'Live sentiment analysis'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{score}/100</div>
          <div className="text-lg font-semibold">{getSentimentText()}</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${
            sentiment === 'POSITIVE' ? 'bg-crypto-green' 
            : sentiment === 'NEGATIVE' ? 'bg-crypto-red' 
            : 'bg-crypto-yellow'
          }`}
          style={{ width: getProgressWidth() }}
        />
      </div>
      
      <div className="flex justify-between text-xs mt-2 opacity-75">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
    </div>
  );
}