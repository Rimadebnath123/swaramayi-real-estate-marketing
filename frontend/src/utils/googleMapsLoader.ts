// Google Maps Script Loader & Geocoding Cache Utility

let googleMapsPromise: Promise<typeof google.maps> | null = null;
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export const getGoogleMapsApiKey = (): string => {
  return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
};

export const loadGoogleMapsApi = (): Promise<typeof google.maps> => {
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey || apiKey === 'YOUR_API_KEY' || !apiKey.startsWith('AIza')) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY_INVALID_OR_MISSING'));
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Authentication Failed. Auto-switching to Leaflet fallback.');
      googleMapsPromise = null;
      const scriptId = 'google-maps-js-sdk';
      const el = document.getElementById(scriptId);
      if (el) el.remove();
      reject(new Error('GOOGLE_MAPS_AUTH_FAILED'));
    };

    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if ((window as any).google && (window as any).google.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error('Google Maps SDK loaded but google.maps not found'));
        }
      });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps SDK')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=Function.prototype`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps SDK loaded but google.maps not found'));
      }
    };

    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps script. Check network or API key restrictions.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Geocode address to lat/lng with caching & OpenStreetMap fallback
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || !address.trim()) return null;
  const cleanAddr = address.trim().toLowerCase();

  if (geocodeCache.has(cleanAddr)) {
    return geocodeCache.get(cleanAddr)!;
  }

  // 1. Try Google Maps Geocoder if SDK loads
  try {
    const maps = await loadGoogleMapsApi();
    if (maps && maps.Geocoder) {
      const geocoder = new maps.Geocoder();
      const coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        });
      });

      if (coords) {
        geocodeCache.set(cleanAddr, coords);
        return coords;
      }
    }
  } catch (err) {
    // Google Maps API not available or key invalid, proceed to OSM fallback
  }

  // 2. Fallback to OpenStreetMap Nominatim Forward Geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'en' }
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data[0] && data[0].lat && data[0].lon) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        geocodeCache.set(cleanAddr, coords);
        return coords;
      }
    }
  } catch (osmErr) {
    console.warn(`All geocoding providers failed for "${address}":`, osmErr);
  }

  return null;
};
