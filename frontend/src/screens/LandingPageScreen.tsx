import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  CloudRain,
  Leaf,
  Layers,
  Users,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  Scale,
  Lock,
  Star,
  MapPin,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Smartphone,
  Building2,
  Eye,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';

// Simulated benchmark wholesale prices across major Telangana APMC mandis (explicitly marked as demo data)
const MANDI_TICKER_ITEMS = [
  { mandi: 'Suryapet', crop: 'Paddy (Sona Masoori)', price: '₹1,980/q', change: '+2.3%' },
  { mandi: 'Warangal', crop: 'Bt Cotton (Long Staple)', price: '₹6,350/q', change: '+1.4%' },
  { mandi: 'Khammam', crop: 'Teja Red Chilli', price: '₹8,400/q', change: '+3.1%' },
  { mandi: 'Nizamabad', crop: 'Yellow Maize', price: '₹2,050/q', change: '+0.9%' },
  { mandi: 'Karimnagar', crop: 'Bold Groundnut', price: '₹5,800/q', change: '+0.8%' },
  { mandi: 'Adilabad', crop: 'Sharbati Wheat', price: '₹2,200/q', change: '+1.2%' },
  { mandi: 'Nalgonda', crop: 'Yellow Soybean', price: '₹4,600/q', change: '+1.6%' },
];

export interface LandingPageScreenProps {
  onFarmerGetStarted?: () => void;
  onFarmerAuth?: (tab?: 'login' | 'signup') => void;
  onBuyerAuth?: (tab?: 'login' | 'signup') => void;
  onGovtLogin?: () => void;
  onBuyerLogin?: () => void;
}

export const LandingPageScreen: React.FC<LandingPageScreenProps> = ({
  onFarmerGetStarted,
  onFarmerAuth,
  onBuyerAuth,
  onGovtLogin,
  onBuyerLogin,
}) => {
  const navigate = useNavigate();

  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role Selection Login Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleFarmerAction = (tab: 'login' | 'signup' = 'signup') => {
    setShowRoleModal(false);
    if (onFarmerAuth) {
      onFarmerAuth(tab);
    } else if (onFarmerGetStarted) {
      onFarmerGetStarted();
    } else {
      navigate(`/login?role=farmer&mode=${tab}`);
    }
  };

  const handleGovtAction = () => {
    setShowRoleModal(false);
    if (onGovtLogin) {
      onGovtLogin();
    } else {
      navigate('/login?role=government&mode=login');
    }
  };

  const handleBuyerAction = (tab: 'login' | 'signup' = 'signup') => {
    setShowRoleModal(false);
    if (onBuyerAuth) {
      onBuyerAuth(tab);
    } else if (onBuyerLogin) {
      onBuyerLogin();
    } else {
      navigate(`/login?role=buyer&mode=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* ========================================================
          1. NAVBAR (Sticky Top, Frosted Glass)
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20">
              <Sprout className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                Fasal<span className="text-primary">Setu</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block -mt-0.5 tracking-wide">
                स्मार्ट खेती, समृद्ध किसान
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#for-buyers" className="hover:text-primary transition-colors">
              For Buyers
            </a>
            <a href="#government" className="hover:text-primary transition-colors">
              Government
            </a>
            <a href="#about" className="hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="text-sm font-bold text-slate-700 hover:text-primary transition-colors cursor-pointer px-3 py-2"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleFarmerAction('signup')}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="text-xs font-bold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1.5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1.5"
            >
              How It Works
            </a>
            <a
              href="#for-buyers"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1.5"
            >
              For Buyers
            </a>
            <a
              href="#government"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 py-1.5"
            >
              Government
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowRoleModal(true);
                }}
                className="w-full text-center py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Log In to Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleFarmerAction();
                }}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl"
              >
                Get Started as Farmer
              </button>
            </div>
          </div>
        )}
      </header>


      {/* ========================================================
          2. HERO SECTION
          Gradient bg, headline, dual CTAs, hero photo & metrics
         ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white pt-14 pb-16 md:pt-20 md:pb-24">
        {/* Subtle Decorative Backdrop Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-tint/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200/90 shadow-2xs">
              <span className="text-base">🌾</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                From Farm to Market — Direct, Fair & Intelligent
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl">
              Healthy crops.{' '}
              <span className="text-primary italic font-bold">Stronger farmers.</span>{' '}
              A brighter rural India.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
              FasalSetu connects farmers directly with verified buyers using AI-powered crop health
              checks, fair price negotiation, and real-time market intelligence.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => handleFarmerAction('signup')}
                className="bg-primary hover:bg-primary-dark text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center text-center"
              >
                I'm a Farmer
              </button>

              <button
                type="button"
                onClick={() => handleBuyerAction('signup')}
                className="bg-white hover:bg-emerald-50/70 border-2 border-primary text-primary font-semibold text-base px-8 py-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center text-center shadow-2xs"
              >
                I'm a Buyer
              </button>
            </div>

            {/* Hero Stat Cards — fills the space with product proof points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-primary flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">98%</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">AI Scan Accuracy</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">+8%</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Better Than Mandi Rates</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">₹50Cr+</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">Securely Transacted</div>
              </div>
            </div>

            {/* Trust Metric Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>10,000+ Farmers</span>
              </div>
              <span className="text-slate-300">·</span>
              <span>500+ Verified Buyers</span>
              <span className="text-slate-300">·</span>
              <span>33 Districts Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. PROCESS STRIP
          Predict -> Prescribe -> Produce -> Connect -> Negotiate
         ======================================================== */}
      <section className="bg-white border-y border-slate-200/90 py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-2">
            {[
              { label: 'Predict', icon: CloudRain, color: 'bg-sky-100 text-sky-600', sub: 'Weather & Soil' },
              { label: 'Prescribe', icon: Leaf, color: 'bg-emerald-100 text-emerald-700', sub: 'AI Health Scan' },
              { label: 'Produce', icon: Layers, color: 'bg-amber-100 text-amber-700', sub: 'Harvest Lots' },
              { label: 'Connect', icon: Users, color: 'bg-blue-100 text-blue-700', sub: 'Verified Buyers' },
              { label: 'Negotiate', icon: IndianRupee, color: 'bg-emerald-100 text-primary', sub: 'Guaranteed Deals' },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex items-center gap-3 p-2 rounded-xl">
                    <div
                      className={`w-11 h-11 rounded-full ${step.color} flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-900">{step.label}</div>
                      <div className="text-[11px] font-medium text-slate-500">{step.sub}</div>
                    </div>
                  </div>
                  {idx < 4 && (
                    <ChevronRight className="hidden md:block w-5 h-5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. FEATURES SECTION
          3-Column Grid of 6 Modern Feature Cards
         ======================================================== */}
      <section id="features" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Header */}
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              Comprehensive Farm Intelligence
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything you need, in one platform
            </h3>
            <p className="text-slate-600 text-base">
              Built from the ground up to solve the real-world operational challenges of Indian
              farmers and mandi procurement.
            </p>
          </div>

          {/* Grid of 6 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                🌦️
              </div>
              <h4 className="text-lg font-bold text-slate-900">Crop Health Check</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Snap a photo with your mobile camera and get instant AI diagnosis with disease
                severity and recommended chemical and organic treatment protocols.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                💧
              </div>
              <h4 className="text-lg font-bold text-slate-900">Water & Irrigation Advisory</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Know exactly when and how much to irrigate based on real-time soil moisture sensors,
                weather forecasts, and evapotranspiration data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                📈
              </div>
              <h4 className="text-lg font-bold text-slate-900">Yield & Harvest Estimate</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Predict your total harvest yield quantity and expected mandi market value weeks in
                advance to plan logistics and farm finances.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                🤝
              </div>
              <h4 className="text-lg font-bold text-slate-900">Verified Buyer Matching</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Get matched with trusted retail buyers, millers, and aggregators actively looking
                for your specific crop grade without middlemen cuts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                ⚖️
              </div>
              <h4 className="text-lg font-bold text-slate-900">Fair Price Negotiation</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                AI-powered fair price zones ensure you never underprice your harvest. Compare buyer
                offers, counter with one tap, and lock deals transparently.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 text-2xl shadow-2xs">
                🔒
              </div>
              <h4 className="text-lg font-bold text-slate-900">Secure Transactions</h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Escrow payment protection ensures your money is safely transferred directly to your
                bank account once the buyer confirms lot receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. HOW IT WORKS SECTION
          Alternating 3 Steps with Mockup Previews
         ======================================================== */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              Simple & Transparent
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How FasalSetu Works
            </h3>
            <p className="text-slate-600 text-base">
              A streamlined three-step journey from harvest listing to guaranteed bank deposit.
            </p>
          </div>

          {/* Step 1: List your crop in minutes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-primary">
                STEP 01
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                List your crop in minutes
              </h4>
              <p className="text-slate-600 text-base leading-relaxed">
                Specify your crop variety, quantity in quintals, quality grade, and upload photo
                proofs of your harvest bags directly from your smartphone. Our platform verifies
                your lot details automatically.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Custom lot tagging with harvest dates & location</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Photo verification with cover picture selection</span>
                </li>
              </ul>
            </div>

            {/* Mockup Card 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-lg">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400">CREATE CROP LOT</span>
                  <span className="text-xs font-bold text-primary">Step 1 of 3</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-slate-500 block">Crop Type</span>
                    <span className="font-bold text-slate-800 text-sm">🌾 Rice (Paddy)</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-slate-500 block">Quantity</span>
                    <span className="font-bold text-slate-800 text-sm">50 Quintals</span>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Grade A (Premium) Quality Standard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Get matched with verified buyers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Mockup Card 2 (Left on desktop) */}
            <div className="order-2 lg:order-1 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-lg">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">MATCHED BUYERS (3)</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active Offers
                  </span>
                </div>
                {/* Sample Buyer Offer Card */}
                <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">Shree Balaji Agro Foods</div>
                    <div className="text-[11px] text-slate-500">Kothapet · 12km away</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-primary">₹1,980/q</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Top Offer</div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">AgriFresh Retail Mart</div>
                    <div className="text-[11px] text-slate-500">Hyderabad · 25km away</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-700">₹1,950/q</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Step 2 */}
            <div className="order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                STEP 02
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Get matched with verified buyers
              </h4>
              <p className="text-slate-600 text-base leading-relaxed">
                As soon as your lot is published, buyers receive instant alerts. You can review buyer
                profiles, mandi ratings, distance, and direct price offers without any sales pressure.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>100% verified institutional buyers and retail merchants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Side-by-side comparison of bids and delivery conditions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3: Negotiate fair prices with AI guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                STEP 03
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Negotiate fair prices with AI guidance
              </h4>
              <p className="text-slate-600 text-base leading-relaxed">
                Use our visual Fair Price Meter to benchmark buyer offers against APMC mandi rates
                and state averages. Counter offers in real time and finalize sales with digital
                contracts.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Interactive counter-offer tool with suggested price bands</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Direct settlement with instant bank credit notification</span>
                </li>
              </ul>
            </div>

            {/* Mockup Card 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-lg">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-500">FAIR PRICE ZONE</span>
                  <span className="text-xs font-bold text-emerald-600">Optimal Value</span>
                </div>
                {/* Visual price gauge bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Mandi Base: ₹1,850</span>
                    <span className="text-primary font-bold">Fair Zone: ₹1,980 - ₹2,100</span>
                    <span>High: ₹2,150</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="w-1/4 bg-amber-200" />
                    <div className="w-1/2 bg-emerald-400" />
                    <div className="w-1/4 bg-sky-200" />
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Accepted Price:</span>
                  <span className="text-base font-extrabold text-primary">₹2,050 / quintal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FOR GOVERNMENT / OFFICIALS SECTION
          Dark Navy Background #0F172A
         ======================================================== */}
      <section id="government" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>COMMAND CENTER PORTAL</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Built for policymakers and agricultural officers
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                Government agencies use FasalSetu's Command Center to monitor crop risk, track disease
                hotspots, and coordinate field interventions across districts in real time.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">District-Level Risk Mapping</span>
                    <span className="text-xs text-slate-400">
                      Live satellite telemetry from ISRO Bhuvan and ESA Sentinel-2.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Automated Field Interventions</span>
                    <span className="text-xs text-slate-400">
                      Kanban dispatch management for agricultural officers & Rythu Vedika officers.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">
                      Automated Executive Reporting
                    </span>
                    <span className="text-xs text-slate-400">
                      Export state-wide pest surge and yield audit logs to PDF & Excel.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGovtAction}
                  className="border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
                >
                  <span>Government & Agency Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Command Center Dashboard Preview Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-2xl relative">
                {/* Header preview bar */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Telangana Agri Risk Command
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Live Surveillance</span>
                </div>

                {/* Stylized Zone Map graphic */}
                <div className="h-48 bg-slate-950/60 rounded-xl border border-slate-700/80 p-4 relative flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-2 z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Nalgonda Outbreak Alert</span>
                    </div>
                    <div className="text-xs text-slate-400">12,400 Hectares Under Active Monitoring</div>
                  </div>

                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                {/* Stats row below */}
                <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">Hotspots</div>
                    <div className="text-base font-bold text-white">17 Active</div>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">Squads</div>
                    <div className="text-base font-bold text-emerald-400">6 Deployed</div>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">Resolution</div>
                    <div className="text-base font-bold text-white">92.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. TESTIMONIALS SECTION
         ======================================================== */}
      <section id="for-buyers" className="py-20 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Voices from the Mandi</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted by farmers and agribusinesses
            </h3>
            <p className="text-slate-600 text-base">
              See how FasalSetu is transforming agricultural livelihoods across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 text-sm">
                  {'★'.repeat(5)}
                </div>
                <p className="text-slate-700 text-sm italic leading-relaxed">
                  "FasalSetu got me ₹180/quintal more for my Grade A Rice than what local commission
                  agents offered. The money was directly transferred in 24 hours."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-primary font-bold flex items-center justify-center">
                  R
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Rameshwar Patil</div>
                  <div className="text-xs text-slate-500">Paddy Farmer · Kothapet, Telangana</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 text-sm">
                  {'★'.repeat(5)}
                </div>
                <p className="text-slate-700 text-sm italic leading-relaxed">
                  "The AI crop scan caught Rice Blast in my cotton field 4 days before it showed on
                  the outer leaves. That one recommendation saved me over ₹60,000 in harvest loss."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                  S
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Sunita Devi</div>
                  <div className="text-xs text-slate-500">Cotton Farmer · Warangal, Telangana</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center text-amber-500 text-sm">
                  {'★'.repeat(5)}
                </div>
                <p className="text-slate-700 text-sm italic leading-relaxed">
                  "Direct procurement with pre-graded photos cut our mandi travel costs and eliminated
                  sorting disputes. We procured over 400 quintals through FasalSetu this season."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  V
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Vikram Reddy</div>
                  <div className="text-xs text-slate-500">Procurement Head · GreenFields Traders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FINAL CTA BANNER
          Solid Green #16A34A, White Text
         ======================================================== */}
      <section className="bg-primary py-16 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Ready to grow smarter?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of Indian farmers and buyers trading with trust, transparency, and
            AI-driven precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleFarmerAction('login')}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-primary font-bold text-base px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Sign In as Farmer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleBuyerAction('login')}
              className="w-full sm:w-auto bg-primary-dark/40 hover:bg-primary-dark/70 border-2 border-white text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Sign In as Buyer</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. FOOTER
          Dark Navy #0F172A, Multi-Column
         ======================================================== */}
      <footer id="about" className="bg-slate-900 text-slate-400 py-16 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 text-left">
            {/* Brand Col */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">FasalSetu</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Empowering Indian farmers through AI-driven crop diagnostics, soil telemetry, fair
                price guarantees, and direct market linkage.
              </p>
              <div className="text-xs text-emerald-400 font-semibold">
                🌾 An Initiative for Atmanirbhar Krishi
              </div>
            </div>

            {/* Col 1: Product */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Product</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Crop Health Check</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Water Advisory</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Yield Predictor</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Matched Buyers</a></li>
                <li><a href="#government" className="hover:text-white transition-colors">Command Center</a></li>
              </ul>
            </div>

            {/* Col 2: Company */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Company</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Rythu Vedika Partner</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Press & Media</a></li>
              </ul>
            </div>

            {/* Col 3: Resources & Legal */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Resources</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Toll-Free Helpline</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Terms of Trade</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© 2026 FasalSetu Platform. Empowering farmers, strengthening food security.</div>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ for Indian Farmers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          MODAL: ROLE SELECTOR ("Log In" clicked)
         ======================================================== */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Select Your Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose your role to access your dedicated FasalSetu workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Farmer Portal */}
              <button
                type="button"
                onClick={() => handleFarmerAction('login')}
                className="w-full p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-primary text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                      Farmer Portal
                    </div>
                    <div className="text-xs text-slate-600">
                      Crop health AI, lot management, and buyer offers
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Buyer Portal */}
              <button
                type="button"
                onClick={() => handleBuyerAction('login')}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-slate-50 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                      Buyer & Trader Portal
                    </div>
                    <div className="text-xs text-slate-500">
                      Browse verified lots, submit bids, and secure contracts
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Government Portal */}
              <button
                type="button"
                onClick={handleGovtAction}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-900 hover:text-white text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-slate-800">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 group-hover:text-white transition-colors">
                      Government Command Center
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                      District risk mapping, hotspot alerts & field teams
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Role Selector Modal */}
    </div>
  );
};

export default LandingPageScreen;
