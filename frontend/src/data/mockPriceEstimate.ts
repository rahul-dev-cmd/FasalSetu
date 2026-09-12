/**
 * Mock Market Price Estimation for Crop Lot Listings
 * Used in Create Crop Lot Step 3: Review
 */

export interface PriceEstimateData {
  cropType: string;
  grade: string;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  unit: string;
  basisText: string;
}

export const mockPriceEstimate: PriceEstimateData = {
  cropType: 'Rice',
  grade: 'A (Premium)',
  minPricePerQuintal: 1900,
  maxPricePerQuintal: 2050,
  unit: 'quintal',
  basisText: 'Based on current mandi rates in your region',
};

export const getEstimatedPriceForCrop = (cropType: string, grade: string): PriceEstimateData => {
  if (cropType.toLowerCase().includes('wheat')) {
    return {
      cropType,
      grade,
      minPricePerQuintal: 2150,
      maxPricePerQuintal: 2300,
      unit: 'quintal',
      basisText: 'Based on current mandi rates in your region',
    };
  }
  if (cropType.toLowerCase().includes('cotton')) {
    return {
      cropType,
      grade,
      minPricePerQuintal: 6800,
      maxPricePerQuintal: 7400,
      unit: 'quintal',
      basisText: 'Based on current APMC spot rates in your region',
    };
  }
  return mockPriceEstimate;
};
