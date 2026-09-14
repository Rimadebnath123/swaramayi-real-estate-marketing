import React, { useState, useMemo, useEffect } from 'react';
import { Compass, Search, Target, MapPin, X, Building, Sliders, Navigation, Loader2, Globe } from 'lucide-react';

interface LocationMapViewProps {
  currentRole?: string;
  isLight: boolean;
  selectedLocality: string;
  setSelectedLocality: (loc: string) => void;
  selectedProperty: any;
  showAllOnMap: boolean;
  setShowAllOnMap: (val: boolean) => void;
  filteredProperties: any[];
  allProperties?: any[];
  setSelectedProperty: (prop: any) => void;
  handleStartEditProperty: (prop: any) => void;
  handleDeleteProperty: (id: string, code: string) => void;
  InteractiveLeafletMap: React.FC<any>;
}

interface SearchedPin {
  name: string;
  lat: number;
  lng: number;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// Haversine formula to compute distance in kilometers between two GPS coordinates
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Helper to safely parse lat/lng from property object
const parseLatLng = (p: any) => {
  const lat = parseFloat(String(p?.latitude || '').replace(/[^\d.-]/g, ''));
  const lng = parseFloat(String(p?.longitude || '').replace(/[^\d.-]/g, ''));
  return {
    lat: !isNaN(lat) && lat !== 0 ? lat : 22.722361,
    lng: !isNaN(lng) && lng !== 0 ? lng : 88.493403
  };
};

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  currentRole,
  isLight,
  selectedLocality,
  setSelectedLocality,
  selectedProperty = {},
  showAllOnMap,
  setShowAllOnMap,
  filteredProperties = [],
  allProperties = [],
  setSelectedProperty,
  handleStartEditProperty,
  handleDeleteProperty,
  InteractiveLeafletMap,
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');

  // Search & Radius State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<string>('ALL'); // 'ALL', '1', '3', '5', '10', '15', '25', '50'
  const [showRadiusSelectionList, setShowRadiusSelectionList] = useState<boolean>(true);
  
  // Real-World Location Geocoding State
  const [searchedLocationPin, setSearchedLocationPin] = useState<SearchedPin | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);

  // Use all available properties if provided, else fallback to filteredProperties
  const basePropertiesList = useMemo(() => {
    return allProperties.length > 0 ? allProperties : filteredProperties;
  }, [allProperties, filteredProperties]);

  // Live Location Geocoding API fetch (OpenStreetMap Nominatim)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowSuggestionsDropdown(data.length > 0);
          }
        }
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute explicit search on Form Submit / Enter Key
  const handlePerformLocationSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if search query matches existing property title/code first
    const directPropMatch = basePropertiesList.find((p) => 
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.property_code || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (directPropMatch) {
      setSelectedProperty(directPropMatch);
    }

    // Also geocode location via Nominatim API to place exact location pin
    try {
      setIsSearchingLocation(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const topResult = data[0];
          const pinName = topResult.display_name.split(',')[0] || searchQuery;
          setSearchedLocationPin({
            name: pinName,
            lat: parseFloat(topResult.lat),
            lng: parseFloat(topResult.lon)
          });
          setShowSuggestionsDropdown(false);
        }
      }
    } catch (err) {
      console.error('Geocoding submit failed:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Select location from suggestion dropdown
  const handleSelectSuggestion = (s: LocationSuggestion) => {
    const pinName = s.display_name.split(',')[0] || searchQuery;
    setSearchedLocationPin({
      name: pinName,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon)
    });
    setSearchQuery(pinName);
    setShowSuggestionsDropdown(false);
  };

  // Center anchor for distance calculation (searchedLocationPin takes priority over selectedProperty)
  const anchorCoords = useMemo(() => {
    if (searchedLocationPin && searchedLocationPin.lat && searchedLocationPin.lng) {
      return { lat: searchedLocationPin.lat, lng: searchedLocationPin.lng };
    }
    if (selectedProperty && selectedProperty.id) {
      return parseLatLng(selectedProperty);
    }
    return parseLatLng(basePropertiesList[0]);
  }, [searchedLocationPin, selectedProperty, basePropertiesList]);

  // Calculate distance for all properties relative to the anchor point
  const propertiesWithDistance = useMemo(() => {
    return basePropertiesList.map((p) => {
      const coords = parseLatLng(p);
      const dist = (searchedLocationPin === null && selectedProperty && selectedProperty.id === p.id)
        ? 0
        : getDistanceKm(anchorCoords.lat, anchorCoords.lng, coords.lat, coords.lng);
      return { ...p, distanceKm: dist };
    });
  }, [basePropertiesList, selectedProperty, searchedLocationPin, anchorCoords]);

  // Filter properties based on Locality and Radius Filter around anchor
  const finalFilteredProperties = useMemo(() => {
    return propertiesWithDistance.filter((p) => {
      // 1. Locality Filter (only if explicit locality selected)
      if (selectedLocality !== 'ALL') {
        const pLoc = (p.locality || '').toLowerCase().replace(/\s+/g, '');
        const sLoc = selectedLocality.toLowerCase().replace(/\s+/g, '');
        if (pLoc !== sLoc) return false;
      }

      // 2. Radius Filter
      if (selectedRadius !== 'ALL') {
        const maxDist = parseFloat(selectedRadius);
        if (!isNaN(maxDist) && p.distanceKm > maxDist) {
          return false;
        }
      }

      return true;
    });
  }, [propertiesWithDistance, selectedLocality, selectedRadius]);

  // Sort properties by distance from anchor
  const radiusWiseProjects = useMemo(() => {
    return [...finalFilteredProperties].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [finalFilteredProperties]);

  const radiusOptions = ['ALL', '1', '3', '5', '10', '15', '25', '50'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* CATEGORY HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={24} color="#38bdf8" /> Project Location Wise Interactive Geographical Radar Map
          </h2>
          <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Search any real-world location (e.g. Madhyamgram station) or project name to pinpoint and view all nearby properties radius-wise.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => { 
              setSelectedLocality('ALL'); 
              setSearchQuery(''); 
              setSelectedRadius('ALL'); 
              setSearchedLocationPin(null);
            }} 
            style={{ 
              padding: '6px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              cursor: 'pointer', 
              background: (selectedLocality === 'ALL' && selectedRadius === 'ALL' && !searchQuery && !searchedLocationPin) ? '#0284c7' : (isLight ? '#e2e8f0' : '#1e293b'), 
              color: (selectedLocality === 'ALL' && selectedRadius === 'ALL' && !searchQuery && !searchedLocationPin) ? '#ffffff' : (isLight ? '#334155' : '#94a3b8'), 
              fontSize: '0.8rem', 
              fontWeight: '800',
              boxShadow: (selectedLocality === 'ALL' && selectedRadius === 'ALL' && !searchQuery && !searchedLocationPin) ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none'
            }}
          >
            🌐 Reset All Filters
          </button>
        </div>
      </div>

      {/* SEARCH BAR & RADIUS SELECTION CONTROLS PANEL */}
      <div style={{ 
        background: isLight ? '#ffffff' : '#0f172a', 
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
        borderRadius: '14px', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '14px', 
        boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none' 
      }}>
        
        {/* ROW 1: REAL-WORLD LOCATION SEARCH + PROJECT QUICK SELECTOR DROPDOWN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px', alignItems: 'center' }}>
          
          {/* LOCATION SEARCH INPUT FORM WITH AUTOCOMPLETE */}
          <form onSubmit={handlePerformLocationSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#38bdf8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 5 }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestionsDropdown(true); }}
              placeholder="Search location (e.g. Madhyamgram station, Barasat, Salt Lake) or Project Title..."
              style={{
                width: '100%',
                padding: '10px 100px 10px 38px',
                borderRadius: '8px',
                border: searchedLocationPin ? '2px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                background: isLight ? '#f8fafc' : '#1e293b',
                color: isLight ? '#0f172a' : '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                outline: 'none'
              }}
            />
            
            <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isSearchingLocation && (
                <Loader2 size={16} className="animate-spin" color="#0284c7" />
              )}
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchedLocationPin(null); setSuggestions([]); setShowSuggestionsDropdown(false); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                  title="Clear Search"
                >
                  <X size={16} color={isLight ? '#64748b' : '#94a3b8'} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
                }}
              >
                Find Pin
              </button>
            </div>

            {/* LIVE AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {showSuggestionsDropdown && suggestions.length > 0 && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  marginTop: '4px', 
                  background: isLight ? '#ffffff' : '#0f172a', 
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
                  borderRadius: '8px', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)', 
                  zIndex: 1000, 
                  maxHeight: '220px', 
                  overflowY: 'auto' 
                }}
              >
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: idx < suggestions.length - 1 ? (isLight ? '1px solid #f1f5f9' : '1px solid #1e293b') : 'none',
                      fontSize: '0.8rem',
                      color: isLight ? '#0f172a' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Globe size={14} color="#38bdf8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* QUICK PROJECT SELECTOR DROPDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="#0284c7" />
            <select
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                const found = basePropertiesList.find((p) => String(p.id) === e.target.value);
                if (found) {
                  setSelectedProperty(found);
                  setSearchedLocationPin(null); // Switch focus back to selected property pin
                }
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                background: isLight ? '#f8fafc' : '#1e293b',
                color: isLight ? '#0f172a' : '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select Project / Pin --</option>
              {basePropertiesList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.property_code ? `[${p.property_code}] ` : ''}{p.title || 'Untitled'} ({p.locality || 'Location'})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ROW 2: RADIUS SELECTION PILLS & STATUS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b', paddingTop: '12px' }}>
          
          {/* RADIUS FILTER BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
              <Target size={18} color="#0284c7" />
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                Radius Wise Selection:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: isLight ? '#f1f5f9' : '#1e293b', padding: '3px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', alignItems: 'center', flexWrap: 'wrap' }}>
              {radiusOptions.map((rad) => {
                const isActive = selectedRadius === rad;
                return (
                  <button
                    key={rad}
                    onClick={() => setSelectedRadius(rad)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                      color: isActive ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      fontSize: '0.75rem',
                      fontWeight: isActive ? '900' : '700',
                      boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.4)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {rad === 'ALL' ? '🌐 All Radii' : `🎯 ${rad} km`}
                  </button>
                );
              })}

              {/* EDITABLE CUSTOM RADIUS NUMBER INPUT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 6px', borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>✏️ Custom:</span>
                <input
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.5"
                  value={selectedRadius === 'ALL' ? '' : selectedRadius}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) <= 0) {
                      setSelectedRadius('ALL');
                    } else {
                      setSelectedRadius(val);
                    }
                  }}
                  placeholder="e.g. 2.5"
                  style={{
                    width: '62px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid #0284c7',
                    background: isLight ? '#ffffff' : '#0f172a',
                    color: isLight ? '#0f172a' : '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0284c7' }}>km</span>
              </div>

              {/* INTERACTIVE RADIUS SLIDER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '4px', borderLeft: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={selectedRadius === 'ALL' ? 50 : (parseFloat(selectedRadius) || 5)}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                  title={`Adjust Radius Slider: ${selectedRadius} km`}
                  style={{ width: '90px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </div>

            </div>
          </div>

          {/* VIEW ALL MAP / FOCUS TOGGLE */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ background: isLight ? '#f1f5f9' : '#1e293b', borderRadius: '6px', padding: '3px', display: 'flex', gap: '4px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
              <button 
                onClick={() => setShowAllOnMap(true)} 
                style={{ background: showAllOnMap ? '#0284c7' : 'transparent', color: showAllOnMap ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'), border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
              >
                🌐 View All Pins
              </button>
              <button 
                onClick={() => setShowAllOnMap(false)} 
                style={{ background: !showAllOnMap ? '#0284c7' : 'transparent', color: !showAllOnMap ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'), border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
              >
                📍 Focus Pin
              </button>
            </div>

            <button
              onClick={() => setShowRadiusSelectionList(!showRadiusSelectionList)}
              style={{
                background: showRadiusSelectionList ? 'rgba(56, 189, 248, 0.15)' : (isLight ? '#e2e8f0' : '#1e293b'),
                color: showRadiusSelectionList ? '#0284c7' : (isLight ? '#475569' : '#94a3b8'),
                border: '1px solid #0284c7',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sliders size={14} />
              {showRadiusSelectionList ? 'Hide Radius Panel' : 'Show Radius Projects List'}
            </button>
          </div>

        </div>

      </div>

      {/* SELECTED ANCHOR PROPERTY OR SEARCHED LOCATION BAR */}
      <div style={{ 
        background: searchedLocationPin ? (isLight ? '#f0fdf4' : '#064e3b') : (isLight ? '#f0f9ff' : '#0c4a6e'), 
        border: searchedLocationPin ? '1px solid #22c55e' : '1px solid #0284c7', 
        borderRadius: '10px', 
        padding: '10px 16px', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '8px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
          <MapPin size={18} color={searchedLocationPin ? '#4ade80' : '#38bdf8'} />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: searchedLocationPin ? (isLight ? '#166534' : '#dcfce7') : (isLight ? '#0369a1' : '#e0f2fe') }}>
            {searchedLocationPin ? `📍 Searched Target Location: ${searchedLocationPin.name}` : `Center Anchor: ${selectedProperty?.title || 'Property Location'}`}
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: searchedLocationPin ? '#4ade80' : '#38bdf8', background: searchedLocationPin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(2, 132, 199, 0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
            GPS: {anchorCoords.lat.toFixed(4)}, {anchorCoords.lng.toFixed(4)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {searchedLocationPin && (
            <button
              onClick={() => setSearchedLocationPin(null)}
              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Clear Searched Pin
            </button>
          )}
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: searchedLocationPin ? '#22c55e' : (isLight ? '#0284c7' : '#38bdf8') }}>
            Matches: {finalFilteredProperties.length} Projects {selectedRadius !== 'ALL' ? `(within ${selectedRadius} km)` : ''}
          </span>
          <a 
            href={`https://www.google.com/maps?q=${anchorCoords.lat},${anchorCoords.lng}+(${encodeURIComponent(searchedLocationPin ? searchedLocationPin.name : selectedProperty?.title || 'Location')})`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Google Maps ↗
          </a>
        </div>
      </div>

      {/* MAIN CONTENT GRID (MAP LEFT, DETAILS & RADIUS LIST RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: showRadiusSelectionList ? '1fr 400px' : '1fr 360px', gap: '20px' }}>
        
        {/* MAP CANVAS CONTAINER */}
        <div style={{ background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', height: '620px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <InteractiveLeafletMap 
              properties={finalFilteredProperties}
              selectedProperty={selectedProperty}
              setSelectedProperty={(p: any) => {
                setSelectedProperty(p);
              }}
              showAllOnMap={showAllOnMap}
              isLight={isLight}
              radiusKm={selectedRadius !== 'ALL' ? Number(selectedRadius) : null}
              searchedLocationPin={searchedLocationPin}
            />

            {/* BOTTOM MAP STATUS OVERLAY */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', fontSize: '0.75rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                📍 GPS Engine • {searchedLocationPin ? `Searched: ${searchedLocationPin.name}` : (selectedProperty ? selectedProperty.title : 'Barasat Core')} ({anchorCoords.lat.toFixed(4)}, {anchorCoords.lng.toFixed(4)})
              </span>
              <span style={{ color: '#22c55e', fontWeight: '800', whiteSpace: 'nowrap' }}>
                ● Radar Active ({finalFilteredProperties.length} Tracked {selectedRadius !== 'ALL' ? `@ ${selectedRadius}km radius` : ''})
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL: SPECIFICATIONS & RADIUS WISE SELECTION LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '620px', overflowY: 'auto' }}>
          
          {/* PROPERTY SPECIFICATION CARD */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  {selectedProperty?.property_code || 'N/A'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: '800', background: 'rgba(34, 197, 94, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                  ✓ GPS Synced
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', marginTop: '6px', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.3' }}>
                {selectedProperty?.title || 'No Property Selected'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                📍 {selectedProperty?.locality || 'Barasat Core'}, West Bengal
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: isLight ? '#f8fafc' : '#0f172a', padding: '10px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Asking Price</span>
                <span style={{ fontSize: '1.2rem', color: '#4ade80', fontWeight: '900' }}>{selectedProperty?.final_price || '₹0'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Rate / Sq.Ft.</span>
                <span style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: '800' }}>{selectedProperty?.price_sqft || '₹0 / sq.ft.'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '8px 10px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', overflow: 'hidden' }}>
                <span style={{ color: isLight ? '#64748b' : '#94a3b8', display: 'block', fontSize: '0.65rem' }}>Developer</span>
                <strong style={{ color: isLight ? '#0f172a' : '#ffffff', wordBreak: 'break-word' }}>{selectedProperty?.developer || 'N/A'}</strong>
              </div>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', padding: '8px 10px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <span style={{ color: isLight ? '#64748b' : '#94a3b8', display: 'block', fontSize: '0.65rem' }}>Config</span>
                <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{selectedProperty?.configuration || 'N/A'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button onClick={() => handleStartEditProperty(selectedProperty)} style={{ flex: 1, background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>Edit Record</button>
              {isStrictSuperAdmin && (
                <button onClick={() => handleDeleteProperty(selectedProperty?.id, selectedProperty?.property_code)} style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}>Delete</button>
              )}
            </div>
          </div>

          {/* RADIUS-WISE PROJECT SELECTION LIST PANEL */}
          {showRadiusSelectionList && (
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={16} color="#0284c7" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                    Nearby Projects ({radiusWiseProjects.length})
                  </h4>
                </div>
                <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>
                  Distance from {searchedLocationPin ? searchedLocationPin.name : (selectedProperty?.title || 'Anchor')}
                </span>
              </div>

              {radiusWiseProjects.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.8rem' }}>
                  No projects found within the selected radius of this location.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {radiusWiseProjects.map((p) => {
                    const isSelected = selectedProperty && selectedProperty.id === p.id;
                    const isAnchorProp = !searchedLocationPin && selectedProperty && selectedProperty.id === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProperty(p);
                        }}
                        style={{
                          background: isSelected 
                            ? (isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.25)') 
                            : (isLight ? '#f8fafc' : '#0f172a'),
                          border: isSelected 
                            ? '1px solid #0284c7' 
                            : (isLight ? '1px solid #e2e8f0' : '1px solid #334155'),
                          borderRadius: '8px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title || 'Property'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span>📍 {p.locality || 'Location'}</span>
                            <span>•</span>
                            <span style={{ color: '#4ade80', fontWeight: '700' }}>{p.final_price || ''}</span>
                          </div>
                        </div>

                        {/* DISTANCE BADGE */}
                        <div>
                          {isAnchorProp ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#ffffff', background: '#0284c7', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              📍 Anchor
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              🎯 {p.distanceKm} km away
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
