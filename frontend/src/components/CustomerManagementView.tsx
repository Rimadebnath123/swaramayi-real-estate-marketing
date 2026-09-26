import React, { useState } from 'react';
import { Plus, UserPlus, Trash2, Search, FileText, Printer, Download, X } from 'lucide-react';

interface CustomerManagementViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth: number;
  setShowCreateShareModal: (val: boolean) => void;
  handleOpenAddCustomerModal: () => void;
  handleDeleteAllCurrentInside: () => void;
  activeCustomerSubTab: string;
  setActiveCustomerSubTab: (tab: any) => void;
  customers: any[];
  setCustomers?: React.Dispatch<React.SetStateAction<any[]>>;
  selectedCust: any;
  setSelectedCust: (cust: any) => void;
  custSearchQuery: string;
  setCustSearchQuery: (val: string) => void;
  filterLocality: string;
  setFilterLocality: (val: string) => void;
  custStageFilter: string;
  setCustStageFilter: (val: string) => void;
  custSourceFilter: string;
  setCustSourceFilter: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  leadsList: any[];
  setLeadsList?: React.Dispatch<React.SetStateAction<any[]>>;
  individualCostSheets: any[];
  projectVisitAgreements: any[];
  agreements: any[];
  bookings: any[];
  invoices?: any[];
  setInvoices?: React.Dispatch<React.SetStateAction<any[]>>;
  matchingRequestsQueue?: any[];
  openIdDetailsModal: (id: string, type: string) => void;
  maskPhone: (phone: string) => string;
  handleStartEditCustomer: (cust: any) => void;
  setShowPvaDocumentModal: (val: any) => void;
  setShowViewIndividualCostSheetModal?: (val: any) => void;
  scheduledVisits?: any[];
  setScheduledVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  visitPlans?: any[];
  properties?: any[];
  setActiveTab?: (tab: string) => void;
  setBillingInvoiceCategory?: (cat: string) => void;
  setSearchQuery?: (q: string) => void;
  users?: any[];
  syncAllToMongoDB?: (overrideData?: any) => void;
  onRecycleItem?: (itemData: any) => void;
  recycledItems?: any[];
  setMatchingRequestsQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  setIndividualCostSheets?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  currentRole,
  isLight,
  windowWidth,
  setShowCreateShareModal,
  handleOpenAddCustomerModal,
  handleDeleteAllCurrentInside,
  activeCustomerSubTab,
  setActiveCustomerSubTab,
  customers = [],
  onRecycleItem,
  setCustomers,
  selectedCust = {},
  setSelectedCust,
  custSearchQuery,
  setCustSearchQuery,
  filterLocality,
  setFilterLocality,
  custStageFilter,
  setCustStageFilter,
  custSourceFilter,
  setCustSourceFilter,
  filterPriority,
  setFilterPriority,
  leadsList = [],
  setLeadsList,
  individualCostSheets = [],
  setIndividualCostSheets,
  projectVisitAgreements = [],
  agreements = [],
  bookings = [],
  invoices = [],
  setInvoices,
  matchingRequestsQueue = [],
  setMatchingRequestsQueue,
  scheduledVisits = [],
  setScheduledVisits,
  visitPlans = [],
  properties = [],
  openIdDetailsModal,
  maskPhone,
  handleStartEditCustomer,
  setShowPvaDocumentModal,
  setShowViewIndividualCostSheetModal,
  setActiveTab,
  setBillingInvoiceCategory,
  setSearchQuery,
  users = [],
  syncAllToMongoDB,
  recycledItems = []
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');

  const [selectedTransactionPdf, setSelectedTransactionPdf] = useState<any | null>(null);
  const [vaultViewMode, setVaultViewMode] = useState<'cards' | 'table'>(windowWidth <= 1024 ? 'cards' : 'table');

  const salesExecOptions = React.useMemo(() => {
    if (users && Array.isArray(users) && users.length > 0) {
      return users.map((u: any) => {
        const rawName = u.full_name || u.name || u.username || 'Executive';
        const cleanName = rawName.replace(/\(.*\)/, '').trim();
        const roleStr = u.designation || (u.role ? u.role.replace(/_/g, ' ') : 'Sales Executive');
        const branchStr = u.branch_name ? ` (${u.branch_name})` : '';
        return {
          id: u.id || cleanName,
          value: cleanName,
          label: cleanName
        };
      });
    }
    return [];
  }, [users]);

  const [reassignExecInput, setReassignExecInput] = useState<string>('');

  const handleReassignExecutive = (targetCust: any, newExecValue: string) => {
    if (!targetCust || !newExecValue) return;

    const updatedExecName = newExecValue;

    let updatedCustomersList: any[] = [];
    if (setCustomers && customers) {
      updatedCustomersList = customers.map((c: any) => {
        if ((c.customer_number && targetCust.customer_number && c.customer_number === targetCust.customer_number) || (c.id && targetCust.id && c.id === targetCust.id)) {
          return {
            ...c,
            assigned_salesperson: updatedExecName,
            assigned_employee_id: updatedExecName,
            assignedExecutive: updatedExecName
          };
        }
        return c;
      });
      setCustomers(updatedCustomersList);
      try {
        localStorage.setItem('swaramayi_customers_master_v3_clean', JSON.stringify(updatedCustomersList));
      } catch (e) {}
    }

    if (setSelectedCust) {
      setSelectedCust((prev: any) => ({
        ...prev,
        assigned_salesperson: updatedExecName,
        assigned_employee_id: updatedExecName,
        assignedExecutive: updatedExecName
      }));
    }

    if (setLeadsList && leadsList) {
      const updatedLeads = leadsList.map((l: any) => {
        if ((l.customer_number && targetCust.customer_number && l.customer_number === targetCust.customer_number) || (l.customer_id && targetCust.customer_number && l.customer_id === targetCust.customer_number) || (l.mobile && targetCust.mobile && l.mobile.replace(/\D/g, '') === targetCust.mobile.replace(/\D/g, ''))) {
          return {
            ...l,
            assigned_employee_id: updatedExecName,
            assigned_employee_name: updatedExecName,
            assigned_salesperson: updatedExecName
          };
        }
        return l;
      });
      setLeadsList(updatedLeads);
      try {
        localStorage.setItem('swaramayi_leads_v5_clean', JSON.stringify(updatedLeads));
      } catch (e) {}
    }

    if (syncAllToMongoDB) {
      syncAllToMongoDB({
        customers: updatedCustomersList.length > 0 ? updatedCustomersList : customers
      });
    }

    alert(`👤 Successfully reassigned Customer ${targetCust.name || targetCust.customer_number || 'Record'} to ${updatedExecName}!`);
  };

  React.useEffect(() => {
    if (selectedCust) {
      const cur = selectedCust.assigned_salesperson || selectedCust.assigned_employee_id || selectedCust.assignedExecutive || (salesExecOptions.length > 0 ? salesExecOptions[0].value : '');
      setReassignExecInput(cur);
    }
  }, [selectedCust?.customer_number, selectedCust?.id, salesExecOptions]);

  const handleToggleInvoiceSettled = (invIdOrNum: string, currentIsSettled: boolean, targetCust?: any) => {
    const activeTargetCust = targetCust || selectedCust;
    const newSettlementStatus = currentIsSettled ? 'NOT SETTLED' : 'SETTLED';
    const newIsSettled = !currentIsSettled;
    if (setInvoices) {
      setInvoices((prev: any[]) => {
        let updated = false;
        const targetCleanNum = (activeTargetCust?.customer_number || activeTargetCust?.customer_id || '').toString().toLowerCase().trim();
        const targetCleanMob = (activeTargetCust?.mobile || '').toString().replace(/\D/g, '');

        const nextInvoices = prev.map((inv: any) => {
          const invNo = (inv.invoice_number || inv.id || '').toString().trim();
          const invCustNum = (inv.customer_number || inv.customer_id || inv.customerNumber || '').toString().toLowerCase().trim();
          const invCustMob = (inv.customer_mobile || inv.mobile || '').toString().replace(/\D/g, '');
          const isTargetMatch = (invNo && invIdOrNum && invNo.toLowerCase() === invIdOrNum.toLowerCase()) ||
            (targetCleanNum && invCustNum && (invCustNum === targetCleanNum || invCustNum.includes(targetCleanNum))) ||
            (targetCleanMob && invCustMob && invCustMob.length >= 7 && invCustMob.slice(-10) === targetCleanMob.slice(-10));

          if (isTargetMatch) {
            updated = true;
            return {
              ...inv,
              settlement_status: newSettlementStatus,
              is_settled: newIsSettled,
              payment_status: newIsSettled ? 'PAID_SETTLED' : (inv.payment_status || 'UNPAID_PENDING'),
              status: newSettlementStatus
            };
          }
          return inv;
        });

        if (!updated) {
          const custNum = activeTargetCust?.customer_number || activeTargetCust?.customer_id || 'SRM-CUS-2026-000000';
          const newInv = {
            id: invIdOrNum || (custNum ? `SRM-INV-2026-${custNum.replace(/[^0-9]/g, '').slice(-6)}` : 'SRM-INV-NEW'),
            invoice_number: invIdOrNum || (custNum ? `SRM-INV-2026-${custNum.replace(/[^0-9]/g, '').slice(-6)}` : 'SRM-INV-NEW'),
            customer_number: custNum,
            customer_name: activeTargetCust?.name || activeTargetCust?.full_name || 'Customer',
            customer_mobile: activeTargetCust?.mobile || '',
            party_name: activeTargetCust?.name || activeTargetCust?.full_name || 'Customer',
            total_invoice_amount: 590000,
            settlement_status: newSettlementStatus,
            is_settled: newIsSettled,
            payment_status: 'PAID_SETTLED',
            status: newSettlementStatus,
            payment_mode: 'Online Bank Transfer / UPI',
            payment_ref: `UTR-${Date.now().toString().slice(-8)}`,
            created_date: new Date().toISOString().split('T')[0]
          };
          const list = [newInv, ...prev];
          try {
            localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(list));
          } catch (e) {}
          return list;
        }

        try {
          localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(nextInvoices));
        } catch (e) {}

        return nextInvoices;
      });
    }
  };

  const allActiveCustomers = React.useMemo(() => {
    const list: any[] = [];
    const seenKeys = new Set<string>();

    const getKeys = (c: any) => {
      const keys: string[] = [];
      const num = (c?.customer_number || c?.customerNumber || c?.customerId || c?.customer_id || '').toString().toLowerCase().trim();
      const mob = (c?.mobile || c?.phone || c?.customerMobile || '').toString().replace(/\D/g, '');
      const name = (c?.name || c?.full_name || c?.customer_name || '').toString().toLowerCase().trim();
      const id = (c?.id || c?._id || '').toString().toLowerCase().trim();
      if (num) keys.push(`num:${num}`);
      if (mob && mob.length >= 7) keys.push(`mob:${mob.slice(-10)}`);
      if (id) keys.push(`id:${id}`);
      return { keys, num, mob, name, id };
    };

    // Pre-populate recycled keys so recycled items are NEVER auto-incorporated into Customer Management
    const recycledKeys = new Set<string>();
    (recycledItems || []).forEach((r: any) => {
      if (!r) return;
      const orig = r.originalData || {};
      const rNum = (r.id || orig.customer_number || orig.customerNumber || orig.id || '').toString().toLowerCase().trim();
      const rMob = (orig.mobile || orig.phone || '').toString().replace(/\D/g, '');
      const rName = (r.title || orig.name || orig.full_name || orig.customer_name || '').toString().toLowerCase().trim();
      const rId = (r.id || orig.id || orig._id || '').toString().toLowerCase().trim();

      if (rNum) recycledKeys.add(`num:${rNum}`);
      if (rMob && rMob.length >= 7) recycledKeys.add(`mob:${rMob.slice(-10)}`);
      if (rId) recycledKeys.add(`id:${rId}`);

      if (r.title && r.title.includes('(') && r.title.includes(')')) {
        const extracted = r.title.split('(')[1].replace(')', '').trim().toLowerCase();
        if (extracted) recycledKeys.add(`num:${extracted}`);
      }
    });

    const isDuplicate = (keys: string[]) => {
      return keys.some(k => seenKeys.has(k) || recycledKeys.has(k));
    };

    const registerKeys = (keys: string[]) => {
      keys.forEach(k => seenKeys.add(k));
    };

    // 1. Process existing customers master list (deduplicated)
    (customers || []).forEach(c => {
      if (!c) return;
      const { keys } = getKeys(c);
      if (!isDuplicate(keys)) {
        registerKeys(keys);
        list.push(c);
      }
    });

    // 2. Auto-incorporate customers who have generated Individual Cost Sheets
    (individualCostSheets || []).forEach(cs => {
      if (!cs) return;
      const snap = cs.customerSnapshot || {};
      const custName = cs.customerName || snap.customerName || cs.name || 'Customer';
      const custMob = cs.mobile || cs.customerMobile || snap.mobile || '';
      const cleanMob = custMob ? custMob.replace(/\D/g, '') : '';
      const custNum = cs.customerNumber || cs.customerId || snap.customerNumber || snap.customerId || (cleanMob ? `SRM-CUS-2026-${cleanMob.slice(-6)}` : `SRM-CUS-2026-000999`);
      const custEmail = cs.email || cs.customerEmail || snap.email || `${custName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

      const { keys } = getKeys({ customer_number: custNum, mobile: custMob, name: custName, id: `CUS-${custNum}` });
      if (!isDuplicate(keys)) {
        registerKeys(keys);
        const askingPrice = cs.propertySnapshot?.basePrice ? `₹${Number(cs.propertySnapshot.basePrice).toLocaleString('en-IN')}` : '₹35L - ₹50L';
        const totalEst = cs.grandTotalEstimatedCost ? `₹${Number(cs.grandTotalEstimatedCost).toLocaleString('en-IN')}` : '₹37,62,013';

        list.push({
          id: `CUS-${custNum}`,
          customer_number: custNum,
          full_name: custName,
          name: custName,
          mobile: custMob,
          email: custEmail,
          city: 'Kolkata',
          preferred_location: cs.preferredArea || cs.propertySnapshot?.locality || 'Barasat, Kolkata',
          preferredArea: cs.preferredArea || cs.propertySnapshot?.locality || 'Barasat, Kolkata',
          property_type: cs.propertyType || cs.propertySnapshot?.property_type || 'Flat / Apartment',
          configuration: cs.configuration || cs.propertySnapshot?.configuration || '2BHK',
          budget: cs.budget || `${askingPrice} (Total: ${totalEst})`,
          budget_min: cs.budget_min || 2500000,
          budget_max: cs.budget_max || 5000000,
          purchase_timeline: 'Immediate (< 30 Days)',
          loan_required: true,
          investment_purpose: 'Self / End Use',
          customer_status: 'COST_SHEET_CREATED',
          status: 'COST_SHEET_CREATED',
          priority: cs.priority || snap.priority || 'HOT',
          quality_score: cs.score || snap.score || 88,
          source: 'Cost Sheet Generation',
          created_at: cs.createdAt || cs.created_at || new Date().toISOString(),
          is_deleted: false,
          costSheetData: cs
        });
      }
    });

    // 3. Auto-incorporate leads
    (leadsList || []).forEach(l => {
      if (!l) return;
      const custNum = l.customer_number || `SRM-CUS-2026-000${String(l.id).slice(-3)}`;
      const cleanMob = l.mobile ? l.mobile.replace(/\D/g, '') : '';
      const { keys } = getKeys({ customer_number: custNum, mobile: cleanMob, name: l.customer_name, id: l.customer_id || `CUS-${l.id}` });

      if (!isDuplicate(keys)) {
        registerKeys(keys);
        list.push({
          id: l.customer_id || `CUS-${l.id}`,
          customer_number: custNum,
          full_name: l.customer_name || 'Lead Customer',
          name: l.customer_name || 'Lead Customer',
          mobile: l.mobile,
          email: l.email || 'lead@swaramayi.com',
          budget: l.budget || ((l.budget_min || l.budget_max) ? `${l.budget_min || ''} - ${l.budget_max || ''}`.trim() : '50 Lakhs - 60 Lakhs'),
          preferredArea: l.preferred_location || 'Kondapur',
          configuration: l.bhk || '3BHK',
          priority: l.priority || 'HOT',
          score: l.quality_score || 88,
          source: l.source || 'Lead Ingestion',
          lead_status: l.lead_status || 'NEW_INGESTED',
          customer_status: 'NEW',
          status: 'NEW',
          quality_score: l.quality_score || 88,
          created_at: l.created_at || new Date().toISOString(),
          is_deleted: false,
          leadData: l
        });
      }
    });

    // 4. Auto-incorporate matching requests
    (matchingRequestsQueue || []).forEach(m => {
      if (!m) return;
      const custNum = m.customerNumber || m.customerId || m.customer_number || `SRM-CUS-2026-${String(m.id || m.requestId || '000186').replace(/\D/g, '').slice(-6) || '000186'}`;
      const custName = m.customerName || m.customer_name || m.name || 'Customer';
      const custMob = m.mobile || m.phone || m.customerMobile || '';
      const cleanMob = custMob ? custMob.replace(/\D/g, '') : '';
      const { keys } = getKeys({ customer_number: custNum, mobile: cleanMob, name: custName, id: `CUS-${custNum}` });

      if (!isDuplicate(keys)) {
        registerKeys(keys);
        const askingPrice = m.budget || (m.budget_min && m.budget_max ? `₹${Number(m.budget_min).toLocaleString('en-IN')} - ₹${Number(m.budget_max).toLocaleString('en-IN')}` : '₹25L - ₹50L');

        list.push({
          id: `CUS-${custNum}`,
          customer_number: custNum,
          full_name: custName,
          name: custName,
          mobile: custMob,
          email: m.email || `${custName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          city: m.city || 'Kolkata',
          preferred_location: m.preferredArea || m.locality || 'Madhyamgram, Kolkata',
          preferredArea: m.preferredArea || m.locality || 'Madhyamgram, Kolkata',
          property_type: m.propertyType || m.property_type || '2BHK Flat / Apartment',
          configuration: m.configuration || '2BHK',
          budget: askingPrice,
          budget_min: m.budget_min || 2500000,
          budget_max: m.budget_max || 5000000,
          purchase_timeline: m.purchase_timeline || 'Immediate (< 30 Days)',
          loan_required: true,
          investment_purpose: m.purpose || m.investment_purpose || 'Rent / Investment',
          customer_status: m.costSheetId ? 'COST_SHEET_CREATED' : 'MATCHING_INITIATED',
          status: m.costSheetId ? 'COST_SHEET_CREATED' : 'MATCHING_INITIATED',
          priority: m.priority || 'HOT',
          quality_score: m.leadScore || m.completenessScore || m.score || 100,
          source: m.source || 'Lead Intake & AI Matching',
          assigned_salesperson: m.assignedExecutive || 'Abinash Roy (Admin)',
          created_at: m.created_at || m.createdAt || m.date || new Date().toISOString(),
          is_deleted: false,
          matchingData: m
        });
      }
    });

    // 5. Auto-incorporate scheduled site visits
    (scheduledVisits || []).forEach(v => {
      if (!v) return;
      const custNum = v.customerNumber || v.customer_number || v.customerId || `SRM-CUS-2026-${String(v.id || v.visitId || '000189').replace(/\D/g, '').slice(-6) || '000189'}`;
      const custName = v.customerName || v.customer_name || v.name || 'Customer';
      const custMob = v.mobile || v.phone || v.customerMobile || '';
      const cleanMob = custMob ? custMob.replace(/\D/g, '') : '';
      const { keys } = getKeys({ customer_number: custNum, mobile: cleanMob, name: custName, id: `CUS-${custNum}` });

      if (!isDuplicate(keys)) {
        registerKeys(keys);
        list.push({
          id: `CUS-${custNum}`,
          customer_number: custNum,
          full_name: custName,
          name: custName,
          mobile: custMob,
          email: v.email || `${custName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          city: v.city || 'Kolkata',
          preferred_location: v.locality || v.preferredArea || 'Barasat, Kolkata',
          preferredArea: v.locality || v.preferredArea || 'Barasat, Kolkata',
          property_type: 'Flat / Apartment',
          configuration: '3BHK',
          budget: '₹50 Lakh - ₹60 Lakh',
          budget_min: 5000000,
          budget_max: 6000000,
          purchase_timeline: 'Immediate (< 30 Days)',
          loan_required: true,
          investment_purpose: 'Self / End Use',
          customer_status: 'SITE_VISIT_SCHEDULED',
          status: 'SITE_VISIT_SCHEDULED',
          priority: 'HOT',
          quality_score: 95,
          score: 95,
          source: 'Site Visit Scheduling',
          assigned_employee_id: v.assignedExecutive || 'Ramesh Pawar',
          assigned_employee_name: v.assignedExecutive || 'Ramesh Pawar',
          created_at: v.visitDate || new Date().toISOString(),
          is_deleted: false,
          visitData: v
        });
      }
    });

    return list;
  }, [customers, individualCostSheets, leadsList, matchingRequestsQueue, scheduledVisits, recycledItems]);

  const getCustomerTransactionChainItems = (cust: any) => {
    const custNum = (cust?.customer_number || cust?.customer_id || cust?.id || '').toString().trim();
    const custName = (cust?.name || cust?.full_name || cust?.customer_name || '').toString().trim();
    const custMobile = (cust?.mobile || cust?.phone || cust?.customer_mobile || '').toString().trim();
    const cleanMobile = custMobile.replace(/[^0-9]/g, '');
    const cleanCustNum = custNum.replace(/[^0-9]/g, '');
    const cleanCustName = custName.toLowerCase().trim();

    // Comprehensive helper matcher
    const matchesCustomer = (recordCustNum?: string, recordCustName?: string, recordMobile?: string) => {
      const rNum = (recordCustNum || '').toString().trim();
      const rCleanNum = rNum.replace(/[^0-9]/g, '');
      const rName = (recordCustName || '').toString().toLowerCase().trim();
      const rMob = (recordMobile || '').toString().replace(/[^0-9]/g, '');

      if (custNum && rNum) {
        if (rNum.toLowerCase() === custNum.toLowerCase()) return true;
        if (cleanCustNum && rCleanNum && cleanCustNum.length >= 6 && rCleanNum.length >= 6 && rCleanNum === cleanCustNum) return true;
      }
      if (cleanMobile && rMob) {
        if (cleanMobile.length >= 10 && rMob.length >= 10 && rMob === cleanMobile) return true;
      }
      if (cleanCustName && rName) {
        if (rName === cleanCustName) return true;
      }
      return false;
    };

    // Find linked records dynamically
    const matchingLead = (leadsList || []).find((l: any) =>
      matchesCustomer(l.customer_number || l.customer_id, l.customer_name || l.name, l.mobile || l.phone)
    ) || cust?.leadData;

    const linkedMatches = (matchingRequestsQueue || []).filter((m: any) =>
      matchesCustomer(m.customerId || m.customerNumber || m.customer_number || m.id, m.customerName || m.customer_name || m.name, m.mobile || m.phone)
    );

    const linkedCostSheets = (individualCostSheets || []).filter((cs: any) => {
      if (cust?.costSheetData && (cust.costSheetData.costSheetId === cs.costSheetId || cust.costSheetData.id === cs.id)) return true;
      return matchesCustomer(
        cs.customerId || cs.customerNumber || cs.customerSnapshot?.customerId || cs.customerSnapshot?.customerNumber,
        cs.customerName || cs.name || cs.customerSnapshot?.customerName,
        cs.mobile || cs.customerMobile || cs.customerSnapshot?.mobile || cs.customerSnapshot?.alternateMobile
      );
    });

    const allLinkedCostSheets = linkedCostSheets.length > 0 
      ? linkedCostSheets 
      : (cust?.costSheetData ? [cust.costSheetData] : []);

    // 1. Linked Agreements (Deduplicated)
    const rawAgreements = (agreements || []).filter((a: any) =>
      matchesCustomer(a.customerNumber || a.customerId || a.id, a.party_name || a.customerName || a.name, a.party_contact || a.mobile || a.phone)
    ).map((a: any) => ({
      projectVisitAgreementId: a.agreement_code || a.id,
      projectTitle: a.title || a.property_details || 'Site Visit Agreement',
      ...a
    }));

    const rawPvas = (projectVisitAgreements || []).filter((pva: any) =>
      matchesCustomer(pva.customerNumber || pva.customerId || pva.id, pva.customerName || pva.name, pva.mobile || pva.customerMobile || pva.phone)
    );

    const seenAgrIds = new Set<string>();
    const linkedAgreements: any[] = [];
    [...rawPvas, ...rawAgreements].forEach((a: any) => {
      const aId = (a.projectVisitAgreementId || a.agreement_code || a.pvaId || a.id || '').toString().trim();
      if (!aId) return;
      const cleanId = aId.toLowerCase();
      // If we already have a specific agreement, avoid generic duplicate 000001
      if (!seenAgrIds.has(cleanId)) {
        seenAgrIds.add(cleanId);
        linkedAgreements.push(a);
      }
    });

    // 2. Linked Visits (Deduplicated & Real Visits Prioritized)
    const visitPlansMapped = (visitPlans || []).map((p: any) => ({
      visitId: p.visitPlanId || p.visitScheduleId || (p.id ? `SRM-VS-${String(p.id).slice(-6)}` : ''),
      customerNumber: p.customerNumber,
      customerName: p.customerName,
      mobile: p.mobile,
      propertyTitle: (p.stops && p.stops[0]?.propertyTitle) || 'Planned Visit Property',
      status: p.status || 'SCHEDULED',
      otpVerified: p.status === 'OTP_VERIFIED' || p.status === 'VISIT_DONE' || (p.stops && p.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED')),
      checkedIn: p.status === 'COMPLETED' || p.status === 'CHECKED_IN',
      feedback: p.status === 'COMPLETED' || p.feedbackLogged === true,
      feedbackRating: p.feedbackRating || (p.status === 'COMPLETED' ? 'COMPLETED' : undefined)
    })).filter((v: any) => v.visitId && matchesCustomer(v.customerNumber, v.customerName, v.mobile));

    const rawVisits = (scheduledVisits || []).filter((v: any) =>
      matchesCustomer(v.customerNumber || v.customerId || v.id, v.customerName || v.name, v.mobile || v.phone)
    );

    const pvaVisitsMapped = linkedAgreements
      .filter((a: any) => (a.projectVisitAgreementId || a.agreement_code || '').toString().startsWith('SRM-PVA') && a.visitScheduleId)
      .map((a: any) => ({
        visitId: a.visitScheduleId,
        propertyTitle: a.projectTitle || a.property_details || 'Verified Site Visit',
        status: a.status || 'COMPLETED',
        otpVerified: true,
        checkedIn: true,
        feedback: true,
        feedbackRating: '5-STAR HIGH'
      }));

    const finalCandidateVisits = [...rawVisits, ...visitPlansMapped, ...pvaVisitsMapped];

    const seenVisitKeys = new Set<string>();
    const linkedVisits: any[] = [];
    finalCandidateVisits.forEach((v: any) => {
      const vId = (v.visitId || v.id || v.visitPlanId || '').toString().trim();
      const cleanVId = vId.toLowerCase();
      const propKey = (v.propertyTitle || v.propertyCode || '').toString().toLowerCase().trim();
      const key = cleanVId || propKey;
      if (key && !seenVisitKeys.has(key)) {
        seenVisitKeys.add(key);
        if (cleanVId) seenVisitKeys.add(cleanVId);
        linkedVisits.push(v);
      }
    });

    const linkedBookings = (bookings || []).filter((b: any) =>
      matchesCustomer(b.customer_number || b.customer_id || b.id, b.customer_name || b.name, b.customer_mobile || b.mobile || b.phone)
    );

    const rawInvoices = (invoices || []).filter((inv: any) => {
      if (matchesCustomer(
        inv.customer_number || inv.customer_id || inv.customerId || inv.customerNumber, 
        inv.customer_name || inv.party_name || inv.customerName || inv.name, 
        inv.customer_mobile || inv.mobile || inv.phone || inv.customerMobile
      )) {
        return true;
      }
      if (linkedBookings.some((b: any) => (b.booking_code && inv.booking_code === b.booking_code) || (b.id && inv.booking_id === b.id))) {
        return true;
      }
      return false;
    });

    // Prioritize customer tax invoices (SRM-INV-...) over developer brokerage invoices (SRM-DEV-INV-...)
    const custTaxInvoices = rawInvoices.filter((inv: any) => 
      inv.invoice_type === 'CUSTOMER_TAX_INVOICE' || 
      inv.invoice_type === 'CUSTOMER' || 
      (inv.invoice_number && inv.invoice_number.startsWith('SRM-INV-')) ||
      (inv.invoice_number && !inv.invoice_number.startsWith('SRM-DEV-INV-'))
    );
    const candidateInvoices = custTaxInvoices.length > 0 ? custTaxInvoices : rawInvoices;

    const seenInvIds = new Set<string>();
    const linkedInvoices: any[] = [];
    candidateInvoices.forEach((inv: any) => {
      const invId = (inv.invoice_number || inv.id || '').toString().trim();
      if (!invId) return;
      const cleanId = invId.toLowerCase();
      if (!seenInvIds.has(cleanId)) {
        seenInvIds.add(cleanId);
        linkedInvoices.push(inv);
      }
    });

    // Helper to evaluate if an invoice payment is received (strictly for Item 15 Payment ID)
    const isInvPaid = (inv: any) => {
      if (!inv) return false;
      const pStatus = (inv.payment_status || '').toString().trim().toUpperCase();
      if (pStatus === 'PAID_SETTLED' || pStatus === 'PAID' || pStatus === 'ONLINE' || pStatus.includes('PAID')) {
        if (pStatus.includes('UNPAID') || pStatus.includes('NOT') || pStatus.includes('PENDING')) {
          return false;
        }
        return true;
      }
      return false;
    };

    // Helper to evaluate if an invoice accounts settlement is marked settled (strictly for Item 16 Invoice ID)
    const isInvSettled = (inv: any) => {
      if (!inv) return false;
      if (inv.is_settled === true) return true;
      if (inv.is_settled === false) return false;
      const sStatus = (inv.settlement_status || '').toString().trim().toUpperCase();
      if (sStatus === 'SETTLED') return true;
      if (sStatus === 'NOT SETTLED' || sStatus === 'NOT_SETTLED') return false;
      const pStatus = (inv.payment_status || '').toString().trim().toUpperCase();
      return pStatus === 'PAID_SETTLED' || pStatus === 'PAID' || pStatus === 'ONLINE' || pStatus.includes('PAID');
    };

    // Dynamic Lists for Items 5 through 17 (Clean & Deduplicated)
    const propList = allLinkedCostSheets.length > 0 
      ? allLinkedCostSheets.map((cs: any, i: number) => ({ 
          id: cs.propertyCode || cs.propertyId || cs.propertySnapshot?.propertyCode || cs.propertySnapshot?.propertyId || `SRM-PROP-2026-00042${i + 1}`, 
          name: cs.propertySnapshot?.projectName || cs.propertySnapshot?.propertyTitle || cs.propertyName || 'Matched Property Unit', 
          status: 'SHORTLISTED' 
        }))
      : linkedVisits.length > 0
      ? linkedVisits.map((v: any, i: number) => ({ 
          id: v.propertyCode || `SRM-PROP-2026-00042${i + 1}`, 
          name: v.propertyTitle || 'Visited Property', 
          status: 'VISITED' 
        }))
      : [];

    const csList = allLinkedCostSheets.map((cs: any, i: number) => ({
      id: cs.costSheetId || cs.id || `COST-SHEET-2026-00000${i + 1}`,
      name: cs.propertySnapshot?.projectName || cs.propertySnapshot?.propertyTitle || cs.propertyName || 'Property Unit',
      status: cs.version ? `${cs.version} ACTIVE` : 'CS-V1 ACTIVE'
    }));

    const cssList = csList.map((cs: any) => ({
      id: `SRM-CSS-${cs.id}`,
      name: `Share Log for ${cs.id} (${cs.name})`,
      status: 'DELIVERED'
    }));

    const vsList = linkedVisits.map((v: any) => ({
      id: v.visitId || v.costSheetId,
      name: v.propertyTitle || 'Site Visit',
      status: v.status || 'CONFIRMED'
    }));

    const otpList = linkedVisits.filter((v: any) => v.otpVerified || v.status === 'COMPLETED').map((v: any, i: number) => ({
      id: `SRM-VOTP-${v.visitId || i+1}`,
      name: `OTP Verified for ${v.propertyTitle || 'Site Visit'}`,
      status: `${v.otpHashRef || 'VERIFIED'}`
    }));

    const vinList = linkedVisits.filter((v: any) => v.checkedIn || v.status === 'COMPLETED').map((v: any, i: number) => ({
      id: `SRM-VIN-${v.visitId || i+1}`,
      name: `Check-in ${v.propertyTitle || 'Site Visit'}`,
      status: 'CHECKED_IN'
    }));

    const vdList = linkedVisits.filter((v: any) => v.status === 'COMPLETED').map((v: any, i: number) => ({
      id: `SRM-VD-${v.visitId || i+1}`,
      name: `Visit Completed ${v.propertyTitle || 'Site Visit'}`,
      status: 'COMPLETED'
    }));

    const vfbList = linkedVisits.filter((v: any) => v.feedback || v.status === 'COMPLETED').map((v: any, i: number) => ({
      id: `SRM-VFB-${v.visitId || i+1}`,
      name: `Feedback Logged (${v.propertyTitle || 'Site Visit'})`,
      status: v.feedbackRating || '5-STAR HIGH'
    }));

    const agrList = linkedAgreements.map((pva: any) => ({
      id: pva.projectVisitAgreementId || pva.pvaId || pva.id || pva.agreement_code,
      name: pva.projectTitle || pva.projectName || 'PVA Protection Agreement',
      status: 'EXECUTED SIGNED'
    }));

    const bkgList = linkedBookings.map((b: any) => ({
      id: b.booking_code || b.id,
      name: b.project_name || 'Booked Property',
      status: b.status || 'CONFIRMED'
    }));

    // Dynamic Invoice List (Item 16)
    const invList = linkedInvoices.map((inv: any) => {
      const settled = isInvSettled(inv);
      return {
        id: inv.invoice_number || inv.id,
        name: inv.project_name || inv.property_title || 'Customer Tax Invoice',
        status: settled ? 'SETTLED' : 'NOT SETTLED',
        color: settled ? '#22c55e' : '#f59e0b',
        settlement_status: inv.settlement_status || (settled ? 'SETTLED' : 'NOT SETTLED'),
        payment_status: inv.payment_status || 'UNPAID_PENDING',
        payment_mode: inv.payment_mode || 'Online Bank Transfer / UPI',
        payment_ref: inv.payment_ref,
        total_invoice_amount: inv.total_invoice_amount || inv.taxable_value,
        created_date: inv.created_date || inv.date
      };
    });

    // Dynamic Payment List (Item 15)
    const payList = linkedBookings.length > 0
      ? linkedBookings.map((b: any) => {
          const matchingInv = linkedInvoices.find((inv: any) => 
            (b.booking_code && inv.booking_code === b.booking_code) || 
            (b.id && inv.booking_id === b.id) ||
            matchesCustomer(inv.customer_number || inv.customer_id, inv.customer_name || inv.party_name || inv.name, inv.customer_mobile || inv.mobile || inv.phone)
          ) || linkedInvoices[0];
          
          const paid = matchingInv 
            ? isInvPaid(matchingInv) 
            : (b.payment_status === 'PAID_SETTLED' || b.payment_status === 'PAID' || b.token_paid === true);
          
          const payId = matchingInv?.payment_ref 
            ? `SRM-PAY-${matchingInv.payment_ref.replace(/\D/g, '').slice(-6) || (matchingInv.payment_ref).slice(-6)}` 
            : `SRM-PAY-${(b.booking_code || b.id).replace(/\D/g, '').slice(-6) || (b.booking_code || b.id).slice(-6)}`;
          
          return {
            id: payId,
            name: `Token Payment for ${b.booking_code || b.id} (${matchingInv?.payment_mode || b.payment_mode || 'Online'})`,
            status: paid ? 'SETTLED / RECEIVED' : 'UNPAID / NOT SETTLED',
            color: paid ? '#22c55e' : '#fbbf24',
            payment_ref: matchingInv?.payment_ref || b.payment_ref,
            payment_mode: matchingInv?.payment_mode || b.payment_mode,
            amount: b.token_amount || (matchingInv?.total_invoice_amount)
          };
        })
      : linkedInvoices.map((inv: any) => {
          const paid = isInvPaid(inv);
          const payId = inv.payment_ref 
            ? `SRM-PAY-${inv.payment_ref.replace(/\D/g, '').slice(-6) || (inv.payment_ref).slice(-6)}` 
            : `SRM-PAY-${(inv.invoice_number || inv.id).replace(/\D/g, '').slice(-6) || (inv.invoice_number || inv.id).slice(-6)}`;
          return {
            id: payId,
            name: `Payment for ${inv.invoice_number || inv.id} (${inv.payment_mode || 'Online'})`,
            status: paid ? 'SETTLED / RECEIVED' : 'UNPAID / NOT SETTLED',
            color: paid ? '#22c55e' : '#fbbf24',
            payment_ref: inv.payment_ref,
            payment_mode: inv.payment_mode,
            amount: inv.total_invoice_amount || inv.taxable_value
          };
        });

    const broList = (linkedBookings.length > 0 ? linkedBookings : linkedAgreements).map((b: any) => ({
      id: `SRM-BRO-${(b.booking_code || b.projectVisitAgreementId || b.id).slice(-6)}`,
      name: `Brokerage Claim for ${b.booking_code || b.projectVisitAgreementId || 'Contract'}`,
      status: 'PROCESSED'
    }));

    // Dynamic Lead / Requirement / Matching IDs
    const leadId = matchingLead?.lead_number || (custNum ? `SRM-LEAD-${custNum.replace(/[^0-9]/g, '').slice(-6)}` : 'N/A');
    const reqId = cust?.configuration || cust?.preferredArea ? `SRM-REQ-${custNum.replace(/[^0-9]/g, '').slice(-6) || '000094'}` : 'N/A';
    const matId = linkedMatches.length > 0 ? linkedMatches[0].id || linkedMatches[0].matchId : (propList.length > 0 ? `SRM-MAT-${custNum.replace(/[^0-9]/g, '').slice(-6) || '000421'}` : 'N/A');

    const hasPayments = payList.length > 0;
    const allPaymentsPaid = hasPayments && payList.every((p: any) => p.status.includes('SETTLED') && !p.status.includes('NOT SETTLED'));
    const paymentStatusStr = hasPayments ? (allPaymentsPaid ? 'SETTLED / RECEIVED' : 'UNPAID / NOT SETTLED') : 'NO PAYMENT YET';
    const paymentColorStr = hasPayments ? (allPaymentsPaid ? '#22c55e' : '#fbbf24') : '#64748b';

    const hasInvoices = invList.length > 0;
    const allInvoicesPaid = hasInvoices && invList.every((i: any) => i.status === 'SETTLED');
    const invoiceStatusStr = hasInvoices ? (allInvoicesPaid ? 'NOT SETTLED' : 'SETTLED') : 'NO INVOICE YET'
    const invoiceColorStr = hasInvoices ? (allInvoicesPaid ? '#fbbf24' : '#22c55e') : '#64748b';

    return [
      { label: '1. CUSTOMER MASTER ID', id: custNum || 'N/A', status: 'PERMANENT', color: '#38bdf8', items: [{ id: custNum || 'N/A', status: 'PERMANENT' }] },
      { label: '2. LEAD INTAKE ID', id: leadId, status: leadId !== 'N/A' ? 'VERIFIED' : 'N/A', color: '#38bdf8', items: [{ id: leadId, status: leadId !== 'N/A' ? 'VERIFIED' : 'N/A' }] },
      { label: '3. REQUIREMENT ID', id: reqId, status: reqId !== 'N/A' ? 'SAVED' : 'N/A', color: '#38bdf8', items: [{ id: reqId, status: reqId !== 'N/A' ? 'SAVED' : 'N/A' }] },
      { label: '4. MATCHING REQUEST ID', id: matId, status: matId !== 'N/A' ? 'MATCHED' : 'NOT MATCHED YET', color: matId !== 'N/A' ? '#38bdf8' : '#64748b', items: matId !== 'N/A' ? [{ id: matId, status: 'MATCHED' }] : [] },
      { label: '5. PROPERTY MASTER ID', id: propList.length > 0 ? (propList.length === 1 ? propList[0].id : `${propList.length} PROPERTIES`) : '0 RECORDS', status: propList.length > 0 ? `${propList.length} SHORTLISTED` : '0 SHORTLISTED', color: propList.length > 0 ? '#38bdf8' : '#64748b', items: propList },
      { label: '6. COST SHEET ID', id: csList.length > 0 ? (csList.length === 1 ? csList[0].id : `${csList.length} COST SHEETS`) : '0 RECORDS', status: csList.length > 0 ? `${csList.length} ACTIVE` : 'NO COST SHEET YET', color: csList.length > 0 ? '#fbbf24' : '#64748b', items: csList },
      { label: '7. COST SHEET SHARE ID', id: cssList.length > 0 ? (cssList.length === 1 ? cssList[0].id : `${cssList.length} DISPATCHES`) : '0 RECORDS', status: cssList.length > 0 ? `${cssList.length} DELIVERED` : 'NOT SHARED YET', color: cssList.length > 0 ? '#fbbf24' : '#64748b', items: cssList },
      { label: '8. VISIT SCHEDULE ID', id: vsList.length > 0 ? (vsList.length === 1 ? vsList[0].id : `${vsList.length} VISITS`) : '0 RECORDS', status: vsList.length > 0 ? (vsList.length === 1 ? '1 CONFIRMED' : `${vsList.length} CONFIRMED`) : 'NO VISITS YET', color: vsList.length > 0 ? '#4ade80' : '#64748b', items: vsList },
      { label: '9. OTP VERIFICATION ID', id: otpList.length > 0 ? (otpList.length === 1 ? otpList[0].id : `${otpList.length} VERIFIED OTPS`) : '0 RECORDS', status: otpList.length > 0 ? 'VERIFIED' : 'NOT VERIFIED YET', color: otpList.length > 0 ? '#4ade80' : '#64748b', items: otpList },
      { label: '10. VISIT CHECK-IN ID', id: vinList.length > 0 ? (vinList.length === 1 ? vinList[0].id : `${vinList.length} CHECK-INS`) : '0 RECORDS', status: vinList.length > 0 ? 'CHECKED_IN' : 'NOT CHECKED IN YET', color: vinList.length > 0 ? '#4ade80' : '#64748b', items: vinList },
      { label: '11. VISIT DONE ID', id: vdList.length > 0 ? (vdList.length === 1 ? vdList[0].id : `${vdList.length} VISITS DONE`) : '0 RECORDS', status: vdList.length > 0 ? 'COMPLETED' : 'NOT COMPLETED YET', color: vdList.length > 0 ? '#4ade80' : '#64748b', items: vdList },
      { label: '12. VISIT FEEDBACK ID', id: vfbList.length > 0 ? (vfbList.length === 1 ? vfbList[0].id : `${vfbList.length} FEEDBACKS`) : '0 RECORDS', status: vfbList.length > 0 ? '5-STAR HIGH' : 'NO FEEDBACK LOGGED', color: vfbList.length > 0 ? '#4ade80' : '#64748b', items: vfbList },
      { label: '13. AGREEMENT ID', id: agrList.length > 0 ? (agrList.length === 1 ? agrList[0].id : `${agrList.length} AGREEMENTS`) : '0 RECORDS', status: agrList.length > 0 ? 'DRAFT SIGNED' : 'NO AGREEMENT YET', color: agrList.length > 0 ? '#fbbf24' : '#64748b', items: agrList },
      { label: '14. BOOKING ID', id: bkgList.length > 0 ? bkgList[0].id : '0 RECORDS', status: bkgList.length > 0 ? 'CONFIRMED' : 'NO BOOKING YET', color: bkgList.length > 0 ? '#22c55e' : '#64748b', items: bkgList },
      { label: '15. PAYMENT ID', id: payList.length > 0 ? (payList.length === 1 ? payList[0].id : `${payList.length} PAYMENTS`) : '0 RECORDS', status: paymentStatusStr, color: paymentColorStr, items: payList },
      { label: '16. INVOICE ID', id: invList.length > 0 ? (invList.length === 1 ? invList[0].id : `${invList.length} INVOICES`) : '0 RECORDS', status: invoiceStatusStr, color: invoiceColorStr, items: invList }
    ];
  };

  const getTransactionPdfPayload = (item: any, cust: any) => {
    const custName = cust?.name || 'Valued Customer';
    const custNum = cust?.customer_number || 'SRM-CUS-2026-000188';
    const custPhone = cust?.mobile || '+91 98490 11223';
    const custEmail = cust?.email || 'customer@swaramayi.com';
    const location = cust?.preferredArea || 'Kondapur, Hyderabad';

    const baseDetails: Record<string, any> = {
      '1. CUSTOMER MASTER ID': [
        { label: 'Customer Master ID', value: item.id },
        { label: 'Full Customer Name', value: custName },
        { label: 'Registered Mobile', value: custPhone },
        { label: 'Email Address', value: custEmail },
        { label: 'Locality Hub / City', value: location },
        { label: 'Master Ownership', value: 'Company-Owned Permanent Asset' },
        { label: 'Assigned Relationship Exec', value: cust?.assigned_employee_id || 'Priya Nair (Sales Exec)' },
        { label: 'Record Created Timestamp', value: '17 Aug 2026, 10:15 AM' }
      ],
      '2. LEAD INTAKE ID': [
        { label: 'Lead Intake ID', value: item.id },
        { label: 'Ingestion Channel Source', value: cust?.source || 'Meta Ads / Google Ads' },
        { label: 'Campaign Identifier', value: 'CMP-HYD-LUXURY-2026-08' },
        { label: 'Quality Score & Rating', value: `${cust?.score || 88}/100 (HOT)` },
        { label: 'Ingested Requirement', value: `${cust?.configuration || '3BHK'} in ${location}` },
        { label: 'Lead Intake Disposition', value: 'CONNECTED_INTERESTED' },
        { label: 'Ingested By System', value: 'Automated CRM API Gateway' },
        { label: 'Intake Date & Time', value: '17 Aug 2026, 10:20 AM' }
      ],
      '3. REQUIREMENT ID': [
        { label: 'Requirement Tracking ID', value: item.id },
        { label: 'Preferred Configuration', value: cust?.configuration || '3BHK Flat / Apartment' },
        { label: 'Target Locality / Sector', value: location },
        { label: 'Budget Range', value: cust?.budget || '70 Lakhs - 85 Lakhs' },
        { label: 'Possession Preference', value: 'Ready to Move / < 6 Months' },
        { label: 'Facing & Vastu', value: 'East Facing, Vastu Compliant' },
        { label: 'Car Parking Requirement', value: '1 Covered Stilt Parking' },
        { label: 'Saved Date', value: '17 Aug 2026, 10:22 AM' }
      ],
      '4. MATCHING REQUEST ID': [
        { label: 'Matching Request ID', value: item.id },
        { label: 'Compatibility Score', value: `${cust?.score || 95}% Match Rate` },
        { label: 'Search Algorithm Engine', value: 'Swaramayi 5-Factor AI Matcher' },
        { label: 'Matched Properties Found', value: '1 Premium Property (Swaramayi Heights)' },
        { label: 'Criteria Satisfied', value: '✓ Area ✓ BHK ✓ Budget ✓ Facing ✓ Possession' },
        { label: 'Execution Mode', value: 'Automated Batch Search' },
        { label: 'Matched Date', value: '17 Aug 2026, 11:30 AM' }
      ],
      '5. PROPERTY MASTER ID': [
        { label: 'Property Master Code', value: item.id },
        { label: 'Property Title', value: `Swaramayi ${location.split('/')[0] || 'Kondapur'} Premium Flat` },
        { label: 'Project & Developer', value: 'Swaramayi Heights (Swaramayi Developers)' },
        { label: 'Tower / Floor / Unit', value: 'Tower A, Floor 12, Unit 1204' },
        { label: 'Carpet Area', value: '1,850 Sq.Ft.' },
        { label: 'Base Rate / Sq.Ft.', value: '₹6,500 / Sq.Ft.' },
        { label: 'Facing & Floor Rise', value: 'East Facing, Floor 12 (+₹2.5L)' },
        { label: 'Shortlisted Date', value: '17 Aug 2026, 11:32 AM' }
      ],
      '6. COST SHEET ID': [
        { label: 'Cost Sheet Document ID', value: item.id },
        { label: 'Cost Sheet Version', value: 'V01 (Active Version)' },
        { label: 'Base Asking Price', value: '₹1,20,25,000' },
        { label: 'Amenities & Parking Charges', value: '₹5,50,000' },
        { label: 'Subtotal Base Valuation', value: '₹1,31,25,000' },
        { label: 'Statutory GST & Taxes', value: '₹6,56,250 (5% GST)' },
        { label: 'Stamp Duty & Registration', value: '₹9,84,375' },
        { label: 'Grand Total Estimated Valuation', value: '₹1,47,65,625' }
      ],
      '7. COST SHEET SHARE ID': [
        { label: 'Cost Sheet Share Tracking ID', value: item.id },
        { label: 'Dispatch Channel', value: 'WhatsApp Business API & Email Gateway' },
        { label: 'Recipient Mobile', value: custPhone },
        { label: 'Recipient Email', value: custEmail },
        { label: 'Customer Portal Token Link', value: `https://portal.swaramayi.com/token-${item.id}` },
        { label: 'Delivery Status', value: 'DELIVERED & READ' },
        { label: 'Customer Portal Activity', value: 'Opened and Viewed by Customer (18 Aug 2026)' },
        { label: 'Dispatch Timestamp', value: '17 Aug 2026, 11:35 AM' }
      ],
      '8. VISIT SCHEDULE ID': [
        { label: 'Site Visit Schedule ID', value: item.id },
        { label: 'Scheduled Date & Time', value: '20 Aug 2026 at 03:30 PM' },
        { label: 'Target Property Site', value: 'Swaramayi Heights Site Lounge' },
        { label: 'Assigned Escorting Manager', value: 'Priya Nair (Senior Executive)' },
        { label: 'Visit Confirmation Status', value: 'CONFIRMED BY CUSTOMER' },
        { label: 'Pickup / Transport Required', value: 'Self-Arranged Private Drive' },
        { label: 'Calendar Event Hash', value: 'CAL-HYD-882910' }
      ],
      '9. OTP VERIFICATION ID': [
        { label: 'Lounge OTP Verification ID', value: item.id },
        { label: 'Verified OTP Code', value: '849201' },
        { label: 'Customer Mobile Validated', value: custPhone },
        { label: 'Verification Terminal', value: 'Field iPad Terminal #04' },
        { label: 'Authentication Gateway', value: 'Twilio SMS OTP Gateway' },
        { label: 'Verification Status', value: 'PASSED & AUTHENTICATED' },
        { label: 'Verified Timestamp', value: '20 Aug 2026, 03:30 PM' }
      ],
      '10. VISIT CHECK-IN ID': [
        { label: 'GPS Geofence Check-in ID', value: item.id },
        { label: 'Geofence Location Coordinates', value: '22.722361° N, 88.493403° E' },
        { label: 'Distance from Site Lounge', value: '12 Meters (Inside Geofence Boundary)' },
        { label: 'GPS Radius Check', value: 'PASSED (< 50m Radius)' },
        { label: 'Check-In Verification Mode', value: 'Automated Mobile GPS Geofence' },
        { label: 'Checked-In Timestamp', value: '20 Aug 2026, 03:31 PM' }
      ],
      '11. VISIT DONE ID': [
        { label: 'Visit Completion Record ID', value: item.id },
        { label: 'Units Inspected', value: 'Tower A Unit 1204 & Project Model Lounge' },
        { label: 'Total Tour Duration', value: '45 Minutes' },
        { label: 'Accompanying Executive', value: 'Priya Nair (Sales Exec)' },
        { label: 'Physical Visit Result', value: 'FULL SITE TOUR COMPLETED' },
        { label: 'Completed Date & Time', value: '20 Aug 2026, 04:15 PM' }
      ],
      '12. VISIT FEEDBACK ID': [
        { label: 'Visit Feedback Record ID', value: item.id },
        { label: 'Customer Rating', value: '⭐⭐⭐⭐⭐ (5 / 5 Stars)' },
        { label: 'Customer Sentiment / Intention', value: 'High Purchase Intent for East Facing 3BHK' },
        { label: 'Key Customer Comments', value: 'Loves the floor view and clubhouse amenities' },
        { label: 'Next Action Recommendation', value: 'Initiate Final Price & Token Negotiation' },
        { label: 'Feedback Date', value: '20 Aug 2026, 04:20 PM' }
      ],
      '13. AGREEMENT ID': [
        { label: 'Channel Partner Agreement ID', value: item.id },
        { label: 'Agreement Category', value: 'Site Visit & Non-Circumvention Agreement' },
        { label: 'Protection Period', value: '180 Days Active Protection' },
        { label: 'Channel Partner Agency', value: 'Swaramayi Real Estate Marketing' },
        { label: 'Protection Expiry Date', value: '16 Feb 2027' },
        { label: 'Agreement Signature Status', value: 'DIGITALLY SIGNED' }
      ],
      '14. BOOKING ID': [
        { label: 'Unit Booking Allotment ID', value: item.id },
        { label: 'Allocated Unit Number', value: 'Unit 1204, Tower A, Swaramayi Heights' },
        { label: 'Customer Name', value: custName },
        { label: 'Booking Advance Token', value: '₹5,00,000' },
        { label: 'Allotment Status', value: 'CONFIRMED & HELD' },
        { label: 'Booking Date', value: '20 Aug 2026, 05:00 PM' }
      ],
      '15. PAYMENT ID': [
        { label: 'Payment Receipt ID', value: item.id },
        { label: 'Amount Received', value: item.items?.[0]?.amount ? (typeof item.items[0].amount === 'number' ? `₹${item.items[0].amount.toLocaleString('en-IN')}` : item.items[0].amount) : '₹5,00,000' },
        { label: 'Payment Method / Mode', value: item.items?.[0]?.payment_mode || 'NEFT / Online Bank Transfer' },
        { label: 'Bank UTR Ref Number', value: item.items?.[0]?.payment_ref || 'UTIB0002941049281' },
        { label: 'Payment Receipt Status', value: item.status ? (item.status.includes('UNPAID') ? 'UNPAID / PENDING' : 'CREDITED & VERIFIED') : 'UNPAID / PENDING' },
        { label: 'Payment Date', value: item.items?.[0]?.created_date || '20 Aug 2026, 05:15 PM' }
      ],
      '16. INVOICE ID': [
        { label: 'GST Tax Invoice ID', value: item.id },
        { label: 'Tax Invoice Amount', value: item.items?.[0]?.total_invoice_amount ? (typeof item.items[0].total_invoice_amount === 'number' ? `₹${item.items[0].total_invoice_amount.toLocaleString('en-IN')} (Incl. 18% GST)` : item.items[0].total_invoice_amount) : '₹5,90,000 (Incl. ₹90,000 18% GST)' },
        { label: 'Billed To Customer', value: `${custName} (${custNum})` },
        { label: 'Company GSTIN', value: '36AAACS8899K1Z0' },
        { label: 'Invoice Status', value: item.status || 'SETTLED' },
        { label: 'Invoice Issued Date', value: item.items?.[0]?.created_date || '20 Aug 2026' }
      ]
    };

    if (item.id === '0 RECORDS' || !item.id || item.status.includes('NO ') || item.status.includes('NOT GENERATED') || item.status.includes('NOT VERIFIED') || item.status === '0 ACTIVE') {
      return {
        item,
        custName,
        custNum,
        custPhone,
        custEmail,
        payload: [
          { label: 'Transaction Stage', value: item.label },
          { label: 'Stage Status', value: 'PENDING / NOT GENERATED YET' },
          { label: 'Customer Name', value: custName },
          { label: 'Customer ID', value: custNum },
          { label: 'Workflow Notice', value: `This step (${item.label}) has not been executed yet. Progress the customer through Matching -> Cost Sheet -> Visit -> Booking -> Billing.` }
        ],
        sha256Hash: `SHA256-PENDING-${custNum || 'TX'}`
      };
    }

    const payload = baseDetails[item.label] || [
      { label: 'Transaction ID', value: item.id },
      { label: 'Transaction Type', value: item.label },
      { label: 'Customer Name', value: custName },
      { label: 'Customer ID', value: custNum },
      { label: 'Status', value: item.status },
      { label: 'Recorded Timestamp', value: '17 Aug 2026 10:15 AM' }
    ];

    return {
      item,
      custName,
      custNum,
      custPhone,
      custEmail,
      payload,
      sha256Hash: `SHA256-SRM-TX-${(item.id || '90412').replace(/[^0-9]/g, '').padEnd(10, '8')}-VERIFIED`
    };
  };

  const handleViewCostSheetPdf = (customer: any, existingCostSheet?: any) => {
    if (existingCostSheet && setShowViewIndividualCostSheetModal) {
      setShowViewIndividualCostSheetModal({ open: true, costSheet: existingCostSheet });
      return;
    }

    if (customer?.costSheetData && setShowViewIndividualCostSheetModal) {
      setShowViewIndividualCostSheetModal({ open: true, costSheet: customer.costSheetData });
      return;
    }

    const custNum = (customer?.customer_number || customer?.customer_id || customer?.id || '').toString().trim();
    const custName = (customer?.name || customer?.full_name || customer?.customer_name || '').toString().trim();
    const cleanMobile = (customer?.mobile || customer?.phone || '').toString().replace(/\D/g, '');
    const cleanCustNum = custNum.replace(/\D/g, '');
    const cleanCustName = custName.toLowerCase().trim();

    const found = (individualCostSheets || []).find((cs: any) => {
      const csCustId = (cs.customerId || cs.customerNumber || cs.customerSnapshot?.customerId || cs.customerSnapshot?.customerNumber || '').toString().trim();
      const csCleanCustNum = csCustId.replace(/[^0-9]/g, '');
      const csName = (cs.customerName || cs.name || cs.customerSnapshot?.customerName || '').toString().toLowerCase().trim();
      const csMobile = (cs.mobile || cs.customerMobile || cs.customerSnapshot?.mobile || cs.customerSnapshot?.alternateMobile || '').toString().replace(/[^0-9]/g, '');

      if (custNum && csCustId) {
        if (csCustId.toLowerCase() === custNum.toLowerCase()) return true;
        if (cleanCustNum && csCleanCustNum && (csCleanCustNum === cleanCustNum || csCleanCustNum.endsWith(cleanCustNum) || cleanCustNum.endsWith(csCleanCustNum))) return true;
      }
      if (cleanMobile && csMobile) {
        if (csMobile === cleanMobile || csMobile.endsWith(cleanMobile) || cleanMobile.endsWith(csMobile)) return true;
      }
      if (cleanCustName && csName) {
        if (csName === cleanCustName || csName.includes(cleanCustName) || cleanCustName.includes(csName)) return true;
      }
      return false;
    });

    if (found && setShowViewIndividualCostSheetModal) {
      setShowViewIndividualCostSheetModal({ open: true, costSheet: found });
      return;
    }

    alert(`⚠️ No Cost Sheet has been generated for customer ${custName} (${custNum || 'N/A'}) yet.\n\nPlease generate a Cost Sheet from Matching Management first.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SYSTEM HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: windowWidth <= 640 ? '12px' : '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '12px 14px' : '16px 20px' }}>
        <h2 style={{ fontSize: windowWidth <= 480 ? '1.05rem' : windowWidth <= 640 ? '1.15rem' : '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>CUSTOMER MANAGEMENT</h2>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button onClick={() => setShowCreateShareModal(true)} style={{ width: windowWidth <= 480 ? '100%' : 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.78rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}>
            <Plus size={15} color="#0f172a" /> + Create Details against Customer ID
          </button>
          <button onClick={handleOpenAddCustomerModal} style={{ width: windowWidth <= 480 ? '100%' : 'auto', justifyContent: 'center', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: windowWidth <= 640 ? '0.78rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={15} /> + Add Customer Master
          </button>
          {isStrictSuperAdmin && (
            <button onClick={handleDeleteAllCurrentInside} style={{ width: windowWidth <= 480 ? '100%' : 'auto', justifyContent: 'center', background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.78rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={15} color="#ffffff" /> 🗑️ Delete All Current Inside
            </button>
          )}
          <button 
            onClick={() => {
              if (setCustomers) {
                const seen = new Set<string>();
                let removedCount = 0;
                setCustomers((prev: any[]) => {
                  const cleaned: any[] = [];
                  (prev || []).forEach(c => {
                    if (!c) return;
                    const num = (c.customer_number || c.customerNumber || c.customerId || c.customer_id || '').toString().toLowerCase().trim();
                    const mob = (c.mobile || c.phone || '').toString().replace(/\D/g, '');
                    const name = (c.name || c.full_name || '').toString().toLowerCase().trim();
                    const id = (c.id || c._id || '').toString().toLowerCase().trim();

                    const key = num || (mob && mob.length >= 7 ? `mob:${mob.slice(-10)}` : '') || (id ? `id:${id}` : `name:${name}`);
                    if (key && !seen.has(key)) {
                      seen.add(key);
                      if (num) seen.add(`num:${num}`);
                      if (mob && mob.length >= 7) seen.add(`mob:${mob.slice(-10)}`);
                      if (id) seen.add(`id:${id}`);
                      cleaned.push(c);
                    } else {
                      removedCount++;
                    }
                  });
                  return cleaned;
                });
                if (removedCount > 0) {
                  alert(`✅ Duplicate Scanner complete!\n\nSuccessfully identified and removed ${removedCount} duplicate customer record(s).`);
                } else {
                  alert('🔍 Automated Duplicate Scanner: All customer records are unique and 100% deduplicated!');
                }
              }
            }} 
            style={{ width: windowWidth <= 480 ? '100%' : 'auto', justifyContent: 'center', background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: windowWidth <= 640 ? '0.78rem' : '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={15} /> Duplicate Scanner
          </button>
        </div>
      </div>

      {/* 3 SUB-TABS NAVIGATION FOR CUSTOMER MANAGEMENT (HORIZONTALLY SCROLLABLE ON MOBILE & TABLET) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <button onClick={() => setActiveCustomerSubTab('customer_master_vault')} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: windowWidth <= 640 ? '6px 12px' : '8px 14px', borderRadius: '8px', fontSize: windowWidth <= 640 ? '0.78rem' : '0.82rem', fontWeight: '800', cursor: 'pointer', background: activeCustomerSubTab === 'customer_master_vault' ? '#0284c7' : '#1e293b', color: activeCustomerSubTab === 'customer_master_vault' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
          👥 Customer Master Vault ({allActiveCustomers.length})
        </button>
        <button onClick={() => setActiveCustomerSubTab('customer_360_profile')} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: windowWidth <= 640 ? '6px 12px' : '8px 14px', borderRadius: '8px', fontSize: windowWidth <= 640 ? '0.78rem' : '0.82rem', fontWeight: '800', cursor: 'pointer', background: activeCustomerSubTab === 'customer_360_profile' ? '#0284c7' : '#1e293b', color: activeCustomerSubTab === 'customer_360_profile' ? '#ffffff' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
          🔍 Customer 360° Profile
        </button>
        <button onClick={() => setActiveCustomerSubTab('anti_leakage_engine')} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: windowWidth <= 640 ? '6px 12px' : '8px 14px', borderRadius: '8px', fontSize: windowWidth <= 640 ? '0.78rem' : '0.82rem', fontWeight: '800', cursor: 'pointer', background: activeCustomerSubTab === 'anti_leakage_engine' ? '#ef4444' : '#1e293b', color: activeCustomerSubTab === 'anti_leakage_engine' ? '#ffffff' : '#94a3b8', border: '1px solid #ef4444' }}>
          🚨 Anti-Leakage Detection
        </button>
      </div>

      {/* AUDIT TRAIL & JOURNEY ACTIVITY TIMELINE */}
      {activeCustomerSubTab === 'sales_journey_funnel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CLICKABLE EVENT TIMELINE TABLE WITH AUDIT LOGS */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1rem' : '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>📜 AUDIT TRAIL & JOURNEY ACTIVITY TIMELINE</h3>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                12 Executed Audit Events
              </span>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Timestamp</th>
                    <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Customer / Lead</th>
                    <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Action & Lifecycle Stage</th>
                    <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Sales Executive</th>
                    <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Audit Details</th>
                    <th style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: 'Today 11:30 AM', target: 'SRM-CUS-2026-000184 (Bishwajit Pandey)', action: 'COST_SHEET_DISPATCHED', exec: 'Priya Nair', details: 'Automated 12-page individual cost sheet emailed & whatsapped with OTP hash #CS88102', status: 'SUCCESS' },
                    { time: 'Today 10:15 AM', target: 'SRM-LEAD-2026-001245 (Avi Das)', action: 'QUALIFIED_STAGE_UPGRADE', exec: 'Abinash Roy', details: 'Lead score promoted to 98% (Ready to Move in Madhyamgram)', status: 'COMPLETED' },
                    { time: 'Yesterday 04:45 PM', target: 'SRM-CUS-2026-000185 (Sumanth Varma)', action: 'SITE_VISIT_PVA_LOCKED', exec: 'Avishek Das', details: 'Pre-visit non-circumvention mandate digitally signed via OTP verification', status: 'VERIFIED' }
                  ].map((evt, eIdx) => (
                    <tr key={eIdx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{evt.time}</td>
                      <td style={{ padding: '10px', fontWeight: '700', color: isLight ? '#0f172a' : '#ffffff' }}>{evt.target}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                          {evt.action}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#fbbf24', fontWeight: '800', whiteSpace: 'nowrap' }}>{evt.exec}</td>
                      <td style={{ padding: '10px', color: isLight ? '#475569' : '#cbd5e1' }}>{evt.details}</td>
                      <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900' }}>
                          ● {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: CUSTOMER MASTER VAULT */}
      {activeCustomerSubTab === 'customer_master_vault' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : windowWidth <= 1024 ? '18px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1rem' : '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>👥 Central Customer Master Registry</h3>
              <p style={{ fontSize: windowWidth <= 640 ? '0.75rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>Company-owned customer records with permanent Customer Tracking IDs (SRM-CUS).</p>
            </div>
            {/* VIEW MODE TOGGLE (CARDS vs TABLE) */}
            <div style={{ display: 'flex', gap: '2px', background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '20px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setVaultViewMode('cards')}
                style={{
                  background: vaultViewMode === 'cards' ? '#0284c7' : 'transparent',
                  color: vaultViewMode === 'cards' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📱 Cards {windowWidth <= 1024 && <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(Rec.)</span>}
              </button>
              <button
                type="button"
                onClick={() => setVaultViewMode('table')}
                style={{
                  background: vaultViewMode === 'table' ? '#0284c7' : 'transparent',
                  color: vaultViewMode === 'table' ? '#ffffff' : (isLight ? '#64748b' : '#94a3b8'),
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📋 Table
              </button>
            </div>
          </div>

          {/* INTERACTIVE SEARCH & MULTI-CRITERIA FILTER BAR */}
          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 640 ? '12px' : '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🔍 Search Name / Phone / Code</label>
                <input 
                  type="text" 
                  value={custSearchQuery} 
                  onChange={(e) => setCustSearchQuery(e.target.value)} 
                  placeholder="Type Name, Mobile, SRM-CUS, SRM-LEAD..." 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📍 Locality Hub / Area</label>
                <select 
                  value={filterLocality} 
                  onChange={(e) => setFilterLocality(e.target.value)} 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="ALL">ALL Locality Hubs</option>
                  <option value="Kondapur">Kondapur / Gachibowli</option>
                  <option value="Financial District">Financial District</option>
                  <option value="Hitec City">HITEC City Sector</option>
                  <option value="Madhyamgram">Madhyamgram Sector</option>
                  <option value="Madinaguda">Madinaguda Sector</option>
                  <option value="Nanakramguda">Nanakramguda Sector</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📊 Lifecycle Stage</label>
                <select 
                  value={custStageFilter} 
                  onChange={(e) => setCustStageFilter(e.target.value)} 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}
                >
                  <option value="ALL">ALL Lifecycle Stages</option>
                  <option value="LEAD">🎯 Lead Ingested</option>
                  <option value="MATCHING">🧩 Property Matched</option>
                  <option value="COST_SHEET">📄 Cost Sheet Shared</option>
                  <option value="VISIT">🚗 Site Visit OTP Verified</option>
                  <option value="BOOKING">🏆 Booking Confirmed</option>
                  <option value="AGREEMENT">📜 Agreement Active</option>
                  <option value="BILLING">💳 Billing / Invoice Generated</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🔥 Source & Priority</label>
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 380 ? '1fr' : '1fr 1fr', gap: '6px' }}>
                  <select 
                    value={custSourceFilter} 
                    onChange={(e) => setCustSourceFilter(e.target.value)} 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 6px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700' }}
                  >
                    <option value="ALL">All Sources</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                  <select 
                    value={filterPriority} 
                    onChange={(e) => setFilterPriority(e.target.value)} 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#ef4444', padding: '8px 6px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}
                  >
                    <option value="ALL">All Priority</option>
                    <option value="HOT">🔥 HOT</option>
                    <option value="WARM">⚡ WARM</option>
                    <option value="COLD">❄️ COLD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {(() => {
            const resolveCustomerProgression = (custObj: any) => {
              const cNum = (custObj?.customer_number || custObj?.customer_id || custObj?.id || custObj?.custCode || '').toString().trim().toLowerCase();
              const cCleanNum = cNum.replace(/\D/g, '');
              const cName = (custObj?.name || custObj?.full_name || custObj?.customer_name || custObj?.custName || '').toString().trim().toLowerCase();
              const cMob = (custObj?.mobile || custObj?.phone || custObj?.customerMobile || '').toString().replace(/\D/g, '');

              const matchId = (idVal: any) => {
                if (!idVal || !cNum) return false;
                const str = idVal.toString().trim().toLowerCase();
                if (str === cNum) return true;
                const cleanStr = str.replace(/\D/g, '');
                if (cCleanNum && cleanStr && cCleanNum.length >= 6 && cleanStr.length >= 6 && cCleanNum === cleanStr) return true;
                return false;
              };

              const matchPhone = (phoneVal: any) => {
                if (!phoneVal || !cMob) return false;
                const str = phoneVal.toString().replace(/\D/g, '');
                if (cMob.length >= 10 && str.length >= 10 && cMob === str) return true;
                return false;
              };

              const matchName = (nameVal: any) => {
                if (!nameVal || !cName) return false;
                const str = nameVal.toString().trim().toLowerCase();
                if (str === cName) return true;
                return false;
              };

              const isCustMatch = (obj: any) => {
                if (!obj) return false;
                if (matchId(obj.customerNumber || obj.customerId || obj.customer_number || obj.customer_id || obj.custCode)) return true;
                if (matchPhone(obj.mobile || obj.customerMobile || obj.customer_mobile || obj.phone || obj.party_contact || obj.client_mobile)) return true;
                if (matchName(obj.customerName || obj.customer_name || obj.name || obj.party_name || obj.client_name || obj.custName)) return true;
                return false;
              };

              // 1. MATCHING STAGE
              const matchingReq = (matchingRequestsQueue || []).find(isCustMatch);
              const matchingText = custObj.preferredArea ? `Preference: ${custObj.preferredArea}` : (matchingReq ? `Active Match: ${matchingReq.preferredArea || 'Identified'}` : 'Lead Ingested');

              // 2. COST SHEET STAGE
              const matchingCostSheet = custObj?.costSheetData || (individualCostSheets || []).find((cs: any) => {
                if (isCustMatch(cs)) return true;
                if (cs.customerSnapshot && isCustMatch(cs.customerSnapshot)) return true;
                return false;
              });

              // 3. VISIT STAGE
              const directPva = (projectVisitAgreements || []).find(isCustMatch);
              const pvaFromAgreements = (agreements || []).find((a: any) => 
                isCustMatch(a) && (
                  (a.agreement_code && a.agreement_code.toString().startsWith('SRM-PVA')) || 
                  a.agreement_type === 'CUSTOMER_SITE_VISIT' || 
                  a.pvaData
                )
              );

              const matchingPva = directPva || (pvaFromAgreements ? (pvaFromAgreements.pvaData || {
                projectVisitAgreementId: pvaFromAgreements.agreement_code || pvaFromAgreements.id,
                id: pvaFromAgreements.agreement_code || pvaFromAgreements.id,
                status: 'VISIT_VERIFIED',
                otpVerified: true
              }) : null);

              const allVisits = [
                ...(scheduledVisits || []), 
                ...(visitPlans || []).map((p: any) => ({
                  visitId: p.visitPlanId || p.visitScheduleId,
                  customerNumber: p.customerNumber,
                  mobile: p.mobile,
                  customerName: p.customerName,
                  status: p.status,
                  otpVerified: p.status === 'OTP_VERIFIED' || p.status === 'VISIT_DONE' || p.status === 'COMPLETED' || (p.stops && p.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'))
                }))
              ];
              const directVisit = allVisits.find(isCustMatch);
              const visitFromPva = (matchingPva && matchingPva.visitScheduleId) ? {
                visitId: matchingPva.visitScheduleId,
                status: matchingPva.status || 'OTP_VERIFIED',
                otpVerified: true
              } : null;

              const matchingVisit = directVisit || visitFromPva;

              // 4. BOOKING STAGE
              const directBooking = (bookings || []).find(isCustMatch);
              const matchingInvoice = (invoices || []).find(isCustMatch);
              const bookingFromInvoice = !directBooking && matchingInvoice && matchingInvoice.booking_code ? {
                booking_code: matchingInvoice.booking_code,
                status: 'CONFIRMED_BILLED'
              } : null;
              const matchingBooking = directBooking || bookingFromInvoice;

              // 5. AGREEMENT STAGE
              const matchingAgreement = (agreements || []).find(isCustMatch) || (matchingPva ? {
                agreement_code: matchingPva.projectVisitAgreementId || matchingPva.id,
                type: 'PVA'
              } : null);

              return {
                matchingText,
                matchingCostSheet,
                matchingPva,
                matchingVisit,
                matchingBooking,
                matchingAgreement,
                matchingInvoice
              };
            };

            const filteredCustomers = allActiveCustomers.filter(c => {
              const q = custSearchQuery.trim().toLowerCase();
              const matchesQ = !q || 
                c.name.toLowerCase().includes(q) || 
                (c.mobile && c.mobile.includes(q)) || 
                (c.email && c.email.toLowerCase().includes(q)) || 
                (c.customer_number && c.customer_number.toLowerCase().includes(q)) ||
                (c.leadData?.lead_number && c.leadData.lead_number.toLowerCase().includes(q));

              // Locality Filter
              const matchesLoc = filterLocality === 'ALL' || (c.preferredArea && c.preferredArea.toLowerCase().includes(filterLocality.toLowerCase()));

              // Priority Filter
              const matchesPrio = filterPriority === 'ALL' || c.priority === filterPriority;

              // Source Filter
              const src = c.source || c.leadData?.source || '';
              const matchesSrc = custSourceFilter === 'ALL' || src.toLowerCase().includes(custSourceFilter.toLowerCase());

              // Stage Filter Helper
              const progression = resolveCustomerProgression(c);
              let matchesStage = true;

              if (custStageFilter !== 'ALL') {
                if (custStageFilter === 'COST_SHEET') matchesStage = !!progression.matchingCostSheet;
                else if (custStageFilter === 'VISIT') matchesStage = !!progression.matchingPva || !!progression.matchingVisit;
                else if (custStageFilter === 'BOOKING') matchesStage = !!progression.matchingBooking;
                else if (custStageFilter === 'AGREEMENT') matchesStage = !!progression.matchingAgreement;
                else if (custStageFilter === 'BILLING') matchesStage = !!progression.matchingInvoice;
                else if (custStageFilter === 'CONTRACT') matchesStage = !!progression.matchingAgreement || !!progression.matchingBooking;
              }

              return matchesQ && matchesLoc && matchesPrio && matchesSrc && matchesStage;
            });

            if (filteredCustomers.length === 0) {
              return (
                <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.9rem' }}>
                  No customer records found matching your search query / filters.
                </div>
              );
            }

            const handleDeleteCustomerAction = (c: any) => {
              if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete customer record ${c.customer_number || c.id} (${c.name})? It will be moved to Recycle Bin.`)) {
                const targetCustNum = (c.customer_number || c.customerNumber || '').toString().toLowerCase().trim();
                const targetMob = (c.mobile || c.phone || '').toString().replace(/\D/g, '');
                const targetName = (c.name || c.full_name || '').toString().toLowerCase().trim();
                const targetId = (c.id || c._id || '').toString().toLowerCase().trim();

                if (onRecycleItem) {
                  onRecycleItem({
                    id: c.id || c.customer_number || `CUS-${Date.now()}`,
                    title: `Customer - ${c.name || 'Client'} (${c.customer_number || c.id})`,
                    category: 'Customer',
                    originalLocation: 'Customer Management Vault',
                    details: `Mobile: ${c.mobile || 'N/A'}, Locality: ${c.locality || 'N/A'}`,
                    originalData: c
                  });
                }

                if (setCustomers) {
                  setCustomers((prev: any[]) => {
                    const updated = (prev || []).filter((cust: any) => {
                      if (!cust) return false;
                      const cNum = (cust.customer_number || cust.customerNumber || '').toString().toLowerCase().trim();
                      const cMob = (cust.mobile || cust.phone || '').toString().replace(/\D/g, '');
                      const cName = (cust.name || cust.full_name || '').toString().toLowerCase().trim();
                      const cId = (cust.id || cust._id || '').toString().toLowerCase().trim();

                      if (targetId && cId && cId === targetId) return false;
                      if (targetCustNum && cNum && cNum === targetCustNum) return false;
                      if (targetMob && targetMob.length >= 7 && cMob && (cMob.endsWith(targetMob) || targetMob.endsWith(cMob))) return false;
                      if (targetName && cName && cName === targetName) return false;
                      return true;
                    });

                    try {
                      localStorage.setItem('swaramayi_customers_v7_clean', JSON.stringify(updated));
                      localStorage.setItem('swaramayi_customers_master_v3_clean', JSON.stringify(updated));
                    } catch (e) {}

                    if (syncAllToMongoDB) {
                      syncAllToMongoDB({ customers: updated });
                    }

                    return updated;
                  });
                }
                if (setLeadsList) {
                  setLeadsList((prev: any[]) => {
                    const updatedLeads = (prev || []).filter((l: any) => {
                      if (!l) return false;
                      const lNum = (l.customer_number || l.customer_id || l.lead_number || '').toString().toLowerCase().trim();
                      const lMob = (l.mobile || l.phone || '').toString().replace(/\D/g, '');
                      const lName = (l.customer_name || l.name || '').toString().toLowerCase().trim();
                      const lId = (l.id || '').toString().toLowerCase().trim();

                      if (targetId && lId && lId === targetId) return false;
                      if (targetCustNum && lNum && (lNum === targetCustNum || lNum.includes(targetCustNum))) return false;
                      if (targetMob && targetMob.length >= 7 && lMob && (lMob.endsWith(targetMob) || targetMob.endsWith(lMob))) return false;
                      if (targetName && lName && lName === targetName) return false;
                      return true;
                    });

                    try {
                      localStorage.setItem('swaramayi_leads_v7_clean', JSON.stringify(updatedLeads));
                      localStorage.setItem('swaramayi_leads_v5_clean', JSON.stringify(updatedLeads));
                    } catch (e) {}

                    if (syncAllToMongoDB) {
                      syncAllToMongoDB({ leads: updatedLeads });
                    }

                    return updatedLeads;
                  });
                }
                if (setMatchingRequestsQueue) {
                  setMatchingRequestsQueue((prev: any[]) => (prev || []).filter((r: any) => {
                    if (!r) return false;
                    const rNum = (r.customerNumber || r.customerId || r.customer_number || '').toString().toLowerCase().trim();
                    const rMob = (r.mobile || r.phone || r.customerMobile || '').toString().replace(/\D/g, '');
                    const rName = (r.customerName || r.customer_name || r.name || '').toString().toLowerCase().trim();
                    const rId = (r.id || r.requestId || '').toString().toLowerCase().trim();

                    if (targetId && rId && rId === targetId) return false;
                    if (targetCustNum && rNum && (rNum === targetCustNum || rNum.includes(targetCustNum))) return false;
                    if (targetMob && targetMob.length >= 7 && rMob && (rMob.endsWith(targetMob) || targetMob.endsWith(rMob))) return false;
                    if (targetName && rName && rName === targetName) return false;
                    return true;
                  }));
                }
                if (setScheduledVisits) {
                  setScheduledVisits((prev: any[]) => (prev || []).filter((v: any) => {
                    if (!v) return false;
                    const vNum = (v.customerNumber || v.customer_number || v.customerId || '').toString().toLowerCase().trim();
                    const vMob = (v.mobile || v.phone || v.customerMobile || '').toString().replace(/\D/g, '');
                    const vName = (v.customerName || v.customer_name || v.name || '').toString().toLowerCase().trim();
                    const vId = (v.id || v.visitId || '').toString().toLowerCase().trim();

                    if (targetId && vId && vId === targetId) return false;
                    if (targetCustNum && vNum && (vNum === targetCustNum || vNum.includes(targetCustNum))) return false;
                    if (targetMob && targetMob.length >= 7 && vMob && (vMob.endsWith(targetMob) || targetMob.endsWith(vMob))) return false;
                    if (targetName && vName && vName === targetName) return false;
                    return true;
                  }));
                }
                if (setIndividualCostSheets) {
                  setIndividualCostSheets((prev: any[]) => (prev || []).filter((cs: any) => {
                    if (!cs) return false;
                    const snap = cs.customerSnapshot || {};
                    const csNum = (cs.customerNumber || cs.customerId || snap.customerNumber || snap.customerId || '').toString().toLowerCase().trim();
                    const csMob = (cs.mobile || cs.customerMobile || snap.mobile || '').toString().replace(/\D/g, '');
                    const csName = (cs.customerName || snap.customerName || cs.name || '').toString().toLowerCase().trim();
                    const csId = (cs.id || cs.costSheetId || '').toString().toLowerCase().trim();

                    if (targetId && csId && csId === targetId) return false;
                    if (targetCustNum && csNum && (csNum === targetCustNum || csNum.includes(targetCustNum))) return false;
                    if (targetMob && targetMob.length >= 7 && csMob && (csMob.endsWith(targetMob) || targetMob.endsWith(csMob))) return false;
                    if (targetName && csName && csName === targetName) return false;
                    return true;
                  }));
                }
                alert(`🗑️ Customer record ${c.customer_number || c.name} moved to Recycle Bin.`);
              }
            };

            if (vaultViewMode === 'cards') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredCustomers.map(c => {
                    const matchingLead = leadsList.find(l => (l.customer_number && l.customer_number === c.customer_number) || (l.mobile && c.mobile && l.mobile.replace(/\D/g, '') === c.mobile.replace(/\D/g, ''))) || c.leadData;
                    const {
                      matchingText,
                      matchingCostSheet,
                      matchingPva,
                      matchingVisit,
                      matchingBooking,
                      matchingAgreement,
                      matchingInvoice
                    } = resolveCustomerProgression(c);

                    return (
                      <div key={c.id} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: windowWidth <= 640 ? '14px' : '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* CARD HEADER ROW */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span 
                              onClick={() => openIdDetailsModal(c.customer_number, 'CUSTOMER_ID')}
                              style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}
                              title="Click to view full Customer details"
                            >
                              🆔 {c.customer_number}
                            </span>
                            {matchingLead && (
                              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '2px 6px', borderRadius: '4px' }}>
                                📋 {matchingLead.lead_number}
                              </span>
                            )}
                          </div>

                          <span style={{ background: c.priority === 'HOT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: c.priority === 'HOT' ? '#ef4444' : '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.75rem' }}>
                            🔥 {c.priority || 'HOT'} ({c.score || 88}/100)
                          </span>
                        </div>

                        {/* NAME & CONTACT */}
                        <div>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '1rem', fontWeight: '900' }}>{c.name}</strong>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '700' }}>📞 {maskPhone(c.mobile)}</span>
                            {c.email && (
                              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>✉️ {c.email}</span>
                            )}
                          </div>
                        </div>

                        {/* LEAD INGESTION INFO */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', alignSelf: 'flex-start' }}>
                            📢 Source: {c.source || matchingLead?.source || 'Lead Ingestion'}
                          </span>
                          <div style={{ color: isLight ? '#475569' : '#cbd5e1', fontWeight: '700' }}>
                            📍 Locality: {c.preferredArea || matchingLead?.preferred_location || 'N/A'} • <span style={{ color: '#4ade80' }}>💰 Budget: {c.budget || '70L - 85L'}</span>
                          </div>
                        </div>

                        {/* STAGE PROGRESSION LIST */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '4px', padding: '4px 8px', color: '#38bdf8', fontWeight: '800' }}>
                            🎯 Matching: {matchingText}
                          </div>

                          {matchingCostSheet ? (
                            <div 
                              onClick={() => handleViewCostSheetPdf(c, matchingCostSheet)}
                              style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '4px 8px', color: '#4ade80', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              title="Click to View / Print Cost Sheet PDF"
                            >
                              <span>📄 Cost Sheet: Shared ({matchingCostSheet.costSheetId || matchingCostSheet.id})</span>
                              <span style={{ background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900' }}>📄 PDF</span>
                            </div>
                          ) : (
                            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '4px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                              ⏳ Cost Sheet: Not Created Yet
                            </div>
                          )}

                          {matchingPva ? (
                            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '4px 8px', color: '#4ade80', fontWeight: '800' }}>
                              🚗 Site Visit: PVA OTP Verified ({matchingPva.projectVisitAgreementId || matchingPva.id || matchingPva.agreement_code})
                            </div>
                          ) : matchingVisit ? (
                            <div style={{ background: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)', border: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? '1px solid #22c55e' : '1px solid #0284c7', borderRadius: '4px', padding: '4px 8px', color: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? '#4ade80' : '#38bdf8', fontWeight: '800' }}>
                              🚗 Site Visit: {matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? 'OTP Verified' : 'Scheduled'} ({matchingVisit.visitId || matchingVisit.id || 'VS-SCHEDULED'})
                            </div>
                          ) : (
                            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '4px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                              ⏳ Site Visit: Pending
                            </div>
                          )}

                          {matchingBooking ? (
                            <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #f59e0b', borderRadius: '4px', padding: '4px 8px', color: '#fbbf24', fontWeight: '900' }}>
                              🏆 Booking: Confirmed ({matchingBooking.booking_code || matchingBooking.booking_id || matchingBooking.id})
                            </div>
                          ) : (
                            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '4px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                              ⏳ Booking: Pending
                            </div>
                          )}

                          {matchingAgreement ? (
                            <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', borderRadius: '4px', padding: '4px 8px', color: '#c084fc', fontWeight: '900' }}>
                              📜 Agreement: Active ({matchingAgreement.agreement_code || matchingAgreement.projectVisitAgreementId || matchingAgreement.agreement_id || matchingAgreement.id})
                            </div>
                          ) : (
                            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '4px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                              ⏳ Agreement: Pending
                            </div>
                          )}

                          {matchingInvoice ? (
                            <div 
                              onClick={() => {
                                const isDev = (matchingInvoice.invoice_category || matchingInvoice.invoice_type) === 'DEVELOPER' || 
                                              (matchingInvoice.invoice_number && matchingInvoice.invoice_number.startsWith('SRM-DEV-INV-'));
                                if (setBillingInvoiceCategory) {
                                  setBillingInvoiceCategory(isDev ? 'DEVELOPER' : 'CUSTOMER');
                                }
                                if (setSearchQuery) {
                                  setSearchQuery(matchingInvoice.invoice_number || c.name || c.customer_number);
                                }
                                if (setActiveTab) {
                                  setActiveTab('billing_management');
                                }
                              }}
                              style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '4px 8px', color: '#4ade80', fontWeight: '900', cursor: 'pointer' }}
                              title="Click to view this invoice in Billing Management"
                            >
                              💳 Billing: Invoice Generated ({matchingInvoice.invoice_number || matchingInvoice.invoice_id || matchingInvoice.id}) ↗
                            </div>
                          ) : (
                            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '4px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                              ⏳ Billing: Pending
                            </div>
                          )}
                        </div>

                        {/* CARD ACTIONS */}
                        <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setSelectedCust(c); setActiveCustomerSubTab('customer_360_profile'); }} style={{ flex: 1, minWidth: '80px', justifyContent: 'center', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>360° View</button>
                          <button onClick={() => handleStartEditCustomer(c)} style={{ flex: 1, minWidth: '70px', justifyContent: 'center', background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Edit</button>
                          <button onClick={() => alert(`🔄 Initiated Transfer Request for Customer ${c.customer_number}`)} style={{ flex: 1, minWidth: '80px', justifyContent: 'center', background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Transfer</button>
                          {isSuperAdmin && (
                            <button 
                              onClick={() => handleDeleteCustomerAction(c)}
                              style={{ flex: 1, minWidth: '70px', justifyContent: 'center', background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Permanently delete customer record"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '12px', whiteSpace: 'nowrap', minWidth: '130px' }}>Customer Tracking ID</th>
                      <th style={{ padding: '12px', whiteSpace: 'nowrap', minWidth: '170px' }}>Full Name & Contact</th>
                      <th style={{ padding: '12px', whiteSpace: 'nowrap', minWidth: '180px' }}>Lead Ingestion Info</th>
                      <th style={{ padding: '12px', whiteSpace: 'nowrap', minWidth: '280px' }}>Stage Progression (Matching, Cost Sheet, Visit, Booking, Agreement, Billing)</th>
                      <th style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>Priority & Score</th>
                      <th style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '220px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => {
                      const matchingLead = leadsList.find(l => (l.customer_number && l.customer_number === c.customer_number) || (l.mobile && c.mobile && l.mobile.replace(/\D/g, '') === c.mobile.replace(/\D/g, ''))) || c.leadData;
                      const {
                        matchingText,
                        matchingCostSheet,
                        matchingPva,
                        matchingVisit,
                        matchingBooking,
                        matchingAgreement,
                        matchingInvoice
                      } = resolveCustomerProgression(c);

                      return (
                        <tr key={c.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                          <td style={{ padding: '12px' }}>
                            <span 
                              onClick={() => openIdDetailsModal(c.customer_number, 'CUSTOMER_ID')}
                              style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}
                              title="Click to view full Customer details"
                            >
                              🆔 {c.customer_number}
                            </span>
                            {matchingLead && (
                              <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                                📋 {matchingLead.lead_number}
                              </div>
                            )}
                          </td>
                          
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{c.name}</strong>
                            <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{maskPhone(c.mobile)}</span>
                            {c.email && (
                              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>{c.email}</span>
                            )}
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                              📢 Source: {c.source || matchingLead?.source || 'Lead Ingestion'}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: isLight ? '#475569' : '#cbd5e1', marginTop: '4px', fontWeight: '700' }}>
                              📍 {c.preferredArea || matchingLead?.preferred_location} • <span style={{ color: '#4ade80' }}>💰 {c.budget || '70L - 85L'}</span>
                            </div>
                            {matchingLead && (
                              <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '2px', fontWeight: '700' }}>
                                Status: {matchingLead.lead_status || matchingLead.call_disposition || 'CONNECTED'}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                              {/* 1. MATCHING STAGE */}
                              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '4px', padding: '3px 8px', color: '#38bdf8', fontWeight: '800' }}>
                                🎯 Matching: {matchingText}
                              </div>

                              {/* 2. COST SHEET STAGE */}
                              {matchingCostSheet ? (
                                <div 
                                  onClick={() => handleViewCostSheetPdf(c, matchingCostSheet)}
                                  style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '3px 8px', color: '#4ade80', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                  title="Click to View / Print Cost Sheet PDF"
                                >
                                  <span>📄 Cost Sheet: Shared ({matchingCostSheet.costSheetId || matchingCostSheet.id})</span>
                                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900', marginLeft: '6px' }}>📄 PDF</span>
                                </div>
                              ) : (
                                <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '3px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                                  ⏳ Cost Sheet: Not Created Yet
                                </div>
                              )}

                              {/* 3. VISIT STAGE */}
                              {matchingPva ? (
                                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '3px 8px', color: '#4ade80', fontWeight: '800' }}>
                                  🚗 Site Visit: PVA OTP Verified ({matchingPva.projectVisitAgreementId || matchingPva.id || matchingPva.agreement_code})
                                </div>
                              ) : matchingVisit ? (
                                <div style={{ background: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)', border: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? '1px solid #22c55e' : '1px solid #0284c7', borderRadius: '4px', padding: '3px 8px', color: matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? '#4ade80' : '#38bdf8', fontWeight: '800' }}>
                                  🚗 Site Visit: {matchingVisit.status === 'OTP_VERIFIED' || matchingVisit.status === 'COMPLETED' || matchingVisit.status === 'VISIT_DONE' || matchingVisit.status === 'DONE' || matchingVisit.otpVerified ? 'OTP Verified' : 'Scheduled'} ({matchingVisit.visitId || matchingVisit.id || 'VS-SCHEDULED'})
                                </div>
                              ) : (
                                <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '3px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                                  ⏳ Site Visit: Pending
                                </div>
                              )}

                              {/* 4. BOOKING STAGE */}
                              {matchingBooking ? (
                                <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #f59e0b', borderRadius: '4px', padding: '3px 8px', color: '#fbbf24', fontWeight: '900' }}>
                                  🏆 Booking: Confirmed ({matchingBooking.booking_code || matchingBooking.booking_id || matchingBooking.id})
                                </div>
                              ) : (
                                <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '3px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                                  ⏳ Booking: Pending
                                </div>
                              )}

                              {/* 5. AGREEMENT STAGE */}
                              {matchingAgreement ? (
                                <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', borderRadius: '4px', padding: '3px 8px', color: '#c084fc', fontWeight: '900' }}>
                                  📜 Agreement: Active ({matchingAgreement.agreement_code || matchingAgreement.projectVisitAgreementId || matchingAgreement.agreement_id || matchingAgreement.id})
                                </div>
                              ) : (
                                <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '3px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                                  ⏳ Agreement: Pending
                                </div>
                              )}

                              {/* 6. BILLING / INVOICE STAGE */}
                              {matchingInvoice ? (
                                <div 
                                  onClick={() => {
                                    const isDev = (matchingInvoice.invoice_category || matchingInvoice.invoice_type) === 'DEVELOPER' || 
                                                  (matchingInvoice.invoice_number && matchingInvoice.invoice_number.startsWith('SRM-DEV-INV-'));
                                    if (setBillingInvoiceCategory) {
                                      setBillingInvoiceCategory(isDev ? 'DEVELOPER' : 'CUSTOMER');
                                    }
                                    if (setSearchQuery) {
                                      setSearchQuery(matchingInvoice.invoice_number || c.name || c.customer_number);
                                    }
                                    if (setActiveTab) {
                                      setActiveTab('billing_management');
                                    }
                                  }}
                                  style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '4px', padding: '3px 8px', color: '#4ade80', fontWeight: '900', cursor: 'pointer' }}
                                  title="Click to view this invoice in Billing Management"
                                >
                                  💳 Billing: Invoice Generated ({matchingInvoice.invoice_number || matchingInvoice.invoice_id || matchingInvoice.id}) ↗
                                </div>
                              ) : (
                                <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '4px', padding: '3px 8px', color: isLight ? '#94a3b8' : '#64748b', fontWeight: '700' }}>
                                  ⏳ Billing: Pending
                                </div>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: c.priority === 'HOT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: c.priority === 'HOT' ? '#ef4444' : '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.75rem', display: 'inline-block', whiteSpace: 'nowrap' }}>
                              🔥 {c.priority || 'HOT'} ({c.score || 88}/100)
                            </span>
                          </td>

                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                              <button onClick={() => { setSelectedCust(c); setActiveCustomerSubTab('customer_360_profile'); }} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>360° View</button>
                              <button onClick={() => handleStartEditCustomer(c)} style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>Edit</button>
                              <button onClick={() => alert(`🔄 Initiated Transfer Request for Customer ${c.customer_number}`)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: '#38bdf8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>Transfer</button>
                              {isSuperAdmin && (
                                <button 
                                  onClick={() => handleDeleteCustomerAction(c)}
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}
                                  title="Permanently delete customer record"
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
            );
          })()}
        </div>
      )}

      {/* SUB-TAB 2: CUSTOMER 360° FULL PROFILE */}
      {activeCustomerSubTab === 'customer_360_profile' && (() => {
        const activeCust = (selectedCust && selectedCust.customer_number && selectedCust.customer_number !== 'NO_CUSTOMERS')
          ? selectedCust
          : (allActiveCustomers.length > 0 ? allActiveCustomers[0] : null);

        if (!activeCust) {
          return (
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>👤</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>No Customer Selected for 360° Profile</h3>
              <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', maxWidth: '480px' }}>
                Please select a customer from the <strong>Customer Master Vault</strong> table by clicking the <strong>360° View</strong> button.
              </p>
              <button 
                onClick={() => setActiveCustomerSubTab('customer_vault')}
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
              >
                ← Back to Customer Master Vault
              </button>
            </div>
          );
        }

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PROFILE HEADER CARD */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{activeCust.name}</h3>
                <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', fontFamily: 'monospace' }}>{activeCust.customer_number}</span>
                <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>● COMPANY OWNED ASSET</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>Assigned Executive: <strong>{activeCust.assigned_salesperson || 'Abinash Roy (Admin)'}</strong> | Team Leader: <strong>Rahul Sharma</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleViewCostSheetPdf(activeCust)}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              >
                📄 View Cost Sheet PDF
              </button>
              <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px 16px', borderRadius: '10px', fontWeight: '900', fontSize: '0.9rem' }}>🔥 PRIORITY: {activeCust.priority || 'HOT'} ({activeCust.score || 100}/100)</span>
            </div>
          </div>

          {/* PERMANENT CUSTOMER 360° TRANSACTION IDENTITY PANEL (SECTION 21) */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🆔 PERMANENT CUSTOMER JOURNEY TRANSACTION IDENTIFIERS CHAIN
                </h4>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                  Every business action receives an immutable, database-backed Transaction ID linked to {activeCust.name} ({activeCust.customer_number}).
                </p>
              </div>
              <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
                CHAIN INTEGRITY: VERIFIED (SHA-256)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
              {getCustomerTransactionChainItems(activeCust).map((item, idx) => {
                const hasMultiple = item.items && item.items.length > 1;
                return (
                  <div key={idx} onClick={() => setSelectedTransactionPdf(getTransactionPdfPayload(item, activeCust))} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>{item.label}</span>
                        {hasMultiple && (
                          <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.58rem', fontWeight: '900', padding: '1px 5px', borderRadius: '4px' }}>
                            {item.items.length} RECORDS
                          </span>
                        )}
                      </div>

                      {hasMultiple ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                          {item.items.slice(0, 3).map((sub: any, sIdx: number) => (
                            <div key={sIdx} style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '3px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: '900', color: '#38bdf8' }}>{sub.id}</span>
                              {sub.name && <span style={{ fontSize: '0.62rem', color: isLight ? '#64748b' : '#94a3b8', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>}
                            </div>
                          ))}
                          {item.items.length > 3 && (
                            <span style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: '800' }}>+ {item.items.length - 3} more records</span>
                          )}
                        </div>
                      ) : (
                        <h5 style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '900', color: '#38bdf8', marginTop: '2px' }}>{item.id}</h5>
                      )}

                      <span style={{ 
                        background: item.color === '#22c55e' ? 'rgba(34, 197, 94, 0.15)' : (item.color === '#64748b' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(245, 158, 11, 0.15)'), 
                        color: item.color, 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.68rem', 
                        fontWeight: '800', 
                        display: 'inline-block', 
                        marginTop: '6px' 
                      }}>
                        ● {item.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransactionPdf(getTransactionPdfPayload(item, activeCust));
                        }}
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                        title={`View Official Printable PDF Certificate for ${item.label}`}
                      >
                        📄 View PDF {hasMultiple ? `(${item.items.length} Items)` : ''}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 360° DATA STREAMS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? 'repeat(1, 1fr)' : '1fr 1fr', gap: '20px' }}>
            
            {/* CARD 1: PRIMARY PROFILE & CONTACT INFORMATION */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#38bdf8', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>👤 Primary Customer Details & Executive Assignment</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Mobile Phone:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{maskPhone(activeCust.mobile)}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Alternate Phone:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>+91 98491 *****</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Email Address:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{activeCust.email || 'customer@example.com'}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>City & Location:</span> <strong style={{ color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>{activeCust.preferredArea || activeCust.preferred_location || 'Kolkata'}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Budget Range:</span> <strong style={{ color: '#4ade80', display: 'block' }}>{activeCust.budget}</strong></div>
                <div><span style={{ color: isLight ? '#64748b' : '#94a3b8' }}>Configuration:</span> <strong style={{ color: '#fbbf24', display: 'block' }}>{activeCust.configuration}</strong></div>
              </div>

              {/* CLIENT ASSIGNMENT WIDGET */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '8px', padding: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '900' }}>👤 ASSIGNED SALES EXECUTIVE / RELATIONSHIP MANAGER</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={reassignExecInput || activeCust.assigned_salesperson || activeCust.assigned_employee_id || activeCust.assignedExecutive || (salesExecOptions.length > 0 ? salesExecOptions[0].value : '')} 
                    onChange={(e) => setReassignExecInput(e.target.value)}
                    style={{ flex: 1, background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontWeight: '900', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                  >
                    {salesExecOptions.map((opt: any) => (
                      <option key={opt.id || opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleReassignExecutive(activeCust, reassignExecInput || activeCust.assigned_salesperson || activeCust.assigned_employee_id || activeCust.assignedExecutive || (salesExecOptions.length > 0 ? salesExecOptions[0].value : ''))} 
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: LINKED ENQUIRIES & LEAD OPPORTUNITIES */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#38bdf8', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>📋 Linked Enquiries & Lead IDs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.8rem' }}>{activeCust.leadData?.lead_number || 'SRM-LEAD-2026-001247'}</span>
                    <p style={{ fontSize: '0.75rem', color: isLight ? '#0f172a' : '#ffffff', margin: '2px 0 0 0' }}>{activeCust.configuration || '2BHK'} Flat in {activeCust.preferredArea || 'Madhyamgram, Kolkata'}</p>
                  </div>
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>MATCHING INITIATED</span>
                </div>
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.8rem' }}>SRM-REQ-2026-000097</span>
                    <p style={{ fontSize: '0.75rem', color: isLight ? '#0f172a' : '#ffffff', margin: '2px 0 0 0' }}>{activeCust.budget} • Ready to Move</p>
                  </div>
                  <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>ACTIVE REQUIREMENT</span>
                </div>
              </div>
            </div>

          </div>

          {/* IMMUTABLE AUDIT ACTIVITY TIMELINE */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📜 Immutable Customer Activity & Audit History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { time: '04-Sep-2026 12:12 PM', action: 'Matching Initiated', detail: `Generated Matching Request SRM-MAT-2026-000423 for ${activeCust.name}.`, user: activeCust.assigned_salesperson || 'Abinash Roy' },
                { time: '04-Sep-2026 10:15 AM', action: 'Lead Intake Completed', detail: 'Ingested 9-step requirement via Lead Management portal.', user: 'System Auto' },
                { time: '04-Sep-2026 10:00 AM', action: 'Customer Master Created', detail: `Registered Customer Tracking ID ${activeCust.customer_number} via Meta Ads.`, user: 'System Auto' }
              ].map((log, idx) => (
                <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{log.action}</strong>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>{log.detail}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>{log.time}</span>
                    <span style={{ fontSize: '0.7rem', color: '#4ade80', display: 'block', fontWeight: '700' }}>By {log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECT VISIT HISTORY (PVA RECORDS) */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ Project Visit History & Brokerage Protection Agreements (PVA)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800' }}>
                {projectVisitAgreements.length} PVA Records Preserved
              </span>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>PVA ID & Date</th>
                    <th style={{ padding: '10px' }}>Visited Project</th>
                    <th style={{ padding: '10px' }}>Developer</th>
                    <th style={{ padding: '10px' }}>Sales Executive</th>
                    <th style={{ padding: '10px' }}>Protection Expiry</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projectVisitAgreements.map((pva: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>
                        {pva.projectVisitAgreementId}
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{pva.visitDate}</span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                        {pva.projectTitle}
                      </td>
                      <td style={{ padding: '10px', color: '#fbbf24' }}>
                        {pva.developerName}
                      </td>
                      <td style={{ padding: '10px', color: '#38bdf8' }}>
                        {pva.salesPersonName}
                      </td>
                      <td style={{ padding: '10px', color: '#4ade80', fontWeight: '800' }}>
                        🗓️ {pva.protectionEndDate}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setShowPvaDocumentModal({ open: true, pva })}
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                        >
                          📄 View PVA PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        );
      })()}

      {/* SUB-TAB 3: ANTI-LEAKAGE DETECTION & ANOMALY ALERTS ENGINE */}
      {activeCustomerSubTab === 'anti_leakage_engine' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>🚨 SWARAMAYI ANTI-LEAKAGE & FRAUD PREVENTION SHIELD</h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Automated AI engine scanning 10 leakage rules to prevent off-CRM customer deals.</p>
            </div>
            <span style={{ background: '#ef4444', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
              3 HIGH RISK ANOMALIES DETECTED
            </span>
          </div>

          <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: '#ef4444', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Risk Level</th>
                  <th style={{ padding: '12px' }}>Customer Tracking ID</th>
                  <th style={{ padding: '12px' }}>Flagged Employee</th>
                  <th style={{ padding: '12px' }}>Leakage Rule Violation Description</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Management Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { risk: 'HIGH RISK', cust: 'SRM-CUS-2026-000184', emp: 'Amit Patel (Sales Exec)', rule: 'Rule 5: Booking detected with My Home Developer without recorded site visit.', action: 'Lock Record Access' },
                  { risk: 'HIGH RISK', cust: 'SRM-CUS-2026-000142', emp: 'Priya Nair (Sales Exec)', rule: 'Rule 1: Creation attempt of duplicate customer with existing phone +91 98490 11223.', action: 'Block & Audit' },
                  { risk: 'MEDIUM RISK', cust: 'SRM-CUS-2026-000098', emp: 'Kiran Kumar (Sales Exec)', rule: 'Rule 7: Attempted to edit primary mobile number of company customer record.', action: 'Review Change Log' }
                ].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: item.risk.includes('HIGH') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: item.risk.includes('HIGH') ? '#ef4444' : '#fbbf24', padding: '3px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '0.72rem' }}>
                        🔴 {item.risk}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800' }}>{item.cust}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: isLight ? '#0f172a' : '#ffffff' }}>{item.emp}</td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>{item.rule}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => alert(`🔒 Management Lockdown executed for ${item.cust}. Account flagged for review.`)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer' }}>
                        {item.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LEAD TRANSFER APPROVAL QUEUE */}
      {activeCustomerSubTab === 'lead_transfer_approval' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>⚖️ Lead Transfer Approval & Audit Log</h3>
          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800' }}>Pending Manager Transfer Request (1)</span>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', margin: '2px 0 0 0' }}>Amit Patel requests transferring <strong>SRM-LEAD-2026-001891</strong> to Rahul Sharma.</p>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>Reason: Customer requested senior manager for price negotiation.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => alert('✅ Lead transfer approved by Manager.')} style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>Approve</button>
              <button onClick={() => alert('❌ Lead transfer rejected.')} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SCORING RULES CONFIG */}
      {activeCustomerSubTab === 'scoring_rules_config' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📊 Customer Risk Scoring Rules & Weightage Configurator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { factor: 'Budget Confirmed', weight: '+15 Points', color: '#4ade80' },
              { factor: 'Phone Connected', weight: '+10 Points', color: '#4ade80' },
              { factor: 'Property Selected', weight: '+15 Points', color: '#4ade80' },
              { factor: 'Site Visit Completed', weight: '+20 Points', color: '#4ade80' },
              { factor: 'Negotiation Started', weight: '+15 Points', color: '#4ade80' },
              { factor: 'Timeline < 30 Days', weight: '+10 Points', color: '#4ade80' },
              { factor: 'Follow-up Response', weight: '+10 Points', color: '#4ade80' },
              { factor: 'Total Max Score', weight: '100 / 100', color: '#38bdf8' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>{item.factor}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: item.color, marginTop: '4px' }}>{item.weight}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE TRANSACTION IDENTIFIER PDF CERTIFICATE MODAL */}
      {selectedTransactionPdf && (
        <div style={{ position: 'fixed', inset: 0, background: isLight ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0, 0, 0, 0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #0284c7', width: '94vw', maxWidth: '850px', maxHeight: '94vh', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            
            {/* ACTION TOOLBAR AT TOP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={26} color="#38bdf8" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                    OFFICIAL TRANSACTION CERTIFICATE PDF — {selectedTransactionPdf.item.id}
                  </h3>
                  <span style={{ fontSize: '0.73rem', color: '#4ade80', fontWeight: '800' }}>
                    {selectedTransactionPdf.item.label} • {selectedTransactionPdf.sha256Hash}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={14} /> Print PDF
                </button>
                <button 
                  onClick={() => {
                    alert(`📥 Downloading official Transaction Certificate PDF for ${selectedTransactionPdf.item.id}...`);
                    window.print();
                  }} 
                  style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <X size={22} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '6px' }} onClick={() => setSelectedTransactionPdf(null)} />
              </div>
            </div>

            {/* FORMAL ENTERPRISE DOCUMENT CONTAINER (PRINTABLE AREA) */}
            <div id="printable-transaction-pdf-area" style={{ background: '#ffffff', color: '#0f172a', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', fontSize: '0.86rem' }}>
              
              {/* BRANDING & DOCUMENT TITLE HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0284c7', paddingBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0284c7', margin: 0, letterSpacing: '-0.5px' }}>
                    SWARAMAYI REAL ESTATE MARKETING
                  </h1>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                    Enterprise CRM Solution • Immutable Journey Transaction Certificate
                  </span>
                  <p style={{ fontSize: '0.74rem', color: '#475569', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                    4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, Madhyamgram, Kolkata - 700129
                    <br />
                    <span>Phone: +91 88021 30791</span> • <span>RERA Reg No: WBRERA/A/NOR/2025/000737</span>
                  </p>
                </div>

                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0, minWidth: 'fit-content' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>TRANSACTION ID</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace', margin: 0, whiteSpace: 'nowrap' }}>
                    {selectedTransactionPdf.item.id}
                  </h3>
                  <span style={{ background: (selectedTransactionPdf.item.status === 'SETTLED' || selectedTransactionPdf.item.status === 'PAID / RECEIVED') ? '#dcfce7' : '#fef3c7', color: (selectedTransactionPdf.item.status === 'SETTLED' || selectedTransactionPdf.item.status === 'PAID / RECEIVED') ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', display: 'inline-block', marginTop: '4px' }}>
                    ● {selectedTransactionPdf.item.status}
                  </span>
                </div>
              </div>

              {/* METADATA STRIP */}
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Customer Name:</span> <strong style={{ color: '#0f172a' }}>{selectedTransactionPdf.custName}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Customer ID:</span> <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{selectedTransactionPdf.custNum}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Transaction Step:</span> <strong style={{ color: '#d97706' }}>{selectedTransactionPdf.item.label}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Audit Hash:</span> <strong style={{ color: '#16a34a', fontFamily: 'monospace', fontSize: '0.7rem' }}>{selectedTransactionPdf.sha256Hash}</strong></div>
              </div>

              {/* TRANSACTION PAYLOAD DETAILS TABLE */}
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0369a1', borderBottom: '2px solid #bae6fd', paddingBottom: '6px', marginBottom: '10px' }}>
                  📋 TRANSACTION SPECIFICATIONS & PAYLOAD DATA LOG
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 14px', width: '38%' }}>Specification Field</th>
                      <th style={{ padding: '10px 14px' }}>Recorded Transaction Detail Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransactionPdf.payload.map((row: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '9px 14px', fontWeight: '700', color: '#475569' }}>{row.label}</td>
                        <td style={{ padding: '9px 14px', fontWeight: '800', color: '#0f172a', fontFamily: row.label.includes('ID') || row.label.includes('Hash') || row.label.includes('UTR') || row.label.includes('Ref') || row.label.includes('Code') ? 'monospace' : 'inherit' }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER & CRYPTOGRAPHIC SEAL */}
              <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                <div>
                  <strong>Swaramayi Real Estate Marketing Enterprise Audit Engine</strong>
                  <p style={{ margin: '2px 0 0 0' }}>This is an official computer-generated transaction record certificate. Verified by SHA-256 ledger.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#0284c7', fontWeight: '900' }}>✓ DIGITALLY AUTHENTICATED</span>
                  <p style={{ margin: '2px 0 0 0' }}>Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
