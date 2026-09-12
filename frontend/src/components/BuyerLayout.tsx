import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  ClipboardList,
  Handshake,
  TrendingUp,
  Bell,
  User,
  Sprout,
  LogOut,
  X,
  Menu,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface BuyerLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  buyerName?: string;
  businessName?: string;
  buyerLocation?: string;
  unreadAlertsCount?: number;
  avatarUrl?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: number;
}

export const BuyerLayout: React.FC<BuyerLayoutProps> = ({
  children,
  activeTab = 'home',
  onTabChange,
  buyerName = 'Amit Sharma',
  businessName = 'Sri Laxmi Agro Traders',
  buyerLocation = 'Hyderabad, Telangana',
  unreadAlertsCount = 3,
  avatarUrl,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Read stored avatar from localStorage or prop
  const [storedAvatar, setStoredAvatar] = useState<string | null>(() => {
    return localStorage.getItem('buyer_avatar') || null;
  });

  React.useEffect(() => {
    const handleAvatarChange = () => {
      setStoredAvatar(localStorage.getItem('buyer_avatar') || null);
    };
    window.addEventListener('storage', handleAvatarChange);
    window.addEventListener('buyer_avatar_updated', handleAvatarChange);
    return () => {
      window.removeEventListener('storage', handleAvatarChange);
      window.removeEventListener('buyer_avatar_updated', handleAvatarChange);
    };
  }, []);

  const effectiveAvatar = avatarUrl || storedAvatar;

  // Buyer navigation items matching specification
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, route: '/buyer/dashboard' },
    { id: 'browse', label: 'Browse Lots', icon: Search, route: '/buyer/browse' },
    { id: 'offers', label: 'My Offers', icon: ClipboardList, route: '/buyer/offers' },
    { id: 'deals', label: 'Active Deals', icon: Handshake, route: '/buyer/deals' },
    { id: 'insights', label: 'Market Insights', icon: TrendingUp, route: '/buyer/insights' },
    { id: 'alerts', label: 'Alerts', icon: Bell, route: '/buyer/alerts', badge: unreadAlertsCount },
    { id: 'profile', label: 'Profile', icon: User, route: '/buyer/profile' },
  ];

  // Derive active tab automatically from route or prop
  const resolvedActiveTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/buyer/browse')) return 'browse';
    if (path.startsWith('/buyer/offers')) return 'offers';
    if (path.startsWith('/buyer/deals')) return 'deals';
    if (path.startsWith('/buyer/insights')) return 'insights';
    if (path.startsWith('/buyer/alerts')) return 'alerts';
    if (path.startsWith('/buyer/profile')) return 'profile';
    if (path.startsWith('/buyer/dashboard')) return 'home';
    return activeTab || 'home';
  }, [location.pathname, activeTab]);

  const handleTabClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);
    navigate(item.route);
    if (onTabChange) {
      onTabChange(item.id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const renderSidebarItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = resolvedActiveTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleTabClick(item)}
        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer select-none ${
          isActive
            ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-xs'
            : 'text-[#64748B] hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5] text-[#0D9488]' : 'stroke-[1.8] text-[#64748B]'}`} />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge && item.badge > 0 ? (
          <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-white shrink-0">
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans antialiased">
      {/* ========================================================
          DESKTOP SIDEBAR (>=768px, Persistent Left Nav, Teal Accent)
         ======================================================== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-30 shadow-xs">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo & Brand Header: FasalSetu leaf icon + wordmark + "Buyer Portal" */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-5 h-5 text-[#0D9488] stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                FasalSetu
              </span>
              <span className="text-[11px] text-[#0D9488] block font-bold uppercase tracking-wider">
                Buyer Portal
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map(renderSidebarItem)}
          </nav>
        </div>

        {/* Sidebar Buyer Profile Capsule at bottom */}
        <div
          onClick={() => navigate('/buyer/profile')}
          className="p-4 border-t border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-colors cursor-pointer select-none shrink-0"
          title="Go to Buyer Profile"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
              {effectiveAvatar ? (
                <img src={effectiveAvatar} alt={buyerName} className="w-full h-full object-cover" />
              ) : (
                'AS'
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-bold text-xs text-slate-900 truncate">
                {buyerName}
              </div>
              <div className="text-[11px] text-teal-700 font-semibold truncate">
                {businessName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                📍 {buyerLocation}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN WRAPPER & TOP HEADER BAR
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR (white, full width, sticky top) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Mobile Menu button & Greeting */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Namaste, {buyerName} 👋
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Institutional Farm Procurement • {businessName}
                </p>
              </div>
            </div>

            {/* Right: Search, Notification Bell, Escrow, and Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Escrow badge pill */}
              <div className="hidden lg:flex items-center bg-teal-50 border border-teal-200/80 rounded-full px-3 py-1 text-xs font-semibold text-teal-800 gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Escrow: <strong>₹8,45,000</strong></span>
              </div>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => navigate('/buyer/alerts')}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* User Avatar Capsule */}
              <div
                onClick={() => navigate('/buyer/profile')}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
                title="Buyer Account"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-[#0D9488] font-bold text-xs overflow-hidden">
                  {effectiveAvatar ? (
                    <img src={effectiveAvatar} alt={buyerName} className="w-full h-full object-cover" />
                  ) : (
                    'AS'
                  )}
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer hidden sm:block"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Drawer (When hamburger clicked on mobile) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                      <Sprout className="w-4 h-4 text-[#0D9488]" />
                    </div>
                    <span className="font-bold text-slate-900">Buyer Portal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map(renderSidebarItem)}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700 truncate">{businessName}</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* MAIN CONTENT AREA (Scrollable) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* MOBILE BOTTOM TAB BAR (<768px only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg z-40">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = resolvedActiveTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                  isActive ? 'text-[#0D9488] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BuyerLayout;
