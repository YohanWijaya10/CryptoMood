"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Image from "next/image";
import { useLanguage } from '@/app/lib/language-context';
import { useTranslations } from '@/app/lib/translations';

interface SentimentScoreProps {
  score: number;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  totalItems?: number;
}

export default function SentimentScore({
  score,
  sentiment,
  totalItems,
}: SentimentScoreProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const getIconClasses = () => {
    if (sentiment === "POSITIVE") return "bg-green-500";
    if (sentiment === "NEGATIVE") return "bg-red-500";
    return "bg-[#F28D33]";
  };

  const getIcon = () => {
    if (sentiment === "POSITIVE") return <TrendingUp className="w-8 h-8" />;
    if (sentiment === "NEGATIVE") return <TrendingDown className="w-8 h-8" />;
    return <Minus className="w-8 h-8" />;
  };

  const getSentimentText = () => {
    if (sentiment === "POSITIVE") return t.bullish;
    if (sentiment === "NEGATIVE") return t.bearish;
    return t.neutral;
  };

  const getProgressWidth = () => {
    return `${score}%`;
  };

  const getScoreLevel = () => {
    if (score >= 80) return t.extremely;
    if (score >= 60) return t.very;
    if (score >= 40) return t.moderately;
    if (score >= 20) return t.slightly;
    return t.extremely;
  };

  const getProgressColor = () => {
    if (sentiment === "POSITIVE") return "bg-green-500";
    if (sentiment === "NEGATIVE") return "bg-red-500";
    return "bg-gradient-to-r from-[#F28D33] to-[#FBAF5C]";
  };

  return (
    <div className="relative overflow-hidden">
      {/* Main Card - Clean Flat Design */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur border border-[#2E2E2E] rounded-2xl p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#F28D33] flex items-center justify-center">
              <Image
                src="/Bitcoin.png"
                alt="CryptoTune Logo"
                width={40}
                height={40}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback to SVG if PNG doesn't exist
                  e.currentTarget.src = "/logo.svg";
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {t.bitcoinMarketSentiment}
              </h2>
              <p className="text-[#A5A5A5] text-base">
                {totalItems
                  ? `${t.neuralAnalysisOf} ${totalItems} ${t.articles}`
                  : t.realTimeSentimentAnalysis}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center lg:text-right">
            <div className="flex items-end justify-center lg:justify-end gap-1 mb-2">
              <div className="text-6xl font-bold text-[#F28D33]">{score}</div>
              <div className="text-2xl font-normal text-[#A5A5A5] mb-1">
                /100
              </div>
            </div>
            <div className="text-xl font-medium text-white mb-1">
              {getScoreLevel()} {getSentimentText()}
            </div>
            <div className="text-sm text-[#19E58D] font-medium">
              {t.marketSentiment}
            </div>
          </div>
        </div>

        {/* Clean Progress Section */}
        <div className="space-y-4">
          {/* Flat Progress Bar */}
          <div className="relative">
            <div className="w-full bg-[#2E2E2E] rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-[2000ms] ease-out ${getProgressColor()}`}
                style={{ width: getProgressWidth() }}
              />
            </div>
          </div>

          {/* Clean Scale Labels */}
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-400">{t.bearish.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F28D33] rounded-full"></div>
              <span className="text-[#F28D33]">{t.neutral.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400">{t.bullish.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
