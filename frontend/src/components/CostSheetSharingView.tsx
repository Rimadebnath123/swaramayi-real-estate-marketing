import React from 'react';
import { Share2, Plus, Trash2, Printer, Search, Eye, Clock, Calendar, CheckCircle2, MessageSquare, AlertCircle, X, LayoutGrid, List } from 'lucide-react';
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
  setSearchQuery?: (val: string) => void;
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
  setUpdateReqForm?: (val: any) => void;
  setShowUpdateRequirementModal?: (val: any) => void;
}

const formatDisplayDateTime = (raw: any): string => {
  if (!raw || raw === 'Just Now') return raw || 'Just Now';
  if (typeof raw === 'string' && !raw.includes('T') && !raw.endsWith('Z') && (raw.includes('AM') || raw.includes('PM'))) {
    return raw;
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return String(raw);
};

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
  setSearchQuery,
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
  setUpdateReqForm,
  setShowUpdateRequirementModal,
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin;

  const isMobile = (windowWidth || 1024) <= 768;
  const isSmallMobile = (windowWidth || 1024) <= 480;

  const [viewMode, setViewMode] = React.useState<'auto' | 'cards' | 'table'>('auto');
  const effectiveView = viewMode === 'auto' ? (isMobile ? 'cards' : 'table') : viewMode;

  const handleDeleteSingle = (item: any, custName: string) => {
    if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Cost Sheet record ${item.costSheetId} for ${custName}? It will be moved to Recycle Bin.`)) {
      if (onRecycleItem) {
        onRecycleItem({
          id: item.id || item.costSheetId || `CS-${Date.now()}`,
          title: `Cost Sheet - ${custName} (${item.costSheetId})`,
          category: 'Cost Sheet',
          originalLocation: 'Cost Sheet Sharing Engine',
          details: `Project: ${item.propertySnapshot?.title || item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || item.propertyTitle || 'N/A'}, Total: ${item.formattedPriceBreakup?.totalEstimatedCostStr || item.grandTotalFormatted || 'N/A'}`,
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
        setSelectedCostSheetIds(prev => prev.filter(id => id !== item.costSheetId && id !== item.id));
        localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCostSheets));
      } catch (e) {}

      if (syncAllToMongoDB) {
        syncAllToMongoDB({
          cost_sheets: updatedCostSheets
        });
      }
      alert(`🗑️ Cost Sheet ${item.costSheetId} moved to Recycle Bin.`);
    }
  };

  const handleDeleteGroup = (group: any, custName: string) => {
    const groupSheetIds = group.items.map((it: any) => it.costSheetId);
    if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete all ${group.items.length} Cost Sheet records for ${custName}? They will be moved to Recycle Bin.`)) {
      if (onRecycleItem) {
        group.items.forEach((it: any) => {
          onRecycleItem({
            id: it.id || it.costSheetId || `CS-${Date.now()}`,
            title: `Cost Sheet - ${custName} (${it.costSheetId})`,
            category: 'Cost Sheet',
            originalLocation: 'Cost Sheet Sharing Engine',
            details: `Project: ${it.propertySnapshot?.title || it.propertySnapshot?.propertyTitle || it.propertySnapshot?.projectName || it.propertyTitle || 'N/A'}, Total: ${it.formattedPriceBreakup?.totalEstimatedCostStr || it.grandTotalFormatted || 'N/A'}`,
            originalData: it
          });
        });
      }
      const updatedCostSheets = (individualCostSheets || []).filter((c: any) => 
        !groupSheetIds.includes(c.costSheetId) && (!c.id || !groupSheetIds.includes(c.id))
      );
      if (setIndividualCostSheets) {
        setIndividualCostSheets(updatedCostSheets);
      }
      try {
        setSelectedCostSheetIds(prev => prev.filter(id => !groupSheetIds.includes(id)));
        localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCostSheets));
      } catch (e) {}

      if (syncAllToMongoDB) {
        syncAllToMongoDB({ cost_sheets: updatedCostSheets });
      }
      alert(`🗑️ All ${group.items.length} Cost Sheets for ${custName} moved to Recycle Bin.`);
    }
  };

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
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    return [];
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

  // Customer Filter State ('ALL' or a customer identifier key)
  const [selectedCustomerFilter, setSelectedCustomerFilter] = React.useState<string>('ALL');

  // Selected Cost Sheets IDs for deletion & bulk actions
  const [selectedCostSheetIds, setSelectedCostSheetIds] = React.useState<string[]>([]);

  // Unique list of customers extracted from all individualCostSheets
  const costSheetCustomers = React.useMemo(() => {
    const map = new Map<string, { key: string; name: string; mobile: string; customerId: string; count: number }>();
    (individualCostSheets || []).forEach((item: any) => {
      const custId = item.customerId || item.customerSnapshot?.customerNumber || item.customerSnapshot?.customerId || '';
      const custMob = item.customerSnapshot?.mobile || item.mobile || '';
      const cleanMob = custMob ? custMob.replace(/\D/g, '') : '';
      const name = item.customerSnapshot?.customerName || item.customerName || 'Customer';
      const key = custId || cleanMob || name;
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { key, name, mobile: custMob, customerId: custId, count: 1 });
      } else {
        map.get(key)!.count += 1;
      }
    });
    return Array.from(map.values());
  }, [individualCostSheets]);

  const selectedCustomerObj = React.useMemo(() => {
    if (selectedCustomerFilter === 'ALL') return null;
    return costSheetCustomers.find(c => c.key === selectedCustomerFilter) || null;
  }, [selectedCustomerFilter, costSheetCustomers]);

  // Master filtered list of cost sheets respecting customer filter, status filter, and search
  const filteredCostSheets = React.useMemo(() => {
    return displayedCostSheets.filter((item: any) => {
      // 1. Customer Filter
      if (selectedCustomerFilter !== 'ALL') {
        const custId = item.customerId || item.customerSnapshot?.customerNumber || item.customerSnapshot?.customerId || '';
        const custMob = item.customerSnapshot?.mobile || item.mobile || '';
        const cleanMob = custMob ? custMob.replace(/\D/g, '') : '';
        const name = item.customerSnapshot?.customerName || item.customerName || '';
        const key = custId || cleanMob || name;
        if (key !== selectedCustomerFilter) return false;
      }

      // 2. Search Filter: prioritize individualCostSheetsSearch; if empty and searchQuery exists, check searchQuery
      const localQuery = (individualCostSheetsSearch || '').trim();
      if (localQuery) {
        return matchesSearchQuery(item, localQuery);
      }
      const globalQuery = (searchQuery || '').trim();
      if (globalQuery) {
        return matchesSearchQuery(item, globalQuery);
      }

      return true;
    });
  }, [displayedCostSheets, selectedCustomerFilter, individualCostSheetsSearch, searchQuery, matchesSearchQuery]);

  // Group cost sheets by customer when customer has more than 1 cost sheet (display like Visit Scheduler)
  const groupedCostSheets = React.useMemo(() => {
    const groups: Array<{
      groupKey: string;
      customerKey: string;
      items: any[];
    }> = [];

    const map = new Map<string, typeof groups[0]>();

    filteredCostSheets.forEach((item: any) => {
      const itemCustId = item.customerId || item.customerSnapshot?.customerNumber || item.customerSnapshot?.customerId || '';
      const itemCustMob = item.customerSnapshot?.mobile || item.mobile || '';
      const cleanMob = itemCustMob ? itemCustMob.replace(/\D/g, '') : '';
      const name = item.customerSnapshot?.customerName || item.customerName || '';
      const matchId = item.matchId || item.matchingId || '';

      const customerKey = itemCustId || (cleanMob.length >= 7 ? cleanMob : '') || matchId || name || item.costSheetId;

      if (!map.has(customerKey)) {
        const newGroup = {
          groupKey: customerKey,
          customerKey,
          items: [item]
        };
        map.set(customerKey, newGroup);
        groups.push(newGroup);
      } else {
        map.get(customerKey)!.items.push(item);
      }
    });

    return groups;
  }, [filteredCostSheets]);

  // Bulk Delete Selected Cost Sheets
  const handleDeleteSelectedCostSheets = () => {
    if (selectedCostSheetIds.length === 0) return;
    const count = selectedCostSheetIds.length;
    if (!window.confirm(`⚠️ CONFIRM BULK DELETION:\n\nAre you sure you want to delete ${count} selected Cost Sheet(s)?\n\nThey will be moved to the Recycle Bin and removed from MongoDB database.`)) {
      return;
    }

    const itemsToDelete = (individualCostSheets || []).filter((c: any) => 
      selectedCostSheetIds.includes(c.costSheetId) || (c.id && selectedCostSheetIds.includes(c.id))
    );

    if (onRecycleItem) {
      itemsToDelete.forEach((item: any) => {
        onRecycleItem({
          id: item.id || item.costSheetId || `CS-${Date.now()}`,
          title: `Cost Sheet - ${item.customerSnapshot?.customerName || item.customerName || 'Customer'} (${item.costSheetId})`,
          category: 'Cost Sheet',
          originalLocation: 'Cost Sheet Sharing Engine',
          details: `Project: ${item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || item.propertyTitle || 'N/A'}, Total: ${item.formattedPriceBreakup?.totalEstimatedCostStr || 'N/A'}`,
          originalData: item
        });
      });
    }

    const remaining = (individualCostSheets || []).filter((c: any) => 
      !selectedCostSheetIds.includes(c.costSheetId) && (!c.id || !selectedCostSheetIds.includes(c.id))
    );

    if (setIndividualCostSheets) {
      setIndividualCostSheets(remaining);
    }
    setSelectedCostSheetIds([]);

    try {
      localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(remaining));
    } catch (e) {}

    if (syncAllToMongoDB) {
      syncAllToMongoDB({ cost_sheets: remaining });
    }

    alert(`🗑️ ${count} Cost Sheet(s) successfully deleted and moved to Recycle Bin.`);
  };

  const sendCostSheetWhatsApp = (item: any) => {
    if (!item) {
      alert('⚠️ Cost sheet data is missing.');
      return;
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

    const localityStr = item.propertySnapshot?.localityHub || item.propertySnapshot?.locality || item.propertySnapshot?.city || matchedProp?.locality || 'Locality Hub';
    const bhkStr = item.propertySnapshot?.configuration || item.propertySnapshot?.bhk || matchedProp?.configuration || matchedProp?.bhk || 'Standard Unit';
    const superBuiltStr = item.propertySnapshot?.superBuiltupArea || item.propertySnapshot?.super_builtup_area || matchedProp?.super_builtup_area || '1,283 Sq.Ft.';
    const basePriceNum = item.pricingSnapshot?.basePrice || (item.formattedPriceBreakup?.basePriceStr ? parseFloat(String(item.formattedPriceBreakup.basePriceStr).replace(/,/g, '').replace(/[^\d.]/g, '')) : 0) || item.base_price || matchedProp?.final_price || matchedProp?.base_price || 0;
    const superAreaNum = parseFloat(String(superBuiltStr).replace(/,/g, '').replace(/[^\d.]/g, '')) || 0;
    const computedRateSqft = (basePriceNum > 0 && superAreaNum > 0) ? Math.round(basePriceNum / superAreaNum) : (item.pricingSnapshot?.ratePerSqft || 0);
    const rateSqftStr = computedRateSqft > 0 ? `₹${computedRateSqft.toLocaleString('en-IN')}/Sq.Ft.` : (item.formattedPriceBreakup?.ratePerSqftStr || 'N/A');
    const basePriceStr = item.formattedPriceBreakup?.basePriceStr || (basePriceNum ? `₹${Number(basePriceNum).toLocaleString('en-IN')}` : 'N/A');
    const totalEstNum = item.pricingSnapshot?.totalEstimatedCost || item.pricingSnapshot?.grandTotal || item.final_estimated_price || item.totalEstimatedCost || matchedProp?.final_estimated_price;
    const totalEstStr = item.formattedPriceBreakup?.totalEstimatedCostStr || item.formattedPriceBreakup?.grandTotalStr || item.formattedPriceBreakup?.allInclusiveTotalStr || (totalEstNum ? `₹${Number(totalEstNum).toLocaleString('en-IN')}` : 'N/A');

    const waMsg = `Hello ${custName},\n\nGreetings from Swaramayi Real Estate Marketing! 🏡\n\nHere is your official Property Cost Sheet Breakdown & Investment Summary:\n\n📄 Cost Sheet ID: ${item.costSheetId} (${item.version || 'V01'})\n📍 Locality: ${localityStr}\n📐 Configuration: ${bhkStr}\n📐 Super Built-Up Area: ${superBuiltStr}\n🏷️ Asking Rate per Sq.Ft.: ${rateSqftStr}\n\n💰 Price Breakdown:\n• Asking Base Price: ${basePriceStr}\n• Total Estimated Cost (Incl. Taxes & Charges): ${totalEstStr}\n\n📋 Itemized official cost sheet summary is included above.\n\nPlease review the details. Reply to schedule a site visit or ask any questions!\n\nThank you,\nSwaramayi Real Estate Team`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    if (setIndividualCostSheets) {
      setIndividualCostSheets((prev: any[]) => {
        const updated = prev.map(c => c.costSheetId === item.costSheetId ? { ...c, status: 'SENT_TO_CUSTOMER' } : c);
        try {
          localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updated));
        } catch (e) {}
        if (syncAllToMongoDB) {
          syncAllToMongoDB({ cost_sheets: updated });
        }
        return updated;
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
      
      {/* SUB-NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
        <button 
          onClick={() => setLocalCostSheetSubTab('active_cost_sheets')} 
          style={{ flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', padding: isMobile ? '8px 10px' : '8px 18px', borderRadius: '8px', fontSize: isMobile ? '0.78rem' : '0.85rem', fontWeight: '800', cursor: 'pointer', background: localCostSheetSubTab === 'active_cost_sheets' ? '#0284c7' : (isLight ? '#f1f5f9' : '#1e293b'), color: localCostSheetSubTab === 'active_cost_sheets' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          📄 Active Cost Sheets ({displayedCostSheets.length})
        </button>
        <button 
          onClick={() => setLocalCostSheetSubTab('need_to_followup')} 
          style={{ flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', padding: isMobile ? '8px 10px' : '8px 18px', borderRadius: '8px', fontSize: isMobile ? '0.78rem' : '0.85rem', fontWeight: '800', cursor: 'pointer', background: localCostSheetSubTab === 'need_to_followup' ? '#0284c7' : (isLight ? '#f1f5f9' : '#1e293b'), color: localCostSheetSubTab === 'need_to_followup' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          📌 Need to Followup ({localCostSheetFollowups.length})
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVE COST SHEETS */}
      {localCostSheetSubTab === 'active_cost_sheets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>

          {/* SEARCH & STATUS / CUSTOMER FILTER STRIP */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: isMobile ? '10px' : '12px', padding: isMobile ? '12px' : '16px', display: 'flex', gap: isMobile ? '10px' : '14px', alignItems: 'stretch', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 240px', minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '6px 12px' }}>
              <Search size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
              <input 
                type="text" 
                value={individualCostSheetsSearch} 
                onChange={(e) => setIndividualCostSheetsSearch(e.target.value)} 
                placeholder={isMobile ? "Search Cost Sheet, Customer, Property..." : "Search Cost Sheet ID (e.g. COST-SHEET-2026-000001), Customer Name, Match ID, or Property..."} 
                style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: '0.85rem', width: '100%', fontWeight: '700' }} 
              />
              {individualCostSheetsSearch && (
                <button
                  onClick={() => setIndividualCostSheetsSearch('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                  title="Clear local search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter by Customer */}
            <div style={{ flex: isMobile ? '1 1 100%' : 'none', display: 'flex', flexDirection: isSmallMobile ? 'column' : 'row', alignItems: isSmallMobile ? 'flex-start' : 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', whiteSpace: 'nowrap' }}>Filter Customer:</span>
              <select 
                value={selectedCustomerFilter} 
                onChange={(e) => {
                  setSelectedCustomerFilter(e.target.value);
                  setSelectedCostSheetIds([]);
                }} 
                style={{ width: isMobile ? '100%' : 'auto', background: isLight ? '#f8fafc' : '#0f172a', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800', maxWidth: isMobile ? '100%' : '240px' }}
              >
                <option value="ALL">👥 All Customers ({costSheetCustomers.length})</option>
                {costSheetCustomers.map((c) => (
                  <option key={c.key} value={c.key}>
                    👤 {c.name} ({c.count} Cost Sheet{c.count > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div style={{ flex: isMobile ? '1 1 100%' : 'none', display: 'flex', flexDirection: isSmallMobile ? 'column' : 'row', alignItems: isSmallMobile ? 'flex-start' : 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', whiteSpace: 'nowrap' }}>Filter Status:</span>
              <select 
                value={individualCostSheetsStatusFilter} 
                onChange={(e) => setIndividualCostSheetsStatusFilter(e.target.value)} 
                style={{ width: isMobile ? '100%' : 'auto', background: isLight ? '#f8fafc' : '#0f172a', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }}
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

            {/* Global Search clear pill if active */}
            {searchQuery && !individualCostSheetsSearch && (
              <button
                onClick={() => {
                  if (setSearchQuery) setSearchQuery('');
                }}
                style={{ width: isMobile ? '100%' : 'auto', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                title="Clear navbar search filter to show all cost sheets"
              >
                <X size={14} /> Clear Navbar Filter: "{searchQuery}"
              </button>
            )}
          </div>

          {/* ACTIVE CUSTOMER DETAILS BANNER (RESPECT OF CUSTOMER) */}
          {selectedCustomerFilter !== 'ALL' && selectedCustomerObj && (
            <div style={{ background: isLight ? '#f0f9ff' : 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '10px', padding: isMobile ? '10px 12px' : '10px 16px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <div>
                  <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '0.85rem' }}>Customer: </span>
                  <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.92rem' }}>{selectedCustomerObj.name}</strong>
                  {selectedCustomerObj.mobile && (
                    <span style={{ color: '#4ade80', fontSize: '0.82rem', marginLeft: '8px', fontFamily: 'monospace' }}>({selectedCustomerObj.mobile})</span>
                  )}
                  {selectedCustomerObj.customerId && (
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '6px', fontFamily: 'monospace' }}>[{selectedCustomerObj.customerId}]</span>
                  )}
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', marginLeft: '10px', display: 'inline-block', marginTop: '2px' }}>
                    {selectedCustomerObj.count} Cost Sheet{selectedCustomerObj.count > 1 ? 's' : ''} on Record
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCustomerFilter('ALL');
                  setSelectedCostSheetIds([]);
                }} 
                style={{ width: isMobile ? '100%' : 'auto', background: 'transparent', border: '1px solid #0284c7', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', textAlign: 'center' }}
              >
                Show All Customers
              </button>
            </div>
          )}

          {/* BULK ACTION BAR WHEN COST SHEETS ARE SELECTED */}
          {selectedCostSheetIds.length > 0 && (
            <div style={{
              background: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              padding: isMobile ? '10px 12px' : '12px 18px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexWrap: 'wrap',
              gap: '10px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>☑️</span>
                <span style={{ fontWeight: '800', color: isLight ? '#991b1b' : '#fca5a5' }}>
                  <strong>{selectedCostSheetIds.length}</strong> Cost Sheet{selectedCostSheetIds.length > 1 ? 's' : ''} Selected
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                <button
                  onClick={() => setSelectedCostSheetIds([])}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    background: 'transparent',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                    color: isLight ? '#475569' : '#cbd5e1',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}
                >
                  Deselect All
                </button>
                <button
                  onClick={handleDeleteSelectedCostSheets}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '900',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Trash2 size={14} /> Delete Selected ({selectedCostSheetIds.length})
                </button>
              </div>
            </div>
          )}

          {/* MASTER INDIVIDUAL COST SHEETS VAULT */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                  📄 Master Individual Cost Sheets Vault ({filteredCostSheets.length}{filteredCostSheets.length !== displayedCostSheets.length ? ` of ${displayedCostSheets.length}` : ''} Records)
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                  ● ONE PROPERTY = ONE COST SHEET ENFORCED
                </span>
                <div style={{ display: 'flex', background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    style={{
                      background: effectiveView === 'cards' ? '#0284c7' : 'transparent',
                      color: effectiveView === 'cards' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Card Layout (Optimized for Mobile/Touch)"
                  >
                    <LayoutGrid size={12} /> Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    style={{
                      background: effectiveView === 'table' ? '#0284c7' : 'transparent',
                      color: effectiveView === 'table' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Table Layout (Spreadsheet Master View)"
                  >
                    <List size={12} /> Table
                  </button>
                </div>
              </div>
            </div>

            {displayedCostSheets.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #ef4444' }}>
                <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO INDIVIDUAL COST SHEETS FOUND</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  Select properties in Matched Properties workspace and click "Create Cost Sheet ID" or "Create Cost Sheets for All Selected".
                </p>
              </div>
            ) : filteredCostSheets.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #eab308' }}>
                <Search size={32} color="#eab308" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>🔍 NO MATCHING COST SHEETS</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  No cost sheets match your current customer filter or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCustomerFilter('ALL');
                    setIndividualCostSheetsSearch('');
                    if (setSearchQuery) setSearchQuery('');
                  }}
                  style={{ marginTop: '12px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : effectiveView === 'cards' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                {groupedCostSheets.map((group: any, gIdx: number) => {
                  // CASE 1: Single Cost Sheet Card
                  if (group.items.length <= 1) {
                    const item = group.items[0];
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
                    const custNum = item.customerId || item.customerSnapshot?.customerNumber || matchedCust?.customer_number || '';

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
                    const createdAtStr = formatDisplayDateTime(item.createdAt || item.created_at || 'Just Now');
                    const createdByStr = (() => {
                      const cb = item.createdBy || item.created_by;
                      if (cb) return cb;
                      const as = item.customerSnapshot?.assignedSalesperson;
                      if (as) return as;
                      return 'Avishek Das (Super Admin)';
                    })();

                    const usedProps = getCustomerUsedPropertyCodes(
                      custNum,
                      custName,
                      custMobile,
                      individualCostSheets
                    );

                    const isChecked = selectedCostSheetIds.includes(item.costSheetId);

                    return (
                      <div
                        key={item.costSheetId || gIdx}
                        style={{
                          background: isLight ? '#f8fafc' : '#0f172a',
                          border: isChecked ? '2px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                          borderRadius: '12px',
                          padding: isMobile ? '12px' : '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.2)',
                          boxSizing: 'border-box',
                          width: '100%',
                          minWidth: 0
                        }}
                      >
                        {/* Top Row: Checkbox, ID, Version, Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCostSheetIds(prev => [...prev, item.costSheetId]);
                                } else {
                                  setSelectedCostSheetIds(prev => prev.filter(id => id !== item.costSheetId));
                                }
                              }}
                              style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                              title={`Select Cost Sheet ${item.costSheetId}`}
                            />
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.88rem' }}>
                              {item.costSheetId}
                            </span>
                            <span style={{ background: item.versionNumber > 1 ? '#fbbf24' : '#0284c7', color: '#0f172a', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900' }}>
                              {item.version || 'V01'}
                            </span>
                          </div>

                          <span style={{
                            background: statusStr === 'GENERATED' ? 'rgba(56, 189, 248, 0.2)' : statusStr === 'SENT_TO_CUSTOMER' ? 'rgba(34, 197, 94, 0.2)' : statusStr === 'REVISED' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                            color: statusStr === 'GENERATED' ? '#38bdf8' : statusStr === 'SENT_TO_CUSTOMER' ? '#4ade80' : statusStr === 'REVISED' ? '#fbbf24' : '#a855f7',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: '900'
                          }}>
                            {statusStr}
                          </span>
                        </div>

                        {/* Customer & Match Row */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                            <div>
                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.90rem' }}>👤 {custName}</strong>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.78rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '800' }}>{custMobile}</span>
                                {custNum && <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>[{custNum}]</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '800', fontSize: '0.75rem' }}>{matchId}</span>
                              <div style={{ marginTop: '2px' }}>
                                <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                                  🔥 {matchScore}% Match
                                </span>
                              </div>
                            </div>
                          </div>

                          {usedProps.length > 0 && (
                            <div style={{ marginTop: '4px', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', borderRadius: '4px', padding: '4px 6px', fontSize: '0.68rem' }}>
                              <span style={{ color: '#38bdf8', fontWeight: '800' }}>🏢 Customer Property Codes ({usedProps.length}):</span>
                              <div style={{ color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace', display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                                {usedProps.map(p => (
                                  <span key={p.propertyCode} style={{ background: '#0f172a', border: '1px solid #eab308', padding: '1px 4px', borderRadius: '3px' }}>
                                    {p.propertyCode}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Property Specs */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800', fontSize: '0.75rem' }}>{propCodeStr}</span>
                            <span style={{ fontSize: '0.66rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                              🏢 {propTypeStr}
                            </span>
                          </div>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.84rem' }}>{propTitleStr}</strong>
                          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                            📍 {localityStr} • {devNameStr} ({bhkStr})
                          </span>
                        </div>

                        {/* Price Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ background: isLight ? '#f1f5f9' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
                            <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block', fontWeight: '700' }}>Asking Base</span>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.86rem' }}>{basePriceStr}</strong>
                          </div>
                          <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', borderRadius: '8px', padding: '8px 10px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#4ade80', display: 'block', fontWeight: '800' }}>Total Estimated Cost</span>
                            <strong style={{ color: '#4ade80', fontSize: '0.92rem', fontWeight: '900' }}>{totalEstStr}</strong>
                          </div>
                        </div>

                        {/* Footer Metadata */}
                        <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', paddingTop: '6px' }}>
                          <span>📅 {createdAtStr}</span>
                          <span>👤 {createdByStr}</span>
                        </div>

                        {/* Actions Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '6px' }}>
                          <button 
                            onClick={() => setShowViewIndividualCostSheetModal({ open: true, costSheet: item })} 
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button 
                            onClick={() => handleOpenRevisionModal(item)} 
                            style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Edit Customer Details or Pricing & Create Revisions"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => sendCostSheetWhatsApp(item)} 
                            style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Send Cost Sheet directly to customer WhatsApp"
                          >
                            📲 Send
                          </button>
                          <button 
                            onClick={() => downloadCostSheetPDF(item)} 
                            style={{ background: '#334155', color: '#38bdf8', border: '1px solid #38bdf8', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            📥 PDF
                          </button>
                          <button 
                            onClick={() => {
                              if (setActiveTab) setActiveTab('visit_management');
                              if (setActiveVisitSubTab) setActiveVisitSubTab('visit_route_planner');
                              setShowScheduleVisitModal({ open: true, costSheet: item });
                            }} 
                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Schedule Site Visit for this Cost Sheet customer & property"
                          >
                            🚘 Visit
                          </button>
                          <button 
                            onClick={() => {
                              setShowSendToFollowupModal({
                                costSheet: item,
                                customerName: custName,
                                customerNumber: custNum,
                                mobile: custMobile,
                                propertyTitle: propTitleStr
                              });
                              setSendFollowupForm({
                                followupDate: new Date().toISOString().split('T')[0],
                                followupTime: '17:00',
                                priority: 'HIGH',
                                remarks: `Follow up with ${custName} regarding cost sheet ${item.costSheetId} for ${propTitleStr}.`
                              });
                            }} 
                            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Send Cost Sheet to Need to Followup management list"
                          >
                            📌 Followup
                          </button>
                          <button 
                            onClick={() => {
                              if (setShowShiftToMatchingModal) {
                                setShowShiftToMatchingModal({
                                  open: true,
                                  item: item,
                                  customerName: custName,
                                  customerNumber: custNum,
                                  mobile: custMobile,
                                  matchId: matchId,
                                  propertyTitle: propTitleStr,
                                  note: ''
                                });
                              } else {
                                if (setSelectedMatchingId) setSelectedMatchingId(matchId);
                                if (setActiveTab) setActiveTab('matching_management');
                              }
                            }} 
                            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            title="Shift to Matching Management"
                          >
                            ⚡ Matching
                          </button>
                          {setShowUpdateRequirementModal && (
                            <button 
                              onClick={() => {
                                if (setUpdateReqForm) {
                                  setUpdateReqForm({
                                    budget_min: '₹50 Lakhs',
                                    budget_max: '₹1.5 Crores',
                                    preferredArea: propTitleStr || 'Barasat, Kolkata',
                                    configuration: '3BHK',
                                    dislike_reason: 'Over Budget',
                                    remarks: ''
                                  });
                                }
                                setShowUpdateRequirementModal({ 
                                  open: true, 
                                  customer: { 
                                    custName, 
                                    custCode: custNum, 
                                    mobile: custMobile, 
                                    propertyCode: propCodeStr
                                  } 
                                });
                              }} 
                              style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                              title="Update buyer preferences & requirements on-the-spot"
                            >
                              ✏️ Update Req
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button 
                              onClick={() => handleDeleteSingle(item, custName)} 
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                              title="Move this cost sheet record to Recycle Bin"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // CASE 2: Multi-Cost Sheet Group Card
                  const firstItem = group.items[0];
                  const itemCustId = firstItem.customerId || firstItem.customerSnapshot?.customerNumber || firstItem.customerSnapshot?.customerId;
                  const itemCustMob = firstItem.customerSnapshot?.mobile || firstItem.mobile;
                  const cleanMob = itemCustMob ? itemCustMob.replace(/\D/g, '') : '';

                  const matchedCust = (customers || []).find((c: any) => 
                    (c.customer_number && itemCustId && c.customer_number === itemCustId) ||
                    (c.id && itemCustId && c.id === itemCustId) ||
                    (cleanMob && cleanMob.length >= 7 && c.mobile && c.mobile.replace(/\D/g, '') === cleanMob)
                  );

                  const custName = firstItem.customerSnapshot?.customerName || firstItem.customerName || matchedCust?.full_name || matchedCust?.name || 'Prospect Customer';
                  const custMobile = firstItem.customerSnapshot?.mobile || firstItem.mobile || matchedCust?.mobile || 'N/A';
                  const custNum = firstItem.customerId || firstItem.customerSnapshot?.customerNumber || matchedCust?.customer_number || '';

                  const matchId = firstItem.matchId || firstItem.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                  const matchScore = firstItem.matchSnapshot?.matchScore || firstItem.matchScore || (matchedCust?.quality_score) || 88;

                  const groupSheetIds = group.items.map((it: any) => it.costSheetId);
                  const isAllGroupSelected = groupSheetIds.length > 0 && groupSheetIds.every(id => selectedCostSheetIds.includes(id));

                  const combinedBaseNum = group.items.reduce((acc: number, it: any) => {
                    const b = it.pricingSnapshot?.basePrice || it.base_price || 0;
                    return acc + Number(b || 0);
                  }, 0);

                  const combinedTotalEstNum = group.items.reduce((acc: number, it: any) => {
                    const t = it.pricingSnapshot?.totalEstimatedCost || it.final_estimated_price || 0;
                    return acc + Number(t || 0);
                  }, 0);

                  const createdAtStr = formatDisplayDateTime(firstItem.createdAt || firstItem.created_at || 'Just Now');
                  const createdByStr = (() => {
                    const cb = firstItem.createdBy || firstItem.created_by;
                    if (cb) return cb;
                    const as = firstItem.customerSnapshot?.assignedSalesperson;
                    if (as) return as;
                    return 'Avishek Das (Super Admin)';
                  })();

                  const usedProps = getCustomerUsedPropertyCodes(
                    custNum,
                    custName,
                    custMobile,
                    individualCostSheets
                  );

                  return (
                    <div
                      key={`group-${group.groupKey || gIdx}`}
                      style={{
                        background: isLight ? '#f8fafc' : '#0f172a',
                        border: isAllGroupSelected ? '2px solid #a855f7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                        borderRadius: '12px',
                        padding: isMobile ? '12px' : '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.2)',
                        boxSizing: 'border-box',
                        width: '100%',
                        minWidth: 0
                      }}
                    >
                      {/* Group Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="checkbox"
                            checked={isAllGroupSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCostSheetIds(prev => Array.from(new Set([...prev, ...groupSheetIds])));
                              } else {
                                setSelectedCostSheetIds(prev => prev.filter(id => !groupSheetIds.includes(id)));
                              }
                            }}
                            style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                            title={`Select all ${group.items.length} Cost Sheets for ${custName}`}
                          />
                          <span style={{
                            background: 'rgba(168, 85, 247, 0.2)',
                            color: '#c084fc',
                            border: '1px solid #a855f7',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '900'
                          }}>
                            📑 MULTI-COST SHEET ({group.items.length} STOPS)
                          </span>
                        </div>
                        <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '800', fontSize: '0.75rem' }}>
                          {matchId}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.90rem' }}>👤 {custName}</strong>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.78rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '800' }}>{custMobile}</span>
                              {custNum && <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>[{custNum}]</span>}
                            </div>
                          </div>
                          <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 7px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                            🔥 {matchScore}% Match
                          </span>
                        </div>
                        {usedProps.length > 0 && (
                          <div style={{ marginTop: '4px', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', borderRadius: '4px', padding: '4px 6px', fontSize: '0.68rem' }}>
                            <span style={{ color: '#38bdf8', fontWeight: '800' }}>🏢 Customer Property Codes ({usedProps.length}):</span>
                            <div style={{ color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace', display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                              {usedProps.map(p => (
                                <span key={p.propertyCode} style={{ background: '#0f172a', border: '1px solid #eab308', padding: '1px 4px', borderRadius: '3px' }}>
                                  {p.propertyCode}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stops List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#c084fc' }}>
                          🚘 MULTI-PROPERTY SCHEDULE ({group.items.length} STOPS):
                        </span>
                        {group.items.map((it: any, sIdx: number) => {
                          const stopNum = sIdx + 1;
                          const csId = it.costSheetId;
                          const itPropCode = it.propertyCode || it.propertySnapshot?.propertyCode;
                          const matchedP = (properties || []).find((p: any) => 
                            (p.property_code && itPropCode && p.property_code === itPropCode) ||
                            (p.id && itPropCode && p.id === itPropCode) ||
                            (p.property_code && it.propertyId && p.property_code === it.propertyId) ||
                            (p.id && it.propertyId && p.id === it.propertyId)
                          );
                          const pCode = itPropCode || matchedP?.property_code || 'SRM-PROP-2026-000426';
                          const rawTitle = it.propertySnapshot?.propertyTitle || it.propertySnapshot?.projectName || matchedP?.title || matchedP?.property_title || matchedP?.project_name;
                          const pTitle = rawTitle && !rawTitle.startsWith('1 Properties') 
                            ? rawTitle 
                            : (matchedP?.title || matchedP?.property_title || matchedP?.project_name || 'Property Site');
                          const loc = it.propertySnapshot?.locality || matchedP?.locality || 'Locality Hub';
                          const dev = it.propertySnapshot?.developerName || matchedP?.developer || matchedP?.developer_name || matchedP?.builder_name;
                          const bhk = it.propertySnapshot?.bhk || it.propertySnapshot?.configuration || matchedP?.configuration || matchedP?.bhk || '2BHK';
                          const pType = it.propertySnapshot?.property_type || it.propertySnapshot?.propertyType || it.propertyType || matchedP?.property_type || 'Flat / Apartment';
                          const bPriceNum = it.pricingSnapshot?.basePrice || it.base_price || 0;
                          const bPriceStr = it.formattedPriceBreakup?.basePriceStr || (bPriceNum ? `₹${Number(bPriceNum).toLocaleString('en-IN')}` : 'N/A');
                          const tEstNum = it.pricingSnapshot?.totalEstimatedCost || it.final_estimated_price || 0;
                          const tEstStr = it.formattedPriceBreakup?.totalEstimatedCostStr || (tEstNum ? `₹${Number(tEstNum).toLocaleString('en-IN')}` : 'N/A');
                          const st = it.status || 'GENERATED';

                          return (
                            <div key={sIdx} style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 6px', borderRadius: '3px', fontSize: '0.68rem', fontWeight: '900' }}>
                                    STOP 0{stopNum}
                                  </span>
                                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.78rem', fontWeight: '900' }}>
                                    {csId}
                                  </span>
                                  <span style={{ background: it.versionNumber > 1 ? '#fbbf24' : '#0284c7', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', fontSize: '0.64rem', fontWeight: '900' }}>
                                    {it.version || 'V01'}
                                  </span>
                                </div>
                                <span style={{
                                  background: st === 'GENERATED' ? 'rgba(56, 189, 248, 0.2)' : st === 'SENT_TO_CUSTOMER' ? 'rgba(34, 197, 94, 0.2)' : st === 'REVISED' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                                  color: st === 'GENERATED' ? '#38bdf8' : st === 'SENT_TO_CUSTOMER' ? '#4ade80' : st === 'REVISED' ? '#fbbf24' : '#a855f7',
                                  padding: '2px 7px',
                                  borderRadius: '12px',
                                  fontSize: '0.68rem',
                                  fontWeight: '900'
                                }}>
                                  {st}
                                </span>
                              </div>

                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.84rem' }}>🏢 {pTitle}</strong>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Code: {pCode}</span>
                                <span>•</span>
                                <span>📍 {loc} {dev ? `• ${dev}` : ''} ({bhk})</span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLight ? '#f1f5f9' : '#0f172a', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                <span>Base: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{bPriceStr}</strong></span>
                                <span style={{ color: '#4ade80', fontWeight: '900' }}>Total: {tEstStr}</span>
                              </div>

                              {/* Stop Actions */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '2px' }}>
                                <button 
                                  onClick={() => setShowViewIndividualCostSheetModal({ open: true, costSheet: it })} 
                                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 4px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.70rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                                >
                                  <Eye size={11} /> View
                                </button>
                                <button 
                                  onClick={() => handleOpenRevisionModal(it)} 
                                  style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '5px 4px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.70rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => sendCostSheetWhatsApp(it)} 
                                  style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '5px 4px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.70rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                                >
                                  📲 Send
                                </button>
                                <button 
                                  onClick={() => downloadCostSheetPDF(it)} 
                                  style={{ background: '#334155', color: '#38bdf8', border: '1px solid #38bdf8', padding: '5px 4px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.70rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
                                >
                                  📥 PDF
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Combined Total */}
                      <div style={{ background: isLight ? '#f0fdf4' : 'rgba(34, 197, 94, 0.1)', border: '1.5px solid #22c55e', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: '800' }}>COMBINED TOTAL ({group.items.length} STOPS):</span>
                        <strong style={{ color: '#4ade80', fontWeight: '900', fontSize: '1rem' }}>
                          ₹{Number(combinedTotalEstNum).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      {/* Footer Metadata */}
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', paddingTop: '6px' }}>
                        <span>📅 {createdAtStr}</span>
                        <span>👤 {createdByStr}</span>
                      </div>

                      {/* Group Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr' : 'repeat(2, 1fr)', gap: '6px' }}>
                        <button 
                          onClick={() => {
                            if (setActiveTab) setActiveTab('visit_management');
                            if (setActiveVisitSubTab) setActiveVisitSubTab('visit_route_planner');
                            setShowScheduleVisitModal({ open: true, costSheet: group.items[0] });
                          }} 
                          style={{ gridColumn: isSmallMobile ? '1' : 'span 2', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          🚘 Visit Schedule ({group.items.length} Stops)
                        </button>
                        <button 
                          onClick={() => {
                            setShowSendToFollowupModal({
                              costSheet: group.items[0],
                              customerName: custName,
                              customerNumber: custNum,
                              mobile: custMobile,
                              propertyTitle: `${group.items.length} Properties`
                            });
                            setSendFollowupForm({
                              followupDate: new Date().toISOString().split('T')[0],
                              followupTime: '17:00',
                              priority: 'HIGH',
                              remarks: `Follow up with ${custName} regarding ${group.items.length} cost sheets.`
                            });
                          }} 
                          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          📌 Send to Followup
                        </button>
                        <button 
                          onClick={() => {
                            if (setShowShiftToMatchingModal) {
                              setShowShiftToMatchingModal({
                                open: true,
                                item: group.items[0],
                                customerName: custName,
                                customerNumber: custNum,
                                mobile: custMobile,
                                matchId: matchId,
                                propertyTitle: `${group.items.length} Properties`,
                                note: ''
                              });
                            } else {
                              if (setSelectedMatchingId) setSelectedMatchingId(matchId);
                              if (setActiveTab) setActiveTab('matching_management');
                            }
                          }} 
                          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          ⚡ Shift to Matching
                        </button>
                        {setShowUpdateRequirementModal && (
                          <button 
                            onClick={() => {
                              if (setUpdateReqForm) {
                                setUpdateReqForm({
                                  budget_min: '₹50 Lakhs',
                                  budget_max: '₹1.5 Crores',
                                  preferredArea: 'Kolkata',
                                  configuration: '2BHK / 3BHK',
                                  dislike_reason: 'Budget / Property Change',
                                  remarks: ''
                                });
                              }
                              setShowUpdateRequirementModal({ 
                                open: true, 
                                customer: { 
                                  custName, 
                                  custCode: custNum, 
                                  mobile: custMobile, 
                                  propertyCode: group.items[0].propertyCode || ''
                                } 
                              });
                            }} 
                            style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                          >
                            ✏️ Update Requirement
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button 
                            onClick={() => handleDeleteGroup(group, custName)}
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            🗑️ Delete All ({group.items.length})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="table-responsive-wrapper" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0 }}>
                <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '12px', width: '42px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={filteredCostSheets.length > 0 && selectedCostSheetIds.length === filteredCostSheets.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCostSheetIds(filteredCostSheets.map((c: any) => c.costSheetId));
                            } else {
                              setSelectedCostSheetIds([]);
                            }
                          }}
                          style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                          title="Select All Displayed Cost Sheets"
                        />
                      </th>
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
                    {groupedCostSheets.map((group: any, gIdx: number) => {
                      // CASE 1: Single Cost Sheet (Standard Single Row View)
                      if (group.items.length <= 1) {
                        const item = group.items[0];
                        const i = gIdx;
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
                        const custNum = item.customerId || item.customerSnapshot?.customerNumber || matchedCust?.customer_number || '';

                        const matchId = item.matchId || item.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                        const matchScore = item.matchSnapshot?.matchScore || item.matchScore || (matchedCust?.quality_score) || 88;

                        const propCodeStr = itemPropCode || matchedProp?.property_code || 'SRM-PROP-2026-000426';
                        const rawPropTitle = item.propertySnapshot?.propertyTitle || item.propertySnapshot?.projectName || matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name;
                        const propTitleStr = rawPropTitle && !rawPropTitle.startsWith('1 Properties') 
                          ? rawPropTitle 
                          : (matchedProp?.title || matchedProp?.property_title || matchedProp?.project_name || 'BARASAT ECO RESIDENCY');

                        const devNameStr = item.propertySnapshot?.developerName || matchedProp?.developer || matchedProp?.developer_name || matchedProp?.developer_name || matchedProp?.builder_name || 'Swaramayi Partner Developer';
                        const localityStr = item.propertySnapshot?.locality || matchedProp?.locality || 'Barasat / Banamalipur';
                        const bhkStr = item.propertySnapshot?.bhk || item.propertySnapshot?.configuration || matchedProp?.configuration || matchedProp?.bhk || '3BHK';
                        const propTypeStr = item.propertySnapshot?.property_type || item.propertySnapshot?.propertyType || item.propertyType || matchedProp?.property_type || 'Flat / Apartment';

                        const basePriceNum = item.pricingSnapshot?.basePrice || item.base_price || matchedProp?.base_price || 5114880;
                        const basePriceStr = item.formattedPriceBreakup?.basePriceStr || (basePriceNum ? `₹${Number(basePriceNum).toLocaleString('en-IN')}` : '₹51,14,880');
                        const totalEstNum = item.pricingSnapshot?.totalEstimatedCost || item.final_estimated_price || matchedProp?.final_estimated_price || 5677517;
                        const totalEstStr = item.formattedPriceBreakup?.totalEstimatedCostStr || (totalEstNum ? `₹${Number(totalEstNum).toLocaleString('en-IN')}` : '₹56,77,517');

                        const statusStr = item.status || 'GENERATED';
                        const createdAtStr = formatDisplayDateTime(item.createdAt || item.created_at || 'Just Now');
                        const createdByStr = (() => {
                          const cb = item.createdBy || item.created_by;
                          if (cb) return cb;
                          const as = item.customerSnapshot?.assignedSalesperson;
                          if (as) return as;
                          return 'Avishek Das (Super Admin)';
                        })();

                        return (
                          <tr key={item.costSheetId || i} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: selectedCostSheetIds.includes(item.costSheetId) ? (isLight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.12)') : undefined }}>
                            <td style={{ padding: '12px', textAlign: 'center', width: '42px' }}>
                              <input 
                                type="checkbox"
                                checked={selectedCostSheetIds.includes(item.costSheetId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCostSheetIds(prev => [...prev, item.costSheetId]);
                                  } else {
                                    setSelectedCostSheetIds(prev => prev.filter(id => id !== item.costSheetId));
                                  }
                                }}
                                style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                                title={`Select Cost Sheet ${item.costSheetId}`}
                              />
                            </td>
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
                                    setShowSendToFollowupModal({
                                      costSheet: item,
                                      customerName: custName,
                                      customerNumber: custNum,
                                      mobile: custMobile,
                                      propertyTitle: propTitleStr
                                    });
                                    setSendFollowupForm({
                                      followupDate: new Date().toISOString().split('T')[0],
                                      followupTime: '17:00',
                                      priority: 'HIGH',
                                      remarks: `Follow up with ${custName} regarding cost sheet ${item.costSheetId} for ${propTitleStr}.`
                                    });
                                  }} 
                                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                  title="Send Cost Sheet to Need to Followup management list with remarks, date & time"
                                >
                                  📌 Send to Followup
                                </button>
                                <button 
                                  onClick={() => {
                                    if (setShowShiftToMatchingModal) {
                                      setShowShiftToMatchingModal({
                                        open: true,
                                        item: item,
                                        customerName: custName,
                                        customerNumber: custNum,
                                        mobile: custMobile,
                                        matchId: matchId,
                                        propertyTitle: propTitleStr,
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
                                {setShowUpdateRequirementModal && (
                                  <button 
                                    onClick={() => {
                                      if (setUpdateReqForm) {
                                        setUpdateReqForm({
                                          budget_min: '₹50 Lakhs',
                                          budget_max: '₹1.5 Crores',
                                          preferredArea: propTitleStr || 'Barasat, Kolkata',
                                          configuration: '3BHK',
                                          dislike_reason: 'Over Budget',
                                          remarks: ''
                                        });
                                      }
                                      setShowUpdateRequirementModal({ 
                                        open: true, 
                                        customer: { 
                                          custName, 
                                          custCode: custNum, 
                                          mobile: custMobile, 
                                          propertyCode: propCodeStr
                                        } 
                                      });
                                    }} 
                                    style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}
                                    title="Update buyer preferences & requirements on-the-spot"
                                  >
                                    ✏️ Update Requirement
                                  </button>
                                )}
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => {
                                      if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Cost Sheet record ${item.costSheetId} for ${custName}? It will be moved to Recycle Bin.`)) {
                                        if (onRecycleItem) {
                                          onRecycleItem({
                                            id: item.id || item.costSheetId || `CS-${Date.now()}`,
                                            title: `Cost Sheet - ${custName} (${item.costSheetId})`,
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
                                          setSelectedCostSheetIds(prev => prev.filter(id => id !== item.costSheetId && id !== item.id));
                                          localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCostSheets));
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
                      }

                      // CASE 2: MULTI-PROPERTY / MULTI-COST SHEET (when cost sheets > 1) -> EXACT VISIT SCHEDULER STYLE!
                      const firstItem = group.items[0];
                      const itemCustId = firstItem.customerId || firstItem.customerSnapshot?.customerNumber || firstItem.customerSnapshot?.customerId;
                      const itemCustMob = firstItem.customerSnapshot?.mobile || firstItem.mobile;
                      const cleanMob = itemCustMob ? itemCustMob.replace(/\D/g, '') : '';

                      const matchedCust = (customers || []).find((c: any) => 
                        (c.customer_number && itemCustId && c.customer_number === itemCustId) ||
                        (c.id && itemCustId && c.id === itemCustId) ||
                        (cleanMob && cleanMob.length >= 7 && c.mobile && c.mobile.replace(/\D/g, '') === cleanMob)
                      );

                      const custName = firstItem.customerSnapshot?.customerName || firstItem.customerName || matchedCust?.full_name || matchedCust?.name || 'Prospect Customer';
                      const custMobile = firstItem.customerSnapshot?.mobile || firstItem.mobile || matchedCust?.mobile || 'N/A';
                      const custNum = firstItem.customerId || firstItem.customerSnapshot?.customerNumber || matchedCust?.customer_number || '';

                      const matchId = firstItem.matchId || firstItem.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                      const matchScore = firstItem.matchSnapshot?.matchScore || firstItem.matchScore || (matchedCust?.quality_score) || 88;

                      const groupSheetIds = group.items.map((it: any) => it.costSheetId);
                      const isAllGroupSelected = groupSheetIds.length > 0 && groupSheetIds.every(id => selectedCostSheetIds.includes(id));
                      const isAnyGroupSelected = groupSheetIds.some(id => selectedCostSheetIds.includes(id));

                      const combinedBaseNum = group.items.reduce((acc: number, it: any) => {
                        const b = it.pricingSnapshot?.basePrice || it.base_price || 0;
                        return acc + Number(b || 0);
                      }, 0);

                      const combinedTotalEstNum = group.items.reduce((acc: number, it: any) => {
                        const t = it.pricingSnapshot?.totalEstimatedCost || it.final_estimated_price || 0;
                        return acc + Number(t || 0);
                      }, 0);

                      const createdAtStr = formatDisplayDateTime(firstItem.createdAt || firstItem.created_at || 'Just Now');
                      const createdByStr = (() => {
                        const cb = firstItem.createdBy || firstItem.created_by;
                        if (cb) return cb;
                        const as = firstItem.customerSnapshot?.assignedSalesperson;
                        if (as) return as;
                        return 'Avishek Das (Super Admin)';
                      })();

                      const usedProps = getCustomerUsedPropertyCodes(
                        custNum,
                        custName,
                        custMobile,
                        individualCostSheets
                      );

                      return (
                        <tr key={`group-${group.groupKey || gIdx}`} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isAnyGroupSelected ? (isLight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.12)') : undefined }}>
                          {/* 1. Checkbox */}
                          <td style={{ padding: '12px', textAlign: 'center', width: '42px', verticalAlign: 'top' }}>
                            <input 
                              type="checkbox"
                              checked={isAllGroupSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCostSheetIds(prev => Array.from(new Set([...prev, ...groupSheetIds])));
                                } else {
                                  setSelectedCostSheetIds(prev => prev.filter(id => !groupSheetIds.includes(id)));
                                }
                              }}
                              style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                              title={`Select all ${group.items.length} Cost Sheets for ${custName}`}
                            />
                          </td>

                          {/* 2. Cost Sheet ID & Version */}
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                color: '#c084fc',
                                border: '1px solid #a855f7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: '900',
                                width: 'fit-content'
                              }}>
                                📑 MULTI-COST SHEET ({group.items.length})
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                                {group.items.map((it: any, sIdx: number) => (
                                  <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900' }}>
                                      0{sIdx + 1}
                                    </span>
                                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.78rem' }}>
                                      {it.costSheetId}
                                    </span>
                                    <span style={{ background: it.versionNumber > 1 ? '#fbbf24' : '#0284c7', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900' }}>
                                      {it.version || 'V01'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* 3. Customer Identity */}
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{custName}</strong>
                            <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{custMobile}</span>
                            <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{custNum}</span>
                            {usedProps.length > 0 && (
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
                            )}
                          </td>

                          {/* 4. Match ID & Score */}
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '800' }}>{matchId}</span>
                            <br />
                            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                              🔥 {matchScore}% Match
                            </span>
                          </td>

                          {/* 5. Property Code & Title (Exact Visit Scheduler Style with MULTI-PROPERTY SCHEDULE) */}
                          <td style={{ padding: '10px', minWidth: '300px', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #a855f7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900', width: 'fit-content' }}>
                                🚘 MULTI-PROPERTY SCHEDULE ({group.items.length} STOPS)
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {group.items.map((it: any, sIdx: number) => {
                                  const stopNum = sIdx + 1;
                                  const csId = it.costSheetId;
                                  const itPropCode = it.propertyCode || it.propertySnapshot?.propertyCode;
                                  const matchedP = (properties || []).find((p: any) => 
                                    (p.property_code && itPropCode && p.property_code === itPropCode) ||
                                    (p.id && itPropCode && p.id === itPropCode) ||
                                    (p.property_code && it.propertyId && p.property_code === it.propertyId) ||
                                    (p.id && it.propertyId && p.id === it.propertyId)
                                  );
                                  const pCode = itPropCode || matchedP?.property_code || 'SRM-PROP-2026-000426';
                                  const rawTitle = it.propertySnapshot?.propertyTitle || it.propertySnapshot?.projectName || matchedP?.title || matchedP?.property_title || matchedP?.project_name;
                                  const pTitle = rawTitle && !rawTitle.startsWith('1 Properties') 
                                    ? rawTitle 
                                    : (matchedP?.title || matchedP?.property_title || matchedP?.project_name || 'Property Site');
                                  const loc = it.propertySnapshot?.locality || matchedP?.locality || 'Locality Hub';
                                  const dev = it.propertySnapshot?.developerName || matchedP?.developer || matchedP?.developer_name || matchedP?.builder_name;
                                  const bhk = it.propertySnapshot?.bhk || it.propertySnapshot?.configuration || matchedP?.configuration || matchedP?.bhk || '2BHK';
                                  const pType = it.propertySnapshot?.property_type || it.propertySnapshot?.propertyType || it.propertyType || matchedP?.property_type || 'Flat / Apartment';

                                  return (
                                    <div key={sIdx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 6px', borderRadius: '3px', fontSize: '0.68rem', fontWeight: '900' }}>
                                          STOP 0{stopNum}
                                        </span>
                                        {csId && (
                                          <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '900' }}>
                                            {csId}
                                          </span>
                                        )}
                                      </div>
                                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.84rem' }}>
                                        🏢 {pTitle}
                                      </strong>
                                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.7rem', fontWeight: '800', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                                          Code: {pCode}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                          📍 {loc} {dev ? `• ${dev}` : ''} {bhk ? `(${bhk})` : ''}
                                        </span>
                                        <span style={{ fontSize: '0.66rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                                          {pType}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>

                          {/* 6. Base Price vs Total Est. Cost */}
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {group.items.map((it: any, sIdx: number) => {
                                const bPriceNum = it.pricingSnapshot?.basePrice || it.base_price || 0;
                                const bPriceStr = it.formattedPriceBreakup?.basePriceStr || (bPriceNum ? `₹${Number(bPriceNum).toLocaleString('en-IN')}` : 'N/A');
                                const tEstNum = it.pricingSnapshot?.totalEstimatedCost || it.final_estimated_price || 0;
                                const tEstStr = it.formattedPriceBreakup?.totalEstimatedCostStr || (tEstNum ? `₹${Number(tEstNum).toLocaleString('en-IN')}` : 'N/A');

                                return (
                                  <div key={sIdx} style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b', borderRadius: '6px', padding: '4px 8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: '900' }}>STOP 0{sIdx + 1}:</span>
                                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>Base: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{bPriceStr}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                      <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: '800' }}>Total Est:</span>
                                      <strong style={{ color: '#4ade80', fontWeight: '900', fontSize: '0.82rem' }}>{tEstStr}</strong>
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ borderTop: isLight ? '1.5px solid #cbd5e1' : '1.5px solid #0284c7', paddingTop: '4px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '800' }}>COMBINED TOTAL:</span>
                                <br />
                                <strong style={{ color: '#4ade80', fontWeight: '900', fontSize: '0.94rem' }}>
                                  ₹{Number(combinedTotalEstNum).toLocaleString('en-IN')}
                                </strong>
                              </div>
                            </div>
                          </td>

                          {/* 7. Status */}
                          <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              {group.items.map((it: any, sIdx: number) => {
                                const st = it.status || 'GENERATED';
                                return (
                                  <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 4px', borderRadius: '3px', fontSize: '0.62rem', fontWeight: '900' }}>
                                      0{sIdx + 1}
                                    </span>
                                    <span style={{
                                      background: st === 'GENERATED' ? 'rgba(56, 189, 248, 0.2)' : st === 'SENT_TO_CUSTOMER' ? 'rgba(34, 197, 94, 0.2)' : st === 'REVISED' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                                      color: st === 'GENERATED' ? '#38bdf8' : st === 'SENT_TO_CUSTOMER' ? '#4ade80' : st === 'REVISED' ? '#fbbf24' : '#a855f7',
                                      padding: '2px 7px',
                                      borderRadius: '12px',
                                      fontSize: '0.68rem',
                                      fontWeight: '900'
                                    }}>
                                      {st}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* 8. Created Date & By */}
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.78rem' }}>{createdAtStr}</span>
                            <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>By: {createdByStr}</span>
                          </td>

                          {/* 9. Actions (Exact Visit Scheduler Style with Multi-Stop Support) */}
                          <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                              <button 
                                onClick={() => {
                                  if (setActiveTab) setActiveTab('visit_management');
                                  if (setActiveVisitSubTab) setActiveVisitSubTab('visit_route_planner');
                                  setShowScheduleVisitModal({ open: true, costSheet: group.items[0] });
                                }} 
                                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: '900', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '3px', width: '100%', justifyContent: 'center', boxShadow: '0 2px 6px rgba(168, 85, 247, 0.3)' }}
                                title="Schedule Multi-Property Site Visit for this customer & properties"
                              >
                                🚘 Visit Schedule ({group.items.length} Stops)
                              </button>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', borderTop: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderBottom: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', padding: '4px 0' }}>
                                {group.items.map((it: any, sIdx: number) => (
                                  <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', fontSize: '0.64rem', fontWeight: '900' }}>
                                      STOP 0{sIdx + 1}
                                    </span>
                                    <button 
                                      onClick={() => setShowViewIndividualCostSheetModal({ open: true, costSheet: it })} 
                                      style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '3px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: '800', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                      title={`View Cost Sheet ${it.costSheetId}`}
                                    >
                                      <Eye size={10} /> View
                                    </button>
                                    <button 
                                      onClick={() => handleOpenRevisionModal(it)} 
                                      style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '3px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: '800', fontSize: '0.68rem' }}
                                      title={`Edit Cost Sheet ${it.costSheetId}`}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button 
                                      onClick={() => sendCostSheetWhatsApp(it)} 
                                      style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '3px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: '800', fontSize: '0.68rem' }}
                                      title={`Send Cost Sheet ${it.costSheetId} to WhatsApp`}
                                    >
                                      📲 Send
                                    </button>
                                    <button 
                                      onClick={() => downloadCostSheetPDF(it)} 
                                      style={{ background: '#334155', color: '#38bdf8', border: '1px solid #38bdf8', padding: '3px 5px', borderRadius: '3px', cursor: 'pointer', fontWeight: '800', fontSize: '0.68rem' }}
                                      title={`Download PDF for ${it.costSheetId}`}
                                    >
                                      📥 PDF
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button 
                                  onClick={() => {
                                    setShowSendToFollowupModal({
                                      costSheet: group.items[0],
                                      customerName: custName,
                                      customerNumber: custNum,
                                      mobile: custMobile,
                                      propertyTitle: `${group.items.length} Properties`
                                    });
                                    setSendFollowupForm({
                                      followupDate: new Date().toISOString().split('T')[0],
                                      followupTime: '17:00',
                                      priority: 'HIGH',
                                      remarks: `Follow up with ${custName} regarding ${group.items.length} cost sheets.`
                                    });
                                  }} 
                                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                  title="Send to Followup"
                                >
                                  📌 Send to Followup
                                </button>
                                <button 
                                  onClick={() => {
                                    if (setShowShiftToMatchingModal) {
                                      setShowShiftToMatchingModal({
                                        open: true,
                                        item: group.items[0],
                                        customerName: custName,
                                        customerNumber: custNum,
                                        mobile: custMobile,
                                        matchId: matchId,
                                        propertyTitle: `${group.items.length} Properties`,
                                        note: ''
                                      });
                                    } else {
                                      if (setSelectedMatchingId) setSelectedMatchingId(matchId);
                                      if (setActiveTab) setActiveTab('matching_management');
                                    }
                                  }} 
                                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                  title="Shift to Matching Management"
                                >
                                  ⚡ Shift to Matching
                                </button>
                                {setShowUpdateRequirementModal && (
                                  <button 
                                    onClick={() => {
                                      if (setUpdateReqForm) {
                                        setUpdateReqForm({
                                          budget_min: '₹50 Lakhs',
                                          budget_max: '₹1.5 Crores',
                                          preferredArea: 'Kolkata',
                                          configuration: '2BHK / 3BHK',
                                          dislike_reason: 'Budget / Property Change',
                                          remarks: ''
                                        });
                                      }
                                      setShowUpdateRequirementModal({ 
                                        open: true, 
                                        customer: { 
                                          custName, 
                                          custCode: custNum, 
                                          mobile: custMobile, 
                                          propertyCode: group.items[0].propertyCode || ''
                                        } 
                                      });
                                    }} 
                                    style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}
                                    title="Update buyer preferences & requirements"
                                  >
                                    ✏️ Update Requirement
                                  </button>
                                )}
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => {
                                      if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete all ${group.items.length} Cost Sheet records for ${custName}? They will be moved to Recycle Bin.`)) {
                                        if (onRecycleItem) {
                                          group.items.forEach((it: any) => {
                                            onRecycleItem({
                                              id: it.id || it.costSheetId || `CS-${Date.now()}`,
                                              title: `Cost Sheet - ${custName} (${it.costSheetId})`,
                                              category: 'Cost Sheet',
                                              originalLocation: 'Cost Sheet Sharing Engine',
                                              details: `Project: ${it.propertySnapshot?.title || 'N/A'}, Total: ${it.grandTotalFormatted || 'N/A'}`,
                                              originalData: it
                                            });
                                          });
                                        }
                                        const updatedCostSheets = (individualCostSheets || []).filter((c: any) => 
                                          !groupSheetIds.includes(c.costSheetId) && (!c.id || !groupSheetIds.includes(c.id))
                                        );
                                        if (setIndividualCostSheets) {
                                          setIndividualCostSheets(updatedCostSheets);
                                        }
                                        try {
                                          setSelectedCostSheetIds(prev => prev.filter(id => !groupSheetIds.includes(id)));
                                          localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCostSheets));
                                        } catch (e) {}

                                        if (syncAllToMongoDB) {
                                          syncAllToMongoDB({ cost_sheets: updatedCostSheets });
                                        }
                                        alert(`🗑️ All ${group.items.length} Cost Sheets for ${custName} moved to Recycle Bin.`);
                                      }
                                    }} 
                                    style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                    title="Move all cost sheets for this customer to Recycle Bin"
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                              </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '0.98rem' : '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  📌 Cost Sheet Follow-up Management ({localCostSheetFollowups.length} Records)
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                  Track pending callbacks, quotation negotiation notes, and customer response schedules for active cost sheets.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                  ● LIVE FOLLOWUP ACTIVE
                </span>
                <div style={{ display: 'flex', background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    style={{
                      background: effectiveView === 'cards' ? '#0284c7' : 'transparent',
                      color: effectiveView === 'cards' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LayoutGrid size={12} /> Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    style={{
                      background: effectiveView === 'table' ? '#0284c7' : 'transparent',
                      color: effectiveView === 'table' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <List size={12} /> Table
                  </button>
                </div>
              </div>
            </div>

            {localCostSheetFollowups.length === 0 ? (
              <div style={{ padding: isMobile ? '24px 14px' : '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #38bdf8' }}>
                <Clock size={32} color="#38bdf8" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO PENDING COST SHEET FOLLOW-UPS</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                  Click "📌 Send to Followup" on any Cost Sheet record in the Active Cost Sheets tab to add follow-up tasks here.
                </p>
              </div>
            ) : effectiveView === 'cards' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                {localCostSheetFollowups.map((fol: any) => (
                  <div
                    key={fol.id}
                    style={{
                      background: isLight ? '#f8fafc' : '#0f172a',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                      borderRadius: '12px',
                      padding: isMobile ? '12px' : '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxSizing: 'border-box',
                      width: '100%',
                      minWidth: 0
                    }}
                  >
                    {/* Header: ID, Priority, Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.80rem' }}>
                          {fol.id}
                        </span>
                        <span style={{ background: fol.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : fol.priority === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: fol.priority === 'HIGH' ? '#ef4444' : fol.priority === 'MEDIUM' ? '#f59e0b' : '#22c55e', padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900' }}>
                          {fol.priority || 'HIGH'}
                        </span>
                      </div>
                      <span style={{ background: fol.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: fol.status === 'COMPLETED' ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: '12px', fontSize: '0.70rem', fontWeight: '900' }}>
                        {fol.status === 'COMPLETED' ? '✅ COMPLETED' : '⏳ PENDING'}
                      </span>
                    </div>

                    {/* Schedule block */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem' }}>
                      <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#fbbf24" /> {fol.followupDate}
                      </span>
                      <span>•</span>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#a855f7" /> {fol.followupTime}
                      </span>
                    </div>

                    {/* Customer & Cost Sheet */}
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                        <div>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>👤 {fol.customerName}</strong>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '800' }}>{fol.customerMobile}</span>
                            {fol.customerNumber && <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>[{fol.customerNumber}]</span>}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '800', fontFamily: 'monospace' }}>
                          {fol.costSheetId}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                        🏢 {fol.propertyTitle}
                      </div>
                    </div>

                    {/* Remarks */}
                    {fol.remarks && (
                      <div style={{ background: isLight ? '#f1f5f9' : '#1e293b', borderLeft: '3px solid #38bdf8', borderRadius: '4px', padding: '6px 10px', fontSize: '0.78rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: '1.35' }}>
                        "{fol.remarks}"
                      </div>
                    )}

                    {/* Action buttons grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '6px', marginTop: '2px' }}>
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
                        style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
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
                        style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
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
                                  const newCS = {
                                    id: fol.id || `CS-${Date.now()}`,
                                    costSheetId: fol.costSheetId || `COST-SHEET-2026-${Date.now().toString().slice(-6)}`,
                                    customerId: fol.customerNumber || '',
                                    customerName: fol.customerName || 'Customer',
                                    mobile: fol.customerMobile || '',
                                    customerSnapshot: {
                                      customerName: fol.customerName || 'Customer',
                                      customerNumber: fol.customerNumber || '',
                                      mobile: fol.customerMobile || '',
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
                                  localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCS));
                                } catch (e) {}
                                if (syncAllToMongoDB) {
                                  syncAllToMongoDB({ cost_sheets: updatedCS });
                                }
                                return updatedCS;
                              });
                            }

                            const updatedFol = localCostSheetFollowups.filter(item => item.id !== fol.id && item.costSheetId !== fol.costSheetId);
                            saveCostSheetFollowups(updatedFol);

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
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                      >
                        📄 Resend
                      </button>
                      <button
                        onClick={() => {
                          const updated = localCostSheetFollowups.map(item => 
                            item.id === fol.id ? { ...item, status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : item
                          );
                          saveCostSheetFollowups(updated);
                        }}
                        style={{ background: fol.status === 'COMPLETED' ? '#0284c7' : '#10b981', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                      >
                        {fol.status === 'COMPLETED' ? '🔄 Reopen' : '✅ Done'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete follow-up task ${fol.id}?`)) {
                            const updated = localCostSheetFollowups.filter(item => item.id !== fol.id);
                            saveCostSheetFollowups(updated);
                          }
                        }}
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-responsive-wrapper" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0 }}>
                <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
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
                                          customerId: fol.customerNumber || '',
                                          customerName: fol.customerName || 'Customer',
                                          mobile: fol.customerMobile || '',
                                          customerSnapshot: {
                                            customerName: fol.customerName || 'Customer',
                                            customerNumber: fol.customerNumber || '',
                                            mobile: fol.customerMobile || '',
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
                                        localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCS));
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: isSmallMobile ? 'flex-start' : 'center', justifyContent: 'center', zIndex: 99999, padding: isSmallMobile ? '8px' : isMobile ? '12px' : '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: isMobile ? '94vh' : 'auto', overflowY: 'auto', padding: isSmallMobile ? '14px' : isMobile ? '18px' : '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: isSmallMobile ? '0.98rem' : '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    📅 Follow-up Date
                  </label>
                  <input 
                    type="date"
                    value={sendFollowupForm.followupDate}
                    onChange={(e) => setSendFollowupForm({ ...sendFollowupForm, followupDate: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                    style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: isSmallMobile ? 'stretch' : 'flex-end', flexDirection: isSmallMobile ? 'column-reverse' : 'row', marginTop: '10px' }}>
              <button
                onClick={() => setShowSendToFollowupModal(null)}
                style={{ background: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', width: isSmallMobile ? '100%' : 'auto' }}
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
                        localStorage.setItem('swaramayi_indiv_cost_sheets_v7_clean', JSON.stringify(updatedCS));
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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', width: isSmallMobile ? '100%' : 'auto' }}
              >
                📌 Confirm & Send to Followup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT FOLLOWUP MODAL */}
      {showEditFollowupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: isSmallMobile ? 'flex-start' : 'center', justifyContent: 'center', zIndex: 99999, padding: isSmallMobile ? '8px' : isMobile ? '12px' : '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: isMobile ? '94vh' : 'auto', overflowY: 'auto', padding: isSmallMobile ? '14px' : isMobile ? '18px' : '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: isSmallMobile ? '0.98rem' : '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', marginBottom: '6px' }}>
                    📅 Follow-up Date
                  </label>
                  <input 
                    type="date"
                    value={editFollowupForm.followupDate}
                    onChange={(e) => setEditFollowupForm({ ...editFollowupForm, followupDate: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                    style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: isSmallMobile ? 'stretch' : 'flex-end', flexDirection: isSmallMobile ? 'column-reverse' : 'row', marginTop: '10px' }}>
              <button
                onClick={() => setShowEditFollowupModal(null)}
                style={{ background: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', width: isSmallMobile ? '100%' : 'auto' }}
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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', width: isSmallMobile ? '100%' : 'auto' }}
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
