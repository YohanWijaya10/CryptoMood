'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Search, AlertCircle } from 'lucide-react';
import NewsCard from '@/app/components/NewsCard';
import Pagination from '@/app/components/Pagination';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import { NewsItem, NewsCategory } from '@/app/lib/news-parser';

interface NewsResponse {
  success: boolean;
  data: {
    items: NewsItem[];
    lastFetched: string;
    totalItems: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  categories: Array<{
    value: string;
    label: string;
  }>;
  timestamp: string;
  error?: string;
  message?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'finance', label: 'Finance' },
    { value: 'market', label: 'Market' },
    { value: 'blockchain', label: 'Blockchain' }
  ];

  const fetchNews = async (category: NewsCategory = 'all', page: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category,
        page: page.toString(),
        limit: '12'
      });

      if (refresh) {
        params.append('_t', Date.now().toString());
      }

      const response = await fetch(`/api/news?${params}`);
      const data: NewsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setNews(data.data.items);
        setPagination(data.data.pagination);
        setLastFetched(data.data.lastFetched);
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (category: NewsCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchNews(selectedCategory, currentPage, true);
  };

  const filteredNews = news.filter(item =>
    searchTerm === '' || 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* NavBar */}
      <NavBar onRefresh={handleRefresh} isAnalyzing={loading} lastUpdated={lastFetched} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Latest <span className="text-orange-400">News</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Stay updated with the latest market, finance, and cryptocurrency news
            </p>
            {lastFetched && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {formatLastUpdated(lastFetched)}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 lg:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value as NewsCategory)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all duration-200"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} className="bg-[#1A1A1A] text-white">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Failed to load news</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-800"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <>
            {filteredNews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {filteredNews.map((item) => (
                    <NewsCard key={item.guid} news={item} />
                  ))}
                </div>

                {/* Pagination */}
                {!searchTerm && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No news found</p>
                  <p className="text-sm">
                    {searchTerm 
                      ? `No results for "${searchTerm}" in ${categories.find(c => c.value === selectedCategory)?.label}`
                      : `No news available for ${categories.find(c => c.value === selectedCategory)?.label}`
                    }
                  </p>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}