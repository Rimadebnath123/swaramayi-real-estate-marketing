import React, { useState, useMemo } from 'react';
import { Plus, Navigation, MapPin, Trash2, TrendingUp, Users, Building2, CheckCircle2, Award, Calendar, BarChart3, Filter, ArrowUpRight, DollarSign, Target, Star, Flame, Zap, ShieldAlert, Sparkles, RefreshCw, Send, Copy, Share2, Mail, MessageSquare, Check, Phone, ExternalLink, Link2 } from 'lucide-react';
import { getCustomerUsedPropertyCodes } from './MatchingManagementView';

interface VisitManagementViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth: number;
  activeVisitSubTab: string;
  setActiveVisitSubTab: (tab: any) => void;
  visitPlans: any[];
  matchesSearchQuery: (item: any, query: string) => boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  visitFilterStatus: string;
  setVisitFilterStatus: (val: string) => void;
  visitFilterDate: string;
  setVisitFilterDate: (val: string) => void;
  visitFilterExec: string;
  setVisitFilterExec: (val: string) => void;
  individualCostSheets: any[];
  setShowScheduleVisitModal: (val: any) => void;
  routePlannerMode: string;
  setRoutePlannerMode: (val: any) => void;
  setShowRouteMapModal: (val: any) => void;
  setShowVisitDetailModal: (val: any) => void;
  selectedVisitPlanId: string;
  setSelectedVisitPlanId: (val: string) => void;
  setShowIndividualStopModal: (val: any) => void;
  scheduledVisits: any[];
  properties: any[];
  projectVisitAgreements: any[];
  handleMarkVisitDoneAndNotifyDeveloper: (v: any) => void;
  setShowPvaDocumentModal: (val: any) => void;
  setShowPvaVerificationModal: (val: any) => void;
  leadsList: any[];
  setActiveTab: (tab: string) => void;
  setShowLead360Drawer: (val: any) => void;
  matchingRequestsQueue: any[];
  setSelectedMatchingId: (val: any) => void;
  customers: any[];
  setSelectedCust: (val: any) => void;
  setActiveMatchingSubTab: (tab: string) => void;
  setShowLogSalesFeedbackModal: (val: boolean) => void;
  handleOpenFeedbackModal?: (visitItem?: any) => void;
  visitFeedbacks?: any[];
  setVisitFeedbacks?: React.Dispatch<React.SetStateAction<any[]>>;
  handleDeleteFeedback?: (fbId: string) => void;
  setShowAlternativePropertyModal: (val: any) => void;
  setUpdateReqForm: (val: any) => void;
  setShowUpdateRequirementModal: (val: any) => void;
  setShowLiveRouteTrackingModal: (val: any) => void;
  bookings?: any[];
  setBookings?: React.Dispatch<React.SetStateAction<any[]>>;
  setScheduledVisits?: React.Dispatch<React.SetStateAction<any[]>>;
  setVisitPlans?: React.Dispatch<React.SetStateAction<any[]>>;
  setProperties?: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveBookingSubTab?: (tab: any) => void;
  syncAllToMongoDB?: (overrideData?: any) => Promise<void>;
  setShowShiftToMatchingModal?: (val: any) => void;
  onRecycleItem?: (itemData: any) => void;
  users?: any[];
}

export const VisitManagementView: React.FC<VisitManagementViewProps> = ({
  currentRole,
  isLight,
  windowWidth,
  activeVisitSubTab,
  setActiveVisitSubTab,
  visitPlans = [],
  properties = [],
  setProperties,
  matchesSearchQuery,
  searchQuery,
  setSearchQuery,
  visitFilterStatus,
  setVisitFilterStatus,
  visitFilterDate,
  setVisitFilterDate,
  visitFilterExec,
  setVisitFilterExec,
  individualCostSheets = [],
  setShowScheduleVisitModal,
  routePlannerMode,
  setRoutePlannerMode,
  setShowRouteMapModal,
  setShowVisitDetailModal,
  selectedVisitPlanId,
  setSelectedVisitPlanId,
  setShowIndividualStopModal,
  scheduledVisits = [],
  projectVisitAgreements = [],
  handleMarkVisitDoneAndNotifyDeveloper,
  setShowPvaDocumentModal,
  setShowPvaVerificationModal,
  leadsList = [],
  setActiveTab,
  setShowLead360Drawer,
  matchingRequestsQueue = [],
  setSelectedMatchingId,
  customers = [],
  setSelectedCust,
  setActiveMatchingSubTab,
  setShowLogSalesFeedbackModal,
  handleOpenFeedbackModal,
  visitFeedbacks = [],
  setVisitFeedbacks,
  handleDeleteFeedback,
  setShowAlternativePropertyModal,
  setUpdateReqForm,
  setShowUpdateRequirementModal,
  setShowLiveRouteTrackingModal,
  bookings = [],
  setBookings,
  setScheduledVisits,
  setVisitPlans,
  setActiveBookingSubTab,
  syncAllToMongoDB,
  setShowShiftToMatchingModal,
  onRecycleItem,
  users = [],
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');

  const assignedAdvisors = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users
      .filter((u: any) => {
        const r = (u.role || '').toUpperCase();
        return r !== 'SUPER_ADMIN' && r !== 'OWNER' && u.id !== 'USR-01' && u._id !== 'USR-01';
      })
      .map((u: any) => ({
        id: u.id || u._id,
        name: u.name || 'Unnamed Advisor',
        role: u.role || 'Property Advisor',
        phone: u.phone || u.mobile || 'N/A',
        email: u.email || '',
        img: u.avatar || u.img || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        defaultRating: '0.0',
        properties: 'Active Inventory'
      }));
  }, [users]);

  const [showSendAdvisorRatingModal, setShowSendAdvisorRatingModal] = useState(false);
  const [ratingAdvisorName, setRatingAdvisorName] = useState('');
  const [ratingCustomerName, setRatingCustomerName] = useState('');
  const [ratingCustomerMobile, setRatingCustomerMobile] = useState('');
  const [ratingPropertyTitle, setRatingPropertyTitle] = useState('DHRITI APARTMENT');
  const [ratingDeliveryChannel, setRatingDeliveryChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL' | 'COPY'>('WHATSAPP');
  const [ratingCustomNote, setRatingCustomNote] = useState('');
  const [copiedRatingLinkSuccess, setCopiedRatingLinkSuccess] = useState(false);
  const [ratingNotificationMsg, setRatingNotificationMsg] = useState('');

  const [ratingInvitesList, setRatingInvitesList] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchAdvisorRatings = async () => {
      try {
        const host = window.location.hostname || 'localhost';
        const res = await fetch(`http://${host}:5000/api/public/advisor-rating`);
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setRatingInvitesList(json.data);
        }
      } catch (err) {
        console.warn('Syncing advisor ratings from backend:', err);
      }
    };

    fetchAdvisorRatings();
    const intervalId = setInterval(fetchAdvisorRatings, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const allRatingLogs = React.useMemo(() => {
    const map = new Map<string, any>();

    // 1. Add ratingInvitesList (from backend /api/public/advisor-rating)
    (ratingInvitesList || []).forEach((item: any) => {
      if (item && (item.id || item.customerName)) {
        const cName = String(item.customerName || '').toLowerCase();
        const cMob = String(item.customerMobile || item.customerPhone || '');
        if (!cName.includes('gfhj') && !cMob.includes('5677456775')) {
          const key = String(item.id || item._id || `${item.customerName}-${item.advisorName}-${item.created_at || item.date}`);
          map.set(key, item);
        }
      }
    });

    // 2. Add site_visits with RATED status from scheduledVisits
    (scheduledVisits || []).forEach((v: any) => {
      const isRatedVisit = v.visit_status === 'RATED' || v.status === 'RATED' || String(v.site_visit_code || '').includes('RATING') || String(v.feedback_notes || '').includes('Rating');
      if (isRatedVisit) {
        const cName = String(v.customer_name || v.customerName || '').toLowerCase();
        const cMob = String(v.customer_number || v.customerNumber || v.mobile || '');
        if (!cName.includes('gfhj') && !cMob.includes('5677456775')) {
          const key = String(v.site_visit_code || v.id || `${v.customer_name}-${v.sales_executive}`);
          if (!map.has(key)) {
            let rNum = 5;
            let noteText = v.feedback_notes || v.remarks || 'Website Customer Rating';
            if (v.feedback_notes && v.feedback_notes.includes('Rating:')) {
              const match = v.feedback_notes.match(/Rating:\s*(\d)/);
              if (match) rNum = parseInt(match[1], 10);
              if (v.feedback_notes.includes('Feedback:')) {
                noteText = v.feedback_notes.split('Feedback:')[1].trim();
              }
            }
            map.set(key, {
              id: v.site_visit_code || v.id || `SRM-RAT-INV-${Math.floor(1000 + Math.random() * 9000)}`,
              date: v.created_at ? new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              customerName: v.customer_name || v.customerName || 'Website Home-Buyer',
              customerMobile: v.customer_number || v.customerNumber || v.mobile || '+91 98300 12345',
              advisorName: v.sales_executive || v.assignedExecutive || 'Punita Roy',
              propertyTitle: v.propertyTitle || 'GAJAPATI APARTMENT',
              rating: rNum,
              feedbackText: noteText,
              comment: noteText,
              status: 'VERIFIED_AND_RATED',
              deliveryChannel: 'DIRECT_WEBSITE_FORM',
              channel: 'DIRECT_WEBSITE_FORM'
            });
          }
        }
      }
    });

    return Array.from(map.values());
  }, [ratingInvitesList, scheduledVisits]);

  const unifiedVisits = React.useMemo(() => {
    const list: any[] = [...(scheduledVisits || [])];
    (visitPlans || []).forEach(plan => {
      const exists = list.some(sv => sv.visitId === plan.visitPlanId || sv.visitId === plan.visitScheduleId);
      if (!exists) {
        const firstStop = (plan.stops && plan.stops[0]) || {};
        const propTitle = plan.stops && plan.stops.length === 1 
          ? plan.stops[0].propertyTitle 
          : (plan.stops && plan.stops.length > 1 ? `${plan.stops[0].propertyTitle} (+${plan.stops.length - 1} more)` : (firstStop.propertyTitle || 'Property Visit'));
        list.push({
          visitId: plan.visitPlanId || plan.visitScheduleId,
          costSheetId: firstStop.costSheetId,
          customerName: plan.customerName,
          customerNumber: plan.customerNumber,
          mobile: plan.mobile,
          propertyTitle: propTitle,
          propertyCode: firstStop.propertyCode,
          locality: firstStop.locality,
          visitDate: plan.visitDate,
          visitTime: plan.startTime || (firstStop.scheduledTime || '10:00 AM'),
          assignedExecutive: plan.assignedExecutive,
          transport: plan.transport || '🚗 Cab Pick & Drop Needed',
          status: plan.status || 'ASSIGNED',
          totalStops: plan.stops ? plan.stops.length : 1,
          stops: plan.stops
        });
      }
    });
    return list;
  }, [scheduledVisits, visitPlans]);

  const getPvaMatch = (v: any) => {
    const cleanMob = (v?.mobile || '').replace(/\D/g, '');
    const cleanCustNo = (v?.customerNumber || '').toLowerCase().trim();
    const cleanCustName = (v?.customerName || '').toLowerCase().trim();
    const vId = (v?.visitId || '').toLowerCase().trim();
    const csId = (v?.costSheetId || '').toLowerCase().trim();

    return (projectVisitAgreements || []).find((p: any) => {
      const pMob = (p?.customerMobile || '').replace(/\D/g, '');
      const pCustNo = (p?.customerId || '').toLowerCase().trim();
      const pCustName = (p?.customerName || '').toLowerCase().trim();
      const pVId = (p?.visitScheduleId || '').toLowerCase().trim();
      const pCsId = (p?.costSheetId || '').toLowerCase().trim();

      if (vId && pVId && (vId === pVId || vId.includes(pVId) || pVId.includes(vId))) return true;
      if (cleanCustNo && pCustNo && (cleanCustNo === pCustNo || cleanCustNo.includes(pCustNo) || pCustNo.includes(cleanCustNo))) return true;
      if (cleanMob && cleanMob.length >= 7 && pMob && (cleanMob.endsWith(pMob) || pMob.endsWith(cleanMob))) return true;
      if (csId && pCsId && csId === pCsId) return true;
      if (cleanCustName && pCustName && (cleanCustName === pCustName || cleanCustName.includes(pCustName) || pCustName.includes(cleanCustName))) return true;
      return false;
    });
  };

  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState<string>('ALL');
  const [analyticsExecFilter, setAnalyticsExecFilter] = useState<string>('ALL');

  const [showRescheduleStayModal, setShowRescheduleStayModal] = useState<{ open: boolean; visit: any } | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    visitDate: '',
    visitTime: '10:00 AM',
    assignedExecutive: 'Punita Roy',
    transport: '🚗 Cab Pick & Drop Needed',
    rescheduleReason: 'Customer requested date change',
    stayType: 'NO_STAY',
    stayNotes: '',
  });

  const handleOpenRescheduleStayModal = (v: any) => {
    setShowRescheduleStayModal({ open: true, visit: v });
    setRescheduleForm({
      visitDate: v.visitDate || new Date().toISOString().split('T')[0],
      visitTime: v.visitTime || '10:00 AM',
      assignedExecutive: v.assignedExecutive || 'Punita Roy',
      transport: v.transport || '🚗 Cab Pick & Drop Needed',
      rescheduleReason: v.rescheduleReason || 'Customer requested schedule adjustment',
      stayType: v.stayType || 'NO_STAY',
      stayNotes: v.stayNotes || '',
    });
  };

  const handleSaveRescheduleStay = async () => {
    if (!showRescheduleStayModal || !showRescheduleStayModal.visit) return;
    const targetVisit = showRescheduleStayModal.visit;
    const targetId = targetVisit.visitId || targetVisit.id || targetVisit.site_visit_code;

    let updatedScheduledVisits = (scheduledVisits || []).map((sv: any) => {
      const isMatch = (sv.visitId && (sv.visitId === targetId || sv.visitScheduleId === targetId)) ||
                      (sv.id && sv.id === targetId) ||
                      (sv.customerNumber && sv.customerNumber === targetVisit.customerNumber && sv.visitDate === targetVisit.visitDate);
      if (isMatch) {
        const prevRescheduledCount = sv.rescheduledCount || 0;
        return {
          ...sv,
          visitDate: rescheduleForm.visitDate,
          visitTime: rescheduleForm.visitTime,
          assignedExecutive: rescheduleForm.assignedExecutive,
          transport: rescheduleForm.transport,
          rescheduleReason: rescheduleForm.rescheduleReason,
          rescheduledCount: prevRescheduledCount + 1,
          status: sv.status === 'COMPLETED' ? 'COMPLETED' : 'RESCHEDULED',
          visit_status: sv.status === 'COMPLETED' ? 'COMPLETED' : 'RESCHEDULED',
          stayType: rescheduleForm.stayType,
          stayNotes: rescheduleForm.stayNotes,
          lastUpdated: new Date().toISOString(),
        };
      }
      return sv;
    });

    const existsInSv = updatedScheduledVisits.some((sv: any) => (sv.visitId && (sv.visitId === targetId || sv.visitScheduleId === targetId)) || (sv.id && sv.id === targetId));
    if (!existsInSv) {
      updatedScheduledVisits.push({
        ...targetVisit,
        visitDate: rescheduleForm.visitDate,
        visitTime: rescheduleForm.visitTime,
        assignedExecutive: rescheduleForm.assignedExecutive,
        transport: rescheduleForm.transport,
        rescheduleReason: rescheduleForm.rescheduleReason,
        rescheduledCount: (targetVisit.rescheduledCount || 0) + 1,
        status: targetVisit.status === 'COMPLETED' ? 'COMPLETED' : 'RESCHEDULED',
        visit_status: targetVisit.status === 'COMPLETED' ? 'COMPLETED' : 'RESCHEDULED',
        stayType: rescheduleForm.stayType,
        stayNotes: rescheduleForm.stayNotes,
        lastUpdated: new Date().toISOString(),
      });
    }

    if (setScheduledVisits) {
      setScheduledVisits(updatedScheduledVisits);
    }

    if (setVisitPlans && visitPlans) {
      const updatedPlans = visitPlans.map((vp: any) => {
        const isMatch = (vp.visitPlanId && (vp.visitPlanId === targetId || vp.visitScheduleId === targetId)) ||
                        (vp.customerNumber && vp.customerNumber === targetVisit.customerNumber);
        if (isMatch) {
          return {
            ...vp,
            visitDate: rescheduleForm.visitDate,
            startTime: rescheduleForm.visitTime,
            assignedExecutive: rescheduleForm.assignedExecutive,
            transport: rescheduleForm.transport,
            rescheduleReason: rescheduleForm.rescheduleReason,
            rescheduledCount: (vp.rescheduledCount || 0) + 1,
            status: vp.status === 'COMPLETED' ? 'COMPLETED' : 'RESCHEDULED',
            stayType: rescheduleForm.stayType,
            stayNotes: rescheduleForm.stayNotes,
          };
        }
        return vp;
      });
      setVisitPlans(updatedPlans);
      try {
        localStorage.setItem('swaramayi_visit_plans_v4_clean', JSON.stringify(updatedPlans));
      } catch (e) {}
    }

    try {
      localStorage.setItem('swaramayi_scheduled_visits_v7_clean', JSON.stringify(updatedScheduledVisits));
    } catch (e) {}

    if (syncAllToMongoDB) {
      try {
        await syncAllToMongoDB({ scheduledVisits: updatedScheduledVisits });
      } catch (err) {
        console.warn('Sync to mongo failed:', err);
      }
    }

    setShowRescheduleStayModal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: windowWidth <= 640 ? '10px' : '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: windowWidth <= 640 ? '1.05rem' : '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>SITE VISIT SCHEDULING, OTP & GEOFENCE VERIFICATION SYSTEM</h2>
            <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>VISIT ENGINE ACTIVE</span>
          </div>
          <p style={{ fontSize: windowWidth <= 640 ? '0.74rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
            Conflict-Free Executive Scheduling • 6-Digit Mobile OTP Verification • GPS Geofence Radius Audit • 5-Star Customer Feedback
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button onClick={() => setShowScheduleVisitModal && setShowScheduleVisitModal({ open: true, costSheet: (individualCostSheets && individualCostSheets[0]) || null })} style={{ width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: 'center', background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={15} /> + Schedule Site Visit
          </button>
        </div>
      </div>

      {/* 7 SUB-TABS NAVIGATION FOR VISIT MANAGEMENT */}
      <div style={{ display: 'flex', gap: windowWidth <= 640 ? '6px' : '10px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'visit_route_planner', label: '🗺️ Multi-Property Route Planner', accent: '#38bdf8', borderAccent: '#0284c7' },
          { id: 'visit_scheduler', label: '📅 Single Site Visit Scheduler' },
          { id: 'visit_otp_checkin', label: '🔐 OTP Verification & Check-In' },
          { id: 'visit_feedback', label: '⭐ Structured 5-Star Feedback' },
          { id: 'visit_analytics', label: '📊 Visit Conversion Analytics' },
          { id: 'visit_owner_tracking', label: '👑 Owner Live Route Tracking', accent: '#fbbf24', borderAccent: '#fbbf24' },
          { id: 'advisor_ratings', label: '⭐ Advisor Ratings & Links', accent: '#f59e0b', borderAccent: '#f59e0b' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveVisitSubTab(tab.id)} 
            style={{ 
              flex: windowWidth <= 640 ? '1 1 calc(50% - 4px)' : windowWidth <= 1024 ? '1 1 auto' : 'auto',
              padding: windowWidth <= 640 ? '6px 8px' : '8px 14px', 
              borderRadius: '8px', 
              fontSize: windowWidth <= 640 ? '0.74rem' : '0.82rem', 
              fontWeight: activeVisitSubTab === tab.id ? '900' : '800', 
              cursor: 'pointer', 
              textAlign: 'center',
              background: activeVisitSubTab === tab.id ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), 
              color: activeVisitSubTab === tab.id ? '#ffffff' : (tab.accent || (isLight ? '#475569' : '#94a3b8')), 
              border: activeVisitSubTab === tab.id ? '1px solid #0284c7' : (tab.borderAccent ? `1px solid ${tab.borderAccent}` : (isLight ? '1px solid #cbd5e1' : '1px solid #334155')),
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: MULTI-PROPERTY ROUTE PLANNER & LIVE EXECUTION */}
      {activeVisitSubTab === 'visit_route_planner' && (() => {
        // Filter visit plans based on search query, status, date, exec
        const filteredPlans = visitPlans.filter((plan: any) => {
          if (!matchesSearchQuery(plan, searchQuery)) return false;
          if (visitFilterStatus !== 'ALL' && plan.status !== visitFilterStatus) return false;
          if (visitFilterDate !== 'ALL' && plan.visitDate !== visitFilterDate) return false;
          if (visitFilterExec !== 'ALL' && !plan.assignedExecutive.toLowerCase().includes(visitFilterExec.toLowerCase())) return false;
          return true;
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ROUTE PLANNER COMPACT TOOLBAR */}
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '12px' : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLight ? '#0f172a' : '#ffffff', flexShrink: 0 }}>
                  <Navigation size={20} />
                </div>
                <div>
                  <h3 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: windowWidth <= 640 ? '0.92rem' : '1.05rem', margin: 0 }}>🚘 MULTI-PROPERTY VISIT SCHEDULE REGISTER</h3>
                  <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.74rem', margin: '2px 0 0 0' }}>Compact Master Records • Click Visit Schedule ID for Full Route Details</p>
                </div>
              </div>

              {/* QUICK ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                <button 
                  onClick={() => setShowScheduleVisitModal({ open: true, costSheet: individualCostSheets[0] })} 
                  style={{ flex: windowWidth <= 640 ? '1 1 100%' : 'auto', justifyContent: 'center', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> + Schedule Site Visit
                </button>
                <button 
                  onClick={() => setRoutePlannerMode(routePlannerMode === 'exec_cockpit' ? 'compact_table' as any : 'exec_cockpit')} 
                  style={{ flex: windowWidth <= 640 ? '1 1 calc(50% - 4px)' : 'auto', justifyContent: 'center', background: routePlannerMode === 'exec_cockpit' ? '#0284c7' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📱 Mobile Cockpit
                </button>
                <button 
                  onClick={() => setShowRouteMapModal({ open: true, plan: visitPlans[0] })} 
                  style={{ flex: windowWidth <= 640 ? '1 1 calc(50% - 4px)' : 'auto', justifyContent: 'center', background: '#334155', color: '#38bdf8', border: '1px solid #0284c7', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🗺️ View Map
                </button>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 640 ? '10px' : '14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 100%', minWidth: windowWidth <= 640 ? '100%' : '240px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search Visit Schedule ID, Customer ID, Customer Name, Mobile, Exec..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}
                />
              </div>

              {/* FILTERS WRAPPER FOR MOBILE */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                <select 
                  value={visitFilterStatus} 
                  onChange={(e) => setVisitFilterStatus(e.target.value)}
                  style={{ flex: windowWidth <= 640 ? '1 1 calc(33.33% - 6px)' : '1', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontWeight: '800', padding: '8px', borderRadius: '6px', fontSize: windowWidth <= 640 ? '0.72rem' : '0.82rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="IN_PROGRESS">🔵 IN PROGRESS</option>
                  <option value="ASSIGNED">⚪ ASSIGNED</option>
                  <option value="COMPLETED">✅ COMPLETED</option>
                  <option value="PARTIALLY_COMPLETED">🟣 PARTIAL</option>
                  <option value="DELAYED">🟡 DELAYED</option>
                </select>

                <select 
                  value={visitFilterDate} 
                  onChange={(e) => setVisitFilterDate(e.target.value)}
                  style={{ flex: windowWidth <= 640 ? '1 1 calc(33.33% - 6px)' : '1', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#fbbf24', fontWeight: '800', padding: '8px', borderRadius: '6px', fontSize: windowWidth <= 640 ? '0.72rem' : '0.82rem' }}
                >
                  <option value="ALL">All Dates</option>
                  <option value="2026-08-22">22 Aug 2026</option>
                  <option value="2026-08-23">23 Aug 2026</option>
                </select>

                <select 
                  value={visitFilterExec} 
                  onChange={(e) => setVisitFilterExec(e.target.value)}
                  style={{ flex: windowWidth <= 640 ? '1 1 calc(33.33% - 6px)' : '1', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px', borderRadius: '6px', fontSize: windowWidth <= 640 ? '0.72rem' : '0.82rem' }}
                >
                  <option value="ALL">All Execs</option>
                  {assignedAdvisors.map(adv => (
                    <option key={adv.id} value={adv.name}>{adv.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* COMPACT MASTER TABLE VIEW */}
            {routePlannerMode !== 'exec_cockpit' ? (
              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1rem' }}>
                    📋 MASTER VISIT SCHEDULES REGISTER ({filteredPlans.length} RECORDS)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    Click Visit Schedule ID or VIEW button to inspect complete route details
                  </span>
                </div>

                <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                        <th style={{ padding: '12px' }}>Visit Schedule ID</th>
                        <th style={{ padding: '12px' }}>Customer & Contact</th>
                        <th style={{ padding: '12px' }}>Date & Time</th>
                        <th style={{ padding: '12px' }}>Sales Person</th>
                        <th style={{ padding: '12px' }}>Stops / Properties</th>
                        <th style={{ padding: '12px' }}>Progress</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.map((plan: any) => {
                        const planStops = plan.stops || [];
                        const completedStops = planStops.filter((s: any) => s.status === 'VISIT_COMPLETED').length;
                        const totalStops = planStops.length;
                        const pct = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
                        const firstPropTitle = planStops[0]?.propertyTitle || 'Property';
                        const extraStopsCount = totalStops > 0 ? totalStops - 1 : 0;

                      return (
                        <tr key={plan.visitPlanId} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                          
                          {/* 1. VISIT SCHEDULE ID (CLICKABLE LINK) */}
                          <td style={{ padding: '12px' }}>
                            <button 
                              onClick={() => setShowVisitDetailModal({ open: true, plan })}
                              style={{ background: 'none', border: 'none', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                              {plan.visitPlanId || plan.visitScheduleId}
                            </button>
                          </td>

                          {/* 2. CUSTOMER & ID */}
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{plan.customerName}</strong>
                            <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{plan.customerNumber}</span>
                            <br /><span style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace' }}>{plan.mobile}</span>
                          </td>

                          {/* 3. DATE & TIME */}
                          <td style={{ padding: '12px', color: '#cbd5e1' }}>
                            <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>📅 {plan.visitDate}</span>
                            <br /><span style={{ color: '#fbbf24', fontWeight: '800' }}>⏰ {plan.startTime}</span>
                          </td>

                          {/* 4. SALES PERSON */}
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '800' }}>
                            👤 {plan.assignedExecutive}
                          </td>

                          {/* 5. STOPS / PROPERTIES (COMPACT PREVIEW) */}
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', color: '#fbbf24', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                              {totalStops} STOPS
                            </span>
                            <br /><span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '800', marginTop: '2px', display: 'block' }}>
                              {firstPropTitle.slice(0, 20)}... {extraStopsCount > 0 ? `+${extraStopsCount} more` : ''}
                            </span>
                          </td>

                          {/* 6. PROGRESS */}
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900' }}>
                                <span>{completedStops}/{totalStops}</span>
                                <span>{pct}%</span>
                              </div>
                              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '4px', height: '6px', width: '100%', overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, #0284c7 0%, #22c55e 100%)', width: `${pct}%`, height: '100%' }}></div>
                              </div>
                            </div>
                          </td>

                          {/* 7. STATUS */}
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: plan.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(2, 132, 199, 0.2)', color: plan.status === 'COMPLETED' ? '#4ade80' : '#38bdf8', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900', display: 'inline-block' }}>
                              {plan.status === 'IN_PROGRESS' ? '🔵 IN PROGRESS' : plan.status === 'COMPLETED' ? '✅ COMPLETED' : '⚪ ASSIGNED'}
                            </span>
                          </td>

                          {/* 8. ACTIONS */}
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => setShowVisitDetailModal({ open: true, plan })}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                                title="Open Complete Visit Details Modal"
                              >
                                👁️ VIEW
                              </button>
                              <button 
                                onClick={() => setShowRouteMapModal({ open: true, plan })}
                                style={{ background: '#a855f7', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                                title="View Route Map Modal"
                              >
                                🗺️ MAP
                              </button>
                              <button 
                                onClick={() => window.open(`tel:${plan.mobile}`)}
                                style={{ background: '#334155', color: '#4ade80', border: '1px solid #22c55e', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                                title="Call Customer"
                              >
                                📞 CALL
                              </button>
                              <button 
                                onClick={() => window.open(`https://api.whatsapp.com/send?phone=${plan.mobile.replace(/[^0-9]/g, '')}`)}
                                style={{ background: '#25D366', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                                title="WhatsApp Customer"
                              >
                                💬 WA
                              </button>
                              <button 
                                onClick={() => {
                                  const mob = plan.mobile || plan.customerNumber || '';
                                  const cleanMob = mob.replace(/\D/g, '');
                                  const matchId = plan.matchId || plan.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                                  if (setShowShiftToMatchingModal) {
                                    setShowShiftToMatchingModal({
                                      open: true,
                                      item: plan,
                                      customerName: plan.customerName || 'Customer',
                                      customerNumber: plan.customerNumber || mob || 'SRM-CUS-2026',
                                      mobile: mob,
                                      matchId: matchId,
                                      propertyTitle: firstPropTitle,
                                      note: ''
                                    });
                                  }
                                }}
                                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}
                                title="Shift customer back to Matching Management with a note to explore other property matches"
                              >
                                ⚡ Shift to Matching
                              </button>
                              {isSuperAdmin && (
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Visit Route Plan ${plan.visitPlanId || plan.visitScheduleId} for ${plan.customerName || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                      if (onRecycleItem) {
                                        onRecycleItem({
                                          id: plan.visitPlanId || plan.visitScheduleId || `VS-${Date.now()}`,
                                          title: `Visit Schedule - ${plan.customerName || 'Client'} (${plan.visitPlanId || plan.visitScheduleId})`,
                                          category: 'Visit Management',
                                          originalLocation: 'Visit Management Desk',
                                          details: `Executive: ${plan.assignedExecutive || 'N/A'}, Stops: ${plan.stops?.length || 0}`,
                                          originalData: plan
                                        });
                                      }
                                      const updatedPlans = (visitPlans || []).filter((p: any) => 
                                        p.visitPlanId !== plan.visitPlanId && 
                                        p.visitScheduleId !== plan.visitPlanId && 
                                        p.visitPlanId !== plan.visitScheduleId && 
                                        p.visitScheduleId !== plan.visitScheduleId && 
                                        (!plan.id || p.id !== plan.id)
                                      );
                                      const updatedVisits = (scheduledVisits || []).filter((sv: any) => 
                                        sv.visitId !== plan.visitPlanId && 
                                        sv.costSheetId !== plan.visitPlanId && 
                                        sv.visitId !== plan.visitScheduleId && 
                                        sv.costSheetId !== plan.visitScheduleId && 
                                        (!plan.id || sv.id !== plan.id)
                                      );
                                      if (setVisitPlans) {
                                        setVisitPlans(updatedPlans);
                                      }
                                      try {
                                        localStorage.setItem('swaramayi_visit_plans_v4_clean', JSON.stringify(updatedPlans));
                                      } catch (e) {}
                                      if (setScheduledVisits) {
                                        setScheduledVisits(updatedVisits);
                                      }
                                      try {
                                        localStorage.setItem('swaramayi_scheduled_visits_v4_clean', JSON.stringify(updatedVisits));
                                      } catch (e) {}
                                      if (syncAllToMongoDB) {
                                        syncAllToMongoDB({
                                          site_visits: updatedVisits
                                        });
                                      }
                                      alert(`🗑️ Visit Route Plan ${plan.visitPlanId || plan.visitScheduleId} moved to Recycle Bin.`);
                                    }
                                  }}
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                                  title="Super Admin Only: Permanently delete this visit route plan"
                                >
                                  🗑️ DELETE
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
          ) : (
            /* MOBILE COCKPIT VIEW (WHEN USER SWITCHES TO MOBILE COCKPIT MODE) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* SELECTOR FOR ACTIVE VISIT PLAN */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>Active Visit Plan:</span>
                  <select 
                    value={selectedVisitPlanId} 
                    onChange={(e) => setSelectedVisitPlanId(e.target.value)} 
                    style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', color: '#38bdf8', fontWeight: '900', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    {visitPlans.map(plan => (
                      <option key={plan.visitPlanId} value={plan.visitPlanId}>
                        {plan.visitPlanId} — {plan.customerName} ({(plan.stops || []).length} Stops) [{plan.visitDate}]
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setRoutePlannerMode('compact_table' as any)} 
                  style={{ background: '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  ⬅️ Back to Compact Register Table
                </button>
              </div>

              {/* EXECUTIVE MOBILE ROUTE CARD */}
              {(() => {
                const currentPlan = visitPlans.find(p => p.visitPlanId === selectedVisitPlanId) || visitPlans[0] || {
                  visitPlanId: 'NO_VISIT_PLANS',
                  customerName: 'No Scheduled Visit Plans Available',
                  customerNumber: 'N/A',
                  mobile: 'N/A',
                  visitDate: 'N/A',
                  startTime: 'N/A',
                  salesExecutive: 'Unassigned',
                  status: 'NO_PLANS',
                  currentStopIndex: 0,
                  stops: []
                };
                const planStops = currentPlan.stops || [];
                const completedStops = planStops.filter((s: any) => s.status === 'VISIT_COMPLETED').length;
                const totalStops = planStops.length;
                const currentStopIndex = currentPlan.currentStopIndex || 0;
                const currentStop = planStops[currentStopIndex] || planStops[0] || {
                  stopId: 'N/A',
                  scheduledTime: 'N/A',
                  propertyTitle: 'No Active Stop Available',
                  address: 'N/A',
                  propertyCode: 'N/A',
                  costSheetId: 'N/A',
                  developer: 'N/A',
                  status: 'N/A'
                };

                const isHydCoords = (latVal: any, lngVal: any) => {
                  const latNum = parseFloat(String(latVal || '').replace(/[^0-9.-]/g, ''));
                  const lngNum = parseFloat(String(lngVal || '').replace(/[^0-9.-]/g, ''));
                  return !isNaN(latNum) && !isNaN(lngNum) && (latNum >= 17.0 && latNum <= 18.0 && lngNum >= 78.0 && lngNum <= 79.0);
                };

                const resolveStopCoords = (s: any, idx: number) => {
                  if (!s) return { lat: '22.722361', lng: '88.493403' };
                  const pCode = (s.propertyCode || s.propertyId || s.propCode || '').trim();
                  const pTitle = (s.propertyTitle || s.title || '').trim();
                  const csId = (s.costSheetId || '').trim();

                  const matched = (properties || []).find((p: any) => 
                    (pCode && (p.property_code === pCode || p.id === pCode)) ||
                    (csId && p.costSheetId === csId) ||
                    (pTitle && p.title && (p.title.toLowerCase().trim() === pTitle.toLowerCase().trim() || p.title.toLowerCase().includes(pTitle.toLowerCase()) || pTitle.toLowerCase().includes(p.title.toLowerCase())))
                  );

                  if (matched && matched.latitude && matched.longitude) {
                    const lat = String(matched.latitude).replace(/[^0-9.-]/g, '');
                    const lng = String(matched.longitude).replace(/[^0-9.-]/g, '');
                    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && !isHydCoords(lat, lng)) {
                      return { lat, lng };
                    }
                  }

                  if (s.latitude && s.longitude) {
                    const lat = String(s.latitude).replace(/[^0-9.-]/g, '');
                    const lng = String(s.longitude).replace(/[^0-9.-]/g, '');
                    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && !isHydCoords(lat, lng)) {
                      return { lat, lng };
                    }
                  }

                  const t = pTitle.toLowerCase();
                  if (t.includes('gajapati') || t.includes('star mall') || t.includes('madhyamgram')) return { lat: '22.694318', lng: '88.400659' };
                  if (t.includes('dhriti') || t.includes('colony') || t.includes('dakbangla')) return { lat: '22.715420', lng: '88.479150' };
                  if (t.includes('shibalay') || t.includes('chapadali')) return { lat: '22.722361', lng: '88.493403' };
                  if (t.includes('greenwood') || t.includes('vip road') || t.includes('airport')) return { lat: '22.645200', lng: '88.438500' };
                  if (t.includes('aparna') || t.includes('zenon') || t.includes('kondapur')) return { lat: '22.722361', lng: '88.493403' };

                  const baseLat = 22.722361;
                  const baseLng = 88.493403;
                  return {
                    lat: (baseLat + (idx * 0.01825)).toFixed(6),
                    lng: (baseLng + (idx * -0.01540)).toFixed(6)
                  };
                };

                const getUniversalNavigationUrl = (plan: any) => {
                  if (!plan) return 'https://www.google.com/maps';

                  const stops = plan.stops || [];
                  const resolvedStops = stops.map((s: any, idx: number) => resolveStopCoords(s, idx));

                  const isCabNeeded = 
                    (plan.transport || '').toLowerCase().includes('cab') ||
                    (plan.transport || '').toLowerCase().includes('pick') ||
                    Boolean(plan.pickupAddress || plan.pickupLat);

                  if (isCabNeeded) {
                    // 1st Leg: Customer Pickup Address
                    let pickupPt = '22.720500,88.485000';
                    if (plan.pickupAddress && plan.pickupAddress.trim()) {
                      const addr = plan.pickupAddress.trim();
                      if (!addr.toLowerCase().includes('hyderabad') && !addr.toLowerCase().includes('kondapur')) {
                        pickupPt = encodeURIComponent(addr);
                      }
                    } else if (plan.pickupLat && plan.pickupLng && !isHydCoords(plan.pickupLat, plan.pickupLng)) {
                      const lat = String(plan.pickupLat).replace(/[^0-9.-]/g, '');
                      const lng = String(plan.pickupLng).replace(/[^0-9.-]/g, '');
                      if (lat && lng) pickupPt = `${lat},${lng}`;
                    }

                    // Intermediate Legs: Project Property Locations
                    const projectCoordsStr = resolvedStops.map((c: any, idx: number) => {
                      const s = stops[idx];
                      if (s && s.address && s.address.trim() && !s.address.toLowerCase().includes('hyderabad') && !s.address.toLowerCase().includes('kondapur')) {
                        return encodeURIComponent(s.address.trim());
                      }
                      return `${c.lat},${c.lng}`;
                    });

                    // Final Leg: Customer Drop Address
                    let dropPt = '22.725000,88.498000';
                    if (plan.dropAddress && plan.dropAddress.trim()) {
                      const addr = plan.dropAddress.trim();
                      if (!addr.toLowerCase().includes('hyderabad') && !addr.toLowerCase().includes('kondapur')) {
                        dropPt = encodeURIComponent(addr);
                      }
                    } else if (plan.dropLat && plan.dropLng && !isHydCoords(plan.dropLat, plan.dropLng)) {
                      const lat = String(plan.dropLat).replace(/[^0-9.-]/g, '');
                      const lng = String(plan.dropLng).replace(/[^0-9.-]/g, '');
                      if (lat && lng) dropPt = `${lat},${lng}`;
                    }

                    // Sequence: Origin (Visitor Live Current Location) -> 1st Waypoint (Customer Pickup) -> Waypoints 2..N (Project Sites) -> Final Destination (Customer Drop)
                    const waypointsStr = [pickupPt, ...projectCoordsStr].join('|');
                    return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${dropPt}&waypoints=${waypointsStr}&travelmode=driving&dirflg=d`;
                  } else {
                    if (resolvedStops.length > 1) {
                      const destStop = resolvedStops[resolvedStops.length - 1];
                      const waypointsStr = resolvedStops.slice(0, resolvedStops.length - 1).map((c: any) => `${c.lat},${c.lng}`).join('|');
                      return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destStop.lat},${destStop.lng}&waypoints=${encodeURIComponent(waypointsStr)}&travelmode=driving&dirflg=d`;
                    } else if (resolvedStops.length === 1) {
                      const c = resolvedStops[0];
                      return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${c.lat},${c.lng}&travelmode=driving&dirflg=d`;
                    }
                    return 'https://www.google.com/maps';
                  }
                };

                return (
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #0284c7', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#fbbf24', fontWeight: '900', fontSize: '0.8rem' }}>📱 TODAY'S VISIT PLAN</span>
                        <h3 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.2rem', marginTop: '2px' }}>{currentPlan.visitPlanId} — {currentPlan.customerName}</h3>
                        <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.78rem' }}>{totalStops} Stops • {completedStops}/{totalStops} Completed • {currentPlan.status}</span>
                      </div>
                      <button 
                        onClick={() => setShowVisitDetailModal({ open: true, plan: currentPlan })}
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        OPEN VISIT DETAILS
                      </button>
                    </div>

                    {/* ROUTE BREAKDOWN & LEG INDICATOR CARD */}
                    <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: isLight ? '#7e22ce' : '#a855f7', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🗺️ ROUTE LEG SEQUENCE BREAKDOWN (MAP INDICATOR)
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: windowWidth > 768 ? 'repeat(3, 1fr)' : '1fr', gap: '12px', marginTop: '4px' }}>
                        
                        {/* 1. PICKUP ADDRESS */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '900' }}>🟢 1. CUSTOMER PICKUP ADDRESS</span>
                          <p style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                            {currentPlan.pickupAddress || 'Barasat Banamalipur, Kolkata, West Bengal - 700124'}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>Mode: {currentPlan.transport || 'Cab Pick & Drop'}</span>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentPlan.pickupAddress || 'Barasat Banamalipur Kolkata West Bengal')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid #22c55e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', textDecoration: 'none', width: 'fit-content' }}
                            title="Drop direct Red Location Pin Pointer on Google Maps for Customer Pickup"
                          >
                            📍 View Red Pin Pointer
                          </a>
                        </div>

                        {/* 2. PROJECT SITE ADDRESSES */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '900' }}>🏢 2. PROJECT SITE LOCATION(S) ({totalStops} STOPS)</span>
                          {(currentPlan.stops || []).map((s: any, sIdx: number) => (
                            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: sIdx < totalStops - 1 ? '1px dashed #334155' : 'none', paddingBottom: sIdx < totalStops - 1 ? '6px' : '0' }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                                Stop {sIdx + 1}: <strong>{s.propertyTitle}</strong> <span style={{ fontSize: '0.72rem', fontWeight: 'normal', color: isLight ? '#64748b' : '#94a3b8' }}>({s.address || s.locality || 'Barasat Site'})</span>
                              </p>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || s.propertyTitle || s.locality || 'Barasat West Bengal')}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', textDecoration: 'none', width: 'fit-content' }}
                                title={`Drop direct Red Location Pin Pointer on Google Maps for Stop ${sIdx + 1}`}
                              >
                                📍 View Red Pin Pointer
                              </a>
                            </div>
                          ))}
                        </div>

                        {/* 3. DROP ADDRESS */}
                        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: '900' }}>🔴 3. CUSTOMER DROP ADDRESS</span>
                          <p style={{ fontSize: '0.82rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                            {currentPlan.dropAddress || 'Barasat Chapadali Bus Terminus Hub, Kolkata, West Bengal - 700124'}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>Destination End Leg</span>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentPlan.dropAddress || 'Barasat Chapadali Kolkata West Bengal')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', textDecoration: 'none', width: 'fit-content' }}
                            title="Drop direct Red Location Pin Pointer on Google Maps for Customer Drop"
                          >
                            📍 View Red Pin Pointer
                          </a>
                        </div>

                      </div>
                    </div>

                    {/* CURRENT STOP HIGHLIGHT CARD */}
                    <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #38bdf8', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: '#38bdf8', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                          🟡 CURRENT ACTIVE STOP (STOP {currentStopIndex + 1})
                        </span>
                        <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '0.78rem' }}>{currentStop.scheduledTime}</span>
                      </div>
                      <h3 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.1rem' }}>{currentStop.propertyTitle}</h3>
                      <p style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>📍 Address: {currentStop.address}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => {
                            setShowRouteMapModal({ open: true, plan: currentPlan, autoStart: true });
                          }}
                          style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Open In-App Interactive Google Road Map & Start Car Navigation"
                        >
                          🚀 START FULL ROUTE NAVIGATION ({totalStops} STOPS)
                        </button>
                        {totalStops > 1 && (
                          <button 
                            onClick={() => {
                              const curCoords = resolveStopCoords(currentStop, currentStopIndex);
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${curCoords.lat},${curCoords.lng}`, '_blank');
                            }}
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                            title="Navigate to active current stop only"
                          >
                            📍 Current Stop Only (Stop {currentStopIndex + 1})
                          </button>
                        )}
                        <button 
                          onClick={() => setShowIndividualStopModal({ open: true, stop: currentStop, plan: currentPlan })}
                          style={{ background: '#334155', color: '#38bdf8', border: '1px solid #0284c7', padding: '8px 16px', borderRadius: '6px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
                        >
                          👁️ View Stop Details
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}

        </div>
      );
    })()}

    {/* SUB-TAB 2: VISIT SCHEDULER */}
    {activeVisitSubTab === 'visit_scheduler' && (() => {
      const filteredVisits = unifiedVisits.filter(v => matchesSearchQuery(v, searchQuery));

      return (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>📅 Scheduled Site Visits Register ({filteredVisits.length} Visits)</h3>
              <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>Visits scheduled from Cost Sheet Sharing, Route Planner or Direct Booking Workflow</p>
            </div>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #22c55e' }}>
              ● AUTOMATIC VISIT & ROUTE SYNC ACTIVE
            </span>
          </div>

          {filteredVisits.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #ef4444' }}>
              <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO SCHEDULED SITE VISITS FOUND</h4>
              <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                Click "+ Schedule Site Visit" or transfer a cost sheet from Cost Sheet Sharing to create a visit.
              </p>
            </div>
          ) : (
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '10px' }}>Visit ID & Cost Sheet ID</th>
                  <th style={{ padding: '10px' }}>Customer & Contact</th>
                  <th style={{ padding: '10px' }}>Target Property</th>
                  <th style={{ padding: '10px' }}>Scheduled Date & Time</th>
                  <th style={{ padding: '10px' }}>Assigned Field Exec</th>
                  <th style={{ padding: '10px' }}>OTP Verification Status</th>
                  <th style={{ padding: '10px' }}>Transport Logistics</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((v: any, idx: number) => {
                  const matchedPlan = (visitPlans || []).find((p: any) => 
                    (v.visitId && (p.visitPlanId === v.visitId || p.visitScheduleId === v.visitId)) ||
                    (v.customerNumber && p.customerNumber === v.customerNumber && v.visitDate === p.visitDate) ||
                    (v.mobile && p.mobile === v.mobile && v.visitDate === p.visitDate)
                  );

                  const firstStop = (matchedPlan?.stops && matchedPlan.stops[0]) || (v.stops && v.stops[0]) || null;
                  const cleanPropTitle = (firstStop && firstStop.propertyTitle) 
                    ? firstStop.propertyTitle 
                    : (v.propertyTitle && !v.propertyTitle.includes('Properties (') ? v.propertyTitle : (firstStop?.propertyTitle || 'GAJAPATI APARTMENT'));

                  const cleanPropCode = firstStop?.propertyCode || v.propertyCode || v.propCode || 'SRM-PROP-2026-000426';
                  const cleanLocality = firstStop?.locality || v.locality || 'Barasat, Kolkata';
                  const totalStopsCount = (matchedPlan?.stops && matchedPlan.stops.length) || (v.stops && v.stops.length) || v.totalStops || 1;

                  const matchedProp = properties.find((p: any) => 
                    p.property_code === cleanPropCode || 
                    p.id === cleanPropCode || 
                    (cleanPropTitle && p.title && p.title.toLowerCase().includes(cleanPropTitle.toLowerCase()))
                  );
                  const lat = firstStop?.latitude || matchedProp?.latitude || '22.722351';
                  const lng = firstStop?.longitude || matchedProp?.longitude || '88.485484';
                  const matchingPva = getPvaMatch(v);
                  const stopsList = (matchedPlan?.stops && matchedPlan.stops.length > 0) 
                    ? matchedPlan.stops 
                    : ((v.stops && v.stops.length > 0) ? v.stops : []);

                  const isOtpVerified = !!matchingPva || v.status === 'OTP_VERIFIED' || v.status === 'COMPLETED' || v.status === 'VISIT_DONE' || v.status === 'VERIFIED_CHECKIN' || v.otpVerified === true || v.checkedIn === true || (stopsList && stopsList.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'));
                  const fallbackPvaId = (stopsList && stopsList.find((s: any) => s.pvaId)?.pvaId) || 'SRM-PVA-2026-000001';
                  const displayPvaId = matchingPva?.projectVisitAgreementId || fallbackPvaId;

                  const checkStopVerified = (stopItem: any, sIdx: number) => {
                    if (stopItem.otpVerified || stopItem.status === 'VISIT_COMPLETED' || stopItem.status === 'OTP_VERIFIED') return true;
                    
                    const stopPropCode = stopItem.propertyCode || cleanPropCode;
                    const stopCsId = stopItem.costSheetId || v.costSheetId;
                    const stopId = stopItem.stopId;

                    const stopPva = (projectVisitAgreements || []).find((p: any) => {
                      const pVId = (p?.visitScheduleId || '').toLowerCase().trim();
                      const vId = (v?.visitId || '').toLowerCase().trim();
                      const pCustNo = (p?.customerId || '').toLowerCase().trim();
                      const vCustNo = (v?.customerNumber || '').toLowerCase().trim();
                      const pMob = (p?.customerMobile || '').replace(/\D/g, '');
                      const vMob = (v?.mobile || '').replace(/\D/g, '');

                      const custMatch = (vId && pVId && (vId === pVId || pVId.includes(vId) || vId.includes(pVId))) ||
                                        (vCustNo && pCustNo && (vCustNo === pCustNo || vCustNo.includes(pCustNo) || pCustNo.includes(vCustNo))) ||
                                        (vMob && pMob && (vMob.endsWith(pMob) || pMob.endsWith(vMob)));

                      if (!custMatch) return false;

                      if (stopPropCode && p.propertyId && p.propertyId.toLowerCase() === stopPropCode.toLowerCase()) return true;
                      if (stopCsId && p.costSheetId && p.costSheetId.toLowerCase() === stopCsId.toLowerCase()) return true;
                      if (stopId && p.visitStopId && p.visitStopId.toLowerCase() === stopId.toLowerCase()) return true;
                      return false;
                    });

                    if (stopPva) return true;
                    if (stopsList.length <= 1 && isOtpVerified) return true;
                    return false;
                  };

                  const getStopPva = (stopItem: any, sIdx: number) => {
                    const stopPropCode = stopItem.propertyCode || cleanPropCode;
                    const stopCsId = stopItem.costSheetId || v.costSheetId;
                    const stopId = stopItem.stopId;

                    const stopPva = (projectVisitAgreements || []).find((p: any) => {
                      const pVId = (p?.visitScheduleId || '').toLowerCase().trim();
                      const vId = (v?.visitId || '').toLowerCase().trim();
                      const pCustNo = (p?.customerId || '').toLowerCase().trim();
                      const vCustNo = (v?.customerNumber || '').toLowerCase().trim();
                      const pMob = (p?.customerMobile || '').replace(/\D/g, '');
                      const vMob = (v?.mobile || '').replace(/\D/g, '');

                      const custMatch = (vId && pVId && (vId === pVId || pVId.includes(vId) || vId.includes(pVId))) ||
                                        (vCustNo && pCustNo && (vCustNo === pCustNo || vCustNo.includes(pCustNo) || pCustNo.includes(vCustNo))) ||
                                        (vMob && pMob && (vMob.endsWith(pMob) || pMob.endsWith(vMob)));

                      if (!custMatch) return false;

                      if (stopPropCode && p.propertyId && p.propertyId.toLowerCase() === stopPropCode.toLowerCase()) return true;
                      if (stopCsId && p.costSheetId && p.costSheetId.toLowerCase() === stopCsId.toLowerCase()) return true;
                      if (stopId && p.visitStopId && p.visitStopId.toLowerCase() === stopId.toLowerCase()) return true;
                      return false;
                    });

                    if (stopPva) return stopPva;
                    if (matchingPva) return matchingPva;

                    const stopPvaId = stopItem.pvaId || displayPvaId;
                    return {
                      projectVisitAgreementId: stopPvaId,
                      visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                      customerId: v.customerNumber || 'SRM-CUS-2026-000188',
                      customerName: v.customerName || 'Rishita sharma',
                      customerMobile: v.mobile || '8876597975',
                      propertyId: stopPropCode,
                      projectTitle: stopItem.propertyTitle || cleanPropTitle,
                      locality: stopItem.locality || cleanLocality,
                      developerName: stopItem.developer || matchedProp?.developerName || matchedProp?.developer || 'Dhriti Builders & Developers',
                      salesPersonName: v.assignedExecutive || 'Punita Roy',
                      visitDate: v.visitDate || '2026-08-22',
                      protectionStartDate: v.visitDate || '2026-08-22',
                      protectionEndDate: '2027-02-22',
                      customerOtpStatus: 'OTP_VERIFIED',
                      geofenceStatus: 'GEOFENCE_VERIFIED',
                      documentUrl: `file:///pva_${stopPvaId}.pdf`
                    };
                  };

                  return (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{v.visitId}</span>
                        {v.costSheetId && (
                          <>
                            <br /><span style={{ fontFamily: 'monospace', color: '#fbbf24', fontSize: '0.72rem', fontWeight: '800' }}>{v.costSheetId}</span>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{v.customerName}</strong>
                        <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{v.mobile}</span>
                        {v.customerNumber && (
                          <>
                            <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{v.customerNumber}</span>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '10px', minWidth: '280px' }}>
                        {(() => {
                          if (stopsList.length <= 1) {
                            return (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>
                                    🏢 {cleanPropTitle}
                                  </strong>
                                </div>
                                <div style={{ marginTop: '3px', marginBottom: '3px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '900', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block' }}>
                                    Code: {cleanPropCode}
                                  </span>
                                  <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>
                                    📍 {cleanLocality}
                                  </span>
                                </div>
                                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                  <MapPin size={11} color="#38bdf8" />
                                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800' }}>
                                    GPS: {lat}, {lng}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #a855f7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900', width: 'fit-content' }}>
                                🚘 MULTI-PROPERTY SCHEDULE ({stopsList.length} STOPS)
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {stopsList.map((stop: any, sIdx: number) => {
                                  const stopNum = stop.stopNum || stop.stopNo || (sIdx + 1);
                                  const csId = stop.costSheetId;
                                  const pTitle = stop.propertyTitle || 'Property Site';
                                  const pCode = stop.propertyCode || cleanPropCode;
                                  const loc = stop.locality || cleanLocality;
                                  const dev = stop.developer;

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
                                          📍 {loc} {dev ? `• ${dev}` : ''}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>
                        <span style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>📅 {v.visitDate}</span>
                        <br /><span style={{ color: '#fbbf24', fontWeight: '800' }}>⏰ {v.visitTime}</span>
                        {(v.rescheduledCount > 0 || v.status === 'RESCHEDULED') && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900' }}>
                              📅 RESCHEDULED {v.rescheduledCount ? `(${v.rescheduledCount}x)` : ''}
                            </span>
                            {v.rescheduleReason && (
                              <div style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                                "{v.rescheduleReason}"
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: '800' }}>
                        {v.assignedExecutive}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {stopsList.length > 1 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {stopsList.map((stopItem: any, sIdx: number) => {
                              const stopNum = stopItem.stopNum || stopItem.stopNo || (sIdx + 1);
                              const verified = checkStopVerified(stopItem, sIdx);
                              const stopPva = getStopPva(stopItem, sIdx);
                              const pvaIdToDisplay = stopItem.pvaId || stopPva?.projectVisitAgreementId || displayPvaId;

                              return (
                                <div key={sIdx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: verified ? '1px solid #22c55e' : '1px solid #f59e0b', borderRadius: '6px', padding: '5px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ background: '#eab308', color: '#0f172a', padding: '1px 5px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '900' }}>
                                      STOP 0{stopNum}
                                    </span>
                                    {verified ? (
                                      <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '2px 6px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: '900' }}>
                                        ✅ VERIFIED
                                      </span>
                                    ) : (
                                      <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '2px 6px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: '900' }}>
                                        ⏳ PENDING OTP
                                      </span>
                                    )}
                                  </div>
                                  {verified && (
                                    <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800', marginTop: '2px' }}>
                                      {pvaIdToDisplay}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : isOtpVerified ? (
                          <div>
                            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900', display: 'inline-block' }}>
                              ✅ OTP VERIFIED
                            </span>
                            <br />
                            <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800' }}>
                              {displayPvaId}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900', display: 'inline-block' }}>
                              ⏳ OTP VERIFICATION PENDING
                            </span>
                            <br />
                            <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                              6-Digit OTP Check-In Awaited
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                          {v.transport || 'Direct Arrival'}
                        </span>
                        {v.stayType && v.stayType !== 'NO_STAY' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '900', display: 'inline-block' }}>
                              {v.stayType === 'HOTEL_STAY' && '🏨 Hotel Stay'}
                              {v.stayType === 'GUEST_HOUSE' && '🏡 Guest House'}
                              {v.stayType === 'SITE_LOUNGE' && '🛋️ Site Lounge'}
                            </span>
                            {v.stayNotes && (
                              <div style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                                📝 {v.stayNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: stopsList.length > 1 ? 'column' : 'row', alignItems: 'center' }}>
                          <button
                            onClick={() => handleOpenRescheduleStayModal(v)}
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Reschedule Visit Date/Time and Log Customer Stay / Accommodation Details"
                          >
                            📅 Reschedule & 🏨 Stay
                          </button>
                          <button
                            onClick={() => handleMarkVisitDoneAndNotifyDeveloper(v)}
                            style={{ 
                              background: v.status === 'COMPLETED' || v.visitDone 
                                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' 
                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                              color: '#ffffff', 
                              border: 'none', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              cursor: 'pointer', 
                              fontWeight: '900', 
                              fontSize: '0.72rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '3px', 
                              boxShadow: v.status === 'COMPLETED' || v.visitDone 
                                ? '0 2px 6px rgba(22, 197, 94, 0.3)' 
                                : '0 2px 6px rgba(239, 68, 68, 0.4)' 
                            }}
                            title="Mark Visit Completed & automatically send WhatsApp confirmation to Developer with Customer Name and 7-digit Customer ID"
                          >
                            {v.status === 'COMPLETED' || v.visitDone ? '✅ VISIT DONE (Resend WA)' : '✅ MARK VISIT DONE & WA DEV'}
                          </button>

                          {stopsList.length > 1 ? (
                            stopsList.map((stopItem: any, sIdx: number) => {
                              const stopNum = stopItem.stopNum || stopItem.stopNo || (sIdx + 1);
                              const verified = checkStopVerified(stopItem, sIdx);
                              const stopPva = getStopPva(stopItem, sIdx);

                              return (
                                <div key={sIdx} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                  {verified ? (
                                    <button 
                                      onClick={() => setShowPvaDocumentModal({ open: true, pva: stopPva })}
                                      style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', width: '100%' }}
                                      title={`View PVA PDF for Stop 0${stopNum}`}
                                    >
                                      📄 View PVA PDF (Stop 0{stopNum})
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => {
                                        const matchedCust = (customers || []).find(c => (v.customerNumber && c.custCode === v.customerNumber) || (v.mobile && c.mobile === v.mobile) || (v.customerName && c.custName === v.customerName));
                                        const matchedPlanObj = matchedPlan || {
                                          visitPlanId: v.visitId || 'SRM-VP-2026-000001',
                                          visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                                          customerName: v.customerName || matchedCust?.custName || 'Customer',
                                          customerNumber: v.customerNumber || matchedCust?.custCode || 'SRM-CUS-2026-000185',
                                          mobile: v.mobile || matchedCust?.mobile || '+91 98490 12345',
                                          email: v.email || matchedCust?.email || 'customer@gmail.com',
                                          assignedExecutive: v.assignedExecutive || 'Punita Roy',
                                          visitDate: v.visitDate || '2026-08-22',
                                          visitTime: v.visitTime || '10:00 AM',
                                          stops: stopsList
                                        };
                                        const targetStop = {
                                          stopId: stopItem.stopId || `SRM-VSTOP-2026-00000${stopNum}`,
                                          costSheetId: stopItem.costSheetId || v.costSheetId || 'SRM-CS-2026-000145',
                                          propertyCode: stopItem.propertyCode || cleanPropCode,
                                          propertyTitle: stopItem.propertyTitle || cleanPropTitle,
                                          locality: stopItem.locality || cleanLocality,
                                          developer: stopItem.developer || matchedProp?.developerName || matchedProp?.developer || 'Dhriti Builders & Developers',
                                          latitude: stopItem.latitude || lat,
                                          longitude: stopItem.longitude || lng,
                                          status: stopItem.status || 'SCHEDULED'
                                        };
                                        setShowPvaVerificationModal({ open: true, plan: matchedPlanObj, stop: targetStop });
                                      }}
                                      style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', width: '100%' }}
                                      title={`Verify OTP for Stop 0${stopNum}`}
                                    >
                                      🔐 Verify OTP (Stop 0{stopNum})
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : isOtpVerified ? (
                            <button 
                              onClick={() => {
                                const activePva = matchingPva || {
                                  projectVisitAgreementId: displayPvaId,
                                  visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                                  customerId: v.customerNumber || 'SRM-CUS-2026-000188',
                                  customerName: v.customerName || 'Rishita sharma',
                                  customerMobile: v.mobile || '8876597975',
                                  propertyId: cleanPropCode,
                                  projectTitle: cleanPropTitle,
                                  locality: cleanLocality,
                                  developerName: matchedProp?.developerName || matchedProp?.developer || 'Dhriti Builders & Developers',
                                  salesPersonName: v.assignedExecutive || 'Punita Roy',
                                  visitDate: v.visitDate || '2026-08-22',
                                  protectionStartDate: v.visitDate || '2026-08-22',
                                  protectionEndDate: '2027-02-22',
                                  customerOtpStatus: 'OTP_VERIFIED',
                                  geofenceStatus: 'GEOFENCE_VERIFIED',
                                  documentUrl: `file:///pva_${displayPvaId}.pdf`
                                };
                                setShowPvaDocumentModal({ open: true, pva: activePva });
                              }}
                              style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                            >
                              📄 View PVA PDF
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const matchedCust = (customers || []).find(c => (v.customerNumber && c.custCode === v.customerNumber) || (v.mobile && c.mobile === v.mobile) || (v.customerName && c.custName === v.customerName));
                                const matchedPlanObj = matchedPlan || {
                                  visitPlanId: v.visitId || 'SRM-VP-2026-000001',
                                  visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                                  customerName: v.customerName || matchedCust?.custName || 'Customer',
                                  customerNumber: v.customerNumber || matchedCust?.custCode || 'SRM-CUS-2026-000185',
                                  mobile: v.mobile || matchedCust?.mobile || '+91 98490 12345',
                                  email: v.email || matchedCust?.email || 'customer@gmail.com',
                                  assignedExecutive: v.assignedExecutive || 'Punita Roy',
                                  visitDate: v.visitDate || '2026-08-22',
                                  visitTime: v.visitTime || '10:00 AM',
                                  stops: [
                                    {
                                      stopId: 'SRM-VSTOP-2026-000001',
                                      costSheetId: v.costSheetId || 'SRM-CS-2026-000145',
                                      propertyCode: cleanPropCode,
                                      propertyTitle: cleanPropTitle,
                                      locality: cleanLocality,
                                      developer: matchedProp?.developerName || matchedProp?.developer || 'Dhriti Builders & Developers',
                                      latitude: lat,
                                      longitude: lng,
                                      status: 'SCHEDULED'
                                    }
                                  ]
                                };
                                const targetStop = (matchedPlanObj.stops && matchedPlanObj.stops[0]) ? matchedPlanObj.stops[0] : {
                                  stopId: 'SRM-VSTOP-2026-000001',
                                  costSheetId: v.costSheetId || 'SRM-CS-2026-000145',
                                  propertyCode: cleanPropCode,
                                  propertyTitle: cleanPropTitle,
                                  locality: cleanLocality,
                                  developer: matchedProp?.developerName || matchedProp?.developer || 'Dhriti Builders & Developers',
                                  latitude: lat,
                                  longitude: lng,
                                  status: 'SCHEDULED'
                                };
                                setShowPvaVerificationModal({ open: true, plan: matchedPlanObj, stop: targetStop });
                              }} 
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem' }}
                            >
                              🔐 Verify OTP Now
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (handleOpenFeedbackModal) {
                                handleOpenFeedbackModal({
                                  ...v,
                                  propertyTitle: cleanPropTitle,
                                  propertyCode: cleanPropCode,
                                  locality: cleanLocality
                                });
                              } else {
                                setShowLogSalesFeedbackModal(true);
                              }
                            }} 
                            style={{ background: '#fbbf24', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                            title="Log Customer 5-Star Feedback"
                          >
                            ⭐ Feedback
                          </button>
                          <button 
                            onClick={() => {
                              setUpdateReqForm({
                                budget_min: '₹50 Lakhs',
                                budget_max: '₹1.5 Crores',
                                preferredArea: cleanPropTitle || 'Barasat, Kolkata',
                                configuration: '3BHK',
                                dislike_reason: 'Over Budget',
                                remarks: ''
                              });
                              setShowUpdateRequirementModal({ 
                                open: true, 
                                customer: { 
                                  custName: v.customerName || 'Customer', 
                                  custCode: v.customerNumber || v.mobile || 'SRM-CUS-2026', 
                                  mobile: v.mobile || v.customerNumber, 
                                  propertyCode: v.propertyCode || v.propCode || 'SRM-PROP-2026-000426'
                                } 
                              });
                            }}
                            style={{ background: '#eab308', color: '#0f172a', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Update buyer preferences & requirements on-the-spot"
                          >
                            ✏️ Update Requirement
                          </button>
                          <button 
                            onClick={() => {
                              const mob = v.mobile || v.customerNumber || '';
                              const cleanMob = mob.replace(/\D/g, '');
                              const matchId = v.matchId || v.matchingId || (cleanMob ? `SRM-MAT-2026-${cleanMob.slice(-6)}` : 'SRM-MAT-2026-988588');
                              if (setShowShiftToMatchingModal) {
                                setShowShiftToMatchingModal({
                                  open: true,
                                  item: v,
                                  customerName: v.customerName || 'Customer',
                                  customerNumber: v.customerNumber || mob || 'SRM-CUS-2026',
                                  mobile: mob,
                                  matchId: matchId,
                                  propertyTitle: cleanPropTitle,
                                  note: ''
                                });
                              }
                            }}
                            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: '1px solid #38bdf8', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}
                            title="Shift customer back to Matching Management with a note to explore other property matches"
                          >
                            ⚡ Shift to Matching
                          </button>
                          <button 
                            onClick={() => {
                              const generatedBookingCode = (v.visitId && v.visitId.includes('SRM-VS-')) 
                                ? v.visitId.replace('SRM-VS-', 'SRM-BKG-') 
                                : `SRM-BKG-2026-0000${(bookings?.length || 0) + 88}`;
                              
                              const newBookingObj = {
                                id: `bkg-${Date.now()}`,
                                booking_code: generatedBookingCode,
                                booking_date: new Date().toISOString().split('T')[0],
                                customer_name: v.customerName || 'Bishwajit Pandey',
                                customer_mobile: v.mobile || '9432328947',
                                customer_number: v.customerNumber || 'SRM-CUS-2026-000188',
                                project_name: v.propertyTitle || 'TILOTTAMA APPARTMENT',
                                developer_name: 'Swaramayi Partner Developer',
                                tower_unit: 'Block A - Unit 302',
                                agreement_value: '₹51,14,880',
                                token_amount: 100000,
                                payment_mode: 'UPI / Online Bank Transfer',
                                payment_ref: `TXN-SRM-${Math.floor(100000 + Math.random() * 900000)}`,
                                brokerage_rate: '2.0%',
                                brokerage_amount: 102297,
                                approval_status: 'APPROVED_LOCKED',
                                sales_executive: v.assignedExecutive || 'Punita Roy (Sales Exec)'
                              };

                              const updatedBookings = [newBookingObj, ...(bookings || [])];
                              const updatedVisits = (scheduledVisits || []).filter((sv: any) => 
                                sv.visitId !== v.visitId && 
                                sv.costSheetId !== v.costSheetId && 
                                (!v.id || sv.id !== v.id)
                              );
                              const updatedPlans = (visitPlans || []).filter((plan: any) => 
                                plan.visitScheduleId !== v.visitId && 
                                plan.visitPlanId !== v.visitId && 
                                (!v.id || plan.id !== v.id)
                              );

                              if (setBookings) {
                                setBookings(updatedBookings);
                              }
                              try {
                                localStorage.setItem('swaramayi_bookings_v3_clean', JSON.stringify(updatedBookings));
                              } catch (e) {}

                              let updatedProps: any[] = [];
                              if (setProperties && properties.length > 0) {
                                updatedProps = properties.map((p: any) => {
                                  const pTitle = (p.title || p.project_name || '').toString().toLowerCase();
                                  const vTitle = (v.propertyTitle || v.project_name || '').toString().toLowerCase();
                                  if (pTitle && vTitle && (pTitle.includes(vTitle) || vTitle.includes(pTitle))) {
                                    return { ...p, status: 'BOOKED' };
                                  }
                                  return p;
                                });
                                setProperties(updatedProps);
                                try {
                                  localStorage.setItem('swaramayi_properties_v4_clean', JSON.stringify(updatedProps));
                                } catch (e) {}
                              }

                              if (setScheduledVisits) {
                                setScheduledVisits(updatedVisits);
                              }
                              try {
                                localStorage.setItem('swaramayi_scheduled_visits_v4_clean', JSON.stringify(updatedVisits));
                              } catch (e) {}

                              if (setVisitPlans) {
                                setVisitPlans(updatedPlans);
                              }
                              try {
                                localStorage.setItem('swaramayi_visit_plans_v4_clean', JSON.stringify(updatedPlans));
                              } catch (e) {}

                              if (syncAllToMongoDB) {
                                syncAllToMongoDB({
                                  bookings: updatedBookings,
                                  site_visits: updatedVisits,
                                  properties: updatedProps.length > 0 ? updatedProps : undefined
                                });
                              }

                              setActiveTab('booking_management');
                              if (setActiveBookingSubTab) {
                                setActiveBookingSubTab('all_bookings');
                              }
                              alert(`🏢 BOOKING CREATED SUCCESSFULLY!\n\nGenerated Booking Code: ${generatedBookingCode}\nCustomer: ${v.customerName || 'Bishwajit Pandey'}\nProperty: ${v.propertyTitle || 'TILOTTAMA APPARTMENT'}\n\nRecord removed from Visit Management and permanently transferred to Booking Management.`);
                            }}
                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Convert visit into Booking Code, remove from Visit Management and transfer to Booking Management"
                          >
                            🏢 Booking
                          </button>

                          {isSuperAdmin && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Scheduled Visit record ${v.visitId || v.costSheetId || 'this visit'} for ${v.customerName || 'Customer'}? It will be moved to Recycle Bin.`)) {
                                  if (onRecycleItem) {
                                    onRecycleItem({
                                      id: v.visitId || v.costSheetId || `VIS-${Date.now()}`,
                                      title: `Site Visit - ${v.customerName || 'Client'} (${v.visitId || v.costSheetId})`,
                                      category: 'Visit Management',
                                      originalLocation: 'Scheduled Site Visits Vault',
                                      details: `Property: ${v.propertyTitle || 'N/A'}, Date: ${v.visitDate || 'N/A'}`,
                                      originalData: v
                                    });
                                  }
                                  const updatedVisits = (scheduledVisits || []).filter((sv: any) => 
                                    sv.visitId !== v.visitId && 
                                    sv.costSheetId !== v.costSheetId && 
                                    (!v.id || sv.id !== v.id) &&
                                    (!v.visitId || sv.visitId !== v.visitId) &&
                                    (!v.costSheetId || sv.costSheetId !== v.costSheetId)
                                  );
                                  const updatedPlans = (visitPlans || []).filter((plan: any) => 
                                    plan.visitScheduleId !== v.visitId && 
                                    plan.visitPlanId !== v.visitId && 
                                    (!v.id || plan.id !== v.id) &&
                                    (!v.visitId || (plan.visitScheduleId !== v.visitId && plan.visitPlanId !== v.visitId))
                                  );

                                  if (setScheduledVisits) {
                                    setScheduledVisits(updatedVisits);
                                  }
                                  try {
                                    localStorage.setItem('swaramayi_scheduled_visits_v4_clean', JSON.stringify(updatedVisits));
                                  } catch (e) {}

                                  if (setVisitPlans) {
                                    setVisitPlans(updatedPlans);
                                  }
                                  try {
                                    localStorage.setItem('swaramayi_visit_plans_v4_clean', JSON.stringify(updatedPlans));
                                  } catch (e) {}

                                  if (syncAllToMongoDB) {
                                    syncAllToMongoDB({
                                      site_visits: updatedVisits
                                    });
                                  }

                                  alert(`🗑️ Scheduled Visit record ${v.visitId || v.costSheetId || ''} moved to Recycle Bin.`);
                                }
                              }}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                              title="Super Admin Only: Permanently delete this scheduled site visit record from database"
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
    );
    })()}

    {/* SUB-TAB 3: OTP & GEOFENCE CHECK-IN CONTROL CENTER */}
    {activeVisitSubTab === 'visit_otp_checkin' && (() => {
      const filteredVisits = unifiedVisits.filter(v => matchesSearchQuery(v, searchQuery));
      const verifiedVisits = unifiedVisits.filter(v => {
        const pva = getPvaMatch(v);
        return !!pva || v.status === 'OTP_VERIFIED' || v.status === 'COMPLETED' || (v.stops && v.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'));
      });
      const pendingVisits = unifiedVisits.filter(v => {
        const pva = getPvaMatch(v);
        return !pva && v.status !== 'OTP_VERIFIED' && v.status !== 'COMPLETED' && (!v.stops || !v.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'));
      });

      return (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 640 ? '12px' : '16px', padding: windowWidth <= 640 ? '14px' : '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1.05rem' : '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                🔐 6-DIGIT MOBILE OTP & GPS GEOFENCE VERIFICATION CONTROL CENTER
              </h3>
              <p style={{ fontSize: windowWidth <= 640 ? '0.74rem' : '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                Real-time tracking of pending vs completed customer OTP verifications and Project Visit Agreements (PVA)
              </p>
            </div>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '900' }}>
              ● 5-MINUTE OTP TIMER & GEOFENCE ACTIVE
            </span>
          </div>

          {/* SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', gap: windowWidth <= 640 ? '10px' : '14px' }}>
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: windowWidth <= 640 ? '12px' : '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>TOTAL SCHEDULED VISITS</span>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1.3rem' : '1.5rem', fontWeight: '900', color: '#38bdf8', marginTop: '4px', margin: 0 }}>{unifiedVisits.length} Visits</h3>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: windowWidth <= 640 ? '12px' : '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800' }}>⏳ PENDING OTP VERIFICATION</span>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1.3rem' : '1.5rem', fontWeight: '900', color: '#fbbf24', marginTop: '4px', margin: 0 }}>{pendingVisits.length} Visits Pending</h3>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', padding: windowWidth <= 640 ? '12px' : '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '800' }}>✅ OTP VERIFIED (PVA GENERATED)</span>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1.3rem' : '1.5rem', fontWeight: '900', color: '#4ade80', marginTop: '4px', margin: 0 }}>{verifiedVisits.length} Visits Verified</h3>
            </div>
          </div>

          {/* LIVE OTP VERIFICATION REGISTER TABLE */}
          {filteredVisits.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px dashed #ef4444' }}>
              <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', fontSize: '1.05rem' }}>📭 NO SCHEDULED VISITS FOUND FOR OTP VERIFICATION</h4>
              <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                Schedule a site visit from Cost Sheet Sharing or Route Planner to trigger OTP check-in.
              </p>
            </div>
          ) : (
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Visit ID & Date</th>
                    <th style={{ padding: '12px' }}>Customer Name & Contact</th>
                    <th style={{ padding: '12px' }}>Target Property & GPS</th>
                    <th style={{ padding: '12px' }}>OTP Verification Status</th>
                    <th style={{ padding: '12px' }}>Legal PVA Reference</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Verification Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((v: any, idx: number) => {
                    const pvaMatch = getPvaMatch(v);
                    const isVerified = !!pvaMatch || v.status === 'OTP_VERIFIED' || v.status === 'COMPLETED' || (v.stops && v.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'));
                    const fallbackPvaId = (v.stops && v.stops.find((s: any) => s.pvaId)?.pvaId) || 'SRM-PVA-2026-000001';
                    const displayPvaId = pvaMatch?.projectVisitAgreementId || fallbackPvaId;

                    return (
                      <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{v.visitId}</span>
                          <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>📅 {v.visitDate} at {v.visitTime}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{v.customerName}</strong>
                          <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{v.mobile}</span>
                          {v.customerNumber && (
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', display: 'block' }}>{v.customerNumber}</span>
                          )}
                          {(() => {
                            const usedProps = getCustomerUsedPropertyCodes(
                              v.customerNumber || v.customerId,
                              v.customerName || v.name,
                              v.mobile,
                              individualCostSheets
                            );
                            if (usedProps.length === 0) return null;
                            return (
                              <div style={{ marginTop: '4px', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem' }}>
                                <span style={{ color: '#38bdf8', fontWeight: '800' }}>🏢 Cost Sheet Property Codes ({usedProps.length}):</span>
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
                        <td style={{ padding: '12px', minWidth: '260px' }}>
                          {(() => {
                            const stopsList = (v.stops && v.stops.length > 0) ? v.stops : [];
                            if (stopsList.length <= 1) {
                              return (
                                <div>
                                  <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{v.propertyTitle}</strong>
                                  <div style={{ marginTop: '2px', marginBottom: '2px' }}>
                                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block' }}>
                                      🏢 Property Code: {v.propertyCode || v.propCode || 'SRM-PROP-2026-000426'}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>📍 GPS: {v.latitude || '22.722351° N'}, {v.longitude || '88.485484° E'}</span>
                                </div>
                              );
                            }

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #a855f7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', width: 'fit-content' }}>
                                  🚘 MULTI-PROPERTY SCHEDULE ({stopsList.length} STOPS)
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {stopsList.map((stop: any, sIdx: number) => {
                                    const stopNum = stop.stopNum || stop.stopNo || (sIdx + 1);
                                    const csId = stop.costSheetId;
                                    const pTitle = stop.propertyTitle || 'Property Site';
                                    const pCode = stop.propertyCode || v.propertyCode;
                                    const loc = stop.locality || v.locality;
                                    const dev = stop.developer;

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
                                            📍 {loc} {dev ? `• ${dev}` : ''}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isVerified ? (
                            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #22c55e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', display: 'inline-block' }}>
                              ✅ OTP VERIFIED ({displayPvaId})
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', display: 'inline-block' }}>
                              ⏳ OTP VERIFICATION PENDING
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isVerified ? (
                            <div>
                              <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.78rem' }}>{displayPvaId}</span>
                              <br /><span style={{ fontSize: '0.7rem', color: '#4ade80' }}>Protection till {pvaMatch?.protectionEndDate || '2027-02-22'}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>PVA Pending OTP Check-In</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {isVerified ? (
                            <button 
                              onClick={() => {
                                const activePva = pvaMatch || {
                                  projectVisitAgreementId: displayPvaId,
                                  visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                                  customerId: v.customerNumber || 'SRM-CUS-2026-000188',
                                  customerName: v.customerName || 'Rishita sharma',
                                  customerMobile: v.mobile || '8876597975',
                                  propertyId: v.propertyCode || 'SRM-PROP-2026-000426',
                                  projectTitle: v.propertyTitle || 'GAJAPATI APARTMENT',
                                  locality: v.locality || 'Barasat, Kolkata',
                                  developerName: 'Dhriti Builders & Developers',
                                  salesPersonName: v.assignedExecutive || 'Punita Roy',
                                  visitDate: v.visitDate || '2026-08-22',
                                  protectionStartDate: v.visitDate || '2026-08-22',
                                  protectionEndDate: '2027-02-22',
                                  customerOtpStatus: 'OTP_VERIFIED',
                                  geofenceStatus: 'GEOFENCE_VERIFIED',
                                  documentUrl: `file:///pva_${displayPvaId}.pdf`
                                };
                                setShowPvaDocumentModal({ open: true, pva: activePva });
                              }}
                              style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.78rem' }}
                            >
                              📄 View Verified PVA PDF
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const matchedCust = (customers || []).find(c => (v.customerNumber && (c.customer_number === v.customerNumber || c.custCode === v.customerNumber)) || (v.mobile && c.mobile === v.mobile) || (v.customerName && (c.name === v.customerName || c.custName === v.customerName)));
                                const matchedProp = (properties || []).find(p => (v.propertyCode && (p.property_code === v.propertyCode || p.propertyCode === v.propertyCode || p.propCode === v.propertyCode)) || (v.propertyTitle && (p.title === v.propertyTitle || p.propTitle === v.propertyTitle)));
                                const foundPlan = (visitPlans || []).find(p => (v.customerNumber && p.customerNumber === v.customerNumber) || (v.mobile && p.mobile === v.mobile) || (v.visitId && (p.visitPlanId === v.visitId || p.visitScheduleId === v.visitId)));
                                const matchedPlan = foundPlan || {
                                  visitPlanId: v.visitId || 'SRM-VP-2026-000001',
                                  visitScheduleId: v.visitId || 'SRM-VS-2026-000087',
                                  customerName: v.customerName || matchedCust?.name || 'Customer',
                                  customerNumber: v.customerNumber || matchedCust?.customer_number || 'SRM-CUS-2026-000188',
                                  mobile: v.mobile || matchedCust?.mobile || '8876597975',
                                  email: v.email || matchedCust?.email || 'customer@gmail.com',
                                  assignedExecutive: v.assignedExecutive || 'Punita Roy',
                                  visitDate: v.visitDate || '2026-08-22',
                                  visitTime: v.visitTime || '10:00 AM',
                                  stops: [
                                    {
                                      stopId: 'SRM-VSTOP-2026-000001',
                                      costSheetId: v.costSheetId || 'COST-SHEET-2026-000001',
                                      propertyCode: v.propertyCode || matchedProp?.property_code || 'SRM-PROP-2026-000426',
                                      propertyTitle: v.propertyTitle || matchedProp?.title || 'GAJAPATI APARTMENT',
                                      locality: matchedProp?.locality || v.locality || 'Barasat, Kolkata',
                                      developer: matchedProp?.developer || 'Dhriti Builders & Developers',
                                      latitude: matchedProp?.latitude || '22.722351° N',
                                      longitude: matchedProp?.longitude || '88.485484° E',
                                      status: 'SCHEDULED'
                                    }
                                  ]
                                };
                                const targetStop = (matchedPlan.stops && matchedPlan.stops[0]) ? matchedPlan.stops[0] : {
                                  stopId: 'SRM-VSTOP-2026-000001',
                                  costSheetId: v.costSheetId || 'COST-SHEET-2026-000001',
                                  propertyCode: v.propertyCode || matchedProp?.property_code || 'SRM-PROP-2026-000426',
                                  propertyTitle: v.propertyTitle || matchedProp?.title || 'GAJAPATI APARTMENT',
                                  locality: matchedProp?.locality || v.locality || 'Barasat, Kolkata',
                                  developer: matchedProp?.developer || 'Dhriti Builders & Developers',
                                  latitude: matchedProp?.latitude || '22.722351° N',
                                  longitude: matchedProp?.longitude || '88.485484° E',
                                  status: 'SCHEDULED'
                                };
                                setShowPvaVerificationModal({ open: true, plan: matchedPlan, stop: targetStop });
                              }}
                              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.78rem' }}
                            >
                              🔐 Verify 6-Digit OTP Now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    })()}

    {/* SUB-TAB 3: VISIT SATISFACTION, REQUIREMENT UPDATE & ALTERNATIVE PROPERTY RECOMMENDATIONS */}
    {activeVisitSubTab === 'visit_feedback' && (
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ Post-Visit Customer Satisfaction & Alternative Property Recommendation Cockpit
            </h3>
            <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
              Capture customer feedback, track objection reasons, update buyer requirements on-the-spot, and instantly recommend best alternative properties if not satisfied.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                if (handleOpenFeedbackModal) {
                  handleOpenFeedbackModal();
                } else {
                  setShowLogSalesFeedbackModal(true);
                }
              }}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ➕ Log Executive Visit Feedback
            </button>
          </div>
        </div>

        {/* DYNAMIC FEEDBACK LIST / EMPTY STATE */}
        {(!visitFeedbacks || visitFeedbacks.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>⭐</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '0 0 6px 0' }}>
              No Visit Feedback Recorded Yet
            </h4>
            <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', maxWidth: '480px', margin: '0 auto 16px auto' }}>
              Click <strong>"➕ Log Executive Visit Feedback"</strong> above or click <strong>"⭐ Feedback"</strong> on any scheduled site visit in the Visit Scheduler to record 5-star customer feedback.
            </p>
            <button 
              onClick={() => {
                if (handleOpenFeedbackModal) {
                  handleOpenFeedbackModal();
                } else {
                  setShowLogSalesFeedbackModal(true);
                }
              }}
              style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#0f172a', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              ➕ Record First Visit Feedback Now
            </button>
          </div>
        ) : (
          <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Customer & Visit ID</th>
                  <th style={{ padding: '12px' }}>Visited Property</th>
                  <th style={{ padding: '12px' }}>Satisfaction & Rating</th>
                  <th style={{ padding: '12px' }}>Sales Person Feedback & Objection</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Buyer Intent Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Salesperson Actions & Alternatives</th>
                </tr>
              </thead>
              <tbody>
                {visitFeedbacks.map((fb: any, idx: number) => (
                  <tr key={fb.id || idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.9rem' }}>{fb.custName}</strong>
                      {fb.custMobile && <><br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{fb.custMobile}</span></>}
                      <br /><span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{fb.visitId}</span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>🏢 {fb.propTitle}</strong>
                      <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>📍 {fb.locality || 'Kolkata'}</div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ color: '#fbbf24', fontWeight: '900', fontSize: '0.85rem' }}>
                        {'⭐'.repeat(Number(fb.rating) || 5)} ({fb.rating || 5}/5 Stars)
                      </div>
                      <span style={{ fontSize: '0.75rem', color: Number(fb.rating) <= 2 ? '#ef4444' : Number(fb.rating) >= 4 ? '#4ade80' : '#fbbf24', fontWeight: '800' }}>
                        {fb.satisfaction || 'Satisfied'}
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700' }}>
                        "{fb.reason}"
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                        By Exec: {fb.exec || 'Sales Exec'} • {fb.createdAt || 'Just now'}
                      </div>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: (fb.intent || '').includes('HOT') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: (fb.intent || '').includes('HOT') ? '#4ade80' : '#fbbf24', border: `1px solid ${(fb.intent || '').includes('HOT') ? '#22c55e' : '#eab308'}`, padding: '4px 10px', borderRadius: '20px', fontWeight: '900', fontSize: '0.72rem', display: 'inline-block' }}>
                        {fb.intent || 'WARM Lead'}
                      </span>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {Number(fb.rating) <= 3 && (
                          <button 
                            onClick={() => setShowAlternativePropertyModal({ open: true, customer: fb, currentProperty: fb.propTitle })}
                            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Recommend Alternative Matching Properties"
                          >
                            🔄 Recommend Alternatives
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setUpdateReqForm({
                              budget_min: fb.budget_min || '₹50 Lakhs',
                              budget_max: fb.budget_max || '₹1.5 Crores',
                              preferredArea: fb.locality || fb.propTitle || 'Barasat, Kolkata',
                              configuration: fb.configuration || '2BHK / 3BHK',
                              dislike_reason: fb.reason || 'Over Budget',
                              remarks: fb.reason || ''
                            });
                            setShowUpdateRequirementModal({ 
                              open: true, 
                              customer: { 
                                custName: fb.custName || 'Customer', 
                                custCode: fb.custCode || fb.custMobile || 'SRM-CUS-2026', 
                                mobile: fb.custMobile, 
                                prefArea: fb.locality || fb.propTitle || 'Barasat, Kolkata' 
                              } 
                            });
                          }} 
                          style={{ background: '#334155', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                          title="Update customer requirements on-the-spot"
                        >
                          📝 Update Requirement
                        </button>
                        {isStrictSuperAdmin && handleDeleteFeedback && (
                          <button 
                            onClick={() => handleDeleteFeedback(fb.id)} 
                            style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                            title="Delete Feedback Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {/* SUB-TAB 4: VISIT ANALYTICS */}
    {activeVisitSubTab === 'visit_analytics' && (() => {
      // 1. Dynamic Filtering
      const filteredVisits = unifiedVisits.filter((v: any) => {
        if (analyticsExecFilter !== 'ALL' && (v.assignedExecutive || v.assignedFieldExecutive || v.exec) !== analyticsExecFilter) {
          return false;
        }
        if (analyticsTimeFilter === 'TODAY') {
          const todayStr = new Date().toISOString().split('T')[0];
          const todayIndian = new Date().toLocaleDateString('en-GB');
          return (v.visitDate && (v.visitDate.includes(todayStr) || v.visitDate.includes(todayIndian)));
        }
        return true;
      });

      const totalVisitsCount = filteredVisits.length;

      // 2. Completed & Verified Visits
      const completedVisits = filteredVisits.filter((v: any) => 
        !!getPvaMatch(v) ||
        v.status === 'VISIT_DONE' || 
        v.status === 'OTP_VERIFIED' || 
        v.status === 'VERIFIED_CHECKIN' || 
        v.status === 'COMPLETED' ||
        v.otpVerified === true || 
        v.checkedIn === true ||
        v.feedback === true ||
        (v.stops && v.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'))
      );
      const completedCount = completedVisits.length;
      const completedPercent = totalVisitsCount > 0 ? Math.min(100, Number(((completedCount / totalVisitsCount) * 100).toFixed(1))).toFixed(1) : '0.0';

      // 3. Relevant Feedbacks with Mutually Exclusive Categorization
      const relevantFeedbacks = (visitFeedbacks || []).filter((fb: any) => {
        if (analyticsExecFilter !== 'ALL' && fb.exec !== analyticsExecFilter) return false;
        return true;
      });

      const getFeedbackSentiment = (fb: any): 'HOT' | 'WARM' | 'COLD' => {
        const intent = (fb.intent || fb.buyerIntent || '').toString().toUpperCase();
        const satisfaction = (fb.satisfaction || '').toString().toLowerCase();
        const rating = Number(fb.rating || fb.feedbackRating) || 0;

        if (intent.includes('HOT') || satisfaction.includes('highly satisfied')) {
          return 'HOT';
        }
        if (intent.includes('COLD') || intent.includes('DROP') || intent.includes('NOT INTERESTED') || satisfaction.includes('dissatisfied') || satisfaction.includes('budget gap')) {
          return 'COLD';
        }
        if (intent.includes('WARM') || intent.includes('COMPARING') || satisfaction.includes('moderately satisfied')) {
          return 'WARM';
        }
        if (rating >= 4) return 'HOT';
        if (rating === 3) return 'WARM';
        if (rating > 0 && rating <= 2) return 'COLD';
        return 'WARM';
      };

      const hotFeedbackCount = relevantFeedbacks.filter((fb: any) => getFeedbackSentiment(fb) === 'HOT').length;
      const warmFeedbackCount = relevantFeedbacks.filter((fb: any) => getFeedbackSentiment(fb) === 'WARM').length;
      const coldDropCount = relevantFeedbacks.filter((fb: any) => getFeedbackSentiment(fb) === 'COLD').length;

      const totalInterestedCount = relevantFeedbacks.length > 0
        ? (hotFeedbackCount + warmFeedbackCount)
        : Math.min(
            totalVisitsCount,
            filteredVisits.filter((v: any) => {
              const r = Number(v.feedbackRating) || 0;
              const int = (v.buyerIntent || '').toString().toUpperCase();
              return r >= 3 || int.includes('HOT') || int.includes('WARM');
            }).length
          );

      // 4. Active Negotiations in Pipeline
      const negotiatingCount = (customers || []).filter((c: any) => 
        c.stage === 'Negotiation' || 
        c.stage === 'Token Pending' || 
        c.status === 'Negotiation' ||
        (c.notes && c.notes.toLowerCase().includes('negotiation'))
      ).length || (totalInterestedCount > 0 ? Math.min(totalInterestedCount, totalVisitsCount) : 0);

      // 5. Bookings & Brokerage
      const filteredBookings = (bookings || []).filter((b: any) => {
        if (analyticsExecFilter !== 'ALL' && (b.sales_executive || b.exec || b.executive) !== analyticsExecFilter) return false;
        return true;
      });
      const confirmedBookingsCount = filteredBookings.length;
      const conversionRate = totalVisitsCount > 0 
        ? ((confirmedBookingsCount / totalVisitsCount) * 100).toFixed(1) 
        : (confirmedBookingsCount > 0 ? '100.0' : '0.0');

      const totalBrokerageVal = filteredBookings.reduce((sum: number, b: any) => {
        const num = typeof b.brokerage_amount === 'number' ? b.brokerage_amount : parseFloat(String(b.brokerage_amount || b.commission_amount || 0).replace(/[^0-9.]/g, '')) || 0;
        return sum + num;
      }, 0);

      const avgRatingVal = relevantFeedbacks.length > 0 
        ? (relevantFeedbacks.reduce((acc: number, fb: any) => acc + (Number(fb.rating) || 5), 0) / relevantFeedbacks.length).toFixed(1)
        : (totalVisitsCount > 0 ? '4.8' : '5.0');

      // 6. Unique Execs for Filter & Leaderboard
      const allExecNames = Array.from(new Set([
        ...assignedAdvisors.map(a => a.name),
        ...unifiedVisits.map((v: any) => v.assignedExecutive || v.assignedFieldExecutive || v.exec).filter(Boolean),
        ...(visitFeedbacks || []).map((fb: any) => fb.exec).filter(Boolean),
        ...(bookings || []).map((b: any) => b.sales_executive || b.exec || b.executive).filter(Boolean)
      ]));

      // Executive Leaderboard
      const execLeaderboard = allExecNames.map((execName: string) => {
        const execVisits = unifiedVisits.filter((v: any) => (v.assignedExecutive || v.assignedFieldExecutive || v.exec) === execName);
        const vCount = execVisits.length;
        const execCompleted = execVisits.filter((v: any) => 
          !!getPvaMatch(v) ||
          v.status === 'VISIT_DONE' || 
          v.status === 'OTP_VERIFIED' || 
          v.status === 'VERIFIED_CHECKIN' || 
          v.status === 'COMPLETED' ||
          v.otpVerified === true || 
          v.checkedIn === true || 
          v.feedback === true ||
          (v.stops && v.stops.some((s: any) => s.otpVerified || s.status === 'VISIT_COMPLETED'))
        ).length;
        const execFbs = (visitFeedbacks || []).filter((fb: any) => fb.exec === execName);
        const fbCount = execFbs.length;
        const avgStars = fbCount > 0 ? (execFbs.reduce((s: number, f: any) => s + (Number(f.rating) || 5), 0) / fbCount).toFixed(1) : (vCount > 0 ? '4.5' : '-');
        const hotLeads = execFbs.filter((f: any) => getFeedbackSentiment(f) === 'HOT').length;
        const execBkgs = (bookings || []).filter((b: any) => (b.sales_executive || b.exec || b.executive) === execName);
        const bkgCount = execBkgs.length;
        const bkgBrokerage = execBkgs.reduce((sum: number, b: any) => sum + (parseFloat(String(b.brokerage_amount || 0).replace(/[^0-9.]/g, '')) || 0), 0);
        const convPct = vCount > 0 ? ((bkgCount / vCount) * 100).toFixed(1) : (bkgCount > 0 ? '100.0' : '0.0');

        return {
          name: execName,
          visits: vCount,
          completed: execCompleted,
          feedbacks: fbCount,
          avgStars,
          hotLeads,
          bookings: bkgCount,
          brokerage: bkgBrokerage,
          convPct
        };
      }).sort((a, b) => (Number(b.bookings) * 100 + Number(b.visits)) - (Number(a.bookings) * 100 + Number(a.visits)));

      // Property Performance
      const allPropTitles = Array.from(new Set([
        ...unifiedVisits.map((v: any) => v.propertyTitle).filter(Boolean),
        ...(properties || []).map((p: any) => p.title || p.name).filter(Boolean)
      ]));

      const propertyStats = allPropTitles.map((propTitle: string) => {
        const propVisits = unifiedVisits.filter((v: any) => v.propertyTitle === propTitle || (v.propertyTitle && v.propertyTitle.includes(propTitle)));
        const vCount = propVisits.length;
        const propFbs = (visitFeedbacks || []).filter((fb: any) => fb.propTitle === propTitle || (fb.propTitle && fb.propTitle.includes(propTitle)));
        const avgStars = propFbs.length > 0 ? (propFbs.reduce((s: number, f: any) => s + (Number(f.rating) || 5), 0) / propFbs.length).toFixed(1) : (vCount > 0 ? '4.7' : '-');
        const hotCount = propFbs.filter((f: any) => getFeedbackSentiment(f) === 'HOT').length;
        const propBkgs = (bookings || []).filter((b: any) => b.property_title === propTitle || b.property === propTitle || (b.unit_name && b.unit_name.includes(propTitle)));
        const bkgCount = propBkgs.length;
        const convPct = vCount > 0 ? ((bkgCount / vCount) * 100).toFixed(1) : (bkgCount > 0 ? '100.0' : '0.0');

        const matchedProp = (properties || []).find((p: any) => (p.title || p.name) === propTitle);
        const locality = matchedProp?.locality || propVisits[0]?.locality || 'Barasat, Kolkata';

        return {
          title: propTitle,
          locality,
          visits: vCount,
          avgStars,
          hotCount,
          bookings: bkgCount,
          convPct
        };
      }).filter(p => p.visits > 0 || p.bookings > 0);

      // Funnel Steps
      const funnelSteps = [
        { label: '1. Site Visits Scheduled', count: totalVisitsCount, pct: 100, color: '#38bdf8', icon: '📅' },
        { label: '2. OTP Check-in Verified', count: completedCount, pct: totalVisitsCount > 0 ? Math.min(100, Math.round((completedCount / totalVisitsCount) * 100)) : 0, color: '#0284c7', icon: '📍' },
        { label: '3. Positive 4-5★ Feedback', count: Math.min(totalVisitsCount, totalInterestedCount), pct: totalVisitsCount > 0 ? Math.min(100, Math.round((Math.min(totalVisitsCount, totalInterestedCount) / totalVisitsCount) * 100)) : 0, color: '#fbbf24', icon: '⭐' },
        { label: '4. Active Negotiations', count: Math.min(totalVisitsCount, negotiatingCount), pct: totalVisitsCount > 0 ? Math.min(100, Math.round((Math.min(totalVisitsCount, negotiatingCount) / totalVisitsCount) * 100)) : 0, color: '#f97316', icon: '🤝' },
        { label: '5. Confirmed Unit Bookings', count: confirmedBookingsCount, pct: totalVisitsCount > 0 ? Math.min(100, Math.round((confirmedBookingsCount / totalVisitsCount) * 100)) : 0, color: '#22c55e', icon: '🏆' }
      ];

      return (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* HEADER & FILTERS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                  📊 SITE VISIT CONVERSION ANALYTICS & EXECUTIVE PERFORMANCE
                </h3>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', border: '1px solid #22c55e' }}>
                  ● LIVE REAL-TIME METRICS
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                End-to-end site visit throughput, OTP check-in completion rates, buyer feedback intent, and closed booking ROI.
              </p>
            </div>

            {/* CONTROLS */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isLight ? '#f8fafc' : '#0f172a', padding: '6px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <Filter size={14} color="#38bdf8" />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>Exec:</span>
                <select 
                  value={analyticsExecFilter} 
                  onChange={(e) => setAnalyticsExecFilter(e.target.value)} 
                  style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.78rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Field Executives</option>
                  {allExecNames.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isLight ? '#f8fafc' : '#0f172a', padding: '6px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                <Calendar size={14} color="#fbbf24" />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>Period:</span>
                <select 
                  value={analyticsTimeFilter} 
                  onChange={(e) => setAnalyticsTimeFilter(e.target.value)} 
                  style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.78rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today's Visits</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5 DYNAMIC METRIC CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: windowWidth <= 640 ? '10px' : '14px' }}>
            
            {/* CARD 1: TOTAL VISITS */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Total Site Visits</span>
                <span style={{ fontSize: '1.2rem' }}>🚗</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#38bdf8', fontWeight: '900', margin: 0 }}>
                {totalVisitsCount} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>Visits</span>
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>● {unifiedVisits.length} total scheduled</span>
              </div>
            </div>

            {/* CARD 2: OTP VERIFIED / COMPLETED */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>OTP Verified Check-Ins</span>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#0284c7', fontWeight: '900', margin: 0 }}>
                {completedCount} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>Done</span>
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ background: 'rgba(2, 132, 199, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>{completedPercent}% Completion Rate</span>
              </div>
            </div>

            {/* CARD 3: INTERESTED PROSPECTS */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Interested (Hot/Warm)</span>
                <span style={{ fontSize: '1.2rem' }}>⭐</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#fbbf24', fontWeight: '900', margin: 0 }}>
                {totalInterestedCount} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>Leads</span>
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⭐ {avgRatingVal}/5 Avg Customer Score</span>
              </div>
            </div>

            {/* CARD 4: ACTIVE NEGOTIATIONS */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Active Negotiations</span>
                <span style={{ fontSize: '1.2rem' }}>🤝</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#f97316', fontWeight: '900', margin: 0 }}>
                {negotiatingCount} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>Deals</span>
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚡ High Booking Probability</span>
              </div>
            </div>

            {/* CARD 5: CONFIRMED BOOKINGS */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Confirmed Bookings</span>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#22c55e', fontWeight: '900', margin: 0 }}>
                {confirmedBookingsCount} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>({conversionRate}%)</span>
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  ₹{(totalBrokerageVal / 100000).toFixed(2)}L Brokerage
                </span>
              </div>
            </div>

          </div>

          {/* CONVERSION FUNNEL & SENTIMENT GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 1024 ? '1fr' : '1.3fr 1fr', gap: '16px' }}>
            
            {/* 1. END-TO-END CONVERSION FUNNEL */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} color="#38bdf8" /> 5-STAGE SITE VISIT TO BOOKING CONVERSION FUNNEL
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '800' }}>Overall Conversion: {conversionRate}%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {funnelSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#334155' : '#cbd5e1' }}>
                      <span>{step.icon} {step.label}</span>
                      <strong style={{ color: step.color }}>{step.count} ({step.pct}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: isLight ? '#e2e8f0' : '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.max(step.count > 0 ? 8 : 0, step.pct))}%`, height: '100%', background: step.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CUSTOMER FEEDBACK SENTIMENT & BUYER INTENT DISTRIBUTION */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#fbbf24" /> POST-VISIT FEEDBACK SENTIMENT BREAKDOWN
                </h4>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>{relevantFeedbacks.length} Audited Reviews</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🔥</div>
                  <strong style={{ fontSize: '1.2rem', color: '#4ade80', display: 'block', fontWeight: '900' }}>{hotFeedbackCount}</strong>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>HOT Booking Leads</span>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #eab308', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>⚡</div>
                  <strong style={{ fontSize: '1.2rem', color: '#fbbf24', display: 'block', fontWeight: '900' }}>{warmFeedbackCount}</strong>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>WARM / Comparing</span>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>❄️</div>
                  <strong style={{ fontSize: '1.2rem', color: '#38bdf8', display: 'block', fontWeight: '900' }}>{coldDropCount}</strong>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>COLD / Budget Gap</span>
                </div>

                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #a855f7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>⭐</div>
                  <strong style={{ fontSize: '1.2rem', color: '#c084fc', display: 'block', fontWeight: '900' }}>{avgRatingVal} / 5.0</strong>
                  <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>Average Rating</span>
                </div>

              </div>

              <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>Need to log more customer reviews?</span>
                <button 
                  onClick={() => {
                    if (handleOpenFeedbackModal) {
                      handleOpenFeedbackModal();
                    } else {
                      setShowLogSalesFeedbackModal(true);
                    }
                  }}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  ➕ Log Feedback
                </button>
              </div>
            </div>

          </div>

          {/* 3. EXECUTIVE SITE VISIT CONVERSION LEADERBOARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} color="#fbbf24" /> FIELD SALES EXECUTIVE CONVERSION LEADERBOARD
              </h4>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>Ranked by Closed Bookings & Visit Throughput</span>
            </div>

            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>Rank & Field Executive</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Visits Assigned</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>OTP Check-In %</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Avg Rating</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Hot Leads</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Bookings Closed</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Conversion %</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Brokerage Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {execLeaderboard.map((exec, idx) => {
                    const completionRate = exec.visits > 0 ? Math.round((exec.completed / exec.visits) * 100) : 0;
                    return (
                      <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : isLight ? '#e2e8f0' : '#334155', color: idx === 0 ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.72rem' }}>
                              {idx + 1}
                            </span>
                            <div>
                              <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem' }}>{exec.name}</strong>
                              {idx === 0 && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#fbbf24', fontWeight: '800' }}>👑 TOP PERFORMER</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', color: '#38bdf8' }}>{exec.visits}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ background: completionRate >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: completionRate >= 80 ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', fontSize: '0.72rem' }}>
                            {completionRate}% ({exec.completed}/{exec.visits})
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#fbbf24', fontWeight: '800' }}>
                          {exec.avgStars !== '-' ? `⭐ ${exec.avgStars}` : '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#4ade80', fontWeight: '800' }}>{exec.hotLeads}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <strong style={{ color: '#22c55e', fontSize: '0.9rem' }}>{exec.bookings}</strong>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <strong style={{ color: Number(exec.convPct) >= 10 ? '#4ade80' : isLight ? '#0f172a' : '#ffffff' }}>
                            {exec.convPct}%
                          </strong>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: '#4ade80' }}>
                          ₹{(exec.brokerage / 100000).toFixed(2)}L
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. PROJECT / PROPERTY VISIT CONVERSION MATRIX */}
          {propertyStats.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={18} color="#38bdf8" /> PROJECT-WISE VISIT CONVERSION PERFORMANCE
                </h4>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>Tracking {propertyStats.length} Active Visited Projects</span>
              </div>

              <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                      <th style={{ padding: '10px' }}>Project / Property Title</th>
                      <th style={{ padding: '10px' }}>Locality</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Visits Conducted</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Avg Customer Rating</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Hot Leads</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Confirmed Bookings</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Conversion Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyStats.map((prop, idx) => (
                      <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                        <td style={{ padding: '10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                          🏢 {prop.title}
                        </td>
                        <td style={{ padding: '10px', color: isLight ? '#64748b' : '#94a3b8' }}>
                          📍 {prop.locality}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', color: '#38bdf8' }}>
                          {prop.visits}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#fbbf24', fontWeight: '800' }}>
                          {prop.avgStars !== '-' ? `⭐ ${prop.avgStars}` : '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#4ade80', fontWeight: '800' }}>
                          {prop.hotCount}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <strong style={{ color: '#22c55e', fontSize: '0.9rem' }}>{prop.bookings}</strong>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ background: Number(prop.convPct) > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: Number(prop.convPct) > 0 ? '#4ade80' : '#94a3b8', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', fontSize: '0.72rem' }}>
                            {prop.convPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      );
    })()}

    {/* SUB-TAB 6: OWNER LIVE ROUTE TRACKING */}
    {activeVisitSubTab === 'visit_owner_tracking' && (
      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>👑 OWNER LIVE ROUTE TRACKING & FIELD EXEC AUDIT MONITOR</h3>
            <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>Real-time GPS route progress, delay detection, and route deviation monitoring</p>
          </div>
          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontWeight: '900', fontSize: '0.78rem', border: '1px solid #22c55e' }}>
            ● LIVE MONITORING ACTIVE ({visitPlans.length} ACTIVE ROUTES)
          </span>
        </div>

        <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                <th style={{ padding: '12px' }}>Visit Plan ID</th>
                <th style={{ padding: '12px' }}>Sales Executive</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Stops Progress</th>
                <th style={{ padding: '12px' }}>Current Stop</th>
                <th style={{ padding: '12px' }}>Next Stop</th>
                <th style={{ padding: '12px' }}>Route Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Live Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitPlans.map((plan: any) => {
                const completedStops = plan.stops.filter((s: any) => s.status === 'VISIT_COMPLETED').length;
                const currentStop = plan.stops[plan.currentStopIndex] || plan.stops[0];
                const nextStop = plan.stops[plan.currentStopIndex + 1] || null;

                return (
                  <tr key={plan.visitPlanId} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>
                      {plan.visitPlanId}
                      <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{plan.visitDate}</span>
                    </td>
                    <td style={{ padding: '12px', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900' }}>
                      {plan.assignedExecutive}
                      <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{plan.assignedExecutivePhone}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{plan.customerName}</strong>
                      <br /><span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{plan.customerNumber}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '0.8rem' }}>
                        {completedStops} / {plan.stops.length} Stops ({Math.round((completedStops / plan.stops.length) * 100)}%)
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#fbbf24', fontWeight: '800' }}>
                      {currentStop?.propertyTitle || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: isLight ? '#64748b' : '#94a3b8' }}>
                      {nextStop?.propertyTitle || 'Drop Off'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '0.75rem' }}>
                        {plan.delayStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setShowLiveRouteTrackingModal({ open: true, plan })} 
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                      >
                        👁️ Live Audit Track
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* SUB-TAB 7: ADVISOR RATINGS & CUSTOMER FEEDBACK LINK GENERATOR */}
    {activeVisitSubTab === 'advisor_ratings' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* HEADER BANNER & ACTION BAR */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ background: '#f59e0b', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>★ LIVE ADVISOR REPUTATION ENGINE</span>
              <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.78rem', fontWeight: '700' }}>• Real-Time Website & CRM Rating Sync</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>⭐ PROPERTY ADVISOR RATINGS & CUSTOMER FEEDBACK SYSTEM</h3>
            <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
              Monitor 5-star advisor ratings, track review conversion rates, and send direct rating submission links to home-buyers via WhatsApp & SMS.
            </p>
          </div>

          <button
            onClick={() => {
              setShowSendAdvisorRatingModal(true);
              setCopiedRatingLinkSuccess(false);
              setRatingNotificationMsg('');
            }}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} /> 📩 Send Customer Advisor Rating Link
          </button>
        </div>

        {ratingNotificationMsg && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '12px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> {ratingNotificationMsg}
          </div>
        )}

        {/* METRICS SUMMARY GRID */}
        {(() => {
          const totalInvitesSent = allRatingLogs.length;
          const ratedInvites = allRatingLogs.filter((i: any) => i.rating !== null && i.rating !== undefined && !isNaN(Number(i.rating)));
          const responseRateStr = totalInvitesSent > 0 ? `${((ratedInvites.length / totalInvitesSent) * 100).toFixed(1)}% Response Rate` : '100% System Active';
          const avgTeamRatingStr = ratedInvites.length > 0 
            ? `★ ${(ratedInvites.reduce((sum: number, i: any) => sum + Number(i.rating), 0) / ratedInvites.length).toFixed(1)} / 5.0`
            : '★ 0.0 / 5.0';

          const advScores: Record<string, { total: number; count: number }> = {};
          allRatingLogs.forEach((inv: any) => {
            if (inv.advisorName && inv.rating !== null && inv.rating !== undefined && !isNaN(Number(inv.rating))) {
              if (!advScores[inv.advisorName]) advScores[inv.advisorName] = { total: 0, count: 0 };
              advScores[inv.advisorName].total += Number(inv.rating);
              advScores[inv.advisorName].count += 1;
            }
          });

          let topAdvName = assignedAdvisors.length > 0 ? assignedAdvisors[0].name : 'No Advisor';
          let topAdvRating = '★ 0.0 Rating';
          let maxAvg = -1;
          Object.keys(advScores).forEach(name => {
            const avg = advScores[name].total / advScores[name].count;
            if (avg > maxAvg) {
              maxAvg = avg;
              topAdvName = name;
              topAdvRating = `★ ${avg.toFixed(1)} Rating`;
            }
          });

          const highRatingsCount = ratedInvites.filter((i: any) => Number(i.rating) >= 4).length;
          const satisfactionPct = ratedInvites.length > 0 ? Math.round((highRatingsCount / ratedInvites.length) * 100) : 100;

          return (
            <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: windowWidth <= 640 ? '10px' : '16px' }}>
              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Overall Team Rating</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star fill="#f59e0b" size={24} /> {avgTeamRatingStr}
                </div>
                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>From {ratedInvites.length} Customer Reviews</div>
              </div>

              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Rating Invites Sent</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38bdf8', marginTop: '6px' }}>{totalInvitesSent} Links</div>
                <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px', fontWeight: '800' }}>{responseRateStr}</div>
              </div>

              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Top Rated Advisor</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '6px' }}>{topAdvName}</div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', fontWeight: '800' }}>{topAdvRating}</div>
              </div>

              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Customer Satisfaction</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#22c55e', marginTop: '6px' }}>{satisfactionPct}%</div>
                <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>Verified High Quality Ratings</div>
              </div>
            </div>
          );
        })()}

        {/* PROPERTY ADVISORS DIRECTORY & DIRECT LINK GENERATOR CARDS */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>👤 ASSIGNED PROPERTY ADVISORS & LIVE RATINGS ({assignedAdvisors.length})</h4>
              <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8' }}>Directly generate and send customer rating submission links for each advisor</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: windowWidth < 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {assignedAdvisors.length === 0 ? (
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px dashed #cbd5e1' : '1px dashed #334155', borderRadius: '14px', padding: '32px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                <div style={{ fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', fontSize: '1rem' }}>No Assigned Property Advisors Yet</div>
                <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                  Assign staff advisors in Role Management to list them here and track live ratings. (0 Advisors)
                </div>
              </div>
            ) : (
              assignedAdvisors.map((adv) => {
                const advInvites = allRatingLogs.filter((i: any) => i.advisorName === adv.name);
                const advRated = advInvites.filter((i: any) => i.rating !== null && i.rating !== undefined && !isNaN(Number(i.rating)));
                const computedRating = advRated.length > 0
                  ? (advRated.reduce((s: number, i: any) => s + Number(i.rating), 0) / advRated.length).toFixed(1)
                  : adv.defaultRating;

                return (
                  <div key={adv.id || adv.name} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={adv.img} alt={adv.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }} />
                      <div>
                        <h5 style={{ fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.95rem' }}>{adv.name}</h5>
                        <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>{adv.role}</div>
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>{adv.phone}</div>
                      </div>
                    </div>

                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', borderRadius: '10px', padding: '10px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8' }}>Advisor Rating</span>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#d97706" color="#d97706" /> ★ {computedRating}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                        <strong>{advInvites.length}</strong> Invites Sent ({advRated.length} Reviews) • Assigned: {adv.properties}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setRatingAdvisorName(adv.name);
                        setShowSendAdvisorRatingModal(true);
                      }}
                      style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                    >
                      <Send size={14} /> Send Rating Link for {adv.name.split(' ')[0]}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT CUSTOMER ADVISOR RATING INVITES & FEEDBACK LOG TABLE */}
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📋 DISPATCHED ADVISOR RATING INVITES & FEEDBACK LOGS</h4>
              <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8' }}>Track customer feedback link delivery status and customer review responses</p>
            </div>
            <button onClick={() => setShowSendAdvisorRatingModal(true)} style={{ background: '#f59e0b', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Send New Link
            </button>
          </div>

          <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                  <th style={{ padding: '12px' }}>Invite ID & Date</th>
                  <th style={{ padding: '12px' }}>Customer Details</th>
                  <th style={{ padding: '12px' }}>Assigned Advisor</th>
                  <th style={{ padding: '12px' }}>Property</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Rating Received</th>
                  <th style={{ padding: '12px' }}>Customer Feedback</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allRatingLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginBottom: '6px' }}>📭 No Dispatched Rating Links Yet</div>
                      <div style={{ fontSize: '0.8rem' }}>Click <strong>"Send Customer Advisor Rating Link"</strong> above to generate and send your first rating link to a customer.</div>
                    </td>
                  </tr>
                ) : (
                  allRatingLogs.map((item) => (
                    <tr key={item.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>
                        {item.id}
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{item.date}</span>
                      </td>
                      <td style={{ padding: '12px', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900' }}>
                        {item.customerName || 'Home Buyer'}
                        <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{item.customerMobile || item.customerPhone || '+91 98300 12345'}</span>
                      </td>
                      <td style={{ padding: '12px', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800' }}>
                        {item.advisorName || 'Punita Roy'}
                      </td>
                      <td style={{ padding: '12px', color: isLight ? '#64748b' : '#94a3b8' }}>
                        {item.propertyTitle || 'GAJAPATI APARTMENT'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {item.rating !== null && item.rating !== undefined ? (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontWeight: '900', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={12} fill="#d97706" color="#d97706" /> ★ {item.rating} / 5
                          </span>
                        ) : (
                          <span style={{ color: isLight ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontStyle: 'italic' }}>Pending Rating</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.78rem', color: isLight ? '#475569' : '#cbd5e1', maxWidth: '240px' }}>
                        {item.feedbackText || item.comment || 'No comment provided'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {(() => {
                          const isRated = (item.rating !== null && item.rating !== undefined) || String(item.status).includes('RATED') || item.status === 'VERIFIED_AND_RATED';
                          return (
                            <span style={{
                              background: isRated ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: isRated ? '#4ade80' : '#38bdf8',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: '900',
                              fontSize: '0.72rem'
                            }}>
                              {isRated ? `✓ Rated (★ ${item.rating || 5}.0)` : `⚡ Sent via ${item.deliveryChannel || item.channel || 'WHATSAPP'}`}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setRatingAdvisorName(item.advisorName);
                              setRatingCustomerName(item.customerName);
                              setRatingCustomerMobile(item.customerMobile);
                              setShowSendAdvisorRatingModal(true);
                            }}
                            style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: '1px solid #0284c7', color: '#38bdf8', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem' }}
                          >
                            🔄 Resend Link
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete rating invite record (${item.id}) for customer "${item.customerName}"?`)) {
                                  const host = window.location.hostname || 'localhost';
                                  try {
                                    await fetch(`http://${host}:5000/api/public/advisor-rating/${item.id}`, { method: 'DELETE' });
                                  } catch (e) {
                                    try {
                                      await fetch(`/api/public/advisor-rating/${item.id}`, { method: 'DELETE' });
                                    } catch (e2) {}
                                  }
                                  setRatingInvitesList((prev: any[]) => prev.filter((i: any) => 
                                    i.id !== item.id && 
                                    i._id !== item.id && 
                                    String(i.customerName || '').toLowerCase() !== String(item.customerName || '').toLowerCase()
                                  ));
                                  alert(`🗑️ Rating invite for customer "${item.customerName}" deleted successfully.`);
                                }
                              }}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Delete Rating Invite Record (Super Admin Only)"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* MODAL: SEND CUSTOMER ADVISOR RATING LINK */}
    {showSendAdvisorRatingModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '20px', width: '100%', maxWidth: '580px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#f59e0b', color: '#ffffff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>📩 Send Customer Advisor Rating Link</h3>
                <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8' }}>Generate and dispatch direct customer rating link for property advisor</p>
              </div>
            </div>
            <button
              onClick={() => setShowSendAdvisorRatingModal(false)}
              style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', fontWeight: '900' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                1. Select Property Advisor *
              </label>
              <select
                value={ratingAdvisorName}
                onChange={(e) => setRatingAdvisorName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', fontSize: '0.88rem' }}
              >
                {assignedAdvisors.length === 0 ? (
                  <option value="">No Property Advisors Available (0 Staff)</option>
                ) : (
                  assignedAdvisors.map(adv => (
                    <option key={adv.id} value={adv.name}>{adv.name} ({adv.role})</option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                  2. Customer Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sujay Mukherjee"
                  value={ratingCustomerName}
                  onChange={(e) => setRatingCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                  3. Phone / Mobile Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98300 12345"
                  value={ratingCustomerMobile}
                  onChange={(e) => setRatingCustomerMobile(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                4. Select Delivery Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { key: 'WHATSAPP', label: '🟢 WhatsApp', color: '#22c55e' },
                  { key: 'SMS', label: '📱 SMS Text', color: '#0284c7' },
                  { key: 'EMAIL', label: '✉️ Email', color: '#8b5cf6' },
                  { key: 'COPY', label: '📋 Copy Link', color: '#f59e0b' }
                ].map((ch) => (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => setRatingDeliveryChannel(ch.key as any)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '900',
                      cursor: 'pointer',
                      background: ratingDeliveryChannel === ch.key ? ch.color : (isLight ? '#f1f5f9' : '#0f172a'),
                      color: ratingDeliveryChannel === ch.key ? '#ffffff' : (isLight ? '#475569' : '#cbd5e1'),
                      border: ratingDeliveryChannel === ch.key ? `1px solid ${ch.color}` : (isLight ? '1px solid #cbd5e1' : '1px solid #334155')
                    }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                🔗 Generated Live Rating Submission Link
              </label>
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#38bdf8', wordBreak: 'break-all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span>
                  https://swaramayi-website.vercel.app/properties/dhriti-apartment-srm-prop-2026-000427?rate=true&advisor={encodeURIComponent(ratingAdvisorName)}&customer={encodeURIComponent(ratingCustomerName || 'Customer')}#rate-advisor
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const link = `https://swaramayi-website.vercel.app/properties/dhriti-apartment-srm-prop-2026-000427?rate=true&advisor=${encodeURIComponent(ratingAdvisorName)}&customer=${encodeURIComponent(ratingCustomerName || 'Customer')}#rate-advisor`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(link);
                      setCopiedRatingLinkSuccess(true);
                      setTimeout(() => setCopiedRatingLinkSuccess(false), 3000);
                    }
                  }}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.72rem', flexShrink: 0 }}
                >
                  {copiedRatingLinkSuccess ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '14px', marginTop: '6px' }}>
            <button
              onClick={() => setShowSendAdvisorRatingModal(false)}
              style={{ padding: '10px 18px', borderRadius: '10px', background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const targetCustomer = ratingCustomerName || 'Home Buyer Customer';
                const targetMobile = ratingCustomerMobile || '+91 98300 12345';
                const link = `https://swaramayi-website.vercel.app/properties/dhriti-apartment-srm-prop-2026-000427?rate=true&advisor=${encodeURIComponent(ratingAdvisorName)}&customer=${encodeURIComponent(targetCustomer)}#rate-advisor`;

                if (ratingDeliveryChannel === 'WHATSAPP') {
                  window.open(`https://wa.me/${targetMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${targetCustomer}, thank you for your recent property consultation with Swaramayi Real Estate. Please rate your assigned Property Advisor (${ratingAdvisorName}) here: ${link}`)}`, '_blank');
                }

                const host = window.location.hostname || 'localhost';
                const newInvitePayload = {
                  id: `SRM-RAT-INV-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  customerName: targetCustomer,
                  customerMobile: targetMobile,
                  advisorName: ratingAdvisorName,
                  propertyTitle: ratingPropertyTitle || 'DHRITI APARTMENT',
                  deliveryChannel: ratingDeliveryChannel,
                  customNote: ratingCustomNote || null
                };

                fetch(`http://${host}:5000/api/public/advisor-rating/invite`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newInvitePayload)
                }).then(res => res.json()).then(resJson => {
                  if (resJson && resJson.data) {
                    setRatingInvitesList(prev => {
                      const exists = prev.some(i => i.id === resJson.data.id);
                      if (exists) return prev;
                      return [resJson.data, ...prev];
                    });
                  }
                }).catch(err => console.warn('Dispatch link save err:', err));

                setShowSendAdvisorRatingModal(false);
                setRatingNotificationMsg(`✅ Advisor Rating Link successfully dispatched to ${targetCustomer} (${targetMobile}) via ${ratingDeliveryChannel}!`);
                setTimeout(() => setRatingNotificationMsg(''), 5000);
              }}
              style={{ padding: '10px 22px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
            >
              <Send size={16} /> Dispatch Rating Link Now
            </button>
          </div>
        </div>
      </div>
    )}

    {/* RESCHEDULE VISIT & LOG CUSTOMER STAY MODAL */}
    {showRescheduleStayModal?.open && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.2rem' }}>
                📅
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>Reschedule Visit & Log Customer Stay</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                  Customer: <strong style={{ color: '#38bdf8' }}>{showRescheduleStayModal.visit?.customerName}</strong> ({showRescheduleStayModal.visit?.mobile || showRescheduleStayModal.visit?.customerNumber})
                </p>
              </div>
            </div>
            <button onClick={() => setShowRescheduleStayModal(null)} style={{ background: 'transparent', border: 'none', color: isLight ? '#64748b' : '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', fontWeight: '900' }}>✕</button>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* RESCHEDULE SECTION */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '900', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📅 RESCHEDULE DATE & TIME LOGISTICS
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>New Visit Date</label>
                  <input 
                    type="date"
                    value={rescheduleForm.visitDate}
                    onChange={e => setRescheduleForm(prev => ({ ...prev, visitDate: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>New Visit Time</label>
                  <input 
                    type="text"
                    value={rescheduleForm.visitTime}
                    onChange={e => setRescheduleForm(prev => ({ ...prev, visitTime: e.target.value }))}
                    placeholder="e.g. 11:30 AM"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Assigned Field Executive</label>
                  <select
                    value={rescheduleForm.assignedExecutive}
                    onChange={e => setRescheduleForm(prev => ({ ...prev, assignedExecutive: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    {assignedAdvisors.length === 0 ? (
                      <option value="Unassigned">Unassigned (0 Staff Advisors)</option>
                    ) : (
                      assignedAdvisors.map(adv => (
                        <option key={adv.id} value={adv.name}>{adv.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Transport Logistics</label>
                  <select
                    value={rescheduleForm.transport}
                    onChange={e => setRescheduleForm(prev => ({ ...prev, transport: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="🚗 Cab Pick & Drop Needed">🚗 Cab Pick & Drop Needed</option>
                    <option value="🚘 Executive Car Pickup">🚘 Executive Car Pickup</option>
                    <option value="🚶 Self Drive / Direct Arrival">🚶 Self Drive / Direct Arrival</option>
                    <option value="🚌 Shuttle Service">🚌 Shuttle Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Reason for Rescheduling</label>
                <input 
                  type="text"
                  value={rescheduleForm.rescheduleReason}
                  onChange={e => setRescheduleForm(prev => ({ ...prev, rescheduleReason: e.target.value }))}
                  placeholder="Reason for changing visit date/time..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                />
              </div>
            </div>

            {/* STAY / ACCOMMODATION SECTION */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '900', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏨 CUSTOMER STAY & ACCOMMODATION MANAGEMENT
              </h4>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Customer Accommodation Choice</label>
                <select
                  value={rescheduleForm.stayType}
                  onChange={e => setRescheduleForm(prev => ({ ...prev, stayType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="NO_STAY">🚫 No Stay Needed - Single Day Tour</option>
                  <option value="HOTEL_STAY">🏨 Overnight Hotel Stay Requested</option>
                  <option value="GUEST_HOUSE">🏡 Guest House / Resort Stay Arranged</option>
                  <option value="SITE_LOUNGE">🛋️ Site Lounge & Refreshment Rest</option>
                </select>
              </div>

              {rescheduleForm.stayType !== 'NO_STAY' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginBottom: '4px' }}>Accommodation Booking Details & Notes</label>
                  <textarea
                    value={rescheduleForm.stayNotes}
                    onChange={e => setRescheduleForm(prev => ({ ...prev, stayNotes: e.target.value }))}
                    placeholder="Enter hotel name, room number, check-in date/time, guest preferences..."
                    rows={3}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.85rem', fontWeight: '600', resize: 'vertical' }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '14px' }}>
            <button
              onClick={() => setShowRescheduleStayModal(null)}
              style={{ padding: '10px 18px', borderRadius: '10px', background: isLight ? '#f1f5f9' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #475569', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRescheduleStay}
              style={{ padding: '10px 22px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', border: 'none', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
            >
              💾 Save Schedule & Stay Details
            </button>
          </div>

        </div>
      </div>
    )}
      </div>
    );
};
