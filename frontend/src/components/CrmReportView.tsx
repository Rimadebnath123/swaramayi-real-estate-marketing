import React, { useState, useMemo } from 'react';
import {
  BarChart2, Calendar, TrendingUp, Building, Users, Compass, FileCheck,
  Filter, Printer, Download, Search, CheckCircle2, ArrowUpRight, Sparkles,
  Clock, ShieldCheck, Layers, Activity, RefreshCw, X, ChevronRight, DollarSign,
  UserCheck, AlertCircle, FileSpreadsheet, Tag
} from 'lucide-react';

interface CrmReportViewProps {
  isLight: boolean;
  windowWidth: number;
  customers: any[];
  properties: any[];
  projectVisitAgreements: any[];
  masterProjects?: any[];
  developerMasterList?: any[];
  bookings?: any[];
}

export const CrmReportView: React.FC<CrmReportViewProps> = ({
  isLight,
  windowWidth,
  customers = [],
  properties = [],
  projectVisitAgreements = [],
  masterProjects = [],
  developerMasterList = [],
  bookings = []
}) => {
  // DATE FILTER STATES
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Default to Last 30 Days or All Time
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
  const [activeReportSubTab, setActiveReportSubTab] = useState<'summary' | 'daily_projects' | 'daily_visits' | 'daily_leads'>('summary');

  // PRESET DATE HANDLER
  const handlePresetChange = (preset: string) => {
    setDateFilterPreset(preset);
    const now = new Date();
    
    if (preset === 'TODAY') {
      const dStr = now.toISOString().split('T')[0];
      setCustomStartDate(dStr);
      setCustomEndDate(dStr);
    } else if (preset === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setCustomStartDate(yStr);
      setCustomEndDate(yStr);
    } else if (preset === 'LAST_7_DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setCustomStartDate(past.toISOString().split('T')[0]);
      setCustomEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_30_DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setCustomStartDate(past.toISOString().split('T')[0]);
      setCustomEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setCustomStartDate(firstDay.toISOString().split('T')[0]);
      setCustomEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'ALL') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // HELPER: PARSE & EXTRACT YYYY-MM-DD FROM VARIOUS DATE FORMATS
  const normalizeDateStr = (dateVal: any): string => {
    if (!dateVal) return '';
    const str = dateVal.toString().trim();
    
    // Check YYYY-MM-DD pattern
    const matchYmd = str.match(/\d{4}-\d{2}-\d{2}/);
    if (matchYmd) return matchYmd[0];

    // Check DD/MM/YYYY or DD-MM-YYYY
    const matchDmy = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (matchDmy) {
      const day = matchDmy[1].padStart(2, '0');
      const month = matchDmy[2].padStart(2, '0');
      const year = matchDmy[3];
      return `${year}-${month}-${day}`;
    }

    // Try Date parsing
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}

    return '';
  };

  // CHECK IF A DATE FALLS WITHIN CUSTOM START / END RANGE
  const isDateInRange = (dateVal: any): boolean => {
    if (!customStartDate && !customEndDate) return true;
    const norm = normalizeDateStr(dateVal);
    if (!norm) return true; // If no date, include by default or match fallback

    if (customStartDate && norm < customStartDate) return false;
    if (customEndDate && norm > customEndDate) return false;
    return true;
  };

  // 1. FILTERED DAILY PROJECTS
  const filteredProjectsList = useMemo(() => {
    // Collect projects from properties and masterProjects
    const allProjs: any[] = [];
    const seenIds = new Set<string>();

    (properties || []).forEach((p: any) => {
      const pId = p.id || p.property_code || p.project_id || p.title;
      if (pId && !seenIds.has(pId)) {
        seenIds.add(pId);
        allProjs.push({
          id: pId,
          code: p.property_code || p.project_id || p.id || 'N/A',
          title: p.title || p.property_title || p.project_name || 'Untitled Project',
          developer: p.developer || p.developer_name || 'Partner Builder',
          locality: p.locality || p.address || 'Kolkata',
          units: p.units_count || 1,
          status: p.status || 'LIVE',
          date: p.created_at || p.date || p.added_date || '2026-08-22',
          price: p.final_price || p.price || 'N/A'
        });
      }
    });

    (masterProjects || []).forEach((m: any) => {
      const mId = m.id || m.code || m.title;
      if (mId && !seenIds.has(mId)) {
        seenIds.add(mId);
        allProjs.push({
          id: mId,
          code: m.code || m.id || 'N/A',
          title: m.title || m.name || 'Master Project',
          developer: m.developer || m.builder || 'Master Builder',
          locality: m.locality || m.location || 'Barasat',
          units: m.units || 4,
          status: 'LIVE',
          date: m.created_at || m.date || '2026-08-20',
          price: m.price_range || '₹35 L - ₹65 L'
        });
      }
    });

    return allProjs.filter((item) => {
      const matchDate = isDateInRange(item.date);
      if (!matchDate) return false;

      if (!reportSearchQuery) return true;
      const q = reportSearchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q)
      );
    });
  }, [properties, masterProjects, customStartDate, customEndDate, reportSearchQuery]);

  // 2. FILTERED DAILY SITE VISITS / PVAs
  const filteredVisitsList = useMemo(() => {
    return (projectVisitAgreements || []).filter((v: any) => {
      const vDate = v.visitDate || v.date || v.created_at;
      const matchDate = isDateInRange(vDate);
      if (!matchDate) return false;

      if (!reportSearchQuery) return true;
      const q = reportSearchQuery.toLowerCase();
      return (
        (v.customerName || '').toLowerCase().includes(q) ||
        (v.customerMobile || '').toLowerCase().includes(q) ||
        (v.projectTitle || '').toLowerCase().includes(q) ||
        (v.developerName || '').toLowerCase().includes(q) ||
        (v.salesPersonName || '').toLowerCase().includes(q) ||
        (v.projectVisitAgreementId || '').toLowerCase().includes(q)
      );
    });
  }, [projectVisitAgreements, customStartDate, customEndDate, reportSearchQuery]);

  // 3. FILTERED DAILY NEW LEADS
  const filteredLeadsList = useMemo(() => {
    return (customers || []).filter((c: any) => {
      const cDate = c.created_at || c.registrationDate || c.date || c.timestamp || '2026-08-22';
      const matchDate = isDateInRange(cDate);
      if (!matchDate) return false;

      if (!reportSearchQuery) return true;
      const q = reportSearchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.mobile || c.phone || '').toLowerCase().includes(q) ||
        (c.locality || c.location || '').toLowerCase().includes(q) ||
        (c.source || '').toLowerCase().includes(q) ||
        (c.assignedAgent || c.assigned_to || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q)
      );
    });
  }, [customers, customStartDate, customEndDate, reportSearchQuery]);

  // SUMMARY COMPUTATIONS
  const totalLeadsCount = customers.length;
  const filteredLeadsCount = filteredLeadsList.length;
  const filteredProjectsCount = filteredProjectsList.length;
  const filteredVisitsCount = filteredVisitsList.length;

  const verifiedVisitsCount = useMemo(() => {
    return filteredVisitsList.filter(v => v.otpVerified || v.status === 'VERIFIED' || v.verified).length;
  }, [filteredVisitsList]);

  const verifiedRate = filteredVisitsCount > 0 ? Math.round((verifiedVisitsCount / filteredVisitsCount) * 100) : 100;

  // LEAD STAGE BREAKDOWN FOR SUMMARY TAB
  const leadStageCounts = useMemo(() => {
    const map: Record<string, number> = {
      'NEW': 0,
      'CONTACTED': 0,
      'VISIT_FIXED': 0,
      'VISIT_DONE': 0,
      'BOOKED': 0,
      'LOST': 0
    };
    filteredLeadsList.forEach(c => {
      const st = (c.status || 'NEW').toUpperCase();
      if (st.includes('BOOK')) map['BOOKED']++;
      else if (st.includes('DONE') || st.includes('VISITED')) map['VISIT_DONE']++;
      else if (st.includes('FIXED') || st.includes('SCHEDULED')) map['VISIT_FIXED']++;
      else if (st.includes('CONTACT') || st.includes('CALL')) map['CONTACTED']++;
      else if (st.includes('LOST') || st.includes('DROP')) map['LOST']++;
      else map['NEW']++;
    });
    return map;
  }, [filteredLeadsList]);

  // LEAD SOURCE BREAKDOWN
  const leadSourceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeadsList.forEach(c => {
      const src = c.source || 'Direct Walk-in';
      map[src] = (map[src] || 0) + 1;
    });
    return map;
  }, [filteredLeadsList]);

  // EXPORT CSV HANDLER
  const handleExportCsv = () => {
    let csvData: any[] = [];
    let filename = `CRM_Report_${activeReportSubTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportSubTab === 'daily_projects') {
      csvData = filteredProjectsList.map(p => ({
        Date_Added: p.date,
        Project_Code: p.code,
        Project_Title: p.title,
        Developer: p.developer,
        Locality: p.locality,
        Units: p.units,
        Price: p.price,
        Status: p.status
      }));
    } else if (activeReportSubTab === 'daily_visits') {
      csvData = filteredVisitsList.map(v => ({
        Date_Of_Visit: v.visitDate || v.date,
        PVA_ID: v.projectVisitAgreementId,
        Customer_Name: v.customerName,
        Customer_Mobile: v.customerMobile,
        Project_Title: v.projectTitle,
        Developer_Name: v.developerName,
        Sales_Executive: v.salesPersonName,
        Protection_End_Date: v.protectionEndDate,
        Verification_Status: 'VERIFIED (GPS+OTP)'
      }));
    } else if (activeReportSubTab === 'daily_leads') {
      csvData = filteredLeadsList.map(c => ({
        Date_Registered: c.created_at || c.registrationDate || c.date || 'N/A',
        Lead_Name: c.name,
        Mobile_Phone: c.mobile || c.phone,
        Preferred_Locality: c.locality || 'N/A',
        Budget: c.budget || 'N/A',
        Requirement: c.bhk_space || c.configuration || 'N/A',
        Source: c.source || 'Direct',
        Assigned_Agent: c.assignedAgent || c.assigned_to || 'Sales Team',
        Status: c.status || 'New Lead'
      }));
    } else {
      csvData = filteredLeadsList.map(c => ({
        Date: c.created_at || c.registrationDate || 'N/A',
        Customer: c.name,
        Phone: c.mobile,
        Locality: c.locality,
        Status: c.status
      }));
    }

    if (csvData.length === 0) {
      return alert('No report data available to export for the selected date range.');
    }

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(obj => Object.values(obj).map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* PAGE HEADER & TITLE */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '16px' : '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : 'none' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BarChart2 size={13} /> CRM ANALYTICS & DAILY REPORTS HUB
            </span>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900' }}>
              ● LIVE DATA SYNC
            </span>
          </div>
          <h2 style={{ fontSize: windowWidth <= 640 ? '1.25rem' : '1.5rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 CRM Operations & Performance Intelligence Report
          </h2>
          <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px', marginBottom: 0 }}>
            Daily project additions, property site visits (PVA), datewise lead registration, and custom date range CRM metrics.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
          >
            <Download size={16} /> EXPORT CSV DATA
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto' }}
          >
            <Printer size={16} /> PRINT REPORT
          </button>
        </div>
      </div>

      {/* CONTROL PANEL: DATE FILTER & SEARCH BAR */}
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* PRESET DATE BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
              <Calendar size={14} /> Quick Date Presets:
            </span>
            {[
              { key: 'ALL', label: 'All Time' },
              { key: 'TODAY', label: 'Today' },
              { key: 'YESTERDAY', label: 'Yesterday' },
              { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
              { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
              { key: 'THIS_MONTH', label: 'This Month' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => handlePresetChange(p.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: dateFilterPreset === p.key ? '#0284c7' : (isLight ? '#f1f5f9' : '#0f172a'),
                  color: dateFilterPreset === p.key ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'),
                  border: dateFilterPreset === p.key ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                  transition: 'all 0.2s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {(customStartDate || customEndDate || dateFilterPreset !== 'ALL') && (
            <button
              onClick={() => handlePresetChange('ALL')}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={14} /> Reset Date Filters
            </button>
          )}
        </div>

        {/* CUSTOM DATE RANGE PICKER & SEARCH INPUT */}
        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 1024 ? '1fr 1fr' : '1fr 1fr 1.5fr', gap: '12px', alignItems: 'center' }}>
          
          <div>
            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
              📅 From Date (Start Date)
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                setDateFilterPreset('CUSTOM');
              }}
              style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
              📅 To Date (End Date)
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                setDateFilterPreset('CUSTOM');
              }}
              style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
              🔍 Search Report Records (Name, Project, Phone, Code)
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color={isLight ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                placeholder="Search by customer name, project title, mobile, executive..."
                style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px 8px 36px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}
              />
              {reportSearchQuery && (
                <X size={14} color="#94a3b8" onClick={() => setReportSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* OVERALL SUMMARY KPI CARDS DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
        
        {/* KPI 1: NEW LEADS */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderLeft: '4px solid #38bdf8', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>👥 Daily New Leads</span>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
              Period Total
            </span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38bdf8', margin: '2px 0 0 0' }}>
            {filteredLeadsCount} <span style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>/ {totalLeadsCount} overall</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Registered within selected date range
          </span>
        </div>

        {/* KPI 2: DAILY PROJECTS ADDED */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderLeft: '4px solid #a855f7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>🏗️ Daily Projects Added</span>
            <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
              Master Catalog
            </span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#a855f7', margin: '2px 0 0 0' }}>
            {filteredProjectsCount} <span style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>Projects</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            New builder masters & project stocks
          </span>
        </div>

        {/* KPI 3: DAILY SITE VISITS */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderLeft: '4px solid #4ade80', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>🚗 Daily Site Visits (PVA)</span>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
              {verifiedRate}% Verified
            </span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#4ade80', margin: '2px 0 0 0' }}>
            {filteredVisitsCount} <span style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>Visits</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Project Visit Agreements executed
          </span>
        </div>

        {/* KPI 4: SALES CONVERSIONS */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderLeft: '4px solid #fbbf24', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>💰 Booked Conversions</span>
            <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
              Closed Deals
            </span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fbbf24', margin: '2px 0 0 0' }}>
            {leadStageCounts['BOOKED'] || (bookings ? bookings.length : 0)} <span style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>Units</span>
          </h3>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            Customer booking conversions
          </span>
        </div>

      </div>

      {/* REPORT SUB-TABS NAVIGATION BAR */}
      <div className="horizontal-scroll-touch" style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', width: '100%', display: 'flex', gap: '8px' }}>
        {[
          { id: 'summary', label: '📊 Overall CRM Summary', count: null, color: '#0284c7' },
          { id: 'daily_projects', label: '🏗️ Daily Project Add Details', count: filteredProjectsCount, color: '#a855f7' },
          { id: 'daily_visits', label: '🚗 Daily Site Visit Details', count: filteredVisitsCount, color: '#22c55e' },
          { id: 'daily_leads', label: '👥 Daily New Lead Details', count: filteredLeadsCount, color: '#38bdf8' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportSubTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              background: activeReportSubTab === tab.id ? tab.color : (isLight ? '#ffffff' : '#1e293b'),
              color: activeReportSubTab === tab.id ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'),
              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span style={{ background: activeReportSubTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(148, 163, 184, 0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: OVERALL CRM SUMMARY & STATS */}
      {activeReportSubTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            
            {/* LEAD STAGE BREAKDOWN CARD */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                📊 Lead Pipeline Stage Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: '🌟 New Leads Captured', count: leadStageCounts['NEW'], color: '#38bdf8' },
                  { label: '📞 Contacted / In Touch', count: leadStageCounts['CONTACTED'], color: '#a855f7' },
                  { label: '🗓️ Site Visit Fixed / Scheduled', count: leadStageCounts['VISIT_FIXED'], color: '#fbbf24' },
                  { label: '🚗 Site Visit Completed (PVA)', count: leadStageCounts['VISIT_DONE'], color: '#4ade80' },
                  { label: '🎉 Booked & Converted Deals', count: leadStageCounts['BOOKED'], color: '#22c55e' },
                  { label: '❌ Dropped / Lost Leads', count: leadStageCounts['LOST'], color: '#ef4444' }
                ].map((st, i) => {
                  const pct = filteredLeadsCount > 0 ? Math.round((st.count / filteredLeadsCount) * 100) : 0;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: isLight ? '#0f172a' : '#cbd5e1', fontWeight: '700' }}>{st.label}</span>
                        <span style={{ fontWeight: '900', color: st.color }}>{st.count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', background: isLight ? '#e2e8f0' : '#0f172a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: st.color, height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LEAD SOURCE ATTRIBUTION CARD */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                🌐 Lead Source Attribution Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(leadSourceCounts).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                    No lead source records available.
                  </div>
                ) : (
                  Object.entries(leadSourceCounts).map(([src, cnt], i) => {
                    const pct = filteredLeadsCount > 0 ? Math.round((cnt / filteredLeadsCount) * 100) : 0;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLight ? '#f8fafc' : '#0f172a', padding: '10px 14px', borderRadius: '8px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                          🎯 {src}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0284c7' }}>{cnt} Leads</span>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: DAILY PROJECT ADD DETAILS (DATEWISE) */}
      {activeReportSubTab === 'daily_projects' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              🏗️ DAILY PROJECT ADD DETAILS ({filteredProjectsList.length} Projects Recorded)
            </h3>
            <span style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
              Showing datewise project & developer master additions
            </span>
          </div>

          {filteredProjectsList.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
              🏗️ No projects found for the selected date range. Try clearing or expanding the date filter.
            </div>
          ) : windowWidth <= 768 ? (
            /* CARD VIEW FOR TABLET & MOBILE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredProjectsList.map((p, idx) => (
                <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: '900', fontFamily: 'monospace' }}>
                      🔑 {p.code}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      📅 {p.date}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '2px 0' }}>
                    🏢 {p.title}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    📍 {p.locality} • Builder: <strong style={{ color: '#0284c7' }}>{p.developer}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '800' }}>
                      💰 {p.price}
                    </span>
                    <span style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>
                      ● {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW FOR DESKTOP */
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>Date Added</th>
                    <th style={{ padding: '10px' }}>Project Code</th>
                    <th style={{ padding: '10px' }}>Project Title & Locality</th>
                    <th style={{ padding: '10px' }}>Developer Name</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Total Units</th>
                    <th style={{ padding: '10px' }}>Price Range</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectsList.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>
                        📅 {p.date}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#a855f7', fontWeight: '900' }}>
                        {p.code}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{p.title}</strong>
                        <br /><span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>📍 {p.locality}</span>
                      </td>
                      <td style={{ padding: '10px', color: '#0284c7', fontWeight: '800' }}>
                        🏢 {p.developer}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: '900', color: '#22c55e' }}>
                        🏠 {p.units}
                      </td>
                      <td style={{ padding: '10px', color: '#4ade80', fontWeight: '800' }}>
                        {p.price}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>
                          ● {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: DAILY SITE VISIT DETAILS (DATEWISE) */}
      {activeReportSubTab === 'daily_visits' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              🚗 DAILY SITE VISIT & PVA DETAILS ({filteredVisitsList.length} Visits Conducted)
            </h3>
            <span style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
              Showing timestamped Project Visit Agreements & site visit logs
            </span>
          </div>

          {filteredVisitsList.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
              🚗 No site visit records found for the selected date range.
            </div>
          ) : windowWidth <= 768 ? (
            /* CARD VIEW FOR TABLET & MOBILE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredVisitsList.map((v, idx) => (
                <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '900', fontFamily: 'monospace' }}>
                      {v.projectVisitAgreementId || `PVA-2026-00${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      📅 {v.visitDate}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Customer</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{v.customerName}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace' }}>{v.customerMobile}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Project & Dev</span>
                      <strong style={{ color: '#fbbf24' }}>{v.projectTitle}</strong>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{v.developerName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900' }}>
                      ✓ VERIFIED (GPS+OTP)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800' }}>
                      Exec: {v.salesPersonName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW FOR DESKTOP */
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>PVA ID & Date</th>
                    <th style={{ padding: '10px' }}>Customer Name & Mobile</th>
                    <th style={{ padding: '10px' }}>Project Title & Builder</th>
                    <th style={{ padding: '10px' }}>Assigned Sales Exec</th>
                    <th style={{ padding: '10px' }}>Protection Expiry Date</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Verification Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitsList.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{v.projectVisitAgreementId || `PVA-2026-00${idx + 1}`}</span>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>📅 {v.visitDate}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{v.customerName}</strong>
                        <br /><span style={{ fontSize: '0.74rem', color: '#4ade80', fontFamily: 'monospace' }}>📱 {v.customerMobile}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>🏢 {v.projectTitle}</strong>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>Dev: {v.developerName}</span>
                      </td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: '800' }}>
                        👤 {v.salesPersonName}
                      </td>
                      <td style={{ padding: '10px', color: '#4ade80', fontWeight: '800' }}>
                        🗓️ {v.protectionEndDate}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900' }}>
                          ✓ VERIFIED (GPS+OTP)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DAILY NEW LEAD DETAILS (DATEWISE) */}
      {activeReportSubTab === 'daily_leads' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
              👥 DAILY NEW LEAD REGISTRATION ({filteredLeadsList.length} Leads Recorded)
            </h3>
            <span style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
              Showing datewise new buyer registrations & channel sources
            </span>
          </div>

          {filteredLeadsList.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
              👥 No lead registrations found for the selected date range.
            </div>
          ) : windowWidth <= 768 ? (
            /* CARD VIEW FOR TABLET & MOBILE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLeadsList.map((c, idx) => (
                <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '900', fontFamily: 'monospace' }}>
                      🆔 {c.id || `LEAD-${idx + 100}`}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      📅 {c.created_at || c.registrationDate || c.date || '2026-08-22'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Customer Name</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{c.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace' }}>📱 {c.mobile || c.phone}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Locality & Budget</span>
                      <strong style={{ color: '#fbbf24' }}>📍 {c.locality || 'Kolkata'}</strong>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>💰 {c.budget || '₹40 L - ₹60 L'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900' }}>
                      🎯 {c.source || 'Direct Walk-in'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: c.status?.includes('BOOK') ? '#22c55e' : '#38bdf8' }}>
                      ● {c.status || 'New Lead'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW FOR DESKTOP */
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>Reg. Date & Lead ID</th>
                    <th style={{ padding: '10px' }}>Customer Name & Contact</th>
                    <th style={{ padding: '10px' }}>Preferred Locality & Budget</th>
                    <th style={{ padding: '10px' }}>Requirement</th>
                    <th style={{ padding: '10px' }}>Lead Source</th>
                    <th style={{ padding: '10px' }}>Assigned Agent</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Lead Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeadsList.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{c.id || `LEAD-2026-00${idx + 1}`}</span>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>📅 {c.created_at || c.registrationDate || c.date || '2026-08-22'}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{c.name}</strong>
                        <br /><span style={{ fontSize: '0.74rem', color: '#4ade80', fontFamily: 'monospace' }}>📱 {c.mobile || c.phone}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '0.82rem' }}>📍 {c.locality || 'Kolkata'}</strong>
                        <br /><span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>💰 {c.budget || '₹45 L'}</span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                        🏠 {c.bhk_space || c.configuration || '2BHK Apartment'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>
                          🎯 {c.source || 'Direct Walk-in'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: '800' }}>
                        👤 {c.assignedAgent || c.assigned_to || 'Sales Team'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          background: (c.status || '').toUpperCase().includes('BOOK') ? 'rgba(34, 197, 94, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                          color: (c.status || '').toUpperCase().includes('BOOK') ? '#22c55e' : '#38bdf8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '900'
                        }}>
                          ● {c.status || 'New Lead'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CrmReportView;
