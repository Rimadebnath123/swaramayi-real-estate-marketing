import React from 'react';
import { Share2, Plus, Trash2, Printer, Search, Eye, Clock, Calendar, CheckCircle2, MessageSquare, AlertCircle, X } from 'lucide-react';
import { getCustomerUsedPropertyCodes } from './MatchingManagementView';

interface CostSheetSharingViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth: number;
  setShowCreateShareModal: (val: boolean) => void;
  handleDeleteAllCurrentInside: () => void;
  newShareForm: any;
  setNewShareForm: React.Dispatch<React.SetStateAction<any>>;
  activeCostSheetShareSubTab: string;
  setActiveCostSheetShareSubTab: (tab: any) => void;
  individualCostSheets: any[];
  setIndividualCostSheets: React.Dispatch<React.SetStateAction<any[]>>;
  formatIndianRupees: (amount: number) => string;
  individualCostSheetsSearch: string;
  setIndividualCostSheetsSearch: (val: string) => void;
  individualCostSheetsStatusFilter: string;
  setIndividualCostSheetsStatusFilter: (val: string) => void;
  matchesSearchQuery: (item: any, query: string) => boolean;
  searchQuery: string;
  setShowViewIndividualCostSheetModal: (val: any) => void;
  handleOpenRevisionModal: (item: any) => void;
  downloadCostSheetPDF: (item: any) => void;
  setShowScheduleVisitModal: (val: any) => void;
  costSheetShares: any[];
  setActiveTab?: (tab: string) => void;
  setActiveVisitSubTab?: (subTab: string) => void;
  scheduledVisits?: any[];
  visitPlans?: any[];
  syncAllToMongoDB?: (overrideData?: any) => Promise<void>;
  selectedMatchingId?: string;
  setSelectedMatchingId?: (id: string) => void;
  customers?: any[];
  properties?: any[];
  setSelectedCust?: (cust: any) => void;
  setShowShiftToMatchingModal?: (val: any) => void;
  onRecycleItem?: (itemData: any) => void;
}

export const CostSheetSharingView: React.FC<CostSheetSharingViewProps> = ({
  currentRole,
  isLight,
  windowWidth,
  setShowCreateShareModal,
  onRecycleItem,
  handleDeleteAllCurrentInside,
  newShareForm,
  setNewShareForm,
  activeCostSheetShareSubTab,
  setActiveCostSheetShareSubTab,
  individualCostSheets = [],
  setIndividualCostSheets,
  formatIndianRupees,
  individualCostSheetsSearch,
  setIndividualCostSheetsSearch,
  individualCostSheetsStatusFilter,
  setIndividualCostSheetsStatusFilter,
  matchesSearchQuery,
  searchQuery,
  setShowViewIndividualCostSheetModal,
  handleOpenRevisionModal,
  downloadCostSheetPDF,
  setShowScheduleVisitModal,
  costSheetShares = [],
  setActiveTab,
  setActiveVisitSubTab,
  scheduledVisits = [],
  visitPlans = [],
  syncAllToMongoDB,
  selectedMatchingId,
  setSelectedMatchingId,
  customers = [],
  properties = [],
  setSelectedCust,
  setShowShiftToMatchingModal,
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');

  const [localCostSheetSubTab, setLocalCostSheetSubTab] = React.useState<'active_cost_sheets' | 'need_to_followup'>('active_cost_sheets');

  const [showSendToFollowupModal, setShowSendToFollowupModal] = React.useState<any>(null);
  const [sendFollowupForm, setSendFollowupForm] = React.useState<any>({
    followupDate: new Date().toISOString().split('T')[0],
    followupTime: '17:00',
    priority: 'HIGH',
    remarks: 'Customer requested callback regarding cost sheet quotation, payment schedule revision, and discount.'
  });

  const [showEditFollowupModal, setShowEditFollowupModal] = React.useState<any>(null);
  const [editFollowupForm, setEditFollowupForm] = React.useState<any>({
    followupDate: '',
    followupTime: '',
    priority: 'HIGH',
    remarks: ''
  });

  const [localCostSheetFollowups, setLocalCostSheetFollowups] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('swaramayi_cs_followups_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const todayStr = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'FOL-CS-2026-001',
        costSheetId: 'COST-SHEET-2026-000001',
        customerName: 'Honey sing',
        customerNumber: 'SRM-CUS-2026-000188',
        customerMobile: '+91 95677 88888',
        propertyTitle: 'SK Construction (Madhyamgram)',
        followupDate: todayStr,
        followupTime: '05:00 PM',
        priority: 'HIGH',
        status: 'PENDING',
        remarks: 'Follow up on payment schedule revision, GST breakdown clarification, and booking token deposit decision.'
      }
    ];
  });

  const saveCostSheetFollowups = (newList: any[]) => {
    setLocalCostSheetFollowups(newList);
    try {
      localStorage.setItem('swaramayi_cs_followups_v1', JSON.stringify(newList));
    } catch (e) {}
  };

  const allEffectiveCostSheets = React.useMemo(() => {
    return individualCostSheets || [];
  }, [individualCostSheets]);

  const convertedVisitsCount = Math.max(
    individualCostSheets.filter(c => c.status === 'CONVERTED_TO_VISIT').length,
    (scheduledVisits || []).filter(v => v.costSheetId || v.propertyCode).length,
    (visitPlans || []).length
  );

  // Active Cost Sheets pending in Vault (excluding records shifted to Visit Schedule or Sent to Followup)
  const pendingCostSheets = React.useMemo(() => {
    return (individualCostSheets || []).filter(c => c.status !== 'CONVERTED_TO_VISIT' && c.status !== 'SENT_TO_FOLLOWUP');
  }, [individualCostSheets]);

  // Active Cost Sheets displayed in Vault
  const displayedCostSheets = React.useMemo(() => {
    if (individualCostSheetsStatusFilter === 'CONVERTED_TO_VISIT') {
      return (individualCostSheets || []).filter(c => c.status === 'CONVERTED_TO_VISIT');
    }
    if (individualCostSheetsStatusFilter === 'SENT_TO_FOLLOWUP') {
      return (individualCostSheets || []).filter(c => c.status === 'SENT_TO_FOLLOWUP');
    }
    if (individualCostSheetsStatusFilter === 'ALL_INCLUDING_CONVERTED') {
      return individualCostSheets || [];
    }
    if (individualCostSheetsStatusFilter !== 'ALL') {
      return (individualCostSheets || []).filter(c => c.status === individualCostSheetsStatusFilter);
    }
    // Default 'ALL': Display active pending cost sheets, auto-shifting converted & followup ones
    return (individualCostSheets || []).filter(c => c.status !== 'CONVERTED_TO_VISIT' && c.status !== 'SENT_TO_FOLLOWUP');
  }, [individualCostSheets, individualCostSheetsStatusFilter]);

  const sendCostSheetWhatsApp = (item: any) => {
    if (!item) {
      alert('⚠️ Cost sheet data is missing.');
      return;
    }

    if (downloadCostSheetPDF) {
      downloadCostSheetPDF(item);
    }

    const itemPropCode = item.propertyCode || item.propertySnapshot?.propertyCode;
    const itemCustId = item.customerId || item.customerSnapshot?.customerNumber || item.customerSnapshot?.customerId;
    const itemCustMob = item.customerSnapshot?.mobile || item.mobile;

    const matchedProp = (properties || []).find((p: any) => 
      (p.property_code && itemPropCode && p.property_code === itemPropCode) ||
      (p.id && itemPropCode && p.id === itemPropCode) ||
      (p.property_code && item.propertyId && p.property_code === item.propertyId) ||
      (p.id && item.propertyId && p.id === item.propertyId)
    );

    const matchedCust = (customers || []).find((c: any) => 
      (c.customer_number && itemCustId && c.customer_number === itemCustId) ||
      (c.id && itemCustId && c.id === itemCustId) ||
      (itemCustMob && itemCustMob.replace(/\D/g, '').length >= 7 && c.mobile && c.mobile.replace(/\D/g, '') === itemCustMob.replace(/\D/g, ''))
    );

    const custName = item.customerSnapshot?.customerName || item.customerName || matchedCust?.full_name || matchedCust?.name || 'Valued Customer';
    const custMobile = item.customerSnapshot?.mobile || item.mobile || matchedCust?.mobile || '';

    let cleanPhone = custMobile.replace(/\D/g, '');
    if (!cleanPhone) {
      alert(`⚠️ Customer mobile number is missing for ${custName}. Please edit customer details first.`);
      return;
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const rawPropTitle = item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name;
    const propTitleStr = rawPropTitle && !rawPropTitle.startsWith('1 Properties') 
      ? rawPropTitle 
      : (matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name || 'Property Unit');

    const superBuiltStr = item.propertySnapshot?.superBuiltupArea || item.propertySnapshot?.super_builtup_area || matchedProp?.super_builtup_area || '1,283 Sq.Ft.';
    const rateSqftStr = item.formattedPriceBreakup?.ratePerSqftStr || (item.pricingSnapshot?.ratePerSqft ? `₹${Number(item.pricingSnapshot.ratePerSqft).toLocaleString('en-IN')}/Sq.Ft.` : 'N/A');

    const waMsg = `Hello ${custName},\n\nGreetings from Swaramayi Real Estate Marketing! 🏡\n\nHere is your official Cost Sheet Breakdown & PDF Document:\n\n📄 Cost Sheet ID: ${item.costSheetId} (${item.version || 'V01'})\n🏢 Property: ${propTitleStr}\n📍 Locality: ${localityStr}\n📐 Configuration: ${bhkStr}\n📐 Super Built-Up Area: ${superBuiltStr}\n🏷️ Asking Rate per Sq.Ft.: ${rateSqftStr}\n\n💰 Price Breakdown:\n• Asking Base Price: ${basePriceStr}\n• Total Estimated Cost (Incl. Taxes & Charges): ${totalEstStr}\n\n📎 Cost Sheet PDF Document: Itemized official PDF document is generated & attached.\n\nPlease review the details. Click or reply to schedule a site visit or ask any questions!\n\nThank you,\nSwaramayi Real Estate Team`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    if (setIndividualCostSheets) {
      setIndividualCostSheets((prev: any[]) => {
        const updated = prev.map(c => c.costSheetId === item.costSheetId ? { ...c, status: 'SENT_TO_CUSTOMER' } : c);
        try {
          localStorage.setItem('swaramayi_indiv_cost_sheets_v5_clean', JSON.stringify(updated));
        } catch (e) {}
        if (syncAllToMongoDB) {
          syncAllToMongoDB({ cost_sheets: updated });
        }
        return updated;
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SUB-NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setLocalCostSheetSubTab('active_cost_sheets')} 
          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: localCostSheetSubTab === 'active_cost_sheets' ? '#0284c7' : '#1e293b', color: localCostSheetSubTab === 'active_cost_sheets' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📄 Active Cost Sheets ({displayedCostSheets.length})
        </button>
        <button 
          onClick={() => setLocalCostSheetSubTab('need_to_followup')} 
          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: localCostSheetSubTab === 'need_to_followup' ? '#0284c7' : '#1e293b', color: localCostSheetSubTab === 'need_to_followup' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📌 Need to Followup ({localCostSheetFollowups.length})
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVE COST SHEETS */}
      {localCostSheetSubTab === 'active_cost_sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

          {/* SEARCH & STATUS FILTER STRIP */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '6px 12px' }}>
              <Search size={15} color="#38bdf8" />
              <input 
                type="text" 
                value={individualCostSheetsSearch} 
                onChange={(e) => setIndividualCostSheetsSearch(e.target.value)} 
                placeholder="Search Cost Sheet ID (e.g. COST-SHEET-2026-000001), Customer Name, Match ID, or Property..." 
                style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: '0.85rem', width: '100%', fontWeight: '800' }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>Filter Status:</span>
              <select 
                value={individualCostSheetsStatusFilter} 
                onChange={(e) => setIndividualCostSheetsStatusFilter(e.target.value)} 
                style={{ background: isLight ? '#f8fafc' : '#0f172a', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }}
              >
                <option value="ALL">📋 Active Cost Sheets ({pendingCostSheets.length})</option>
                <option value="GENERATED">🟢 GENERATED</option>
                <option value="SENT_TO_CUSTOMER">📲 SENT TO CUSTOMER</option>
                <option value="SENT_TO_FOLLOWUP">📌 SENT TO FOLLOWUP (Shifted to Followup Tab)</option>
                <option value="REVISED">✏️ REVISED</option>
                <option value="APPROVED">✅ APPROVED</option>
                <option value="CONVERTED_TO_VISIT">🚘 CONVERTED TO VISIT (Shifted to Visit Management)</option>
                <option value="ALL_INCLUDING_CONVERTED">📁 All Vault Records (Including Converted & Followups)</option>
                <option value="CANCELLED">❌ CANCELLED</option>
              </select>
            </div>
          </div>

          {/* MASTER INDIVIDUAL COST SHEETS TABLE */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
                📄 Master Individual Cost Sheets Vault ({displayedCostSheets.length} Records)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                ● ONE PROPERTY = ONE COST SHEET ENFORCED
              </span>
            </div>

            {displayedCostSheets.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #ef4444' }}>
                <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO INDIVIDUAL COST SHEETS FOUND</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  Select properties in Matched Properties workspace and click "Create Cost Sheet ID" or "Create Cost Sheets for All Selected".
                </p>
              </div>
            ) : (
              <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '12px' }}>Cost Sheet ID & Version</th>
                      <th style={{ padding: '12px' }}>Customer Identity</th>
                      <th style={{ padding: '12px' }}>Match ID & Score</th>
                      <th style={{ padding: '12px' }}>Property Code & Title</th>
                      <th style={{ padding: '12px' }}>Base Price vs Total Est. Cost</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px' }}>Created Date & By</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedCostSheets
                      .filter((item: any) => {
                        return matchesSearchQuery(item, searchQuery || individualCostSheetsSearch);
                      })
                      .map((item: any, i: number) => {
                        const itemPropCode = item.propertyCode || item.propertySnapshot?.propertyCode;
                        const itemCustId = item.customerId || item.customerSnapshot?.customerNumber || item.customerSnapshot?.customerId;
                        const itemCustMob = item.customerSnapshot?.mobile || item.mobile;
                        const cleanMob = itemCustMob ? itemCustMob.replace(/\D/g, '') : '';

                        const matchedProp = (properties || []).find((p: any) => 
                          (p.property_code && itemPropCode && p.property_code === itemPropCode) ||
                          (p.id && itemPropCode && p.id === itemPropCode) ||
                          (p.property_code && item.propertyId && p.property_code === item.propertyId) ||
                          (p.id && item.propertyId && p.id === item.propertyId)
                        );

                        const matchedCust = (customers || []).find((c: any) => 
                          (c.customer_number && itemCustId && c.customer_number === itemCustId) ||
                          (c.id && itemCustId && c.id === itemCustId) ||
                          (cleanMob && cleanMob.length >= 7 && c.mobile && c.mobile.replace(/\D/g, '') === cleanMob)
                        );

                        const custName = item.customerSnapshot?.customerName || item.customerName || matchedCust?.full_name || matchedCust?.name || 'Prospect Customer';
                        const custMobile = item.customerSnapshot?.mobile || item.mobile || matchedCust?.mobile || 'N/A';
                        const custNum = item.customerId || item.customerSnapshot?.customerNumber || matchedCust?.customer_number || 'SRM-CUS-2026-000189';

                        const matchId = item.matchId || item.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                        const matchScore = item.matchSnapshot?.matchScore || item.matchScore || (matchedCust?.quality_score) || 88;

                        const propCodeStr = itemPropCode || matchedProp?.property_code || 'SRM-PROP-2026-000426';
                        const rawPropTitle = item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name;
                        const propTitleStr = rawPropTitle && !rawPropTitle.startsWith('1 Properties') 
                          ? rawPropTitle 
                          : (matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name || 'BARASAT ECO RESIDENCY');

                        const devNameStr = item.propertySnapshot?.developerName || matchedProp?.developer || matchedProp?.developer_name || matchedProp?.builder_name || 'Swaramayi Partner Developer';
                        const localityStr = item.propertySnapshot?.locality || matchedProp?.locality || 'Barasat / Banamalipur';
                        const bhkStr = item.propertySnapshot?.bhk || item.propertySnapshot?.configuration || matchedProp?.configuration || matchedProp?.bhk || '3BHK';
                        const propTypeStr = item.propertySnapshot?.property_type || item.propertySnapshot?.propertyType || item.propertyType || matchedProp?.property_type || 'Flat / Apartment';

                        const basePriceNum = item.pricingSnapshot?.basePrice || item.base_price || matchedProp?.base_price || 5114880;
                        const basePriceStr = item.formattedPriceBreakup?.basePriceStr || (basePriceNum ? `₹${Number(basePriceNum).toLocaleString('en-IN')}` : '₹51,14,880');
                        const totalEstNum = item.pricingSnapshot?.totalEstimatedCost || item.final_estimated_price || matchedProp?.final_estimated_price || 5677517;
                        const totalEstStr = item.formattedPriceBreakup?.totalEstimatedCostStr || (totalEstNum ? `₹${Number(totalEstNum).toLocaleString('en-IN')}` : '₹56,77,517');

                        const statusStr = item.status || 'GENERATED';
                        const createdAtStr = item.createdAt || item.created_at || 'Just Now';
                        const createdByStr = (() => {
                          const cb = item.createdBy || item.created_by;
                          if (cb && !cb.includes('Priya Nair')) return cb;
                          const as = item.customerSnapshot?.assignedSalesperson;
                          if (as && !as.includes('Priya Nair')) return as;
                          return 'Avishek Das (Super Admin)';
                        })();

                        return (
                          <tr key={i} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.88rem' }}>{item.costSheetId}</span>
                              <br />
                              <span style={{ background: item.versionNumber > 1 ? '#fbbf24' : '#0284c7', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', marginTop: '2px', display: 'inline-block' }}>
                                {item.version || 'V01'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{custName}</strong>
                              <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{custMobile}</span>
                              <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{custNum}</span>
                              {(() => {
                                const usedProps = getCustomerUsedPropertyCodes(
                                  custNum,
                                  custName,
                                  custMobile,
                                  individualCostSheets
                                );
                                if (usedProps.length === 0) return null;
                                return (
                                  <div style={{ marginTop: '4px', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem' }}>
                                    <span style={{ color: '#38bdf8', fontWeight: '800' }}>🏢 Customer Property Codes ({usedProps.length}):</span>
                                    <div style={{ color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace', display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
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
                              <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '800' }}>{matchId}</span>
                              <br />
                              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                                🔥 {matchScore}% Match
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', fontSize: '0.75rem' }}>{propCodeStr}</span>
                              <br /><strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.82rem' }}>{propTitleStr}</strong>
                              <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{localityStr} • {devNameStr} ({bhkStr})</span>
                              <br />
                              <span style={{ fontSize: '0.68rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '1px 6px', borderRadius: '4px', fontWeight: '800', marginTop: '3px', display: 'inline-block' }}>
                                🏢 {propTypeStr}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>Asking Base: </span>
                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{basePriceStr}</strong>
                              <br />
                              <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '900' }}>Total Est: </span>
                              <strong style={{ color: '#4ade80', fontWeight: '900', fontSize: '0.92rem' }}>{totalEstStr}</strong>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{ background: statusStr === 'GENERATED' ? 'rgba(56, 189, 248, 0.2)' : statusStr === 'SENT_TO_CUSTOMER' ? 'rgba(34, 197, 94, 0.2)' : statusStr === 'REVISED' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)', color: statusStr === 'GENERATED' ? '#38bdf8' : statusStr === 'SENT_TO_CUSTOMER' ? '#4ade80' : statusStr === 'REVISED' ? '#fbbf24' : '#a855f7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
                                {statusStr}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.78rem' }}>{createdAtStr}</span>
                              <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>By: {createdByStr}</span>
                            </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => setShowViewIndividualCostSheetModal({ open: true, costSheet: item })} 
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button 
                                onClick={() => handleOpenRevisionModal(item)} 
                                style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                title="Edit Customer Details or Pricing & Create Revisions"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => sendCostSheetWhatsApp(item)} 
                                style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                                title="Send Cost Sheet directly to customer WhatsApp"
                              >
                                📲 Send
                              </button>
                              <button 
                                onClick={() => downloadCostSheetPDF(item)} 
                                style={{ background: '#334155', color: '#38bdf8', border: '1px solid #38bdf8', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                              >
                                📥 PDF
                              </button>
                              <button 
                                onClick={() => {
                                  if (setActiveTab) setActiveTab('visit_management');
                                  if (setActiveVisitSubTab) setActiveVisitSubTab('visit_route_planner');
                                  setShowScheduleVisitModal({ open: true, costSheet: item });
                                }} 
                                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                title="Schedule Site Visit for this Cost Sheet customer & property"
                              >
                                🚘 Visit Schedule
                              </button>
                              <button 
                                onClick={() => {
                                  const custName = item.customerSnapshot?.customerName || item.customerName || 'Customer';
                                  const custId = item.customerId || item.customerSnapshot?.customerNumber || 'SRM-CUS-2026-000189';
                                  const mob = item.customerSnapshot?.mobile || item.mobile || '';
                                  const propTitle = item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || 'Property';

                                  setShowSendToFollowupModal({
                                    costSheet: item,
                                    customerName: custName,
                                    customerNumber: custId,
                                    mobile: mob,
                                    propertyTitle: propTitle
                                  });
                                  setSendFollowupForm({
                                    followupDate: new Date().toISOString().split('T')[0],
                                    followupTime: '17:00',
                                    priority: 'HIGH',
                                    remarks: `Follow up with ${custName} regarding cost sheet ${item.costSheetId} for ${propTitle}.`
                                  });
                                }} 
                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                title="Send Cost Sheet to Need to Followup management list with remarks, date & time"
                              >
                                📌 Send to Followup
                              </button>
                              <button 
                                onClick={() => {
                                  const custName = item.customerSnapshot?.customerName || item.customerName || 'Customer';
                                  const custId = item.customerId || item.customerSnapshot?.customerNumber || 'SRM-CUS-2026-000189';
                                  const mob = item.customerSnapshot?.mobile || item.mobile || '';
                                  const cleanMob = mob.replace(/\D/g, '');
                                  const matchId = item.matchId || item.matchingId || item.parentMatchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                                  const propTitle = item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || 'Property';

                                  if (setShowShiftToMatchingModal) {
                                    setShowShiftToMatchingModal({
                                      open: true,
                                      item: item,
                                      customerName: custName,
                                      customerNumber: custId,
                                      mobile: mob,
                                      matchId: matchId,
                                      propertyTitle: propTitle,
                                      note: ''
                                    });
                                  } else {
                                    if (setSelectedMatchingId) setSelectedMatchingId(matchId);
                                    if (setActiveTab) setActiveTab('matching_management');
                                  }
                                }} 
                                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                title="Shift to Matching Management for this customer under the same Matching ID to select & match other properties with a note"
                              >
                                ⚡ Shift to Matching
                              </button>
                              {isSuperAdmin && (
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Cost Sheet record ${item.costSheetId} for ${item.customerSnapshot?.customerName || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                      if (onRecycleItem) {
                                        onRecycleItem({
                                          id: item.id || item.costSheetId || `CS-${Date.now()}`,
                                          title: `Cost Sheet - ${item.customerSnapshot?.customerName || 'Customer'} (${item.costSheetId})`,
                                          category: 'Cost Sheet',
                                          originalLocation: 'Cost Sheet Sharing Engine',
                                          details: `Project: ${item.propertySnapshot?.title || 'N/A'}, Total: ${item.grandTotalFormatted || 'N/A'}`,
                                          originalData: item
                                        });
                                      }
                                      const updatedCostSheets = (individualCostSheets || []).filter((c: any) => 
                                        c.costSheetId !== item.costSheetId && 
                                        (!item.id || c.id !== item.id) &&
                                        (!item.costSheetId || c.costSheetId !== item.costSheetId)
                                      );
                                      if (setIndividualCostSheets) {
                                        setIndividualCostSheets(updatedCostSheets);
                                      }
                                      try {
                                        localStorage.setItem('swaramayi_indiv_cost_sheets_v5_clean', JSON.stringify(updatedCostSheets));
                                      } catch (e) {}

                                      if (syncAllToMongoDB) {
                                        syncAllToMongoDB({
                                          cost_sheets: updatedCostSheets
                                        });
                                      }
                                      alert(`🗑️ Cost Sheet ${item.costSheetId} moved to Recycle Bin.`);
                                    }
                                  }} 
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                  title="Move this cost sheet record to Recycle Bin"
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
            )}
        </div>
      </div>
      )}

      {/* SUB-TAB 2: NEED TO FOLLOWUP */}
      {localCostSheetSubTab === 'need_to_followup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📌 Cost Sheet Follow-up Management ({localCostSheetFollowups.length} Records)
                </h3>
                <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                  Track pending callbacks, quotation negotiation notes, and customer response schedules for active cost sheets.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '6px 14px', borderRadius: '20px', fontWeight: '800' }}>
                ● LIVE FOLLOWUP ENGINE ACTIVE
              </span>
            </div>

            {localCostSheetFollowups.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #38bdf8' }}>
                <Clock size={32} color="#38bdf8" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO PENDING COST SHEET FOLLOW-UPS</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  Click "📌 Send to Followup" on any Cost Sheet record in the Active Cost Sheets tab to add follow-up tasks here.
                </p>
              </div>
            ) : (
              <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '12px' }}>Follow-up ID & Schedule</th>
                      <th style={{ padding: '12px' }}>Customer Identity</th>
                      <th style={{ padding: '12px' }}>Cost Sheet & Property</th>
                      <th style={{ padding: '12px' }}>Priority</th>
                      <th style={{ padding: '12px' }}>Remarks / Follow-up Notes</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localCostSheetFollowups.map((fol: any) => (
                      <tr key={fol.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.78rem' }}>{fol.id}</span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Calendar size={12} color="#fbbf24" /> {fol.followupDate}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} color="#a855f7" /> {fol.followupTime}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem' }}>{fol.customerName}</strong>
                          <br />
                          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{fol.customerNumber}</span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '800', fontFamily: 'monospace' }}>{fol.customerMobile}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '800', fontFamily: 'monospace' }}>{fol.costSheetId}</span>
                          <br />
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.82rem' }}>{fol.propertyTitle}</strong>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: fol.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : fol.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: fol.priority === 'HIGH' ? '#ef4444' : fol.priority === 'MEDIUM' ? '#f59e0b' : '#22c55e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>
                            {fol.priority || 'HIGH'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', maxWidth: '300px' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: '1.3' }}>
                            {fol.remarks}
                          </p>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ background: fol.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: fol.status === 'COMPLETED' ? '#4ade80' : '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
                            {fol.status === 'COMPLETED' ? '✅ COMPLETED' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                const cleanMob = (fol.customerMobile || '').replace(/\D/g, '');
                                if (!cleanMob) {
                                  alert(`⚠️ Mobile number missing for ${fol.customerName || 'Customer'}`);
                                  return;
                                }
                                const phone = cleanMob.length === 10 ? '91' + cleanMob : cleanMob;
                                const msg = `Hello ${fol.customerName || 'Customer'},\n\nGreetings from Swaramayi Real Estate! 🏡\n\nFollowing up regarding your Cost Sheet ${fol.costSheetId} for ${fol.propertyTitle}.\n\nScheduled Followup Time: ${fol.followupDate} at ${fol.followupTime}.\nNotes: ${fol.remarks}\n\nPlease let us know if you need any adjustments or wish to proceed!`;
                                window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                              title="Send WhatsApp follow-up message"
                            >
                              📲 WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                setShowEditFollowupModal(fol);
                                setEditFollowupForm({
                                  followupDate: fol.followupDate || new Date().toISOString().split('T')[0],
                                  followupTime: fol.followupTime || '17:00',
                                  priority: fol.priority || 'HIGH',
                                  remarks: fol.remarks || ''
                                });
                              }}
                              style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                              title="Edit follow-up schedule, priority & remarks"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`↩️ Move Cost Sheet ${fol.costSheetId || ''} for ${fol.customerName || 'Customer'} back to Active Cost Sheets?`)) {
                                  if (setIndividualCostSheets) {
                                    setIndividualCostSheets((prev: any[]) => {
                                      const targetId = fol.costSheetId || fol.id;
                                      const exists = prev.some(c => 
                                        c.costSheetId === targetId || 
                                        c.id === targetId ||
                                        (fol.costSheetId && (c.costSheetId === fol.costSheetId || c.id === fol.costSheetId))
                                      );
                                      
                                      let updatedCS;
                                      if (exists) {
                                        updatedCS = prev.map(c => 
                                          (c.costSheetId === targetId || c.id === targetId || (fol.costSheetId && (c.costSheetId === fol.costSheetId || c.id === fol.costSheetId)))
                                            ? { ...c, status: 'GENERATED' } 
                                            : c
                                        );
                                      } else {
                                        // Synthesize cost sheet if missing in state
                                        const newCS = {
                                          id: fol.id || `CS-${Date.now()}`,
                                          costSheetId: fol.costSheetId || `COST-SHEET-2026-${Date.now().toString().slice(-6)}`,
                                          customerId: fol.customerNumber || 'SRM-CUS-2026-000188',
                                          customerName: fol.customerName || 'Honey sing',
                                          mobile: fol.customerMobile || '+91 95677 88888',
                                          customerSnapshot: {
                                            customerName: fol.customerName || 'Honey sing',
                                            customerNumber: fol.customerNumber || 'SRM-CUS-2026-000188',
                                            mobile: fol.customerMobile || '+91 95677 88888',
                                          },
                                          propertySnapshot: {
                                            propertyTitle: fol.propertyTitle || 'SK Construction (Madhyamgram)',
                                            locality: 'Madhyamgram / North 24 Parganas',
                                            bhk: '3BHK',
                                            superBuiltupArea: '1,283 Sq.Ft.'
                                          },
                                          status: 'GENERATED',
                                          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                                          createdBy: 'Avishek Das (Super Admin)',
                                          version: 'V01',
                                          versionNumber: 1
                                        };
                                        updatedCS = [newCS, ...prev];
                                      }

                                      try {
                                        localStorage.setItem('swaramayi_indiv_cost_sheets_v5_clean', JSON.stringify(updatedCS));
                                      } catch (e) {}
                                      if (syncAllToMongoDB) {
                                        syncAllToMongoDB({ cost_sheets: updatedCS });
                                      }
                                      return updatedCS;
                                    });
                                  }

                                  // Remove from local cost sheet followups
                                  const updatedFol = localCostSheetFollowups.filter(item => item.id !== fol.id && item.costSheetId !== fol.costSheetId);
                                  saveCostSheetFollowups(updatedFol);

                                  // Clean up from Visit Management followups if created
                                  try {
                                    const existingVisitFol = localStorage.getItem('swaramayi_visit_followups_v1');
                                    if (existingVisitFol) {
                                      const parsed = JSON.parse(existingVisitFol);
                                      if (Array.isArray(parsed)) {
                                        const cleanedVisitFol = parsed.filter((v: any) => 
                                          v.costSheetId !== fol.costSheetId && 
                                          v.id !== fol.id &&
                                          !(v.customerName === fol.customerName && v.costSheetId === fol.costSheetId)
                                        );
                                        localStorage.setItem('swaramayi_visit_followups_v1', JSON.stringify(cleanedVisitFol));
                                      }
                                    }
                                  } catch (e) {}

                                  setLocalCostSheetSubTab('active_cost_sheets');
                                  alert(`📄 Cost Sheet ${fol.costSheetId || ''} restored to Active Cost Sheets!`);
                                }
                              }}
                              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                              title="Resend/Restore Cost Sheet back to Active Cost Sheets tab"
                            >
                              📄 Resend to Active
                            </button>
                            <button
                              onClick={() => {
                                const updated = localCostSheetFollowups.map(item => 
                                  item.id === fol.id ? { ...item, status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : item
                                );
                                saveCostSheetFollowups(updated);
                              }}
                              style={{ background: fol.status === 'COMPLETED' ? '#0284c7' : '#10b981', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                            >
                              {fol.status === 'COMPLETED' ? '🔄 Reopen' : '✅ Mark Done'}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete follow-up task ${fol.id}?`)) {
                                  const updated = localCostSheetFollowups.filter(item => item.id !== fol.id);
                                  saveCostSheetFollowups(updated);
                                }
                              }}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                            >
                              🗑️ Delete
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
        </div>
      )}

      {/* SEND TO FOLLOWUP MODAL */}
      {showSendToFollowupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📌 Send Cost Sheet to Need to Followup
              </h3>
              <button 
                onClick={() => setShowSendToFollowupModal(null)}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>
                👤 Customer: {showSendToFollowupModal.customerName} ({showSendToFollowupModal.customerNumber})
              </div>
              <div style={{ color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace' }}>
                📄 Cost Sheet ID: {showSendToFollowupModal.costSheet?.costSheetId}
              </div>
              <div style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                🏢 Property: {showSendToFollowupModal.propertyTitle}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    📅 Follow-up Date
                  </label>
                  <input 
                    type="date"
                    value={sendFollowupForm.followupDate}
                    onChange={(e) => setSendFollowupForm({ ...sendFollowupForm, followupDate: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    ⏰ Follow-up Time
                  </label>
                  <input 
                    type="time"
                    value={sendFollowupForm.followupTime}
                    onChange={(e) => setSendFollowupForm({ ...sendFollowupForm, followupTime: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                  ⚡ Priority Level
                </label>
                <select 
                  value={sendFollowupForm.priority}
                  onChange={(e) => setSendFollowupForm({ ...sendFollowupForm, priority: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="HIGH">🔴 HIGH PRIORITY</option>
                  <option value="MEDIUM">🟡 MEDIUM PRIORITY</option>
                  <option value="NORMAL">🟢 NORMAL PRIORITY</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                  📝 Remarks / Follow-up Notes
                </label>
                <textarea 
                  rows={3}
                  value={sendFollowupForm.remarks}
                  onChange={(e) => setSendFollowupForm({ ...sendFollowupForm, remarks: e.target.value })}
                  placeholder="Enter specific remarks, negotiation notes, or callback requirements..."
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setShowSendToFollowupModal(null)}
                style={{ background: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetCostSheetId = showSendToFollowupModal.costSheet?.costSheetId;
                  const newItem = {
                    id: `FOL-CS-${Date.now()}`,
                    costSheetId: targetCostSheetId,
                    customerName: showSendToFollowupModal.customerName,
                    customerNumber: showSendToFollowupModal.customerNumber,
                    customerMobile: showSendToFollowupModal.mobile,
                    propertyTitle: showSendToFollowupModal.propertyTitle,
                    followupDate: sendFollowupForm.followupDate,
                    followupTime: sendFollowupForm.followupTime,
                    priority: sendFollowupForm.priority,
                    remarks: sendFollowupForm.remarks,
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                  };
                  const updated = [newItem, ...localCostSheetFollowups];
                  saveCostSheetFollowups(updated);

                  // ALSO push to Visit Management followups storage
                  try {
                    const existingVisitFol = localStorage.getItem('swaramayi_visit_followups_v1');
                    let visitFolArray = existingVisitFol ? JSON.parse(existingVisitFol) : [];
                    const visitFolItem = {
                      id: `FOL-${Date.now().toString().slice(-6)}`,
                      customerName: showSendToFollowupModal.customerName,
                      customerNumber: showSendToFollowupModal.customerNumber,
                      customerMobile: showSendToFollowupModal.mobile,
                      propertyTitle: showSendToFollowupModal.propertyTitle,
                      visitScheduleId: 'N/A (Cost Sheet)',
                      costSheetId: targetCostSheetId || '',
                      assignedExecutive: 'Sales Team',
                      followupDate: sendFollowupForm.followupDate,
                      followupTime: sendFollowupForm.followupTime,
                      priority: sendFollowupForm.priority,
                      status: 'DUE_TODAY',
                      notes: sendFollowupForm.remarks
                    };
                    visitFolArray = [visitFolItem, ...visitFolArray];
                    localStorage.setItem('swaramayi_visit_followups_v1', JSON.stringify(visitFolArray));
                  } catch (e) {}

                  // Update cost sheet status in state & storage so it moves out of Active Cost Sheets
                  if (setIndividualCostSheets) {
                    setIndividualCostSheets((prev: any[]) => {
                      const updatedCS = prev.map(c => 
                        (c.costSheetId === targetCostSheetId || c.id === showSendToFollowupModal.costSheet?.id) 
                          ? { ...c, status: 'SENT_TO_FOLLOWUP' } 
                          : c
                      );
                      try {
                        localStorage.setItem('swaramayi_indiv_cost_sheets_v5_clean', JSON.stringify(updatedCS));
                      } catch (e) {}
                      if (syncAllToMongoDB) {
                        syncAllToMongoDB({ cost_sheets: updatedCS });
                      }
                      return updatedCS;
                    });
                  }

                  setShowSendToFollowupModal(null);
                  setLocalCostSheetSubTab('need_to_followup');
                  alert(`📌 Customer ${showSendToFollowupModal.customerName} sent to Need to Followup and removed from Active Cost Sheets!`);
                }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                📌 Confirm & Send to Followup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT FOLLOWUP MODAL */}
      {showEditFollowupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✏️ Edit Cost Sheet Follow-up Task
              </h3>
              <button 
                onClick={() => setShowEditFollowupModal(null)}
                style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '10px', padding: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>
                👤 Customer: {showEditFollowupModal.customerName} ({showEditFollowupModal.customerNumber})
              </div>
              <div style={{ color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace' }}>
                📄 Cost Sheet ID: {showEditFollowupModal.costSheetId}
              </div>
              <div style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                🏢 Property: {showEditFollowupModal.propertyTitle}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    📅 Follow-up Date
                  </label>
                  <input 
                    type="date"
                    value={editFollowupForm.followupDate}
                    onChange={(e) => setEditFollowupForm({ ...editFollowupForm, followupDate: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    ⏰ Follow-up Time
                  </label>
                  <input 
                    type="time"
                    value={editFollowupForm.followupTime}
                    onChange={(e) => setEditFollowupForm({ ...editFollowupForm, followupTime: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                  ⚡ Priority Level
                </label>
                <select 
                  value={editFollowupForm.priority}
                  onChange={(e) => setEditFollowupForm({ ...editFollowupForm, priority: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="HIGH">🔴 HIGH PRIORITY</option>
                  <option value="MEDIUM">🟡 MEDIUM PRIORITY</option>
                  <option value="NORMAL">🟢 NORMAL PRIORITY</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                  📝 Remarks / Follow-up Notes
                </label>
                <textarea 
                  rows={3}
                  value={editFollowupForm.remarks}
                  onChange={(e) => setEditFollowupForm({ ...editFollowupForm, remarks: e.target.value })}
                  placeholder="Enter specific remarks, negotiation notes, or callback requirements..."
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setShowEditFollowupModal(null)}
                style={{ background: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updated = localCostSheetFollowups.map(item => 
                    item.id === showEditFollowupModal.id
                      ? {
                          ...item,
                          followupDate: editFollowupForm.followupDate,
                          followupTime: editFollowupForm.followupTime,
                          priority: editFollowupForm.priority,
                          remarks: editFollowupForm.remarks
                        }
                      : item
                  );
                  saveCostSheetFollowups(updated);
                  setShowEditFollowupModal(null);
                  alert(`✏️ Follow-up details updated successfully!`);
                }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                💾 Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
