"use client";

import {
  TrendingUp,
  BarChart3,
  Calendar,
  Newspaper,
  Mail,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const features = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Bitcoin Sentiment Analysis",
      description:
        "AI-powered sentiment analysis of Bitcoin news with real-time market insights",
    },
    {
      icon: <Newspaper className="w-5 h-5" />,
      title: "Multi-Source News",
      description:
        "Aggregated news from CoinDesk, Cointelegraph, Decrypt, and major financial outlets",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Economic Calendar",
      description:
        "Track major economic events that impact cryptocurrency and financial markets",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Market Intelligence",
      description:
        "Comprehensive analysis tools for informed crypto investment decisions",
    },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "News Portal", href: "/news" },
    { name: "Economic Calendar", href: "/economic-calendar" },
    { name: "API Documentation", href: "/api/docs" },
  ];

  const resources = [
    { name: "About CryptoTune", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Data Sources", href: "#sources" },
    { name: "Privacy Policy", href: "#privacy" },
  ];

  return (
    <footer className="bg-[#0B0B0B] border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="CryptoTune Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.svg";
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-white">
                Crypto<span className="text-[#F28D33]">Tune</span>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed mb-6">
              CryptoTune is your comprehensive cryptocurrency intelligence
              platform. We provide AI-powered sentiment analysis, multi-source
              news aggregation, and economic calendar tracking to help you make
              informed decisions in the crypto market.
            </p>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Key Features:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F28D33] rounded-full"></div>
                  Real-time Bitcoin sentiment analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F28D33] rounded-full"></div>
                  Multi-source crypto news aggregation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F28D33] rounded-full"></div>
                  Economic events calendar
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F28D33] rounded-full"></div>
                  Market intelligence insights
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-[#F28D33]" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-[#F28D33]" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-[#F28D33]" />
              </a>
              <a
                href="mailto:hello@cryptotune.app"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <Mail className="w-5 h-5 text-gray-400 hover:text-[#F28D33]" />
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div className="lg:col-span-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              What We Offer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#F28D33]/30 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F28D33]/20 rounded-lg border border-[#F28D33]/30">
                      <div className="text-[#F28D33]">{feature.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Links Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-[#F28D33] transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2">
                  {resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.href}
                        className="text-gray-400 hover:text-[#F28D33] transition-colors duration-200 text-sm"
                      >
                        {resource.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trusted Data Sources
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium text-gray-300">CoinDesk</div>
              <div className="text-xs text-gray-500">News & Analysis</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium text-gray-300">
                Cointelegraph
              </div>
              <div className="text-xs text-gray-500">Crypto News</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium text-gray-300">
                Yahoo Finance
              </div>
              <div className="text-xs text-gray-500">Financial Data</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium text-gray-300">
                MarketWatch
              </div>
              <div className="text-xs text-gray-500">Market News</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm font-medium text-gray-300">
                DeepSeek AI
              </div>
              <div className="text-xs text-gray-500">Sentiment Analysis</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © {currentYear} CryptoTune. All rights reserved.
          </div>
        </div> */}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400 leading-relaxed">
            <strong>Disclaimer:</strong> CryptoTune provides information for
            educational purposes only. Our sentiment analysis and market
            insights should not be considered as financial advice. Always
            conduct your own research and consult with qualified financial
            advisors before making investment decisions. Cryptocurrency
            investments carry significant risk and may result in loss of
            capital.
          </p>
        </div>
      </div>
    </footer>
  );
}
