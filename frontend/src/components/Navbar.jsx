import React, { useState } from 'react';
import { Sprout, Globe2, Bell, Menu, X } from 'lucide-react';

export default function Navbar({
  currentScreen,
  setCurrentScreen,
  userLanguage,
  setUserLanguage,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी (Hindi)' },
    { id: 'mr', label: 'मराठी (Marathi)' },
    { id: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { id: 'te', label: 'తెలుగు (Telugu)' },
    { id: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  const isHindi = userLanguage === 'hi';

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentScreen('dashboard')}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Sprout className="w-5 h-5 text-white stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#14532D] tracking-wider uppercase font-sans">
                  FASALSETU
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {isHindi ? 'किसान साथी' : 'Farming Assistant'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden sm:block">
                {isHindi ? 'स्मार्ट खेती, समृद्ध किसान' : 'Smart Farming, Prosperous Farmer'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentScreen === 'dashboard' || currentScreen === 'screen3_dashboard'
                  ? 'bg-primary-soft text-primary-dark font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isHindi ? 'किसान डैशबोर्ड (Dashboard)' : 'Farmer Dashboard'}
            </button>
            <button
              onClick={() => setCurrentScreen('screen2_phone')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentScreen === 'screen2_phone'
                  ? 'bg-primary-soft text-primary-dark font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isHindi ? 'मोबाइल लॉगिन (Login)' : 'Mobile Login'}
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Language Quick Dropdown */}
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer text-xs font-semibold text-slate-700">
              <Globe2 className="w-3.5 h-3.5 text-primary mr-1.5" />
              <select
                value={userLanguage}
                onChange={(e) => setUserLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Profile Capsule */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                R
              </div>
              <div className="text-left hidden lg:block">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  Rameshwar Patil
                </span>
                <span className="block text-[10px] text-slate-500">Pune, Maharashtra</span>
              </div>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <button
            onClick={() => {
              setCurrentScreen('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            🌾 {isHindi ? 'किसान डैशबोर्ड' : 'Farmer Dashboard'}
          </button>
          <button
            onClick={() => {
              setCurrentScreen('screen2_phone');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            📱 {isHindi ? 'मोबाइल लॉगिन' : 'Phone Login'}
          </button>
        </div>
      )}
    </header>
  );
}
