/**
 * Mock Diagnosis Data for AI Crop Doctor
 * Structured generically to support any crop disease outcome.
 */

export interface DiagnosisResultData {
  id: string;
  diseaseName: string;
  diseaseType: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  imageUrl: string;
  detectedOn?: string;
  cropAffected?: string;
}

export const mockDiagnosisResult: DiagnosisResultData = {
  id: 'diag-rice-blast-01',
  diseaseName: 'Rice Blast',
  diseaseType: 'Fungal Disease',
  severity: 'high',
  confidence: 96.4,
  cropAffected: 'Paddy / Rice (धान)',
  detectedOn: 'Today, Just now',
  imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=80',
  recommendations: [
    'Remove severely affected leaves',
    'Use recommended fungicide (Tricyazole / Validamycin)',
    'Improve field drainage',
  ],
};

/**
 * Additional mock profiles for alternative testing & scalability
 */
export const alternativeDiagnosisPresets: Record<string, DiagnosisResultData> = {
  riceBlast: mockDiagnosisResult,
  yellowMosaic: {
    id: 'diag-ymv-02',
    diseaseName: 'Yellow Mosaic Virus',
    diseaseType: 'Viral Disease (Whitefly Vector)',
    severity: 'high',
    confidence: 94.8,
    cropAffected: 'Soybean (सोयाबीन)',
    detectedOn: 'Today, Just now',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80',
    recommendations: [
      'Remove and destroy infected plants immediately',
      'Spray Imidacloprid 17.8% SL (0.5 ml/L) to control whiteflies',
      'Maintain weed-free field borders',
    ],
  },
  earlyBlight: {
    id: 'diag-eb-03',
    diseaseName: 'Early Blight',
    diseaseType: 'Fungal Disease',
    severity: 'medium',
    confidence: 89.2,
    cropAffected: 'Tomato (टमाटर)',
    detectedOn: 'Today, Just now',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80',
    recommendations: [
      'Prune lower infected foliage to increase airflow',
      'Apply Mancozeb or Copper Oxychloride spray',
      'Avoid overhead watering',
    ],
  },
  healthyCrop: {
    id: 'diag-healthy-04',
    diseaseName: 'Healthy Crop',
    diseaseType: 'No Disease Detected',
    severity: 'low',
    confidence: 98.1,
    cropAffected: 'Wheat (गेहूं)',
    detectedOn: 'Today, Just now',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    recommendations: [
      'Continue standard irrigation schedule',
      'Apply scheduled nitrogen top-dressing',
      'Monitor weekly for pest activity',
    ],
  },
};
