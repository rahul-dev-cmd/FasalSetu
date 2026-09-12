import React, { useState, useEffect } from 'react';
import {
  Sun,
  Droplets,
  ShieldCheck,
  Sprout,
  TrendingUp,
  ShoppingCart,
  Layers,
  LayoutGrid,
  Bell,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Globe,
  ChevronDown,
  Plus,
  MapPin,
  Check,
  X,
  Edit2,
  Trash2,
  LocateFixed,
  Compass,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import KisanChatDrawer from '../components/KisanChatDrawer';
import { mockFarmerData, FarmerDashboardData } from '../data/mockFarmerData';
import { theme } from '../theme/tokens';

export interface FarmerDashboardScreenProps {
  initialData?: FarmerDashboardData;
  forceMobile?: boolean;
  onNavigateAction?: (actionId: string) => void;
}

// ── Language Configurations ──────────────────────────────────────────
export interface LanguageOption {
  id: string;
  nativeLabel: string;
  englishLabel: string;
  greeting: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'hi', nativeLabel: 'हिंदी', englishLabel: 'Hindi', greeting: 'नमस्ते' },
  { id: 'en', nativeLabel: 'English', englishLabel: 'English', greeting: 'Namaste' },
  { id: 'mr', nativeLabel: 'मराठी', englishLabel: 'Marathi', greeting: 'नमस्कार' },
  { id: 'te', nativeLabel: 'తెలుగు', englishLabel: 'Telugu', greeting: 'నమస్కారం' },
  { id: 'gu', nativeLabel: 'ગુજરાતી', englishLabel: 'Gujarati', greeting: 'નમસ્તે' },
  { id: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil', greeting: 'வணக்கம்' },
  { id: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', englishLabel: 'Punjabi', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ' },
  { id: 'kn', nativeLabel: 'ಕನ್ನಡ', englishLabel: 'Kannada', greeting: 'ನಮಸ್ಕಾರ' },
];

// ── Farm Plots Interface & Mock Initial Data ────────────────────────
export interface FarmPlot {
  id: string;
  name: string;
  crop: string;
  size: string;
  unit: string;
  soilType: string;
  irrigation: string;
  location: string;
  surveyNumber?: string;
  status: 'Active' | 'Fallow' | 'Harvest Ready';
}

const DEFAULT_PLOTS: FarmPlot[] = [
  {
    id: 'plot-1',
    name: 'Plot 1 - North Paddy Field',
    crop: 'Rice',
    size: '2.5',
    unit: 'acres',
    soilType: 'Alluvial Soil',
    irrigation: 'Tube Well (Borewell)',
    location: 'Kothapet, Telangana',
    surveyNumber: 'Sy. No. 142/A',
    status: 'Active',
  },
  {
    id: 'plot-2',
    name: 'Plot 2 - Canal Cotton Parcel',
    crop: 'Cotton',
    size: '4.0',
    unit: 'acres',
    soilType: 'Black Cotton Soil',
    irrigation: 'Canal Drip System',
    location: 'Kothapet, Telangana',
    surveyNumber: 'Sy. No. 89/2',
    status: 'Active',
  },
];

const CROP_OPTIONS = [
  'Rice',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Pulses',
  'Vegetables',
  'Mustard',
  'Soybean',
  'Other',
];

const LAND_UNITS = ['acres', 'hectares', 'bigha', 'guntha'];

const SOIL_TYPES = [
  'Alluvial Soil (जलोढ़)',
  'Black Cotton Soil (काली मिट्टी)',
  'Red Loamy Soil (लाल बलुई)',
  'Sandy Loam (रेतीली दोमट)',
  'Clay Loam (मटियार)',
];

const IRRIGATION_TYPES = [
  'Tube Well / Borewell (नलकूप)',
  'Canal Water (नहर)',
  'Drip Irrigation (ड्रिप प्रणाली)',
  'Sprinkler (फव्वारा)',
  'Rainfed (वर्षा आधारित)',
];

export const FarmerDashboardScreen: React.FC<FarmerDashboardScreenProps> = ({
  initialData = mockFarmerData,
  forceMobile = false,
  onNavigateAction,
}) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const data = initialData;

  // ── Language State ────────────────────────────────────────────────
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('fasalsetu_farmer_language') || 'hi';
  });
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);

  // ── Plots State ───────────────────────────────────────────────────
  const [plots, setPlots] = useState<FarmPlot[]>(() => {
    try {
      const saved = localStorage.getItem('fasalsetu_farmer_plots');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved plots:', e);
    }
    return DEFAULT_PLOTS;
  });

  // ── Add / Edit Plot Modal State ───────────────────────────────────
  const [isPlotModalOpen, setIsPlotModalOpen] = useState<boolean>(false);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);

  // Form inputs
  const [plotName, setPlotName] = useState<string>('');
  const [plotCrop, setPlotCrop] = useState<string>('Rice');
  const [plotSize, setPlotSize] = useState<string>('2.0');
  const [plotUnit, setPlotUnit] = useState<string>('acres');
  const [plotSoil, setPlotSoil] = useState<string>('Alluvial Soil (जलोढ़)');
  const [plotIrrigation, setPlotIrrigation] = useState<string>('Tube Well / Borewell (नलकूप)');
  const [plotLocation, setPlotLocation] = useState<string>('Kothapet, Telangana');
  const [plotSurvey, setPlotSurvey] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // ── Toast Feedback State ──────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save plots to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('fasalsetu_farmer_plots', JSON.stringify(plots));
    } catch (e) {
      console.error('Failed to save plots to localStorage:', e);
    }
  }, [plots]);

  const currentLanguageObj =
    LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    try {
      localStorage.setItem('fasalsetu_farmer_language', langId);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
    const chosen = LANGUAGES.find((l) => l.id === langId);
    setIsLangModalOpen(false);
    showToast(`भाषा बदली गई: ${chosen?.nativeLabel} (${chosen?.englishLabel})`);
  };

  // Open modal to add a brand new plot
  const handleOpenAddPlotModal = () => {
    setEditingPlotId(null);
    setPlotName(`Plot ${plots.length + 1} - Field`);
    setPlotCrop(data.profile.crop || 'Rice');
    setPlotSize('2.0');
    setPlotUnit('acres');
    setPlotSoil('Alluvial Soil (जलोढ़)');
    setPlotIrrigation('Tube Well / Borewell (नलकूप)');
    setPlotLocation(data.profile.location || 'Kothapet, Telangana');
    setPlotSurvey('');
    setIsPlotModalOpen(true);
  };

  // Open modal to edit an existing plot
  const handleOpenEditPlotModal = (plot: FarmPlot) => {
    setEditingPlotId(plot.id);
    setPlotName(plot.name);
    setPlotCrop(plot.crop);
    setPlotSize(plot.size);
    setPlotUnit(plot.unit);
    setPlotSoil(plot.soilType);
    setPlotIrrigation(plot.irrigation);
    setPlotLocation(plot.location);
    setPlotSurvey(plot.surveyNumber || '');
    setIsPlotModalOpen(true);
  };

  // Handle GPS location detection for plot
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(2);
          const lng = pos.coords.longitude.toFixed(2);
          setPlotLocation(`Ambegaon, Pune (${lat}°N, ${lng}°E)`);
          setIsDetectingLocation(false);
          showToast('GPS location acquired');
        },
        () => {
          setTimeout(() => {
            setPlotLocation('Manchar, Ambegaon, Pune');
            setIsDetectingLocation(false);
            showToast('Simulated location set: Manchar, Pune');
          }, 600);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setPlotLocation('Manchar, Ambegaon, Pune');
        setIsDetectingLocation(false);
        showToast('Simulated location set: Manchar, Pune');
      }, 600);
    }
  };

  // Handle Save Plot
  const handleSavePlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim() || !plotSize || Number(plotSize) <= 0) {
      alert('Please enter a valid plot name and land size.');
      return;
    }

    if (editingPlotId) {
      // Update existing
      setPlots((prev) =>
        prev.map((p) =>
          p.id === editingPlotId
            ? {
                ...p,
                name: plotName.trim(),
                crop: plotCrop,
                size: plotSize.trim(),
                unit: plotUnit,
                soilType: plotSoil,
                irrigation: plotIrrigation,
                location: plotLocation.trim(),
                surveyNumber: plotSurvey.trim() || undefined,
              }
            : p
        )
      );
      showToast(`Plot "${plotName}" updated successfully!`);
    } else {
      // Create new plot
      const newPlot: FarmPlot = {
        id: `plot-${Date.now()}`,
        name: plotName.trim(),
        crop: plotCrop,
        size: plotSize.trim(),
        unit: plotUnit,
        soilType: plotSoil,
        irrigation: plotIrrigation,
        location: plotLocation.trim(),
        surveyNumber: plotSurvey.trim() || undefined,
        status: 'Active',
      };
      setPlots((prev) => [...prev, newPlot]);
      showToast(`New plot "${plotName}" added successfully!`);
    }

    setIsPlotModalOpen(false);
  };

  // Handle Delete Plot
  const handleDeletePlot = (plotId: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}"?`)) {
      setPlots((prev) => prev.filter((p) => p.id !== plotId));
      showToast(`Plot "${name}" removed`);
    }
  };

  // Calculate total acreage across all registered plots
  const totalAcres = plots.reduce((sum, p) => {
    const val = parseFloat(p.size);
    return isNaN(val) ? sum : sum + val;
  }, 0);

  const quickActions = [
    {
      id: 'crop-health',
      label: 'Crop Health',
      icon: Sprout,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: 'AI Scan',
    },
    {
      id: 'water-irrigation',
      label: 'Water & Irrigation',
      icon: Droplets,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: null,
    },
    {
      id: 'yield-estimate',
      label: 'Yield Estimate',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: null,
    },
    {
      id: 'market',
      label: 'Market',
      icon: ShoppingCart,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: 'Live',
    },
    {
      id: 'my-lots',
      label: 'My Lots',
      icon: Layers,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      badge: null,
    },
    {
      id: 'more',
      label: 'More',
      icon: LayoutGrid,
      iconColor: 'text-slate-600',
      bgColor: 'bg-slate-100',
      badge: null,
    },
  ];

  const handleActionClick = (actionId: string, label: string) => {
    console.log(`[Quick Action] Navigating to: ${label} (ID: ${actionId})`);
    if (onNavigateAction) {
      onNavigateAction(actionId);
    } else {
      alert(`[Navigation Stub] Opening: "${label}" screen`);
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'my-lots' && onNavigateAction) {
          onNavigateAction('my-lots');
        } else if (tab === 'market' && onNavigateAction) {
          onNavigateAction('market');
        } else if (tab === 'alerts' && onNavigateAction) {
          onNavigateAction('alerts');
        } else if (tab === 'profile' && onNavigateAction) {
          onNavigateAction('profile');
        }
      }}
      unreadAlertsCount={data.profile.unreadAlertsCount}
      farmerName={data.profile.greetingName}
      farmerLocation={data.profile.location}
      forceMobile={forceMobile}
    >
      <div className="space-y-4 sm:space-y-5">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================
            1. TOP GREETING BAR
            Avatar + Name + Location + Language Button + Notification Bell + Online Status
           ======================================================== */}
        <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-farmBorder shadow-xs flex items-center justify-between gap-3">
          {/* Left: Avatar + Greeting + Location */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Circular Farmer Avatar */}
            <div className="w-11 h-11 rounded-full bg-primary-tint border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-xs shrink-0 select-none">
              {data.profile.avatarText}
            </div>

            {/* Name and Location with localized greeting */}
            <div className="text-left min-w-0">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-farmText-dark tracking-tight leading-tight truncate">
                {currentLanguageObj.greeting}, {data.profile.greetingName}
              </h1>
              <p className="text-xs text-farmText-gray font-normal mt-0.5 flex items-center gap-1 truncate">
                <span>📍</span>
                <span className="truncate">{data.profile.location}</span>
              </p>
            </div>
          </div>

          {/* Right: Language Button + Notification Bell + Online Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Language Selector Button */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 hover:border-emerald-300 text-emerald-900 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer select-none active:scale-98"
              title="Change Language / भाषा बदलें"
              id="choose-language-button"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="font-bold text-emerald-900">{currentLanguageObj.nativeLabel}</span>
              <ChevronDown className="w-3 h-3 text-emerald-600/80 shrink-0" />
            </button>

            {/* Online Status Pill */}
            {data.profile.isOnline && (
              <div className="hidden xs:inline-flex items-center gap-1.5 bg-primary-tint/80 text-primary-dark px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] sm:text-xs">Online</span>
              </div>
            )}

            {/* Notification Bell with Red Badge Dot */}
            <button
              type="button"
              onClick={() => (onNavigateAction ? onNavigateAction('alerts') : setActiveTab('alerts'))}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {data.profile.unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-urgent rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================
            2, 3, 4: CARDS SECTION (Weather, Irrigation, Crop Risk)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Weather Card */}
          <div className="bg-sky-50/90 border border-sky-100 rounded-[16px] p-4 sm:p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-200/40 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center shadow-xs shrink-0">
                <Sun className="w-7 h-7 stroke-[2.3]" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  {data.weather.temperature}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
                  {data.weather.condition}
                </div>
              </div>
            </div>

            <div className="text-right z-10">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 block">
                Max {data.weather.maxTemp}
              </span>
              <span className="text-xs font-medium text-slate-500 block mt-0.5">
                Min {data.weather.minTemp}
              </span>
            </div>
          </div>

          {/* Irrigation Recommendation Card */}
          <div
            onClick={() => onNavigateAction?.('water-irrigation')}
            className="bg-white border border-farmBorder rounded-[16px] p-4 sm:p-5 shadow-xs flex flex-col justify-between relative border-l-4 border-l-warning hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Droplets className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-xs font-semibold text-farmText-gray group-hover:text-primary transition-colors">
                  Irrigation Recommendation
                </span>
              </div>

              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>{data.irrigation.status}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-farmText-dark font-medium leading-relaxed text-left">
              {data.irrigation.description}
            </p>
          </div>

          {/* Crop Risk Score Card */}
          <div className="bg-white border border-farmBorder rounded-[16px] p-4 sm:p-5 shadow-xs flex flex-col justify-between relative border-l-4 border-l-emerald-600 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-xs font-semibold text-farmText-gray">
                  Crop Risk Score
                </span>
              </div>

              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>{data.cropRisk.status}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-farmText-dark font-medium leading-relaxed text-left flex items-center gap-1.5">
              <span>{data.cropRisk.subtext}</span>
              <span className="text-xs text-emerald-700 font-bold">✓</span>
            </p>
          </div>

        </div>

        {/* ========================================================
            5. QUICK ACTIONS GRID
           ======================================================== */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-sm sm:text-base font-bold text-farmText-dark text-left">
              Quick Actions
            </h2>
            <span className="text-xs text-farmText-gray font-medium">
              Tap to view details
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionClick(action.id, action.label)}
                  className="bg-white border border-farmBorder rounded-[16px] p-4 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group select-none relative min-h-[105px]"
                >
                  {action.badge && (
                    <span className="absolute top-2 right-2 bg-primary-tint text-primary text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {action.badge}
                    </span>
                  )}

                  <div
                    className={`w-11 h-11 rounded-2xl ${action.bgColor} ${action.iconColor} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200 shadow-2xs`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.3]" />
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-farmText-dark group-hover:text-primary transition-colors leading-tight">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            6. SEPARATE SECTION: MY FARM PLOTS (खेत प्रबंधन)
           ======================================================== */}
        <section
          id="farm-plots-section"
          className="bg-white border border-farmBorder rounded-[20px] p-4 sm:p-6 shadow-xs text-left"
        >
          {/* Section Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs shrink-0">
                <Layers className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-farmText-dark">
                    My Farm Plots
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">(मेरे खेत)</span>
                </div>
                <p className="text-xs text-farmText-gray mt-0.5">
                  {plots.length} registered parcel{plots.length !== 1 ? 's' : ''} •{' '}
                  <span className="font-semibold text-emerald-800">
                    {totalAcres.toFixed(1)} Total Acres
                  </span>{' '}
                  under active cultivation
                </p>
              </div>
            </div>

            {/* "+ Add New Plot" Top Button */}
            <button
              type="button"
              onClick={handleOpenAddPlotModal}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-cta transition-all cursor-pointer self-start sm:self-auto shrink-0 select-none"
              id="btn-add-plot"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Plot</span>
            </button>
          </div>

          {/* Plot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
            {plots.map((plot) => (
              <div
                key={plot.id}
                className="bg-slate-50/70 hover:bg-emerald-50/30 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div>
                  {/* Card Header: Name + Size Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-farmText-dark group-hover:text-primary transition-colors leading-snug">
                        {plot.name}
                      </h3>
                      {plot.surveyNumber && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {plot.surveyNumber}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-extrabold rounded-full shrink-0">
                      {plot.size} {plot.unit}
                    </span>
                  </div>

                  {/* Crop Tag Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-farmText-dark mb-3">
                    <span className="text-sm">
                      {plot.crop === 'Rice' ? '🌾' : plot.crop === 'Cotton' ? '🌿' : plot.crop === 'Wheat' ? '🌾' : plot.crop === 'Maize' ? '🌽' : '🌱'}
                    </span>
                    <span>Crop: {plot.crop}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">{plot.status}</span>
                  </div>

                  {/* Plot Details Grid */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-white/70 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 shrink-0">🌱</span>
                      <span className="text-slate-500 font-normal">Soil:</span>
                      <span className="font-semibold text-slate-800 truncate">{plot.soilType}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 shrink-0">💧</span>
                      <span className="text-slate-500 font-normal">Water:</span>
                      <span className="font-semibold text-slate-800 truncate">{plot.irrigation}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 shrink-0">📍</span>
                      <span className="text-slate-500 font-normal">Location:</span>
                      <span className="font-semibold text-slate-800 truncate">{plot.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => handleActionClick('crop-health', 'AI Crop Scan')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>AI Scan</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlotModal(plot)}
                      className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="Edit Plot Details"
                      aria-label="Edit Plot"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlot(plot.id, plot.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Plot"
                      aria-label="Delete Plot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* "+ Add Another Plot" Dashed Card */}
            <button
              type="button"
              onClick={handleOpenAddPlotModal}
              className="border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer group min-h-[190px]"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-100 group-hover:bg-primary group-hover:text-white text-emerald-700 flex items-center justify-center transition-all duration-200 shadow-2xs mb-2.5">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                Add Another Plot
              </span>
              <span className="text-xs text-slate-500 mt-0.5">
                नया खेत / जमीन का टुकड़ा जोड़ें
              </span>
            </button>
          </div>
        </section>

        {/* ========================================================
            7. KISAN AI ASSISTANT BANNER WIDGET
           ======================================================== */}
        <div className="bg-gradient-to-r from-[#14532D] via-emerald-800 to-[#16A34A] rounded-[16px] p-4 sm:p-5 text-white shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#F59E0B] tracking-wider uppercase bg-black/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                KISAN AI ASSISTANT
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-200 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                24×7 Active
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-200 shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Ask me anything about your {data.profile.crop} farm
              </h3>
            </div>

            <p className="text-xs text-white/70">
              Get instant answers on crop health, weather, prices & more — 24×7
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="bg-white text-emerald-950 font-bold px-4 py-2.5 rounded-full text-xs hover:bg-emerald-50 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto hover:scale-102 select-none relative z-10"
          >
            <span className="relative flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
              <span>Chat Now</span>
              <span className="w-2 h-2 rounded-full bg-urgent animate-ping absolute -top-1 -right-2" />
              <span className="w-2 h-2 rounded-full bg-urgent absolute -top-1 -right-2" />
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* ========================================================
            8. LANGUAGE SELECTION MODAL
           ======================================================== */}
        {isLangModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div
              className="absolute inset-0"
              onClick={() => setIsLangModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200 z-10 text-left animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-farmText-dark leading-tight">
                      Choose Language
                    </h3>
                    <p className="text-xs text-farmText-gray">
                      अपनी पसंदीदा भाषा चुनें (Select your language)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-4 max-h-[60vh] overflow-y-auto">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-base font-bold text-farmText-dark leading-snug">
                          {lang.nativeLabel}
                        </div>
                        <div className="text-xs text-farmText-gray font-medium">
                          {lang.englishLabel}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLangModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            9. ADD / EDIT FARM PLOT MODAL
           ======================================================== */}
        {isPlotModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div
              className="absolute inset-0"
              onClick={() => setIsPlotModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200 z-10 text-left animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-farmText-dark leading-tight">
                      {editingPlotId ? 'Edit Farm Plot' : 'Add New Farm Plot'}
                    </h3>
                    <p className="text-xs text-farmText-gray">
                      {editingPlotId ? 'अपडेट करें प्लॉट विवरण' : 'अपने खेत / जमीन का नया प्लॉट जोड़ें'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlotModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Plot Form */}
              <form onSubmit={handleSavePlot} className="space-y-3.5 pt-4">
                {/* 1. Plot Name */}
                <div>
                  <label className="block text-xs font-bold text-farmText-dark mb-1">
                    Plot Name / खेत का नाम <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    placeholder="e.g. North Canal Plot, पूर्व खेत..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                {/* 2. Crop & Land Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-farmText-dark mb-1">
                      Primary Crop / फसल <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={plotCrop}
                      onChange={(e) => setPlotCrop(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer"
                    >
                      {CROP_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-farmText-dark mb-1">
                      Land Size / क्षेत्रफल <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={plotSize}
                        onChange={(e) => setPlotSize(e.target.value)}
                        placeholder="2.5"
                        className="w-2/3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors"
                      />
                      <select
                        value={plotUnit}
                        onChange={(e) => setPlotUnit(e.target.value)}
                        className="w-1/3 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer capitalize"
                      >
                        {LAND_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Soil Type & Irrigation Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-farmText-dark mb-1">
                      Soil Type / मिट्टी का प्रकार
                    </label>
                    <select
                      value={plotSoil}
                      onChange={(e) => setPlotSoil(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer"
                    >
                      {SOIL_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-farmText-dark mb-1">
                      Irrigation / सिंचाई साधन
                    </label>
                    <select
                      value={plotIrrigation}
                      onChange={(e) => setPlotIrrigation(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors cursor-pointer"
                    >
                      {IRRIGATION_TYPES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Location with GPS Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-farmText-dark">
                      Plot Location / स्थान
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <LocateFixed className="w-3 h-3" />
                      <span>{isDetectingLocation ? 'Detecting...' : 'Use Current GPS'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={plotLocation}
                    onChange={(e) => setPlotLocation(e.target.value)}
                    placeholder="Village, District, State"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                {/* 5. Survey / Khasra Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-farmText-dark mb-1">
                    Survey / Khasra Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={plotSurvey}
                    onChange={(e) => setPlotSurvey(e.target.value)}
                    placeholder="e.g. Sy. No. 142/B or खसरा संख्या"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPlotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-cta transition-all cursor-pointer active:scale-98"
                  >
                    {editingPlotId ? 'Save Changes' : 'Save Plot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Kisan AI Chatbot Drawer */}
        <KisanChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          farmerName={data.profile.greetingName}
          farmerCrop={data.profile.crop}
          farmerLocation={data.profile.location}
        />

      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboardScreen;
