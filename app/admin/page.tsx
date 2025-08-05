'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Play, Database, Brain, BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

interface ResearchStats {
  totalEvents: number;
  analyzedEvents: number;
  pendingEvents: number;
  analysisPercentage: number;
  recentAnalysis: number;
}

interface ResearchJob {
  id: number;
  jobType: 'SCRAPE_EVENTS' | 'AI_ANALYSIS';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  source?: string;
  targetDate?: string;
  eventsFound?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/research?type=status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setStats(data.data.statistics);
        setJobs(data.data.recentJobs);
      } else {
        throw new Error(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Run research operation
  const runOperation = async (action: 'research' | 'analyze' | 'full', days = 30) => {
    try {
      setOperationLoading(action);
      setError(null);

      const params = new URLSearchParams({
        action,
        ...(action === 'research' || action === 'full' ? { days: days.toString() } : {}),
        ...(action === 'analyze' ? { batchSize: '5' } : {})
      });

      const response = await fetch(`/api/research?${params}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        console.log(`✅ ${action} operation completed:`, data.data);
        
        // Reload dashboard data
        await loadDashboardData();
        
        // Show success notification
        alert(`${action} operation completed successfully!`);
      } else {
        throw new Error(data.error || `${action} operation failed`);
      }
    } catch (err) {
      console.error(`${action} operation failed:`, err);
      setError(err instanceof Error ? err.message : `${action} operation failed`);
    } finally {
      setOperationLoading(null);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getJobStatusIcon = (status: ResearchJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'RUNNING':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getJobStatusColor = (status: ResearchJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'RUNNING':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'FAILED':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* NavBar */}
      <NavBar onRefresh={loadDashboardData} isAnalyzing={loading} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Research <span className="text-purple-400">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Monitor and manage batch economic calendar research & AI analysis
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runOperation('research')}
              disabled={operationLoading === 'research'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {operationLoading === 'research' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              Research Events
            </button>
            
            <button
              onClick={() => runOperation('analyze')}
              disabled={operationLoading === 'analyze'}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {operationLoading === 'analyze' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              AI Analysis
            </button>
            
            <button
              onClick={() => runOperation('full')}
              disabled={operationLoading === 'full'}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {operationLoading === 'full' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Full Pipeline
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Operation Failed</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white mb-2">{stats.totalEvents}</div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Database className="w-3 h-3" />
                Total Events
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-2">{stats.analyzedEvents}</div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Analyzed
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.pendingEvents}</div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400 mb-2">{stats.analysisPercentage}%</div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Progress
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400 mb-2">{stats.recentAnalysis}</div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Recent 24h
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <div className="mb-8 p-4 bg-gray-900/40 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Analysis Progress</span>
              <span className="text-sm text-gray-400">{stats.analyzedEvents} / {stats.totalEvents}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.analysisPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="bg-[#0F0F0F] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Research Jobs</h2>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-lg">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Jobs List */}
          {!loading && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    {getJobStatusIcon(job.status)}
                    <div className="text-sm">
                      {job.jobType === 'SCRAPE_EVENTS' ? (
                        <Database className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Brain className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">
                        {job.jobType === 'SCRAPE_EVENTS' ? 'Event Research' : 'AI Analysis'}
                      </span>
                      {job.source && (
                        <span className="text-xs px-2 py-1 bg-gray-700/60 rounded text-gray-400">
                          {job.source}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Created: {formatDate(job.createdAt)}
                      {job.eventsFound && (
                        <span className="ml-3">• {job.eventsFound} events</span>
                      )}
                    </div>
                    {job.errorMessage && (
                      <div className="text-xs text-red-400 mt-1 truncate">
                        Error: {job.errorMessage}
                      </div>
                    )}
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobStatusColor(job.status)}`}>
                    {job.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No research jobs found</p>
                <p className="text-sm">Start your first research operation to see jobs here</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}