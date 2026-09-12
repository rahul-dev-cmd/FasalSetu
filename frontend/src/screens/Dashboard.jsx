import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  CloudSun,
  ShieldAlert,
  Camera,
  UploadCloud,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Wind,
  Thermometer,
  FileText,
  PhoneCall,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ userLanguage = 'en', onBackToOnboarding }) {
  const [mandiFilter, setMandiFilter] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const isHindi = userLanguage === 'hi';

  // Mandi live rates data
  const mandiRates = [
    {
      crop: isHindi ? 'सोयाबीन (Soybean)' : 'Soybean (Yellow)',
      market: isHindi ? 'पुणे मंडी (Pune)' : 'Pune Mandi',
      price: '₹4,850/qtl',
      change: '+₹120',
      trend: 'up',
      min: '₹4,600',
      max: '₹4,950',
    },
    {
      crop: isHindi ? 'गेहूं (Wheat Lokwan)' : 'Wheat (Lokwan)',
      market: isHindi ? 'नासिक मंडी (Nashik)' : 'Nashik Mandi',
      price: '₹2,680/qtl',
      change: '+₹45',
      trend: 'up',
      min: '₹2,550',
      max: '₹2,720',
    },
    {
      crop: isHindi ? 'कपास (Cotton G-Cot)' : 'Cotton (G-Cot)',
      market: isHindi ? 'अकोला मंडी (Akola)' : 'Akola Mandi',
      price: '₹7,200/qtl',
      change: '-₹80',
      trend: 'down',
      min: '₹6,900',
      max: '₹7,350',
    },
    {
      crop: isHindi ? 'प्याज (Red Onion)' : 'Red Onion (Nashik)',
      market: isHindi ? 'लासलगांव (Lasalgaon)' : 'Lasalgaon Mandi',
      price: '₹1,950/qtl',
      change: '+₹150',
      trend: 'up',
      min: '₹1,600',
      max: '₹2,100',
    },
    {
      crop: isHindi ? 'टमाटर (Hybrid Tomato)' : 'Hybrid Tomato',
      market: isHindi ? 'पिंपरी मंडी (Pimpri)' : 'Pimpri Mandi',
      price: '₹1,400/qtl',
      change: '-₹50',
      trend: 'down',
      min: '₹1,200',
      max: '₹1,550',
    },
  ];

  // Weather 5-day forecast
  const forecast = [
    {
      day: isHindi ? 'आज (Today)' : 'Today (Fri)',
      temp: '28°C',
      rain: '10%',
      condition: isHindi ? 'धूप (Sunny)' : 'Sunny & Clear',
      icon: '☀️',
    },
    {
      day: isHindi ? 'कल (Tomorrow)' : 'Tomorrow (Sat)',
      temp: '27°C',
      rain: '65%',
      condition: isHindi ? 'मध्यम वर्षा' : 'Moderate Rain',
      icon: '🌧️',
    },
    {
      day: isHindi ? 'रविवार (Sun)' : 'Sunday',
      temp: '25°C',
      rain: '80%',
      condition: isHindi ? 'तेज बारिश' : 'Heavy Rainfall',
      icon: '⛈️',
    },
    {
      day: isHindi ? 'सोमवार (Mon)' : 'Monday',
      temp: '26°C',
      rain: '30%',
      condition: isHindi ? 'बादल (Cloudy)' : 'Passing Clouds',
      icon: '⛅',
    },
    {
      day: isHindi ? 'मंगलवार (Tue)' : 'Tuesday',
      temp: '29°C',
      rain: '5%',
      condition: isHindi ? 'धूप (Sunny)' : 'Sunny & Clear',
      icon: '☀️',
    },
  ];

  const handleSimulateDiagnosis = () => {
    setDiagnosing(true);
    setTimeout(() => {
      setDiagnosing(false);
      setDiagnosisResult({
        disease: isHindi
          ? 'पीला मोज़ेक वायरस (Yellow Mosaic Virus)'
          : 'Yellow Mosaic Virus (YMV)',
        confidence: '96.2%',
        severity: isHindi ? 'मध्यम (Moderate)' : 'Moderate (Level 2)',
        treatment: isHindi
          ? 'थियामेथॉक्सम 25% WG @ 80 ग्राम/एकड़ या डाईमेथोएट 30% EC का छिड़काव करें। संक्रमित पौधों को तुरंत अलग करें।'
          : 'Spray Thiamethoxam 25% WG @ 80g/acre or Dimethoate 30% EC to manage whitefly vectors. Uproot and burn severely infected plants.',
        costEst: '₹350 - ₹450 / acre',
      });
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800">
      {/* Top Welcome Header Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span>
                {isHindi ? 'किसान डैशबोर्ड • लाइव अपडेट' : 'Farmer Dashboard • Live Updates'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {isHindi ? 'नमस्ते, रामेश्वर पाटिल जी 👋' : 'Welcome back, Rameshwar Patil 👋'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isHindi
                ? 'ग्राम: मंचर, ता. आंबेगांव, पुणे • 6.5 एकड़ जोत • मुख्य फसल: सोयाबीन व प्याज'
                : 'Village: Manchar, Ambegaon, Pune • 6.5 Acres Holding • Major Crops: Soybean & Onion'}
            </p>
          </div>

          {/* Quick Weather & State Widget */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shadow-inner">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">28°C</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  {isHindi ? 'धूप / साफ मौसम' : 'Sunny / Clear Sky'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />{' '}
                  {isHindi ? '48% आर्द्रता' : '48% Humidity'}
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-400" />{' '}
                  {isHindi ? '12 किमी/घं' : '12 km/h Wind'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Urgent Alert Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-primary-dark to-emerald-700 rounded-2xl p-4 sm:p-6 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isHindi ? 'महत्वपूर्ण कृषि सुरक्षा अलर्ट' : 'Crucial Crop Protection Advisory'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              {isHindi
                ? 'सोयाबीन कीट नियंत्रण एवं आगामी वर्षा परामर्श'
                : 'Soybean Pest Control & Heavy Rainfall Forecast Advisory'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {isHindi
                ? 'पुणे व पश्चिमी महाराष्ट्र में अगले 48 घंटों में मध्यम से भारी वर्षा (65-80% संभावना) का पूर्वानुमान है। फसल पर कीटनाशक या फंगीसाइड का छिड़काव तुरंत रोकें। जलभराव रोकने हेतु नालियां साफ रखें।'
                : 'Moderate to heavy rainfall (65-80% probability) forecasted across Pune and Western Maharashtra over the next 48 hours. Postpone all chemical pesticide or fungicide spraying immediately. Keep field drainage channels clear to prevent water stagnation.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button className="bg-white text-emerald-900 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1">
              <span>{isHindi ? 'विस्तार से पढ़ें' : 'Read Full Advisory'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold px-3 py-2.5 rounded-xl text-xs transition-colors border border-emerald-500/30">
              🔊 {isHindi ? 'ऑडियो सुनें' : 'Listen Audio'}
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {isHindi ? 'मंडी भाव (सोयाबीन)' : 'Mandi Rate (Soybean)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">₹4,850</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isHindi ? '+₹120 आज की बढ़त (पुणे)' : '+₹120 today (Pune APMC)'}</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {isHindi ? 'मिट्टी में नमी' : 'Soil Moisture Index'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              62% ({isHindi ? 'उत्तम' : 'Optimal'})
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {isHindi ? 'अगली सिंचाई: 3 दिन बाद अनुशंसित' : 'Next irrigation recommended in 3 days'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {isHindi ? 'फसल स्वास्थ्य सूचकांक' : 'Crop Health Score'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">89 / 100</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              {isHindi ? 'स्वस्थ स्थिति • कीट प्रकोप निम्न' : 'Healthy condition • Low pest incidence'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {isHindi ? 'सरकारी योजना लाभ' : 'Govt Scheme Benefit'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">PM-Kisan</div>
            <div className="text-xs text-purple-700 font-semibold mt-1">
              {isHindi ? '18वीं किस्त स्वीकृत • ₹2,000' : '18th Installment Approved • ₹2,000'}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live APMC Mandi Rates Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      🌾 {isHindi ? 'लाइव एपीएमसी मंडी भाव' : 'Live APMC Mandi Rates'}
                    </h3>
                    <span className="bg-primary-soft text-primary-dark font-semibold text-xs px-2.5 py-0.5 rounded-full">
                      {isHindi ? 'आज के भाव' : "Today's Prices"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHindi
                      ? 'कृषि उपज मंडी समिति (APMC) से सीधे सत्यापित मूल्य'
                      : 'Verified market prices directly from Agricultural Produce Market Committees'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isHindi ? 'फसल या मंडी खोजें...' : 'Search crop or mandi...'}
                    value={mandiFilter}
                    onChange={(e) => setMandiFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary w-48"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">{isHindi ? 'फसल (Crop)' : 'Crop'}</th>
                      <th className="py-3 px-4">{isHindi ? 'मंडी (Market)' : 'Market (APMC)'}</th>
                      <th className="py-3 px-4">{isHindi ? 'मॉडल भाव' : 'Modal Price'}</th>
                      <th className="py-3 px-4">{isHindi ? 'आज का बदलाव' : "Today's Change"}</th>
                      <th className="py-3 px-4">{isHindi ? 'न्यूनतम - अधिकतम' : 'Min - Max Range'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {mandiRates
                      .filter(
                        (item) =>
                          item.crop.toLowerCase().includes(mandiFilter.toLowerCase()) ||
                          item.market.toLowerCase().includes(mandiFilter.toLowerCase())
                      )
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">{row.crop}</td>
                          <td className="py-3.5 px-4 text-slate-600">{row.market}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">{row.price}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                                row.trend === 'up'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {row.trend === 'up' ? '▲' : '▼'} {row.change}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                            {row.min} - {row.max}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Crop Doctor Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-primary flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      🔬 {isHindi ? 'एआई फसल डॉक्टर' : 'AI Crop Doctor Diagnostics'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isHindi
                        ? 'रोगग्रस्त पौधे या पत्ती की फोटो लें और 3 सेकंड में सटीक इलाज पाएं'
                        : 'Upload a clear photo of an infected leaf or crop to get precise diagnosis in 3 seconds'}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 98.4% Accuracy
                </span>
              </div>

              {/* Upload Card / Tester */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-primary mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isHindi
                    ? 'पत्ती की फोटो अपलोड करें या कैमरा खोलें'
                    : 'Upload Crop Leaf Photo or Tap to Open Camera'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isHindi
                    ? 'सपोर्टेड फॉर्मेट: JPG, PNG • धूप में साफ फोटो खींचें ताकि कीड़े व धब्बे स्पष्ट दिखें'
                    : 'Supported formats: JPG, PNG • Take a photo in bright daylight for optimal pest & fungal detection'}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleSimulateDiagnosis}
                    disabled={diagnosing}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {diagnosing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{isHindi ? 'एआई विश्लेषण जारी है...' : 'AI Analyzing Image...'}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>{isHindi ? 'नमूना फोटो स्कैन करें' : 'Scan Sample Leaf Photo'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Diagnosis Result Card */}
              {diagnosisResult && (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base font-bold text-amber-950">
                        {isHindi ? 'रोग पहचान' : 'Diagnosis'}: {diagnosisResult.disease}
                      </h4>
                    </div>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {diagnosisResult.confidence} Match
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs sm:text-sm text-slate-700">
                    <div>
                      <strong className="text-slate-900">
                        {isHindi ? 'अनुशंसित उपचार (Treatment):' : 'Recommended Treatment:'}
                      </strong>
                      <p className="mt-0.5 text-slate-600 leading-relaxed">
                        {diagnosisResult.treatment}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                      <span>
                        <strong>{isHindi ? 'तीव्रता:' : 'Severity Level:'}</strong>{' '}
                        {diagnosisResult.severity}
                      </span>
                      <span>
                        <strong>{isHindi ? 'अनुमानित लागत:' : 'Estimated Treatment Cost:'}</strong>{' '}
                        {diagnosisResult.costEst}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weather 5-Day Forecast & Helpline */}
          <div className="lg:col-span-4 space-y-6">
            {/* 5-Day Weather Forecast */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isHindi ? '5-दिवसीय मौसम पूर्वानुमान' : '5-Day Weather Forecast'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {isHindi ? 'पुणे वेधशाला' : 'Pune Met Dept'}
                </span>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {forecast.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-slate-800">{item.day}</div>
                        <div className="text-[11px] text-slate-500">{item.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{item.temp}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">
                        {isHindi ? `वर्षा ${item.rain}` : `Rain ${item.rain}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kisan Call Center Helpline */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isHindi ? 'किसान कॉल सेंटर' : 'Kisan Call Center (Helpline)'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isHindi
                      ? 'निःशुल्क 24x7 कृषि विशेषज्ञ सलाह'
                      : 'Free 24x7 Agronomist & Scientist Advisory'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Toll-Free Number
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    1800-180-1551
                  </span>
                </div>
                <a
                  href="tel:18001801551"
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  {isHindi ? 'कॉल करें' : 'Call Now'}
                </a>
              </div>
            </div>

            {/* Quick Switch to Onboarding Language Screen */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                {isHindi ? 'क्या आप भाषा बदलना चाहते हैं?' : 'Need to change language or preferences?'}
              </p>
              <button
                onClick={onBackToOnboarding}
                className="mt-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {isHindi
                    ? '← भाषा चयन स्क्रीन पर लौटें'
                    : '← Return to Language Selection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
