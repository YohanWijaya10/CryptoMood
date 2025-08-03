"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const getGradientClasses = () => {
    if (sentiment === "POSITIVE")
      return "bg-neon-gradient-green shadow-neon-green-lg";
    if (sentiment === "NEGATIVE")
      return "bg-neon-gradient-red shadow-neon-red-lg";
    return "bg-neon-gradient-yellow shadow-neon-yellow";
  };

  const getBorderGlow = () => {
    if (sentiment === "POSITIVE")
      return "border-neon-green/30 shadow-neon-green";
    if (sentiment === "NEGATIVE") return "border-neon-red/30 shadow-neon-red";
    return "border-neon-yellow/30 shadow-neon-yellow";
  };

  const getIcon = () => {
    if (sentiment === "POSITIVE") return <TrendingUp className="w-8 h-8" />;
    if (sentiment === "NEGATIVE") return <TrendingDown className="w-8 h-8" />;
    return <Minus className="w-8 h-8" />;
  };

  const getSentimentText = () => {
    if (sentiment === "POSITIVE") return "Bullish";
    if (sentiment === "NEGATIVE") return "Bearish";
    return "Neutral";
  };

  const getSentimentEmoji = () => {
    if (sentiment === "POSITIVE") return "🚀";
    if (sentiment === "NEGATIVE") return "📉";
    return "⚖️";
  };

  const getProgressWidth = () => {
    return `${score}%`;
  };

  const getScoreLevel = () => {
    if (score >= 80) return "Extremely";
    if (score >= 60) return "Very";
    if (score >= 40) return "Moderately";
    if (score >= 20) return "Slightly";
    return "Extremely";
  };

  return (
    <div className="relative overflow-hidden">
      {/* Main Card with Neon Glow */}
      <div
        className={`crypto-card-glow p-8 relative z-10 border-2 ${getBorderGlow()}`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div
              className={`w-20 h-20 rounded-3xl ${getGradientClasses()} flex items-center justify-center text-white`}
            >
              {getIcon()}
            </div>
            <div>
              <h2 className="text-4xl font-black text-text-primary mb-2 font-space">
                Bitcoin Market Sentiment
              </h2>
              <p className="text-text-secondary flex items-center gap-2 text-lg">
                <span className="text-2xl">{getSentimentEmoji()}</span>
                {totalItems
                  ? `Neural analysis of ${totalItems} articles`
                  : "Real-time sentiment analysis"}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center lg:text-right">
            <div className="flex items-end justify-center lg:justify-end gap-2 mb-3">
              <div className="text-8xl font-black text-yellow-400 font-space">
                {score}
              </div>
              <div className="text-3xl font-light text-text-muted mb-2">
                /100
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-2">
              {getScoreLevel()} {getSentimentText()}
            </div>
            <div className="text-sm text-neon-green font-bold tracking-wide uppercase">
              Market Sentiment
            </div>
          </div>
        </div>

        {/* Neon Progress Section */}
        <div className="space-y-6">
          {/* Glowing Progress Bar */}
          <div className="relative">
            <div className="w-full bg-dark-card-hover rounded-full h-6 overflow-hidden border border-dark-border">
              <div
                className={`h-full transition-all duration-[3000ms] ease-out ${
                  sentiment === "POSITIVE"
                    ? "bg-neon-gradient-green shadow-neon-green"
                    : sentiment === "NEGATIVE"
                    ? "bg-neon-gradient-red shadow-neon-red"
                    : "bg-neon-gradient-yellow shadow-neon-yellow"
                }`}
                style={{ width: getProgressWidth() }}
              />
            </div>
            {/* Glowing Score Marker */}
            <div
              className={`absolute -top-1 h-8 w-2 rounded-full transition-all duration-[3000ms] ease-out ${
                sentiment === "POSITIVE"
                  ? "bg-neon-green shadow-neon-green"
                  : sentiment === "NEGATIVE"
                  ? "bg-neon-red shadow-neon-red"
                  : "bg-neon-yellow shadow-neon-yellow"
              }`}
              style={{ left: `calc(${score}% - 4px)` }}
            />
          </div>

          {/* Neon Scale Labels */}
          <div className="flex justify-between text-sm font-bold">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-neon-gradient-red rounded-full shadow-neon-red"></div>
              <span className="text-neon-red">BEARISH</span>
              <span className="text-text-muted">📉</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-neon-gradient-yellow rounded-full shadow-neon-yellow"></div>
              <span className="text-neon-yellow">NEUTRAL</span>
              <span className="text-text-muted">⚖️</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-neon-gradient-green rounded-full shadow-neon-green"></div>
              <span className="text-neon-green">BULLISH</span>
              <span className="text-text-muted">🚀</span>
            </div>
          </div>
        </div>

        {/* Neon Stats Grid */}
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-4 right-4 w-20 h-20 bg-neon-gradient-green rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-4 left-4 w-16 h-16 bg-neon-gradient-purple rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-neon-gradient-blue rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
}
