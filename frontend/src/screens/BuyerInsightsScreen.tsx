import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Building2,
  Sparkles,
  Bell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  X,
  SlidersHorizontal,
  Layers,
  BarChart3,
  Flame,
  Info,
} from 'lucide-react';
import { BuyerLayout } from '../components/BuyerLayout';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

export interface MandiPriceItem {
  id: string;
  cropName: string;
  variety: string;
  mandiName: string;
  district: string;
  volumeToday: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CropTrendData {
  cropName: string;
  unit: string;
  currentPrice: number;
  weekChange: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: { day: string; date: string; price: number }[];
}

export interface ActivityFeedItem {
  id: string;
  type: 'offer_accepted' | 'lot_matched' | 'price_alert' | 'payment_released' | 'supplier_joined' | 'quality_certified';
  title: string;
  description: string;
  timestamp: string;
  targetRoute?: string;
}

export interface DemandForecastItem {
  cropName: string;
  demandLevel: 'High Demand' | 'Medium Demand' | 'Low Demand';
  reasoning: string;
  projectedPriceChange: string;
  demandScore: number; // 0 - 100
  keyDriver: string;
  seasonalityBadge: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const MANDI_PRICES: MandiPriceItem[] = [
  {
    id: 'MP-1',
    cropName: 'Rice',
    variety: 'Paddy Sona Masoori (BPT 5204)',
    mandiName: 'Suryapet APMC',
    district: 'Suryapet',
    volumeToday: '1,420 bags',
    modalPrice: 1950,
    minPrice: 1880,
    maxPrice: 2020,
    changePercent: 2.4,
    trend: 'up',
  },
  {
    id: 'MP-2',
    cropName: 'Cotton',
    variety: 'Bt Long Staple (Bunny/Brahma)',
    mandiName: 'Warangal APMC',
    district: 'Warangal',
    volumeToday: '980 quintals',
    modalPrice: 6240,
    minPrice: 6050,
    maxPrice: 6420,
    changePercent: 1.8,
    trend: 'up',
  },
  {
    id: 'MP-3',
    cropName: 'Maize',
    variety: 'Hybrid Yellow (Feed Grade)',
    mandiName: 'Nizamabad APMC',
    district: 'Nizamabad',
    volumeToday: '2,150 quintals',
    modalPrice: 1820,
    minPrice: 1750,
    maxPrice: 1890,
    changePercent: 3.1,
    trend: 'up',
  },
  {
    id: 'MP-4',
    cropName: 'Chilli',
    variety: 'Guntur Teja (Dry Red)',
    mandiName: 'Khammam APMC',
    district: 'Khammam',
    volumeToday: '640 quintals',
    modalPrice: 14800,
    minPrice: 13900,
    maxPrice: 15400,
    changePercent: -1.2,
    trend: 'down',
  },
  {
    id: 'MP-5',
    cropName: 'Wheat',
    variety: 'Sharbati Golden (Lok-1)',
    mandiName: 'Adilabad APMC',
    district: 'Adilabad',
    volumeToday: '420 quintals',
    modalPrice: 2120,
    minPrice: 2050,
    maxPrice: 2180,
    changePercent: 0.0,
    trend: 'stable',
  },
  {
    id: 'MP-6',
    cropName: 'Groundnut',
    variety: 'Kadir Bold (Pod format)',
    mandiName: 'Mahbubnagar APMC',
    district: 'Mahbubnagar',
    volumeToday: '530 quintals',
    modalPrice: 5680,
    minPrice: 5450,
    maxPrice: 5820,
    changePercent: 0.9,
    trend: 'up',
  },
  {
    id: 'MP-7',
    cropName: 'Soybean',
    variety: 'JS-335 Yellow',
    mandiName: 'Karimnagar APMC',
    district: 'Karimnagar',
    volumeToday: '810 quintals',
    modalPrice: 4520,
    minPrice: 4400,
    maxPrice: 4610,
    changePercent: -0.6,
    trend: 'down',
  },
  {
    id: 'MP-8',
    cropName: 'Turmeric',
    variety: 'Salem / Nizamabad Bulb',
    mandiName: 'Nizamabad APMC',
    district: 'Nizamabad',
    volumeToday: '310 quintals',
    modalPrice: 13100,
    minPrice: 12400,
    maxPrice: 13650,
    changePercent: 4.5,
    trend: 'up',
  },
];

const CROP_TRENDS_MAP: Record<string, CropTrendData> = {
  Rice: {
    cropName: 'Rice (Paddy Sona Masoori)',
    unit: '₹ / quintal',
    currentPrice: 1950,
    weekChange: 2.4,
    trend: 'up',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 1905 },
      { day: 'Tue', date: '5 days ago', price: 1915 },
      { day: 'Wed', date: '4 days ago', price: 1910 },
      { day: 'Thu', date: '3 days ago', price: 1928 },
      { day: 'Fri', date: '2 days ago', price: 1935 },
      { day: 'Sat', date: 'Yesterday', price: 1942 },
      { day: 'Sun', date: 'Today', price: 1950 },
    ],
  },
  Cotton: {
    cropName: 'Cotton (Bt Long Staple)',
    unit: '₹ / quintal',
    currentPrice: 6240,
    weekChange: 1.8,
    trend: 'up',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 6130 },
      { day: 'Tue', date: '5 days ago', price: 6150 },
      { day: 'Wed', date: '4 days ago', price: 6180 },
      { day: 'Thu', date: '3 days ago', price: 6190 },
      { day: 'Fri', date: '2 days ago', price: 6210 },
      { day: 'Sat', date: 'Yesterday', price: 6225 },
      { day: 'Sun', date: 'Today', price: 6240 },
    ],
  },
  Maize: {
    cropName: 'Maize (Hybrid Yellow)',
    unit: '₹ / quintal',
    currentPrice: 1820,
    weekChange: 3.1,
    trend: 'up',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 1765 },
      { day: 'Tue', date: '5 days ago', price: 1770 },
      { day: 'Wed', date: '4 days ago', price: 1785 },
      { day: 'Thu', date: '3 days ago', price: 1795 },
      { day: 'Fri', date: '2 days ago', price: 1805 },
      { day: 'Sat', date: 'Yesterday', price: 1812 },
      { day: 'Sun', date: 'Today', price: 1820 },
    ],
  },
  Chilli: {
    cropName: 'Chilli (Guntur Teja)',
    unit: '₹ / quintal',
    currentPrice: 14800,
    weekChange: -1.2,
    trend: 'down',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 14980 },
      { day: 'Tue', date: '5 days ago', price: 14920 },
      { day: 'Wed', date: '4 days ago', price: 14890 },
      { day: 'Thu', date: '3 days ago', price: 14850 },
      { day: 'Fri', date: '2 days ago', price: 14810 },
      { day: 'Sat', date: 'Yesterday', price: 14830 },
      { day: 'Sun', date: 'Today', price: 14800 },
    ],
  },
  Wheat: {
    cropName: 'Wheat (Sharbati Golden)',
    unit: '₹ / quintal',
    currentPrice: 2120,
    weekChange: 0.0,
    trend: 'stable',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 2120 },
      { day: 'Tue', date: '5 days ago', price: 2115 },
      { day: 'Wed', date: '4 days ago', price: 2125 },
      { day: 'Thu', date: '3 days ago', price: 2120 },
      { day: 'Fri', date: '2 days ago', price: 2118 },
      { day: 'Sat', date: 'Yesterday', price: 2122 },
      { day: 'Sun', date: 'Today', price: 2120 },
    ],
  },
  Groundnut: {
    cropName: 'Groundnut (Kadir Bold)',
    unit: '₹ / quintal',
    currentPrice: 5680,
    weekChange: 0.9,
    trend: 'up',
    dataPoints: [
      { day: 'Mon', date: '6 days ago', price: 5630 },
      { day: 'Tue', date: '5 days ago', price: 5640 },
      { day: 'Wed', date: '4 days ago', price: 5655 },
      { day: 'Thu', date: '3 days ago', price: 5650 },
      { day: 'Fri', date: '2 days ago', price: 5665 },
      { day: 'Sat', date: 'Yesterday', price: 5675 },
      { day: 'Sun', date: 'Today', price: 5680 },
    ],
  },
};

const ACTIVITIES: ActivityFeedItem[] = [
  {
    id: 'ACT-1',
    type: 'offer_accepted',
    title: 'Offer Accepted: Cotton (LOT-7824)',
    description: 'Venkat Reddy accepted your offer of ₹6,150/q for 35 quintals.',
    timestamp: '10m ago',
    targetRoute: '/buyer/deals',
  },
  {
    id: 'ACT-2',
    type: 'lot_matched',
    title: 'New Lot Matched: Grade A Rice in Kothapet',
    description: '50 quintals harvest from Ramesh Patel matching your target price.',
    timestamp: '1h ago',
    targetRoute: '/buyer/browse',
  },
  {
    id: 'ACT-3',
    type: 'price_alert',
    title: 'Price alert triggered: Rice hit target',
    description: 'Rice traded at ₹1,900/quintal in Suryapet APMC, matching your threshold.',
    timestamp: '2h ago',
    targetRoute: '/buyer/browse',
  },
  {
    id: 'ACT-4',
    type: 'payment_released',
    title: 'Escrow payment released for Deal #4028',
    description: '₹1,40,000 disbursed to Suresh Rao post weighment verification.',
    timestamp: '4h ago',
    targetRoute: '/buyer/deals',
  },
  {
    id: 'ACT-5',
    type: 'supplier_joined',
    title: 'New farmer joined preferred supplier network',
    description: 'Ramesh Ji (4.9 ⭐, Kothapet) added to your verified network.',
    timestamp: '5h ago',
    targetRoute: '/buyer/browse',
  },
  {
    id: 'ACT-6',
    type: 'quality_certified',
    title: 'Consignment Q-884 certified Grade A',
    description: 'Lab test confirmed 11.8% moisture and 0.8% foreign matter.',
    timestamp: 'Yesterday',
    targetRoute: '/buyer/deals',
  },
];

const DEMAND_FORECASTS: DemandForecastItem[] = [
  {
    cropName: 'Rice',
    demandLevel: 'High Demand',
    reasoning: 'Festival season procurement expected across Telangana & export quotas.',
    projectedPriceChange: '+4.2%',
    demandScore: 88,
    keyDriver: 'Milling industry inventory replenishment and state civil supplies.',
    seasonalityBadge: 'Kharif Harvest Arrival',
  },
  {
    cropName: 'Cotton',
    demandLevel: 'Medium Demand',
    reasoning: 'Stable export orders & domestic spinning mill consumption.',
    projectedPriceChange: '+1.5%',
    demandScore: 62,
    keyDriver: 'Textile export demand steady; cautious procurement from ginneries.',
    seasonalityBadge: 'Active Ginneries Cycle',
  },
  {
    cropName: 'Maize',
    demandLevel: 'High Demand',
    reasoning: 'Poultry feed sector expansion & ethanol plant procurement in South India.',
    projectedPriceChange: '+5.8%',
    demandScore: 91,
    keyDriver: 'Layer farm feed consumption surging around Hyderabad peri-urban belt.',
    seasonalityBadge: 'Feed Mill Peak Season',
  },
  {
    cropName: 'Chilli',
    demandLevel: 'Low Demand',
    reasoning: 'Seasonal surplus expected with arrival of early irrigated pickings.',
    projectedPriceChange: '-2.1%',
    demandScore: 36,
    keyDriver: 'Cold storages in Guntur-Khammam corridor nearing 85% capacity.',
    seasonalityBadge: 'Flush Season Influx',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const BuyerInsightsScreen: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Telangana');
  const [selectedTrendCrop, setSelectedTrendCrop] = useState<string>('Rice');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Prices updated 15 minutes ago via e-NAM integration');
  const [showFullInsightsModal, setShowFullInsightsModal] = useState<boolean>(false);
  const [activeChartHoverIndex, setActiveChartHoverIndex] = useState<number | null>(null);

  // Filtered Mandi Prices
  const filteredMandiPrices = useMemo(() => {
    if (selectedDistrict === 'All Telangana') {
      return MANDI_PRICES;
    }
    return MANDI_PRICES.filter((item) => item.district.toLowerCase() === selectedDistrict.toLowerCase());
  }, [selectedDistrict]);

  // Selected Trend Data
  const currentTrend = CROP_TRENDS_MAP[selectedTrendCrop] || CROP_TRENDS_MAP['Rice'];

  // Calculate SVG Line Chart coordinates
  const chartCoordinates = useMemo(() => {
    const points = currentTrend.dataPoints;
    const prices = points.map((p) => p.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const range = maxPrice - minPrice || 1;

    const width = 500;
    const height = 160;
    const paddingX = 35;
    const paddingY = 25;

    const coords = points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((p.price - minPrice) / range) * (height - paddingY * 2);
      return { x, y, price: p.price, day: p.day, date: p.date };
    });

    const pathD = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Gradient fill path closed to bottom
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

    return { coords, pathD, areaD, width, height, minPrice, maxPrice };
  }, [currentTrend]);

  // Handle Refresh simulation
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedText('Prices updated just now via e-NAM integration');
    }, 900);
  };

  return (
    <BuyerLayout activeTab="insights">
      <div className="space-y-6 pb-12">
        {/* ========================================================
            HEADER ROW
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Market Insights
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                e-NAM Live
              </span>
            </div>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Real-time mandi prices, demand trends, and procurement intelligence
            </p>
          </div>

          {/* Right-aligned District selector + Refresh button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-xs">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All Telangana">All Telangana Mandis</option>
                <option value="Suryapet">Suryapet</option>
                <option value="Warangal">Warangal</option>
                <option value="Nizamabad">Nizamabad</option>
                <option value="Khammam">Khammam</option>
                <option value="Adilabad">Adilabad</option>
                <option value="Mahbubnagar">Mahbubnagar</option>
                <option value="Karimnagar">Karimnagar</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              title="Refresh Mandi Rates"
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-[#0D9488] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================
            SUMMARY STAT ROW (4 Cards, Equal Width)
           ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Avg. Price Change (7d) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Avg. Price Change (7d)
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">
                +1.8%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                overall
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              across tracked crops in Telangana
            </div>
          </div>

          {/* Card 2: Most Active Mandi */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Most Active Mandi
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center">
                <Building2 className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Warangal
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              850+ quintals traded today
            </div>
          </div>

          {/* Card 3: Best Value Crop */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Best Value Crop
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Maize
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                +3.1%
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              trending up, high volume
            </div>
          </div>

          {/* Card 4: Price Alerts */}
          <div className="bg-white rounded-xl border border-amber-200/80 p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Price Alerts
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-600">
                2
              </span>
              <span className="text-xs font-semibold text-amber-800/80">
                triggers hit
              </span>
            </div>
            <div className="mt-2 text-xs text-amber-800/80">
              crops hit your target buy price
            </div>
          </div>
        </div>

        {/* ========================================================
            MAIN CONTENT — TWO-COLUMN SECTION
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ────────────────────────────────────────────────────────
              LEFT COLUMN (7 cols): Today's Mandi Prices + Line Chart
             ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Today's Mandi Prices Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">
                    Today's Mandi Prices — Telangana
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Official APMC daily benchmark wholesale arrivals
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                  {filteredMandiPrices.length} Crops
                </span>
              </div>

              {/* Price Rows */}
              <div className="divide-y divide-slate-100">
                {filteredMandiPrices.map((item) => {
                  const isUp = item.trend === 'up';
                  const isDown = item.trend === 'down';

                  return (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                    >
                      {/* Left: Crop Name + Mandi info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {item.cropName}
                          </span>
                          <span className="text-xs text-slate-500 truncate hidden sm:inline">
                            ({item.variety})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-slate-600">{item.mandiName}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.volumeToday}</span>
                        </div>
                      </div>

                      {/* Right: Price + Trend Indicator */}
                      <div className="text-right shrink-0">
                        <div className="text-sm md:text-base font-extrabold text-slate-900">
                          ₹{item.modalPrice.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ quintal</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {isUp && (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                              <TrendingUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                              +{item.changePercent}%
                            </span>
                          )}
                          {isDown && (
                            <span className="inline-flex items-center text-xs font-bold text-rose-600">
                              <TrendingDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                              {item.changePercent}%
                            </span>
                          )}
                          {!isUp && !isDown && (
                            <span className="inline-flex items-center text-xs font-bold text-slate-400">
                              <Minus className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                              0.0%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer: Timestamp + Link */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">{lastUpdatedText}</span>
                <button
                  type="button"
                  onClick={() => setShowFullInsightsModal(true)}
                  className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>View Full Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7-Day Price Trend Chart Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    7-Day Benchmark Price Trend
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily wholesale price trajectory for {currentTrend.cropName}
                  </p>
                </div>

                {/* Dropdown to pick crop trend */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Crop:</span>
                  <select
                    value={selectedTrendCrop}
                    onChange={(e) => setSelectedTrendCrop(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] cursor-pointer"
                  >
                    <option value="Rice">Rice (Sona Masoori)</option>
                    <option value="Cotton">Cotton (Bt Staple)</option>
                    <option value="Maize">Maize (Hybrid)</option>
                    <option value="Chilli">Chilli (Guntur Teja)</option>
                    <option value="Wheat">Wheat (Sharbati)</option>
                    <option value="Groundnut">Groundnut (Kadir)</option>
                  </select>
                </div>
              </div>

              {/* Price Stats Banner */}
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4 p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Current Mandi Rate</span>
                  <div className="text-xl font-extrabold text-[#0D9488]">
                    ₹{currentTrend.currentPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-semibold text-slate-600">/ quintal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">7-Day Trajectory</span>
                  <div className={`text-sm font-bold flex items-center justify-end gap-1 ${
                    currentTrend.weekChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {currentTrend.weekChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                    )}
                    <span>
                      {currentTrend.weekChange >= 0 ? `+${currentTrend.weekChange}%` : `${currentTrend.weekChange}%`}
                    </span>
                    <span className="text-xs font-normal text-slate-500 ml-1">(Past week)</span>
                  </div>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className="mt-4 relative">
                <svg
                  viewBox={`0 0 ${chartCoordinates.width} ${chartCoordinates.height}`}
                  className="w-full h-44 overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartTealGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline Grids */}
                  <line
                    x1="25"
                    y1="35"
                    x2={chartCoordinates.width - 25}
                    y2="35"
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <line
                    x1="25"
                    y1="85"
                    x2={chartCoordinates.width - 25}
                    y2="85"
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <line
                    x1="25"
                    y1="135"
                    x2={chartCoordinates.width - 25}
                    y2="135"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />

                  {/* Area Fill */}
                  <path d={chartCoordinates.areaD} fill="url(#chartTealGradient)" />

                  {/* Line Stroke */}
                  <path
                    d={chartCoordinates.pathD}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {chartCoordinates.coords.map((pt, idx) => {
                    const isHovered = activeChartHoverIndex === idx;
                    return (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : 4}
                          fill="#FFFFFF"
                          stroke="#0D9488"
                          strokeWidth={isHovered ? 3 : 2}
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setActiveChartHoverIndex(idx)}
                          onMouseLeave={() => setActiveChartHoverIndex(null)}
                        />

                        {/* X-Axis Day Labels */}
                        <text
                          x={pt.x}
                          y={chartCoordinates.height - 4}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-slate-400"
                        >
                          {pt.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip if Point Hovered */}
                {activeChartHoverIndex !== null && (
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-full px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold pointer-events-none shadow-lg"
                    style={{
                      left: `${(chartCoordinates.coords[activeChartHoverIndex].x / chartCoordinates.width) * 100}%`,
                      top: `${(chartCoordinates.coords[activeChartHoverIndex].y / chartCoordinates.height) * 100 - 15}%`,
                    }}
                  >
                    <span>₹{chartCoordinates.coords[activeChartHoverIndex].price}</span>
                    <span className="text-[10px] text-slate-300 font-normal ml-1">
                      ({chartCoordinates.coords[activeChartHoverIndex].date})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              RIGHT COLUMN (5 cols): Recent Activity Feed
             ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Recent Activity
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Latest updates on your bids, deal contracts, and settlements
                </p>
              </div>

              {/* Feed Items */}
              <div className="mt-4 space-y-4">
                {ACTIVITIES.map((act) => {
                  let badgeIcon = <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />;
                  let badgeBg = 'bg-teal-50 border-teal-200';

                  if (act.type === 'price_alert') {
                    badgeIcon = <Bell className="w-4 h-4 text-amber-600" />;
                    badgeBg = 'bg-amber-50 border-amber-200';
                  } else if (act.type === 'supplier_joined') {
                    badgeIcon = <UserPlus className="w-4 h-4 text-[#0D9488]" />;
                    badgeBg = 'bg-teal-50 border-teal-200';
                  } else if (act.type === 'payment_released') {
                    badgeIcon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;
                    badgeBg = 'bg-emerald-50 border-emerald-200';
                  } else if (act.type === 'lot_matched') {
                    badgeIcon = <Sparkles className="w-4 h-4 text-purple-600" />;
                    badgeBg = 'bg-purple-50 border-purple-200';
                  }

                  return (
                    <div
                      key={act.id}
                      onClick={() => act.targetRoute && navigate(act.targetRoute)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${badgeBg}`}>
                        {badgeIcon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-[#0D9488] transition-colors line-clamp-1">
                            {act.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Escrow Shield Note */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>Escrow Protection Protocol active on all transactions</span>
              </div>
            </div>

            {/* Quick Sourcing Prompt Card */}
            <div className="bg-gradient-to-br from-teal-800 to-[#0F766E] text-white p-5 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>High Liquidity Alert</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Warangal Cotton Mandi arrivals up 24% today
              </h4>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Direct farm lots available with pre-certified moisture and lint quality. Lock favorable terms before mandi auctions close.
              </p>
              <button
                onClick={() => navigate('/buyer/browse')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0D9488] text-xs font-bold rounded-lg shadow-xs hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <span>Browse Cotton Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            BELOW SECTION — DEMAND FORECAST CARD (Full Width)
           ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Demand Forecast — Next 30 Days
                </h3>
                <span className="text-[11px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200 px-2 py-0.5 rounded-full">
                  AI Predictive Engine
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Predictive commodity demand model driven by Telangana seasonal cycles, MSP benchmarks, and industrial procurement
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Confidence Score: <span className="font-bold text-slate-700">92%</span>
            </div>
          </div>

          {/* 4 Crop Demand Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMAND_FORECASTS.map((fc) => {
              const isHigh = fc.demandLevel === 'High Demand';
              const isMed = fc.demandLevel === 'Medium Demand';

              let pillClass = 'bg-rose-50 text-rose-700 border-rose-200';
              let barColor = 'bg-rose-500';

              if (isHigh) {
                pillClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                barColor = 'bg-emerald-500';
              } else if (isMed) {
                pillClass = 'bg-amber-50 text-amber-700 border-amber-200';
                barColor = 'bg-amber-500';
              }

              return (
                <div
                  key={fc.cropName}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2.5">
                    {/* Header: Crop + Demand Pill */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900">
                        {fc.cropName}
                      </h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pillClass}`}>
                        {fc.demandLevel}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      {fc.seasonalityBadge}
                    </div>

                    {/* Reasoning */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      "{fc.reasoning}"
                    </p>
                  </div>

                  {/* Demand Meter & Projected Price Movement */}
                  <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Projected Move</span>
                      <span className={`font-bold ${fc.projectedPriceChange.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fc.projectedPriceChange}
                      </span>
                    </div>

                    {/* Gauge Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                        <span>Procurement Pressure</span>
                        <span>{fc.demandScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${fc.demandScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      <span className="font-semibold text-slate-700">Driver:</span> {fc.keyDriver}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          FULL INSIGHTS MODAL (Mandi Price Benchmark Table)
         ======================================================== */}
      {showFullInsightsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Telangana APMC Mandi Benchmark Registry
                </h3>
              </div>
              <button
                onClick={() => setShowFullInsightsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="p-6 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Crop & Variety</th>
                      <th className="px-4 py-3">Mandi / District</th>
                      <th className="px-4 py-3">Arrivals</th>
                      <th className="px-4 py-3">Min Price</th>
                      <th className="px-4 py-3">Modal Rate</th>
                      <th className="px-4 py-3">Max Price</th>
                      <th className="px-4 py-3 rounded-r-lg">7d Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {MANDI_PRICES.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {m.cropName}
                          <div className="text-[11px] font-normal text-slate-500">{m.variety}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-800">{m.mandiName}</span>
                          <div className="text-[11px] text-slate-400">{m.district}</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium">{m.volumeToday}</td>
                        <td className="px-4 py-3.5 text-slate-600">₹{m.minPrice.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3.5 font-extrabold text-[#0D9488]">
                          ₹{m.modalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">₹{m.maxPrice.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3.5">
                          {m.trend === 'up' && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <TrendingUp className="w-3.5 h-3.5" /> +{m.changePercent}%
                            </span>
                          )}
                          {m.trend === 'down' && (
                            <span className="text-rose-600 font-bold flex items-center gap-0.5">
                              <TrendingDown className="w-3.5 h-3.5" /> {m.changePercent}%
                            </span>
                          )}
                          {m.trend === 'stable' && (
                            <span className="text-slate-400 font-bold flex items-center gap-0.5">
                              <Minus className="w-3.5 h-3.5" /> 0.0%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Data synchronized from national e-NAM APMC gateway</span>
              <button
                type="button"
                onClick={() => setShowFullInsightsModal(false)}
                className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl hover:bg-[#0F766E] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
};

export default BuyerInsightsScreen;
