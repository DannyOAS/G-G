import React from 'react';

export default function LoadingScreen({ message = 'Loading' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blush-300 border-t-transparent"></div>
        <p className="text-sm font-semibold text-blush-600">{message}...</p>
      </div>
    </div>
  );
}
