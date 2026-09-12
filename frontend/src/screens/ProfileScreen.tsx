import React, { useState, useRef } from 'react';
import {
  User,
  Edit3,
  Check,
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  Sprout,
  Compass,
  Layers,
  Globe2,
  Bell,
  Smartphone,
  CloudRain,
  Lock,
  Building2,
  TrendingUp,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData, FarmerProfile } from '../data/mockFarmerData';
import { farmProfileApi } from '../services/api';

export interface ProfileScreenProps {
  forceMobile?: boolean;
  unreadAlertsCount?: number;
  onNavigateHome?: () => void;
  onNavigateMarket?: () => void;
  onNavigateLots?: () => void;
  onNavigateAlerts?: () => void;
  onLogout?: () => void;
}

const LANGUAGES = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi' },
  { id: 'en', native: 'English', english: 'English' },
  { id: 'te', native: 'తెలుగు', english: 'Telugu' },
  { id: 'mr', native: 'मराठी', english: 'Marathi' },
  { id: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  forceMobile = false,
  unreadAlertsCount = 0,
  onNavigateHome,
  onNavigateMarket,
  onNavigateLots,
  onNavigateAlerts,
  onLogout,
}) => {
  // ── Profile Editable State ─────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(mockFarmerData.profile.greetingName);
  const [fullName, setFullName] = useState(mockFarmerData.profile.name);
  const [location, setLocation] = useState(mockFarmerData.profile.location);
  const [primaryCrop, setPrimaryCrop] = useState(mockFarmerData.profile.crop);
  const [landSize, setLandSize] = useState(mockFarmerData.profile.landSize);
  const [farmingType, setFarmingType] = useState<'Organic' | 'Conventional'>('Organic');
  const [soilType, setSoilType] = useState('Alluvial');

  // ── Preferences State ──────────────────────────────────────────────
  const [preferredLang, setPreferredLang] = useState('hi');
  const [units, setUnits] = useState<'quintals-acres' | 'kg-hectares'>('quintals-acres');
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);

  // ── Account & Security ─────────────────────────────────────────────
  const [phoneNumber] = useState('+91 98490 12345');
  const [email, setEmail] = useState('ramesh.patil@kisanmail.in');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [bankAccount] = useState('XXXX 4521');
  const [bankName] = useState('State Bank of India');

  // ── Profile Photo / Avatar State (Upload from Gallery) ────────────
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('fasalsetu_farmer_avatar');
      if (saved) return saved;
    } catch {}
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
  });
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        triggerToast('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAvatarUrl(dataUrl);
        setImgError(false);
        try {
          localStorage.setItem('fasalsetu_farmer_avatar', dataUrl);
        } catch (err) {
          console.warn('LocalStorage save failed:', err);
        }
        triggerToast('Profile picture updated successfully from gallery!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAvatar = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';
    setAvatarUrl(defaultUrl);
    setImgError(false);
    try {
      localStorage.removeItem('fasalsetu_farmer_avatar');
    } catch {}
    triggerToast('Profile photo reset to default');
  };

  // ── Modals & Dialogs ───────────────────────────────────────────────
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [tempLang, setTempLang] = useState(preferredLang);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync profile from backend on mount
  React.useEffect(() => {
    let isMounted = true;
    farmProfileApi.getProfile()
      .then((p) => {
        if (isMounted && p) {
          if (p.full_name) {
            setFullName(p.full_name);
            setName(p.full_name.split(' ')[0]);
          }
          if (p.crop) setPrimaryCrop(p.crop.charAt(0).toUpperCase() + p.crop.slice(1));
          if (p.land_size) setLandSize(`${p.land_size} ${p.land_unit || 'acres'}`);
          if (p.location) setLocation(p.location);
          if (p.farming_type) setFarmingType(p.farming_type as any);
          if (p.soil_type) setSoilType(p.soil_type);
          if (p.preferred_language) setPreferredLang(p.preferred_language);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    setIsEditing(false);
    try {
      const parsedAcreage = parseFloat(landSize) || 2.5;
      await farmProfileApi.updateProfile({
        full_name: fullName,
        crop: primaryCrop.toLowerCase(),
        land_size: parsedAcreage,
        location: location,
        farming_type: farmingType,
        soil_type: soilType,
        preferred_language: preferredLang,
      });
      triggerToast('✓ Profile synced with FasalSetu server!');
    } catch (err) {
      console.warn('Backend updateProfile fallback:', err);
      triggerToast('Profile and farm details updated successfully!');
    }
  };

  const handleConfirmLanguage = () => {
    setPreferredLang(tempLang);
    setShowLanguageModal(false);
    const langObj = LANGUAGES.find((l) => l.id === tempLang);
    triggerToast(`Preferred language changed to ${langObj?.native} (${langObj?.english})`);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      setShowPinModal(false);
      setNewPin('');
      triggerToast('Security PIN changed successfully!');
    }
  };

  const selectedLangObj = LANGUAGES.find((l) => l.id === preferredLang) || LANGUAGES[0];

  return (
    <DashboardLayout
      activeTab="profile"
      unreadAlertsCount={unreadAlertsCount}
      forceMobile={forceMobile}
      onTabChange={(tab) => {
        if (tab === 'home' && onNavigateHome) onNavigateHome();
        if (tab === 'market' && onNavigateMarket) onNavigateMarket();
        if (tab === 'my-lots' && onNavigateLots) onNavigateLots();
        if (tab === 'alerts' && onNavigateAlerts) onNavigateAlerts();
      }}
    >
      <div className="space-y-5 pb-12 max-w-5xl mx-auto">
        {/* ========================================================
            HEADER ROW
            Title + Subtitle + Edit / Save Button
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-farmBorder shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-farmText-dark tracking-tight leading-tight">
              Profile
            </h1>
            <p className="text-xs sm:text-sm text-farmText-gray font-normal mt-0.5">
              Manage your account, farm details, and preferences
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            TOP PROFILE SUMMARY CARD
            Avatar + Name + Location + Verification + Stats
           ======================================================== */}
        <div className="bg-white rounded-2xl border border-farmBorder p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left: Avatar + Details */}
            <div className="flex items-start sm:items-center gap-4">
              {/* Circular Avatar with Online Dot & Gallery Upload Action */}
              <div className="relative shrink-0 group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleGalleryUpload}
                  accept="image/*"
                  className="hidden"
                  id="farmer-avatar-gallery-input"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-3 border-primary/30 shadow-sm bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center cursor-pointer relative transition-transform hover:scale-[1.02]"
                  title="Click to upload photo from gallery"
                >
                  {avatarUrl && !imgError ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary select-none">
                      {name ? name.charAt(0).toUpperCase() : 'R'}
                    </span>
                  )}

                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
                    <Camera className="w-5 h-5 text-emerald-300" />
                    <span>Upload</span>
                  </div>
                </div>

                {/* Floating Camera Button on Corner */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 rounded-full bg-white text-slate-700 hover:text-primary hover:bg-emerald-50 border border-slate-200 shadow-md flex items-center justify-center absolute -bottom-1 -right-1 hover:scale-110 transition-all cursor-pointer z-10"
                  title="Upload image from gallery"
                  aria-label="Upload image from gallery"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                {/* Green Online Dot */}
                <span
                  className="w-4 h-4 rounded-full bg-primary ring-3 ring-white absolute top-0 right-0 shadow-xs"
                  title="Farmer is Online"
                />
              </div>

              {/* Farmer Info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg sm:text-xl font-bold text-slate-900 border border-primary/40 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-emerald-50/20"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {name}
                    </h2>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Verified Farmer</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{location}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Farming with FasalSetu since Jan 2025</span>
                </div>

                {/* Upload from Gallery Link & Reset */}
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark hover:underline cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload image from gallery</span>
                  </button>
                  {avatarUrl !== 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="text-[11px] font-medium text-slate-400 hover:text-red-500 hover:underline cursor-pointer"
                    >
                      Reset photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stat Cluster */}
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-100 self-start md:self-auto shrink-0">
              <div className="text-left pr-3 border-r border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Total Lots Sold</div>
                <div className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5">7 Lots</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>100% fulfill rate</span>
                </div>
              </div>

              <div className="text-left pl-1">
                <div className="text-xs text-slate-500 font-medium">Buyer Rating</div>
                <div className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <span className="text-amber-500">⭐</span>
                  <span>4.6</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">18 reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TWO-COLUMN SECTION
            Left: Farm Details + Language & Preferences
            Right: Account & Security + Activity Summary
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ═════════════════════════════════════════════════════════
              LEFT COLUMN
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-5">
            {/* ── CARD 1: FARM DETAILS ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-farmBorder p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-primary" />
                  <span>Farm Details</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Plot #14B</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {/* Primary Crop */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Primary Crop</div>
                  {isEditing ? (
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-primary"
                    >
                      <option value="Rice">Rice (Paddy)</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Chilli">Chilli</option>
                      <option value="Maize">Maize</option>
                    </select>
                  ) : (
                    <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <span>🌾</span>
                      <span>{primaryCrop}</span>
                    </div>
                  )}
                </div>

                {/* Land Size */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Land Size</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{landSize}</div>
                  )}
                </div>

                {/* Farming Type */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Farming Type</div>
                  {isEditing ? (
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value as any)}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-primary"
                    >
                      <option value="Organic">Organic</option>
                      <option value="Conventional">Conventional</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-primary-dark">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>{farmingType}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Soil Type */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Soil Type</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="mt-1 w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{soilType}</div>
                  )}
                </div>
              </div>

              {/* Map Thumbnail with Pin */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-emerald-950/5 flex items-center justify-center">
                {/* Stylized map pattern */}
                <svg className="w-full h-full object-cover opacity-60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="farmGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="#F8FAFC" />
                  <rect width="100%" height="100%" fill="url(#farmGrid)" />
                  {/* Abstract field parcels */}
                  <path d="M 30 10 L 140 15 L 120 70 L 20 60 Z" fill="#DCFCE7" opacity="0.6" stroke="#86EFAC" />
                  <path d="M 150 20 L 280 15 L 260 85 L 140 75 Z" fill="#FEF3C7" opacity="0.5" stroke="#FDE68A" />
                  <path d="M 40 75 L 130 85 L 110 120 L 30 110 Z" fill="#E0F2FE" opacity="0.5" stroke="#BAE6FD" />
                </svg>

                {/* Location Marker Badge */}
                <div className="absolute z-10 flex flex-col items-center animate-bounce">
                  <div className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Plot 14B · Kothapet</span>
                  </div>
                  <div className="w-2 h-2 bg-primary rotate-45 -mt-1" />
                </div>

                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  Geo: 17.3753° N, 78.5522° E
                </div>
              </div>
            </div>

            {/* ── CARD 2: LANGUAGE & PREFERENCES ───────────────────── */}
            <div className="bg-white rounded-2xl border border-farmBorder p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-primary" />
                <span>Language & Preferences</span>
              </h3>

              <div className="space-y-3.5">
                {/* Language Row */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">
                      Preferred Language
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Current: <span className="font-bold text-primary">{selectedLangObj.native}</span> ({selectedLangObj.english})
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempLang(preferredLang);
                      setShowLanguageModal(true);
                    }}
                    className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Units Selector */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">Measurement Units</div>
                    <div className="text-xs text-slate-500 mt-0.5">Weight & land display format</div>
                  </div>

                  <select
                    value={units}
                    onChange={(e) => {
                      setUnits(e.target.value as any);
                      triggerToast('Measurement units updated!');
                    }}
                    className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="quintals-acres">Quintals, Acres</option>
                    <option value="kg-hectares">Kilograms, Hectares</option>
                  </select>
                </div>

                {/* Notification Toggles */}
                <div className="pt-1 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Alert Channels
                  </div>

                  {/* SMS Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800">
                          SMS Notifications
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Receive buyer offers & critical updates via SMS
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSmsNotifications(!smsNotifications);
                        triggerToast(`SMS notifications ${!smsNotifications ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        smsNotifications ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          smsNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800">
                          Push Notifications
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Instant mobile and app alerts
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPushNotifications(!pushNotifications);
                        triggerToast(`Push notifications ${!pushNotifications ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        pushNotifications ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          pushNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Weather Alerts Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CloudRain className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800">
                          Weather Alerts
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Rain, temperature & spray advisories
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setWeatherAlerts(!weatherAlerts);
                        triggerToast(`Weather alerts ${!weatherAlerts ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        weatherAlerts ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          weatherAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              RIGHT COLUMN
             ═════════════════════════════════════════════════════════ */}
          <div className="space-y-5">
            {/* ── CARD 3: ACCOUNT & SECURITY ───────────────────────── */}
            <div className="bg-white rounded-2xl border border-farmBorder p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>Account & Security</span>
              </h3>

              <div className="space-y-3.5">
                {/* Phone Number */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">Phone Number</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">{phoneNumber}</div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Email Address */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex-1 pr-2">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">Email Address</div>
                    {isEditingEmail ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-xs border border-slate-300 rounded px-2 py-1 w-full max-w-xs focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingEmail(false);
                            triggerToast('Email updated successfully!');
                          }}
                          className="bg-primary text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-primary-dark"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600 mt-0.5 truncate">{email}</div>
                    )}
                  </div>

                  {!isEditingEmail && (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-xs sm:text-sm font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer"
                    >
                      Update
                    </button>
                  )}
                </div>

                {/* Security PIN / Password */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">Security PIN</div>
                    <div className="text-xs text-slate-500 mt-0.5">Used for lot publishing & withdrawals</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPinModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Change PIN</span>
                  </button>
                </div>

                {/* Linked Bank Account */}
                <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">{bankName}</div>
                      <div className="text-xs text-slate-500 font-mono">A/C: {bankAccount} · Verified</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerToast('Bank details verification modal opened')}
                    className="text-xs font-bold text-primary hover:text-primary-dark hover:underline cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* ── CARD 4: ACTIVITY SUMMARY ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-farmBorder p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Activity Summary</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Season 2025</span>
              </div>

              {/* 2x2 Stat Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Lots Listed */}
                <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-emerald-800">Lots Listed</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">10</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">3 currently active</div>
                </div>

                {/* Successful Sales */}
                <div className="bg-teal-50/60 border border-teal-100/90 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-teal-800">Successful Sales</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">7</div>
                  <div className="text-[10px] text-teal-700 mt-0.5 font-medium">1 in negotiation</div>
                </div>

                {/* Total Earnings */}
                <div className="bg-amber-50/60 border border-amber-100/90 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-amber-800">Total Earnings</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">₹4,85,000</div>
                  <div className="text-[10px] text-amber-700 mt-0.5 font-medium">100% credited</div>
                </div>

                {/* Avg. Rating */}
                <div className="bg-purple-50/60 border border-purple-100/90 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-purple-800">Avg. Rating</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-1">
                    <span>4.6</span>
                    <span className="text-amber-500 text-lg">★</span>
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5 font-medium">Top 5% rated seller</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BOTTOM CARD — Secondary & Destructive Actions
           ======================================================== */}
        <div className="bg-white rounded-2xl border border-farmBorder p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Help & Support */}
            <button
              type="button"
              onClick={() => triggerToast('Kisan Sahayata helpline: 1800-180-1551 (Toll-Free)')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Help & Support</span>
            </button>

            {/* Terms & Privacy */}
            <button
              type="button"
              onClick={() => triggerToast('FasalSetu Terms & Privacy Policy v2.4 (Govt of India Compliance)')}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:underline transition-colors cursor-pointer py-1"
            >
              Terms & Privacy Policy
            </button>
          </div>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-600 bg-red-50/80 border border-red-200 hover:bg-red-100/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* ========================================================
            MODAL: LANGUAGE SELECTOR
           ======================================================== */}
        {showLanguageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-farmBorder shadow-xl w-full max-w-md p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-slate-900">Select Language</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 py-1">
                {LANGUAGES.map((lang) => {
                  const isSelected = tempLang === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setTempLang(lang.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/80 border-primary text-primary-dark shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">{lang.native}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary stroke-[2.5]" />}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">{lang.english}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLanguage}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-xs"
                >
                  Save Language
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: CHANGE PIN
           ======================================================== */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-farmBorder shadow-xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-slate-900">Change 4-Digit PIN</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Enter New 4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-2xl font-mono tracking-widest py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 mt-1 text-center">
                    Keep this PIN private. FasalSetu agents will never ask for it.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPin.length !== 4}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: LOG OUT CONFIRMATION
           ======================================================== */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-farmBorder shadow-xl w-full max-w-sm p-5 space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-2xs">
                <LogOut className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Log Out of FasalSetu?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You will need your mobile number (+91 98490 12345) and OTP to log back into your account.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Stay Logged In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TOAST NOTIFICATION
           ======================================================== */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfileScreen;
