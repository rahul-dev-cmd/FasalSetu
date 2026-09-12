/**
 * Mock data for Government Command Center Dashboard
 * All map positions are percentage-based (0-100) for the stylized zone map.
 * Markers are clustered near their district labels for visual clarity.
 */

// ── Risk Level Types ──────────────────────────────────────────────
export type RiskLevel = 'High' | 'Medium' | 'Low';

export type RiskCategory = 'Disease' | 'Pest' | 'Water Stress' | 'Waterlogging' | 'Crop Concentration';

// ── Legend Categories ─────────────────────────────────────────────
export interface LegendCategory {
  id: RiskCategory;
  label: string;
  color: string;       // Tailwind-friendly hex
  dotClass: string;    // Tailwind bg class for dot
  tagClass: string;    // Tailwind classes for tag badge
  defaultOn: boolean;
}

export const legendCategories: LegendCategory[] = [
  { id: 'Disease',            label: 'Disease',            color: '#EF4444', dotClass: 'bg-red-500',    tagClass: 'bg-red-100 text-red-700 border-red-200',       defaultOn: true },
  { id: 'Pest',               label: 'Pest',               color: '#F59E0B', dotClass: 'bg-amber-500',  tagClass: 'bg-amber-100 text-amber-700 border-amber-200', defaultOn: true },
  { id: 'Water Stress',       label: 'Water Stress',       color: '#3B82F6', dotClass: 'bg-blue-500',   tagClass: 'bg-blue-100 text-blue-700 border-blue-200',    defaultOn: true },
  { id: 'Waterlogging',       label: 'Waterlogging',       color: '#8B5CF6', dotClass: 'bg-purple-500', tagClass: 'bg-purple-100 text-purple-700 border-purple-200', defaultOn: true },
  { id: 'Crop Concentration', label: 'Crop Concentration', color: '#16A34A', dotClass: 'bg-green-500',  tagClass: 'bg-green-100 text-green-700 border-green-200', defaultOn: true },
];

// ── Hotspot Trend Type ────────────────────────────────────────────
export type HotspotTrend = 'up' | 'stable' | 'down';

// ── Historical Trend Data Point ───────────────────────────────────
export interface TrendDataPoint {
  label: string;
  ha: number;
}

// ── Hotspot Entry ─────────────────────────────────────────────────
export interface HotspotEntry {
  id: string;
  rank: number;
  district: string;
  riskLevel: RiskLevel;
  crop: string;
  issueType: RiskCategory;
  affectedArea: string;   // e.g. "12,400 ha"
  affectedAreaNum: number; // numeric in hectares for sorting & aggregation
  trend: HotspotTrend;
  trendLabel: string;     // e.g. "Trending up (+14%)"
  trendPercent: string;   // e.g. "+14%"
  economicImpactCr: number; // e.g. 18.2 (crores)
  farmersImpacted: number;
  mandalsCount: number;
  mandalsList: string[];
  intervention: string;   // summary intervention
  interventionsList: string[]; // detailed multi-step action plan
  historicalTrend: {
    '30d': TrendDataPoint[];
    '60d': TrendDataPoint[];
    '90d': TrendDataPoint[];
  };
  mapPosition: { x: number; y: number }; // percentage coords on zone map
}

export const hotspots: HotspotEntry[] = [
  {
    id: 'hs-1',
    rank: 1,
    district: 'Nalgonda',
    riskLevel: 'High',
    crop: 'Rice',
    issueType: 'Disease',
    affectedArea: '12,400 ha',
    affectedAreaNum: 12400,
    trend: 'up',
    trendLabel: 'Trending up',
    trendPercent: '+14%',
    economicImpactCr: 18.2,
    farmersImpacted: 8400,
    mandalsCount: 14,
    mandalsList: ['Miryalaguda', 'Devarakonda', 'Narketpally', 'Nakrekal', 'Huzurnagar'],
    intervention: 'Deploy fungicide spray teams. Distribute Tricyclazole kits to affected villages. Issue SMS advisory to 8,200 registered farmers.',
    interventionsList: [
      'Deploy 16 Rapid Response fungicide spray squads across 14 high-density mandals.',
      'Distribute Tricyclazole & Isoprothiolane kits via primary agricultural co-ops at 50% subsidy.',
      'Issue targeted Kisan SMS advisories to 8,400 registered paddy farmers with treatment schedules.',
      'Establish a 24/7 Krishi Vigyan Kendra (KVK) disease monitoring cell in Miryalaguda.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 7800 },
        { label: 'Day 8', ha: 8900 },
        { label: 'Day 15', ha: 10200 },
        { label: 'Day 22', ha: 11400 },
        { label: 'Day 30', ha: 12400 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 4200 },
        { label: 'Wk 3', ha: 6100 },
        { label: 'Wk 5', ha: 8900 },
        { label: 'Wk 7', ha: 11200 },
        { label: 'Wk 9', ha: 12400 },
      ],
      '90d': [
        { label: 'Month 1', ha: 2800 },
        { label: 'Month 2', ha: 6400 },
        { label: 'Month 3', ha: 12400 },
      ],
    },
    mapPosition: { x: 55, y: 55 },
  },
  {
    id: 'hs-2',
    rank: 2,
    district: 'Warangal',
    riskLevel: 'High',
    crop: 'Cotton',
    issueType: 'Pest',
    affectedArea: '9,800 ha',
    affectedAreaNum: 9800,
    trend: 'up',
    trendLabel: 'Trending up',
    trendPercent: '+11%',
    economicImpactCr: 15.6,
    farmersImpacted: 6900,
    mandalsCount: 11,
    mandalsList: ['Narsampet', 'Wardhannapet', 'Parkal', 'Geesugonda'],
    intervention: 'Release Trichogramma biocontrol agents. Set up pheromone traps in 45 villages. Activate Pest Surveillance Units.',
    interventionsList: [
      'Distribute and install 4,500 gossyplure pheromone traps in 45 critical cotton villages.',
      'Aero-release 250,000 Trichogramma egg parasitoids per hectare in pest cluster centers.',
      'Deploy 20 mobile field entomology teams to evaluate boll damage thresholds.',
      'Broadcast regional warnings on bollworm lifecycle and restrict synthetic pyrethroid usage.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 6500 },
        { label: 'Day 8', ha: 7400 },
        { label: 'Day 15', ha: 8200 },
        { label: 'Day 22', ha: 9100 },
        { label: 'Day 30', ha: 9800 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 3400 },
        { label: 'Wk 3', ha: 5200 },
        { label: 'Wk 5', ha: 7400 },
        { label: 'Wk 7', ha: 8900 },
        { label: 'Wk 9', ha: 9800 },
      ],
      '90d': [
        { label: 'Month 1', ha: 2100 },
        { label: 'Month 2', ha: 5500 },
        { label: 'Month 3', ha: 9800 },
      ],
    },
    mapPosition: { x: 55, y: 22 },
  },
  {
    id: 'hs-3',
    rank: 3,
    district: 'Khammam',
    riskLevel: 'Medium',
    crop: 'Chilli',
    issueType: 'Water Stress',
    affectedArea: '7,200 ha',
    affectedAreaNum: 7200,
    trend: 'stable',
    trendLabel: 'Stable',
    trendPercent: '+1%',
    economicImpactCr: 11.4,
    farmersImpacted: 5100,
    mandalsCount: 9,
    mandalsList: ['Sathupalli', 'Madhira', 'Wyra', 'Kallur'],
    intervention: 'Activate micro-irrigation subsidy scheme. Deploy mobile water tankers to 12 critical mandals. Issue drip irrigation advisories.',
    interventionsList: [
      'Activate fast-track 80% micro-irrigation subsidy under Telangana Drip Mission.',
      'Deploy 35 municipal water tankers to replenish farm ponds and recharge sumps.',
      'Distribute potassium silicate foliar anti-transpirants to limit evapotranspiration.',
      'Coordinate rotational water release schedule from Palair Reservoir canal network.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 7100 },
        { label: 'Day 8', ha: 7300 },
        { label: 'Day 15', ha: 7150 },
        { label: 'Day 22', ha: 7250 },
        { label: 'Day 30', ha: 7200 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 5800 },
        { label: 'Wk 3', ha: 6400 },
        { label: 'Wk 5', ha: 7000 },
        { label: 'Wk 7', ha: 7300 },
        { label: 'Wk 9', ha: 7200 },
      ],
      '90d': [
        { label: 'Month 1', ha: 4500 },
        { label: 'Month 2', ha: 6800 },
        { label: 'Month 3', ha: 7200 },
      ],
    },
    mapPosition: { x: 82, y: 45 },
  },
  {
    id: 'hs-4',
    rank: 4,
    district: 'Mahabubnagar',
    riskLevel: 'Medium',
    crop: 'Groundnut',
    issueType: 'Waterlogging',
    affectedArea: '5,600 ha',
    affectedAreaNum: 5600,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-9%',
    economicImpactCr: 6.8,
    farmersImpacted: 4300,
    mandalsCount: 8,
    mandalsList: ['Jadcherla', 'Bhoothpur', 'Devarkadra', 'Addakal'],
    intervention: 'Expedite drainage channel clearing in 8 mandals. Distribute flood-tolerant seed varieties. Coordinate with irrigation department.',
    interventionsList: [
      'Commission 12 heavy earthmovers to clear blocked canal drainage outlets.',
      'Deploy diesel dewatering pump units to stagnant pod-development fields.',
      'Provide emergency gypsum applications to minimize soil saturation compaction.',
      'Supply post-drainage zinc sulfate and boron booster kits to restore root vigor.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 6800 },
        { label: 'Day 8', ha: 6400 },
        { label: 'Day 15', ha: 6050 },
        { label: 'Day 22', ha: 5800 },
        { label: 'Day 30', ha: 5600 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 4200 },
        { label: 'Wk 3', ha: 5900 },
        { label: 'Wk 5', ha: 7100 },
        { label: 'Wk 7', ha: 6300 },
        { label: 'Wk 9', ha: 5600 },
      ],
      '90d': [
        { label: 'Month 1', ha: 3100 },
        { label: 'Month 2', ha: 6900 },
        { label: 'Month 3', ha: 5600 },
      ],
    },
    mapPosition: { x: 25, y: 72 },
  },
  {
    id: 'hs-5',
    rank: 5,
    district: 'Karimnagar',
    riskLevel: 'Low',
    crop: 'Maize',
    issueType: 'Pest',
    affectedArea: '3,100 ha',
    affectedAreaNum: 3100,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-15%',
    economicImpactCr: 3.2,
    farmersImpacted: 2700,
    mandalsCount: 6,
    mandalsList: ['Huzurabad', 'Manakondur', 'Jammikunta', 'Choppadandi'],
    intervention: 'Continue routine monitoring. Schedule preventive neem oil spraying. No immediate escalation required.',
    interventionsList: [
      'Conduct weekly pheromone trap counting across sentinel demo plots.',
      'Distribute 10,000 ppm cold-pressed Azadirachtin biological spray bottles.',
      'Promote bird perches (50/ha) for natural avian predation of Fall Armyworm larvae.',
      'Organize farmer field school workshops on early whorl scouting.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 4200 },
        { label: 'Day 8', ha: 3900 },
        { label: 'Day 15', ha: 3600 },
        { label: 'Day 22', ha: 3300 },
        { label: 'Day 30', ha: 3100 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 5400 },
        { label: 'Wk 3', ha: 4800 },
        { label: 'Wk 5', ha: 4100 },
        { label: 'Wk 7', ha: 3500 },
        { label: 'Wk 9', ha: 3100 },
      ],
      '90d': [
        { label: 'Month 1', ha: 5900 },
        { label: 'Month 2', ha: 4600 },
        { label: 'Month 3', ha: 3100 },
      ],
    },
    mapPosition: { x: 52, y: 8 },
  },
  {
    id: 'hs-6',
    rank: 6,
    district: 'Nizamabad',
    riskLevel: 'Medium',
    crop: 'Rice',
    issueType: 'Waterlogging',
    affectedArea: '2,900 ha',
    affectedAreaNum: 2900,
    trend: 'stable',
    trendLabel: 'Stable',
    trendPercent: '+2%',
    economicImpactCr: 4.1,
    farmersImpacted: 2200,
    mandalsCount: 5,
    mandalsList: ['Armoor', 'Bodhan', 'Banswada'],
    intervention: 'Regulate canal sluice gates. Inspect Godavari tributary flood bunds. Clear tail-end blockages.',
    interventionsList: [
      'Regulate Ali Sagar lift canal discharge to reduce tail-end flooding.',
      'Inspect 42 km of tributary earthen embankments along Nizamabad canal grid.',
      'Supply bio-drainage microbial inoculants to prevent root anaerobic decay.',
      'Coordinate with district collectorate for flood relief seed bank reserves.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 2800 },
        { label: 'Day 8', ha: 2850 },
        { label: 'Day 15', ha: 2920 },
        { label: 'Day 22', ha: 2880 },
        { label: 'Day 30', ha: 2900 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 1900 },
        { label: 'Wk 3', ha: 2400 },
        { label: 'Wk 5', ha: 2750 },
        { label: 'Wk 7', ha: 2950 },
        { label: 'Wk 9', ha: 2900 },
      ],
      '90d': [
        { label: 'Month 1', ha: 1500 },
        { label: 'Month 2', ha: 2600 },
        { label: 'Month 3', ha: 2900 },
      ],
    },
    mapPosition: { x: 25, y: 25 },
  },
  {
    id: 'hs-7',
    rank: 7,
    district: 'Medak',
    riskLevel: 'Low',
    crop: 'Rice',
    issueType: 'Crop Concentration',
    affectedArea: '2,400 ha',
    affectedAreaNum: 2400,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-7%',
    economicImpactCr: 2.5,
    farmersImpacted: 1850,
    mandalsCount: 4,
    mandalsList: ['Narsapur', 'Toopran', 'Chegunta'],
    intervention: 'Promote crop rotation with pulses. Organize farm school demonstrations on soil nitrogen balance.',
    interventionsList: [
      'Roll out Rythu Bharosa incentives for red gram and green gram intercropping.',
      'Conduct soil test health card distribution across 28 gram panchayats.',
      'Demonstrate drum-seeding techniques to decrease water and seed dependency.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 2800 },
        { label: 'Day 8', ha: 2700 },
        { label: 'Day 15', ha: 2600 },
        { label: 'Day 22', ha: 2500 },
        { label: 'Day 30', ha: 2400 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 3200 },
        { label: 'Wk 3', ha: 3000 },
        { label: 'Wk 5', ha: 2700 },
        { label: 'Wk 7', ha: 2550 },
        { label: 'Wk 9', ha: 2400 },
      ],
      '90d': [
        { label: 'Month 1', ha: 3600 },
        { label: 'Month 2', ha: 2900 },
        { label: 'Month 3', ha: 2400 },
      ],
    },
    mapPosition: { x: 22, y: 42 },
  },
  {
    id: 'hs-8',
    rank: 8,
    district: 'Adilabad',
    riskLevel: 'Low',
    crop: 'Soybean',
    issueType: 'Water Stress',
    affectedArea: '1,800 ha',
    affectedAreaNum: 1800,
    trend: 'stable',
    trendLabel: 'Stable',
    trendPercent: '-1%',
    economicImpactCr: 1.9,
    farmersImpacted: 1400,
    mandalsCount: 4,
    mandalsList: ['Boath', 'Utnoor', 'Indervelly'],
    intervention: 'Deploy sprinkler irrigation support. Distribute bio-fertilizer drought mitigation packs.',
    interventionsList: [
      'Deploy 15 mobile solar micro-sprinkler sets in tribal belt cluster farms.',
      'Distribute vesicular arbuscular mycorrhiza (VAM) fungal root inoculants.',
      'Issue local weather bulletins and soil moisture conservation mulching guides.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1900 },
        { label: 'Day 8', ha: 1850 },
        { label: 'Day 15', ha: 1820 },
        { label: 'Day 22', ha: 1800 },
        { label: 'Day 30', ha: 1800 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 2100 },
        { label: 'Wk 3', ha: 2000 },
        { label: 'Wk 5', ha: 1900 },
        { label: 'Wk 7', ha: 1850 },
        { label: 'Wk 9', ha: 1800 },
      ],
      '90d': [
        { label: 'Month 1', ha: 2300 },
        { label: 'Month 2', ha: 2050 },
        { label: 'Month 3', ha: 1800 },
      ],
    },
    mapPosition: { x: 18, y: 10 },
  },
  {
    id: 'hs-9',
    rank: 9,
    district: 'Suryapet',
    riskLevel: 'High',
    crop: 'Rice',
    issueType: 'Disease',
    affectedArea: '1,750 ha',
    affectedAreaNum: 1750,
    trend: 'up',
    trendLabel: 'Trending up',
    trendPercent: '+18%',
    economicImpactCr: 2.8,
    farmersImpacted: 1300,
    mandalsCount: 4,
    mandalsList: ['Kodad', 'Mothey', 'Chivvemla'],
    intervention: 'Immediate containment of bacterial leaf streak. Mobilize drone spraying units.',
    interventionsList: [
      'Deploy agricultural spraying drones for rapid bactericide dispersion.',
      'Restock district warehouse with copper oxychloride bactericide formulations.',
      'Issue emergency farmer SMS advisories restricting excessive nitrogen top-dressing.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1100 },
        { label: 'Day 8', ha: 1250 },
        { label: 'Day 15', ha: 1450 },
        { label: 'Day 22', ha: 1620 },
        { label: 'Day 30', ha: 1750 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 700 },
        { label: 'Wk 3', ha: 950 },
        { label: 'Wk 5', ha: 1300 },
        { label: 'Wk 7', ha: 1550 },
        { label: 'Wk 9', ha: 1750 },
      ],
      '90d': [
        { label: 'Month 1', ha: 500 },
        { label: 'Month 2', ha: 1100 },
        { label: 'Month 3', ha: 1750 },
      ],
    },
    mapPosition: { x: 62, y: 70 },
  },
  {
    id: 'hs-10',
    rank: 10,
    district: 'Rangareddy',
    riskLevel: 'Medium',
    crop: 'Vegetables',
    issueType: 'Pest',
    affectedArea: '1,600 ha',
    affectedAreaNum: 1600,
    trend: 'up',
    trendLabel: 'Trending up',
    trendPercent: '+8%',
    economicImpactCr: 2.2,
    farmersImpacted: 1200,
    mandalsCount: 4,
    mandalsList: ['Chevella', 'Shadnagar', 'Ibrahimpatnam'],
    intervention: 'Deploy whitefly and thrips bio-agents. Distribute sticky yellow traps to peri-urban vegetable clusters.',
    interventionsList: [
      'Install 8,000 yellow & blue sticky traps in protected polyhouse clusters.',
      'Introduce predatory ladybird beetles for biological whitefly suppression.',
      'Provide organic bio-pesticide spray schedule advisory.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1300 },
        { label: 'Day 8', ha: 1380 },
        { label: 'Day 15', ha: 1460 },
        { label: 'Day 22', ha: 1530 },
        { label: 'Day 30', ha: 1600 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 900 },
        { label: 'Wk 3', ha: 1150 },
        { label: 'Wk 5', ha: 1350 },
        { label: 'Wk 7', ha: 1500 },
        { label: 'Wk 9', ha: 1600 },
      ],
      '90d': [
        { label: 'Month 1', ha: 700 },
        { label: 'Month 2', ha: 1200 },
        { label: 'Month 3', ha: 1600 },
      ],
    },
    mapPosition: { x: 38, y: 65 },
  },
  {
    id: 'hs-11',
    rank: 11,
    district: 'Siddipet',
    riskLevel: 'Medium',
    crop: 'Maize',
    issueType: 'Water Stress',
    affectedArea: '1,450 ha',
    affectedAreaNum: 1450,
    trend: 'stable',
    trendLabel: 'Stable',
    trendPercent: '0%',
    economicImpactCr: 1.8,
    farmersImpacted: 1050,
    mandalsCount: 3,
    mandalsList: ['Gajwel', 'Husnabad', 'Dubbak'],
    intervention: 'Prioritize water release from Ranganayaka Sagar canal. Distribute drought-resistant microbial stimulants.',
    interventionsList: [
      'Coordinate rotational release schedule with Godavari Lift Irrigation network.',
      'Supply anti-stress amino-acid foliar booster kits.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1420 },
        { label: 'Day 8', ha: 1440 },
        { label: 'Day 15', ha: 1450 },
        { label: 'Day 22', ha: 1460 },
        { label: 'Day 30', ha: 1450 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 1200 },
        { label: 'Wk 3', ha: 1350 },
        { label: 'Wk 5', ha: 1440 },
        { label: 'Wk 7', ha: 1460 },
        { label: 'Wk 9', ha: 1450 },
      ],
      '90d': [
        { label: 'Month 1', ha: 950 },
        { label: 'Month 2', ha: 1300 },
        { label: 'Month 3', ha: 1450 },
      ],
    },
    mapPosition: { x: 44, y: 35 },
  },
  {
    id: 'hs-12',
    rank: 12,
    district: 'Jagtial',
    riskLevel: 'Medium',
    crop: 'Turmeric',
    issueType: 'Disease',
    affectedArea: '1,200 ha',
    affectedAreaNum: 1200,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-5%',
    economicImpactCr: 1.6,
    farmersImpacted: 950,
    mandalsCount: 3,
    mandalsList: ['Korutla', 'Metpally', 'Raikal'],
    intervention: 'Rhizome rot treatment with Trichoderma viride. Improve raised-bed field drainage.',
    interventionsList: [
      'Distribute bio-fungicide drenching solution to turmeric cultivators.',
      'Conduct furrow reshaping demonstrations to stop root-zone stagnation.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1350 },
        { label: 'Day 8', ha: 1310 },
        { label: 'Day 15', ha: 1270 },
        { label: 'Day 22', ha: 1230 },
        { label: 'Day 30', ha: 1200 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 1550 },
        { label: 'Wk 3', ha: 1480 },
        { label: 'Wk 5', ha: 1380 },
        { label: 'Wk 7', ha: 1280 },
        { label: 'Wk 9', ha: 1200 },
      ],
      '90d': [
        { label: 'Month 1', ha: 1700 },
        { label: 'Month 2', ha: 1450 },
        { label: 'Month 3', ha: 1200 },
      ],
    },
    mapPosition: { x: 42, y: 16 },
  },
  {
    id: 'hs-13',
    rank: 13,
    district: 'Mancherial',
    riskLevel: 'Medium',
    crop: 'Cotton',
    issueType: 'Pest',
    affectedArea: '1,150 ha',
    affectedAreaNum: 1150,
    trend: 'up',
    trendLabel: 'Trending up',
    trendPercent: '+6%',
    economicImpactCr: 1.5,
    farmersImpacted: 820,
    mandalsCount: 3,
    mandalsList: ['Bellampalli', 'Chennur', 'Mandamarri'],
    intervention: 'Monitor aphid and jassid suction thresholds. Issue targeted bio-pesticide advisory.',
    interventionsList: [
      'Supply flonicamid and neem formulations through primary co-ops.',
      'Deploy 10 scout supervisors to check nymph counts on underside of leaves.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 980 },
        { label: 'Day 8', ha: 1040 },
        { label: 'Day 15', ha: 1090 },
        { label: 'Day 22', ha: 1120 },
        { label: 'Day 30', ha: 1150 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 750 },
        { label: 'Wk 3', ha: 880 },
        { label: 'Wk 5', ha: 1020 },
        { label: 'Wk 7', ha: 1110 },
        { label: 'Wk 9', ha: 1150 },
      ],
      '90d': [
        { label: 'Month 1', ha: 600 },
        { label: 'Month 2', ha: 920 },
        { label: 'Month 3', ha: 1150 },
      ],
    },
    mapPosition: { x: 38, y: 12 },
  },
  {
    id: 'hs-14',
    rank: 14,
    district: 'Bhadradri Kothagudem',
    riskLevel: 'Low',
    crop: 'Chilli',
    issueType: 'Water Stress',
    affectedArea: '980 ha',
    affectedAreaNum: 980,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-12%',
    economicImpactCr: 1.2,
    farmersImpacted: 740,
    mandalsCount: 3,
    mandalsList: ['Aswapuram', 'Burgampahad', 'Manuguru'],
    intervention: 'Tap Godavari lift points. Provide portable engine pumps on hire.',
    interventionsList: [
      'Subsidize diesel pump rental charges for smallholders.',
      'Promote straw mulching for soil moisture conservation.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1220 },
        { label: 'Day 8', ha: 1150 },
        { label: 'Day 15', ha: 1080 },
        { label: 'Day 22', ha: 1020 },
        { label: 'Day 30', ha: 980 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 1400 },
        { label: 'Wk 3', ha: 1310 },
        { label: 'Wk 5', ha: 1200 },
        { label: 'Wk 7', ha: 1080 },
        { label: 'Wk 9', ha: 980 },
      ],
      '90d': [
        { label: 'Month 1', ha: 1550 },
        { label: 'Month 2', ha: 1260 },
        { label: 'Month 3', ha: 980 },
      ],
    },
    mapPosition: { x: 86, y: 52 },
  },
  {
    id: 'hs-15',
    rank: 15,
    district: 'Nagarkurnool',
    riskLevel: 'Low',
    crop: 'Groundnut',
    issueType: 'Waterlogging',
    affectedArea: '850 ha',
    affectedAreaNum: 850,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-10%',
    economicImpactCr: 0.9,
    farmersImpacted: 620,
    mandalsCount: 2,
    mandalsList: ['Achampet', 'Kollapur'],
    intervention: 'Facilitate natural runoff channels into local percolation tanks.',
    interventionsList: [
      'Desilt village feeder streams under community watershed works.',
      'Advise delayed foliar fertilization until soil aerates.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 1050 },
        { label: 'Day 8', ha: 990 },
        { label: 'Day 15', ha: 930 },
        { label: 'Day 22', ha: 880 },
        { label: 'Day 30', ha: 850 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 1250 },
        { label: 'Wk 3', ha: 1150 },
        { label: 'Wk 5', ha: 1020 },
        { label: 'Wk 7', ha: 920 },
        { label: 'Wk 9', ha: 850 },
      ],
      '90d': [
        { label: 'Month 1', ha: 1350 },
        { label: 'Month 2', ha: 1100 },
        { label: 'Month 3', ha: 850 },
      ],
    },
    mapPosition: { x: 30, y: 80 },
  },
  {
    id: 'hs-16',
    rank: 16,
    district: 'Wanaparthy',
    riskLevel: 'Low',
    crop: 'Groundnut',
    issueType: 'Pest',
    affectedArea: '720 ha',
    affectedAreaNum: 720,
    trend: 'stable',
    trendLabel: 'Stable',
    trendPercent: '+3%',
    economicImpactCr: 0.8,
    farmersImpacted: 510,
    mandalsCount: 2,
    mandalsList: ['Ghanpur', 'Pebbair'],
    intervention: 'Leaf miner surveillance and installation of light traps.',
    interventionsList: [
      'Set up solar light traps at village intersections.',
      'Distribute broadcast advisory regarding early dawn spraying.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 690 },
        { label: 'Day 8', ha: 700 },
        { label: 'Day 15', ha: 710 },
        { label: 'Day 22', ha: 725 },
        { label: 'Day 30', ha: 720 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 650 },
        { label: 'Wk 3', ha: 670 },
        { label: 'Wk 5', ha: 700 },
        { label: 'Wk 7', ha: 730 },
        { label: 'Wk 9', ha: 720 },
      ],
      '90d': [
        { label: 'Month 1', ha: 600 },
        { label: 'Month 2', ha: 680 },
        { label: 'Month 3', ha: 720 },
      ],
    },
    mapPosition: { x: 26, y: 84 },
  },
  {
    id: 'hs-17',
    rank: 17,
    district: 'Vikarabad',
    riskLevel: 'Low',
    crop: 'Soybean',
    issueType: 'Disease',
    affectedArea: '650 ha',
    affectedAreaNum: 650,
    trend: 'down',
    trendLabel: 'Improving',
    trendPercent: '-8%',
    economicImpactCr: 0.7,
    farmersImpacted: 460,
    mandalsCount: 2,
    mandalsList: ['Tandur', 'Pargi'],
    intervention: 'Yellow mosaic virus vector control. Eradicate alternative weed hosts.',
    interventionsList: [
      'Eradicate Parthenium and weed reservoirs around field borders.',
      'Deploy systemic insecticide seed-treatment guidelines for upcoming sowing.',
    ],
    historicalTrend: {
      '30d': [
        { label: 'Day 1', ha: 760 },
        { label: 'Day 8', ha: 730 },
        { label: 'Day 15', ha: 700 },
        { label: 'Day 22', ha: 670 },
        { label: 'Day 30', ha: 650 },
      ],
      '60d': [
        { label: 'Wk 1', ha: 880 },
        { label: 'Wk 3', ha: 820 },
        { label: 'Wk 5', ha: 760 },
        { label: 'Wk 7', ha: 700 },
        { label: 'Wk 9', ha: 650 },
      ],
      '90d': [
        { label: 'Month 1', ha: 950 },
        { label: 'Month 2', ha: 800 },
        { label: 'Month 3', ha: 650 },
      ],
    },
    mapPosition: { x: 16, y: 55 },
  },
];

// ── Map Markers ───────────────────────────────────────────────────
// Grouped in visually distinct clusters around district regions.
export interface MapMarker {
  id: string;
  x: number;          // percentage (0–100)
  y: number;          // percentage (0–100)
  size: 'sm' | 'md' | 'lg';
  riskLevel: RiskLevel;
  category: RiskCategory;
  district: string;
  crop: string;
  affectedArea: string;
  intervention: string;
}

export const mapMarkers: MapMarker[] = [
  // ── Hyderabad cluster (center-left) ──
  { id: 'm-1',  x: 38, y: 48, size: 'md', riskLevel: 'Medium', category: 'Disease',       district: 'Hyderabad',    crop: 'Vegetables', affectedArea: '2,100 ha', intervention: 'Urban horticulture disease monitoring program.' },
  { id: 'm-2',  x: 42, y: 44, size: 'sm', riskLevel: 'Low',    category: 'Crop Concentration', district: 'Hyderabad', crop: 'Leafy Greens', affectedArea: '800 ha',  intervention: 'Crop diversification advisory for peri-urban farms.' },

  // ── Nalgonda cluster (center-right) ──
  { id: 'm-3',  x: 53, y: 52, size: 'lg', riskLevel: 'High',   category: 'Disease',       district: 'Nalgonda',     crop: 'Rice',       affectedArea: '12,400 ha', intervention: 'Deploy fungicide spray teams. Distribute Tricyclazole kits.' },
  { id: 'm-4',  x: 58, y: 57, size: 'md', riskLevel: 'High',   category: 'Pest',          district: 'Nalgonda',     crop: 'Rice',       affectedArea: '4,300 ha',  intervention: 'Stem borer infestation detected. Deploy light traps.' },
  { id: 'm-5',  x: 50, y: 60, size: 'sm', riskLevel: 'Medium', category: 'Water Stress',  district: 'Nalgonda',     crop: 'Sugarcane',  affectedArea: '1,800 ha',  intervention: 'Activate bore-well recharge scheme in 3 mandals.' },

  // ── Warangal cluster (upper-center) ──
  { id: 'm-6',  x: 53, y: 20, size: 'lg', riskLevel: 'High',   category: 'Pest',          district: 'Warangal',     crop: 'Cotton',     affectedArea: '9,800 ha',  intervention: 'Release Trichogramma biocontrol agents. Set up traps.' },
  { id: 'm-7',  x: 58, y: 16, size: 'md', riskLevel: 'Medium', category: 'Disease',       district: 'Warangal',     crop: 'Cotton',     affectedArea: '3,200 ha',  intervention: 'Bacterial blight alert. Copper-based fungicide recommended.' },
  { id: 'm-8',  x: 48, y: 25, size: 'sm', riskLevel: 'Low',    category: 'Crop Concentration', district: 'Warangal', crop: 'Rice',       affectedArea: '6,100 ha',  intervention: 'High crop concentration. Diversification advisory issued.' },

  // ── Khammam cluster (right) ──
  { id: 'm-9',  x: 80, y: 42, size: 'lg', riskLevel: 'Medium', category: 'Water Stress',  district: 'Khammam',      crop: 'Chilli',     affectedArea: '7,200 ha',  intervention: 'Activate micro-irrigation subsidy. Deploy tankers.' },
  { id: 'm-10', x: 85, y: 48, size: 'sm', riskLevel: 'Low',    category: 'Pest',          district: 'Khammam',      crop: 'Turmeric',   affectedArea: '1,400 ha',  intervention: 'Routine monitoring. Neem oil preventive spraying.' },

  // ── Mahabubnagar cluster (bottom-left) ──
  { id: 'm-11', x: 23, y: 70, size: 'lg', riskLevel: 'Medium', category: 'Waterlogging',  district: 'Mahabubnagar', crop: 'Groundnut',  affectedArea: '5,600 ha',  intervention: 'Expedite drainage clearing. Distribute flood-tolerant seeds.' },
  { id: 'm-12', x: 28, y: 76, size: 'md', riskLevel: 'Medium', category: 'Disease',       district: 'Mahabubnagar', crop: 'Soybean',    affectedArea: '2,900 ha',  intervention: 'Rust disease alert. Propiconazole spraying recommended.' },

  // ── Karimnagar cluster (top) ──
  { id: 'm-13', x: 50, y: 6,  size: 'md', riskLevel: 'Low',    category: 'Pest',          district: 'Karimnagar',   crop: 'Maize',      affectedArea: '3,100 ha',  intervention: 'Continue routine monitoring. No escalation needed.' },
  { id: 'm-14', x: 45, y: 10, size: 'sm', riskLevel: 'Low',    category: 'Crop Concentration', district: 'Karimnagar', crop: 'Rice',     affectedArea: '4,800 ha',  intervention: 'Monoculture risk moderate. Pulse intercropping recommended.' },

  // ── Adilabad (far top-left) ──
  { id: 'm-15', x: 20, y: 10, size: 'sm', riskLevel: 'Low',    category: 'Water Stress',  district: 'Adilabad',     crop: 'Soybean',    affectedArea: '1,600 ha',  intervention: 'Soil moisture satisfactory. Continue monitoring.' },

  // ── Nizamabad (upper-left) ──
  { id: 'm-16', x: 25, y: 25, size: 'md', riskLevel: 'Medium', category: 'Waterlogging',  district: 'Nizamabad',    crop: 'Rice',       affectedArea: '3,400 ha',  intervention: 'Canal overflow risk. Coordinate with irrigation dept.' },

  // ── Medak (left-center) ──
  { id: 'm-17', x: 22, y: 42, size: 'sm', riskLevel: 'Low',    category: 'Crop Concentration', district: 'Medak',   crop: 'Rice',       affectedArea: '5,200 ha',  intervention: 'Pulse intercropping advisory. Soil health card campaign.' },
];

// ── District Zones (for the stylized zone map grid) ───────────────
export interface DistrictZone {
  id: string;
  name: string;
  x: number;           // center x percentage
  y: number;           // center y percentage
  width: number;       // percentage width of zone rect
  height: number;      // percentage height of zone rect
  bgClass: string;     // Tailwind background class (subtle tint)
}

export const districtZones: DistrictZone[] = [
  { id: 'z-adilabad',     name: 'Adilabad',     x: 18, y: 10, width: 18, height: 14, bgClass: 'fill-emerald-50' },
  { id: 'z-nizamabad',    name: 'Nizamabad',    x: 23, y: 26, width: 16, height: 14, bgClass: 'fill-blue-50' },
  { id: 'z-karimnagar',   name: 'Karimnagar',   x: 48, y: 8,  width: 18, height: 14, bgClass: 'fill-green-50' },
  { id: 'z-medak',        name: 'Medak',        x: 20, y: 42, width: 16, height: 14, bgClass: 'fill-slate-50' },
  { id: 'z-hyderabad',    name: 'Hyderabad',    x: 38, y: 46, width: 14, height: 12, bgClass: 'fill-amber-50' },
  { id: 'z-warangal',     name: 'Warangal',     x: 55, y: 22, width: 18, height: 14, bgClass: 'fill-orange-50' },
  { id: 'z-khammam',      name: 'Khammam',      x: 80, y: 44, width: 18, height: 16, bgClass: 'fill-sky-50' },
  { id: 'z-nalgonda',     name: 'Nalgonda',     x: 53, y: 55, width: 18, height: 16, bgClass: 'fill-red-50' },
  { id: 'z-mahabubnagar', name: 'Mahabubnagar', x: 25, y: 72, width: 20, height: 16, bgClass: 'fill-purple-50' },
  { id: 'z-rangareddy',   name: 'Rangareddy',   x: 38, y: 65, width: 16, height: 14, bgClass: 'fill-teal-50' },
  { id: 'z-nalgonda-s',   name: 'Suryapet',     x: 62, y: 70, width: 16, height: 14, bgClass: 'fill-rose-50' },
];

// ── Filter Options ────────────────────────────────────────────────
export const cropFilterOptions = [
  'All Crops', 'Rice', 'Cotton', 'Chilli', 'Groundnut', 'Maize',
  'Sugarcane', 'Turmeric', 'Soybean', 'Vegetables', 'Leafy Greens',
];

export const riskFilterOptions = [
  'All Risks', 'High', 'Medium', 'Low',
];

export const timeFilterOptions = [
  'Last 30 Days', 'Last 7 Days', 'Last 90 Days', 'This Season',
];

// ── Risk Level Styling Helpers ────────────────────────────────────
export const riskLevelStyles: Record<RiskLevel, { bg: string; text: string; dot: string; border: string }> = {
  High:   { bg: 'bg-red-50',     text: 'text-red-800',     dot: 'bg-red-600',     border: 'border-red-200' },
  Medium: { bg: 'bg-amber-50',   text: 'text-amber-900',   dot: 'bg-amber-600',   border: 'border-amber-200' },
  Low:    { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-600', border: 'border-emerald-200' },
};

// ── Marker Size Helpers ───────────────────────────────────────────
export const markerSizeMap: Record<'sm' | 'md' | 'lg', number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

// ── Reports Types & Data ──────────────────────────────────────────
export type ReportType = 'Risk Summary' | 'Crop Health' | 'Yield Forecast' | 'Intervention Log';
export type ReportFormat = 'PDF' | 'Excel' | 'CSV';
export type ReportStatus = 'Ready' | 'Processing' | 'Failed';

export interface ReportItem {
  id: string;
  name: string;
  type: ReportType;
  district: string;
  dateGenerated: string;
  format: ReportFormat;
  fileSize: string;
  status: ReportStatus;
  executiveSummary: string;
  keyFindings: string[];
  scope: string;
}

export const reportTypeOptions: ReportType[] = [
  'Risk Summary',
  'Crop Health',
  'Yield Forecast',
  'Intervention Log',
];

export const reportDistrictOptions = [
  'All Districts',
  'Nalgonda',
  'Warangal',
  'Khammam',
  'Mahabubnagar',
  'Karimnagar',
  'Nizamabad',
  'Medak',
  'Adilabad',
  'Suryapet',
  'Rangareddy',
  'Siddipet',
];

export const reportDateRangeOptions = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'This Season (Kharif 2026)',
];

export const reportFormatOptions: ReportFormat[] = ['PDF', 'Excel', 'CSV'];

export const mockReports: ReportItem[] = [
  {
    id: 'rep-1',
    name: 'Telangana Risk Summary — Sept 2026',
    type: 'Risk Summary',
    district: 'All Districts',
    dateGenerated: '12 Sept 2026',
    format: 'PDF',
    fileSize: '4.2 MB',
    status: 'Ready',
    executiveSummary:
      'Comprehensive statewide macro-risk synthesis across all 33 agricultural districts. Synthesizes satellite radar indices, mandi arrival trends, and disease hotspots.',
    keyFindings: [
      'Total high-risk agricultural area estimated at 38,100 hectares across 8 priority districts.',
      'Rice blast in Nalgonda and Pink Bollworm in Warangal account for 58% of cumulative crop loss exposure.',
      'Soil moisture deficit flagged in south-eastern rainfed cotton belt.',
    ],
    scope: 'Statewide · 33 Districts · 1.4M Farmers Tracked',
  },
  {
    id: 'rep-2',
    name: 'Nalgonda Disease Outbreak Report',
    type: 'Crop Health',
    district: 'Nalgonda',
    dateGenerated: '10 Sept 2026',
    format: 'PDF',
    fileSize: '2.8 MB',
    status: 'Ready',
    executiveSummary:
      'Detailed phytosanitary investigation into fungal paddy blast (Pyricularia oryzae) progression in Miryalaguda and Devarakonda basins.',
    keyFindings: [
      '12,400 hectares rice crop currently experiencing moderate-to-severe foliar blast lesions.',
      'Recommended mandatory Tricyclazole fungicide spraying across 14 vulnerable mandals.',
      'Direct SMS advisories distributed to 8,400 registered farmers.',
    ],
    scope: 'District Level · 14 Mandals · 8,400 Farmers',
  },
  {
    id: 'rep-3',
    name: 'Warangal Pest Intervention Log',
    type: 'Intervention Log',
    district: 'Warangal',
    dateGenerated: '8 Sept 2026',
    format: 'Excel',
    fileSize: '1.4 MB',
    status: 'Ready',
    executiveSummary:
      'Consolidated audit log of bio-control deployments and pheromone trap grid inspections targeting Pink Bollworm in cotton acreage.',
    keyFindings: [
      '4,500 gossyplure lure traps deployed across 45 village panchayats.',
      'Trichogramma parasitoid release achieved 68% pest population suppression within 10 days.',
      'All 20 field surveillance squads submitted verified geotagged audit inspections.',
    ],
    scope: 'District Level · 45 Villages · 20 Field Squads',
  },
  {
    id: 'rep-4',
    name: 'Q3 Yield Forecast — Telangana',
    type: 'Yield Forecast',
    district: 'All Districts',
    dateGenerated: '5 Sept 2026',
    format: 'PDF',
    fileSize: '5.1 MB',
    status: 'Processing',
    executiveSummary:
      'Predictive harvest tonnage estimation for Kharif major crops utilizing multi-spectral NDVI imagery, soil moisture readings, and meteorological forecasts.',
    keyFindings: [
      'Predictive model synthesizing final radar satellite pass; calculation in progress.',
      'Preliminary rice production index projected at 94.2% of five-year seasonal median.',
      'Cotton yield variance anticipated between -4% to +2% depending on late-monsoon showers.',
    ],
    scope: 'Statewide · Predictive AI Model v3.4',
  },
  {
    id: 'rep-5',
    name: 'Khammam Water Stress Analysis',
    type: 'Crop Health',
    district: 'Khammam',
    dateGenerated: '1 Sept 2026',
    format: 'PDF',
    fileSize: '3.1 MB',
    status: 'Ready',
    executiveSummary:
      'Surface moisture analysis for chilli and turmeric crops along the Palair reservoir distribution network following intermittent dry spells.',
    keyFindings: [
      '7,200 hectares chilli crop approaching root-zone critical wilting thresholds.',
      '35 emergency water tankers dispatched to recharge farm pond networks.',
      'Fast-track subsidy enabled for drip irrigation piping across Sathupalli and Madhira.',
    ],
    scope: 'District Level · 9 Mandals · 5,100 Farmers',
  },
  {
    id: 'rep-6',
    name: 'Mahabubnagar Waterlogging Report',
    type: 'Risk Summary',
    district: 'Mahabubnagar',
    dateGenerated: '28 Aug 2026',
    format: 'Excel',
    fileSize: '1.9 MB',
    status: 'Ready',
    executiveSummary:
      'Hydrological impact study of localized flash flood runoff over groundnut pod-filling fields in Jadcherla and Bhoothpur.',
    keyFindings: [
      '5,600 hectares affected by drainage stagnation; water levels receded by 70% post canal clearing.',
      'Emergency distribution of flood-tolerant alternative seed kits completed.',
      '12 heavy excavators cleared 34 km of blocked tributary discharge channels.',
    ],
    scope: 'District Level · 8 Mandals · 4,300 Farmers',
  },
  {
    id: 'rep-7',
    name: 'Karimnagar Pest Surveillance Data',
    type: 'Crop Health',
    district: 'Karimnagar',
    dateGenerated: '25 Aug 2026',
    format: 'CSV',
    fileSize: '840 KB',
    status: 'Ready',
    executiveSummary:
      'Granular raw trap sensor telemetry and scout inspection records monitoring Fall Armyworm larvae in maize acreage.',
    keyFindings: [
      'Trap capture rates dropped below economic threshold (average 3 moths/trap/night).',
      'Biological neem oil applications proved 88% effective in preventing second-instar boring.',
      'No chemical pesticide escalation warranted.',
    ],
    scope: 'Raw Dataset · 6 Mandals · 124 Trap Nodes',
  },
  {
    id: 'rep-8',
    name: 'Adilabad Drought Assessment Log',
    type: 'Intervention Log',
    district: 'Adilabad',
    dateGenerated: '20 Aug 2026',
    format: 'PDF',
    fileSize: '2.1 MB',
    status: 'Failed',
    executiveSummary:
      'Automated telemetry aggregation encountered sensor communication timeouts across remote tribal belt weather stations in Utnoor.',
    keyFindings: [
      'Telemetry server connection timeout during soil matric potential sync.',
      'Partial data captured: 1,800 ha soybean water stress logged before connection dropout.',
      'Manual field re-synchronization recommended to regenerate report.',
    ],
    scope: 'District Level · Incomplete Telemetry',
  },
  {
    id: 'rep-9',
    name: 'Nizamabad Canal Inundation Audit',
    type: 'Risk Summary',
    district: 'Nizamabad',
    dateGenerated: '18 Aug 2026',
    format: 'PDF',
    fileSize: '3.6 MB',
    status: 'Ready',
    executiveSummary:
      'Sluice gate drainage calibration review along Ali Sagar lift irrigation canal during peak Godavari inflow.',
    keyFindings: [
      '2,900 ha paddy tail-end drainage restored within 48 hours of sluice regulation.',
      'Canal earthen bunds fortified with 15,000 geotextile sandbags.',
    ],
    scope: 'District Level · 5 Mandals',
  },
  {
    id: 'rep-10',
    name: 'Medak Crop Diversification Metric',
    type: 'Yield Forecast',
    district: 'Medak',
    dateGenerated: '15 Aug 2026',
    format: 'Excel',
    fileSize: '2.4 MB',
    status: 'Ready',
    executiveSummary:
      'Evaluation of pulse intercropping uptake (red gram and green gram) replacing continuous paddy monoculture.',
    keyFindings: [
      '2,400 ha converted to pulse intercropping with positive soil nitrogen gains.',
      'Farm household gross revenue projected to rise by 14% at harvest.',
    ],
    scope: 'District Level · 28 Gram Panchayats',
  },
  {
    id: 'rep-11',
    name: 'Suryapet Bacterial Blight Bulletin',
    type: 'Crop Health',
    district: 'Suryapet',
    dateGenerated: '12 Aug 2026',
    format: 'PDF',
    fileSize: '1.8 MB',
    status: 'Ready',
    executiveSummary:
      'Emergency containment documentation of bacterial leaf streak outbreak in Kodad mandal paddy blocks.',
    keyFindings: [
      '1,750 hectares contained via targeted agricultural drone bactericide spraying.',
      'Farmer advisory alert issued against excessive nitrogen fertilizer application.',
    ],
    scope: 'District Level · 4 Mandals',
  },
  {
    id: 'rep-12',
    name: 'Rangareddy Peri-Urban Pest Audit',
    type: 'Crop Health',
    district: 'Rangareddy',
    dateGenerated: '8 Aug 2026',
    format: 'CSV',
    fileSize: '620 KB',
    status: 'Ready',
    executiveSummary:
      'Whitefly and thrips density counts across peri-urban commercial vegetable greenhouse clusters.',
    keyFindings: [
      '8,000 yellow sticky traps deployed in protected polyhouses.',
      'Beneficial ladybird beetle populations established in 80% monitored units.',
    ],
    scope: 'District Level · 4 Mandals · Polyhouse Network',
  },
  {
    id: 'rep-13',
    name: 'Siddipet Canal Discharge Report',
    type: 'Intervention Log',
    district: 'Siddipet',
    dateGenerated: '4 Aug 2026',
    format: 'PDF',
    fileSize: '2.2 MB',
    status: 'Ready',
    executiveSummary:
      'Water release timeline and field delivery volume verification from Ranganayaka Sagar reservoir.',
    keyFindings: [
      '1,450 hectares maize crops received supplemental irrigation just before tasseling stage.',
      'Zero reported tail-end water distribution disputes.',
    ],
    scope: 'District Level · 3 Mandals',
  },
  {
    id: 'rep-14',
    name: 'Jagtial Turmeric Rhizome Health Log',
    type: 'Crop Health',
    district: 'Jagtial',
    dateGenerated: '1 Aug 2026',
    format: 'Excel',
    fileSize: '1.6 MB',
    status: 'Ready',
    executiveSummary:
      'Field pathogen culture results evaluating root rot mitigation using Trichoderma viride biological inoculants.',
    keyFindings: [
      '1,200 hectares treated with bio-fungicide drenching showed 84% recovery.',
      'Furrow drainage re-engineering successfully prevented fungal spore spread.',
    ],
    scope: 'District Level · 3 Mandals',
  },
  {
    id: 'rep-15',
    name: 'Mancherial Cotton Pest Assessment',
    type: 'Crop Health',
    district: 'Mancherial',
    dateGenerated: '28 Jul 2026',
    format: 'PDF',
    fileSize: '2.9 MB',
    status: 'Ready',
    executiveSummary:
      'Sucking pest surveillance report regarding aphid and jassid threshold levels in black cotton soils.',
    keyFindings: [
      '1,150 hectares monitored by 10 mobile scout supervisors.',
      'Biological neem formulations distributed through primary agricultural co-ops.',
    ],
    scope: 'District Level · 3 Mandals',
  },
  {
    id: 'rep-16',
    name: 'Bhadradri Micro-Irrigation Impact',
    type: 'Yield Forecast',
    district: 'Bhadradri Kothagudem',
    dateGenerated: '22 Jul 2026',
    format: 'PDF',
    fileSize: '3.3 MB',
    status: 'Ready',
    executiveSummary:
      'Yield protection metric comparing drip irrigated chilli plots against furrow irrigated benchmarks.',
    keyFindings: [
      '980 hectares with micro-irrigation maintained 96% canopy health despite heat stress.',
      'Water savings measured at 42% compared to flood irrigation.',
    ],
    scope: 'District Level · 3 Mandals',
  },
  {
    id: 'rep-17',
    name: 'Nagarkurnool Soil Moisture Audit',
    type: 'Risk Summary',
    district: 'Nagarkurnool',
    dateGenerated: '15 Jul 2026',
    format: 'CSV',
    fileSize: '950 KB',
    status: 'Ready',
    executiveSummary:
      'Capillary soil moisture sensor telemetry across 45 rainfed groundnut demo plots.',
    keyFindings: [
      '850 hectares benefited from village feeder stream community desiltation.',
      'Soil aeration indices stabilized within normal range.',
    ],
    scope: 'District Level · 2 Mandals',
  },
  {
    id: 'rep-18',
    name: 'Wanaparthy Light Trap Monitoring',
    type: 'Crop Health',
    district: 'Wanaparthy',
    dateGenerated: '10 Jul 2026',
    format: 'Excel',
    fileSize: '1.2 MB',
    status: 'Ready',
    executiveSummary:
      'Night-time solar light trap capture counts for groundnut leaf miner moths.',
    keyFindings: [
      '720 hectares monitored; adult moth captures peaked on July 4 and subsided following rainfall.',
      'Dawn spray advisories issued to 510 registered cultivators.',
    ],
    scope: 'District Level · 2 Mandals',
  },
  {
    id: 'rep-19',
    name: 'Vikarabad Red Gram Disease Log',
    type: 'Intervention Log',
    district: 'Vikarabad',
    dateGenerated: '5 Jul 2026',
    format: 'PDF',
    fileSize: '2.5 MB',
    status: 'Ready',
    executiveSummary:
      'Yellow mosaic virus weed host eradication drive and vector control implementation.',
    keyFindings: [
      '650 hectares border zones cleared of Parthenium reservoirs.',
      'Systemic bio-insecticide seed treatment protocol achieved 92% adherence.',
    ],
    scope: 'District Level · 2 Mandals',
  },
  {
    id: 'rep-20',
    name: 'Telangana Kharif Sowing Progress',
    type: 'Risk Summary',
    district: 'All Districts',
    dateGenerated: '30 Jun 2026',
    format: 'PDF',
    fileSize: '4.8 MB',
    status: 'Ready',
    executiveSummary:
      'Statewide consolidation of early-season sowing coverage against normal target acreage.',
    keyFindings: [
      'Paddy sowing completed on 1.8M hectares (104% of normal season target).',
      'Cotton acreage stable at 1.95M hectares across central and northern zones.',
    ],
    scope: 'Statewide · 33 Districts',
  },
  {
    id: 'rep-21',
    name: 'Pre-Monsoon Soil Health Survey',
    type: 'Crop Health',
    district: 'All Districts',
    dateGenerated: '20 Jun 2026',
    format: 'Excel',
    fileSize: '3.8 MB',
    status: 'Ready',
    executiveSummary:
      'Macronutrient and micronutrient balance survey across 15,000 grid soil sample points.',
    keyFindings: [
      'Zinc and boron deficiency identified in 34% surveyed agricultural soils.',
      'State fertilizer distribution tailored with micronutrient fortification quotas.',
    ],
    scope: 'Statewide · 15,000 Soil Samples',
  },
  {
    id: 'rep-22',
    name: 'Statewide Groundwater Reserve Metric',
    type: 'Risk Summary',
    district: 'All Districts',
    dateGenerated: '10 Jun 2026',
    format: 'PDF',
    fileSize: '4.1 MB',
    status: 'Ready',
    executiveSummary:
      'Piezometer water table measurements ahead of Kharif irrigation pump activations.',
    keyFindings: [
      'Average groundwater depth improved by 1.8m compared to previous season.',
      'Mission Kakatiya lake rejuvenations maintained positive aquifer recharge.',
    ],
    scope: 'Statewide · 850 Piezometers',
  },
  {
    id: 'rep-23',
    name: 'Kisan Emergency Call Center Audit',
    type: 'Intervention Log',
    district: 'All Districts',
    dateGenerated: '1 Jun 2026',
    format: 'CSV',
    fileSize: '1.5 MB',
    status: 'Ready',
    executiveSummary:
      'Inbound agronomic advisory call volume analysis categorized by pest, disease, and weather queries.',
    keyFindings: [
      '48,200 calls resolved by agricultural extension officers with 94% satisfaction.',
      'Average advisory callback turnaround time reduced to 24 minutes.',
    ],
    scope: 'Statewide · 48,200 Inbound Inquiries',
  },
  {
    id: 'rep-24',
    name: 'Annual Crop Insurance Risk Model',
    type: 'Yield Forecast',
    district: 'All Districts',
    dateGenerated: '25 May 2026',
    format: 'PDF',
    fileSize: '6.2 MB',
    status: 'Ready',
    executiveSummary:
      'Actuarial risk assessment report for the PMFBY & Telangana State Crop Insurance Framework.',
    keyFindings: [
      'Risk exposure index calculated for all mandal insurance units.',
      'Automated weather station threshold trigger matrices calibrated.',
    ],
    scope: 'Statewide · 33 Districts · Actuarial Baseline',
  },
];

// ── Interventions Types & Data ────────────────────────────────────
export type InterventionStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ActivityLogEntry {
  time: string;
  text: string;
  author: string;
}

export interface InterventionItem {
  id: string;
  district: string;
  crop: string;
  issueType: RiskCategory;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  status: InterventionStatus;
  team: string | null; // e.g. "Field Team 2" or null for unassigned
  teamLead?: string;
  teamContact?: string;
  teamAvatar?: string;
  progressPercent?: number; // e.g. 65
  startedDate?: string;
  dueDate: string;
  completedDate?: string;
  resolvedBy?: string;
  mandal: string;
  affectedHectares: number;
  farmersCount: number;
  activityLog: ActivityLogEntry[];
}

export const fieldTeamOptions = [
  'All Teams',
  'Field Team 1 (North Command)',
  'Field Team 2 (East Command)',
  'Field Team 3 (Central Command)',
  'Field Team 4 (South Command)',
  'Field Team 5 (Tribal Belt Wing)',
  'Field Team 6 (Horticulture Wing)',
  'Unassigned',
];

export const mockInterventions: InterventionItem[] = [
  // ── PENDING COLUMN ──
  {
    id: 'int-1',
    district: 'Nalgonda',
    crop: 'Rice',
    issueType: 'Disease',
    riskLevel: 'High',
    title: 'Deploy Fungicide Spray Teams',
    description: 'Deploy 16 Rapid Response fungicide squads with Tricyclazole kits across 14 paddy mandals.',
    status: 'Pending',
    team: null,
    dueDate: 'In 2 days (14 Sept)',
    mandal: 'Miryalaguda, Devarakonda',
    affectedHectares: 12400,
    farmersCount: 8400,
    activityLog: [
      { time: '12 Sept, 10:30 AM', text: 'Automated outbreak alert triggered from Sentinel-2 radar pass.', author: 'AI Surveillance Core' },
      { time: '12 Sept, 11:15 AM', text: 'District Agricultural Officer initiated emergency spray requisition.', author: 'DAO Nalgonda' },
    ],
  },
  {
    id: 'int-2',
    district: 'Suryapet',
    crop: 'Rice',
    issueType: 'Disease',
    riskLevel: 'High',
    title: 'Drone Bactericide Spraying',
    description: 'Emergency agricultural drone dispersion for bacterial leaf streak containment.',
    status: 'Pending',
    team: null,
    dueDate: 'Tomorrow (13 Sept)',
    mandal: 'Kodad, Mothey',
    affectedHectares: 1750,
    farmersCount: 1300,
    activityLog: [
      { time: '11 Sept, 04:00 PM', text: 'Cluster disease density surpassed 18% weekly threshold.', author: 'AI Risk Engine' },
      { time: '12 Sept, 08:30 AM', text: 'Requisition sent for 4 custom AG-Drones.', author: 'KVK Suryapet' },
    ],
  },
  {
    id: 'int-3',
    district: 'Adilabad',
    crop: 'Soybean',
    issueType: 'Water Stress',
    riskLevel: 'Low',
    title: 'Solar Micro-Sprinkler Dispatch',
    description: 'Deploy 15 mobile solar sprinkler sets and root fungal inoculants in tribal cluster farms.',
    status: 'Pending',
    team: 'Field Team 5',
    teamLead: 'B. Naresh',
    teamContact: '+91 94401 88321',
    teamAvatar: 'FT5',
    dueDate: 'In 4 days (16 Sept)',
    mandal: 'Boath, Utnoor',
    affectedHectares: 1800,
    farmersCount: 1400,
    activityLog: [
      { time: '10 Sept, 02:15 PM', text: 'Telemetry confirmed 14-day dry run in red gravel soils.', author: 'Hydro Sensor Network' },
      { time: '11 Sept, 09:00 AM', text: 'Sprinkler batch allocated at regional cooperative depot.', author: 'Agronomy Desk' },
    ],
  },

  // ── IN PROGRESS COLUMN ──
  {
    id: 'int-4',
    district: 'Warangal',
    crop: 'Cotton',
    issueType: 'Pest',
    riskLevel: 'High',
    title: 'Pink Bollworm Biocontrol Traps',
    description: 'Aero-release 250k Trichogramma parasitoids and install 4,500 gossyplure traps in 45 villages.',
    status: 'In Progress',
    team: 'Field Team 2',
    teamLead: 'Dr. K. Srinivas',
    teamContact: '+91 98492 11452',
    teamAvatar: 'FT2',
    progressPercent: 65,
    startedDate: 'Started 2 days ago',
    dueDate: 'In 3 days (15 Sept)',
    mandal: 'Narsampet, Wardhannapet',
    affectedHectares: 9800,
    farmersCount: 6900,
    activityLog: [
      { time: '10 Sept, 08:00 AM', text: 'Field Team 2 deployed to Wardhannapet central depot.', author: 'Command Desk' },
      { time: '11 Sept, 01:30 PM', text: '3,000 pheromone traps installed in first 30 villages.', author: 'Dr. K. Srinivas' },
      { time: '12 Sept, 09:45 AM', text: 'Drone release of Trichogramma egg parasitoids 60% complete.', author: 'Field Team 2' },
    ],
  },
  {
    id: 'int-5',
    district: 'Mahabubnagar',
    crop: 'Groundnut',
    issueType: 'Waterlogging',
    riskLevel: 'Medium',
    title: 'Canal Clearance & Dewatering',
    description: 'Commission 12 heavy excavators to clear blocked canal drainage outlets in pod-development fields.',
    status: 'In Progress',
    team: 'Field Team 3',
    teamLead: 'Er. Ramesh V.',
    teamContact: '+91 97015 62890',
    teamAvatar: 'FT3',
    progressPercent: 40,
    startedDate: 'Started 1 day ago',
    dueDate: 'In 2 days (14 Sept)',
    mandal: 'Jadcherla, Bhoothpur',
    affectedHectares: 5600,
    farmersCount: 4300,
    activityLog: [
      { time: '11 Sept, 07:30 AM', text: 'Dewatering diesel pump sets dispatched from Jadcherla yard.', author: 'Irrigation Liaison' },
      { time: '11 Sept, 05:00 PM', text: '18 km of primary drainage channels dredged and cleared.', author: 'Er. Ramesh V.' },
    ],
  },
  {
    id: 'int-6',
    district: 'Nizamabad',
    crop: 'Rice',
    issueType: 'Waterlogging',
    riskLevel: 'Medium',
    title: 'Ali Sagar Sluice Gate Drainage',
    description: 'Regulate canal sluice discharge and reinforce 42 km of tributary earthen flood embankments.',
    status: 'In Progress',
    team: 'Field Team 1',
    teamLead: 'M. Anitha',
    teamContact: '+91 94412 34509',
    teamAvatar: 'FT1',
    progressPercent: 80,
    startedDate: 'Started 3 days ago',
    dueDate: 'Today (12 Sept)',
    mandal: 'Armoor, Bodhan',
    affectedHectares: 2900,
    farmersCount: 2200,
    activityLog: [
      { time: '09 Sept, 11:00 AM', text: 'Canal sluice gates opened by 35% for discharge.', author: 'M. Anitha' },
      { time: '10 Sept, 04:00 PM', text: 'Tail-end inundation dropped from 45cm to 12cm.', author: 'Field Inspector' },
      { time: '12 Sept, 08:00 AM', text: 'Sandbag reinforcement complete along 38 km of bunds.', author: 'Field Team 1' },
    ],
  },
  {
    id: 'int-7',
    district: 'Rangareddy',
    crop: 'Vegetables',
    issueType: 'Pest',
    riskLevel: 'Medium',
    title: 'Polyhouse Sticky Trap Grid',
    description: 'Deploy 8,000 yellow and blue sticky traps with predatory ladybird beetles for whitefly control.',
    status: 'In Progress',
    team: 'Field Team 6',
    teamLead: 'S. Venkat',
    teamContact: '+91 98480 77123',
    teamAvatar: 'FT6',
    progressPercent: 25,
    startedDate: 'Started yesterday',
    dueDate: 'In 5 days (17 Sept)',
    mandal: 'Chevella, Ibrahimpatnam',
    affectedHectares: 1600,
    farmersCount: 1200,
    activityLog: [
      { time: '11 Sept, 10:00 AM', text: 'Trap distribution inaugurated at Chevella Rythu Vedika.', author: 'Horticulture Dept' },
      { time: '11 Sept, 03:30 PM', text: 'Initial 2,000 traps set up across 42 polyhouse units.', author: 'S. Venkat' },
    ],
  },

  // ── COMPLETED COLUMN ──
  {
    id: 'int-8',
    district: 'Khammam',
    crop: 'Chilli',
    issueType: 'Water Stress',
    riskLevel: 'Medium',
    title: 'Emergency Tanker Water & Drip Aid',
    description: 'Mobilize 35 water tankers to recharge farm sumps and fast-track 80% drip subsidy rollout.',
    status: 'Completed',
    team: 'Field Team 4',
    teamLead: 'P. Rajesh',
    teamContact: '+91 99890 44512',
    teamAvatar: 'FT4',
    completedDate: '10 Sept 2026',
    resolvedBy: 'Field Team 4',
    dueDate: 'Resolved',
    mandal: 'Sathupalli, Madhira',
    affectedHectares: 7200,
    farmersCount: 5100,
    activityLog: [
      { time: '05 Sept, 09:00 AM', text: 'Dispatched 35 mobile tankers across 12 critical mandals.', author: 'P. Rajesh' },
      { time: '08 Sept, 02:00 PM', text: 'All 85 farm ponds filled to required reserve levels.', author: 'Field Team 4' },
      { time: '10 Sept, 04:30 PM', text: 'Canopy wilting halted. Final audit inspection verified.', author: 'DAO Khammam' },
    ],
  },
  {
    id: 'int-9',
    district: 'Karimnagar',
    crop: 'Maize',
    issueType: 'Pest',
    riskLevel: 'Low',
    title: 'Neem Biopesticide Distribution',
    description: 'Distribute cold-pressed Azadirachtin biological spray bottles and bird perches for FAW larvae control.',
    status: 'Completed',
    team: 'Field Team 1',
    teamLead: 'M. Anitha',
    teamContact: '+91 94412 34509',
    teamAvatar: 'FT1',
    completedDate: '7 Sept 2026',
    resolvedBy: 'Field Team 1',
    dueDate: 'Resolved',
    mandal: 'Huzurabad, Jammikunta',
    affectedHectares: 3100,
    farmersCount: 2700,
    activityLog: [
      { time: '02 Sept, 10:00 AM', text: 'Neem spray bottles delivered to 18 village PACS points.', author: 'M. Anitha' },
      { time: '07 Sept, 05:00 PM', text: 'Larval incidence declined by 82%. Case closed.', author: 'Field Team 1' },
    ],
  },
  {
    id: 'int-10',
    district: 'Medak',
    crop: 'Rice',
    issueType: 'Crop Concentration',
    riskLevel: 'Low',
    title: 'Pulse Intercropping Campaign',
    description: 'Distribute red gram & green gram seeds with soil test cards across 28 gram panchayats.',
    status: 'Completed',
    team: 'Field Team 4',
    teamLead: 'P. Rajesh',
    teamContact: '+91 99890 44512',
    teamAvatar: 'FT4',
    completedDate: '4 Sept 2026',
    resolvedBy: 'Field Team 4',
    dueDate: 'Resolved',
    mandal: 'Narsapur, Toopran',
    affectedHectares: 2400,
    farmersCount: 1850,
    activityLog: [
      { time: '28 Aug, 09:30 AM', text: 'Soil test health cards issued to 1,850 farmers.', author: 'P. Rajesh' },
      { time: '04 Sept, 03:00 PM', text: 'Intercropping successfully seeded in 2,400 hectares.', author: 'DAO Medak' },
    ],
  },
  {
    id: 'int-11',
    district: 'Jagtial',
    crop: 'Turmeric',
    issueType: 'Disease',
    riskLevel: 'Medium',
    title: 'Trichoderma Viride Root Drenching',
    description: 'Rhizome rot treatment with bio-fungicide drenching solution and raised furrow drainage reshaping.',
    status: 'Completed',
    team: 'Field Team 2',
    teamLead: 'Dr. K. Srinivas',
    teamContact: '+91 98492 11452',
    teamAvatar: 'FT2',
    completedDate: '31 Aug 2026',
    resolvedBy: 'Field Team 2',
    dueDate: 'Resolved',
    mandal: 'Korutla, Metpally',
    affectedHectares: 1200,
    farmersCount: 950,
    activityLog: [
      { time: '25 Aug, 10:00 AM', text: 'Trichoderma cultures distributed to cultivators.', author: 'Dr. K. Srinivas' },
      { time: '31 Aug, 04:00 PM', text: '84% crop vigor restored in treated plots. Verified.', author: 'Field Team 2' },
    ],
  },
  {
    id: 'int-12',
    district: 'Bhadradri Kothagudem',
    crop: 'Chilli',
    issueType: 'Water Stress',
    riskLevel: 'Low',
    title: 'Mobile Diesel Pump Subsidized Hire',
    description: 'Subsidize portable diesel pump rental charges from Godavari lift points to counter dry spell.',
    status: 'Completed',
    team: 'Field Team 5',
    teamLead: 'B. Naresh',
    teamContact: '+91 94401 88321',
    teamAvatar: 'FT5',
    completedDate: '28 Aug 2026',
    resolvedBy: 'Field Team 5',
    dueDate: 'Resolved',
    mandal: 'Aswapuram, Manuguru',
    affectedHectares: 980,
    farmersCount: 740,
    activityLog: [
      { time: '22 Aug, 08:30 AM', text: '22 diesel pumps deployed at river pumping points.', author: 'B. Naresh' },
      { time: '28 Aug, 05:00 PM', text: 'Dry spell mitigated. Crop stage safe.', author: 'Field Team 5' },
    ],
  },
];
