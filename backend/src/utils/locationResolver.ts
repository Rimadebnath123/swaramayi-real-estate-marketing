import fs from 'fs';
import path from 'path';

export interface CoordLocationEntry {
  locality: string;
  subLocality?: string;
  city?: string;
  county?: string;
  postcode?: string;
  full_address: string;
  searchText?: string;
}

const CACHE_PATH = fs.existsSync(path.resolve(process.cwd(), 'src', 'db', 'coordLocationCache.json'))
  ? path.resolve(process.cwd(), 'src', 'db', 'coordLocationCache.json')
  : path.resolve(process.cwd(), 'backend', 'src', 'db', 'coordLocationCache.json');

const coordCache = new Map<string, CoordLocationEntry>();
const pendingCoords = new Set<string>();
let queueRunning = false;
const fetchQueue: Array<{ key: string; lat: number; lng: number }> = [];

function loadCoordCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
      Object.entries(raw).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          coordCache.set(k, v as CoordLocationEntry);
        }
      });
    }
  } catch (err) {
    console.warn('[locationResolver] Failed to load coord cache:', err);
  }
}

loadCoordCache();

function persistCoordCache() {
  try {
    const obj: Record<string, CoordLocationEntry> = {};
    coordCache.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.warn('[locationResolver] Failed to persist coord cache:', err);
  }
}

export function isGenericLocation(loc?: string | null): boolean {
  if (!loc) return true;
  const low = String(loc).toLowerCase().trim();
  return (
    !low ||
    low === 'greater kolkata' ||
    low === 'kolkata' ||
    low === 'west bengal' ||
    low === 'india' ||
    low === 'unknown' ||
    low === 'n/a'
  );
}

export function parseCoordNumber(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const normalized = String(val).replace(',', '.').replace(/[^\d.-]/g, '').trim();
  if (!normalized) return null;
  const num = parseFloat(normalized);
  if (isNaN(num) || num === 0) return null;
  return num;
}

export function getCoordKey(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

// Normalize spelling differences common in Kolkata / North 24 Parganas localities
export function normalizeLocationText(input: string): string {
  return String(input || '')
    .toLowerCase()
    .replace(/barrackpur/g, 'barrackpore')
    .replace(/madhamgram/g, 'madhyamgram')
    .replace(/ch?amp?adali|chapadali/g, 'champadali')
    .replace(/dakbangl[ao]w|dakbungl?ow/g, 'dakbungalow')
    .replace(/dumdum/g, 'dum dum')
    .replace(/bidhan\s*nagar|salt\s*lake/g, 'bidhannagar salt lake')
    .replace(/rajarhat\s*new\s*town/g, 'new town')
    .replace(/[\-\/,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const KNOWN_HUBS: Array<{ name: string; lat: number; lng: number; radiusKm: number }> = [
  { name: 'New Barrackpore', lat: 22.690, lng: 88.450, radiusKm: 2.2 },
  { name: 'Madhyamgram', lat: 22.698, lng: 88.464, radiusKm: 3.0 },
  { name: 'Barasat', lat: 22.722, lng: 88.485, radiusKm: 3.5 },
  { name: 'Hridaypur', lat: 22.710, lng: 88.473, radiusKm: 1.8 },
  { name: 'Sodepur', lat: 22.698, lng: 88.390, radiusKm: 2.8 },
  { name: 'Ghola', lat: 22.695, lng: 88.406, radiusKm: 2.0 },
  { name: 'Agarpara', lat: 22.683, lng: 88.382, radiusKm: 2.0 },
  { name: 'Belghoria', lat: 22.659, lng: 88.385, radiusKm: 2.2 },
  { name: 'Birati', lat: 22.668, lng: 88.430, radiusKm: 2.2 },
  { name: 'Durganagar', lat: 22.652, lng: 88.420, radiusKm: 2.0 },
  { name: 'Dum Dum', lat: 22.626, lng: 88.419, radiusKm: 2.8 },
  { name: 'New Town', lat: 22.585, lng: 88.470, radiusKm: 4.5 },
  { name: 'Rajarhat', lat: 22.620, lng: 88.465, radiusKm: 4.0 },
  { name: 'Salt Lake', lat: 22.580, lng: 88.420, radiusKm: 3.5 },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestHub(lat: number, lng: number): string {
  let bestName = '';
  let bestDist = Infinity;
  for (const h of KNOWN_HUBS) {
    const d = haversineKm(lat, lng, h.lat, h.lng);
    if (d <= h.radiusKm && d < bestDist) {
      bestDist = d;
      bestName = h.name;
    }
  }
  return bestName;
}

function pickLocalityFromNominatimAddress(address: any = {}): string {
  const isWeak = (v?: string) => {
    if (!v) return true;
    const low = String(v).toLowerCase().trim();
    return (
      !low ||
      low === 'greater kolkata' ||
      low === 'kolkata' ||
      low === 'west bengal' ||
      low === 'india' ||
      low === 'north 24 parganas' ||
      low === 'south 24 parganas'
    );
  };

  const candidates = [
    address.suburb,
    address.neighbourhood,
    address.town,
    address.city,
    address.village,
    address.residential,
    address.city_district,
    address.hamlet,
    address.quarter,
  ];
  for (const c of candidates) {
    if (!isWeak(c)) return String(c).trim();
  }
  if (address.county && !isWeak(address.county)) {
    return String(address.county).replace(/\s*-\s*[IVX0-9]+$/i, '').trim();
  }
  return 'Kolkata';
}

async function processQueue() {
  if (queueRunning) return;
  queueRunning = true;
  let dirty = false;
  try {
    while (fetchQueue.length > 0) {
      const item = fetchQueue.shift()!;
      if (coordCache.has(item.key)) {
        pendingCoords.delete(item.key);
        continue;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${item.lat}&lon=${item.lng}&addressdetails=1`,
          { headers: { 'User-Agent': 'SwaramayiCRM/1.0 (support@swaramayi.info)' } }
        );
        if (res.ok) {
          const j: any = await res.json();
          const addr = j.address || {};
          const locality = pickLocalityFromNominatimAddress(addr);
          const searchParts = [
            addr.road,
            addr.neighbourhood,
            addr.residential,
            addr.suburb,
            addr.village,
            addr.town,
            addr.city,
            addr.city_district,
            addr.postcode,
          ].filter(Boolean);
          coordCache.set(item.key, {
            locality,
            subLocality: addr.residential || addr.neighbourhood || addr.suburb || '',
            city: addr.city || addr.town || 'Kolkata',
            county: addr.county || '',
            postcode: addr.postcode || '',
            full_address: j.display_name || searchParts.join(', '),
            searchText: Array.from(new Set([locality, ...searchParts])).join(' '),
          });
          dirty = true;
        }
      } catch {
        // Ignore transient network errors; hub fallback remains active
      } finally {
        pendingCoords.delete(item.key);
      }
      await new Promise((r) => setTimeout(r, 1100));
    }
    if (dirty) persistCoordCache();
  } finally {
    queueRunning = false;
  }
}

export function resolvePropertyLocation(p: any): {
  locality: string;
  full_address: string;
  searchText: string;
  city: string;
} {
  // Reload cache if it wasn't populated when this module first loaded
  if (coordCache.size === 0 && fs.existsSync(CACHE_PATH)) {
    loadCoordCache();
  }

  const rawLocality = String(p.locality || p.location || '').trim();
  const rawAddress = String(p.location_address || p.full_address || '').trim();
  const rawCity = String(p.city || 'Kolkata').trim() || 'Kolkata';

  const lat = parseCoordNumber(p.latitude ?? p.lat ?? p.gps_lat);
  const lng = parseCoordNumber(p.longitude ?? p.lng ?? p.lon ?? p.gps_lng);

  let cached: CoordLocationEntry | undefined;
  if (lat !== null && lng !== null) {
    const key = getCoordKey(lat, lng);
    cached = coordCache.get(key);
    if (!cached && !pendingCoords.has(key)) {
      pendingCoords.add(key);
      fetchQueue.push({ key, lat, lng });
      setTimeout(() => {
        processQueue().catch(() => {});
      }, 0);
    }
  }

  const hubFallback = lat !== null && lng !== null ? findNearestHub(lat, lng) : '';

  const resolvedLocality = !isGenericLocation(rawLocality)
    ? rawLocality
    : (cached?.locality && !isGenericLocation(cached.locality) ? cached.locality : (hubFallback || rawLocality || 'Kolkata'));

  const resolvedAddress = !isGenericLocation(rawAddress)
    ? rawAddress
    : (cached?.full_address || resolvedLocality);

  // Exclude C.D. block/subdivision names like "Barasat - II" or "Barrackpur - II" from cached searchText
  const cleanedCachedSearchText = cached?.searchText
    ? cached.searchText.replace(cached.county || '', '').trim()
    : '';

  const searchText = normalizeLocationText(
    [
      rawLocality,
      rawAddress,
      rawCity,
      resolvedLocality,
      resolvedAddress.replace(cached?.county || '', ''),
      cleanedCachedSearchText,
      cached?.subLocality || '',
      cached?.city || '',
      cached?.postcode || '',
      hubFallback,
      p.project_name || '',
      p.title || p.property_title || '',
      p.description || '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  const resolvedCityRaw = cached?.city && !isGenericLocation(cached.city) ? cached.city : rawCity;
  const finalCity =
    resolvedCityRaw && resolvedLocality && normalizeLocationText(resolvedCityRaw) === normalizeLocationText(resolvedLocality)
      ? 'Kolkata'
      : resolvedCityRaw;

  return {
    locality: resolvedLocality,
    full_address: resolvedAddress,
    searchText,
    city: finalCity,
  };
}

export function getCachedLocalities(): string[] {
  if (coordCache.size === 0 && fs.existsSync(CACHE_PATH)) {
    loadCoordCache();
  }
  const set = new Set<string>();
  coordCache.forEach((v) => {
    if (v.locality && !isGenericLocation(v.locality)) set.add(v.locality);
    if (v.subLocality && !isGenericLocation(v.subLocality)) set.add(v.subLocality);
    if (v.city && !isGenericLocation(v.city)) set.add(v.city);
  });
  return Array.from(set);
}
