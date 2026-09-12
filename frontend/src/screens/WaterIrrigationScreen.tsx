import React from 'react';
import {
  ArrowLeft,
  Droplets,
  Droplet,
  Leaf,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  CalendarCheck,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { IrrigationAdvisoryData, mockIrrigationData } from '../data/mockIrrigationData';
import { advisoryApi } from '../services/api';

const mapBackendIrrigation = (res: any): IrrigationAdvisoryData => ({
  soilMoistureLevel: res.soil_moisture_level || 'medium',
  moisturePercent: res.moisture_percent ?? 62,
  recommendation: res.recommendation,
  urgency: res.urgency || 'monitor',
  tips: res.tips || [],
  fieldZone: `${res.crop ? res.crop.toUpperCase() : 'MAIN'} FIELD · ${(res.soil_type || 'LOAMY').toUpperCase()} SOIL`,
  lastUpdated: res.last_updated ? new Date(res.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
});

export interface WaterIrrigationScreenProps {
  onBack: () => void;
  data?: IrrigationAdvisoryData;
  forceMobile?: boolean;
}

export const WaterIrrigationScreen: React.FC<WaterIrrigationScreenProps> = ({
  onBack,
  data = mockIrrigationData,
  forceMobile = false,
}) => {
  const [advisoryData, setAdvisoryData] = React.useState<IrrigationAdvisoryData>(data);

  React.useEffect(() => {
    let isMounted = true;
    const fetchLiveAdvisory = async () => {
      try {
        const live = await advisoryApi.getIrrigationAdvisory({
          latitude: 17.3850,
          longitude: 78.4867,
          crop: 'cotton',
          soil_type: 'clay',
        });
        if (isMounted && live) {
          setAdvisoryData(mapBackendIrrigation(live));
        }
      } catch (err) {
        console.warn('Backend irrigation advisory fallback:', err);
      }
    };
    fetchLiveAdvisory();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    soilMoistureLevel,
    moisturePercent,
    recommendation,
    urgency,
    tips,
    fieldZone,
    lastUpdated,
  } = advisoryData;

  // Dynamic color for Soil Moisture status
  const getMoistureStatusConfig = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return {
          label: 'Low',
          textColor: 'text-amber-500',
          badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-200',
          accentColor: '#F59E0B',
        };
      case 'medium':
        return {
          label: 'Medium',
          textColor: 'text-sky-600',
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
          accentColor: '#0284C7',
        };
      case 'high':
      default:
        return {
          label: 'High',
          textColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          accentColor: '#16A34A',
        };
    }
  };

  // Dynamic urgency border configuration
  const getUrgencyBorderClass = (urgencyLevel: 'monitor' | 'urgent' | 'ok') => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'border-l-4 border-l-urgent';
      case 'ok':
        return 'border-l-4 border-l-success';
      case 'monitor':
      default:
        return 'border-l-4 border-l-warning';
    }
  };

  const statusConfig = getMoistureStatusConfig(soilMoistureLevel);

  // Clamp percentage between 4% and 96% for the marker visual so it stays within bounds
  const clampedMarkerPosition = Math.min(Math.max(moisturePercent, 5), 95);

  return (
    <DashboardLayout
      activeTab="irrigation"
      onTabChange={(tab) => {
        if (tab === 'home') {
          onBack();
        }
      }}
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Centered Column (~600–700px on desktop) consistent with Screens 4–5 */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER
            Simple header: Back arrow (<-) + Title only (No step indicator)
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight">
                Water & Irrigation
              </h1>
              <p className="text-xs text-farmText-gray mt-0.5 flex items-center gap-1.5">
                <span>{fieldZone || 'Farm Moisture Report'}</span>
                <span className="text-farmBorder font-light">•</span>
                <span>{lastUpdated || 'Updated recently'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. FIELD / SOIL ILLUSTRATION CARD
            Soft earth-tone/beige gradient background with SVG soil cross-section
           ======================================================== */}
        <div className="w-full rounded-[16px] overflow-hidden border border-[#E5DAC8] bg-gradient-to-b from-[#FAF6EE] via-[#F4EDE2] to-[#E9DFCFC] shadow-xs relative p-4 sm:p-5 flex flex-col items-center justify-between min-h-[170px] sm:min-h-[190px]">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-2 left-3 bg-white/70 backdrop-blur-2xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-900/80 border border-amber-200/50 flex items-center gap-1.5 shadow-2xs">
            <Droplets className="w-3 h-3 text-sky-500" />
            <span>Estimated Soil Moisture</span>
          </div>

          {/* SVG Illustration: Soil Cross-Section & Plant Sprout */}
          <div className="w-full max-w-[380px] h-[130px] sm:h-[145px] mt-2 relative">
            <svg
              viewBox="0 0 400 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Soil strata gradient */}
                <linearGradient id="topsoilGrad" x1="0" y1="70" x2="0" y2="120" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8D5B36" />
                  <stop offset="100%" stopColor="#6C4124" />
                </linearGradient>
                <linearGradient id="subsoilGrad" x1="0" y1="120" x2="0" y2="160" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#5E381D" />
                  <stop offset="100%" stopColor="#4A2B14" />
                </linearGradient>
                {/* Sprout leaf gradient */}
                <linearGradient id="leafGrad" x1="180" y1="20" x2="220" y2="70" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
                {/* Droplet gradient */}
                <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>

              {/* Subsoil Layer (Bottom) */}
              <rect x="20" y="115" width="360" height="42" rx="10" fill="url(#subsoilGrad)" />

              {/* Subsoil Mineral Specks */}
              <circle cx="65" cy="135" r="3" fill="#8D5B36" opacity="0.6" />
              <circle cx="110" cy="142" r="2.5" fill="#B38054" opacity="0.5" />
              <circle cx="155" cy="130" r="3.5" fill="#7A4926" opacity="0.7" />
              <circle cx="250" cy="138" r="3" fill="#B38054" opacity="0.5" />
              <circle cx="295" cy="132" r="2.5" fill="#8D5B36" opacity="0.6" />
              <circle cx="340" cy="140" r="3.5" fill="#7A4926" opacity="0.6" />

              {/* Topsoil Layer (Middle with organic curve) */}
              <path
                d="M 20 80 Q 110 74, 200 78 Q 290 82, 380 76 L 380 120 L 20 120 Z"
                fill="url(#topsoilGrad)"
              />

              {/* Soil surface texture dots */}
              <circle cx="50" cy="94" r="2.5" fill="#B38054" opacity="0.6" />
              <circle cx="95" cy="102" r="3" fill="#5E381D" opacity="0.7" />
              <circle cx="140" cy="90" r="2" fill="#B38054" opacity="0.5" />
              <circle cx="270" cy="98" r="3" fill="#5E381D" opacity="0.8" />
              <circle cx="310" cy="91" r="2.5" fill="#B38054" opacity="0.6" />
              <circle cx="355" cy="100" r="3" fill="#5E381D" opacity="0.7" />

              {/* Root System growing downward from sprout */}
              {/* Main taproot */}
              <path
                d="M 200 78 Q 201 98, 200 122 Q 199 135, 202 144"
                stroke="#E2D4C3"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left lateral root 1 */}
              <path
                d="M 200 90 Q 185 96, 172 108"
                stroke="#D6C5B1"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left fine root */}
              <path
                d="M 180 100 Q 170 106, 162 112"
                stroke="#C7B39E"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right lateral root 1 */}
              <path
                d="M 200 95 Q 218 103, 230 114"
                stroke="#D6C5B1"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right fine root */}
              <path
                d="M 220 107 Q 232 116, 240 124"
                stroke="#C7B39E"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Moisture Droplets inside soil near roots */}
              <g opacity="0.9">
                <circle cx="160" cy="100" r="3.5" fill="url(#dropGrad)" />
                <circle cx="242" cy="108" r="3" fill="url(#dropGrad)" />
                <circle cx="188" cy="126" r="3" fill="url(#dropGrad)" />
                <circle cx="218" cy="132" r="3.5" fill="url(#dropGrad)" />
              </g>

              {/* Plant Stem emerging above soil */}
              <path
                d="M 200 78 Q 200 52, 199 38"
                stroke="#22C55E"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Left Sprout Leaf */}
              <path
                d="M 199 48 C 178 46, 166 32, 170 24 C 182 24, 196 36, 199 48 Z"
                fill="url(#leafGrad)"
              />
              {/* Left Leaf Center Vein */}
              <path
                d="M 199 48 Q 185 38, 173 27"
                stroke="#86EFAC"
                strokeWidth="1"
                fill="none"
              />

              {/* Right Sprout Leaf */}
              <path
                d="M 199 42 C 220 40, 232 26, 228 18 C 216 18, 202 30, 199 42 Z"
                fill="url(#leafGrad)"
              />
              {/* Right Leaf Center Vein */}
              <path
                d="M 199 42 Q 213 32, 225 21"
                stroke="#86EFAC"
                strokeWidth="1"
                fill="none"
              />

              {/* Small Young Bud at Center */}
              <ellipse cx="199" cy="36" rx="2.5" ry="4.5" fill="#86EFAC" />

              {/* Atmospheric Water Droplet Accents */}
              <path
                d="M 152 42 C 152 45, 149 48, 146 48 C 143 48, 140 45, 140 42 C 140 38, 146 32, 146 32 C 146 32, 152 38, 152 42 Z"
                fill="url(#dropGrad)"
                opacity="0.85"
              />
              <path
                d="M 252 34 C 252 37, 249 40, 246 40 C 243 40, 240 37, 240 34 C 240 30, 246 24, 246 24 C 246 24, 252 30, 252 34 Z"
                fill="url(#dropGrad)"
                opacity="0.85"
              />
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-amber-900/70 pt-1 font-medium border-t border-[#E8DFCFC]">
            <span>Topsoil Strata (0–15 cm)</span>
            <span>Subsoil Strata (15–30 cm)</span>
          </div>
        </div>

        {/* ========================================================
            3. SOIL MOISTURE CARD
            White bg, rounded 16px, light shadow
            Water drop icon (blue), Label, Status, Horizontal Gradient Bar
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-4">
          {/* Header Row: Icon + Label + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <span className="text-sm font-medium text-farmText-gray">
                  Soil Moisture
                </span>
                <div className="text-xs text-farmText-muted">
                  Based on weather, soil type & crop water needs
                </div>
              </div>
            </div>

            {/* Dynamic Status Value */}
            <div className="text-right">
              <span className={`text-[20px] sm:text-[22px] font-bold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
              <span className="block text-[11px] font-semibold text-farmText-gray">
                {moisturePercent}% Moisture
              </span>
            </div>
          </div>

          {/* Horizontal Gradient Bar / Slider Visual */}
          <div className="pt-2 pb-1">
            {/* Slider Track with Red -> Yellow -> Green gradient */}
            <div className="relative w-full h-3.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-inner">
              
              {/* Dynamic Marker Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
                style={{ left: `${clampedMarkerPosition}%` }}
              >
                {/* Marker Pill / Ring */}
                <div className="relative flex flex-col items-center">
                  {/* Floating Value Pill Above Marker */}
                  <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap border border-slate-700">
                    {moisturePercent}%
                    {/* Downward triangle arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>

                  {/* Marker Dot */}
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-800 shadow-md flex items-center justify-center ring-2 ring-white/60">
                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Scale Legends */}
            <div className="flex items-center justify-between text-[11px] text-farmText-gray font-medium mt-3 px-1">
              <span className="text-red-500 font-semibold">Dry (0%)</span>
              <span className="text-amber-600 font-semibold">Low (30%)</span>
              <span className="text-emerald-600 font-semibold">Optimal (70%+)</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. RECOMMENDED ACTION CARD
            White bg, rounded 16px, colored left accent bar matching urgency
            Water drop icon (blue), Label, Action text bold
           ======================================================== */}
        <div
          className={`bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs flex items-center gap-3.5 ${getUrgencyBorderClass(
            urgency
          )}`}
        >
          {/* Water Drop Icon (Blue) */}
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Droplet className="w-5 h-5 stroke-[2.4] fill-sky-200/60" />
          </div>

          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-farmText-gray block">
              Recommended Action
            </span>
            <p className="text-base sm:text-lg font-bold text-farmText-dark tracking-tight mt-0.5">
              {recommendation}
            </p>
          </div>

          {/* Urgency Pill */}
          <div className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>2–3 Days</span>
          </div>
        </div>

        {/* ========================================================
            5. QUICK TIPS SECTION
            Section label: "Quick Tips" (bold 16px)
            List of tip rows reusing the same row/list pattern as Screen 5
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-farmText-dark">
              Quick Tips
            </h2>
            <span className="text-[11px] font-semibold text-primary bg-primary-tint/60 px-2.5 py-0.5 rounded-full">
              Irrigation Guidelines
            </span>
          </div>

          {/* Reusable Tip List Rows */}
          <div className="space-y-2.5">
            {tips.map((tip, idx) => {
              // Alternate icons for variety: droplet, leaf, check
              const isDroplet = idx === 0 || tip.toLowerCase().includes('drip') || tip.toLowerCase().includes('sprinkler');
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 sm:p-3.5 rounded-[12px] bg-slate-50/80 border border-slate-100 hover:border-primary/20 hover:bg-primary-subtle/30 transition-colors"
                >
                  {/* Left Icon: Pill badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isDroplet
                        ? 'bg-sky-100 text-sky-600'
                        : 'bg-primary-tint text-primary'
                    }`}
                  >
                    {isDroplet ? (
                      <Droplet className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Leaf className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-farmText-dark leading-relaxed">
                      {tip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            6. BOTTOM ACTION
            Full-width (mobile) / fixed-width centered (desktop)
            Solid green #16A34A, white bold text "Got it", rounded 12px, min 44px
           ======================================================== */}
        <div className="pt-2 w-full sm:w-[320px] mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="w-full h-[52px] min-h-[44px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 cursor-pointer select-none"
          >
            <span>Got it</span>
          </button>

          <p className="text-[11px] text-farmText-gray text-center mt-2.5">
            Updated based on local weather forecast & crop water model.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default WaterIrrigationScreen;
