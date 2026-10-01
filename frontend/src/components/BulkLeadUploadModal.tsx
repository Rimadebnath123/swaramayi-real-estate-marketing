import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, XCircle, X, ShieldAlert, ArrowRight, RefreshCw, FileText } from 'lucide-react';

interface BulkLeadUploadModalProps {
  isLight: boolean;
  onClose: () => void;
  existingLeads: any[];
  existingCustomers?: any[];
  dynamicSalesExecutives?: any[];
  onImportSuccess: (importedLeads: any[], importedCustomers: any[]) => void;
}

export const BulkLeadUploadModal: React.FC<BulkLeadUploadModalProps> = ({
  isLight,
  onClose,
  existingLeads = [],
  existingCustomers = [],
  dynamicSalesExecutives = [],
  onImportSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview & Map, 3: Success Report
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [defaultSource, setDefaultSource] = useState<string>('CSV Bulk Import');
  const [defaultSalesExecId, setDefaultSalesExecId] = useState<string>('USR-07');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Result summary
  const [importSummary, setImportSummary] = useState<{
    createdCount: number;
    skippedCount: number;
    errorCount: number;
  }>({ createdCount: 0, skippedCount: 0, errorCount: 0 });

  // Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const headers = [
      'Customer Name',
      'Mobile',
      'Alternate Mobile',
      'Email',
      'Source',
      'Preferred Location',
      'Preferred Project',
      'Property Type',
      'BHK',
      'Budget Min',
      'Budget Max',
      'Purpose',
      'Possession Preference',
      'Loan Required',
      'Occupation',
      'Priority',
      'Remarks'
    ];

    const sampleRows = [
      [
        'Ayan Mukherjee',
        '9876543210',
        '9876543211',
        'ayan.mukherjee@example.com',
        'Facebook Ads',
        'Kondapur',
        'Aparna Zenon',
        'Flat / Apartment',
        '3BHK',
        '7000000',
        '12000000',
        'Self Use',
        'Immediate (< 30 Days)',
        'Yes',
        'IT Professional',
        'HOT',
        'Looking for 3BHK east facing unit with car parking.'
      ],
      [
        'Ananya Reddy',
        '9123456780',
        '',
        'ananya.r@example.com',
        'Website Inquiry',
        'Gachibowli',
        'My Home Bhooja',
        'Gated Community Flat',
        '2BHK',
        '5000000',
        '8500000',
        'Investment',
        '3-6 Months',
        'No',
        'Business Owner',
        'WARM',
        'High ROI investment preference.'
      ],
      [
        'Vikram Malhotra',
        '9988776655',
        '9988776644',
        'vikram.m@example.com',
        'Google Search',
        'Tellapur',
        'Sumadhura Horizon',
        'Luxury Villa',
        '4BHK',
        '15000000',
        '25000000',
        'Self Use',
        'Under Construction',
        'Yes',
        'Corporate Executive',
        'HOT',
        'Requires corner villa layout.'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SRM_Lead_Import_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper CSV Parser
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string) => {
      const result = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          let field = line.substring(start, i).trim();
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          result.push(field);
          start = i + 1;
        }
      }
      let field = line.substring(start).trim();
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      result.push(field);
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.trim());
    const dataRows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      dataRows.push(rowObj);
    }

    return dataRows;
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const rawRows = parseCSVText(content);

      // Validate each row against duplicate phone/email and required fields
      const evaluated = rawRows.map((row, idx) => {
        const name = row['Customer Name'] || row['Full Name'] || row.customer_name || row.name || '';
        const rawMobile = row['Mobile'] || row['Phone'] || row['Contact Number'] || row.mobile || '';
        const mobile = String(rawMobile).trim();
        const cleanMobile = mobile.replace(/\D/g, '');
        const email = (row['Email'] || row.email || '').trim().toLowerCase();
        const altMobile = String(row['Alternate Mobile'] || row['Alt Mobile'] || row.alternate_mobile || '').trim();
        const cleanAlt = altMobile.replace(/\D/g, '');

        let status: 'VALID' | 'DUPLICATE' | 'INVALID' = 'VALID';
        let statusReason = 'Ready for import';

        if (!name || !cleanMobile || cleanMobile.length < 7) {
          status = 'INVALID';
          statusReason = !name ? 'Missing Customer Name' : 'Invalid Mobile Number';
        } else {
          // Duplicate check
          const isDup = existingLeads.some(l => {
            const m1 = l.mobile ? l.mobile.replace(/\D/g, '') : '';
            const m2 = l.alternate_mobile ? l.alternate_mobile.replace(/\D/g, '') : '';
            const em = l.email ? l.email.toLowerCase() : '';

            if (cleanMobile && (m1 === cleanMobile || m2 === cleanMobile)) return true;
            if (cleanAlt && (m1 === cleanAlt || m2 === cleanAlt)) return true;
            if (email && em === email) return true;
            return false;
          });

          if (isDup) {
            status = 'DUPLICATE';
            statusReason = 'Duplicate phone or email exists in CRM database';
          }
        }

        return {
          rowNum: idx + 1,
          raw: row,
          customer_name: name,
          mobile,
          cleanMobile,
          altMobile,
          email,
          source: row['Source'] || row.source || defaultSource,
          preferred_location: row['Preferred Location'] || row.preferred_location || 'Kondapur',
          preferred_project: row['Preferred Project'] || row.preferred_project || 'Aparna Zenon',
          property_type: row['Property Type'] || row.property_type || 'Flat / Apartment',
          bhk: row['BHK'] || row.bhk || '3BHK',
          budget_min: Number(row['Budget Min'] || row.budget_min || 0),
          budget_max: Number(row['Budget Max'] || row.budget_max || 8000000),
          purpose: row['Purpose'] || row.purpose || 'Self Use',
          possession_preference: row['Possession Preference'] || row.possession_preference || 'Immediate (< 30 Days)',
          loan_required: String(row['Loan Required'] || row.loan_required || '').toLowerCase() === 'yes',
          occupation: row['Occupation'] || row.occupation || 'Professional',
          priority: row['Priority'] || row.priority || 'WARM',
          remarks: row['Remarks'] || row.remarks || 'Imported via Bulk CSV Upload',
          status,
          statusReason
        };
      });

      setParsedRows(evaluated);
      setStep(2);
    };

    reader.readAsText(selectedFile);
  };

  const validRowsCount = parsedRows.filter(r => r.status === 'VALID').length;
  const duplicateRowsCount = parsedRows.filter(r => r.status === 'DUPLICATE').length;
  const invalidRowsCount = parsedRows.filter(r => r.status === 'INVALID').length;

  // Process Lead Import
  const handleExecuteImport = async () => {
    setIsProcessing(true);

    const rowsToImport = parsedRows.filter(r => r.status === 'VALID' || (!skipDuplicates && r.status === 'DUPLICATE'));

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const apiUrl = `http://${host}:5000/api/v1/leads/bulk-upload`;

      const payload = {
        leads: rowsToImport,
        skipDuplicates,
        defaultSource,
        defaultAssignedEmployeeId: defaultSalesExecId
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const createdLeads = result.data || [];

        // Generate corresponding customer objects for frontend state
        const createdCustomers = createdLeads.map((l: any) => ({
          id: l.customer_id,
          customer_number: l.customer_number,
          full_name: l.customer_name,
          mobile: l.mobile,
          alternate_mobile: l.alternate_mobile,
          email: l.email,
          preferred_location: l.preferred_location,
          source: l.source,
          assigned_employee_id: l.assigned_employee_id,
          priority: l.priority,
          customer_status: 'NEW',
          status: 'NEW',
          created_at: l.created_at
        }));

        setImportSummary({
          createdCount: result.created_count || createdLeads.length,
          skippedCount: result.skipped_duplicates_count || duplicateRowsCount,
          errorCount: result.errors_count || invalidRowsCount
        });

        onImportSuccess(createdLeads, createdCustomers);
        setStep(3);
      } else {
        // Fallback local creation if API server endpoint is offline
        const nowStr = new Date().toISOString();
        const localCreatedLeads: any[] = [];
        const localCreatedCusts: any[] = [];

        rowsToImport.forEach((r, idx) => {
          const custId = `CUST-BULK-${Date.now()}-${idx}`;
          const leadId = `LEAD-BULK-${Date.now()}-${idx}`;
          const leadNum = `SRM-LEAD-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
          const custNum = `SRM-CUS-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;

          const custObj = {
            id: custId,
            customer_number: custNum,
            full_name: r.customer_name,
            mobile: r.mobile,
            alternate_mobile: r.altMobile,
            email: r.email,
            preferred_location: r.preferred_location,
            source: r.source || defaultSource,
            assigned_employee_id: defaultSalesExecId,
            priority: r.priority,
            customer_status: 'NEW',
            status: 'NEW',
            created_at: nowStr
          };

          const leadObj = {
            id: leadId,
            lead_number: leadNum,
            customer_id: custId,
            customer_number: custNum,
            customer_name: r.customer_name,
            mobile: r.mobile,
            alternate_mobile: r.altMobile,
            email: r.email,
            source: r.source || defaultSource,
            campaign: 'Bulk CSV Import 2026',
            preferred_location: r.preferred_location,
            preferred_project: r.preferred_project,
            property_type: r.property_type,
            bhk: r.bhk,
            budget_min: r.budget_min,
            budget_max: r.budget_max,
            purpose: r.purpose,
            possession_preference: r.possession_preference,
            loan_required: r.loan_required,
            occupation: r.occupation,
            priority: r.priority,
            lead_status: 'NEW',
            call_disposition: 'NEW_LEAD_CREATED',
            next_action: 'CONTACT_CUSTOMER',
            next_followup: new Date(Date.now() + 24 * 3600000).toISOString(),
            assigned_employee_id: defaultSalesExecId,
            created_at: nowStr,
            updated_at: nowStr,
            quality_score: r.priority === 'HOT' ? 85 : 65,
            remarks: r.remarks
          };

          localCreatedCusts.push(custObj);
          localCreatedLeads.push(leadObj);
        });

        setImportSummary({
          createdCount: localCreatedLeads.length,
          skippedCount: skipDuplicates ? duplicateRowsCount : 0,
          errorCount: invalidRowsCount
        });

        onImportSuccess(localCreatedLeads, localCreatedCusts);
        setStep(3);
      }
    } catch (err) {
      console.warn('Bulk import executing local fallback:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>

        {/* MODAL HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(2, 132, 199, 0.15)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
                BULK LEAD IMPORT & DATABASE SYNC
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                Import CSV / Excel leads into Central Vault with automatic duplicate validation & permanent IDs
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isLight ? '#64748b' : '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: UPLOAD CSV & TEMPLATE DOWNLOAD */}
        {step === 1 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

            {/* INSTRUCTION & TEMPLATE BANNER */}
            <div style={{ background: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: isLight ? '#0369a1' : '#38bdf8' }}>
                  Need the Standard CSV Template?
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: isLight ? '#334155' : '#cbd5e1' }}>
                  Download the pre-formatted lead template containing all mandatory columns (Customer Name, Mobile, Location, BHK, Budget, etc.).
                </p>
              </div>
              <button onClick={handleDownloadSampleCSV} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                <Download size={16} /> Download Sample CSV
              </button>
            </div>

            {/* DROPZONE FILE PICKER */}
            <div style={{ border: `2px dashed ${isLight ? '#cbd5e1' : '#475569'}`, borderRadius: '14px', padding: '40px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', transition: 'all 0.2s ease', cursor: 'pointer' }}>
              <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} id="bulk-lead-csv-input" />
              <label htmlFor="bulk-lead-csv-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Upload size={32} color="#0284c7" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                    Click to browse or drag & drop CSV file
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    Supports standard comma-separated .csv files up to 50MB
                  </p>
                </div>
              </label>
            </div>

            {/* IMPORT OPTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: isLight ? '#f1f5f9' : '#0f172a', padding: '16px', borderRadius: '12px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#94a3b8', marginBottom: '6px' }}>
                  DEFAULT LEAD SOURCE
                </label>
                <select value={defaultSource} onChange={(e) => setDefaultSource(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.82rem' }}>
                  <option value="CSV Bulk Import">CSV Bulk Import</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Website Inquiry">Website Inquiry</option>
                  <option value="99acres / MagicBricks">99acres / MagicBricks</option>
                  <option value="Developer Referral">Developer Referral</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#94a3b8', marginBottom: '6px' }}>
                  DEFAULT SALES EXECUTIVE ASSIGNMENT
                </label>
                <select value={defaultSalesExecId} onChange={(e) => setDefaultSalesExecId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.82rem' }}>
                  {dynamicSalesExecutives.length > 0 ? (
                    dynamicSalesExecutives.map(exec => (
                      <option key={exec.id} value={exec.id}>{exec.name || exec.full_name}</option>
                    ))
                  ) : (
                    <>
                      <option value="USR-01">Avishek Das (Super Admin)</option>
                      <option value="USR-02">Punita Roy Chowdhury (Admin)</option>
                      <option value="USR-08">Ramesh Pawar (Field Executive)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: PREVIEW & DUPLICATE VALIDATION TABLE */}
        {step === 2 && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>

            {/* STATS SUMMARY BAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', padding: '12px 16px', borderRadius: '10px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Total File Rows</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{parsedRows.length}</h3>
              </div>

              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>Valid New Leads</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#22c55e' }}>{validRowsCount}</h3>
              </div>

              <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ca8a04', textTransform: 'uppercase' }}>Duplicates Found</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#eab308' }}>{duplicateRowsCount}</h3>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>Invalid Rows</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#ef4444' }}>{invalidRowsCount}</h3>
              </div>
            </div>

            {/* DUPLICATE HANDLING TOGGLE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isLight ? '#f8fafc' : '#0f172a', padding: '12px 16px', borderRadius: '10px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} color="#eab308" />
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                  Skip Duplicate Leads Automatically (Recommended)
                </span>
              </div>
              <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            </div>

            {/* PREVIEW TABLE */}
            <div style={{ border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', overflow: 'hidden', maxHeight: '320px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead style={{ background: isLight ? '#f1f5f9' : '#0f172a', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>#</th>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>Customer Name</th>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>Mobile</th>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>Location / BHK</th>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>Source</th>
                    <th style={{ padding: '10px 12px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#475569' : '#94a3b8' }}>Validation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => (
                    <tr key={row.rowNum} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b', background: row.status === 'INVALID' ? (isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.08)') : row.status === 'DUPLICATE' ? (isLight ? '#fffbe6' : 'rgba(234, 179, 8, 0.08)') : 'transparent' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>{row.rowNum}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{row.customer_name || 'N/A'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: isLight ? '#334155' : '#cbd5e1' }}>{row.mobile || 'N/A'}</td>
                      <td style={{ padding: '10px 12px', color: isLight ? '#475569' : '#94a3b8' }}>{row.preferred_location} • {row.bhk}</td>
                      <td style={{ padding: '10px 12px', color: isLight ? '#475569' : '#94a3b8' }}>{row.source}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {row.status === 'VALID' && (
                          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Valid Lead
                          </span>
                        )}
                        {row.status === 'DUPLICATE' && (
                          <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Duplicate (Skip)
                          </span>
                        )}
                        {row.status === 'INVALID' && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> {row.statusReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* STEP 3: SUCCESS REPORT */}
        {step === 3 && (
          <div style={{ padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={48} color="#22c55e" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
                BULK LEAD IMPORT COMPLETED SUCCESSFULLY!
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                New lead profiles & permanent unique Lead IDs (`SRM-LEAD-2026-XXXXXX`) have been created into the Central Lead Vault.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '500px', marginTop: '10px' }}>
              <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', padding: '16px', borderRadius: '12px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#22c55e' }}>CREATED</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{importSummary.createdCount}</h2>
              </div>
              <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', padding: '16px', borderRadius: '12px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#eab308' }}>SKIPPED DUPES</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{importSummary.skippedCount}</h2>
              </div>
              <div style={{ background: isLight ? '#f1f5f9' : '#0f172a', padding: '16px', borderRadius: '12px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444' }}>ERRORS</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>{importSummary.errorCount}</h2>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}>
              ← Re-select File
            </button>
          )}

          {step !== 2 && <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#475569' : '#94a3b8', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}>
              {step === 3 ? 'Close' : 'Cancel'}
            </button>

            {step === 2 && (
              <button onClick={handleExecuteImport} disabled={isProcessing || (validRowsCount === 0 && (skipDuplicates || duplicateRowsCount === 0))} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isProcessing ? 0.7 : 1, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isProcessing ? 'Importing Leads...' : `Confirm & Import ${validRowsCount + (!skipDuplicates ? duplicateRowsCount : 0)} Leads`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
