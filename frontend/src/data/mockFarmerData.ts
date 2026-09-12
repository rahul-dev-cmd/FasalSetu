export interface FarmerProfile {
  name: string;
  greetingName: string;
  location: string;
  isOnline: boolean;
  unreadAlertsCount: number;
  avatarText: string;
  crop: string;
  landSize: string;
}

export interface WeatherData {
  temperature: string;
  condition: string;
  maxTemp: string;
  minTemp: string;
}

export interface IrrigationData {
  status: 'Monitor' | 'Urgent' | 'Optimal';
  urgencyColor: string;
  description: string;
}

export interface CropRiskData {
  status: 'Low Risk' | 'Medium Risk' | 'High Risk';
  scoreColor: string;
  subtext: string;
}

export interface FarmerDashboardData {
  profile: FarmerProfile;
  weather: WeatherData;
  irrigation: IrrigationData;
  cropRisk: CropRiskData;
}

export const mockFarmerData: FarmerDashboardData = {
  profile: {
    name: 'Rameshwar Patil',
    greetingName: 'Ramesh ji',
    location: 'Kothapet, Telangana',
    isOnline: true,
    unreadAlertsCount: 2,
    avatarText: 'R',
    crop: 'Rice',
    landSize: '2.5 acres',
  },
  weather: {
    temperature: '32°C',
    condition: 'Sunny',
    maxTemp: '34°',
    minTemp: '24°',
  },
  irrigation: {
    status: 'Monitor',
    urgencyColor: '#FACC15', // Warning token
    description: 'Soil moisture is low. Light irrigation in 2–3 days.',
  },
  cropRisk: {
    status: 'Low Risk',
    scoreColor: '#22C55E', // Success token
    subtext: 'Your crop looks healthy',
  },
};

export default mockFarmerData;
