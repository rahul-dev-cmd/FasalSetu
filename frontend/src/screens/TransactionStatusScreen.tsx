import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Truck,
  IndianRupee,
  CircleCheck,
  Clock,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Info,
  CheckCircle2,
  Handshake,
  CalendarDays,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { BuyerOffer } from '../data/mockBuyerOffers';
import { marketplaceApi } from '../services/api';

export interface TransactionStatusScreenProps {
  onBack: () => void;
  onComplete?: () => void;
  buyer: BuyerOffer;
  agreedPrice: number;
  lotSummary?: {
    cropType: string;
    quantity: string;
    unit: string;
    location: string;
  };
  forceMobile?: boolean;
  transactionId?: number;
}

// Generate dates relative to now
const getRelativeDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

type StageStatus = 'completed' | 'active' | 'pending';

interface TimelineStage {
  id: string;
  label: string;
  subtext: string;
  icon: React.ReactNode;
  status: StageStatus;
}

export const TransactionStatusScreen: React.FC<TransactionStatusScreenProps> = ({
  onBack,
  onComplete,
  buyer,
  agreedPrice,
  lotSummary,
  forceMobile = false,
  transactionId,
}) => {
  const qty = parseInt(lotSummary?.quantity || '50', 10);
  const totalAmount = qty * agreedPrice;
  const pickupDate = getRelativeDate(2);
  const paymentDate = getRelativeDate(6);
  const farmLocation = lotSummary?.location || mockFarmerData.profile.location || 'Kothapet, Telangana';
  const cropType = lotSummary?.cropType || 'Rice';
  const unit = lotSummary?.unit || 'quintals';

  const subtitle = `${buyer.name} · ${qty} ${unit.charAt(0).toUpperCase() + unit.slice(1)} · ${cropType} · ₹${agreedPrice.toLocaleString('en-IN')}/${buyer.priceUnit}`;

  // Contact modal
  const [showContactModal, setShowContactModal] = useState(false);

  // Completion toast
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Dynamic active stage state
  const [activeStage, setActiveStage] = useState<'logistics' | 'payment' | 'completed'>('logistics');
  const [currentTxId, setCurrentTxId] = useState<number | undefined>(transactionId);

  useEffect(() => {
    let isMounted = true;
    if (transactionId) {
      marketplaceApi.getTransaction(transactionId)
        .then((tx) => {
          if (isMounted && tx) {
            if (tx.overall_status === 'completed') setActiveStage('completed');
            else if (tx.logistics_status === 'completed') setActiveStage('payment');
            else setActiveStage('logistics');
          }
        })
        .catch(() => {});
    } else {
      marketplaceApi.getMyTransactions()
        .then((txList) => {
          if (isMounted && txList && txList.length > 0) {
            const latest = txList[0];
            setCurrentTxId(latest.id);
            if (latest.overall_status === 'completed') setActiveStage('completed');
            else if (latest.logistics_status === 'completed') setActiveStage('payment');
            else setActiveStage('logistics');
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  const handleAdvanceStage = async (stageToAdvance: 'logistics' | 'payment') => {
    if (currentTxId) {
      try {
        await marketplaceApi.advanceTransaction(currentTxId, stageToAdvance);
      } catch (err) {
        console.warn('Backend advance transaction fallback:', err);
      }
    }

    if (stageToAdvance === 'logistics') {
      setActiveStage('payment');
    } else if (stageToAdvance === 'payment') {
      setActiveStage('completed');
      setShowCompletionToast(true);
      if (onComplete) onComplete();
    }
  };

  // Timeline stages based on activeStage
  const stages: TimelineStage[] = [
    {
      id: 'matched',
      label: 'Matched',
      subtext: 'Buyer selected',
      icon: <Handshake className="w-4 h-4" />,
      status: 'completed',
    },
    {
      id: 'negotiated',
      label: 'Negotiated',
      subtext: `Price agreed at ₹${agreedPrice.toLocaleString('en-IN')}/${buyer.priceUnit}`,
      icon: <Check className="w-4 h-4 stroke-[3]" />,
      status: 'completed',
    },
    {
      id: 'logistics',
      label: 'Logistics',
      subtext: activeStage === 'logistics' ? `Pickup scheduled for ${pickupDate}` : 'Pickup confirmed',
      icon: <Truck className="w-4 h-4" />,
      status: activeStage === 'logistics' ? 'active' : 'completed',
    },
    {
      id: 'payment',
      label: 'Payment',
      subtext:
        activeStage === 'completed'
          ? 'Payment received'
          : activeStage === 'payment'
          ? 'Awaiting farmer confirmation'
          : 'Processing',
      icon: <IndianRupee className="w-4 h-4" />,
      status: activeStage === 'completed' ? 'completed' : activeStage === 'payment' ? 'active' : 'pending',
    },
    {
      id: 'completed',
      label: 'Completed',
      subtext: activeStage === 'completed' ? 'Money credited to account' : 'Pending final settlement',
      icon: <CircleCheck className="w-4 h-4" />,
      status: activeStage === 'completed' ? 'completed' : 'pending',
    },
  ];

  // Payment progress percentage
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const paymentProgress = Math.round(
    activeStage === 'completed'
      ? 100
      : activeStage === 'payment'
      ? 75
      : ((completedCount + 0.5) / stages.length) * 100
  );

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Completion Toast */}
      {showCompletionToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
            <span>Payment received! ₹{totalAmount.toLocaleString('en-IN')} credited ✓</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-[860px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER CARD
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-0.5"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight">
                Transaction Status
              </h1>
              <p className="text-[11px] sm:text-sm text-farmText-gray font-medium mt-0.5 truncate">
                {subtitle}
              </p>
            </div>

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
            2. TWO-COLUMN LAYOUT (stacks on mobile)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">

          {/* ---- LEFT COLUMN: Order Progress Timeline (3/5 width on desktop) ---- */}
          <div className="md:col-span-3 bg-white rounded-[16px] border border-farmBorder p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm sm:text-base font-bold text-farmText-dark mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Order Progress
            </h2>

            {/* Vertical Timeline */}
            <div className="relative pl-5">
              {stages.map((stage, idx) => {
                const isLast = idx === stages.length - 1;
                const isCompleted = stage.status === 'completed';
                const isActive = stage.status === 'active';

                return (
                  <div key={stage.id} className="relative pb-7 last:pb-0">
                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-12px)] ${
                          isCompleted
                            ? 'bg-primary'
                            : isActive
                            ? 'bg-gradient-to-b from-primary to-slate-200'
                            : 'border-l-[2px] border-dashed border-slate-250'
                        }`}
                        style={
                          !isCompleted && !isActive
                            ? { borderColor: '#CBD5E1' }
                            : undefined
                        }
                      />
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Circle marker */}
                      <div
                        className={`relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-primary text-white shadow-sm'
                            : isActive
                            ? 'bg-primary text-white ring-[5px] ring-primary/15 shadow-md'
                            : 'bg-slate-100 text-slate-400 border-2 border-slate-250'
                        }`}
                        style={
                          !isCompleted && !isActive
                            ? { borderColor: '#CBD5E1' }
                            : undefined
                        }
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="scale-[0.85]">{stage.icon}</span>
                        )}

                        {/* Pulse ring for active stage */}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                        )}
                      </div>

                      {/* Label & Subtext */}
                      <div className="pt-0.5">
                        <p
                          className={`text-sm font-bold leading-tight ${
                            isCompleted || isActive
                              ? 'text-farmText-dark'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p
                          className={`text-[11px] sm:text-xs mt-0.5 font-medium leading-relaxed ${
                            isActive
                              ? 'text-primary'
                              : isCompleted
                              ? 'text-farmText-gray'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.subtext}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- RIGHT COLUMN: Stacked info cards (2/5 width on desktop) ---- */}
          <div className="md:col-span-2 space-y-4">

            {/* Expected Payment Card */}
            <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-farmText-gray font-semibold">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span>Expected Payment</span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-bold text-farmText-dark tracking-tight">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] sm:text-xs text-farmText-gray font-medium mt-0.5">
                  Expected by {paymentDate}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-farmText-gray font-medium">
                  <span>Payment pipeline</span>
                  <span className="font-bold text-primary">{paymentProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-farmText-gray font-medium">
                {qty} {unit} × ₹{agreedPrice.toLocaleString('en-IN')} = ₹{totalAmount.toLocaleString('en-IN')}
              </p>

              {activeStage === 'payment' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage('payment')}
                  className="w-full h-10 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs mt-3"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Payment Received (₹{totalAmount.toLocaleString('en-IN')})</span>
                </button>
              )}
              {activeStage === 'completed' && (
                <div className="w-full py-2.5 px-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Deal Closed & Payment Settled</span>
                </div>
              )}
            </div>

            {/* Pickup & Logistics Card */}
            <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-farmText-gray font-semibold">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Pickup & Logistics</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="w-3.5 h-3.5 text-farmText-gray mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-farmText-gray font-medium">Pickup Date</p>
                    <p className="text-xs sm:text-sm font-bold text-farmText-dark">{pickupDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-farmText-gray mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-farmText-gray font-medium">Pickup Location</p>
                    <p className="text-xs sm:text-sm font-bold text-farmText-dark">{farmLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Truck className="w-3.5 h-3.5 text-farmText-gray mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-farmText-gray font-medium">Logistics Partner</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs sm:text-sm font-bold text-farmText-dark">
                        {buyer.name} Transport
                      </p>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                        Self Pickup
                      </span>
                    </div>
                  </div>
                </div>

                {activeStage === 'logistics' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage('logistics')}
                    className="w-full h-10 rounded-[10px] bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs mt-3"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm Goods Dispatched / Picked Up</span>
                  </button>
                )}
                {activeStage !== 'logistics' && (
                  <div className="w-full py-2 px-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2 mt-2">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Pickup Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Details Card */}
            <div className="bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                  style={{ backgroundColor: buyer.avatarColor }}
                >
                  {buyer.avatarInitial}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-farmText-dark truncate">{buyer.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {buyer.verified && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        Verified
                      </span>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-farmText-gray font-medium">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {buyer.rating} ({buyer.reviewCount})
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-farmText-gray font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {buyer.distanceKm} km
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="w-full h-10 rounded-[10px] bg-white border border-primary text-primary hover:bg-primary-subtle font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
                Contact Buyer
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================
            3. PROTECTION INFO BANNER
           ======================================================== */}
        <div className="bg-sky-50 border border-sky-200/60 rounded-[14px] px-4 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-500 mt-0.5 shrink-0 stroke-[2.2]" />
          <p className="text-xs sm:text-sm text-sky-800 font-medium leading-relaxed">
            Your payment is <span className="font-bold">protected</span>. Funds are released only after the buyer confirms receipt of goods.
          </p>
        </div>

      </div>

      {/* ========================================================
          CONTACT BUYER MODAL
         ======================================================== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] border border-farmBorder shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-farmText-dark">
                Contact Buyer
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-gray transition-colors cursor-pointer"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Buyer Info in Modal */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div
                className="w-10 h-10 rounded-[8px] flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: buyer.avatarColor }}
              >
                {buyer.avatarInitial}
              </div>
              <div>
                <p className="text-sm font-bold text-farmText-dark">{buyer.name}</p>
                <p className="text-[11px] text-farmText-gray">
                  ₹{agreedPrice.toLocaleString('en-IN')}/{buyer.priceUnit} · {buyer.distanceKm} km away
                </p>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  console.log('[Transaction] Calling buyer:', buyer.name);
                  setShowContactModal(false);
                  alert(`[Stub] Calling ${buyer.name}...`);
                }}
                className="w-full h-12 rounded-[12px] bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 stroke-[2.2]" />
                Call Buyer
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log('[Transaction] Opening chat with:', buyer.name);
                  setShowContactModal(false);
                  alert(`[Stub] Opening chat with ${buyer.name}...`);
                }}
                className="w-full h-12 rounded-[12px] bg-white border border-farmBorder text-farmText-dark hover:bg-slate-50 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                Send Message
              </button>
            </div>

            <p className="text-[11px] text-center text-farmText-gray font-medium">
              Buyer will be notified of your contact request
            </p>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default TransactionStatusScreen;
