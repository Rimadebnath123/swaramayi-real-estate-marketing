import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MultiSelectFloorSelectorProps {
  isLight: boolean;
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  placeholder?: string;
  isExclude?: boolean;
}

export const ALL_FLOOR_UNIT_OPTIONS = [
  'Basement 2 (B2)',
  'Basement 1 (B1 / B)',
  'Ground Floor (G)',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  '6th Floor',
  '7th Floor',
  '8th Floor',
  '9th Floor',
  '10th Floor',
  '11th Floor',
  '12th Floor+',
  'Top Floor / Penthouse',
  'Any Floor'
];

export const MultiSelectFloorSelector: React.FC<MultiSelectFloorSelectorProps> = ({
  isLight,
  value,
  onChange,
  label,
  placeholder,
  isExclude = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');

  const accentColor = isExclude ? '#ef4444' : '#0284c7';
  const accentLightText = isExclude ? '#f87171' : '#38bdf8';
  const badgeGradient = isExclude ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
  const badgeIcon = isExclude ? '🚫' : '🏢';

  const defaultLabel = isExclude ? '🚫 Non-Preferred / Avoided Floors (Unit Floor Exclude) *' : '🏢 Floor Number (Unit Floor) *';
  const defaultPlaceholder = isExclude ? 'Click to select Excluded Floors (Multi-Select Supported)...' : 'Click to select Floor Numbers (Multi-Select Supported)...';

  const displayLabel = label || defaultLabel;
  const displayPlaceholder = placeholder || defaultPlaceholder;

  // Selected list parsed from comma-separated string
  const selectedList = (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const floorOptions = isExclude
    ? ALL_FLOOR_UNIT_OPTIONS.map(opt => opt === 'Any Floor' ? 'No Exclusions' : opt)
    : ALL_FLOOR_UNIT_OPTIONS;

  const toggleOption = (opt: string) => {
    let next: string[];
    if (selectedList.includes(opt)) {
      next = selectedList.filter(item => item !== opt);
    } else {
      next = [...selectedList, opt];
    }
    onChange(next.join(', '));
  };

  const removeOption = (opt: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = selectedList.filter(item => item !== opt);
    onChange(next.join(', '));
  };

  const handleAddCustom = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const val = customInput.trim();
    if (!selectedList.includes(val)) {
      const next = [...selectedList, val];
      onChange(next.join(', '));
    }
    setCustomInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.75rem', color: isExclude ? '#ef4444' : (isLight ? '#0f172a' : '#ffffff'), fontWeight: '800' }}>
          {displayLabel}
        </label>
        <span style={{ fontSize: '0.68rem', color: accentColor, fontWeight: '800' }}>
          ✓ {selectedList.length} Selected (Multi-Select)
        </span>
      </div>

      {/* MULTI-SELECT DISPLAY CONTAINER / BADGES */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: isLight ? '#ffffff' : '#0b1329', 
          border: isOpen ? `2px solid ${accentColor}` : (isExclude ? '1.5px solid #ef4444' : (isLight ? '1px solid #cbd5e1' : '1px solid #1e293b')), 
          borderRadius: '8px', 
          padding: '8px 10px', 
          minHeight: '42px', 
          cursor: 'pointer', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: '6px', 
          boxShadow: isOpen ? `0 0 0 3px ${isExclude ? 'rgba(239, 68, 68, 0.2)' : 'rgba(2, 132, 199, 0.2)'}` : 'none' 
        }}
      >
        {selectedList.length === 0 ? (
          <span style={{ fontSize: '0.82rem', color: isExclude ? '#ef4444' : (isLight ? '#94a3b8' : '#64748b'), fontWeight: '600' }}>
            {displayPlaceholder}
          </span>
        ) : (
          selectedList.map((floor, idx) => (
            <span 
              key={idx} 
              style={{ 
                background: badgeGradient, 
                color: '#ffffff', 
                padding: '3px 8px', 
                borderRadius: '12px', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                boxShadow: `0 2px 4px ${isExclude ? 'rgba(239, 68, 68, 0.3)' : 'rgba(2, 132, 199, 0.3)'}`
              }}
            >
              {badgeIcon} {floor}
              <X 
                size={12} 
                style={{ cursor: 'pointer', opacity: 0.8 }} 
                onClick={(e) => removeOption(floor, e)} 
              />
            </span>
          ))
        )}
      </div>

      {/* DROPDOWN SELECTION GRID */}
      {isOpen && (
        <div style={{ background: isLight ? '#ffffff' : '#0b1329', border: `1.5px solid ${accentColor}`, borderRadius: '10px', padding: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', zIndex: 999, maxHeight: '280px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.73rem', color: accentColor, fontWeight: '900' }}>
              ✓ SELECT ONE OR MULTIPLE {isExclude ? 'EXCLUDED' : 'PREFERRED'} FLOOR NUMBERS (MULTI-SELECT)
            </span>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              style={{ background: accentColor, color: '#ffffff', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Done ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {floorOptions.map((opt) => {
              const isSelected = selectedList.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  style={{
                    background: isSelected ? (isExclude ? 'rgba(239, 68, 68, 0.18)' : 'rgba(2, 132, 199, 0.18)') : (isLight ? '#f8fafc' : '#0f172a'),
                    border: isSelected ? `1.5px solid ${accentColor}` : (isLight ? '1px solid #cbd5e1' : '1px solid #1e293b'),
                    color: isSelected ? accentLightText : (isLight ? '#0f172a' : '#cbd5e1'),
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? '900' : '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Click handled by parent div
                    style={{ cursor: 'pointer', accentColor }}
                  />
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          {/* CUSTOM WRITE-IN FLOOR ENTRY */}
          <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b', paddingTop: '8px', display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(e); }}
              placeholder={isExclude ? "Or type custom excluded floor (e.g. No Ground Floor)..." : "Or type custom floor (e.g. 24th Floor, Duplex)..."}
              style={{ flex: 1, background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b', color: isLight ? '#0f172a' : '#ffffff', padding: '6px 8px', borderRadius: '4px', fontSize: '0.78rem' }}
            />
            <button
              type="button"
              onClick={handleAddCustom}
              style={{ background: accentColor, color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
            >
              + Add Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
