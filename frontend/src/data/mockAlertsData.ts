export type AlertType = 'offer' | 'crop-health' | 'weather' | 'payment';

export type AlertDateGroup = 'today' | 'yesterday' | 'this_week';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  dateGroup: AlertDateGroup;
  isRead: boolean;
  targetAction: 'matched-buyers' | 'negotiation' | 'crop-health-result' | 'weather-irrigation' | 'transaction-status';
}

export const initialMockAlerts: AlertItem[] = [
  // ── TODAY ──────────────────────────────────────────────────────────
  {
    id: 'alert-1',
    type: 'offer',
    title: 'New offer received on your Rice lot',
    description: 'Shree Balaji Agro Foods offered ₹1,980/quintal for your 50 quintal Rice lot',
    timestamp: '2 hours ago',
    dateGroup: 'today',
    isRead: false,
    targetAction: 'matched-buyers',
  },
  {
    id: 'alert-2',
    type: 'crop-health',
    title: 'Disease risk detected in your Cotton field',
    description: 'Rice Blast symptoms found — check recommended action and spraying protocol',
    timestamp: '4 hours ago',
    dateGroup: 'today',
    isRead: false,
    targetAction: 'crop-health-result',
  },
  {
    id: 'alert-3',
    type: 'weather',
    title: 'Rain expected in Kothapet tomorrow',
    description: 'Light irrigation recommended before Nov 21 to optimize soil absorption',
    timestamp: '6 hours ago',
    dateGroup: 'today',
    isRead: true,
    targetAction: 'weather-irrigation',
  },

  // ── YESTERDAY ───────────────────────────────────────────────────────
  {
    id: 'alert-4',
    type: 'payment',
    title: 'Payment received',
    description: '₹1,02,500 credited to SBI A/C ***4892 for your Wheat lot sale',
    timestamp: '1 day ago',
    dateGroup: 'yesterday',
    isRead: true,
    targetAction: 'transaction-status',
  },
  {
    id: 'alert-5',
    type: 'offer',
    title: 'GreenFields Traders countered your ask',
    description: 'New counter offer: ₹1,920/quintal for 20 quintals Cotton · Grade B',
    timestamp: '1 day ago',
    dateGroup: 'yesterday',
    isRead: true,
    targetAction: 'negotiation',
  },

  // ── THIS WEEK ───────────────────────────────────────────────────────
  {
    id: 'alert-6',
    type: 'crop-health',
    title: 'Soil moisture low in your field',
    description: 'Root zone moisture dropped to 34% — Irrigation recommended within 2-3 days',
    timestamp: '3 days ago',
    dateGroup: 'this_week',
    isRead: true,
    targetAction: 'weather-irrigation',
  },
  {
    id: 'alert-7',
    type: 'weather',
    title: 'Heatwave alert for this week',
    description: 'Max temperature expected to reach 38°C — Apply foliar spray during early mornings',
    timestamp: '4 days ago',
    dateGroup: 'this_week',
    isRead: true,
    targetAction: 'weather-irrigation',
  },
  {
    id: 'alert-8',
    type: 'offer',
    title: 'Your Rice lot matched with 3 new buyers',
    description: 'AgriFresh Retail, KisanDirect, and Balaji Agro matched your Grade A listing',
    timestamp: '5 days ago',
    dateGroup: 'this_week',
    isRead: true,
    targetAction: 'matched-buyers',
  },
];
