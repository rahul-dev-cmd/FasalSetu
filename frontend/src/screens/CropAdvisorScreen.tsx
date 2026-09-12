import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Droplets,
  Calendar,
  Layers,
  Clock,
  ShieldAlert,
  Info,
  RotateCcw,
  BookmarkCheck,
  Search,
  Check,
  X,
  MapPin,
  TrendingUp
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';
import {
  calculateCropRecommendations,
  CropAdvisorInputs,
  RecommendationResult,
  ScoredCrop
} from '../utils/cropScoring';
import { CropData } from '../data/cropKnowledgeBase';
import { advisoryApi } from '../services/api';

// Location dataset
const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  'Telangana': ['Kothapet / Rangareddy', 'Hyderabad', 'Medak', 'Nizamabad', 'Karimnagar', 'Warangal', 'Nalgonda', 'Khammam', 'Mahabubnagar'],
  'Andhra Pradesh': ['Guntur', 'Krishna', 'Kurnool', 'Anantapur', 'Chittoor', 'East Godavari', 'West Godavari', 'Visakhapatnam'],
  'Maharashtra': ['Pune', 'Nashik', 'Nagpur', 'Aurangabad (Chh. Sambhajinagar)', 'Solapur', 'Ahmednagar', 'Kolhapur', 'Amravati'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Sangrur', 'Firozpur'],
  'Haryana': ['Karnal', 'Hisar', 'Ambala', 'Rohtak', 'Sirsa', 'Kurukshetra', 'Sonipat'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Gorakhpur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Jabalpur', 'Gwalior', 'Sagar', 'Khargone'],
  'Karnataka': ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad', 'Mandya', 'Raichur', 'Ballari'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Mehsana', 'Junagadh', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Alwar', 'Sri Ganganagar'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Rohtas'],
};

// Soil options with simple plain-language descriptions
const SOIL_TYPES = [
  { id: 'Loamy', name: 'Loamy Soil', hindi: 'दोमट मिट्टी', desc: 'Soft, balanced soil that holds enough moisture while allowing smooth root aeration and drainage.' },
  { id: 'Black soil', name: 'Black Soil (Regur)', hindi: 'काली मिट्टी', desc: 'Heavy, moisture-retentive clay soil ideal for cotton, soybean, and winter rabi pulses.' },
  { id: 'Alluvial soil', name: 'Alluvial Soil', hindi: 'जलोढ़ मिट्टी', desc: 'Fertile river silt rich in potash and humus; highly productive for multiple annual rotations.' },
  { id: 'Red soil', name: 'Red Soil', hindi: 'लाल मिट्टी', desc: 'Porous and iron-rich with good drainage; ideal for groundnut, millets, and pulses with light watering.' },
  { id: 'Clayey', name: 'Clayey Soil', hindi: 'चिकनी मिट्टी', desc: 'Heavy fine particles that hold water long; excellent for wetland paddy or sugarcane.' },
  { id: 'Sandy', name: 'Sandy Soil', hindi: 'बलुई मिट्टी', desc: 'Light, fast-draining coarse soil with low water retention; suitable for tubers and drought millets.' },
  { id: 'Laterite soil', name: 'Laterite Soil', hindi: 'लेटराइट मिट्टी', desc: 'Acidic, well-drained plateau soil suitable for cashew, ragi, and plantation spices.' },
  { id: "Don't know", name: "Don't Know", hindi: 'मुझे नहीं पता', desc: 'Not sure? We will run a generalized balanced soil assessment for your district.' },
];

const PREVIOUS_CROPS_LIST = [
  'Rice', 'Wheat', 'Maize', 'Potato', 'Tomato', 'Onion', 'Garlic',
  'Mustard', 'Groundnut', 'Soybean', 'Chickpea', 'Pigeon pea', 'Lentil',
  'Peas', 'Cotton', 'Sugarcane', 'Jute', 'Vegetables', 'Fruits',
  'Other', 'Fallow land', "Don't know"
];

export const CropAdvisorScreen: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step (1 through 7) or 8 for results
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<RecommendationResult | null>(null);

  // Modal for Full Crop Plan details
  const [selectedPlanModal, setSelectedPlanModal] = useState<CropData | null>(null);

  // Accordion state for "Why other crops scored lower"
  const [expandedLowCrops, setExpandedLowCrops] = useState<Record<string, boolean>>({});

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wizard Form Inputs
  const [inputs, setInputs] = useState<CropAdvisorInputs>({
    state: 'Telangana',
    district: 'Kothapet / Rangareddy',
    village: 'Kothapet Village',
    soilType: 'Loamy',
    fertility: 'Fertile',
    waterlogging: 'Rarely-Never',
    waterRetention: 'Balanced',
    waterLevel: 'Moderate',
    waterSource: 'Groundwater/Tube well',
    irrigationAvailability: '2-3 times a week',
    season: 'Kharif',
    sowingMonth: 'June',
    temperature: 'Moderate',
    expectedRainfall: 'Moderate',
    recentWeather: 'Normal',
    previousCrop: 'Rice',
    priority: 'Higher income',
    landArea: 2.5,
    landUnit: 'acre',
  });

  // Previous crop search filter
  const [previousCropSearch, setPreviousCropSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Step Validation to enable "Next"
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!inputs.state && !!inputs.district;
      case 2:
        return !!inputs.soilType;
      case 3:
        return !!inputs.fertility && !!inputs.waterlogging && !!inputs.waterRetention;
      case 4:
        return !!inputs.waterLevel && !!inputs.waterSource && !!inputs.irrigationAvailability;
      case 5:
        return !!inputs.season && !!inputs.sowingMonth && !!inputs.temperature && !!inputs.expectedRainfall && !!inputs.recentWeather;
      case 6:
        return !!inputs.previousCrop;
      case 7:
        return !!inputs.priority && inputs.landArea > 0;
      default:
        return true;
    }
  }, [currentStep, inputs]);

  // Handle final submission to compute recommendation
  const handleCalculateRecommendations = async () => {
    setIsAnalyzing(true);

    // Call backend ML model in parallel
    try {
      const tempVal = inputs.temperature?.includes('Hot') ? 34.0 : inputs.temperature?.includes('Cool') ? 18.0 : 26.5;
      const rainVal = inputs.expectedRainfall?.includes('Heavy') ? 220.0 : inputs.expectedRainfall?.includes('Scanty') ? 65.0 : 120.0;
      const phVal = inputs.soilType?.includes('Black') ? 7.8 : inputs.soilType?.includes('Red') ? 6.2 : inputs.soilType?.includes('Laterite') ? 5.4 : 6.8;
      const nVal = inputs.fertility?.includes('Fertile') ? 85.0 : inputs.fertility?.includes('Low') ? 35.0 : 60.0;

      await advisoryApi.getCropRecommendation({
        nitrogen: nVal,
        phosphorus: 45.0,
        potassium: 40.0,
        temperature: tempVal,
        humidity: 72.0,
        ph: phVal,
        rainfall: rainVal,
      });
    } catch (err) {
      console.warn('Backend ML crop-recommendation fallback:', err);
    }

    const computed = calculateCropRecommendations(inputs);
    setResults(computed);
    setIsAnalyzing(false);
    setCurrentStep(8); // Results view
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setResults(null);
  };

  const toggleLowCropAccordion = (cropId: string) => {
    setExpandedLowCrops((prev) => ({
      ...prev,
      [cropId]: !prev[cropId],
    }));
  };

  // ──────────────────────────────────────────────────────────
  // RENDER STEP CONTENT
  // ──────────────────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      // ── STEP 1: Location ──────────────────────────────────
      case 1: {
        const availableDistricts = INDIAN_STATES_DISTRICTS[inputs.state] || [];
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Where is your farmland located?</h2>
              <p className="text-sm text-slate-500 mt-1">
                This helps us understand your local growing conditions, soil agro-climatic zone, and regional rainfall patterns.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State *</label>
                <select
                  value={inputs.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    const newDists = INDIAN_STATES_DISTRICTS[newState] || [];
                    setInputs((prev) => ({
                      ...prev,
                      state: newState,
                      district: newDists[0] || '',
                    }));
                  }}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">District *</label>
                <select
                  value={inputs.district}
                  onChange={(e) => setInputs((prev) => ({ ...prev, district: e.target.value }))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Village / Mandal (Optional)</label>
                <input
                  type="text"
                  value={inputs.village || ''}
                  placeholder="e.g. Kothapet, Ward 4"
                  onChange={(e) => setInputs((prev) => ({ ...prev, village: e.target.value }))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Defaulted to your saved profile location: {inputs.district}, {inputs.state}.</span>
              </div>
            </div>
          </div>
        );
      }

      // ── STEP 2: Soil Type ─────────────────────────────────
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">What type of soil do you have?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select the option that best describes the texture and feel of your field.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SOIL_TYPES.map((soil) => {
                const isSelected = inputs.soilType === soil.id;
                return (
                  <button
                    key={soil.id}
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, soilType: soil.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-[#DCFCE7] shadow-xs ring-1 ring-primary'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold text-base ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {soil.name}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700/80 mb-1">{soil.hindi}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{soil.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      // ── STEP 3: Soil Condition ────────────────────────────
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Tell us about your soil condition</h2>
              <p className="text-sm text-slate-500 mt-1">
                These practical indicators tell us how well your land drains water and sustains plant vigor.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-6">
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  1. How would you describe your soil fertility?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Very fertile', 'Fertile', 'Average', 'Less fertile', "Don't know"].map((opt) => {
                    const isSelected = inputs.fertility === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, fertility: opt }))}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-primary shadow-xs ring-1 ring-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2 */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  2. Does your field usually have waterlogging (standing water)?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Frequently', 'Sometimes', 'Rarely-Never', "Don't know"].map((opt) => {
                    const isSelected = inputs.waterlogging === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, waterlogging: opt }))}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-primary shadow-xs ring-1 ring-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3 */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  3. How well does your soil retain water after irrigation/rain?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Holds water long', 'Balanced', 'Dries quickly', "Don't know"].map((opt) => {
                    const isSelected = inputs.waterRetention === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, waterRetention: opt }))}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-primary shadow-xs ring-1 ring-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      // ── STEP 4: Water Availability ────────────────────────
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Water & Irrigation Availability</h2>
              <p className="text-sm text-slate-500 mt-1">
                Crop water needs vary widely — choosing an appropriate crop avoids mid-season drought loss.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-6">
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  1. How much water is available for irrigation throughout the season?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Very low', 'Low', 'Moderate', 'High', 'Very high'].map((lvl) => {
                    const isSelected = inputs.waterLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, waterLevel: lvl }))}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-primary shadow-xs ring-1 ring-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2 */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  2. What is your main water source?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Rainfall', icon: '🌧️', label: 'Rainfall only' },
                    { id: 'Canal', icon: '🌊', label: 'Canal' },
                    { id: 'Pond', icon: '💧', label: 'Farm Pond' },
                    { id: 'River', icon: '🏞️', label: 'River / Stream' },
                    { id: 'Groundwater/Tube well', icon: '⚡', label: 'Borewell / Tube well' },
                    { id: 'Other', icon: '🚰', label: 'Other' },
                  ].map((src) => {
                    const isSelected = inputs.waterSource === src.id;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, waterSource: src.id }))}
                        className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-emerald-950 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span className="text-xl">{src.icon}</span>
                        <span className="text-xs sm:text-sm">{src.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3 */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-2.5">
                  3. How frequently can you irrigate your field?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['No regular irrigation', 'Once a week or less', '2-3 times a week', 'Frequent', 'Regular-controlled'].map((frq) => {
                    const isSelected = inputs.irrigationAvailability === frq;
                    return (
                      <button
                        key={frq}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, irrigationAvailability: frq }))}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#DCFCE7] border-primary text-primary shadow-xs ring-1 ring-primary'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {frq}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      // ── STEP 5: Season & Weather ──────────────────────────
      case 5: {
        const seasonsList = [
          { id: 'Kharif', label: 'Kharif / Monsoon', icon: '🌧️', period: 'June – October', desc: 'Rainy season staples like Paddy, Maize, Cotton, Soybean' },
          { id: 'Rabi', label: 'Rabi / Winter', icon: '❄️', period: 'October – March', desc: 'Cool winter crops like Wheat, Chickpea, Mustard, Potato' },
          { id: 'Zaid', label: 'Zaid / Summer', icon: '☀️', period: 'March – June', desc: 'Short summer catch-crops like Moong, Cucumber, Watermelon' },
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Season & Weather Forecast</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your planned sowing timeframe. We have highlighted the current active seasonal cycle.
              </p>
            </div>

            {/* Season Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {seasonsList.map((sn) => {
                const isSelected = inputs.season === sn.id;
                return (
                  <button
                    key={sn.id}
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, season: sn.id as 'Kharif' | 'Rabi' | 'Zaid' }))}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-[#DCFCE7] shadow-xs ring-1 ring-primary'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{sn.icon}</div>
                      <div className={`font-bold text-base ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {sn.label}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700/80 mb-1.5">{sn.period}</div>
                      <p className="text-xs text-slate-600 leading-snug">{sn.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Secondary Season Parameters */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expected Sowing Month *</label>
                  <select
                    value={inputs.sowingMonth}
                    onChange={(e) => setInputs((prev) => ({ ...prev, sowingMonth: e.target.value }))}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current / Expected Temperature</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Cool', 'Moderate', 'Hot', 'Very hot', "Don't know"].map((t) => {
                      const isSel = inputs.temperature === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setInputs((prev) => ({ ...prev, temperature: t }))}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                            isSel
                              ? 'bg-[#DCFCE7] border-primary text-primary font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expected Seasonal Rainfall</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Very low', 'Low', 'Moderate', 'High', 'Very high', "Don't know"].map((rf) => {
                      const isSel = inputs.expectedRainfall === rf;
                      return (
                        <button
                          key={rf}
                          type="button"
                          onClick={() => setInputs((prev) => ({ ...prev, expectedRainfall: rf }))}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                            isSel
                              ? 'bg-[#DCFCE7] border-primary text-primary font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {rf}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recent Weather in your Area</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mostly dry', 'Normal', 'Heavy rainfall', 'Unusually hot', 'Unusually cold'].map((rw) => {
                      const isSel = inputs.recentWeather === rw;
                      return (
                        <button
                          key={rw}
                          type="button"
                          onClick={() => setInputs((prev) => ({ ...prev, recentWeather: rw }))}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                            isSel
                              ? 'bg-[#DCFCE7] border-primary text-primary font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {rw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ── STEP 6: Previous Crop ─────────────────────────────
      case 6: {
        const filteredCrops = PREVIOUS_CROPS_LIST.filter((c) =>
          c.toLowerCase().includes(previousCropSearch.toLowerCase())
        );

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">What crop was grown here previously?</h2>
              <p className="text-sm text-slate-500 mt-1">
                This helps us recommend better crop rotation to break pest cycles, prevent soil exhaustion, and build organic matter.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search previous crop (e.g. Rice, Wheat, Cotton, Tomato)..."
                  value={previousCropSearch}
                  onChange={(e) => setPreviousCropSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Grid of previous crop options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredCrops.map((cName) => {
                  const isSelected = inputs.previousCrop === cName;
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, previousCrop: cName }))}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#DCFCE7] border-primary text-emerald-950 font-bold shadow-xs ring-1 ring-primary'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-xs sm:text-sm truncate">{cName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Crop Rotation Rule:</strong> Rotating nitrogen-fixing pulses (Chickpea/Moong) after cereals (Rice/Wheat) boosts soil health and cuts fertilizer expenses by up to 25%.
                </span>
              </div>
            </div>
          </div>
        );
      }

      // ── STEP 7: Priority & Land Area ──────────────────────
      case 7: {
        const priorities = [
          { id: 'Higher income', title: 'Higher Income', hindi: 'अधिक आय', icon: '💰', desc: 'Focus on high-value cash crops, spices, and vegetables with premium wholesale rates.' },
          { id: 'Less water', title: 'Less Water', hindi: 'कम पानी', icon: '💧', desc: 'Drought-hardy millets, oilseeds, or deep-rooted pulses with minimal irrigation dependence.' },
          { id: 'Faster harvest', title: 'Faster Harvest', hindi: 'जल्दी कटाई', icon: '⏱️', desc: 'Quick 60–80 day maturity crops for quick cash flow and multi-season turnover.' },
          { id: 'Lower disease-pest risk', title: 'Lower Disease & Pest Risk', hindi: 'कम रोग-कीट जोखिम', icon: '🛡️', desc: 'Resilient varieties requiring minimal chemical spraying and lower risk of crop failure.' },
          { id: 'Better soil health', title: 'Better Soil Health', hindi: 'बेहतर मिट्टी स्वास्थ्य', icon: '🌱', desc: 'Leguminous pulses that fix biological nitrogen and build humus for future seasons.' },
          { id: 'Balanced option', title: 'Balanced Option', hindi: 'संतुलित विकल्प', icon: '⚖️', desc: 'Dependable staple crops balancing risk, water use, and assured market realization.' },
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">What is most important to you?</h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your primary goal so our scoring model can tailor recommendations to your specific needs.
              </p>
            </div>

            {/* Priority Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorities.map((pr) => {
                const isSelected = inputs.priority === pr.id;
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, priority: pr.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-[#DCFCE7] shadow-xs ring-1 ring-primary'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-1.5">{pr.icon}</div>
                      <div className={`font-bold text-sm sm:text-base ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {pr.title}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700/80 mb-1">{pr.hindi}</div>
                      <p className="text-xs text-slate-600 leading-snug">{pr.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Land Area Input */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs">
              <label className="block text-sm font-bold text-slate-800 mb-2">Planned Land Area for this Sowing</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.landArea}
                  onChange={(e) => setInputs((prev) => ({ ...prev, landArea: parseFloat(e.target.value) || 0 }))}
                  className="w-2/3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 2.5"
                />
                <select
                  value={inputs.landUnit}
                  onChange={(e) => setInputs((prev) => ({ ...prev, landUnit: e.target.value }))}
                  className="w-1/3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="bigha">Bigha</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ──────────────────────────────────────────────────────────
  // RESULTS VIEW (Step 8)
  // ──────────────────────────────────────────────────────────

  const renderResultsView = () => {
    if (!results) return null;
    const { topCrop, otherSuitable, lowerScoring } = results;

    const getBadgeColor = (score: number) => {
      if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      if (score >= 65) return 'bg-amber-100 text-amber-800 border-amber-300';
      return 'bg-rose-100 text-rose-800 border-rose-300';
    };

    return (
      <div className="space-y-7 animate-in fade-in duration-300 pb-12">
        {/* Header with Title & Disclaimer */}
        <div className="bg-white p-6 rounded-2xl border border-farmBorder shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary-tint text-primary">
                  <Compass className="w-5 h-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Your Crop Recommendations</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Ranked according to your {inputs.soilType}, {inputs.waterLevel.toLowerCase()} water supply, {inputs.season} season, and previous {inputs.previousCrop} crop.
              </p>
            </div>

            {/* Amber disclaimer pill */}
            <div className="self-start sm:self-center px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-800 flex items-center gap-1.5 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Demo recommendation based on simulated agricultural knowledge base</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            1. TOP RECOMMENDED CROP HERO CARD
           ======================================================== */}
        <div className="bg-white rounded-2xl border-2 border-primary/40 shadow-md overflow-hidden relative">
          {/* Top green accent border strip */}
          <div className="h-2.5 bg-gradient-to-r from-primary via-emerald-500 to-green-600" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Top row: Emoji, Name, Suitability Ring */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-4xl shadow-xs">
                  {topCrop.crop.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-tint px-2.5 py-0.5 rounded-full">
                      #1 Top Match
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({topCrop.crop.hindiName})</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                    {topCrop.crop.name}
                  </h2>
                  <p className="text-xs text-slate-500">{topCrop.crop.category} • Family: {topCrop.crop.family}</p>
                </div>
              </div>

              {/* Large Suitability Badge */}
              <div className="flex items-center gap-3 self-start sm:self-center bg-emerald-50 border-2 border-emerald-400/50 rounded-2xl p-3.5 px-5">
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight leading-none">
                    {topCrop.overallScore}%
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mt-1">
                    Highly Suitable
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Expected Timeline Mini-Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Sowing Window</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{topCrop.crop.sowingPeriod}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Growth Duration</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{topCrop.crop.durationDaysRange}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Water Requirement</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{topCrop.crop.waterRequirement}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Crop? Checklist */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Why this crop?</span>
                <span className="text-xs font-normal text-slate-500 lowercase">(rule-based scoring breakdown)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { icon: '🌱', label: 'Soil Compatibility', breakdown: topCrop.breakdown.soil },
                  { icon: '💧', label: 'Water Availability', breakdown: topCrop.breakdown.water },
                  { icon: '🌦️', label: 'Weather & Temp', breakdown: topCrop.breakdown.weather },
                  { icon: '📅', label: 'Seasonal Alignment', breakdown: topCrop.breakdown.season },
                  { icon: '🔄', label: 'Previous Crop Rotation', breakdown: topCrop.breakdown.rotation },
                  { icon: '⏱️', label: 'Harvest Timeline Fit', breakdown: topCrop.breakdown.duration },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs hover:border-emerald-200 transition-colors"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                          {item.breakdown.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.breakdown.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Things to Watch (Warnings & Pests) */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Important Things to Watch During Cultivation</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900/90 list-disc list-inside">
                {topCrop.crop.diseasePestRisks.map((risk, i) => (
                  <li key={i} className="leading-relaxed font-medium">{risk}</li>
                ))}
                {topCrop.crop.commonPests.slice(0, 2).map((pest, i) => (
                  <li key={`p-${i}`} className="leading-relaxed font-medium">Scout regularly for {pest}</li>
                ))}
              </ul>
            </div>

            {/* CTA: View Full Crop Plan */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanModal(topCrop.crop)}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-cta hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Full Crop Plan</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. OTHER SUITABLE OPTIONS (3-4 Cards in a Row)
           ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Other Suitable Options</h3>
            <span className="text-xs text-slate-500 font-medium">Alternative viable crops for your field</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {otherSuitable.map((opt) => (
              <div
                key={opt.crop.id}
                className="bg-white p-4 rounded-2xl border border-farmBorder shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl">{opt.crop.emoji}</span>
                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${getBadgeColor(opt.overallScore)}`}>
                      {opt.overallScore}%
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{opt.crop.name}</h4>
                  <div className="text-[11px] text-emerald-700 font-semibold mb-1.5">{opt.crop.hindiName}</div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {opt.breakdown.rotation.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">{opt.crop.durationDaysRange}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(opt.crop)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            3. LOW-SUITABILITY EXPLANATION SECTION (Expandable)
           ======================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-farmBorder shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Why other crops scored lower</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any crop to inspect the limiting factors and better alternatives</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {lowerScoring.length} crops
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {lowerScoring.map((low) => {
              const isExpanded = !!expandedLowCrops[low.crop.id];
              return (
                <div
                  key={low.crop.id}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50"
                >
                  <button
                    type="button"
                    onClick={() => toggleLowCropAccordion(low.crop.id)}
                    className="w-full p-3.5 px-4 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{low.crop.emoji}</span>
                      <div>
                        <span className="text-sm font-bold text-slate-800">{low.crop.name}</span>
                        <span className="text-xs text-slate-500 ml-1.5">({low.crop.hindiName})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        {low.overallScore}% Suitable
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        {low.lowScoreReasons?.map((r, i) => (
                          <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>

                      {low.betterAlternatives && (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Recommended Alternatives:</strong> {low.betterAlternatives.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            4. HARVEST TIMELINE VISUAL (For Top Recommended Crop)
           ======================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-farmBorder shadow-xs space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Cultivation & Harvest Timeline — {topCrop.crop.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Approximate lifecycle stages from field preparation through to harvest and grain curing.
            </p>
          </div>

          {/* Connected timeline nodes */}
          <div className="relative pt-3">
            {/* Desktop horizontal flow / Mobile vertical */}
            <div className="hidden md:grid md:grid-cols-6 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

              {topCrop.crop.growthStages.map((stage, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-lg shadow-xs mb-2">
                    {stage.icon}
                  </div>
                  <div className="font-bold text-xs text-slate-800 leading-tight">{stage.stage}</div>
                  <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">{stage.daysRange}</div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 px-1">{stage.desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile Vertical Flow */}
            <div className="md:hidden space-y-4 border-l-2 border-emerald-300 ml-4 pl-4">
              {topCrop.crop.growthStages.map((stage, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[25px] top-0 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center text-xs">
                    {stage.icon}
                  </div>
                  <div className="font-bold text-xs text-slate-800">{stage.stage}</div>
                  <div className="text-[11px] font-semibold text-emerald-700">{stage.daysRange}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Start Over & Save This Plan */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartOver}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Start Over / Modify Answers</span>
          </button>

          <button
            type="button"
            onClick={() => showToast(`Crop Plan for ${topCrop.crop.name} saved to your farm profile ✓`)}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-cta hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <BookmarkCheck className="w-5 h-5 stroke-[2.5]" />
            <span>Save This Plan</span>
          </button>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────
  // MAIN COMPONENT RETURN
  // ──────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      activeTab="crop-advisor"
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-emerald-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Analyzing Spinner Screen */}
      {isAnalyzing ? (
        <div className="min-h-[550px] flex flex-col items-center justify-center text-center p-6 space-y-5 bg-white rounded-3xl border border-farmBorder shadow-xs">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-primary rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Calculating Crop Suitability...</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Analyzing soil texture, water capacity, seasonal temperatures, and previous crop rotation benefits...
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Cross-referencing 36 Indian crop varieties</span>
          </div>
        </div>
      ) : currentStep === 8 ? (
        // Render Results View
        renderResultsView()
      ) : (
        // Render Wizard Shell (Steps 1-7)
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
          {/* Header & Step Tracker */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-farmBorder shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-2 text-primary">
                <Compass className="w-4 h-4" />
                <span>Crop Advisor Wizard</span>
              </div>
              <span>Step {currentStep} of 7</span>
            </div>

            {/* Thin Green Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Step Content */}
          <div>{renderStepContent()}</div>

          {/* Navigation Controls: Back & Next / Finish */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-farmBorder shadow-xs flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all select-none ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                disabled={!isStepValid}
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs select-none ${
                  isStepValid
                    ? 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                    : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isStepValid}
                onClick={handleCalculateRecommendations}
                className={`flex-1 max-w-[280px] py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-cta transition-all select-none ${
                  isStepValid
                    ? 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                    : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Get My Recommendations</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          FULL CROP PLAN MODAL
         ======================================================== */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedPlanModal.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPlanModal.name} — Full Agronomy Guide</h3>
                  <p className="text-xs text-slate-500">{selectedPlanModal.hindiName} • {selectedPlanModal.durationDaysRange}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
              {/* Management Tips */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 text-primary">
                  Essential Field Management Tips
                </h4>
                <ul className="space-y-2 list-disc list-inside bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  {selectedPlanModal.managementTips.map((tip, idx) => (
                    <li key={idx} className="font-medium text-slate-800 leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Disease & Pest Scouting */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 text-amber-700">
                  Targeted Pest & Disease Management
                </h4>
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
                  <div className="text-xs text-slate-700">
                    <strong>Primary Pests:</strong> {selectedPlanModal.commonPests.join(', ')}
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Vulnerabilities:</strong> {selectedPlanModal.diseasePestRisks.join(' • ')}
                  </div>
                </div>
              </div>

              {/* Soil & Nutrition */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
                  Soil Health & Post-Harvest Benefit
                </h4>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedPlanModal.soilHealthBenefit}
                </p>
              </div>

              {/* Lifecycle Milestones */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
                  Key Growth Stages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPlanModal.growthStages.map((st, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-2">
                      <span className="text-base">{st.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-slate-800">{st.stage}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">{st.daysRange}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer text-xs sm:text-sm"
              >
                Close Agronomy Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CropAdvisorScreen;
