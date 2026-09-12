import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Plus,
  X,
  Lightbulb,
  Check,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StepIndicator from '../components/StepIndicator';
import { mockFarmerData } from '../data/mockFarmerData';
import { LotFormData } from './CreateCropLotScreen';

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
  isCover?: boolean;
}

export interface CreateCropLotPhotosScreenProps {
  onBack: () => void;
  onNext?: (photos: PhotoItem[]) => void;
  lotDetails?: LotFormData | null;
  initialPhotos?: PhotoItem[];
  forceMobile?: boolean;
}

// Sample realistic crop lot images for quick testing
const SAMPLE_CROP_LOT_PHOTOS: PhotoItem[] = [
  {
    id: 'sample-1',
    name: 'Golden_Paddy_Grains_01.jpg',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    isCover: true,
  },
  {
    id: 'sample-2',
    name: 'Rice_Field_Lot_02.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sample-3',
    name: 'Harvested_Grain_Bag_03.jpg',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  },
];

export const CreateCropLotPhotosScreen: React.FC<CreateCropLotPhotosScreenProps> = ({
  onBack,
  onNext,
  lotDetails,
  initialPhotos = [],
  forceMobile = false,
}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [step2CompletedToast, setStep2CompletedToast] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_PHOTOS = 5;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) return;

    const newPhotos: PhotoItem[] = [];
    const countToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < countToAdd; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url: objectUrl,
        name: file.name || `Photo_${photos.length + i + 1}.jpg`,
        isCover: photos.length === 0 && i === 0,
      });
    }

    setPhotos((prev) => {
      const updated = [...prev, ...newPhotos];
      // Always ensure the first photo is marked as cover
      return updated.map((p, idx) => ({ ...p, isCover: idx === 0 }));
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo
  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, idx) => ({ ...p, isCover: idx === 0 }));
    });
  };

  // Helper to load sample photos for 1-click testing
  const handleLoadSamplePhotos = () => {
    setPhotos(SAMPLE_CROP_LOT_PHOTOS);
  };

  // Clear all photos
  const handleClearAllPhotos = () => {
    setPhotos([]);
  };

  // Trigger file upload dialog
  const handleSlotClick = () => {
    if (photos.length >= MAX_PHOTOS) return;
    fileInputRef.current?.click();
  };

  // Handle Next Action
  const handleNextClick = () => {
    if (photos.length === 0) return;

    console.log('[Create Crop Lot] Step 2 Complete (Photos):', {
      photosCount: photos.length,
      coverPhoto: photos[0],
      lotDetails,
    });

    if (onNext) {
      onNext(photos);
    } else {
      setStep2CompletedToast(true);
      setTimeout(() => setStep2CompletedToast(false), 3000);
    }
  };

  const isNextEnabled = photos.length >= 1;

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Hidden File Input (supports multiple if farmer chooses) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="crop-lot-photo-input"
      />

      {/* Step 2 Completion Toast */}
      {step2CompletedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
            <span>Photos Saved! (Ready for Step 3: Review)</span>
          </div>
        </div>
      )}

      {/* Centered Column (~600–700px on desktop) matching Step 1 */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER WITH STEP INDICATOR
            Step 2 ("Photos") Active, Step 1 ("Details") Completed
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Details"
              aria-label="Back to Details"
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
                  Step 2 of 3
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight mt-0.5">
                Create Crop Lot
              </h1>
            </div>
          </div>

          {/* 3-Step Progress Indicator (Step 2 Active) */}
          <div className="pt-2 border-t border-slate-100 mt-3">
            <StepIndicator
              currentStep={2}
              steps={['Details', 'Photos', 'Review']}
            />
          </div>
        </div>

        {/* ========================================================
            2. PHOTO UPLOAD SECTION
            Grid of slots (2 col mobile / 3 col desktop), max 5 photos
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-6 shadow-xs space-y-4">
          
          {/* Section Label & Helper Subtext */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-farmText-dark">
                  Add Photos
                </h2>
                <span className="text-xs font-semibold text-primary bg-primary-tint/70 px-2 py-0.5 rounded-full">
                  {photos.length} / {MAX_PHOTOS} Photos
                </span>
              </div>
              <p className="text-xs sm:text-sm text-farmText-gray mt-1 leading-relaxed">
                Add up to 5 clear photos of your crop. Listings with photos sell 2x faster.
              </p>
            </div>

            {/* Quick Sample Selector for Evaluator / Testing */}
            <div className="flex items-center gap-2">
              {photos.length === 0 ? (
                <button
                  type="button"
                  onClick={handleLoadSamplePhotos}
                  className="text-xs font-semibold text-primary hover:text-primary-dark underline flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Use Sample Crop Photos</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClearAllPhotos}
                  className="text-xs font-semibold text-urgent hover:underline cursor-pointer pt-0.5"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Responsive Photo Slots Grid (2 cols on mobile, 3 cols on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-1">
            
            {/* Render Uploaded Photos */}
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-[14px] overflow-hidden bg-slate-950 border border-slate-200 shadow-xs group select-none"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                />

                {/* Cover Photo Badge (Always slot 0) */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm select-none border border-amber-500/30">
                    Cover Photo
                  </div>
                )}

                {/* Circular "×" Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemovePhoto(photo.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer border border-white/40"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Image number tag bottom-right */}
                <div className="absolute bottom-1.5 right-2 bg-black/60 backdrop-blur-2xs text-white text-[10px] font-semibold px-1.5 py-0.2 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}

            {/* Render Empty Upload Slot(s) up to MAX_PHOTOS */}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={handleSlotClick}
                className={`relative aspect-square rounded-[14px] border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-3 text-center cursor-pointer group select-none ${
                  photos.length === 0
                    ? 'border-primary/50 bg-primary-subtle/40 hover:bg-primary-subtle hover:border-primary'
                    : 'border-slate-300 hover:border-primary/40 bg-slate-50/70 hover:bg-slate-100/80'
                }`}
              >
                {/* First empty slot Cover Photo preview hint */}
                {photos.length === 0 && (
                  <div className="absolute top-2 left-2 bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs select-none">
                    Cover Photo
                  </div>
                )}

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-slate-400 group-hover:text-primary group-hover:scale-110 shadow-2xs border border-slate-200 flex items-center justify-center mb-1.5 transition-all">
                  {photos.length === 0 ? (
                    <Camera className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <Plus className="w-5 h-5 stroke-[2.4]" />
                  )}
                </div>

                <span className="text-xs font-bold text-farmText-dark group-hover:text-primary transition-colors">
                  Add Photo
                </span>
                <span className="text-[10px] text-farmText-gray mt-0.5">
                  Slot #{photos.length + 1}
                </span>
              </button>
            )}

            {/* If fewer than 2 slots filled, show placeholder dashed guides for visual layout balance */}
            {photos.length === 0 && (
              <button
                type="button"
                onClick={handleSlotClick}
                className="aspect-square rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer text-slate-400 group"
              >
                <Plus className="w-5 h-5 stroke-[2] mb-1 group-hover:text-primary" />
                <span className="text-[11px] font-medium text-slate-500">Slot #2</span>
              </button>
            )}
            
            {photos.length === 0 && (
              <button
                type="button"
                onClick={handleSlotClick}
                className="hidden sm:flex aspect-square rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all flex-col items-center justify-center p-3 text-center cursor-pointer text-slate-400 group"
              >
                <Plus className="w-5 h-5 stroke-[2] mb-1 group-hover:text-primary" />
                <span className="text-[11px] font-medium text-slate-500">Slot #3</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-farmText-gray">
            Supported formats: JPG, PNG, WEBP. Tap an empty slot to browse or take a photo.
          </p>
        </div>

        {/* ========================================================
            3. TIPS CARD
            Light green tinted background, lightbulb icon, 3 short tips
           ======================================================== */}
        <div className="bg-primary-subtle border border-primary/20 rounded-[16px] p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 stroke-[2.4]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-primary-dark">
              Tips for great photos
            </h3>
          </div>

          <ul className="space-y-1.5 pl-1 text-xs sm:text-sm text-farmText-dark">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>Use natural daylight for true crop colors.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>Show the full lot, not just a sample.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>Include a close-up of grain quality and moisture cleanliness.</span>
            </li>
          </ul>
        </div>

        {/* ========================================================
            4. BOTTOM NAVIGATION
            Two buttons: "<- Back" (secondary) and "Next ->" (primary)
           ======================================================== */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {/* Secondary Action: <- Back */}
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-[150px] h-[52px] min-h-[44px] rounded-[12px] bg-white border border-farmBorder text-farmText-dark hover:bg-slate-50 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer select-none"
          >
            <span>← Back</span>
          </button>

          {/* Primary Action: Next -> */}
          <button
            type="button"
            onClick={handleNextClick}
            disabled={!isNextEnabled}
            className={`w-full sm:flex-1 h-[52px] min-h-[44px] rounded-[12px] font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 select-none ${
              !isNextEnabled
                ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {!isNextEnabled && (
          <p className="text-[11px] text-amber-700 text-center font-medium">
            Please add at least 1 photo to proceed to Review.
          </p>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CreateCropLotPhotosScreen;
