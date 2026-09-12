/**
 * Mock Buyer Offers Data for Matched Buyers Screen
 * Used after a crop lot is published to show interested buyers
 */

export interface BuyerOffer {
  id: string;
  name: string;
  avatarInitial: string;
  avatarColor: string;
  verified: boolean;
  tags: string[];
  offerPrice: number;
  priceUnit: string;
  isBestPrice: boolean;
  rating: number;
  reviewCount: string;
  distanceKm: number;
}

export const mockBuyerOffers: BuyerOffer[] = [
  {
    id: 'buyer-001',
    name: 'Shree Balaji Agro Foods',
    avatarInitial: 'SB',
    avatarColor: '#0D9488', // teal
    verified: true,
    tags: ['Processor', 'Immediate Payment'],
    offerPrice: 1980,
    priceUnit: 'quintal',
    isBestPrice: true,
    rating: 4.8,
    reviewCount: '120+',
    distanceKm: 12,
  },
  {
    id: 'buyer-002',
    name: 'GreenFields Traders',
    avatarInitial: 'GF',
    avatarColor: '#7C3AED', // violet
    verified: true,
    tags: ['Wholesaler', 'Bulk Purchase'],
    offerPrice: 1920,
    priceUnit: 'quintal',
    isBestPrice: false,
    rating: 4.5,
    reviewCount: '85+',
    distanceKm: 28,
  },
  {
    id: 'buyer-003',
    name: 'AgriFresh Retail',
    avatarInitial: 'AR',
    avatarColor: '#DC2626', // red
    verified: true,
    tags: ['Retailer', 'Good Reputation'],
    offerPrice: 1860,
    priceUnit: 'quintal',
    isBestPrice: false,
    rating: 4.2,
    reviewCount: '60+',
    distanceKm: 45,
  },
];
