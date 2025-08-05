'use client';

import { useState, useEffect } from 'react';
import { X, Brain, Target, BarChart3, TrendingUp, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { EconomicEventAnalysis } from '@/app/lib/ai-economic-analysis';
import { formatToWIB } from '@/app/lib/time-utils';

interface EconomicAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    description: string;
    category: string;
    impact: string;
    country: string;
    currency: string;
    actual?: string;
    forecast?: string;
    previous?: string;
  };
}

export default function EconomicAnalysisModal({ isOpen, onClose, eventData }: EconomicAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<EconomicEventAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load analysis when modal opens
  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      loadAnalysis();
    }
  }, [isOpen, analysis, loading]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🤖 Loading AI analysis for:', eventData.title);
      
      const response = await fetch('/api/economic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.data);
      console.log('✅ AI analysis loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load analysis:', error);
      setError(error instanceof Error ? error.message : 'Gagal memuat analisis AI');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'BEARISH':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'TINGGI':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'SEDANG':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'RENDAH':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'European Union': '🇪🇺',
      'United Kingdom': '🇬🇧',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Switzerland': '🇨🇭',
      'China': '🇨🇳'
    };
    return flags[country] || '🌍';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'MEDIUM':
        return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      case 'LOW':
        return <BarChart3 className="w-5 h-5 text-green-400" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B0B0B] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analisis AI Crypto Impact</h2>
                <p className="text-sm text-gray-400">Powered by DeepSeek AI</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Event Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCountryFlag(eventData.country)}</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  {getImpactIcon(eventData.impact)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{eventData.title}</h3>
                <p className="text-gray-300 text-sm mb-3">{eventData.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{eventData.country}</span>
                  <span>•</span>
                  <span>{eventData.currency}</span>
                  <span>•</span>
                  <span className="font-medium">{eventData.impact} Impact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  <span className="text-purple-400">Menganalisis dampak event dengan AI...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 font-medium mb-2">Gagal memuat analisis AI</p>
                <p className="text-red-300 text-sm mb-3">{error}</p>
                <button
                  onClick={loadAnalysis}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {analysis && !loading && (
              <div className="space-y-6">
                {/* Main Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800/40 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Skor Dampak</div>
                    <div className="text-2xl font-bold text-purple-400">{analysis.impactScore}/100</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/40 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Prediksi</div>
                    <div className={`px-3 py-1 rounded-full font-bold border ${getDirectionColor(analysis.direction)}`}>
                      {analysis.direction}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/40 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Keyakinan</div>
                    <div className="text-2xl font-bold text-blue-400">{analysis.confidence}%</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/40 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Risiko</div>
                    <div className={`px-3 py-1 rounded-full font-bold border ${getRiskLevelColor(analysis.riskLevel)}`}>
                      {analysis.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Main Analysis */}
                <div className="p-4 bg-gray-900/40 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-blue-400">Analisis Utama</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {analysis.analysis}
                  </p>
                </div>

                {/* Historical Context */}
                <div className="p-4 bg-gray-900/40 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Konteks Historis</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {analysis.historicalContext}
                  </p>
                </div>

                {/* Crypto Impact */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Dampak Spesifik Crypto</h4>
                  <div className="grid gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">₿</span>
                        <span className="font-bold text-orange-400">Bitcoin</span>
                      </div>
                      <p className="text-gray-300 text-sm">{analysis.cryptoImpact.bitcoin}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔗</span>
                        <span className="font-bold text-blue-400">Altcoin</span>
                      </div>
                      <p className="text-gray-300 text-sm">{analysis.cryptoImpact.altcoins}</p>
                    </div>
                    
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🏦</span>
                        <span className="font-bold text-purple-400">DeFi</span>
                      </div>
                      <p className="text-gray-300 text-sm">{analysis.cryptoImpact.defi}</p>
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Faktor Kunci</h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.keyFactors.map((factor, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-800/60 border border-gray-600/40 rounded-full text-gray-300 text-sm font-medium backdrop-blur-sm"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Waktu Reaksi: <span className="font-medium text-gray-300">{analysis.timeframe}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>AI by <span className="font-semibold text-purple-400">{analysis.provider}</span></span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-sm"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}