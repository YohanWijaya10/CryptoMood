'use client';

import { useEffect, useState } from 'react';
import SentimentScore from './SentimentScore';
import NewsCard from './NewsCard';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface SentimentData {
  items: Array<{
    title: string;
    description: string;
    link: string;
    publishDate: string;
    guid: string;
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
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
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
    );
  }

  if (state.error && !state.data) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-neon-gradient-purple rounded-full opacity-5 animate-float blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-neon-gradient-green rounded-full opacity-5 animate-float blur-3xl" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-gradient-blue rounded-full opacity-3 animate-float blur-3xl" style={{animationDelay: '6s'}}></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-12 max-w-7xl">
        {/* Futuristic Hero Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-bitcoin-gradient rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-neon-yellow animate-pulse-slow">
                ₿
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-bitcoin-gradient rounded-2xl animate-ping opacity-20"></div>
            </div>
            <h1 className="text-6xl font-black gradient-text-neon font-space tracking-tight">
              CryptoMood
            </h1>
          </div>
          <p className="text-xl text-text-secondary font-light max-w-3xl mx-auto leading-relaxed">
            Real-time Bitcoin sentiment analysis powered by AI
          </p>
          <p className="text-neon-green font-medium mt-2">
            ⚡ Advanced crypto market intelligence • 🔮 Neural sentiment analysis
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
          <div className="glass-neon px-6 py-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse shadow-neon-green"></div>
              <span className="text-sm font-bold text-neon-green tracking-wide">NEURAL ANALYSIS ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {state.lastUpdated && (
              <div className="text-sm text-text-secondary text-center sm:text-right">
                <span className="block text-text-muted">Last updated</span>
                <span className="font-medium text-text-primary">{formatLastUpdated(state.lastUpdated)}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={state.loading}
              className={`btn-neon ${state.loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

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
            <div className="crypto-card p-4 border-l-4 border-neon-yellow bg-gradient-to-r from-dark-card to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-gradient-yellow rounded-full flex items-center justify-center shadow-neon-yellow">
                  <AlertCircle className="w-5 h-5 text-dark-base" />
                </div>
                <div>
                  <p className="font-bold text-neon-yellow">Connection Warning</p>
                  <p className="text-text-secondary text-sm">{state.error} (Showing cached data)</p>
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
                <h2 className="text-3xl font-bold gradient-text mb-2">Latest Bitcoin News</h2>
                <p className="text-gray-600">AI-powered sentiment analysis on {state.data.items.length} articles</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 crypto-card text-sm">
                <div className="w-2 h-2 bg-crypto-blue rounded-full animate-pulse"></div>
                <span className="text-gray-600">Powered by</span>
                <span className="font-semibold gradient-text">{state.data.meta.availableProviders.join(', ')}</span>
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
                    sentiment={item.sentiment}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="crypto-card p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Bitcoin News Found</h3>
              <p className="text-gray-600 leading-relaxed">No recent Bitcoin-related news articles available for analysis. Please try refreshing or check back later.</p>
            </div>
          </div>
        )}

        {/* Futuristic Footer */}
        <footer className="mt-20 pt-12 animate-fade-in">
          <div className="glass-neon p-8 text-center rounded-3xl border border-neon-green/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-bitcoin-gradient rounded-2xl flex items-center justify-center shadow-neon-yellow">
                  <span className="text-white font-black text-lg">₿</span>
                </div>
                <div className="absolute inset-0 w-10 h-10 bg-bitcoin-gradient rounded-2xl animate-ping opacity-20"></div>
              </div>
              <h3 className="font-black text-2xl gradient-text-neon font-space">CryptoMood</h3>
            </div>
            <p className="text-text-primary mb-2 font-medium">Neural Bitcoin sentiment analysis • Powered by AI</p>
            <p className="text-sm text-text-secondary">CoinDesk data feeds • Built for the crypto community</p>
            
            {/* Neon Tech Stack Pills */}
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <span className="px-4 py-2 bg-dark-card border border-neon-purple/30 text-neon-purple rounded-full text-xs font-bold uppercase tracking-wider shadow-neon-purple">Next.js 14</span>
              <span className="px-4 py-2 bg-dark-card border border-neon-blue/30 text-neon-blue rounded-full text-xs font-bold uppercase tracking-wider shadow-neon-blue">DeepSeek AI</span>
              <span className="px-4 py-2 bg-dark-card border border-neon-green/30 text-neon-green rounded-full text-xs font-bold uppercase tracking-wider shadow-neon-green">TypeScript</span>
              <span className="px-4 py-2 bg-dark-card border border-neon-yellow/30 text-neon-yellow rounded-full text-xs font-bold uppercase tracking-wider shadow-neon-yellow">Tailwind</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}