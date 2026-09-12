/**
 * FasalSetu Unified API Client Service
 * =====================================
 * Connects the React frontend to the FastAPI backend at /api.
 * Automatically injects JWT Bearer tokens from localStorage.
 */

const API_BASE_URL = ''; // Proxied via Vite to http://127.0.0.1:8000

export const TOKEN_STORAGE_KEY = 'fasalsetu_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update stored token:', err);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getStoredToken();
  const headers = new Headers(customHeaders);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    if (data && typeof data === 'object') {
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors
          .map((e: any) => (e.message ? `${e.field ? e.field + ': ' : ''}${e.message}` : JSON.stringify(e)))
          .join(', ');
      } else if (data.detail) {
        errorMessage = Array.isArray(data.detail)
          ? data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          : data.detail;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

// ── Auth APIs ────────────────────────────────────────────────────────
export const authApi = {
  signup: (payload: { phone: string; password: string; role: string; name?: string }) =>
    request<{ access_token: string; token_type: string; role: string; user: any }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { phone: string; password: string; role: string }) =>
    request<{ access_token: string; token_type: string; role: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<any>('/api/auth/me', { method: 'GET' }),
};

// ── Government Command Center APIs ───────────────────────────────────
export const governmentApi = {
  // Reports (Feature 15c)
  getReports: (params?: { type?: string; district?: string; status?: string }) =>
    request<any[]>('/api/government/reports', { method: 'GET', params }),

  getReportDetail: (id: number) =>
    request<any>(`/api/government/reports/${id}`, { method: 'GET' }),

  generateReport: (payload: { type: string; district: string; date_range: string; format: string }) =>
    request<any>('/api/government/reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDownloadUrl: (id: number) => `/api/government/reports/${id}/download`,

  downloadReport: async (id: number, filename?: string) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/government/reports/${id}/download`, { headers });
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || `report_${id}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  },

  // Risk Map & Hotspots (Feature 15b)
  getFilters: () => request<any>('/api/government/risk-map/filters', { method: 'GET' }),

  getHotspots: (params?: { crop?: string; risk_level?: string; time_range?: string }) =>
    request<any[]>('/api/government/risk-map/hotspots', { method: 'GET', params }),

  getHotspotDetail: (id: number) =>
    request<any>(`/api/government/risk-map/hotspots/${id}`, { method: 'GET' }),

  getMarkers: () => request<any[]>('/api/government/risk-map/markers', { method: 'GET' }),

  getDistrictZones: () => request<any[]>('/api/government/risk-map/district-zones', { method: 'GET' }),
};

// ── Government Interventions (Feature 15d) ───────────────────────────
export const governmentInterventionsApi = {
  getInterventions: (params?: {
    district?: string;
    team?: string;
    category?: string;
    status?: string;
    crop?: string;
  }) => request<any[]>('/api/government/interventions', { method: 'GET', params }),

  getStats: () => request<any>('/api/government/interventions/stats', { method: 'GET' }),

  getDetail: (idOrUid: string | number) =>
    request<any>(`/api/government/interventions/${idOrUid}`, { method: 'GET' }),

  createIntervention: (payload: {
    district: string;
    mandal: string;
    crop: string;
    issue_type: string;
    risk_level: string;
    title: string;
    description: string;
    status?: string;
    team?: string | null;
    team_lead?: string | null;
    team_contact?: string | null;
    due_date?: string | null;
    affected_hectares?: number;
    farmers_count?: number;
  }) =>
    request<any>('/api/government/interventions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateIntervention: (idOrUid: string | number, payload: any) =>
    request<any>(`/api/government/interventions/${idOrUid}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateStatus: (
    idOrUid: string | number,
    payload: {
      status: string;
      resolved_by?: string | null;
      progress_percent?: number | null;
      log_message?: string | null;
    }
  ) =>
    request<any>(`/api/government/interventions/${idOrUid}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteIntervention: (idOrUid: string | number) =>
    request<void>(`/api/government/interventions/${idOrUid}`, {
      method: 'DELETE',
    }),
};

// ── Farm Profile & Operations (Feature 14) ───────────────────────────
export const farmProfileApi = {
  getProfile: () => request<any>('/api/farm-profile', { method: 'GET' }),

  createProfile: (payload: {
    crop_type: string;
    land_size: number;
    land_unit?: string;
    location_name: string;
    latitude: number;
    longitude: number;
    farming_type?: string;
    soil_type?: string;
    irrigation_source?: string;
    preferred_language?: string;
    sms_notifications?: boolean;
    whatsapp_notifications?: boolean;
  }) =>
    request<any>('/api/farm-profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: Partial<{
    crop_type: string;
    land_size: number;
    land_unit: string;
    location_name: string;
    latitude: number;
    longitude: number;
    farming_type: string;
    soil_type: string;
    irrigation_source: string;
    preferred_language: string;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
  }>) =>
    request<any>('/api/farm-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getValidCrops: () => request<{ valid_crops: string[] }>('/api/valid-crops', { method: 'GET' }),
};

// ── Buyer Profile (Feature 16a) ──────────────────────────────────────
export const buyerProfileApi = {
  getOwnProfile: () => request<any>('/api/buyer-profile', { method: 'GET' }),

  createProfile: (payload: {
    company_name: string;
    tags?: string[];
    location?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    request<any>('/api/buyer-profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: Partial<{
    company_name: string;
    tags: string[];
    location: string;
    latitude: number;
    longitude: number;
  }>) =>
    request<any>('/api/buyer-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getPublicProfile: (buyerUserId: number) =>
    request<any>(`/api/buyer-profile/${buyerUserId}`, { method: 'GET' }),
};

export interface AlternativeCropRecommendation {
  crop: string;
  confidence: number;
}

export interface CropRecommendationResponse {
  recommended_crop: string;
  confidence: number;
  alternatives: AlternativeCropRecommendation[];
}

// ── Decision Support & Agronomic Engines ──────────────────────────────
export const advisoryApi = {
  // Irrigation (Feature 12)
  getIrrigationAdvisory: (params: {
    latitude: number;
    longitude: number;
    crop?: string;
    crop_type?: string;
    soil_type?: string;
  }) => {
    const { crop, crop_type, ...rest } = params;
    return request<any>('/api/irrigation-advisory', {
      method: 'GET',
      params: { ...rest, crop: crop || crop_type },
    });
  },

  // Yield Estimate (Feature 13)
  getYieldEstimate: (params: {
    crop?: string;
    crop_name?: string;
    land_size_acres: number;
    sowing_date: string;
    state?: string;
  }) => {
    const { crop, crop_name, ...rest } = params;
    return request<any>('/api/yield-estimate', {
      method: 'GET',
      params: { ...rest, crop: crop || crop_name },
    });
  },

  // Crop Recommendation (Feature 1)
  getCropRecommendation: (payload: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }) =>
    request<CropRecommendationResponse>('/api/crop-recommendation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Market Prices (Feature 2)
  getMarketPrices: (params: { crop: string; state?: string; limit?: number }) =>
    request<any>('/api/market-prices', { method: 'GET', params }),

  // Farmer Q&A (Features 3 & 4)
  askFarmerQA: (payload: { query: string; session_id?: string; language_preference?: string }) =>
    request<any>('/api/farmer-qa', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Voice Q&A (Feature 3B)
  askFarmerVoiceQA: (formData: FormData) =>
    request<any>('/api/farmer-qa/voice', {
      method: 'POST',
      body: formData,
    }),

  // Crop Diagnosis (Feature 5)
  diagnoseCrop: (formData: FormData) =>
    request<any>('/api/crop-diagnosis', {
      method: 'POST',
      body: formData,
    }),

  // Feedback (Feature 8)
  submitFeedback: (payload: {
    log_id: number;
    log_type: 'qa' | 'diagnosis';
    rating: 'up' | 'down';
    comment?: string;
  }) =>
    request<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ── Marketplace, Negotiation & Transactions ──────────────────────────
export const marketplaceApi = {
  // Listings (Features 7 & 10)
  getListings: (params?: { crop?: string; status?: string }) =>
    request<any[]>('/api/listings', { method: 'GET', params }),

  getListing: (id: number) =>
    request<any>(`/api/listings/${id}`, { method: 'GET' }),

  createListing: (payload: {
    crop: string;
    quantity: number;
    unit?: string;
    asking_price: number;
  }) =>
    request<any>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyListings: () =>
    request<any[]>('/api/my/listings', { method: 'GET' }),

  // Offers & Negotiation (Features 7 & 10)
  submitOffer: (listingId: number, payload: {
    amount: number;
    made_by: 'farmer' | 'buyer';
    parent_offer_id?: number | null;
  }) =>
    request<any>(`/api/listings/${listingId}/offers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  actionOffer: (listingId: number, offerId: number, action: 'accept' | 'reject') =>
    request<any>(`/api/listings/${listingId}/offers/${offerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  getMyOffers: () =>
    request<any[]>('/api/my/offers', { method: 'GET' }),

  // AI Negotiation Advisor (Feature 11)
  chatNegotiation: (listingId: number, message: string) =>
    request<any>(`/api/listings/${listingId}/negotiation-chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Transactions (Feature 17)
  getTransaction: (listingId: number) =>
    request<any>(`/api/transactions/${listingId}`, { method: 'GET' }),

  advanceTransaction: (listingId: number, action: 'confirm_pickup' | 'confirm_payment') =>
    request<any>(`/api/transactions/${listingId}/advance`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  getMyTransactions: () =>
    request<any[]>('/api/my/transactions', { method: 'GET' }),
};
