import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  Download,
  HelpCircle,
  LogOut,
  X,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CreditCard,
  Layers,
  Star,
  ShoppingBag,
  TrendingUp,
  FileText,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { BuyerLayout } from '../components/BuyerLayout';
import { useAuth } from '../context/AuthContext';

export const BuyerProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);

  // Profile Data State
  const [businessName, setBusinessName] = useState('Sri Laxmi Agro Traders');
  const [contactPerson, setContactPerson] = useState('Amit Sharma');
  const [designation, setDesignation] = useState('Procurement Manager');
  const [businessType, setBusinessType] = useState('Institutional Farm Procurement');
  const [gstNumber, setGstNumber] = useState('36AAACS1234F1Z5');
  const [registeredAddress, setRegisteredAddress] = useState(
    'Plot 42, Wholesale Grain Market Complex, Malakpet, Hyderabad, Telangana 500036'
  );
  const [yearsInBusiness, setYearsInBusiness] = useState('12 years');
  const [phone, setPhone] = useState('+91 98490 12345');
  const [email, setEmail] = useState('procurement@srilaxmiagro.com');

  // Preferences State
  const [preferredCrops, setPreferredCrops] = useState<string[]>(['Rice', 'Cotton', 'Maize']);
  const [newCropInput, setNewCropInput] = useState('');
  const [showAddCrop, setShowAddCrop] = useState(false);

  const [preferredRegions, setPreferredRegions] = useState<string[]>(['Telangana', 'Andhra Pradesh']);
  const [newRegionInput, setNewRegionInput] = useState('');
  const [showAddRegion, setShowAddRegion] = useState(false);

  const [typicalVolume, setTypicalVolume] = useState<'Small (under 50 Qtl)' | 'Medium (50-500 Qtl)' | 'Bulk (500+ Qtl)'>(
    'Medium (50-500 Qtl)'
  );
  const [gradePreference, setGradePreference] = useState<'Premium (A)' | 'Standard (B)' | 'Any Grade'>('Premium (A)');

  // Modals & Toast State
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string } | null>(null);

  // Avatar Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('buyer_avatar') || '';
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Preset Avatars for quick selection
  const PRESET_AVATARS = [
    {
      id: 'av-1',
      label: 'Executive Trader',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'av-2',
      label: 'Agro Business Leader',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'av-3',
      label: 'Corporate Enterprise Logo',
      url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'av-4',
      label: 'Mandi Procurement Manager',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('File too large', 'Please choose an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAvatarUrl(dataUrl);
        localStorage.setItem('buyer_avatar', dataUrl);
        window.dispatchEvent(new Event('buyer_avatar_updated'));
        triggerToast('Photo Uploaded', 'Your profile picture has been updated across the Buyer Portal.');
        setShowPhotoModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle preset avatar selection
  const handleSelectPresetAvatar = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem('buyer_avatar', url);
    window.dispatchEvent(new Event('buyer_avatar_updated'));
    triggerToast('Avatar Selected', 'Profile image updated with preset.');
    setShowPhotoModal(false);
  };

  // Handle remove photo (reverts to initials)
  const handleRemovePhoto = () => {
    setAvatarUrl('');
    localStorage.removeItem('buyer_avatar');
    window.dispatchEvent(new Event('buyer_avatar_updated'));
    triggerToast('Photo Removed', 'Profile picture reset to default initials.');
    setShowPhotoModal(false);
  };

  // Trigger Toast
  const triggerToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Save Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    triggerToast('Profile Updated', 'Your business details and preferences have been updated successfully.');
  };

  // Add Crop Chip
  const handleAddCrop = () => {
    if (newCropInput.trim() && !preferredCrops.includes(newCropInput.trim())) {
      setPreferredCrops([...preferredCrops, newCropInput.trim()]);
      setNewCropInput('');
      setShowAddCrop(false);
      triggerToast('Crop Added', `Added ${newCropInput.trim()} to preferred procurement crops.`);
    }
  };

  // Remove Crop Chip
  const handleRemoveCrop = (cropToRemove: string) => {
    setPreferredCrops(preferredCrops.filter((c) => c !== cropToRemove));
  };

  // Add Region Chip
  const handleAddRegion = () => {
    if (newRegionInput.trim() && !preferredRegions.includes(newRegionInput.trim())) {
      setPreferredRegions([...preferredRegions, newRegionInput.trim()]);
      setNewRegionInput('');
      setShowAddRegion(false);
      triggerToast('Region Added', `Added ${newRegionInput.trim()} to preferred regions.`);
    }
  };

  // Remove Region Chip
  const handleRemoveRegion = (regionToRemove: string) => {
    setPreferredRegions(preferredRegions.filter((r) => r !== regionToRemove));
  };

  // Mock Download Transaction History
  const handleDownloadHistory = () => {
    triggerToast('Transaction History Downloaded', 'Your 2025-26 procurement audit report (PDF & CSV) has been generated.');
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <BuyerLayout activeTab="profile" avatarUrl={avatarUrl}>
      <div className="space-y-6 pb-12">
        {/* ========================================================
            HEADER ROW
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Profile
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Manage your business account, procurement preferences, and settings
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs md:text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#0D9488]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs md:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs md:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            TOP PROFILE SUMMARY CARD (Full Width)
           ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 md:gap-5 flex-1 min-w-0">
            {/* Avatar with Online Dot & Image Upload Trigger */}
            <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="relative group">
                <div
                  onClick={() => setShowPhotoModal(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#0D9488] text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-xs border-2 border-slate-200 cursor-pointer relative"
                  title="Click to change profile image"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Buyer Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>AS</span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 backdrop-blur-2xs">
                    <Camera className="w-4 h-4" />
                    <span>Upload</span>
                  </div>
                </div>

                {/* Online Indicator */}
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white z-10"
                  title="Active Buyer Account"
                />

                {/* Camera Badge Trigger */}
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110 z-10"
                  title="Upload profile photo"
                >
                  <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

              {/* Text link for direct discoverability */}
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="text-[11px] font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
              >
                <Upload className="w-3 h-3" />
                <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>

            {/* Profile Information */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 truncate">
                  {businessName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                  Verified Buyer
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{contactPerson} · {designation}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Hyderabad, Telangana
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                  {businessType}
                </span>
                <span className="text-slate-400">Sourcing on FasalSetu since Mar 2025</span>
              </div>
            </div>
          </div>

          {/* Right Stat Cluster */}
          <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-start gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
            <div className="lg:text-right">
              <span className="text-xs text-slate-500 font-medium block">Total Procured</span>
              <span className="text-lg md:text-xl font-extrabold text-[#0D9488]">
                ₹18,45,000
              </span>
            </div>

            <div className="lg:text-right">
              <span className="text-xs text-slate-500 font-medium block">FasalSetu Score</span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1 lg:justify-end">
                <span>⭐ 4.7</span>
                <span className="text-xs text-slate-400 font-normal">(32 deals)</span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            TWO-COLUMN SECTION
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ────────────────────────────────────────────────────────
              LEFT COLUMN: Card 1 (Business Details) & Card 2 (Preferences)
             ──────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Card 1: Business Details */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Business Details
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">KYC Level 2 Verified</span>
              </div>

              <div className="space-y-3.5 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                    />
                  ) : (
                    <div className="font-bold text-slate-900">{businessName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Business Type
                  </label>
                  {isEditing ? (
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                    >
                      <option value="Institutional Farm Procurement">Institutional Farm Procurement</option>
                      <option value="Wholesale Mandi Commission Agent">Wholesale Mandi Commission Agent</option>
                      <option value="Agro-Processing & Milling">Agro-Processing & Milling</option>
                      <option value="Export & Modern Retail">Export & Modern Retail</option>
                    </select>
                  ) : (
                    <span className="inline-block bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md text-xs font-bold">
                      {businessType}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-xs font-medium mb-1">
                      GST Number
                    </label>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{gstNumber}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-xs font-medium mb-1">
                      Years in Business
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={yearsInBusiness}
                        onChange={(e) => setYearsInBusiness(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                      />
                    ) : (
                      <div className="font-semibold text-slate-800">{yearsInBusiness}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Registered Address
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={registeredAddress}
                      onChange={(e) => setRegisteredAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                    />
                  ) : (
                    <div className="font-medium text-slate-700 leading-relaxed">
                      {registeredAddress}
                    </div>
                  )}
                </div>

                {/* Simulated Location Map Card */}
                <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-900/30 to-slate-900/20 mix-blend-multiply" />
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                    alt="Location map"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute z-10 px-3 py-1.5 bg-white/95 backdrop-blur-xs rounded-lg shadow-md border border-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-xs font-bold text-slate-900">
                      Hyderabad Wholesale Market Hub
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Procurement Preferences */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Procurement Preferences
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">Smart Match Rules</span>
              </div>

              <div className="space-y-4 text-xs md:text-sm">
                {/* Preferred Crops Chips */}
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5">
                    Preferred Crops
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {preferredCrops.map((crop) => (
                      <span
                        key={crop}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-semibold text-xs"
                      >
                        <span>{crop}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCrop(crop)}
                          className="hover:text-red-600 cursor-pointer"
                          title="Remove crop"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {showAddCrop ? (
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newCropInput}
                          onChange={(e) => setNewCropInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCrop()}
                          placeholder="Crop name..."
                          className="px-2.5 py-1 text-xs border border-teal-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0D9488] w-28 bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddCrop}
                          className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCrop(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddCrop(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-slate-300 hover:border-[#0D9488] text-slate-600 hover:text-[#0D9488] rounded-full text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Crop</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preferred Regions Chips */}
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5">
                    Preferred Regions
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {preferredRegions.map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-semibold text-xs"
                      >
                        <span>{region}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRegion(region)}
                          className="hover:text-red-600 cursor-pointer"
                          title="Remove region"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {showAddRegion ? (
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newRegionInput}
                          onChange={(e) => setNewRegionInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddRegion()}
                          placeholder="Region..."
                          className="px-2.5 py-1 text-xs border border-teal-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#0D9488] w-28 bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddRegion}
                          className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddRegion(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddRegion(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-slate-300 hover:border-[#0D9488] text-slate-600 hover:text-[#0D9488] rounded-full text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Region</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Typical Order Volume Dropdown */}
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Typical Order Volume
                  </label>
                  <select
                    value={typicalVolume}
                    onChange={(e) => setTypicalVolume(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] cursor-pointer"
                  >
                    <option value="Small (under 50 Qtl)">Small (under 50 Quintals)</option>
                    <option value="Medium (50-500 Qtl)">Medium (50 - 500 Quintals)</option>
                    <option value="Bulk (500+ Qtl)">Bulk (500+ Quintals / Commercial)</option>
                  </select>
                </div>

                {/* Grade Preference Pill-Select */}
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1.5">
                    Grade Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Premium (A)', 'Standard (B)', 'Any Grade'] as const).map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setGradePreference(grade)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gradePreference === grade
                            ? 'bg-[#0D9488] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              RIGHT COLUMN: Card 3 (Account & Security) & Card 4 (Summary)
             ──────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Card 3: Account & Security */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Account & Security
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Protected
                </span>
              </div>

              <div className="space-y-3.5 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-900">{phone}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">
                    Business Email
                  </label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-900 truncate">{email}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Password / PIN Section */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Account Authentication
                    </span>
                    <span className="text-xs text-slate-400">
                      Two-Factor Authentication active on mobile
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Change PIN / Password
                  </button>
                </div>

                {/* Escrow Account Capsule */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#0D9488]" />
                      <span className="font-bold text-xs md:text-sm text-teal-900">
                        Smart Escrow Account
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEscrowModal(true)}
                      className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Manage Escrow</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <span className="text-teal-700">Escrow Balance Available:</span>
                    <span className="text-base font-extrabold text-[#0D9488]">
                      ₹8,45,000
                    </span>
                  </div>

                  <p className="text-[11px] text-teal-800/80 leading-relaxed">
                    HDFC Bank · Virtual Escrow A/C ending in **4821 (FasalSetu Institutional Gateway)
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Procurement Summary */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0D9488]" />
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Procurement Summary
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">Fiscal Year 2025-26</span>
              </div>

              {/* 2x2 Stat Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Lots Purchased</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">32</span>
                  <span className="text-[11px] text-slate-400">across 6 districts</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Active Deals</span>
                  <span className="text-xl font-extrabold text-[#0D9488] mt-1 block">4</span>
                  <span className="text-[11px] text-slate-400">in fulfillment pipeline</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Total Spent</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">₹18,45,000</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">100% Escrow protected</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Avg. Rating Given</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">4.7 ★</span>
                  <span className="text-[11px] text-slate-400">prompt farmer payouts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BOTTOM CARD: Secondary & Destructive Actions
           ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs md:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#0D9488]" />
              <span>Help & Support</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHistory}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs md:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Transaction History</span>
            </button>

            <button
              type="button"
              onClick={() => triggerToast('Terms of Trade', 'Opening FasalSetu Buyer Terms of Trade and Privacy Policy document.')}
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer pl-1"
            >
              Terms & Privacy Policy
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs md:text-sm font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MANAGE ESCROW MODAL
         ======================================================== */}
      {showEscrowModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-teal-800">
                <CreditCard className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Escrow Account Management
                </h3>
              </div>
              <button
                onClick={() => setShowEscrowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl">
                <span className="text-xs text-teal-700 font-medium">Total Escrow Balance</span>
                <div className="text-2xl font-extrabold text-[#0D9488] mt-1">₹8,45,000</div>
                <div className="mt-2 text-xs text-teal-800 flex justify-between border-t border-teal-200/60 pt-2">
                  <span>Allocated to Active Deals:</span>
                  <span className="font-bold">₹4,25,000</span>
                </div>
                <div className="text-xs text-teal-800 flex justify-between pt-1">
                  <span>Free / Available for Offers:</span>
                  <span className="font-bold text-emerald-700">₹4,20,000</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  Linked Corporate Bank Account
                </label>
                <div className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">HDFC Bank Limited</div>
                    <div className="text-slate-500">A/C: 50200048218842 · IFSC: HDFC0001234</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
                    Primary
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>
                  All deposits are held in tripartite RBI-regulated nodal accounts until physical quality and weighment certificates are signed.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEscrowModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEscrowModal(false);
                  triggerToast('Deposit Portal', 'Redirecting to secure payment gateway for adding escrow funds.');
                }}
                className="px-5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs md:text-sm font-bold rounded-xl shadow-xs"
              >
                Deposit Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CHANGE PASSWORD / PIN MODAL
         ======================================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Update PIN / Password
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Current Password / PIN
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  New Password / PIN
                </label>
                <input
                  type="password"
                  placeholder="At least 6 digits/characters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Confirm New Password / PIN
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  triggerToast('Security Updated', 'Your transaction PIN has been successfully changed.');
                }}
                className="px-5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs md:text-sm font-bold rounded-xl shadow-xs"
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          HELP & SUPPORT MODAL
         ======================================================== */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Buyer Support Desk
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs md:text-sm">
              <p className="text-slate-600">
                Need assistance with an active mandi transaction, escrow clearance, or quality dispute?
              </p>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Phone className="w-4 h-4 text-[#0D9488]" />
                  <span>Buyer Toll-Free Helpline: 1800-419-8800</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Mail className="w-4 h-4 text-[#0D9488]" />
                  <span>support-buyers@fasalsetu.in</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800">Quick Query / Dispute:</label>
                <textarea
                  rows={3}
                  placeholder="Describe your issue or order ID..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSupportModal(false);
                  triggerToast('Ticket Created', 'Ticket #SUP-8821 created. Dedicated buyer desk representative assigned.');
                }}
                className="px-5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs md:text-sm font-bold rounded-xl shadow-xs"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          LOG OUT CONFIRMATION MODAL
         ======================================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">
                  Log Out?
                </h3>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Are you sure you want to log out of your FasalSetu Buyer Portal session?
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PHOTO UPLOAD & SELECTION MODAL
         ======================================================== */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-teal-800">
                <Camera className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Profile Photo
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Current Preview */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0D9488] text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0 border border-slate-200">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>AS</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Photo</div>
                  <div className="font-bold text-slate-900 text-sm">{businessName}</div>
                  <div className="text-xs text-slate-500">{contactPerson}</div>
                </div>
              </div>

              {/* Upload Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload from Your Device</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-1.5">
                  Supports JPG, PNG, or WEBP (Max 5MB)
                </p>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Or Pick a Verified Trader Preset:
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        avatarUrl === preset.url
                          ? 'border-[#0D9488] ring-2 ring-teal-200 scale-102'
                          : 'border-slate-200 hover:border-teal-300'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {avatarUrl === preset.url && (
                        <div className="absolute inset-0 bg-[#0D9488]/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remove Photo if currently set */}
              {avatarUrl && (
                <div className="pt-2 border-t border-slate-100 flex justify-center">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Custom Photo (Use Initials)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TOAST NOTIFICATION
         ======================================================== */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 max-w-md">
            <div className="p-1 rounded-lg bg-teal-500/20 text-[#0D9488] shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-sm text-white">{toastMessage.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5">{toastMessage.description}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
};

export default BuyerProfileScreen;
