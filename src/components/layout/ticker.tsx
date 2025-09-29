"use client";

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Speaker, Zap } from 'lucide-react';

export function Ticker() {
  const { settings, status } = useSelector((state: RootState) => state.settings);
  const tickerMessages = settings.ticker_messages || [];

  if (status === 'loading' || status === 'idle' || tickerMessages.length === 0) {
    // Render a placeholder or nothing while loading or if no messages
    return (
      <div className="bg-gray-900 text-white text-sm py-2">
        <div className="container mx-auto px-4 flex items-center">
          <Zap className="h-4 w-4 mr-2 text-yellow-400" />
          <span>Loading latest updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white text-md py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center">
        <Speaker className="h-5 w-5 mr-3 flex-shrink-0 text-cyan-400" />
        <div className="relative flex-grow overflow-hidden h-6">
          <div 
            className="absolute top-0 left-0 flex items-center whitespace-nowrap"
            style={{ animation: 'marquee 40s linear infinite' }}
          >
            {[...tickerMessages, ...tickerMessages].map((message, index) => (
              <span key={index} className="mx-6">
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
