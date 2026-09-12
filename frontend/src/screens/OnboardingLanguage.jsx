import React, { useState } from 'react';
import { Sprout, Check, ShieldCheck, Sparkles, TrendingUp, CloudSun } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import heroPhotoFallback from '../assets/farmer_hero.jpg';

const LANGUAGES = [
  { id: 'en', label: 'English', sub: 'English' },
  { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { id: 'mr', label: 'मराठी', sub: 'Marathi' },
  { id: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
  { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
];

export default function OnboardingLanguage({ onContinue, currentLang = 'en' }) {
  // Default to 'en' (English) as requested
  const [selectedLang, setSelectedLang] = useState(currentLang || 'en');
  const [imgSrc, setImgSrc] = useState(
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80'
  );

  const handleLanguageSelect = (id) => {
    setSelectedLang(id);
  };

  const handleContinue = () => {
    if (selectedLang && onContinue) {
      onContinue(selectedLang);
    }
  };

  const isHindi = selectedLang === 'hi';

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-slate-100">
      {/* Desktop Responsive Card / Mobile Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all">
        {/* Left Section (Desktop Visual Showcase) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-primary-dark via-primary to-emerald-700 p-8 flex-col justify-between text-white relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>India's Trusted Agricultural Companion</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight leading-tight">
              FasalSetu <br />
              <span className="text-emerald-200">फसलसेतु</span>
            </h2>

            <p className="text-emerald-100 font-medium text-sm mt-2">
              "Smart Farming, Prosperous Farmer"
            </p>

            <p className="text-xs text-emerald-100/80 mt-4 leading-relaxed">
              Empowering farmers across India with AI-powered crop diagnostics, live APMC mandi rates, and hyperlocal weather advisories.
            </p>
          </div>

          {/* Feature Highlights on Desktop */}
          <div className="space-y-3 my-6">
            <div className="flex items-center gap-2.5 text-xs bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>AI Crop Disease Diagnosis in 3 Sec</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <TrendingUp className="w-4 h-4 text-amber-200" />
              <span>Live Rates from 2,500+ Mandis</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <CloudSun className="w-4 h-4 text-blue-200" />
              <span>Hyperlocal Weather & Spray Advisory</span>
            </div>
          </div>

          <div className="text-[11px] text-emerald-200/80 border-t border-white/20 pt-4">
            ✓ Available in 6 Regional Indian Languages • 100% Free
          </div>
        </div>

        {/* Right Section / Mobile Main View */}
        <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-farmBg">
          {/* Top Brand Header */}
          <div className="flex flex-col items-center text-center">
            {/* Centered Leaf/Growth Icon in a Circular Badge */}
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/25 mb-2.5">
              <Sprout className="w-6 h-6 text-white stroke-[2.4]" />
            </div>

            {/* App Name: FASALSETU */}
            <h1 className="text-[24px] font-extrabold text-[#14532D] tracking-widest leading-none font-sans uppercase">
              FASALSETU
            </h1>

            {/* Tagline */}
            <p className="text-[14px] text-slate-500 font-medium mt-1 tracking-normal">
              Smart Farming, Prosperous Farmer
            </p>
            <p className="text-[12px] text-slate-400 font-normal">
              (स्मार्ट खेती, समृद्ध किसान)
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="my-4 w-full">
            <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-card border border-slate-100 relative bg-amber-50">
              <img
                src={imgSrc}
                alt="Farmer standing in a green agricultural field holding a smartphone"
                className="w-full h-full object-cover object-center transition-opacity duration-300"
                onError={() => {
                  setImgSrc(heroPhotoFallback);
                }}
              />
              {/* Warm sunrise gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

              {/* Status pill on hero */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary-dark flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Kisan Mitra • 24x7 AI Farming Assistant</span>
              </div>
            </div>
          </div>

          {/* Language Selection Section */}
          <div className="w-full mt-2">
            <h2 className="text-[16px] font-bold text-slate-800 mb-2.5 text-left font-sans">
              Choose your language
            </h2>

            {/* 2-Column Grid of Pill Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.id)}
                    className={`h-[48px] rounded-xl px-3.5 flex items-center justify-between text-base font-medium transition-all duration-150 active:scale-[0.98] select-none cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary ring-offset-1 font-semibold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Language Script Name */}
                    <span className="text-[17px] tracking-wide">
                      {lang.label}
                    </span>

                    {/* Status Indicator */}
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-normal">
                        {lang.sub}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA: Continue Button */}
          <div className="mt-5 pt-1 w-full">
            <PrimaryButton
              disabled={!selectedLang}
              onClick={handleContinue}
              className="text-[16px] tracking-wide"
            >
              Continue
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
