import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import CommandCenterLayout from '../components/CommandCenterLayout';
import HotspotAnalysisScreen from './HotspotAnalysisScreen';
import ReportsScreen from './ReportsScreen';
import InterventionsScreen from './InterventionsScreen';
import SettingsScreen from './SettingsScreen';
import {
  hotspots,
  mapMarkers,
  districtZones,
  legendCategories,
  cropFilterOptions,
  riskFilterOptions,
  timeFilterOptions,
  riskLevelStyles,
  markerSizeMap,
  type RiskCategory,
  type RiskLevel,
  type MapMarker,
} from '../data/mockCommandCenterData';

// ── Popup Data Shape ──────────────────────────────────────────────
interface PopupData {
  marker: MapMarker;
  screenX: number;
  screenY: number;
}

export interface GovernmentDashboardScreenProps {
  initialNav?: string;
  onNavChange?: (navId: string) => void;
}

export default function GovernmentDashboardScreen({
  initialNav = 'risk-map',
  onNavChange,
}: GovernmentDashboardScreenProps = {}) {
  // ── Filter State ──
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [riskFilter, setRiskFilter] = useState('All Risks');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');

  // ── Legend Toggle State ──
  const [legendToggles, setLegendToggles] = useState<Record<RiskCategory, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    legendCategories.forEach((cat) => { initial[cat.id] = cat.defaultOn; });
    return initial as Record<RiskCategory, boolean>;
  });

  // ── Active Marker / Popup ──
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);

  // ── Highlighted hotspot (from clicking Top Hotspots list) ──
  const [highlightedDistrict, setHighlightedDistrict] = useState<string | null>(null);

  // ── Nav state (for sidebar) ──
  const [activeNav, setActiveNav] = useState(initialNav);

  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
    }
  }, [initialNav]);

  const handleNavChange = (navId: string) => {
    setActiveNav(navId);
    onNavChange?.(navId);
  };

  // ── Filtered Markers ──
  const filteredMarkers = useMemo(() => {
    return mapMarkers.filter((m) => {
      // Legend toggle
      if (!legendToggles[m.category]) return false;
      // Crop filter
      if (cropFilter !== 'All Crops' && m.crop !== cropFilter) return false;
      // Risk filter
      if (riskFilter !== 'All Risks' && m.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [legendToggles, cropFilter, riskFilter]);

  // ── Filtered Hotspots ──
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      if (!legendToggles[h.issueType]) return false;
      if (cropFilter !== 'All Crops' && h.crop !== cropFilter) return false;
      if (riskFilter !== 'All Risks' && h.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [legendToggles, cropFilter, riskFilter]);

  // ── Legend Toggle Handler ──
  const toggleLegend = useCallback((categoryId: RiskCategory) => {
    setLegendToggles((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
    setActivePopup(null);
  }, []);

  // ── Marker Click → Popup ──
  const handleMarkerClick = useCallback((marker: MapMarker, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).closest('.zone-map-container')?.getBoundingClientRect();
    if (rect) {
      setActivePopup({
        marker,
        screenX: (marker.x / 100) * rect.width,
        screenY: (marker.y / 100) * rect.height,
      });
    }
    setHighlightedDistrict(marker.district);
  }, []);

  // ── Hotspot Row Click → Highlight Marker ──
  const handleHotspotClick = useCallback((district: string) => {
    setHighlightedDistrict((prev) => (prev === district ? null : district));
    setActivePopup(null);
  }, []);

  // ── Get marker color by category ──
  const getMarkerColor = (category: RiskCategory): string => {
    const cat = legendCategories.find((c) => c.id === category);
    return cat?.color || '#94A3B8';
  };

  // ── Get risk level badge ──
  const getRiskBadge = (level: RiskLevel) => {
    const style = riskLevelStyles[level];
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
        {level}
      </span>
    );
  };

  if (activeNav === 'hotspots') {
    return <HotspotAnalysisScreen onNavChange={handleNavChange} />;
  }

  if (activeNav === 'reports') {
    return <ReportsScreen onNavChange={handleNavChange} />;
  }

  if (activeNav === 'interventions') {
    return <InterventionsScreen onNavChange={handleNavChange} />;
  }

  if (activeNav === 'settings') {
    return <SettingsScreen onNavChange={handleNavChange} />;
  }

  return (
    <CommandCenterLayout activeNav={activeNav} onNavChange={handleNavChange}>
      <div className="flex gap-5 h-full min-h-0">
        {/* ═══════════════════════════════════════════════════════════
            LEFT/CENTER — Risk Map Card (~65%)
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex-[1.85] flex flex-col gap-4 min-w-0">
          {/* ── Risk Map Card ── */}
          <div className="bg-white rounded-[16px] border border-farmBorder shadow-xs flex flex-col overflow-hidden flex-1 min-h-0">
            {/* Card Header + Filters */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-[15px] font-bold text-farmText-dark tracking-tight">
                  Risk Map – Telangana
                </h2>
                <div className="flex items-center gap-2">
                  {/* Crop Filter */}
                  <select
                    value={cropFilter}
                    onChange={(e) => setCropFilter(e.target.value)}
                    className="text-[12px] font-medium text-farmText-gray bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {cropFilterOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Risk Filter */}
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="text-[12px] font-medium text-farmText-gray bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {riskFilterOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  {/* Time Filter */}
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="text-[12px] font-medium text-farmText-gray bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {timeFilterOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative zone-map-container min-h-[400px] bg-slate-50/50">
              {/* ── SVG Zone Map ── */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full absolute inset-0"
                style={{ minHeight: '400px' }}
              >
                {/* Subtle outer state silhouette watermark */}
                <path
                  d="M 15,5 Q 30,2 50,5 Q 70,2 85,8 Q 92,15 90,30 Q 93,45 88,55 Q 85,65 78,75 Q 70,82 60,85 Q 50,90 40,85 Q 30,82 22,75 Q 15,65 12,55 Q 8,45 10,30 Q 8,15 15,5 Z"
                  className="fill-slate-100/80 stroke-slate-200"
                  strokeWidth="0.3"
                />

                {/* ── District Zone Rectangles ── */}
                {districtZones.map((zone) => (
                  <g key={zone.id}>
                    <rect
                      x={zone.x - zone.width / 2}
                      y={zone.y - zone.height / 2}
                      width={zone.width}
                      height={zone.height}
                      rx="2"
                      ry="2"
                      className={`${zone.bgClass} stroke-slate-200/60`}
                      strokeWidth="0.2"
                      opacity="0.7"
                    />
                    <text
                      x={zone.x}
                      y={zone.y + zone.height / 2 - 1}
                      textAnchor="middle"
                      className="fill-slate-400"
                      fontSize="2.2"
                      fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {zone.name}
                    </text>
                  </g>
                ))}

                {/* ── Heat Markers ── */}
                {filteredMarkers.map((marker) => {
                  const radius = markerSizeMap[marker.size] / 2;
                  const color = getMarkerColor(marker.category);
                  const isHighlighted = highlightedDistrict === marker.district;
                  const displayRadius = isHighlighted ? radius * 1.5 : radius;

                  return (
                    <g key={marker.id}>
                      {/* Glow ring for highlighted markers */}
                      {isHighlighted && (
                        <circle
                          cx={marker.x}
                          cy={marker.y}
                          r={displayRadius + 2}
                          fill="none"
                          stroke={color}
                          strokeWidth="0.5"
                          opacity="0.4"
                        >
                          <animate
                            attributeName="r"
                            values={`${displayRadius + 1};${displayRadius + 3};${displayRadius + 1}`}
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.5;0.15;0.5"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Marker circle */}
                      <circle
                        cx={marker.x}
                        cy={marker.y}
                        r={displayRadius}
                        fill={color}
                        opacity={isHighlighted ? 0.9 : 0.65}
                        className="cursor-pointer transition-all duration-200"
                        style={{ filter: isHighlighted ? `drop-shadow(0 0 3px ${color})` : undefined }}
                        onClick={(e) => handleMarkerClick(marker, e)}
                      >
                        <title>{`${marker.district} — ${marker.category} (${marker.riskLevel})`}</title>
                      </circle>

                      {/* Center dot */}
                      <circle
                        cx={marker.x}
                        cy={marker.y}
                        r={displayRadius * 0.35}
                        fill="white"
                        opacity={0.8}
                        className="pointer-events-none"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* ── Popup Tooltip ── */}
              {activePopup && (
                <div
                  className="absolute z-30 bg-white rounded-xl shadow-lg border border-slate-200 p-4 w-[260px] text-left"
                  style={{
                    left: `min(${activePopup.screenX}px, calc(100% - 280px))`,
                    top: `min(${activePopup.screenY + 10}px, calc(100% - 180px))`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-[13px] font-bold text-farmText-dark">{activePopup.marker.district}</h4>
                      <p className="text-[11px] text-farmText-gray mt-0.5">
                        {activePopup.marker.crop} · {activePopup.marker.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePopup(null)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    {getRiskBadge(activePopup.marker.riskLevel)}
                    <span className="text-[10px] text-farmText-muted">{activePopup.marker.affectedArea} affected</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <span className="text-[10px] font-bold text-farmText-gray uppercase tracking-wider block mb-1">
                      Recommended Intervention
                    </span>
                    <p className="text-[11px] text-farmText-dark leading-relaxed">
                      {activePopup.marker.intervention}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Legend Overlay (bottom-left) ── */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-3 z-20">
                <span className="text-[10px] font-bold text-farmText-gray uppercase tracking-wider block mb-2">
                  Risk Layers
                </span>
                <div className="space-y-1.5">
                  {legendCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleLegend(cat.id)}
                        className={`
                          relative w-7 h-4 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                          ${legendToggles[cat.id] ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200
                            ${legendToggles[cat.id] ? 'translate-x-3.5' : 'translate-x-0.5'}
                          `}
                        />
                      </button>

                      {/* Color Dot */}
                      <span className={`w-2 h-2 rounded-full ${cat.dotClass} shrink-0`} />

                      {/* Label */}
                      <span className={`text-[11px] font-medium transition-colors ${legendToggles[cat.id] ? 'text-farmText-dark' : 'text-farmText-muted line-through'}`}>
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Marker Count Badge (top-right) ── */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm px-3 py-1.5 z-20">
                <span className="text-[11px] font-bold text-farmText-dark">
                  {filteredMarkers.length}
                </span>
                <span className="text-[10px] text-farmText-gray ml-1">
                  active markers
                </span>
              </div>
            </div>
          </div>

          {/* ── Risk Level Legend Card (below map) ── */}
          <div className="bg-white rounded-[16px] border border-farmBorder shadow-xs px-5 py-3 flex items-center gap-6 shrink-0">
            <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
              Risk Level
            </span>
            {(['High', 'Medium', 'Low'] as RiskLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${riskLevelStyles[level].dot}`} />
                <span className="text-[12px] font-medium text-farmText-dark">{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT — Top Hotspots Panel (~35%)
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex-[1] min-w-[280px] max-w-[380px]">
          <div className="bg-white rounded-[16px] border border-farmBorder shadow-xs h-full flex flex-col">
            {/* Panel Header */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-farmText-dark tracking-tight">
                  Top Hotspots
                </h2>
                <span className="text-[11px] font-medium text-farmText-muted bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredHotspots.length} results
                </span>
              </div>
            </div>

            {/* Hotspot List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
              {filteredHotspots.length === 0 ? (
                <div className="text-center py-8 text-farmText-muted text-[12px]">
                  No hotspots match current filters.
                </div>
              ) : (
                filteredHotspots.map((hs) => {
                  const isActive = highlightedDistrict === hs.district;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => handleHotspotClick(hs.district)}
                      className={`
                        w-full text-left px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                        flex items-start gap-3 group
                        ${isActive
                          ? 'bg-primary/5 border border-primary/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border border-transparent'
                        }
                      `}
                    >
                      {/* Rank Badge */}
                      <div
                        className={`
                          w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold
                          ${isActive
                            ? 'bg-primary text-white'
                            : 'bg-slate-800 text-white'
                          }
                        `}
                      >
                        {hs.rank}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-bold text-farmText-dark truncate">
                            {hs.district}
                          </span>
                          {getRiskBadge(hs.riskLevel)}
                        </div>
                        <p className="text-[11px] text-farmText-gray font-medium">
                          {hs.crop} · {hs.issueType}
                        </p>
                        <p className="text-[10px] text-farmText-muted mt-0.5">
                          {hs.affectedArea} affected
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Panel Footer — Summary */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-[16px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-farmText-gray font-medium">Total Affected</span>
                <span className="text-farmText-dark font-bold">38,100 hectares</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-farmText-gray font-medium">High Risk Districts</span>
                <span className="text-red-600 font-bold">
                  {filteredHotspots.filter((h) => h.riskLevel === 'High').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommandCenterLayout>
  );
}
