import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

/**
 * Resolves the public website URL depending on environment (Local vs Production).
 */
export const getWebsiteUrl = (): string => {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const env = (import.meta as any).env;
  const envUrl = env?.VITE_WEBSITE_URL;

  return isLocal
    ? (envUrl || 'http://localhost:5001')
    : (envUrl && !envUrl.includes('localhost')
        ? envUrl
        : 'https://web.swaramayi.info');
};

/**
 * Opens the public website in a new browser tab.
 */
export const openWebsitePortal = () => {
  const url = getWebsiteUrl();
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export interface WebsitePortalViewProps {
  isLight: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * WebsitePortalView Component:
 * Sidebar button component that launches the customer website in a new browser tab.
 */
export const WebsitePortalView: React.FC<WebsitePortalViewProps> = ({ isLight, onClick, style }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    openWebsitePortal();
  };

  return (
    <button
      onClick={handleClick}
      title="Open Customer Website in a new browser tab"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        background: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)',
        color: isLight ? '#0284c7' : '#38bdf8',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        fontSize: '0.875rem',
        fontWeight: '800',
        cursor: 'pointer',
        textAlign: 'left',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Globe size={18} /> <span>Go to Website</span>
      </div>
      <ExternalLink size={14} style={{ opacity: 0.8 }} />
    </button>
  );
};

export default WebsitePortalView;
