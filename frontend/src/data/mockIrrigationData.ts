/**
 * Mock Irrigation Advisory Data
 * Scalable for different soil moisture readings and urgency tiers.
 */

export interface IrrigationAdvisoryData {
  soilMoistureLevel: 'low' | 'medium' | 'high';
  moisturePercent: number; // 0-100, for positioning the gradient bar marker
  recommendation: string;
  urgency: 'monitor' | 'urgent' | 'ok';
  tips: string[];
  fieldZone?: string;
  lastUpdated?: string;
  soilTemperature?: string;
}

export const mockIrrigationData: IrrigationAdvisoryData = {
  soilMoistureLevel: 'low',
  moisturePercent: 28,
  recommendation: 'Irrigate in 2–3 days',
  urgency: 'monitor',
  fieldZone: 'Main Field (Paddy Plot A)',
  lastUpdated: 'Updated 15m ago',
  soilTemperature: '26°C',
  tips: [
    'Use drip / sprinkler if possible',
    'Avoid over-watering',
    'Irrigate during early morning to reduce evaporation loss',
  ],
};

/**
 * Additional mock presets for quick testing and extensibility
 */
export const alternativeIrrigationPresets: Record<string, IrrigationAdvisoryData> = {
  lowMoisture: mockIrrigationData,
  criticalUrgent: {
    soilMoistureLevel: 'low',
    moisturePercent: 12,
    recommendation: 'Immediate irrigation required today',
    urgency: 'urgent',
    fieldZone: 'East Plot (Wheat)',
    lastUpdated: 'Updated 5m ago',
    soilTemperature: '29°C',
    tips: [
      'Apply light irrigation immediately to relieve root stress',
      'Check water channels for blockages',
      'Mulch exposed soil beds to retain future moisture',
    ],
  },
  optimalMoisture: {
    soilMoistureLevel: 'high',
    moisturePercent: 68,
    recommendation: 'Moisture level optimal — No irrigation needed',
    urgency: 'ok',
    fieldZone: 'South Plot (Soybean)',
    lastUpdated: 'Updated 20m ago',
    soilTemperature: '23°C',
    tips: [
      'Maintain standard drainage channels',
      'Check back in 4–5 days after scheduled soil drying cycle',
    ],
  },
};
