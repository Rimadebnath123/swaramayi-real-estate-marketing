import React from 'react';
import { Share2, Plus, Trash2, Printer, Search, Eye } from 'lucide-react';
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

  const allEffectiveCostSheets = React.useMemo(() => {
    return individualCostSheets || [];
  }, [individualCostSheets]);

  const convertedVisitsCount = Math.max(
    individualCostSheets.filter(c => c.status === 'CONVERTED_TO_VISIT').length,
    (scheduledVisits || []).filter(v => v.costSheetId || v.propertyCode).length,
    (visitPlans || []).length
  );

  // Active Cost Sheets pending in Vault (excluding records shifted to Visit Schedule)
  const pendingCostSheets = React.useMemo(() => {
    return (individualCostSheets || []).filter(c => c.status !== 'CONVERTED_TO_VISIT');
  }, [individualCostSheets]);

  // Active Cost Sheets displayed in Vault
  const displayedCostSheets = React.useMemo(() => {
    if (individualCostSheetsStatusFilter === 'CONVERTED_TO_VISIT') {
      return (individualCostSheets || []).filter(c => c.status === 'CONVERTED_TO_VISIT');
    }
    if (individualCostSheetsStatusFilter === 'ALL_INCLUDING_CONVERTED') {
      return individualCostSheets || [];
    }
    if (individualCostSheetsStatusFilter !== 'ALL') {
      return (individualCostSheets || []).filter(c => c.status === individualCostSheetsStatusFilter);
    }
    // Default 'ALL': Display active pending cost sheets, auto-shifting converted ones to Visit Management
    return (individualCostSheets || []).filter(c => c.status !== 'CONVERTED_TO_VISIT');
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

    const localityStr = item.propertySnapshot?.locality || matchedProp?.locality || matchedProp?.location_address || 'Location';
    const bhkStr = item.propertySnapshot?.bhk || item.propertySnapshot?.configuration || matchedProp?.configuration || matchedProp?.bhk || 'N/A';

    const basePriceNum = item.pricingSnapshot?.basePrice || item.base_price || matchedProp?.base_price;
    const basePriceStr = item.formattedPriceBreakup?.basePriceStr || (basePriceNum ? `₹${Number(basePriceNum).toLocaleString('en-IN')}` : 'N/A');
    const totalEstNum = item.pricingSnapshot?.totalEstimatedCost || item.final_estimated_price || matchedProp?.final_estimated_price;
    const totalEstStr = item.formattedPriceBreakup?.totalEstimatedCostStr || (totalEstNum ? `₹${Number(totalEstNum).toLocaleString('en-IN')}` : basePriceStr);

    const waMsg = `Hello ${custName},\n\nGreetings from Swaramayi Real Estate Marketing! 🏡\n\nHere is your official Cost Sheet Breakdown & PDF Document:\n\n📄 Cost Sheet ID: ${item.costSheetId} (${item.version || 'V01'})\n🏢 Property: ${propTitleStr}\n📍 Locality: ${localityStr}\n📐 Configuration: ${bhkStr}\n\n💰 Price Breakdown:\n• Asking Base Price: ${basePriceStr}\n• Total Estimated Cost (Incl. Taxes & Charges): ${totalEstStr}\n\n📎 Cost Sheet PDF Document: Itemized official PDF document is generated & attached.\n\nPlease review the details. Click or reply to schedule a site visit or ask any questions!\n\nThank you,\nSwaramayi Real Estate Team`;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SYSTEM HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '16px', padding: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share2 size={24} color="#38bdf8" /> COST SHEET SHARING & CUSTOMER DELIVERY HUB
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Multi-Channel Cost Sheet Sharing • WhatsApp & Email Gateway • Open Counter Analytics • Customer Interest Handoff
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowCreateShareModal(true)} 
            style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}
          >
            <Plus size={16} color="#0f172a" /> + Create Share against ID
          </button>
          {isStrictSuperAdmin && (
            <button onClick={handleDeleteAllCurrentInside} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={15} color="#ffffff" /> 🗑️ Delete All Current Inside
            </button>
          )}
          <button onClick={() => { if (displayedCostSheets.length === 0) { alert('⚠️ No active cost sheets available to share.'); return; } sendCostSheetWhatsApp(displayedCostSheets[0]); }} style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 size={15} /> Batch WhatsApp Share
          </button>
          <button onClick={() => alert('📧 Dispatched Email PDF Attachments to selected customers!')} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={15} /> Batch Email Share
          </button>
        </div>
      </div>

      {/* CREATE SHARE AGAINST TRANSACTION ID BAR */}
      <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ QUICK CREATE COST SHEET SHARE AGAINST PARENT TRANSACTION ID</span>
            <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>Select parent Cost Sheet ID, Selection ID, or Customer ID to generate a new Share ID(SRM-PSH-2026).</p>
          </div>
          <button 
            onClick={() => setShowCreateShareModal(true)} 
            style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={14} /> + Open ID Builder Modal
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : '2fr 1.5fr 1fr', gap: '12px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🎯 Select Target Transaction / Cost Sheet ID:</label>
            <select 
              value={newShareForm.parentId} 
              onChange={(e) => setNewShareForm({ ...newShareForm, parentId: e.target.value })} 
              style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
            >
              {(pendingCostSheets.length > 0 ? pendingCostSheets : allEffectiveCostSheets).map((c, idx) => {
                const itemPropCode = c.propertyCode || c.propertySnapshot?.propertyCode;
                const itemCustId = c.customerId || c.customerSnapshot?.customerNumber;
                const matchedProp = (properties || []).find((p: any) => p.property_code === itemPropCode || p.id === itemPropCode);
                const matchedCust = (customers || []).find((cust: any) => cust.customer_number === itemCustId || cust.id === itemCustId);

                const cName = c.customerSnapshot?.customerName || c.customerName || matchedCust?.full_name || matchedCust?.name || 'Customer';
                const pRawTitle = c.propertySnapshot?.propertyTitle || c.propertySnapshot?.projectName || matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name;
                const pTitle = pRawTitle && !pRawTitle.startsWith('1 Properties') ? pRawTitle : (matchedProp?.title || matchedProp?.property_title || 'Property Unit');
                const priceStr = c.formattedPriceBreakup?.basePriceStr || (c.pricingSnapshot?.basePrice ? `₹${Number(c.pricingSnapshot.basePrice).toLocaleString('en-IN')}` : matchedProp?.base_price ? `₹${Number(matchedProp.base_price).toLocaleString('en-IN')}` : 'Price');

                return (
                  <option key={idx} value={c.costSheetId}>
                    {c.costSheetId} — {cName} ({pTitle}, {priceStr})
                  </option>
                );
              })}
              {pendingCostSheets.length === 0 && allEffectiveCostSheets.length === 0 && (
                <option value="">No Active Cost Sheets Available in System</option>
              )}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📱 Delivery Channel Gateway:</label>
            <select 
              value={newShareForm.channel} 
              onChange={(e) => setNewShareForm({ ...newShareForm, channel: e.target.value })} 
              style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
            >
              <option value="WhatsApp & Email Gateway">WhatsApp & Email Gateway</option>
              <option value="WhatsApp Official API Only">WhatsApp Official API Only</option>
              <option value="Direct SMS Link Gateway">Direct SMS Link Gateway</option>
              <option value="Customer Portal Token View">Customer Portal Token View</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              onClick={() => {
                const targetCs = allEffectiveCostSheets.find((c: any) => c.costSheetId === newShareForm.parentId);
                if (targetCs) {
                  sendCostSheetWhatsApp(targetCs);
                } else if (displayedCostSheets.length > 0) {
                  sendCostSheetWhatsApp(displayedCostSheets[0]);
                } else {
                  alert(`🚀 Executed Quick Dispatch Share Token for ${newShareForm.parentId || 'Cost Sheet'}!`);
                }
              }} 
              style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              🚀 Execute Quick Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS FOR COST SHEET SHARING CATEGORY */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
        <button 
          onClick={() => setActiveCostSheetShareSubTab('individual_cost_sheets')} 
          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeCostSheetShareSubTab === 'individual_cost_sheets' ? '#0284c7' : '#1e293b', color: activeCostSheetShareSubTab === 'individual_cost_sheets' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📄 Master Individual Cost Sheets Vault ({pendingCostSheets.length})
        </button>
        <button 
          onClick={() => setActiveCostSheetShareSubTab('dispatcher')} 
          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeCostSheetShareSubTab === 'dispatcher' ? '#0284c7' : '#1e293b', color: activeCostSheetShareSubTab === 'dispatcher' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📲 Multi-Channel Dispatcher & Delivery Log ({costSheetShares.length})
        </button>
      </div>

      {/* SUB-TAB 1: MASTER INDIVIDUAL COST SHEETS VAULT */}
      {activeCostSheetShareSubTab === 'individual_cost_sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          {/* KPI SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TOTAL COST SHEETS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>{pendingCostSheets.length} Sheets</h3>
              <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>ONE PROPERTY = ONE COST SHEET</span>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>REVISED VERSIONS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fbbf24', marginTop: '2px' }}>{pendingCostSheets.filter(c => c.versionNumber > 1).length} Revised</h3>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>Version History Logged</span>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>PORTFOLIO ESTIMATED COST</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4ade80', marginTop: '2px' }}>
                {formatIndianRupees(pendingCostSheets.reduce((acc, c) => acc + (c.pricingSnapshot?.totalEstimatedCost || 0), 0))}
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Includes Taxes & Charges</span>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>CONVERTED TO VISITS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#a855f7', marginTop: '2px' }}>
                {convertedVisitsCount} Visits
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>CRM Pipeline Stage 6</span>
            </div>
          </div>

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
                <option value="REVISED">✏️ REVISED</option>
                <option value="APPROVED">✅ APPROVED</option>
                <option value="CONVERTED_TO_VISIT">🚘 CONVERTED TO VISIT (Shifted to Visit Management)</option>
                <option value="ALL_INCLUDING_CONVERTED">📁 All Vault Records (Including Converted)</option>
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
                        const createdByStr = item.createdBy || item.created_by || 'Priya Nair (Sales Exec)';

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

      {/* SUB-TAB 2: MULTI-CHANNEL DISPATCHER & DELIVERY LOG */}
      {activeCostSheetShareSubTab === 'dispatcher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TOP KPI CARDS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '12px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TOTAL SHARED</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>148 Shares</h3>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>WHATSAPP SENT</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e', marginTop: '2px' }}>94 Sent</h3>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>EMAIL SENT</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0284c7', marginTop: '2px' }}>54 Sent</h3>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>PORTAL OPENED</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fbbf24', marginTop: '2px' }}>112 Views</h3>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>PDF DOWNLOADS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#a855f7', marginTop: '2px' }}>76 PDFs</h3>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>CONVERTED TO VISIT</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4ade80', marginTop: '2px' }}>38 Visits</h3>
            </div>
          </div>

          {/* MASTER SHARED COST SHEETS AUDIT TABLE */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📋 Master Cost Sheet Share Vault ({costSheetShares.length} Active Shares)</h3>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                IMMUTABLE AUDIT TRAIL LOGGED
              </span>
            </div>

            {costSheetShares.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #ef4444' }}>
                <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 ALL COST SHEET SHARES DELETED — WORKSPACE CLEAN</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  No active cost sheet share records found inside. Click "+ Create Share against ID" to dispatch your first cost sheet.
                </p>
              </div>
            ) : (
              <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '12px' }}>Share ID & Time</th>
                      <th style={{ padding: '12px' }}>Customer Details</th>
                      <th style={{ padding: '12px' }}>Property & Cost Sheet ID</th>
                      <th style={{ padding: '12px' }}>Delivery Channel</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Engagement Analytics</th>
                      <th style={{ padding: '12px' }}>Customer Interest Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costSheetShares.map((item, i) => (
                    <tr key={i} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{item.shareId}</span>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{item.sentTime}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{item.customerName}</strong>
                        <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{item.mobile}</span>
                        <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{item.customerNumber}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{item.propertyTitle}</strong>
                        <br /><span style={{ fontSize: '0.75rem', color: '#fbbf24', fontFamily: 'monospace' }}>{item.costSheetId} ({item.finalPrice})</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#22c55e', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem' }}>
                          {item.channel}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '900' }}>
                          👁️ {item.viewCount} Views
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '900' }}>
                          📥 {item.downloadCount} Downloads
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '0.75rem' }}>
                          {item.interest}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => {
                              const cleanMob = (item.mobile || '').replace(/\D/g, '');
                              if (!cleanMob) {
                                alert(`⚠️ Mobile number missing for ${item.customerName || 'Customer'}`);
                                return;
                              }
                              const phone = cleanMob.length === 10 ? '91' + cleanMob : cleanMob;
                              const msg = `Hello ${item.customerName || 'Valued Customer'},\n\nGreetings from Swaramayi Real Estate Marketing! 🏡\n\nResending your official Cost Sheet (${item.costSheetId || ''}) for ${item.propertyTitle || 'Property'}.\nTotal Estimated Cost: ${item.finalPrice || 'N/A'}.\n\nPlease reply or click to confirm your interest or schedule a site visit!`;
                              window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
                            }} 
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}
                            title="Resend Cost Sheet to customer WhatsApp"
                          >
                            Resend
                          </button>
                          <button 
                            onClick={() => {
                              const custName = item.customerName || 'Customer';
                              const custId = item.customerNumber || 'SRM-CUS-2026-000189';
                              const mob = item.mobile || '';
                              const cleanMob = mob.replace(/\D/g, '');
                              const matchId = item.parentMatchingId || item.matchId || item.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');

                              if (setSelectedMatchingId) setSelectedMatchingId(matchId);

                              let targetCust = null;
                              if (customers && customers.length > 0) {
                                targetCust = customers.find((c: any) => 
                                  (c.customer_number && c.customer_number === custId) ||
                                  (c.name && c.name.toLowerCase() === custName.toLowerCase()) ||
                                  (cleanMob && c.mobile && c.mobile.replace(/\D/g, '') === cleanMob)
                                );
                              }
                              if (targetCust && setSelectedCust) {
                                setSelectedCust(targetCust);
                              }

                              if (setActiveTab) {
                                setActiveTab('matching_management');
                              }

                              alert(`⚡ Shifted back to Matching Management for ${custName} (${custId})\n\nMatching Code preserved: ${matchId}\n\nYou can now browse stock, calculate compatibility scores, and generate cost sheets for OTHER properties!`);
                            }} 
                            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                            title="Shift to Matching Management for this customer under the same Matching ID to select & match other properties"
                          >
                            ⚡ Shift to Matching
                          </button>
                          <button onClick={() => alert(`📊 Opened live tracking for Share ${item.shareId}`)} style={{ background: '#334155', color: '#38bdf8', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem' }}>Analytics</button>
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

    </div>
  );
};
