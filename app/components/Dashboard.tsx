'use client';

import { useEffect, useState } from 'react';
import SentimentScore from './SentimentScore';
import NewsCard from './NewsCard';
import NavBar from './NavBar';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface SentimentData {
  items: Array<{
    title: string;
    description: string;
    link: string;
    publishDate: string;
    guid: string;
    imageUrl?: string;
    sentiment: {
      sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      score: number;
      confidence: number;
      reasoning?: string;
      provider: string;
    };
  }>;
  overallSentiment: {
    averageScore: number;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    totalItems: number;
    lastAnalyzed: string;
  };
  meta: {
    lastFetched: string;
    availableProviders: string[];
  };
}

interface DashboardState {
  data: SentimentData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/sentiment', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      
      setState({
        data: result.data,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch sentiment data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const formatLastUpdated = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  if (state.loading && !state.data) {
    return (
      <div className="min-h-screen bg-[#0B0B0B]">
        <NavBar onRefresh={handleRefresh} isAnalyzing={state.loading} lastUpdated={state.lastUpdated} />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="text-center crypto-card-glow p-8 max-w-md">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-neon-gradient-green rounded-full flex items-center justify-center animate-pulse-slow shadow-neon-green-lg">
                <Loader2 className="w-10 h-10 animate-spin text-dark-base" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-neon-green/30 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold text-neon-glow mb-3">Analyzing Bitcoin Sentiment</h2>
            <p className="text-text-secondary leading-relaxed">Fetching latest news and analyzing market sentiment with AI...</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce shadow-neon-green"></div>
              <div className="w-3 h-3 bg-neon-purple rounded-full animate-bounce shadow-neon-purple" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-neon-blue rounded-full animate-bounce shadow-neon-blue" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error && !state.data) {
    return (
      <div className="min-h-screen bg-[#0B0B0B]">
        <NavBar onRefresh={handleRefresh} isAnalyzing={state.loading} lastUpdated={state.lastUpdated} />
        <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="text-center max-w-md crypto-card p-8 border border-neon-red/20 shadow-neon-red">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-neon-gradient-red rounded-full flex items-center justify-center shadow-neon-red-lg">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-neon-red/30 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-3">Unable to Load Data</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">{state.error}</p>
            <button
              onClick={handleRefresh}
              className="btn-neon"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] relative">
      {/* NavBar */}
      <NavBar onRefresh={handleRefresh} isAnalyzing={state.loading} lastUpdated={state.lastUpdated} />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/5 rounded-full animate-float blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full animate-float blur-3xl" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-600/3 rounded-full animate-float blur-3xl" style={{animationDelay: '6s'}}></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">

        {/* Overall Sentiment */}
        {state.data && (
          <div className="mb-12 animate-slide-up">
            <SentimentScore
              score={state.data.overallSentiment.averageScore}
              sentiment={state.data.overallSentiment.sentiment}
              totalItems={state.data.overallSentiment.totalItems}
            />
          </div>
        )}

        {/* Error Banner */}
        {state.error && state.data && (
          <div className="mb-8 animate-slide-in">
            <div className="bg-[#1A1A1A]/80 backdrop-blur border border-yellow-500/30 border-l-4 border-l-yellow-500 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-bold text-yellow-400">Connection Warning</p>
                  <p className="text-[#A5A5A5] text-sm">{state.error} (Showing cached data)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Section */}
        {state.data && state.data.items.length > 0 ? (
          <div className="animate-fade-in">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#E0E0E0] mb-2">Latest Bitcoin News</h2>
                <p className="text-[#A5A5A5]">AI-powered sentiment analysis on {state.data.items.length} articles</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/80 backdrop-blur border border-[#2E2E2E] rounded-lg text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[#A5A5A5]">Powered by</span>
                <span className="font-semibold text-[#E0E0E0]">{state.data.meta.availableProviders.join(', ')}</span>
              </div>
            </div>
            
            {/* News Grid */}
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
              {state.data.items.map((item, index) => (
                <div
                  key={item.guid}
                  className="animate-slide-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <NewsCard
                    title={item.title}
                    description={item.description}
                    link={item.link}
                    publishDate={item.publishDate}
                    imageUrl={item.imageUrl}
                    sentiment={item.sentiment}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="crypto-card p-8 max-w-md mx-auto bg-[#1A1A1A]/80 backdrop-blur border border-[#2E2E2E]">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-2">No Bitcoin News Found</h3>
              <p className="text-[#A5A5A5] leading-relaxed">No recent Bitcoin-related news articles available for analysis. Please try refreshing or check back later.</p>
            </div>
          </div>
        )}

        {/* Professional Footer */}
        <footer className="mt-20 pt-12 animate-fade-in">
          <div className="bg-[#1A1A1A]/80 backdrop-blur border border-[#2E2E2E] border-t border-t-white/10 p-8 rounded-2xl">
            <div className="max-w-4xl mx-auto">
              {/* Company Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div className="mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-purple-500/20 shadow-lg">
                      <span className="text-purple-300 font-bold text-xl drop-shadow-lg">₿</span>
                    </div>
                    <h3 className="font-bold text-2xl text-[#E0E0E0] font-mono tracking-wide">CryptoTune</h3>
                  </div>
                  <p className="text-[#A5A5A5] text-sm max-w-md leading-relaxed">
                    Professional Bitcoin sentiment analysis platform providing real-time market intelligence through advanced AI technology.
                  </p>
                </div>
                
                {/* Contact Info */}
                <div className="text-sm text-[#A5A5A5]">
                  <div className="mb-2">
                    <span className="font-medium text-[#E0E0E0]">Data Sources:</span>
                    <br />CoinDesk, CoinTelegraph, Decrypt
                  </div>
                  <div>
                    <span className="font-medium text-[#E0E0E0]">AI Provider:</span>
                    <br />DeepSeek API
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  {/* Copyright */}
                  <div className="text-xs text-[#A5A5A5] order-2 md:order-1 mt-4 md:mt-0">
                    © 2024 CryptoTune. All rights reserved.
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 order-1 md:order-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-sm"></div>
                    <span className="text-xs text-[#A5A5A5] font-medium">Live Analysis Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}