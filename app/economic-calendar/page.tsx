'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import EconomicEventCard from '@/app/components/EconomicEventCard';
import { EconomicEvent } from '@/app/lib/economic-calendar';
import { formatDateHeader, formatLastUpdated } from '@/app/lib/time-utils';

interface EconomicCalendarResponse {
  success: boolean;
  data: {
    events: EconomicEvent[];
    eventsByDate: Record<string, EconomicEvent[]>;
    totalEvents: number;
    daysAhead: number;
    filters: {
      cryptoOnly: boolean;
      highImpactOnly: boolean;
    };
    statistics: {
      impactBreakdown: Record<string, number>;
      countryBreakdown: Record<string, number>;
    };
    lastUpdated: string;
  };
  categories: Array<{
    value: string;
    label: string;
  }>;
  timestamp: string;
  error?: string;
  message?: string;
}

export default function EconomicCalendarPage() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [eventsByDate, setEventsByDate] = useState<Record<string, EconomicEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cryptoOnly, setCryptoOnly] = useState(false);
  const [highImpactOnly, setHighImpactOnly] = useState(false);
  const [daysAhead, setDaysAhead] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<{
    impactBreakdown: Record<string, number>;
    countryBreakdown: Record<string, number>;
  } | null>(null);

  const fetchEconomicEvents = async (crypto: boolean = false, impact: boolean = false, days: number = 7) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        days: days.toString(),
        ...(crypto && { crypto: 'true' }),
        ...(impact && { impact: 'high' })
      });

      const response = await fetch(`/api/economic-calendar?${params}`);
      const data: EconomicCalendarResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setEvents(data.data.events);
        setEventsByDate(data.data.eventsByDate);
        setLastUpdated(data.data.lastUpdated);
        setStatistics(data.data.statistics);
      } else {
        throw new Error(data.error || 'Failed to fetch economic calendar');
      }
    } catch (err) {
      console.error('Error fetching economic calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch economic calendar');
      setEvents([]);
      setEventsByDate({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomicEvents(cryptoOnly, highImpactOnly, daysAhead);
  }, [cryptoOnly, highImpactOnly, daysAhead]);

  const handleRefresh = () => {
    fetchEconomicEvents(cryptoOnly, highImpactOnly, daysAhead);
  };

  const handleFilterChange = (crypto: boolean, impact: boolean) => {
    setCryptoOnly(crypto);
    setHighImpactOnly(impact);
  };

  const formatDateHeaderLocal = (dateString: string) => {
    return formatDateHeader(dateString);
  };

  const formatLastUpdatedLocal = (dateString: string | null) => {
    return formatLastUpdated(dateString);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* NavBar */}
      <NavBar onRefresh={handleRefresh} isAnalyzing={loading} lastUpdated={lastUpdated} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Economic <span className="text-orange-400">Calendar</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Track important economic events that impact cryptocurrency and financial markets
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Terakhir diperbarui: {formatLastUpdatedLocal(lastUpdated)}
              </p>
            )}
          </div>

          {/* Stats */}
          {statistics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-white">{events.length}</div>
                <div className="text-xs text-gray-400">Total Events</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">{statistics.impactBreakdown.HIGH || 0}</div>
                <div className="text-xs text-gray-400">High Impact</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">
                  {events.filter(e => e.relevance === 'CRYPTO').length}
                </div>
                <div className="text-xs text-gray-400">Crypto Relevant</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{daysAhead}</div>
                <div className="text-xs text-gray-400">Days Ahead</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter toggles */}
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 w-4 h-4" />
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cryptoOnly}
                  onChange={(e) => handleFilterChange(e.target.checked, highImpactOnly)}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-gray-300">Crypto Relevant Only</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highImpactOnly}
                  onChange={(e) => handleFilterChange(cryptoOnly, e.target.checked)}
                  className="w-4 h-4 text-red-500 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="text-gray-300">High Impact Only</span>
              </label>
            </div>

            {/* Days selector */}
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400 w-4 h-4" />
              <select
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all duration-200"
              >
                <option value={3} className="bg-[#1A1A1A] text-white">3 Days</option>
                <option value={7} className="bg-[#1A1A1A] text-white">7 Days</option>
                <option value={14} className="bg-[#1A1A1A] text-white">14 Days</option>
                <option value={30} className="bg-[#1A1A1A] text-white">30 Days</option>
              </select>
            </div>

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

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Failed to load economic calendar</p>
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
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-800 rounded mb-4 w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="bg-[#0F0F0F] border border-white/10 rounded-xl p-5 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events by Date */}
        {!loading && !error && (
          <>
            {Object.keys(eventsByDate).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(eventsByDate)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([date, dayEvents]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-white">
                          {formatDateHeaderLocal(date)}
                        </h2>
                        <div className="flex-1 h-px bg-white/10"></div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{dayEvents.length} events</span>
                        </div>
                      </div>

                      {/* Events Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dayEvents
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((event) => (
                            <EconomicEventCard key={event.id} event={event} />
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No economic events found</p>
                  <p className="text-sm">
                    {cryptoOnly && highImpactOnly 
                      ? 'No high-impact crypto-relevant events in the selected timeframe'
                      : cryptoOnly 
                        ? 'No crypto-relevant events in the selected timeframe'
                        : highImpactOnly
                          ? 'No high-impact events in the selected timeframe'
                          : 'No events available for the selected timeframe'
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleFilterChange(false, false)}
                  className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200"
                >
                  Clear Filters
                </button>
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