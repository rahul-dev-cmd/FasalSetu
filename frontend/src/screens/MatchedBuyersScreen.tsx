import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  MapPin,
  ChevronRight,
  Search,
  Leaf,
  Award,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import { BuyerOffer } from '../data/mockBuyerOffers';

export interface MatchedBuyersScreenProps {
  onBack: () => void;
  onSelectBuyer?: (buyer: BuyerOffer) => void;
  buyers?: BuyerOffer[];
  lotSummary?: {
    cropType: string;
    quantity: string;
    unit: string;
    grade: string;
  };
  forceMobile?: boolean;
}

export const MatchedBuyersScreen: React.FC<MatchedBuyersScreenProps> = ({
  onBack,
  onSelectBuyer,
  buyers = [],
  lotSummary,
  forceMobile = false,
}) => {
  // Derive lot subtitle from summary data
  const lotSubtitle = lotSummary
    ? `${lotSummary.quantity} ${lotSummary.unit.charAt(0).toUpperCase() + lotSummary.unit.slice(1)} · ${lotSummary.cropType} · Grade ${lotSummary.grade}`
    : 'Buyers found for your lot';

  // Dynamically determine the best price (highest offer)
  const bestPrice = buyers.length > 0
    ? Math.max(...buyers.map((b) => b.offerPrice))
    : 0;

  const handleBuyerClick = (buyer: BuyerOffer) => {
    console.log('[MatchedBuyers] Selected buyer for negotiation:', buyer);
    if (onSelectBuyer) {
      onSelectBuyer(buyer);
    }
  };

  return (
    <DashboardLayout
      activeTab="market"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Centered Content Column */}
      <div className="w-full max-w-[760px] mx-auto space-y-4 sm:space-y-5 pb-8">

        {/* ========================================================
            1. HEADER
            Back arrow + Title + Lot subtitle
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to My Lots"
              aria-label="Back to My Lots"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight">
                Matched Buyers
              </h1>
              <p className="text-xs sm:text-sm text-farmText-gray font-medium mt-0.5 truncate">
                {lotSubtitle}
              </p>
            </div>

            {/* Offers count badge */}
            {buyers.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-primary-subtle border border-primary/20 text-primary-dark text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span>{buyers.length} Offer{buyers.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            2. BUYER CARDS LIST or EMPTY STATE
           ======================================================== */}
        {buyers.length === 0 ? (
          /* ---- EMPTY STATE ---- */
          <div className="bg-white rounded-[16px] border border-farmBorder p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-7 h-7 text-slate-400 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-farmText-dark">
                No offers yet
              </h3>
              <p className="text-xs sm:text-sm text-farmText-gray font-medium mt-1 max-w-xs mx-auto leading-relaxed">
                We'll notify you when buyers respond to your listing. This usually takes 2–6 hours.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary-subtle text-primary-dark text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/15 mt-2">
              <Leaf className="w-3.5 h-3.5" />
              <span>Your listing is live on the marketplace</span>
            </div>
          </div>
        ) : (
          /* ---- BUYER CARDS ---- */
          <div className="space-y-3 sm:space-y-3.5">
            {buyers.map((buyer) => {
              const isTopOffer = buyer.offerPrice === bestPrice;

              return (
                <button
                  key={buyer.id}
                  type="button"
                  onClick={() => handleBuyerClick(buyer)}
                  className="w-full bg-white rounded-[16px] border border-farmBorder p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary relative"
                >
                  {/* Top offer subtle highlight */}
                  {isTopOffer && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-t-[16px]" />
                  )}

                  <div className="flex items-start gap-3.5 sm:gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 shadow-xs"
                      style={{ backgroundColor: buyer.avatarColor }}
                    >
                      {buyer.avatarInitial}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Name Row + Verified Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-farmText-dark truncate max-w-[200px] sm:max-w-none">
                          {buyer.name}
                        </h3>
                        {buyer.verified && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Tags Row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {buyer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price + Best Price Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                          ₹{buyer.offerPrice.toLocaleString('en-IN')}
                          <span className="text-xs sm:text-sm font-medium text-farmText-gray ml-1">
                            / {buyer.priceUnit}
                          </span>
                        </span>
                        {isTopOffer && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                            <Award className="w-3 h-3 text-amber-500" />
                            Best Price
                          </span>
                        )}
                      </div>

                      {/* Rating + Distance Row */}
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-farmText-gray font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-farmText-dark">{buyer.rating}</span>
                          <span>({buyer.reviewCount})</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{buyer.distanceKm} km</span>
                        </span>
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <div className="flex items-center justify-center h-full self-center shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================
            3. INFO FOOTER NOTE
           ======================================================== */}
        {buyers.length > 0 && (
          <div className="text-center px-4">
            <p className="text-[11px] sm:text-xs text-farmText-gray font-medium leading-relaxed">
              Offers are sorted by highest price. Tap any buyer to start negotiation.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MatchedBuyersScreen;
