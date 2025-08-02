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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Bitcoin Sentiment</h2>
          <p className="text-gray-600">Fetching latest news and analyzing market sentiment...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CryptoMood</h1>
            <p className="text-gray-600">Bitcoin News Sentiment Analyzer</p>
          </div>
          <div className="text-right">
            <button
              onClick={handleRefresh}
              disabled={state.loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {state.lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {formatLastUpdated(state.lastUpdated)}
              </p>
            )}
          </div>
        </div>

        {/* Overall Sentiment */}
        {state.data && (
          <div className="mb-8">
            <SentimentScore
              score={state.data.overallSentiment.averageScore}
              sentiment={state.data.overallSentiment.sentiment}
              totalItems={state.data.overallSentiment.totalItems}
            />
          </div>
        )}

        {/* Error Banner */}
        {state.error && state.data && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 text-sm">
                Warning: {state.error} (Showing cached data)
              </span>
            </div>
          </div>
        )}

        {/* News Grid */}
        {state.data && state.data.items.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Bitcoin News</h2>
              <div className="text-sm text-gray-500">
                AI Provider: {state.data.meta.availableProviders.join(', ')}
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {state.data.items.map((item) => (
                <NewsCard
                  key={item.guid}
                  title={item.title}
                  description={item.description}
                  link={item.link}
                  publishDate={item.publishDate}
                  sentiment={item.sentiment}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bitcoin News Found</h3>
            <p className="text-gray-600">No recent Bitcoin-related news articles available for analysis.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>CryptoMood MVP - Bitcoin sentiment analysis powered by AI</p>
          <p className="mt-1">Data sourced from CoinDesk RSS feeds</p>
        </footer>
      </div>
    </div>
  );
}