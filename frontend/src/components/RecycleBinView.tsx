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
  onRestoreItem: (item: RecycleBinItem) => void;
  onPurgeItem: (item: RecycleBinItem) => void;
  onEmptyBin: () => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  isLight,
  recycledItems = [],
  onRestoreItem,
  onPurgeItem,
  onEmptyBin
}) => {
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
    <div style={{ padding: '24px', color: textMain, maxWidth: '1400px', margin: '0 auto' }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: isLight ? '#0284c7' : '#0369a1',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: '600',
          fontSize: '0.9rem',
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
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
                Recycle Bin & Data Vault
              </h1>
              <p style={{ margin: '4px 0 0 0', color: textSub, fontSize: '0.875rem' }}>
                Soft-deleted items are stored here dynamically when deleted from any CRM module. Restore item back or permanently purge.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {recycledItems.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirmModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
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
        padding: '16px',
        border: `1px solid ${borderCol}`,
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  gap: '6px'
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
        <div style={{ position: 'relative', minWidth: '280px', flexGrow: 0 }}>
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
          <div style={{ padding: '60px 20px', textAlign: 'center', color: textSub }}>
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
            padding: '24px',
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
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: textMain }}>
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
            padding: '24px',
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
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: textMain }}>
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
