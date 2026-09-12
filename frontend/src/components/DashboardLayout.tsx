import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Camera,
  Droplets,
  TrendingUp,
  ShoppingCart,
  Layers,
  Bell,
  User,
  Sprout,
  MoreHorizontal,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { theme } from '../theme/tokens';
import { getStoredLocation } from '../utils/geolocation';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  unreadAlertsCount?: number;
  farmerName?: string;
  farmerLocation?: string;
  forceMobile?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  unreadAlertsCount = 2,
  farmerName = 'Ramesh ji',
  farmerLocation = 'Kothapet, Telangana',
  forceMobile = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>(() => {
    const stored = getStoredLocation();
    return stored ? stored.displayName : farmerLocation;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.displayName) {
        setActiveLocation(e.detail.displayName);
      }
    };
    window.addEventListener('fasalsetu_location_updated', handleUpdate);
    return () => {
      window.removeEventListener('fasalsetu_location_updated', handleUpdate);
    };
  }, []);

  // Group 1: Home alone
  const navGroupHome: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, route: '/farmer/dashboard' },
  ];

  // Group 2: Core AI features
  const navGroupAI: NavItem[] = [
    { id: 'crop-health', label: 'Crop Health', icon: Camera, route: '/farmer/crop-health' },
    { id: 'crop-advisor', label: 'Crop Advisor', icon: Sparkles, route: '/farmer/crop-advisor' },
    { id: 'irrigation', label: 'Water & Irrigation', icon: Droplets, route: '/farmer/irrigation' },
    { id: 'yield', label: 'Yield Estimate', icon: TrendingUp, route: '/farmer/yield' },
  ];

  // Group 3: Marketplace & Account
  const navGroupMarket: NavItem[] = [
    { id: 'market', label: 'Market', icon: ShoppingCart, route: '/farmer/market' },
    { id: 'my-lots', label: 'My Lots', icon: Layers, route: '/farmer/lots' },
    { id: 'alerts', label: 'Alerts', icon: Bell, route: '/farmer/alerts', badge: unreadAlertsCount },
    { id: 'profile', label: 'Profile', icon: User, route: '/farmer/profile' },
  ];

  // Derive active tab automatically from route, with prop fallback
  const resolvedActiveTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/farmer/dashboard')) return 'home';
    if (path.startsWith('/farmer/crop-health')) return 'crop-health';
    if (path.startsWith('/farmer/crop-advisor')) return 'crop-advisor';
    if (path.startsWith('/farmer/irrigation')) return 'irrigation';
    if (path.startsWith('/farmer/yield')) return 'yield';
    if (
      path.startsWith('/farmer/market') ||
      path.startsWith('/farmer/negotiation') ||
      path.startsWith('/farmer/transaction') ||
      path.startsWith('/farmer/create-lot')
    ) {
      return 'market';
    }
    if (path.startsWith('/farmer/lots')) return 'my-lots';
    if (path.startsWith('/farmer/alerts')) return 'alerts';
    if (path.startsWith('/farmer/profile')) return 'profile';
    return activeTab;
  }, [location.pathname, activeTab]);

  const handleTabClick = (tabId: string) => {
    setIsMoreOpen(false);

    if (tabId === 'home') {
      navigate('/farmer/dashboard');
    } else if (tabId === 'crop-health') {
      navigate('/farmer/crop-health');
    } else if (tabId === 'crop-advisor') {
      navigate('/farmer/crop-advisor');
    } else if (tabId === 'irrigation') {
      navigate('/farmer/irrigation');
    } else if (tabId === 'yield') {
      navigate('/farmer/yield');
    } else if (tabId === 'market') {
      navigate('/farmer/market');
    } else if (tabId === 'my-lots') {
      navigate('/farmer/lots');
    } else if (tabId === 'alerts') {
      navigate('/farmer/alerts');
    } else if (tabId === 'profile') {
      navigate('/farmer/profile');
    }

    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // 5 mobile bottom tabs: Home, Market, Alerts, Profile, More
  const mobileTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'market', label: 'Market', icon: ShoppingCart },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  const isMoreTabActive = ['crop-health', 'crop-advisor', 'irrigation', 'yield', 'my-lots'].includes(resolvedActiveTab);

  // More drawer items for mobile
  const moreFeaturesList = [
    {
      id: 'crop-health',
      title: 'Crop Health',
      hindi: 'फसल स्वास्थ्य',
      desc: 'AI camera photo scan & disease cure',
      icon: Camera,
    },
    {
      id: 'crop-advisor',
      title: 'Crop Advisor',
      hindi: 'फसल सलाहकार',
      desc: 'AI crop matching & harvest timeline',
      icon: Sparkles,
    },
    {
      id: 'irrigation',
      title: 'Water & Irrigation',
      hindi: 'जल एवं सिंचाई',
      desc: 'Soil moisture advisory & pump scheduling',
      icon: Droplets,
    },
    {
      id: 'yield',
      title: 'Yield Estimate',
      hindi: 'उपज अनुमान',
      desc: 'Agronomic yield forecast & mandi rate guide',
      icon: TrendingUp,
    },
    {
      id: 'my-lots',
      title: 'My Lots',
      hindi: 'मेरी फसलें',
      desc: 'Active harvest listings & trade bids',
      icon: Layers,
    },
  ];

  // Render a single sidebar desktop button
  const renderSidebarItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = resolvedActiveTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleTabClick(item.id)}
        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer select-none ${
          isActive
            ? 'bg-[#DCFCE7] text-primary font-bold shadow-xs'
            : 'text-[#64748B] hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.4] text-primary' : 'stroke-[1.8] text-[#64748B]'}`} />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge && item.badge > 0 ? (
          <span className="bg-urgent text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-white shrink-0">
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  // If forceMobile is requested (for phone simulator view)
  if (forceMobile) {
    return (
      <div className="w-full flex justify-center items-center py-4 bg-slate-900 min-h-screen">
        <div className="w-full max-w-[400px] h-[844px] max-h-[92vh] bg-farmBg rounded-[36px] shadow-2xl border-[8px] border-slate-800 flex flex-col overflow-hidden relative select-none">
          {/* Top Speaker / Camera pill notch */}
          <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mt-2 z-30 shrink-0" />

          {/* Main Mobile Screen Area */}
          <div className="flex-1 flex flex-col overflow-y-auto px-4 pt-2 pb-3">
            {children}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="w-full bg-white border-t border-farmBorder px-2 py-2 flex items-center justify-around shadow-sm shrink-0 z-20">
            {mobileTabs.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'more' ? isMoreTabActive : resolvedActiveTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'more') {
                      setIsMoreOpen(!isMoreOpen);
                    } else {
                      handleTabClick(item.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer select-none ${
                    isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1 -right-2 bg-urgent text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile More Features Sheet (contained inside forceMobile frame) */}
          {isMoreOpen && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div
                className="absolute inset-0"
                onClick={() => setIsMoreOpen(false)}
              />
              <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 flex flex-col gap-3 max-h-[80%] overflow-y-auto z-10">
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1" />
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">More Features</h3>
                    <p className="text-xs text-slate-500">अतिरिक्त सेवाएं एवं उपकरण</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {moreFeaturesList.map((feat) => {
                    const FeatIcon = feat.icon;
                    const isFeatActive = resolvedActiveTab === feat.id;
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => handleTabClick(feat.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                          isFeatActive
                            ? 'bg-[#DCFCE7] border-primary/40 text-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isFeatActive ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                            <FeatIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{feat.title}</span>
                              <span className="text-[10px] font-normal text-slate-500">({feat.hindi})</span>
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{feat.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Home Indicator */}
          <div className="w-full py-1 bg-white flex justify-center items-center shrink-0">
            <div className="w-32 h-1 bg-slate-400/60 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Standard Responsive Layout (Desktop Sidebar on >=768px, Mobile bottom nav on <768px)
  return (
    <div className="min-h-screen bg-farmBg flex flex-col md:flex-row text-farmText-dark font-sans antialiased">
      {/* ========================================================
          DESKTOP SIDEBAR (>=768px, Persistent Left Nav)
         ======================================================== */}
      <aside className="hidden md:flex w-60 lg:w-64 bg-white border-r border-farmBorder flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-30">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-5 h-5 text-primary stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-primary block leading-tight">
                FasalSetu
              </span>
              <span className="text-[11px] text-farmText-gray block font-medium">
                स्मार्ट खेती, समृद्ध किसान
              </span>
            </div>
          </div>

          {/* Nav Links with Section Dividers */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            {/* 1. Home */}
            <div className="space-y-1">
              {navGroupHome.map(renderSidebarItem)}
            </div>

            {/* Divider 1: between Home and AI core features */}
            <div className="my-2.5 border-t border-slate-100" />

            {/* 2. Core AI Features: Crop Health, Water & Irrigation, Yield Estimate */}
            <div className="space-y-1">
              {navGroupAI.map(renderSidebarItem)}
            </div>

            {/* Divider 2: between AI core features and Market / Account */}
            <div className="my-2.5 border-t border-slate-100" />

            {/* 3. Marketplace & Account: Market, My Lots, Alerts, Profile */}
            <div className="space-y-1">
              {navGroupMarket.map(renderSidebarItem)}
            </div>
          </nav>
        </div>

        {/* Sidebar Farmer Profile Capsule at bottom */}
        <div
          onClick={() => handleTabClick('profile')}
          className="p-4 border-t border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors cursor-pointer select-none shrink-0"
          title="Go to Profile"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {farmerName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-bold text-xs text-slate-800 truncate">
                {farmerName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                📍 {activeLocation}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA (Scrollable, Full-width mobile / Grid desktop)
         ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* ========================================================
          MOBILE BOTTOM TAB BAR (<768px only, Fixed Bottom)
         ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-farmBorder px-3 py-2 flex items-center justify-around shadow-lg z-40">
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'more' ? isMoreTabActive : resolvedActiveTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'more') {
                  setIsMoreOpen(!isMoreOpen);
                } else {
                  handleTabClick(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer select-none ${
                isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-urgent text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile More Features Sheet (Slide-up modal for standard <768px viewport) */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 flex flex-col gap-3 max-h-[75vh] overflow-y-auto z-10">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">More Features</h3>
                <p className="text-xs text-slate-500">अतिरिक्त सेवाएं एवं उपकरण</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {moreFeaturesList.map((feat) => {
                const FeatIcon = feat.icon;
                const isFeatActive = resolvedActiveTab === feat.id;
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => handleTabClick(feat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isFeatActive
                        ? 'bg-[#DCFCE7] border-primary/40 text-primary'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isFeatActive ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}>
                        <FeatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{feat.title}</span>
                          <span className="text-[10px] font-normal text-slate-500">({feat.hindi})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{feat.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

