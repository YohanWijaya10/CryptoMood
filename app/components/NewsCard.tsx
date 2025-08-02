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
      case 'HIGH': return 'text-neon-red bg-neon-red/10 border border-neon-red/20';
      case 'MEDIUM': return 'text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/20';
      case 'LOW': return 'text-neon-green bg-neon-green/10 border border-neon-green/20';
      default: return 'text-text-secondary bg-dark-card border border-dark-border';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'HIGH': return 'text-neon-red bg-neon-red/10 border border-neon-red/20';
      case 'MEDIUM': return 'text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/20';
      case 'LOW': return 'text-neon-green bg-neon-green/10 border border-neon-green/20';
      default: return 'text-text-secondary bg-dark-card border border-dark-border';
    }
  };

  return (
    <div className="crypto-card p-6 relative overflow-hidden group">
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
              className="flex items-center gap-2 text-neon-purple hover:text-neon-green text-xs font-bold transition-colors group-hover:text-neon-green"
              aria-label={isExpanded ? 'Hide analysis' : 'Show analysis'}
            >
              <Info className="w-3 h-3" />
              <span>{isExpanded ? 'Hide Neural Analysis' : 'Show AI Breakdown'}</span>
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
      <h3 className="font-bold text-xl text-text-primary mb-3 line-clamp-2 leading-tight group-hover:text-neon-green transition-colors pl-2 font-space">
        {title}
      </h3>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed pl-2">
        {description}
      </p>

      {/* Expandable AI Analysis */}
      {isExpanded && (
        <div className="mb-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 animate-slide-up relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-crypto-blue rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-crypto-purple rounded-full translate-y-8 -translate-x-8"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-crypto-gradient rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-gray-800">AI Analysis Breakdown</h4>
            </div>
          
            {/* Main Analysis */}
            {sentiment.reasoning && (
              <div className="mb-4 p-3 bg-white/60 rounded-lg border border-white/40">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {sentiment.reasoning}
                </p>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-white/40 rounded-lg">
                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Confidence</div>
                <div className="font-black text-lg gradient-text">
                  {Math.round(sentiment.confidence * 100)}%
                </div>
              </div>
              
              {sentiment.marketImpact && (
                <div className="text-center p-2 bg-white/40 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Market Impact</div>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${getImpactColor(sentiment.marketImpact)}`}>
                    {sentiment.marketImpact}
                  </div>
                </div>
              )}
              
              {sentiment.riskLevel && (
                <div className="text-center p-2 bg-white/40 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Risk Level</div>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${getRiskColor(sentiment.riskLevel)}`}>
                    {sentiment.riskLevel}
                  </div>
                </div>
              )}
            </div>

            {/* Key Factors */}
            {sentiment.keyFactors && sentiment.keyFactors.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Key Factors:</div>
                <div className="flex flex-wrap gap-2">
                  {sentiment.keyFactors.map((factor, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-white/80 border border-slate-200 rounded-full text-gray-700 font-medium shadow-sm"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Credit */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-gray-500">
                Analyzed by <span className="font-semibold gradient-text">{sentiment.provider}</span>
              </div>
              <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          {!isExpanded && (
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-crypto-blue rounded-full"></div>
              <span>AI by <span className="font-medium text-gray-600">{sentiment.provider}</span></span>
            </span>
          )}
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-crypto text-sm py-2 px-4 hover:shadow-blue-glow"
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