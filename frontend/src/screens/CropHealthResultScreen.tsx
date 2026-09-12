import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Sparkles,
  BookmarkCheck,
  HelpCircle,
  Share2,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { DiagnosisResultData, mockDiagnosisResult } from '../data/mockDiagnosisResult';

export interface CropHealthResultScreenProps {
  onBack: () => void;
  onSaveReport: () => void;
  onSeeMoreTips?: () => void;
  diagnosisData?: DiagnosisResultData;
  capturedImage?: string | null;
  forceMobile?: boolean;
}

export const CropHealthResultScreen: React.FC<CropHealthResultScreenProps> = ({
  onBack,
  onSaveReport,
  onSeeMoreTips,
  diagnosisData = mockDiagnosisResult,
  capturedImage,
  forceMobile = false,
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [tipsModalOpen, setTipsModalOpen] = useState<boolean>(false);

  // Use captured image if provided, otherwise fallback to diagnosis sample image
  const displayImage = capturedImage || diagnosisData.imageUrl;

  // Dynamic severity badge configuration mapping
  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          label: 'High Severity',
          bgClass: 'bg-urgent text-white',
          icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" />,
        };
      case 'medium':
        return {
          label: 'Medium Severity',
          bgClass: 'bg-warning text-slate-900 font-bold',
          icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" />,
        };
      case 'low':
      default:
        return {
          label: 'Low Severity',
          bgClass: 'bg-success text-white',
          icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.4]" />,
        };
    }
  };

  const severityBadge = getSeverityBadge(diagnosisData.severity);

  // Handle Save Report
  const handleSaveReport = () => {
    if (isSaving) return;
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);

      // Brief delay to let farmer see the confirmation toast before navigating
      setTimeout(() => {
        onSaveReport();
      }, 1100);
    }, 900);
  };

  // Handle See More Tips
  const handleSeeMoreTips = () => {
    if (onSeeMoreTips) {
      onSeeMoreTips();
    } else {
      console.log('[Crop Health Result] "See More Tips" clicked for:', diagnosisData.diseaseName);
      setTipsModalOpen(true);
    }
  };

  return (
    <DashboardLayout
      activeTab="crop-health"
      onTabChange={(tab) => {
        if (tab === 'home' || tab === 'crop-health') {
          onSaveReport();
        }
      }}
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Toast Notification: Report Saved */}
      {showSavedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
            <span>Report saved ✓</span>
          </div>
        </div>
      )}

      {/* Centered Column (~600–700px on desktop) matching Screen 4 */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-6">
        
        {/* ========================================================
            1. HEADER (Reused pattern from Screen 4)
            Back arrow (<-) + Label + Title
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Crop Health Check"
              aria-label="Back to Crop Health Check"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  AI CROP DOCTOR
                </span>
                <span className="text-farmBorder font-light">•</span>
                <span className="text-xs font-semibold text-farmText-gray">
                  Step 2 of 2
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight mt-0.5">
                Crop Health Result
              </h1>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. CAPTURED IMAGE PREVIEW
            Large rounded 16px, ~4:3 aspect ratio, overlay badge
           ======================================================== */}
        <div className="relative rounded-[16px] overflow-hidden border border-farmBorder bg-slate-950 shadow-xs aspect-[4/3] max-h-[340px] w-full">
          <img
            src={displayImage}
            alt={`${diagnosisData.diseaseName} affected leaf`}
            className="w-full h-full object-cover object-center"
          />

          {/* Top-Left Overlay Badge: Urgent Pill "⚠ Disease Detected" */}
          <div className="absolute top-3 left-3 bg-urgent text-white text-xs sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wide select-none">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Disease Detected</span>
          </div>

          {/* Top-Right Confidence Pill */}
          {diagnosisData.confidence && (
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-700 select-none">
              AI Confidence: {diagnosisData.confidence}%
            </div>
          )}

          {/* Bottom subtle gradient for image contrast */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* ========================================================
            3. DIAGNOSIS CARD
            White bg, rounded 16px, disease name, subtitle, severity pill
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-farmText-gray">
                Identified Condition
              </span>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-farmText-dark tracking-tight mt-0.5">
                {diagnosisData.diseaseName}
              </h2>
              <p className="text-xs sm:text-sm text-farmText-gray mt-0.5">
                {diagnosisData.diseaseType}
              </p>
            </div>

            {/* Dynamic Severity Badge */}
            <div
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs select-none ${severityBadge.bgClass}`}
            >
              {severityBadge.icon}
              <span>{severityBadge.label}</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. RECOMMENDED ACTION SECTION
            Section label + 3 reusable recommendation rows
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-farmText-dark">
              Recommended Action
            </h3>
            <span className="text-[11px] font-semibold text-primary bg-primary-tint/60 px-2.5 py-0.5 rounded-full">
              Kisan Advisory
            </span>
          </div>

          {/* Recommendation List Rows (Reusable Pattern) */}
          <div className="space-y-2.5">
            {diagnosisData.recommendations.map((recommendation, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 sm:p-3.5 rounded-[12px] bg-slate-50/80 border border-slate-100 hover:border-primary/20 hover:bg-primary-subtle/30 transition-colors"
              >
                {/* Left Icon: Green pill with CheckCircle/Leaf */}
                <div className="w-6 h-6 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>

                {/* Right Content */}
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-farmText-dark leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Doctor Tip Card */}
          <div className="mt-2 p-3 rounded-[12px] bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Timely Action Tip:</strong> Apply spray in early morning or late evening for maximum absorption and to prevent chemical scorch in hot weather.
            </p>
          </div>
        </div>

        {/* ========================================================
            5. BOTTOM ACTIONS
            Stacked, full-width on mobile / fixed-width centered on desktop
           ======================================================== */}
        <div className="pt-2 w-full sm:w-[360px] mx-auto space-y-3">
          {/* Primary Action: Save Report */}
          <button
            type="button"
            onClick={handleSaveReport}
            disabled={isSaving}
            className="w-full h-[52px] min-h-[44px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 cursor-pointer select-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Saving Report...</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-5 h-5" />
                <span>Save Report</span>
              </>
            )}
          </button>

          {/* Secondary Action: See More Tips */}
          <button
            type="button"
            onClick={handleSeeMoreTips}
            className="w-full h-[48px] min-h-[44px] rounded-[12px] bg-white hover:bg-primary-subtle active:scale-[0.99] border-2 border-primary text-primary font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none shadow-xs"
          >
            <Leaf className="w-4 h-4" />
            <span>See More Tips</span>
          </button>

          <p className="text-[11px] text-farmText-gray text-center pt-1">
            Saved reports can be accessed anytime in <strong>My Lots & Alerts</strong>.
          </p>
        </div>

      </div>

      {/* Optional Tips Stub Modal / Sheet */}
      {tipsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[20px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-farmBorder animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-farmBorder">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-tint text-primary flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-farmText-dark">
                  Tips for {diagnosisData.diseaseName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setTipsModalOpen(false)}
                className="text-farmText-gray hover:text-farmText-dark text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-farmText-dark">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-primary-dark mb-0.5">Recommended Fungicide Dosage:</p>
                <p className="text-farmText-gray text-xs">Tricyclazole 75% WP @ 0.6g per liter of water OR Validamycin 3% L @ 2ml per liter.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-primary-dark mb-0.5">Fertilizer Adjustment:</p>
                <p className="text-farmText-gray text-xs">Avoid excess nitrogen fertilizers (Urea) as high nitrogen increases fungal vulnerability.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-primary-dark mb-0.5">Need Expert Assistance?</p>
                <p className="text-farmText-gray text-xs">Call Kisan Call Center toll-free at <strong>1800-180-1551</strong> with your FasalSetu report ID: #{diagnosisData.id}.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTipsModalOpen(false)}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-[12px] font-bold text-sm transition-colors cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CropHealthResultScreen;
