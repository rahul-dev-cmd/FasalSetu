import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & Auth Screens
import LandingPageScreen from './screens/LandingPageScreen';
import AuthScreen from './screens/AuthScreen';

// Farmer Screens
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import FarmDetailsScreen, { FarmDetailsData } from './screens/FarmDetailsScreen';
import FarmerDashboardScreen from './screens/FarmerDashboardScreen';
import CropHealthCheckScreen from './screens/CropHealthCheckScreen';
import CropHealthResultScreen from './screens/CropHealthResultScreen';
import CropAdvisorScreen from './screens/CropAdvisorScreen';
import WaterIrrigationScreen from './screens/WaterIrrigationScreen';
import YieldEstimateScreen from './screens/YieldEstimateScreen';
import CreateCropLotScreen, { LotFormData } from './screens/CreateCropLotScreen';
import CreateCropLotPhotosScreen, { PhotoItem } from './screens/CreateCropLotPhotosScreen';
import CreateCropLotReviewScreen from './screens/CreateCropLotReviewScreen';
import MatchedBuyersScreen from './screens/MatchedBuyersScreen';
import NegotiationScreen from './screens/NegotiationScreen';
import TransactionStatusScreen from './screens/TransactionStatusScreen';
import MyLotsScreen from './screens/MyLotsScreen';
import AlertsScreen from './screens/AlertsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Buyer Screens
import BuyerDashboardScreen from './screens/BuyerDashboardScreen';
import BuyerBrowseScreen from './screens/BuyerBrowseScreen';
import BuyerOffersScreen from './screens/BuyerOffersScreen';
import BuyerInsightsScreen from './screens/BuyerInsightsScreen';
import BuyerAlertsScreen from './screens/BuyerAlertsScreen';
import BuyerProfileScreen from './screens/BuyerProfileScreen';

// Government Screens
import GovernmentDashboardScreen from './screens/GovernmentDashboardScreen';
import HotspotAnalysisScreen from './screens/HotspotAnalysisScreen';
import ReportsScreen from './screens/ReportsScreen';
import InterventionsScreen from './screens/InterventionsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Mock Data
import { initialMockAlerts, AlertItem } from './data/mockAlertsData';
import { mockFarmerData, FarmerDashboardData } from './data/mockFarmerData';
import { mockDiagnosisResult } from './data/mockDiagnosisResult';
import { mockIrrigationData } from './data/mockIrrigationData';
import { mockYieldData } from './data/mockYieldData';
import { mockBuyerOffers } from './data/mockBuyerOffers';

// ── Farmer Onboarding Flow (Language + Farm Details for New Farmers) ──
function FarmerOnboardingWrapper({
  onComplete,
}: {
  onComplete: (data: FarmDetailsData) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // If returning user, skip onboarding directly to dashboard
  if (!user.isNewUser) {
    return <Navigate to="/farmer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-farmBg flex flex-col font-sans">
      {step === 1 ? (
        <LanguageSelectionScreen
          forceMobile={false}
          onContinue={(_lang) => {
            setStep(2);
          }}
        />
      ) : (
        <FarmDetailsScreen
          forceMobile={false}
          onBack={() => setStep(1)}
          onContinue={(data) => {
            onComplete(data);
            navigate('/farmer/dashboard', { replace: true });
          }}
        />
      )}
    </div>
  );
}

// ── Main App Shell with Route Switcher ──────────────────────────────
function AppContent() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Persistent session states for farmer wizard & actions
  const [farmerAlerts, setFarmerAlerts] = useState<AlertItem[]>(initialMockAlerts);
  const [dashboardData, setDashboardData] = useState<FarmerDashboardData>(mockFarmerData);
  const [analyzedCropImage, setAnalyzedCropImage] = useState<{ url: string; fileName: string } | null>(null);
  const [createdLotData, setCreatedLotData] = useState<LotFormData | null>({
    cropType: 'Rice',
    quantity: '50',
    quantityUnit: 'quintals',
    grade: 'A (Premium)',
    harvestDate: '2025-11-20',
    location: 'Kothapet, Telangana',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoItem[]>([
    {
      id: 'photo-default-1',
      name: 'Golden_Paddy_Grains_01.jpg',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      isCover: true,
    },
    {
      id: 'photo-default-2',
      name: 'Rice_Field_Lot_02.jpg',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'photo-default-3',
      name: 'Harvested_Grain_Bag_03.jpg',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    },
  ]);
  const [selectedBuyer, setSelectedBuyer] = useState<typeof mockBuyerOffers[0] | null>(mockBuyerOffers[0]);
  const [acceptedPrice, setAcceptedPrice] = useState<number>(2050);

  // Handle farm details completion from onboarding
  const handleOnboardingComplete = (data: FarmDetailsData) => {
    setDashboardData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        crop: data.crop,
        landSize: `${data.landSize} ${data.landUnit}`,
        location: data.location,
      },
    }));
  };

  // Farmer Home Quick Actions Navigator
  const handleFarmerNavigateAction = (actionId: string) => {
    if (actionId === 'crop-health') {
      navigate('/farmer/crop-health');
    } else if (actionId === 'crop-advisor') {
      navigate('/farmer/crop-advisor');
    } else if (actionId === 'water-irrigation') {
      navigate('/farmer/irrigation');
    } else if (actionId === 'yield-estimate') {
      navigate('/farmer/yield');
    } else if (actionId === 'my-lots') {
      navigate('/farmer/lots');
    } else if (actionId === 'alerts') {
      navigate('/farmer/alerts');
    } else if (actionId === 'profile') {
      navigate('/farmer/profile');
    } else if (actionId === 'market') {
      navigate('/farmer/market');
    }
  };

  const handleFarmerLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      {/* ═══════════════════════════════════════════════════════════
          1. PUBLIC ROUTES (No Login Required)
         ═══════════════════════════════════════════════════════════ */}
      <Route
        path="/"
        element={
          <LandingPageScreen
            onFarmerGetStarted={() => navigate('/login?role=farmer&mode=signup')}
            onFarmerAuth={(tab = 'login') => navigate(`/login?role=farmer&mode=${tab}`)}
            onBuyerAuth={(tab = 'login') => navigate(`/login?role=buyer&mode=${tab}`)}
            onGovtLogin={() => navigate('/login?role=government&mode=login')}
          />
        }
      />

      <Route
        path="/login"
        element={
          <AuthScreen
            onBack={() => navigate('/')}
          />
        }
      />

      {/* Legacy/convenience government login redirect to /login?role=government */}
      <Route
        path="/login/government"
        element={<Navigate to="/login?role=government&mode=login" replace />}
      />

      {/* ═══════════════════════════════════════════════════════════
          2. PROTECTED FARMER ROUTES (Requires role='farmer')
         ═══════════════════════════════════════════════════════════ */}
      <Route
        path="/farmer/onboarding"
        element={<Navigate to="/farmer/dashboard" replace />}
      />

      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboardScreen
              initialData={dashboardData}
              onNavigateAction={handleFarmerNavigateAction}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/crop-health"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CropHealthCheckScreen
              onBack={() => navigate('/farmer/dashboard')}
              onAnalyzeComplete={(imageData) => {
                setAnalyzedCropImage(imageData);
                navigate('/farmer/crop-health/result');
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/crop-health/result"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CropHealthResultScreen
              capturedImage={analyzedCropImage?.url}
              diagnosisData={mockDiagnosisResult}
              onBack={() => navigate('/farmer/crop-health')}
              onSaveReport={() => navigate('/farmer/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/crop-advisor"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CropAdvisorScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/irrigation"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <WaterIrrigationScreen
              data={mockIrrigationData}
              onBack={() => navigate('/farmer/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/yield"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <YieldEstimateScreen
              data={mockYieldData}
              onBack={() => navigate('/farmer/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      {/* Create Crop Lot 3-Step Wizard */}
      <Route
        path="/farmer/create-lot"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CreateCropLotScreen
              initialData={createdLotData || undefined}
              onBack={() => navigate('/farmer/dashboard')}
              onNext={(data) => {
                setCreatedLotData(data);
                navigate('/farmer/create-lot/photos');
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/create-lot/photos"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CreateCropLotPhotosScreen
              lotDetails={createdLotData}
              initialPhotos={uploadedPhotos}
              onBack={() => navigate('/farmer/create-lot')}
              onNext={(photos) => {
                setUploadedPhotos(photos);
                navigate('/farmer/create-lot/review');
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/create-lot/review"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CreateCropLotReviewScreen
              lotDetails={createdLotData}
              photos={uploadedPhotos}
              onBack={() => navigate('/farmer/create-lot/photos')}
              onEditStep1={() => navigate('/farmer/create-lot')}
              onPublishSuccess={() => navigate('/farmer/market')}
            />
          </ProtectedRoute>
        }
      />

      {/* Marketplace & Bidding */}
      <Route
        path="/farmer/market"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <MatchedBuyersScreen
              buyers={mockBuyerOffers}
              lotSummary={
                createdLotData
                  ? {
                      cropType: createdLotData.cropType,
                      quantity: createdLotData.quantity,
                      unit: createdLotData.quantityUnit,
                      grade: createdLotData.grade,
                    }
                  : undefined
              }
              onBack={() => navigate('/farmer/dashboard')}
              onSelectBuyer={(buyer) => {
                setSelectedBuyer(buyer);
                navigate('/farmer/negotiation');
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/negotiation"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <NegotiationScreen
              buyer={selectedBuyer || mockBuyerOffers[0]}
              lotSummary={
                createdLotData
                  ? {
                      cropType: createdLotData.cropType,
                      quantity: createdLotData.quantity,
                      unit: createdLotData.quantityUnit,
                    }
                  : undefined
              }
              onBack={() => navigate('/farmer/market')}
              onAccept={(buyer, finalPrice) => {
                setSelectedBuyer(buyer);
                setAcceptedPrice(finalPrice);
                navigate('/farmer/transaction');
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/transaction"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <TransactionStatusScreen
              buyer={selectedBuyer || mockBuyerOffers[0]}
              agreedPrice={acceptedPrice}
              lotSummary={
                createdLotData
                  ? {
                      cropType: createdLotData.cropType,
                      quantity: createdLotData.quantity,
                      unit: createdLotData.quantityUnit,
                      location: createdLotData.location,
                    }
                  : undefined
              }
              onBack={() => navigate('/farmer/market')}
              onComplete={() => navigate('/farmer/dashboard')}
            />
          </ProtectedRoute>
        }
      />

      {/* My Lots Screen */}
      <Route
        path="/farmer/lots"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <MyLotsScreen
              onNavigateHome={() => navigate('/farmer/dashboard')}
              onNavigateMarket={() => navigate('/farmer/market')}
              onCreateLot={() => navigate('/farmer/create-lot')}
              onViewOffers={() => navigate('/farmer/market')}
              onViewNegotiation={() => navigate('/farmer/negotiation')}
              onViewTransaction={() => navigate('/farmer/transaction')}
              onContinueDraft={() => navigate('/farmer/create-lot/photos')}
              onNavigateAlerts={() => navigate('/farmer/alerts')}
              onNavigateProfile={() => navigate('/farmer/profile')}
              unreadAlertsCount={farmerAlerts.filter((a) => !a.isRead).length}
            />
          </ProtectedRoute>
        }
      />

      {/* Alerts Screen */}
      <Route
        path="/farmer/alerts"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <AlertsScreen
              alerts={farmerAlerts}
              onAlertsChange={(updated) => {
                setFarmerAlerts(updated);
                setDashboardData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    unreadAlertsCount: updated.filter((a) => !a.isRead).length,
                  },
                }));
              }}
              onNavigateHome={() => navigate('/farmer/dashboard')}
              onNavigateMarket={() => navigate('/farmer/market')}
              onNavigateLots={() => navigate('/farmer/lots')}
              onNavigateOffers={() => navigate('/farmer/market')}
              onNavigateNegotiation={() => navigate('/farmer/negotiation')}
              onNavigateCropHealthResult={() => navigate('/farmer/crop-health/result')}
              onNavigateWeather={() => navigate('/farmer/irrigation')}
              onNavigateTransaction={() => navigate('/farmer/transaction')}
              onNavigateProfile={() => navigate('/farmer/profile')}
            />
          </ProtectedRoute>
        }
      />

      {/* Profile Screen */}
      <Route
        path="/farmer/profile"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <ProfileScreen
              unreadAlertsCount={farmerAlerts.filter((a) => !a.isRead).length}
              onNavigateHome={() => navigate('/farmer/dashboard')}
              onNavigateMarket={() => navigate('/farmer/market')}
              onNavigateLots={() => navigate('/farmer/lots')}
              onNavigateAlerts={() => navigate('/farmer/alerts')}
              onLogout={handleFarmerLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* ═══════════════════════════════════════════════════════════
          3. PROTECTED BUYER ROUTES (Requires role='buyer')
         ═══════════════════════════════════════════════════════════ */}
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboardScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/browse"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerBrowseScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/offers"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOffersScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/deals"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboardScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/insights"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerInsightsScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/alerts"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerAlertsScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerProfileScreen />
          </ProtectedRoute>
        }
      />

      {/* ═══════════════════════════════════════════════════════════
          4. PROTECTED GOVERNMENT ROUTES (Requires role='government')
         ═══════════════════════════════════════════════════════════ */}
      <Route
        path="/government/risk-map"
        element={
          <ProtectedRoute allowedRoles={['government']}>
            <GovernmentDashboardScreen
              initialNav="risk-map"
              onNavChange={(navId) => navigate(`/government/${navId}`)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/government/hotspots"
        element={
          <ProtectedRoute allowedRoles={['government']}>
            <HotspotAnalysisScreen
              onNavChange={(navId) => navigate(`/government/${navId}`)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/government/reports"
        element={
          <ProtectedRoute allowedRoles={['government']}>
            <ReportsScreen
              onNavChange={(navId) => navigate(`/government/${navId}`)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/government/interventions"
        element={
          <ProtectedRoute allowedRoles={['government']}>
            <InterventionsScreen
              onNavChange={(navId) => navigate(`/government/${navId}`)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/government/settings"
        element={
          <ProtectedRoute allowedRoles={['government']}>
            <SettingsScreen
              onNavChange={(navId) => navigate(`/government/${navId}`)}
            />
          </ProtectedRoute>
        }
      />

      {/* ═══════════════════════════════════════════════════════════
          FALLBACK / CATCH-ALL ROUTE
         ═══════════════════════════════════════════════════════════ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
