import React, { useState } from 'react';
import { Sprout } from 'lucide-react';
import heroPhotoFallback from '../assets/farmer_hero.jpg';

export interface LeftBrandPanelProps {
  heroImageUrl?: string;
  badgeText?: string;
  taglineTitle?: string;
  taglineDescription?: string;
  forceMobile?: boolean;
}

export const LeftBrandPanel: React.FC<LeftBrandPanelProps> = ({
  heroImageUrl = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
  badgeText = 'AI Farming Assistant • कृषि साथी',
  taglineTitle = 'Smart Decisions. Better Harvests. Higher Profits.',
  taglineDescription = 'Empowering Indian farmers with AI crop diagnostics, real-time APMC mandi rates, and personalized weather advisories in your own language.',
  forceMobile = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(heroImageUrl);

  // If forceMobile is active, render the compact mobile hero banner
  if (forceMobile) {
    return (
      <div className="w-full h-44 sm:h-48 relative overflow-hidden bg-emerald-950 shrink-0 select-none">
        <img
          src={imgSrc}
          alt="Farmer standing in a green agricultural field holding a smartphone"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={() => setImgSrc(heroPhotoFallback)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/30 to-primary/20 pointer-events-none" />
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary-dark shadow-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>{badgeText}</span>
        </div>
      </div>
    );
  }

  // Responsive: Mobile hero (<md) / Immersive left split panel (>=md)
  return (
    <div className="w-full md:w-1/2 lg:w-[48%] relative flex flex-col justify-between overflow-hidden bg-emerald-950 h-44 sm:h-52 md:h-auto md:min-h-full shrink-0 select-none">
      {/* Farmer Photo / Background Image */}
      <img
        src={imgSrc}
        alt="Farmer standing in a green agricultural field holding a smartphone"
        className="absolute inset-0 w-full h-full object-cover object-center"
        onError={() => setImgSrc(heroPhotoFallback)}
      />

      {/* Soft green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-primary/20 pointer-events-none" />

      {/* Mobile-only badge at bottom of hero */}
      <div className="md:hidden absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary-dark shadow-xs flex items-center gap-1.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span>{badgeText}</span>
      </div>

      {/* Desktop Left-panel Branding Header (>=768px) */}
      <div className="relative z-10 p-6 md:p-8 hidden md:flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-primary-tint flex items-center justify-center shadow-md shrink-0">
          <Sprout className="w-6 h-6 text-primary stroke-[2.5]" />
        </div>
        <div>
          <span className="text-white text-[30px] lg:text-[32px] font-bold tracking-tight block leading-none drop-shadow-sm">
            FasalSetu
          </span>
          <span className="text-emerald-200 text-sm font-medium block mt-1 drop-shadow-sm">
            स्मार्ट खेती, समृद्ध किसान
          </span>
        </div>
      </div>

      {/* Bottom Value Proposition & Tagline (Desktop) */}
      <div className="relative z-10 p-6 md:p-8 hidden md:block text-white space-y-2">
        <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-1 border border-white/20">
          {badgeText}
        </div>
        <h3 className="text-xl lg:text-2xl font-bold leading-snug drop-shadow-sm">
          {taglineTitle}
        </h3>
        <p className="text-xs lg:text-sm text-emerald-100/90 leading-relaxed max-w-sm">
          {taglineDescription}
        </p>
      </div>
    </div>
  );
};

export default LeftBrandPanel;
