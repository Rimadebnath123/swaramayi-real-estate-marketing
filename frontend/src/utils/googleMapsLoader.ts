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

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY_MISSING'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const scriptId = 'google-maps-js-sdk';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if ((window as any).google && (window as any).google.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error('Google Maps script loaded but window.google.maps is undefined'));
        }
      });
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,routes,geometry,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps script failed to initialize window.google.maps'));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Geocode address to lat/lng with caching
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || !address.trim()) return null;
  const cleanAddr = address.trim().toLowerCase();

  if (geocodeCache.has(cleanAddr)) {
    return geocodeCache.get(cleanAddr)!;
  }

  try {
    const maps = await loadGoogleMapsApi();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const coords = { lat: loc.lat(), lng: loc.lng() };
          geocodeCache.set(cleanAddr, coords);
          resolve(coords);
        } else {
          console.warn(`Google Geocoding failed for "${address}": status = ${status}`);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn('Geocoding service error:', err);
    return null;
  }
};
