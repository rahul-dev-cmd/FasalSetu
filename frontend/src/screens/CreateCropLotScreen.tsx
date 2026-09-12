import React, { useState } from 'react';
import {
  ArrowLeft,
  Sprout,
  ChevronDown,
  Check,
  Calendar,
  MapPin,
  Award,
  Sparkles,
  ArrowRight,
  Scale,
  Edit2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StepIndicator from '../components/StepIndicator';
import { mockFarmerData } from '../data/mockFarmerData';

export interface LotFormData {
  cropType: string;
  quantity: string;
  quantityUnit: 'quintals' | 'kg' | 'tonnes';
  grade: 'A (Premium)' | 'B (Standard)' | 'C (Basic)';
  harvestDate: string;
  location: string;
}

export interface CreateCropLotScreenProps {
  onBack: () => void;
  onNext?: (data: LotFormData) => void;
  initialData?: Partial<LotFormData>;
  forceMobile?: boolean;
}

const CROP_TYPE_OPTIONS = [
  'Rice',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Pulses',
  'Vegetables',
  'Other',
];

const QUANTITY_UNIT_OPTIONS: Array<'quintals' | 'kg' | 'tonnes'> = [
  'quintals',
  'kg',
  'tonnes',
];

const GRADE_OPTIONS: Array<'A (Premium)' | 'B (Standard)' | 'C (Basic)'> = [
  'A (Premium)',
  'B (Standard)',
  'C (Basic)',
];

export const CreateCropLotScreen: React.FC<CreateCropLotScreenProps> = ({
  onBack,
  onNext,
  initialData,
  forceMobile = false,
}) => {
  // Form State
  const [cropType, setCropType] = useState<string>(initialData?.cropType || 'Rice');
  const [quantity, setQuantity] = useState<string>(initialData?.quantity?.toString() || '50');
  const [quantityUnit, setQuantityUnit] = useState<'quintals' | 'kg' | 'tonnes'>(
    initialData?.quantityUnit || 'quintals'
  );
  const [grade, setGrade] = useState<'A (Premium)' | 'B (Standard)' | 'C (Basic)'>(
    initialData?.grade || 'A (Premium)'
  );
  const [harvestDate, setHarvestDate] = useState<string>(
    initialData?.harvestDate || '2025-11-20'
  );
  const [location, setLocation] = useState<string>(
    initialData?.location || mockFarmerData.profile.location || 'Kothapet, Telangana'
  );

  // Dropdown states
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState<boolean>(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState<boolean>(false);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [customLocationInput, setCustomLocationInput] = useState<string>(location);
  const [step1CompletedToast, setStep1CompletedToast] = useState<boolean>(false);

  // Validation
  const isQuantityValid = parseFloat(quantity) > 0;
  const isFormValid = Boolean(
    cropType.trim() &&
    isQuantityValid &&
    grade &&
    harvestDate.trim() &&
    location.trim()
  );

  const handleNextClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const lotData: LotFormData = {
      cropType,
      quantity,
      quantityUnit,
      grade,
      harvestDate,
      location,
    };

    console.log('[Create Crop Lot] Step 1 Complete (Details):', lotData);

    if (onNext) {
      onNext(lotData);
    } else {
      setStep1CompletedToast(true);
      setTimeout(() => setStep1CompletedToast(false), 3000);
    }
  };

  const handleSaveLocation = () => {
    if (customLocationInput.trim()) {
      setLocation(customLocationInput.trim());
    }
    setIsEditingLocation(false);
  };

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Step 1 Completion Toast (Placeholder for Step 2) */}
      {step1CompletedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
            <span>Details Saved! (Ready for Step 2: Photos)</span>
          </div>
        </div>
      )}

      {/* Centered Column (~600–700px on desktop) */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER WITH STEP INDICATOR
            Back arrow (<-) + Title ("Create Crop Lot") + 3-Step Progress
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3 mb-2">
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Marketplace Listing
                </span>
                <span className="text-farmBorder font-light">•</span>
                <span className="text-xs font-semibold text-farmText-gray">
                  Step 1 of 3
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight mt-0.5">
                Create Crop Lot
              </h1>
            </div>
          </div>

          {/* 3-Step Progress Indicator */}
          <div className="pt-2 border-t border-slate-100 mt-3">
            <StepIndicator
              currentStep={1}
              steps={['Details', 'Photos', 'Review']}
            />
          </div>
        </div>

        {/* ========================================================
            2. FORM FIELDS
            Stacked, full-width, clean 12px rounded cards
           ======================================================== */}
        <form onSubmit={handleNextClick} className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-6 shadow-xs space-y-5">
          
          {/* ------------------------------------------------------
              FIELD A: Crop Type (Dropdown with Leaf Icon)
             ------------------------------------------------------ */}
          <div className="relative">
            <label className="block text-sm font-semibold text-farmText-dark mb-1.5 text-left">
              Crop Type <span className="text-urgent">*</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsCropDropdownOpen(!isCropDropdownOpen);
                setIsUnitDropdownOpen(false);
              }}
              className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3.5 flex items-center justify-between shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-tint/70 text-primary flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4 stroke-[2.3]" />
                </div>
                <span className="font-semibold text-base text-farmText-dark">
                  {cropType}
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-farmText-gray transition-transform duration-200 ${
                  isCropDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Options */}
            {isCropDropdownOpen && (
              <div className="absolute top-[78px] left-0 w-full bg-white border border-farmBorder rounded-[12px] shadow-lg py-1.5 z-30 max-h-56 overflow-y-auto">
                {CROP_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCropType(opt);
                      setIsCropDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      cropType === opt
                        ? 'bg-primary-tint/40 text-primary font-bold'
                        : 'text-farmText-dark font-medium'
                    }`}
                  >
                    <span>{opt}</span>
                    {cropType === opt && (
                      <Check className="w-4 h-4 text-primary stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------
              FIELD B: Quantity (Numeric Input + Unit Dropdown)
             ------------------------------------------------------ */}
          <div>
            <label className="block text-sm font-semibold text-farmText-dark mb-1.5 text-left">
              Quantity <span className="text-urgent">*</span>
            </label>

            <div className="grid grid-cols-12 gap-3">
              {/* Numeric Input */}
              <div className="col-span-7 sm:col-span-8 relative">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3.5 text-base text-farmText-dark font-semibold shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Unit Dropdown */}
              <div className="col-span-5 sm:col-span-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnitDropdownOpen(!isUnitDropdownOpen);
                    setIsCropDropdownOpen(false);
                  }}
                  className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3 flex items-center justify-between text-left text-base text-farmText-dark shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base capitalize">
                    {quantityUnit}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-farmText-gray transition-transform duration-200 ${
                      isUnitDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUnitDropdownOpen && (
                  <div className="absolute top-[54px] right-0 w-full bg-white border border-farmBorder rounded-[12px] shadow-lg py-1 z-30">
                    {QUANTITY_UNIT_OPTIONS.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setQuantityUnit(unit);
                          setIsUnitDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-sm capitalize hover:bg-slate-50 transition-colors cursor-pointer ${
                          quantityUnit === unit
                            ? 'text-primary font-bold bg-primary-tint/30'
                            : 'text-farmText-dark'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------
              FIELD C: Grade (Selectable Chip / Pill Options)
             ------------------------------------------------------ */}
          <div>
            <label className="block text-sm font-semibold text-farmText-dark mb-1.5 text-left">
              Grade Quality <span className="text-urgent">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {GRADE_OPTIONS.map((option) => {
                const isSelected = grade === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGrade(option)}
                    className={`h-[48px] rounded-[12px] px-2 sm:px-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs scale-[1.02] ring-2 ring-primary/30'
                        : 'bg-white border border-farmBorder text-farmText-dark hover:border-primary/40 hover:bg-slate-50/80'
                    }`}
                  >
                    <Award
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-amber-300' : 'text-amber-500'
                      }`}
                    />
                    <span className="truncate">{option}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-farmText-gray mt-1.5">
              Grade A: Export quality · Grade B: Standard Mandi · Grade C: Processing.
            </p>
          </div>

          {/* ------------------------------------------------------
              FIELD D: Harvest Date (Calendar Date Picker)
             ------------------------------------------------------ */}
          <div>
            <label className="block text-sm font-semibold text-farmText-dark mb-1.5 text-left">
              Harvest Date <span className="text-urgent">*</span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4 text-primary stroke-[2.3]" />
              </div>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] pl-10 pr-3.5 text-sm sm:text-base text-farmText-dark font-medium shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                required
              />
            </div>
          </div>

          {/* ------------------------------------------------------
              FIELD E: Location (Read-only with Change link)
             ------------------------------------------------------ */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-farmText-dark">
                Pickup Location
              </label>

              {!isEditingLocation ? (
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="text-xs text-primary hover:text-primary-dark font-bold underline cursor-pointer"
                >
                  Change
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  className="text-xs text-primary hover:text-primary-dark font-bold cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>

            {!isEditingLocation ? (
              <div className="h-[50px] min-h-[44px] bg-slate-50/90 border border-farmBorder rounded-[12px] px-3.5 flex items-center gap-2.5 text-sm sm:text-base text-farmText-dark font-semibold shadow-xs select-none">
                <MapPin className="w-4 h-4 text-urgent shrink-0" />
                <span className="truncate">{location}</span>
                <span className="ml-auto text-[11px] font-medium text-farmText-gray bg-white px-2 py-0.5 rounded border border-slate-200">
                  Farm Profile
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  placeholder="Enter village, district, state"
                  className="flex-1 h-[50px] min-h-[44px] bg-white border border-primary rounded-[12px] px-3.5 text-sm sm:text-base text-farmText-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  className="h-[50px] px-4 bg-primary text-white rounded-[12px] font-bold text-sm hover:bg-primary-dark cursor-pointer shrink-0"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------
              3. BOTTOM ACTION
              "Next →" Button
             ------------------------------------------------------ */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full sm:w-[320px] mx-auto h-[52px] min-h-[44px] rounded-[12px] font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 select-none ${
                !isFormValid
                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <p className="text-[11px] text-farmText-gray text-center mt-2.5">
              Step 1 of 3: Crop lot details will be reviewed before marketplace publishing.
            </p>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default CreateCropLotScreen;
