import React, { useState } from 'react';
import {
  Trash2, RotateCcw, Search, AlertTriangle, CheckCircle2,
  Users, UserCheck, Building2, FileText, DollarSign, CreditCard, Navigation
} from 'lucide-react';

export interface RecycleBinItem {
  id: string;
  title: string;
  category: 'Lead' | 'Customer' | 'Project' | 'Agreement' | 'Cost Sheet' | 'Billing' | 'Visit Management';
  deletedBy: string;
  deletedAt: string;
  originalLocation: string;
  details: string;
  originalData?: any;
}

interface RecycleBinViewProps {
  isLight: boolean;
  recycledItems: RecycleBinItem[];
  windowWidth?: number;
  onRestoreItem: (item: RecycleBinItem) => void;
  onPurgeItem: (item: RecycleBinItem) => void;
  onEmptyBin: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  isLight,
  recycledItems = [],
  windowWidth,
  onRestoreItem,
  onPurgeItem,
  onEmptyBin
}) => {
  const [winWidth, setWinWidth] = useState<number>(windowWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200));

  React.useEffect(() => {
    if (windowWidth) {
      setWinWidth(windowWidth);
    } else {
      const handleResize = () => setWinWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [windowWidth]);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [itemToPurge, setItemToPurge] = useState<RecycleBinItem | null>(null);
  const [showEmptyConfirmModal, setShowEmptyConfirmModal] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRestore = (item: RecycleBinItem) => {
    onRestoreItem(item);
    showToast(`✅ "${item.title}" restored to ${item.originalLocation}!`);
  };

  const handleConfirmPurge = () => {
    if (!itemToPurge) return;
    onPurgeItem(itemToPurge);
    showToast(`🗑️ "${itemToPurge.title}" permanently deleted from CRM.`);
    setItemToPurge(null);
  };

  const handleEmptyBin = () => {
    onEmptyBin();
    setShowEmptyConfirmModal(false);
    showToast(`✨ Recycle Bin has been completely emptied.`);
  };

  const filteredItems = recycledItems.filter(item => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      (item.title || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q) ||
      (item.details || '').toLowerCase().includes(q) ||
      (item.deletedBy || '').toLowerCase().includes(q) ||
      (item.originalLocation || '').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const getCategoryIcon = (cat: RecycleBinItem['category']) => {
    switch (cat) {
      case 'Lead': return <Users size={16} color="#38bdf8" />;
      case 'Customer': return <UserCheck size={16} color="#10b981" />;
      case 'Project': return <Building2 size={16} color="#f59e0b" />;
      case 'Agreement': return <FileText size={16} color="#ec4899" />;
      case 'Cost Sheet': return <DollarSign size={16} color="#8b5cf6" />;
      case 'Billing': return <CreditCard size={16} color="#06b6d4" />;
      case 'Visit Management': return <Navigation size={16} color="#eab308" />;
      default: return <Trash2 size={16} color="#94a3b8" />;
    }
  };

  const bgCard = isLight ? '#ffffff' : '#0f172a';
  const borderCol = isLight ? '#e2e8f0' : '#1e293b';
  const textMain = isLight ? '#0f172a' : '#f8fafc';
  const textSub = isLight ? '#64748b' : '#94a3b8';

  return (
    <div style={{ padding: winWidth <= 640 ? '12px' : '24px', color: textMain, maxWidth: '1400px', margin: '0 auto' }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: winWidth <= 640 ? '10px' : '20px',
          left: winWidth <= 640 ? '10px' : 'auto',
          zIndex: 9999,
          background: isLight ? '#0284c7' : '#0369a1',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: '600',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={20} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: winWidth <= 640 ? '16px' : '24px',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: winWidth <= 480 ? '36px' : '42px',
              height: winWidth <= 480 ? '36px' : '42px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              flexShrink: 0
            }}>
              <Trash2 size={winWidth <= 480 ? 20 : 24} color="#ef4444" />
            </div>
            <div>
              <h1 style={{ fontSize: winWidth <= 480 ? '1.2rem' : winWidth <= 640 ? '1.4rem' : '1.6rem', fontWeight: '800', margin: 0 }}>
                Recycle Bin & Data Vault
              </h1>
              <p style={{ margin: '4px 0 0 0', color: textSub, fontSize: '0.82rem' }}>
                Soft-deleted items are stored here dynamically when deleted from any CRM module. Restore item back or permanently purge.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: winWidth <= 640 ? '100%' : 'auto' }}>
          {recycledItems.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirmModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                width: winWidth <= 640 ? '100%' : 'auto'
              }}
            >
              <Trash2 size={16} /> Empty Recycle Bin ({recycledItems.length})
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div style={{
        background: bgCard,
        borderRadius: '12px',
        padding: winWidth <= 640 ? '12px' : '16px',
        border: `1px solid ${borderCol}`,
        marginBottom: '20px',
        display: 'flex',
        flexDirection: winWidth <= 640 ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: winWidth <= 640 ? 'stretch' : 'center',
        gap: '14px'
      }}>
        {/* Category Tabs */}
        <div
          className="horizontal-scroll-touch"
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: winWidth <= 768 ? 'nowrap' : 'wrap',
            overflowX: winWidth <= 768 ? 'auto' : 'visible',
            paddingBottom: winWidth <= 768 ? '6px' : '0',
            width: winWidth <= 640 ? '100%' : 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {['ALL', 'Lead', 'Customer', 'Project', 'Agreement', 'Cost Sheet', 'Billing', 'Visit Management'].map(cat => {
            const count = cat === 'ALL'
              ? recycledItems.length
              : recycledItems.filter(i => i.category === cat).length;
            const isSelected = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #38bdf8' : `1px solid ${borderCol}`,
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : (isLight ? '#f8fafc' : '#0f172a'),
                  color: isSelected ? '#38bdf8' : textSub,
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                <span style={{
                  background: isSelected ? '#0284c7' : (isLight ? '#cbd5e1' : '#334155'),
                  color: isSelected ? '#ffffff' : textMain,
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '0.72rem',
                  fontWeight: '700'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: winWidth <= 640 ? '100%' : 'auto', minWidth: winWidth <= 640 ? '0' : '280px', flexGrow: winWidth <= 640 ? 1 : 0 }}>
          <Search size={16} color={textSub} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search deleted records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: `1px solid ${borderCol}`,
              background: isLight ? '#f8fafc' : '#020617',
              color: textMain,
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* RECYCLE BIN ITEMS TABLE / LIST */}
      <div style={{
        background: bgCard,
        borderRadius: '12px',
        border: `1px solid ${borderCol}`,
        overflow: 'hidden'
      }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: winWidth <= 640 ? '40px 16px' : '60px 20px', textAlign: 'center', color: textSub }}>
            <Trash2 size={48} color="#94a3b8" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 6px 0', color: textMain }}>
              No Deleted Items Found
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {recycledItems.length === 0
                ? 'Your Recycle Bin is empty! Any records deleted from Leads, Customers, Projects, Agreements, Cost Sheets, Billing, or Visit Management will automatically be stored here.'
                : 'No items match your search filter.'}
            </p>
          </div>
        ) : winWidth <= 768 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: isLight ? '#f8fafc' : '#020617',
                  border: `1px solid ${borderCol}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: isLight ? '#ffffff' : '#1e293b',
                    border: `1px solid ${borderCol}`,
                    fontSize: '0.78rem',
                    fontWeight: '700'
                  }}>
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </div>

                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', fontSize: '0.8rem' }}>
                    {item.id}
                  </span>
                </div>

                <div>
                  <strong style={{ fontSize: '0.92rem', color: textMain, display: 'block', marginBottom: '2px' }}>
                    {item.title}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: textSub, margin: 0 }}>
                    {item.details}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', color: textSub, background: isLight ? '#ffffff' : '#1e293b', padding: '8px 10px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: textSub, textTransform: 'uppercase' }}>ORIGINAL VAULT</span>
                    <span style={{ fontWeight: '600', color: textMain }}>{item.originalLocation}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: '800', color: textSub, textTransform: 'uppercase' }}>DELETED BY / DATE</span>
                    <span style={{ fontWeight: '600', color: textMain }}>{item.deletedBy}</span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#fbbf24' }}>{item.deletedAt}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: `1px solid ${borderCol}`, paddingTop: '10px' }}>
                  <button
                    onClick={() => handleRestore(item)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} /> Restore
                  </button>

                  <button
                    onClick={() => setItemToPurge(item)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} /> Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{
                  background: isLight ? '#f1f5f9' : '#020617',
                  borderBottom: `1px solid ${borderCol}`,
                  color: textSub,
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '12px 16px' }}>Item ID / Record Title</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Original Vault</th>
                  <th style={{ padding: '12px 16px' }}>Deleted By</th>
                  <th style={{ padding: '12px 16px' }}>Date Deleted</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{
                    borderBottom: `1px solid ${borderCol}`,
                    transition: 'background 0.15s ease'
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: textMain, marginBottom: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: textSub }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', marginRight: '8px' }}>{item.id}</span>
                        • {item.details}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isLight ? '#f1f5f9' : '#1e293b',
                        border: `1px solid ${borderCol}`,
                        fontSize: '0.78rem',
                        fontWeight: '600'
                      }}>
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: textSub, fontSize: '0.82rem' }}>
                      {item.originalLocation}
                    </td>

                    <td style={{ padding: '14px 16px', color: textMain, fontSize: '0.82rem', fontWeight: '500' }}>
                      {item.deletedBy}
                    </td>

                    <td style={{ padding: '14px 16px', color: textSub, fontSize: '0.82rem' }}>
                      {item.deletedAt}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleRestore(item)}
                          title="Restore Record back to original CRM module"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={14} /> Restore
                        </button>

                        <button
                          onClick={() => setItemToPurge(item)}
                          title="Permanently Purge Record"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} /> Purge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SINGLE ITEM PURGE CONFIRM MODAL */}
      {itemToPurge && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: bgCard,
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: winWidth <= 640 ? '16px' : '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: winWidth <= 640 ? '1.05rem' : '1.2rem', fontWeight: '800', color: textMain }}>
                Permanent Purge Confirmation
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: textSub, lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to permanently purge <strong style={{ color: textMain }}>"{itemToPurge.title}"</strong> ({itemToPurge.id})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setItemToPurge(null)}
                style={{
                  flex: winWidth <= 640 ? 1 : 'initial',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: isLight ? '#e2e8f0' : '#1e293b',
                  color: textMain,
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurge}
                style={{
                  flex: winWidth <= 640 ? 1 : 'initial',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Purge Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY ALL CONFIRM MODAL */}
      {showEmptyConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: bgCard,
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: winWidth <= 640 ? '16px' : '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: winWidth <= 640 ? '1.05rem' : '1.2rem', fontWeight: '800', color: textMain }}>
                Empty Recycle Bin
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: textSub, lineHeight: 1.5, marginBottom: '16px' }}>
              This will permanently delete all <strong style={{ color: '#ef4444' }}>{recycledItems.length} items</strong> currently in the Recycle Bin.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowEmptyConfirmModal(false)}
                style={{
                  flex: winWidth <= 640 ? 1 : 'initial',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: isLight ? '#e2e8f0' : '#1e293b',
                  color: textMain,
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyBin}
                style={{
                  flex: winWidth <= 640 ? 1 : 'initial',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Empty Entire Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
