import React from 'react';
import { GitMerge, Calendar, Sparkles, UserPlus, Search, X, ArrowDown, FileSpreadsheet } from 'lucide-react';

interface LeadManagementViewProps {
  isLight: boolean;
  windowWidth: number;
  leadViewMode: 'inbox' | 'pipeline' | 'calendar' | 'analytics';
  setLeadViewMode: React.Dispatch<React.SetStateAction<'inbox' | 'pipeline' | 'calendar' | 'analytics'>>;
  setShowLeadModal: (val: boolean) => void;
  setShowBulkUploadModal?: (val: boolean) => void;
  leadsList: any[];
  leadInboxTab: string;
  setLeadInboxTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  leadSourceFilter: string;
  setLeadSourceFilter: (val: string) => void;
  leadPriorityFilter: string;
  setLeadPriorityFilter: (val: string) => void;
  matchesSearchQuery: (item: any, query: string) => boolean;
  setShowLead360Drawer: (val: any) => void;
  openIdDetailsModal: (id: string, type: string) => void;
  maskPhone: (phone: string) => string;
  formatIndianRupees: (amount: number) => string;
  setShowCallDispositionModal: (val: any) => void;
  customers: any[];
  setSelectedCust: (cust: any) => void;
  setActiveTab: (tab: string) => void;
  setShowTransferLeadModal: (val: any) => void;
  setActiveCostSheetShareSubTab: (subTab: string) => void;
  isMobile: boolean;
  setIsMobileSidebarOpen: (val: boolean) => void;
  handleOpenResumeQualification?: (lead: any) => void;
  handleOpenLeadModal?: () => void;
  isSuperAdmin?: boolean;
  setLeadsList?: React.Dispatch<React.SetStateAction<any[]>>;
  onRecycleItem?: (itemData: any) => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = ({
  isLight,
  windowWidth,
  leadViewMode,
  setLeadViewMode,
  setShowLeadModal,
  setShowBulkUploadModal,
  leadsList = [],
  setLeadsList,
  onRecycleItem,
  isSuperAdmin = false,
  leadInboxTab,
  setLeadInboxTab,
  searchQuery,
  setSearchQuery,
  leadSourceFilter,
  setLeadSourceFilter,
  leadPriorityFilter,
  setLeadPriorityFilter,
  matchesSearchQuery,
  setShowLead360Drawer,
  openIdDetailsModal,
  maskPhone,
  formatIndianRupees,
  setShowCallDispositionModal,
  customers = [],
  setSelectedCust,
  setActiveTab,
  setShowTransferLeadModal,
  setActiveCostSheetShareSubTab,
  isMobile,
  setIsMobileSidebarOpen,
  handleOpenResumeQualification,
  handleOpenLeadModal,
}) => {
  // DEDUPLICATE LEADS LIST BY CUSTOMER NUMBER & MOBILE TO PREVENT DUPLICATE ROWS
  const uniqueLeadsList = React.useMemo(() => {
    return Array.from(
      leadsList.reduce((map: any, item: any) => {
        const key = item.customer_number || item.customer_id || (item.mobile ? item.mobile.replace(/[^0-9]/g, '') : item.id);
        if (!map.has(key)) {
          map.set(key, item);
        }
        return map;
      }, new Map()).values()
    );
  }, [leadsList]);

  // LEADS ACTIVE IN LEAD MANAGEMENT VAULT (EXCLUDES LEADS THAT FILLED ALL 9 STEPS & SENT TO MATCHING MANAGEMENT)
  const activeVaultLeadsList = React.useMemo(() => {
    return uniqueLeadsList.filter(l => !(l.last_completed_step >= 9 || l.lead_status === 'MATCHING_PENDING' || l.lead_status === 'MATCHING_DONE'));
  }, [uniqueLeadsList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: windowWidth <= 640 ? '12px' : '20px' }}>
      
      {/* ADVANCED LEAD MANAGEMENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: windowWidth <= 640 ? '10px' : '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: windowWidth <= 640 ? '1.05rem' : windowWidth <= 1024 ? '1.2rem' : '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>ADVANCED LEAD MANAGEMENT & FOLLOW-UP CONTROL SYSTEM</h2>
          </div>
          <p style={{ fontSize: windowWidth <= 640 ? '0.72rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Single Central Lead Database • Permanent Unique Lead ID (SRM-LEAD-2026-XXXXXX) • Enforced Call Dispositions & Next Action Controls
          </p>
        </div>

        <div style={{ display: 'flex', gap: windowWidth <= 640 ? '6px' : '8px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button onClick={() => setLeadViewMode(leadViewMode === 'pipeline' ? 'inbox' : 'pipeline')} style={{ background: leadViewMode === 'pipeline' ? '#0284c7' : (isLight ? '#f1f5f9' : '#0f172a'), color: leadViewMode === 'pipeline' ? '#ffffff' : (isLight ? '#0f172a' : '#ffffff'), border: leadViewMode === 'pipeline' ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), padding: windowWidth <= 640 ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.73rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: windowWidth <= 640 ? '1 1 calc(50% - 6px)' : 'initial', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)' }}>
            <GitMerge size={15} color={leadViewMode === 'pipeline' ? '#ffffff' : (isLight ? '#0284c7' : '#38bdf8')} /> {leadViewMode === 'pipeline' ? '📋 Back to Central Inbox' : '🗺️ Lead Workflow Pipeline'}
          </button>
          <button onClick={() => setLeadViewMode(leadViewMode === 'calendar' ? 'inbox' : 'calendar')} style={{ background: leadViewMode === 'calendar' ? '#0284c7' : (isLight ? '#f1f5f9' : '#0f172a'), color: leadViewMode === 'calendar' ? '#ffffff' : (isLight ? '#0f172a' : '#ffffff'), border: leadViewMode === 'calendar' ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), padding: windowWidth <= 640 ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: windowWidth <= 640 ? '0.73rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: windowWidth <= 640 ? '1 1 calc(50% - 6px)' : 'initial' }}>
            <Calendar size={15} color={leadViewMode === 'calendar' ? '#ffffff' : (isLight ? '#0284c7' : 'currentColor')} /> {leadViewMode === 'calendar' ? '📋 Back to Central Inbox' : '📅 Follow-Up Calendar'}
          </button>
          <button onClick={() => setLeadViewMode(leadViewMode === 'analytics' ? 'inbox' : 'analytics')} style={{ background: leadViewMode === 'analytics' ? '#0284c7' : (isLight ? '#f1f5f9' : '#0f172a'), color: leadViewMode === 'analytics' ? '#ffffff' : (isLight ? '#0f172a' : '#ffffff'), border: leadViewMode === 'analytics' ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), padding: windowWidth <= 640 ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: windowWidth <= 640 ? '0.73rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: windowWidth <= 640 ? '1 1 calc(50% - 6px)' : 'initial' }}>
            <Sparkles size={15} color={leadViewMode === 'analytics' ? '#ffffff' : (isLight ? '#0284c7' : 'currentColor')} /> {leadViewMode === 'analytics' ? '📋 Back to Central Inbox' : '📊 Lead & Performance Analytics'}
          </button>
          <button onClick={() => setShowBulkUploadModal ? setShowBulkUploadModal(true) : null} style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: '1px solid #0284c7', padding: windowWidth <= 640 ? '6px 10px' : '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.73rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: windowWidth <= 640 ? '1 1 calc(50% - 6px)' : 'initial', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)' }}>
            <FileSpreadsheet size={15} color="#0284c7" /> 📁 BULK UPLOAD LEADS
          </button>
          <button onClick={() => handleOpenLeadModal ? handleOpenLeadModal() : setShowLeadModal(true)} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: windowWidth <= 640 ? '6px 12px' : '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.75rem' : '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: windowWidth <= 640 ? '1 1 100%' : 'initial', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
            <UserPlus size={16} /> + CREATE NEW LEAD
          </button>
        </div>
      </div>


      {/* 11 CENTRAL INBOX VIEW TABS */}
      {leadViewMode === 'inbox' && (
        <>
          <div style={{ display: 'flex', gap: windowWidth <= 640 ? '4px' : '6px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'thin', maxWidth: '100%' }}>
            {[
              { id: 'all', label: 'All Leads', count: activeVaultLeadsList.length, color: '#38bdf8' },
              { id: 'unassigned', label: 'New & Unassigned', count: activeVaultLeadsList.filter(l => !l.assigned_employee_id || l.assigned_employee_id === 'Unassigned').length, color: '#a855f7' },
              { id: 'my_leads', label: 'My Leads', count: activeVaultLeadsList.filter(l => l.assigned_employee_id === 'USR-07' || l.assigned_employee_name?.includes('Priya')).length, color: '#38bdf8' },
              { id: 'today_followups', label: "Today's Follow-ups", count: activeVaultLeadsList.filter(l => l.next_followup && l.next_followup.startsWith(new Date().toISOString().split('T')[0])).length, color: '#fbbf24', badgeBg: '#eab308' },
              { id: 'overdue_followups', label: 'Overdue Follow-ups', count: activeVaultLeadsList.filter(l => l.next_followup && new Date(l.next_followup) < new Date() && !l.next_followup.startsWith(new Date().toISOString().split('T')[0])).length, color: '#ef4444', badgeBg: '#ef4444' },
              { id: 'interested', label: 'Interested Leads', count: activeVaultLeadsList.filter(l => ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.lead_status) || ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.call_disposition)).length, color: '#4ade80' },
              { id: 'not_interested', label: '❌ Not Interested', count: activeVaultLeadsList.filter(l => l.lead_status === 'NOT_INTERESTED' || l.call_disposition === 'NOT_INTERESTED').length, color: '#ef4444', badgeBg: '#ef4444' },
              { id: 'no_response', label: '📵 No Response', count: activeVaultLeadsList.filter(l => l.lead_status === 'NO_RESPONSE' || l.call_disposition === 'NO_RESPONSE').length, color: '#eab308', badgeBg: '#eab308' },
              { id: 'call_back_later', label: '⏳ Call Back Later', count: activeVaultLeadsList.filter(l => l.lead_status === 'CALL_BACK_LATER' || l.call_disposition === 'CALL_BACK_LATER').length, color: '#38bdf8', badgeBg: '#0284c7' },
              { id: 'matching', label: 'Matching Pending', count: uniqueLeadsList.filter(l => ['MATCHING_PENDING', 'MATCHING_DONE'].includes(l.lead_status)).length, color: '#c084fc' },
              { id: 'visit', label: 'Visit Leads', count: activeVaultLeadsList.filter(l => ['VISIT_PLANNED', 'VISIT_COMPLETED'].includes(l.lead_status)).length, color: '#38bdf8' },
              { id: 'converted', label: 'Converted Leads', count: activeVaultLeadsList.filter(l => ['CONVERTED', 'BOOKING_PROCESS'].includes(l.lead_status)).length, color: '#22c55e' },
              { id: 'nurture', label: 'Nurture / Recycle', count: activeVaultLeadsList.filter(l => l.lead_status === 'NURTURE' || l.lead_status === 'RECYCLE').length, color: isLight ? '#64748b' : '#94a3b8' },
              { id: 'lost_closed', label: 'Lost / Closed', count: activeVaultLeadsList.filter(l => ['LOST', 'CANCELLED'].includes(l.lead_status)).length, color: '#64748b' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeadInboxTab(tab.id)}
                style={{
                  padding: windowWidth <= 640 ? '6px 10px' : '8px 12px',
                  borderRadius: '8px',
                  fontSize: windowWidth <= 640 ? '0.72rem' : '0.78rem',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: leadInboxTab === tab.id ? (isLight ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.18)') : (isLight ? '#ffffff' : '#1e293b'),
                  color: leadInboxTab === tab.id ? (isLight ? '#0284c7' : '#38bdf8') : (isLight ? '#334155' : '#94a3b8'),
                  border: leadInboxTab === tab.id ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <span>{tab.label}</span>
                <span style={{ background: tab.badgeBg || (isLight ? '#e2e8f0' : '#0f172a'), color: tab.badgeBg ? '#ffffff' : (isLight ? (leadInboxTab === tab.id ? '#0284c7' : '#334155') : tab.color), padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* UNIVERSAL SEARCH & ADVANCED FILTERS TOOLBAR */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 640 ? '10px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: windowWidth <= 640 ? '10px' : '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: windowWidth <= 640 ? '100%' : '260px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '8px', padding: windowWidth <= 640 ? '5px 10px' : '6px 12px', width: '100%' }}>
                <Search size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={windowWidth <= 640 ? "🔍 Search Lead ID, Name, Phone..." : "🔍 Universal Lead Search (Lead ID: SRM-LEAD-2026-000001, Name, Phone, Email, Location...)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: windowWidth <= 640 ? '0.75rem' : '0.82rem', width: '100%', fontWeight: '700' }}
                />
                {searchQuery && (
                  <X size={14} color="#94a3b8" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setSearchQuery('')} title="Clear Search" />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: windowWidth <= 640 ? '8px' : '10px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: windowWidth <= 640 ? 'space-between' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: windowWidth <= 640 ? '1' : 'initial' }}>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>Source:</span>
                <select value={leadSourceFilter} onChange={(e) => setLeadSourceFilter(e.target.value)} style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: windowWidth <= 640 ? '4px 6px' : '6px 10px', fontSize: windowWidth <= 640 ? '0.72rem' : '0.78rem', fontWeight: '700', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                  <option value="ALL" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>All Sources</option>
                  <option value="Facebook" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Facebook Ads</option>
                  <option value="Google Ads" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Google Ads</option>
                  <option value="Website" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Website</option>
                  <option value="Walk-in" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Walk-in</option>
                  <option value="Referral" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Referral</option>
                  <option value="Developer" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>Developer Reference</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: windowWidth <= 640 ? '1' : 'initial' }}>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>Priority:</span>
                <select value={leadPriorityFilter} onChange={(e) => setLeadPriorityFilter(e.target.value)} style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: windowWidth <= 640 ? '4px 6px' : '6px 10px', fontSize: windowWidth <= 640 ? '0.72rem' : '0.78rem', fontWeight: '700', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                  <option value="ALL" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>All Priorities</option>
                  <option value="HOT" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>🔥 HOT</option>
                  <option value="WARM" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>⚡ WARM</option>
                  <option value="COLD" style={{ background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff' }}>❄️ COLD</option>
                </select>
              </div>
            </div>
          </div>

          {/* CENTRAL LEAD MASTER TABLE */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '20px', display: 'flex', flexDirection: 'column', gap: windowWidth <= 640 ? '10px' : '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: windowWidth <= 640 ? 'flex-start' : 'center', flexDirection: windowWidth <= 640 ? 'column' : 'row', gap: windowWidth <= 640 ? '4px' : '0' }}>
              <h3 style={{ fontSize: windowWidth <= 640 ? '0.9rem' : '1.05rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                📋 Central Lead Master Vault ({(leadInboxTab === 'matching' ? uniqueLeadsList : activeVaultLeadsList).filter(l => {
                  if (leadInboxTab === 'unassigned') return !l.assigned_employee_id || l.assigned_employee_id === 'Unassigned';
                  if (leadInboxTab === 'my_leads') return l.assigned_employee_id === 'USR-07' || l.assigned_employee_name?.includes('Priya');
                  if (leadInboxTab === 'today_followups') return l.next_followup && l.next_followup.startsWith(new Date().toISOString().split('T')[0]);
                  if (leadInboxTab === 'overdue_followups') return l.next_followup && new Date(l.next_followup) < new Date() && !l.next_followup.startsWith(new Date().toISOString().split('T')[0]);
                  if (leadInboxTab === 'nurture') return l.lead_status === 'NURTURE' || l.lead_status === 'RECYCLE';
                  if (leadInboxTab === 'interested') return ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.lead_status) || ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.call_disposition);
                  if (leadInboxTab === 'not_interested') return l.lead_status === 'NOT_INTERESTED' || l.call_disposition === 'NOT_INTERESTED';
                  if (leadInboxTab === 'no_response') return l.lead_status === 'NO_RESPONSE' || l.call_disposition === 'NO_RESPONSE';
                  if (leadInboxTab === 'call_back_later') return l.lead_status === 'CALL_BACK_LATER' || l.call_disposition === 'CALL_BACK_LATER';
                  if (leadInboxTab === 'matching') return ['MATCHING_PENDING', 'MATCHING_DONE'].includes(l.lead_status);
                  if (leadInboxTab === 'visit') return ['VISIT_PLANNED', 'VISIT_COMPLETED'].includes(l.lead_status);
                  if (leadInboxTab === 'converted') return ['CONVERTED', 'BOOKING_PROCESS'].includes(l.lead_status);
                  if (leadInboxTab === 'lost_closed') return ['LOST', 'CANCELLED'].includes(l.lead_status);
                  return true;
                }).filter(l => matchesSearchQuery(l, searchQuery)).length} Leads)
              </h3>

              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                Showing filtered lead queue • Auto-refreshed
              </span>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Lead ID & Cust ID</th>
                    <th style={{ padding: '12px' }}>Customer Name & Contact</th>
                    <th style={{ padding: '12px' }}>Source Channel</th>
                    <th style={{ padding: '12px' }}>Preferred Area & BHK</th>
                    <th style={{ padding: '12px' }}>Budget Range</th>
                    <th style={{ padding: '12px' }}>Score & Priority</th>
                    <th style={{ padding: '12px' }}>Disposition & Next Action</th>
                    <th style={{ padding: '12px' }}>Next Follow-Up</th>
                    <th style={{ padding: '12px' }}>Assigned Executive</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(leadInboxTab === 'matching' ? uniqueLeadsList : activeVaultLeadsList)
                    .filter(l => {
                      if (leadInboxTab === 'unassigned') return !l.assigned_employee_id || l.assigned_employee_id === 'Unassigned';
                      if (leadInboxTab === 'my_leads') return l.assigned_employee_id === 'USR-07' || l.assigned_employee_name?.includes('Priya');
                      if (leadInboxTab === 'today_followups') return l.next_followup && l.next_followup.startsWith(new Date().toISOString().split('T')[0]);
                      if (leadInboxTab === 'overdue_followups') return l.next_followup && new Date(l.next_followup) < new Date() && !l.next_followup.startsWith(new Date().toISOString().split('T')[0]);
                      if (leadInboxTab === 'nurture') return l.lead_status === 'NURTURE' || l.lead_status === 'RECYCLE';
                      if (leadInboxTab === 'interested') return ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.lead_status) || ['INTERESTED', 'CONNECTED_INTERESTED'].includes(l.call_disposition);
                      if (leadInboxTab === 'not_interested') return l.lead_status === 'NOT_INTERESTED' || l.call_disposition === 'NOT_INTERESTED';
                      if (leadInboxTab === 'no_response') return l.lead_status === 'NO_RESPONSE' || l.call_disposition === 'NO_RESPONSE';
                      if (leadInboxTab === 'call_back_later') return l.lead_status === 'CALL_BACK_LATER' || l.call_disposition === 'CALL_BACK_LATER';
                      if (leadInboxTab === 'matching') return ['MATCHING_PENDING', 'MATCHING_DONE'].includes(l.lead_status);
                      if (leadInboxTab === 'visit') return ['VISIT_PLANNED', 'VISIT_COMPLETED'].includes(l.lead_status);
                      if (leadInboxTab === 'converted') return ['CONVERTED', 'BOOKING_PROCESS'].includes(l.lead_status);
                      if (leadInboxTab === 'lost_closed') return ['LOST', 'CANCELLED'].includes(l.lead_status);
                      return true;
                    })
                    .filter(l => leadSourceFilter === 'ALL' || l.source === leadSourceFilter)
                    .filter(l => leadPriorityFilter === 'ALL' || l.priority === leadPriorityFilter)
                    .filter(l => matchesSearchQuery(l, searchQuery))
                    .map((lead) => {
                      const matchedCust = customers.find(c => (c.customer_number && c.customer_number === lead.customer_number) || (c.name && c.name === lead.customer_name) || (c.phone && c.phone === lead.mobile));
                      const rawPhone = lead.mobile || lead.phone || lead.customer_mobile || matchedCust?.mobile || matchedCust?.phone || 'N/A';
                      const custNum = lead.customer_number || lead.customer_id || matchedCust?.customer_number || 'N/A';

                      const isOverdue = lead.next_followup && new Date(lead.next_followup) < new Date() && !lead.next_followup.startsWith(new Date().toISOString().split('T')[0]);
                      const isToday = lead.next_followup && lead.next_followup.startsWith(new Date().toISOString().split('T')[0]);

                      return (
                        <tr key={lead.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isOverdue ? 'rgba(239, 68, 68, 0.05)' : isToday ? 'rgba(234, 179, 8, 0.05)' : 'transparent' }}>
                          <td style={{ padding: '12px' }}>
                            <span
                              onClick={() => setShowLead360Drawer({ open: true, lead, tab: 'OVERVIEW' })}
                              style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.84rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', display: 'inline-block' }}
                              title="Click to view 360° Lead Journey Drawer"
                            >
                              🆔 {lead.lead_number}
                            </span>
                            <br />
                            <span
                              onClick={() => openIdDetailsModal(custNum, 'CUSTOMER_ID')}
                              style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              👤 {custNum}
                            </span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{lead.customer_name}</strong>
                            <br />
                            {rawPhone !== 'N/A' ? (
                              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                📞 <a href={`tel:${rawPhone}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{maskPhone(rawPhone)}</a>
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>N/A</span>
                            )}
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '3px 8px', borderRadius: '4px', color: '#38bdf8', fontWeight: '800', fontSize: '0.73rem' }}>
                              {lead.source || 'Facebook'}
                            </span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{lead.preferred_location || 'Kondapur'}</strong>
                            <br />
                            {(['NO_RESPONSE', 'CALL_BACK_LATER', 'NOT_INTERESTED'].includes(lead.call_disposition) || !lead.bhk || (lead.last_completed_step && lead.last_completed_step < 3)) ? (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: '700' }}>⏳ Pending (Step {lead.last_completed_step || 2})</span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800' }}>{lead.bhk}</span>
                            )}
                          </td>

                          <td style={{ padding: '12px', color: '#4ade80', fontWeight: '800' }}>
                            {(() => {
                              const formatSingle = (v: any) => {
                                if (v === null || v === undefined || v === '') return '';
                                if (typeof v === 'number') {
                                  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
                                  if (v >= 100000) return `₹${(v / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
                                  return '₹' + v.toLocaleString('en-IN');
                                }
                                const str = String(v).trim();
                                if (!str || str === '0' || str === 'N/A') return '';
                                const num = parseFloat(str.replace(/[^0-9.]/g, ''));
                                if (!isNaN(num) && num > 1000) {
                                  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
                                  if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
                                  return '₹' + num.toLocaleString('en-IN');
                                }
                                return str;
                              };

                              let display = '';
                              if (lead.budget && String(lead.budget).trim() !== '' && lead.budget !== 'N/A' && !String(lead.budget).includes('undefined') && String(lead.budget).trim() !== '-') {
                                display = String(lead.budget);
                              } else {
                                const fMin = formatSingle(lead.budget_min);
                                const fMax = formatSingle(lead.budget_max);
                                if (fMin && fMax) display = `${fMin} - ${fMax}`;
                                else if (fMax) display = fMax;
                                else if (fMin) display = fMin;
                              }

                              if (display && display !== 'N/A') return display;

                              if (['NO_RESPONSE', 'CALL_BACK_LATER', 'NOT_INTERESTED'].includes(lead.call_disposition) || (lead.last_completed_step && lead.last_completed_step < 3)) {
                                return <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: '700' }}>⏳ Pending (Step {lead.last_completed_step || 2})</span>;
                              }
                              return 'N/A';
                            })()}
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ background: lead.priority === 'HOT' ? 'rgba(239, 68, 68, 0.2)' : lead.priority === 'WARM' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: lead.priority === 'HOT' ? '#ef4444' : lead.priority === 'WARM' ? '#fbbf24' : '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '0.73rem' }}>
                              {lead.priority === 'HOT' ? '🔥' : lead.priority === 'WARM' ? '⚡' : '❄️'} {lead.priority} ({lead.quality_score || 80}/100)
                            </span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', fontSize: '0.78rem' }}>{lead.call_disposition || 'New Lead'}</span>
                            <br />
                            <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>Next: {lead.next_action || 'Contact Customer'}</span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            {lead.next_followup ? (
                              <div style={{ color: isOverdue ? '#ef4444' : isToday ? '#fbbf24' : '#94a3b8', fontWeight: isOverdue || isToday ? '900' : '500' }}>
                                {isOverdue && '🚨 OVERDUE: '}
                                {isToday && '🔥 TODAY: '}
                                {new Date(lead.next_followup).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(lead.next_followup).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : (
                              <span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>No follow-up set</span>
                            )}
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.78rem' }}>{lead.assigned_employee_name || 'Priya Nair (Sales Exec)'}</span>
                          </td>

                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              {handleOpenResumeQualification && (
                                <button
                                  onClick={() => handleOpenResumeQualification(lead)}
                                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                                  title="Re-call customer & resume step-by-step qualification wizard"
                                >
                                  ▶️ Qualification (Step {lead.last_completed_step || 2})
                                </button>
                              )}

                              <button
                                onClick={() => setShowCallDispositionModal({ open: true, lead })}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem' }}
                                title="Log Call Disposition & Schedule Next Action"
                              >
                                📞 Call Log
                              </button>

                              <button
                                onClick={() => setShowLead360Drawer({ open: true, lead, tab: 'OVERVIEW' })}
                                style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem' }}
                                title="Open 360° Lead Journey Drawer"
                              >
                                🎯 360°
                              </button>



                              <button
                                onClick={() => setShowTransferLeadModal({ open: true, lead })}
                                style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#fbbf24', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem' }}
                                title="Transfer Lead Ownership"
                              >
                                🔄 Transfer
                              </button>

                              {isSuperAdmin && setLeadsList && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`⚠️ SUPER ADMIN CONFIRMATION:\n\nAre you sure you want to delete Lead ${lead.lead_number || lead.id} for ${lead.customer_name || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                      if (onRecycleItem) {
                                        onRecycleItem({
                                          id: lead.id || `LEAD-${Date.now()}`,
                                          title: `${lead.customer_name || lead.name || 'Lead'} (${lead.lead_number || lead.id})`,
                                          category: 'Lead',
                                          originalLocation: 'Lead Management Ingestion Vault',
                                          details: `BHK: ${lead.bhk_requirement || lead.configuration || 'N/A'}, Locality: ${lead.preferred_locality || 'N/A'}`,
                                          originalData: lead
                                        });
                                      }
                                      const nextList = leadsList.filter((l: any) => l.id !== lead.id && l.lead_number !== lead.lead_number);
                                      setLeadsList(nextList);
                                      alert(`🗑️ Lead ${lead.lead_number || lead.id} moved to Recycle Bin.`);
                                    }
                                  }}
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem' }}
                                  title="Super Admin Only: Move lead record to Recycle Bin"
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* FOLLOW-UP CALENDAR SUB-VIEW */}
      {leadViewMode === 'calendar' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: windowWidth <= 640 ? '12px' : '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: windowWidth <= 640 ? '0.95rem' : '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📅 INTERACTIVE FOLLOW-UP & CALLBACK CALENDAR</h3>
              <p style={{ fontSize: windowWidth <= 640 ? '0.72rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Scheduled callbacks, client meetings, and property site visits for the current month.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : windowWidth <= 768 ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)', gap: windowWidth <= 640 ? '6px' : '10px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ background: isLight ? '#f8fafc' : '#0f172a', color: '#38bdf8', padding: windowWidth <= 640 ? '6px' : '10px', borderRadius: '8px', textAlign: 'center', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.72rem' : '0.8rem' }}>
                {d}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const dayStr = `2026-08-${String(day).padStart(2, '0')}`;
              const dayLeads = uniqueLeadsList.filter(l => l.next_followup && l.next_followup.startsWith(dayStr));

              return (
                <div key={day} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: day === 24 || day === 25 ? '2px solid #0284c7' : '1px solid #334155', borderRadius: '10px', padding: windowWidth <= 640 ? '6px' : '10px', minHeight: windowWidth <= 640 ? '65px' : '90px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: windowWidth <= 640 ? '0.75rem' : '0.85rem', fontWeight: '900', color: day === 24 ? '#38bdf8' : '#ffffff' }}>Day {day}</span>

                  {dayLeads.map((dl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setShowCallDispositionModal({ open: true, lead: dl })}
                      style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '6px', padding: '4px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{dl.customer_name}</strong>
                      <br />
                      <span style={{ color: '#fbbf24' }}>{dl.next_action || 'Followup'}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEAD ANALYTICS & SOURCE PERFORMANCE SUB-VIEW */}
      {leadViewMode === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: windowWidth <= 640 ? '12px' : '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: windowWidth <= 640 ? '0.95rem' : '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📊 LEAD SOURCE PERFORMANCE & CONVERSION ANALYTICS</h3>
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: windowWidth <= 640 ? '0.75rem' : '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Lead Source</th>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Total Ingested Leads</th>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Interested Leads</th>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Site Visits Done</th>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Confirmed Bookings</th>
                    <th style={{ padding: windowWidth <= 640 ? '8px' : '10px' }}>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { src: 'Facebook', total: 142, interested: 84, visits: 38, bookings: 12, pct: '8.4%' },
                    { src: 'Google Ads', total: 98, interested: 62, visits: 29, bookings: 10, pct: '10.2%' },
                    { src: 'Website', total: 54, interested: 32, visits: 18, bookings: 6, pct: '11.1%' },
                    { src: 'Walk-in', total: 32, interested: 24, visits: 22, bookings: 8, pct: '25.0%' },
                    { src: 'Referral', total: 24, interested: 20, visits: 18, bookings: 9, pct: '37.5%' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{row.src}</td>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', color: '#38bdf8', fontWeight: '800' }}>{row.total}</td>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', color: '#fbbf24', fontWeight: '800' }}>{row.interested}</td>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', color: '#c084fc', fontWeight: '800' }}>{row.visits}</td>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', color: '#4ade80', fontWeight: '800' }}>{row.bookings}</td>
                      <td style={{ padding: windowWidth <= 640 ? '8px' : '10px', color: '#4ade80', fontWeight: '900' }}>{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: INTERACTIVE WORKFLOW PIPELINE DIAGRAM */}
      {leadViewMode === 'pipeline' && (
        <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #0284c7', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: windowWidth <= 640 ? '12px' : '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: windowWidth <= 640 ? 'flex-start' : 'center', flexDirection: windowWidth <= 640 ? 'column' : 'row', gap: windowWidth <= 640 ? '10px' : '14px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <GitMerge size={20} color="#38bdf8" />
                <h3 style={{ fontSize: windowWidth <= 640 ? '0.95rem' : '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>ENTERPRISE LEAD WORKFLOW & CONVERSION PIPELINE</h3>
                <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>LIVE PIPELINE ARCHITECTURE</span>
              </div>
              <p style={{ fontSize: windowWidth <= 640 ? '0.72rem' : '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                Interactive visual node diagram tracing every lead from Central Inbox to Final Booking Confirmation. Click any node to filter the Central Inbox table.
              </p>
            </div>
            <button onClick={() => setLeadViewMode('inbox')} style={{ background: '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', width: windowWidth <= 640 ? '100%' : 'auto' }}>
              📋 Return to Central Inbox Table
            </button>
          </div>

          {/* DIAGRAM GRAPH NODES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
            
            {/* NODE LEVEL 1: CENTRAL LEAD INBOX */}
            <div 
              onClick={() => { setLeadInboxTab('all'); setLeadViewMode('inbox'); }}
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: '2px solid #38bdf8', padding: '12px 32px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)' }}
            >
              <span style={{ fontSize: '0.72rem', color: '#e0f2fe', fontWeight: '800', textTransform: 'uppercase' }}>STEP 1: CENTRAL GATEWAY</span>
              <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '1.05rem', fontWeight: '900', margin: '2px 0 0 0' }}>📥 CENTRAL LEAD INBOX</h4>
              <span style={{ fontSize: '0.75rem', color: '#bae6fd', fontWeight: '800' }}>{uniqueLeadsList.length} Total Captured Leads</span>
            </div>

            <ArrowDown size={20} color="#0284c7" />

            {/* NODE LEVEL 2: LEAD ID CREATED */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #fbbf24', padding: '10px 24px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '900', textTransform: 'uppercase' }}>PERMANENT TRACEABILITY</span>
              <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.92rem', fontWeight: '900', fontFamily: 'monospace', margin: '2px 0 0 0' }}>🆔 LEAD ID CREATED (SRM-LEAD-2026-XXXXXX)</h4>
            </div>

            <ArrowDown size={20} color="#fbbf24" />

            {/* NODE LEVEL 3: THREE BRANCHES (NEW LEAD | ASSIGNED | FOLLOW-UP) */}
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: '14px', width: '100%', maxWidth: '850px' }}>
              
              <div 
                onClick={() => { setLeadInboxTab('unassigned'); setLeadViewMode('inbox'); }}
                style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #a855f7', borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: '900' }}>1. UNASSIGNED QUEUE</span>
                <h5 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '0.88rem', margin: '2px 0 0 0' }}>🆕 NEW LEAD</h5>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{uniqueLeadsList.filter(l => !l.assigned_employee_id || l.assigned_employee_id === 'Unassigned').length} Pending Assignment</span>
              </div>

              <div 
                onClick={() => { setLeadInboxTab('my_leads'); setLeadViewMode('inbox'); }}
                style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #38bdf8', borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '900' }}>2. CRM ASSIGNED</span>
                <h5 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '0.88rem', margin: '2px 0 0 0' }}>👤 ASSIGNED EXEC</h5>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{uniqueLeadsList.filter(l => l.assigned_employee_id && l.assigned_employee_id !== 'Unassigned').length} Active Executives</span>
              </div>

              <div 
                onClick={() => { setLeadInboxTab('today_followups'); setLeadViewMode('inbox'); }}
                style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #fbbf24', borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '900' }}>3. SCHEDULED</span>
                <h5 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '0.88rem', margin: '2px 0 0 0' }}>⏰ FOLLOW-UP</h5>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{uniqueLeadsList.filter(l => l.next_followup).length} Scheduled Callbacks</span>
              </div>

            </div>

            <ArrowDown size={20} color="#38bdf8" />

            {/* NODE LEVEL 4: SALES ACTIVITY */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '2px solid #38bdf8', padding: '12px 28px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase' }}>INTERACTIVE CALL LOG & DISPOSITION GATEWAY</span>
              <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '1rem', fontWeight: '900', margin: '2px 0 0 0' }}>📞 SALES ACTIVITY (Call / Chat / Site Visit)</h4>
            </div>

            <ArrowDown size={20} color="#38bdf8" />

            {/* NODE LEVEL 5: THREE DISPOSITION OUTCOMES (INTERESTED | NOT INTERESTED | NO RESPONSE) */}
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
              
              {/* BRANCH 1: INTERESTED -> MATCHING -> COST SHEET -> VISIT -> AGREEMENT -> BOOKING */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #22c55e', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#22c55e', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.82rem', width: '100%', textAlign: 'center' }}>
                  🟢 INTERESTED ({uniqueLeadsList.filter(l => ['INTERESTED', 'CONNECTED_INTERESTED', 'MATCHING_PENDING', 'VISIT_PLANNED', 'CONVERTED'].includes(l.lead_status)).length})
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                  <div onClick={() => { setLeadInboxTab('matching'); setLeadViewMode('inbox'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #c084fc', padding: '8px 12px', borderRadius: '8px', color: '#c084fc', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    ⚡ 1. MATCHING ENGINE
                  </div>
                  <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setLeadInboxTab('matching'); setLeadViewMode('inbox'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', padding: '8px 12px', borderRadius: '8px', color: '#4ade80', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    🏠 2. PROPERTY MATCH
                  </div>
                  <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setActiveTab('cost_sheet_share'); setActiveCostSheetShareSubTab('individual_cost_sheets'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #fbbf24', padding: '8px 12px', borderRadius: '8px', color: '#fbbf24', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    📄 3. COST SHEET
                  </div>
                  <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setLeadInboxTab('visit'); setLeadViewMode('inbox'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #38bdf8', padding: '8px 12px', borderRadius: '8px', color: '#38bdf8', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    🚘 4. SITE VISIT
                  </div>
                  <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { if (isMobile) setIsMobileSidebarOpen(false); setActiveTab('agreement_management'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #a855f7', padding: '8px 12px', borderRadius: '8px', color: '#a855f7', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    📜 5. AGREEMENT
                  </div>
                  <div style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setLeadInboxTab('converted'); setLeadViewMode('inbox'); }} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', padding: '10px 12px', borderRadius: '10px', fontWeight: '900', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}>
                    🎉 6. BOOKING CONFIRMED
                  </div>
                </div>
              </div>

              {/* BRANCH 2: NOT INTERESTED -> RE-CALL LATER */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #fbbf24', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#fbbf24', color: '#0f172a', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.82rem', width: '100%', textAlign: 'center' }}>
                  🟡 NOT INTERESTED ({uniqueLeadsList.filter(l => l.lead_status === 'NURTURE' || l.lead_status === 'RECYCLE' || l.call_disposition === 'PROPERTY_SEARCH_LATER').length})
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', marginTop: '14px' }}>
                  <div style={{ textAlign: 'center', color: '#fbbf24', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setLeadInboxTab('nurture'); setLeadViewMode('inbox'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #fbbf24', padding: '16px 12px', borderRadius: '10px', color: '#fbbf24', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    ⏰ RE-CALL LATER
                    <br />
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>(Nurture & Recycle Vault)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'center', marginTop: '10px', lineHeight: '1.4' }}>
                    Automated callback timer scheduled in 30-90 days for market re-engagement.
                  </p>
                </div>
              </div>

              {/* BRANCH 3: NO RESPONSE -> RETRY */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #ef4444', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#ef4444', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.82rem', width: '100%', textAlign: 'center' }}>
                  🔴 NO RESPONSE ({uniqueLeadsList.filter(l => ['NO_ANSWER', 'UNREACHABLE', 'CALL_BACK_LATER'].includes(l.call_disposition) || l.lead_status === 'CALL_BACK_LATER').length})
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem', marginTop: '14px' }}>
                  <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: '900' }}>↓</div>
                  <div onClick={() => { setLeadInboxTab('overdue_followups'); setLeadViewMode('inbox'); }} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', padding: '16px 12px', borderRadius: '10px', color: '#f87171', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                    🔄 RETRY ATTEMPT
                    <br />
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>(Follow-Up Retry Queue)</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'center', marginTop: '10px', lineHeight: '1.4' }}>
                    Retry counter tracked (Attempt #1, #2, #3) with automated daily executive reminders.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
