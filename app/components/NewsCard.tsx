'use client';

import { ExternalLink, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

interface NewsCardProps {
  title: string;
  description: string;
  link: string;
  publishDate: string;
  imageUrl?: string;
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

export default function NewsCard({ title, description, link, publishDate, imageUrl, sentiment }: NewsCardProps) {
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
      case 'POSITIVE': return 'bg-neon-green/10 border-neon-green/20';
      case 'NEGATIVE': return 'bg-neon-red/10 border-neon-red/20';
      default: return 'bg-neon-yellow/10 border-neon-yellow/20';
    }
  };

  const getSentimentAccentClass = () => {
    switch (sentiment.sentiment) {
      case 'POSITIVE': return 'bg-neon-green shadow-neon-green';
      case 'NEGATIVE': return 'bg-neon-red shadow-neon-red';
      default: return 'bg-neon-yellow shadow-neon-yellow';
    }
  };

  const getSentimentTextClass = () => {
    switch (sentiment.sentiment) {
      case 'POSITIVE': return 'text-neon-green';
      case 'NEGATIVE': return 'text-neon-red';
      default: return 'text-neon-yellow';
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
      case 'HIGH': return 'text-red-400 bg-red-900/20 border border-red-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-900/20 border border-green-500/30';
      default: return 'text-gray-400 bg-gray-800/40 border border-gray-600/30';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400 bg-red-900/20 border border-red-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-900/20 border border-green-500/30';
      default: return 'text-gray-400 bg-gray-800/40 border border-gray-600/30';
    }
  };

  return (
    <div className="crypto-card p-6 relative overflow-hidden">
      {/* Vertical Neon Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSentimentAccentClass()} rounded-r-full`}></div>
      
      {/* Sentiment Header */}
      <div className="flex items-center justify-between mb-4 pl-2">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${getSentimentColorClass()} flex items-center justify-center border-2 ${sentiment.sentiment === 'POSITIVE' ? 'border-neon-green/30' : sentiment.sentiment === 'NEGATIVE' ? 'border-neon-red/30' : 'border-neon-yellow/30'}`}>
            <span className="text-xl">{getSentimentEmoji()}</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`font-black text-sm uppercase tracking-wider ${getSentimentTextClass()}`}>
                {sentiment.sentiment}
              </span>
              <div className="w-1.5 h-1.5 bg-text-muted rounded-full"></div>
              <span className="text-text-primary text-sm font-bold">
                {sentiment.score}/100
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
              aria-label={isExpanded ? 'Hide analysis' : 'Show analysis'}
            >
              <Info className="w-3 h-3" />
              <span>{isExpanded ? 'Hide Analysis' : 'Show Analysis'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{formatDate(publishDate)}</span>
        </div>
      </div>

      {/* News Content */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-text-primary mb-3 line-clamp-2 leading-tight pl-2 font-space">
            {title}
          </h3>
          
          <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed pl-2">
            {description}
          </p>
        </div>
        
        {/* News Image */}
        {imageUrl && (
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-xl border border-dark-border/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Expandable AI Analysis */}
      {isExpanded && (
        <div className="mb-4 p-4 bg-[#1A1A1A] rounded-xl border border-white/8 animate-slide-up backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-lg flex items-center justify-center border border-purple-500/30">
              <Info className="w-4 h-4 text-purple-300" />
            </div>
            <h4 className="font-semibold text-gray-200">AI Analysis</h4>
          </div>
          
          {/* Main Analysis */}
          {sentiment.reasoning && (
            <div className="mb-4 p-3 bg-gray-900/40 rounded-lg border border-white/10">
              <p className="text-sm text-gray-300 leading-relaxed">
                {sentiment.reasoning}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-800/40 rounded-lg border border-white/10">
              <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Confidence</div>
              <div className="font-bold text-lg text-blue-400">
                {Math.round(sentiment.confidence * 100)}%
              </div>
            </div>
              
            {sentiment.marketImpact && (
              <div className="text-center p-2 bg-gray-800/40 rounded-lg border border-white/10">
                <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Market Impact</div>
                <div className={`text-xs px-2 py-1 rounded-full font-bold ${getImpactColor(sentiment.marketImpact)}`}>
                  {sentiment.marketImpact}
                </div>
              </div>
            )}
            
            {sentiment.riskLevel && (
              <div className="text-center p-2 bg-gray-800/40 rounded-lg border border-white/10">
                <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Risk Level</div>
                <div className={`text-xs px-2 py-1 rounded-full font-bold ${getRiskColor(sentiment.riskLevel)}`}>
                  {sentiment.riskLevel}
                </div>
              </div>
            )}
          </div>

          {/* Key Factors */}
          {sentiment.keyFactors && sentiment.keyFactors.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Key Factors:</div>
              <div className="flex flex-wrap gap-2">
                {sentiment.keyFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 bg-gray-800/60 border border-gray-600/40 rounded-full text-gray-300 font-medium backdrop-blur-sm"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Provider Credit */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400">
              Analyzed by <span className="font-semibold text-blue-400">{sentiment.provider}</span>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-sm"></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {!isExpanded && (
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              <span>AI by <span className="font-medium text-gray-600">{sentiment.provider}</span></span>
            </span>
          )}
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          Read Article
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <div className={`w-full h-full rounded-full ${
          sentiment.sentiment === 'POSITIVE' ? 'bg-crypto-green' 
          : sentiment.sentiment === 'NEGATIVE' ? 'bg-crypto-red' 
          : 'bg-crypto-yellow'
        } transform translate-x-10 -translate-y-10`}></div>
      </div>
    </div>
  );
}