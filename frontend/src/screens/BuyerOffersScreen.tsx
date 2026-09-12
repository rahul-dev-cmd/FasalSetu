import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  ArrowRight,
  Search,
  ShieldCheck,
  MapPin,
  Calendar,
  X,
  Phone,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Info,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { BuyerLayout } from '../components/BuyerLayout';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn';

export interface OfferItem {
  id: string;
  lotId: string;
  cropName: string;
  variety: string;
  grade: string;
  image: string;
  farmerName: string;
  farmerRating: number;
  farmerLocation: string;
  farmerPhone: string;
  distanceKm: number;
  quantityNumber: number;
  quantityUnit: string;
  offerPrice: number;
  askingPrice: number;
  marketPrice: number;
  totalEscrowAmount: number;
  status: OfferStatus;
  offeredAt: string;
  expiresInSeconds: number; // For live countdown
  farmerNote?: string;
  buyerNote?: string;
  dealId?: string;
  qualitySpecs: {
    moisture: number;
    foreignMatter: number;
    packaging: string;
    harvestDate: string;
  };
}

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'OFF-101',
    lotId: 'LOT-7821',
    cropName: 'Rice',
    variety: 'BPT-5204 (Sona Masoori)',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Ramesh Patel',
    farmerRating: 4.9,
    farmerLocation: 'Kothapet, Telangana',
    farmerPhone: '+91 98490 23411',
    distanceKm: 12,
    quantityNumber: 50,
    quantityUnit: 'Quintals',
    offerPrice: 1900,
    askingPrice: 1980,
    marketPrice: 2050,
    totalEscrowAmount: 95000,
    status: 'pending',
    offeredAt: '2 hours ago',
    expiresInSeconds: 22 * 3600 + 48 * 60, // 22h 48m
    buyerNote: 'Looking for immediate dispatch post weighment confirmation.',
    qualitySpecs: {
      moisture: 11.8,
      foreignMatter: 0.8,
      packaging: 'Jute Bags (50kg)',
      harvestDate: 'Nov 2025',
    },
  },
  {
    id: 'OFF-102',
    lotId: 'LOT-7824',
    cropName: 'Cotton',
    variety: 'Bt Cotton Long Staple',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Venkat Reddy',
    farmerRating: 4.8,
    farmerLocation: 'Warangal, Telangana',
    farmerPhone: '+91 94401 56782',
    distanceKm: 68,
    quantityNumber: 35,
    quantityUnit: 'Quintals',
    offerPrice: 6150,
    askingPrice: 6200,
    marketPrice: 6350,
    totalEscrowAmount: 215250,
    status: 'accepted',
    offeredAt: 'Yesterday, 4:30 PM',
    expiresInSeconds: 0,
    dealId: 'DEAL-901',
    farmerNote: 'Offer accepted. Ready for dock dispatch on Friday.',
    qualitySpecs: {
      moisture: 8.5,
      foreignMatter: 1.2,
      packaging: 'Compressed Bales',
      harvestDate: 'Oct 2025',
    },
  },
  {
    id: 'OFF-103',
    lotId: 'LOT-6540',
    cropName: 'Maize',
    variety: 'Yellow Grain Hybrid',
    grade: 'Grade B (Standard)',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Suresh Rao',
    farmerRating: 4.7,
    farmerLocation: 'Nizamabad, Telangana',
    farmerPhone: '+91 97012 34567',
    distanceKm: 92,
    quantityNumber: 80,
    quantityUnit: 'Quintals',
    offerPrice: 1750,
    askingPrice: 1820,
    marketPrice: 1850,
    totalEscrowAmount: 140000,
    status: 'declined',
    offeredAt: '3 days ago',
    expiresInSeconds: 0,
    farmerNote: 'Farmer accepted a higher offer of ₹1,810/quintal from another trader.',
    qualitySpecs: {
      moisture: 12.5,
      foreignMatter: 1.5,
      packaging: 'Loose in Tarpaulin Truck',
      harvestDate: 'Nov 2025',
    },
  },
  {
    id: 'OFF-104',
    lotId: 'LOT-3320',
    cropName: 'Chilli',
    variety: 'Guntur Teja (Dry Red)',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Anji Reddy',
    farmerRating: 4.9,
    farmerLocation: 'Khammam, Telangana',
    farmerPhone: '+91 91234 56789',
    distanceKm: 115,
    quantityNumber: 25,
    quantityUnit: 'Quintals',
    offerPrice: 8200,
    askingPrice: 8400,
    marketPrice: 8600,
    totalEscrowAmount: 205000,
    status: 'accepted',
    offeredAt: '1 day ago',
    expiresInSeconds: 0,
    dealId: 'DEAL-902',
    farmerNote: 'Accepted. Moisture report attached in deal contract.',
    qualitySpecs: {
      moisture: 9.2,
      foreignMatter: 0.5,
      packaging: 'Gunny Bags',
      harvestDate: 'Dec 2025',
    },
  },
  {
    id: 'OFF-105',
    lotId: 'LOT-4419',
    cropName: 'Wheat',
    variety: 'Sharbati Golden Grain',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Kishan Lal',
    farmerRating: 4.8,
    farmerLocation: 'Adilabad, Telangana',
    farmerPhone: '+91 93456 78901',
    distanceKm: 145,
    quantityNumber: 60,
    quantityUnit: 'Quintals',
    offerPrice: 2050,
    askingPrice: 2100,
    marketPrice: 2150,
    totalEscrowAmount: 123000,
    status: 'expired',
    offeredAt: '4 days ago',
    expiresInSeconds: 0,
    farmerNote: 'No response within 24h window. Escrow allocation automatically released.',
    qualitySpecs: {
      moisture: 10.4,
      foreignMatter: 0.9,
      packaging: 'Bags (50kg)',
      harvestDate: 'Nov 2025',
    },
  },
  {
    id: 'OFF-106',
    lotId: 'LOT-9014',
    cropName: 'Groundnut',
    variety: 'Kadir 6 (Bold Kernels)',
    grade: 'Grade B (Standard)',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Mallesh Goud',
    farmerRating: 4.7,
    farmerLocation: 'Mahbubnagar, Telangana',
    farmerPhone: '+91 96543 21098',
    distanceKm: 55,
    quantityNumber: 40,
    quantityUnit: 'Quintals',
    offerPrice: 5400,
    askingPrice: 5550,
    marketPrice: 5650,
    totalEscrowAmount: 216000,
    status: 'pending',
    offeredAt: '16 hours ago',
    expiresInSeconds: 8 * 3600 + 12 * 60, // 8h 12m
    buyerNote: 'Require delivery to Jadcherla storage facility.',
    qualitySpecs: {
      moisture: 7.8,
      foreignMatter: 1.1,
      packaging: 'Double Gunny Bags',
      harvestDate: 'Nov 2025',
    },
  },
  {
    id: 'OFF-107',
    lotId: 'LOT-5128',
    cropName: 'Sugarcane',
    variety: 'Co 86032 High Brix',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Balram Yadav',
    farmerRating: 4.9,
    farmerLocation: 'Medak, Telangana',
    farmerPhone: '+91 98765 43210',
    distanceKm: 42,
    quantityNumber: 120,
    quantityUnit: 'Quintals',
    offerPrice: 340,
    askingPrice: 350,
    marketPrice: 355,
    totalEscrowAmount: 40800,
    status: 'accepted',
    offeredAt: '2 days ago',
    expiresInSeconds: 0,
    dealId: 'DEAL-903',
    farmerNote: 'Accepted for delivery to Sangareddy Sugar Mill crushing dock.',
    qualitySpecs: {
      moisture: 68.0,
      foreignMatter: 0.2,
      packaging: 'Tractor Trolley Bundle',
      harvestDate: 'Dec 2025',
    },
  },
  {
    id: 'OFF-108',
    lotId: 'LOT-7033',
    cropName: 'Soybean',
    variety: 'JS-335 Yellow',
    grade: 'Grade B (Standard)',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Narsimha Rao',
    farmerRating: 4.8,
    farmerLocation: 'Karimnagar, Telangana',
    farmerPhone: '+91 94901 23456',
    distanceKm: 78,
    quantityNumber: 45,
    quantityUnit: 'Quintals',
    offerPrice: 4400,
    askingPrice: 4500,
    marketPrice: 4620,
    totalEscrowAmount: 198000,
    status: 'accepted',
    offeredAt: '3 days ago',
    expiresInSeconds: 0,
    dealId: 'DEAL-904',
    farmerNote: 'Accepted. Moisture tested at 9.8%. Ready for pickup.',
    qualitySpecs: {
      moisture: 9.8,
      foreignMatter: 1.0,
      packaging: '50kg HDPE Woven Sacks',
      harvestDate: 'Oct 2025',
    },
  },
  {
    id: 'OFF-109',
    lotId: 'LOT-8812',
    cropName: 'Turmeric',
    variety: 'Salem High Curcumin',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Ganga Prasad',
    farmerRating: 4.9,
    farmerLocation: 'Nizamabad, Telangana',
    farmerPhone: '+91 98112 34990',
    distanceKm: 130,
    quantityNumber: 30,
    quantityUnit: 'Quintals',
    offerPrice: 12800,
    askingPrice: 13200,
    marketPrice: 13500,
    totalEscrowAmount: 384000,
    status: 'pending',
    offeredAt: '5 hours ago',
    expiresInSeconds: 19 * 3600 + 40 * 60, // 19h 40m
    buyerNote: 'Lab test certificate for curcumin > 4.5% needed prior to dispatch.',
    qualitySpecs: {
      moisture: 9.0,
      foreignMatter: 0.4,
      packaging: 'Polylined Sacks',
      harvestDate: 'Jan 2026',
    },
  },
  {
    id: 'OFF-110',
    lotId: 'LOT-6290',
    cropName: 'Red Gram (Toor Dal)',
    variety: 'Asha (ICPL 87119)',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    farmerName: 'K. Chandrasekhar',
    farmerRating: 4.8,
    farmerLocation: 'Tandur, Telangana',
    farmerPhone: '+91 93901 88765',
    distanceKm: 85,
    quantityNumber: 50,
    quantityUnit: 'Quintals',
    offerPrice: 8900,
    askingPrice: 9100,
    marketPrice: 9250,
    totalEscrowAmount: 445000,
    status: 'accepted',
    offeredAt: '4 days ago',
    expiresInSeconds: 0,
    dealId: 'DEAL-905',
    farmerNote: 'Deal finalized. Tandur GI-tag certified batch.',
    qualitySpecs: {
      moisture: 10.1,
      foreignMatter: 0.6,
      packaging: 'Jute Bags',
      harvestDate: 'Dec 2025',
    },
  },
  {
    id: 'OFF-111',
    lotId: 'LOT-9104',
    cropName: 'Rice',
    variety: 'Telangana Sona (RNR 15048)',
    grade: 'Grade A (Premium)',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Srinivas Goud',
    farmerRating: 4.9,
    farmerLocation: 'Siddipet, Telangana',
    farmerPhone: '+91 98480 12345',
    distanceKm: 52,
    quantityNumber: 75,
    quantityUnit: 'Quintals',
    offerPrice: 2200,
    askingPrice: 2250,
    marketPrice: 2320,
    totalEscrowAmount: 165000,
    status: 'accepted',
    offeredAt: '5 days ago',
    expiresInSeconds: 0,
    dealId: 'DEAL-906',
    farmerNote: 'Accepted for direct delivery to Hyderabad depot.',
    qualitySpecs: {
      moisture: 11.2,
      foreignMatter: 0.5,
      packaging: '25kg Printed Bags',
      harvestDate: 'Nov 2025',
    },
  },
  {
    id: 'OFF-112',
    lotId: 'LOT-4105',
    cropName: 'Cotton',
    variety: 'Bt Hybrid Medium',
    grade: 'Grade B (Standard)',
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=600&q=80',
    farmerName: 'Ravi Teja',
    farmerRating: 4.6,
    farmerLocation: 'Nalgonda, Telangana',
    farmerPhone: '+91 97000 11223',
    distanceKm: 80,
    quantityNumber: 40,
    quantityUnit: 'Quintals',
    offerPrice: 5800,
    askingPrice: 6100,
    marketPrice: 6200,
    totalEscrowAmount: 232000,
    status: 'declined',
    offeredAt: '6 days ago',
    expiresInSeconds: 0,
    farmerNote: 'Counter-offer was not reached; lot was sold at local APMC mandi.',
    qualitySpecs: {
      moisture: 9.4,
      foreignMatter: 2.1,
      packaging: 'Standard Bales',
      harvestDate: 'Oct 2025',
    },
  },
];

export const BuyerOffersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferItem | null>(null);
  const [offerToWithdraw, setOfferToWithdraw] = useState<OfferItem | null>(null);
  const [withdrawReason, setWithdrawReason] = useState<string>('Found another lot with better price');
  const [customWithdrawReason, setCustomWithdrawReason] = useState<string>('');

  // Toast state
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Live countdown ticker for pending offers
  useEffect(() => {
    const interval = setInterval(() => {
      setOffers((prev) =>
        prev.map((offer) => {
          if (offer.status === 'pending' && offer.expiresInSeconds > 0) {
            const nextTime = offer.expiresInSeconds - 1;
            if (nextTime <= 0) {
              return {
                ...offer,
                expiresInSeconds: 0,
                status: 'expired',
                farmerNote: 'No response within 24h window. Offer expired.',
              };
            }
            return { ...offer, expiresInSeconds: nextTime };
          }
          return offer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format seconds into "21h 48m 12s" or "21h 48m"
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Expired';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = offers.length;
    const pending = offers.filter((o) => o.status === 'pending').length;
    const accepted = offers.filter((o) => o.status === 'accepted').length;
    const declinedOrExpired = offers.filter((o) => o.status === 'declined' || o.status === 'expired').length;
    const declined = offers.filter((o) => o.status === 'declined').length;
    const expired = offers.filter((o) => o.status === 'expired').length;
    return { total, pending, accepted, declinedOrExpired, declined, expired };
  }, [offers]);

  // Filtered offers according to tab and optional search query
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Tab filter
      if (activeFilterTab === 'pending' && offer.status !== 'pending') return false;
      if (activeFilterTab === 'accepted' && offer.status !== 'accepted') return false;
      if (activeFilterTab === 'declined' && offer.status !== 'declined') return false;
      if (activeFilterTab === 'expired' && offer.status !== 'expired') return false;

      // Optional text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCrop = offer.cropName.toLowerCase().includes(q);
        const matchesLot = offer.lotId.toLowerCase().includes(q);
        const matchesFarmer = offer.farmerName.toLowerCase().includes(q);
        const matchesLocation = offer.farmerLocation.toLowerCase().includes(q);
        if (!matchesCrop && !matchesLot && !matchesFarmer && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }, [offers, activeFilterTab, searchQuery]);

  // Handle Withdraw Confirmation
  const handleConfirmWithdraw = () => {
    if (!offerToWithdraw) return;

    const targetId = offerToWithdraw.id;
    const finalReason = withdrawReason === 'Other' && customWithdrawReason.trim()
      ? customWithdrawReason.trim()
      : withdrawReason;

    setOffers((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            status: 'declined',
            farmerNote: `Offer withdrawn by buyer: "${finalReason}"`,
            expiresInSeconds: 0,
          };
        }
        return item;
      })
    );

    setToastMessage({
      title: 'Offer Withdrawn',
      description: `Your offer of ₹${offerToWithdraw.offerPrice.toLocaleString('en-IN')}/q for ${offerToWithdraw.lotId} has been cancelled. Escrow commitment released.`,
      type: 'info',
    });

    setOfferToWithdraw(null);
    setCustomWithdrawReason('');
    if (selectedOfferForDetail && selectedOfferForDetail.id === targetId) {
      setSelectedOfferForDetail(null);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Declined
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            Expired
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Withdrawn
          </span>
        );
    }
  };

  return (
    <BuyerLayout activeTab="offers">
      <div className="space-y-6 pb-12">
        {/* ========================================================
            HEADER ROW
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Offers
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Track offers you've made to farmers and their status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/buyer/browse')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
              <span>Browse Lots</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            SUMMARY STAT ROW (4 Cards, Equal Width)
           ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Total Offers Made */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Offers Made
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center">
                <ClipboardList className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {stats.total}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                this month
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Active buyer bidding pipeline
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="bg-white rounded-xl border border-amber-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Pending
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-600">
                {stats.pending}
              </span>
              <span className="text-xs font-semibold text-amber-700/80">
                awaiting farmer response
              </span>
            </div>
            <div className="mt-2 text-xs text-amber-800/80">
              24-hour decision window active
            </div>
          </div>

          {/* Card 3: Accepted */}
          <div className="bg-white rounded-xl border border-teal-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Accepted
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-[#0D9488]">
                {stats.accepted}
              </span>
              <span className="text-xs font-semibold text-teal-700">
                moved to Active Deals
              </span>
            </div>
            <div className="mt-2 text-xs text-teal-800/80 flex items-center gap-1">
              <span className="underline cursor-pointer font-medium" onClick={() => navigate('/buyer/deals')}>
                Track consignment fulfillment
              </span>
            </div>
          </div>

          {/* Card 4: Declined / Expired */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Declined/Expired
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-700">
                {stats.declinedOrExpired}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                not accepted
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Escrow commitment auto-released
            </div>
          </div>
        </div>

        {/* ========================================================
            TAB ROW & SEARCH BAR
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Pill-style Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTab === 'all'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeFilterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTab === 'pending'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeFilterTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {stats.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('accepted')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTab === 'accepted'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Accepted</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeFilterTab === 'accepted' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
              }`}>
                {stats.accepted}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('declined')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTab === 'declined'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Declined</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeFilterTab === 'declined' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
              }`}>
                {stats.declined}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('expired')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTab === 'expired'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Expired</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeFilterTab === 'expired' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {stats.expired}
              </span>
            </button>
          </div>

          {/* Quick filter search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, lot, farmer..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            MAIN CONTENT — LIST OF OFFER CARDS (Full Width Stacked)
           ======================================================== */}
        <div className="space-y-4">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => {
              const isPending = offer.status === 'pending';
              const isAccepted = offer.status === 'accepted';
              const isDeclined = offer.status === 'declined';
              const isExpired = offer.status === 'expired';
              const isPriceDiscounted = offer.offerPrice < offer.askingPrice;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 group"
                >
                  {/* Left + Middle Cluster */}
                  <div className="flex items-start gap-4 md:gap-5 flex-1 min-w-0">
                    {/* Crop Thumbnail */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                      <img
                        src={offer.image}
                        alt={offer.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1">
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {offer.lotId}
                        </span>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: Lot ID + Crop Name + Grade */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">
                          {offer.lotId} · {offer.cropName} · <span className="text-slate-600 font-semibold">{offer.grade}</span>
                        </h3>
                      </div>

                      {/* Farmer and Location */}
                      <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs md:text-sm text-slate-600">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          {offer.farmerName}
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {offer.farmerLocation} ({offer.distanceKm} km)
                        </span>
                      </div>

                      {/* Quantity & Pricing details */}
                      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {offer.quantityNumber} {offer.quantityUnit}
                        </span>

                        <div className="flex items-baseline gap-2">
                          <span className="text-sm md:text-base font-bold text-[#0D9488]">
                            Your offer: ₹{offer.offerPrice.toLocaleString('en-IN')}/quintal
                          </span>

                          {isPriceDiscounted ? (
                            <span className="text-xs text-slate-400 line-through">
                              Asking: ₹{offer.askingPrice.toLocaleString('en-IN')}/q
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Asking: ₹{offer.askingPrice.toLocaleString('en-IN')}/q
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sub row: Timestamp / Countdown & Escrow value */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          Total Value: <span className="font-bold text-slate-900">₹{offer.totalEscrowAmount.toLocaleString('en-IN')}</span> (Escrow protected)
                        </span>
                        <span className="text-slate-300">•</span>

                        {isPending ? (
                          <span className="font-semibold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Expires in {formatCountdown(offer.expiresInSeconds)}
                          </span>
                        ) : (
                          <span>{offer.offeredAt}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status Pill, Contextual Links & Action Buttons */}
                  <div className="flex lg:flex-col items-end lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(offer.status)}
                    </div>

                    {/* Contextual Messages & Action */}
                    {isAccepted && (
                      <button
                        onClick={() => navigate('/buyer/deals')}
                        className="text-xs md:text-sm font-bold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1 group/link cursor-pointer hover:underline"
                      >
                        <span>Moved to Active Deals</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                      </button>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-amber-700 font-medium">
                          ⏳ {formatCountdown(offer.expiresInSeconds)} left
                        </span>
                        <button
                          type="button"
                          onClick={() => setOfferToWithdraw(offer)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors cursor-pointer"
                        >
                          Withdraw Offer
                        </button>
                      </div>
                    )}

                    {isDeclined && offer.farmerNote && (
                      <p className="text-xs text-red-600/90 max-w-xs text-right font-medium">
                        {offer.farmerNote}
                      </p>
                    )}

                    {isExpired && (
                      <p className="text-xs text-slate-500 max-w-xs text-right">
                        {offer.farmerNote || 'No response within 24h window'}
                      </p>
                    )}

                    {/* Inspection Trigger */}
                    <button
                      type="button"
                      onClick={() => setSelectedOfferForDetail(offer)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mt-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            /* ========================================================
               EMPTY STATE
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                <ClipboardList className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No offers here yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                {searchQuery
                  ? `No offers matched "${searchQuery}". Try searching for another crop or clear your filter.`
                  : activeFilterTab === 'all'
                  ? "You haven't submitted any offers to farmers yet. Discover quality harvest lots across Telangana."
                  : `You currently have no ${activeFilterTab} offers in this tab.`}
              </p>
              <div className="flex items-center justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => navigate('/buyer/browse')}
                  className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Browse Lots
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          WITHDRAW OFFER CONFIRMATION MODAL
         ======================================================== */}
      {offerToWithdraw && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">
                  Withdraw Offer?
                </h3>
              </div>
              <button
                onClick={() => setOfferToWithdraw(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to withdraw your offer for{' '}
                <span className="font-bold text-slate-900">
                  {offerToWithdraw.lotId} ({offerToWithdraw.cropName} · {offerToWithdraw.grade})
                </span>
                ?
              </p>

              {/* Offer recap card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer:</span>
                  <span className="font-semibold text-slate-800">{offerToWithdraw.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-semibold text-slate-800">
                    {offerToWithdraw.quantityNumber} {offerToWithdraw.quantityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Offer Price:</span>
                  <span className="font-bold text-[#0D9488]">
                    ₹{offerToWithdraw.offerPrice.toLocaleString('en-IN')}/quintal
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                  <span className="text-slate-700">Escrow Commitment to Release:</span>
                  <span className="text-slate-900 font-bold">
                    ₹{offerToWithdraw.totalEscrowAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reason for withdrawal (Optional):
                </label>
                <select
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                >
                  <option value="Found another lot with better price">Found another lot with better price</option>
                  <option value="Procured required quantity elsewhere">Procured required quantity elsewhere</option>
                  <option value="Market price shifted down">Market price shifted down</option>
                  <option value="Farmer did not respond in time">Farmer did not respond in time</option>
                  <option value="Other">Other</option>
                </select>

                {withdrawReason === 'Other' && (
                  <input
                    type="text"
                    value={customWithdrawReason}
                    onChange={(e) => setCustomWithdrawReason(e.target.value)}
                    placeholder="Specify reason..."
                    className="w-full mt-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The locked escrow funds (₹{offerToWithdraw.totalEscrowAmount.toLocaleString('en-IN')}) will immediately return to your unallocated buyer wallet.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOfferToWithdraw(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Keep Offer
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Withdraw Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          OFFER DETAIL SLIDE-OVER / INSPECTION MODAL
         ======================================================== */}
      {selectedOfferForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-lg">
                  Offer Details · {selectedOfferForDetail.lotId}
                </span>
                {renderStatusBadge(selectedOfferForDetail.status)}
              </div>
              <button
                onClick={() => setSelectedOfferForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Crop Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <img
                  src={selectedOfferForDetail.image}
                  alt={selectedOfferForDetail.cropName}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-lg font-bold text-slate-900">
                    {selectedOfferForDetail.cropName} ({selectedOfferForDetail.variety})
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {selectedOfferForDetail.grade} · Harvest: {selectedOfferForDetail.qualitySpecs.harvestDate}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700">
                      Moisture: {selectedOfferForDetail.qualitySpecs.moisture}%
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700">
                      Foreign Matter: {selectedOfferForDetail.qualitySpecs.foreignMatter}%
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700">
                      Pkg: {selectedOfferForDetail.qualitySpecs.packaging}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & Escrow Breakdown */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Financials & Escrow Allocation
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Quantity</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {selectedOfferForDetail.quantityNumber} {selectedOfferForDetail.quantityUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Your Bid</span>
                    <span className="text-sm font-bold text-[#0D9488] mt-0.5 block">
                      ₹{selectedOfferForDetail.offerPrice.toLocaleString('en-IN')}/q
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Farmer Asking</span>
                    <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                      ₹{selectedOfferForDetail.askingPrice.toLocaleString('en-IN')}/q
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Escrow</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                      ₹{selectedOfferForDetail.totalEscrowAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Timeline */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Offer Timeline & Milestones
                </h5>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2 text-xs">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0D9488] ring-4 ring-teal-50 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Offer Placed by Buyer</span>
                      <span className="text-slate-400 ml-2">({selectedOfferForDetail.offeredAt})</span>
                      <p className="text-slate-600 mt-0.5">
                        Bid of ₹{selectedOfferForDetail.offerPrice}/q for {selectedOfferForDetail.quantityNumber} quintals placed into smart escrow.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedOfferForDetail.status === 'pending'
                        ? 'bg-amber-500 ring-4 ring-amber-50'
                        : 'bg-[#0D9488] ring-4 ring-teal-50'
                    }`}>
                      {selectedOfferForDetail.status === 'pending' ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      ) : (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Farmer Notification</span>
                      <p className="text-slate-600 mt-0.5">
                        SMS & WhatsApp alert delivered to farmer {selectedOfferForDetail.farmerName}.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Current Status */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      selectedOfferForDetail.status === 'accepted'
                        ? 'bg-emerald-600 ring-4 ring-emerald-50'
                        : selectedOfferForDetail.status === 'declined'
                        ? 'bg-red-600 ring-4 ring-red-50'
                        : selectedOfferForDetail.status === 'expired'
                        ? 'bg-slate-400 ring-4 ring-slate-100'
                        : 'bg-slate-200'
                    }`}>
                      {selectedOfferForDetail.status === 'accepted' ? (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      ) : selectedOfferForDetail.status === 'declined' ? (
                        <X className="w-2.5 h-2.5 text-white stroke-[3]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">
                        {selectedOfferForDetail.status === 'accepted'
                          ? 'Offer Accepted by Farmer'
                          : selectedOfferForDetail.status === 'declined'
                          ? 'Offer Declined'
                          : selectedOfferForDetail.status === 'expired'
                          ? 'Offer Window Expired'
                          : 'Awaiting Farmer Decision'}
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        {selectedOfferForDetail.farmerNote ||
                          (selectedOfferForDetail.status === 'pending'
                            ? `Farmer has ${formatCountdown(selectedOfferForDetail.expiresInSeconds)} remaining to accept or counter.`
                            : 'Escrow release updated.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Contact Card */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Farmer Details
                </h5>
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <span>{selectedOfferForDetail.farmerName}</span>
                      <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                      <span className="text-xs text-amber-600 font-semibold ml-1">
                        ⭐ {selectedOfferForDetail.farmerRating}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOfferForDetail.farmerLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedOfferForDetail.farmerPhone}`}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Call Farmer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        alert(`Opening verified WhatsApp chat with farmer ${selectedOfferForDetail.farmerName}...`)
                      }
                      className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-[#0D9488] hover:bg-teal-100 transition-colors"
                      title="WhatsApp Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOfferForDetail(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs md:text-sm font-semibold rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedOfferForDetail.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedOfferForDetail;
                      setSelectedOfferForDetail(null);
                      setOfferToWithdraw(item);
                    }}
                    className="px-4 py-2 text-xs md:text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Withdraw Offer
                  </button>
                )}

                {selectedOfferForDetail.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfferForDetail(null);
                      navigate('/buyer/deals');
                    }}
                    className="px-5 py-2 text-xs md:text-sm font-bold bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Go to Active Deals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {(selectedOfferForDetail.status === 'declined' || selectedOfferForDetail.status === 'expired') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfferForDetail(null);
                      navigate('/buyer/browse');
                    }}
                    className="px-5 py-2 text-xs md:text-sm font-bold bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Browse Other Lots
                  </button>
                )}
              </div>
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

export default BuyerOffersScreen;
