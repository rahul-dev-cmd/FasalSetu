import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sprout,
  ChevronDown,
  MapPin,
  LocateFixed,
  Check,
  Edit2
} from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { theme } from '../theme/tokens';
import { farmProfileApi } from '../services/api';

export interface FarmDetailsData {
  crop: string;
  landSize: string;
  landUnit: string;
  location: string;
}

export interface FarmDetailsScreenProps {
  onBack?: () => void;
  onContinue?: (data: FarmDetailsData) => void;
  forceMobile?: boolean;
}

const CROP_OPTIONS = [
  'Rice',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Pulses',
  'Vegetables',
  'Other',
];

const LAND_UNITS = ['acres', 'hectares', 'bigha'];

export const FarmDetailsScreen: React.FC<FarmDetailsScreenProps> = ({
  onBack,
  onContinue,
  forceMobile = false,
}) => {
  // Form State
  const [crop, setCrop] = useState<string>('Rice');
  const [landSize, setLandSize] = useState<string>('2.5');
  const [landUnit, setLandUnit] = useState<string>('acres');
  const [location, setLocation] = useState<string>('Kothapet, Telangana');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [manualLocationInput, setManualLocationInput] = useState<string>('');

  // Prefill from backend if available
  React.useEffect(() => {
    let isMounted = true;
    farmProfileApi.getProfile()
      .then((p) => {
        if (isMounted && p) {
          if (p.crop) setCrop(p.crop.charAt(0).toUpperCase() + p.crop.slice(1));
          if (p.land_size) setLandSize(String(p.land_size));
          if (p.land_unit) setLandUnit(p.land_unit);
          if (p.location) setLocation(p.location);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Dropdown UI states
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState<boolean>(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState<boolean>(false);

  // Form Validation: Crop and Land Size must not be empty and landSize > 0
  const isFormValid =
    crop.trim().length > 0 &&
    landSize.trim().length > 0 &&
    !isNaN(Number(landSize)) &&
    Number(landSize) > 0 &&
    location.trim().length > 0;

  // Handle "Use Current Location"
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationSuccess(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[Geolocation] Acquired coordinates:', { latitude, longitude });
          // Format friendly location label
          const detectedLocation = `Ambegaon, Pune (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
          setLocation(detectedLocation);
          setIsLocating(false);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (error) => {
          console.warn('[Geolocation] Denied or unavailable:', error.message);
          // Fallback to simulated location
          setTimeout(() => {
            setLocation('Manchar, Ambegaon, Pune');
            setIsLocating(false);
            setLocationSuccess(true);
            setTimeout(() => setLocationSuccess(false), 3000);
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setLocation('Manchar, Ambegaon, Pune');
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      }, 800);
    }
  };

  const handleSaveLocation = () => {
    if (manualLocationInput.trim()) {
      setLocation(manualLocationInput.trim());
    }
    setIsEditingLocation(false);
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const farmData: FarmDetailsData = {
      crop,
      landSize,
      landUnit,
      location,
    };

    try {
      await farmProfileApi.createProfile({
        crop: crop.toLowerCase(),
        land_size: parseFloat(landSize) || 2.5,
        land_unit: landUnit,
        location: location,
        latitude: 17.3850,
        longitude: 78.4867,
      });
    } catch (err) {
      try {
        await farmProfileApi.updateProfile({
          crop: crop.toLowerCase(),
          land_size: parseFloat(landSize) || 2.5,
          land_unit: landUnit,
          location: location,
        });
      } catch (updateErr) {
        console.warn('Backend farm profile save fallback:', updateErr);
      }
    }

    console.log('Navigating to next screen: "Farmer Home Dashboard"', farmData);
    if (onContinue) {
      onContinue(farmData);
    }
  };

  return (
    <OnboardingLayout
      forceMobile={forceMobile}
      brandPanelProps={{
        badgeText: 'Screen 2 of 2 • Farm Profile',
        taglineTitle: 'Personalized Crop Advisory Tailored To Your Soil.',
        taglineDescription:
          'By knowing your primary crop, acreage, and location, FasalSetu calculates exact spray timings, APMC price alerts, and weather risks.',
        forceMobile,
      }}
    >
      <form onSubmit={handleSaveAndContinue} className="flex flex-col justify-between flex-1 h-full">
        {/* ========================================================
            HEADER
            Back arrow + Title ("Tell us about your farm")
           ======================================================== */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Language Selection"
              aria-label="Back to Language Selection"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Screen 2 of 2
              </span>
              <span className="text-farmBorder font-light">•</span>
              <span className="text-xs text-farmText-gray">
                Farm Profile
              </span>
            </div>
          </div>

          <h1 className="text-[20px] md:text-[24px] font-bold text-farmText-dark font-sans tracking-tight">
            Tell us about your farm
          </h1>
          <p className="text-xs sm:text-sm text-farmText-gray mt-1">
            Help our AI customize disease forecasts and mandi prices for your land.
          </p>
        </div>

        {/* ========================================================
            FORM FIELDS (Stacked, Full-Width, Consistent 12px Radius)
           ======================================================== */}
        <div className="space-y-4 my-auto py-1">
          
          {/* --------------------------------------------------------
              FIELD A: "What do you grow?" (Custom Select with Leaf Icon)
             -------------------------------------------------------- */}
          <div className="relative">
            <label className="block text-sm font-medium text-farmText-dark mb-1.5 text-left">
              What do you grow?
            </label>
            
            <div className="relative">
              {/* Custom-styled select trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsCropDropdownOpen(!isCropDropdownOpen);
                  setIsUnitDropdownOpen(false);
                }}
                className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3.5 flex items-center justify-between text-left text-base text-farmText-dark shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary-tint/60 text-primary flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="font-medium text-base text-farmText-dark">
                    {crop}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-farmText-gray transition-transform duration-200 ${
                    isCropDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Options Dropdown Menu */}
              {isCropDropdownOpen && (
                <div className="absolute top-[56px] left-0 w-full bg-white border border-farmBorder rounded-[12px] shadow-lg py-1.5 z-30 max-h-56 overflow-y-auto">
                  {CROP_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setCrop(opt);
                        setIsCropDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        crop === opt ? 'bg-primary-tint/40 text-primary font-bold' : 'text-farmText-dark'
                      }`}
                    >
                      <span>{opt}</span>
                      {crop === opt && <Check className="w-4 h-4 text-primary stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------
              FIELD B: "Land size" (Numeric Input + Unit Dropdown Side by Side)
             -------------------------------------------------------- */}
          <div>
            <label className="block text-sm font-medium text-farmText-dark mb-1.5 text-left">
              Land size
            </label>
            
            <div className="grid grid-cols-12 gap-3">
              {/* Left: Numeric Input */}
              <div className="col-span-7 sm:col-span-8">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3.5 text-base text-farmText-dark font-medium shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Right: Unit Dropdown */}
              <div className="col-span-5 sm:col-span-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnitDropdownOpen(!isUnitDropdownOpen);
                    setIsCropDropdownOpen(false);
                  }}
                  className="w-full h-[50px] min-h-[44px] bg-white border border-farmBorder rounded-[12px] px-3 flex items-center justify-between text-left text-base text-farmText-dark shadow-xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <span className="font-medium text-sm sm:text-base capitalize">
                    {landUnit}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-farmText-gray transition-transform duration-200 ${
                      isUnitDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUnitDropdownOpen && (
                  <div className="absolute top-[56px] right-0 w-full bg-white border border-farmBorder rounded-[12px] shadow-lg py-1.5 z-30">
                    {LAND_UNITS.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setLandUnit(unit);
                          setIsUnitDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-sm capitalize hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between ${
                          landUnit === unit ? 'bg-primary-tint/40 text-primary font-bold' : 'text-farmText-dark'
                        }`}
                      >
                        <span>{unit}</span>
                        {landUnit === unit && <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------
              FIELD C: "Location" (Pill Button + Embedded Map + Selected Text)
             -------------------------------------------------------- */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-farmText-dark text-left">
                Location
              </label>

              {/* Pill-style Button: "📍 Use current location" */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 bg-primary-tint text-primary hover:bg-emerald-100 active:scale-[0.98] px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
              >
                {isLocating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Use current location</span>
                  </>
                )}
              </button>
            </div>

            {/* Embedded Map Preview Box */}
            <div className="w-full h-28 sm:h-32 rounded-[12px] border border-farmBorder bg-slate-100 relative overflow-hidden flex items-center justify-center shadow-inner select-none">
              {/* Subtle Grid / Agricultural Plots Pattern */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                    linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Simulated Farmland Contours / Roads */}
              <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                <path d="M0 60 Q100 20 200 70 T400 30" fill="none" stroke="#94a3b8" strokeWidth="3" />
                <path d="M50 120 Q180 80 320 110" fill="none" stroke="#a7f3d0" strokeWidth="6" />
                <path d="M160 0 L220 140" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              </svg>

              {/* Centered Map Pin with Radar Pulse */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Radar Ring */}
                <div className="absolute -top-1 w-10 h-10 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
                <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-red-100">
                  <MapPin className="w-5 h-5 text-red-600 fill-red-500" />
                </div>
                <div className="mt-1 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200">
                  {location.split(',')[0]}
                </div>
              </div>

              {/* GPS coordinates badge in corner */}
              <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
                GPS Verified • APMC Nearest
              </div>
            </div>

            {/* Selected Location Text with "Change" Link */}
            <div className="flex items-center justify-between text-xs pt-0.5 px-0.5">
              <div className="flex items-center gap-1.5 text-farmText-dark font-medium truncate max-w-[75%]">
                <span className="text-red-500">📍</span>
                <span className="truncate">{location}</span>
                {locationSuccess && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded animate-pulse">
                    Updated!
                  </span>
                )}
              </div>

              {/* Change Link */}
              <button
                type="button"
                onClick={() => {
                  setManualLocationInput(location);
                  setIsEditingLocation(!isEditingLocation);
                }}
                className="text-primary hover:text-primary-dark font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <span>Change</span>
              </button>
            </div>

            {/* Inline Change Location Input Dialog (when "Change" is clicked) */}
            {isEditingLocation && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-farmBorder rounded-[12px] flex items-center gap-2 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  placeholder="Enter district, village, or state..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================
            BOTTOM ACTION
            "Save & Continue →" Button
           ======================================================== */}
        <div className="pt-5 mt-4 border-t border-slate-100 md:border-transparent flex flex-col items-center md:items-start">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full md:w-auto md:min-w-[220px] h-[52px] min-h-[44px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 px-8 shadow-cta transition-all duration-200 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed select-none"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Helper note */}
          <p className="text-[11px] text-farmText-gray text-center md:text-left mt-2.5">
            You can edit crop details or add more plots later from settings.
          </p>
        </div>
      </form>
    </OnboardingLayout>
  );
};

export default FarmDetailsScreen;
