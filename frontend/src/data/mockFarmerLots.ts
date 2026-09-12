export type LotStatus = 'Active' | 'In Negotiation' | 'Sold' | 'Draft';

export interface FarmerLotItem {
  id: string;
  cropName: string;
  grade: string;
  quantity: string;
  location: string;
  dateText: string;
  status: LotStatus;
  offersCount?: number;
  bestOfferPrice?: number;
  negotiationBuyer?: string;
  soldPrice?: number;
  soldTo?: string;
  imageUrl: string;
  isDraft?: boolean;
  draftStep?: number;
  draftNote?: string;
}

export const mockFarmerLots: FarmerLotItem[] = [
  {
    id: 'lot-rice-1',
    cropName: 'Rice',
    grade: 'Grade A (Premium)',
    quantity: '50 Quintals',
    location: 'Kothapet, Telangana',
    dateText: 'Listed on Nov 10, 2025',
    status: 'Active',
    offersCount: 3,
    bestOfferPrice: 1980,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'lot-cotton-2',
    cropName: 'Cotton',
    grade: 'Grade B',
    quantity: '20 Quintals',
    location: 'Warangal Rural, Telangana',
    dateText: 'Listed on Nov 8, 2025',
    status: 'In Negotiation',
    negotiationBuyer: 'GreenFields Traders',
    bestOfferPrice: 6800,
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'lot-wheat-3',
    cropName: 'Wheat',
    grade: 'Grade A',
    quantity: '35 Quintals',
    location: 'Nizamabad, Telangana',
    dateText: 'Sold on Nov 2, 2025',
    status: 'Sold',
    soldPrice: 1850,
    soldTo: 'AgriFresh Retail',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'lot-chilli-4',
    cropName: 'Chilli',
    grade: 'Grade A (Teja)',
    quantity: '10 Quintals',
    location: 'Khammam, Telangana',
    dateText: 'Last edited yesterday',
    status: 'Draft',
    isDraft: true,
    draftStep: 2,
    draftNote: 'Incomplete listing (photos pending)',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'lot-maize-5',
    cropName: 'Maize',
    grade: 'Grade B',
    quantity: '40 Quintals',
    location: 'Karimnagar, Telangana',
    dateText: 'Listed on Nov 11, 2025',
    status: 'Active',
    offersCount: 2,
    bestOfferPrice: 1650,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80',
  },
];
