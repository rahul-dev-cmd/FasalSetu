import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lightbulb,
  Check,
  RefreshCw,
  X,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { BuyerOffer } from '../data/mockBuyerOffers';

export interface NegotiationScreenProps {
  onBack: () => void;
  onAccept?: (buyer: BuyerOffer, finalPrice: number) => void;
  buyer: BuyerOffer;
  lotSummary?: {
    cropType: string;
    quantity: string;
    unit: string;
  };
  forceMobile?: boolean;
}

// Fair price zone boundaries
const FAIR_ZONE = {
  min: 1750,
  max: 2050,
  marketRef: 1900,
};

export const NegotiationScreen: React.FC<NegotiationScreenProps> = ({
  onBack,
  onAccept,
  buyer,
  lotSummary,
  forceMobile = false,
}) => {
  const buyerOffer = buyer.offerPrice;
  const aiCounter = Math.round(buyer.offerPrice * 1.035 / 10) * 10; // ~3.5% above buyer offer, rounded to nearest 10
  const [yourAsk, setYourAsk] = useState<number>(Math.min(aiCounter + 50, FAIR_ZONE.max));

  // Counter modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterInput, setCounterInput] = useState<string>(yourAsk.toString());

  // Reject confirmation state
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Accept animation state
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAcceptToast, setShowAcceptToast] = useState(false);

  // Slider drag state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const lotSubtitle = lotSummary
    ? `${buyer.name} · ${lotSummary.quantity} ${lotSummary.unit.charAt(0).toUpperCase() + lotSummary.unit.slice(1)} · ${lotSummary.cropType}`
    : `${buyer.name}`;

  // Convert price to slider percentage (0–100)
  const priceToPercent = (price: number) => {
    return Math.max(0, Math.min(100, ((price - FAIR_ZONE.min) / (FAIR_ZONE.max - FAIR_ZONE.min)) * 100));
  };

  // Convert slider percentage to price
  const percentToPrice = (pct: number) => {
    return Math.round((FAIR_ZONE.min + (pct / 100) * (FAIR_ZONE.max - FAIR_ZONE.min)) / 5) * 5;
  };

  const handleSliderInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newPrice = percentToPrice(pct);
    setYourAsk(Math.max(FAIR_ZONE.min, Math.min(FAIR_ZONE.max, newPrice)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleSliderInteraction(clientX);
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleSliderInteraction]);

  const handleAccept = () => {
    setIsAccepting(true);
    console.log('[Negotiation] Accepting offer from', buyer.name, 'at ₹' + buyerOffer + '/' + buyer.priceUnit);

    setTimeout(() => {
      setIsAccepting(false);
      setShowAcceptToast(true);

      setTimeout(() => {
        if (onAccept) {
          onAccept(buyer, buyerOffer);
        } else {
          onBack();
        }
      }, 1400);
    }, 1200);
  };

  const handleCounterSubmit = () => {
    const value = parseInt(counterInput, 10);
    if (!isNaN(value) && value >= FAIR_ZONE.min && value <= FAIR_ZONE.max) {
      setYourAsk(value);
      setShowCounterModal(false);
      console.log('[Negotiation] Counter offer submitted:', '₹' + value + '/' + buyer.priceUnit);
    }
  };

  const handleRejectConfirm = () => {
    console.log('[Negotiation] Rejected buyer:', buyer.name);
    setShowRejectConfirm(false);
    onBack();
  };

  // Slider marker positions
  const buyerPct = priceToPercent(buyerOffer);
  const aiPct = priceToPercent(aiCounter);
  const yourPct = priceToPercent(yourAsk);
  const marketPct = priceToPercent(FAIR_ZONE.marketRef);

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Toasts */}
      {showAcceptToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <Check className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
            <span>Offer accepted! Deal confirmed ✓</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-[700px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER CARD
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-0.5"
              title="Back to Matched Buyers"
              aria-label="Back to Matched Buyers"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight">
                Negotiation
              </h1>
              <p className="text-xs sm:text-sm text-farmText-gray font-medium mt-0.5 truncate">
                {lotSubtitle}
              </p>
            </div>

            {/* Verified Buyer Badge */}
            {buyer.verified && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full border border-emerald-200 shrink-0 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Verified Buyer</span>
                <span className="sm:hidden">Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* ========================================================
            2. FAIR PRICE ZONE — Interactive Slider
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-6 shadow-xs space-y-5">
          {/* Section Label */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm sm:text-base font-bold text-farmText-dark tracking-tight">
              Fair Price Zone
            </h2>
          </div>

          {/* Slider Visual */}
          <div className="relative pt-10 pb-6 px-1">
            {/* Background Track */}
            <div
              ref={sliderRef}
              className="relative w-full h-3 rounded-full bg-slate-200 cursor-pointer select-none touch-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Fair Zone (green highlighted region: market ref ± some range) */}
              <div
                className="absolute top-0 h-full bg-emerald-100 rounded-full"
                style={{
                  left: `${priceToPercent(FAIR_ZONE.marketRef - 100)}%`,
                  width: `${priceToPercent(FAIR_ZONE.marketRef + 100) - priceToPercent(FAIR_ZONE.marketRef - 100)}%`,
                }}
              />

              {/* Market Ref line */}
              <div
                className="absolute top-0 h-full w-0.5 bg-primary/40"
                style={{ left: `${marketPct}%` }}
              />

              {/* Buyer Offer marker */}
              <div
                className="absolute -top-8 flex flex-col items-center"
                style={{ left: `${buyerPct}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap bg-white/90 px-1 rounded">
                  ₹{buyerOffer.toLocaleString('en-IN')}
                </span>
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-slate-400 mt-0.5" />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white shadow-sm z-10"
                style={{ left: `${buyerPct}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />

              {/* AI Counter marker */}
              <div
                className="absolute -top-8 flex flex-col items-center"
                style={{ left: `${aiPct}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-primary whitespace-nowrap bg-emerald-50 px-1 rounded border border-primary/20">
                  ₹{aiCounter.toLocaleString('en-IN')}
                </span>
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-primary mt-0.5" />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm z-10"
                style={{ left: `${aiPct}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />

              {/* Your Ask — draggable handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary border-[3px] border-white shadow-lg z-20 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl"
                style={{
                  left: `${yourPct}%`,
                  transform: `translateX(-50%) translateY(-50%)`,
                  boxShadow: isDragging ? '0 0 0 6px rgba(22, 163, 74, 0.18)' : undefined,
                }}
              />
              <div
                className="absolute flex flex-col items-center z-20"
                style={{ left: `${yourPct}%`, transform: 'translateX(-50%)', top: 'calc(100% + 6px)' }}
              >
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-primary" />
                <span className="text-[11px] sm:text-xs font-extrabold text-white bg-primary px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                  ₹{yourAsk.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Min / Market Ref / Max Labels */}
            <div className="flex items-center justify-between mt-8 text-[10px] sm:text-[11px] text-farmText-gray font-medium">
              <span>Min ₹{FAIR_ZONE.min.toLocaleString('en-IN')}</span>
              <span className="text-primary font-semibold">Market Ref ₹{FAIR_ZONE.marketRef.toLocaleString('en-IN')}</span>
              <span>Max ₹{FAIR_ZONE.max.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap text-[10px] sm:text-[11px] text-farmText-gray font-medium px-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Buyer Offer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              AI Counter
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-2.5 rounded-full bg-primary border-2 border-white shadow-2xs" />
              Your Ask
            </span>
          </div>
        </div>

        {/* ========================================================
            3. THREE-COLUMN STAT ROW
           ======================================================== */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Buyer Offer */}
          <div className="bg-white rounded-[14px] border border-farmBorder p-3 sm:p-4 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs text-farmText-gray font-semibold uppercase tracking-wider">
              Buyer Offer
            </p>
            <p className="text-lg sm:text-xl font-bold text-farmText-dark mt-1 tracking-tight">
              ₹{buyerOffer.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-farmText-gray font-medium">/ {buyer.priceUnit}</p>
          </div>

          {/* AI Counter */}
          <div className="bg-primary-subtle rounded-[14px] border border-primary/20 p-3 sm:p-4 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs text-primary font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Counter
            </p>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1 tracking-tight">
              ₹{aiCounter.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-primary/70 font-medium">/ {buyer.priceUnit}</p>
          </div>

          {/* Your Ask */}
          <div className="bg-white rounded-[14px] border-2 border-primary p-3 sm:p-4 text-center shadow-xs">
            <p className="text-[10px] sm:text-xs text-farmText-gray font-semibold uppercase tracking-wider">
              Your Ask
            </p>
            <p className="text-lg sm:text-xl font-bold text-farmText-dark mt-1 tracking-tight">
              ₹{yourAsk.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-farmText-gray font-medium">/ {buyer.priceUnit}</p>
          </div>
        </div>

        {/* ========================================================
            4. INFO BANNER
           ======================================================== */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-[14px] px-4 py-3 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 stroke-[2.2]" />
          <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
            This is a <span className="font-bold">fair price zone</span>. You can counter for a better deal or accept the buyer's current offer.
          </p>
        </div>

        {/* ========================================================
            5. ACTION BUTTONS
           ======================================================== */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
          {/* Accept Offer — Primary */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className={`flex-1 h-[52px] min-h-[44px] rounded-[12px] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 select-none ${
              isAccepting
                ? 'bg-emerald-400 text-white cursor-wait'
                : 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white cursor-pointer'
            }`}
          >
            {isAccepting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Accept ₹{buyerOffer.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>

          {/* Counter — Secondary (Amber) */}
          <button
            type="button"
            onClick={() => {
              setCounterInput(yourAsk.toString());
              setShowCounterModal(true);
            }}
            disabled={isAccepting}
            className="flex-1 h-[52px] min-h-[44px] rounded-[12px] font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white shadow-xs transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Counter</span>
          </button>

          {/* Reject — Tertiary (Outline Red) */}
          <button
            type="button"
            onClick={() => setShowRejectConfirm(true)}
            disabled={isAccepting}
            className="sm:w-auto h-[52px] min-h-[44px] px-6 rounded-[12px] font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 active:scale-[0.99] shadow-xs transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Reject</span>
          </button>
        </div>

      </div>

      {/* ========================================================
          COUNTER OFFER MODAL
         ======================================================== */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] border border-farmBorder shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-farmText-dark">
                Submit Counter Offer
              </h3>
              <button
                type="button"
                onClick={() => setShowCounterModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-gray transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-farmText-gray">
              Enter your counter price per {buyer.priceUnit}. Fair range: ₹{FAIR_ZONE.min.toLocaleString('en-IN')} – ₹{FAIR_ZONE.max.toLocaleString('en-IN')}
            </p>

            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-farmText-gray" />
              <input
                type="number"
                value={counterInput}
                onChange={(e) => setCounterInput(e.target.value)}
                min={FAIR_ZONE.min}
                max={FAIR_ZONE.max}
                step={5}
                className="w-full h-12 pl-10 pr-4 rounded-[12px] border border-farmBorder bg-farmBg text-farmText-dark text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder={yourAsk.toString()}
                autoFocus
              />
            </div>

            <div className="text-[11px] text-farmText-gray font-medium flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              AI recommends: <span className="font-bold text-primary">₹{aiCounter.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCounterModal(false)}
                className="flex-1 h-11 rounded-[10px] bg-white border border-farmBorder text-farmText-dark font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCounterSubmit}
                className="flex-1 h-11 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                Submit ₹{counterInput}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REJECT CONFIRMATION DIALOG
         ======================================================== */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] border border-farmBorder shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-farmText-dark">
                  Reject This Offer?
                </h3>
                <p className="text-xs text-farmText-gray mt-0.5">
                  You'll remove {buyer.name} from your matches
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-farmText-gray leading-relaxed">
              This action cannot be undone. The buyer's offer of <span className="font-bold text-farmText-dark">₹{buyerOffer.toLocaleString('en-IN')}/{buyer.priceUnit}</span> will be permanently declined.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 h-11 rounded-[10px] bg-white border border-farmBorder text-farmText-dark font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Keep Offer
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="flex-1 h-11 rounded-[10px] bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default NegotiationScreen;
