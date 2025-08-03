'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Menu, X } from 'lucide-react';

interface NavBarProps {
  onRefresh?: () => void;
  isAnalyzing?: boolean;
  lastUpdated?: string | null;
}

export default function NavBar({ onRefresh, isAnalyzing = false, lastUpdated }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set initial time on client side to avoid hydration mismatch
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const navLinks = [
    { name: 'Dashboard', href: '/', active: true },
    { name: 'Articles', href: '/articles', active: false },
    { name: 'Insights', href: '/insights', active: false },
    { name: 'Portfolio', href: '/portfolio', active: false },
  ];

  return (
    <nav className="bg-[#0B0B0B]/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.966-1.133 3.108-2.877 3.108-.906 0-1.517-.375-1.975-1.108v4.731h-1.883V9.033h1.693l.095.717c.439-.559 1.034-.859 1.865-.859 1.683 0 2.849 1.205 2.849 3.242 0 .202-.013.4-.038.595-.024.188-.056.373-.097.554-.822 3.624-4.16 6.168-8.132 6.168S.435 16.906.435 12.282.435 7.718 4.435 7.718s8.132 2.544 8.132 6.168z"/>
                </svg>
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              Crypto<span className="text-orange-400">Tune</span>
            </div>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    link.active
                      ? 'text-white bg-white/10 shadow-lg shadow-green-500/20 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 hover:shadow-lg hover:shadow-purple-500/20'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Status + Time + Refresh */}
          <div className="flex items-center space-x-4">
            {/* Analysis Status */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <span className={`${
                isAnalyzing ? 'text-green-400' : 'text-gray-400'
              }`}>
                {isAnalyzing ? 'Analysis Active' : 'Idle'}
              </span>
            </div>

            {/* Timestamp */}
            <div className="hidden sm:block text-sm text-gray-400">
              {isClient && currentTime ? formatTime(currentTime) : '--:--:--'}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isAnalyzing}
              className="p-2 border border-white/20 rounded-lg text-white hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${
                isAnalyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'
              }`} />
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10 bg-[#0B0B0B]/98 backdrop-blur-sm">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    link.active
                      ? 'text-white bg-white/10 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Status */}
              <div className="flex items-center justify-between px-3 py-2 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                  }`}></div>
                  <span className={`${
                    isAnalyzing ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {isAnalyzing ? 'Analysis Active' : 'Idle'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {isClient && currentTime ? formatTime(currentTime) : '--:--:--'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}