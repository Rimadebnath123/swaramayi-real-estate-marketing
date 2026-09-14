import React, { useState } from 'react';
import { Zap, Search, X, SearchCode, Eye, FileText, Trash2 } from 'lucide-react';

interface MatchingManagementViewProps {
  isLight: boolean;
  windowWidth: number;
  currentRole?: string;
  selectedCust: any;
  activeMatchingSubTab: string;
  setActiveMatchingSubTab: (tab: any) => void;
  matchingRequestsQueue: any[];
  setMatchingRequestsQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  selectedMatchingId: string;
  setSelectedMatchingId: (id: string) => void;
  costSheetShares: any[];
  scheduledVisits: any[];
  matchingVaultFilter: string;
  setMatchingVaultFilter: (filter: string) => void;
  matchesSearchQuery: (item: any, query: string) => boolean;
  searchQuery: string;
  matchingSearchQuery: string;
  setMatchingSearchQuery: (query: string) => void;
  openIdDetailsModal: (id: string, type: string) => void;
  setActiveTab: (tab: string) => void;
  setActiveCostSheetShareSubTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  customers: any[];
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedCust: (cust: any) => void;
  properties: any[];
  selectedPropertyIds: string[];
  setSelectedPropertyIds: React.Dispatch<React.SetStateAction<string[]>>;
  propertySearchQuery: string;
  setPropertySearchQuery: (query: string) => void;
  calculatePropertyMatchScore: (cust: any, prop: any) => any;
  handleRowLevelCreateCostSheet: (prop: any) => void;
  handleBulkCreateCostSheets: () => void;
  individualCostSheets?: any[];
  sourcingRequests?: any[];
  setSourcingRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  bookings?: any[];
  invoices?: any[];
  agreements?: any[];
}

export interface CustomerUsedPropertyCodeInfo {
  propertyCode: string;
  propertyTitle: string;
  costSheetId?: string;
  source: string;
  date?: string;
}

export const getCustomerUsedPropertyCodes = (
  custNumOrId: string = '',
  custName: string = '',
  custMobile: string = '',
  individualCostSheets: any[] = [],
  costSheetShares: any[] = [],
  scheduledVisits: any[] = []
): CustomerUsedPropertyCodeInfo[] => {
  const cleanId = (custNumOrId || '').toString().toLowerCase().trim();
  const cleanName = (custName || '').toString().toLowerCase().trim();
  const cleanMob = (custMobile || '').toString().replace(/\D/g, '');

  const usedMap = new Map<string, CustomerUsedPropertyCodeInfo>();

  (individualCostSheets || []).forEach((cs: any) => {
    const csCustId = (cs.customerId || cs.customerNumber || cs.customerSnapshot?.customerId || cs.customerSnapshot?.customerNumber || '').toString().toLowerCase().trim();
    const csName = (cs.customerName || cs.name || cs.customerSnapshot?.customerName || '').toString().toLowerCase().trim();
    const csMob = (cs.mobile || cs.customerMobile || cs.customerSnapshot?.mobile || cs.customerSnapshot?.alternateMobile || '').toString().replace(/\D/g, '');

    let matches = false;
    if (cleanId && csCustId && cleanId === csCustId) matches = true;
    if (cleanMob && csMob && cleanMob.length >= 10 && cleanMob === csMob) matches = true;
    if (cleanName && csName && cleanName.length > 2 && cleanName === csName) matches = true;

    if (matches) {
      const pCode = cs.propertyCode || cs.propertyId || cs.propertySnapshot?.propertyCode || cs.propertySnapshot?.propertyId;
      const pTitle = cs.propertyTitle || cs.propertySnapshot?.propertyTitle || pCode || 'Property';
      if (pCode) {
        const uppercaseCode = pCode.toString().trim().toUpperCase();
        usedMap.set(uppercaseCode, {
          propertyCode: uppercaseCode,
          propertyTitle: pTitle,
          costSheetId: cs.costSheetId || cs.id,
          source: 'Cost Sheet',
          date: cs.createdAt || cs.date
        });
      }
    }
  });

  (costSheetShares || []).forEach((css: any) => {
    const cssCustId = (css.customerId || css.customerNumber || css.customerSnapshot?.customerId || css.customerSnapshot?.customerNumber || '').toString().toLowerCase().trim();
    const cssName = (css.customerName || css.name || css.customerSnapshot?.customerName || '').toString().toLowerCase().trim();
    const cssMob = (css.mobile || css.customerMobile || css.customerSnapshot?.mobile || '').toString().replace(/\D/g, '');

    let matches = false;
    if (cleanId && cssCustId && cleanId === cssCustId) matches = true;
    if (cleanMob && cssMob && cleanMob.length >= 10 && cleanMob === cssMob) matches = true;
    if (cleanName && cssName && cleanName.length > 2 && cleanName === cssName) matches = true;

    if (matches) {
      const pCode = css.propertyCode || css.propertyId || css.propertySnapshot?.propertyCode;
      const pTitle = css.propertyTitle || css.propertySnapshot?.propertyTitle || pCode || 'Property';
      if (pCode) {
        const uppercaseCode = pCode.toString().trim().toUpperCase();
        if (!usedMap.has(uppercaseCode)) {
          usedMap.set(uppercaseCode, {
            propertyCode: uppercaseCode,
            propertyTitle: pTitle,
            costSheetId: css.costSheetId || css.id,
            source: 'Cost Sheet Share',
            date: css.createdAt || css.date
          });
        }
      }
    }
  });

  (scheduledVisits || []).forEach((v: any) => {
    const vCustId = (v.customerId || v.customerNumber || v.customerSnapshot?.customerId || v.customerSnapshot?.customerNumber || '').toString().toLowerCase().trim();
    const vName = (v.customerName || v.name || v.customerSnapshot?.customerName || '').toString().toLowerCase().trim();
    const vMob = (v.mobile || v.phone || v.customerSnapshot?.mobile || '').toString().replace(/\D/g, '');

    let matches = false;
    if (cleanId && vCustId && cleanId === vCustId) matches = true;
    if (cleanMob && vMob && cleanMob.length >= 10 && cleanMob === vMob) matches = true;
    if (cleanName && vName && cleanName.length > 2 && cleanName === vName) matches = true;

    if (matches) {
      const pCode = v.propertyCode || v.propCode || v.propertyId;
      const pTitle = v.propertyTitle || v.propTitle || pCode || 'Property';
      if (pCode) {
        const uppercaseCode = pCode.toString().trim().toUpperCase();
        if (!usedMap.has(uppercaseCode)) {
          usedMap.set(uppercaseCode, {
            propertyCode: uppercaseCode,
            propertyTitle: pTitle,
            costSheetId: v.costSheetId,
            source: 'Site Visit Schedule',
            date: v.scheduledDate || v.date
          });
        }
      }
    }
  });

  return Array.from(usedMap.values());
};

export const MatchingManagementView: React.FC<MatchingManagementViewProps> = ({
  isLight,
  windowWidth,
  currentRole,
  selectedCust = {},
  activeMatchingSubTab,
  setActiveMatchingSubTab,
  matchingRequestsQueue = [],
  setMatchingRequestsQueue,
  selectedMatchingId,
  setSelectedMatchingId,
  costSheetShares = [],
  scheduledVisits = [],
  matchingVaultFilter,
  setMatchingVaultFilter,
  matchesSearchQuery,
  searchQuery,
  matchingSearchQuery,
  setMatchingSearchQuery,
  openIdDetailsModal,
  setActiveTab,
  setActiveCostSheetShareSubTab,
  setSearchQuery,
  customers = [],
  setCustomers,
  setSelectedCust,
  properties = [],
  selectedPropertyIds = [],
  setSelectedPropertyIds,
  propertySearchQuery,
  setPropertySearchQuery,
  calculatePropertyMatchScore,
  handleRowLevelCreateCostSheet,
  handleBulkCreateCostSheets,
  individualCostSheets = [],
  sourcingRequests = [],
  setSourcingRequests,
  bookings = [],
  invoices = [],
  agreements = [],
  onRecycleItem,
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');

  // Dynamic property status helper
  const getDynamicPropertyStatus = (p: any) => {
    const isSoldOutByBilling = (invoices || []).some((inv: any) => {
      if (!inv || inv.status === 'CANCELLED' || inv.payment_status === 'CANCELLED') return false;
      const isCustInvoice = inv.invoice_category === 'CUSTOMER' || (inv.customer_name && (inv.total_invoice_amount > 0 || inv.taxable_value > 0));
      if (!isCustInvoice) return false;

      const pCode = (p.property_code || p.id || '').toString().toLowerCase().trim();
      const invCode = (inv.property_code || inv.property_id || '').toString().toLowerCase().trim();
      return pCode && invCode && pCode === invCode;
    }) || (agreements || []).some((agr: any) => {
      if (!agr || agr.status === 'CANCELLED' || agr.agreement_status === 'CANCELLED') return false;
      const isCustAgr = agr.agreement_category === 'CUSTOMER' || (agr.customer_name && agr.agreement_type !== 'DEVELOPER');
      if (!isCustAgr) return false;

      const pCode = (p.property_code || p.id || '').toString().toLowerCase().trim();
      const agrCode = (agr.property_code || agr.property_id || '').toString().toLowerCase().trim();
      return pCode && agrCode && pCode === agrCode;
    });

    const isBookedByWorkflow = (bookings || []).some((b: any) => {
      if (!b || b.status === 'CANCELLED' || b.approval_status === 'REJECTED') return false;
      const pCode = (p.property_code || p.id || '').toString().toLowerCase().trim();
      const pTitle = (p.title || '').toString().toLowerCase().trim();
      const bCode = (b.property_code || b.property_id || '').toString().toLowerCase().trim();
      const bTitle = (b.project_name || b.property_title || b.propertyTitle || '').toString().toLowerCase().trim();
      return (pCode && bCode && pCode === bCode) || (pTitle && bTitle && (pTitle === bTitle || pTitle.includes(bTitle) || bTitle.includes(pTitle)));
    });

    const isUnderConstructionByPossession = (p.possession_status || p.possession || '').toLowerCase().includes('construction');

    let effectiveStatus = p.status || (isUnderConstructionByPossession ? 'UNDER_CONSTRUCTION' : 'LIVE');
    if (p.status && p.status !== 'AUTO') {
      effectiveStatus = p.status;
    } else if (isSoldOutByBilling) {
      effectiveStatus = 'SOLD_OUT';
    } else if (isBookedByWorkflow) {
      effectiveStatus = 'BOOKED';
    } else if (isUnderConstructionByPossession) {
      effectiveStatus = 'UNDER_CONSTRUCTION';
    }

    const rawStatus = (effectiveStatus || 'LIVE').toUpperCase().replace(/\s+/g, '_');
    const normalizedStatus = rawStatus === 'AVAILABLE' ? 'LIVE' : rawStatus;

    switch (normalizedStatus) {
      case 'SOLD_OUT':
        return { label: '🔴 SOLD OUT', border: '#ef4444', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171' };
      case 'BOOKED':
        return { label: '🟡 BOOKED', border: '#fbbf24', bg: 'rgba(234, 179, 8, 0.18)', color: '#fbbf24' };
      case 'HOLD':
      case 'RESERVED':
        return { label: '⚡ HOLD / RESERVED', border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24' };
      case 'UNDER_CONSTRUCTION':
        return { label: '🏗️ UNDER CONSTRUCTION', border: '#a855f7', bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' };
      default:
        return { label: '🟢 LIVE / AVAILABLE', border: '#22c55e', bg: 'rgba(34, 197, 94, 0.18)', color: '#4ade80' };
    }
  };

  // PROPERTY SOURCING REQUEST MODAL STATES
  const [sourcingModalRequest, setSourcingModalRequest] = useState<any | null>(null);
  const [sourcingReasonInput, setSourcingReasonInput] = useState<string>('');
  const [sourcingError, setSourcingError] = useState<string>('');

  // HANDLE CONFIRM MOVE TO PROPERTY SOURCING REQUEST DESK
  const handleConfirmMoveToSourcing = () => {
    if (!sourcingModalRequest) return;

    if (!sourcingReasonInput.trim()) {
      setSourcingError('⚠️ Message Required! Please write why you are sending this customer into Property Sourcing Request.');
      return;
    }

    const nextCount = (sourcingRequests || []).length + 105;
    const newSourcingId = `SRM-SRC-2026-000${nextCount}`;
    const cust = customers.find(c => c.customer_number === sourcingModalRequest.customerNumber || c.name === sourcingModalRequest.customerName) || {};

    const newSourcingObj = {
      id: newSourcingId,
      sourcing_id: newSourcingId,
      created_at: new Date().toISOString(),
      customer_name: sourcingModalRequest.customerName || cust.name || 'Customer',
      customer_number: sourcingModalRequest.customerNumber || cust.customer_number || 'SRM-CUS-2026-000188',
      mobile: sourcingModalRequest.mobile || cust.mobile || '8876597975',
      email: cust.email || sourcingModalRequest.email || '',
      customer_id: sourcingModalRequest.customerNumber || cust.customer_number || 'SRM-CUS-2026-000188',
      lead_id: sourcingModalRequest.leadId || cust.lead_number || 'SRM-LD-2026-000101',
      matching_id: sourcingModalRequest.requestId,
      preferred_locality: sourcingModalRequest.preferredArea || cust.preferredArea || cust.preferred_locality || 'Madhamgram',
      secondary_areas: sourcingModalRequest.secondary_areas || cust.secondary_areas || cust.secondary_locality || 'Barasat, New Town, Hitec City',
      property_type: sourcingModalRequest.propertyCategory || cust.property_type || 'Flat / Apartment',
      configuration: sourcingModalRequest.configuration || cust.configuration || '2BHK',
      budget_min: sourcingModalRequest.budget_min || cust.budget_min || '₹50 Lakhs',
      budget_max: sourcingModalRequest.budget_max || cust.budget_max || '₹1.00 Crore',
      possession_status: sourcingModalRequest.possessionCondition || cust.possession_status || 'Ready to Move',
      facing: sourcingModalRequest.facing || cust.facing || 'East Facing',
      priority: cust.priority || 'HOT',
      assigned_executive: sourcingModalRequest.assignedExecutive || cust.assigned_employee_name || 'Punita Roy (Sales Exec)',
      status: 'PENDING_SOURCING',
      notes: sourcingReasonInput.trim(),
      sourcing_reason: sourcingReasonInput.trim(),
      lead_details: {
        customer_name: sourcingModalRequest.customerName || cust.name || 'Customer',
        mobile: sourcingModalRequest.mobile || cust.mobile || '8876597975',
        alternate_mobile: cust.alternate_mobile || '',
        email: cust.email || '',
        customer_number: sourcingModalRequest.customerNumber || cust.customer_number || 'SRM-CUS-2026-000188',
        lead_number: sourcingModalRequest.leadId || cust.lead_number || 'SRM-LD-2026-000101',
        sourcing_id: newSourcingId,
        matching_id: sourcingModalRequest.requestId,
        lead_source: cust.lead_source || 'Meta Ads / Direct Intake',
        investment_purpose: cust.investment_purpose || 'Self Use / End User',
        property_type: sourcingModalRequest.propertyCategory || cust.property_type || 'Flat / Apartment',
        configuration: sourcingModalRequest.configuration || cust.configuration || '2BHK',
        preferred_locality: sourcingModalRequest.preferredArea || cust.preferredArea || cust.preferred_locality || 'Madhamgram',
        secondary_areas: sourcingModalRequest.secondary_areas || cust.secondary_areas || cust.secondary_locality || 'Barasat, New Town, Hitec City',
        budget_min: sourcingModalRequest.budget_min || cust.budget_min || '₹50 Lakhs',
        budget_max: sourcingModalRequest.budget_max || cust.budget_max || '₹1.00 Crore',
        budget_range: `${sourcingModalRequest.budget_min || '₹50 Lakhs'} - ${sourcingModalRequest.budget_max || '₹1.00 Crore'}`,
        possession_status: sourcingModalRequest.possessionCondition || cust.possession_status || 'Ready to Move',
        facing: sourcingModalRequest.facing || cust.facing || 'North Facing',
        floor_pref: cust.floor_pref || '10th Floor or Higher',
        carpet_area_min: cust.carpet_area_min || '800 Sq.Ft.',
        carpet_area_max: cust.carpet_area_max || '1400 Sq.Ft.',
        parking: cust.parking || 'Covered Slot + EV Charger',
        amenities: cust.amenities || 'Gym, Swimming Pool, Clubhouse, Power Backup, Security',
        loan_required: cust.loan_required || 'Yes',
        loan_amount: cust.loan_amount || '₹40 Lakhs',
        loan_status: cust.loan_status || 'Pre-Approved',
        sourcing_reason: sourcingReasonInput.trim(),
        created_at: new Date().toISOString()
      }
    };

    if (setSourcingRequests) {
      setSourcingRequests(prev => {
        const existingList = prev || [];
        const targetCustNo = (newSourcingObj.customer_number || newSourcingObj.customer_id || '').toString().trim().toLowerCase();
        const targetMob = (newSourcingObj.mobile || '').toString().replace(/\D/g, '');
        const targetName = (newSourcingObj.customer_name || '').toString().trim().toLowerCase();

        const existingIdx = existingList.findIndex((r: any) => {
          const rCustNo = (r.customer_number || r.customer_id || r.customerNumber || '').toString().trim().toLowerCase();
          const rMob = (r.mobile || '').toString().replace(/\D/g, '');
          const rName = (r.customer_name || r.customerName || '').toString().trim().toLowerCase();

          if (targetCustNo && rCustNo && targetCustNo === rCustNo) return true;
          if (targetMob && rMob && targetMob.length >= 7 && targetMob === rMob) return true;
          if (targetName && rName && targetName.length > 2 && targetName === rName) return true;
          return false;
        });

        if (existingIdx !== -1) {
          const existingItem = existingList[existingIdx];
          const updatedItem = {
            ...existingItem,
            matching_id: sourcingModalRequest.requestId || existingItem.matching_id,
            notes: sourcingReasonInput.trim(),
            sourcing_reason: sourcingReasonInput.trim(),
            status: 'PENDING_SOURCING',
            updated_at: new Date().toISOString(),
            lead_details: {
              ...existingItem.lead_details,
              ...newSourcingObj.lead_details,
              sourcing_id: existingItem.id || existingItem.sourcing_id
            }
          };

          const remaining = existingList.filter((_, idx) => idx !== existingIdx).filter((r: any) => {
            const rCustNo = (r.customer_number || r.customer_id || r.customerNumber || '').toString().trim().toLowerCase();
            const rMob = (r.mobile || '').toString().replace(/\D/g, '');
            if (targetCustNo && rCustNo && targetCustNo === rCustNo) return false;
            if (targetMob && rMob && targetMob.length >= 7 && targetMob === rMob) return false;
            return true;
          });

          return [updatedItem, ...remaining];
        }

        return [newSourcingObj, ...existingList];
      });
    }

    // AUTOMATICALLY REMOVE FROM MATCHING MANAGEMENT QUEUE UPON TRANSFER
    const targetReqId = (sourcingModalRequest.requestId || sourcingModalRequest.id || '').toString().trim();
    const targetCustNum = (sourcingModalRequest.customerNumber || sourcingModalRequest.customerId || '').toString().trim();
    const targetCustName = (sourcingModalRequest.customerName || sourcingModalRequest.name || '').toString().trim();
    const targetMobile = (sourcingModalRequest.mobile || '').toString().replace(/\D/g, '');

    if (setMatchingRequestsQueue) {
      setMatchingRequestsQueue(prev => {
        const next = (prev || []).filter(r => {
          const rId = (r.requestId || r.id || '').toString().trim();
          const rCustNum = (r.customerNumber || r.customerId || '').toString().trim();
          const rName = (r.customerName || r.name || '').toString().trim();
          const rMob = (r.mobile || '').toString().replace(/\D/g, '');

          if (targetReqId && rId && rId.toLowerCase() === targetReqId.toLowerCase()) return false;
          if (targetCustNum && rCustNum && rCustNum.toLowerCase() === targetCustNum.toLowerCase()) return false;
          if (targetMobile && rMob && targetMobile.length >= 7 && rMob === targetMobile) return false;
          if (targetCustName && rName && rName.toLowerCase() === targetCustName.toLowerCase()) return false;
          return true;
        });
        try {
          localStorage.setItem('swaramayi_matching_queue_v7_clean', JSON.stringify(next));
        } catch (e) {
          console.error('Error persisting matching queue after sourcing shift', e);
        }
        return next;
      });
    }

    if (selectedMatchingId === targetReqId && setSelectedMatchingId) {
      setSelectedMatchingId('');
    }

    setSourcingModalRequest(null);
    setSourcingReasonInput('');
    setSourcingError('');
    alert(`🎉 SUCCESS! Customer ${newSourcingObj.customer_name} transferred to Property Sourcing Requests Desk.\n\n• Sourcing ID: ${newSourcingId}\n• Reason: "${sourcingReasonInput.trim()}"\n\n(Customer request removed from Matching Management Vault)`);
    setActiveTab('property_sourcing_requests');
  };

  const handleDeleteMatchingRequest = (req: any) => {
    if (!req) return;
    const reqId = (req.requestId || req.id || '').toString().trim();
    const custNum = (req.customerNumber || req.customerId || '').toString().trim();
    const custName = (req.customerName || req.name || '').toString().trim();
    const mobile = (req.mobile || '').toString().replace(/\D/g, '');

    if (window.confirm(`Are you sure you want to remove matching request & customer "${custName || reqId}" from Matching Management? It will be moved to Recycle Bin.`)) {
      if (onRecycleItem) {
        onRecycleItem({
          id: reqId || `MAT-${Date.now()}`,
          title: `Matching Request - ${custName || 'Client'} (${reqId})`,
          category: 'Lead',
          originalLocation: 'Matching Management Vault',
          details: `Customer ID: ${custNum || 'N/A'}, Mobile: ${mobile || 'N/A'}`,
          originalData: req
        });
      }
      if (setMatchingRequestsQueue) {
        setMatchingRequestsQueue(prev => {
          const next = (prev || []).filter(r => {
            const rId = (r.requestId || r.id || '').toString().trim();
            const rCustNum = (r.customerNumber || r.customerId || '').toString().trim();
            const rName = (r.customerName || r.name || '').toString().trim();
            const rMob = (r.mobile || '').toString().replace(/\D/g, '');

            if (reqId && rId && rId.toLowerCase() === reqId.toLowerCase()) return false;
            if (custNum && rCustNum && rCustNum.toLowerCase() === custNum.toLowerCase()) return false;
            if (mobile && rMob && mobile.length >= 7 && rMob === mobile) return false;
            if (custName && rName && rName.toLowerCase() === custName.toLowerCase()) return false;
            return true;
          });
          try {
            localStorage.setItem('swaramayi_matching_queue_v7_clean', JSON.stringify(next));
          } catch (e) {
            console.error(e);
          }
          return next;
        });
      }

      if (setCustomers) {
        setCustomers(prev => {
          const next = (prev || []).filter(c => {
            const cNum = (c.customer_number || c.customerNumber || c.customerId || c.id || '').toString().trim();
            const cName = (c.name || c.full_name || '').toString().trim();
            const cMob = (c.mobile || c.phone || '').toString().replace(/\D/g, '');

            if (custNum && cNum && cNum.toLowerCase() === custNum.toLowerCase()) return false;
            if (mobile && cMob && mobile.length >= 7 && cMob === mobile) return false;
            if (custName && cName && cName.toLowerCase() === custName.toLowerCase()) return false;
            return true;
          });
          try {
            localStorage.setItem('swaramayi_customers_v7_clean', JSON.stringify(next));
          } catch (e) {
            console.error(e);
          }
          return next;
        });
      }

      if (selectedMatchingId === reqId || (custNum && selectedMatchingId === custNum)) {
        setSelectedMatchingId('');
      }

      alert(`🗑️ Matching Request & Customer ${custName || reqId} removed successfully!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>SMART AI PROPERTY MATCHING & INVENTORY ENGINE</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            5-Factor Multivariate Matching (Location 25%, Budget 25%, BHK 20%, Type 15%, Facing 15%) • Inventory Matrix • Portfolio Dispatcher
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => alert(`⚡ Recalculated live AI property match ranker for ${selectedCust.name}!`)} style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} /> ⚡ Run Real-Time AI Matcher
          </button>
        </div>
      </div>

      {/* 3 SUB-TABS NAVIGATION FOR MATCHING MANAGEMENT */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveMatchingSubTab('ai_matching_engine')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeMatchingSubTab === 'ai_matching_engine' ? '#0284c7' : '#1e293b', color: activeMatchingSubTab === 'ai_matching_engine' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
          🤖 Smart AI Property Matcher
        </button>
        <button onClick={() => setActiveMatchingSubTab('req_inventory_matrix')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeMatchingSubTab === 'req_inventory_matrix' ? '#0284c7' : '#1e293b', color: activeMatchingSubTab === 'req_inventory_matrix' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
          📋 Requirement vs Inventory Matrix
        </button>
        <button onClick={() => setActiveMatchingSubTab('portfolio_dispatcher')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeMatchingSubTab === 'portfolio_dispatcher' ? '#0284c7' : '#1e293b', color: activeMatchingSubTab === 'portfolio_dispatcher' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
          📤 Match Portfolio Dispatcher
        </button>
      </div>

      {/* SUB-TAB 1: AI MATCHING ENGINE (MATCHING ID CENTERED WORKSPACE) */}
      {activeMatchingSubTab === 'ai_matching_engine' && (() => {
        const allMatchingRequests = (() => {
          const list: any[] = [];
          const seenCustNums = new Set<string>();
          const seenMobiles = new Set<string>();

          // SOURCING EXCLUSION SETS (Remove any customer/request shifted to Property Sourcing Requests)
          const sourcedMatchingIds = new Set<string>();
          const sourcedCustNums = new Set<string>();
          const sourcedMobiles = new Set<string>();
          const sourcedNames = new Set<string>();

          let activeSourcingQueue = sourcingRequests || [];
          if (!activeSourcingQueue.length) {
            try {
              const saved = localStorage.getItem('swaramayi_sourcing_requests_v1');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) activeSourcingQueue = parsed;
              }
            } catch (e) {
              console.error(e);
            }
          }

          activeSourcingQueue.forEach((s: any) => {
            if (s.matching_id) sourcedMatchingIds.add(s.matching_id.toString().trim().toLowerCase());
            if (s.id) sourcedMatchingIds.add(s.id.toString().trim().toLowerCase());
            if (s.sourcing_id) sourcedMatchingIds.add(s.sourcing_id.toString().trim().toLowerCase());
            
            if (s.customer_number) sourcedCustNums.add(s.customer_number.toString().trim().toLowerCase());
            if (s.customer_id) sourcedCustNums.add(s.customer_id.toString().trim().toLowerCase());
            if (s.customerNumber) sourcedCustNums.add(s.customerNumber.toString().trim().toLowerCase());

            if (s.mobile) {
              const cleanM = s.mobile.toString().replace(/\D/g, '');
              if (cleanM && cleanM.length >= 7) sourcedMobiles.add(cleanM);
            }
            if (s.customer_name) sourcedNames.add(s.customer_name.toString().trim().toLowerCase());
            if (s.customerName) sourcedNames.add(s.customerName.toString().trim().toLowerCase());
          });

          const isShiftedToSourcing = (reqId?: string, custNum?: string, custName?: string, mob?: string) => {
            const rId = (reqId || '').toString().trim().toLowerCase();
            const cNum = (custNum || '').toString().trim().toLowerCase();
            const cName = (custName || '').toString().trim().toLowerCase();
            const cMob = (mob || '').toString().replace(/\D/g, '');

            if (rId && sourcedMatchingIds.has(rId)) return true;
            if (cNum && sourcedCustNums.has(cNum)) return true;
            if (cMob && cMob.length >= 7 && sourcedMobiles.has(cMob)) return true;
            if (cName && cName.length > 2 && sourcedNames.has(cName)) return true;
            return false;
          };

          const findActualCostSheet = (reqId?: string, custNum?: string, custName?: string, mob?: string) => {
            return (individualCostSheets || []).find((cs: any) => {
              if (cs.status === 'CONVERTED_TO_VISIT' || cs.status === 'SHIFTED_TO_MATCHING' || cs.status === 'CANCELLED') return false;

              const csCustId = (cs.customerId || cs.customerSnapshot?.customerId || cs.customerSnapshot?.customerNumber || cs.customerNumber || '').toString().trim().toLowerCase();
              const csMatchId = (cs.matchingRequestId || cs.matchId || cs.requestId || '').toString().trim().toLowerCase();
              const csName = (cs.customerName || cs.name || cs.customerSnapshot?.customerName || '').toString().toLowerCase().trim();
              const csMob = (cs.mobile || cs.customerMobile || cs.customerSnapshot?.mobile || cs.customerSnapshot?.alternateMobile || '').toString().replace(/\D/g, '');

              const targetReqId = (reqId || '').toString().trim().toLowerCase();
              const targetCustNum = (custNum || '').toString().trim().toLowerCase();
              const targetName = (custName || '').toString().toLowerCase().trim();
              const targetMob = (mob || '').toString().replace(/\D/g, '');

              if (targetReqId && csMatchId && targetReqId === csMatchId) return true;
              if (targetCustNum && csCustId && targetCustNum === csCustId) return true;
              if (targetMob && csMob && targetMob.length >= 10 && targetMob === csMob) return true;
              if (targetName && csName && targetName.length > 2 && targetName === csName) return true;
              return false;
            });
          };

          matchingRequestsQueue.forEach(r => {
            if (isShiftedToSourcing(r.requestId || r.id, r.customerNumber || r.customerId, r.customerName || r.name, r.mobile)) return;

            const custNum = (r.customerNumber || '').toLowerCase().trim();
            const mob = (r.mobile || '').replace(/\D/g, '');
            if (custNum) seenCustNums.add(custNum);
            if (mob) seenMobiles.add(mob);

            const isPendingExplicit = r.status === 'PENDING' || r.status === 'SHIFTED_TO_MATCHING' || !r.costSheetId;
            const actualCostSheet = isPendingExplicit ? null : findActualCostSheet(r.requestId, r.customerNumber, r.customerName, r.mobile);
            const isCreated = !isPendingExplicit && !!actualCostSheet;

            list.push({
              ...r,
              status: isPendingExplicit ? 'PENDING' : (isCreated ? 'COST_SHEET_CREATED' : (r.status || 'PENDING')),
              costSheetId: isPendingExplicit ? undefined : (actualCostSheet?.costSheetId || r.costSheetId)
            });
          });

          (customers || []).forEach((c, idx) => {
            const custNum = (c.customer_number || c.customer_id || c.id || '').toString().trim();
            const custMob = (c.mobile || c.phone || '').toString().trim();
            const cleanMob = custMob.replace(/\D/g, '');
            const numKey = custNum.toLowerCase().trim();
            const custName = c.name || c.full_name || '';

            const numDigits = (c.id || custNum || '184').toString().replace(/\D/g, '').slice(-6).padStart(6, '0');
            const reqId = `SRM-MAT-2026-${numDigits || String(420 + idx)}`;

            if (isShiftedToSourcing(reqId, custNum, custName, custMob)) return;

            if (!seenCustNums.has(numKey) && (!cleanMob || !seenMobiles.has(cleanMob))) {
              seenCustNums.add(numKey);
              if (cleanMob) seenMobiles.add(cleanMob);

              const actualCostSheet = findActualCostSheet(reqId, custNum, custName, custMob);
              const isCreated = !!actualCostSheet;

              list.push({
                id: reqId,
                requestId: reqId,
                date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '04 Sep 2026',
                customerName: c.name || c.full_name || 'Customer',
                customerNumber: custNum,
                leadId: c.lead_number || `SRM-LEAD-2026-0012${numDigits.slice(-2)}`,
                requirementId: `SRM-REQ-2026-0000${numDigits.slice(-2)}`,
                mobile: custMob,
                email: c.email || `${(c.name || 'customer').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
                purpose: c.investment_purpose || 'Self / End Use',
                propertyType: c.property_type || 'Flat / Apartment',
                configuration: c.configuration || '2BHK',
                budget: c.budget || '₹25,00,000 - ₹50,00,000',
                budget_min: c.budget_min || 2500000,
                budget_max: c.budget_max || 5000000,
                preferredArea: c.preferredArea || c.preferred_location || c.locality || 'Madhyamgram, Kolkata',
                secondaryAreas: c.secondary_areas || '',
                radiusKm: 10,
                possessionStatus: c.possession_status || 'Ready to Move',
                carpetArea: c.carpet_area_min && c.carpet_area_max ? `${c.carpet_area_min} – ${c.carpet_area_max} Sq.Ft.` : '650 – 1000 Sq.Ft.',
                facing: c.facing || 'East Facing',
                parking: c.parking || 'Covered Slot',
                amenities: c.amenities || '24/7 Power Backup, Security',
                completenessScore: c.score || c.quality_score || 90,
                priority: c.priority || 'HOT',
                leadScore: c.score || c.quality_score || 90,
                assignedExecutive: c.assigned_salesperson || 'Abinash Roy (Admin)',
                status: isCreated ? 'COST_SHEET_CREATED' : 'PENDING',
                costSheetId: actualCostSheet?.costSheetId || undefined,
                created_at: c.created_at || new Date().toISOString()
              });
            }
          });

          return list;
        })();

        const pendingRequests = allMatchingRequests.filter(r => !r.costSheetId && r.status !== 'COST_SHEET_CREATED');
        const matchedReq = selectedMatchingId ? allMatchingRequests.find(r => 
          (r.requestId && r.requestId.toLowerCase() === selectedMatchingId.toLowerCase()) || 
          (r.customerNumber && r.customerNumber.toLowerCase() === selectedMatchingId.toLowerCase())
        ) : null;
        const activeMatchingReq = matchedReq || null;

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TOP MATCHING DASHBOARD KPI CARDS (SECTION 19) */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(4, 1fr)' : 'repeat(7, 1fr)', gap: '10px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>MATCHING REQUESTS</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>{allMatchingRequests.length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>PENDING</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fbbf24', marginTop: '2px' }}>{pendingRequests.length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>IN PROGRESS</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>{allMatchingRequests.filter(r => r.status === 'IN_PROGRESS').length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>MATCHED</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#4ade80', marginTop: '2px' }}>{allMatchingRequests.filter(r => r.status === 'MATCHED' || (r.score && r.score >= 80)).length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>SELECTED</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#4ade80', marginTop: '2px' }}>{allMatchingRequests.filter(r => r.status === 'SELECTED' || r.selectedCount > 0).length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>SHARED WITH CUS</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>{costSheetShares.length}</h4>
            </div>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>SITE VISIT REQ</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#22c55e', marginTop: '2px' }}>{scheduledVisits.length}</h4>
            </div>
          </div>

          {/* INBOUND MATCHING REQUESTS SNAPSHOT VAULT (SECTION 20) */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📥 INBOUND MATCHING REQUESTS SNAPSHOT VAULT ({allMatchingRequests.length})</h3>
                <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900' }}>QUALIFIED HANDOFF ACTIVE</span>
              </div>

              {/* VAULT FILTER TOGGLE BUTTONS */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setMatchingVaultFilter('PENDING_ONLY')}
                  style={{ 
                    background: matchingVaultFilter === 'PENDING_ONLY' ? '#fbbf24' : '#0f172a', 
                    color: matchingVaultFilter === 'PENDING_ONLY' ? '#0f172a' : '#94a3b8', 
                    border: '1px solid #fbbf24', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontWeight: '900', 
                    fontSize: '0.75rem', 
                    cursor: 'pointer' 
                  }}
                >
                  ⚡ PENDING COST SHEETS ONLY ({pendingRequests.length})
                </button>
                <button 
                  onClick={() => setMatchingVaultFilter('ALL')}
                  style={{ 
                    background: matchingVaultFilter === 'ALL' ? '#0284c7' : '#0f172a', 
                    color: matchingVaultFilter === 'ALL' ? '#ffffff' : '#94a3b8', 
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontWeight: '900', 
                    fontSize: '0.75rem', 
                    cursor: 'pointer' 
                  }}
                >
                  📋 ALL MATCHING REQUESTS ({allMatchingRequests.length})
                </button>
              </div>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>Matching ID & Date</th>
                    <th style={{ padding: '10px' }}>Customer & Contact</th>
                    <th style={{ padding: '10px' }}>Customer ID</th>
                    <th style={{ padding: '10px' }}>Structured Requirement</th>
                    <th style={{ padding: '10px' }}>Budget</th>
                    <th style={{ padding: '10px' }}>Cost Sheet Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allMatchingRequests
                    .filter(req => (matchingVaultFilter === 'ALL' || (!req.costSheetId && req.status !== 'COST_SHEET_CREATED')) && matchesSearchQuery(req, searchQuery || matchingSearchQuery))
                    .map((req) => {
                      const isCostSheetCreated = !!req.costSheetId;
                      return (
                        <tr key={req.requestId} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: selectedMatchingId === req.requestId ? 'rgba(2, 132, 199, 0.15)' : 'transparent' }}>
                          <td style={{ padding: '10px' }}>
                            <span 
                              onClick={() => openIdDetailsModal(req.requestId, 'MATCHING_ID')}
                              style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}
                              title="Click to view full Matching Request details"
                            >
                              🎯 {req.requestId}
                            </span>
                            <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px', display: 'block' }}>{req.date}</span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{req.customerName}</strong>
                            <br /><span style={{ fontSize: '0.72rem', color: '#4ade80' }}>{req.mobile}</span>
                            {(req.handoffNote || (req.notes && req.notes.includes('[Shifted'))) && (
                              <div style={{ marginTop: '4px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid #fbbf24', borderRadius: '4px', padding: '3px 6px', fontSize: '0.7rem', color: '#fbbf24', fontWeight: '800', width: 'fit-content' }}>
                                📌 Shift Note: {req.handoffNote || (req.notes?.split('\n').pop() || '')}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span 
                              onClick={() => openIdDetailsModal(req.customerNumber, 'CUSTOMER_ID')}
                              style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}
                              title="Click to view full Customer details"
                            >
                              🆔 {req.customerNumber}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ color: '#fbbf24', fontWeight: '800' }}>{req.configuration} {req.propertyType}</span>
                            {(req.propertyCode || req.propCode) && (
                              <div style={{ marginTop: '2px', marginBottom: '2px' }}>
                                <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '900', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block' }}>
                                  🏢 Property Code: {req.propertyCode || req.propCode}
                                </span>
                              </div>
                            )}
                            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>{req.preferredArea} (Radius: {req.radiusKm || 10} KM)</span>
                          </td>
                          <td style={{ padding: '10px', color: '#4ade80', fontWeight: '900' }}>
                            {req.budget}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {isCostSheetCreated ? (
                              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.75rem', display: 'inline-block' }}>
                                🟢 COST SHEET CREATED ({req.costSheetId})
                              </span>
                            ) : (
                              <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24', padding: '2px 8px', borderRadius: '12px', fontWeight: '900', fontSize: '0.75rem', display: 'inline-block' }}>
                                ⚡ PENDING (NO COST SHEET ID)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                              {isCostSheetCreated ? (
                                <button 
                                  onClick={() => {
                                    setActiveTab('cost_sheet_share');
                                    setActiveCostSheetShareSubTab('individual_cost_sheets');
                                    setSearchQuery(req.costSheetId || req.customerNumber);
                                  }} 
                                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  📋 View in Cost Sheet Sharing →
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setSelectedMatchingId(req.requestId);
                                      const cust = customers.find(c => c.customer_number === req.customerNumber || c.name === req.customerName);
                                      if (cust) setSelectedCust(cust);
                                      setSourcingModalRequest(req);
                                      setSourcingReasonInput('');
                                      setSourcingError('');
                                    }} 
                                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}
                                  >
                                    📦 Property Sourcing Request
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedMatchingId(req.requestId);
                                      alert(`⚡ Running automated inventory matcher for ${req.customerName} (${req.requestId})`);
                                    }} 
                                    style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer' }}
                                  >
                                    Run Matcher
                                  </button>
                                </>
                              )}
                              {isStrictSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteMatchingRequest(req)}
                                  title={`Delete / Remove ${req.customerName || req.requestId}`}
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Trash2 size={13} /> Delete
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

          {/* PRIMARY SEARCH MATCHING REQUEST BAR (SECTION 1 & 31) */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap size={22} color="#38bdf8" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>SEARCH MATCHING REQUEST</h3>
                  <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                    Primary Operational ID: Select or enter Matching Request ID (e.g. SRM-MAT-2026-000421).
                  </p>
                </div>
              </div>

              <select 
                value={selectedMatchingId} 
                onChange={(e) => {
                  setSelectedMatchingId(e.target.value);
                  const req = allMatchingRequests.find(r => r.requestId === e.target.value);
                  if (req) {
                    const cust = customers.find(c => c.customer_number === req.customerNumber || c.name === req.customerName);
                    if (cust) setSelectedCust(cust);
                  }
                }} 
                style={{ background: isLight ? '#f8fafc' : '#0f172a', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: '800' }}
              >
                <option value="">-- Select a Matching Request to Open Workspace --</option>
                {allMatchingRequests
                  .filter(req => matchingVaultFilter === 'ALL' || (!req.costSheetId && req.status !== 'COST_SHEET_CREATED'))
                  .map((req) => (
                    <option key={req.requestId} value={req.requestId}>
                      ⚡ {req.requestId} — {req.customerName} ({req.configuration}, {req.preferredArea})
                    </option>
                  ))}
              </select>
            </div>

            {/* SEARCH INPUT BAR */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
              <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '900', display: 'block', marginBottom: '4px' }}>🔍 Search Matching Request (Primary ID: SRM-MAT-2026-000421):</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '6px', padding: '6px 10px' }}>
                <Search size={15} color="#38bdf8" />
                <input 
                  type="text" 
                  value={matchingSearchQuery} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setMatchingSearchQuery(val);
                    if (val.trim()) {
                      const q = val.trim().toLowerCase();
                      const match = allMatchingRequests.find(r => 
                        (r.requestId && r.requestId.toLowerCase().includes(q)) ||
                        (r.customerNumber && r.customerNumber.toLowerCase().includes(q)) ||
                        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
                        (r.mobile && r.mobile.includes(q))
                      );
                      if (match) {
                        setSelectedMatchingId(match.requestId);
                        const cust = customers.find(c => c.customer_number === match.customerNumber || c.name === match.customerName);
                        if (cust) setSelectedCust(cust);
                      }
                    }
                  }} 
                  placeholder="Enter Matching ID (e.g. SRM-MAT-2026-000421), Customer ID, or Phone..." 
                  style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: '0.85rem', width: '100%', fontWeight: '800' }} 
                />
              </div>
            </div>

            {/* MATCHING REQUEST HEADER & LOCKED SNAPSHOT (ONLY WHEN A REQUEST IS SELECTED) */}
            {activeMatchingReq && (
              <>
                {/* MATCHING REQUEST HEADER (SECTION 2 & 21) */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>PRIMARY MATCHING ID</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#38bdf8', fontFamily: 'monospace' }}>{activeMatchingReq.requestId}</h4>
                    <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '800' }}>● MATCHING WORKSPACE ACTIVE</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>CUSTOMER IDENTITY</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{activeMatchingReq.customerName}</h4>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{activeMatchingReq.customerNumber} ({activeMatchingReq.mobile})</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>LINKED REQ & LEAD IDs</span>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#fbbf24', fontFamily: 'monospace' }}>{activeMatchingReq.requirementId || 'SRM-REQ-2026-000094'}</h4>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>{activeMatchingReq.leadId || 'SRM-LEAD-2026-000184'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>CREATED BY & STATUS</span>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{activeMatchingReq.assignedExecutive || 'Priya Nair (Sales Exec)'}</h4>
                    <span style={{ background: activeMatchingReq.status === 'COST_SHEET_CREATED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: activeMatchingReq.status === 'COST_SHEET_CREATED' ? '#4ade80' : '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900' }}>{activeMatchingReq.status}</span>
                  </div>
                </div>

                {/* COST SHEET CREATED & TRANSFERRED NOTIFICATION BANNER */}
                {(activeMatchingReq.status === 'COST_SHEET_CREATED' || activeMatchingReq.costSheetId) && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '0.92rem', margin: 0 }}>
                        🟢 COST SHEET CREATED & TRANSFERRED TO COST SHEET SHARING
                      </h4>
                      <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.78rem', margin: '2px 0 0 0' }}>
                        Cost Sheet ID: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{activeMatchingReq.costSheetId || 'SRM-CS-2026-000145'}</strong> has been generated for customer {activeMatchingReq.customerName}.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('cost_sheet_share');
                        setActiveCostSheetShareSubTab('individual_cost_sheets');
                        setSearchQuery(activeMatchingReq.costSheetId || activeMatchingReq.customerNumber);
                      }} 
                      style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📋 Open in Cost Sheet Sharing →
                    </button>
                  </div>
                )}

                {/* LOCKED CUSTOMER REQUIREMENT SNAPSHOT (SECTION 3 & 24) */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '900' }}>🔒 LOCKED CUSTOMER REQUIREMENT SNAPSHOT FOR {activeMatchingReq.requestId}</span>
                    <span style={{ background: '#334155', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>REQUIREMENT VERSION: {activeMatchingReq.version || 'SNAPSHOT V1'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>Target Property Code:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace', display: 'block', fontWeight: '900' }}>{activeMatchingReq.propertyCode || activeMatchingReq.propCode || 'N/A (Open Re-Rank Search)'}</strong></div>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>Property Type:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{activeMatchingReq.propertyType || 'Apartment / Flat'}</strong></div>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>BHK Config:</span> <strong style={{ color: '#fbbf24', display: 'block' }}>{activeMatchingReq.configuration || '3 BHK'}</strong></div>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>Budget Range:</span> <strong style={{ color: '#4ade80', display: 'block' }}>{activeMatchingReq.budget}</strong></div>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>Preferred Location:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{activeMatchingReq.preferredArea} ({activeMatchingReq.radiusKm || 10} KM)</strong></div>
                    <div><span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>Possession & Facing:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{activeMatchingReq.possessionStatus || 'Ready to Move'} | {activeMatchingReq.facing || 'East Facing'}</strong></div>
                  </div>

                  {/* RUN MATCHER & DELETE BUTTONS (SECTION 4) */}
                  <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                    {isStrictSuperAdmin && (
                      <button onClick={() => handleDeleteMatchingRequest(activeMatchingReq)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trash2 size={15} /> 🗑️ DELETE / REMOVE REQUEST ({activeMatchingReq.requestId})
                      </button>
                    )}
                    <button onClick={() => alert(`⚡ Executed real-time property matching engine for ${activeMatchingReq.requestId} snapshot!`)} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={15} /> ⚡ RUN / RE-RUN MATCHER FOR {activeMatchingReq.requestId}
                    </button>
                  </div>
                </div>

                {/* ALL PROPERTY CODES CREATED FOR THIS CUSTOMER BANNER */}
                {(() => {
                  const usedPropDetails = getCustomerUsedPropertyCodes(
                    activeMatchingReq.customerNumber || activeMatchingReq.customerId,
                    activeMatchingReq.customerName || activeMatchingReq.name,
                    activeMatchingReq.mobile,
                    individualCostSheets,
                    costSheetShares,
                    scheduledVisits
                  );
                  return (
                    <div style={{ background: isLight ? '#f0f9ff' : 'rgba(2, 132, 199, 0.12)', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ color: '#38bdf8', fontWeight: '900', fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🏢 ALL PROPERTY CODES CREATED IN COST SHEETS FOR {activeMatchingReq.customerName.toUpperCase()} ({usedPropDetails.length})
                        </h4>
                        <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                          🔒 EXCLUDED FROM NEW MATCH SUGGESTIONS
                        </span>
                      </div>
                      {usedPropDetails.length === 0 ? (
                        <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: 0, fontStyle: 'italic' }}>
                          No property code has been used for cost sheet creation yet for this customer.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {usedPropDetails.map((item, idx) => (
                            <div key={idx} style={{ background: isLight ? '#ffffff' : '#0f172a', border: '1px solid #eab308', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                              <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: '900' }}>🏢 {item.propertyCode}</span>
                              {item.costSheetId && (
                                <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800', fontSize: '0.72rem' }}>
                                  ({item.costSheetId})
                                </span>
                              )}
                              <span style={{ color: isLight ? '#475569' : '#cbd5e1', fontWeight: '700' }}>— {item.propertyTitle}</span>
                              <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid #eab308', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' }}>
                                CREATED IN COST SHEET
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* IF NO MATCHING REQUEST IS SELECTED, SHOW CLEAN PROMPT; OTHERWISE SHOW MATCHED PROPERTIES & DISPATCHER */}
          {!activeMatchingReq ? (
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                No Matching Request Workspace Active
              </h3>
              <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', maxWidth: '540px', margin: 0 }}>
                Click <strong style={{ color: '#0284c7' }}>"📂 Open Workspace"</strong> or <strong style={{ color: '#22c55e' }}>"Run Matcher"</strong> on any request in the <strong style={{ color: '#22c55e' }}>Inbound Vault above</strong>, or choose a Matching ID from the search bar to inspect customer requirements and matched properties.
              </p>
            </div>
          ) : (
            <>
              {/* MATCHED PROPERTIES RESULTS & TABLE (SECTION 5, 7, 8, 9) */}
              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>🎯 MATCHED PROPERTIES FOR {activeMatchingReq.requestId} ({activeMatchingReq.customerName})</h3>
                    <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>{properties.length} Total Inventory Properties • AI Matching & Manual Lookup Active (Already used property codes are excluded from new suggestions)</p>
                  </div>
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '900', border: '1px solid #22c55e' }}>
                    {selectedPropertyIds.length} PROPERTIES SELECTED
                  </span>
                </div>

            {/* MANUAL PROPERTY SEARCH & MATCH SELECTION CONTROL PANEL */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 MANUAL PROPERTY SEARCH & DIRECT SELECTION (SEARCH BY PROPERTY ID / CODE / NAME)
                </span>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                  SEARCH & FILTER INVENTORY IN REAL-TIME
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search Input Bar */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '8px', padding: '8px 12px' }}>
                  <Search size={16} color="#38bdf8" />
                  <input 
                    type="text" 
                    value={propertySearchQuery} 
                    onChange={(e) => setPropertySearchQuery(e.target.value)} 
                    placeholder="Enter Property Code (e.g. SRM-PROP-2026-000433), Title, or Developer..." 
                    style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: '0.85rem', width: '100%', fontWeight: '800' }} 
                  />
                  {propertySearchQuery && (
                    <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setPropertySearchQuery('')} />
                  )}
                </div>

                {/* Property Dropdown Picker */}
                {(() => {
                  const activeCustUsedProps = activeMatchingReq
                    ? getCustomerUsedPropertyCodes(
                        activeMatchingReq.customerNumber || activeMatchingReq.customerId,
                        activeMatchingReq.customerName || activeMatchingReq.name,
                        activeMatchingReq.mobile,
                        individualCostSheets,
                        costSheetShares,
                        scheduledVisits
                      )
                    : [];
                  const activeCustUsedCodesSet = new Set(activeCustUsedProps.map(p => (p.propertyCode || '').toString().trim().toUpperCase()));

                  return (
                    <select 
                      value="" 
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        if (selectedCode) {
                          if (activeCustUsedCodesSet.has(selectedCode.toUpperCase())) {
                            const usedInfo = activeCustUsedProps.find(p => p.propertyCode.toUpperCase() === selectedCode.toUpperCase());
                            alert(`⚠️ Property Code ${selectedCode} has ALREADY been used for a Cost Sheet for ${activeMatchingReq.customerName} (Cost Sheet ID: ${usedInfo?.costSheetId || 'Active'}). It is excluded from new match suggestions.`);
                            return;
                          }
                          if (!selectedPropertyIds.includes(selectedCode)) {
                            setSelectedPropertyIds([...selectedPropertyIds, selectedCode]);
                            alert(`📌 Selected Property ${selectedCode} for ${activeMatchingReq.customerName}!`);
                          }
                          setPropertySearchQuery(selectedCode);
                        }
                      }}
                      style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', fontWeight: '800', maxWidth: '320px' }}
                    >
                      <option value="">-- Or Quick Select Property Code --</option>
                      {properties.map(p => {
                        const isUsed = activeCustUsedCodesSet.has((p.property_code || '').toString().trim().toUpperCase());
                        return (
                          <option key={p.property_code} value={p.property_code} disabled={isUsed}>
                            {p.property_code} — {p.title} {isUsed ? '🔒 [ALREADY CREATED IN COST SHEET - EXCLUDED]' : `(${p.locality})`}
                          </option>
                        );
                      })}
                    </select>
                  );
                })()}

                {/* Manual Add / Select Button */}
                <button 
                  onClick={() => {
                    if (!propertySearchQuery.trim()) {
                      alert('⚠️ Please enter a Property ID / Code (e.g. SRM-PROP-2026-000433) to search and add manually.');
                      return;
                    }
                    const queryStr = propertySearchQuery.trim().toLowerCase();
                    const matchedProp = properties.find(p => 
                      p && (
                        (p.property_code || '').toString().toLowerCase().includes(queryStr) ||
                        (p.title || '').toString().toLowerCase().includes(queryStr) ||
                        (p.locality || '').toString().toLowerCase().includes(queryStr)
                      )
                    );
                    if (matchedProp) {
                      const activeCustUsedProps = activeMatchingReq
                        ? getCustomerUsedPropertyCodes(
                            activeMatchingReq.customerNumber || activeMatchingReq.customerId,
                            activeMatchingReq.customerName || activeMatchingReq.name,
                            activeMatchingReq.mobile,
                            individualCostSheets,
                            costSheetShares,
                            scheduledVisits
                          )
                        : [];
                      const isUsed = activeCustUsedProps.some(p => p.propertyCode.toUpperCase() === matchedProp.property_code.toUpperCase());
                      if (isUsed) {
                        const usedInfo = activeCustUsedProps.find(p => p.propertyCode.toUpperCase() === matchedProp.property_code.toUpperCase());
                        alert(`⚠️ Property Code ${matchedProp.property_code} has ALREADY been used for a Cost Sheet for ${activeMatchingReq.customerName} (Cost Sheet ID: ${usedInfo?.costSheetId || 'Active'}). Suggestion excluded to prevent duplicate cost sheets.`);
                        return;
                      }
                      if (!selectedPropertyIds.includes(matchedProp.property_code)) {
                        setSelectedPropertyIds([...selectedPropertyIds, matchedProp.property_code]);
                        alert(`📌 Manually added & selected Property ${matchedProp.property_code} (${matchedProp.title}) for ${activeMatchingReq.customerName}!`);
                      } else {
                        alert(`ℹ️ Property ${matchedProp.property_code} is already selected.`);
                      }
                    } else {
                      alert(`❌ No property found matching search query "${propertySearchQuery}". Please check the Property ID.`);
                    }
                  }}
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  ➕ Add / Select Property
                </button>
              </div>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Select</th>
                    <th style={{ padding: '12px' }}>Property Code & Title</th>
                    <th style={{ padding: '12px' }}>Locality & Project</th>
                    <th style={{ padding: '12px' }}>BHK & Area</th>
                    <th style={{ padding: '12px' }}>Final Price</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Match Score</th>
                    <th style={{ padding: '12px' }}>Match Explanation (Why Matched)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Cost Sheet Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const fallbackInventory = [
                      {
                        id: 'PROP-BARASAT-001',
                        property_code: 'SRM-PROP-2026-000426',
                        title: '1 Properties (BARASAT, BANAMALIPUR, BARASAT NEAR ECO HOSPITAL)',
                        locality: 'Barasat / Banamalipur',
                        project: 'TILOTTAMA APPARTMENT',
                        developer: 'Swaramayi Partner Developer',
                        configuration: '3BHK',
                        type: 'Flat / Apartment (New / Builder)',
                        facing: 'East Facing (Poorva)',
                        possession_status: 'Ready to Move',
                        final_price: '₹51,14,880',
                        base_price: '₹48,00,000',
                        area_sqft: '1450 SqFt'
                      },
                      {
                        id: 'PROP-KONDAPUR-002',
                        property_code: 'SRM-PROP-2026-000427',
                        title: 'Aparna Zenon Luxury 3BHK Flat',
                        locality: 'Kondapur / Gachibowli',
                        project: 'Aparna Zenon',
                        developer: 'Aparna Constructions',
                        configuration: '3BHK',
                        type: 'Flat / Apartment (New / Builder)',
                        facing: 'North-East Facing',
                        possession_status: 'Under Construction',
                        final_price: '₹84,00,000',
                        base_price: '₹78,00,000',
                        area_sqft: '1680 SqFt'
                      }
                    ];

                    let displayProps = [...(properties || [])];
                    if (displayProps.length === 0) displayProps = fallbackInventory;
                    if (!displayProps.some(p => p.property_code === 'SRM-PROP-2026-000426')) {
                      displayProps.unshift(fallbackInventory[0]);
                    }

                    const activeCustUsedProps = activeMatchingReq
                      ? getCustomerUsedPropertyCodes(
                          activeMatchingReq.customerNumber || activeMatchingReq.customerId,
                          activeMatchingReq.customerName || activeMatchingReq.name,
                          activeMatchingReq.mobile,
                          individualCostSheets,
                          costSheetShares,
                          scheduledVisits
                        )
                      : [];
                    const activeCustUsedCodesSet = new Set(activeCustUsedProps.map(p => (p.propertyCode || '').toString().trim().toUpperCase()));

                    return displayProps
                      .map(p => {
                        const currentMatchingCust = {
                          ...selectedCust,
                          name: activeMatchingReq.customerName,
                          customer_number: activeMatchingReq.customerNumber,
                          budget: activeMatchingReq.budget,
                          preferredArea: activeMatchingReq.preferredArea,
                          configuration: activeMatchingReq.configuration
                        };
                        const res = calculatePropertyMatchScore(currentMatchingCust, p);
                        let matchVal = res.total;
                        const targetPCode = activeMatchingReq.propertyCode || activeMatchingReq.propCode;
                        if (targetPCode && p.property_code === targetPCode) {
                          matchVal = Math.max(matchVal, 96);
                        }
                        return { ...p, matchTotal: matchVal, breakdown: res.breakdown };
                      })
                    .filter(p => {
                      if (!propertySearchQuery.trim()) return true;
                      const q = propertySearchQuery.trim().toLowerCase();
                      return (p.property_code || '').toString().toLowerCase().includes(q) ||
                        (p.title || '').toString().toLowerCase().includes(q) ||
                        (p.locality || '').toString().toLowerCase().includes(q) ||
                        (p.developer || '').toString().toLowerCase().includes(q) ||
                        (p.configuration || '').toString().toLowerCase().includes(q);
                    })
                    .sort((a, b) => {
                      const aIsUsed = activeCustUsedCodesSet.has((a.property_code || '').toString().trim().toUpperCase());
                      const bIsUsed = activeCustUsedCodesSet.has((b.property_code || '').toString().trim().toUpperCase());
                      if (!aIsUsed && bIsUsed) return -1;
                      if (aIsUsed && !bIsUsed) return 1;

                      const aIsSelected = selectedPropertyIds.includes(a.property_code);
                      const bIsSelected = selectedPropertyIds.includes(b.property_code);
                      if (aIsSelected && !bIsSelected) return -1;
                      if (!aIsSelected && bIsSelected) return 1;
                      return b.matchTotal - a.matchTotal;
                    })
                    .map((p) => {
                      const pct = p.matchTotal;
                      const isChecked = selectedPropertyIds.includes(p.property_code);
                      const isUsedInCostSheet = activeCustUsedCodesSet.has((p.property_code || '').toString().trim().toUpperCase());
                      const usedObj = activeCustUsedProps.find(up => up.propertyCode.toUpperCase() === (p.property_code || '').toString().trim().toUpperCase());

                      return (
                        <tr key={p.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isUsedInCostSheet ? 'rgba(239, 68, 68, 0.08)' : isChecked ? 'rgba(2, 132, 199, 0.15)' : 'transparent' }}>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              disabled={isUsedInCostSheet}
                              title={isUsedInCostSheet ? "Property code already used for a Cost Sheet for this customer (Excluded)" : ""}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPropertyIds([...selectedPropertyIds, p.property_code]);
                                } else {
                                  setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== p.property_code));
                                }
                              }} 
                              style={{ width: '18px', height: '18px', cursor: isUsedInCostSheet ? 'not-allowed' : 'pointer', opacity: isUsedInCostSheet ? 0.5 : 1 }} 
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.78rem' }}>{p.property_code}</span>
                              {(() => {
                                const st = getDynamicPropertyStatus(p);
                                return (
                                  <span style={{ 
                                    background: st.bg, 
                                    color: st.color, 
                                    border: `1px solid ${st.border}`, 
                                    padding: '1px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.65rem', 
                                    fontWeight: '900' 
                                  }}>
                                    {st.label}
                                  </span>
                                );
                              })()}
                              {isChecked && (
                                <span style={{ background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' }}>
                                  📌 SELECTED
                                </span>
                              )}
                              {isUsedInCostSheet && (
                                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' }}>
                                  🚫 COST SHEET ALREADY CREATED (EXCLUDED)
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', marginTop: '2px' }}>{p.title}</h4>
                            <span style={{ fontSize: '0.68rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '1px 6px', borderRadius: '4px', fontWeight: '800', display: 'inline-block', marginTop: '2px' }}>
                              🏢 {p.property_type || p.type || 'Flat / Apartment'}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{p.locality}</strong>
                            <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{p.developer}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: '#fbbf24', fontWeight: '800' }}>{p.configuration}</span>
                            <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{p.carpet_area}</span>
                          </td>
                          <td style={{ padding: '12px', color: '#4ade80', fontWeight: '900', fontSize: '0.95rem' }}>
                            {p.final_price}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: pct >= 85 ? 'rgba(34, 197, 94, 0.2)' : pct >= 70 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: pct >= 85 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#ef4444', padding: '4px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem' }}>
                              {pct >= 85 ? '🔥' : pct >= 70 ? '⚡' : '❄️'} {pct}% MATCH
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {/* MATCH EXPLANATION (ALL 7 CRITERIA BREAKDOWN WITH ACHIEVED%/MAX% MATCH FORMATTING) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: pct >= 85 ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : pct >= 70 ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '0.78rem', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                  🎯 {pct}% / 100% OVERALL MATCH
                                </span>
                                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>
                                  {pct >= 85 ? 'High Precision 7-Criteria Match' : pct >= 70 ? 'Good Compatibility' : 'Partial Criteria Match'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', fontSize: '0.68rem' }}>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.bud === 25 ? '#22c55e' : '#ef4444'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.bud === 25 ? '#4ade80' : '#ef4444', fontWeight: '700' }}>
                                  {p.breakdown.bud === 25 ? '✓' : '✗'} Budget Range ({p.breakdown.bud}%/25% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.loc >= 15 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.loc >= 15 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Location ({p.breakdown.loc}%/20% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.bhk >= 12 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.bhk >= 12 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ BHK Config ({p.breakdown.bhk}%/15% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.sqft >= 10 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.sqft >= 10 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Sq.Ft Area ({p.breakdown.sqft}%/15% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.possession_facing >= 7 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.possession_facing >= 7 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Possession & Facing ({p.breakdown.possession_facing}%/10% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.floor_pref >= 4 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.floor_pref >= 4 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Floor Preference ({p.breakdown.floor_pref}%/5% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.type >= 4 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.type >= 4 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Category Type ({p.breakdown.type}%/5% match)
                                </span>
                                <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: `1px solid ${p.breakdown.condition >= 3 ? '#22c55e' : '#fbbf24'}`, padding: '2px 6px', borderRadius: '4px', color: p.breakdown.condition >= 3 ? '#4ade80' : '#fbbf24', fontWeight: '700' }}>
                                  ✓ Condition ({p.breakdown.condition}%/5% match)
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {isUsedInCostSheet ? (
                              <button 
                                onClick={() => {
                                  setActiveTab('cost_sheet_share');
                                  setActiveCostSheetShareSubTab('individual_cost_sheets');
                                  setSearchQuery(usedObj?.costSheetId || p.property_code);
                                }} 
                                style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', border: '1px solid #eab308', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                              >
                                🔒 Cost Sheet Created ({usedObj?.costSheetId || 'View'}) →
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRowLevelCreateCostSheet(p)} 
                                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                              >
                                📄 Create Cost Sheet ID
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* FIXED SELECTED PROPERTY SUMMARY PANEL & DISPATCHER */}
          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #0284c7', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', bottom: '10px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase' }}>
                  📌 PROPERTY SELECTION WORKSPACE & DISPATCHER
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '2px' }}>
                  {selectedPropertyIds.length} PROPERTIES SELECTED FOR {activeMatchingReq.customerName.toUpperCase()} ({activeMatchingReq.requestId})
                </h3>
              </div>

              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontWeight: '900', fontSize: '0.78rem', border: '1px solid #22c55e' }}>
                ✓ {selectedPropertyIds.length} PROPERTIES READY TO DISPATCH
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedPropertyIds.length === 0 ? (
                <span style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                  No properties selected yet. Select property checkboxes above or click "Add/Select Property" to add properties to workspace.
                </span>
              ) : (
                selectedPropertyIds.map((code, idx) => (
                  <div key={idx} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{code}</span>
                    <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700' }}>{properties.find(p => p.property_code === code)?.title || code}</span>
                    <X size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== code))} />
                  </div>
                ))
              )}
            </div>

            {/* SELECTION ACTION BUTTON - ONE PROPERTY = ONE COST SHEET */}
            <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  if (selectedPropertyIds.length === 0) {
                    alert('⚠️ Please select at least one property using the checkboxes to create individual Cost Sheets.');
                    return;
                  }
                  if (selectedPropertyIds.length === 1) {
                    const singleProp = properties.find(p => p.property_code === selectedPropertyIds[0]) || properties[0];
                    handleRowLevelCreateCostSheet(singleProp);
                  } else {
                    handleBulkCreateCostSheets();
                  }
                }} 
                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)' }}
              >
                📄 CREATE INDIVIDUAL COST SHEETS ({selectedPropertyIds.length} SELECTED) & SEND TO SHARING
              </button>
              </div>
            </div>
          </>
        )}

        </div>
        );
      })()}

      {/* SUB-TAB 2: REQUIREMENT VS INVENTORY MATRIX */}
      {activeMatchingSubTab === 'req_inventory_matrix' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📋 Customer Requirements vs Stock Inventory Availability Matrix</h3>
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {['Kondapur', 'Gachibowli', 'Financial District', 'Hitec City'].map((loc, i) => (
              <div key={i} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ color: '#38bdf8', fontWeight: '800' }}>📍 {loc} Sector</h4>
                <p style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>Matching Inventory: 12 Units Available</p>
                <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '800', marginTop: '8px', display: 'block' }}>🟢 95% High Demand Alignment</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PORTFOLIO DISPATCHER */}
      {activeMatchingSubTab === 'portfolio_dispatcher' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📤 Multi-Channel Property Recommendation Portfolio Dispatcher</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => alert(`📲 WhatsApp Portfolio dispatched to ${selectedCust.name} (${selectedCust.mobile})`)} style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
              📲 Dispatch via WhatsApp
            </button>
            <button onClick={() => alert(`📧 Email Portfolio dispatched to ${selectedCust.email}`)} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
              📧 Dispatch via Email
            </button>
          </div>
        </div>
      )}

      {/* PROPERTY SOURCING REQUEST MESSAGE CONTAINER MODAL */}
      {sourcingModalRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(2, 132, 199, 0.15)', padding: '8px', borderRadius: '8px' }}>
                  <SearchCode size={22} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                    MOVE CUSTOMER TO PROPERTY SOURCING REQUEST
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    Enforced Sourcing Reason Protocol • Mandatory Message Check
                  </span>
                </div>
              </div>
              <X size={20} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => { setSourcingModalRequest(null); setSourcingError(''); }} />
            </div>

            {/* CUSTOMER & MATCHING SNAPSHOT */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.92rem' }}>
                  👤 {sourcingModalRequest.customerName}
                </strong>
                <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', fontSize: '0.76rem', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                  {sourcingModalRequest.requestId}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Customer ID:</span> <strong style={{ color: '#4ade80', fontFamily: 'monospace' }}>{sourcingModalRequest.customerNumber}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Mobile Phone:</span> <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{sourcingModalRequest.mobile || sourcingModalRequest.customerPhone || 'N/A'}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Requirement:</span> <strong style={{ color: '#fbbf24' }}>{sourcingModalRequest.configuration} {sourcingModalRequest.propertyCategory || 'Flat'}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Target Budget:</span> <strong style={{ color: '#4ade80' }}>{sourcingModalRequest.budget || `${sourcingModalRequest.budget_min || ''} - ${sourcingModalRequest.budget_max || ''}`}</strong></div>
              </div>
            </div>

            {/* MANDATORY MESSAGE INPUT AREA */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '900', display: 'block', marginBottom: '6px' }}>
                📝 Why are you sending this customer into Property Sourcing Request? * (Mandatory)
              </label>
              <p style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', margin: '0 0 8px 0' }}>
                Without entering a valid message, customer details cannot move to the Property Sourcing Request section.
              </p>
              <textarea
                rows={4}
                value={sourcingReasonInput}
                onChange={(e) => {
                  setSourcingReasonInput(e.target.value);
                  if (e.target.value.trim()) setSourcingError('');
                }}
                placeholder="Enter reason (e.g. Current inventory doesn't match client's exact floor / facing requirement; requesting off-market builder sourcing for 2BHK in Madhamgram)..."
                style={{
                  width: '100%',
                  background: isLight ? '#ffffff' : '#0f172a',
                  border: sourcingError ? '2px solid #ef4444' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                  color: isLight ? '#0f172a' : '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {sourcingError && (
                <div style={{ color: '#ef4444', fontSize: '0.76rem', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ {sourcingError}
                </div>
              )}
            </div>

            {/* MODAL ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => { setSourcingModalRequest(null); setSourcingError(''); }}
                style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmMoveToSourcing()}
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)' }}
              >
                🚀 Confirm & Send to Property Sourcing Desk
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
