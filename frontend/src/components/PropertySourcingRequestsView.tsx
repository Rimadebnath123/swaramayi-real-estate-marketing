import React, { useState, useEffect } from 'react';
import { 
  SearchCode, Plus, Search, Filter, ShieldAlert, CheckCircle2, Clock, 
  Building2, User, Phone, MapPin, ArrowUpRight, Sparkles, X, Check,
  Edit3, Trash2, Tag, Eye, RefreshCw, Send, AlertTriangle
} from 'lucide-react';
import { getCustomerUsedPropertyCodes } from './MatchingManagementView';

interface PropertySourcingRequestsViewProps {
  isLight: boolean;
  windowWidth: number;
  leadsList: any[];
  customers: any[];
  properties: any[];
  sourcingRequests?: any[];
  setSourcingRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  isSuperAdmin?: boolean;
  openIdDetailsModal: (id: string, type: string) => void;
  maskPhone: (phone: string) => string;
  setActiveTab: (tab: string) => void;
  setSelectedMatchingId?: (id: string) => void;
  individualCostSheets?: any[];
  costSheetShares?: any[];
  scheduledVisits?: any[];
  onRecycleItem?: (itemData: any) => void;
}

export const PropertySourcingRequestsView: React.FC<PropertySourcingRequestsViewProps> = ({
  isLight,
  windowWidth,
  leadsList = [],
  customers = [],
  properties = [],
  sourcingRequests: sourcingRequestsProps,
  setSourcingRequests: setSourcingRequestsProps,
  isSuperAdmin = false,
  openIdDetailsModal,
  maskPhone,
  setActiveTab,
  setSelectedMatchingId,
  individualCostSheets = [],
  costSheetShares = [],
  scheduledVisits = [],
  onRecycleItem
}) => {
  // Sourcing Requests Queue with LocalStorage Persistence & Dynamic Fallback
  const [internalSourcingRequests, setInternalSourcingRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('swaramayi_sourcing_requests_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('Error loading sourcing requests', err);
    }
    return [];
  });

  const sourcingRequests = sourcingRequestsProps || internalSourcingRequests;
  const setSourcingRequests = setSourcingRequestsProps || setInternalSourcingRequests;

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<{ open: boolean; request: any } | null>(null);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState<{ open: boolean; request: any } | null>(null);

  // New Request Form State
  const [newRequestForm, setNewRequestForm] = useState({
    customer_name: '',
    mobile: '',
    email: '',
    preferred_locality: 'Kondapur',
    secondary_areas: 'Gachibowli, Hitec City',
    property_type: 'Flat / Apartment',
    configuration: '3BHK',
    budget_min: '₹70 Lakhs',
    budget_max: '₹90 Lakhs',
    possession_status: 'Ready to Move',
    facing: 'East Facing',
    priority: 'HOT',
    assigned_executive: 'Punita Roy (Sales Exec)',
    notes: ''
  });

  // Update Status Form State
  const [updateForm, setUpdateForm] = useState({
    status: 'PENDING_SOURCING',
    notes: '',
    matched_property_code: ''
  });

  // Persist to LocalStorage whenever sourcingRequests change
  useEffect(() => {
    try {
      localStorage.setItem('swaramayi_sourcing_requests_v1', JSON.stringify(sourcingRequests));
    } catch (err) {
      console.error('Error persisting sourcing requests', err);
    }
  }, [sourcingRequests]);

  // Handle Create Sourcing Request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.customer_name || !newRequestForm.mobile) {
      alert('⚠️ Please enter Customer Name and Primary Mobile Phone!');
      return;
    }

    const nextId = `SRM-SRC-2026-000${sourcingRequests.length + 104}`;
    const nextCustCode = `SRM-CUS-2026-000${customers.length + 192}`;

    const newReqObj = {
      id: nextId,
      customer_name: newRequestForm.customer_name,
      customer_number: nextCustCode,
      mobile: newRequestForm.mobile,
      preferred_locality: newRequestForm.preferred_locality,
      secondary_areas: newRequestForm.secondary_areas || 'Barasat, New Town',
      property_type: newRequestForm.property_type,
      configuration: newRequestForm.configuration,
      budget_min: newRequestForm.budget_min,
      budget_max: newRequestForm.budget_max,
      possession_status: newRequestForm.possession_status,
      facing: newRequestForm.facing,
      assigned_executive: newRequestForm.assigned_executive,
      status: 'PENDING_SOURCING',
      priority: newRequestForm.priority,
      notes: newRequestForm.notes || 'New Property Sourcing Request registered.',
      created_at: new Date().toISOString()
    };

    const nextList = [newReqObj, ...sourcingRequests];
    setSourcingRequests(nextList);
    setShowCreateModal(false);
    
    // Reset Form
    setNewRequestForm({
      customer_name: '',
      mobile: '',
      email: '',
      preferred_locality: 'Kondapur',
      secondary_areas: 'Gachibowli, Hitec City',
      property_type: 'Flat / Apartment',
      configuration: '3BHK',
      budget_min: '₹70 Lakhs',
      budget_max: '₹90 Lakhs',
      possession_status: 'Ready to Move',
      facing: 'East Facing',
      priority: 'HOT',
      assigned_executive: 'Punita Roy (Sales Exec)',
      notes: ''
    });

    alert(`🎉 PROPERTY SOURCING REQUEST CREATED!\n\n• Sourcing ID: ${nextId}\n• Customer: ${newReqObj.customer_name}\n• Location: ${newReqObj.preferred_locality}\n• Assigned Desk: ${newReqObj.assigned_executive}\n\nPersisted into Sourcing Queue!`);
  };

  // Handle Update Status
  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUpdateModal || !showUpdateModal.request) return;

    const reqId = showUpdateModal.request.id;
    const nextList = sourcingRequests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: updateForm.status,
          notes: updateForm.notes ? `${r.notes}\n[${new Date().toLocaleDateString('en-GB')}]: ${updateForm.notes}` : r.notes,
          matched_property_code: updateForm.matched_property_code || r.matched_property_code,
          updated_at: new Date().toISOString()
        };
      }
      return r;
    });

    setSourcingRequests(nextList);
    setShowUpdateModal(null);
    alert(`✅ SOURCING REQUEST ${reqId} UPDATED!\n\nStatus set to: ${updateForm.status}`);
  };

  // Handle Send Customer Back to Matching Management without changing original Matching Code
  const handleSendToMatching = (req: any) => {
    if (!req) return;

    const originalMatchingId = req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422';
    const targetCustNo = (req.customer_number || req.customer_id || '').toString().trim().toLowerCase();
    const targetMob = (req.mobile || '').toString().replace(/\D/g, '');
    const targetReqId = (req.id || req.sourcing_id || '').toString().trim().toLowerCase();

    if (setSourcingRequests) {
      setSourcingRequests(prev => {
        const nextList = (prev || []).filter((r: any) => {
          const rId = (r.id || r.sourcing_id || '').toString().trim().toLowerCase();
          const rCustNo = (r.customer_number || r.customer_id || r.customerNumber || '').toString().trim().toLowerCase();
          const rMob = (r.mobile || '').toString().replace(/\D/g, '');

          if (targetReqId && rId && rId === targetReqId) return false;
          if (targetCustNo && rCustNo && targetCustNo === rCustNo) return false;
          if (targetMob && rMob && targetMob.length >= 7 && targetMob === rMob) return false;
          return true;
        });
        try {
          localStorage.setItem('swaramayi_sourcing_requests_v1', JSON.stringify(nextList));
        } catch (e) {
          console.error('Error persisting sourcing requests after send to matching', e);
        }
        return nextList;
      });
    }

    if (setSelectedMatchingId) {
      setSelectedMatchingId(originalMatchingId);
    }

    setActiveTab('matching_management');
    alert(`⚡ CUSTOMER TRANSFERRED TO MATCHING MANAGEMENT!\n\n• Customer: ${req.customer_name}\n• Matching ID (Unchanged): ${originalMatchingId}\n\nTransferred out of Property Sourcing Vault back into Matching Management Workspace.`);
  };

  // Deduplicate Sourcing Requests by Customer ID / Mobile so each customer ID has at most 1 Sourcing Request
  const uniqueSourcingRequests = (() => {
    const map = new Map<string, any>();
    (sourcingRequests || []).forEach(req => {
      const custKey = (req.customer_number || req.customer_id || req.customerNumber || '').toString().trim().toLowerCase();
      const mobKey = (req.mobile || '').toString().replace(/\D/g, '');
      const nameKey = (req.customer_name || req.customerName || '').toString().trim().toLowerCase();
      const key = custKey || (mobKey.length >= 7 ? mobKey : nameKey);

      if (!key) return;

      if (!map.has(key)) {
        map.set(key, req);
      } else {
        const existing = map.get(key);
        const existingDate = new Date(existing.created_at || 0).getTime();
        const newDate = new Date(req.created_at || 0).getTime();
        if (newDate >= existingDate) {
          map.set(key, { ...existing, ...req });
        }
      }
    });
    return Array.from(map.values());
  })();

  // Filter Sourcing Requests
  const filteredRequests = uniqueSourcingRequests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && req.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (req.customer_name || '').toLowerCase().includes(q);
      const matchId = (req.id || '').toLowerCase().includes(q);
      const matchCustCode = (req.customer_number || '').toLowerCase().includes(q);
      const matchMatchingId = (req.matching_id || (req.lead_details && req.lead_details.matching_id) || '').toLowerCase().includes(q);
      const matchMobile = (req.mobile || '').includes(q);
      const matchLoc = (req.preferred_locality || '').toLowerCase().includes(q);
      const matchNotes = (req.sourcing_reason || req.notes || '').toLowerCase().includes(q);
      return matchName || matchId || matchCustCode || matchMatchingId || matchMobile || matchLoc || matchNotes;
    }
    return true;
  });

  // Summary Metrics
  const totalCount = uniqueSourcingRequests.length;
  const pendingCount = uniqueSourcingRequests.filter(r => r.status === 'PENDING_SOURCING').length;
  const contactedCount = uniqueSourcingRequests.filter(r => r.status === 'BUILDER_CONTACTED').length;
  const matchedCount = uniqueSourcingRequests.filter(r => r.status === 'INVENTORY_MATCHED' || r.status === 'CLOSED').length;
  const urgentCount = uniqueSourcingRequests.filter(r => r.priority === 'HOT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* TOP TITLE & ACTION HEADER */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : 'none' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchCode size={24} color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: windowWidth <= 640 ? '1.15rem' : '1.35rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>PROPERTY SOURCING REQUESTS DESK</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Custom Property Sourcing Queue • Off-Market & Builder Inventory Procurement • Client Specification Matching
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)} 
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)', width: windowWidth <= 640 ? '100%' : 'auto' }}
        >
          <Plus size={16} /> + CREATE NEW SOURCING REQUEST
        </button>
      </div>

      {/* METRICS CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 480 ? '1fr' : windowWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '10px', color: '#38bdf8' }}>
            <SearchCode size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>TOTAL SOURCING QUEUE</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '2px 0 0 0' }}>{totalCount} Requests</h3>
          </div>
        </div>

        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '10px', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>HOT / URGENT SOURCING</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ef4444', margin: '2px 0 0 0' }}>{urgentCount} Urgent</h3>
          </div>
        </div>

        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '10px', borderRadius: '10px', color: '#fbbf24' }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>BUILDER CONTACTED</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fbbf24', margin: '2px 0 0 0' }}>{contactedCount} In Progress</h3>
          </div>
        </div>

        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '10px', borderRadius: '10px', color: '#4ade80' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>MATCHED / FULFILLED</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#4ade80', margin: '2px 0 0 0' }}>{matchedCount} Matched</h3>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 640 ? '10px' : '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* STATUS TABS */}
        <div className="horizontal-scroll-touch" style={{ width: windowWidth <= 640 ? '100%' : 'auto' }}>
          {[
            { id: 'ALL', label: `All Requests (${sourcingRequests.length})` },
            { id: 'PENDING_SOURCING', label: `⚡ Pending (${pendingCount})` },
            { id: 'BUILDER_CONTACTED', label: `🟡 Builder Contacted (${contactedCount})` },
            { id: 'INVENTORY_MATCHED', label: `🟢 Matched (${matchedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                background: statusFilter === tab.id ? '#0284c7' : (isLight ? '#f1f5f9' : '#0f172a'),
                color: statusFilter === tab.id ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                border: statusFilter === tab.id ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT & PRIORITY SELECT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: windowWidth <= 640 ? '100%' : 'auto', flexWrap: 'wrap' }}>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', width: windowWidth <= 640 ? '100%' : 'auto' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HOT">🔥 HOT / Urgent Only</option>
            <option value="WARM">⚡ WARM Priority</option>
            <option value="COLD">❄️ COLD Priority</option>
          </select>

          <div style={{ position: 'relative', width: windowWidth <= 640 ? '100%' : '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search Customer, Reason, ID, Locality..." 
              style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '6px 10px 6px 30px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }} 
            />
          </div>
        </div>

      </div>

      {/* SOURCING REQUESTS DATA TABLE */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.9rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900' }}>
            📋 ACTIVE PROPERTY SOURCING VAULT ({filteredRequests.length} Records)
          </strong>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Showing Filtered Sourcing Queue • Auto-Refreshed
          </span>
        </div>

        {windowWidth <= 768 ? (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRequests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
                🔍 No property sourcing requests found matching your filters.
              </div>
            ) : (
              filteredRequests.map(req => {
                const isPending = req.status === 'PENDING_SOURCING';
                const isContacted = req.status === 'BUILDER_CONTACTED';
                const isMatched = req.status === 'INVENTORY_MATCHED' || req.status === 'CLOSED';
                const shiftNotes = req.sourcing_reason || req.notes || (req.lead_details && req.lead_details.sourcing_reason) || 'No specific notes recorded.';

                return (
                  <div key={req.id} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span 
                        onClick={() => setShowLeadDetailsModal({ open: true, request: req })}
                        style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.84rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Click to view full lead details & sourcing reason"
                      >
                        🎯 {req.id}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {req.priority === 'HOT' && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '0.68rem' }}>🔥 HOT</span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                          📅 {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.95rem', color: isLight ? '#0f172a' : '#ffffff' }}>{req.customer_name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace', marginTop: '2px' }}>
                        📞 {maskPhone(req.mobile)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
                      <span 
                        onClick={() => openIdDetailsModal(req.customer_number, 'CUSTOMER_ID')}
                        style={{ color: '#4ade80', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        👤 {req.customer_number}
                      </span>
                      <span 
                        onClick={() => openIdDetailsModal(req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422', 'MATCHING_ID')}
                        style={{ color: '#c084fc', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid rgba(192, 132, 252, 0.3)', padding: '1px 5px', borderRadius: '4px' }}
                      >
                        ⚡ {req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422'}
                      </span>
                    </div>

                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                      <div>
                        <strong style={{ color: '#fbbf24' }}>{req.configuration} {req.property_type}</strong>
                        <span style={{ marginLeft: '6px', color: '#22c55e', fontWeight: '800' }}>📍 {req.preferred_locality || 'Madhamgram'}</span>
                      </div>
                      <div style={{ color: '#4ade80', fontWeight: '900' }}>
                        Target Budget: {req.budget_min && req.budget_max ? `${req.budget_min} - ${req.budget_max}` : (req.budget_max || req.budget_min || '₹70 Lakhs+')}
                      </div>
                    </div>

                    <div style={{ background: isLight ? '#fef3c7' : 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.76rem', color: isLight ? '#0f172a' : '#ffffff' }}>
                      <span style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: '900', display: 'block', marginBottom: '2px' }}>
                        💬 SIFT REASON / NOTES:
                      </span>
                      <strong style={{ fontWeight: '800', wordBreak: 'break-word' }}>
                        "{shiftNotes}"
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        {isPending && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.7rem' }}>
                            ⚡ PENDING SOURCING
                          </span>
                        )}
                        {isContacted && (
                          <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.7rem' }}>
                            🟡 BUILDER CONTACTED
                          </span>
                        )}
                        {isMatched && (
                          <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.7rem' }}>
                            🟢 INVENTORY MATCHED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                        Desk: {req.assigned_executive}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '10px' }}>
                      <button
                        onClick={() => setShowLeadDetailsModal({ open: true, request: req })}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Eye size={12} /> Details
                      </button>
                      <button
                        onClick={() => {
                          setUpdateForm({
                            status: req.status,
                            notes: '',
                            matched_property_code: req.matched_property_code || ''
                          });
                          setShowUpdateModal({ open: true, request: req });
                        }}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Edit3 size={12} /> Update
                      </button>
                      <button
                        onClick={() => handleSendToMatching(req)}
                        style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '6px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Sparkles size={12} /> Matching
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Sourcing Request ${req.id} for ${req.customer_name}? It will be moved to Recycle Bin.`)) {
                              if (onRecycleItem) {
                                onRecycleItem({
                                  id: req.id || `SRC-${Date.now()}`,
                                  title: `Sourcing Request - ${req.customer_name || 'Client'} (${req.id})`,
                                  category: 'Lead',
                                  originalLocation: 'Property Sourcing Requests Desk',
                                  details: `Locality: ${req.locality || 'N/A'}, Budget: ${req.budget || 'N/A'}`,
                                  originalData: req
                                });
                              }
                              const nextList = sourcingRequests.filter((r: any) => r.id !== req.id);
                              setSourcingRequests(nextList);
                              alert(`🗑️ Sourcing Request ${req.id} moved to Recycle Bin.`);
                            }
                          }}
                          style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Sourcing ID & Date</th>
                  <th style={{ padding: '12px' }}>Customer Name & Contact</th>
                  <th style={{ padding: '12px' }}>Customer & Matching ID</th>
                  <th style={{ padding: '12px' }}>Target Spec & Locality</th>
                  <th style={{ padding: '12px' }}>💬 Shift Reason / Executive Notes</th>
                  <th style={{ padding: '12px' }}>Target Budget</th>
                  <th style={{ padding: '12px' }}>Sourcing Status</th>
                  <th style={{ padding: '12px' }}>Assigned Desk</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8' }}>
                      🔍 No property sourcing requests found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const isPending = req.status === 'PENDING_SOURCING';
                    const isContacted = req.status === 'BUILDER_CONTACTED';
                    const isMatched = req.status === 'INVENTORY_MATCHED' || req.status === 'CLOSED';
                    const shiftNotes = req.sourcing_reason || req.notes || (req.lead_details && req.lead_details.sourcing_reason) || 'No specific notes recorded.';

                    return (
                      <tr key={req.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>
                          <span 
                            onClick={() => setShowLeadDetailsModal({ open: true, request: req })}
                            style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.84rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', display: 'inline-block' }}
                            title="Click to view full lead details & sourcing reason"
                          >
                            🎯 {req.id}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px', display: 'block' }}>
                            📅 {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{req.customer_name}</strong>
                          <br />
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace' }}>
                            📞 {maskPhone(req.mobile)}
                          </span>
                          {(() => {
                            const usedProps = getCustomerUsedPropertyCodes(
                              req.customer_number || req.customerId,
                              req.customer_name || req.customerName,
                              req.mobile,
                              individualCostSheets,
                              costSheetShares,
                              scheduledVisits
                            );
                            if (usedProps.length === 0) return null;
                            return (
                              <div style={{ marginTop: '4px', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', borderRadius: '4px', padding: '3px 6px', fontSize: '0.7rem' }}>
                                <span style={{ color: '#38bdf8', fontWeight: '800' }}>🏢 Cost Sheet Property Codes ({usedProps.length}):</span>
                                <div style={{ color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace', display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                                  {usedProps.map(p => (
                                    <span key={p.propertyCode} style={{ background: '#0f172a', border: '1px solid #eab308', padding: '1px 4px', borderRadius: '3px' }}>
                                      {p.propertyCode}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span 
                            onClick={() => openIdDetailsModal(req.customer_number, 'CUSTOMER_ID')}
                            style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer', display: 'block' }}
                            title="Click to view Customer details"
                          >
                            👤 {req.customer_number}
                          </span>
                          <span 
                            onClick={() => openIdDetailsModal(req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422', 'MATCHING_ID')}
                            style={{ fontSize: '0.73rem', color: '#c084fc', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer', display: 'inline-block', marginTop: '4px', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid rgba(192, 132, 252, 0.3)', padding: '2px 6px', borderRadius: '4px' }}
                            title="Click to view Matching Request details"
                          >
                            ⚡ {req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422'}
                          </span>
                        </td>

                        <td style={{ padding: '12px', minWidth: '190px' }}>
                          <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{req.configuration} {req.property_type}</strong>
                          <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                            <span style={{ color: '#22c55e', fontWeight: '900' }}>📍 Primary Preferred:</span>{' '}
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>
                              {req.preferred_locality || 'Madhamgram'}
                            </strong>
                          </div>
                          <div style={{ marginTop: '2px', fontSize: '0.73rem' }}>
                            <span style={{ color: '#38bdf8', fontWeight: '900' }}>🌐 Secondary Preferred:</span>{' '}
                            <span style={{ color: isLight ? '#475569' : '#cbd5e1', fontWeight: '700' }}>
                              {req.secondary_areas || (req.lead_details && req.lead_details.secondary_areas) || 'Barasat, New Town, Hitec City'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                            Facing: {req.facing || 'East Facing'}
                          </span>
                        </td>

                        <td style={{ padding: '12px', minWidth: '220px', maxWidth: '320px' }}>
                          <div style={{ background: isLight ? '#fef3c7' : 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', lineHeight: '1.4' }}>
                            <span style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                              💬 SIFT REASON / NOTES:
                            </span>
                            <strong style={{ fontWeight: '800', wordBreak: 'break-word' }}>
                              "{shiftNotes}"
                            </strong>
                          </div>
                        </td>

                        <td style={{ padding: '12px', color: '#4ade80', fontWeight: '900' }}>
                          {req.budget_min && req.budget_max ? `${req.budget_min} - ${req.budget_max}` : (req.budget_max || req.budget_min || '₹70 Lakhs+')}
                        </td>

                        <td style={{ padding: '12px' }}>
                          {isPending && (
                            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.73rem', display: 'inline-block' }}>
                              ⚡ PENDING SOURCING
                            </span>
                          )}
                          {isContacted && (
                            <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.73rem', display: 'inline-block' }}>
                              🟡 BUILDER CONTACTED
                            </span>
                          )}
                          {isMatched && (
                            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '3px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.73rem', display: 'inline-block' }}>
                              🟢 INVENTORY MATCHED
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.78rem' }}>
                            {req.assigned_executive}
                          </span>
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => setShowLeadDetailsModal({ open: true, request: req })}
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="View complete Create New Lead 360° details & sourcing reason"
                            >
                              <Eye size={13} /> Lead Details
                            </button>
                            <button
                              onClick={() => {
                                setUpdateForm({
                                  status: req.status,
                                  notes: '',
                                  matched_property_code: req.matched_property_code || ''
                                });
                                setShowUpdateModal({ open: true, request: req });
                              }}
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit3 size={13} /> Update
                            </button>
                            <button
                              onClick={() => handleSendToMatching(req)}
                              style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title={`Send ${req.customer_name} back to Matching Management under original Matching Code: ${req.matching_id || (req.lead_details && req.lead_details.matching_id) || 'SRM-MAT-2026-000422'}`}
                            >
                              <Sparkles size={13} /> Send to Matching
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Sourcing Request ${req.id} for ${req.customer_name}? It will be moved to Recycle Bin.`)) {
                                    if (onRecycleItem) {
                                      onRecycleItem({
                                        id: req.id || `SRC-${Date.now()}`,
                                        title: `Sourcing Request - ${req.customer_name || 'Client'} (${req.id})`,
                                        category: 'Lead',
                                        originalLocation: 'Property Sourcing Requests Desk',
                                        details: `Locality: ${req.locality || 'N/A'}, Budget: ${req.budget || 'N/A'}`,
                                        originalData: req
                                      });
                                    }
                                    const nextList = sourcingRequests.filter((r: any) => r.id !== req.id);
                                    setSourcingRequests(nextList);
                                    alert(`🗑️ Sourcing Request ${req.id} moved to Recycle Bin.`);
                                  }
                                }}
                                style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Super Admin Only: Permanently delete this sourcing request"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW SOURCING REQUEST MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: windowWidth <= 640 ? '10px' : '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', padding: windowWidth <= 640 ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SearchCode size={20} color="#38bdf8" />
                <h3 style={{ fontSize: windowWidth <= 480 ? '0.95rem' : '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>CREATE NEW PROPERTY SOURCING REQUEST</h3>
              </div>
              <X size={20} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setShowCreateModal(false)} />
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Customer Full Name *</label>
                  <input type="text" value={newRequestForm.customer_name} onChange={(e) => setNewRequestForm({ ...newRequestForm, customer_name: e.target.value })} placeholder="e.g. Bishwajit Pandey" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Primary Mobile Phone *</label>
                  <input type="text" value={newRequestForm.mobile} onChange={(e) => setNewRequestForm({ ...newRequestForm, mobile: e.target.value })} placeholder="+91 98305 97778" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Primary Preferred Locality *</label>
                  <input type="text" value={newRequestForm.preferred_locality} onChange={(e) => setNewRequestForm({ ...newRequestForm, preferred_locality: e.target.value })} placeholder="e.g. Madhamgram" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Secondary Preferred Localities</label>
                  <input type="text" value={newRequestForm.secondary_areas} onChange={(e) => setNewRequestForm({ ...newRequestForm, secondary_areas: e.target.value })} placeholder="e.g. Barasat, New Town, Hitec City" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Property Type</label>
                  <select value={newRequestForm.property_type} onChange={(e) => setNewRequestForm({ ...newRequestForm, property_type: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="Flat / Apartment">Flat / Apartment</option>
                    <option value="Luxury Villa">Luxury Villa</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Office Space">Commercial Office Space</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Configuration</label>
                  <select value={newRequestForm.configuration} onChange={(e) => setNewRequestForm({ ...newRequestForm, configuration: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Min Budget</label>
                  <input type="text" value={newRequestForm.budget_min} onChange={(e) => setNewRequestForm({ ...newRequestForm, budget_min: e.target.value })} placeholder="₹50 Lakhs" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Max Budget</label>
                  <input type="text" value={newRequestForm.budget_max} onChange={(e) => setNewRequestForm({ ...newRequestForm, budget_max: e.target.value })} placeholder="₹75 Lakhs" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Priority</label>
                  <select value={newRequestForm.priority} onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="HOT">🔥 HOT / Urgent</option>
                    <option value="WARM">⚡ WARM Priority</option>
                    <option value="COLD">❄️ COLD Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Specific Sourcing Notes & Requirements</label>
                <textarea rows={3} value={newRequestForm.notes} onChange={(e) => setNewRequestForm({ ...newRequestForm, notes: e.target.value })} placeholder="Enter builder details, specific floor, east facing, urgency notes..." style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}>
                  🚀 Create Sourcing Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showUpdateModal && showUpdateModal.request && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: windowWidth <= 640 ? '10px' : '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', padding: windowWidth <= 640 ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: windowWidth <= 480 ? '0.95rem' : '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>UPDATE SOURCING STATUS</h3>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{showUpdateModal.request.id} • {showUpdateModal.request.customer_name}</span>
              </div>
              <X size={20} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setShowUpdateModal(null)} />
            </div>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Select Sourcing Stage *</label>
                <select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}>
                  <option value="PENDING_SOURCING">⚡ PENDING SOURCING</option>
                  <option value="BUILDER_CONTACTED">🟡 BUILDER CONTACTED (Procurement Active)</option>
                  <option value="INVENTORY_MATCHED">🟢 INVENTORY MATCHED & READY</option>
                  <option value="CLOSED">🔒 CLOSED / FULFILLED</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Matched Property Code (Optional)</label>
                <input type="text" value={updateForm.matched_property_code} onChange={(e) => setUpdateForm({ ...updateForm, matched_property_code: e.target.value })} placeholder="e.g. PROP-2026-00042" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Add Sourcing Desk Notes & Updates</label>
                <textarea rows={3} value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} placeholder="Enter builder response, stock availability, pricing updates..." style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowUpdateModal(null)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Save Sourcing Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* COMPLETE LEAD 360° SPECIFICATION & SOURCING DETAILS MODAL */}
      {showLeadDetailsModal && showLeadDetailsModal.request && (() => {
        const req = showLeadDetailsModal.request;
        const details = req.lead_details || {};
        const custName = req.customer_name || details.customer_name || 'Customer';
        const mobile = req.mobile || details.mobile || '';
        const custNo = req.customer_number || details.customer_number || req.customer_id || 'N/A';
        const leadId = req.lead_id || details.lead_number || 'SRM-LD-2026-000101';
        const sourcingId = req.id || req.sourcing_id || 'SRM-SRC-2026-000101';
        const matchingId = req.matching_id || details.matching_id || 'SRM-MAT-2026-000422';
        const sourcingReason = req.sourcing_reason || req.notes || details.sourcing_reason || 'Property sourcing request initiated.';

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: windowWidth <= 640 ? '10px' : '20px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', borderRadius: '16px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: windowWidth <= 640 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
              
              {/* MODAL HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '10px' }}>
                    <SearchCode size={24} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      PROPERTY SOURCING REQUEST — COMPLETE LEAD 360° DETAILS
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.74rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                        🎯 {sourcingId}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: '900', fontSize: '0.74rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                        👤 {custNo}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '900', fontSize: '0.74rem', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                        📋 {leadId}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: '#c084fc', fontWeight: '900', fontSize: '0.74rem', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid rgba(192, 132, 252, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                        ⚡ {matchingId}
                      </span>
                    </div>
                  </div>
                </div>
                <X size={22} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setShowLeadDetailsModal(null)} />
              </div>

              {/* HIGHLIGHTED SOURCING REASON (MANDATORY EXECUTIVE MESSAGE) */}
              <div style={{ background: isLight ? '#fef3c7' : 'rgba(234, 179, 8, 0.12)', border: '1.5px solid #f59e0b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📌 MANDATORY SOURCING REASON / EXECUTIVE MESSAGE (WHY SENT TO SOURCING DESK):
                </span>
                <p style={{ fontSize: '0.92rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', margin: 0, lineHeight: 1.5 }}>
                  "{sourcingReason}"
                </p>
              </div>

              {/* SECTION 1: 👤 CUSTOMER CONTACT & LEAD IDENTITY */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#38bdf8', margin: 0, borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '6px' }}>
                  1. Customer Identity & Intake Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Customer Full Name:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block', fontSize: '0.92rem' }}>{custName}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Primary Mobile Phone:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace', display: 'block' }}>📞 {maskPhone(mobile)}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Email Address:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{req.email || details.email || 'N/A'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Lead Acquisition Source:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{details.lead_source || 'Meta Ads / Direct Intake'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Investment Purpose:</span> <strong style={{ color: '#4ade80', display: 'block' }}>{details.investment_purpose || 'Self Use / End User'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Assigned Executive Desk:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{req.assigned_executive || 'Punita Roy (Sales Exec)'}</strong></div>
                </div>
              </div>

              {/* SECTION 2: 🏡 PROPERTY REQUIREMENTS & SPECIFICATIONS */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fbbf24', margin: 0, borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '6px' }}>
                  2. Detailed Property Specifications (Create Lead Intake)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Property Type:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{req.property_type || 'Flat / Apartment'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>BHK Configuration:</span> <strong style={{ color: '#fbbf24', display: 'block', fontSize: '0.92rem' }}>{req.configuration || '2BHK'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Target Preferred Locality:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>📍 {req.preferred_locality}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Secondary Search Localities:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{details.secondary_areas || 'Hitec City, Gachibowli'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Facing Direction:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>🧭 {req.facing || 'East Facing'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Possession Timeline:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>⌛ {req.possession_status || 'Ready to Move'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Floor Number (Unit Floor):</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>🏢 {details.floor_pref || '1st Floor, 2nd Floor'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Carpet / Built-up Area:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>📐 {details.carpet_area_min && details.carpet_area_max ? `${details.carpet_area_min} - ${details.carpet_area_max}` : '1000 - 1800 Sq.Ft.'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Parking & Charging:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>🚗 {details.parking || 'Covered Slot + EV Charger'}</strong></div>
                </div>
                <div>
                  <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Required Amenities & Features:</span>
                  <strong style={{ color: '#38bdf8', display: 'block', fontSize: '0.8rem', marginTop: '2px' }}>
                    ✨ {details.amenities || 'Gym, Swimming Pool, Clubhouse, Power Backup, 24/7 Security'}
                  </strong>
                </div>
              </div>

              {/* SECTION 3: 💰 BUDGET & FINANCIAL PROFILE */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#4ade80', margin: 0, borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '6px' }}>
                  3. Budget & Financial Qualification
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Target Budget Range:</span> <strong style={{ color: '#4ade80', display: 'block', fontSize: '0.95rem' }}>💰 {req.budget_min && req.budget_max ? `${req.budget_min} - ${req.budget_max}` : (req.budget_max || req.budget_min || '₹50 Lakhs - ₹1.00 Crore')}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Budget Flexibility:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{details.budget_flexibility || '+10% Negotiable for Prime Location'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Home Loan Status:</span> <strong style={{ color: '#38bdf8', display: 'block' }}>🏦 {details.loan_status || 'Pre-Approved (HDFC Bank)'}</strong></div>
                </div>
              </div>

              {/* SECTION 4: 🏢 SOURCING STAGE & AUDIT LOG */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#c084fc', margin: 0, borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '6px' }}>
                  4. Sourcing Desk Audit & Status History
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Current Sourcing Stage:</span> <strong style={{ color: '#ef4444', display: 'block' }}>⚡ {req.status}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Matched Property Code:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace', display: 'block' }}>{req.matched_property_code || 'None yet (Sourcing active)'}</strong></div>
                  <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>Sourcing Created Date:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>📅 {new Date(req.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowLeadDetailsModal(null)}
                  style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Close Specification Modal
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
