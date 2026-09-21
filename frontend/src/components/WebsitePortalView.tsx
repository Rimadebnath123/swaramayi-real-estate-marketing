import React, { useState } from 'react';
import { 
  Globe, ExternalLink, Home, Search, Building2, MapPin, 
  ShieldCheck, Sparkles, Terminal
} from 'lucide-react';

interface WebsitePortalViewProps {
  isLight: boolean;
  windowWidth: number;
}

export const WebsitePortalView: React.FC<WebsitePortalViewProps> = ({ isLight, windowWidth }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'iframe' | 'setup'>('preview');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());

  const websiteUrl = (import.meta as any).env?.VITE_WEBSITE_URL || 'https://swaramayi-website.vercel.app';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minHeight: '80vh' }}>
      
      {/* HEADER CONTROL BAR */}
      <div style={{ 
        background: isLight ? '#ffffff' : '#1e293b', 
        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
        borderRadius: '14px', 
        padding: '16px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0284c7', color: '#ffffff', padding: '10px', borderRadius: '10px', display: 'flex' }}>
            <Globe size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              SWARAMAYI REAL ESTATE PUBLIC WEBSITE
              <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                ● LIVE PORTAL
              </span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
              Customer-Facing Home Page, Property Catalog & Online Enquiry System
            </p>
          </div>
        </div>

        {/* VIEW CONTROLS & LAUNCH BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: isLight ? '#f1f5f9' : '#0f172a', padding: '4px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                background: viewMode === 'preview' ? '#0284c7' : 'transparent',
                color: viewMode === 'preview' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              🏡 Home Page View
            </button>
            <button
              onClick={() => { setViewMode('iframe'); setIframeKey(Date.now()); }}
              style={{
                background: viewMode === 'iframe' ? '#0284c7' : 'transparent',
                color: viewMode === 'iframe' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              🖥️ Live Dev Server
            </button>
            <button
              onClick={() => setViewMode('setup')}
              style={{
                background: viewMode === 'setup' ? '#0284c7' : 'transparent',
                color: viewMode === 'setup' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              ⚙️ Server Setup
            </button>
          </div>

          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>Launch Standalone Tab</span> <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* MAIN VIEW CONTENTS */}
      {viewMode === 'preview' && (
        <div style={{ background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* WEBSITE HERO HEADER BANNER */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)', 
            color: '#ffffff', 
            padding: '40px 30px', 
            textAlign: 'center', 
            position: 'relative',
            borderBottom: '3px solid #eab308'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '4px 14px', borderRadius: '20px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: '800', marginBottom: '12px' }}>
              <Sparkles size={14} /> TRUSTED REAL ESTATE MARKETING IN KOLKATA
            </div>
            <h1 style={{ fontSize: windowWidth <= 640 ? '1.5rem' : '2.4rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
              SWARAMAYI REAL ESTATE MARKETING
            </h1>
            <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '8px', fontWeight: '600' }}>
              Your Dream Property. Our Trusted Guidance.
            </p>

            {/* QUICK PROPERTY SEARCH BAR */}
            <div style={{ maxWidth: '800px', margin: '24px auto 0 auto', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '14px', padding: '12px', display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1.5fr 1fr 1fr auto', gap: '10px' }}>
              <input type="text" placeholder="🔍 Search Locality (New Town, Rajarhat, Salt Lake...)" style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }} />
              <select style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}>
                <option>All Categories (Buy)</option>
                <option>Flat / Apartment</option>
                <option>Luxury Villa</option>
                <option>Commercial Space</option>
              </select>
              <select style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}>
                <option>Budget (Any)</option>
                <option>₹30L - ₹60L</option>
                <option>₹60L - ₹1.2 Cr</option>
                <option>₹1.2 Cr+</option>
              </select>
              <button style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Search size={16} /> Search
              </button>
            </div>
          </div>

          {/* FOUR CORE PILLARS */}
          <div style={{ padding: '30px 24px', background: isLight ? '#f8fafc' : '#0f172a' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#eab308', textTransform: 'uppercase' }}>CORE SERVICES</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '4px 0 0 0' }}>How Swaramayi Serves Buyers & Owners</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { title: 'BUY HOMES', desc: 'Verified 2BHK/3BHK flats & sky villas in Kolkata', icon: Home, color: '#38bdf8' },
                { title: 'SELL PROPERTY', desc: 'Direct buyer matching & fast brokerage execution', icon: Building2, color: '#4ade80' },
                { title: 'RENT & LEASE', desc: 'Commercial spaces & residential rental agreements', icon: ShieldCheck, color: '#fbbf24' },
                { title: 'INVEST ADVISORY', desc: 'High ROI land plots & upcoming project tie-ups', icon: Sparkles, color: '#c084fc' }
              ].map((p, idx) => (
                <div key={idx} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '18px', textAlign: 'center', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <p.icon size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>{p.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURED PROPERTIES PREVIEW GRID */}
          <div style={{ padding: '30px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                  Featured Verified Listings in Kolkata
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                  RERA approved properties with legal clearance and competitive pricing
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { title: 'Aparna Zenon 3BHK Premium Residence', loc: 'New Town Action Area II, Kolkata', price: '₹95,00,000', specs: '3 BHK • 1,540 SqFt • Ready to Move' },
                { title: 'My Home Bhooja Sky Villa', loc: 'Rajarhat Main Road, Kolkata', price: '₹1,85,00,000', specs: '4 BHK • 2,450 SqFt • Under Construction' },
                { title: 'Dhriti Commercial Tower Office Space', loc: 'Salt Lake Sector V, Kolkata', price: '₹1,20,00,000', specs: 'Commercial • 1,800 SqFt • Bare Shell' }
              ].map((item, idx) => (
                <div key={idx} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', overflow: 'hidden', boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ height: '140px', background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.1rem' }}>
                    🏢 {item.title.split(' ')[0]} {item.title.split(' ')[1]}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>{item.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {item.loc}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>{item.specs}</span>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '10px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#22c55e', fontWeight: '900' }}>{item.price}</strong>
                      <button style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER PREVIEW */}
          <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', padding: '20px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', textAlign: 'center', fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            © 2026 Swaramayi Real Estate Marketing. All rights reserved. • High-Intent Property Marketing & Buyer Advisory
          </div>
        </div>
      )}

      {/* LIVE DEV SERVER IFRAME VIEW */}
      {viewMode === 'iframe' && (
        <div style={{ background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', height: '75vh', overflow: 'hidden', position: 'relative' }}>
          <iframe
            key={iframeKey}
            src={websiteUrl}
            title="Swaramayi Website Live Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )}

      {/* SERVER SETUP & STATUS INSTRUCTIONS */}
      {viewMode === 'setup' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
            <Terminal size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              Website Frontend & Backend Local Dev Server Setup
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            To run the standalone customer website on <code>http://localhost:5001</code>, follow these simple terminal steps:
          </p>

          <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span># Option A: From root workspace folder</span>
            <span style={{ color: '#4ade80' }}>npm run dev:website</span>
            <br />
            <span># Option B: Navigate to website frontend directory</span>
            <span style={{ color: '#ffffff' }}>cd website-frontend</span>
            <span style={{ color: '#4ade80' }}>npm run dev</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#0284c7', color: '#ffffff', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', textDecoration: 'none', fontSize: '0.85rem' }}
            >
              Test http://localhost:5001 Connection 🔗
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
