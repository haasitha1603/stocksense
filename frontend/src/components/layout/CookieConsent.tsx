import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('stocksense_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleChoice = (accepted: boolean) => {
    localStorage.setItem('stocksense_cookie_consent', accepted ? 'accepted' : 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Privacy & Essential Storage</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            StockSense uses strictly essential local storage for authentication tokens and light/dark theme persistence.
            We do not track you across third-party networks or sell operational data.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Accept Preferences
            </button>
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
