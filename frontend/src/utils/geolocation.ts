/**
 * Browser Geolocation & Reverse Geocoding Utility for FasalSetu
 * =============================================================
 * Auto-fetches real GPS coordinates from the browser navigator,
 * resolves Indian State, District, and Village using reverse-geocoding,
 * and falls back to coordinate boundaries when offline.
 */

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  village?: string;
  displayName: string;
  isApproximate?: boolean;
}

// Canonical state centers and bounding boxes for reliable Indian territory mapping
const INDIAN_STATES_COORDINATES: Array<{
  state: string;
  defaultDistrict: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}> = [
  { state: 'Telangana', defaultDistrict: 'Hyderabad', minLat: 15.8, maxLat: 19.9, minLng: 77.2, maxLng: 81.8 },
  { state: 'Andhra Pradesh', defaultDistrict: 'Guntur', minLat: 12.6, maxLat: 19.1, minLng: 76.7, maxLng: 84.7 },
  { state: 'Maharashtra', defaultDistrict: 'Pune', minLat: 15.6, maxLat: 22.0, minLng: 72.6, maxLng: 80.9 },
  { state: 'Karnataka', defaultDistrict: 'Bengaluru Rural', minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.6 },
  { state: 'Gujarat', defaultDistrict: 'Ahmedabad', minLat: 20.1, maxLat: 24.7, minLng: 68.1, maxLng: 74.5 },
  { state: 'Rajasthan', defaultDistrict: 'Jaipur', minLat: 23.3, maxLat: 30.2, minLng: 69.5, maxLng: 78.3 },
  { state: 'Madhya Pradesh', defaultDistrict: 'Indore', minLat: 21.1, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 },
  { state: 'Uttar Pradesh', defaultDistrict: 'Lucknow', minLat: 23.9, maxLat: 30.4, minLng: 77.1, maxLng: 84.6 },
  { state: 'Punjab', defaultDistrict: 'Ludhiana', minLat: 29.5, maxLat: 32.5, minLng: 73.8, maxLng: 76.9 },
  { state: 'Haryana', defaultDistrict: 'Karnal', minLat: 27.6, maxLat: 30.9, minLng: 74.5, maxLng: 77.6 },
  { state: 'Bihar', defaultDistrict: 'Patna', minLat: 24.3, maxLat: 27.5, minLng: 83.3, maxLng: 88.3 },
];

/**
 * Promisified browser navigator.geolocation
 */
export const getBrowserCoordinates = (timeoutMs = 7000): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * Fallback heuristic matching coordinates to Indian states
 */
export const guessIndianStateFromCoords = (lat: number, lng: number): { state: string; district: string } => {
  for (const box of INDIAN_STATES_COORDINATES) {
    if (lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng) {
      return { state: box.state, district: box.defaultDistrict };
    }
  }
  // Default to Telangana if within general Indian subcontinent
  return { state: 'Telangana', defaultDistrict: 'Hyderabad' };
};

/**
 * Reverse-geocode latitude and longitude into friendly district, state, and address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<DetectedLocation> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const stateName = addr.state || '';
      const districtName = addr.state_district || addr.county || addr.city || addr.town || addr.district || '';
      const villageName = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || '';

      const matchedState = INDIAN_STATES_COORDINATES.find(
        (s) => stateName.toLowerCase().includes(s.state.toLowerCase()) || s.state.toLowerCase().includes(stateName.toLowerCase())
      );

      const finalState = matchedState ? matchedState.state : (stateName || 'Telangana');
      const finalDistrict = districtName || (matchedState ? matchedState.defaultDistrict : 'Hyderabad');

      const displayName = villageName
        ? `${villageName}, ${finalDistrict}`
        : `${finalDistrict}, ${finalState}`;

      return {
        latitude: lat,
        longitude: lng,
        state: finalState,
        district: finalDistrict,
        village: villageName,
        displayName,
        isApproximate: false,
      };
    }
  } catch (err) {
    console.warn('[Geolocation] Reverse geocoding failed or timed out; using coordinate approximation:', err);
  }

  // Fallback: Coordinate bounding box guess
  const guess = guessIndianStateFromCoords(lat, lng);
  return {
    latitude: lat,
    longitude: lng,
    state: guess.state,
    district: guess.district,
    village: 'Local Farmland',
    displayName: `${guess.district}, ${guess.state} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
    isApproximate: true,
  };
};

/**
 * Convenience all-in-one location fetcher
 */
export const autoFetchLocation = async (): Promise<DetectedLocation> => {
  const coords = await getBrowserCoordinates();
  const loc = await reverseGeocode(coords.latitude, coords.longitude);
  saveStoredLocation(loc);
  return loc;
};

const STORAGE_KEY = 'fasalsetu_user_location';

export const saveStoredLocation = (loc: DetectedLocation): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    window.dispatchEvent(new CustomEvent('fasalsetu_location_updated', { detail: loc }));
  } catch (e) {
    console.warn('Could not persist location to localStorage', e);
  }
};

export const getStoredLocation = (): DetectedLocation | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
