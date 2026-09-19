import React from 'react';
import { ShieldCheck, Building, UserCheck, AlertTriangle, Printer } from 'lucide-react';

interface AgreementManagementViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth?: number;
  agreementCategory: string;
  setAgreementCategory: (cat: string) => void;
  visitPlans: any[];
  setShowPvaVerificationModal: (val: any) => void;
  setShowCreateDevAgreementModal: (val: boolean) => void;
  agreements: any[];
  setAgreements?: React.Dispatch<React.SetStateAction<any[]>>;
  projectVisitAgreements: any[];
  setProjectVisitAgreements?: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  matchesSearchQuery: (item: any, query: string) => boolean;
  setShowDeveloperIntroductionReportModal: (val: boolean) => void;
  setShowPvaDocumentModal: (val: any) => void;
  setSelectedAgreement: (val: any) => void;
  setShowFullContractModal: (val: boolean) => void;
  onRecycleItem?: (itemData: any) => void;
  bookings?: any[];
  setBookings?: React.Dispatch<React.SetStateAction<any[]>>;
  syncAllToMongoDB?: (overrideData?: any) => Promise<void>;
  setActiveTab?: (tab: string) => void;
}

export const AgreementManagementView: React.FC<AgreementManagementViewProps> = ({
  currentRole,
  isLight,
  windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
  agreementCategory,
  setAgreementCategory,
  visitPlans = [],
  setShowPvaVerificationModal,
  setShowCreateDevAgreementModal,
  agreements = [],
  setAgreements,
  projectVisitAgreements = [],
  setProjectVisitAgreements,
  searchQuery,
  matchesSearchQuery,
  setShowDeveloperIntroductionReportModal,
  setShowPvaDocumentModal,
  setSelectedAgreement,
  setShowFullContractModal,
  onRecycleItem,
  bookings = [],
  setBookings,
  syncAllToMongoDB,
  setActiveTab
}) => {
  const isSuperAdmin = !currentRole || currentRole.toUpperCase().includes('SUPER ADMIN') || currentRole.toUpperCase().includes('OWNER') || currentRole.toUpperCase().includes('ADMIN');

  const handleStoreInBooking = (a: any) => {
    const pva = a.pvaData || a;
    const custName = a.party_name || pva.customerName || 'Customer';
    const custMobile = a.party_contact || pva.customerMobile || '+91 78766 70000';
    const rawTitle = a.title || pva.projectTitle || 'GAJAPATI APARTMENT';
    const projName = rawTitle.includes('—') ? rawTitle.split('—')[1].trim() : rawTitle;
    const custNum = pva.customerId || pva.customerNumber || a.customer_number || `SRM-CUS-2026-000${Date.now().toString().slice(-3)}`;
    const bkgCode = `SRM-BKG-2026-000${(bookings?.length || 0) + 188}`;

    const newBookingObj = {
      id: `BKG-${Date.now()}`,
      booking_code: bkgCode,
      agreement_code: a.agreement_code || pva.projectVisitAgreementId || `SRM-PVA-2026-${Date.now().toString().slice(-6)}`,
      customer_name: custName,
      customer_number: custNum,
      customer_mobile: custMobile,
      project_name: projName,
      developer_name: pva.developerName || 'Dhriti Builders & Developers',
      property_title: projName,
      tower_unit: pva.unitNumber || 'Tower A - Unit 302 (3BHK)',
      agreement_value: '₹51,14,880',
      agreement_value_num: 5114880,
      token_amount: 100000,
      payment_mode: 'Bank Transfer / NEFT',
      payment_ref: `PVA-SIG-${pva.otpHashRef?.slice(-6) || '849201'}`,
      booking_date: new Date().toISOString().split('T')[0],
      sales_executive: pva.executiveName || 'Ramesh Pawar',
      brokerage_rate: '2.0%',
      brokerage_amount: 102297,
      approval_status: 'APPROVED_LOCKED',
      status: 'CONFIRMED'
    };

    if (setBookings) {
      let alreadyExists = false;
      setBookings((prev: any[]) => {
        const exists = (prev || []).some((b: any) => 
          (b.booking_code && b.booking_code === bkgCode) ||
          (b.agreement_code && (b.agreement_code === a.agreement_code || b.agreement_code === pva.projectVisitAgreementId)) ||
          (b.customer_name?.toLowerCase() === custName.toLowerCase() && b.project_name?.toLowerCase() === projName.toLowerCase())
        );
        if (exists) {
          alreadyExists = true;
          return prev;
        }
        const updated = [newBookingObj, ...(prev || [])];
        try {
          localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updated));
        } catch (err) {}
        if (syncAllToMongoDB) {
          syncAllToMongoDB({ bookings: updated });
        }
        return updated;
      });

      if (alreadyExists) {
        alert(`ℹ️ Customer "${custName}" (${projName}) is already stored in Booking Management!`);
      } else {
        alert(`🎉 Customer "${custName}" data for ${projName} successfully stored into Booking Management!\n\nBooking Code: ${bkgCode}\nCustomer: ${custName} (${custMobile})\nAgreement Code: ${a.agreement_code || pva.projectVisitAgreementId}`);
      }

      if (setActiveTab) {
        setActiveTab('booking_management');
      }
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: windowWidth <= 640 ? '10px' : '12px' }}>
        <div>
          <h2 style={{ fontSize: windowWidth <= 640 ? '1.05rem' : '1.4rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>Legal Agreements Vault & Corporate Tie-Ups</h2>
          <p style={{ fontSize: windowWidth <= 640 ? '0.74rem' : '0.85rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>Manage Customer Site Visit Non-Circumvention Agreements and Project-Wise Developer Channel Partner MOUs.</p>
        </div>
        
        {agreementCategory === 'customer' ? (
          <button 
            onClick={() => {
              const plan = (visitPlans && visitPlans.length > 0) ? visitPlans[0] : {
                visitPlanId: 'SRM-VP-2026-000001',
                visitScheduleId: 'SRM-VS-2026-000087',
                customerName: 'SUMANTH VARMA',
                customerNumber: 'SRM-CUS-2026-000185',
                mobile: '+91 98765 43210',
                email: 'sumanth.varma@gmail.com',
                assignedExecutive: 'Ramesh Pawar (Field Exec - Kondapur)',
                stops: []
              };
              const stop = (plan?.stops && plan.stops.length > 0) ? plan.stops[0] : { 
                stopId: 'SRM-VSTOP-2026-000001', 
                propertyTitle: 'GAJAPATI APARTMENT', 
                propertyCode: 'SRM-PROP-2026-000426', 
                costSheetId: 'COST-SHEET-2026-000001', 
                developer: 'Dhriti Builders & Developers', 
                latitude: '22.722361° N', 
                longitude: '88.493403° E' 
              };
              setShowPvaVerificationModal({ open: true, plan, stop });
            }}
            style={{ width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: windowWidth <= 640 ? '8px 12px' : '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.76rem' : '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            <ShieldCheck size={16} /> + Create Agreement via Customer OTP Verification
          </button>
        ) : (
          <button 
            onClick={() => setShowCreateDevAgreementModal(true)}
            style={{ width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: windowWidth <= 640 ? '8px 12px' : '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.76rem' : '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
          >
            <Building size={16} /> + Create Agreement with Project wise Developer
          </button>
        )}
      </div>

      {/* CATEGORY SELECTOR TABS */}
      <div style={{ display: 'flex', gap: windowWidth <= 640 ? '6px' : '10px', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setAgreementCategory('customer')}
          style={{
            flex: windowWidth <= 640 ? '1 1 100%' : '1 1 auto',
            justifyContent: 'center',
            padding: windowWidth <= 640 ? '8px 12px' : '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: windowWidth <= 640 ? '0.78rem' : '0.88rem',
            fontWeight: '800',
            background: agreementCategory === 'customer' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : (isLight ? '#f1f5f9' : '#0f172a'),
            color: agreementCategory === 'customer' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: agreementCategory === 'customer' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none'
          }}
        >
          <UserCheck size={16} /> Agreement With Customer ({agreements.filter(a => a.category === 'CUSTOMER' || a.agreement_type === 'CUSTOMER_SITE_VISIT').length + projectVisitAgreements.length})
        </button>

        <button 
          onClick={() => setAgreementCategory('developer')}
          style={{
            flex: windowWidth <= 640 ? '1 1 100%' : '1 1 auto',
            justifyContent: 'center',
            padding: windowWidth <= 640 ? '8px 12px' : '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: windowWidth <= 640 ? '0.78rem' : '0.88rem',
            fontWeight: '800',
            background: agreementCategory === 'developer' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : (isLight ? '#f1f5f9' : '#0f172a'),
            color: agreementCategory === 'developer' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: agreementCategory === 'developer' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <Building size={16} /> Agreement with Project wise Developer ({agreements.filter(a => a.category === 'DEVELOPER' || a.agreement_type === 'DEVELOPER_PROJECT_TIEUP').length})
        </button>
      </div>

      {/* ANTI-BYPASS COMPANY INTRODUCTION WARNING BANNER */}
      <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '2px solid #f59e0b', borderRadius: '12px', padding: windowWidth <= 640 ? '12px' : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: windowWidth <= 640 ? '8px' : '12px' }}>
          <AlertTriangle size={windowWidth <= 640 ? 22 : 28} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ color: '#fbbf24', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.85rem' : '0.95rem', margin: 0 }}>
              ⚠️ EXISTING COMPANY INTRODUCTION RECORDS DETECTED ({projectVisitAgreements.length} ACTIVE PVA CONTRACTS)
            </h4>
            <p style={{ color: isLight ? '#0f172a' : '#cbd5e1', fontSize: windowWidth <= 640 ? '0.72rem' : '0.8rem', margin: '4px 0 0 0' }}>
              Automatic Anti-Bypass Check: All buyer bookings & contracts are cross-referenced with Project Visit Agreements (SRM-PVA-XXXXXX) to protect company brokerage rights.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowDeveloperIntroductionReportModal(true)}
          style={{ width: windowWidth <= 640 ? '100%' : 'auto', textAlign: 'center', background: '#f59e0b', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          🛡️ AUDIT INTRODUCTION RECORDS
        </button>
      </div>

      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 640 ? '12px' : '24px' }}>
        <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                <th style={{ padding: '12px' }}>Agreement Code</th>
                <th style={{ padding: '12px' }}>{agreementCategory === 'developer' ? 'Project Title & Locality Hub / Sector' : 'Agreement Title & Project Name'}</th>
                <th style={{ padding: '12px' }}>{agreementCategory === 'developer' ? 'Developer / Builder Name & Contact' : 'Party Name'}</th>
                <th style={{ padding: '12px' }}>{agreementCategory === 'developer' ? 'Channel Partner Terms & Brokerage' : 'Digital Signature Stamp'}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let combinedAgreements: any[] = [];

                if (agreementCategory === 'customer') {
                  combinedAgreements = [
                    ...agreements.filter(a => a.category === 'CUSTOMER' || a.agreement_type === 'CUSTOMER_SITE_VISIT'),
                    ...projectVisitAgreements.filter(pva => !agreements.some(a => a.agreement_code === pva.projectVisitAgreementId)).map(pva => ({
                      id: pva.projectVisitAgreementId,
                      agreement_code: pva.projectVisitAgreementId,
                      agreement_type: 'CUSTOMER_SITE_VISIT',
                      category: 'CUSTOMER',
                      title: `Customer Site Visit Agreement — ${pva.projectTitle || 'Site Visit'}`,
                      party_name: pva.customerName,
                      party_contact: pva.customerMobile,
                      property_details: `${pva.projectTitle || 'Site Visit'}`,
                      signed_status: 'EXECUTED_SIGNED',
                      signature_hash: `OTP VERIFIED #${pva.otpHashRef?.slice(-6) || '849201'} DIGITAL SIG`,
                      signed_at: `${pva.visitDate} ${pva.otpVerifiedAt || '10:20 AM'}`,
                      pvaData: pva
                    }))
                  ];
                } else {
                  combinedAgreements = agreements.filter(a => a.category === 'DEVELOPER' || a.agreement_type === 'DEVELOPER_PROJECT_TIEUP');
                }

                return combinedAgreements
                  .filter(a => matchesSearchQuery(a, searchQuery))
                  .map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800' }}>{a.agreement_code}</td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: agreementCategory === 'developer' ? '#fbbf24' : (isLight ? '#0f172a' : '#ffffff'), fontSize: '0.9rem' }}>
                          {agreementCategory === 'developer' ? `🏢 ${a.project_name || a.title}` : a.title}
                        </strong>
                        {agreementCategory === 'developer' && (
                          <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#38bdf8', marginTop: '2px', fontWeight: '700' }}>
                            📍 {a.locality_hub || 'Hyderabad Sector'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{a.party_name}</strong>
                        {a.party_contact && (
                          <>
                            <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{a.party_contact}</span>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {agreementCategory === 'developer' ? (
                          <div>
                            <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '0.82rem' }}>💰 {a.commission_rate || '2.0% Direct Brokerage'}</span>
                            <br /><span style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: '700' }}>🛡️ {a.protection_period || '12-Month Protection Active'}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.signature_hash}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {a.pvaData ? (
                            <button 
                              onClick={() => setShowPvaDocumentModal({ open: true, pva: a.pvaData })} 
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={14} /> View Contract PDF
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setSelectedAgreement(a); setShowFullContractModal(true); }} 
                              style={{ background: agreementCategory === 'developer' ? '#16a34a' : '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={14} /> View Contract PDF
                            </button>
                          )}

                          {agreementCategory === 'customer' && (
                            <button 
                              onClick={() => handleStoreInBooking(a)} 
                              style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Store customer and agreement details into Booking Management"
                            >
                              📌 Store in Booking
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Agreement record ${a.agreement_code || a.id} for ${a.party_name || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                  if (onRecycleItem) {
                                    onRecycleItem({
                                      id: a.id || `AGR-${Date.now()}`,
                                      title: `${a.party_name || a.customer_name || 'Agreement'} (${a.agreement_code || a.id})`,
                                      category: 'Agreement',
                                      originalLocation: 'Agreement & PVA Vault',
                                      details: `Type: ${a.agreement_type || 'PVA Agreement'}, Status: ${a.status || 'Active'}`,
                                      originalData: a
                                    });
                                  }
                                  if (a.pvaData && setProjectVisitAgreements) {
                                    setProjectVisitAgreements((prev: any[]) => (prev || []).filter((pva: any) => (pva.projectVisitAgreementId || pva.id) !== a.id));
                                  }
                                  if (setAgreements) {
                                    setAgreements((prev: any[]) => (prev || []).filter((ag: any) => ag.id !== a.id && ag.agreement_code !== a.agreement_code));
                                  }
                                  alert(`🗑️ Agreement record ${a.agreement_code || a.id} moved to Recycle Bin.`);
                                }
                              }}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Move this agreement record to Recycle Bin"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
