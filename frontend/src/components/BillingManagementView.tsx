import React, { useState } from 'react';
import { CreditCard, Plus, Printer, Calendar, Link, CheckCircle2, Clock, Share2, Copy, Send, DollarSign, X, Edit3 } from 'lucide-react';

interface BillingManagementViewProps {
  isLight: boolean;
  billingInvoiceCategory: string;
  setBillingInvoiceCategory: (category: string) => void;
  invoices: any[];
  setInvoices?: (invoices: any[]) => void;
  bookings?: any[];
  setBookings?: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveTab?: (tab: string) => void;
  syncAllToMongoDB?: (overrideData?: any) => Promise<void>;
  searchQuery: string;
  matchesSearchQuery: (item: any, query: string) => boolean;
  setCreateInvoiceForm: (form: any) => void;
  setShowCreateInvoiceModal: (val: boolean) => void;
  setShowPrintInvoiceModal: (val: any) => void;
  currentRole?: string;
  users?: any[];
  branches?: any[];
  properties?: any[];
  customers?: any[];
  onRecycleItem?: (itemData: any) => void;
}

export const BillingManagementView: React.FC<BillingManagementViewProps> = ({
  isLight,
  billingInvoiceCategory,
  setBillingInvoiceCategory,
  invoices = [],
  setInvoices,
  bookings = [],
  setBookings,
  setActiveTab,
  syncAllToMongoDB,
  searchQuery,
  matchesSearchQuery,
  setCreateInvoiceForm,
  setShowCreateInvoiceModal,
  setShowPrintInvoiceModal,
  currentRole,
  users = [],
  branches = [],
  properties = [],
  customers = [],
  onRecycleItem,
}) => {
  const isSuperAdmin = !currentRole || currentRole.toUpperCase().includes('SUPER ADMIN') || currentRole.toUpperCase().includes('OWNER') || currentRole.toUpperCase().includes('ADMIN');
  const getCurrentUserBranch = () => {
    const matchedUser = (users || []).find((u: any) => u.role === currentRole) || (users || []).find((u: any) => u.id === 'USR-01') || (users || [])[0];
    if (matchedUser && matchedUser.branch_name) {
      if (matchedUser.branch_name === 'Head Office') return 'Head Office (Kolkata)';
      return matchedUser.branch_name;
    }
    if (currentRole === 'SUPER_ADMIN' || currentRole === 'OWNER') return 'Head Office (Kolkata)';
    if (branches && branches.length > 0) return branches[0].branch_name;
    return 'Head Office (Kolkata)';
  };

  const [datePeriodFilter, setDatePeriodFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDateFilter, setStartDateFilter] = useState<string>('2026-08-01');
  const [endDateFilter, setEndDateFilter] = useState<string>('2026-08-31');

  // MODAL STATES
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState<any>(null);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState<any>(null);
  const [showCustomerPaymentPortal, setShowCustomerPaymentPortal] = useState<any>(null);
  const [portalPaymentTab, setPortalPaymentTab] = useState<'UPI' | 'CARD' | 'NEFT'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<any>(null);

  const [paymentModeInput, setPaymentModeInput] = useState<'ONLINE' | 'CASH' | 'CHEQUE' | 'NEFT'>('ONLINE');
  const [paymentStatusInput, setPaymentStatusInput] = useState<'PAID_SETTLED' | 'UNPAID_PENDING'>('PAID_SETTLED');
  const [paymentRefInput, setPaymentRefInput] = useState<string>('');
  const [copyToast, setCopyToast] = useState<boolean>(false);

  // EDIT INVOICE MODAL STATE
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState<any | null>(null);
  const [editInvoiceForm, setEditInvoiceForm] = useState<any>({});

  const handleSaveEditInvoice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editInvoiceForm || !setInvoices) return;

    const taxVal = Number(editInvoiceForm.taxable_value || 0);
    const applyGst = editInvoiceForm.apply_gst !== false;
    const cgstRate = Number(editInvoiceForm.cgst_rate !== undefined ? editInvoiceForm.cgst_rate : 9);
    const sgstRate = Number(editInvoiceForm.sgst_rate !== undefined ? editInvoiceForm.sgst_rate : 9);
    const cgst = applyGst ? Math.round(taxVal * (cgstRate / 100)) : 0;
    const sgst = applyGst ? Math.round(taxVal * (sgstRate / 100)) : 0;
    const total = taxVal + cgst + sgst;

    const updatedInvoice = {
      ...editInvoiceForm,
      taxable_value: taxVal,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      cgst_amount: cgst,
      sgst_amount: sgst,
      total_invoice_amount: total
    };

    const updatedInvoices = invoices.map((inv: any) => {
      if (inv.id === editInvoiceForm.id || (inv.invoice_number && inv.invoice_number === editInvoiceForm.invoice_number)) {
        return updatedInvoice;
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    setShowEditInvoiceModal(null);
    alert(`🎉 Invoice ${editInvoiceForm.invoice_number || editInvoiceForm.id} updated successfully!`);
  };

  const handleSendInvoiceToBooking = (inv: any) => {
    // 1. Resolve booking code
    const rawBookingCode = inv.booking_code || (inv.invoice_number ? inv.invoice_number.replace('SRM-INV-', 'SRM-BKG-').replace('SRM-DEV-INV-', 'SRM-BKG-') : 'SRM-BKG-2026-000087');
    const bkgCode = rawBookingCode.includes('SRM-BKG-') ? rawBookingCode : `SRM-BKG-2026-${(inv.customer_number || '000087').replace(/\D/g, '').slice(-6) || '000087'}`;

    // 2. Resolve customer details
    const matchedCust = (customers || []).find((c: any) => 
      (inv.customer_number && (c.customer_number === inv.customer_number || c.id === inv.customer_number || c.customerNumber === inv.customer_number)) ||
      (inv.customer_name && (c.name?.toLowerCase() === inv.customer_name.toLowerCase() || c.customer_name?.toLowerCase() === inv.customer_name.toLowerCase() || c.customerName?.toLowerCase() === inv.customer_name.toLowerCase())) ||
      (inv.customer_mobile && (c.mobile === inv.customer_mobile || c.phone === inv.customer_mobile))
    );

    // 3. Resolve property details
    const propCodeLookup = inv.property_code || inv.propertyCode || 'SRM-PROP-2026-000426';
    const matchedProp = (properties || []).find((p: any) => 
      p.property_code === propCodeLookup || p.id === propCodeLookup || p.propertyCode === propCodeLookup || (p.title && inv.property_title && (p.title.toLowerCase().includes(inv.property_title.toLowerCase()) || inv.property_title.toLowerCase().includes(p.title.toLowerCase())))
    );

    const custName = inv.customer_name || matchedCust?.name || 'Rishita sharma';
    const custNum = inv.customer_number || matchedCust?.customer_number || 'SRM-CUS-2026-000188';
    const custMobile = inv.customer_mobile || matchedCust?.mobile || '+91 88765 97975';
    const custEmail = inv.customer_email || matchedCust?.email || 'rishita@gmail.com';

    const propTitle = inv.property_title || matchedProp?.title || 'GAJAPATI APARTMENT';
    const propLocality = inv.property_locality || matchedProp?.locality || 'Barasat, Kolkata';
    const devName = inv.developer_name || matchedProp?.developer || 'Dhriti Builders & Developers';
    const agreeVal = Number(inv.agreement_value || (inv.flat_price ? Number(inv.flat_price) + Number(inv.parking_price || 0) : inv.taxable_value ? Math.round(Number(inv.taxable_value) / 0.02) : 5114880));
    const tokenVal = 100000;
    const brokAmt = Number(inv.taxable_value) || Math.round(agreeVal * 0.02);

    const bookingObj = {
      id: `bkg-${Date.now()}`,
      booking_code: bkgCode,
      booking_date: inv.created_date || new Date().toISOString().split('T')[0],
      customer_name: custName,
      customer_mobile: custMobile,
      customer_number: custNum,
      customer_email: custEmail,
      project_name: propTitle,
      property_code: propCodeLookup,
      developer_name: devName,
      tower_unit: 'Block A - Unit 302',
      agreement_value: `₹${agreeVal.toLocaleString('en-IN')}`,
      agreement_value_num: agreeVal,
      token_amount: tokenVal,
      payment_mode: inv.payment_mode || 'UPI / Online Bank Transfer',
      payment_ref: inv.payment_ref || `TXN-BKG-${Math.floor(100000 + Math.random() * 900000)}`,
      brokerage_rate: '2.0%',
      brokerage_percent: 2.0,
      brokerage_amount: brokAmt,
      approval_status: 'APPROVED_LOCKED',
      sales_executive: inv.sales_executive || 'Ramesh Pawar',
      source_invoice_id: inv.invoice_number || inv.id,
      invoiced: true
    };

    const existingWithoutThis = (bookings || []).filter((b: any) => b.booking_code !== bkgCode && b.customer_number !== custNum);
    const updatedBookings = [bookingObj, ...existingWithoutThis];

    if (setBookings) {
      setBookings(updatedBookings);
    }
    try {
      localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updatedBookings));
    } catch (e) {}

    if (syncAllToMongoDB) {
      syncAllToMongoDB({
        bookings: updatedBookings
      });
    }

    if (setActiveTab) {
      setActiveTab('booking_management');
    }

    alert(`🏢 CUSTOMER DETAILS SENT TO BOOKING MANAGEMENT!\n\nBooking Code: ${bkgCode}\nCustomer: ${custName} (${custNum})\nProperty: ${propTitle} (Block A - Unit 302)\nAgreement Value: ₹${agreeVal.toLocaleString('en-IN')}\nAdvance Token: ₹${tokenVal.toLocaleString('en-IN')}\nStatus: APPROVED_LOCKED\n\nNavigating to Booking Management now.`);
  };

  const isDateInPeriod = (dateStr: string) => {
    if (!dateStr || datePeriodFilter === 'ALL') return true;

    const todayStr = '2026-08-29'; // system reference current date
    if (datePeriodFilter === 'TODAY') {
      return dateStr === todayStr || dateStr === new Date().toISOString().split('T')[0];
    }

    if (datePeriodFilter === 'WEEK') {
      return dateStr >= '2026-08-23' && dateStr <= '2026-08-31';
    }

    if (datePeriodFilter === 'MONTH') {
      return dateStr.startsWith('2026-08');
    }

    if (datePeriodFilter === 'CUSTOM') {
      if (!startDateFilter && !endDateFilter) return true;
      const start = startDateFilter || '2020-01-01';
      const end = endDateFilter || '2030-12-31';
      return dateStr >= start && dateStr <= end;
    }

    return true;
  };

  const handleUpdatePayment = () => {
    if (!showRecordPaymentModal || !setInvoices) return;

    const updated = invoices.map(inv => {
      if (inv.id === showRecordPaymentModal.id) {
        return {
          ...inv,
          payment_status: paymentStatusInput,
          payment_mode: paymentStatusInput === 'PAID_SETTLED' ? paymentModeInput : undefined,
          payment_ref: paymentRefInput || undefined
        };
      }
      return inv;
    });

    setInvoices(updated);
    try {
      localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(updated));
    } catch (e) {}
    if (syncAllToMongoDB) {
      syncAllToMongoDB({ invoices: updated });
    }
    setShowRecordPaymentModal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* CATEGORY HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={24} color="#38bdf8" /> GST Tax Billing & Invoice Management Vault
          </h2>
          <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>Generate and manage GST 18% tax invoices for direct Customer billing and Developer channel partner brokerage.</p>
        </div>

        <div>
          <button 
            onClick={() => {
              setCreateInvoiceForm({
                invoice_category: billingInvoiceCategory,
                branch_name: getCurrentUserBranch(),
                customer_name: 'Rohan Deshmukh',
                customer_number: 'SRM-CUS-2026-000184',
                customer_mobile: '+91 90490 12345',
                customer_email: 'rohan.deshmukh@gmail.com',
                customer_address: 'Flat 402, Royal Heights, Jubilee Hills, Hyderabad - 500033',
                place_of_supply: '36 - Telangana',
                customer_gstin_pan: '36ABCDE1234F1Z5',
                developer_name: billingInvoiceCategory === 'DEVELOPER' ? 'Aparna Constructions' : 'Aparna Constructions',
                developer_gstin: '36AAACA1234F1Z5',
                property_title: 'Aparna Zenon Premium 3BHK Residence',
                particulars: billingInvoiceCategory === 'DEVELOPER' ? '2.0% Channel Partner Success Fee / Brokerage' : 'Property Consultation & Processing Charges',
                brokerage_percent: '2.0',
                flat_price: '8000000',
                parking_price: '400000',
                agreement_value: '8400000',
                taxable_value: '168000',
                bank_name: 'HDFC Bank',
                bank_account_number: '50200018942109',
                bank_ifsc_code: 'HDFC0000128',
                bank_upi_id: 'swaramayi@hdfcbank'
              });
              setShowCreateInvoiceModal(true);
            }}
            style={{ background: billingInvoiceCategory === 'DEVELOPER' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            <Plus size={16} /> + Create {billingInvoiceCategory === 'DEVELOPER' ? 'Developer Brokerage Invoice' : 'Customer Tax Invoice'}
          </button>
        </div>
      </div>

      {/* TWO MAIN CATEGORY SWITCHER TABS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '12px' }}>
        <button 
          onClick={() => setBillingInvoiceCategory('CUSTOMER')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: '800',
            background: billingInvoiceCategory === 'CUSTOMER' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : (isLight ? '#f1f5f9' : '#0f172a'),
            color: billingInvoiceCategory === 'CUSTOMER' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: billingInvoiceCategory === 'CUSTOMER' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
          }}
        >
          👤 Customer Tax Invoices ({invoices.filter(i => i.invoice_category === 'CUSTOMER' || !i.invoice_category).length})
        </button>

        <button 
          onClick={() => setBillingInvoiceCategory('DEVELOPER')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: '800',
            background: billingInvoiceCategory === 'DEVELOPER' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : (isLight ? '#f1f5f9' : '#0f172a'),
            color: billingInvoiceCategory === 'DEVELOPER' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: billingInvoiceCategory === 'DEVELOPER' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          🏢 Developer Brokerage Invoices ({invoices.filter(i => i.invoice_category === 'DEVELOPER').length})
        </button>
      </div>

      {/* DATE PERIOD & GROUPING FILTER TOOLBAR */}
      <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#38bdf8" />
            <span style={{ fontSize: '0.88rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
              📅 Filter Invoices by Period (Date-Wise, Week-Wise, Month-Wise)
            </span>
          </div>

          {/* DATE PERIOD PILL BUTTONS */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: '📅 All Time' },
              { key: 'TODAY', label: '⚡ Date-Wise (Today)' },
              { key: 'WEEK', label: '🗓️ Week-Wise (This Week)' },
              { key: 'MONTH', label: '📆 Month-Wise (August 2026)' },
              { key: 'CUSTOM', label: '🛠️ Custom Range' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setDatePeriodFilter(p.key as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: datePeriodFilter === p.key ? '2px solid #38bdf8' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                  background: datePeriodFilter === p.key ? (billingInvoiceCategory === 'DEVELOPER' ? '#16a34a' : '#0284c7') : (isLight ? '#ffffff' : '#1e293b'),
                  color: datePeriodFilter === p.key ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                  fontWeight: datePeriodFilter === p.key ? '900' : '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: datePeriodFilter === p.key ? '0 2px 8px rgba(56, 189, 248, 0.3)' : 'none'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM DATE RANGE PICKER */}
        {datePeriodFilter === 'CUSTOM' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: isLight ? '#ffffff' : '#1e293b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #38bdf8', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>From Date:</label>
              <input 
                type="date" 
                value={startDateFilter} 
                onChange={(e) => setStartDateFilter(e.target.value)} 
                style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem' }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>To Date:</label>
              <input 
                type="date" 
                value={endDateFilter} 
                onChange={(e) => setEndDateFilter(e.target.value)} 
                style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem' }} 
              />
            </div>
          </div>
        )}

        {/* PERIOD METRICS SUMMARY RIBBON & CROSS-CATEGORY SEARCH BANNER */}
        {(() => {
          const matchInvoiceEnhanced = (inv: any, q: string) => {
            if (!q || !q.trim()) return true;
            if (matchesSearchQuery(inv, q)) return true;

            const query = q.trim().toLowerCase();
            const custName = (inv.customer_name || '').toLowerCase();
            const custNum = (inv.customer_number || '').toLowerCase();
            const custMobile = (inv.customer_mobile || '').toLowerCase();
            const propTitle = (inv.property_title || '').toLowerCase();
            const devName = (inv.developer_name || '').toLowerCase();
            const invNum = (inv.invoice_number || '').toLowerCase();
            const costSheetCode = (inv.cost_sheet_code || inv.costSheetId || '').toLowerCase();
            const bkgCode = (inv.booking_code || inv.booking_id || '').toLowerCase();

            if (custName.includes(query) || custNum.includes(query) || custMobile.includes(query) || propTitle.includes(query) || devName.includes(query) || invNum.includes(query) || costSheetCode.includes(query) || bkgCode.includes(query)) {
              return true;
            }

            const linkedBkg = (bookings || []).find((b: any) => 
              b.booking_code === inv.booking_code || b.customer_number === inv.customer_number || b.id === inv.booking_id
            );
            if (linkedBkg && matchesSearchQuery(linkedBkg, q)) {
              return true;
            }

            const linkedCust = (customers || []).find((c: any) => 
              c.customer_number === inv.customer_number || (c.name && inv.customer_name && c.name.toLowerCase() === inv.customer_name.toLowerCase())
            );
            if (linkedCust && matchesSearchQuery(linkedCust, q)) {
              return true;
            }

            return false;
          };

          const otherCategory = billingInvoiceCategory === 'DEVELOPER' ? 'CUSTOMER' : 'DEVELOPER';
          const categoryInvoices = invoices.filter(i => (billingInvoiceCategory === 'DEVELOPER' ? i.invoice_category === 'DEVELOPER' : (i.invoice_category === 'CUSTOMER' || !i.invoice_category)));
          const otherCategoryInvoices = invoices.filter(i => (otherCategory === 'DEVELOPER' ? i.invoice_category === 'DEVELOPER' : (i.invoice_category === 'CUSTOMER' || !i.invoice_category)));
          
          const filteredInvoices = categoryInvoices.filter(i => matchInvoiceEnhanced(i, searchQuery) && isDateInPeriod(i.created_date));
          const otherCategoryMatches = searchQuery.trim() ? otherCategoryInvoices.filter(i => matchInvoiceEnhanced(i, searchQuery)) : [];

          const totalBilled = filteredInvoices.reduce((acc, curr) => acc + Number(curr.total_invoice_amount || 0), 0);
          const taxableRevenue = filteredInvoices.reduce((acc, curr) => acc + Number(curr.taxable_value || 0), 0);
          const gstCollected = filteredInvoices.reduce((acc, curr) => acc + (Number(curr.cgst_amount || 0) + Number(curr.sgst_amount || 0)), 0);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              
              {/* SMART CROSS-CATEGORY SEARCH ALERT BANNER */}
              {searchQuery.trim() !== '' && otherCategoryMatches.length > 0 && (
                <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>💡</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0369a1' : '#38bdf8' }}>
                      Found {otherCategoryMatches.length} matching invoice(s) under "{otherCategory === 'DEVELOPER' ? 'Developer Brokerage Invoices' : 'Customer Tax Invoices'}"!
                    </span>
                  </div>
                  <button
                    onClick={() => setBillingInvoiceCategory(otherCategory)}
                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}
                  >
                    View {otherCategory === 'DEVELOPER' ? 'Developer Brokerage Invoices' : 'Customer Tax Invoices'} ({otherCategoryMatches.length}) →
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TOTAL INVOICES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#38bdf8' }}>{filteredInvoices.length} Records</div>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TOTAL BILLED AMOUNT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#4ade80' }}>₹{totalBilled.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TAXABLE REVENUE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fbbf24' }}>₹{taxableRevenue.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>GST COLLECTED (18%)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#a855f7' }}>₹{gstCollected.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* TABLE CONTAINER */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
        <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                <th style={{ padding: '12px' }}>Invoice Number & Branch</th>
                <th style={{ padding: '12px' }}>{billingInvoiceCategory === 'DEVELOPER' ? 'Developer / Builder Name & GSTIN' : 'Customer Name & Contact'}</th>
                <th style={{ padding: '12px' }}>Property Title & Particulars</th>
                <th style={{ padding: '12px' }}>Taxable Value & GST (18%)</th>
                <th style={{ padding: '12px' }}>Total Amount Billed</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Payment Status & Mode</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const matchInvoiceEnhanced = (inv: any, q: string) => {
                  if (!q || !q.trim()) return true;
                  if (matchesSearchQuery(inv, q)) return true;

                  const query = q.trim().toLowerCase();
                  const custName = (inv.customer_name || '').toLowerCase();
                  const custNum = (inv.customer_number || '').toLowerCase();
                  const custMobile = (inv.customer_mobile || '').toLowerCase();
                  const propTitle = (inv.property_title || '').toLowerCase();
                  const devName = (inv.developer_name || '').toLowerCase();
                  const invNum = (inv.invoice_number || '').toLowerCase();
                  const costSheetCode = (inv.cost_sheet_code || inv.costSheetId || '').toLowerCase();
                  const bkgCode = (inv.booking_code || inv.booking_id || '').toLowerCase();

                  if (custName.includes(query) || custNum.includes(query) || custMobile.includes(query) || propTitle.includes(query) || devName.includes(query) || invNum.includes(query) || costSheetCode.includes(query) || bkgCode.includes(query)) {
                    return true;
                  }

                  const linkedBkg = (bookings || []).find((b: any) => 
                    b.booking_code === inv.booking_code || b.customer_number === inv.customer_number || b.id === inv.booking_id
                  );
                  if (linkedBkg && matchesSearchQuery(linkedBkg, q)) {
                    return true;
                  }

                  const linkedCust = (customers || []).find((c: any) => 
                    c.customer_number === inv.customer_number || (c.name && inv.customer_name && c.name.toLowerCase() === inv.customer_name.toLowerCase())
                  );
                  if (linkedCust && matchesSearchQuery(linkedCust, q)) {
                    return true;
                  }

                  return false;
                };

                return invoices
                  .filter(i => (billingInvoiceCategory === 'DEVELOPER' ? i.invoice_category === 'DEVELOPER' : (i.invoice_category === 'CUSTOMER' || !i.invoice_category)))
                  .filter(i => matchInvoiceEnhanced(i, searchQuery))
                  .filter(i => isDateInPeriod(i.created_date))
                  .map((i, rowIdx) => (
                  <tr key={i.id ? `${i.id}-${rowIdx}` : `inv-${rowIdx}`} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                        🆔 {i.invoice_number}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', marginTop: '4px' }}>
                        🏛️ {i.branch_name || 'Kolkata Branch'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                        📅 {i.created_date || '2026-08-25'}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      {billingInvoiceCategory === 'DEVELOPER' ? (
                        <div>
                          <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>🏢 {i.developer_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                            GSTIN: {i.developer_gstin || '36AAACA1234F1Z5'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                            👤 {i.developer_contact_person || 'Mr. S. K. Reddy'} • 📞 {i.developer_mobile || '+91 98490 99887'}
                          </div>
                          {i.customer_name && (
                            <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                                👤 Customer: {i.customer_name}
                              </span>
                              {i.customer_mobile && (
                                <span style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '700' }}>
                                  ({i.customer_mobile})
                                </span>
                              )}
                              {i.customer_number && (
                                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                                  [{i.customer_number}]
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>👤 {i.customer_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace', marginTop: '2px' }}>
                            {i.customer_mobile || '+91 98490 12345'}
                          </div>
                          {i.customer_number && (
                            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                              🆔 {i.customer_number}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem' }}>{i.property_title}</strong>
                      <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                        {i.particulars || 'Property Consultation & Service Charges'}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>₹{Number(i.taxable_value || 200000).toLocaleString('en-IN')}</span>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700', marginTop: '2px' }}>
                        + GST 18%: ₹{Number((i.cgst_amount || 18000) + (i.sgst_amount || 18000)).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '0.95rem' }}>
                        ₹{Number(i.total_invoice_amount || 236000).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* INTERACTIVE PAYMENT STATUS & MODE COLUMN */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          background: i.payment_status === 'PAID_SETTLED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', 
                          color: i.payment_status === 'PAID_SETTLED' ? '#4ade80' : '#fbbf24', 
                          border: `1px solid ${i.payment_status === 'PAID_SETTLED' ? '#22c55e' : '#eab308'}`, 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontWeight: '900', 
                          fontSize: '0.78rem', 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {i.payment_status === 'PAID_SETTLED' ? (
                            <>✓ PAID ({i.payment_mode || 'ONLINE'})</>
                          ) : (
                            <>⏳ UNPAID / PENDING</>
                          )}
                        </span>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              if (!setInvoices) return;
                              const isCurrentlySettled = i.settlement_status === 'SETTLED' || i.is_settled === true || (i.settlement_status === undefined && (i.payment_status === 'PAID_SETTLED' || i.payment_status === 'PAID' || i.payment_status === 'ONLINE' || (i.payment_status || '').includes('PAID')));
                              const newSettlementStatus = isCurrentlySettled ? 'NOT SETTLED' : 'SETTLED';
                              const updated = invoices.map(inv => {
                                if (inv.id === i.id || (inv.invoice_number && inv.invoice_number === i.invoice_number)) {
                                  return {
                                    ...inv,
                                    settlement_status: newSettlementStatus,
                                    is_settled: !isCurrentlySettled
                                  };
                                }
                                return inv;
                              });
                              setInvoices(updated);
                              try {
                                localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(updated));
                              } catch (err) {}
                              if (syncAllToMongoDB) {
                                syncAllToMongoDB({ invoices: updated });
                              }
                            }}
                            style={{
                              background: (i.settlement_status === 'SETTLED' || i.is_settled === true || (i.settlement_status === undefined && (i.payment_status === 'PAID_SETTLED' || i.payment_status === 'PAID' || i.payment_status === 'ONLINE' || (i.payment_status || '').includes('PAID'))))
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '900',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              boxShadow: (i.settlement_status === 'SETTLED' || i.is_settled === true || (i.settlement_status === undefined && (i.payment_status === 'PAID_SETTLED' || i.payment_status === 'PAID' || i.payment_status === 'ONLINE' || (i.payment_status || '').includes('PAID'))))
                                ? '0 2px 6px rgba(245, 158, 11, 0.3)'
                                : '0 2px 6px rgba(16, 185, 129, 0.3)'
                            }}
                            title={(i.settlement_status === 'SETTLED' || i.is_settled === true || (i.settlement_status === undefined && (i.payment_status === 'PAID_SETTLED' || i.payment_status === 'PAID' || i.payment_status === 'ONLINE' || (i.payment_status || '').includes('PAID')))) ? "Click to Mark Invoice as NOT SETTLED" : "Click to Mark Invoice as SETTLED"}
                          >
                            {(i.settlement_status === 'SETTLED' || i.is_settled === true || (i.settlement_status === undefined && (i.payment_status === 'PAID_SETTLED' || i.payment_status === 'PAID' || i.payment_status === 'ONLINE' || (i.payment_status || '').includes('PAID')))) ? '⚡ Mark NOT SETTLED' : '⚡ Mark SETTLED'}
                          </button>

                          <button
                            onClick={() => {
                              setShowRecordPaymentModal(i);
                              setPaymentStatusInput(i.payment_status || 'PAID_SETTLED');
                              setPaymentModeInput(i.payment_mode || 'ONLINE');
                              setPaymentRefInput(i.payment_ref || '');
                            }}
                            style={{
                              background: 'transparent',
                              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                              color: isLight ? '#0284c7' : '#38bdf8',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              cursor: 'pointer'
                            }}
                          >
                            ⚡ Update Payment
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS COLUMN WITH PRINT PDF & PAYMENT LINK */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setShowPrintInvoiceModal({ open: true, invoice: i })} 
                          style={{ background: billingInvoiceCategory === 'DEVELOPER' ? '#16a34a' : '#0284c7', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Printer size={13} /> Print GST PDF
                        </button>

                        <button 
                          onClick={() => {
                            const isDev = (i.invoice_category || billingInvoiceCategory) === 'DEVELOPER';
                            const matchedCust = (customers || []).find((c: any) => 
                              (i.customer_number && (c.customer_number === i.customer_number || c.id === i.customer_number || c.customerNumber === i.customer_number)) ||
                              (i.customer_name && (c.name?.toLowerCase() === i.customer_name.toLowerCase() || c.customer_name?.toLowerCase() === i.customer_name.toLowerCase() || c.customerName?.toLowerCase() === i.customer_name.toLowerCase())) ||
                              (i.customer_mobile && (c.mobile === i.customer_mobile || c.phone === i.customer_mobile))
                            );
                            const propCodeLookup = i.property_code || i.propertyCode || 'SRM-PROP-2026-000426';
                            const matchedProp = (properties || []).find((p: any) => 
                              p.property_code === propCodeLookup || p.id === propCodeLookup || p.propertyCode === propCodeLookup || (p.title && i.property_title && (p.title.toLowerCase().includes(i.property_title.toLowerCase()) || i.property_title.toLowerCase().includes(p.title.toLowerCase())))
                            );

                            const custName = i.customer_name || matchedCust?.name || matchedCust?.customer_name || matchedCust?.customerName || 'SUMANTH VARMA';
                            const custNum = i.customer_number || matchedCust?.customer_number || matchedCust?.customerNumber || matchedCust?.id || 'SRM-CUS-2026-000185';
                            const custMobile = i.customer_mobile || matchedCust?.mobile || matchedCust?.phone || '+91 98765 43210';
                            const custEmail = (i.customer_email && !i.customer_email.includes('customcr') && i.customer_email !== 'customer@gmail.com')
                              ? i.customer_email
                              : (matchedCust?.email || `${custName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`);

                            const propLocality = (i.property_locality && i.property_locality !== 'Kondapur, Hyderabad')
                              ? i.property_locality
                              : (matchedProp?.locality || matchedProp?.location || 'Barasat, Kolkata');
                            const custAddress = (i.customer_address && !i.customer_address.includes('Jubilee Hills'))
                              ? i.customer_address
                              : (matchedCust?.address || matchedCust?.full_address || matchedProp?.full_address || `${propLocality}, West Bengal - 700124`);
                            const placeOfSupply = (i.place_of_supply && i.place_of_supply !== '36 - Telangana')
                              ? i.place_of_supply
                              : (matchedCust?.place_of_supply || (propLocality.toLowerCase().includes('kolkata') || propLocality.toLowerCase().includes('barasat') || (i.property_title && i.property_title.toLowerCase().includes('kolkata')) ? '19 - West Bengal' : '19 - West Bengal'));
                            const propConfig = (i.property_configuration && i.property_configuration !== '3 BHK Luxury Apartment')
                              ? i.property_configuration
                              : (matchedProp?.configuration || matchedProp?.type || '2BHK');
                            const devGstin = (i.developer_gstin && i.developer_gstin !== '36AAACA1234F1Z5')
                              ? i.developer_gstin
                              : (matchedProp?.developer_gstin || '19AAACD4567E1Z2');

                            const agreeVal = Number(i.agreement_value || (i.flat_price ? Number(i.flat_price) + Number(i.parking_price || 0) : i.taxable_value ? Math.round(Number(i.taxable_value) / 0.02) : (matchedProp?.final_price || 2800000)));
                            const flatVal = Number(i.flat_price || Math.round(agreeVal * 0.95));
                            const parkVal = Number(i.parking_price !== undefined ? i.parking_price : Math.round(agreeVal * 0.05));
                            const brokPct = Number(i.brokerage_percent || 2.0);
                            const taxVal = Number(i.taxable_value || Math.round(agreeVal * (brokPct / 100)));
                            const applyGst = i.apply_gst !== false;
                            const cgstRate = Number(i.cgst_rate !== undefined ? i.cgst_rate : 9);
                            const sgstRate = Number(i.sgst_rate !== undefined ? i.sgst_rate : 9);
                            const gstRate = Number(i.gst_rate !== undefined ? i.gst_rate : (cgstRate + sgstRate));

                            setEditInvoiceForm({
                              ...i,
                              invoice_category: i.invoice_category || (billingInvoiceCategory === 'DEVELOPER' ? 'DEVELOPER' : 'CUSTOMER'),
                              branch_name: i.branch_name || 'Head Office (Kolkata)',
                              created_date: i.created_date || new Date().toISOString().split('T')[0],
                              property_code: i.property_code || matchedProp?.property_code || 'SRM-PROP-2026-000426',
                              property_title: i.property_title || matchedProp?.title || 'GAJAPATI APARTMENT',
                              developer_name: i.developer_name || matchedProp?.developer || 'Dhriti Builders & Developers',
                              developer_gstin: devGstin,
                              developer_rera_id: i.developer_rera_id || matchedProp?.rera_id || 'WBRERA/P/NOR/2024/000842',
                              developer_contact_person: i.developer_contact_person || 'Mr. R. K. Sen (VP Sales)',
                              developer_mobile: i.developer_mobile || '+91 98300 12345',
                              developer_email: i.developer_email || 'billing@dhritibuilders.com',
                              developer_address: i.developer_address || matchedProp?.developer_address || 'Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124',
                              developer_place_of_supply: i.developer_place_of_supply || '19 - West Bengal',
                              property_locality: propLocality,
                              property_configuration: propConfig,
                              customer_number: custNum,
                              customer_name: custName,
                              customer_mobile: custMobile,
                              customer_email: custEmail,
                              place_of_supply: placeOfSupply,
                              customer_gstin_pan: i.customer_gstin_pan || matchedCust?.gstin || matchedCust?.pan || '',
                              customer_address: custAddress,
                              particulars: i.particulars || (isDev ? '2.0% Channel Partner Success Fee / Brokerage' : 'Property Consultation & Processing Charges'),
                              flat_price: String(flatVal),
                              parking_price: String(parkVal),
                              agreement_value: String(agreeVal),
                              brokerage_percent: String(brokPct),
                              taxable_value: String(taxVal),
                              apply_gst: applyGst,
                              gst_rate: String(gstRate),
                              cgst_rate: String(cgstRate),
                              sgst_rate: String(sgstRate),
                              bank_name: i.bank_name || 'HDFC Bank',
                              bank_account_number: i.bank_account_number || '50200018942109',
                              bank_ifsc_code: i.bank_ifsc_code || 'HDFC0000128',
                              bank_upi_id: i.bank_upi_id || 'swaramayi@hdfcbank',
                              company_address: i.company_address || '4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, North 24 Parganas, Madhyamgram, Kolkata - 700129',
                              company_rera_no: i.company_rera_no || 'WBRERA/A/NOR/2025/000737',
                              company_email: i.company_email || 'avishek@swaramayi.info',
                              company_mobile: i.company_mobile || '+91 88021 30791',
                              company_website: i.company_website || 'https://swaramayi-website.vercel.app/',
                              payment_status: i.payment_status || 'UNPAID_PENDING',
                              payment_mode: i.payment_mode || '',
                              payment_ref: i.payment_ref || '',
                              sales_executive: i.sales_executive || matchedCust?.assignedExecutive || 'Avishek Das'
                            });
                            setShowEditInvoiceModal(i);
                          }}
                          style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}
                          title="Edit invoice details, particulars, amounts and payment status"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button 
                          onClick={() => {
                            setShowPaymentLinkModal(i);
                            setCopyToast(false);
                          }} 
                          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)' }}
                        >
                          <Link size={13} /> Payment Link
                        </button>

                        {isSuperAdmin && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete this invoice record for ${i.customer_name || i.developer_name || 'Client'}?`)) {
                                const targetName = (i.customer_name || i.party_name || i.developer_name || '').toLowerCase().trim();
                                const targetInvNum = (i.invoice_number || '').toLowerCase().trim();
                                const targetId = (i.id || '').toLowerCase().trim();
                                const targetCustNum = (i.customer_number || '').toLowerCase().trim();

                                const remainingInvoices = (invoices || []).filter((item: any) => {
                                  if (item === i) return false;
                                  if (targetId && item.id && item.id.toLowerCase().trim() === targetId) return false;
                                  if (targetInvNum && item.invoice_number && item.invoice_number.toLowerCase().trim() === targetInvNum) return false;
                                  if (targetCustNum && item.customer_number && item.customer_number.toLowerCase().trim() === targetCustNum) return false;
                                  if (targetName && (item.customer_name || item.party_name || item.developer_name)) {
                                    const itemName = (item.customer_name || item.party_name || item.developer_name || '').toLowerCase().trim();
                                    if (itemName === targetName) return false;
                                  }
                                  return true;
                                });
                                if (onRecycleItem) {
                                  onRecycleItem({
                                    id: i.id || i.invoice_number || `INV-${Date.now()}`,
                                    title: `Invoice - ${i.customer_name || i.developer_name || i.party_name || 'Client'} (${i.invoice_number || i.id})`,
                                    category: 'Billing',
                                    originalLocation: 'Billing Management Vault',
                                    details: `Category: ${i.invoice_category || 'CUSTOMER'}, Total Amount: ₹${Number(i.total_invoice_amount || 0).toLocaleString('en-IN')}`,
                                    originalData: i
                                  });
                                }
                                if (setInvoices) {
                                  setInvoices(remainingInvoices);
                                }
                                try {
                                  localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(remainingInvoices));
                                } catch (err) {}
                                if (syncAllToMongoDB) {
                                  syncAllToMongoDB({ invoices: remainingInvoices });
                                }
                                alert(`🗑️ Invoice record moved to Recycle Bin.`);
                              }
                            }}
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Permanently delete invoice record"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: RECORD / UPDATE PAYMENT & SELECT PAYMENT MODE */}
      {showRecordPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #38bdf8', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '900' }}>⚡ PAYMENT STATUS & MODE SETTLEMENT</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '2px' }}>
                  Update {showRecordPaymentModal.invoice_number}
                </h3>
              </div>
              <button onClick={() => setShowRecordPaymentModal(null)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* STATUS TOGGLE */}
            <div>
              <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '8px' }}>
                Select Payment Status *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentStatusInput('PAID_SETTLED')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentStatusInput === 'PAID_SETTLED' ? '2px solid #22c55e' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                    background: paymentStatusInput === 'PAID_SETTLED' ? 'rgba(34, 197, 94, 0.15)' : (isLight ? '#f8fafc' : '#0f172a'),
                    color: paymentStatusInput === 'PAID_SETTLED' ? '#22c55e' : (isLight ? '#475569' : '#94a3b8'),
                    fontWeight: '900',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} /> ✓ Mark as PAID
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatusInput('UNPAID_PENDING')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentStatusInput === 'UNPAID_PENDING' ? '2px solid #eab308' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                    background: paymentStatusInput === 'UNPAID_PENDING' ? 'rgba(234, 179, 8, 0.15)' : (isLight ? '#f8fafc' : '#0f172a'),
                    color: paymentStatusInput === 'UNPAID_PENDING' ? '#eab308' : (isLight ? '#475569' : '#94a3b8'),
                    fontWeight: '900',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock size={16} /> ⏳ Mark as PENDING
                </button>
              </div>
            </div>

            {/* PAYMENT MODE SELECTOR (WHEN PAID IS SELECTED) */}
            {paymentStatusInput === 'PAID_SETTLED' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: isLight ? '#f8fafc' : '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #22c55e' }}>
                <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block' }}>
                  💳 Select Payment Mode *
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { mode: 'ONLINE', label: '💳 ONLINE (UPI / Card)' },
                    { mode: 'CASH', label: '💵 CASH (Physical Cash)' },
                    { mode: 'CHEQUE', label: '📑 CHEQUE (Check Deposit)' },
                    { mode: 'NEFT', label: '🏦 NEFT / RTGS / IMPS' },
                  ].map(m => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => setPaymentModeInput(m.mode as any)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: paymentModeInput === m.mode ? '2px solid #38bdf8' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                        background: paymentModeInput === m.mode ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'),
                        color: paymentModeInput === m.mode ? '#ffffff' : (isLight ? '#0f172a' : '#ffffff'),
                        fontWeight: paymentModeInput === m.mode ? '900' : '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                    Payment Reference / Txn No. (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={paymentRefInput} 
                    onChange={(e) => setPaymentRefInput(e.target.value)} 
                    placeholder="e.g. TXN90412895 or CHQ-401928" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowRecordPaymentModal(null)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleUpdatePayment} style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>
                ✓ Save Payment Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE & SHARE INSTANT PAYMENT LINK */}
      {showPaymentLinkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #6366f1', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', color: '#6366f1' }}>🔗</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
                  Invoice Payment Link
                </h3>
              </div>
              <button onClick={() => setShowPaymentLinkModal(null)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* GREEN ALERT BANNER */}
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '0.85rem', fontWeight: '800' }}>
              <CheckCircle2 size={18} />
              <span>Payment link successfully generated for invoice <strong>{showPaymentLinkModal.invoice_number}</strong>!</span>
            </div>

            {/* INVOICE DETAILS WHITE CARD */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#0f172a', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Customer / Billed Name</span>
                <strong style={{ fontSize: '0.9rem' }}>{showPaymentLinkModal.customer_name || showPaymentLinkModal.developer_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Invoice Reference Number</span>
                <strong style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: '0.9rem' }}>{showPaymentLinkModal.invoice_number}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Property Unit</span>
                <strong style={{ fontSize: '0.85rem' }}>{showPaymentLinkModal.property_title}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Total Payable Amount</span>
                <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>₹{Number(showPaymentLinkModal.total_invoice_amount).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* GENERATED PAYMENT LINK URL INPUT BOX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>
                Generated Payment Link URL:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/pay/invoice?inv=${showPaymentLinkModal.invoice_number}`} 
                  style={{ flex: 1, background: isLight ? '#0f172a' : '#0f172a', border: '1px solid #6366f1', color: '#38bdf8', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace' }} 
                />
                <button
                  type="button"
                  onClick={() => {
                    const payUrl = `${window.location.origin}/pay/invoice?inv=${showPaymentLinkModal.invoice_number}`;
                    navigator.clipboard.writeText(payUrl);
                    setCopyToast(true);
                    setTimeout(() => setCopyToast(false), 3000);
                  }}
                  style={{ background: '#6366f1', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                >
                  <Copy size={16} /> {copyToast ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              {copyToast && (
                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '800', marginTop: '2px' }}>
                  ✓ Payment Link URL successfully copied to clipboard!
                </div>
              )}
            </div>

            {/* INSTANT SHARE ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const phone = (showPaymentLinkModal.customer_mobile || showPaymentLinkModal.developer_mobile || '').replace(/[^0-9]/g, '');
                    const payUrl = `${window.location.origin}/pay/invoice?inv=${showPaymentLinkModal.invoice_number}`;
                    const msg = encodeURIComponent(`Hello ${showPaymentLinkModal.customer_name || showPaymentLinkModal.developer_name},\n\nHere is your official Swaramayi Real Estate GST Tax Invoice ${showPaymentLinkModal.invoice_number} for ₹${Number(showPaymentLinkModal.total_invoice_amount).toLocaleString('en-IN')}.\n\nPay online securely via UPI / Card / Net Banking:\n${payUrl}\n\nThank you,\nSwaramayi Real Estate Marketing`);
                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                  }}
                  style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={16} /> Share on WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const email = showPaymentLinkModal.customer_email || showPaymentLinkModal.developer_email || 'rohan.deshmukh@gmail.com';
                    const payUrl = `${window.location.origin}/pay/invoice?inv=${showPaymentLinkModal.invoice_number}`;
                    const subject = encodeURIComponent(`Tax Invoice Payment Link - ${showPaymentLinkModal.invoice_number}`);
                    const body = encodeURIComponent(`Dear ${showPaymentLinkModal.customer_name || showPaymentLinkModal.developer_name},\n\nPlease find your official Swaramayi Real Estate GST Tax Invoice payment link below:\n\n• Invoice Number: ${showPaymentLinkModal.invoice_number}\n• Property Unit: ${showPaymentLinkModal.property_title}\n• Total Payable Amount: ₹${Number(showPaymentLinkModal.total_invoice_amount).toLocaleString('en-IN')}\n\n🌐 Secure Online Payment URL:\n${payUrl}\n\nRegards,\nSwaramayi Real Estate Marketing`);
                    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
                  }}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} /> Send via Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const payUrl = `${window.location.origin}/pay/invoice?inv=${showPaymentLinkModal.invoice_number}`;
                    navigator.clipboard.writeText(payUrl);
                    setCopyToast(true);
                    setTimeout(() => setCopyToast(false), 3000);
                  }}
                  style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Copy size={16} /> Copy Payment Link
                </button>
              </div>

              <button type="button" onClick={() => setShowPaymentLinkModal(null)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIVE INTERACTIVE CUSTOMER ONLINE PAYMENT GATEWAY PORTAL */}
      {showCustomerPaymentPortal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #22c55e', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #22c55e', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src="/swaramayi-logo.png" 
                  alt="Swaramayi Logo" 
                  style={{ height: '46px', background: '#ffffff', padding: '3px 10px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', objectFit: 'contain' }} 
                />
                <div>
                  <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                    🔒 256-BIT SSL SECURE PAYMENT GATEWAY
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '4px', margin: 0 }}>
                    SWARAMAYI REAL ESTATE ONLINE CHECKOUT
                  </h2>
                </div>
              </div>
              <button onClick={() => { setShowCustomerPaymentPortal(null); setPaymentSuccessReceipt(null); }} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            {/* SUCCESS RECEIPT VIEW */}
            {paymentSuccessReceipt ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} color="#22c55e" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e' }}>Payment Successful & Settled!</h3>
                  <p style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                    Transaction Receipt #{paymentSuccessReceipt.txnId} generated successfully.
                  </p>
                </div>

                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div><strong>Invoice Number:</strong> {paymentSuccessReceipt.invoice_number}</div>
                  <div><strong>Amount Paid:</strong> <strong style={{ color: '#22c55e' }}>₹{Number(paymentSuccessReceipt.amount).toLocaleString('en-IN')}</strong></div>
                  <div><strong>Payment Mode:</strong> {paymentSuccessReceipt.mode}</div>
                  <div><strong>Date & Time:</strong> {paymentSuccessReceipt.timestamp}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>SHA256 Stamp:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#38bdf8' }}>{paymentSuccessReceipt.hash}</span></div>
                </div>

                <button
                  onClick={() => {
                    setShowCustomerPaymentPortal(null);
                    setPaymentSuccessReceipt(null);
                  }}
                  style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  ✓ Done & Return to Vault
                </button>
              </div>
            ) : (
              <>
                {/* INVOICE PAYABLE BILL SUMMARY BOX */}
                <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '700' }}>PAYABLE INVOICE AMOUNT</span>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '2px 0 0 0' }}>
                      ₹{Number(showCustomerPaymentPortal.total_invoice_amount).toLocaleString('en-IN')}
                    </h1>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '4px' }}>
                      Invoice: {showCustomerPaymentPortal.invoice_number} • Billed To: {showCustomerPaymentPortal.customer_name || showCustomerPaymentPortal.developer_name}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', display: 'block' }}>PAYMENT STATUS</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fbbf24' }}>⏳ PENDING</span>
                  </div>
                </div>

                {/* ONLINE PAYMENT METHOD TABS */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', display: 'block', marginBottom: '8px' }}>
                    Choose Preferred Payment Method:
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { tab: 'UPI', label: '📱 UPI (GPay / Paytm)' },
                      { tab: 'CARD', label: '💳 Credit / Debit Card' },
                      { tab: 'NEFT', label: '🏦 Net Banking / NEFT' },
                    ].map(t => (
                      <button
                        key={t.tab}
                        onClick={() => setPortalPaymentTab(t.tab as any)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: portalPaymentTab === t.tab ? '2px solid #22c55e' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                          background: portalPaymentTab === t.tab ? (isLight ? '#f0fdf4' : '#052e16') : (isLight ? '#ffffff' : '#1e293b'),
                          color: portalPaymentTab === t.tab ? '#22c55e' : (isLight ? '#475569' : '#94a3b8'),
                          fontWeight: '900',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB 1: UPI PAY */}
                {portalPaymentTab === 'UPI' && (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '2px solid #22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${showCustomerPaymentPortal.bank_upi_id || 'swaramayi@hdfcbank'}&pn=Swaramayi%20Real%20Estate&am=${showCustomerPaymentPortal.total_invoice_amount}&tr=${showCustomerPaymentPortal.invoice_number}`)}`} 
                        alt="UPI QR Code" 
                        style={{ width: '160px', height: '160px' }}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace' }}>
                        VPA: {showCustomerPaymentPortal.bank_upi_id || 'swaramayi@hdfcbank'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Scan QR Code with any UPI App or click instant pay button below:
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button type="button" onClick={() => setPortalPaymentTab('UPI')} style={{ background: '#4285F4', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>Google Pay</button>
                      <button type="button" onClick={() => setPortalPaymentTab('UPI')} style={{ background: '#5f259f', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>PhonePe</button>
                      <button type="button" onClick={() => setPortalPaymentTab('UPI')} style={{ background: '#00baf2', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>Paytm UPI</button>
                    </div>
                  </div>
                )}

                {/* TAB 2: CREDIT / DEBIT CARD */}
                {portalPaymentTab === 'CARD' && (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Cardholder Full Name</label>
                      <input type="text" defaultValue={showCustomerPaymentPortal.customer_name || 'Rohan Deshmukh'} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.82rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>16-Digit Card Number</label>
                      <input type="text" defaultValue="4532 8910 2034 9012" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Expiry Date (MM/YY)</label>
                        <input type="text" defaultValue="09/29" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>CVV Security Code</label>
                        <input type="password" defaultValue="849" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: NET BANKING / NEFT */}
                {portalPaymentTab === 'NEFT' && (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                    <div><strong>Beneficiary Bank:</strong> {showCustomerPaymentPortal.bank_name || 'HDFC Bank'}</div>
                    <div><strong>Account Number:</strong> <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{showCustomerPaymentPortal.bank_account_number || '50200018942109'}</span></div>
                    <div><strong>IFSC Code:</strong> <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{showCustomerPaymentPortal.bank_ifsc_code || 'HDFC0000128'}</span></div>
                    <div><strong>Account Name:</strong> Swaramayi Real Estate</div>
                    <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Transfer amount via NEFT / RTGS / IMPS and click "Complete Secure Payment" below.
                    </div>
                  </div>
                )}

                {/* ACTION BUTTON TO COMPLETE PAYMENT LIVE */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => {
                    setIsProcessingPayment(true);
                    setTimeout(() => {
                      const txnId = 'TXN-2026-' + Math.floor(100000 + Math.random() * 900000);
                      const hash = 'SHA256-' + Math.random().toString(36).substring(2, 12).toUpperCase();

                      // Update invoice in state
                      if (setInvoices) {
                        const updated = invoices.map(inv => {
                          if (inv.id === showCustomerPaymentPortal.id || inv.invoice_number === showCustomerPaymentPortal.invoice_number) {
                            return {
                              ...inv,
                              payment_status: 'PAID_SETTLED',
                              payment_mode: portalPaymentTab,
                              payment_ref: txnId
                            };
                          }
                          return inv;
                        });
                        setInvoices(updated);
                      }

                      setIsProcessingPayment(false);
                      setPaymentSuccessReceipt({
                        txnId,
                        hash,
                        invoice_number: showCustomerPaymentPortal.invoice_number,
                        amount: showCustomerPaymentPortal.total_invoice_amount,
                        mode: portalPaymentTab,
                        timestamp: new Date().toLocaleString('en-IN')
                      });
                    }, 1200);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '1rem',
                    cursor: isProcessingPayment ? 'wait' : 'pointer',
                    boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessingPayment ? (
                    <>⏳ Processing Payment via Bank Network...</>
                  ) : (
                    <>✓ Complete Secure Payment (₹{Number(showCustomerPaymentPortal.total_invoice_amount).toLocaleString('en-IN')})</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: FULL COMPREHENSIVE EDIT TAX INVOICE MODAL (MATCHING CREATE INVOICE 3-PAGE FORM) */}
      {showEditInvoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #f59e0b', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📄 Edit Tax Invoice ({editInvoiceForm.invoice_category === 'DEVELOPER' ? 'B2B Developer Billing' : 'B2C Customer Billing'})
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                  Generate / Edit Tax Invoice based on Flat + Parking Price Agreement Value with editable GST tax rates.
                </p>
              </div>
              <button onClick={() => setShowEditInvoiceModal(null)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSaveEditInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* TOP ROW: INVOICE CATEGORY & ISSUING BRANCH */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Invoice Category *</label>
                  <select 
                    value={editInvoiceForm.invoice_category || 'CUSTOMER'} 
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const agreeVal = Number(editInvoiceForm.agreement_value || 8400000);
                      const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                      const compTaxable = Math.round(agreeVal * (brokPct / 100));
                      setEditInvoiceForm({ 
                        ...editInvoiceForm, 
                        invoice_category: newCat,
                        particulars: newCat === 'DEVELOPER' ? '2.0% Channel Partner Success Fee / Brokerage' : 'Property Consultation & Processing Charges',
                        taxable_value: String(compTaxable)
                      });
                    }} 
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #38bdf8', color: '#38bdf8', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}
                  >
                    <option value="CUSTOMER">👤 B2C CUSTOMER INVOICE (Consultancy / Booking Advance)</option>
                    <option value="DEVELOPER">🏢 B2B DEVELOPER INVOICE (2.0% Channel Partner Brokerage)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Issuing Branch *</label>
                  <select 
                    value={editInvoiceForm.branch_name || 'Head Office (Kolkata)'} 
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, branch_name: e.target.value })} 
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #38bdf8', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}
                  >
                    {branches && branches.length > 0 ? (
                      branches.map((b: any, idx: number) => (
                        <option key={idx} value={b.branch_name}>{b.branch_name} ({b.city})</option>
                      ))
                    ) : (
                      <>
                        <option value="Head Office (Kolkata)">Head Office (Kolkata)</option>
                        <option value="Kolkata Branch">Kolkata Branch</option>
                        <option value="Hyderabad Corporate HQ">Hyderabad Corporate HQ</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Invoice Date *</label>
                  <input 
                    type="date" 
                    value={editInvoiceForm.created_date || ''} 
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, created_date: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {/* CARD 1: PROPERTY MASTER & STOCK INVENTORY DETAILS */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #22c55e', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏠 PROPERTY MASTER & STOCK INVENTORY DETAILS
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    Auto-Fetch Enabled by Property Code
                  </span>
                </div>

                {/* QUICK SELECT STOCK INVENTORY DROPDOWN */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                    ⚡ Auto-Fetch from Stock Inventory Vault (Select Property Code / Title):
                  </label>
                  <select
                    value={editInvoiceForm.property_code || ''}
                    onChange={(e) => {
                      const pCode = e.target.value;
                      const prop = (properties || []).find(p => p.property_code === pCode || p.id === pCode);
                      if (prop) {
                        const numPrice = typeof prop.final_price === 'number' ? prop.final_price : (parseInt(String(prop.final_price).replace(/[^0-9]/g, '')) || 8400000);
                        const computedFlatPrice = Math.round(numPrice * 0.95);
                        const computedParkPrice = Math.round(numPrice * 0.05);
                        const computedAgreementVal = computedFlatPrice + computedParkPrice;
                        const isDev = editInvoiceForm.invoice_category === 'DEVELOPER';
                        const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                        const computedTaxableVal = Math.round(computedAgreementVal * (brokPct / 100));

                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          property_code: prop.property_code,
                          property_title: prop.title || `${prop.property_code} Residence`,
                          developer_name: prop.developer || prop.builder || 'Aparna Constructions',
                          developer_gstin: prop.developer_gstin || '36AAACA1234F1Z5',
                          property_locality: prop.locality || 'Kondapur, Hyderabad',
                          property_configuration: prop.configuration || '3 BHK Luxury Apartment',
                          flat_price: String(computedFlatPrice),
                          parking_price: String(computedParkPrice),
                          agreement_value: String(computedAgreementVal),
                          taxable_value: String(computedTaxableVal),
                          particulars: isDev 
                            ? `2.0% Channel Partner Success Fee / Brokerage for ${prop.title} [Code: ${prop.property_code}]` 
                            : `Property Consultation & Processing Charges for ${prop.title} [Code: ${prop.property_code}]`
                        });
                      }
                    }}
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', color: '#4ade80', padding: '7px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }}
                  >
                    <option value="">-- Choose Stock Inventory Tracking Code --</option>
                    {(properties || []).map((p: any, idx: number) => (
                      <option key={idx} value={p.property_code}>
                        🏢 {p.property_code} — {p.title} ({p.locality}) | Price: {p.final_price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* GRID ROW 1: PROPERTY CODE (LIVE MATCH), TITLE, DEVELOPER */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🏷️ Property Code / Inventory ID *
                    </label>
                    <input 
                      type="text" 
                      value={editInvoiceForm.property_code || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = (properties || []).find(p => 
                          p.property_code?.toLowerCase() === val.toLowerCase() || 
                          p.id?.toLowerCase() === val.toLowerCase()
                        );
                        if (matched) {
                          const numPrice = typeof matched.final_price === 'number' ? matched.final_price : (parseInt(String(matched.final_price).replace(/[^0-9]/g, '')) || 8400000);
                          const fPrice = Math.round(numPrice * 0.95);
                          const pPrice = Math.round(numPrice * 0.05);
                          const compAgree = fPrice + pPrice;
                          const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                          const compTaxable = Math.round(compAgree * (brokPct / 100));
                          setEditInvoiceForm({
                            ...editInvoiceForm,
                            property_code: val,
                            property_title: matched.title || `${val} Residence`,
                            developer_name: matched.developer || matched.builder || 'Aparna Constructions',
                            developer_gstin: matched.developer_gstin || '36AAACA1234F1Z5',
                            property_locality: matched.locality || 'Kondapur, Hyderabad',
                            property_configuration: matched.configuration || '3 BHK Luxury Apartment',
                            flat_price: String(fPrice),
                            parking_price: String(pPrice),
                            agreement_value: String(compAgree),
                            taxable_value: String(compTaxable)
                          });
                        } else {
                          setEditInvoiceForm({ ...editInvoiceForm, property_code: val });
                        }
                      }} 
                      placeholder="SRM-PROP-2026-000421" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #22c55e', color: '#4ade80', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Property Title & Unit Details *</label>
                    <input type="text" value={editInvoiceForm.property_title || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, property_title: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Developer / Builder Name *</label>
                    <input type="text" value={editInvoiceForm.developer_name || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_name: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} required />
                  </div>
                </div>

                {/* GRID ROW 2: LOCALITY, CONFIGURATION, DEVELOPER GSTIN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Locality / Sector</label>
                    <input type="text" value={editInvoiceForm.property_locality || 'Kondapur, Hyderabad'} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, property_locality: e.target.value })} placeholder="Kondapur, Hyderabad" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>BHK & Unit Configuration</label>
                    <input type="text" value={editInvoiceForm.property_configuration || '3 BHK Luxury Apartment'} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, property_configuration: e.target.value })} placeholder="3 BHK Luxury Apartment" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Developer GSTIN</label>
                    <input type="text" value={editInvoiceForm.developer_gstin || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_gstin: e.target.value })} placeholder="36AAACA1234F1Z5" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>
                </div>
              </div>

              {/* CARD 2: CUSTOMER / BUYER DETAILS (SHOWN FOR BOTH B2C CUSTOMER AND B2B DEVELOPER AS LINKED BUYER) */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {editInvoiceForm.invoice_category === 'DEVELOPER' ? '👤 LINKED CUSTOMER / BUYER MASTER DETAILS' : '👤 B2C CUSTOMER MASTER DETAILS & BILLING INFO'}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    Auto-fill Enabled by Customer ID
                  </span>
                </div>

                {/* QUICK SELECT EXISTING CUSTOMER DROPDOWN */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>⚡ Auto-Fill from Customer Master Vault (Select Customer ID / Name):</label>
                  <select
                    value={editInvoiceForm.customer_number || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const selected = (customers || []).find((c: any) => c.customer_number === val || c.name === val || c.id === val || c.customerNumber === val);
                      if (selected) {
                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          customer_name: selected.name || selected.customer_name || selected.customerName || editInvoiceForm.customer_name,
                          customer_number: selected.customer_number || selected.customerNumber || selected.id || 'SRM-CUS-2026-000185',
                          customer_mobile: selected.mobile || selected.phone || editInvoiceForm.customer_mobile,
                          customer_email: selected.email || `${(selected.name || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`,
                          customer_address: selected.address || selected.full_address || (selected.preferredArea ? `Jessore Road, ${selected.preferredArea}, West Bengal - 700124` : 'Jessore Road, Barasat, Kolkata, West Bengal - 700124'),
                          place_of_supply: selected.state || selected.place_of_supply || (selected.preferredArea?.includes('Kolkata') || selected.preferredArea?.includes('Barasat') ? '19 - West Bengal' : '19 - West Bengal'),
                          customer_gstin_pan: selected.gstin || selected.pan || '19ABCDE1234F1Z5'
                        });
                      }
                    }}
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', color: '#38bdf8', padding: '7px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }}
                  >
                    <option value="">-- Choose Customer to Auto-Populate Details --</option>
                    {(customers || []).map((c: any, idx: number) => (
                      <option key={idx} value={c.customer_number || c.customerNumber || c.name}>
                        🆔 {c.customer_number || c.customerNumber || 'SRM-CUS-2026-000185'} — {c.name || c.customer_name || c.customerName} ({c.mobile || c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* GRID ROW 1: ID (LIVE MATCH), NAME, MOBILE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🆔 Customer ID / Number *</label>
                    <input 
                      type="text" 
                      value={editInvoiceForm.customer_number || ''} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = (customers || []).find((c: any) => 
                          c.customer_number?.toLowerCase() === val.toLowerCase() || 
                          c.customerNumber?.toLowerCase() === val.toLowerCase() ||
                          c.id?.toLowerCase() === val.toLowerCase()
                        );
                        if (matched) {
                          setEditInvoiceForm({
                            ...editInvoiceForm,
                            customer_number: val,
                            customer_name: matched.name || matched.customer_name || matched.customerName || editInvoiceForm.customer_name,
                            customer_mobile: matched.mobile || matched.phone || editInvoiceForm.customer_mobile,
                            customer_email: matched.email || `${(matched.name || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`,
                            customer_address: matched.address || matched.full_address || (matched.preferredArea ? `Jessore Road, ${matched.preferredArea}, West Bengal - 700124` : 'Jessore Road, Barasat, Kolkata, West Bengal - 700124'),
                            place_of_supply: matched.state || matched.place_of_supply || (matched.preferredArea?.includes('Kolkata') || matched.preferredArea?.includes('Barasat') ? '19 - West Bengal' : '19 - West Bengal'),
                            customer_gstin_pan: matched.gstin || matched.pan || '19ABCDE1234F1Z5'
                          });
                        } else {
                          setEditInvoiceForm({ ...editInvoiceForm, customer_number: val });
                        }
                      }} 
                      placeholder="SRM-CUS-2026-000185" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #0284c7', color: '#38bdf8', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Name *</label>
                    <input type="text" value={editInvoiceForm.customer_name || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_name: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} required />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Mobile *</label>
                    <input type="text" value={editInvoiceForm.customer_mobile || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_mobile: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} required />
                  </div>
                </div>

                {/* GRID ROW 2: EMAIL, STATE/POS, GSTIN/PAN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Email *</label>
                    <input type="email" value={editInvoiceForm.customer_email || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_email: e.target.value })} placeholder="customer@gmail.com" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Place of Supply (State) *</label>
                    <input type="text" value={editInvoiceForm.place_of_supply || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, place_of_supply: e.target.value })} placeholder="19 - West Bengal" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>GSTIN / PAN (Optional)</label>
                    <input type="text" value={editInvoiceForm.customer_gstin_pan || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_gstin_pan: e.target.value })} placeholder="19ABCDE1234F1Z5 or PAN" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                  </div>
                </div>

                {/* GRID ROW 3: BILLING ADDRESS */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Billing Address & Pincode *</label>
                  <input type="text" value={editInvoiceForm.customer_address || ''} onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, customer_address: e.target.value })} placeholder="Flat No., Building Name, Street / Locality, City - Pincode" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} />
                </div>
              </div>

              {/* CARD 3 (DEVELOPER ONLY): B2B DEVELOPER MASTER DETAILS & CORPORATE BILLING INFO */}
              {editInvoiceForm.invoice_category === 'DEVELOPER' && (
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #16a34a', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🏢 B2B DEVELOPER MASTER DETAILS & CORPORATE BILLING INFO
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      Auto-Fill Enabled by Builder Vault
                    </span>
                  </div>

                  {/* QUICK SELECT EXISTING DEVELOPER DROPDOWN */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>⚡ Auto-Fill from Builder Vault (Select Developer / Corporate Entity):</label>
                    <select
                      value={editInvoiceForm.developer_name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const devList: Record<string, any> = {
                          'Dhriti Builders & Developers': { gstin: '19AAACD4567E1Z2', contact: 'Mr. R. K. Sen (VP Sales)', mobile: '+91 98300 12345', email: 'billing@dhritibuilders.com', address: 'Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124', rera: 'WBRERA/P/NOR/2024/000842', pos: '19 - West Bengal' },
                          'Swaramayi Partner Developer': { gstin: '19AAACD4567E1Z2', contact: 'Mr. Animesh Sen', mobile: '+91 98300 12345', email: 'billing@dhritibuilders.com', address: 'Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124', rera: 'WBRERA/P/NOR/2024/000842', pos: '19 - West Bengal' },
                          'Merlin Group': { gstin: '19AAACM9988D1Z4', contact: 'Mr. S. Chatterjee (GM Sales)', mobile: '+91 98310 99887', email: 'billing@merlingroup.in', address: 'Merlin Oxford, 22 Prince Anwar Shah Road, Kolkata - 700033', rera: 'WBRERA/P/KOL/2024/000215', pos: '19 - West Bengal' },
                          'PS Group': { gstin: '19AAACP1122K1Z8', contact: 'Mr. A. Banerjee (Finance Head)', mobile: '+91 98300 44556', email: 'billing@psgroup.in', address: 'PS Srijan Corporate Park, Sector V, Salt Lake, Kolkata - 700091', rera: 'WBRERA/P/NOR/2024/000321', pos: '19 - West Bengal' },
                          'Aparna Constructions': { gstin: '36AAACA1234F1Z5', contact: 'Mr. S. K. Reddy (VP Sales)', mobile: '+91 98490 99887', email: 'billing@aparnaconstructions.com', address: 'Aparna Infra Towers, Road No 12, Banjara Hills, Hyderabad - 500034', rera: 'P02400001234', pos: '36 - Telangana' },
                          'My Home Group': { gstin: '36AABCM5678G1Z9', contact: 'Mr. V. Ramakrishna (GM Accounts)', mobile: '+91 91210 55443', email: 'accounts@myhomegroup.in', address: 'My Home Hub, Hitech City Main Rd, Madhapur, Hyderabad - 500081', rera: 'P02400002156', pos: '36 - Telangana' },
                          'Prestige Group': { gstin: '36AAACP9876H1Z2', contact: 'Ms. Ananya Sharma (Finance Lead)', mobile: '+91 98800 11223', email: 'billing.hyd@prestigeconstructions.com', address: 'Prestige Falcon Towers, Financial District, Nanakramguda, Hyderabad - 500032', rera: 'P02400003980', pos: '36 - Telangana' },
                          'Sumadhura Infracon': { gstin: '36AABCS4321J1Z4', contact: 'Mr. K. Mahesh (Channel Partner Mgr)', mobile: '+91 90001 88776', email: 'cp.billing@sumadhura.com', address: 'Sumadhura Horizon, Mindspace Circle, Hitech City, Hyderabad - 500081', rera: 'P02400004512', pos: '36 - Telangana' }
                        };
                        const devInfo = devList[val];
                        if (devInfo) {
                          setEditInvoiceForm({
                            ...editInvoiceForm,
                            developer_name: val,
                            developer_gstin: devInfo.gstin,
                            developer_contact_person: devInfo.contact,
                            developer_mobile: devInfo.mobile,
                            developer_email: devInfo.email,
                            developer_address: devInfo.address,
                            developer_rera_id: devInfo.rera,
                            developer_place_of_supply: devInfo.pos
                          });
                        } else {
                          setEditInvoiceForm({ ...editInvoiceForm, developer_name: val });
                        }
                      }}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', color: '#4ade80', padding: '7px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }}
                    >
                      <option value="">-- Select Developer / Builder Entity --</option>
                      <option value="Dhriti Builders & Developers">🏢 Dhriti Builders & Developers (Kolkata)</option>
                      <option value="Swaramayi Partner Developer">🏢 Swaramayi Partner Developer</option>
                      <option value="Merlin Group">🏢 Merlin Group (Kolkata)</option>
                      <option value="PS Group">🏢 PS Group (Kolkata)</option>
                      <option value="Aparna Constructions">🏢 Aparna Constructions & Estates Pvt Ltd</option>
                      <option value="My Home Group">🏢 My Home Group (My Home Constructions)</option>
                      <option value="Prestige Group">🏢 Prestige Estates Projects Ltd</option>
                      <option value="Sumadhura Infracon">🏢 Sumadhura Infracon Pvt Ltd</option>
                    </select>
                  </div>

                  {/* GRID ROW 1: DEVELOPER NAME, GSTIN, RERA ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🏢 Developer / Builder Corporate Name *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_name || ''} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_name: e.target.value })} 
                        placeholder="Dhriti Builders & Developers" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📜 Developer GSTIN *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_gstin || ''} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_gstin: e.target.value })} 
                        placeholder="19AAACD4567E1Z2" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800' }} 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🏛️ Developer RERA Reg. No.</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_rera_id || 'WBRERA/P/NOR/2024/000842'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_rera_id: e.target.value })} 
                        placeholder="WBRERA/P/NOR/2024/000842" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace' }} 
                      />
                    </div>
                  </div>

                  {/* GRID ROW 2: CONTACT PERSON, MOBILE, EMAIL */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>👤 Authorized Contact Person *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_contact_person || 'Mr. R. K. Sen (VP Sales)'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_contact_person: e.target.value })} 
                        placeholder="Mr. R. K. Sen (VP Sales)" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📞 Developer Phone / Mobile *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_mobile || '+91 98300 12345'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_mobile: e.target.value })} 
                        placeholder="+91 98300 12345" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>✉️ Official Billing Email *</label>
                      <input 
                        type="email" 
                        value={editInvoiceForm.developer_email || 'billing@dhritibuilders.com'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_email: e.target.value })} 
                        placeholder="billing@dhritibuilders.com" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>
                  </div>

                  {/* GRID ROW 3: PLACE OF SUPPLY & CORPORATE ADDRESS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>📍 Place of Supply (State) *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_place_of_supply || '19 - West Bengal'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_place_of_supply: e.target.value })} 
                        placeholder="19 - West Bengal" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>🏢 Developer Registered Corporate Address *</label>
                      <input 
                        type="text" 
                        value={editInvoiceForm.developer_address || 'Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, developer_address: e.target.value })} 
                        placeholder="Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 3: BILLED PARTICULARS / SERVICE DESCRIPTION */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>
                    📝 Billed Particulars / Service Description *
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '700' }}>
                    ⚡ Default Provided (Fully Editable Below)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* PRESET QUICK DROPDOWN */}
                  <select
                    value={
                      ['Property Consultation & Processing Charges',
                       '2.0% Channel Partner Success Fee / Brokerage',
                       'Booking Advance & Property Registration Fee',
                       'Real Estate Advisory & Documentation Charges',
                       'Property Marketing & Site Visit Facilitation Fee'].includes(editInvoiceForm.particulars)
                        ? editInvoiceForm.particulars
                        : 'CUSTOM'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'CUSTOM') {
                        setEditInvoiceForm({ ...editInvoiceForm, particulars: e.target.value });
                      }
                    }}
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', color: '#38bdf8', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
                  >
                    <option value="Property Consultation & Processing Charges">📋 Default (Customer): Property Consultation & Processing Charges</option>
                    <option value="2.0% Channel Partner Success Fee / Brokerage">🏢 Default (Developer): 2.0% Channel Partner Success Fee / Brokerage</option>
                    <option value="Booking Advance & Property Registration Fee">💳 Booking Advance & Property Registration Fee</option>
                    <option value="Real Estate Advisory & Documentation Charges">📄 Real Estate Advisory & Documentation Charges</option>
                    <option value="Property Marketing & Site Visit Facilitation Fee">🚗 Property Marketing & Site Visit Facilitation Fee</option>
                    <option value="CUSTOM">✍️ Custom Description (Edit text manually below)</option>
                  </select>

                  {/* EDITABLE TEXT INPUT */}
                  <input 
                    type="text" 
                    value={editInvoiceForm.particulars || 'Property Consultation & Processing Charges'} 
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, particulars: e.target.value })} 
                    placeholder="Property Consultation & Processing Charges" 
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }} 
                    required 
                  />
                </div>
              </div>

              {/* CARD 4: AGREEMENT VALUE & BROKERAGE CALCULATION */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #fbbf24', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💰 AGREEMENT VALUE & BROKERAGE CHARGEABLE AMOUNT
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    Flat + Parking Price Based
                  </span>
                </div>

                {/* GRID 1: FLAT PRICE, PARKING PRICE, TOTAL AGREEMENT VALUE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🏢 Flat Price (Base Cost) (₹) *
                    </label>
                    <input 
                      type="number" 
                      value={editInvoiceForm.flat_price || ''} 
                      onChange={(e) => {
                        const flatVal = Number(e.target.value || 0);
                        const parkVal = Number(editInvoiceForm.parking_price || 0);
                        const totalAgree = flatVal + parkVal;
                        const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                        const computedTaxable = Math.round(totalAgree * (brokPct / 100));

                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          flat_price: e.target.value,
                          agreement_value: String(totalAgree),
                          taxable_value: String(computedTaxable)
                        });
                      }} 
                      placeholder="8000000" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🚗 Car Parking Charges (₹)
                    </label>
                    <input 
                      type="number" 
                      value={editInvoiceForm.parking_price || ''} 
                      onChange={(e) => {
                        const flatVal = Number(editInvoiceForm.flat_price || 0);
                        const parkVal = Number(e.target.value || 0);
                        const totalAgree = flatVal + parkVal;
                        const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                        const computedTaxable = Math.round(totalAgree * (brokPct / 100));

                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          parking_price: e.target.value,
                          agreement_value: String(totalAgree),
                          taxable_value: String(computedTaxable)
                        });
                      }} 
                      placeholder="400000" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      📑 Total Agreement Value (₹) *
                    </label>
                    <input 
                      type="number" 
                      value={editInvoiceForm.agreement_value || ''} 
                      onChange={(e) => {
                        const totalAgree = Number(e.target.value || 0);
                        const brokPct = Number(editInvoiceForm.brokerage_percent || 2.0);
                        const computedTaxable = Math.round(totalAgree * (brokPct / 100));
                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          agreement_value: e.target.value,
                          taxable_value: String(computedTaxable)
                        });
                      }} 
                      placeholder="8400000" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #fbbf24', color: '#fbbf24', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900' }} 
                      required 
                    />
                  </div>
                </div>

                {/* GRID 2: BROKERAGE PERCENT % & CHARGEABLE / TAXABLE SERVICE AMOUNT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      % Brokerage Rate (%)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={editInvoiceForm.brokerage_percent || '2.0'} 
                      onChange={(e) => {
                        const brokPct = Number(e.target.value || 0);
                        const totalAgree = Number(editInvoiceForm.agreement_value || 8400000);
                        const computedTaxable = Math.round(totalAgree * (brokPct / 100));

                        setEditInvoiceForm({
                          ...editInvoiceForm,
                          brokerage_percent: e.target.value,
                          taxable_value: String(computedTaxable)
                        });
                      }} 
                      placeholder="2.0" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      💼 Brokerage Chargeable / Taxable Amount (₹) *
                    </label>
                    <input 
                      type="number" 
                      value={editInvoiceForm.taxable_value || ''} 
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, taxable_value: e.target.value })} 
                      placeholder="200000" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #38bdf8', color: '#38bdf8', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '900' }} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* CARD 5: EDITABLE GST TAX OPTIONS & RATES */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #a855f7', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '900', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editInvoiceForm.apply_gst !== false}
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, apply_gst: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a855f7' }}
                    />
                    <span>Apply GST Tax (Fully Editable Rates & Amounts)</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', fontWeight: '900', color: editInvoiceForm.apply_gst !== false ? '#4ade80' : '#fbbf24', background: editInvoiceForm.apply_gst !== false ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    {editInvoiceForm.apply_gst !== false ? `🟢 ${Number(editInvoiceForm.cgst_rate || 9) + Number(editInvoiceForm.sgst_rate || 9)}% GST Tax Active` : '🟡 0% Tax Exempt'}
                  </span>
                </div>

                {editInvoiceForm.apply_gst !== false && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                        ✏️ Total GST Rate (%) *
                      </label>
                      <input 
                        type="number" 
                        step="0.5" 
                        value={editInvoiceForm.gst_rate !== undefined ? editInvoiceForm.gst_rate : '18'} 
                        onChange={(e) => {
                          const totalRate = Number(e.target.value || 0);
                          const halfRate = totalRate / 2;
                          setEditInvoiceForm({
                            ...editInvoiceForm,
                            gst_rate: e.target.value,
                            cgst_rate: String(halfRate),
                            sgst_rate: String(halfRate)
                          });
                        }} 
                        placeholder="18" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #a855f7', color: '#c084fc', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                        CGST Rate (%) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={editInvoiceForm.cgst_rate !== undefined ? editInvoiceForm.cgst_rate : '9'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, cgst_rate: e.target.value })} 
                        placeholder="9" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                        SGST Rate (%) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={editInvoiceForm.sgst_rate !== undefined ? editInvoiceForm.sgst_rate : '9'} 
                        onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, sgst_rate: e.target.value })} 
                        placeholder="9" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem' }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 6: AGENCY BANK ACCOUNT & PAYMENT RECEIPT DETAILS (SUPER ADMIN RESTRICTED) */}
              {(() => {
                const isUserSuperAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'OWNER' || isSuperAdmin;
                return (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isUserSuperAdmin ? '1px solid #38bdf8' : '1px solid #e11d48', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '900', color: isUserSuperAdmin ? '#38bdf8' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏦 AGENCY BANK ACCOUNT & PAYMENT RECEIPT DETAILS
                      </span>
                      <span style={{ fontSize: '0.7rem', background: isUserSuperAdmin ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isUserSuperAdmin ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isUserSuperAdmin ? '👑 Editable by Super Admin Only' : '🔒 Read-Only (Super Admin Access Only)'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Bank Name *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.bank_name || 'HDFC Bank'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, bank_name: e.target.value })} 
                          placeholder="HDFC Bank" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Account Number *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.bank_account_number || '50200018942109'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, bank_account_number: e.target.value })} 
                          placeholder="50200018942109" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>IFSC Code *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.bank_ifsc_code || 'HDFC0000128'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, bank_ifsc_code: e.target.value })} 
                          placeholder="HDFC0000128" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>UPI ID / VPA</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.bank_upi_id || 'swaramayi@hdfcbank'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, bank_upi_id: e.target.value })} 
                          placeholder="swaramayi@hdfcbank" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* CARD 7: SWARAMAYI CORPORATE DETAILS & REGISTERED BUSINESS INFO (SUPER ADMIN ONLY) */}
              {(() => {
                const isUserSuperAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'OWNER' || isSuperAdmin;
                return (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isUserSuperAdmin ? '1px solid #38bdf8' : '1px solid #e11d48', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '900', color: isUserSuperAdmin ? '#38bdf8' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏢 SWARAMAYI CORPORATE DETAILS & REGISTERED BUSINESS INFO
                      </span>
                      <span style={{ fontSize: '0.7rem', background: isUserSuperAdmin ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isUserSuperAdmin ? '#4ade80' : '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isUserSuperAdmin ? '👑 Editable by Super Admin Only' : '🔒 Read-Only (Super Admin Access Only)'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Company Registered Address *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.company_address || '4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, North 24 Parganas, Madhyamgram, Kolkata - 700129'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, company_address: e.target.value })} 
                          placeholder="4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, Madhyamgram, Kolkata - 700129" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>TS-RERA Registration No. *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.company_rera_no || 'P02400008492'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, company_rera_no: e.target.value })} 
                          placeholder="P02400008492" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'monospace', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Corporate Email ID *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.company_email || 'billing@swaramayi.com'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, company_email: e.target.value })} 
                          placeholder="billing@swaramayi.com" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Corporate Mobile No. *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.company_mobile || '+91 98490 12345'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, company_mobile: e.target.value })} 
                          placeholder="+91 98490 12345" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Official Website *</label>
                        <input 
                          type="text" 
                          disabled={!isUserSuperAdmin}
                          value={editInvoiceForm.company_website || 'https://www.swaramayi.com'} 
                          onChange={(e) => isUserSuperAdmin && setEditInvoiceForm({ ...editInvoiceForm, company_website: e.target.value })} 
                          placeholder="https://www.swaramayi.com" 
                          style={{ width: '100%', background: !isUserSuperAdmin ? (isLight ? '#e2e8f0' : '#1e293b') : (isLight ? '#ffffff' : '#1e293b'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', cursor: !isUserSuperAdmin ? 'not-allowed' : 'text', opacity: !isUserSuperAdmin ? 0.75 : 1 }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* CARD 8: PAYMENT STATUS, PAYMENT MODE & REF */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #38bdf8', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#38bdf8' }}>
                  💳 PAYMENT SETTLEMENT & TRANSACTION STATUS
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      Payment Status *
                    </label>
                    <select 
                      value={editInvoiceForm.payment_status || 'UNPAID_PENDING'} 
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, payment_status: e.target.value })}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: editInvoiceForm.payment_status === 'PAID_SETTLED' ? '#22c55e' : '#eab308', padding: '8px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}
                    >
                      <option value="UNPAID_PENDING">⏳ UNPAID / PENDING</option>
                      <option value="PAID_SETTLED">✓ PAID / SETTLED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      Payment Mode
                    </label>
                    <select 
                      value={editInvoiceForm.payment_mode || 'ONLINE'} 
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, payment_mode: e.target.value })}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      <option value="ONLINE">💳 ONLINE (UPI / Card)</option>
                      <option value="CASH">💵 CASH</option>
                      <option value="CHEQUE">📑 CHEQUE</option>
                      <option value="NEFT">🏦 NEFT / RTGS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      Txn / Payment Ref No.
                    </label>
                    <input 
                      type="text" 
                      value={editInvoiceForm.payment_ref || ''} 
                      onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, payment_ref: e.target.value })}
                      placeholder="e.g. TXN-9841284"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* AUTO GST SUMMARY PREVIEW */}
              {(() => {
                const taxVal = Number(editInvoiceForm.taxable_value || 0);
                const applyGst = editInvoiceForm.apply_gst !== false;
                const cgstRate = Number(editInvoiceForm.cgst_rate !== undefined ? editInvoiceForm.cgst_rate : 9);
                const sgstRate = Number(editInvoiceForm.sgst_rate !== undefined ? editInvoiceForm.sgst_rate : 9);
                const cgst = applyGst ? Math.round(taxVal * (cgstRate / 100)) : 0;
                const sgst = applyGst ? Math.round(taxVal * (sgstRate / 100)) : 0;
                const total = taxVal + cgst + sgst;

                return (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: applyGst ? '1px solid #22c55e' : '1px solid #38bdf8', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Brokerage Chargeable Amount:</span>
                      <strong>₹{taxVal.toLocaleString('en-IN')}</strong>
                    </div>
                    {applyGst ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                        <span>CGST ({cgstRate}%) + SGST ({sgstRate}%):</span>
                        <strong>₹{(cgst + sgst).toLocaleString('en-IN')} (CGST: ₹{cgst.toLocaleString('en-IN')}, SGST: ₹{sgst.toLocaleString('en-IN')})</strong>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
                        <span>GST Tax Rate:</span>
                        <strong>0% (Exempt / Non-GST Invoice)</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '4px', color: applyGst ? '#22c55e' : '#38bdf8', fontWeight: '900', fontSize: '0.9rem' }}>
                      <span>{applyGst ? `TOTAL TAX INVOICE AMOUNT (${cgstRate + sgstRate}% GST):` : 'TOTAL INVOICE AMOUNT (NON-GST / EXEMPT):'}</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              {/* MODAL ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '12px' }}>
                <button type="button" onClick={() => setShowEditInvoiceModal(null)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: editInvoiceForm.invoice_category === 'DEVELOPER' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)' }}>
                  ✓ Update & Save {editInvoiceForm.apply_gst !== false ? 'GST Tax Invoice' : 'Non-GST Invoice'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
