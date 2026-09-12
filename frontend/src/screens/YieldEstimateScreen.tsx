import React, { useState } from 'react';
import {
  ArrowLeft,
  Wheat,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Check,
  TrendingUp,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Scale,
  X,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { YieldEstimateData, mockYieldData, formatIndianCurrency } from '../data/mockYieldData';
import { advisoryApi } from '../services/api';

const mapBackendYield = (res: any): YieldEstimateData => ({
  fieldName: res.field_name || 'Main Field (Plot A)',
  cropName: res.crop_name || 'Cotton',
  lastUpdated: res.last_updated ? new Date(res.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Updated today',
  expectedYieldMin: res.expected_yield_min,
  expectedYieldMax: res.expected_yield_max,
  yieldUnit: res.yield_unit || 'quintals',
  harvestWindowStart: res.harvest_window_start,
  harvestWindowEnd: res.harvest_window_end,
  harvestETA: res.harvest_eta || 'in 2-3 months',
  estimatedValueMin: res.estimated_value_min,
  estimatedValueMax: res.estimated_value_max,
  progressPercent: res.progress_percent ?? 68,
  trackingStatus: (res.tracking_status as any) || 'On Track',
  healthFactor: res.health_factor || 'Optimal',
});

export interface YieldEstimateScreenProps {
  onBack: () => void;
  onViewDetails?: () => void;
  data?: YieldEstimateData;
  forceMobile?: boolean;
}

export const YieldEstimateScreen: React.FC<YieldEstimateScreenProps> = ({
  onBack,
  onViewDetails,
  data = mockYieldData,
  forceMobile = false,
}) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [yieldData, setYieldData] = useState<YieldEstimateData>(data);

  React.useEffect(() => {
    let isMounted = true;
    const fetchLiveYield = async () => {
      try {
        const live = await advisoryApi.getYieldEstimate({
          crop: 'cotton',
          land_size_acres: 2.5,
          sowing_date: '2026-06-15',
        });
        if (isMounted && live) {
          setYieldData(mapBackendYield(live));
        }
      } catch (err) {
        console.warn('Backend yield estimate fallback:', err);
      }
    };
    fetchLiveYield();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    fieldName,
    cropName,
    lastUpdated,
    expectedYieldMin,
    expectedYieldMax,
    yieldUnit,
    harvestWindowStart,
    harvestWindowEnd,
    harvestETA,
    estimatedValueMin,
    estimatedValueMax,
    progressPercent,
    trackingStatus,
    healthFactor,
  } = yieldData;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      console.log('[Yield Estimate] "View Details" clicked for:', fieldName);
      setDetailsModalOpen(true);
    }
  };

  return (
    <DashboardLayout
      activeTab="yield"
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
      {/* Centered Column (~600–700px on desktop) consistent with Screens 4–6 */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER (Matches Screen 6 pattern)
            Back arrow (<-) + Title + Subtitle with Field Name & Time
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
                Yield & Harvest Estimate
              </h1>
              <p className="text-xs sm:text-[13px] text-farmText-gray mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-slate-700">{fieldName}</span>
                <span className="text-farmBorder font-light">•</span>
                <span>{lastUpdated}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. HERO ILLUSTRATION CARD
            Full-width, rounded 16px, soft green/gold gradient background
            SVG illustration of a maturing crop ripening toward harvest
           ======================================================== */}
        <div className="w-full rounded-[16px] overflow-hidden border border-[#E6E1D2] bg-gradient-to-b from-[#F2FBF5] via-[#FCF9EE] to-[#F6F1DF] shadow-xs relative p-4 sm:p-5 flex flex-col items-center justify-between min-h-[170px] sm:min-h-[190px]">
          {/* Top telemetry tag */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="bg-white/80 backdrop-blur-2xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-900 border border-amber-200/60 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>AI Crop Maturity Model · 94% Accuracy</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
              Ripening Phase
            </span>
          </div>

          {/* SVG Illustration: Maturing Golden Grain Crop */}
          <div className="w-full max-w-[400px] h-[125px] sm:h-[140px] my-1 relative">
            <svg
              viewBox="0 0 400 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                {/* Sun ambient glow */}
                <radialGradient id="sunGlow" cx="200" cy="110" r="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
                </radialGradient>
                {/* Golden grain gradient */}
                <linearGradient id="goldenGrain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                {/* Stem gradient */}
                <linearGradient id="stalkStem" x1="0" y1="140" x2="0" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#16A34A" />
                  <stop offset="50%" stopColor="#65A30D" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
                {/* Soil line gradient */}
                <linearGradient id="groundGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#78350F" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#92400E" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#78350F" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Ambient Golden Glow */}
              <circle cx="200" cy="90" r="85" fill="url(#sunGlow)" />

              {/* Ground Mound Line */}
              <path
                d="M 20 142 Q 110 137, 200 139 Q 290 141, 380 142"
                stroke="url(#groundGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Center Main Maturing Stalk (Ripening golden paddy/wheat ear) */}
              <path
                d="M 200 140 Q 201 95, 198 55 Q 196 35, 192 18"
                stroke="url(#stalkStem)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Left Stalk */}
              <path
                d="M 175 140 Q 170 100, 160 68 Q 152 45, 142 32"
                stroke="url(#stalkStem)"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Stalk */}
              <path
                d="M 225 140 Q 230 100, 240 68 Q 248 45, 258 32"
                stroke="url(#stalkStem)"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />

              {/* Center Head - Mature Golden Grains (Panicle) */}
              <g fill="url(#goldenGrain)" stroke="#B45309" strokeWidth="0.5">
                <ellipse cx="192" cy="18" rx="4" ry="7" transform="rotate(-15 192 18)" />
                <ellipse cx="195" cy="28" rx="4.5" ry="7.5" transform="rotate(18 195 28)" />
                <ellipse cx="190" cy="35" rx="4.5" ry="8" transform="rotate(-20 190 35)" />
                <ellipse cx="197" cy="45" rx="5" ry="8.5" transform="rotate(15 197 45)" />
                <ellipse cx="192" cy="54" rx="5" ry="8.5" transform="rotate(-18 192 54)" />
                <ellipse cx="199" cy="65" rx="5" ry="8" transform="rotate(12 199 65)" />
                <ellipse cx="194" cy="74" rx="4.5" ry="7.5" transform="rotate(-15 194 74)" />
              </g>

              {/* Left Head - Ripening Grains */}
              <g fill="url(#goldenGrain)" stroke="#B45309" strokeWidth="0.5">
                <ellipse cx="142" cy="32" rx="3.8" ry="6.5" transform="rotate(-35 142 32)" />
                <ellipse cx="149" cy="41" rx="4" ry="7" transform="rotate(10 149 41)" />
                <ellipse cx="145" cy="50" rx="4.2" ry="7.5" transform="rotate(-25 145 50)" />
                <ellipse cx="154" cy="59" rx="4.5" ry="7.5" transform="rotate(12 154 59)" />
                <ellipse cx="152" cy="69" rx="4.2" ry="7" transform="rotate(-18 152 69)" />
              </g>

              {/* Right Head - Ripening Grains */}
              <g fill="url(#goldenGrain)" stroke="#B45309" strokeWidth="0.5">
                <ellipse cx="258" cy="32" rx="3.8" ry="6.5" transform="rotate(35 258 32)" />
                <ellipse cx="251" cy="41" rx="4" ry="7" transform="rotate(-10 251 41)" />
                <ellipse cx="255" cy="50" rx="4.2" ry="7.5" transform="rotate(25 255 50)" />
                <ellipse cx="246" cy="59" rx="4.5" ry="7.5" transform="rotate(-12 246 59)" />
                <ellipse cx="248" cy="69" rx="4.2" ry="7" transform="rotate(18 248 69)" />
              </g>

              {/* Supporting Green Flag Leaves */}
              <path
                d="M 197 85 Q 165 92, 140 108"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 199 80 Q 235 88, 265 102"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 197 105 Q 160 115, 125 128"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 200 102 Q 240 112, 275 125"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Golden Pollen / Grain Speckles */}
              <circle cx="178" cy="48" r="1.5" fill="#F59E0B" opacity="0.8" />
              <circle cx="218" cy="38" r="1.8" fill="#F59E0B" opacity="0.7" />
              <circle cx="160" cy="25" r="1.5" fill="#FBBF24" opacity="0.9" />
              <circle cx="238" cy="28" r="1.5" fill="#FBBF24" opacity="0.9" />
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-amber-900/70 pt-1 font-medium border-t border-[#EAE3D3]">
            <span>Crop: {cropName}</span>
            <span>Est. Maturity in ~70 Days</span>
          </div>
        </div>

        {/* ========================================================
            3. EXPECTED YIELD CARD
            White bg, rounded 16px, light shadow, grain icon on left
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4 hover:border-slate-300 transition-colors">
          {/* Grain/Wheat Icon (Amber/Gold) */}
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Wheat className="w-6 h-6 stroke-[2.3]" />
          </div>

          <div className="flex-1">
            <span className="text-sm font-medium text-farmText-gray block">
              Expected Yield
            </span>
            <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
              <span className="text-[20px] sm:text-[22px] font-bold text-farmText-dark tracking-tight">
                {expectedYieldMin} – {expectedYieldMax} {yieldUnit}
              </span>
              <span className="text-xs text-farmText-gray font-medium">
                (per acre)
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. HARVEST WINDOW CARD
            White bg, rounded 16px, light shadow, calendar icon on left
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4 hover:border-slate-300 transition-colors">
          {/* Calendar Icon (Green) */}
          <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-6 h-6 stroke-[2.3]" />
          </div>

          <div className="flex-1">
            <span className="text-sm font-medium text-farmText-gray block">
              Harvest Window
            </span>
            <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
              <span className="text-[18px] sm:text-[20px] font-bold text-farmText-dark tracking-tight">
                {harvestWindowStart} – {harvestWindowEnd}
              </span>
              <span className="text-xs text-farmText-gray font-medium">
                ({harvestETA})
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. ESTIMATED VALUE CARD
            White bg, rounded 16px, light shadow, rupee icon on left
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:gap-4 hover:border-slate-300 transition-colors">
          {/* Rupee Icon (Amber/Gold) */}
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
            <IndianRupee className="w-6 h-6 stroke-[2.4]" />
          </div>

          <div className="flex-1">
            <span className="text-sm font-medium text-farmText-gray block">
              Estimated Value
            </span>
            <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
              <span className="text-[20px] sm:text-[22px] font-bold text-farmText-dark tracking-tight">
                {formatIndianCurrency(estimatedValueMin)} – {formatIndianCurrency(estimatedValueMax)}
              </span>
              <span className="text-xs text-farmText-gray font-medium">
                (at current market rate)
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            6. PROGRESS TRACKER CARD
            White bg, rounded 16px, light shadow
            "On track" checkmark + Horizontal progress bar + Subtext
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            {/* Label: "On track" with green checkmark */}
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm sm:text-base">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>{trackingStatus}</span>
            </div>

            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Horizontal Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${Math.min(Math.max(progressPercent, 5), 100)}%` }}
            />
          </div>

          {/* Subtext below bar */}
          <div className="flex items-center gap-1.5 text-xs text-farmText-gray pt-0.5">
            <Check className="w-3.5 h-3.5 text-primary stroke-[3] shrink-0" />
            <span>{healthFactor}</span>
          </div>
        </div>

        {/* ========================================================
            7. BOTTOM ACTION
            Full-width (mobile) / fixed-width centered (desktop)
            Solid green #16A34A, white bold text "View Details", rounded 12px
           ======================================================== */}
        <div className="pt-2 w-full sm:w-[320px] mx-auto">
          <button
            type="button"
            onClick={handleViewDetails}
            className="w-full h-[52px] min-h-[44px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 cursor-pointer select-none"
          >
            <span>View Details</span>
          </button>

          <p className="text-[11px] text-farmText-gray text-center mt-2.5">
            Yield calculated from ICAR agronomic benchmarks, sowing date, and mandi prices.
          </p>
        </div>

      </div>

      {/* Optional Details Modal / Breakdown Sheet */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[20px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-farmBorder space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-farmBorder">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-farmText-dark">
                  Yield Breakdown: {fieldName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-farmText-gray hover:text-farmText-dark text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="text-farmText-gray font-medium">Mandi Benchmark Price:</span>
                <span className="font-bold text-farmText-dark">₹3,000 / quintal</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="text-farmText-gray font-medium">Estimated Input Cost:</span>
                <span className="font-bold text-farmText-dark">₹23,500 / acre</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center border border-emerald-200">
                <span className="text-emerald-900 font-semibold">Projected Net Profit:</span>
                <span className="font-bold text-primary text-base">
                  {formatIndianCurrency(data.projectedProfitPerAcre || 48500)} / acre
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetailsModalOpen(false)}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-[12px] font-bold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default YieldEstimateScreen;
