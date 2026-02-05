'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-5 h-5 text-secondary" />
      <span className="font-body text-sm font-semibold text-secondary uppercase">
        {locale}
      </span>
    </button>
  );
}
