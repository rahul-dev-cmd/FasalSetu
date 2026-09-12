import React, { useState } from 'react';
import { Sprout, ArrowRight, Check } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';

export interface LanguageOption {
  id: string;
  nativeLabel: string;
  englishLabel: string;
}

export interface LanguageSelectionScreenProps {
  onContinue?: (selectedLanguage: string) => void;
  forceMobile?: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'hi', nativeLabel: 'हिंदी', englishLabel: 'Hindi' },
  { id: 'en', nativeLabel: 'English', englishLabel: 'English' },
  { id: 'mr', nativeLabel: 'मराठी', englishLabel: 'Marathi' },
  { id: 'gu', nativeLabel: 'ગુજરાતી', englishLabel: 'Gujarati' },
  { id: 'te', nativeLabel: 'తెలుగు', englishLabel: 'Telugu' },
  { id: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil' },
];

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  onContinue,
  forceMobile = false,
}) => {
  // Pre-selected/active by default: हिंदी (Hindi)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');

  const handleLanguageSelect = (id: string) => {
    setSelectedLanguage(id);
  };

  const handleContinue = () => {
    console.log('Navigating to Screen 2: "Tell us about your farm"', {
      selectedLanguage,
    });
    if (onContinue) {
      onContinue(selectedLanguage);
    }
  };

  return (
    <OnboardingLayout
      forceMobile={forceMobile}
      brandPanelProps={{
        badgeText: 'Screen 1 of 2 • Language Selection',
        taglineTitle: 'Smart Decisions. Better Harvests. Higher Profits.',
        taglineDescription:
          'Empowering Indian farmers with AI crop diagnostics, real-time APMC mandi rates, and personalized weather advisories in your own language.',
        forceMobile,
      }}
    >
      <div className="flex flex-col justify-between flex-1 h-full">
        {/* Mobile Branding Section (Visible on true mobile or when forceMobile is enabled) */}
        <div
          className={`flex flex-col items-center text-center ${
            forceMobile ? 'block' : 'md:hidden'
          } mb-3 pt-1`}
        >
          <div className="w-11 h-11 rounded-full bg-primary-tint flex items-center justify-center mb-1.5 shadow-xs">
            <Sprout className="w-5 h-5 text-primary stroke-[2.5]" />
          </div>
          <h1 className="text-[22px] font-bold text-primary tracking-tight font-sans">
            FasalSetu
          </h1>
          <p className="text-[12px] text-farmText-gray font-medium mt-0.5">
            स्मार्ट खेती, समृद्ध किसान
          </p>
        </div>

        {/* Desktop Right Header (≥768px, hidden if forceMobile) */}
        <div className={`${forceMobile ? 'hidden' : 'hidden md:block'} mb-4`}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-primary-tint flex items-center justify-center">
              <Sprout className="w-4 h-4 text-primary stroke-[2.5]" />
            </div>
            <span className="text-[24px] lg:text-[28px] font-bold text-primary tracking-tight">
              FasalSetu
            </span>
          </div>
          <p className="text-sm text-farmText-gray font-medium">
            स्मार्ट खेती, समृद्ध किसान
          </p>
          <p className="text-xs text-farmText-muted mt-1">
            Smart Decisions. Better Harvests. Higher Profits.
          </p>
        </div>

        {/* Language Selection Section */}
        <div className="my-auto py-2">
          {/* Section Label: 16px, medium weight, dark gray */}
          <label className="block text-[16px] font-medium text-farmText-dark mb-2.5 text-left">
            Choose your language
          </label>

          {/* 
            Language Grid:
            - On mobile or forceMobile: strictly 2 columns
            - On desktop (≥1024px): 3 columns
            - Each button ~48px height, generous tap targets
          */}
          <div
            className={`grid grid-cols-2 ${
              forceMobile ? 'grid-cols-2' : 'lg:grid-cols-3'
            } gap-2.5 sm:gap-3`}
          >
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`h-[48px] min-h-[44px] rounded-[12px] px-3 sm:px-3.5 flex items-center justify-between text-left transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isSelected
                      ? 'bg-primary text-white shadow-chip border border-primary font-semibold'
                      : 'bg-white text-farmText-dark border border-farmBorder hover:border-gray-400 hover:shadow-chip-hover hover:-translate-y-0.5'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-[16px] sm:text-[17px] font-medium tracking-normal truncate">
                    {lang.nativeLabel}
                  </span>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[11px] sm:text-[12px] text-farmText-gray font-normal shrink-0 ml-1">
                      {lang.englishLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Section */}
        <div className="pt-4 mt-3 border-t border-slate-100 md:border-transparent flex flex-col items-center md:items-start">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`w-full ${
              forceMobile ? 'w-full' : 'md:w-auto md:min-w-[220px]'
            } h-[52px] min-h-[44px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 px-8 shadow-cta transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none`}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <p className="text-[11px] text-farmText-gray text-center md:text-left mt-2.5">
            You can change your language anytime from app settings.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default LanguageSelectionScreen;
