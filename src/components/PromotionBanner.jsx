import React from 'react';
import { usePromotions } from '../context/PromotionsContext';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

export default function PromotionBanner() {
  const promotions = usePromotions();

  if (!promotions.length) return null;

  return (
    <div className="bg-blush-500 text-white">
      <div className="container-padded flex flex-col items-center justify-between gap-3 py-3 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <MegaphoneIcon className="h-5 w-5" />
          <p className="font-semibold uppercase tracking-wide">{promotions[0].title}</p>
        </div>
        <p className="text-center text-white/90 sm:text-left">{promotions[0].description}</p>
        {promotions[0].ctaUrl && (
          <a
            href={promotions[0].ctaUrl}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blush-600"
          >
            {promotions[0].ctaLabel || 'Learn More'}
          </a>
        )}
      </div>
    </div>
  );
}
