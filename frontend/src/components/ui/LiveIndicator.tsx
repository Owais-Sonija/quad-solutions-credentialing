import React from 'react';

interface LiveIndicatorProps {
  isPolling: boolean;
  lastUpdated: Date | null;
  interval: number;  // seconds
}

export const LiveIndicator = ({ 
  isPolling, lastUpdated, interval 
}: LiveIndicatorProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
      {isPolling ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-600 font-medium">Live</span>
          <span className="text-gray-400">
            · Updates every {interval}s
          </span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-gray-400"></span>
          <span>Paused</span>
        </>
      )}
      {lastUpdated && (
        <span className="text-gray-400 ml-1">
          · Last updated: {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  );
};
