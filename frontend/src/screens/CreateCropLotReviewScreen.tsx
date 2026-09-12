import React, { useState } from 'react';
import {
  ArrowLeft,
  Sprout,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Check,
  Scale,
  Sparkles,
  TrendingUp,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StepIndicator from '../components/StepIndicator';
import { mockFarmerData } from '../data/mockFarmerData';
import { LotFormData } from './CreateCropLotScreen';
import { PhotoItem } from './CreateCropLotPhotosScreen';
import { mockPriceEstimate, getEstimatedPriceForCrop } from '../data/mockPriceEstimate';

export interface CreateCropLotReviewScreenProps {
  onBack: () => void;
  onEditStep1?: () => void;
  onPublishSuccess?: () => void;
  lotDetails?: LotFormData | null;
  photos?: PhotoItem[];
  forceMobile?: boolean;
}

// Fallback sample photos if farmer directly navigates to review
const DEFAULT_REVIEW_PHOTOS: PhotoItem[] = [
  {
    id: 'sample-rev-1',
    name: 'Golden_Paddy_Grains_01.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    isCover: true,
  },
  {
    id: 'sample-rev-2',
    name: 'Rice_Field_Lot_02.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample-rev-3',
    name: 'Harvested_Grain_Bag_03.jpg',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  },
];

export const CreateCropLotReviewScreen: React.FC<CreateCropLotReviewScreenProps> = ({
  onBack,
  onEditStep1,
  onPublishSuccess,
  lotDetails,
  photos = [],
  forceMobile = false,
}) => {
  const [confirmationChecked, setConfirmationChecked] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showPublishedToast, setShowPublishedToast] = useState<boolean>(false);

  // Consolidated lot details with safe fallbacks
  const crop = lotDetails?.cropType || 'Rice';
  const qty = lotDetails?.quantity || '50';
  const unit = lotDetails?.quantityUnit || 'quintals';
  const grade = lotDetails?.grade || 'A (Premium)';
  const harvestDateRaw = lotDetails?.harvestDate || '2025-11-20';
  const location = lotDetails?.location || mockFarmerData.profile.location || 'Kothapet, Telangana';

  // Format date nicely: "2025-11-20" -> "Nov 20, 2025"
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Nov 20, 2025';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, monthIndex, day);
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (e) {}
    return dateStr;
  };

  // Usable photo list (using uploaded photos or fallback)
  const displayPhotos = photos.length > 0 ? photos : DEFAULT_REVIEW_PHOTOS;
  const coverPhoto = displayPhotos[0];
  const thumbnailPhotos = displayPhotos.slice(1);

  // Dynamic price estimation
  const priceData = getEstimatedPriceForCrop(crop, grade);

  // Handle Publish action
  const handlePublishListing = () => {
    if (!confirmationChecked || isPublishing) return;

    setIsPublishing(true);
    console.log('[Create Crop Lot] Publishing listing to marketplace:', {
      crop,
      quantity: `${qty} ${unit}`,
      grade,
      harvestDate: harvestDateRaw,
      location,
      photosCount: displayPhotos.length,
    });

    setTimeout(() => {
      setIsPublishing(false);
      setShowPublishedToast(true);

      setTimeout(() => {
        if (onPublishSuccess) {
          onPublishSuccess();
        } else {
          onBack();
        }
      }, 1200);
    }, 1500);
  };

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Toast Notification: Listing Published */}
      {showPublishedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
            <span>Listing published successfully ✓</span>
          </div>
        </div>
      )}

      {/* Centered Column (~600–700px on desktop) matching Steps 1 & 2 */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER WITH STEP INDICATOR
            Step 3 ("Review") Active, Steps 1 & 2 Completed
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Photos"
              aria-label="Back to Photos"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  MARKETPLACE LISTING
                </span>
                <span className="text-farmBorder font-light">•</span>
                <span className="text-xs font-semibold text-farmText-gray">
                  Step 3 of 3
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight mt-0.5">
                Create Crop Lot
              </h1>
            </div>
          </div>

          {/* 3-Step Progress Indicator (Step 3 Active, 1 & 2 Completed) */}
          <div className="pt-2 border-t border-slate-100 mt-3">
            <StepIndicator
              currentStep={3}
              steps={['Details', 'Photos', 'Review']}
            />
          </div>
        </div>

        {/* ========================================================
            2. PHOTO PREVIEW SECTION
            Large cover photo + horizontal thumbnail strip
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-farmText-gray">
              Listing Photos ({displayPhotos.length})
            </span>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
            >
              Change Photos
            </button>
          </div>

          {/* Large Cover Photo (~16:9 or 4:3) */}
          <div className="relative rounded-[14px] overflow-hidden bg-slate-950 aspect-[16/9] sm:aspect-[16/9] w-full border border-slate-200 shadow-inner">
            <img
              src={coverPhoto?.url}
              alt="Listing Cover Photo"
              className="w-full h-full object-cover object-center"
            />

            {/* Amber Cover Photo Pill Badge */}
            <div className="absolute top-3 left-3 bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-sm select-none border border-amber-500/30">
              Cover Photo
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>

          {/* Thumbnail Strip (Remaining photos) */}
          {thumbnailPhotos.length > 0 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-1">
              {thumbnailPhotos.slice(0, 4).map((thumb, idx) => (
                <div
                  key={thumb.id || idx}
                  className="w-[60px] h-[60px] rounded-[8px] overflow-hidden bg-slate-950 shrink-0 border border-slate-200 shadow-2xs relative group"
                >
                  <img
                    src={thumb.url}
                    alt={thumb.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/65 text-white text-[9px] font-semibold px-1 rounded">
                    #{idx + 2}
                  </div>
                </div>
              ))}

              {/* +N more indicator if more than 4 remaining photos */}
              {thumbnailPhotos.length > 4 && (
                <div className="w-[60px] h-[60px] rounded-[8px] bg-slate-100 border border-dashed border-slate-300 shrink-0 flex flex-col items-center justify-center text-farmText-gray text-xs font-bold">
                  <span>+{thumbnailPhotos.length - 4}</span>
                  <span className="text-[9px] font-semibold uppercase">more</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            3. LISTING SUMMARY CARD
            Clean label/value list format with thin dividers & Edit links
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h2 className="text-base font-bold text-farmText-dark">
              Listing Summary
            </h2>
            <span className="text-xs text-farmText-gray">
              Review your details
            </span>
          </div>

          <div className="space-y-0 divide-y divide-slate-100">
            
            {/* Row 1: Crop Type */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs sm:text-sm text-farmText-gray font-medium">
                Crop Type
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-farmText-dark flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>{crop}</span>
                </span>
                <button
                  type="button"
                  onClick={onEditStep1 || onBack}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Row 2: Quantity */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs sm:text-sm text-farmText-gray font-medium">
                Quantity
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-farmText-dark">
                  {qty} {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </span>
                <button
                  type="button"
                  onClick={onEditStep1 || onBack}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Row 3: Grade */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs sm:text-sm text-farmText-gray font-medium">
                Grade
              </span>
              <div className="flex items-center gap-3">
                <span className="bg-primary text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>{grade}</span>
                </span>
                <button
                  type="button"
                  onClick={onEditStep1 || onBack}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Row 4: Harvest Date */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs sm:text-sm text-farmText-gray font-medium">
                Harvest Date
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-farmText-dark">
                  {formatDisplayDate(harvestDateRaw)}
                </span>
                <button
                  type="button"
                  onClick={onEditStep1 || onBack}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Row 5: Location */}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs sm:text-sm text-farmText-gray font-medium">
                Location
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-farmText-dark flex items-center gap-1 truncate max-w-[190px] sm:max-w-[260px]">
                  <span>📍</span>
                  <span className="truncate">{location}</span>
                </span>
                <button
                  type="button"
                  onClick={onEditStep1 || onBack}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            4. ESTIMATED PRICE CARD
            Light green tinted background, rounded 16px
           ======================================================== */}
        <div className="bg-primary-subtle border border-primary/20 rounded-[16px] p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-farmText-gray">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Estimated Market Price</span>
            </div>
            <div className="text-[20px] sm:text-[22px] font-bold text-primary-dark tracking-tight mt-0.5">
              ₹{priceData.minPricePerQuintal.toLocaleString('en-IN')} – ₹{priceData.maxPricePerQuintal.toLocaleString('en-IN')}
              <span className="text-xs sm:text-sm font-medium text-farmText-gray ml-1">
                / {priceData.unit}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-farmText-gray mt-0.5">
              {priceData.basisText}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-block bg-primary-tint text-primary-dark text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">
              Verified Mandi Rate
            </span>
          </div>
        </div>

        {/* ========================================================
            5. TERMS / CONFIRMATION CHECKBOX ROW
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-3.5 sm:p-4 shadow-xs">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="confirm-lot-terms"
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
              className="w-4 h-4 text-primary accent-primary rounded border-gray-300 focus:ring-primary cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-sm text-farmText-gray font-normal leading-normal">
              I confirm this listing information is accurate
            </span>
          </label>
        </div>

        {/* ========================================================
            6. BOTTOM NAVIGATION
            "<- Back" (secondary) + "Publish Listing" (primary green)
           ======================================================== */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {/* Secondary Action: <- Back */}
          <button
            type="button"
            onClick={onBack}
            disabled={isPublishing}
            className="w-full sm:w-[150px] h-[52px] min-h-[44px] rounded-[12px] bg-white border border-farmBorder text-farmText-dark hover:bg-slate-50 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer select-none"
          >
            <span>← Back</span>
          </button>

          {/* Primary Action: Publish Listing */}
          <button
            type="button"
            onClick={handlePublishListing}
            disabled={!confirmationChecked || isPublishing}
            className={`w-full sm:flex-1 h-[52px] min-h-[44px] rounded-[12px] font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 select-none ${
              !confirmationChecked || isPublishing
                ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white cursor-pointer'
            }`}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Publish Listing</span>
              </>
            )}
          </button>
        </div>

        {!confirmationChecked && (
          <p className="text-[11px] text-amber-700 text-center font-medium">
            Please check the confirmation box above to publish your crop lot.
          </p>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CreateCropLotReviewScreen;
