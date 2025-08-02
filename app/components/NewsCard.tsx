'use client';

import { ExternalLink, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

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
    keyFactors?: string[];
    marketImpact?: 'HIGH' | 'MEDIUM' | 'LOW';
    riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export default function NewsCard({ title, description, link, publishDate, sentiment }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
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
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs transition-colors"
            aria-label={isExpanded ? 'Hide analysis' : 'Show analysis'}
          >
            <Info className="w-3 h-3" />
            <span>{isExpanded ? 'Hide' : 'Why?'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
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

      {/* Expandable AI Analysis */}
      {isExpanded && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-sm text-blue-800">AI Sentiment Analysis</h4>
          </div>
          
          {/* Main Analysis */}
          {sentiment.reasoning && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Analysis:</strong> {sentiment.reasoning}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Confidence</div>
              <div className="font-semibold text-sm text-gray-700">
                {Math.round(sentiment.confidence * 100)}%
              </div>
            </div>
            
            {sentiment.marketImpact && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Market Impact</div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(sentiment.marketImpact)}`}>
                  {sentiment.marketImpact}
                </div>
              </div>
            )}
            
            {sentiment.riskLevel && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(sentiment.riskLevel)}`}>
                  {sentiment.riskLevel}
                </div>
              </div>
            )}
          </div>

          {/* Key Factors */}
          {sentiment.keyFactors && sentiment.keyFactors.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Key Factors:</div>
              <div className="flex flex-wrap gap-1">
                {sentiment.keyFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-white border border-blue-200 rounded-full text-blue-700"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Provider Credit */}
          <div className="mt-3 pt-2 border-t border-blue-200">
            <div className="text-xs text-blue-600">
              Analysis by {sentiment.provider}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {!isExpanded && `Analyzed by ${sentiment.provider}`}
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