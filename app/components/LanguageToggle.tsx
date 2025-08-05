'use client';

import { useLanguage } from '@/app/lib/language-context';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage, isEnglish, isIndonesian } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(isEnglish ? 'id' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40"
      title={`Switch to ${isEnglish ? 'Bahasa Indonesia' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {isEnglish ? 'EN' : 'ID'}
      </span>
    </button>
  );
}