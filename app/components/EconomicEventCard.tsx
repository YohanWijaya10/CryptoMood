'use client';

import { Calendar, Clock, TrendingUp, AlertTriangle, Info, Brain } from 'lucide-react';
import { EconomicEvent } from '@/app/lib/economic-calendar';
import EconomicAnalysisModal from './EconomicAnalysisModal';
import { formatEventTime, formatDateHeader } from '@/app/lib/time-utils';
import { useState } from 'react';

interface EconomicEventCardProps {
  event: EconomicEvent;
}

export default function EconomicEventCard({ event }: EconomicEventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          dot: 'bg-red-500'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30', 
          text: 'text-yellow-400',
          dot: 'bg-yellow-500'
        };
      case 'LOW':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          dot: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          dot: 'bg-gray-500'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INTEREST_RATE':
      case 'MONETARY_POLICY':
        return <TrendingUp className="w-4 h-4" />;
      case 'INFLATION':
        return <AlertTriangle className="w-4 h-4" />;
      case 'EMPLOYMENT':
        return <Info className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
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

  const formatTime = (time: string) => {
    return formatEventTime(time);
  };

  const formatDate = (dateString: string) => {
    return formatDateHeader(dateString);
  };

  const impactStyle = getImpactColor(event.impact);

  return (
    <div className={`group bg-[#0F0F0F] border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 ${impactStyle.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${impactStyle.bg} ${impactStyle.border} border`}>
            {getCategoryIcon(event.category)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCountryFlag(event.country)}</span>
              <span className="text-sm font-medium text-gray-400">{event.currency}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(event.date)}</span>
              <Clock className="w-3 h-3 ml-2" />
              <span>{formatTime(event.time)}</span>
            </div>
          </div>
        </div>
        
        {/* Impact Badge */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${impactStyle.dot}`}></div>
          <span className={`text-xs font-bold uppercase tracking-wider ${impactStyle.text}`}>
            {event.impact}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors duration-200">
          {event.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Data Points */}
      {(event.actual || event.forecast || event.previous) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {event.previous && (
            <div className="text-center p-2 bg-gray-800/40 rounded-lg border border-white/10">
              <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Previous</div>
              <div className="font-bold text-gray-300">{event.previous}</div>
            </div>
          )}
          
          {event.forecast && (
            <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-xs text-blue-400 mb-1 font-medium uppercase tracking-wide">Forecast</div>
              <div className="font-bold text-blue-300">{event.forecast}</div>
            </div>
          )}
          
          {event.actual && (
            <div className={`text-center p-2 rounded-lg border ${
              event.forecast && event.actual !== event.forecast 
                ? parseFloat(event.actual.replace('%', '')) > parseFloat(event.forecast.replace('%', ''))
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
                : 'bg-gray-800/40 border-white/10'
            }`}>
              <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Actual</div>
              <div className={`font-bold ${
                event.forecast && event.actual !== event.forecast
                  ? parseFloat(event.actual.replace('%', '')) > parseFloat(event.forecast.replace('%', ''))
                    ? 'text-green-300'
                    : 'text-red-300'
                  : 'text-gray-300'
              }`}>
                {event.actual}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 w-full p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/30 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2 flex-1">
            <Brain className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
            <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300">Analisis AI Crypto Impact</span>
          </div>
          <div className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 font-medium">
            Lihat Detail
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Source:</span>
          <span className="text-xs font-medium text-gray-400">{event.source}</span>
        </div>
        
        {event.relevance === 'CRYPTO' && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span className="text-xs font-medium text-orange-400">Crypto Relevant</span>
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      <EconomicAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventData={{
          title: event.title,
          description: event.description,
          category: event.category,
          impact: event.impact,
          country: event.country,
          currency: event.currency,
          actual: event.actual,
          forecast: event.forecast,
          previous: event.previous
        }}
      />
    </div>
  );
}