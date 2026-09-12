import React, { useState, useMemo } from 'react';
import {
  Plus,
  Layers,
  IndianRupee,
  CheckCircle2,
  MapPin,
  Calendar,
  ChevronRight,
  TrendingUp,
  Tag,
  Clock,
  Sparkles,
  Edit3,
  PackageOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerLots, FarmerLotItem, LotStatus } from '../data/mockFarmerLots';
import { mockFarmerData } from '../data/mockFarmerData';

export interface MyLotsScreenProps {
  forceMobile?: boolean;
  onNavigateHome?: () => void;
  onNavigateMarket?: () => void;
  onCreateLot?: () => void;
  onViewOffers?: (lot: FarmerLotItem) => void;
  onViewNegotiation?: (lot: FarmerLotItem) => void;
  onViewTransaction?: (lot: FarmerLotItem) => void;
  onContinueDraft?: (lot: FarmerLotItem) => void;
  onNavigateAlerts?: () => void;
  onNavigateProfile?: () => void;
  unreadAlertsCount?: number;
}

type FilterTab = 'Active' | 'In Negotiation' | 'Sold' | 'Draft' | 'All';

export const MyLotsScreen: React.FC<MyLotsScreenProps> = ({
  forceMobile = false,
  onNavigateHome,
  onNavigateMarket,
  onCreateLot,
  onViewOffers,
  onViewNegotiation,
  onViewTransaction,
  onContinueDraft,
  onNavigateAlerts,
  onNavigateProfile,
  unreadAlertsCount = 2,
}) => {
  // ── Tab Filter State (Active by default) ───────────────────────────
  const [selectedTab, setSelectedTab] = useState<FilterTab>('Active');

  // ── Filtered Lots ─────────────────────────────────────────────────
  const filteredLots = useMemo(() => {
    if (selectedTab === 'All') return mockFarmerLots;
    return mockFarmerLots.filter((lot) => lot.status === selectedTab);
  }, [selectedTab]);

  // ── Counts per Tab ────────────────────────────────────────────────
  const counts = useMemo(() => {
    return {
      Active: mockFarmerLots.filter((l) => l.status === 'Active').length,
      'In Negotiation': mockFarmerLots.filter((l) => l.status === 'In Negotiation').length,
      Sold: mockFarmerLots.filter((l) => l.status === 'Sold').length,
      Draft: mockFarmerLots.filter((l) => l.status === 'Draft').length,
      All: mockFarmerLots.length,
    };
  }, []);

  // ── Handle Card Click ─────────────────────────────────────────────
  const handleLotClick = (lot: FarmerLotItem) => {
    if (lot.status === 'Active') {
      if (onViewOffers) {
        onViewOffers(lot);
      } else if (onNavigateMarket) {
        onNavigateMarket();
      }
    } else if (lot.status === 'In Negotiation') {
      if (onViewNegotiation) {
        onViewNegotiation(lot);
      }
    } else if (lot.status === 'Sold') {
      if (onViewTransaction) {
        onViewTransaction(lot);
      }
    } else if (lot.status === 'Draft') {
      if (onContinueDraft) {
        onContinueDraft(lot);
      } else if (onCreateLot) {
        onCreateLot();
      }
    }
  };

  // ── Status Pill Render Helper ─────────────────────────────────────
  const renderStatusPill = (lot: FarmerLotItem) => {
    if (lot.status === 'Active') {
      if (lot.offersCount && lot.offersCount > 0) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{lot.offersCount} Offers Received</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active</span>
        </span>
      );
    }

    if (lot.status === 'In Negotiation') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          <span>In Negotiation</span>
        </span>
      );
    }

    if (lot.status === 'Sold') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          <span>Sold</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Edit3 className="w-3 h-3" />
        <span>Draft</span>
      </span>
    );
  };

  return (
    <DashboardLayout
      activeTab="my-lots"
      unreadAlertsCount={unreadAlertsCount}
      onTabChange={(tab) => {
        if (tab === 'home' && onNavigateHome) {
          onNavigateHome();
        } else if (tab === 'market' && onNavigateMarket) {
          onNavigateMarket();
        } else if (tab === 'alerts' && onNavigateAlerts) {
          onNavigateAlerts();
        } else if (tab === 'profile' && onNavigateProfile) {
          onNavigateProfile();
        }
      }}
      forceMobile={forceMobile}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        {/* ═══════════════════════════════════════════════════════════
            HEADER ROW
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-extrabold text-farmText-dark tracking-tight leading-tight">
              My Lots
            </h1>
            <p className="text-[13px] text-farmText-gray mt-0.5">
              Manage your crop listings and track their status
            </p>
          </div>

          {/* "+ Create New Lot" Primary Button */}
          <button
            type="button"
            onClick={onCreateLot}
            className="self-start sm:self-auto bg-primary hover:bg-primary-dark text-white font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Lot</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SUMMARY STAT ROW (3 CARDS, EQUAL WIDTH)
           ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Active Lots */}
          <div className="bg-white rounded-xl border border-farmBorder shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                Active Lots
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-primary">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                3
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                currently listed
              </p>
            </div>
          </div>

          {/* Card 2: Total Value Listed */}
          <div className="bg-white rounded-xl border border-farmBorder shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                Total Value Listed
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <IndianRupee className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                ₹1,45,000
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                across all lots
              </p>
            </div>
          </div>

          {/* Card 3: Completed Sales */}
          <div className="bg-white rounded-xl border border-farmBorder shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                Completed Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                7
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                this season
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB ROW BELOW STATS (PILL STYLE)
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {(['Active', 'In Negotiation', 'Sold', 'Draft', 'All'] as FilterTab[]).map((tab) => {
            const isActive = selectedTab === tab;
            const count = counts[tab as keyof typeof counts];

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`
                  px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <span>{tab}</span>
                <span
                  className={`
                    text-[11px] px-1.5 py-0.2 rounded-full font-extrabold
                    ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CONTENT — LIST OF LOT CARDS
           ═══════════════════════════════════════════════════════════ */}
        <div className="space-y-3.5">
          {filteredLots.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-farmBorder p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <PackageOpen className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="text-[16px] font-bold text-farmText-dark mb-1">
                No lots in this category yet
              </h3>
              <p className="text-[13px] text-farmText-gray max-w-sm mb-5">
                You don't have any crop listings in "{selectedTab}". Create a new lot to start receiving verified buyer offers.
              </p>
              <button
                type="button"
                onClick={onCreateLot}
                className="bg-primary hover:bg-primary-dark text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Lot</span>
              </button>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const isDraft = lot.status === 'Draft';
              const isSold = lot.status === 'Sold';
              const isInNegotiation = lot.status === 'In Negotiation';
              const isActive = lot.status === 'Active';

              return (
                <div
                  key={lot.id}
                  onClick={() => !isDraft && handleLotClick(lot)}
                  className={`
                    bg-white rounded-xl border border-farmBorder p-4 sm:p-5 shadow-2xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                    ${
                      !isDraft
                        ? 'hover:shadow-md hover:border-primary/40 cursor-pointer group'
                        : 'border-dashed border-slate-300 bg-slate-50/40'
                    }
                  `}
                >
                  {/* Left & Middle Container */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Left: Crop Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-[84px] sm:h-[84px] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={lot.imageUrl}
                        alt={`${lot.cropName} harvest lot - ${lot.grade}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Quality Grade Tag */}
                      <div className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {lot.cropName}
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="min-w-0 space-y-1">
                      {/* Crop Name & Grade */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-farmText-dark tracking-tight">
                          {lot.cropName} · {lot.grade}
                        </h3>
                      </div>

                      {/* Quantity & Location */}
                      <div className="flex items-center gap-3 text-[12px] text-slate-600 font-medium flex-wrap">
                        <span className="font-extrabold text-farmText-dark bg-slate-100 px-2 py-0.5 rounded">
                          {lot.quantity}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lot.location}</span>
                        </span>
                      </div>

                      {/* Date Text */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{lot.dateText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status + Pricing / CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Status Pill */}
                    <div>{renderStatusPill(lot)}</div>

                    {/* Subtext info based on status */}
                    {isActive && lot.bestOfferPrice && (
                      <div className="text-[12px] font-bold text-primary flex items-center gap-1">
                        <span>Best offer:</span>
                        <span className="text-[13px] font-extrabold">₹{lot.bestOfferPrice.toLocaleString('en-IN')}/quintal</span>
                      </div>
                    )}

                    {isInNegotiation && (
                      <div className="text-[11px] font-semibold text-amber-700">
                        {lot.negotiationBuyer ? `Negotiating with ${lot.negotiationBuyer}` : 'Active counter-offer'}
                      </div>
                    )}

                    {isSold && (
                      <div className="text-[11px] font-semibold text-slate-600">
                        Sold for ₹{lot.soldPrice?.toLocaleString('en-IN')}/q to {lot.soldTo}
                      </div>
                    )}

                    {/* Action Icon / Button */}
                    {isDraft ? (
                      <button
                        type="button"
                        onClick={() => handleLotClick(lot)}
                        className="bg-primary hover:bg-primary-dark text-white text-[12px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Continue Editing</span>
                      </button>
                    ) : (
                      <div className="hidden sm:flex items-center gap-1 text-[12px] font-bold text-slate-400 group-hover:text-primary transition-colors mt-1">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyLotsScreen;
