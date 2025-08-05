'use client';

import { useEffect, useState } from 'react';
import SentimentScore from './SentimentScore';
import NewsCard from './NewsCard';
import NavBar from './NavBar';
import Footer from './Footer';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/app/lib/language-context';
import { useTranslations } from '@/app/lib/translations';

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
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/api/sentiment?lang=${language}`, {
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
  }, [language]); // Re-fetch when language changes

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
          <div className="text-center bg-neutral-900 rounded-xl p-8 max-w-md shadow-lg shadow-orange-500/10 border border-white/10">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-[#F28D33] rounded-xl flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[#F28D33] mb-3">{t.analyzingBitcoinSentiment}</h2>
            <p className="text-gray-400 leading-relaxed">{t.fetchingLatestNews}</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-[#F28D33] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
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
          <div className="text-center max-w-md bg-neutral-900 rounded-xl p-8 shadow-lg shadow-red-500/10 border border-red-500/20">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">{t.unableToLoadData}</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">{state.error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F28D33] hover:bg-[#F28D33]/90 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              {t.tryAgain}
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
                <h2 className="text-3xl font-bold text-[#E0E0E0] mb-2">{t.latestBitcoinNews}</h2>
                <p className="text-[#A5A5A5]">{t.aiPoweredSentimentAnalysis} {state.data.items.length} {t.articles}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/80 backdrop-blur border border-[#2E2E2E] rounded-lg text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[#A5A5A5]">{t.analyzedBy}</span>
                <span className="font-semibold text-[#E0E0E0]">CryptoTune AI</span>
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
              <h3 className="text-xl font-bold text-[#E0E0E0] mb-2">{t.noBitcoinNewsFound}</h3>
              <p className="text-[#A5A5A5] leading-relaxed">{t.noRecentArticles}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}