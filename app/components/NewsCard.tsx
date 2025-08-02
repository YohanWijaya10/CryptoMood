'use client';

import { ExternalLink, Clock } from 'lucide-react';

interface NewsCardProps {
  title: string;
  description: string;
  link: string;
  publishDate: string;
  sentiment: {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
    confidence: number;
    reasoning?: string;
    provider: string;
  };
}

export default function NewsCard({ title, description, link, publishDate, sentiment }: NewsCardProps) {
  const getSentimentEmoji = () => {
    switch (sentiment.sentiment) {
      case 'POSITIVE': return '🟢';
      case 'NEGATIVE': return '🔴';
      default: return '🟡';
    }
  };

  const getSentimentColorClass = () => {
    switch (sentiment.sentiment) {
      case 'POSITIVE': return 'border-l-crypto-green bg-crypto-green/5';
      case 'NEGATIVE': return 'border-l-crypto-red bg-crypto-red/5';
      default: return 'border-l-crypto-yellow bg-crypto-yellow/5';
    }
  };

  const getSentimentTextClass = () => {
    switch (sentiment.sentiment) {
      case 'POSITIVE': return 'text-crypto-green';
      case 'NEGATIVE': return 'text-crypto-red';
      default: return 'text-crypto-yellow';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${getSentimentColorClass()}`}>
      {/* Sentiment Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSentimentEmoji()}</span>
          <span className={`font-semibold text-sm uppercase ${getSentimentTextClass()}`}>
            {sentiment.sentiment}
          </span>
          <span className="text-gray-500 text-sm">
            Score: {sentiment.score}/100
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          <span>{formatDate(publishDate)}</span>
        </div>
      </div>

      {/* News Content */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
        {description}
      </p>

      {/* Sentiment Reasoning */}
      {sentiment.reasoning && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <strong>AI Analysis:</strong> {sentiment.reasoning}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Analyzed by {sentiment.provider}
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          Read more
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}