import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Star,
  FileText,
  BadgePercent,
  Search,
  Check,
  X,
  Plus,
  Handshake
} from 'lucide-react';
import BuyerLayout from '../components/BuyerLayout';
import groundnutImg from '../assets/groundnut.jpg';

// Mock recommended lots data
interface RecommendedLot {
  id: string;
  cropName: string;
  variety: string;
  grade: string;
  quantity: string;
  quantityNumber: number;
  farmerName: string;
  farmerRating: number;
  location: string;
  distance: string;
  askingPrice: number;
  marketPrice: number;
  image: string;
  verified: boolean;
}

const RECOMMENDED_LOTS: RecommendedLot[] = [
  {
    id: 'LOT-7821',
    cropName: 'Rice',
    variety: 'BPT-5204 (Sona Masoori)',
    grade: 'Grade A (Premium)',
    quantity: '50 Quintals',
    quantityNumber: 50,
    farmerName: 'Ramesh Ji',
    farmerRating: 4.9,
    location: 'Kothapet, Telangana',
    distance: '12 km',
    askingPrice: 1980,
    marketPrice: 2050,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 'LOT-7824',
    cropName: 'Cotton',
    variety: 'Bt Cotton Long Staple',
    grade: 'Grade A (31mm length)',
    quantity: '85 Quintals',
    quantityNumber: 85,
    farmerName: 'Suresh Reddy',
    farmerRating: 4.8,
    location: 'Warangal, Telangana',
    distance: '68 km',
    askingPrice: 6200,
    marketPrice: 6350,
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 'LOT-7829',
    cropName: 'Maize',
    variety: 'Yellow Grain Hybrid',
    grade: 'Grade A (Feed & Milling)',
    quantity: '120 Quintals',
    quantityNumber: 120,
    farmerName: 'Venkatesh Rao',
    farmerRating: 4.7,
    location: 'Nizamabad, Telangana',
    distance: '92 km',
    askingPrice: 2050,
    marketPrice: 2120,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    verified: true,
  },
  {
    id: 'LOT-7835',
    cropName: 'Groundnut',
    variety: 'Kadir 6 (Bold Kernels)',
    grade: 'Grade A (Oil 48%)',
    quantity: '40 Quintals',
    quantityNumber: 40,
    farmerName: 'Balaji Agro Farms',
    farmerRating: 5.0,
    location: 'Karimnagar, Telangana',
    distance: '104 km',
    askingPrice: 5800,
    marketPrice: 5950,
    image: groundnutImg,
    verified: true,
  },
];

// Market price trends data
const MANDI_PRICE_TRENDS = [
  {
    crop: 'Rice (Paddy Sona Masoori)',
    mandi: 'Suryapet APMC',
    price: '₹1,950 / quintal',
    trendText: '↑ 2.3%',
    trendDirection: 'up',
    volume: '1,420 bags today',
  },
  {
    crop: 'Cotton (Bt Long Staple)',
    mandi: 'Warangal Mandi',
    price: '₹6,200 / quintal',
    trendText: '↓ 1.1%',
    trendDirection: 'down',
    volume: '850 quintals today',
  },
  {
    crop: 'Wheat (Sharbati Grade)',
    mandi: 'Nizamabad APMC',
    price: '₹2,100 / quintal',
    trendText: '→ stable',
    trendDirection: 'stable',
    volume: '620 bags today',
  },
  {
    crop: 'Maize (Yellow Hybrid)',
    mandi: 'Karimnagar Mandi',
    price: '₹2,050 / quintal',
    trendText: '↑ 1.8%',
    trendDirection: 'up',
    volume: '2,100 quintals today',
  },
];

// Recent activity feed
const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    icon: '🤝',
    bgColor: 'bg-teal-50 text-[#0D9488] border-teal-200',
    title: 'Your offer on Rice lot (50 Qtl) was accepted',
    detail: 'Farmer Ramesh Ji accepted your counter of ₹1,980/qtl. Electronic weighment scheduled.',
    timestamp: '12m ago',
    route: '/buyer/deals',
  },
  {
    id: 'act-2',
    icon: '🌾',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'New lot matched your preferences: Cotton, 20 quintals',
    detail: 'Fresh harvest lot from Warangal district with Grade A certified quality report.',
    timestamp: '1h ago',
    route: '/buyer/browse',
  },
  {
    id: 'act-3',
    icon: '💳',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Payment of ₹92,500 processed to Shree Balaji Agro Foods',
    detail: 'Automated bank payout released following warehouse delivery receipt #REC-819.',
    timestamp: '3h ago',
    route: '/buyer/deals',
  },
  {
    id: 'act-4',
    icon: '🛡️',
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Quality inspection certified for Nizamabad Maize lot',
    detail: 'AI and physical lab grading confirmed Grade A purity with 12.2% moisture content.',
    timestamp: 'Yesterday',
    route: '/buyer/browse',
  },
];

export const BuyerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active subview from URL path
  const currentPath = location.pathname;
  const isBrowseView = currentPath.includes('/buyer/browse');
  const isOffersView = currentPath.includes('/buyer/offers');
  const isDealsView = currentPath.includes('/buyer/deals');
  const isInsightsView = currentPath.includes('/buyer/insights');
  const isAlertsView = currentPath.includes('/buyer/alerts');
  const isProfileView = currentPath.includes('/buyer/profile');

  // Modal State for "Make Offer"
  const [selectedLotForOffer, setSelectedLotForOffer] = useState<RecommendedLot | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQuantity, setOfferQuantity] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenOfferModal = (lot: RecommendedLot) => {
    setSelectedLotForOffer(lot);
    setOfferPrice(lot.askingPrice);
    setOfferQuantity(lot.quantityNumber);
  };

  const handleSubmitOffer = () => {
    if (!selectedLotForOffer) return;
    showToast(`Counter offer of ₹${offerPrice}/qtl for ${selectedLotForOffer.cropName} submitted to ${selectedLotForOffer.farmerName} ✓`);
    setSelectedLotForOffer(null);
  };

  return (
    <BuyerLayout
      activeTab={
        isBrowseView
          ? 'browse'
          : isOffersView
          ? 'offers'
          : isDealsView
          ? 'deals'
          : isInsightsView
          ? 'insights'
          : isAlertsView
          ? 'alerts'
          : isProfileView
          ? 'profile'
          : 'home'
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-teal-500">
            <CheckCircle2 className="w-4 h-4 text-[#0D9488] stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================
          1. SUMMARY STAT CARDS ROW (4 cards, equal width, white bg, rounded-xl, border)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Sourcing Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            8
          </div>
          <p className="text-xs text-slate-500 mt-1">
            lots you're tracking in real-time
          </p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Offers
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            3
          </div>
          <p className="text-xs text-slate-500 mt-1">
            awaiting farmer response within 24h
          </p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deals in Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            4
          </div>
          <p className="text-xs text-slate-500 mt-1">
            being negotiated / fulfilled
          </p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Procured This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            ₹18,45,000
          </div>
          <p className="text-xs text-slate-500 mt-1">
            across 14 transactions settled
          </p>
        </div>
      </div>

      {/* ========================================================
          2. RECOMMENDED LOTS FOR YOU (Full-width white card, rounded-xl, border)
         ======================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Recommended Lots for You
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified harvest batches matching your procurement preferences in Telangana
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/buyer/browse')}
            className="text-xs sm:text-sm font-bold text-[#0D9488] hover:text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal scrollable row / grid of lot cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECOMMENDED_LOTS.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Crop Thumbnail Image */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={lot.image}
                    alt={`${lot.cropName} lot - ${lot.variety}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {lot.id}
                  </div>
                  {lot.verified && (
                    <div className="absolute top-2.5 right-2.5 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                      {lot.cropName} · <span className="text-xs text-slate-600 font-semibold">{lot.grade}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{lot.variety}</p>
                  </div>

                  {/* Quantity & Distance Badges */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Quantity</span>
                      <span className="font-bold text-slate-800">{lot.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Distance</span>
                      <span className="font-semibold text-slate-700">{lot.distance}</span>
                    </div>
                  </div>

                  {/* Farmer Info */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 truncate text-slate-700 font-semibold">
                      <span className="truncate">{lot.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-600 font-bold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{lot.farmerRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                    <span className="truncate">{lot.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price + Make Offer button */}
              <div className="p-3.5 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Asking Price</div>
                  <div className="text-sm font-extrabold text-slate-900">₹{lot.askingPrice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">per quintal</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenOfferModal(lot)}
                  className="px-3.5 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 hover:scale-102"
                >
                  <span>Make Offer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          TWO COLUMN SECTION: MARKET PRICE TRENDS & RECENT ACTIVITY
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Price Trends Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Today's Mandi Prices — Telangana
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official APMC daily benchmark wholesale arrivals
              </p>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200">
              Live Mandi Data
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {MANDI_PRICE_TRENDS.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{item.crop}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{item.mandi}</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.volume}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">{item.price}</div>
                  <div
                    className={`text-[11px] font-bold mt-0.5 flex items-center justify-end gap-0.5 ${
                      item.trendDirection === 'up'
                        ? 'text-emerald-600'
                        : item.trendDirection === 'down'
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    <span>{item.trendText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Simulated mandi data for demo purposes</span>
            <button
              type="button"
              onClick={() => navigate('/buyer/insights')}
              className="text-[#0D9488] font-bold hover:underline cursor-pointer"
            >
              View Full Insights
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest updates on your bids, deal contracts, and settlements
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buyer/deals')}
              className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
            >
              All Deals
            </button>
          </div>

          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                onClick={() => navigate(act.route)}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-200 transition-all cursor-pointer flex items-start gap-3 select-none"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${act.bgColor}`}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {act.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">
              Escrow Protection Protocol active on all transactions
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAKE OFFER MODAL
         ======================================================== */}
      {selectedLotForOffer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={selectedLotForOffer.image}
                  alt={selectedLotForOffer.cropName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Make Offer — {selectedLotForOffer.cropName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLotForOffer.farmerName} • {selectedLotForOffer.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLotForOffer(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">FARMER ASKING PRICE</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{selectedLotForOffer.askingPrice.toLocaleString()} / qtl</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">TOTAL LOT QUANTITY</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedLotForOffer.quantity}</span>
                </div>
              </div>

              {/* Offer Price Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Offer Price (₹ / Quintal) *
                </label>
                <input
                  type="number"
                  min="500"
                  step="10"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity to Procure (Quintals) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedLotForOffer.quantityNumber}
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Max available: {selectedLotForOffer.quantityNumber} quintals
                </span>
              </div>

              {/* Payout Calculation */}
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 block">Total Escrow Commitment</span>
                  <span className="text-[11px] text-teal-700">Secured until weighing and verification</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-teal-900">
                    ₹{(offerPrice * offerQuantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Protected by ICICI Bank Agricultural Escrow with automated UPI/NEFT release.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLotForOffer(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitOffer}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs"
              >
                Submit Counter Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
};

export default BuyerDashboardScreen;
