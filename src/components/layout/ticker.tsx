"use client";

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Speaker, Zap } from 'lucide-react';

export function Ticker() {
  const settingsState = useSelector((state: RootState) => state.settings);
  const { status } = settingsState;

  // settings in the store can be in different shapes depending on when/how it was loaded:
  // - an object mapping keys -> values (preferred, after slice normalization)
  // - an array of { key, value } returned directly from the API
  // - an ApiResponse-like object with a .data array
  const rawSettings: any = settingsState.settings;

  let tickerString = '';

  if (typeof rawSettings === 'string') {
    // improbable but guard
    tickerString = rawSettings;
  } else if (Array.isArray(rawSettings)) {
    tickerString = rawSettings.find((item: any) => item.key === 'ticker_messages')?.value || '';
  } else if (rawSettings && Array.isArray(rawSettings.data)) {
    tickerString = rawSettings.data.find((item: any) => item.key === 'ticker_messages')?.value || '';
  } else if (rawSettings && typeof rawSettings === 'object') {
    // normalized shape from settingsSlice: { ticker_messages: 'a,b,c', phone: '...', ... }
    tickerString = rawSettings.ticker_messages || rawSettings['ticker_messages'] || '';
  }

  const tickerMessages = (tickerString || '')
    .toString()
    .split(',')
    .map((msg: any) => msg.trim())
    .filter((msg: any) => msg.length > 0);

  if (status === 'loading' || status === 'idle' || tickerMessages.length === 0) {
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
        <div className="relative flex-grow overflow-hidden h-6 group">
          <div className="ticker-track">
            {[...tickerMessages, ...tickerMessages].map((message, index) => (
              <span key={index} className="mx-6">
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker-scroll 40s linear infinite;
        }
        .group:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
