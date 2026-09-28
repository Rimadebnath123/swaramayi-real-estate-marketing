import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Search, Check, Sparkles, Navigation } from 'lucide-react';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';

// Curated list of high-demand Indian real estate localities & hubs
const DEFAULT_LOCALITIES = [
  // West Bengal / Kolkata & Suburbs
  'Madhyamgram, Kolkata',
  'Barasat, Kolkata',
  'Sodepur, Kolkata',
  'New Town, Rajarhat, Kolkata',
  'Salt Lake (Bidhannagar), Kolkata',
  'Rajarhat Chowmatha, Kolkata',
  'Dum Dum, Kolkata',
  'Birati, Kolkata',
  'Kestopur, VIP Road, Kolkata',
  'VIP Road, Teghoria, Kolkata',
  'Champadali Crossing, Barasat',
  'Hridaypur, Barasat',
  'Banamalipur, Barasat',
  'Jessore Road, Madhyamgram',
  'Lake Town, Kolkata',
  'Ultadanga, Kolkata',
  'Garia, South Kolkata',
  'Tollygunge, Kolkata',
  'Behala, Kolkata',
  'Jadavpur, Kolkata',
  'Kasba, EM Bypass, Kolkata',
  'Ruby Crossing, EM Bypass, Kolkata',
  'Sonarpur, Kolkata',
  'Narendrapur, Kolkata',
  'Howrah Station & Central',
  'Dankuni, Hooghly',
  'Habra, North 24 Parganas',
  'Dunlop Crossing, Kolkata',
  'Shyambazar Five Point, Kolkata',
  'Airport Gate 1, Dum Dum',
  'Belgharia, Kolkata',
  'Nimta, Birati',

  // Telangana / Hyderabad & IT Corridor
  'Kondapur, Hyderabad',
  'Gachibowli, Hyderabad',
  'Hitec City, Hyderabad',
  'Madhapur, Hyderabad',
  'Kukatpally, Hyderabad',
  'Miyapur, Hyderabad',
  'Manikonda, Hyderabad',
  'Jubilee Hills, Hyderabad',
  'Banjara Hills, Hyderabad',
  'Begumpet, Hyderabad',
  'Tellapur, Hyderabad',
  'Narsingi, Hyderabad',
  'Financial District, Nanakramguda, Hyderabad',
  'Toli Chowki, Hyderabad',
  'Ameerpet, Hyderabad',
  'Secunderabad, Telangana',
  'Gopanpally, Hyderabad',
  'Chandanagar, Hyderabad',
  'Bachupally, Hyderabad',
  'Nizampet, Hyderabad',
  'Lingampally, Hyderabad',
  'Kokapet, Hyderabad',
  'Puppalguda, Hyderabad',
  'Khajaguda, Hyderabad',
  'Hafeezpet, Hyderabad',
  'Kothaguda, Hyderabad',
  'Attapur, Hyderabad',
  'LB Nagar, Hyderabad',
  'Uppal, Hyderabad',
  'Kompally, Hyderabad',

  // Bengaluru / Karnataka
  'Whitefield, Bengaluru',
  'Electronic City, Bengaluru',
  'HSR Layout, Bengaluru',
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Bellandur, Bengaluru',
  'Marathahalli, Bengaluru',
  'Hebbal, Bengaluru',
  'Yelahanka, Bengaluru',
  'Sarjapur Road, Bengaluru',
  'JP Nagar, Bengaluru',
  'Banashankari, Bengaluru',

  // Mumbai / Pune
  'Powai, Mumbai',
  'Andheri West, Mumbai',
  'Bandra West, Mumbai',
  'Thane West, Mumbai',
  'Navi Mumbai, Kharghar',
  'Baner, Pune',
  'Wakad, Pune',
  'Hinjewadi, Pune'
];

interface LocationAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLight?: boolean;
  isMulti?: boolean;
  style?: React.CSSProperties;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Type location, address or landmark...',
  isLight = false,
  isMulti = false,
  style = {},
  required = false,
  id,
  name,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ mainText: string; secondaryText?: string; fullText: string; source: 'local' | 'google' | 'nominatim' }>>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const googleAutocompleteService = useRef<any>(null);

  // Initialize Google Maps Places Autocomplete Service if available
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsApi()
      .then((maps) => {
        if (isMounted && maps && maps.places && maps.places.AutocompleteService) {
          googleAutocompleteService.current = new maps.places.AutocompleteService();
        }
      })
      .catch(() => {
        // Fallback to local + Nominatim
      });
    return () => { isMounted = false; };
  }, []);

  // Determine active query token (for multi-value comma separated vs single input)
  const currentToken = useMemo(() => {
    if (!isMulti) return value || '';
    const parts = (value || '').split(',');
    return parts[parts.length - 1].trim();
  }, [value, isMulti]);

  // Fetch suggestions when currentToken changes
  useEffect(() => {
    const q = currentToken.trim().toLowerCase();
    if (!q || q.length < 1) {
      // If blank or focused without query, show default popular localities
      const defaultList = DEFAULT_LOCALITIES.slice(0, 7).map(loc => ({
        mainText: loc.split(',')[0].trim(),
        secondaryText: loc.includes(',') ? loc.split(',').slice(1).join(',').trim() : '',
        fullText: loc,
        source: 'local' as const
      }));
      setSuggestions(defaultList);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    // 1. Filter local default localities matching query
    const localMatches = DEFAULT_LOCALITIES.filter(loc => loc.toLowerCase().includes(q)).map(loc => ({
      mainText: loc.split(',')[0].trim(),
      secondaryText: loc.includes(',') ? loc.split(',').slice(1).join(',').trim() : '',
      fullText: loc,
      source: 'local' as const
    }));

    const combinedMap = new Map<string, { mainText: string; secondaryText?: string; fullText: string; source: 'local' | 'google' | 'nominatim' }>();
    localMatches.forEach(item => combinedMap.set(item.fullText.toLowerCase(), item));

    // Debounce remote APIs by 180ms
    const timer = setTimeout(async () => {
      // 2. Fetch Google Places Predictions if available
      if (googleAutocompleteService.current && q.length >= 2) {
        try {
          googleAutocompleteService.current.getPlacePredictions(
            {
              input: currentToken.trim(),
              componentRestrictions: { country: 'in' },
              types: ['geocode', 'establishment']
            },
            (predictions: any[], status: any) => {
              if (isSubscribed && status === 'OK' && Array.isArray(predictions)) {
                predictions.forEach(p => {
                  const main = p.structured_formatting?.main_text || p.description.split(',')[0];
                  const sec = p.structured_formatting?.secondary_text || p.description.split(',').slice(1).join(',');
                  const full = p.description;
                  if (!combinedMap.has(full.toLowerCase())) {
                    combinedMap.set(full.toLowerCase(), {
                      mainText: main,
                      secondaryText: sec,
                      fullText: full,
                      source: 'google'
                    });
                  }
                });
                if (isSubscribed) {
                  setSuggestions(Array.from(combinedMap.values()).slice(0, 8));
                  setLoading(false);
                }
              }
            }
          );
        } catch (e) {}
      }

      // 3. Fallback / Augment with Nominatim Geocoding API if query is >= 3 chars
      if (q.length >= 3 && combinedMap.size < 6) {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentToken.trim())}&addressdetails=1&countrycodes=in&limit=6`,
            { headers: { 'Accept-Language': 'en-US,en' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            if (isSubscribed && Array.isArray(data)) {
              data.forEach((item: any) => {
                const name = item.display_name;
                const parts = name.split(',');
                const main = parts[0].trim();
                const sec = parts.slice(1, 4).join(',').trim();
                const cleanFull = `${main}, ${sec}`.replace(/,\s*,/g, ',');
                if (!combinedMap.has(cleanFull.toLowerCase())) {
                  combinedMap.set(cleanFull.toLowerCase(), {
                    mainText: main,
                    secondaryText: sec,
                    fullText: cleanFull,
                    source: 'nominatim'
                  });
                }
              });
            }
          }
        } catch (err) {}
      }

      if (isSubscribed) {
        setSuggestions(Array.from(combinedMap.values()).slice(0, 8));
        setLoading(false);
      }
    }, 180);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [currentToken, isMulti]);

  // Handle click outside to close floating dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-location tags parsing
  const tags = useMemo(() => {
    if (!value) return [];
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [value]);

  const removeTag = (indexToRemove: number) => {
    const updatedTags = tags.filter((_, idx) => idx !== indexToRemove);
    const newValue = updatedTags.length > 0 ? updatedTags.join(', ') + ', ' : '';
    onChange(newValue);
  };

  const selectSuggestion = (fullText: string) => {
    let finalValue = fullText;
    if (isMulti) {
      const parts = (value || '').split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (fullText.toLowerCase().includes(lastPart.toLowerCase()) || lastPart.toLowerCase().includes(fullText.toLowerCase())) {
          parts[parts.length - 1] = fullText;
        } else if (!parts.includes(fullText)) {
          parts.push(fullText);
        }
        finalValue = Array.from(new Set(parts)).join(', ') + ', ';
      } else {
        finalValue = fullText + ', ';
      }
    }
    onChange(finalValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex].fullText);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={className}
          autoComplete="off"
          style={{
            width: '100%',
            background: isLight ? '#f8fafc' : '#0f172a',
            border: isLight ? '1px solid #cbd5e1' : '1px solid #0284c7',
            color: isLight ? '#0f172a' : '#ffffff',
            padding: '8px 12px',
            paddingRight: '30px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '800',
            outline: 'none',
            boxShadow: isOpen ? '0 0 0 2px rgba(56, 189, 248, 0.3)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            ...style
          }}
        />
        <div style={{ position: 'absolute', right: '10px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #38bdf8', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <MapPin size={14} color="#38bdf8" />
          )}
        </div>
      </div>

      {/* MULTI-LOCATION SELECTED CHIPS BADGES */}
      {isMulti && tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
          {tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                background: isLight ? '#e0f2fe' : '#1e293b',
                border: '1px solid #38bdf8',
                color: isLight ? '#0284c7' : '#38bdf8',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
              }}
            >
              <span>📍 {tag}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(idx);
                }}
                style={{
                  cursor: 'pointer',
                  fontWeight: '900',
                  color: '#ef4444',
                  marginLeft: '2px',
                  fontSize: '0.85rem'
                }}
                title="Remove location"
              >
                ×
              </span>
            </span>
          ))}
        </div>
      )}

      {/* FLOATING AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999999,
            background: isLight ? '#ffffff' : '#0f172a',
            border: '1.5px solid #0284c7',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px'
          }}
        >
          <div style={{ padding: '4px 8px 6px 8px', fontSize: '0.68rem', fontWeight: '900', color: '#38bdf8', letterSpacing: '0.5px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📍 SUGGESTED REAL ESTATE LOCALITIES</span>
            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600', fontSize: '0.65rem' }}>Auto-fetching live locations</span>
          </div>

          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={idx}
                onClick={() => selectSuggestion(item.fullText)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isHighlighted ? (isLight ? '#e0f2fe' : '#1e293b') : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ marginTop: '2px', color: isHighlighted ? '#38bdf8' : (isLight ? '#64748b' : '#94a3b8') }}>
                  <MapPin size={15} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.mainText}
                  </div>
                  {item.secondaryText && (
                    <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {item.secondaryText}
                    </div>
                  )}
                </div>

                {item.source === 'google' && (
                  <span style={{ fontSize: '0.64rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                    Google Map
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
