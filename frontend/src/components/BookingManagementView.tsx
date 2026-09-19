import React, { useState } from 'react';
import { BookmarkCheck, Edit3, CheckCircle2, X } from 'lucide-react';

interface BookingManagementViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth: number;
  activeBookingSubTab: string;
  setActiveBookingSubTab: (tab: any) => void;
  bookings: any[];
  setBookings?: React.Dispatch<React.SetStateAction<any[]>>;
  setShowNewBookingModal: (val: boolean) => void;
  setShowAllotmentModal: (val: any) => void;
  invoices?: any[];
  setInvoices?: (invoices: any[]) => void;
  setActiveTab?: (tab: string) => void;
  setBillingInvoiceCategory?: (cat: string) => void;
  customers?: any[];
  properties?: any[];
  syncAllToMongoDB?: (overrideData?: any) => Promise<void>;
  onRecycleItem?: (itemData: any) => void;
  projectVisitAgreements?: any[];
  agreements?: any[];
  recycledItems?: any[];
}

export const BookingManagementView: React.FC<BookingManagementViewProps> = ({
  currentRole,
  isLight,
  windowWidth,
  activeBookingSubTab,
  setActiveBookingSubTab,
  bookings = [],
  setBookings,
  setShowNewBookingModal,
  setShowAllotmentModal,
  invoices = [],
  setInvoices,
  setActiveTab,
  setBillingInvoiceCategory,
  customers = [],
  properties = [],
  syncAllToMongoDB,
  onRecycleItem,
  projectVisitAgreements = [],
  agreements = [],
  recycledItems = []
}) => {
  const isSuperAdmin = !currentRole || currentRole.toUpperCase().includes('SUPER ADMIN') || currentRole.toUpperCase().includes('OWNER') || currentRole.toUpperCase().includes('ADMIN');

  const [showEditBookingModal, setShowEditBookingModal] = useState<any | null>(null);
  const [editBookingForm, setEditBookingForm] = useState<any>({});

  const handleSaveEditBooking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editBookingForm || !setBookings) return;

    const agrValNum = Number(editBookingForm.agreement_value_input || editBookingForm.agreement_value_num || 5114880);
    const tokAmt = Number(editBookingForm.token_amount_input !== undefined ? editBookingForm.token_amount_input : (editBookingForm.token_amount || 100000));
    const brokPct = Number(editBookingForm.brokerage_percent || 2.0);
    const brokAmt = Math.round(agrValNum * (brokPct / 100));

    const updatedBooking = {
      ...editBookingForm,
      agreement_value: `₹${agrValNum.toLocaleString('en-IN')}`,
      agreement_value_num: agrValNum,
      token_amount: tokAmt,
      brokerage_amount: brokAmt
    };

    const updatedBookings = (bookings || []).map((b: any) => {
      if (b.id === editBookingForm.id || (b.booking_code && b.booking_code === editBookingForm.booking_code)) {
        return updatedBooking;
      }
      return b;
    });

    setBookings(updatedBookings);
    try {
      localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updatedBookings));
    } catch (err) {}

    if (syncAllToMongoDB) {
      syncAllToMongoDB({ bookings: updatedBookings });
    }

    setShowEditBookingModal(null);
    alert(`🎉 Booking ${editBookingForm.booking_code} updated successfully!`);
  };

  const handleTransferToBilling = (b: any) => {
    const rawBookingCode = b.booking_code || 'SRM-BKG-2026-000087';
    const generatedCustomerInvoiceNumber = rawBookingCode.includes('SRM-BKG-')
      ? rawBookingCode.replace('SRM-BKG-', 'SRM-INV-')
      : `SRM-INV-2026-0000${(invoices?.length || 0) + 87}`;

    const generatedDeveloperInvoiceNumber = rawBookingCode.includes('SRM-BKG-')
      ? rawBookingCode.replace('SRM-BKG-', 'SRM-DEV-INV-')
      : `SRM-DEV-INV-2026-0000${(invoices?.length || 0) + 87}`;

    const brokerageAmt = Number(b.brokerage_amount) || 102297;
    const taxableVal = brokerageAmt;
    const cgst = Math.round(taxableVal * 0.09);
    const sgst = Math.round(taxableVal * 0.09);
    const totalAmt = taxableVal + cgst + sgst;

    // Look up real customer details from customers list
    const matchedCust = (customers || []).find((c: any) => 
      (b.customer_number && (c.customer_number === b.customer_number || c.id === b.customer_number || c.customerNumber === b.customer_number)) ||
      (b.customer_name && (c.name?.toLowerCase() === b.customer_name.toLowerCase() || c.customer_name?.toLowerCase() === b.customer_name.toLowerCase() || c.customerName?.toLowerCase() === b.customer_name.toLowerCase())) ||
      (b.customer_mobile && (c.mobile === b.customer_mobile || c.phone === b.customer_mobile))
    );

    const propCodeLookup = b.property_code || b.propertyCode || 'SRM-PROP-2026-000426';
    const matchedProp = (properties || []).find((p: any) => 
      p.property_code === propCodeLookup || p.id === propCodeLookup || p.propertyCode === propCodeLookup || (p.title && b.project_name && (p.title.toLowerCase().includes(b.project_name.toLowerCase()) || b.project_name.toLowerCase().includes(p.title.toLowerCase())))
    );

    const custName = b.customer_name || matchedCust?.name || matchedCust?.customer_name || matchedCust?.customerName || 'SUMANTH VARMA';
    const custNum = b.customer_number || matchedCust?.customer_number || matchedCust?.customerNumber || matchedCust?.id || 'SRM-CUS-2026-000185';
    const custMobile = b.customer_mobile || matchedCust?.mobile || matchedCust?.phone || '+91 98765 43210';
    const custEmail = (b.customer_email && !b.customer_email.includes('customcr') && b.customer_email !== 'customer@gmail.com')
      ? b.customer_email
      : (matchedCust?.email || `${custName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`);

    const propTitle = b.project_name || matchedProp?.title || 'GAJAPATI APARTMENT';
    const propLocality = matchedProp?.locality || b.locality || (b.project_name?.includes('Barasat') || b.project_name?.includes('Kolkata') ? 'Barasat, Kolkata' : 'Barasat, Kolkata');
    const custAddress = b.customer_address || matchedCust?.address || matchedCust?.full_address || matchedProp?.full_address || (matchedCust?.preferredArea ? `Jessore Road, ${matchedCust.preferredArea}, West Bengal - 700124` : 'Jessore Road, Barasat, Kolkata, West Bengal - 700124');
    const placeOfSupply = b.place_of_supply || matchedCust?.place_of_supply || matchedCust?.state || (propLocality.includes('Kolkata') || propTitle.includes('Kolkata') || (matchedCust?.preferredArea && matchedCust.preferredArea.includes('Kolkata')) ? '19 - West Bengal' : '19 - West Bengal');
    const gstinPan = b.customer_gstin_pan || matchedCust?.gstin || matchedCust?.pan || '19ABCDE1234F1Z5';

    const propConfig = matchedProp?.configuration || b.configuration || b.property_configuration || '2BHK Luxury Apartment';
    const devName = b.developer_name || matchedProp?.developer || matchedProp?.builder || 'Dhriti Builders & Developers';
    const devGstin = b.developer_gstin || matchedProp?.developer_gstin || '19AAACD4567E1Z2';
    const devRera = matchedProp?.rera_id || b.developer_rera_id || 'WBRERA/P/NOR/2024/000842';
    const devContact = b.developer_contact_person || 'Mr. Animesh Sen';
    const devMobile = b.developer_mobile || '+91 98300 12345';
    const devEmail = matchedProp?.developer_email || 'billing@dhritibuilders.com';
    const devAddress = matchedProp?.developer_address || 'Dhriti Towers, Jessore Road, Barasat, Kolkata - 700124';
    const devPos = placeOfSupply || '19 - West Bengal';
    const branchName = b.branch_name || (propLocality.includes('Kolkata') ? 'Kolkata Branch' : 'Head Office (Kolkata)');
    const agreeVal = String(b.agreement_value_num || 5114880);
    const flatVal = String(b.flat_price || Math.round(Number(agreeVal) * 0.95));
    const parkVal = String(b.parking_price || Math.round(Number(agreeVal) * 0.05));
    const brokPct = String(b.brokerage_percent || 2.0);

    // 1. CUSTOMER TAX INVOICE (B2C)
    const customerInvoiceObj = {
      id: `inv-cus-${Date.now()}`,
      invoice_number: generatedCustomerInvoiceNumber,
      booking_code: b.booking_code,
      customer_name: custName,
      customer_mobile: custMobile,
      customer_number: custNum,
      customer_email: custEmail,
      customer_address: custAddress,
      place_of_supply: placeOfSupply,
      customer_gstin_pan: gstinPan,
      property_title: propTitle,
      property_code: propCodeLookup,
      property_locality: propLocality,
      property_configuration: propConfig,
      developer_name: devName,
      developer_gstin: devGstin,
      developer_rera_id: devRera,
      developer_contact_person: devContact,
      developer_mobile: devMobile,
      developer_email: devEmail,
      developer_address: devAddress,
      developer_place_of_supply: devPos,
      branch_name: branchName,
      invoice_category: 'CUSTOMER',
      particulars: b.particulars || `Brokerage & Real Estate Marketing Service Charges for ${propTitle} (${b.tower_unit || 'Unit 302'})`,
      flat_price: flatVal,
      parking_price: parkVal,
      agreement_value: agreeVal,
      brokerage_percent: brokPct,
      taxable_value: taxableVal,
      apply_gst: true,
      gst_rate: '18',
      cgst_rate: '9',
      sgst_rate: '9',
      cgst_amount: cgst,
      sgst_amount: sgst,
      total_invoice_amount: totalAmt,
      payment_status: 'UNPAID_PENDING',
      payment_mode: undefined,
      payment_ref: undefined,
      created_date: new Date().toISOString().split('T')[0],
      sales_executive: b.sales_executive || 'Ramesh Pawar'
    };

    // 2. DEVELOPER BROKERAGE INVOICE (B2B)
    const developerInvoiceObj = {
      id: `inv-dev-${Date.now() + 1}`,
      invoice_number: generatedDeveloperInvoiceNumber,
      booking_code: b.booking_code,
      customer_name: custName,
      customer_mobile: custMobile,
      customer_number: custNum,
      customer_email: custEmail,
      customer_address: custAddress,
      place_of_supply: placeOfSupply,
      customer_gstin_pan: gstinPan,
      property_title: propTitle,
      property_code: propCodeLookup,
      property_locality: propLocality,
      property_configuration: propConfig,
      developer_name: devName,
      developer_gstin: devGstin,
      developer_rera_id: devRera,
      developer_contact_person: devContact,
      developer_mobile: devMobile,
      developer_email: devEmail,
      developer_address: devAddress,
      developer_place_of_supply: devPos,
      branch_name: branchName,
      invoice_category: 'DEVELOPER',
      particulars: `2.0% Channel Partner Success Fee / Brokerage for ${propTitle} (${b.tower_unit || 'Unit 302'})`,
      flat_price: flatVal,
      parking_price: parkVal,
      agreement_value: agreeVal,
      brokerage_percent: brokPct,
      taxable_value: taxableVal,
      apply_gst: true,
      gst_rate: '18',
      cgst_rate: '9',
      sgst_rate: '9',
      cgst_amount: cgst,
      sgst_amount: sgst,
      total_invoice_amount: totalAmt,
      payment_status: 'UNPAID_PENDING',
      payment_mode: undefined,
      payment_ref: undefined,
      created_date: new Date().toISOString().split('T')[0],
      sales_executive: b.sales_executive || 'Ramesh Pawar'
    };

    const registeredBookingObj = {
      ...b,
      approval_status: 'REGISTER_DONE',
      status: 'REGISTER_DONE',
      registered: true,
      invoiced: true,
      registration_date: new Date().toISOString().split('T')[0],
      developer_invoice_number: generatedDeveloperInvoiceNumber,
      customer_invoice_number: generatedCustomerInvoiceNumber
    };

    const updatedInvoices = [developerInvoiceObj, customerInvoiceObj, ...(invoices || []).filter((inv: any) => inv.booking_code !== b.booking_code && inv.invoice_number !== generatedCustomerInvoiceNumber && inv.invoice_number !== generatedDeveloperInvoiceNumber)];
    
    const updatedBookings = (bookings || []).map((item: any) => {
      if (item.id === b.id || item.booking_code === b.booking_code) {
        return registeredBookingObj;
      }
      return item;
    });

    if (!updatedBookings.some((item: any) => item.booking_code === b.booking_code)) {
      updatedBookings.unshift(registeredBookingObj);
    }

    if (setInvoices) {
      setInvoices(updatedInvoices);
    }
    try {
      localStorage.setItem('swaramayi_invoices_v6', JSON.stringify(updatedInvoices));
    } catch (e) {}

    if (setBookings) {
      setBookings(updatedBookings);
    }
    try {
      localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updatedBookings));
    } catch (e) {}

    if (syncAllToMongoDB) {
      syncAllToMongoDB({
        bookings: updatedBookings,
        invoices: updatedInvoices
      });
    }

    if (setBillingInvoiceCategory) {
      setBillingInvoiceCategory('DEVELOPER');
    }

    if (setActiveTab) {
      setActiveTab('billing_management');
    }

    alert(`🎉 PROPERTY UNIT REGISTRATION COMPLETED!\n\nBooking Code: ${b.booking_code}\nCustomer: ${custName} (${custNum})\nProperty: ${propTitle} (${b.tower_unit || 'Unit 302'})\nAgreement Value: ₹${Number(agreeVal).toLocaleString('en-IN')}\n\nGenerated Billing Invoices:\n1. 🏢 Developer Brokerage: ${generatedDeveloperInvoiceNumber}\n2. 👤 Customer Tax Invoice: ${generatedCustomerInvoiceNumber}\n\nNavigating to Billing Management.`);
  };

  const allCombinedBookings = React.useMemo(() => {
    const list = [...(bookings || [])];
    const seenKeys = new Set<string>();

    list.forEach(b => {
      if (!b) return;
      const key = `${(b.customer_name || '').toLowerCase().trim()}_${(b.project_name || '').toLowerCase().trim()}`;
      seenKeys.add(key);
      if (b.booking_code) seenKeys.add(b.booking_code.toLowerCase().trim());
      if (b.agreement_code) seenKeys.add(b.agreement_code.toLowerCase().trim());
    });

    const recycledKeys = new Set<string>();
    (recycledItems || []).forEach((r: any) => {
      if (!r) return;
      const orig = r.originalData || {};
      const rName = (r.title || orig.name || orig.customer_name || orig.party_name || '').toLowerCase().trim();
      if (rName) recycledKeys.add(rName);
    });

    (projectVisitAgreements || []).forEach((pva: any) => {
      if (!pva) return;
      const custName = pva.customerName || pva.party_name || 'Customer';
      if (recycledKeys.has(custName.toLowerCase().trim())) return;

      const projName = pva.projectTitle || pva.project_name || 'GAJAPATI APARTMENT';
      const key = `${custName.toLowerCase().trim()}_${projName.toLowerCase().trim()}`;
      const pvaCode = (pva.projectVisitAgreementId || '').toLowerCase().trim();

      if (!seenKeys.has(key) && (!pvaCode || !seenKeys.has(pvaCode))) {
        seenKeys.add(key);
        if (pvaCode) seenKeys.add(pvaCode);

        const bkgCode = `SRM-BKG-2026-000${list.length + 188}`;
        list.push({
          id: `BKG-PVA-${pva.projectVisitAgreementId || Date.now()}`,
          booking_code: bkgCode,
          agreement_code: pva.projectVisitAgreementId || `SRM-PVA-2026-000001`,
          customer_name: custName,
          customer_number: pva.customerId || pva.customerNumber || `SRM-CUS-2026-000189`,
          customer_mobile: pva.customerMobile || '+91 78766 70000',
          project_name: projName,
          developer_name: pva.developerName || 'Dhriti Builders & Developers',
          property_title: projName,
          tower_unit: pva.unitNumber || 'Tower A - Unit 302 (3BHK)',
          agreement_value: '₹51,14,880',
          agreement_value_num: 5114880,
          token_amount: 100000,
          payment_mode: 'Bank Transfer / NEFT',
          payment_ref: `PVA-SIG-${pva.otpHashRef?.slice(-6) || '849201'}`,
          booking_date: pva.visitDate || new Date().toISOString().split('T')[0],
          sales_executive: pva.executiveName || 'Ramesh Pawar',
          brokerage_rate: '2.0%',
          brokerage_amount: 102297,
          approval_status: 'APPROVED_LOCKED',
          status: 'CONFIRMED'
        });
      }
    });

    return list;
  }, [bookings, projectVisitAgreements, recycledItems]);

  const registeredDoneBookings = (allCombinedBookings || []).filter((b: any) => 
    b.approval_status === 'REGISTER_DONE' || 
    b.status === 'REGISTER_DONE' || 
    b.registered === true ||
    (invoices && invoices.some((inv: any) => inv.booking_code === b.booking_code || (b.customer_number && inv.customer_number === b.customer_number)))
  );

  const pendingApprovalBookings = (allCombinedBookings || []).filter((b: any) => 
    b.approval_status === 'APPROVED_LOCKED' && b.approval_status !== 'REGISTER_DONE' && !b.registered && !registeredDoneBookings.some((rb: any) => rb.booking_code === b.booking_code)
  );

  const activePendingBookings = (allCombinedBookings || []).filter((b: any) => 
    !registeredDoneBookings.some((rb: any) => rb.booking_code === b.booking_code || (rb.id && b.id && rb.id === b.id))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* CATEGORY HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: windowWidth <= 640 ? '1.1rem' : '1.4rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookmarkCheck size={windowWidth <= 640 ? 20 : 24} color="#38bdf8" /> Property Unit Booking Management & Token Vault
          </h2>
          <p style={{ fontSize: windowWidth <= 640 ? '0.78rem' : '0.85rem', color: isLight ? '#64748b' : '#94a3b8' }}>Register new property unit bookings, lock units, record token advances, manage manager approvals, and issue Allotment Letters.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button 
            onClick={() => setShowNewBookingModal(true)}
            style={{ width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            <BookmarkCheck size={16} /> + Register New Unit Booking
          </button>
        </div>
      </div>

      {/* SUB-TAB SELECTOR BAR */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'all_bookings', label: `🏢 All Bookings Vault (${activePendingBookings.length})` },
          { id: 'register_done', label: `✅ Registration Done (${registeredDoneBookings.length})` },
          { id: 'booking_approvals', label: `⚖️ Approvals & Token Lock (${pendingApprovalBookings.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'register_done') {
                if (setBillingInvoiceCategory) setBillingInvoiceCategory('DEVELOPER');
                if (setActiveTab) setActiveTab('billing_management');
              } else {
                setActiveBookingSubTab(tab.id as any);
              }
            }}
            style={{
              flex: windowWidth <= 640 ? '1 1 100%' : '1 1 auto',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '800',
              textAlign: 'center',
              background: activeBookingSubTab === tab.id ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : (isLight ? '#f1f5f9' : '#0f172a'),
              color: activeBookingSubTab === tab.id ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
              boxShadow: activeBookingSubTab === tab.id ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: ALL BOOKINGS VAULT */}
      {activeBookingSubTab === 'all_bookings' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📋 Master Property Unit Booking Vault</h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Central database of confirmed unit bookings, token advance receipts, and allotment statuses.</p>
            </div>
          </div>

          <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Booking Code & Date</th>
                  <th style={{ padding: '12px' }}>Customer Name & Contact</th>
                  <th style={{ padding: '12px' }}>Project, Builder & Unit Details</th>
                  <th style={{ padding: '12px' }}>Agreement Value & Advance Token</th>
                  <th style={{ padding: '12px' }}>Payment Mode & Ref</th>
                  <th style={{ padding: '12px' }}>Channel Partner Brokerage</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Approval Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePendingBookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                        🆔 {b.booking_code}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                        📅 {b.booking_date}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{b.customer_name}</strong>
                      <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{b.customer_mobile}</span>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{b.customer_number}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#fbbf24', fontSize: '0.88rem' }}>🏢 {b.project_name}</strong>
                      <div style={{ marginTop: '3px', marginBottom: '3px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '900', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block' }}>
                          🏢 Property Code: {b.property_code || b.propertyCode || 'SRM-PROP-2026-000426'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', marginTop: '2px' }}>
                        {b.developer_name} • {b.tower_unit}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '0.9rem' }}>{b.agreement_value}</span>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '800', marginTop: '2px' }}>
                        💸 Advance Paid: ₹{Number(b.token_amount).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                        💳 {b.payment_mode}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                        Ref: {b.payment_ref}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '0.82rem' }}>💰 {b.brokerage_rate || '2.0%'} Brokerage</span>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                        Earned: ₹{Number(b.brokerage_amount || 168000).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e', padding: '4px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.75rem', display: 'inline-block' }}>
                        ✓ {b.approval_status || 'APPROVED_LOCKED'}
                      </span>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setShowAllotmentModal({ open: true, booking: b })} 
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          📄 Allotment PDF
                        </button>
                        <button 
                          onClick={() => {
                            setEditBookingForm({
                              ...b,
                              agreement_value_input: b.agreement_value_num || String(b.agreement_value || '').replace(/\D/g, '') || 5114880,
                              token_amount_input: b.token_amount || 100000
                            });
                            setShowEditBookingModal(b);
                          }} 
                          style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)' }}
                          title="Edit booking particulars and customer details"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => handleTransferToBilling(b)} 
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}
                          title="Confirm unit registration done, generate Tax Invoice, and transfer to Billing Management"
                        >
                          <CheckCircle2 size={13} /> Registration Done
                        </button>
                        {isSuperAdmin && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Booking record ${b.booking_code || b.id} for ${b.customer_name || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                if (onRecycleItem) {
                                  onRecycleItem({
                                    id: b.id || `BKG-${Date.now()}`,
                                    title: `Booking - ${b.customer_name || 'Client'} (${b.booking_code || b.id})`,
                                    category: 'Agreement',
                                    originalLocation: 'Booking & Allotment Vault',
                                    details: `Project: ${b.project_name || 'N/A'}, Unit: ${b.unit_number || 'N/A'}`,
                                    originalData: b
                                  });
                                }
                                const updatedBookings = (bookings || []).filter((item: any) => {
                                  if (b.id && item.id === b.id) return false;
                                  if (b.booking_code && item.booking_code === b.booking_code) return false;
                                  if (b.customer_number && b.property_code && item.customer_number === b.customer_number && item.property_code === b.property_code) return false;
                                  return true;
                                });
                                if (setBookings) {
                                  setBookings(updatedBookings);
                                }
                                try {
                                  localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updatedBookings));
                                } catch (e) {}
                                if (syncAllToMongoDB) {
                                  syncAllToMongoDB({ bookings: updatedBookings });
                                }
                                alert(`🗑️ Booking record ${b.booking_code || b.id} moved to Recycle Bin.`);
                              }
                            }}
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Move booking record to Recycle Bin"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOOKING APPROVALS & TOKEN LOCK */}
      {activeBookingSubTab === 'booking_approvals' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>⚖️ Manager Token Verification & Unit Lock Approval Queue</h3>
          <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #22c55e', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ color: '#4ade80', fontWeight: '900' }}>✓ All Current Bookings Verified & Locked</h4>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Token advance payments verified by finance manager. Locked inventory units will not be available for other prospects.</p>
            </div>
            <span style={{ background: '#22c55e', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem' }}>
              LOCKING SYSTEM ACTIVE
            </span>
          </div>
        </div>
      )}



      {/* MODAL: EDIT BOOKING DETAILS */}
      {showEditBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: windowWidth <= 640 ? '8px' : '20px' }}>
          <div className="custom-modal-scrollbar" style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #38bdf8', borderRadius: '16px', width: windowWidth <= 640 ? '98vw' : windowWidth <= 1024 ? '95vw' : '650px', maxWidth: '96vw', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', padding: windowWidth <= 640 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: windowWidth <= 640 ? '1.05rem' : '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={20} color="#38bdf8" /> Edit Property Unit Booking ({showEditBookingModal.booking_code})
                </h3>
                <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Update customer booking parameters, property details, and locked financial values.</p>
              </div>
              <button onClick={() => setShowEditBookingModal(null)} style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', fontWeight: '900' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditBooking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Name *</label>
                  <input type="text" value={editBookingForm.customer_name || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, customer_name: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Customer Mobile *</label>
                  <input type="text" value={editBookingForm.customer_mobile || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, customer_mobile: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Project Name *</label>
                  <input type="text" value={editBookingForm.project_name || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, project_name: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Developer / Builder *</label>
                  <input type="text" value={editBookingForm.developer_name || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, developer_name: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Tower, Floor & Unit Number *</label>
                <input type="text" value={editBookingForm.tower_unit || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, tower_unit: e.target.value })} placeholder="e.g. Block A - Unit 302" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Total Agreement Value (₹) *</label>
                  <input type="number" value={editBookingForm.agreement_value_input || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, agreement_value_input: e.target.value })} placeholder="5114880" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Advance Token Amount Paid (₹) *</label>
                  <input type="number" value={editBookingForm.token_amount_input !== undefined ? editBookingForm.token_amount_input : ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, token_amount_input: e.target.value })} placeholder="100000" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Payment Mode *</label>
                  <select value={editBookingForm.payment_mode || 'UPI / Online Bank Transfer'} onChange={(e) => setEditBookingForm({ ...editBookingForm, payment_mode: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="UPI / Online Bank Transfer">UPI / Online Bank Transfer</option>
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="Cheque / RTGS">Cheque / RTGS</option>
                    <option value="Credit Card / POS">Credit Card / POS</option>
                    <option value="Cash Token Advance">Cash Token Advance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Payment Reference / Transaction ID</label>
                  <input type="text" value={editBookingForm.payment_ref || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, payment_ref: e.target.value })} placeholder="TXN-SRM-576683" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Sales Executive</label>
                  <input type="text" value={editBookingForm.sales_executive || ''} onChange={(e) => setEditBookingForm({ ...editBookingForm, sales_executive: e.target.value })} placeholder="Ramesh Pawar" style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Approval Status</label>
                  <select value={editBookingForm.approval_status || 'APPROVED_LOCKED'} onChange={(e) => setEditBookingForm({ ...editBookingForm, approval_status: e.target.value })} style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="APPROVED_LOCKED">✓ APPROVED_LOCKED</option>
                    <option value="PENDING_MANAGER_APPROVAL">⏳ PENDING_MANAGER_APPROVAL</option>
                    <option value="REGISTER_DONE">🏆 REGISTER_DONE</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '12px' }}>
                <button type="button" onClick={() => setShowEditBookingModal(null)} style={{ background: '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>✓ Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
