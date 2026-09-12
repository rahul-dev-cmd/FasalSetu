import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Flame,
  Layers,
  ShieldAlert,
  IndianRupee,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  MoveRight,
  X,
  Send,
  Truck,
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import CommandCenterLayout from '../components/CommandCenterLayout';
import {
  hotspots,
  cropFilterOptions,
  riskFilterOptions,
  timeFilterOptions,
  riskLevelStyles,
  type HotspotEntry,
  type RiskLevel,
} from '../data/mockCommandCenterData';
import { governmentApi } from '../services/api';

const mapBackendHotspot = (h: any): HotspotEntry => ({
  id: h.id,
  rank: h.rank,
  district: h.district,
  riskLevel: h.risk_level as RiskLevel,
  crop: h.crop,
  issueType: h.issue_type,
  affectedArea: h.affected_area_label || `${(h.affected_area_ha || 0).toLocaleString('en-IN')} ha`,
  affectedAreaNum: h.affected_area_ha || 0,
  trend: h.trend || 'stable',
  trendDelta: h.trend_delta_label || '0%',
  economicImpactCr: h.economic_impact_cr || 0,
  historicalTrend: h.historical_trend || [60, 65, 70, 75, 80],
  interventions: h.interventions || [],
  recommendedActions: h.recommended_actions || [],
  districtOfficer: h.district_officer || 'District Agricultural Officer',
  contactNumber: h.contact_number || '+91 94401 23456',
  lastAssessment: h.last_assessment || 'Recent',
  satellitePassTime: h.satellite_pass_time || 'Sentinel-2 (Recent)',
});

interface HotspotAnalysisScreenProps {
  onNavChange?: (navId: string) => void;
}

type SortField = 'rank' | 'district' | 'riskLevel' | 'affectedAreaNum';
type SortDirection = 'asc' | 'desc';

export const HotspotAnalysisScreen: React.FC<HotspotAnalysisScreenProps> = ({ onNavChange }) => {
  // ── Hotspots Data from Backend ───────────────────────────────────
  const [allHotspots, setAllHotspots] = useState<HotspotEntry[]>(hotspots);

  // ── Filters ───────────────────────────────────────────────────────
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [riskFilter, setRiskFilter] = useState('All Risks');
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');

  // Load from backend on mount or filter change
  useEffect(() => {
    let isMounted = true;
    const fetchHotspots = async () => {
      try {
        const params: any = {};
        if (cropFilter !== 'All Crops') params.crop = cropFilter;
        if (riskFilter !== 'All Risks') params.risk_level = riskFilter;
        params.time_range = timeFilter === 'Last 7 Days' ? '30d' : timeFilter === 'Last 30 Days' ? '30d' : '60d';

        const data = await governmentApi.getHotspots(params);
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setAllHotspots(data.map(mapBackendHotspot));
        }
      } catch (err) {
        console.warn('Could not fetch backend hotspots, using fallback', err);
      }
    };
    fetchHotspots();
    return () => {
      isMounted = false;
    };
  }, [cropFilter, riskFilter, timeFilter]);

  // ── Sorting ───────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // ── Pagination / Load More ────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // ── Slide-over Modal State ────────────────────────────────────────
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotEntry | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'30d' | '60d' | '90d'>('30d');
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [isAdvisorySent, setIsAdvisorySent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Reset dispatch & advisory state when selecting a different hotspot
  useEffect(() => {
    setIsDispatched(false);
    setIsAdvisorySent(false);
    setTrendPeriod('30d');

    if (selectedHotspot && typeof selectedHotspot.id === 'number') {
      governmentApi.getHotspotDetail(selectedHotspot.id)
        .then((detail) => {
          if (detail) {
            setSelectedHotspot((prev) => (prev ? { ...prev, ...mapBackendHotspot(detail) } : null));
          }
        })
        .catch(() => {});
    }
  }, [selectedHotspot?.id]);

  // ── Filtered & Sorted Hotspots ────────────────────────────────────
  const filteredHotspots = useMemo(() => {
    return allHotspots.filter((h) => {
      if (cropFilter !== 'All Crops' && h.crop !== cropFilter) return false;
      if (riskFilter !== 'All Risks' && h.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [allHotspots, cropFilter, riskFilter]);

  const sortedHotspots = useMemo(() => {
    const list = [...filteredHotspots];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'rank') {
        comparison = a.rank - b.rank;
      } else if (sortField === 'district') {
        comparison = a.district.localeCompare(b.district);
      } else if (sortField === 'riskLevel') {
        const riskWeight: Record<RiskLevel, number> = { High: 3, Medium: 2, Low: 1 };
        comparison = riskWeight[a.riskLevel] - riskWeight[b.riskLevel];
      } else if (sortField === 'affectedAreaNum') {
        comparison = a.affectedAreaNum - b.affectedAreaNum;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredHotspots, sortField, sortDirection]);

  // Sliced for pagination
  const displayedHotspots = useMemo(() => {
    return sortedHotspots.slice(0, visibleCount);
  }, [sortedHotspots, visibleCount]);

  // ── Summary Stat Computations ─────────────────────────────────────
  const stats = useMemo(() => {
    const totalCount = filteredHotspots.length;
    const totalAreaHa = filteredHotspots.reduce((acc, h) => acc + h.affectedAreaNum, 0);
    const uniqueDistricts = new Set(filteredHotspots.map((h) => h.district));
    const highRiskItems = filteredHotspots.filter((h) => h.riskLevel === 'High');
    const highRiskDistricts = Array.from(new Set(highRiskItems.map((h) => h.district)));
    const totalEconImpact = filteredHotspots.reduce((acc, h) => acc + h.economicImpactCr, 0);

    return {
      totalCount,
      totalAreaFormatted: totalAreaHa.toLocaleString('en-IN') + ' hectares',
      districtsCount: uniqueDistricts.size,
      highRiskCount: highRiskItems.length,
      highRiskDistrictsText:
        highRiskDistricts.length > 0
          ? highRiskDistricts.slice(0, 2).join(', ') + (highRiskDistricts.length > 2 ? ` +${highRiskDistricts.length - 2}` : '')
          : 'None detected',
      totalEconImpactFormatted: `₹${totalEconImpact.toFixed(1)} Cr`,
    };
  }, [filteredHotspots]);

  // ── Handle Column Sort ────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'affectedAreaNum' || field === 'riskLevel' ? 'desc' : 'asc');
    }
  };

  // ── Handle Dispatch Field Team ───────────────────────────────────
  const handleDispatch = () => {
    if (!selectedHotspot) return;
    setIsDispatched(true);
    setToastMessage(`✓ Field Response Team dispatched to ${selectedHotspot.district} (ETA: 2 hours)`);
  };

  // ── Handle Send Advisory ─────────────────────────────────────────
  const handleSendAdvisory = () => {
    if (!selectedHotspot) return;
    setIsAdvisorySent(true);
    setToastMessage(
      `✓ Kisan SMS advisory broadcasted to ${selectedHotspot.farmersImpacted.toLocaleString('en-IN')} farmers in ${selectedHotspot.district}`
    );
  };

  // ── Helper: Trend Badge ──────────────────────────────────────────
  const renderTrendBadge = (h: HotspotEntry) => {
    if (h.trend === 'up') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
          <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>{h.trendPercent || 'Trending up'}</span>
        </span>
      );
    }
    if (h.trend === 'down') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <TrendingDown className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>{h.trendPercent || 'Improving'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <MoveRight className="w-3 h-3 stroke-[2.2]" />
        <span>{h.trendPercent || 'Stable'}</span>
      </span>
    );
  };

  // ── Helper: Risk Badge ───────────────────────────────────────────
  const renderRiskBadge = (level: RiskLevel) => {
    const style = riskLevelStyles[level];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
      >
        {level}
      </span>
    );
  };

  // ── SVG Trend Chart Calculations ─────────────────────────────────
  const trendData = selectedHotspot ? selectedHotspot.historicalTrend[trendPeriod] : [];
  const maxHa = trendData.length > 0 ? Math.max(...trendData.map((d) => d.ha)) * 1.15 : 10000;
  const chartPoints = trendData.map((d, index) => {
    const x = trendData.length > 1 ? 40 + (index / (trendData.length - 1)) * 380 : 230;
    const y = 160 - (d.ha / maxHa) * 120;
    return { x, y, ha: d.ha, label: d.label };
  });

  const pathD =
    chartPoints.length > 0
      ? chartPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
      : '';

  const areaD =
    chartPoints.length > 0
      ? `${pathD} L ${chartPoints[chartPoints.length - 1].x} 165 L ${chartPoints[0].x} 165 Z`
      : '';

  return (
    <CommandCenterLayout activeNav="hotspots" onNavChange={onNavChange}>
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        {/* ═══════════════════════════════════════════════════════════
            TOAST ALERT BANNER
           ═══════════════════════════════════════════════════════════ */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            HEADER ROW
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-farmText-dark tracking-tight leading-tight">
              Hotspot Analysis
            </h2>
            <p className="text-[13px] text-farmText-gray mt-1">
              Detailed view of high-risk zones across Telangana
            </p>
          </div>

          {/* Right-aligned Filter Row (matching Risk Map screen) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Crop Filter */}
            <select
              value={cropFilter}
              onChange={(e) => {
                setCropFilter(e.target.value);
                setVisibleCount(8);
              }}
              className="text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {cropFilterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setVisibleCount(8);
              }}
              className="text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {riskFilterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {timeFilterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SUMMARY STAT CARDS ROW (4 cards, horizontal, equal width)
           ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Hotspots */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Total Hotspots
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Flame className="w-4 h-4 text-slate-700 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                {stats.totalCount}
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                active markers
              </p>
            </div>
          </div>

          {/* Card 2: Total Affected Area */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Total Affected Area
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Layers className="w-4 h-4 text-blue-600 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                {cropFilter === 'All Crops' && riskFilter === 'All Risks'
                  ? '38,100 hectares'
                  : stats.totalAreaFormatted}
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                across {stats.districtsCount} districts
              </p>
            </div>
          </div>

          {/* Card 3: High Risk Zones */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                High Risk Zones
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <ShieldAlert className="w-4 h-4 text-red-600 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-[#EF4444] tracking-tight leading-none">
                {cropFilter === 'All Crops' && riskFilter === 'All Risks' ? '2' : stats.highRiskCount}
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5 truncate">
                {cropFilter === 'All Crops' && riskFilter === 'All Risks'
                  ? 'Nalgonda, Warangal'
                  : stats.highRiskDistrictsText}
              </p>
            </div>
          </div>

          {/* Card 4: Est. Economic Impact */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Est. Economic Impact
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <IndianRupee className="w-4 h-4 text-amber-600 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-[#F59E0B] tracking-tight leading-none">
                {stats.totalEconImpactFormatted}
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                potential crop loss
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN HOTSPOT TABLE / LIST CARD
           ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                Identified High-Risk Hotspots
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {filteredHotspots.length} active
              </span>
            </div>
            <div className="text-[12px] text-farmText-muted">
              Click headers to sort table
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                  {/* Rank */}
                  <th
                    className="py-3 px-4 text-center w-14 cursor-pointer select-none hover:text-farmText-dark"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>Rank</span>
                      {sortField === 'rank' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>

                  {/* District (Sortable) */}
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-farmText-dark transition-colors"
                    onClick={() => handleSort('district')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>District</span>
                      {sortField === 'district' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Crop */}
                  <th className="py-3 px-4">Crop</th>

                  {/* Issue Type */}
                  <th className="py-3 px-4">Issue Type</th>

                  {/* Risk Level (Sortable) */}
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-farmText-dark transition-colors"
                    onClick={() => handleSort('riskLevel')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Risk Level</span>
                      {sortField === 'riskLevel' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Affected Area (Sortable) */}
                  <th
                    className="py-3 px-4 cursor-pointer select-none group hover:text-farmText-dark transition-colors"
                    onClick={() => handleSort('affectedAreaNum')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Affected Area</span>
                      {sortField === 'affectedAreaNum' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Trend */}
                  <th className="py-3 px-4">Trend</th>

                  {/* Action */}
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-[13px]">
                {displayedHotspots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-farmText-muted text-sm">
                      No hotspots match the selected filters.
                    </td>
                  </tr>
                ) : (
                  displayedHotspots.map((h, idx) => (
                    <tr
                      key={h.id}
                      className={`
                        transition-colors hover:bg-slate-50/90
                        ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}
                      `}
                    >
                      {/* Rank Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center mx-auto shadow-2xs">
                          {h.rank}
                        </div>
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-farmText-dark text-[13px]">
                          {h.district}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {h.mandalsCount} mandals affected
                        </div>
                      </td>

                      {/* Crop */}
                      <td className="py-3.5 px-4 font-semibold text-farmText-dark">
                        {h.crop}
                      </td>

                      {/* Issue Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-700">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              h.issueType === 'Disease'
                                ? 'bg-red-500'
                                : h.issueType === 'Pest'
                                ? 'bg-amber-500'
                                : h.issueType === 'Water Stress'
                                ? 'bg-blue-500'
                                : h.issueType === 'Waterlogging'
                                ? 'bg-purple-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{h.issueType}</span>
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-4">
                        {renderRiskBadge(h.riskLevel)}
                      </td>

                      {/* Affected Area */}
                      <td className="py-3.5 px-4 font-bold text-farmText-dark">
                        {h.affectedArea}
                      </td>

                      {/* Trend */}
                      <td className="py-3.5 px-4">
                        {renderTrendBadge(h)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedHotspot(h)}
                          className="px-3.5 py-1.5 text-[12px] font-semibold text-primary hover:text-white bg-primary/8 hover:bg-primary border border-primary/20 hover:border-primary rounded-lg transition-all duration-150 cursor-pointer shadow-2xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
            <span className="text-farmText-gray font-medium">
              Showing <strong className="text-farmText-dark">{displayedHotspots.length}</strong> of{' '}
              <strong className="text-farmText-dark">{sortedHotspots.length}</strong> hotspots
            </span>

            {sortedHotspots.length > 8 && (
              <div className="flex items-center gap-2">
                {visibleCount < sortedHotspots.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 9, sortedHotspots.length))}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[12px]"
                  >
                    Load More ({sortedHotspots.length - visibleCount} remaining)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(8)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[12px]"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE-OVER DETAIL PANEL / MODAL
         ═══════════════════════════════════════════════════════════ */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedHotspot(null)}
          />

          {/* Slide-over Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Panel Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/60 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                      {selectedHotspot.rank}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Hotspot Zone #{selectedHotspot.rank}
                    </span>
                    {renderRiskBadge(selectedHotspot.riskLevel)}
                  </div>
                  <h3 className="text-xl font-bold text-farmText-dark tracking-tight">
                    {selectedHotspot.district} District
                  </h3>
                  <p className="text-xs text-farmText-gray font-medium mt-0.5">
                    {selectedHotspot.crop} · {selectedHotspot.issueType} · Telangana
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Scrollable Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* ── District Map Thumbnail & Coordinates ── */}
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      District Zone Map Thumbnail
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Zone Coords: ({selectedHotspot.mapPosition.x}%, {selectedHotspot.mapPosition.y}%)
                    </span>
                  </div>

                  {/* Visual Map Canvas */}
                  <div className="relative h-44 w-full bg-slate-100/90 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* State boundary background watermark */}
                      <path
                        d="M 15,5 Q 30,2 50,5 Q 70,2 85,8 Q 92,15 90,30 Q 93,45 88,55 Q 85,65 78,75 Q 70,82 60,85 Q 50,90 40,85 Q 30,82 22,75 Q 15,65 12,55 Q 8,45 10,30 Q 8,15 15,5 Z"
                        fill="#F1F5F9"
                        stroke="#CBD5E1"
                        strokeWidth="0.8"
                      />

                      {/* District focus bounding box */}
                      <rect
                        x={selectedHotspot.mapPosition.x - 10}
                        y={selectedHotspot.mapPosition.y - 8}
                        width="20"
                        height="16"
                        rx="2"
                        className={
                          selectedHotspot.riskLevel === 'High'
                            ? 'fill-red-100/90 stroke-red-400'
                            : selectedHotspot.riskLevel === 'Medium'
                            ? 'fill-amber-100/90 stroke-amber-400'
                            : 'fill-emerald-100/90 stroke-emerald-400'
                        }
                        strokeWidth="0.6"
                      />

                      {/* Pulsing Radar Ring */}
                      <circle
                        cx={selectedHotspot.mapPosition.x}
                        cy={selectedHotspot.mapPosition.y}
                        r="6"
                        fill="none"
                        stroke={
                          selectedHotspot.riskLevel === 'High'
                            ? '#EF4444'
                            : selectedHotspot.riskLevel === 'Medium'
                            ? '#F59E0B'
                            : '#16A34A'
                        }
                        strokeWidth="0.6"
                        opacity="0.4"
                      >
                        <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                      </circle>

                      {/* Marker Center Dot */}
                      <circle
                        cx={selectedHotspot.mapPosition.x}
                        cy={selectedHotspot.mapPosition.y}
                        r="2.5"
                        fill={
                          selectedHotspot.riskLevel === 'High'
                            ? '#EF4444'
                            : selectedHotspot.riskLevel === 'Medium'
                            ? '#F59E0B'
                            : '#16A34A'
                        }
                        stroke="#FFFFFF"
                        strokeWidth="0.6"
                      />

                      {/* Text label */}
                      <text
                        x={selectedHotspot.mapPosition.x}
                        y={selectedHotspot.mapPosition.y + 6}
                        textAnchor="middle"
                        fontSize="3.2"
                        fontWeight="bold"
                        fill="#1E293B"
                      >
                        {selectedHotspot.district}
                      </text>
                    </svg>

                    {/* Overlay badge */}
                    <div className="absolute bottom-2 left-2 bg-white/95 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs border border-slate-200">
                      High-Resolution Satellite Radar: Active
                    </div>
                  </div>

                  {/* Mandals affected list */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Key Mandals:</span>
                    {selectedHotspot.mandalsList.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Key Metrics Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Affected Area</span>
                    <div className="text-[15px] font-bold text-farmText-dark mt-0.5">
                      {selectedHotspot.affectedArea}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Registered Farmers</span>
                    <div className="text-[15px] font-bold text-farmText-dark mt-0.5">
                      {selectedHotspot.farmersImpacted.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Economic Impact</span>
                    <div className="text-[15px] font-bold text-amber-600 mt-0.5">
                      ₹{selectedHotspot.economicImpactCr} Cr
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Trajectory</span>
                    <div className="mt-0.5">{renderTrendBadge(selectedHotspot)}</div>
                  </div>
                </div>

                {/* ── Historical Trend Chart (30/60/90 Days) ── */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-[13px] font-bold text-farmText-dark flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Historical Affected Area Trend
                      </h4>
                      <p className="text-[11px] text-farmText-muted">Hectares recorded over surveillance period</p>
                    </div>

                    {/* Period Tabs */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                      {(['30d', '60d', '90d'] as const).map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setTrendPeriod(period)}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            trendPeriod === period
                              ? 'bg-white text-primary shadow-2xs font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {period === '30d' ? '30 Days' : period === '60d' ? '60 Days' : '90 Days'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative h-44 w-full bg-slate-50/70 rounded-lg border border-slate-100 p-2">
                    <svg viewBox="0 0 440 180" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="420" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="0.8" />
                      <line x1="40" y1="80" x2="420" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="0.8" />
                      <line x1="40" y1="130" x2="420" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="0.8" />
                      <line x1="40" y1="165" x2="420" y2="165" stroke="#CBD5E1" strokeWidth="1" />

                      {/* Y-axis labels */}
                      <text x="34" y="34" textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="600">
                        {Math.round(maxHa * 0.9).toLocaleString('en-IN')}
                      </text>
                      <text x="34" y="84" textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="600">
                        {Math.round(maxHa * 0.55).toLocaleString('en-IN')}
                      </text>
                      <text x="34" y="134" textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="600">
                        {Math.round(maxHa * 0.2).toLocaleString('en-IN')}
                      </text>

                      {/* Area Fill */}
                      <path d={areaD} fill="url(#chartGradient)" />

                      {/* Line Stroke */}
                      <path d={pathD} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Data Point Circles & Tooltips */}
                      {chartPoints.map((pt, i) => (
                        <g key={i} className="cursor-pointer group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#FFFFFF"
                            stroke="#16A34A"
                            strokeWidth="2"
                            className="transition-transform group-hover:scale-125"
                          />
                          {/* Value tag on hover / default */}
                          <text
                            x={pt.x}
                            y={pt.y - 9}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#1E293B"
                          >
                            {pt.ha.toLocaleString('en-IN')}
                          </text>
                          {/* X-axis label */}
                          <text
                            x={pt.x}
                            y="176"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#64748B"
                            fontWeight="500"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* ── Recommended Interventions List ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-bold text-farmText-dark flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recommended Interventions
                    </h4>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {selectedHotspot.interventionsList.length} Action Items
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedHotspot.interventionsList.map((action, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-lg p-3 border border-slate-200 flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-[12px] text-farmText-dark leading-relaxed font-medium">
                          {action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel Footer / Action Buttons */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {/* Send Advisory Button */}
                  <button
                    type="button"
                    disabled={isAdvisorySent}
                    onClick={handleSendAdvisory}
                    className={`
                      px-3.5 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs
                      ${
                        isAdvisorySent
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    {isAdvisorySent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Advisory Broadcasted</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Advisory</span>
                      </>
                    )}
                  </button>

                  {/* Dispatch Field Team Button */}
                  <button
                    type="button"
                    disabled={isDispatched}
                    onClick={handleDispatch}
                    className={`
                      px-4 py-2 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs
                      ${
                        isDispatched
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary hover:bg-primary-dark text-white'
                      }
                    `}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Team Dispatched</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        <span>Dispatch Field Team</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CommandCenterLayout>
  );
};

export default HotspotAnalysisScreen;
