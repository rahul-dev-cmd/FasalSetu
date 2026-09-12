import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  MapPin,
  CheckCircle2,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  PhoneCall,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  Package,
  Eye
} from 'lucide-react';
import BuyerLayout from '../components/BuyerLayout';
import groundnutImg from '../assets/groundnut.jpg';
import sugarcaneImg from '../assets/sugarcane.jpg';
import soybeanImg from '../assets/soybean.jpg';

export interface LotItem {
  id: string;
  cropName: string;
  variety: string;
  grade: 'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Basic)';
  quantityNumber: number;
  quantityUnit: string;
  farmerName: string;
  farmerRating: number;
  reviewsCount: number;
  location: string;
  distanceKm: number;
  askingPrice: number;
  marketPrice: number;
  image: string;
  harvestDate: string;
  verified: boolean;
  moisturePercent: number;
  packaging: string;
}

export const SAMPLE_LOTS: LotItem[] = [
  {
    id: 'LOT-7821',
    cropName: 'Rice',
    variety: 'BPT-5204 (Sona Masoori)',
    grade: 'Grade A (Premium)',
    quantityNumber: 50,
    quantityUnit: 'Quintals',
    farmerName: 'Ramesh Ji',
    farmerRating: 4.9,
    reviewsCount: 142,
    location: 'Kothapet, Telangana',
    distanceKm: 12,
    askingPrice: 1980,
    marketPrice: 2050,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 11.8,
    packaging: 'Jute Bags (50kg)',
  },
  {
    id: 'LOT-7824',
    cropName: 'Cotton',
    variety: 'Bt Cotton Long Staple',
    grade: 'Grade A (Premium)',
    quantityNumber: 85,
    quantityUnit: 'Quintals',
    farmerName: 'Suresh Reddy',
    farmerRating: 4.8,
    reviewsCount: 95,
    location: 'Warangal, Telangana',
    distanceKm: 68,
    askingPrice: 6200,
    marketPrice: 6350,
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Oct 2025',
    verified: true,
    moisturePercent: 8.5,
    packaging: 'Compressed Bales',
  },
  {
    id: 'LOT-7829',
    cropName: 'Maize',
    variety: 'Yellow Grain Hybrid',
    grade: 'Grade A (Premium)',
    quantityNumber: 120,
    quantityUnit: 'Quintals',
    farmerName: 'Venkatesh Rao',
    farmerRating: 4.7,
    reviewsCount: 82,
    location: 'Nizamabad, Telangana',
    distanceKm: 92,
    askingPrice: 2050,
    marketPrice: 2120,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 12.5,
    packaging: 'Loose in Tarpaulin Truck',
  },
  {
    id: 'LOT-7832',
    cropName: 'Chilli',
    variety: 'Guntur Teja (Dry Red)',
    grade: 'Grade A (Premium)',
    quantityNumber: 35,
    quantityUnit: 'Quintals',
    farmerName: 'Anil Goud',
    farmerRating: 4.9,
    reviewsCount: 110,
    location: 'Khammam, Telangana',
    distanceKm: 115,
    askingPrice: 14800,
    marketPrice: 15400,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Dec 2025',
    verified: true,
    moisturePercent: 9.2,
    packaging: 'Gunny Bags',
  },
  {
    id: 'LOT-7835',
    cropName: 'Groundnut',
    variety: 'Kadir 6 (Bold Kernels)',
    grade: 'Grade A (Premium)',
    quantityNumber: 40,
    quantityUnit: 'Quintals',
    farmerName: 'Balaji Agro Farms',
    farmerRating: 5.0,
    reviewsCount: 64,
    location: 'Karimnagar, Telangana',
    distanceKm: 104,
    askingPrice: 5800,
    marketPrice: 5950,
    image: groundnutImg,
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 7.8,
    packaging: 'Double Gunny Bags',
  },
  {
    id: 'LOT-7840',
    cropName: 'Wheat',
    variety: 'Sharbati Golden Grain',
    grade: 'Grade B (Standard)',
    quantityNumber: 90,
    quantityUnit: 'Quintals',
    farmerName: 'Mahender Singh',
    farmerRating: 4.8,
    reviewsCount: 88,
    location: 'Adilabad, Telangana',
    distanceKm: 145,
    askingPrice: 2150,
    marketPrice: 2200,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Dec 2025',
    verified: true,
    moisturePercent: 11.2,
    packaging: 'HDPE Woven Bags',
  },
  {
    id: 'LOT-7844',
    cropName: 'Sugarcane',
    variety: 'Co-86032 High Sucrose',
    grade: 'Grade A (Premium)',
    quantityNumber: 250,
    quantityUnit: 'Quintals',
    farmerName: 'Krishna Murthy',
    farmerRating: 4.6,
    reviewsCount: 52,
    location: 'Medak, Telangana',
    distanceKm: 42,
    askingPrice: 380,
    marketPrice: 400,
    image: sugarcaneImg,
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 72.0,
    packaging: 'Field Stalk Bundles',
  },
  {
    id: 'LOT-7848',
    cropName: 'Soybean',
    variety: 'JS-335 Yellow Seed',
    grade: 'Grade B (Standard)',
    quantityNumber: 65,
    quantityUnit: 'Quintals',
    farmerName: 'Rajeshwar Patel',
    farmerRating: 4.7,
    reviewsCount: 74,
    location: 'Nalgonda, Telangana',
    distanceKm: 78,
    askingPrice: 4450,
    marketPrice: 4600,
    image: soybeanImg,
    harvestDate: 'Oct 2025',
    verified: true,
    moisturePercent: 10.4,
    packaging: 'Standard Jute Sacks',
  },
  {
    id: 'LOT-7852',
    cropName: 'Vegetables',
    variety: 'Hybrid Red Table Tomatoes',
    grade: 'Grade A (Premium)',
    quantityNumber: 45,
    quantityUnit: 'Quintals',
    farmerName: 'Srinivas Rao',
    farmerRating: 4.9,
    reviewsCount: 130,
    location: 'Rangareddy, Telangana',
    distanceKm: 22,
    askingPrice: 1650,
    marketPrice: 1750,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 91.0,
    packaging: 'Plastic Crates (25kg)',
  },
  {
    id: 'LOT-7856',
    cropName: 'Mustard',
    variety: 'Pusa Bold Black Mustard',
    grade: 'Grade A (Premium)',
    quantityNumber: 55,
    quantityUnit: 'Quintals',
    farmerName: 'Laxman Naik',
    farmerRating: 4.8,
    reviewsCount: 61,
    location: 'Mahabubnagar, Telangana',
    distanceKm: 88,
    askingPrice: 5100,
    marketPrice: 5250,
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Dec 2025',
    verified: true,
    moisturePercent: 8.0,
    packaging: 'Moisture-proof Sacks',
  },
  {
    id: 'LOT-7860',
    cropName: 'Vegetables',
    variety: 'Nashik Red Hybrid Onion',
    grade: 'Grade B (Standard)',
    quantityNumber: 80,
    quantityUnit: 'Quintals',
    farmerName: 'Ramulu Goud',
    farmerRating: 4.7,
    reviewsCount: 105,
    location: 'Vikarabad, Telangana',
    distanceKm: 54,
    askingPrice: 2400,
    marketPrice: 2550,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 14.0,
    packaging: 'Mesh Bags (40kg)',
  },
  {
    id: 'LOT-7865',
    cropName: 'Vegetables',
    variety: 'Tender Green Okra (Bhindi)',
    grade: 'Grade A (Premium)',
    quantityNumber: 25,
    quantityUnit: 'Quintals',
    farmerName: 'Govind Swamy',
    farmerRating: 4.9,
    reviewsCount: 92,
    location: 'Sangareddy, Telangana',
    distanceKm: 36,
    askingPrice: 2800,
    marketPrice: 2950,
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
    harvestDate: 'Nov 2025',
    verified: true,
    moisturePercent: 88.0,
    packaging: 'Perforated Corrugated Boxes',
  },
];

export const BuyerBrowseScreen: React.FC = () => {
  const navigate = useNavigate();

  // View mode: grid vs list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'distance' | 'rating'>('newest');

  // Pagination state
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Modal States
  const [selectedLotDetails, setSelectedLotDetails] = useState<LotItem | null>(null);
  const [selectedLotForOffer, setSelectedLotForOffer] = useState<LotItem | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQuantity, setOfferQuantity] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Has active filters
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      cropFilter !== 'All' ||
      gradeFilter !== 'All' ||
      priceRange !== 'All' ||
      distanceFilter !== 'All'
    );
  }, [searchQuery, cropFilter, gradeFilter, priceRange, distanceFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setCropFilter('All');
    setGradeFilter('All');
    setPriceRange('All');
    setDistanceFilter('All');
    setSortBy('newest');
  };

  // Filtered and sorted lots
  const filteredLots = useMemo(() => {
    return SAMPLE_LOTS.filter((lot) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          lot.cropName.toLowerCase().includes(q) ||
          lot.variety.toLowerCase().includes(q) ||
          lot.id.toLowerCase().includes(q) ||
          lot.farmerName.toLowerCase().includes(q) ||
          lot.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Crop type
      if (cropFilter !== 'All' && !lot.cropName.toLowerCase().includes(cropFilter.toLowerCase())) {
        return false;
      }

      // Grade
      if (gradeFilter !== 'All' && !lot.grade.includes(gradeFilter)) {
        return false;
      }

      // Price range
      if (priceRange === 'under-2000' && lot.askingPrice >= 2000) return false;
      if (priceRange === '2000-5000' && (lot.askingPrice < 2000 || lot.askingPrice > 5000)) return false;
      if (priceRange === 'above-5000' && lot.askingPrice <= 5000) return false;

      // Distance
      if (distanceFilter === '15' && lot.distanceKm > 15) return false;
      if (distanceFilter === '30' && lot.distanceKm > 30) return false;
      if (distanceFilter === '60' && lot.distanceKm > 60) return false;
      if (distanceFilter === '120' && lot.distanceKm > 120) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.askingPrice - b.askingPrice;
      if (sortBy === 'price-desc') return b.askingPrice - a.askingPrice;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return b.farmerRating - a.farmerRating;
      return 0; // default newest
    });
  }, [searchQuery, cropFilter, gradeFilter, priceRange, distanceFilter, sortBy]);

  const displayedLots = filteredLots.slice(0, visibleCount);

  // Offer modal trigger
  const handleOpenOfferModal = (lot: LotItem) => {
    setSelectedLotForOffer(lot);
    setOfferPrice(lot.askingPrice);
    setOfferQuantity(lot.quantityNumber);
    setOfferMessage(`Hello ${lot.farmerName}, we are interested in purchasing your verified lot with immediate escrow deposit.`);
  };

  const handleSubmitOffer = () => {
    if (!selectedLotForOffer) return;
    showToast(`Offer of ₹${offerPrice.toLocaleString()}/qtl for ${selectedLotForOffer.cropName} submitted to ${selectedLotForOffer.farmerName} ✓`);
    setSelectedLotForOffer(null);
  };

  return (
    <BuyerLayout activeTab="browse">
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
          1. HEADER ROW (Title, Subtitle & Grid/List toggle)
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Browse Lots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover verified harvest batches from farmers across Telangana
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-[#0D9488] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-[#0D9488] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. FILTER BAR & ACTIVE CHIPS
         ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Search and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, lot ID, or location..."
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-[#0D9488]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Crop Type Dropdown */}
          <div>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="All">All Crops</option>
              <option value="Rice">Rice (Paddy)</option>
              <option value="Cotton">Cotton</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Chilli">Chilli</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Soybean">Soybean</option>
              <option value="Mustard">Mustard</option>
            </select>
          </div>

          {/* Grade Dropdown */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="All">All Grades</option>
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
              <option value="Grade C">Grade C (Basic)</option>
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="All">All Price Ranges</option>
              <option value="under-2000">Under ₹2,000 / qtl</option>
              <option value="2000-5000">₹2,000 – ₹5,000 / qtl</option>
              <option value="above-5000">Above ₹5,000 / qtl</option>
            </select>
          </div>

          {/* Distance Dropdown */}
          <div>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="All">Any Distance</option>
              <option value="15">Within 15 km</option>
              <option value="30">Within 30 km</option>
              <option value="60">Within 60 km</option>
              <option value="120">Within 120 km</option>
            </select>
          </div>
        </div>

        {/* Row 2: Sort By & Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="distance">Distance: Nearest First</option>
              <option value="rating">Farmer Rating: Highest</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[#0D9488] font-bold hover:underline self-start sm:self-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Row 3: Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {cropFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                Crop: {cropFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCropFilter('All')} />
              </span>
            )}
            {gradeFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                {gradeFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setGradeFilter('All')} />
              </span>
            )}
            {priceRange !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                Price: {priceRange}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange('All')} />
              </span>
            )}
            {distanceFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#0D9488] border border-teal-200">
                Within {distanceFilter} km
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDistanceFilter('All')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          3. RESULTS COUNT
         ======================================================== */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 px-1">
        <span>Showing {displayedLots.length} of {filteredLots.length} verified farm lots</span>
        <span className="text-slate-400 text-xs hidden sm:inline">Telangana Mandi Direct Trade</span>
      </div>

      {/* ========================================================
          4. LOT CARDS DISPLAY (GRID OR LIST VIEW)
         ======================================================== */}
      {filteredLots.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No lots match your filters</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria, clearing distance filters, or expanding the price range.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-[#0D9488] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View (3-4 columns)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Crop Photo with badges */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={lot.image}
                    alt={`${lot.cropName} harvest - ${lot.variety}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                    {lot.id}
                  </div>
                  {lot.verified && (
                    <div className="absolute top-2.5 right-2.5 bg-[#0D9488] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Body details */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {lot.cropName} · <span className="text-xs text-slate-600 font-semibold">{lot.grade}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{lot.variety}</p>
                  </div>

                  {/* Quantity and Distance */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity</span>
                      <span className="font-extrabold text-slate-900">{lot.quantityNumber} {lot.quantityUnit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance</span>
                      <span className="font-semibold text-slate-700">{lot.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Farmer Name & Rating */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 truncate text-slate-800 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {lot.farmerName.charAt(0)}
                      </div>
                      <span className="truncate">{lot.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{lot.farmerRating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({lot.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                    <span className="truncate">{lot.location}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Asking Price</span>
                  <div>
                    <span className="text-lg font-black text-[#0D9488]">₹{lot.askingPrice.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-1">/ quintal</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLotDetails(lot)}
                    className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenOfferModal(lot)}
                    className="py-2 px-3 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <span>Make Offer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View (Horizontal rows)
        <div className="space-y-3">
          {displayedLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={lot.image}
                  alt={`${lot.cropName} harvest - ${lot.variety}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{lot.id}</span>
                    <span className="bg-teal-50 text-[#0D9488] text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                      Verified Lot
                    </span>
                    <span className="text-xs text-slate-400">• {lot.harvestDate}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {lot.cropName} · <span className="text-xs text-slate-600 font-semibold">{lot.grade}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{lot.variety} • Packaging: {lot.packaging}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">{lot.quantityNumber} {lot.quantityUnit}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {lot.location} ({lot.distanceKm} km)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      {lot.farmerName}
                      <span className="text-amber-500 font-bold">★ {lot.farmerRating}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0 gap-3">
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Asking Rate</div>
                  <div className="text-lg sm:text-xl font-black text-[#0D9488]">
                    ₹{lot.askingPrice.toLocaleString()} <span className="text-xs font-normal text-slate-400">/qtl</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLotDetails(lot)}
                    className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenOfferModal(lot)}
                    className="py-2 px-4 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Make Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          5. PAGINATION (Load More)
         ======================================================== */}
      {visibleCount < filteredLots.length && (
        <div className="text-center pt-4 pb-8">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 4)}
            className="px-8 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Load More Lots ({filteredLots.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* ========================================================
          6. LOT DETAILS MODAL
         ======================================================== */}
      {selectedLotDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedLotDetails.id}
                </span>
                <span className="bg-teal-50 text-[#0D9488] text-xs font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  Verified Inspection
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLotDetails(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
              {/* Photo & Main Info */}
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={selectedLotDetails.image}
                  alt={`${selectedLotDetails.cropName} harvest lot`}
                  className="w-full sm:w-48 h-44 rounded-2xl object-cover border border-slate-200"
                />
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedLotDetails.cropName} · {selectedLotDetails.grade}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedLotDetails.variety}</p>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Quantity</span>
                      <span className="font-extrabold text-slate-900 text-sm">{selectedLotDetails.quantityNumber} {selectedLotDetails.quantityUnit}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Asking Rate</span>
                      <span className="font-extrabold text-[#0D9488] text-sm">₹{selectedLotDetails.askingPrice.toLocaleString()} / qtl</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    <span>{selectedLotDetails.location} ({selectedLotDetails.distanceKm} km away)</span>
                  </div>
                </div>
              </div>

              {/* Lab Quality Test & Moisture Metrics */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
                  Quality Assay & Moisture Inspection
                </h4>
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Moisture Content</span>
                    <span className="font-black text-slate-900 text-sm">{selectedLotDetails.moisturePercent}%</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">Within Safe Spec</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Foreign Matter</span>
                    <span className="font-black text-slate-900 text-sm">&lt; 0.8%</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">Grade A Cleaned</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Packaging</span>
                    <span className="font-black text-slate-900 text-xs truncate block">{selectedLotDetails.packaging}</span>
                    <span className="text-[10px] text-teal-700 font-bold block">Ready for Transit</span>
                  </div>
                </div>
              </div>

              {/* Farmer Profile Information */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0D9488] font-bold text-sm flex items-center justify-center">
                    {selectedLotDetails.farmerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedLotDetails.farmerName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{selectedLotDetails.farmerRating} • {selectedLotDetails.reviewsCount} completed trades</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  KYC Verified
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedLotDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedLotDetails;
                  setSelectedLotDetails(null);
                  handleOpenOfferModal(target);
                }}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Proceed to Make Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. MAKE OFFER MODAL
         ======================================================== */}
      {selectedLotForOffer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={selectedLotForOffer.image}
                  alt={`${selectedLotForOffer.cropName} lot`}
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
                  <span className="text-slate-400 font-semibold block uppercase">Farmer Asking</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹{selectedLotForOffer.askingPrice.toLocaleString()} / qtl</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Total Available</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedLotForOffer.quantityNumber} {selectedLotForOffer.quantityUnit}</span>
                </div>
              </div>

              {/* Offer Price Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Offer Price (₹ / Quintal) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity to Procure ({selectedLotForOffer.quantityUnit}) *
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
                  Max available in this batch: {selectedLotForOffer.quantityNumber} {selectedLotForOffer.quantityUnit}
                </span>
              </div>

              {/* Optional message to farmer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message to Farmer (Optional)
                </label>
                <textarea
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="e.g. Can arrange immediate truck dispatch upon weighment..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Live Escrow Calculation */}
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 block">Total Escrow Commitment</span>
                  <span className="text-[11px] text-teal-700">Protected until electronic weighment slip</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-teal-900">
                    ₹{(offerPrice * offerQuantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLotForOffer(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitOffer}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
};

export default BuyerBrowseScreen;
