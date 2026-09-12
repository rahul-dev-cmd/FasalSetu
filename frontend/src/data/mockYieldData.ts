/**
 * Mock Yield & Harvest Estimation Data
 * Scalable for different crops, plots, and growth stages.
 */

export interface YieldEstimateData {
  fieldName: string;
  cropName: string;
  lastUpdated: string;
  expectedYieldMin: number;
  expectedYieldMax: number;
  yieldUnit: string;
  harvestWindowStart: string;
  harvestWindowEnd: string;
  harvestETA: string;
  estimatedValueMin: number;
  estimatedValueMax: number;
  progressPercent: number; // 0 - 100
  trackingStatus: string;
  healthFactor?: string;
  projectedProfitPerAcre?: number;
}

export const mockYieldData: YieldEstimateData = {
  fieldName: 'Main Field (Paddy Plot A)',
  cropName: 'Paddy / Rice (धान)',
  lastUpdated: 'Updated 15m ago',
  expectedYieldMin: 24,
  expectedYieldMax: 28,
  yieldUnit: 'quintals',
  harvestWindowStart: 'Nov 15',
  harvestWindowEnd: 'Dec 5',
  harvestETA: 'in 2–3 months',
  estimatedValueMin: 72000,
  estimatedValueMax: 84000,
  progressPercent: 65,
  trackingStatus: 'On track',
  healthFactor: 'Good conditions for yield',
  projectedProfitPerAcre: 48500,
};

/**
 * Format Indian currency with ₹ and locale commas
 */
export const formatIndianCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Alternative mock presets for other crops/stages
 */
export const alternativeYieldPresets: Record<string, YieldEstimateData> = {
  paddyPlotA: mockYieldData,
  soybeanPlotB: {
    fieldName: 'North Plot (Soybean)',
    cropName: 'Soybean (सोयाबीन)',
    lastUpdated: 'Updated 1h ago',
    expectedYieldMin: 10,
    expectedYieldMax: 13,
    yieldUnit: 'quintals',
    harvestWindowStart: 'Oct 20',
    harvestWindowEnd: 'Nov 10',
    harvestETA: 'in 4–6 weeks',
    estimatedValueMin: 46000,
    estimatedValueMax: 59800,
    progressPercent: 82,
    trackingStatus: 'Ahead of schedule',
    healthFactor: 'Optimal vegetative pod development',
    projectedProfitPerAcre: 31200,
  },
  wheatPlotC: {
    fieldName: 'South Plot (Wheat)',
    cropName: 'Wheat (गेहूं)',
    lastUpdated: 'Updated yesterday',
    expectedYieldMin: 18,
    expectedYieldMax: 22,
    yieldUnit: 'quintals',
    harvestWindowStart: 'Mar 10',
    harvestWindowEnd: 'Mar 30',
    harvestETA: 'in 5 months',
    estimatedValueMin: 41400,
    estimatedValueMax: 50600,
    progressPercent: 35,
    trackingStatus: 'On track',
    healthFactor: 'Good tillering stage',
    projectedProfitPerAcre: 26000,
  },
};
