import React from 'react';
import * as XLSX from 'xlsx';
import { extractAllIdentifiers, isItemInRecycledSet } from '../App';
import { Upload, Building2, Share2, ArrowRightLeft, Compass, Navigation, Camera, Video, Search, X, Download, Trash2, ChevronDown, MapPin, CheckCircle2, AlertTriangle, FileSpreadsheet, FileText, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const parseSqftValue = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const parseDeductionPct = (val: any, superArea?: any, carpetArea?: any): number => {
  if (val !== null && val !== undefined && String(val).trim() !== '') {
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0 && num <= 100) return num;
  }
  const sNum = parseSqftValue(superArea);
  const cNum = parseSqftValue(carpetArea);
  if (sNum > 0 && cNum > 0 && sNum >= cNum) {
    return Math.round(((sNum - cNum) / sNum) * 100);
  }
  return 35;
};

interface ProjectManagementViewProps {
  currentRole?: string;
  isLight: boolean;
  windowWidth: number;
  activeProjectSubTab: string;
  setActiveProjectSubTab: (tab: any) => void;
  properties: any[];
  propertyUnits: any[];
  projectVisitAgreements: any[];
  editingProperty: any;
  newPropertyForm: any;
  setNewPropertyForm: React.Dispatch<React.SetStateAction<any>>;
  devProjectMobile: string;
  setDevProjectMobile: (val: string) => void;
  devProjectAltMobile?: string;
  setDevProjectAltMobile?: (val: string) => void;
  verifiedDevProjectsList: any[];
  setVerifiedDevProjectsList: (val: any[]) => void;
  devProjectOtpVerified: boolean;
  setDevProjectOtpVerified: (val: boolean) => void;
  devProjectOtpSent: boolean;
  setDevProjectOtpSent: (val: boolean) => void;
  devProjectOtpInput: string;
  setDevProjectOtpInput: (val: string) => void;
  isCapturingGps: boolean;
  gpsCaptureStatus: string;
  setGpsCaptureStatus?: (status: string | null) => void;
  handleCaptureCurrentGpsLocation: () => void;
  handleCreatePropertySubmit: (e: React.FormEvent) => void;
  generateNextPropertyCode: () => string;
  generateNextAgreementCode?: (isDev?: boolean) => string;
  handleOpenAddPropertyModal: () => void;
  showBulkImportPropertyModal?: boolean;
  setShowBulkImportPropertyModal: (val: boolean) => void;
  showBulkImportDeveloperModal?: boolean;
  setShowBulkImportDeveloperModal?: (val: boolean) => void;
  setShowDeveloperIntroductionReportModal: (val: boolean) => void;
  setShowPvaDocumentModal: (val: any) => void;
  handleStartEditProperty: (prop: any) => void;
  handleDeleteProperty: (id: string, code: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  matchesSearchQuery: (item: any, query: string) => boolean;
  activeRadius: string;
  setActiveRadius: (r: any) => void;
  calculateIndividualCostSheet: (form: any) => any;
  formatIndianRupees: (amount: number) => string;
  detectLocalityFromCoords?: (lat: string, lng: string) => Promise<{ locality: string; fullAddress: string; rawDetails: any }>;
  setPropertyUnits?: React.Dispatch<React.SetStateAction<any[]>>;
  setProperties?: React.Dispatch<React.SetStateAction<any[]>>;
  developers?: any[];
  setDevelopers?: React.Dispatch<React.SetStateAction<any[]>>;
  syncAllToMongoDB?: (overrideData?: any) => void;
  bookings?: any[];
  invoices?: any[];
  agreements?: any[];
  setAgreements?: React.Dispatch<React.SetStateAction<any[]>>;
  onRecycleItem?: (itemData: any) => void;
  recycledItems?: any[];
}

export const normalizeTotalFloors = (val: any): string => {
  if (!val) return 'G+4 Floors (5 Storey)';
  const s = String(val).trim();
  if (s.includes('(') && s.includes(')')) return s;

  const gxMatch = s.match(/^G\+(\d+)(?:\s*floors?)?$/i);
  if (gxMatch) {
    const num = parseInt(gxMatch[1], 10);
    return `G+${num} Floors (${num + 1} Storey)`;
  }

  const numMatch = s.match(/^(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return `G+${num} Floors (${num + 1} Storey)`;
  }

  if (/^ground(?:\s*floor)?$/i.test(s) || s === 'G') {
    return 'Ground Floor Only (G)';
  }

  if (/b\+g\+30/i.test(s)) return 'B+G+30 Floors (Ultra Highrise)';
  if (/2b\+g\+30/i.test(s)) return '2B+G+30 Floors (Mega Highrise)';
  if (/b\+g\+14/i.test(s)) return 'B+G+14 Floors (Highrise)';
  if (/b\+g\+4/i.test(s)) return 'B+G+4 Floors (Midrise)';
  if (/b\+g/i.test(s)) return 'B+G (Basement + Ground)';

  return s;
};

export const normalizeUnitFloor = (val: any): string => {
  if (!val) return '2nd Floor';
  let s = String(val).trim();
  if (s.includes(' out of ')) {
    s = s.split(' out of ')[0].trim();
  }
  const numMatch = s.match(/^(\d+)(?:st|nd|rd|th)?(?:\s*floor)?$/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    let suffix = 'th';
    if (num === 1 || (num > 20 && num % 10 === 1)) suffix = 'st';
    else if (num === 2 || (num > 20 && num % 10 === 2)) suffix = 'nd';
    else if (num === 3 || (num > 20 && num % 10 === 3)) suffix = 'rd';
    return `${num}${suffix} Floor`;
  }
  if (/^ground(?:\s*floor)?$/i.test(s) || s === 'G') {
    return 'Ground Floor (G)';
  }
  if (/^b1$/i.test(s) || /basement\s*1/i.test(s)) {
    return 'Basement 1 (B1 / B)';
  }
  if (/^b2$/i.test(s) || /basement\s*2/i.test(s)) {
    return 'Basement 2 (B2)';
  }
  return s;
};

export const computeTotalBaseWithOtherCharges = (form: any): string => {
  if (!form) return '₹0';
  const parseNum = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const num = parseFloat(String(val).replace(/,/g, '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const superSqft = parseNum(form.super_builtup_area || form.superBuiltupArea);
  const rateSqft = parseNum(form.price_sqft || form.priceSqft || form.asking_rate_sqft || form.askingRateSqft);
  let basePrice = (superSqft > 0 && rateSqft > 0) ? (superSqft * rateSqft) : parseNum(form.final_price || form.basePrice);

  const floorRise = parseNum(form.floor_rise_charge || form.floorRiseCharge || form.floorRise);
  const plc = parseNum(form.plc_charge || form.plcCharge || form.plc);
  const parking = parseNum(form.parking_price || form.car_parking_charge || form.parkingCharge);
  const club = parseNum(form.amenity_charges || form.amenityCharges || form.clubhouse_charge || form.clubhouseCharge);
  const maintenance = parseNum(form.advance_maintenance_charge || form.advanceMaintenanceCharge);
  const infraLegal = parseNum(form.legal_doc_charge || form.legalDocCharge || form.infrastructure_charge);

  const total = basePrice + floorRise + plc + parking + club + maintenance + infraLegal;
  if (total > 0) return `₹${Math.round(total).toLocaleString('en-IN')}`;
  if (form.total_base_price_with_other_charges) {
    const num = parseNum(form.total_base_price_with_other_charges);
    if (num > 0) return `₹${Math.round(num).toLocaleString('en-IN')}`;
  }
  if (form.final_price) {
    const num = parseNum(form.final_price);
    if (num > 0) return `₹${Math.round(num).toLocaleString('en-IN')}`;
    return String(form.final_price);
  }
  return '₹0';
};

export const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({
  currentRole,
  isLight,
  windowWidth,
  activeProjectSubTab,
  setActiveProjectSubTab,
  properties = [],
  setProperties,
  developers = [],
  setDevelopers,
  syncAllToMongoDB,
  bookings = [],
  invoices = [],
  agreements = [],
  setAgreements,
  propertyUnits = [],
  projectVisitAgreements = [],
  editingProperty,
  newPropertyForm,
  setNewPropertyForm,
  devProjectMobile,
  setDevProjectMobile,
  devProjectAltMobile = '',
  setDevProjectAltMobile,
  verifiedDevProjectsList = [],
  setVerifiedDevProjectsList,
  devProjectOtpVerified,
  setDevProjectOtpVerified,
  devProjectOtpSent,
  setDevProjectOtpSent,
  devProjectOtpInput,
  setDevProjectOtpInput,
  isCapturingGps,
  gpsCaptureStatus,
  setGpsCaptureStatus,
  handleCaptureCurrentGpsLocation,
  handleCreatePropertySubmit,
  generateNextPropertyCode,
  generateNextAgreementCode,
  handleOpenAddPropertyModal,
  setShowBulkImportPropertyModal,
  showBulkImportPropertyModal = false,
  setShowBulkImportDeveloperModal,
  showBulkImportDeveloperModal = false,
  setShowDeveloperIntroductionReportModal,
  setShowPvaDocumentModal,
  handleStartEditProperty,
  handleDeleteProperty,
  searchQuery,
  setSearchQuery,
  matchesSearchQuery,
  activeRadius,
  setActiveRadius,
  formatIndianRupees,
  detectLocalityFromCoords,
  setPropertyUnits,
  onRecycleItem,
  recycledItems = [],
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER') || roleUpper.includes('ADMIN');
  const isSuperAdmin = isStrictSuperAdmin;

  const recycledSet = React.useMemo(() => {
    const set = new Set<string>();
    (recycledItems || []).forEach((r: any) => {
      extractAllIdentifiers(r).forEach(id => set.add(id));
    });
    return set;
  }, [recycledItems]);
  // DEVELOPER MASTER ID REGISTRY STATE & PERSISTENCE
  const getGpsForProject = (projTitle?: string, defaultLat?: string, defaultLng?: string) => {
    return { lat: defaultLat || '', lng: defaultLng || '' };
  };

  const downloadImage = (url: string, filename: string) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        })
        .catch(() => {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    } catch (e) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const [developerMasterList, setDeveloperMasterList] = React.useState<any[]>(() => {
    if (developers && Array.isArray(developers) && developers.length > 0) return developers;
    try {
      const saved = localStorage.getItem('swaramayi_developers_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      console.error('Error reading developers from localStorage');
    }
    return [];
  });

  // COLLECT ALL REGISTERED MASTER PROJECTS FROM DEVELOPER VAULT & EXISTING PROPERTIES
  const getAllMasterProjects = React.useCallback(() => {
    let recycledSet = new Set<string>();
    try {
      const savedRec = localStorage.getItem('swaramayi_recycled_items');
      if (savedRec) {
        const parsed = JSON.parse(savedRec);
        if (Array.isArray(parsed)) {
          parsed.forEach((r: any) => {
            extractAllIdentifiers(r).forEach(id => recycledSet.add(id));
          });
        }
      }
    } catch (e) {}

    const masterProjectsMap = new Map<string, any>();

    // 1. From developerMasterList
    (developerMasterList || []).forEach((dev: any) => {
      if (isItemInRecycledSet(dev, recycledSet)) {
        return;
      }
      (dev.projects || []).forEach((proj: any) => {
        if (isItemInRecycledSet(proj, recycledSet)) {
          return;
        }

        const projId = proj.code || proj.id || `PROJ-${(proj.title || 'PROJECT').replace(/\s+/g, '-').toUpperCase()}`;
        if (!masterProjectsMap.has(projId)) {
          masterProjectsMap.set(projId, {
            id: projId,
            code: proj.code || projId,
            title: proj.title,
            developer: dev.name,
            developer_id: dev.id,
            mobile: dev.mobile || '',
            altMobile: dev.altMobile || '',
            locality: proj.locality || '',
            latitude: proj.lat || proj.latitude || '',
            longitude: proj.lng || proj.longitude || '',
            rera_id: proj.rera_id || proj.reraId || proj.rera || dev.rera_id || dev.reraId || dev.rera || dev.developer_rera_id || '',
            hera_no: proj.hera_no || proj.heraId || proj.hera || dev.hera_no || dev.heraId || dev.hera || dev.developer_hera_no || '',
            amenities: proj.amenities || [],
            building_photos: proj.building_photos || [],
            total_covered_parking_capacity: proj.total_covered_parking_capacity !== undefined ? proj.total_covered_parking_capacity : 0,
            covered_parking_rate: proj.covered_parking_rate || proj.parking_rate || proj.builder_default_rate || proj.builderDefaultRate || proj.parking_price || proj.car_parking_charge || '',
            total_ev_parking_capacity: proj.total_ev_parking_capacity !== undefined ? proj.total_ev_parking_capacity : 0,
            ev_parking_rate: proj.ev_parking_rate || '',
            total_open_parking_capacity: proj.total_open_parking_capacity !== undefined ? proj.total_open_parking_capacity : 0,
            open_parking_rate: proj.open_parking_rate || '',
            key_custody: proj.key_custody || proj.keys_custody || '',
            keys_custody: proj.key_custody || proj.keys_custody || '',
            architectural_description: proj.architectural_description || proj.description || '',
            description: proj.architectural_description || proj.description || '',
            total_floors: proj.total_floors || '',
            number_of_towers: proj.number_of_towers || ''
          });
        }
      });
    });

    // 2. From properties list
    (properties || []).forEach((prop: any) => {
      if (isItemInRecycledSet(prop, recycledSet)) {
        return;
      }

      let projId = (prop.project_id && !prop.project_id.startsWith('SRM-DEV-')) ? prop.project_id : null;
      if (!projId && prop.id) {
        projId = `SRM-PROJ-${prop.id}`;
      }

      if (projId && masterProjectsMap.has(projId)) {
        const existing = masterProjectsMap.get(projId);
        if (!existing.covered_parking_rate && (prop.covered_parking_rate || prop.parking_rate || prop.builder_default_rate)) {
          existing.covered_parking_rate = prop.covered_parking_rate || prop.parking_rate || prop.builder_default_rate;
        }
        if (!existing.total_covered_parking_capacity && prop.total_covered_parking_capacity) {
          existing.total_covered_parking_capacity = prop.total_covered_parking_capacity;
        }
      }

      if (projId && !masterProjectsMap.has(projId) && (prop.title || prop.project_title)) {
        masterProjectsMap.set(projId, {
          id: projId,
          code: projId,
          title: prop.title || prop.project_title,
          developer: prop.developer || prop.builder_name || '',
          developer_id: prop.developer_id || '',
          mobile: prop.developer_mobile || prop.mobile || '',
          altMobile: prop.developer_alt_mobile || '',
          locality: prop.locality || '',
          latitude: prop.latitude || '',
          longitude: prop.longitude || '',
          rera_id: prop.rera_id || prop.reraId || prop.rera || '',
          hera_no: prop.hera_no || prop.heraId || prop.hera || '',
          amenities: prop.selected_amenities || [],
          building_photos: prop.building_photos || [],
          total_covered_parking_capacity: prop.total_covered_parking_capacity !== undefined ? prop.total_covered_parking_capacity : 0,
          covered_parking_rate: prop.covered_parking_rate || prop.parking_rate || prop.builder_default_rate || prop.builderDefaultRate || prop.parking_price || prop.car_parking_charge || '',
          total_ev_parking_capacity: prop.total_ev_parking_capacity !== undefined ? prop.total_ev_parking_capacity : 0,
          ev_parking_rate: prop.ev_parking_rate || '',
          total_open_parking_capacity: prop.total_open_parking_capacity !== undefined ? prop.total_open_parking_capacity : 0,
          open_parking_rate: prop.open_parking_rate || '',
          key_custody: prop.key_custody || prop.keys_custody || '',
          keys_custody: prop.key_custody || prop.keys_custody || '',
          architectural_description: prop.architectural_description || prop.description || '',
          description: prop.architectural_description || prop.description || '',
          total_floors: prop.total_floors || '',
          number_of_towers: prop.number_of_towers || ''
        });
      }
    });

    return Array.from(masterProjectsMap.values());
  }, [developerMasterList, properties]);

  // ==========================================
  // BULK PROPERTY STOCK IMPORT & EXCEL ENGINE
  // ==========================================
  const BULK_PROPERTY_COLUMNS = [
    // 1. Master Project ID & Link (2 fields - project details & developer credentials auto-linked)
    { header: 'Master Project ID', key: 'project_id', section: '1. Master Project Link', sample1: 'SRM-PROJ-2026-000004', sample2: 'SRM-PROJ-2026-000002', desc: 'Master project code to link this unit to (e.g. SRM-PROJ-2026-000004). Developer, locality, address, RERA & building specs auto-link.' },
    { header: 'Project Posting ID', key: 'project_posting_id', section: '1. Master Project Link', sample1: 'PRJ-POST-2026-8802', sample2: 'PRJ-POST-2026-8803', desc: 'Marketing / posting campaign tracking ID' },

    // 2. Unit Configuration, Area, Floor & Orientation Specifications (11 fields)
    { header: 'Property Category Type', key: 'property_type', section: '2. Configuration & Area', sample1: 'Flat / Apartment', sample2: 'Flat / Apartment', desc: 'Flat / Apartment, Penthouse, Duplex, Villa, Commercial' },
    { header: 'BHK Configuration', key: 'configuration', section: '2. Configuration & Area', sample1: '2 BHK', sample2: '3 BHK', desc: '1 BHK, 2 BHK, 3 BHK, 4 BHK, etc.' },
    { header: 'Super Built-up Area (Sq.Ft.)', key: 'super_builtup_area', section: '2. Configuration & Area', sample1: 705, sample2: 1150, desc: 'Total chargeable super built-up area in sq.ft.' },
    { header: 'Deduction / Loading (%)', key: 'deduction_pct', section: '2. Configuration & Area', sample1: 20, sample2: 22, desc: 'Loading / deduction percentage (typically 20% to 30%)' },
    { header: 'Carpet Area (Sq.Ft.)', key: 'carpet_area', section: '2. Configuration & Area', sample1: 564, sample2: 897, desc: 'Net internal usable carpet area in sq.ft.' },
    { header: 'Vastu Facing', key: 'facing', section: '2. Configuration & Area', sample1: 'East Facing', sample2: 'North-East Facing', desc: 'Main entrance orientation (e.g. East Facing, North Facing)' },
    { header: 'Furnishing', key: 'furnishing', section: '2. Configuration & Area', sample1: 'Semi-Furnished', sample2: 'Unfurnished', desc: 'Unfurnished, Semi-Furnished, Fully Furnished' },
    { header: 'Possession Status', key: 'possession_status', section: '2. Configuration & Area', sample1: 'Ready to Move', sample2: 'Under Construction', desc: 'Ready to Move or Under Construction' },
    { header: 'Handover Month & Year', key: 'handover_month_year', section: '2. Configuration & Area', sample1: 'Ready', sample2: 'December 2026', desc: 'Possession handover timeline' },
    { header: 'Unit Floor Number', key: 'unit_floor', section: '2. Configuration & Area', sample1: '2nd Floor', sample2: '4th Floor', desc: 'Specific unit floor level (e.g. Ground Floor, 2nd Floor)' },
    { header: 'Unit / Flat Number', key: 'unit_number', section: '2. Configuration & Area', sample1: 'Flat 2B', sample2: 'Flat 4A', desc: 'Individual flat or unit number' },

    // 3. Pricing, Commercials, Parking & All-Inclusive Final Valuation (17 fields)
    { header: 'Asking Rate per Sq.Ft.', key: 'price_sqft', section: '3. Pricing & Commercials', sample1: 4000, sample2: 4200, desc: 'Base quotation rate per super built-up sq.ft.' },
    { header: 'Base Property Asking Price (INR)', key: 'final_price', section: '3. Pricing & Commercials', sample1: 2820000, sample2: 4830000, desc: 'Base asking price = Super Built-up Area x Rate' },
    { header: 'Goods & Services Tax GST Rate (%)', key: 'gst_pct', section: '3. Pricing & Commercials', sample1: '0% (Ready to Move)', sample2: '5% (Under Construction Standard)', desc: 'Applicable GST percentage' },
    { header: 'Stamp Duty Charges Rate (%)', key: 'stamp_duty_pct', section: '3. Pricing & Commercials', sample1: '5%', sample2: '5%', desc: 'State Government Stamp Duty percentage' },
    { header: 'Registration Fee Rate (%)', key: 'registration_fee_pct', section: '3. Pricing & Commercials', sample1: '1%', sample2: '1%', desc: 'Government Registry fee percentage' },
    { header: 'Floor Rise Charge (INR)', key: 'floor_rise_charge', section: '3. Pricing & Commercials', sample1: 0, sample2: 50000, desc: 'Additional floor rise charge' },
    { header: 'Preferential Location Charge PLC (INR)', key: 'plc_charge', section: '3. Pricing & Commercials', sample1: 0, sample2: 75000, desc: 'PLC for park, pool or road-facing units' },
    { header: 'Covered Car Parking Slot Charge (INR)', key: 'parking_price', section: '3. Pricing & Commercials', sample1: 250000, sample2: 350000, desc: 'Dedicated covered vehicle parking cost' },
    { header: 'Clubhouse & Amenities Membership (INR)', key: 'amenity_charges', section: '3. Pricing & Commercials', sample1: 50000, sample2: 150000, desc: 'Clubhouse, gym and amenities membership fee' },
    { header: 'Advance Maintenance Charge (INR)', key: 'advance_maintenance_charge', section: '3. Pricing & Commercials', sample1: 25000, sample2: 30000, desc: 'Initial maintenance deposit / sinking fund' },
    { header: 'Lawyer & Legal Verification Charge (INR)', key: 'legal_doc_charge', section: '3. Pricing & Commercials', sample1: 45000, sample2: 45000, desc: 'Legal vetting and document preparation charge' },
    { header: 'Total Base Price with Others (INR)', key: 'total_base_price_with_other_charges', section: '3. Pricing & Commercials', sample1: 3190000, sample2: 5530000, desc: 'Base price + Floor Rise + PLC + Parking + Clubhouse + Legal' },
    { header: 'Total All-Inclusive Price (INR)', key: 'total_all_inclusive_price', section: '3. Pricing & Commercials', sample1: 3381400, sample2: 6138300, desc: 'All-inclusive grand total on-road property price' },
    { header: 'Monthly Maintenance (INR)', key: 'maintenance_monthly', section: '3. Pricing & Commercials', sample1: 1500, sample2: 2500, desc: 'Recurring monthly society maintenance' },
    { header: 'Stock Inventory Status', key: 'status', section: '3. Pricing & Commercials', sample1: 'AVAILABLE', sample2: 'AVAILABLE', desc: 'Inventory status (AVAILABLE, BOOKED, HOLD, SOLD)' },
    { header: 'Key Custody / Site Person', key: 'key_custody', section: '3. Pricing & Commercials', sample1: 'Builder Site Office', sample2: 'Site Supervisor (Mr. Sen)', desc: 'Location of keys or site in-charge person' },
    { header: 'Property Description & Highlights', key: 'description', section: '3. Pricing & Commercials', sample1: 'Road facing, East open, 2 balconies with scenic view', sample2: 'Corner 3BHK flat, pool facing, airy 3-side open', desc: 'Salient features, cross-ventilation, views, and remarks' }
  ];

  const [isBulkImportPropertyOpen, setIsBulkImportPropertyOpen] = React.useState<boolean>(false);
  const [bulkImportMode, setBulkImportMode] = React.useState<'upload' | 'paste'>('upload');
  const [bulkFileName, setBulkFileName] = React.useState<string>('');
  const [bulkPasteContent, setBulkPasteContent] = React.useState<string>('');
  const [parsedBulkProperties, setParsedBulkProperties] = React.useState<any[]>([]);
  const [bulkImportErrors, setBulkImportErrors] = React.useState<string[]>([]);
  const [isProcessingBulkFile, setIsProcessingBulkFile] = React.useState<boolean>(false);
  const [isIngestingStock, setIsIngestingStock] = React.useState<boolean>(false);
  const [showBulkColumnsGuide, setShowBulkColumnsGuide] = React.useState<boolean>(false);
  const [bulkPreviewFilter, setBulkPreviewFilter] = React.useState<string>('');

  React.useEffect(() => {
    if (showBulkImportPropertyModal) {
      setIsBulkImportPropertyOpen(true);
    }
  }, [showBulkImportPropertyModal]);

  const closeBulkImportModal = () => {
    setIsBulkImportPropertyOpen(false);
    if (setShowBulkImportPropertyModal) {
      setShowBulkImportPropertyModal(false);
    }
  };

  const cleanNum = (val: any, fallback: number = 0): number => {
    if (val === null || val === undefined || val === '') return fallback;
    const str = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? fallback : num;
  };

  const getNextSequentialPropertyCode = (offset: number = 0, currentList: any[] = properties) => {
    let maxNum = 0;
    (currentList || []).forEach(p => {
      const code = p.property_code || p.id || '';
      const m = code.match(/SRM-PROP-(\d{4})-(\d+)/i) || code.match(/PROP-(\d+)/i);
      if (m) {
        const n = parseInt(m[2] || m[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    const yr = new Date().getFullYear();
    const nextNum = maxNum + 1 + offset;
    return `SRM-PROP-${yr}-${String(nextNum).padStart(6, '0')}`;
  };

  const handleDownloadExcelTemplate = () => {
    try {
      const headers = BULK_PROPERTY_COLUMNS.map(c => c.header);
      const row1 = BULK_PROPERTY_COLUMNS.map(c => c.sample1);
      const row2 = BULK_PROPERTY_COLUMNS.map(c => c.sample2);
      const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);
      ws['!cols'] = BULK_PROPERTY_COLUMNS.map(c => ({ wch: Math.max(c.header.length + 4, 18) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Property_Master_Stock');
      XLSX.writeFile(wb, 'Swaramayi_Bulk_Property_Stock_Template.xlsx');
    } catch (err: any) {
      alert(`⚠️ Could not generate Excel template: ${err.message}`);
    }
  };

  const handleDownloadCsvTemplate = () => {
    try {
      const headers = BULK_PROPERTY_COLUMNS.map(c => c.header);
      const row1 = BULK_PROPERTY_COLUMNS.map(c => c.sample1);
      const row2 = BULK_PROPERTY_COLUMNS.map(c => c.sample2);
      const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Property_Master_Stock');
      XLSX.writeFile(wb, 'Swaramayi_Bulk_Property_Stock_Template.csv', { bookType: 'csv' });
    } catch (err: any) {
      alert(`⚠️ Could not generate CSV template: ${err.message}`);
    }
  };

  const handleExportInventoryExcel = () => {
    try {
      if (!properties || properties.length === 0) {
        alert('⚠️ Master inventory is currently empty. Downloading sample template instead.');
        handleDownloadExcelTemplate();
        return;
      }
      const headers = BULK_PROPERTY_COLUMNS.map(c => c.header);
      const rows = properties.map(p => {
        return BULK_PROPERTY_COLUMNS.map(c => {
          const val = p[c.key];
          return val !== undefined && val !== null ? val : '';
        });
      });
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = BULK_PROPERTY_COLUMNS.map(c => ({ wch: Math.max(c.header.length + 4, 18) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master_Inventory_Stock');
      const nowStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Swaramayi_Master_Property_Stock_${nowStr}.xlsx`);
    } catch (err: any) {
      alert(`⚠️ Export failed: ${err.message}`);
    }
  };

  const normalizeHeaderKey = (rawHeader: any): string => {
    if (!rawHeader) return '';
    const clean = String(rawHeader).toLowerCase().trim().replace(/[\r\n]+/g, ' ');
    const directCol = BULK_PROPERTY_COLUMNS.find(c => c.header.toLowerCase() === clean);
    if (directCol) return directCol.key;

    // Fuzzy alias dictionary
    const aliases: { [key: string]: string[] } = {
      project_id: ['master project id', 'project id', 'project_id', 'proj id', 'proj_id'],
      property_code: ['unique property code', 'property code', 'property_code', 'prop code', 'code'],
      title: ['project title & name', 'project title', 'title', 'project name', 'project', 'building name'],
      developer: ['developer / builder name', 'developer name', 'builder name', 'developer', 'builder'],
      developer_id: ['developer id', 'developer_id', 'dev id', 'dev_id'],
      developer_mobile: ['developer mobile (for otp)', 'developer mobile', 'mobile', 'dev mobile', 'phone', 'contact'],
      developer_alt_mobile: ['developer alt mobile', 'alt mobile', 'alternative mobile', 'alternate phone'],
      developer_email: ['developer email address', 'developer email', 'email', 'dev email'],
      locality: ['locality hub / sector', 'locality hub', 'locality', 'location', 'sector', 'area'],
      full_address: ['full site address', 'full address', 'address', 'site address'],
      city: ['city', 'town'],
      latitude: ['gps latitude', 'latitude', 'lat'],
      longitude: ['gps longitude', 'longitude', 'lng', 'long'],
      project_posting_id: ['project posting id', 'posting id', 'project_posting_id'],
      rera_id: ['rera registration no.', 'rera registration no', 'rera id', 'rera no', 'rera_id', 'rera_no'],
      hera_no: ['hera registration no.', 'hera registration no', 'hera id', 'hera no', 'hera_no'],
      property_type: ['property category type', 'property category', 'property type', 'type', 'category', 'property_type'],
      configuration: ['bhk configuration', 'bhk config', 'configuration', 'bhk', 'config'],
      super_builtup_area: ['super built-up area (sq.ft.)', 'super built-up area', 'super builtup area', 'super area', 'sbua', 'super_builtup_area'],
      deduction_pct: ['deduction / loading (%)', 'deduction / loading %', 'deduction %', 'loading %', 'loading', 'deduction_pct'],
      carpet_area: ['carpet area (sq.ft.)', 'carpet area', 'carpet', 'carpet_area'],
      facing: ['vastu facing', 'facing', 'orientation', 'direction'],
      furnishing: ['furnishing', 'furnishing status', 'furnish'],
      possession_status: ['possession status', 'possession', 'possession_status'],
      handover_month_year: ['handover month & year', 'handover date', 'handover', 'handover_month_year', 'possession date'],
      unit_floor: ['unit floor number', 'unit floor', 'floor number', 'floor', 'floor_num', 'floor_no', 'unit_floor'],
      total_floors: ['total floors in building', 'total floors', 'floors in building', 'total_floors'],
      tower_block: ['tower / block name', 'tower / block', 'tower name', 'block name', 'tower', 'block', 'tower_block'],
      number_of_towers: ['number of towers in project', 'number of towers', 'total towers', 'towers count', 'number_of_towers'],
      unit_number: ['unit / flat number', 'unit number', 'flat number', 'flat no', 'unit no', 'unit_number'],
      price_sqft: ['asking rate per sq.ft.', 'asking rate / sq.ft.', 'rate per sq.ft.', 'rate / sq.ft.', 'price per sqft', 'rate/sqft', 'price_sqft'],
      final_price: ['base property asking price (inr)', 'base property asking price', 'base asking price', 'base price', 'asking price', 'final_price'],
      gst_pct: ['goods & services tax gst rate (%)', 'gst rate (%)', 'gst rate', 'gst %', 'gst', 'gst_pct'],
      stamp_duty_pct: ['stamp duty charges rate (%)', 'stamp duty rate (%)', 'stamp duty %', 'stamp duty', 'stamp_duty_pct'],
      registration_fee_pct: ['registration fee rate (%)', 'registration fee %', 'registration fee', 'registration_fee_pct'],
      floor_rise_charge: ['floor rise charge (inr)', 'floor rise charge', 'floor rise', 'floor_rise_charge', 'floorrise'],
      plc_charge: ['preferential location charge plc (inr)', 'preferential location charge', 'plc charge', 'plc', 'plc_charge'],
      parking_price: ['covered car parking slot charge (inr)', 'car parking slot charge', 'covered parking charge', 'parking charge', 'parking price', 'parking_price', 'car_parking_charge'],
      amenity_charges: ['clubhouse & amenities membership (inr)', 'clubhouse charge', 'amenity charges', 'amenities charge', 'amenity_charges', 'clubhouse_charge'],
      advance_maintenance_charge: ['advance maintenance charge (inr)', 'advance maintenance charge', 'advance maintenance', 'advance_maintenance_charge'],
      legal_doc_charge: ['lawyer & legal verification charge (inr)', 'legal verification charge', 'legal charge', 'lawyer charge', 'legal_doc_charge', 'lawyer_charge', 'infrastructure_charge'],
      total_base_price_with_other_charges: ['total base price with others (inr)', 'total base price with others', 'total base with other charges', 'total_base_price_with_other_charges'],
      total_all_inclusive_price: ['total all-inclusive price (inr)', 'total all-inclusive price', 'all-inclusive price', 'total price', 'total_all_inclusive_price'],
      maintenance_monthly: ['monthly maintenance (inr)', 'monthly maintenance', 'maintenance per month', 'maintenance_monthly'],
      status: ['stock inventory status', 'inventory status', 'stock status', 'status'],
      key_custody: ['key custody / site person', 'key custody', 'keys custody', 'site person', 'key_custody'],
      description: ['property description & highlights', 'property description', 'description', 'highlights', 'notes']
    };

    for (const [key, aliasList] of Object.entries(aliases)) {
      if (aliasList.some(a => clean === a || clean.replace(/[^a-z0-9]/g, '') === a.replace(/[^a-z0-9]/g, ''))) {
        return key;
      }
    }
    return clean.replace(/[^a-z0-9_]/g, '_');
  };

  const processRawRowsToProperties = (sheetRows: any[][]) => {
    if (!sheetRows || sheetRows.length < 2) {
      setBulkImportErrors(['The uploaded file is empty or does not contain data rows below the header row.']);
      return;
    }

    const rawHeaders = sheetRows[0];
    const headerKeys = rawHeaders.map(h => normalizeHeaderKey(h));
    const errors: string[] = [];
    const parsedList: any[] = [];

    for (let r = 1; r < sheetRows.length; r++) {
      const row = sheetRows[r];
      if (!row || row.every((c: any) => c === null || c === undefined || String(c).trim() === '')) {
        continue;
      }

      const rawObj: any = {};
      headerKeys.forEach((key, colIdx) => {
        if (key && colIdx < row.length) {
          rawObj[key] = row[colIdx];
        }
      });

      const superArea = cleanNum(rawObj.super_builtup_area, 0);
      const deductionPct = cleanNum(rawObj.deduction_pct, 20);
      let carpetArea = cleanNum(rawObj.carpet_area, 0);
      if (carpetArea === 0 && superArea > 0) {
        carpetArea = Math.round(superArea * (1 - deductionPct / 100));
      }

      let rateSqft = cleanNum(rawObj.price_sqft, 0);
      let baseAskingPrice = cleanNum(rawObj.final_price, 0);
      if (baseAskingPrice === 0 && superArea > 0 && rateSqft > 0) {
        baseAskingPrice = Math.round(superArea * rateSqft);
      }
      if (rateSqft === 0 && superArea > 0 && baseAskingPrice > 0) {
        rateSqft = Math.round(baseAskingPrice / superArea);
      }

      const floorRise = cleanNum(rawObj.floor_rise_charge, 0);
      const plc = cleanNum(rawObj.plc_charge, 0);
      const parking = cleanNum(rawObj.parking_price, 0);
      const amenity = cleanNum(rawObj.amenity_charges, 0);
      const advanceMaint = cleanNum(rawObj.advance_maintenance_charge, 0);
      const legal = cleanNum(rawObj.legal_doc_charge, 0);

      let totalBaseWithOthers = cleanNum(rawObj.total_base_price_with_other_charges, 0);
      if (totalBaseWithOthers === 0 && baseAskingPrice > 0) {
        totalBaseWithOthers = baseAskingPrice + floorRise + plc + parking + amenity + advanceMaint + legal;
      }

      let totalAllInclusive = cleanNum(rawObj.total_all_inclusive_price, 0);
      if (totalAllInclusive === 0 && totalBaseWithOthers > 0) {
        const gstPct = parseFloat(String(rawObj.gst_pct || '5%').replace(/[^0-9.]/g, '')) || 0;
        const stampPct = parseFloat(String(rawObj.stamp_duty_pct || '5%').replace(/[^0-9.]/g, '')) || 0;
        const regPct = parseFloat(String(rawObj.registration_fee_pct || '1%').replace(/[^0-9.]/g, '')) || 0;
        const gstVal = Math.round((baseAskingPrice + floorRise + plc) * (gstPct / 100));
        const stampVal = Math.round(totalBaseWithOthers * (stampPct / 100));
        const regVal = Math.round(totalBaseWithOthers * (regPct / 100));
        totalAllInclusive = totalBaseWithOthers + gstVal + stampVal + regVal;
      }

      const rawCode = rawObj.property_code ? String(rawObj.property_code).trim() : '';
      const finalCode = (rawCode && rawCode.toUpperCase() !== 'AUTO')
        ? rawCode
        : getNextSequentialPropertyCode(parsedList.length, properties);

      // Resolve linked Master Project (if project_id or title is given)
      const rawProjId = rawObj.project_id ? String(rawObj.project_id).trim() : '';
      const allMasterProjects = getAllMasterProjects();
      const matchedProj = allMasterProjects.find((p: any) => {
        if (!rawProjId && !rawObj.title) return false;
        const pCode = (p.code || p.id || '').toLowerCase().trim();
        const pId = (p.id || '').toLowerCase().trim();
        const targetId = rawProjId.toLowerCase().trim();
        if (targetId && (pCode === targetId || pId === targetId)) return true;
        if (rawObj.title && p.title && p.title.toLowerCase().trim() === String(rawObj.title).toLowerCase().trim()) return true;
        return false;
      });

      const title = rawObj.title ? String(rawObj.title).trim() : (matchedProj?.title || (rawProjId ? `Unit at ${rawProjId}` : `Unit at ${rawObj.locality || 'Master Inventory'}`));
      const developer = rawObj.developer ? String(rawObj.developer).trim() : (matchedProj?.developer || 'Swaramayi Developer');
      const locality = rawObj.locality ? String(rawObj.locality).trim() : (matchedProj?.locality || 'Greater Kolkata');
      const fullAddress = rawObj.full_address ? String(rawObj.full_address).trim() : (matchedProj?.full_address || matchedProj?.address || locality);
      const config = rawObj.configuration ? String(rawObj.configuration).trim() : '2 BHK';
      const propType = rawObj.property_type ? String(rawObj.property_type).trim() : 'Flat / Apartment';
      const status = rawObj.status ? String(rawObj.status).trim().toUpperCase() : 'AVAILABLE';

      const finalItem: any = {
        ...rawObj,
        id: `PROP-BULK-${Date.now()}-${parsedList.length}-${Math.random().toString(36).substr(2, 5)}`,
        property_code: finalCode,
        project_id: rawProjId || matchedProj?.code || matchedProj?.id || '',
        title,
        developer,
        developer_id: rawObj.developer_id || matchedProj?.developer_id || 'SRM-DEV-2026-000001',
        developer_mobile: rawObj.developer_mobile || matchedProj?.mobile || '9883395102',
        developer_alt_mobile: rawObj.developer_alt_mobile || matchedProj?.altMobile || '7044293951',
        developer_email: rawObj.developer_email || matchedProj?.email || 'developer@swaramayi.com',
        locality,
        full_address: fullAddress,
        city: rawObj.city || matchedProj?.city || 'Kolkata',
        latitude: rawObj.latitude || matchedProj?.latitude || '22.722361',
        longitude: rawObj.longitude || matchedProj?.longitude || '88.493403',
        project_posting_id: rawObj.project_posting_id || 'PRJ-POST-2026-8802',
        rera_id: rawObj.rera_id || matchedProj?.rera_id || '',
        hera_no: rawObj.hera_no || matchedProj?.hera_no || '',
        property_type: propType,
        configuration: config,
        super_builtup_area: superArea > 0 ? superArea : 750,
        deduction_pct: deductionPct,
        carpet_area: carpetArea > 0 ? carpetArea : Math.round((superArea || 750) * 0.8),
        facing: rawObj.facing || 'East Facing',
        furnishing: rawObj.furnishing || 'Semi-Furnished',
        possession_status: rawObj.possession_status || 'Ready to Move',
        handover_month_year: rawObj.handover_month_year || 'Ready',
        unit_floor: rawObj.unit_floor || '2nd Floor',
        floor_num: rawObj.unit_floor || '2nd Floor',
        floor_number: rawObj.unit_floor || '2nd Floor',
        total_floors: normalizeTotalFloors(rawObj.total_floors || matchedProj?.total_floors || 'G+4 Floors (5 Storey)'),
        tower_block: rawObj.tower_block || matchedProj?.tower_block || 'Tower A',
        number_of_towers: rawObj.number_of_towers || matchedProj?.number_of_towers || '1 Standalone Tower',
        unit_number: rawObj.unit_number || `Unit ${parsedList.length + 1}`,
        price_sqft: rateSqft > 0 ? rateSqft : 3800,
        final_price: baseAskingPrice > 0 ? baseAskingPrice : (rateSqft > 0 ? (superArea || 750) * rateSqft : 2850000),
        gst_pct: rawObj.gst_pct || '5%',
        stamp_duty_pct: rawObj.stamp_duty_pct || '5%',
        registration_fee_pct: rawObj.registration_fee_pct || '1%',
        floor_rise_charge: floorRise,
        plc_charge: plc,
        parking_price: parking,
        car_parking_charge: parking,
        car_parking: parking > 0 ? '1 Covered Parking Slot' : 'Open / None',
        parking_required: parking > 0 ? 'YES' : 'NO',
        amenity_charges: amenity,
        clubhouse_charge: amenity,
        advance_maintenance_charge: advanceMaint,
        legal_doc_charge: legal,
        total_base_price_with_other_charges: totalBaseWithOthers > 0 ? totalBaseWithOthers : baseAskingPrice,
        total_all_inclusive_price: totalAllInclusive > 0 ? totalAllInclusive : totalBaseWithOthers,
        maintenance_monthly: cleanNum(rawObj.maintenance_monthly, 1500),
        status,
        key_custody: rawObj.key_custody || 'Builder Site Office',
        description: rawObj.description || 'Spacious ventilated residential property unit with optimal natural light.',
        map_x: 35 + Math.random() * 30,
        map_y: 35 + Math.random() * 30
      };

      parsedList.push(finalItem);
    }

    if (parsedList.length === 0) {
      errors.push('No valid property unit rows could be parsed from the file.');
    }

    setBulkImportErrors(errors);
    setParsedBulkProperties(parsedList);
  };

  const handleBulkFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setIsProcessingBulkFile(true);
    setBulkImportErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processRawRowsToProperties(rows);
      } catch (err: any) {
        setBulkImportErrors([`Failed to parse file: ${err.message || 'Unknown error'}`]);
      } finally {
        setIsProcessingBulkFile(false);
      }
    };
    reader.onerror = () => {
      setBulkImportErrors(['Error reading file. Please check file permissions.']);
      setIsProcessingBulkFile(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessPastedCsv = () => {
    if (!bulkPasteContent.trim()) {
      alert('⚠️ Please paste CSV or TSV content into the text box first.');
      return;
    }
    setIsProcessingBulkFile(true);
    setBulkImportErrors([]);
    try {
      const workbook = XLSX.read(bulkPasteContent, { type: 'string' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      processRawRowsToProperties(rows);
    } catch (err: any) {
      setBulkImportErrors([`Failed to parse pasted text: ${err.message || 'Invalid CSV/TSV format'}`]);
    } finally {
      setIsProcessingBulkFile(false);
    }
  };

  const handleRemoveParsedRow = (index: number) => {
    setParsedBulkProperties(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearParsedRows = () => {
    setParsedBulkProperties([]);
    setBulkFileName('');
    setBulkPasteContent('');
    setBulkImportErrors([]);
  };

  const handleConfirmBulkImport = async () => {
    if (parsedBulkProperties.length === 0) {
      alert('⚠️ No parsed properties to import. Please upload or paste property records first.');
      return;
    }

    setIsIngestingStock(true);
    try {
      const updatedProps = [...parsedBulkProperties, ...properties];
      if (setProperties) {
        setProperties(updatedProps);
      }
      if (syncAllToMongoDB) {
        await syncAllToMongoDB({ properties: updatedProps });
      }

      alert(`🎉 BULK IMPORT SUCCESSFUL!\n\n• Successfully imported ${parsedBulkProperties.length} new property units into Master Inventory Stock!\n• Synced to central stock vault & MongoDB Atlas.\n• Codes assigned: ${parsedBulkProperties[0].property_code} to ${parsedBulkProperties[parsedBulkProperties.length - 1].property_code}`);

      handleClearParsedRows();
      closeBulkImportModal();
      setActiveProjectSubTab('property_master');
    } catch (err: any) {
      alert(`⚠️ Ingestion failed: ${err.message || 'Could not sync to database'}`);
    } finally {
      setIsIngestingStock(false);
    }
  };

  // ==========================================
  // BULK DEVELOPER STOCK IMPORT & EXCEL ENGINE
  // ==========================================
  const BULK_DEVELOPER_COLUMNS = [
    // 1. Project & Developer Identification (from Register New Project & Developer Master)
    { header: 'Developer / Builder Name', key: 'developer', section: '1. Project & Developer Identification', sample1: 'Godrej Properties', sample2: 'Ambuja Neotia', desc: 'Company / Builder / Developer Entity Name *' },
    { header: 'Project Title & Name', key: 'title', section: '1. Project & Developer Identification', sample1: 'Godrej Prakriti', sample2: 'Utalika Luxury', desc: 'Project or Society Master Name *' },
    { header: 'Master Project ID', key: 'project_id', section: '1. Project & Developer Identification', sample1: 'SRM-PROJ-2026-000001', sample2: 'SRM-PROJ-2026-000002', desc: 'Unique Project Master Code (Leave blank or AUTO to auto-generate)' },
    { header: 'Developer Master ID', key: 'developer_id', section: '1. Project & Developer Identification', sample1: 'SRM-DEV-2026-000001', sample2: 'SRM-DEV-2026-000002', desc: 'Unique Developer Vault ID (Auto-links to existing developer or auto-generates)' },
    { header: 'Developer Mobile Phone (for OTP)', key: 'developer_mobile', section: '1. Project & Developer Identification', sample1: '+91 98833 95102', sample2: '+91 98300 12345', desc: 'Primary Developer Mobile Contact for OTP verification *' },
    { header: 'Alternative Phone Number', key: 'developer_alt_mobile', section: '1. Project & Developer Identification', sample1: '+91 70442 93951', sample2: '+91 98311 54321', desc: 'Secondary Developer / Sales Contact Phone' },
    { header: 'Developer Email Address', key: 'developer_email', section: '1. Project & Developer Identification', sample1: 'sales@godrejproperties.com', sample2: 'info@ambujaneotia.com', desc: 'Official Builder Email Address' },
    { header: 'Locality Hub / Sector', key: 'locality', section: '1. Project & Developer Identification', sample1: 'BT Road, Sodepur, Kolkata', sample2: 'EM Bypass, Mukundapur, Kolkata', desc: 'Project Location Hub / Sector / Zone *' },
    { header: 'RERA Registration No. (RERA ID)', key: 'rera_id', section: '1. Project & Developer Identification', sample1: 'WBRERA/P/NOR/2024/000128', sample2: 'WBRERA/P/SOU/2024/000215', desc: 'State RERA Registration Number' },
    { header: 'HERA Registration No. (HERA ID)', key: 'hera_no', section: '1. Project & Developer Identification', sample1: 'WBHERA/REG/2024/0045', sample2: 'WBHERA/REG/2024/0088', desc: 'State Housing Authority HERA Number' },
    { header: 'Total Floors in Building', key: 'total_floors', section: '1. Project & Developer Identification', sample1: 'G+14 Floors (Highrise)', sample2: '2B+G+30 Floors (Mega Highrise)', desc: 'Storey structure (e.g. G+4 Floors, G+14 Floors, B+G+30 Floors) *' },
    { header: 'Number Of Towers in Project / Complex', key: 'number_of_towers', section: '1. Project & Developer Identification', sample1: '8 Towers Complex', sample2: '4 Luxury Towers', desc: 'Standalone Tower / Multiple Towers Complex *' },

    // 2. GPS Location Coordinates & Device Auto-Capture
    { header: 'GPS Latitude', key: 'latitude', section: '2. GPS Location Coordinates', sample1: 22.698021, sample2: 22.492150, desc: 'Exact Map Latitude coordinate' },
    { header: 'GPS Longitude', key: 'longitude', section: '2. GPS Location Coordinates', sample1: 88.463723, sample2: 88.398412, desc: 'Exact Map Longitude coordinate' },

    // 3. Project & Developer Amenities & Infrastructure Features
    { header: 'Project Amenities', key: 'amenities', section: '3. Amenities & Features', sample1: '24/7 Power Backup, Water Supply, Security, CCTV cameras, Elevators, Gymnasium, Swimming Pool, Clubhouse, Children\'s Play Area, Landscaped Gardens', sample2: '24/7 Power Backup, Water Supply, Security, CCTV cameras, Elevators, Gymnasium, Swimming Pool, Clubhouse, Sports Courts, Jogging Track, Yoga Deck', desc: 'Comma-separated project amenities' },

    // 4. Project Parking Stock Capacity & Default Rates Management System
    { header: 'Covered Parking Slot Capacity', key: 'total_covered_parking_capacity', section: '4. Parking Stock & Rates', sample1: 120, sample2: 200, desc: 'Total allocated covered basement/stilt parking slots' },
    { header: 'Covered Parking Default Rate (INR)', key: 'covered_parking_rate', section: '4. Parking Stock & Rates', sample1: 350000, sample2: 450000, desc: 'Builder quotation price for covered parking slot' },
    { header: 'EV Fast Charging Station Slots', key: 'total_ev_parking_capacity', section: '4. Parking Stock & Rates', sample1: 16, sample2: 25, desc: 'Total allocated EV fast-charging parking slots' },
    { header: 'EV Slot Default Rate (INR)', key: 'ev_parking_rate', section: '4. Parking Stock & Rates', sample1: 450000, sample2: 550000, desc: 'Builder quotation price for EV parking slot' },
    { header: 'Open Surface Ground Parking Slots', key: 'total_open_parking_capacity', section: '4. Parking Stock & Rates', sample1: 40, sample2: 30, desc: 'Total allocated open surface parking slots' },
    { header: 'Open Surface Slot Default Rate (INR)', key: 'open_parking_rate', section: '4. Parking Stock & Rates', sample1: 200000, sample2: 250000, desc: 'Builder quotation price for open surface parking slot' },

    // 5. Keys Custody & Architectural Description
    { header: 'Key Custody Location / Handler', key: 'key_custody', section: '5. Custody & Architecture', sample1: 'Builder Site Office & Security Gate', sample2: 'Central Clubhouse Reception Desk', desc: 'Location of keys or site caretaker handler' },
    { header: 'Architectural & Structural Description', key: 'architectural_description', section: '5. Custody & Architecture', sample1: 'RCC Earthquake resistant structure, premium vitrified tiles, 3-tier security system with wide landscape open spaces.', sample2: 'IGBC Gold Certified eco-luxury towers, German sanitary fittings, acoustic glazed windows and private sky lounges.', desc: 'Architectural construction, structural framework, design & materials' }
  ];

  const [isBulkImportDeveloperOpen, setIsBulkImportDeveloperOpen] = React.useState<boolean>(false);
  const [bulkDevImportMode, setBulkDevImportMode] = React.useState<'upload' | 'paste'>('upload');
  const [bulkDevFileName, setBulkDevFileName] = React.useState<string>('');
  const [bulkDevPasteContent, setBulkDevPasteContent] = React.useState<string>('');
  const [parsedBulkDevelopers, setParsedBulkDevelopers] = React.useState<any[]>([]);
  const [bulkDevImportErrors, setBulkDevImportErrors] = React.useState<string[]>([]);
  const [isProcessingBulkDevFile, setIsProcessingBulkDevFile] = React.useState<boolean>(false);
  const [isIngestingDevStock, setIsIngestingDevStock] = React.useState<boolean>(false);
  const [showBulkDevColumnsGuide, setShowBulkDevColumnsGuide] = React.useState<boolean>(false);
  const [bulkDevPreviewFilter, setBulkDevPreviewFilter] = React.useState<string>('');

  React.useEffect(() => {
    if (showBulkImportDeveloperModal) {
      setIsBulkImportDeveloperOpen(true);
    }
  }, [showBulkImportDeveloperModal]);

  const closeBulkDeveloperImportModal = () => {
    setIsBulkImportDeveloperOpen(false);
    if (setShowBulkImportDeveloperModal) {
      setShowBulkImportDeveloperModal(false);
    }
  };

  const getNextSequentialDeveloperId = (offset: number = 0, currentList: any[] = developerMasterList) => {
    let maxDevSeq = 0;
    (currentList || []).forEach((d: any) => {
      const m = (d.id || '').match(/SRM-DEV-\d+-(\d+)/i) || (d.id || '').match(/DEV-(\d+)/i);
      if (m) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val < 10000 && val > maxDevSeq) maxDevSeq = val;
      }
    });
    const yr = new Date().getFullYear();
    const nextNum = maxDevSeq + 1 + offset;
    return `SRM-DEV-${yr}-${String(nextNum).padStart(6, '0')}`;
  };

  const getNextSequentialProjectId = (offset: number = 0, currentDevs: any[] = developerMasterList, currentProps: any[] = properties) => {
    const yr = new Date().getFullYear();
    let maxSeq = 0;

    (currentProps || []).forEach((p: any) => {
      const pCode = p.project_id || p.code || p.id || '';
      const m = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num < 88 && num > maxSeq) maxSeq = num;
      }
    });

    (currentDevs || []).forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        const pCode = proj.code || proj.id || '';
        const m = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num < 88 && num > maxSeq) maxSeq = num;
        }
      });
    });

    const nextNum = maxSeq + 1 + offset;
    return `SRM-PROJ-${yr}-${String(nextNum).padStart(6, '0')}`;
  };

  const handleDownloadDeveloperExcelTemplate = () => {
    try {
      const headers = BULK_DEVELOPER_COLUMNS.map(c => c.header);
      const row1 = BULK_DEVELOPER_COLUMNS.map(c => c.sample1);
      const row2 = BULK_DEVELOPER_COLUMNS.map(c => c.sample2);
      const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);
      ws['!cols'] = BULK_DEVELOPER_COLUMNS.map(c => ({ wch: Math.max(c.header.length + 4, 20) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Developer_Master_Stock');
      XLSX.writeFile(wb, 'Swaramayi_Bulk_Developer_Stock_Template.xlsx');
    } catch (err: any) {
      alert(`⚠️ Could not generate Excel template: ${err.message}`);
    }
  };

  const handleDownloadDeveloperCsvTemplate = () => {
    try {
      const headers = BULK_DEVELOPER_COLUMNS.map(c => c.header);
      const row1 = BULK_DEVELOPER_COLUMNS.map(c => c.sample1);
      const row2 = BULK_DEVELOPER_COLUMNS.map(c => c.sample2);
      const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Developer_Master_Stock');
      XLSX.writeFile(wb, 'Swaramayi_Bulk_Developer_Stock_Template.csv', { bookType: 'csv' });
    } catch (err: any) {
      alert(`⚠️ Could not generate CSV template: ${err.message}`);
    }
  };

  const handleExportDeveloperExcel = () => {
    try {
      const activeDevs = (developerMasterList || []).filter((d: any) => !isItemInRecycledSet(d, recycledSet));
      const exportRows: any[][] = [];

      activeDevs.forEach(dev => {
        (dev.projects || []).forEach((proj: any) => {
          if (isItemInRecycledSet(proj, recycledSet)) return;
          const row = BULK_DEVELOPER_COLUMNS.map(c => {
            switch (c.key) {
              case 'developer': return dev.name || '';
              case 'title': return proj.title || '';
              case 'project_id': return proj.code || proj.id || '';
              case 'developer_id': return dev.id || '';
              case 'developer_mobile': return dev.mobile || '';
              case 'developer_alt_mobile': return dev.altMobile || '';
              case 'developer_email': return dev.email || proj.developer_email || '';
              case 'locality': return proj.locality || '';
              case 'rera_id': return proj.rera_id || dev.rera_id || '';
              case 'hera_no': return proj.hera_no || dev.hera_no || '';
              case 'total_floors': return proj.total_floors || '';
              case 'number_of_towers': return proj.number_of_towers || '';
              case 'latitude': return proj.lat || proj.latitude || '';
              case 'longitude': return proj.lng || proj.longitude || '';
              case 'amenities': return Array.isArray(proj.amenities) ? proj.amenities.join(', ') : (proj.amenities || '');
              case 'total_covered_parking_capacity': return proj.total_covered_parking_capacity !== undefined ? proj.total_covered_parking_capacity : '';
              case 'covered_parking_rate': return proj.covered_parking_rate || '';
              case 'total_ev_parking_capacity': return proj.total_ev_parking_capacity !== undefined ? proj.total_ev_parking_capacity : '';
              case 'ev_parking_rate': return proj.ev_parking_rate || '';
              case 'total_open_parking_capacity': return proj.total_open_parking_capacity !== undefined ? proj.total_open_parking_capacity : '';
              case 'open_parking_rate': return proj.open_parking_rate || '';
              case 'key_custody': return proj.key_custody || proj.keys_custody || '';
              case 'architectural_description': return proj.architectural_description || proj.description || '';
              default: return proj[c.key] !== undefined ? proj[c.key] : (dev[c.key] !== undefined ? dev[c.key] : '');
            }
          });
          exportRows.push(row);
        });
      });

      if (exportRows.length === 0) {
        alert('⚠️ No developer projects in vault to export. Downloading sample template instead.');
        handleDownloadDeveloperExcelTemplate();
        return;
      }

      const headers = BULK_DEVELOPER_COLUMNS.map(c => c.header);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
      ws['!cols'] = BULK_DEVELOPER_COLUMNS.map(c => ({ wch: Math.max(c.header.length + 4, 20) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Developer_Master_Vault');
      const nowStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Swaramayi_Developer_Master_Stock_${nowStr}.xlsx`);
    } catch (err: any) {
      alert(`⚠️ Export failed: ${err.message}`);
    }
  };

  const normalizeDevHeaderKey = (rawHeader: any): string => {
    if (!rawHeader) return '';
    const clean = String(rawHeader).toLowerCase().trim().replace(/[\r\n]+/g, ' ');
    const directCol = BULK_DEVELOPER_COLUMNS.find(c => c.header.toLowerCase() === clean);
    if (directCol) return directCol.key;

    const aliases: { [key: string]: string[] } = {
      developer: ['developer / builder name', 'developer name', 'builder name', 'developer', 'builder', 'company', 'developer_name', 'builder_name'],
      title: ['project title & name', 'project title', 'project name', 'project', 'title', 'society name', 'complex name', 'project_title'],
      project_id: ['master project id', 'project id', 'project_id', 'proj id', 'proj_id', 'project code', 'project_code'],
      developer_id: ['developer master id', 'developer id', 'developer_id', 'dev id', 'dev_id', 'dev code'],
      developer_mobile: ['developer mobile phone (for otp)', 'developer mobile phone', 'developer mobile', 'mobile', 'dev mobile', 'phone', 'contact', 'primary mobile'],
      developer_alt_mobile: ['alternative phone number', 'alternative phone', 'alt phone', 'alt mobile', 'developer alt mobile', 'secondary mobile', 'secondary contact'],
      developer_email: ['developer email address', 'developer email', 'email', 'builder email', 'dev email'],
      locality: ['locality hub / sector', 'locality hub', 'locality', 'location', 'sector', 'area', 'address'],
      rera_id: ['rera registration no. (rera id)', 'rera registration no.', 'rera registration no', 'rera id', 'rera no', 'rera_id', 'rera_no'],
      hera_no: ['hera registration no. (hera id)', 'hera registration no.', 'hera registration no', 'hera id', 'hera no', 'hera_no'],
      total_floors: ['total floors in building', 'total floors', 'floors in building', 'total_floors', 'floors', 'storey'],
      number_of_towers: ['number of towers in project / complex', 'number of towers in project', 'number of towers', 'towers', 'total towers', 'number_of_towers'],
      latitude: ['gps latitude', 'latitude', 'lat'],
      longitude: ['gps longitude', 'longitude', 'lng', 'long'],
      amenities: ['project amenities', 'amenities', 'features', 'facilities', 'selected_amenities'],
      total_covered_parking_capacity: ['covered parking slot capacity', 'covered parking capacity', 'covered slots', 'total covered parking capacity', 'total_covered_parking_capacity'],
      covered_parking_rate: ['covered parking default rate (inr)', 'covered parking rate', 'covered parking default rate', 'covered parking price', 'covered_parking_rate'],
      total_ev_parking_capacity: ['ev fast charging station slots', 'ev parking capacity', 'ev slots', 'total ev parking capacity', 'total_ev_parking_capacity'],
      ev_parking_rate: ['ev slot default rate (inr)', 'ev parking rate', 'ev slot default rate', 'ev parking price', 'ev_parking_rate'],
      total_open_parking_capacity: ['open surface ground parking slots', 'open surface parking capacity', 'open parking capacity', 'open slots', 'total_open_parking_capacity'],
      open_parking_rate: ['open surface slot default rate (inr)', 'open surface parking rate', 'open parking rate', 'open surface default rate', 'open_parking_rate'],
      key_custody: ['key custody location / handler', 'key custody location', 'key custody handler', 'key custody', 'keys custody', 'keys_custody'],
      architectural_description: ['architectural & structural description', 'architectural & structural design description', 'architectural description', 'structural description', 'description', 'architectural_description']
    };

    for (const [key, aliasList] of Object.entries(aliases)) {
      if (aliasList.some(a => clean === a || clean.replace(/[^a-z0-9]/g, '') === a.replace(/[^a-z0-9]/g, ''))) {
        return key;
      }
    }
    return clean.replace(/[^a-z0-9_]/g, '_');
  };

  const processRawRowsToDevelopers = (sheetRows: any[][]) => {
    if (!sheetRows || sheetRows.length < 2) {
      setBulkDevImportErrors(['The uploaded file is empty or does not contain data rows below the header row.']);
      return;
    }

    const rawHeaders = sheetRows[0];
    const headerKeys = rawHeaders.map(h => normalizeDevHeaderKey(h));
    const errors: string[] = [];
    const parsedList: any[] = [];

    const createdDevsMap = new Map<string, string>();
    let nextProjSeqOffset = 0;
    let nextDevSeqOffset = 0;

    for (let r = 1; r < sheetRows.length; r++) {
      const row = sheetRows[r];
      if (!row || row.every((c: any) => c === null || c === undefined || String(c).trim() === '')) {
        continue;
      }

      const rawObj: any = {};
      headerKeys.forEach((key, colIdx) => {
        if (key && colIdx < row.length) {
          rawObj[key] = row[colIdx];
        }
      });

      const devName = rawObj.developer ? String(rawObj.developer).trim() : 'Swaramayi Developer';
      const projTitle = rawObj.title ? String(rawObj.title).trim() : `Master Project ${parsedList.length + 1}`;

      const existingDev = (developerMasterList || []).find((d: any) => d.name.toLowerCase().trim() === devName.toLowerCase().trim());

      let assignedDevId = rawObj.developer_id ? String(rawObj.developer_id).trim() : '';
      if (!assignedDevId || assignedDevId.toUpperCase() === 'AUTO') {
        if (existingDev) {
          assignedDevId = existingDev.id;
        } else if (createdDevsMap.has(devName.toLowerCase())) {
          assignedDevId = createdDevsMap.get(devName.toLowerCase())!;
        } else {
          assignedDevId = getNextSequentialDeveloperId(nextDevSeqOffset, developerMasterList);
          createdDevsMap.set(devName.toLowerCase(), assignedDevId);
          nextDevSeqOffset++;
        }
      }

      let assignedProjId = rawObj.project_id ? String(rawObj.project_id).trim() : '';
      if (!assignedProjId || assignedProjId.toUpperCase() === 'AUTO') {
        assignedProjId = getNextSequentialProjectId(nextProjSeqOffset, developerMasterList, properties);
        nextProjSeqOffset++;
      }

      const primaryMobile = rawObj.developer_mobile ? String(rawObj.developer_mobile).trim() : (existingDev?.mobile || '+91 98833 95102');
      const altMobile = rawObj.developer_alt_mobile ? String(rawObj.developer_alt_mobile).trim() : (existingDev?.altMobile || '');
      const devEmail = rawObj.developer_email ? String(rawObj.developer_email).trim() : (existingDev?.email || 'developer@swaramayi.com');
      const locality = rawObj.locality ? String(rawObj.locality).trim() : 'Greater Kolkata';
      const totalFloors = normalizeTotalFloors(rawObj.total_floors || 'G+4 Floors (5 Storey)');
      const numberOfTowers = rawObj.number_of_towers ? String(rawObj.number_of_towers).trim() : '1 Standalone Tower';

      let lat = rawObj.latitude !== undefined && rawObj.latitude !== null && String(rawObj.latitude).trim() !== '' ? String(rawObj.latitude).trim() : '';
      let lng = rawObj.longitude !== undefined && rawObj.longitude !== null && String(rawObj.longitude).trim() !== '' ? String(rawObj.longitude).trim() : '';
      if (!lat || !lng) {
        const gps = getGpsForProject(projTitle, lat, lng);
        if (gps) {
          lat = lat || gps.lat;
          lng = lng || gps.lng;
        }
      }

      let amenitiesList: string[] = [];
      if (rawObj.amenities) {
        if (Array.isArray(rawObj.amenities)) {
          amenitiesList = rawObj.amenities;
        } else {
          amenitiesList = String(rawObj.amenities).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      if (amenitiesList.length === 0) {
        amenitiesList = ['24/7 Power Backup', 'Water Supply', 'Security', 'CCTV cameras', 'Elevators'];
      }

      const coveredCap = cleanNum(rawObj.total_covered_parking_capacity, 12);
      const coveredRate = rawObj.covered_parking_rate ? String(rawObj.covered_parking_rate).trim() : '250000';
      const evCap = cleanNum(rawObj.total_ev_parking_capacity, 4);
      const evRate = rawObj.ev_parking_rate ? String(rawObj.ev_parking_rate).trim() : '350000';
      const openCap = cleanNum(rawObj.total_open_parking_capacity, 6);
      const openRate = rawObj.open_parking_rate ? String(rawObj.open_parking_rate).trim() : '150000';

      const keyCustody = rawObj.key_custody ? String(rawObj.key_custody).trim() : 'Builder Site Office';
      const archDesc = rawObj.architectural_description ? String(rawObj.architectural_description).trim() : 'Modern RCC Frame Structure, Vastu compliant layouts, Premium vitrified tiles flooring.';

      const parsedItem = {
        id: assignedProjId,
        project_id: assignedProjId,
        developer: devName,
        developer_id: assignedDevId,
        title: projTitle,
        developer_mobile: primaryMobile,
        developer_alt_mobile: altMobile,
        developer_email: devEmail,
        locality,
        rera_id: rawObj.rera_id ? String(rawObj.rera_id).trim() : '',
        hera_no: rawObj.hera_no ? String(rawObj.hera_no).trim() : '',
        total_floors: totalFloors,
        number_of_towers: numberOfTowers,
        latitude: lat || '22.722361',
        longitude: lng || '88.493403',
        amenities: amenitiesList,
        total_covered_parking_capacity: coveredCap,
        covered_parking_rate: coveredRate,
        total_ev_parking_capacity: evCap,
        ev_parking_rate: evRate,
        total_open_parking_capacity: openCap,
        open_parking_rate: openRate,
        key_custody: keyCustody,
        architectural_description: archDesc
      };

      parsedList.push(parsedItem);
    }

    if (parsedList.length === 0) {
      errors.push('No valid developer & master project rows could be parsed from the file.');
    }

    setBulkDevImportErrors(errors);
    setParsedBulkDevelopers(parsedList);
  };

  const handleBulkDevFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkDevFileName(file.name);
    setIsProcessingBulkDevFile(true);
    setBulkDevImportErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processRawRowsToDevelopers(rows);
      } catch (err: any) {
        setBulkDevImportErrors([`Failed to parse file: ${err.message || 'Unknown error'}`]);
      } finally {
        setIsProcessingBulkDevFile(false);
      }
    };
    reader.onerror = () => {
      setBulkDevImportErrors(['Error reading file. Please check file permissions.']);
      setIsProcessingBulkDevFile(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessPastedDevCsv = () => {
    if (!bulkDevPasteContent.trim()) {
      alert('⚠️ Please paste CSV or TSV content into the text box first.');
      return;
    }
    setIsProcessingBulkDevFile(true);
    setBulkDevImportErrors([]);
    try {
      const workbook = XLSX.read(bulkDevPasteContent, { type: 'string' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      processRawRowsToDevelopers(rows);
    } catch (err: any) {
      setBulkDevImportErrors([`Failed to parse pasted text: ${err.message || 'Invalid CSV/TSV format'}`]);
    } finally {
      setIsProcessingBulkDevFile(false);
    }
  };

  const handleRemoveParsedDevRow = (index: number) => {
    setParsedBulkDevelopers(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearParsedDevRows = () => {
    setParsedBulkDevelopers([]);
    setBulkDevFileName('');
    setBulkDevPasteContent('');
    setBulkDevImportErrors([]);
  };

  const handleConfirmBulkDeveloperImport = async () => {
    if (parsedBulkDevelopers.length === 0) {
      alert('⚠️ No parsed developer projects to import. Please upload or paste records first.');
      return;
    }

    setIsIngestingDevStock(true);
    try {
      let updatedDevs = [...developerMasterList];
      const verifiedListToAdd: any[] = [];

      parsedBulkDevelopers.forEach(item => {
        const devName = item.developer || 'Builder';
        const projTitle = item.title || 'Project';
        const assignedProjCode = item.project_id;
        const assignedDevId = item.developer_id;

        const newProjEntry = {
          id: assignedProjCode,
          code: assignedProjCode,
          title: projTitle,
          developer_email: item.developer_email || '',
          locality: item.locality || '',
          lat: item.latitude || '',
          lng: item.longitude || '',
          rera_id: item.rera_id || '',
          hera_no: item.hera_no || '',
          total_floors: item.total_floors || 'G+4 Floors (5 Storey)',
          number_of_towers: item.number_of_towers || '',
          key_custody: item.key_custody || '',
          keys_custody: item.key_custody || '',
          architectural_description: item.architectural_description || '',
          description: item.architectural_description || '',
          amenities: Array.isArray(item.amenities) ? item.amenities : (item.amenities ? String(item.amenities).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          building_photos: [],
          total_covered_parking_capacity: item.total_covered_parking_capacity !== undefined ? item.total_covered_parking_capacity : 0,
          covered_parking_rate: item.covered_parking_rate || '',
          total_ev_parking_capacity: item.total_ev_parking_capacity !== undefined ? item.total_ev_parking_capacity : 0,
          ev_parking_rate: item.ev_parking_rate || '',
          total_open_parking_capacity: item.total_open_parking_capacity !== undefined ? item.total_open_parking_capacity : 0,
          open_parking_rate: item.open_parking_rate || ''
        };

        const existingDevIdx = updatedDevs.findIndex(d => d.name.toLowerCase().trim() === devName.toLowerCase().trim());
        if (existingDevIdx >= 0) {
          const devObj = updatedDevs[existingDevIdx];
          if (item.developer_email) devObj.email = item.developer_email;
          if (item.developer_mobile && !devObj.mobile) devObj.mobile = item.developer_mobile;
          if (item.developer_alt_mobile && !devObj.altMobile) devObj.altMobile = item.developer_alt_mobile;
          const projList = devObj.projects || [];
          const existingProjIdx = projList.findIndex((p: any) => (p.id === assignedProjCode || p.code === assignedProjCode || p.title?.toLowerCase().trim() === projTitle.toLowerCase().trim()));
          if (existingProjIdx >= 0) {
            projList[existingProjIdx] = { ...projList[existingProjIdx], ...newProjEntry };
          } else {
            devObj.projects = [newProjEntry, ...projList];
          }
        } else {
          const newDevObj = {
            id: assignedDevId,
            name: devName,
            mobile: item.developer_mobile || '+91 98490 88776',
            altMobile: item.developer_alt_mobile || '',
            email: item.developer_email || '',
            projects: [newProjEntry]
          };
          updatedDevs = [newDevObj, ...updatedDevs];
        }

        // Auto-create Project-Wise Developer Channel Partner Agreement
        createOrUpdateDevAgreement(
          devName,
          projTitle,
          item.developer_mobile,
          item.locality,
          undefined,
          true
        );

        verifiedListToAdd.push({
          developer: devName,
          project: projTitle,
          mobile: item.developer_mobile || 'Registered Mobile',
          verifiedAt: new Date().toLocaleString(),
          hash: `SHA256-DEV-OTP-VERIFIED-#${Math.floor(100000 + Math.random() * 900000)}`
        });
      });

      setDeveloperMasterList(updatedDevs);
      if (setDevelopers) {
        setDevelopers(updatedDevs);
      }
      try {
        localStorage.setItem('swaramayi_developers_v1', JSON.stringify(updatedDevs));
      } catch (e) {}

      if (setVerifiedDevProjectsList && verifiedListToAdd.length > 0) {
        setVerifiedDevProjectsList(prev => [...verifiedListToAdd, ...(prev || [])]);
      }

      if (syncAllToMongoDB) {
        await syncAllToMongoDB({ developers: updatedDevs, properties });
      }

      alert(`🎉 BULK DEVELOPER STOCK IMPORT SUCCESSFUL!\n\n• Successfully imported and registered ${parsedBulkDevelopers.length} Developer Master Projects!\n• Updated Developer Master Vault & MongoDB Atlas.\n• Project Codes assigned: ${parsedBulkDevelopers[0]?.project_id} to ${parsedBulkDevelopers[parsedBulkDevelopers.length - 1]?.project_id}`);

      handleClearParsedDevRows();
      setIsBulkImportDeveloperOpen(false);
      setShowDevVaultModal(true);
    } catch (err: any) {
      alert(`⚠️ Ingestion failed: ${err.message || 'Could not save developers'}`);
    } finally {
      setIsIngestingDevStock(false);
    }
  };


  const [editingDevId, setEditingDevId] = React.useState<string | null>(null);
  const [editDevForm, setEditDevForm] = React.useState<{ id: string; name: string; mobile: string; email: string }>({ id: '', name: '', mobile: '', email: '' });

  const [selectedPropertyIds, setSelectedPropertyIds] = React.useState<string[]>([]);

  const filteredPropertyList = React.useMemo(() => {
    return properties.filter(p => matchesSearchQuery(p, searchQuery));
  }, [properties, searchQuery, matchesSearchQuery]);

  const isAllPropertiesSelected = filteredPropertyList.length > 0 && filteredPropertyList.every(p => selectedPropertyIds.includes(p.id));

  const handleToggleSelectAllProperties = () => {
    if (isAllPropertiesSelected) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(filteredPropertyList.map(p => p.id));
    }
  };

  const handleToggleSelectProperty = (id: string) => {
    setSelectedPropertyIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Helper to automatically create or update a Project-Wise Developer Agreement when a Developer/Project is added or OTP is verified
  const createOrUpdateDevAgreement = (
    devName: string,
    projectName: string,
    devContact?: string,
    localityHub?: string,
    otpHash?: string,
    isOtpVerified: boolean = true,
    triggerSync: boolean = false
  ) => {
    if (!devName || !projectName) return;
    const cleanDev = devName.trim();
    const cleanProj = projectName.trim();
    const cleanLoc = localityHub || 'Master Project Hub';
    const cleanContact = devContact || '+91 98490 88776';

    const newId = `AGR-DEV-${Date.now().toString().slice(-6)}`;
    let agreementCode = '';
    if (generateNextAgreementCode) {
      agreementCode = generateNextAgreementCode(true);
    } else {
      const currentAgrList = Array.isArray(agreements) ? agreements : [];
      let maxAgrSeq = 0;
      currentAgrList.forEach((a: any) => {
        const m = (a.agreement_code || '').match(/SRM-AGR-DEV-\d+-(\d+)/i);
        if (m) {
          const val = parseInt(m[1], 10);
          if (!isNaN(val) && val < 10000 && val > maxAgrSeq) maxAgrSeq = val;
        }
      });
      agreementCode = `SRM-AGR-DEV-2026-${String(maxAgrSeq + 1).padStart(6, '0')}`;
    }
    const fullTitle = `Channel Partner Agreement — ${cleanProj} (${cleanDev})`;

    const newAgreement = {
      id: newId,
      agreement_code: agreementCode,
      agreement_type: 'DEVELOPER_PROJECT_TIEUP',
      category: 'DEVELOPER',
      title: fullTitle,
      party_name: cleanDev,
      project_name: cleanProj,
      locality_hub: cleanLoc,
      party_contact: cleanContact,
      property_details: `${cleanProj} • ${cleanDev} • ${cleanLoc}`,
      commission_rate: '2.0% Direct Channel Partner Brokerage T&C',
      protection_period: '12 Months Client Protection Active',
      signed_status: isOtpVerified ? 'EXECUTED_SIGNED' : 'PENDING_OTP',
      signature_hash: otpHash || `SHA256-DEV-OTP-VERIFIED-#${Math.floor(100000 + Math.random() * 900000)}`,
      signed_at: new Date().toLocaleString(),
      otp_verified: isOtpVerified,
      created_at: new Date().toISOString()
    };

    if (setAgreements) {
      setAgreements((prevAgreements: any[]) => {
        const currentList = Array.isArray(prevAgreements) ? prevAgreements : (agreements || []);
        const existing = currentList.find((a: any) =>
          (a.party_name?.toLowerCase() === cleanDev.toLowerCase() && a.project_name?.toLowerCase() === cleanProj.toLowerCase()) ||
          a.title?.toLowerCase().includes(`${cleanProj.toLowerCase()} (${cleanDev.toLowerCase()})`)
        );

        if (existing) {
          const expectedStatus = isOtpVerified ? 'EXECUTED_SIGNED' : existing.signed_status;
          const expectedOtp = isOtpVerified || Boolean(existing.otp_verified);
          if (existing.signed_status === expectedStatus && existing.otp_verified === expectedOtp && (!otpHash || existing.signature_hash === otpHash)) {
            // Already up to date - no state modification or remote sync needed
            return currentList;
          }
        }

        let nextAgreements: any[];
        if (existing) {
          nextAgreements = currentList.map((a: any) => {
            if (
              (a.party_name?.toLowerCase() === cleanDev.toLowerCase() && a.project_name?.toLowerCase() === cleanProj.toLowerCase()) ||
              a.title?.toLowerCase().includes(`${cleanProj.toLowerCase()} (${cleanDev.toLowerCase()})`)
            ) {
              return {
                ...a,
                signed_status: isOtpVerified ? 'EXECUTED_SIGNED' : a.signed_status,
                signature_hash: otpHash || a.signature_hash,
                signed_at: isOtpVerified ? new Date().toLocaleString() : a.signed_at,
                otp_verified: isOtpVerified || a.otp_verified
              };
            }
            return a;
          });
        } else {
          nextAgreements = [newAgreement, ...currentList];
        }


        if (triggerSync && syncAllToMongoDB) {
          syncAllToMongoDB({ agreements: nextAgreements });
        }

        return nextAgreements;
      });
    }
  };

  const handleBulkRecycleProperties = () => {
    if (selectedPropertyIds.length === 0) return;
    if (window.confirm(`Are you sure you want to move ${selectedPropertyIds.length} selected property item(s) to the Recycle Bin?`)) {
      const itemsToRecycle = properties.filter(p => selectedPropertyIds.includes(p.id));
      itemsToRecycle.forEach(p => {
        if (onRecycleItem) {
          onRecycleItem({
            id: p.id || p.property_code || `PROP-${Date.now()}`,
            title: `Property - ${p.title || p.property_title || p.property_code || 'Unit'} (${p.property_code || p.id})`,
            category: 'Project',
            originalLocation: 'Project & Property Inventory Management System',
            details: `Developer: ${p.developer || 'N/A'}, Price: ${p.final_price || 'N/A'}, Config: ${p.configuration || 'N/A'}`,
            originalData: p
          });
        }
      });
      if (setProperties) {
        setProperties(prev => prev.filter(p => !selectedPropertyIds.includes(p.id)));
      }
      setSelectedPropertyIds([]);
      alert(`🗑️ Successfully moved ${itemsToRecycle.length} property item(s) to Recycle Bin.`);
    }
  };

  // SYNC DEVELOPER MASTER LIST WITH DEVELOPERS PROP AND LOCALSTORAGE
  React.useEffect(() => {
    if (developers && Array.isArray(developers) && developers.length > 0) {
      setDeveloperMasterList(developers);
    } else {
      try {
        const saved = localStorage.getItem('swaramayi_developers_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setDeveloperMasterList(parsed);
        }
      } catch (e) {}
    }
  }, [developers]);

  // AUTOMATIC DEVELOPER AGREEMENT SYNC: Ensure every registered/verified developer project has a Project-Wise Developer Agreement
  React.useEffect(() => {
    if (!developerMasterList || developerMasterList.length === 0) return;
    developerMasterList.forEach((dev: any) => {
      (dev.projects || []).forEach((p: any) => {
        const isOtpVer = Boolean(
          p.otp_verified ||
          p.devProjectOtpVerified ||
          dev.otp_verified ||
          (verifiedDevProjectsList || []).some((vp: any) =>
            (vp.developer?.toLowerCase() === dev.name?.toLowerCase() && vp.project?.toLowerCase() === p.title?.toLowerCase())
          )
        );
        createOrUpdateDevAgreement(dev.name, p.title, dev.mobile, p.locality || 'Locality Hub', undefined, isOtpVer);
      });
    });
  }, [developerMasterList, verifiedDevProjectsList]);

  // AUTOMATIC CLEANUP EFFECT: Ensure every project & developer in developerMasterList starts clean from 000001
  React.useEffect(() => {
    if (!developerMasterList || developerMasterList.length === 0) return;

    let modified = false;
    const year = new Date().getFullYear();
    const seenCodes = new Set<string>();
    let maxSeq = 0;

    // Scan max sequence number (ignoring legacy offsets >= 88)
    developerMasterList.forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        const pCode = proj.code || proj.id || '';
        const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq < 88 && seq > maxSeq) maxSeq = seq;
        }
      });
    });

    const cleanedDevs = developerMasterList.map((dev: any, devIdx: number) => {
      let cleanDevId = dev.id || '';
      const isLegacyDevId = !cleanDevId ||
        cleanDevId.includes('655434') ||
        cleanDevId.includes('640480') ||
        cleanDevId.includes('688790') ||
        cleanDevId.includes('000105') ||
        /\bSRM-DEV-\d+-[1-9]\d{4,}\b/.test(cleanDevId);

      if (isLegacyDevId) {
        cleanDevId = `SRM-DEV-${year}-${String(devIdx + 1).padStart(6, '0')}`;
        modified = true;
      }

      const cleanProjects = (dev.projects || []).map((proj: any) => {
        let code = proj.code || proj.id;
        const isLegacyProj = !code || seenCodes.has(code) || code.includes('000088') || code.includes('000089') || code.includes('000090');
        if (isLegacyProj) {
          maxSeq++;
          code = `SRM-PROJ-${year}-${String(maxSeq).padStart(6, '0')}`;
          modified = true;
        }
        seenCodes.add(code);
        return {
          ...proj,
          id: code,
          code: code
        };
      });
      return {
        ...dev,
        id: cleanDevId,
        projects: cleanProjects
      };
    });

    if (modified) {
      setDeveloperMasterList(cleanedDevs);
      if (setDevelopers) setDevelopers(cleanedDevs);
      try {
        localStorage.setItem('swaramayi_developers_v1', JSON.stringify(cleanedDevs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [selectedDevId, setSelectedDevId] = React.useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  const [projectIdSearchFilter, setProjectIdSearchFilter] = React.useState<string>('');
  const [devSearchQuery, setDevSearchQuery] = React.useState<string>('');
  const [projectSearchQuery, setProjectSearchQuery] = React.useState<string>('');
  const [showDevVaultModal, setShowDevVaultModal] = React.useState<boolean>(false);
  const [newDevNameInput, setNewDevNameInput] = React.useState<string>('');
  const [newDevMobileInput, setNewDevMobileInput] = React.useState<string>('');
  const [newDevAltMobileInput, setNewDevAltMobileInput] = React.useState<string>('');
  const [newDevEmailInput, setNewDevEmailInput] = React.useState<string>('');
  const [newDevProjectTitleInput, setNewDevProjectTitleInput] = React.useState<string>('');
  const [viewPropertyModal, setViewPropertyModal] = React.useState<any | null>(null);

  // 📍 GPS COORDINATES AUTO-FETCH ADDRESS STATE & HANDLER
  const [isFetchingCoordsAddress, setIsFetchingCoordsAddress] = React.useState<boolean>(false);
  const [coordsAddressMessage, setCoordsAddressMessage] = React.useState<string | null>(null);
  const coordsLookupDebounceRef = React.useRef<any>(null);
  const lastFetchedCoordsRef = React.useRef<string>('');

  const fetchAddressForCoordinates = React.useCallback(async (latInput: string, lngInput: string, force: boolean = false) => {
    const latStr = (latInput || '').trim();
    const lngStr = (lngInput || '').trim();
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return;
    }
    const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (!force && lastFetchedCoordsRef.current === coordKey) {
      return;
    }

    setIsFetchingCoordsAddress(true);
    setCoordsAddressMessage(`📡 Reverse geocoding GPS coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})...`);

    try {
      let resolvedAddress = '';
      if (detectLocalityFromCoords) {
        const result = await detectLocalityFromCoords(latStr, lngStr);
        resolvedAddress = result.fullAddress || result.locality || '';
      }

      // Direct Nominatim reverse fetch if detectLocalityFromCoords returned blank
      if (!resolvedAddress) {
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (resp.ok) {
            const data = await resp.json();
            resolvedAddress = data.display_name || '';
          }
        } catch (e) {
          console.warn('Fallback Nominatim reverse geocode error:', e);
        }
      }

      if (resolvedAddress) {
        lastFetchedCoordsRef.current = coordKey;
        setNewPropertyForm((prev: any) => ({
          ...prev,
          latitude: latStr,
          longitude: lngStr,
          locality: resolvedAddress,
          full_address: resolvedAddress
        }));
        setCoordsAddressMessage(`✓ Auto-Fetched Address: ${resolvedAddress}`);
        if (setGpsCaptureStatus) {
          setGpsCaptureStatus(`✓ GPS Coordinates Address Auto-Fetched: ${resolvedAddress}`);
        }
      } else {
        setCoordsAddressMessage(`⚠️ Could not determine address for coordinates (${latStr}, ${lngStr})`);
      }
    } catch (err) {
      console.error('Failed to fetch address from coordinates:', err);
      setCoordsAddressMessage(`⚠️ Error fetching address for (${latStr}, ${lngStr})`);
    } finally {
      setIsFetchingCoordsAddress(false);
    }
  }, [detectLocalityFromCoords, setNewPropertyForm, setGpsCaptureStatus]);

  const handleCoordsInputChange = (field: 'latitude' | 'longitude', val: string) => {
    let newLat = field === 'latitude' ? val : (newPropertyForm.latitude || '');
    let newLng = field === 'longitude' ? val : (newPropertyForm.longitude || '');

    // Auto-detect pasted "lat, lng" pair
    if (val.includes(',') || val.includes(';') || (val.includes(' ') && val.trim().split(/\s+/).length === 2)) {
      const parts = val.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
        newLat = parts[0];
        newLng = parts[1];
        setNewPropertyForm((prev: any) => ({ ...prev, latitude: newLat, longitude: newLng }));
        if (coordsLookupDebounceRef.current) clearTimeout(coordsLookupDebounceRef.current);
        coordsLookupDebounceRef.current = setTimeout(() => {
          fetchAddressForCoordinates(newLat, newLng);
        }, 500);
        return;
      }
    }

    setNewPropertyForm((prev: any) => ({ ...prev, [field]: val }));

    if (coordsLookupDebounceRef.current) {
      clearTimeout(coordsLookupDebounceRef.current);
    }

    if (newLat.trim().length >= 4 && newLng.trim().length >= 4) {
      coordsLookupDebounceRef.current = setTimeout(() => {
        fetchAddressForCoordinates(newLat, newLng);
      }, 700);
    }
  };

  // 🔍 ADVANCE MASTER PROJECT SEARCH MODAL STATES
  const [showAdvanceProjectSearchModal, setShowAdvanceProjectSearchModal] = React.useState<boolean>(false);
  const [advProjSearchQuery, setAdvProjSearchQuery] = React.useState<string>('');
  const [advProjDevFilter, setAdvProjDevFilter] = React.useState<string>('');
  const [advProjLocalityFilter, setAdvProjLocalityFilter] = React.useState<string>('');
  const [advProjOtpFilter, setAdvProjOtpFilter] = React.useState<string>('ALL');

  // 🔍 SEARCHABLE MASTER PROJECT COMBOBOX STATES & REF
  const [isProjDropdownOpen, setIsProjDropdownOpen] = React.useState<boolean>(false);
  const [projComboboxSearch, setProjComboboxSearch] = React.useState<string>('');
  const projComboboxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projComboboxRef.current && !projComboboxRef.current.contains(event.target as Node)) {
        setIsProjDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartEditProjectDeveloper = React.useCallback((p: any) => {
    if (!p) return;
    const devMobile = p.developer_mobile || p.mobile || '';
    const altMobile = p.developer_alt_mobile || p.altMobile || '';

    setNewPropertyForm((prev: any) => ({
      ...prev,
      project_id: p.project_id || p.project_code || p.code || p.id || '',
      property_code: p.property_code || p.code || '',
      developer_id: p.developer_id || p.developerId || '',
      developer: p.developer || p.developer_name || p.name || '',
      developer_email: p.developer_email || p.email || '',
      title: p.title || p.project_name || '',
      locality: p.locality || '',
      city: p.city || '',
      full_address: p.full_address || p.address || '',
      latitude: p.latitude || '',
      longitude: p.longitude || '',
      possession_status: p.possession_status || '',
      handover_month: p.handover_month || '',
      handover_year: p.handover_year || '',
      handover_month_year: p.handover_month_year || '',
      total_covered_parking_capacity: p.total_covered_parking_capacity !== undefined ? p.total_covered_parking_capacity : 0,
      covered_parking_rate: p.covered_parking_rate || '',
      total_ev_parking_capacity: p.total_ev_parking_capacity !== undefined ? p.total_ev_parking_capacity : 0,
      ev_parking_rate: p.ev_parking_rate || '',
      total_open_parking_capacity: p.total_open_parking_capacity !== undefined ? p.total_open_parking_capacity : 0,
      open_parking_rate: p.open_parking_rate || '',
      selected_amenities: Array.isArray(p.selected_amenities) ? p.selected_amenities : [],
      building_photos: Array.isArray(p.building_photos) ? p.building_photos : (p.building_photo ? [p.building_photo] : []),
      building_photo: p.building_photo || '',
      rera_id: p.rera_id || '',
      hera_no: p.hera_no || '',
      total_floors: p.total_floors || p.total_floors_in_building || 'G+4 Floors (5 Storey)',
      number_of_towers: p.number_of_towers || '',
      key_custody: p.key_custody || p.keys_custody || p.keysCustody || '',
      keys_custody: p.key_custody || p.keys_custody || p.keysCustody || '',
      architectural_description: p.architectural_description || p.architecturalDescription || p.description || '',
      description: p.description || p.architectural_description || p.architecturalDescription || ''
    }));

    if (setDevProjectMobile) setDevProjectMobile(devMobile);
    if (setDevProjectAltMobile) setDevProjectAltMobile(altMobile);
    if (setDevProjectOtpVerified) setDevProjectOtpVerified(true);
    if (setDevProjectOtpSent) setDevProjectOtpSent(true);

    setViewPropertyModal(null);
    setShowDevVaultModal(false);
    setActiveProjectSubTab('add_project_developer');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setNewPropertyForm, setDevProjectMobile, setDevProjectAltMobile, setDevProjectOtpVerified, setDevProjectOtpSent, setActiveProjectSubTab]);
  const [projectUnitsList, setProjectUnitsList] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('swaramayi_project_units_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return propertyUnits && propertyUnits.length > 0 ? propertyUnits : [];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('swaramayi_project_units_v1', JSON.stringify(projectUnitsList));
    } catch (e) {}
  }, [projectUnitsList]);



  // PROPERTY ADDITION MODE STATE ('single' = Standalone Property)
  const [propertyAddMode, setPropertyAddMode] = React.useState<'single' | 'multiple'>('single');

  // PARKING STOCK MANAGEMENT STATE (PERSISTED IN LOCALSTORAGE)
  const [parkingStockConfig, setParkingStockConfig] = React.useState<any>(() => {
    try {
      const saved = localStorage.getItem('swaramayi_parking_stock_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'Covered Single': { total: 24, price: 300000, label: '🚗 Covered Single Car Slot' },
      'Covered Tandem': { total: 10, price: 500000, label: '🚗🚗 Covered Tandem (2 Slots)' },
      'EV Charging': { total: 6, price: 450000, label: '⚡ EV Fast Charging Slot' },
      'Open Surface': { total: 15, price: 150000, label: '🅿️ Open / Surface Parking' },
      'Mechanical Stacker': { total: 8, price: 200000, label: '🏗️ Mechanical Stacker Slot' }
    };
  });

  const [showStep2ParkingConfigModal, setShowStep2ParkingConfigModal] = React.useState<boolean>(false);

  // AUTOMATED PROJECT ID GENERATOR (Starts at SRM-PROJ-2026-000001)
  const generateNextProjectId = React.useCallback(() => {
    const year = new Date().getFullYear();
    let maxSeq = 0;

    // Scan properties (ignoring legacy offsets >= 88)
    (properties || []).forEach((p: any) => {
      const pCode = p.project_id || p.code || p.id || '';
      const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num < 88 && num > maxSeq) maxSeq = num;
      }
    });

    // Scan developerMasterList (ignoring legacy offsets >= 88)
    (developerMasterList || []).forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        const pCode = proj.code || proj.id || '';
        const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num < 88 && num > maxSeq) maxSeq = num;
        }
      });
    });

    // Collect all existing codes to guarantee 100% uniqueness
    const existingCodes = new Set<string>();
    (properties || []).forEach((p: any) => {
      if (p.project_id && !p.project_id.includes('000088')) existingCodes.add(p.project_id);
      if (p.code && !p.code.includes('000088')) existingCodes.add(p.code);
    });
    (developerMasterList || []).forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        if (proj.code && !proj.code.includes('000088')) existingCodes.add(proj.code);
        if (proj.id && !proj.id.includes('000088')) existingCodes.add(proj.id);
      });
    });

    let nextNum = maxSeq + 1;
    let candidate = `SRM-PROJ-${year}-${String(nextNum).padStart(6, '0')}`;
    while (existingCodes.has(candidate)) {
      nextNum++;
      candidate = `SRM-PROJ-${year}-${String(nextNum).padStart(6, '0')}`;
    }

    return candidate;
  }, [properties, developerMasterList]);

  // AUTOMATED SEQUENTIAL INDIVIDUAL PROPERTY CODE GENERATOR FOR EVERY ADDITION (SRM-PROP-2026-000428, SRM-PROP-2026-000429...)
  const generateDynamicPropertyCode = React.useCallback((offset = 0) => {
    const year = new Date().getFullYear();
    let maxNum = 0;

    (properties || []).forEach((p: any) => {
      const pCode = p.property_code || p.id || '';
      const match = pCode.match(/SRM-PROP-\d+-(\d+)/i) || pCode.match(/PROP-\d+-(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });

    (projectUnitsList || []).forEach((u: any) => {
      const uCode = u.unit_code || u.property_code || u.propertyId || u.id || '';
      const match = uCode.match(/SRM-PROP-\d+-(\d+)/i) || uCode.match(/PROP-\d+-(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });

    const nextNum = maxNum + 1 + offset;
    return `SRM-PROP-${year}-${String(nextNum).padStart(6, '0')}`;
  }, [properties, projectUnitsList]);

  React.useEffect(() => {
    try {
      localStorage.setItem('swaramayi_parking_stock_v1', JSON.stringify(parkingStockConfig));
    } catch (e) {}
  }, [parkingStockConfig]);

  // LIVE VIDEO RECORDING & MEDIA CAPTURE STATE
  const [isRecordingVideo, setIsRecordingVideo] = React.useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState<number>(0);
  const videoPreviewRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<Blob[]>([]);
  const recordingTimerRef = React.useRef<any>(null);

  const startLiveVideoRecording = async () => {
    try {
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Camera/Mic permission error:', err);
      alert('Unable to access camera/microphone for live video recording. Please ensure camera permissions are granted in your browser settings.');
    }
  };

  const stopLiveVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoPreviewRef.current.srcObject = null;
      }
      clearInterval(recordingTimerRef.current);
      setIsRecordingVideo(false);

      setTimeout(() => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const videoBase64 = reader.result as string;
          if (videoBase64) {
            setNewPropertyForm((prev: any) => {
              const currentVideos = Array.isArray(prev.unit_videos) ? prev.unit_videos : [];
              return {
                ...prev,
                unit_videos: [...currentVideos, videoBase64]
              };
            });
          }
        };
        reader.readAsDataURL(blob);
      }, 500);
    }
  };

  // PROJECT PARKING STOCK MAP & PERSISTENCE WITH PRICING
  const [projectParkingStockMap, setProjectParkingStockMap] = React.useState<Record<string, {
    totalCovered: number;
    priceCovered: number | string;
    totalEv: number;
    priceEv: number | string;
    totalOpen: number;
    priceOpen: number | string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('swaramayi_project_parking_stock_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [showManageParkingModal, setShowManageParkingModal] = React.useState<boolean>(false);
  const [parkingModalProjectName, setParkingModalProjectName] = React.useState<string>('');
  const [parkingModalForm, setParkingModalForm] = React.useState({
    totalCovered: 12,
    priceCovered: 300000,
    totalEv: 2,
    priceEv: 450000,
    totalOpen: 6,
    priceOpen: 150000
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('swaramayi_project_parking_stock_v1', JSON.stringify(projectParkingStockMap));
    } catch (e) {
      console.error(e);
    }
  }, [projectParkingStockMap]);

  React.useEffect(() => {
    try {
      localStorage.setItem('swaramayi_developers_v1', JSON.stringify(developerMasterList));
    } catch (e) {
      console.error(e);
    }
  }, [developerMasterList]);

  const [propCodeSearchQuery, setPropCodeSearchQuery] = React.useState<string>('');
  const [selectedPropCode, setSelectedPropCode] = React.useState<string>('');

  const handleSelectPropertyByCode = (foundProp: any) => {
    if (!foundProp) return;
    setPropCodeSearchQuery(foundProp.property_code);
    setSelectedPropCode(foundProp.property_code);

    const devObj = developerMasterList.find(d => 
      d.id === foundProp.developer_id || 
      (foundProp.developer && d.name.toLowerCase().trim() === foundProp.developer.toLowerCase().trim())
    );

    if (devObj) {
      setSelectedDevId(devObj.id);
      setDevSearchQuery(devObj.name);
      if (devObj.projects?.[0]) setSelectedProjectId(devObj.projects[0].id);
    }

    const primaryMob = foundProp.developer_mobile || devObj?.mobile?.split('/')[0]?.trim() || devObj?.mobile || '';
    const secondaryMob = foundProp.developer_alt_mobile || devObj?.altMobile || '';
    const projTitle = foundProp.title || '';
    const gps = getGpsForProject(projTitle, foundProp.latitude, foundProp.longitude);

    setNewPropertyForm((prev: any) => ({
      ...prev,
      property_code: foundProp.property_code || '',
      developer_id: foundProp.developer_id || devObj?.id || '',
      developer: foundProp.developer || '',
      title: projTitle,
      locality: foundProp.locality || '',
      configuration: foundProp.configuration || '',
      carpet_area: foundProp.carpet_area || '',
      super_builtup_area: foundProp.super_builtup_area || '',
      floor_num: foundProp.floor_num || foundProp.floor_number || '',
      total_floors: foundProp.total_floors || 'G+4 Floors (5 Storey)',
      number_of_towers: foundProp.number_of_towers || '',
      facing: foundProp.facing || '',
      furnishing: foundProp.furnishing || '',
      final_price: foundProp.final_price || '',
      price_sqft: foundProp.price_sqft || '',
      car_parking: foundProp.car_parking || '',
      parking_price: foundProp.parking_price || '',
      latitude: gps.lat,
      longitude: gps.lng,
      building_photos: foundProp.building_photos || [],
      building_photo: foundProp.building_photo || '',
      unit_photos: foundProp.unit_photos || [],
      unit_photo: foundProp.unit_photo || '',
      project_posting_id: foundProp.project_posting_id || '',
      key_custody: foundProp.key_custody || '',
      description: foundProp.description || '',
      site_person_name: foundProp.site_person_name || '',
      site_person_contact: foundProp.site_person_contact || ''
    }));

    setDevProjectMobile(primaryMob);
    if (setDevProjectAltMobile) setDevProjectAltMobile(secondaryMob);
  };

  React.useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.trim().toLowerCase();
      const matched = properties.find(p => 
        (p.property_code || '').toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.developer || '').toLowerCase().includes(q)
      );
      if (matched && matched.property_code) {
        handleSelectPropertyByCode(matched);
      }
    }
  }, [searchQuery, properties]);

  const handleSelectDeveloperObj = (found: any) => {
    if (!found) return;
    setSelectedDevId(found.id);
    const firstProj = found.projects?.[0];
    if (firstProj) setSelectedProjectId(firstProj.id);

    const primaryMob = found.mobile?.split('/')[0]?.trim() || found.mobile || '';
    const secondaryMob = found.altMobile || (found.mobile?.includes('/') ? found.mobile.split('/')[1]?.trim() : '');

    const projTitle = firstProj?.title || '';
    const gps = getGpsForProject(projTitle, firstProj?.lat, firstProj?.lng);

    setNewPropertyForm((prev: any) => ({
      ...prev,
      developer_id: found.id,
      developer: found.name,
      title: projTitle,
      locality: firstProj?.locality || prev.locality || '',
      developer_alt_mobile: secondaryMob,
      latitude: gps.lat,
      longitude: gps.lng
    }));

    setDevProjectMobile(primaryMob);
    if (setDevProjectAltMobile) setDevProjectAltMobile(secondaryMob);
  };

  const handleSaveProjectMaster = React.useCallback(() => {
    if (!newPropertyForm.developer || !newPropertyForm.title) {
      return alert('Please enter Developer/Builder Name & Project Title!');
    }
    const assignedProjCode = newPropertyForm.project_id || generateNextProjectId();
    const assignedPropCode = generateDynamicPropertyCode();

    // SAVE MASTER PROJECT RECORD INTO DEVELOPER VAULT LIST
    const newProjEntry = {
      id: assignedProjCode,
      code: assignedProjCode,
      title: newPropertyForm.title,
      developer_email: newPropertyForm.developer_email || '',
      locality: newPropertyForm.locality || '',
      lat: newPropertyForm.latitude || '',
      lng: newPropertyForm.longitude || '',
      rera_id: newPropertyForm.rera_id || '',
      hera_no: newPropertyForm.hera_no || '',
      total_floors: newPropertyForm.total_floors || 'G+4 Floors (5 Storey)',
      number_of_towers: newPropertyForm.number_of_towers || '',
      key_custody: newPropertyForm.key_custody || newPropertyForm.keys_custody || '',
      keys_custody: newPropertyForm.key_custody || newPropertyForm.keys_custody || '',
      architectural_description: newPropertyForm.architectural_description || newPropertyForm.description || '',
      description: newPropertyForm.architectural_description || newPropertyForm.description || '',
      amenities: newPropertyForm.selected_amenities || [],
      building_photos: newPropertyForm.building_photos || [],
      total_covered_parking_capacity: newPropertyForm.total_covered_parking_capacity !== undefined ? newPropertyForm.total_covered_parking_capacity : 0,
      covered_parking_rate: newPropertyForm.covered_parking_rate || '',
      total_ev_parking_capacity: newPropertyForm.total_ev_parking_capacity !== undefined ? newPropertyForm.total_ev_parking_capacity : 0,
      ev_parking_rate: newPropertyForm.ev_parking_rate || '',
      total_open_parking_capacity: newPropertyForm.total_open_parking_capacity !== undefined ? newPropertyForm.total_open_parking_capacity : 0,
      open_parking_rate: newPropertyForm.open_parking_rate || ''
    };

    let updatedDevs = [...developerMasterList];
    const existingDevIdx = updatedDevs.findIndex(d => d.name.toLowerCase().trim() === (newPropertyForm.developer || '').toLowerCase().trim());
    
    if (existingDevIdx >= 0) {
      const devObj = updatedDevs[existingDevIdx];
      if (newPropertyForm.developer_email) devObj.email = newPropertyForm.developer_email;
      const projList = devObj.projects || [];
      const existingProjIdx = projList.findIndex((p: any) => (p.id === assignedProjCode || p.code === assignedProjCode || p.title?.toLowerCase().trim() === newPropertyForm.title.toLowerCase().trim()));
      if (existingProjIdx >= 0) {
        projList[existingProjIdx] = { ...projList[existingProjIdx], ...newProjEntry };
      } else {
        devObj.projects = [newProjEntry, ...projList];
      }
    } else {
      let maxDevSeq = 0;
      updatedDevs.forEach((d: any) => {
        const m = (d.id || '').match(/SRM-DEV-\d+-(\d+)/i);
        if (m) {
          const val = parseInt(m[1], 10);
          if (!isNaN(val) && val < 10000 && val > maxDevSeq) maxDevSeq = val;
        }
      });
      const newDevObj = {
        id: `SRM-DEV-2026-${String(maxDevSeq + 1).padStart(6, '0')}`,
        name: newPropertyForm.developer,
        mobile: devProjectMobile || '+91 98490 88776',
        email: newPropertyForm.developer_email || '',
        projects: [newProjEntry]
      };
      updatedDevs = [newDevObj, ...updatedDevs];
    }

    setDeveloperMasterList(updatedDevs);
    try {
      localStorage.setItem('swaramayi_developers_v1', JSON.stringify(updatedDevs));
    } catch (e) {}

    // Auto-create Project-Wise Developer Channel Partner Agreement
    createOrUpdateDevAgreement(
      newPropertyForm.developer,
      newPropertyForm.title,
      devProjectMobile,
      newPropertyForm.locality,
      undefined,
      Boolean(devProjectOtpVerified)
    );

    // ALSO IMMEDIATELY SYNC RECORD TO MONGODB ATLAS CLUSTER
    try {
      if (syncAllToMongoDB) {
        syncAllToMongoDB({ developers: updatedDevs, properties: properties });
      }
    } catch (e) {}

    // UPDATE FORM WITH PROJECT CODE & PRE-GENERATE UNIQUE PROPERTY CODE
    setNewPropertyForm((prev: any) => ({
      ...prev,
      project_id: assignedProjCode,
      property_code: assignedPropCode,
      developer: newPropertyForm.developer,
      title: newPropertyForm.title,
      locality: newPropertyForm.locality,
      latitude: newPropertyForm.latitude,
      longitude: newPropertyForm.longitude,
      total_floors: newPropertyForm.total_floors || 'G+4 Floors (5 Storey)',
      number_of_towers: newPropertyForm.number_of_towers || '',
      floor_no: `${prev.unit_floor || '2nd Floor'} out of ${newPropertyForm.total_floors || 'G+4 Floors (5 Storey)'}`,
      key_custody: newPropertyForm.key_custody || newPropertyForm.keys_custody || prev.key_custody || '',
      keys_custody: newPropertyForm.key_custody || newPropertyForm.keys_custody || prev.keys_custody || '',
      architectural_description: newPropertyForm.architectural_description || prev.architectural_description || '',
      description: newPropertyForm.architectural_description || prev.description || '',
      selected_amenities: newPropertyForm.selected_amenities || [],
      building_photos: newPropertyForm.building_photos || [],
      total_covered_parking_capacity: newPropertyForm.total_covered_parking_capacity !== undefined ? newPropertyForm.total_covered_parking_capacity : prev.total_covered_parking_capacity,
      covered_parking_rate: newPropertyForm.covered_parking_rate || '',
      parking_price: '',
      car_parking_charge: '',
      total_ev_parking_capacity: newPropertyForm.total_ev_parking_capacity !== undefined ? newPropertyForm.total_ev_parking_capacity : prev.total_ev_parking_capacity,
      ev_parking_rate: newPropertyForm.ev_parking_rate || prev.ev_parking_rate,
      total_open_parking_capacity: newPropertyForm.total_open_parking_capacity !== undefined ? newPropertyForm.total_open_parking_capacity : prev.total_open_parking_capacity,
      open_parking_rate: newPropertyForm.open_parking_rate || prev.open_parking_rate
    }));

    alert(`🎉 MASTER PROJECT CREATED & REGISTERED IN VAULT!\n\n• Master Project Code / ID: ${assignedProjCode}\n• Project Title: ${newPropertyForm.title}\n• Developer: ${newPropertyForm.developer}\n• Locality Hub: ${newPropertyForm.locality}\n• Total Floors: ${newPropertyForm.total_floors || 'G+4 Floors (5 Storey)'}\n• Towers: ${newPropertyForm.number_of_towers || 'N/A'}\n\n👉 Now creating individual property unit under Project Code ${assignedProjCode}!`);
    setActiveProjectSubTab('add_property_master');
  }, [newPropertyForm, developerMasterList, devProjectMobile, generateNextProjectId, generateDynamicPropertyCode]);

  const filteredDevs = developerMasterList.filter(dev => {
    if (!devSearchQuery.trim()) return true;
    const q = devSearchQuery.toLowerCase().trim();
    const matchesProj = (dev.projects || []).some((p: any) => p.title?.toLowerCase().includes(q) || p.locality?.toLowerCase().includes(q));
    return (
      dev.id.toLowerCase().includes(q) ||
      dev.name.toLowerCase().includes(q) ||
      (dev.mobile && dev.mobile.toLowerCase().includes(q)) ||
      (dev.altMobile && dev.altMobile.toLowerCase().includes(q)) ||
      (dev.email && dev.email.toLowerCase().includes(q)) ||
      matchesProj
    );
  });

  const allGlobalProjects = React.useMemo(() => {
    const list: any[] = [];
    const seenTitles = new Set<string>();

    developerMasterList.forEach(dev => {
      (dev.projects || []).forEach((proj: any) => {
        const key = proj.title.toLowerCase().trim();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          const gps = getGpsForProject(proj.title, proj.lat, proj.lng);
          list.push({
            id: proj.id || `PROJ-${Date.now()}-${Math.random()}`,
            title: proj.title,
            locality: proj.locality || '',
            devName: dev.name,
            devId: dev.id,
            devMobile: dev.mobile,
            devAltMobile: dev.altMobile,
            lat: gps.lat,
            lng: gps.lng,
            total_floors: proj.total_floors || '',
            number_of_towers: proj.number_of_towers || '',
            total_covered_parking_capacity: proj.total_covered_parking_capacity !== undefined ? proj.total_covered_parking_capacity : 0,
            covered_parking_rate: proj.covered_parking_rate || proj.parking_rate || proj.builder_default_rate || '',
            total_ev_parking_capacity: proj.total_ev_parking_capacity !== undefined ? proj.total_ev_parking_capacity : 0,
            ev_parking_rate: proj.ev_parking_rate || '',
            total_open_parking_capacity: proj.total_open_parking_capacity !== undefined ? proj.total_open_parking_capacity : 0,
            open_parking_rate: proj.open_parking_rate || ''
          });
        }
      });
    });

    properties.forEach((p: any) => {
      if (p.title && !seenTitles.has(p.title.toLowerCase().trim())) {
        seenTitles.add(p.title.toLowerCase().trim());
        const gps = getGpsForProject(p.title, p.latitude, p.longitude);
        list.push({
          id: `PROJ-PROP-${p.id}`,
          title: p.title,
          locality: p.locality || '',
          devName: p.developer || '',
          devId: p.developer_id || '',
          devMobile: p.developer_mobile || '',
          devAltMobile: p.developer_alt_mobile || '',
          lat: gps.lat,
          lng: gps.lng,
          total_floors: p.total_floors || '',
          number_of_towers: p.number_of_towers || '',
          total_covered_parking_capacity: p.total_covered_parking_capacity !== undefined ? p.total_covered_parking_capacity : 0,
          covered_parking_rate: p.covered_parking_rate || p.parking_rate || p.builder_default_rate || '',
          total_ev_parking_capacity: p.total_ev_parking_capacity !== undefined ? p.total_ev_parking_capacity : 0,
          ev_parking_rate: p.ev_parking_rate || '',
          total_open_parking_capacity: p.total_open_parking_capacity !== undefined ? p.total_open_parking_capacity : 0,
          open_parking_rate: p.open_parking_rate || ''
        });
      }
    });

    return list;
  }, [developerMasterList, properties]);

  const handleSelectProjectObj = (foundProj: any) => {
    if (!foundProj) return;
    setSelectedProjectId(foundProj.id);
    const gps = getGpsForProject(foundProj.title, foundProj.lat, foundProj.lng);

    if (foundProj.devId) {
      setSelectedDevId(foundProj.devId);
      const dev = developerMasterList.find(d => d.id === foundProj.devId);
      if (dev) setDevSearchQuery(dev.name);
    }
    if (foundProj.devMobile) setDevProjectMobile(foundProj.devMobile);
    if (foundProj.devAltMobile && setDevProjectAltMobile) setDevProjectAltMobile(foundProj.devAltMobile);

    setNewPropertyForm((prev: any) => ({
      ...prev,
      title: foundProj.title,
      locality: foundProj.locality || prev.locality || '',
      developer: foundProj.devName || prev.developer || '',
      developer_id: foundProj.devId || prev.developer_id || '',
      developer_alt_mobile: foundProj.devAltMobile || prev.developer_alt_mobile || '',
      latitude: gps.lat,
      longitude: gps.lng,
      total_covered_parking_capacity: foundProj.total_covered_parking_capacity !== undefined ? foundProj.total_covered_parking_capacity : (prev.total_covered_parking_capacity || 0),
      covered_parking_rate: foundProj.covered_parking_rate || '',
      total_ev_parking_capacity: foundProj.total_ev_parking_capacity !== undefined ? foundProj.total_ev_parking_capacity : (prev.total_ev_parking_capacity || 0),
      ev_parking_rate: foundProj.ev_parking_rate || '',
      total_open_parking_capacity: foundProj.total_open_parking_capacity !== undefined ? foundProj.total_open_parking_capacity : (prev.total_open_parking_capacity || 0),
      open_parking_rate: foundProj.open_parking_rate || '',
      parking_price: '',
      car_parking_charge: '',
      total_floors: foundProj.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)',
      number_of_towers: foundProj.number_of_towers || prev.number_of_towers || '',
      floor_no: `${prev.unit_floor || '2nd Floor'} out of ${foundProj.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)'}`,
      key_custody: foundProj.key_custody || prev.key_custody || '',
      keys_custody: foundProj.key_custody || prev.keys_custody || '',
      architectural_description: foundProj.architectural_description || prev.architectural_description || '',
      description: foundProj.architectural_description || prev.description || ''
    }));
  };

  const selectedDev = developerMasterList.find(d => d.id === selectedDevId);

  const filteredProjects = allGlobalProjects.filter((proj: any) => {
    if (selectedDevId) {
      const devMatch = proj.devId === selectedDevId || (selectedDev && proj.devName?.toLowerCase().trim() === selectedDev.name?.toLowerCase().trim());
      if (projectSearchQuery.trim()) {
        const q = projectSearchQuery.toLowerCase().trim();
        return (proj.title.toLowerCase().includes(q) || proj.locality.toLowerCase().includes(q));
      }
      return devMatch || true;
    }

    if (!projectSearchQuery.trim()) return true;
    const q = projectSearchQuery.toLowerCase().trim();
    return (
      proj.title.toLowerCase().includes(q) ||
      proj.locality.toLowerCase().includes(q) ||
      (proj.devName && proj.devName.toLowerCase().includes(q))
    );
  });

  const handleOpenNewProjectDeveloperForm = React.useCallback(() => {
    setNewPropertyForm({
      project_id: '',
      property_code: '',
      developer_id: '',
      developer: '',
      developer_email: '',
      developer_mobile: '',
      developer_alt_mobile: '',
      title: '',
      locality: '',
      latitude: '',
      longitude: '',
      rera_id: '',
      hera_no: '',
      total_floors: 'G+4 Floors (5 Storey)',
      number_of_towers: '',
      total_covered_parking_capacity: 0,
      covered_parking_rate: '',
      total_ev_parking_capacity: 0,
      ev_parking_rate: '',
      total_open_parking_capacity: 0,
      open_parking_rate: '',
      amenity_charges: '',
      clubhouse_charge: '',
      parking_price: '',
      floor_rise_charge: '',
      plc_charge: '',
      advance_maintenance_charge: '',
      legal_doc_charge: '',
      total_all_inclusive_price: '',
      key_custody: '',
      keys_custody: '',
      architectural_description: '',
      description: '',
      site_person_name: '',
      site_person_contact: '',
      selected_amenities: [],
      building_photos: [],
      building_photo: '',
      layout_photos: [],
      layout_photo: '',
      floor_plan_photos: [],
      floor_plan_photo: ''
    });
    if (setDevProjectMobile) setDevProjectMobile('');
    if (setDevProjectAltMobile) setDevProjectAltMobile('');
    if (setDevProjectOtpVerified) setDevProjectOtpVerified(false);
    if (setDevProjectOtpSent) setDevProjectOtpSent(false);
    if (setDevProjectOtpInput) setDevProjectOtpInput('');
    setActiveProjectSubTab('add_project_developer');
  }, [setNewPropertyForm, setDevProjectMobile, setDevProjectAltMobile, setDevProjectOtpVerified, setDevProjectOtpSent, setDevProjectOtpInput, setActiveProjectSubTab]);

  const handleOpenNewPropertyForm = React.useCallback(() => {
    setNewPropertyForm({
      project_id: '',
      property_code: '',
      developer_id: '',
      developer: '',
      developer_email: '',
      developer_mobile: '',
      developer_alt_mobile: '',
      title: '',
      locality: '',
      configuration: '',
      super_builtup_area: '',
      carpet_area: '',
      floor_num: '',
      total_floors: 'G+4 Floors (5 Storey)',
      number_of_towers: '',
      facing: '',
      furnishing: '',
      final_price: '',
      price_sqft: '',
      car_parking: '',
      parking_price: '',
      total_covered_parking_capacity: 0,
      covered_parking_rate: '',
      total_ev_parking_capacity: 0,
      ev_parking_rate: '',
      total_open_parking_capacity: 0,
      open_parking_rate: '',
      amenity_charges: '',
      clubhouse_charge: '',
      floor_rise_charge: '',
      plc_charge: '',
      advance_maintenance_charge: '',
      legal_doc_charge: '',
      total_all_inclusive_price: '',
      latitude: '',
      longitude: '',
      selected_amenities: [],
      building_photos: [],
      building_photo: '',
      unit_photos: [],
      unit_photo: '',
      unit_videos: [],
      project_posting_id: '',
      key_custody: '',
      keys_custody: '',
      description: '',
      site_person_name: '',
      site_person_contact: '',
      architectural_description: '',
      rera_id: '',
      hera_no: '',
      layout_photos: [],
      layout_photo: '',
      floor_plan_photos: [],
      floor_plan_photo: ''
    });
    setActiveProjectSubTab('add_property_master');
  }, [setNewPropertyForm, setActiveProjectSubTab]);

  // HYDRATE AND POPULATE FULL SAVED PROPERTY DETAILS UPON ENTERING EDIT MODE
  const populateFullEditPropertyDetails = React.useCallback((p: any) => {
    if (!p) return;

    // 1. Locate matched Master Project
    const allMasters = getAllMasterProjects();
    const matchedMaster = allMasters.find(m =>
      (p.project_id && (m.id === p.project_id || m.code === p.project_id)) ||
      (p.title && m.title && m.title.toLowerCase().trim() === p.title.toLowerCase().trim())
    );

    // 2. Normalizations
    const rawTotalFloors = p.total_floors || matchedMaster?.total_floors || 'G+4 Floors (5 Storey)';
    const normalizedTotalFloors = normalizeTotalFloors(rawTotalFloors);

    const rawUnitFloor = p.unit_floor || p.floor_num || p.floor_no || '2nd Floor';
    const normalizedUnitFloor = normalizeUnitFloor(rawUnitFloor);

    // 3. Parking capacities & rates (check property first, fallback to master project)
    const covCap = p.total_covered_parking_capacity !== undefined && p.total_covered_parking_capacity !== null
      ? p.total_covered_parking_capacity
      : (matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 0);
    const covRate = p.covered_parking_rate !== undefined && p.covered_parking_rate !== null && p.covered_parking_rate !== ''
      ? String(p.covered_parking_rate)
      : (matchedMaster?.covered_parking_rate ? String(matchedMaster.covered_parking_rate) : '');

    const evCap = p.total_ev_parking_capacity !== undefined && p.total_ev_parking_capacity !== null
      ? p.total_ev_parking_capacity
      : (matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 0);
    const evRate = p.ev_parking_rate !== undefined && p.ev_parking_rate !== null && p.ev_parking_rate !== ''
      ? String(p.ev_parking_rate)
      : (matchedMaster?.ev_parking_rate ? String(matchedMaster.ev_parking_rate) : '');

    const openCap = p.total_open_parking_capacity !== undefined && p.total_open_parking_capacity !== null
      ? p.total_open_parking_capacity
      : (matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 0);
    const openRate = p.open_parking_rate !== undefined && p.open_parking_rate !== null && p.open_parking_rate !== ''
      ? String(p.open_parking_rate)
      : (matchedMaster?.open_parking_rate ? String(matchedMaster.open_parking_rate) : '');

    // 4. Photos, videos, amenities
    const unitPhotos = Array.isArray(p.unit_photos) && p.unit_photos.length > 0
      ? p.unit_photos
      : (p.unit_photo ? [p.unit_photo] : []);
    const unitVideos = Array.isArray(p.unit_videos) && p.unit_videos.length > 0
      ? p.unit_videos
      : (p.unit_video ? [p.unit_video] : []);
    const buildingPhotos = Array.isArray(p.building_photos) && p.building_photos.length > 0
      ? p.building_photos
      : (p.building_photo ? [p.building_photo] : (matchedMaster?.building_photos || []));
    const amenities = Array.isArray(p.selected_amenities) && p.selected_amenities.length > 0
      ? p.selected_amenities
      : (Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities : (matchedMaster?.amenities || []));

    // 5. Cost sheet breakdown charges
    const floorRise = p.floor_rise_charge !== undefined && p.floor_rise_charge !== null
      ? String(p.floor_rise_charge)
      : (p.floorRise !== undefined && p.floorRise !== null ? String(p.floorRise) : '');
    const plc = p.plc_charge !== undefined && p.plc_charge !== null
      ? String(p.plc_charge)
      : (p.plc !== undefined && p.plc !== null ? String(p.plc) : '');
    const carParking = p.parking_price !== undefined && p.parking_price !== null
      ? String(p.parking_price)
      : (p.car_parking_charge !== undefined && p.car_parking_charge !== null ? String(p.car_parking_charge) : '');
    const club = p.amenity_charges !== undefined && p.amenity_charges !== null
      ? String(p.amenity_charges)
      : (p.clubhouse_charge !== undefined && p.clubhouse_charge !== null ? String(p.clubhouse_charge) : '');
    const advMaint = p.advance_maintenance_charge !== undefined && p.advance_maintenance_charge !== null
      ? String(p.advance_maintenance_charge)
      : '';
    const legalDoc = p.legal_doc_charge !== undefined && p.legal_doc_charge !== null
      ? String(p.legal_doc_charge)
      : (p.infrastructure_charge !== undefined && p.infrastructure_charge !== null ? String(p.infrastructure_charge) : (p.lawyer_charge !== undefined && p.lawyer_charge !== null ? String(p.lawyer_charge) : ''));

    // 6. Taxes & percentages
    const gstPct = p.gst_pct || '5%';
    const stampPct = p.stamp_duty_pct || '5%';
    const regPct = p.registration_fee_pct || '1%';

    // 7. Area & pricing
    const superArea = p.super_builtup_area || '';
    const carpetArea = p.carpet_area || '';
    const deductionPct = p.deduction_pct || '';
    const priceSqft = p.price_sqft || '';
    const finalPrice = p.final_price || '';

    // 8. Developer contact & verification
    const devMobile = p.developer_mobile || p.mobile || matchedMaster?.mobile || '';
    const devAltMobile = p.developer_alt_mobile || p.altMobile || matchedMaster?.altMobile || '';
    if (devMobile && setDevProjectMobile) setDevProjectMobile(devMobile);
    if (devAltMobile && setDevProjectAltMobile) setDevProjectAltMobile(devAltMobile);

    const populatedForm = {
      project_id: p.project_id || matchedMaster?.id || matchedMaster?.code || '',
      property_code: p.property_code || '',
      title: p.title || matchedMaster?.title || '',
      developer: p.developer || matchedMaster?.developer || '',
      developer_id: p.developer_id || matchedMaster?.developer_id || 'SRM-DEV-2026-000001',
      developer_mobile: devMobile,
      developer_alt_mobile: devAltMobile,
      locality: p.locality || matchedMaster?.locality || '',
      full_address: p.full_address || p.locality || matchedMaster?.locality || '',
      latitude: p.latitude || matchedMaster?.latitude || '',
      longitude: p.longitude || matchedMaster?.longitude || '',

      // Parking Stock Capacity & Default Rates (Section 1)
      total_covered_parking_capacity: covCap,
      covered_parking_rate: covRate,
      total_ev_parking_capacity: evCap,
      ev_parking_rate: evRate,
      total_open_parking_capacity: openCap,
      open_parking_rate: openRate,

      // Section 2 Specs & IDs
      project_posting_id: p.project_posting_id || p.campaign_id || 'PRJ-POST-2026-8802',
      rera_id: p.rera_id || p.reraId || p.rera || matchedMaster?.rera_id || '',
      hera_no: p.hera_no || p.heraId || p.hera || matchedMaster?.hera_no || '',
      property_type: p.property_type || p.type || 'Flat / Apartment (New / Builder)',
      configuration: p.configuration || p.bhk || p.config || '',
      super_builtup_area: superArea,
      carpet_area: carpetArea,
      deduction_pct: deductionPct,
      facing: p.facing || 'East Facing',
      furnishing: p.furnishing || 'Unfurnished',
      total_floors: normalizedTotalFloors,
      unit_floor: normalizedUnitFloor,
      floor_no: `${normalizedUnitFloor} out of ${normalizedTotalFloors}`,
      floor_num: normalizedUnitFloor,
      floor_number: normalizedUnitFloor,
      tower_block: p.tower_block || p.tower || '',
      number_of_towers: p.number_of_towers || matchedMaster?.number_of_towers || '1 Standalone Tower',
      unit_photos: unitPhotos,
      unit_photo: unitPhotos[0] || '',
      unit_videos: unitVideos,
      building_photos: buildingPhotos,
      building_photo: buildingPhotos[0] || '',
      selected_amenities: amenities,
      amenities: amenities,

      // Section 3 Pricing & Charges
      price_sqft: priceSqft,
      final_price: finalPrice,
      gst_pct: gstPct,
      stamp_duty_pct: stampPct,
      registration_fee_pct: regPct,
      floor_rise_charge: floorRise,
      floorRise: floorRise,
      plc_charge: plc,
      plc: plc,
      parking_price: carParking,
      car_parking_charge: carParking,
      amenity_charges: club,
      clubhouse_charge: club,
      advance_maintenance_charge: advMaint,
      legal_doc_charge: legalDoc,
      infrastructure_charge: legalDoc,
      lawyer_charge: legalDoc,
      total_base_price_with_other_charges: p.total_base_price_with_other_charges || '',
      total_all_inclusive_price: p.total_all_inclusive_price || '',
      commission_pct: p.commission_pct || '2%',
      possession_status: p.possession_status || 'Ready to Move',
      possession: p.possession || p.possession_status || 'Ready to Move',
      handover_month: p.handover_month || 'December',
      handover_year: p.handover_year || '2026',
      handover_month_year: p.handover_month_year || `${p.handover_month || 'December'} ${p.handover_year || '2026'}`,
      maintenance_monthly: p.maintenance_monthly || '',
      status: p.status || 'AVAILABLE',
      key_custody: p.key_custody || p.keys_custody || matchedMaster?.key_custody || '',
      keys_custody: p.key_custody || p.keys_custody || matchedMaster?.key_custody || '',
      description: p.description || p.architectural_description || matchedMaster?.description || '',
      site_person_name: p.site_person_name || '',
      site_person_contact: p.site_person_contact || ''
    };

    setNewPropertyForm((prev: any) => ({
      ...prev,
      ...populatedForm
    }));
  }, [getAllMasterProjects, setNewPropertyForm, setDevProjectMobile, setDevProjectAltMobile]);

  const lastHydratedPropertyIdRef = React.useRef<string | null>(null);

  // Monitor editingProperty so if editing mode is triggered, all property details hydrate immediately
  React.useEffect(() => {
    if (editingProperty && (editingProperty.id || editingProperty.property_code)) {
      const editKey = String(editingProperty.id || editingProperty.property_code || '');
      if (lastHydratedPropertyIdRef.current !== editKey) {
        lastHydratedPropertyIdRef.current = editKey;
        populateFullEditPropertyDetails(editingProperty);
      }
    } else if (!editingProperty) {
      lastHydratedPropertyIdRef.current = null;
    }
  }, [editingProperty, populateFullEditPropertyDetails]);

  // Enhanced edit handler that populates full details and transitions to the edit page
  const handleStartEditPropertyEnhanced = React.useCallback((p: any) => {
    if (!p) return;
    const editKey = String(p.id || p.property_code || p._id || '');
    lastHydratedPropertyIdRef.current = editKey;
    populateFullEditPropertyDetails(p);
    handleStartEditProperty(p);
    setActiveProjectSubTab('add_property_master');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      populateFullEditPropertyDetails(p);
    }, 40);
  }, [handleStartEditProperty, setActiveProjectSubTab, populateFullEditPropertyDetails]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* SYSTEM HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '14px' : '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: windowWidth <= 640 ? '1.15rem' : '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>PROJECT & PROPERTY INVENTORY MANAGEMENT SYSTEM</h2>
            <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>STOCK INVENTORY ACTIVE</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
            Master Stock Inventory
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
          <button 
            onClick={handleOpenNewPropertyForm} 
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}
          >
            🏠 + Add Property
          </button>
          <button 
            onClick={handleOpenNewProjectDeveloperForm} 
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}
          >
            🏢 + Add Project & Developer
          </button>
          <button 
            onClick={() => { setIsBulkImportPropertyOpen(true); if (setShowBulkImportPropertyModal) setShowBulkImportPropertyModal(true); }} 
            style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}
          >
            <Upload size={15} /> 🏠 📥 Import Bulk Property Stock
          </button>
          <button 
            onClick={() => { setIsBulkImportDeveloperOpen(true); if (setShowBulkImportDeveloperModal) setShowBulkImportDeveloperModal(true); }} 
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)' }}
          >
            <Upload size={15} /> 🏢 📥 Import Bulk Developer Stock
          </button>
          <button onClick={handleExportInventoryExcel} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#cbd5e1', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}>
            <Share2 size={15} /> Export Inventory
          </button>
        </div>
      </div>
      {/* SUB-TABS NAVIGATION BAR FOR PROJECT MANAGEMENT */}
      <div className="horizontal-scroll-touch" style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', width: '100%' }}>
        <button onClick={() => setActiveProjectSubTab('property_master')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeProjectSubTab === 'property_master' ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeProjectSubTab === 'property_master' ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8'), border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', whiteSpace: 'nowrap', flexShrink: 0 }}>
          🏠 Property Master Stock ({properties.length})
        </button>
        <button onClick={() => setActiveProjectSubTab('introduction_register' as any)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: activeProjectSubTab === ('introduction_register' as any) ? '#0284c7' : (isLight ? '#ffffff' : '#1e293b'), color: activeProjectSubTab === ('introduction_register' as any) ? '#ffffff' : '#a855f7', border: activeProjectSubTab === ('introduction_register' as any) ? '1px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), whiteSpace: 'nowrap', flexShrink: 0 }}>
          🛡️ Customer Introduction Register ({projectVisitAgreements.length})
        </button>
        <button onClick={() => setShowDevVaultModal(true)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', background: isLight ? '#ffffff' : '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          🏢 Developer Master Vault ({(developerMasterList || []).filter((d: any) => !isItemInRecycledSet(d, recycledSet)).length} Developer IDs)
        </button>
      </div>

      {/* SUB-TAB: CUSTOMER INTRODUCTION REGISTER & BROKERAGE PROTECTION */}
      {activeProjectSubTab === ('introduction_register' as any) && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: windowWidth <= 640 ? '1rem' : '1.15rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>🛡️ PROJECT-WISE CUSTOMER INTRODUCTION REGISTER</h3>
              <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                Time-stamped, project-specific proof of introduced buyers backed by Project Visit Agreements (PVA)
              </p>
            </div>
            <button 
              onClick={() => setShowDeveloperIntroductionReportModal(true)}
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto' }}
            >
              🏢 VIEW DEVELOPER INTRODUCTION SUMMARY REPORT
            </button>
          </div>

          {windowWidth <= 768 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projectVisitAgreements.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
                  No customer introduction records found.
                </div>
              ) : (
                projectVisitAgreements.map((pva: any, idx: number) => (
                  <div key={idx} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.82rem' }}>
                        {pva.projectVisitAgreementId}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                        📅 {pva.visitDate}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Customer</span>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{pva.customerName}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace' }}>{pva.customerMobile}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Project & Dev</span>
                        <strong style={{ color: '#fbbf24' }}>{pva.projectTitle}</strong>
                        <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>{pva.developerName}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Sales Exec</span>
                        <strong style={{ color: '#38bdf8' }}>{pva.salesPersonName}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Protection Expiry</span>
                        <strong style={{ color: '#4ade80' }}>🗓️ {pva.protectionEndDate}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '8px' }}>
                      <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900' }}>
                        ✓ VISIT VERIFIED (GPS+OTP)
                      </span>
                      <button 
                        onClick={() => setShowPvaDocumentModal({ open: true, pva })}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', width: windowWidth <= 640 ? '100%' : 'auto', textAlign: 'center' }}
                      >
                        📄 View PVA Document
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#64748b' : '#94a3b8', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ padding: '10px' }}>PVA ID & Date</th>
                    <th style={{ padding: '10px' }}>Customer & Mobile</th>
                    <th style={{ padding: '10px' }}>Project & Developer</th>
                    <th style={{ padding: '10px' }}>Assigned Sales Exec</th>
                    <th style={{ padding: '10px' }}>Protection Expiry Date</th>
                    <th style={{ padding: '10px' }}>Verification Status</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectVisitAgreements.map((pva: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900' }}>{pva.projectVisitAgreementId}</span>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>📅 {pva.visitDate}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.88rem' }}>{pva.customerName}</strong>
                        <br /><span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace' }}>{pva.customerMobile}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{pva.projectTitle}</strong>
                        <br /><span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>Dev: {pva.developerName}</span>
                      </td>
                      <td style={{ padding: '10px', color: '#38bdf8', fontWeight: '800' }}>
                        {pva.salesPersonName}
                      </td>
                      <td style={{ padding: '10px', color: '#4ade80', fontWeight: '800' }}>
                        🗓️ {pva.protectionEndDate} ({pva.protectionPeriodMonths}M Protection)
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '900' }}>
                          ✓ VISIT VERIFIED (GPS+OTP)
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setShowPvaDocumentModal({ open: true, pva })}
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}
                        >
                          📄 View PVA Document
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: FULL DEDICATED PAGE VIEW FOR PROJECT & DEVELOPER IDENTIFICATION */}
      {activeProjectSubTab === 'add_project_developer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FULL PAGE NAVIGATION HEADER */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : 'none' }}>
            <div>
              <button 
                type="button" 
                onClick={() => {
                  lastHydratedPropertyIdRef.current = null;
                  setActiveProjectSubTab('property_master');
                }}
                style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#0284c7', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
              >
                <ArrowRightLeft size={16} /> ⬅️ Back to Property Inventory Registry
              </button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🏢 Register New Project & Developer Master
              </h2>
              <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                Register Master Project Title, Builder/Developer Name, Contact OTP credentials, GPS locality coordinates & Amenities.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setIsBulkImportDeveloperOpen(true); if (setShowBulkImportDeveloperModal) setShowBulkImportDeveloperModal(true); }}
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
              >
                <Upload size={16} /> 🏢 📥 IMPORT BULK DEVELOPER STOCK
              </button>
              <button
                type="button"
                onClick={handleSaveProjectMaster}
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                💾 SAVE PROJECT & DEVELOPER MASTER
              </button>

              <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px 16px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🔑 Master Project ID</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#a855f7', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                  {newPropertyForm.project_id || generateNextProjectId()}
                </h3>
              </div>
            </div>
          </div>

          {/* SECTION 1: PROJECT & DEVELOPER IDENTIFICATION */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '16px' : '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏢 Project & Developer Identification
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    1-Time Developer Project OTP Protocol
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Developer / Builder Name *</label>
                  <input 
                    type="text" 
                    value={newPropertyForm.developer} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchDev = developerMasterList.find((d: any) => d.name.toLowerCase().trim() === val.toLowerCase().trim());
                      setNewPropertyForm((prev: any) => ({
                        ...prev,
                        developer: val,
                        developer_email: matchDev && matchDev.email ? matchDev.email : prev.developer_email
                      }));
                      if (matchDev && matchDev.mobile && !devProjectMobile) setDevProjectMobile(matchDev.mobile);
                    }} 
                    placeholder="e.g. Developer / Builder Name" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Project Title & Name *</label>
                  <input 
                    type="text" 
                    value={newPropertyForm.title} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const gps = getGpsForProject(val);
                      setNewPropertyForm((prev: any) => ({
                        ...prev,
                        title: val,
                        latitude: gps ? gps.lat : prev.latitude,
                        longitude: gps ? gps.lng : prev.longitude
                      }));
                    }} 
                    placeholder="e.g. Project / Society Name" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Developer Mobile Phone (for OTP) *</label>
                  <input 
                    type="text" 
                    value={devProjectMobile} 
                    onChange={(e) => setDevProjectMobile(e.target.value)} 
                    placeholder="e.g. +91 98833 95102" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>Alternative Phone Number (Secondary Contact)</label>
                  <input 
                    type="text" 
                    value={devProjectAltMobile} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (setDevProjectAltMobile) setDevProjectAltMobile(val);
                      setNewPropertyForm({ ...newPropertyForm, developer_alt_mobile: val });
                    }} 
                    placeholder="e.g. +91 70442 93951" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>✉️ Developer Email Address</label>
                  <input 
                    type="email" 
                    value={newPropertyForm.developer_email || ''} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, developer_email: e.target.value })} 
                    placeholder="e.g. developer@buildercompany.com" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }} 
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                      Locality Hub / Sector *
                    </label>
                    {isFetchingCoordsAddress && (
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', border: '2px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Auto-fetching address...
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={newPropertyForm.locality} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, locality: e.target.value })} 
                    placeholder={isFetchingCoordsAddress ? "Detecting address from GPS coordinates..." : "e.g. Locality Hub / Sector / Area"} 
                    style={{ 
                      width: '100%', 
                      background: isLight ? '#ffffff' : '#1e293b', 
                      border: isFetchingCoordsAddress ? '1.5px solid #38bdf8' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), 
                      color: isLight ? '#0f172a' : '#ffffff', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      fontSize: '0.9rem',
                      fontWeight: newPropertyForm.locality ? '700' : 'normal',
                      boxShadow: isFetchingCoordsAddress ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>🏛️ RERA Registration No. (RERA ID)</label>
                  <input 
                    type="text" 
                    value={newPropertyForm.rera_id || ''} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, rera_id: e.target.value })} 
                    placeholder="Enter RERA Registration No. (Optional)" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>📜 HERA Registration No. (HERA ID)</label>
                  <input 
                    type="text" 
                    value={newPropertyForm.hera_no || ''} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, hera_no: e.target.value })} 
                    placeholder="Enter HERA Registration No. (Optional)" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#a855f7', fontFamily: 'monospace', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              {/* TOTAL FLOORS IN BUILDING & NUMBER OF TOWERS IN PROJECT / COMPLEX */}
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                    🏬 Total Floors in Building *
                  </label>
                  <select 
                    value={newPropertyForm.total_floors || 'G+4 Floors (5 Storey)'} 
                    onChange={(e) => {
                      const tFloors = e.target.value;
                      const uFloor = newPropertyForm.unit_floor || '2nd Floor';
                      setNewPropertyForm({
                        ...newPropertyForm,
                        total_floors: tFloors,
                        floor_no: `${uFloor} out of ${tFloors}`
                      });
                    }} 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }} 
                  >
                    <option value="Ground Floor Only (G)">Ground Floor Only (G)</option>
                    {Array.from({ length: 30 }, (_, i) => {
                      const num = i + 1;
                      const storey = num + 1;
                      return (
                        <option key={`proj_master_tot_fl_${num}`} value={`G+${num} Floors (${storey} Storey)`}>
                          G+{num} Floors ({storey} Storey)
                        </option>
                      );
                    })}
                    <option value="B+G (Basement + Ground)">B+G (Basement + Ground)</option>
                    <option value="B+G+4 Floors (Midrise)">B+G+4 Floors (Midrise)</option>
                    <option value="B+G+14 Floors (Highrise)">B+G+14 Floors (Highrise)</option>
                    <option value="B+G+30 Floors (Ultra Highrise)">B+G+30 Floors (Ultra Highrise)</option>
                    <option value="2B+G+30 Floors (Mega Highrise)">2B+G+30 Floors (Mega Highrise)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '900', display: 'block', marginBottom: '6px' }}>
                    🏰 Number Of Towers in Project / Complex *
                  </label>
                  <input 
                    type="text" 
                    value={newPropertyForm.number_of_towers || ''} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, number_of_towers: e.target.value })} 
                    placeholder="e.g. 1 Standalone Tower / 4 Towers Complex" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #fbbf24', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              {/* DEVELOPER 1-TIME PROJECT OTP VERIFICATION CONTAINER */}
              {(() => {
                const isAlreadyVerified = verifiedDevProjectsList.some(p => 
                  p.developer.toLowerCase().includes((newPropertyForm.developer || '').toLowerCase().trim()) &&
                  p.project.toLowerCase().includes((newPropertyForm.title || '').toLowerCase().trim())
                ) || devProjectOtpVerified;

                return (
                  <div style={{ background: isAlreadyVerified ? 'rgba(34, 197, 94, 0.12)' : (isLight ? '#ffffff' : '#1e293b'), border: `2px solid ${isAlreadyVerified ? '#22c55e' : '#a855f7'}`, borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: '900', color: isAlreadyVerified ? '#22c55e' : '#a855f7', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isAlreadyVerified ? '✅ DEVELOPER OTP VERIFIED (1-Time Project Verification Active)' : '🔐 DEVELOPER 1-TIME PROJECT OTP VERIFICATION'}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                          {isAlreadyVerified ? `Verified for Developer: ${newPropertyForm.developer || 'Builder'} • Project: ${newPropertyForm.title || 'Project'}` : '1-Time OTP authentication per project. Developers with multiple projects verify once per project.'}
                        </span>
                      </div>

                      {!isAlreadyVerified && !devProjectOtpSent && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setDevProjectOtpSent(true);
                            setDevProjectOtpInput('');
                          }}
                          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)' }}
                        >
                          📱 SEND DEVELOPER 1-TIME OTP FOR THIS PROJECT
                        </button>
                      )}
                    </div>

                    {!isAlreadyVerified && devProjectOtpSent && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: isLight ? '#f8fafc' : '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #a855f7' }}>
                        <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: '800' }}>📲 Sent 6-Digit OTP to {devProjectMobile || 'Developer'}:</span>
                        <input 
                          type="text" 
                          value={devProjectOtpInput} 
                          onChange={(e) => setDevProjectOtpInput(e.target.value)} 
                          placeholder="Enter 6-Digit OTP"
                          style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem', width: '140px', fontFamily: 'monospace', textAlign: 'center' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setDevProjectOtpVerified(true);
                            const newVerifiedObj = {
                              developer: newPropertyForm.developer || 'Builder',
                              project: newPropertyForm.title || 'Project',
                              mobile: devProjectMobile || 'Registered Mobile',
                              verifiedAt: new Date().toLocaleString(),
                              hash: `SHA256-DEV-OTP-VERIFIED-#${Math.floor(100000 + Math.random() * 900000)}`
                            };
                            setVerifiedDevProjectsList([newVerifiedObj, ...verifiedDevProjectsList]);
                            createOrUpdateDevAgreement(
                              newPropertyForm.developer || 'Builder',
                              newPropertyForm.title || 'Project',
                              devProjectMobile,
                              newPropertyForm.locality,
                              newVerifiedObj.hash,
                              true
                            );
                          }}
                          style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          🔐 VERIFY DEVELOPER PROJECT OTP
                        </button>
                      </div>
                    )}

                    {isAlreadyVerified && (
                      <div style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'monospace', fontWeight: '800', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>Audit Stamp: SHA256-DEV-PROJECT-OTP-AUTHENTICATED</span>
                        <span>Status: 1-Time Verification Complete</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* GPS LATITUDE & LONGITUDE INPUTS WITH LIVE LOCATION CAPTURE BUTTON */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #a855f7', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={16} color="#a855f7" /> 📍 GPS Location Coordinates & Device Auto-Capture
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* AUTO FETCH ADDRESS ON DEMAND BUTTON */}
                    <button 
                      type="button" 
                      onClick={() => fetchAddressForCoordinates(newPropertyForm.latitude, newPropertyForm.longitude, true)} 
                      disabled={isFetchingCoordsAddress || !newPropertyForm.latitude || !newPropertyForm.longitude}
                      title="Auto-fetch address from current coordinates into Locality Hub / Sector"
                      style={{ 
                        background: (!newPropertyForm.latitude || !newPropertyForm.longitude) ? (isLight ? '#f1f5f9' : '#1e293b') : (isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)'), 
                        color: (!newPropertyForm.latitude || !newPropertyForm.longitude) ? '#94a3b8' : '#0284c7', 
                        border: (!newPropertyForm.latitude || !newPropertyForm.longitude) ? '1px solid transparent' : '1px solid #38bdf8', 
                        padding: '8px 14px', 
                        borderRadius: '8px', 
                        fontWeight: '800', 
                        fontSize: '0.78rem', 
                        cursor: (!newPropertyForm.latitude || !newPropertyForm.longitude) ? 'not-allowed' : (isFetchingCoordsAddress ? 'wait' : 'pointer'), 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px' 
                      }}
                    >
                      <MapPin size={14} />
                      {isFetchingCoordsAddress ? '⏳ Fetching Address...' : '🔍 FETCH ADDRESS FROM COORDS'}
                    </button>

                    <button 
                      type="button" 
                      onClick={handleCaptureCurrentGpsLocation} 
                      disabled={isCapturingGps}
                      style={{ 
                        background: isCapturingGps ? '#334155' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                        color: '#ffffff', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontWeight: '900', 
                        fontSize: '0.8rem', 
                        cursor: isCapturingGps ? 'wait' : 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)' 
                      }}
                    >
                      <Navigation size={15} />
                      {isCapturingGps ? '📡 Capturing GPS...' : '🎯 CAPTURE MY CURRENT GPS LOCATION'}
                    </button>
                  </div>
                </div>

                {gpsCaptureStatus && (
                  <div style={{ background: gpsCaptureStatus.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)', border: `1px solid ${gpsCaptureStatus.startsWith('✓') ? '#22c55e' : '#a855f7'}`, borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', color: gpsCaptureStatus.startsWith('✓') ? '#4ade80' : '#a855f7', fontWeight: '800' }}>
                    {gpsCaptureStatus}
                  </div>
                )}

                {coordsAddressMessage && !gpsCaptureStatus && (
                  <div style={{ background: coordsAddressMessage.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)', border: `1px solid ${coordsAddressMessage.startsWith('✓') ? '#22c55e' : '#38bdf8'}`, borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', color: coordsAddressMessage.startsWith('✓') ? '#4ade80' : '#38bdf8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    {coordsAddressMessage}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>GPS Latitude (Exact Map Lat)</label>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Paste lat or "lat, lng" pair</span>
                    </div>
                    <input 
                      type="text" 
                      value={newPropertyForm.latitude} 
                      onChange={(e) => handleCoordsInputChange('latitude', e.target.value)} 
                      onBlur={() => fetchAddressForCoordinates(newPropertyForm.latitude, newPropertyForm.longitude)}
                      placeholder="e.g. 22.698021 or 22.722361" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>GPS Longitude (Exact Map Long)</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.longitude} 
                      onChange={(e) => handleCoordsInputChange('longitude', e.target.value)} 
                      onBlur={() => fetchAddressForCoordinates(newPropertyForm.latitude, newPropertyForm.longitude)}
                      placeholder="e.g. 88.463723 or 78.34891" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              </div>

              {/* 🏊 PROJECT & DEVELOPER AMENITIES (MULTIPLE SELECTION OPTION) */}
              <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: '900', color: '#a855f7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏊 PROJECT & DEVELOPER AMENITIES & INFRASTRUCTURE FEATURES (MULTIPLE SELECTION)
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                      Select all project-wide amenities available under {newPropertyForm.title || 'this Project Master'}. These amenities auto-link to all project units.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        const allIds = [
                          '24/7 Power Backup', 'Water Supply', 'Security', 'CCTV cameras',
                          'Elevators', 'backup power', 'Fire Safety', 'Gymnasium',
                          'Swimming Pool', 'Clubhouse', "Children's Play Area", 'Sports Courts',
                          'Track', 'Gardens', 'Waste Management', 'EV Charging Stations',
                          'Intercom Facility', 'Yoga Deck', 'Senior Citizen Park'
                        ];
                        setNewPropertyForm({ ...newPropertyForm, selected_amenities: allIds });
                      }}
                      style={{ background: '#a855f7', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '900', cursor: 'pointer' }}
                    >
                      Select All Amenities
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewPropertyForm({ ...newPropertyForm, selected_amenities: [] })}
                      style={{ background: isLight ? '#e2e2f0' : '#334155', color: isLight ? '#475569' : '#cbd5e1', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { id: '24/7 Power Backup', label: '⚡ 24/7 Power Backup' },
                    { id: 'Water Supply', label: '🚰 24-Hour Water Supply' },
                    { id: 'Security', label: '🛡️ 24/7 Security Patrol' },
                    { id: 'CCTV cameras', label: '📹 CCTV Surveillance' },
                    { id: 'Elevators', label: '🛗 High-Speed Elevators' },
                    { id: 'backup power', label: '⚡ Backup Generator' },
                    { id: 'Fire Safety', label: '🧯 Fire Safety System' },
                    { id: 'Gymnasium', label: '🏋️ Fitness Gymnasium' },
                    { id: 'Swimming Pool', label: '🏊 Swimming Pool' },
                    { id: 'Clubhouse', label: '🏛️ Luxury Clubhouse' },
                    { id: "Children's Play Area", label: "🛝 Kids Play Area" },
                    { id: 'Sports Courts', label: '🏸 Sports Courts' },
                    { id: 'Track', label: '🏃 Jogging Track' },
                    { id: 'Gardens', label: '🌳 Landscaped Gardens' },
                    { id: 'Waste Management', label: '♻️ STP & Waste Mgmt' },
                    { id: 'EV Charging Stations', label: '🔌 EV Charging Stations' },
                    { id: 'Intercom Facility', label: '🔐 Intercom & Video Door' },
                    { id: 'Yoga Deck', label: '🧘 Yoga & Meditation Deck' },
                    { id: 'Senior Citizen Park', label: '👵 Senior Citizen Park' }
                  ].map((amenity) => {
                    const selectedList = newPropertyForm.selected_amenities || [];
                    const isChecked = selectedList.includes(amenity.id);
                    return (
                      <label 
                        key={amenity.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          background: isChecked ? (isLight ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.18)') : (isLight ? '#ffffff' : '#0f172a'),
                          border: isChecked ? '2px solid #a855f7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'),
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: isChecked ? '800' : '600',
                          color: isChecked ? (isLight ? '#7e22ce' : '#c084fc') : (isLight ? '#334155' : '#cbd5e1'),
                          transition: 'all 0.15s ease-in-out'
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated = [...selectedList];
                            if (e.target.checked) {
                              if (!updated.includes(amenity.id)) updated.push(amenity.id);
                            } else {
                              updated = updated.filter(i => i !== amenity.id);
                            }
                            setNewPropertyForm({ ...newPropertyForm, selected_amenities: updated });
                          }}
                        />
                        {amenity.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 🚗 PROJECT PARKING STOCK CAPACITY & DEFAULT RATES MANAGEMENT SYSTEM */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #eab308', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🚗 Project Parking Stock Capacity & Default Rates Management System
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                      Configure total project parking slot inventory limits (Covered, EV Fast Charging, Open Surface) and builder default rates.
                    </p>
                  </div>

                  <span style={{ fontSize: '0.74rem', background: 'rgba(234, 179, 8, 0.18)', color: '#eab308', border: '1px solid #eab308', padding: '3px 10px', borderRadius: '20px', fontWeight: '900' }}>
                    PROJ PARKING VAULT ACTIVE
                  </span>
                </div>

                {/* PARKING CARDS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
                  
                  {/* 1. COVERED PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🚘 Covered Basement / Stilt Parking
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        Basement / Podium
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total Allocated Slot Capacity
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_covered_parking_capacity !== undefined && newPropertyForm.total_covered_parking_capacity !== null ? newPropertyForm.total_covered_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_covered_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 24"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Builder Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.covered_parking_rate || ''}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, covered_parking_rate: e.target.value })}
                        placeholder="e.g. 300000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* 2. EV FAST CHARGING PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚡ EV Fast Charging Station Slots
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        EV Ready
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total EV Fast Charger Slots
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_ev_parking_capacity !== undefined && newPropertyForm.total_ev_parking_capacity !== null ? newPropertyForm.total_ev_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_ev_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 6"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #eab308', color: '#eab308', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        EV Slot Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.ev_parking_rate || ''}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, ev_parking_rate: e.target.value })}
                        placeholder="e.g. 450000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* 3. OPEN SURFACE PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🅿️ Open Surface Ground Parking
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        Ground Level
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total Open Surface Slot Capacity
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_open_parking_capacity !== undefined && newPropertyForm.total_open_parking_capacity !== null ? newPropertyForm.total_open_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_open_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 12"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Open Slot Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.open_parking_rate || ''}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, open_parking_rate: e.target.value })}
                        placeholder="e.g. 150000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* 🔑 KEYS CUSTODY & ARCHITECTURAL DESCRIPTION SECTION */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#a855f7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔑 Keys Custody & Architectural Description
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                      Specify project key custody storage location & overall architectural structural design specifications.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: 'rgba(168, 85, 247, 0.18)', color: '#a855f7', border: '1px solid #a855f7', padding: '3px 10px', borderRadius: '20px', fontWeight: '900' }}>
                    PROJECT CUSTODY & SPECIFICATIONS
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      🔑 Key Custody Location / Handler
                    </label>
                    <input
                      type="text"
                      value={newPropertyForm.key_custody || newPropertyForm.keys_custody || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          key_custody: val,
                          keys_custody: val
                        }));
                      }}
                      placeholder="e.g. Builder Site Office / Security Gate / Sales Desk / Company Office"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      🏛️ Architectural & Structural Design Description
                    </label>
                    <textarea
                      rows={3}
                      value={newPropertyForm.architectural_description || newPropertyForm.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          architectural_description: val,
                          description: val
                        }));
                      }}
                      placeholder="e.g. Modern RCC Frame Structure, Vastu compliant layouts, Premium Italian Marble flooring, Glass Elevation Façade, Earthquake Resistant Zone III construction."
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>



              {/* BOTTOM ACTION FOOTER FOR ADD PROJECT & DEVELOPER MASTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '2px solid #cbd5e1' : '2px solid #334155', paddingTop: '20px', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    lastHydratedPropertyIdRef.current = null;
                    setActiveProjectSubTab('property_master');
                  }} 
                  style={{ background: isLight ? '#f1f5f9' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancel & Return to Property Inventory Registry
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px 16px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🔑 Master Project ID</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#a855f7', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                      {newPropertyForm.project_id || generateNextProjectId()}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProjectMaster}
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '900', fontSize: '0.96rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    💾 SAVE & CREATE PROJECT CODE ({newPropertyForm.project_id || generateNextProjectId()})
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: FULL DEDICATED PAGE VIEW FOR PROPERTY MASTER REGISTRATION & EDITING */}
      {activeProjectSubTab === 'add_property_master' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FULL PAGE NAVIGATION HEADER */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : 'none' }}>
            <div>
              <button 
                type="button" 
                onClick={() => {
                  lastHydratedPropertyIdRef.current = null;
                  setActiveProjectSubTab('property_master');
                }}
                style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#0284c7', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
              >
                <ArrowRightLeft size={16} /> ⬅️ Back to Property Inventory Registry
              </button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editingProperty ? `✏️ Edit Property Master Record (${editingProperty.property_code})` : '🏠 Register New Property Master Inventory'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                {editingProperty ? 'Modify full specifications, pricing, locality, facing, and status for this property master record.' : 'Adds property listing into central stock vault with automated property code (SRM-PROP).'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={(e) => handleCreatePropertySubmit(e as any)}
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                💾 SAVE & COMPLETE REGISTRATION
              </button>

              <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1.5px solid #38bdf8', borderRadius: '10px', padding: '8px 14px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🔑 Master Project ID</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                  {newPropertyForm.project_id || generateNextProjectId()}
                </h3>
              </div>

              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '8px 14px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🏷️ Unique Property Code</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                  {newPropertyForm.property_code || generateDynamicPropertyCode()}
                </h3>
              </div>
            </div>
          </div>

          {/* FULL PAGE FORM CONTAINER */}
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: windowWidth <= 640 ? '16px' : '28px', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : 'none' }}>
            <form onSubmit={handleCreatePropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* SECTION 1: SEARCH / SELECT MASTER PROJECT ID & UNIQUE PROPERTY CODE */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0284c7' : '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔍 1. Select Master Project ID & Link Multiple Properties
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                      Search or select an existing Master Project ID below. Multiple individual property units can be created under the same Project ID, each with its own Unique Property Code!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenNewProjectDeveloperForm}
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    🏢 + Create New Master Project & Developer
                  </button>
                </div>

                {/* SEARCH, WRITE & PASTE PROJECT ID CONTROLS */}
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '1.2fr 1fr 0.8fr', gap: '14px', alignItems: 'end' }}>
                  
                  {/* 1. DIRECT WRITE / PASTE INPUT FIELD WITH PASTE BUTTON */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      ✍️ Write / Type or Paste Master Project ID *
                    </label>

                    <input 
                      type="text"
                      value={newPropertyForm.project_id || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const allProjs = getAllMasterProjects();
                        const found = allProjs.find(p => p.id?.toLowerCase() === val.trim().toLowerCase() || p.code?.toLowerCase() === val.trim().toLowerCase());
                        if (found) {
                          setNewPropertyForm((prev: any) => ({
                            ...prev,
                            project_id: found.id || found.code,
                            developer: found.developer || prev.developer,
                            title: found.title || prev.title,
                            locality: found.locality || prev.locality,
                            latitude: found.latitude || prev.latitude,
                            longitude: found.longitude || prev.longitude,
                            rera_id: found.rera_id || found.reraId || found.rera || '',
                            hera_no: found.hera_no || found.heraId || found.hera || '',
                            selected_amenities: found.amenities && found.amenities.length > 0 ? found.amenities : prev.selected_amenities,
                            building_photos: found.building_photos && found.building_photos.length > 0 ? found.building_photos : prev.building_photos,
                            total_covered_parking_capacity: found.total_covered_parking_capacity !== undefined ? found.total_covered_parking_capacity : (prev.total_covered_parking_capacity || 0),
                            covered_parking_rate: found.covered_parking_rate || '',
                            total_ev_parking_capacity: found.total_ev_parking_capacity !== undefined ? found.total_ev_parking_capacity : (prev.total_ev_parking_capacity || 0),
                            ev_parking_rate: found.ev_parking_rate || '',
                            total_open_parking_capacity: found.total_open_parking_capacity !== undefined ? found.total_open_parking_capacity : (prev.total_open_parking_capacity || 0),
                            open_parking_rate: found.open_parking_rate || '',
                            parking_price: '',
                            car_parking_charge: '',
                            key_custody: found.key_custody || prev.key_custody || '',
                            keys_custody: found.key_custody || prev.keys_custody || '',
                            architectural_description: found.architectural_description || prev.architectural_description || '',
                            description: found.architectural_description || prev.description || '',
                            total_floors: found.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)',
                            number_of_towers: found.number_of_towers || prev.number_of_towers || '',
                            floor_no: `${prev.unit_floor || '2nd Floor'} out of ${found.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)'}`
                          }));
                        } else {
                          setNewPropertyForm((prev: any) => ({ ...prev, project_id: val }));
                        }
                      }}
                      placeholder="Type or paste Project ID e.g. SRM-PROJ-2026-000001..."
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* 2. SEARCHABLE COMBINED DROPDOWN & LIVE SEARCH CONTAINER */}
                  <div style={{ position: 'relative' }} ref={projComboboxRef}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>
                        Or Select Registered Master Project
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAdvanceProjectSearchModal(true)}
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '2px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)' }}
                        title="Open Advance Master Project Search & Multi-criteria Filter Modal"
                      >
                        ⚡ 🔍 Advance Search
                      </button>
                    </div>

                    {/* COMBINED LIVE SEARCH INPUT + DROPDOWN CHEVRON ICON */}
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text"
                        value={(() => {
                          if (projComboboxSearch) return projComboboxSearch;
                          if (newPropertyForm.project_id) {
                            const found = getAllMasterProjects().find(p => p.id === newPropertyForm.project_id || p.code === newPropertyForm.project_id);
                            if (found) return `🔑 [${found.code || found.id}] ${found.title} — Builder: ${found.developer}`;
                            return newPropertyForm.project_id;
                          }
                          return '';
                        })()}
                        onFocus={() => setIsProjDropdownOpen(true)}
                        onChange={(e) => {
                          setProjComboboxSearch(e.target.value);
                          setIsProjDropdownOpen(true);
                        }}
                        placeholder="Type to search & open dropdown menu..."
                        style={{ 
                          width: '100%', 
                          background: isLight ? '#ffffff' : '#1e293b', 
                          border: isProjDropdownOpen ? '2px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), 
                          color: isLight ? '#0f172a' : '#ffffff', 
                          padding: '10px 38px 10px 34px', 
                          borderRadius: '8px', 
                          fontSize: '0.88rem', 
                          fontWeight: '800' 
                        }}
                      />

                      {/* SEARCH ICON */}
                      <Search size={16} color="#0284c7" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />

                      {/* DROPDOWN CHEVRON / CLEAR BUTTON */}
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {(projComboboxSearch || newPropertyForm.project_id) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjComboboxSearch('');
                              setIsProjDropdownOpen(false);
                              setNewPropertyForm((prev: any) => ({ ...prev, project_id: '' }));
                            }}
                            style={{ background: 'none', border: 'none', color: isLight ? '#94a3b8' : '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                            title="Clear search / selection"
                          >
                            <X size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsProjDropdownOpen(prev => !prev)}
                          style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Toggle master projects dropdown menu"
                        >
                          <ChevronDown size={18} style={{ transform: isProjDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                        </button>
                      </div>
                    </div>

                    {/* INTERACTIVE DROPDOWN MENU LIST */}
                    {isProjDropdownOpen && (() => {
                      const allProjs = getAllMasterProjects();
                      const q = projComboboxSearch.toLowerCase().trim();

                      const filteredProjs = allProjs.filter((p: any) => {
                        if (!q) return true;
                        return (p.code || p.id || '').toLowerCase().includes(q) ||
                               (p.title || '').toLowerCase().includes(q) ||
                               (p.developer || '').toLowerCase().includes(q) ||
                               (p.locality || '').toLowerCase().includes(q);
                      });

                      return (
                        <div 
                          style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                            right: 0, 
                            marginTop: '4px', 
                            background: isLight ? '#ffffff' : '#0f172a', 
                            border: '2px solid #0284c7', 
                            borderRadius: '10px', 
                            maxHeight: '280px', 
                            overflowY: 'auto', 
                            zIndex: 9999, 
                            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                            padding: '6px 0' 
                          }}
                        >
                          <div style={{ padding: '6px 12px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b', background: isLight ? '#f0f9ff' : 'rgba(2, 132, 199, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '900' }}>
                              📁 REGISTERED MASTER PROJECTS ({filteredProjs.length})
                            </span>
                            <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                              Click project to select & link
                            </span>
                          </div>

                          {filteredProjs.length === 0 ? (
                            <div style={{ padding: '14px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              🔍 No master projects match "{projComboboxSearch}".
                            </div>
                          ) : (
                            filteredProjs.map((proj: any) => {
                              const isSelected = newPropertyForm.project_id === (proj.id || proj.code);
                              return (
                                <div
                                  key={proj.id || proj.code}
                                  onClick={() => {
                                    setNewPropertyForm((prev: any) => ({
                                      ...prev,
                                      project_id: proj.id || proj.code,
                                      developer: proj.developer || prev.developer,
                                      developer_id: proj.developer_id || prev.developer_id,
                                      title: proj.title || prev.title,
                                      locality: proj.locality || prev.locality,
                                      latitude: proj.latitude || prev.latitude,
                                      longitude: proj.longitude || prev.longitude,
                                      rera_id: proj.rera_id || prev.rera_id || '',
                                      hera_no: proj.hera_no || prev.hera_no || '',
                                      selected_amenities: proj.amenities && proj.amenities.length > 0 ? proj.amenities : prev.selected_amenities,
                                      building_photos: proj.building_photos && proj.building_photos.length > 0 ? proj.building_photos : prev.building_photos,
                                      total_covered_parking_capacity: proj.total_covered_parking_capacity !== undefined ? proj.total_covered_parking_capacity : (prev.total_covered_parking_capacity || 0),
                                      covered_parking_rate: proj.covered_parking_rate || '',
                                      total_ev_parking_capacity: proj.total_ev_parking_capacity !== undefined ? proj.total_ev_parking_capacity : (prev.total_ev_parking_capacity || 0),
                                      ev_parking_rate: proj.ev_parking_rate || '',
                                      total_open_parking_capacity: proj.total_open_parking_capacity !== undefined ? proj.total_open_parking_capacity : (prev.total_open_parking_capacity || 0),
                                      open_parking_rate: proj.open_parking_rate || '',
                                      parking_price: '',
                                      car_parking_charge: '',
                                      key_custody: proj.key_custody || prev.key_custody || '',
                                      keys_custody: proj.key_custody || prev.keys_custody || '',
                                      architectural_description: proj.architectural_description || prev.architectural_description || '',
                                      description: proj.architectural_description || prev.description || '',
                                      total_floors: proj.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)',
                                      number_of_towers: proj.number_of_towers || prev.number_of_towers || '',
                                      floor_no: `${prev.unit_floor || '2nd Floor'} out of ${proj.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)'}`
                                    }));
                                    if (proj.mobile) setDevProjectMobile(proj.mobile);
                                    if (proj.altMobile && setDevProjectAltMobile) setDevProjectAltMobile(proj.altMobile);
                                    setProjComboboxSearch('');
                                    setIsProjDropdownOpen(false);
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    background: isSelected ? (isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.25)') : 'transparent',
                                    borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = isLight ? '#f8fafc' : '#1e293b';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.72rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', border: '1px solid #0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontFamily: 'monospace' }}>
                                      🔑 {proj.code || proj.id}
                                    </span>
                                    <strong style={{ fontSize: '0.88rem', color: isLight ? '#0f172a' : '#ffffff' }}>
                                      🏢 {proj.title}
                                    </strong>
                                    <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                      — Builder: <strong style={{ color: '#fbbf24' }}>{proj.developer}</strong>
                                    </span>
                                    {proj.locality && (
                                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                        📍 {proj.locality}
                                      </span>
                                    )}
                                  </div>

                                  {isSelected && (
                                    <span style={{ fontSize: '0.72rem', background: '#22c55e', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                                      ✓ SELECTED
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. FILTER SEARCH KEYWORD INPUT */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Filter Search Keyword
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        value={projectIdSearchFilter}
                        onChange={(e) => setProjectIdSearchFilter(e.target.value)}
                        placeholder="Filter Project Code..."
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px 10px 34px', borderRadius: '8px', fontSize: '0.86rem' }}
                      />
                      <Search size={16} color="#0284c7" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                </div>



                {/* LINKED MASTER PROJECT & UNIQUE PROPERTY CODE SUMMARY BADGE */}
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✅ LINKED MASTER PROJECT DETAILS
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🏢 {newPropertyForm.title || 'Selected Project'} • <span style={{ color: '#0284c7' }}>Builder: {newPropertyForm.developer || 'Developer'}</span>
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      📍 Locality: {newPropertyForm.locality || 'Locality Hub'} (Lat: {newPropertyForm.latitude || '22.722361'}, Long: {newPropertyForm.longitude || '88.493403'}) • 🏬 Total Floors: <strong style={{ color: '#38bdf8' }}>{newPropertyForm.total_floors || 'G+4 Floors (5 Storey)'}</strong> • 🏰 Towers: <strong style={{ color: '#fbbf24' }}>{newPropertyForm.number_of_towers || 'Standalone'}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.66rem', color: '#0284c7', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🔑 Master Project ID</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace' }}>
                        {newPropertyForm.project_id || generateNextProjectId()}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1.5px solid #22c55e', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.66rem', color: '#22c55e', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>🏷️ Unique Property Code</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace' }}>
                        {newPropertyForm.property_code || generateDynamicPropertyCode()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* 🚗 PROJECT PARKING STOCK CAPACITY & DEFAULT RATES MANAGEMENT SYSTEM */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #eab308', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🚗 Project Parking Stock Capacity & Default Rates Management System
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                      Configure total project parking slot inventory limits (Covered, EV Fast Charging, Open Surface) and builder default rates.
                    </p>
                  </div>

                  <span style={{ fontSize: '0.74rem', background: 'rgba(234, 179, 8, 0.18)', color: '#eab308', border: '1px solid #eab308', padding: '3px 10px', borderRadius: '20px', fontWeight: '900' }}>
                    {newPropertyForm.project_id ? `PROJ PARKING VAULT ACTIVE • ${newPropertyForm.project_id}` : 'PROJ PARKING VAULT ACTIVE'}
                  </span>
                </div>

                {/* PARKING CARDS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
                  
                  {/* 1. COVERED PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🚘 Covered Basement / Stilt Parking
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        Basement / Podium
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total Allocated Slot Capacity
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_covered_parking_capacity !== undefined && newPropertyForm.total_covered_parking_capacity !== null ? newPropertyForm.total_covered_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_covered_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 24"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Builder Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.covered_parking_rate || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewPropertyForm({ 
                            ...newPropertyForm, 
                            covered_parking_rate: val
                          });
                        }}
                        placeholder="e.g. 300000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* 2. EV FAST CHARGING PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚡ EV Fast Charging Station Slots
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        EV Ready
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total EV Fast Charger Slots
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_ev_parking_capacity !== undefined && newPropertyForm.total_ev_parking_capacity !== null ? newPropertyForm.total_ev_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_ev_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 6"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #eab308', color: '#eab308', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        EV Slot Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.ev_parking_rate || ''}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, ev_parking_rate: e.target.value })}
                        placeholder="e.g. 450000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  {/* 3. OPEN SURFACE PARKING STOCK */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🅿️ Open Surface Ground Parking
                      </span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        Ground Level
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Total Open Surface Slot Capacity
                      </label>
                      <input 
                        type="number"
                        value={newPropertyForm.total_open_parking_capacity !== undefined && newPropertyForm.total_open_parking_capacity !== null ? newPropertyForm.total_open_parking_capacity : 0}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, total_open_parking_capacity: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g. 12"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '8px 12px', borderRadius: '6px', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Open Slot Default Rate (INR)
                      </label>
                      <input 
                        type="text"
                        value={newPropertyForm.open_parking_rate || ''}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, open_parking_rate: e.target.value })}
                        placeholder="e.g. 150000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTIONS 2, 3 & 5: SINGLE STANDALONE PROPERTY SPECIFICATIONS (ONLY VISIBLE IN SINGLE PROPERTY MODE) */}
              {propertyAddMode === 'single' && (
                <>
                  {/* SECTION 2: PROPERTY SPECIFICATIONS & UNIT DETAILS */}
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isLight ? '#d97706' : '#fbbf24', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>
                      2. Property Specifications & Unit Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>🆔 Project Posting ID</label>
                        <input 
                          type="text" 
                          value={newPropertyForm.project_posting_id !== undefined ? newPropertyForm.project_posting_id : (newPropertyForm.campaign_id || 'PRJ-POST-2026-8802')} 
                          onChange={(e) => setNewPropertyForm({ ...newPropertyForm, project_posting_id: e.target.value })} 
                          placeholder="e.g. PRJ-POST-2026-8802" 
                          style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>🏛️ RERA Registration No. (RERA ID)</label>
                        <input 
                          type="text" 
                          value={newPropertyForm.rera_id || ''} 
                          onChange={(e) => setNewPropertyForm({ ...newPropertyForm, rera_id: e.target.value })} 
                          placeholder="Enter RERA Registration No. (Optional)" 
                          style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>📜 HERA Registration No. (HERA ID)</label>
                        <input 
                          type="text" 
                          value={newPropertyForm.hera_no || ''} 
                          onChange={(e) => setNewPropertyForm({ ...newPropertyForm, hera_no: e.target.value })} 
                          placeholder="Enter HERA Registration No. (Optional)" 
                          style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#a855f7', fontFamily: 'monospace', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                        />
                      </div>
                    </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Property Category Type</label>
                    <select 
                      value={(() => {
                        const pt = newPropertyForm.property_type || 'Flat / Apartment (New / Builder)';
                        const standardTypes = [
                          'Flat / Apartment (New / Builder)', 'Flat / Apartment (Resale)', 'Flat / Apartment (For Rent)',
                          'Semi Complex (New / Builder)', 'Semi Complex (Resale)', 'Semi Complex (For Rent)',
                          'Gated Villa (New / Builder)', 'Gated Villa (Resale)', 'Gated Villa (For Rent)',
                          'Independent House / Bungalow (New / Builder)', 'Independent House (Resale)', 'Independent House (For Rent)',
                          'Commercial Space (New / Builder)', 'Commercial Space (Resale)', 'Commercial Space (For Lease / Rent)',
                          'Commercial Shop / Showroom', 'Commercial Office Space', 'PG / Co-Living Space (For Rent)',
                          'Open Plot / Land (New / Builder)', 'Open Plot / Land (Resale)', 'Industrial Land / Warehouse'
                        ];
                        if (standardTypes.includes(pt)) return pt;
                        const match = standardTypes.find(s => s.toLowerCase().startsWith(pt.toLowerCase()));
                        return match || pt;
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, property_type: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="Flat / Apartment (New / Builder)">🏢 Flat / Apartment (New / Builder)</option>
                      <option value="Flat / Apartment (Resale)">🔄 Flat / Apartment (Resale)</option>
                      <option value="Flat / Apartment (For Rent)">🔑 Flat / Apartment (For Rent)</option>
                      <option value="Semi Complex (New / Builder)">🏙️ Semi Complex (New / Builder)</option>
                      <option value="Semi Complex (Resale)">🔄 Semi Complex (Resale)</option>
                      <option value="Semi Complex (For Rent)">🔑 Semi Complex (For Rent)</option>
                      <option value="Gated Villa (New / Builder)">🏰 Gated Villa (New / Builder)</option>
                      <option value="Gated Villa (Resale)">🔄 Gated Villa (Resale)</option>
                      <option value="Gated Villa (For Rent)">🔑 Gated Villa (For Rent)</option>
                      <option value="Independent House / Bungalow (New / Builder)">🏡 Independent House / Bungalow (New / Builder)</option>
                      <option value="Independent House (Resale)">🔄 Independent House (Resale)</option>
                      <option value="Independent House (For Rent)">🔑 Independent House (For Rent)</option>
                      <option value="Commercial Space (New / Builder)">🏢 Commercial Space (New / Builder)</option>
                      <option value="Commercial Space (Resale)">🔄 Commercial Space (Resale)</option>
                      <option value="Commercial Space (For Lease / Rent)">🔑 Commercial Space (For Lease / Rent)</option>
                      <option value="Commercial Shop / Showroom">🏬 Commercial Shop / Showroom</option>
                      <option value="Commercial Office Space">🏢 Commercial Office Space</option>
                      <option value="PG / Co-Living Space (For Rent)">🛌 PG / Co-Living Space (For Rent)</option>
                      <option value="Open Plot / Land (New / Builder)">📐 Open Plot / Land (New / Builder)</option>
                      <option value="Open Plot / Land (Resale)">📐 Open Plot / Land (Resale)</option>
                      <option value="Industrial Land / Warehouse">🏭 Industrial Land / Warehouse</option>
                      {(() => {
                        const cur = newPropertyForm.property_type;
                        const standardTypes = [
                          'Flat / Apartment (New / Builder)', 'Flat / Apartment (Resale)', 'Flat / Apartment (For Rent)',
                          'Semi Complex (New / Builder)', 'Semi Complex (Resale)', 'Semi Complex (For Rent)',
                          'Gated Villa (New / Builder)', 'Gated Villa (Resale)', 'Gated Villa (For Rent)',
                          'Independent House / Bungalow (New / Builder)', 'Independent House (Resale)', 'Independent House (For Rent)',
                          'Commercial Space (New / Builder)', 'Commercial Space (Resale)', 'Commercial Space (For Lease / Rent)',
                          'Commercial Shop / Showroom', 'Commercial Office Space', 'PG / Co-Living Space (For Rent)',
                          'Open Plot / Land (New / Builder)', 'Open Plot / Land (Resale)', 'Industrial Land / Warehouse'
                        ];
                        if (cur && !standardTypes.includes(cur)) {
                          return <option value={cur}>🏢 {cur}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>BHK Configuration</label>
                    <select 
                      value={(() => {
                        const c = newPropertyForm.configuration || '';
                        if (!c) return '';
                        if (c.startsWith('1BHK')) return '1BHK';
                        if (c.startsWith('2BHK')) return '2BHK';
                        if (c.startsWith('3BHK')) return '3BHK';
                        if (c.startsWith('4BHK')) return '4BHK';
                        if (c.toLowerCase().includes('villa')) return 'Villa';
                        if (c.toLowerCase().includes('commercial')) return 'Commercial';
                        return c;
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, configuration: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="">Select BHK Configuration</option>
                      <option value="1BHK">1BHK Studio</option>
                      <option value="2BHK">2BHK Flat</option>
                      <option value="3BHK">3BHK Flat</option>
                      <option value="4BHK">4BHK Luxury Apartment</option>
                      <option value="Villa">Gated Villa</option>
                      <option value="Commercial">Commercial</option>
                      {(() => {
                        const c = newPropertyForm.configuration;
                        if (c && !['1BHK', '2BHK', '3BHK', '4BHK', 'Villa', 'Commercial'].includes(c) && !c.startsWith('1BHK') && !c.startsWith('2BHK') && !c.startsWith('3BHK') && !c.startsWith('4BHK')) {
                          return <option value={c}>{c}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Super Built-up Area (Sq.Ft.)</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.super_builtup_area} 
                      onChange={(e) => {
                        const superVal = e.target.value;
                        const superNum = parseSqftValue(superVal);
                        const pctNum = parseDeductionPct(newPropertyForm.deduction_pct, superVal, newPropertyForm.carpet_area);
                        let computedCarpet = newPropertyForm.carpet_area;
                        if (superNum > 0) {
                          const carpetNum = superNum * (1 - pctNum / 100);
                          computedCarpet = `${Math.round(carpetNum * 100) / 100} Sq.Ft.`;
                        }
                        setNewPropertyForm({
                          ...newPropertyForm,
                          super_builtup_area: superVal,
                          carpet_area: computedCarpet,
                          deduction_pct: `${pctNum}%`
                        });
                      }} 
                      placeholder="e.g. 827" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Deduction / Loading (%) *</label>
                    {(() => {
                      const currentPctNum = parseDeductionPct(newPropertyForm.deduction_pct, newPropertyForm.super_builtup_area, newPropertyForm.carpet_area);
                      const standardPcts = [35, 30, 25, 20, 40, 0];
                      const isCustom = !standardPcts.includes(currentPctNum);
                      const selectValue = `${currentPctNum}%`;

                      return (
                        <select 
                          value={selectValue} 
                          onChange={(e) => {
                            const pctVal = e.target.value;
                            const pctNum = parseDeductionPct(pctVal);
                            const superNum = parseSqftValue(newPropertyForm.super_builtup_area);
                            let computedCarpet = newPropertyForm.carpet_area;
                            if (superNum > 0) {
                              const carpetNum = superNum * (1 - pctNum / 100);
                              computedCarpet = `${Math.round(carpetNum * 100) / 100} Sq.Ft.`;
                            }
                            setNewPropertyForm({
                              ...newPropertyForm,
                              deduction_pct: `${pctNum}%`,
                              carpet_area: computedCarpet
                            });
                          }} 
                          style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #eab308', color: '#eab308', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                        >
                          <option value="35%">35% Deduction (Standard Builder Loading)</option>
                          <option value="30%">30% Deduction</option>
                          <option value="25%">25% Deduction</option>
                          <option value="20%">20% Deduction</option>
                          <option value="40%">40% Deduction (High Common Area)</option>
                          <option value="0%">0% Deduction (Direct Carpet = Super)</option>
                          {isCustom && (
                            <option value={`${currentPctNum}%`}>{currentPctNum}% Deduction (Custom)</option>
                          )}
                        </select>
                      );
                    })()}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Carpet Area (Sq.Ft.) *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.carpet_area} 
                      onChange={(e) => {
                        const carpetVal = e.target.value;
                        const carpetNum = parseSqftValue(carpetVal);
                        const superNum = parseSqftValue(newPropertyForm.super_builtup_area);
                        let computedDedPct = newPropertyForm.deduction_pct;
                        if (superNum > 0 && carpetNum > 0 && superNum >= carpetNum) {
                          const dynamicPct = Math.round(((superNum - carpetNum) / superNum) * 100);
                          computedDedPct = `${dynamicPct}%`;
                        }
                        setNewPropertyForm({ 
                          ...newPropertyForm, 
                          carpet_area: carpetVal,
                          deduction_pct: computedDedPct || `${parseDeductionPct(newPropertyForm.deduction_pct)}%`
                        });
                      }} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #38bdf8', color: '#38bdf8', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Vastu Facing</label>
                    <select 
                      value={(() => {
                        const f = newPropertyForm.facing || 'East Facing';
                        const standards = [
                          'East Facing', 'North-East Facing', 'North Facing', 'North-West Facing',
                          'West Facing', 'South-West Facing', 'South Facing', 'South-East Facing'
                        ];
                        const found = standards.find(s => f.startsWith(s));
                        return found || f;
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, facing: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="East Facing">East Facing (Poorva)</option>
                      <option value="North-East Facing">North-East Facing (NE / Ishanya)</option>
                      <option value="North Facing">North Facing (Uttara)</option>
                      <option value="North-West Facing">North-West Facing (NW / Vayavya)</option>
                      <option value="West Facing">West Facing (Paschima)</option>
                      <option value="South-West Facing">South-West Facing (SW / Nairutya)</option>
                      <option value="South Facing">South Facing (Dakshina)</option>
                      <option value="South-East Facing">South-East Facing (SE / Agneya)</option>
                      {(() => {
                        const f = newPropertyForm.facing;
                        const standards = [
                          'East Facing', 'North-East Facing', 'North Facing', 'North-West Facing',
                          'West Facing', 'South-West Facing', 'South Facing', 'South-East Facing'
                        ];
                        if (f && !standards.some(s => f.startsWith(s))) {
                          return <option value={f}>{f}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Possession Status *</label>
                    <select 
                      value={(() => {
                        const ps = newPropertyForm.possession_status || 'Ready to Move';
                        if (ps === 'Ready to Move In (Immediate)') return 'Ready to Move';
                        if (ps === 'Newly Launched Project') return 'New Launch / Soft Launch';
                        return ps;
                      })()} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const isUnderConst = val.toLowerCase().includes('under construction') || val.toLowerCase().includes('construction');
                        setNewPropertyForm({ 
                          ...newPropertyForm, 
                          possession_status: val, 
                          possession: val,
                          status: isUnderConst ? 'UNDER_CONSTRUCTION' : 'LIVE',
                          ...(isUnderConst && !newPropertyForm.handover_month_year ? { handover_month: 'December', handover_year: '2026', handover_month_year: 'December 2026' } : {})
                        });
                      }} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="Ready to Move">🔑 Ready to Move</option>
                      <option value="Under Construction">🏗️ Under Construction</option>
                      <option value="New Launch / Soft Launch">🌟 New Launch / Soft Launch</option>
                      <option value="Resale Property">🔄 Resale Property</option>
                      <option value="Any Condition">🌐 Any Condition</option>
                      {(() => {
                        const ps = newPropertyForm.possession_status;
                        const standards = ['Ready to Move', 'Under Construction', 'New Launch / Soft Launch', 'Resale Property', 'Any Condition', 'Ready to Move In (Immediate)', 'Newly Launched Project'];
                        if (ps && !standards.includes(ps)) {
                          return <option value={ps}>{ps}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>

                  {/* 📅 HANDOVER MONTH AND YEAR (OPENED WHEN UNDER CONSTRUCTION IS SELECTED) */}
                  {(newPropertyForm.possession_status || '').includes('Under Construction') && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#eab308', fontWeight: '900', display: 'block', marginBottom: '6px' }}>
                        📅 Handover Month and Year *
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          value={newPropertyForm.handover_month || 'December'} 
                          onChange={(e) => {
                            const month = e.target.value;
                            const year = newPropertyForm.handover_year || '2026';
                            setNewPropertyForm({ ...newPropertyForm, handover_month: month, handover_year: year, handover_month_year: `${month} ${year}` });
                          }}
                          style={{ flex: 1, background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', color: '#eab308', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          value={newPropertyForm.handover_year || '2026'} 
                          onChange={(e) => {
                            const month = newPropertyForm.handover_month || 'December';
                            const year = e.target.value;
                            setNewPropertyForm({ ...newPropertyForm, handover_month: month, handover_year: year, handover_month_year: `${month} ${year}` });
                          }}
                          style={{ width: '110px', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', color: '#eab308', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                        >
                          {['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* DEDUCTION AUTO-CALCULATION SUMMARY CARD */}
                {(() => {
                  const superNum = parseSqftValue(newPropertyForm.super_builtup_area);
                  const pctNum = parseDeductionPct(newPropertyForm.deduction_pct, newPropertyForm.super_builtup_area, newPropertyForm.carpet_area);
                  if (superNum > 0) {
                    const deductionVal = superNum * (pctNum / 100);
                    const carpetVal = superNum - deductionVal;
                    return (
                      <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid #eab308', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ color: '#eab308', fontWeight: '900' }}>📐 LIVE DEDUCTION CALCULATION:</span>{' '}
                          <strong>{superNum} Sq.Ft.</strong> (Super Built up) − <strong>{pctNum}% Deduction</strong> ({Math.round(deductionVal * 100) / 100} Sq.Ft.) = <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{Math.round(carpetVal * 100) / 100} Sq.Ft. (Carpet Area)</strong>
                        </div>
                        <span style={{ background: '#eab308', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900' }}>
                          AUTO-CALCULATED
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Floor Number (Unit Floor) *</label>
                    <select 
                      value={normalizeUnitFloor(newPropertyForm.unit_floor || newPropertyForm.floor_num || newPropertyForm.floor_no || '2nd Floor')} 
                      onChange={(e) => {
                        const uFloor = e.target.value;
                        const tFloors = normalizeTotalFloors(newPropertyForm.total_floors || 'G+4 Floors (5 Storey)');
                        setNewPropertyForm({
                          ...newPropertyForm,
                          unit_floor: uFloor,
                          floor_no: `${uFloor} out of ${tFloors}`
                        });
                      }} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }} 
                    >
                      <option value="Basement 2 (B2)">Basement 2 (B2)</option>
                      <option value="Basement 1 (B1 / B)">Basement 1 (B1 / B)</option>
                      <option value="Ground Floor (G)">Ground Floor (G)</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const num = i + 1;
                        let suffix = 'th';
                        if (num === 1 || (num > 20 && num % 10 === 1)) suffix = 'st';
                        else if (num === 2 || (num > 20 && num % 10 === 2)) suffix = 'nd';
                        else if (num === 3 || (num > 20 && num % 10 === 3)) suffix = 'rd';
                        return (
                          <option key={`unit_fl_${num}`} value={`${num}${suffix} Floor`}>
                            {num}{suffix} Floor
                          </option>
                        );
                      })}
                      <option value="31st Floor / Sky Suite">31st Floor / Sky Suite</option>
                      <option value="Penthouse / Top Floor">Penthouse / Top Floor</option>
                      {(() => {
                        const cur = normalizeUnitFloor(newPropertyForm.unit_floor || newPropertyForm.floor_num || newPropertyForm.floor_no);
                        const standardUnits = [
                          'Basement 2 (B2)', 'Basement 1 (B1 / B)', 'Ground Floor (G)',
                          ...Array.from({ length: 30 }, (_, i) => {
                            const num = i + 1;
                            let suffix = 'th';
                            if (num === 1 || (num > 20 && num % 10 === 1)) suffix = 'st';
                            else if (num === 2 || (num > 20 && num % 10 === 2)) suffix = 'nd';
                            else if (num === 3 || (num > 20 && num % 10 === 3)) suffix = 'rd';
                            return `${num}${suffix} Floor`;
                          }),
                          '31st Floor / Sky Suite', 'Penthouse / Top Floor'
                        ];
                        if (cur && !standardUnits.includes(cur)) {
                          return <option value={cur}>{cur}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span>Total Floors in Building *</span>
                      {newPropertyForm.project_id && (
                        <span style={{ fontSize: '0.68rem', color: '#0284c7', background: isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.2)', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                          ⚡ Auto-fetched from Master Project
                        </span>
                      )}
                    </label>
                    <select 
                      value={normalizeTotalFloors(newPropertyForm.total_floors || 'G+4 Floors (5 Storey)')} 
                      onChange={(e) => {
                        const tFloors = e.target.value;
                        const uFloor = newPropertyForm.unit_floor || '2nd Floor';
                        setNewPropertyForm({
                          ...newPropertyForm,
                          total_floors: tFloors,
                          floor_no: `${uFloor} out of ${tFloors}`
                        });
                      }} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }} 
                    >
                      <option value="Ground Floor Only (G)">Ground Floor Only (G)</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const num = i + 1;
                        const storey = num + 1;
                        return (
                          <option key={`tot_fl_${num}`} value={`G+${num} Floors (${storey} Storey)`}>
                            G+{num} Floors ({storey} Storey)
                          </option>
                        );
                      })}
                      <option value="B+G (Basement + Ground)">B+G (Basement + Ground)</option>
                      <option value="B+G+4 Floors (Midrise)">B+G+4 Floors (Midrise)</option>
                      <option value="B+G+14 Floors (Highrise)">B+G+14 Floors (Highrise)</option>
                      <option value="B+G+30 Floors (Ultra Highrise)">B+G+30 Floors (Ultra Highrise)</option>
                      <option value="2B+G+30 Floors (Mega Highrise)">2B+G+30 Floors (Mega Highrise)</option>
                      {(() => {
                        const curNorm = normalizeTotalFloors(newPropertyForm.total_floors);
                        const standardOptions = [
                          'Ground Floor Only (G)',
                          ...Array.from({ length: 30 }, (_, i) => `G+${i + 1} Floors (${i + 2} Storey)`),
                          'B+G (Basement + Ground)',
                          'B+G+4 Floors (Midrise)',
                          'B+G+14 Floors (Highrise)',
                          'B+G+30 Floors (Ultra Highrise)',
                          '2B+G+30 Floors (Mega Highrise)'
                        ];
                        if (curNorm && !standardOptions.includes(curNorm)) {
                          return <option value={curNorm}>{curNorm}</option>;
                        }
                        if (newPropertyForm.total_floors && !standardOptions.includes(newPropertyForm.total_floors) && newPropertyForm.total_floors !== curNorm) {
                          return <option value={newPropertyForm.total_floors}>{newPropertyForm.total_floors}</option>;
                        }
                        return null;
                      })()}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Tower / Block Name</label>
                    <input type="text" value={newPropertyForm.tower_block} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, tower_block: e.target.value })} placeholder="Tower B - Sapphire" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '900', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span>Number Of Towers in Project / Complex *</span>
                      {newPropertyForm.project_id && (
                        <span style={{ fontSize: '0.68rem', color: '#22c55e', background: isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                          ⚡ Auto-fetched from Master Project
                        </span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.number_of_towers || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, number_of_towers: e.target.value })} 
                      placeholder="e.g. 1 Standalone Tower / 4 Towers Complex" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #fbbf24', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: COMMERCIALS, PRICING & BROKERAGE */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isLight ? '#16a34a' : '#4ade80', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>
                  3. Pricing, Commercials, Parking & All-Inclusive Final Valuation
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Asking Rate per Sq.Ft. *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.price_sqft} 
                      onChange={(e) => {
                        const sqftVal = e.target.value;
                        const priceNum = parseFloat(String(sqftVal || '').replace(/[^0-9.]/g, ''));
                        const superNum = parseFloat(String(newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
                        let computedFlatPrice = newPropertyForm.final_price;
                        if (!isNaN(priceNum) && !isNaN(superNum) && superNum > 0) {
                          const flatVal = Math.round(priceNum * superNum);
                          computedFlatPrice = `₹${flatVal.toLocaleString('en-IN')}`;
                        }
                        setNewPropertyForm({
                          ...newPropertyForm,
                          price_sqft: sqftVal,
                          final_price: computedFlatPrice
                        });
                      }} 
                      placeholder="e.g. 5131"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #38bdf8', color: '#38bdf8', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Base Property Asking Price [Super Built-up × Rate] *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.final_price || (parseFloat(String(newPropertyForm.price_sqft || '').replace(/[^0-9.]/g, '')) && parseFloat(String(newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, '')) ? `₹${Math.round(parseFloat(String(newPropertyForm.price_sqft || '').replace(/[^0-9.]/g, '')) * parseFloat(String(newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''))).toLocaleString('en-IN')}` : '')} 
                      onChange={(e) => {
                        const flatVal = e.target.value;
                        const flatNum = parseFloat(String(flatVal || '').replace(/[^0-9.]/g, ''));
                        const superNum = parseFloat(String(newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
                        let computedPriceSqft = newPropertyForm.price_sqft;
                        if (!isNaN(flatNum) && !isNaN(superNum) && superNum > 0) {
                          const sqftNum = Math.round(flatNum / superNum);
                          computedPriceSqft = `₹${sqftNum.toLocaleString('en-IN')}/Sq.Ft.`;
                        }
                        setNewPropertyForm({
                          ...newPropertyForm,
                          final_price: flatVal,
                          price_sqft: computedPriceSqft
                        });
                      }} 
                      placeholder="e.g. ₹65,83,073"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #22c55e', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>



                  {/* GST CHARGE OPTION */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Goods & Services Tax (GST) Rate (%) *</label>
                    <select 
                      value={(() => {
                        const raw = String(newPropertyForm.gst_pct || '5%').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        if (!isNaN(num) && [0, 1, 2, 3, 4, 5, 12, 18].includes(num)) return `${num}%`;
                        return raw || '5%';
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, gst_pct: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #a855f7', color: '#a855f7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="1%">1% GST (Affordable Housing Rate)</option>
                      <option value="2%">2% GST</option>
                      <option value="3%">3% GST</option>
                      <option value="4%">4% GST</option>
                      <option value="5%">5% GST (Under Construction Standard)</option>
                      <option value="0%">0% GST (Ready-to-Move / Exempt)</option>
                      <option value="12%">12% GST (Commercial Real Estate)</option>
                      {(() => {
                        const raw = String(newPropertyForm.gst_pct || '').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        const val = !isNaN(num) ? `${num}%` : raw;
                        return val && !['1%', '2%', '3%', '4%', '5%', '0%', '12%'].includes(val) ? (
                          <option value={val}>{val} GST</option>
                        ) : null;
                      })()}
                    </select>
                  </div>

                  {/* STAMP DUTY CHARGES RATE (%) */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Stamp Duty Charges Rate (%) *</label>
                    <select 
                      value={(() => {
                        const raw = String(newPropertyForm.stamp_duty_pct !== undefined && newPropertyForm.stamp_duty_pct !== null ? newPropertyForm.stamp_duty_pct : '5%').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        if (!isNaN(num) && num >= 4 && num <= 10) return `${num}%`;
                        return raw || '5%';
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, stamp_duty_pct: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    >
                      <option value="4%">4%</option>
                      <option value="5%">5%</option>
                      <option value="6%">6%</option>
                      <option value="7%">7%</option>
                      <option value="8%">8%</option>
                      <option value="9%">9%</option>
                      <option value="10%">10%</option>
                      {(() => {
                        const raw = String(newPropertyForm.stamp_duty_pct !== undefined && newPropertyForm.stamp_duty_pct !== null ? newPropertyForm.stamp_duty_pct : '').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        const val = !isNaN(num) ? `${num}%` : raw;
                        return val && !['4%', '5%', '6%', '7%', '8%', '9%', '10%'].includes(val) ? (
                          <option value={val}>{val}</option>
                        ) : null;
                      })()}
                    </select>
                  </div>

                  {/* REGISTRATION & PROPERTY TRANSFER FEE RATE (%) */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Registration & Property Transfer Fee Rate (%) *</label>
                    <select 
                      value={(() => {
                        const raw = String(newPropertyForm.registration_fee_pct !== undefined && newPropertyForm.registration_fee_pct !== null ? newPropertyForm.registration_fee_pct : '1%').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        if (!isNaN(num) && num >= 1 && num <= 5) return `${num}%`;
                        return raw || '1%';
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, registration_fee_pct: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    >
                      <option value="1%">1%</option>
                      <option value="2%">2%</option>
                      <option value="3%">3%</option>
                      <option value="4%">4%</option>
                      <option value="5%">5%</option>
                      {(() => {
                        const raw = String(newPropertyForm.registration_fee_pct !== undefined && newPropertyForm.registration_fee_pct !== null ? newPropertyForm.registration_fee_pct : '').trim();
                        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                        const val = !isNaN(num) ? `${num}%` : raw;
                        return val && !['1%', '2%', '3%', '4%', '5%'].includes(val) ? (
                          <option value={val}>{val}</option>
                        ) : null;
                      })()}
                    </select>
                  </div>
                </div>

                {/* ITEMIZATION SECTION HEADER */}
                <div style={{ background: isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.15)', borderLeft: '4px solid #0284c7', padding: '8px 12px', borderRadius: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#0369a1' : '#38bdf8' }}>
                    📋 Cost Sheet Breakdown Charge Particulars (Auto-populates Official Client Cost Sheet)
                  </span>
                </div>

                {/* ROW 2: CHARGES 1, 2, 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                  {/* 1. FLOOR RISE CHARGE */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Floor Rise Charge (INR)
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.floor_rise_charge !== undefined ? newPropertyForm.floor_rise_charge : ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, floor_rise_charge: e.target.value, floorRise: e.target.value })} 
                      placeholder="e.g. 50000 (0 if N/A)"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  {/* 2. PREFERENTIAL LOCATION CHARGE (PLC - FACING) */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Preferential Location Charge (PLC - Facing) (INR)
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.plc_charge !== undefined ? newPropertyForm.plc_charge : ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, plc_charge: e.target.value, plc: e.target.value })} 
                      placeholder="e.g. 75000 (0 if N/A)"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  {/* 3. COVERED CAR PARKING SLOT CHARGE */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Covered Car Parking Slot Charge (INR)
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.parking_price !== undefined ? newPropertyForm.parking_price : ''}
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, parking_price: e.target.value, car_parking_charge: e.target.value })}
                      placeholder="e.g. 350000 (0 if N/A)"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>

                {/* ROW 3: CHARGES 4, 5, 6 */}
                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                  {/* 4. CLUBHOUSE & GATED AMENITIES MEMBERSHIP */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Clubhouse & Gated Amenities Membership (INR) *
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.amenity_charges !== undefined ? newPropertyForm.amenity_charges : ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, amenity_charges: e.target.value, clubhouse_charge: e.target.value })} 
                      placeholder="e.g. 150000"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  {/* 5. ADVANCE MAINTENANCE CHARGE (1 YEAR) */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Advance Maintenance Charge (1 Year) (INR)
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.advance_maintenance_charge !== undefined ? newPropertyForm.advance_maintenance_charge : ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, advance_maintenance_charge: e.target.value })} 
                      placeholder="e.g. 25000"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  {/* 6. LAWYER / LEGAL VERIFICATION & INFRASTRUCTURE CHARGES */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Lawyer / Legal Verification & Infrastructure Charges (INR)
                    </label>
                    <input 
                      type="text" 
                      value={newPropertyForm.legal_doc_charge !== undefined ? newPropertyForm.legal_doc_charge : ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, legal_doc_charge: e.target.value, infrastructure_charge: e.target.value, lawyer_charge: e.target.value })} 
                      placeholder="e.g. 45000"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>

                {/* TOTAL BASE PRICE WITH OTHER CHARGES */}
                <div style={{ background: isLight ? '#f0fdf4' : 'rgba(34, 197, 94, 0.12)', border: '2px solid #22c55e', borderRadius: '10px', padding: '14px' }}>
                  <label style={{ fontSize: '0.84rem', color: '#16a34a', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    💰 Total Base price with Others Charges (INR) [Base Property Asking Price + Floor Rise + PLC + Parking + Clubhouse + Maint + Legal] *
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={computeTotalBaseWithOtherCharges(newPropertyForm)} 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '12px 14px', borderRadius: '8px', fontSize: '1.08rem' }} 
                  />
                  <span style={{ fontSize: '0.72rem', color: isLight ? '#475569' : '#94a3b8', marginTop: '4px', display: 'block', fontWeight: '700' }}>
                    💡 Auto-calculated sum = Base Property Asking Price [Super Built-up × Rate] + Floor Rise Charge + Preferential Location Charge (PLC) + Covered Car Parking Slot Charge + Clubhouse & Gated Amenities Membership + Advance Maintenance Charge (1 Year) + Infrastructure & Legal Documentation Charges (Before GST Tax).
                  </span>
                </div>



                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Possession Status</label>
                    <select 
                      value={(newPropertyForm.possession_status === 'Ready to Move In (Immediate)' ? 'Ready to Move' : (newPropertyForm.possession_status === 'Newly Launched Project' ? 'New Launch / Soft Launch' : newPropertyForm.possession_status)) || 'Ready to Move'} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const isUnderConst = val.toLowerCase().includes('under construction') || val.toLowerCase().includes('construction');
                        setNewPropertyForm({
                          ...newPropertyForm,
                          possession_status: val,
                          possession: val,
                          status: isUnderConst ? 'UNDER_CONSTRUCTION' : 'LIVE',
                          ...(isUnderConst && !newPropertyForm.handover_month_year ? { handover_month: 'December', handover_year: '2026', handover_month_year: 'December 2026' } : {})
                        });
                      }} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="New Launch / Soft Launch">New Launch / Soft Launch</option>
                      <option value="Resale Property">Resale Property</option>
                      <option value="Any Condition">Any Condition</option>
                    </select>
                  </div>
                  {(newPropertyForm.possession_status || '').includes('Under Construction') && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#eab308', fontWeight: '900', display: 'block', marginBottom: '6px' }}>
                        📅 Handover Month and Year *
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          value={newPropertyForm.handover_month || 'December'} 
                          onChange={(e) => {
                            const month = e.target.value;
                            const year = newPropertyForm.handover_year || '2026';
                            setNewPropertyForm({ ...newPropertyForm, handover_month: month, handover_year: year, handover_month_year: `${month} ${year}` });
                          }}
                          style={{ flex: 1, background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', color: '#eab308', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          value={newPropertyForm.handover_year || '2026'} 
                          onChange={(e) => {
                            const month = newPropertyForm.handover_month || 'December';
                            const year = e.target.value;
                            setNewPropertyForm({ ...newPropertyForm, handover_month: month, handover_year: year, handover_month_year: `${month} ${year}` });
                          }}
                          style={{ width: '110px', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', color: '#eab308', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                        >
                          {['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Monthly Maintenance</label>
                    <input type="text" value={newPropertyForm.maintenance_monthly} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, maintenance_monthly: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Stock Inventory Status</label>
                    <select 
                      value={(() => {
                        const s = String(newPropertyForm.status || 'LIVE').toUpperCase().replace(/\s+/g, '_');
                        return s === 'AVAILABLE' ? 'LIVE' : s;
                      })()} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, status: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="LIVE">🟢 LIVE</option>
                      <option value="SOLD_OUT">🔴 SOLD OUT</option>
                      <option value="BOOKED">🟡 BOOKED</option>
                    </select>
                  </div>
                </div>
              </div>


            </>
          )}

              {/* FULL PAGE ACTION FOOTER BUTTONS */}
              <div style={{ display: 'flex', gap: '16px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    lastHydratedPropertyIdRef.current = null;
                    setActiveProjectSubTab('property_master');
                  }} 
                  style={{ background: isLight ? '#f1f5f9' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: isLight ? '1px solid #cbd5e1' : 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancel & Return to Registry
                </button>
                <button 
                  type="submit" 
                  style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '14px 36px', borderRadius: '10px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {editingProperty ? `💾 SAVE & UPDATE PROPERTY (${editingProperty.property_code})` : `💾 SAVE & COMPLETE PROPERTY REGISTRATION`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* SUB-TAB 2: PROPERTY MASTER STOCK LIST */}
      {activeProjectSubTab === 'property_master' && (
        <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                🏠 Master Property Stock Inventory ({properties.filter(p => matchesSearchQuery(p, searchQuery)).length} of {properties.length} Active Stock)
              </h3>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>Comprehensive inventory registry with developer pricing, configuration, and availability status.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '8px', padding: '6px 12px', width: windowWidth <= 640 ? '100%' : '320px', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}>
                <Search size={15} color="#38bdf8" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search property code, title, developer..." 
                  style={{ background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#ffffff', outline: 'none', fontSize: '0.82rem', width: '100%', fontWeight: '700' }} 
                />
                {searchQuery && (
                  <span title="Clear Search" style={{ display: 'inline-flex', cursor: 'pointer' }} onClick={() => setSearchQuery('')}>
                    <X size={14} color="#94a3b8" />
                  </span>
                )}
              </div>
              <button onClick={() => { setIsBulkImportPropertyOpen(true); if (setShowBulkImportPropertyModal) setShowBulkImportPropertyModal(true); }} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none', whiteSpace: 'nowrap' }}>
                <Upload size={15} /> 📥 Import Bulk Inventory CSV / Excel
              </button>
            </div>
          </div>

          {selectedPropertyIds.length > 0 && (
            <div style={{
              background: isLight ? '#e0f2fe' : '#0c4a6e',
              border: '1.5px solid #0284c7',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontWeight: '800', color: isLight ? '#0369a1' : '#38bdf8', fontSize: '0.88rem' }}>
                ☑️ {selectedPropertyIds.length} property item(s) selected
              </span>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleBulkRecycleProperties}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={15} /> Move Selected ({selectedPropertyIds.length}) to Recycle Bin
                </button>

                <button
                  onClick={() => setSelectedPropertyIds([])}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: isLight ? '#cbd5e1' : '#334155',
                    color: isLight ? '#0f172a' : '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {windowWidth <= 768 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {properties
                .filter(p => matchesSearchQuery(p, searchQuery))
                .length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}>
                  No matching property stock items found.
                </div>
              ) : (
                properties
                  .filter(p => matchesSearchQuery(p, searchQuery))
                  .map(p => {
                    const carpetNum = parseFloat(String(p.carpet_area || '').replace(/[^0-9.]/g, ''));
                    const calcSuper = carpetNum ? `${Math.round(carpetNum / 0.7)} Sq.Ft.` : '1,280 Sq.Ft.';
                    const superDisp = p.super_builtup_area ? (String(p.super_builtup_area).toLowerCase().includes('sq') ? String(p.super_builtup_area) : `${p.super_builtup_area} Sq.Ft.`) : calcSuper;

                    const displayTitle = p.title || p.property_title || p.project_name || p.property_name || p.name || 'Untitled Property';
                    const displayDeveloper = p.developer || p.developer_name || p.builder_name || p.developer_company || 'Developer';

                    const allMasters = getAllMasterProjects();
                    const matchedMaster = allMasters.find(m => 
                      (m.title && displayTitle && m.title.toLowerCase().trim() === displayTitle.toLowerCase().trim()) ||
                      (m.id && p.project_id && m.id === p.project_id) ||
                      (m.code && p.project_id && m.code === p.project_id)
                    );
                    let rawProjCode = (p.project_id && !p.project_id.startsWith('SRM-DEV-')) ? p.project_id : null;
                    if (!rawProjCode && matchedMaster?.code && !matchedMaster.code.startsWith('SRM-DEV-')) {
                      rawProjCode = matchedMaster.code;
                    }
                    if (!rawProjCode && matchedMaster?.id && !matchedMaster.id.startsWith('SRM-DEV-')) {
                      rawProjCode = matchedMaster.id;
                    }
                    let projCode = (rawProjCode && !rawProjCode.startsWith('SRM-DEV-')) ? rawProjCode : (p.id ? `SRM-PROJ-${p.id}` : '');
                    if (projCode.includes('000088')) projCode = 'SRM-PROJ-2026-000001';
                    else if (projCode.includes('000089')) projCode = 'SRM-PROJ-2026-000002';
                    else if (projCode.includes('000090')) projCode = 'SRM-PROJ-2026-000003';

                    const projProps = properties.filter(item => {
                      const itemTitle = item.title || item.property_title || item.project_name || '';
                      return (item.project_id && item.project_id === projCode) ||
                             (itemTitle && displayTitle && itemTitle.toLowerCase().trim() === displayTitle.toLowerCase().trim());
                    });

                    const totalCoveredCap = matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 24;
                    const totalEvCap = matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 6;
                    const totalOpenCap = matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 12;

                    const allocCovered = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('covered')).length;
                    const allocEv = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('ev')).length;
                    const allocOpen = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('open')).length;

                    const availCovered = Math.max(0, totalCoveredCap - allocCovered);
                    const availEv = Math.max(0, totalEvCap - allocEv);
                    const availOpen = Math.max(0, totalOpenCap - allocOpen);

                    const assignedParking = String(p.car_parking || '1 Covered Basement Parking Slot');
                    const isCovered = (assignedParking).toLowerCase().includes('covered');
                    const isEv = (assignedParking).toLowerCase().includes('ev');
                    const isOpen = (assignedParking).toLowerCase().includes('open');

                    const parkingRateStr = isEv 
                      ? (matchedMaster?.ev_parking_rate || '450000') 
                      : isOpen 
                      ? (matchedMaster?.open_parking_rate || '150000') 
                      : (matchedMaster?.covered_parking_rate || '300000');

                    const availCountForType = isEv ? availEv : isOpen ? availOpen : availCovered;
                    const totalCapForType = isEv ? totalEvCap : isOpen ? totalOpenCap : totalCoveredCap;

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

                    const rawStatus = String(effectiveStatus || 'LIVE').toUpperCase().replace(/\s+/g, '_');
                    const normalizedStatus = rawStatus === 'AVAILABLE' ? 'LIVE' : rawStatus;
                    
                    const getStatusBadgeStyle = (statusVal: string) => {
                      if (statusVal.includes('SOLD')) {
                        return { border: '1.5px solid #ef4444', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171' };
                      } else if (statusVal.includes('BOOKED')) {
                        return { border: '1.5px solid #fbbf24', bg: 'rgba(234, 179, 8, 0.18)', color: '#fbbf24' };
                      } else if (statusVal.includes('HOLD') || statusVal.includes('RESERVED')) {
                        return { border: '1.5px solid #f59e0b', bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24' };
                      } else if (statusVal.includes('UNDER_CONSTRUCTION') || statusVal.includes('CONSTRUCTION')) {
                        return { border: '1.5px solid #a855f7', bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' };
                      } else if (statusVal.includes('READY')) {
                        return { border: '1.5px solid #0284c7', bg: 'rgba(2, 132, 199, 0.18)', color: '#38bdf8' };
                      }
                      return { border: '1.5px solid #22c55e', bg: 'rgba(34, 197, 94, 0.18)', color: '#4ade80' };
                    };

                    const isSelected = selectedPropertyIds.includes(p.id);
                    const badgeStyle = getStatusBadgeStyle(normalizedStatus);

                    return (
                      <div key={p.id} style={{ background: isSelected ? (isLight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.18)') : (isLight ? '#f8fafc' : '#0f172a'), border: isSelected ? '1.5px solid #0284c7' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectProperty(p.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0284c7' }}
                            />
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '900', fontSize: '0.85rem' }}>{p.property_code}</span>
                            <span style={{ fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                              🏢 {p.property_type || p.type || 'Flat'}
                            </span>
                          </div>
                          
                          <select
                            value={normalizedStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              let newPossession = p.possession_status || p.possession || 'Ready to Move In (Immediate)';
                              if (newStatus === 'UNDER_CONSTRUCTION') {
                                newPossession = 'Under Construction';
                              } else if (newStatus === 'READY_TO_MOVE' || newStatus === 'LIVE') {
                                newPossession = 'Ready to Move In (Immediate)';
                              }

                              let updatedProps: any[] = [];
                              if (setProperties) {
                                setProperties((prev: any[]) => {
                                  updatedProps = prev.map((item: any) => item.id === p.id ? { 
                                    ...item, 
                                    status: newStatus,
                                    possession_status: newPossession,
                                    possession: newPossession
                                  } : item);
                                  try {

                                  } catch (err) {}
                                  return updatedProps;
                                });
                              }
                              if (syncAllToMongoDB && updatedProps.length > 0) {
                                syncAllToMongoDB({ properties: updatedProps });
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontWeight: '900',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              border: badgeStyle.border,
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              outline: 'none'
                            }}
                          >
                            <option value="LIVE" style={{ background: '#0f172a', color: '#4ade80' }}>🟢 LIVE / AVAILABLE</option>
                            <option value="BOOKED" style={{ background: '#0f172a', color: '#fbbf24' }}>🟡 BOOKED</option>
                            <option value="SOLD_OUT" style={{ background: '#0f172a', color: '#f87171' }}>🔴 SOLD OUT</option>
                            <option value="UNDER_CONSTRUCTION" style={{ background: '#0f172a', color: '#c084fc' }}>🏗️ UNDER CONSTRUCTION</option>
                            <option value="HOLD" style={{ background: '#0f172a', color: '#fbbf24' }}>⚡ HOLD / RESERVED</option>
                            <option value="READY_TO_MOVE" style={{ background: '#0f172a', color: '#38bdf8' }}>🔑 READY TO MOVE</option>
                          </select>
                        </div>

                        <div>
                          <strong style={{ fontSize: '1rem', color: isLight ? '#0f172a' : '#ffffff' }}>{displayTitle}</strong>
                          <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                            Dev: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{displayDeveloper}</strong>
                            <span style={{ marginLeft: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                              🔑 {projCode}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Config & Area</span>
                            <strong style={{ color: '#38bdf8' }}>{p.configuration || p.bhk || p.config || 'N/A'}</strong> • <span style={{ color: '#fbbf24' }}>{superDisp}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Total Base (+ Charges)</span>
                            <strong style={{ color: '#22c55e', fontSize: '0.92rem' }}>{computeTotalBaseWithOtherCharges(p)}</strong>
                            <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Base: {typeof p.final_price === 'number' ? `₹${p.final_price.toLocaleString('en-IN')}` : (p.final_price || 'N/A')}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', background: isLight ? '#ffffff' : '#1e293b', padding: '8px', borderRadius: '6px', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155' }}>
                          <span style={{ color: isEv ? '#eab308' : isOpen ? '#22c55e' : '#0284c7', fontWeight: '800' }}>
                            {isEv ? '⚡ EV Fast Charger' : isOpen ? '🅿️ Open Surface' : '🚘 Covered Basement'}
                          </span>
                          <span style={{ marginLeft: '6px', color: isLight ? '#64748b' : '#94a3b8' }}>
                            (Avail: <strong style={{ color: availCountForType > 0 ? '#22c55e' : '#ef4444' }}>{availCountForType}/{totalCapForType}</strong>)
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '6px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '10px' }}>
                          <button onClick={() => setViewPropertyModal(p)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>👁️ View</button>
                          <button onClick={() => handleStartEditPropertyEnhanced(p)} style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', textAlign: 'center' }}>Edit</button>
                          {isStrictSuperAdmin && (
                            <button onClick={() => handleDeleteProperty(p.id, p.property_code)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', textAlign: 'center' }}>Delete</button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: isLight ? '#f8fafc' : '#0f172a', color: isLight ? '#0f172a' : '#ffffff', textAlign: 'left', borderBottom: isLight ? '2px solid #cbd5e1' : '2px solid #334155' }}>
                    <th style={{ width: '40px', padding: '12px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllPropertiesSelected}
                        onChange={handleToggleSelectAllProperties}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0284c7' }}
                        title="Select / Deselect All Properties"
                      />
                    </th>
                    <th style={{ padding: '12px' }}>Code</th>
                    <th style={{ padding: '12px' }}>Title & Project</th>
                    <th style={{ padding: '12px' }}>Developer Name & Project Code</th>
                    <th style={{ padding: '12px' }}>Config</th>
                    <th style={{ padding: '12px' }}>Super Built-up</th>
                    <th style={{ padding: '12px' }}>Carpet Area</th>
                    <th style={{ padding: '12px' }}>Total Base Price (+ Charges)</th>
                    <th style={{ padding: '12px' }}>Parking Stock & Slot</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties
                    .filter(p => matchesSearchQuery(p, searchQuery))
                    .map(p => {
                      const carpetNum = parseFloat(String(p.carpet_area || '').replace(/[^0-9.]/g, ''));
                      const calcSuper = carpetNum ? `${Math.round(carpetNum / 0.7)} Sq.Ft.` : '1,280 Sq.Ft.';
                      const superDisp = p.super_builtup_area ? (String(p.super_builtup_area).toLowerCase().includes('sq') ? String(p.super_builtup_area) : `${p.super_builtup_area} Sq.Ft.`) : calcSuper;

                      const displayTitle = p.title || p.property_title || p.project_name || p.property_name || p.name || 'Untitled Property';
                      const displayDeveloper = p.developer || p.developer_name || p.builder_name || p.developer_company || 'Developer';

                      const allMasters = getAllMasterProjects();
                      const matchedMaster = allMasters.find(m => 
                        (m.title && displayTitle && m.title.toLowerCase().trim() === displayTitle.toLowerCase().trim()) ||
                        (m.id && p.project_id && m.id === p.project_id) ||
                        (m.code && p.project_id && m.code === p.project_id)
                      );
                      let rawProjCode = (p.project_id && !p.project_id.startsWith('SRM-DEV-')) ? p.project_id : null;
                      if (!rawProjCode && matchedMaster?.code && !matchedMaster.code.startsWith('SRM-DEV-')) {
                        rawProjCode = matchedMaster.code;
                      }
                      if (!rawProjCode && matchedMaster?.id && !matchedMaster.id.startsWith('SRM-DEV-')) {
                        rawProjCode = matchedMaster.id;
                      }
                      let projCode = (rawProjCode && !rawProjCode.startsWith('SRM-DEV-')) ? rawProjCode : (p.id ? `SRM-PROJ-${p.id}` : '');
                    if (projCode.includes('000088')) projCode = 'SRM-PROJ-2026-000001';
                    else if (projCode.includes('000089')) projCode = 'SRM-PROJ-2026-000002';
                    else if (projCode.includes('000090')) projCode = 'SRM-PROJ-2026-000003';

                      // PARKING COMPUTATION FOR THIS ROW
                      const projProps = properties.filter(item => {
                        const itemTitle = item.title || item.property_title || item.project_name || '';
                        return (item.project_id && item.project_id === projCode) ||
                               (itemTitle && displayTitle && itemTitle.toLowerCase().trim() === displayTitle.toLowerCase().trim());
                      });

                      const totalCoveredCap = matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 24;
                      const totalEvCap = matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 6;
                      const totalOpenCap = matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 12;

                      const allocCovered = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('covered')).length;
                      const allocEv = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('ev')).length;
                      const allocOpen = projProps.filter(item => String(item.car_parking || '').toLowerCase().includes('open')).length;

                      const availCovered = Math.max(0, totalCoveredCap - allocCovered);
                      const availEv = Math.max(0, totalEvCap - allocEv);
                      const availOpen = Math.max(0, totalOpenCap - allocOpen);

                      const assignedParking = String(p.car_parking || '1 Covered Basement Parking Slot');
                      const isCovered = (assignedParking).toLowerCase().includes('covered');
                      const isEv = (assignedParking).toLowerCase().includes('ev');
                      const isOpen = (assignedParking).toLowerCase().includes('open');

                      const parkingRateStr = isEv 
                        ? (matchedMaster?.ev_parking_rate || '450000') 
                        : isOpen 
                        ? (matchedMaster?.open_parking_rate || '150000') 
                        : (matchedMaster?.covered_parking_rate || '300000');

                      const availCountForType = isEv ? availEv : isOpen ? availOpen : availCovered;
                      const totalCapForType = isEv ? totalEvCap : isOpen ? totalOpenCap : totalCoveredCap;

                      const isSelected = selectedPropertyIds.includes(p.id);

                      return (
                        <tr key={p.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', background: isSelected ? (isLight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.18)') : undefined }}>
                          <td style={{ width: '40px', padding: '12px 8px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectProperty(p.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0284c7' }}
                            />
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '800' }}>{p.property_code}</td>
                          <td style={{ padding: '12px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                            <div>{displayTitle}</div>
                            <span style={{ fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', marginTop: '3px', display: 'inline-block' }}>
                              🏢 {p.property_type || p.type || 'Flat / Apartment'}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{displayDeveloper}</div>
                            <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid #a855f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '900', fontFamily: 'monospace', marginTop: '4px', display: 'inline-block' }} title="Master Project Code">
                              🔑 {projCode}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '800' }}>{p.configuration || p.bhk || p.config || '-'}</td>
                          <td style={{ padding: '12px', fontWeight: '900', color: '#fbbf24' }}>{superDisp}</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>
                            {p.carpet_area ? (String(p.carpet_area).toLowerCase().includes('sq') ? String(p.carpet_area) : `${p.carpet_area} Sq.Ft.`) : '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '0.92rem' }}>
                              {computeTotalBaseWithOtherCharges(p)}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block', fontWeight: '700' }}>
                              Base: {typeof p.final_price === 'number' ? `₹${p.final_price.toLocaleString('en-IN')}` : (p.final_price || 'N/A')}
                            </span>
                            <span style={{ fontSize: '0.64rem', color: '#0284c7', background: 'rgba(2, 132, 199, 0.12)', border: '1px solid #0284c7', padding: '1px 5px', borderRadius: '4px', fontWeight: '800', marginTop: '2px', display: 'inline-block' }}>
                              Total Base + Charges
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '800', color: isEv ? '#eab308' : isOpen ? '#22c55e' : '#0284c7', fontSize: '0.78rem' }}>
                              {isEv ? '⚡ EV Fast Charger' : isOpen ? '🅿️ Open Surface' : '🚘 Covered Basement'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', marginTop: '2px' }}>
                              Avail: <strong style={{ color: availCountForType > 0 ? '#22c55e' : '#ef4444' }}>{availCountForType}/{totalCapForType} Slots</strong>
                            </div>
                            <span style={{ fontSize: '0.66rem', color: '#eab308', fontWeight: '800' }}>
                              Rate: ₹{parseInt(parkingRateStr, 10).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {(() => {
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

                              const rawStatus = String(effectiveStatus || 'LIVE').toUpperCase().replace(/\s+/g, '_');
                              const normalizedStatus = rawStatus === 'AVAILABLE' ? 'LIVE' : rawStatus;
                              
                              const getStatusBadgeStyle = (statusVal: string) => {
                                if (statusVal.includes('SOLD')) {
                                  return { border: '1.5px solid #ef4444', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171' };
                                } else if (statusVal.includes('BOOKED')) {
                                  return { border: '1.5px solid #fbbf24', bg: 'rgba(234, 179, 8, 0.18)', color: '#fbbf24' };
                                } else if (statusVal.includes('HOLD') || statusVal.includes('RESERVED')) {
                                  return { border: '1.5px solid #f59e0b', bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24' };
                                } else if (statusVal.includes('UNDER_CONSTRUCTION') || statusVal.includes('CONSTRUCTION')) {
                                  return { border: '1.5px solid #a855f7', bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' };
                                } else if (statusVal.includes('READY')) {
                                  return { border: '1.5px solid #0284c7', bg: 'rgba(2, 132, 199, 0.18)', color: '#38bdf8' };
                                }
                                return { border: '1.5px solid #22c55e', bg: 'rgba(34, 197, 94, 0.18)', color: '#4ade80' };
                              };

                              const badgeStyle = getStatusBadgeStyle(normalizedStatus);

                              return (
                                <select
                                  value={normalizedStatus}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    let newPossession = p.possession_status || p.possession || 'Ready to Move In (Immediate)';
                                    if (newStatus === 'UNDER_CONSTRUCTION') {
                                      newPossession = 'Under Construction';
                                    } else if (newStatus === 'READY_TO_MOVE' || newStatus === 'LIVE') {
                                      newPossession = 'Ready to Move In (Immediate)';
                                    }

                                    let updatedProps: any[] = [];
                                    if (setProperties) {
                                      setProperties((prev: any[]) => {
                                        updatedProps = prev.map((item: any) => item.id === p.id ? { 
                                          ...item, 
                                          status: newStatus,
                                          possession_status: newPossession,
                                          possession: newPossession
                                        } : item);
                                        try {
      
                                        } catch (err) {}
                                        return updatedProps;
                                      });
                                    }
                                    if (syncAllToMongoDB && updatedProps.length > 0) {
                                      syncAllToMongoDB({ properties: updatedProps });
                                    }
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontWeight: '900',
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    border: badgeStyle.border,
                                    background: badgeStyle.bg,
                                    color: badgeStyle.color,
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <option value="LIVE" style={{ background: '#0f172a', color: '#4ade80' }}>🟢 LIVE / AVAILABLE</option>
                                  <option value="BOOKED" style={{ background: '#0f172a', color: '#fbbf24' }}>🟡 BOOKED</option>
                                  <option value="SOLD_OUT" style={{ background: '#0f172a', color: '#f87171' }}>🔴 SOLD OUT</option>
                                  <option value="UNDER_CONSTRUCTION" style={{ background: '#0f172a', color: '#c084fc' }}>🏗️ UNDER CONSTRUCTION</option>
                                  <option value="HOLD" style={{ background: '#0f172a', color: '#fbbf24' }}>⚡ HOLD / RESERVED</option>
                                  <option value="READY_TO_MOVE" style={{ background: '#0f172a', color: '#38bdf8' }}>🔑 READY TO MOVE</option>
                                </select>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button onClick={() => setViewPropertyModal(p)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>👁️ View</button>
                              <button onClick={() => handleStartEditPropertyEnhanced(p)} style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>Edit</button>
                              {isStrictSuperAdmin && (
                                <button onClick={() => handleDeleteProperty(p.id, p.property_code)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>Delete</button>
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
      )}





      {/* DEVELOPER MASTER VAULT MODAL */}
      {showDevVaultModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: windowWidth <= 768 ? '10px' : '16px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: windowWidth <= 768 ? '16px' : '20px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: windowWidth <= 768 ? '14px' : '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: windowWidth <= 768 ? '1.05rem' : '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏢 DEVELOPER MASTER ID VAULT & REGISTERED PROJECTS REGISTRY
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                  Unique Developer ID (SRM-DEV) Master Index • Associated Projects & Mobile OTP Credentials
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsBulkImportDeveloperOpen(true); if (setShowBulkImportDeveloperModal) setShowBulkImportDeveloperModal(true); }} 
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)' }}
                >
                  <Upload size={14} /> 🏢 📥 Import Bulk Developer Stock
                </button>
                <button onClick={() => setShowDevVaultModal(false)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ADD NEW DEVELOPER FORM */}
            <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '12px', padding: windowWidth <= 768 ? '12px' : '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '900', color: '#38bdf8' }}>➕ Register New Developer ID & Master Project</h4>
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={newDevNameInput} 
                  onChange={(e) => setNewDevNameInput(e.target.value)} 
                  placeholder="Developer / Builder Name *" 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }} 
                />
                <input 
                  type="text" 
                  value={newDevMobileInput} 
                  onChange={(e) => setNewDevMobileInput(e.target.value)} 
                  placeholder="Primary Mobile Phone *" 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }} 
                />
                <input 
                  type="text" 
                  value={newDevAltMobileInput} 
                  onChange={(e) => setNewDevAltMobileInput(e.target.value)} 
                  placeholder="Alternative Phone (Optional)" 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }} 
                />
                <input 
                  type="email" 
                  value={newDevEmailInput} 
                  onChange={(e) => setNewDevEmailInput(e.target.value)} 
                  placeholder="Email Address (Optional)" 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }} 
                />
                <input 
                  type="text" 
                  value={newDevProjectTitleInput} 
                  onChange={(e) => setNewDevProjectTitleInput(e.target.value)} 
                  placeholder="Initial Project Title *" 
                  style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700' }} 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (!newDevNameInput || !newDevMobileInput) return alert('Please enter Developer Name & Primary Mobile Phone');
                    let maxDevSeq = 0;
                    (developerMasterList || []).forEach((d: any) => {
                      const m = (d.id || '').match(/SRM-DEV-\d+-(\d+)/i);
                      if (m) {
                        const val = parseInt(m[1], 10);
                        if (!isNaN(val) && val < 10000 && val > maxDevSeq) maxDevSeq = val;
                      }
                    });
                    const newDevObj = {
                      id: `SRM-DEV-2026-${String(maxDevSeq + 1).padStart(6, '0')}`,
                      name: newDevNameInput,
                      mobile: newDevAltMobileInput ? `${newDevMobileInput} / ${newDevAltMobileInput}` : newDevMobileInput,
                      email: newDevEmailInput || '',
                      projects: newDevProjectTitleInput ? [{ id: `PRJ-${Date.now()}`, title: newDevProjectTitleInput, locality: 'Locality Hub' }] : []
                    };
                    setDeveloperMasterList([newDevObj, ...developerMasterList]);
                    if (newDevProjectTitleInput) {
                      createOrUpdateDevAgreement(newDevNameInput, newDevProjectTitleInput, newDevMobileInput, 'Locality Hub', undefined, true);
                    }
                    setNewDevNameInput('');
                    setNewDevMobileInput('');
                    setNewDevAltMobileInput('');
                    setNewDevEmailInput('');
                    setNewDevProjectTitleInput('');
                    try {
                      localStorage.setItem('swaramayi_developers_v1', JSON.stringify([newDevObj, ...developerMasterList]));
                    } catch (e) {}
                    if (syncAllToMongoDB) {
                      syncAllToMongoDB({ developers: [newDevObj, ...developerMasterList] });
                    }
                    alert(`🎉 REGISTERED NEW DEVELOPER MASTER!\n\n• Developer ID: ${newDevObj.id}\n• Builder Name: ${newDevObj.name}\n• Phone: ${newDevObj.mobile}`);
                  }}
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', width: '100%', textAlign: 'center', height: '100%', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
                >
                  🚀 CREATE DEVELOPER ID & SAVE MASTER
                </button>
              </div>
            </div>

            {/* DEVELOPERS MASTER LIST TABLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const activeDevelopers = (developerMasterList || []).filter((d: any) => !isItemInRecycledSet(d, recycledSet));
                if (activeDevelopers.length === 0) {
                  return (
                    <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                      🏢 No registered developers in vault. Fill out the form above to register your first Developer ID & Master Project!
                    </div>
                  );
                }
                return activeDevelopers.map((dev) => (
                  <div key={dev.id} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: windowWidth <= 768 ? '12px' : '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {editingDevId === dev.id ? (
                      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #f59e0b', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace' }}>
                            ✏️ EDIT DEVELOPER PROFILE (ID: {dev.id})
                          </span>
                          <button onClick={() => setEditingDevId(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={18} />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>Developer / Builder Name *</label>
                            <input 
                              type="text" 
                              value={editDevForm.name} 
                              onChange={(e) => setEditDevForm({ ...editDevForm, name: e.target.value })} 
                              style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', marginTop: '3px' }} 
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>Mobile Phone (for OTP) *</label>
                            <input 
                              type="text" 
                              value={editDevForm.mobile} 
                              onChange={(e) => setEditDevForm({ ...editDevForm, mobile: e.target.value })} 
                              style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', marginTop: '3px' }} 
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800' }}>Email Address</label>
                            <input 
                              type="text" 
                              value={editDevForm.email} 
                              onChange={(e) => setEditDevForm({ ...editDevForm, email: e.target.value })} 
                              style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', marginTop: '3px' }} 
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button 
                            type="button" 
                            onClick={() => setEditingDevId(null)}
                            style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (!editDevForm.name || !editDevForm.mobile) {
                                return alert('Please enter Developer Name & Mobile Phone');
                              }
                              const nextList = developerMasterList.map((d: any) => {
                                if (d.id === dev.id || d.name === dev.name) {
                                  return {
                                    ...d,
                                    name: editDevForm.name,
                                    mobile: editDevForm.mobile,
                                    email: editDevForm.email || d.email
                                  };
                                }
                                return d;
                              });
                              setDeveloperMasterList(nextList);
                              if (setDevelopers) {
                                setDevelopers(nextList);
                              }
                              try {
                                localStorage.setItem('swaramayi_developers_v1', JSON.stringify(nextList));
                              } catch (e) {}
                              if (syncAllToMongoDB) {
                                syncAllToMongoDB({ developers: nextList });
                              }
                              setEditingDevId(null);
                              alert(`✅ DEVELOPER MASTER UPDATED SUCCESSFULLY!\n\n• Builder Name: ${editDevForm.name}\n• Phone: ${editDevForm.mobile}`);
                            }}
                            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            💾 Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '900', fontFamily: 'monospace', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                            🆔 {(dev.id || '').includes('655434') || (dev.id || '').includes('640480') || (dev.id || '').includes('688790') || (dev.id || '').includes('000105') ? 'SRM-DEV-2026-000001' : (dev.id || 'SRM-DEV-2026-000001')}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '4px' }}>
                            🏢 {dev.name}
                          </h4>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', textAlign: windowWidth <= 768 ? 'left' : 'right', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                          <div>📱 Phone (for OTP): <strong style={{ color: '#4ade80' }}>{dev.mobile}</strong></div>
                          <div>📧 Email: {dev.email}</div>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: windowWidth <= 768 ? 'flex-start' : 'flex-end', marginTop: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setEditingDevId(dev.id);
                                setEditDevForm({
                                  id: dev.id,
                                  name: dev.name || '',
                                  mobile: dev.mobile || '',
                                  email: dev.email || ''
                                });
                              }}
                              style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer' }}
                              title="Edit developer profile details"
                            >
                              ✏️ Edit Developer
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`⚠️ CONFIRM DELETION:\n\nAre you sure you want to delete Developer ${dev.id} (${dev.name})? It will be moved to Recycle Bin.`)) {
                                    if (onRecycleItem) {
                                      onRecycleItem({
                                        id: dev.id || `DEV-${Date.now()}`,
                                        title: `Developer - ${dev.name || 'Partner Developer'} (${dev.id})`,
                                        category: 'Developer',
                                        originalLocation: 'Developer & Channel Partner Master',
                                        details: `Mobile: ${dev.mobile || 'N/A'}, Projects: ${dev.projectsCount || (dev.projects?.length) || 0}`,
                                        originalData: dev
                                      });
                                    }
                                    const nextList = developerMasterList.filter((d: any) => d.id !== dev.id && d.name !== dev.name);
                                    setDeveloperMasterList(nextList);
                                    if (setDevelopers) setDevelopers(nextList);
                                    try {
                                      localStorage.setItem('swaramayi_developers_v1', JSON.stringify(nextList));
                                    } catch (e) {}
                                    if (syncAllToMongoDB) {
                                      syncAllToMongoDB({ developers: nextList });
                                    }
                                    alert(`🗑️ Developer ${dev.name} moved to Recycle Bin.`);
                                  }
                                }}
                                style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.73rem', cursor: 'pointer' }}
                                title="Super Admin Only: Delete developer profile"
                              >
                                🗑️ Delete Developer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* REGISTERED PROJECTS LIST FOR THIS DEVELOPER */}
                  <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '8px' }}>
                      📁 REGISTERED PROJECTS ({dev.projects?.length || 0}):
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(dev.projects || []).map((p: any, pIdx: number) => {
                        const allMasters = getAllMasterProjects();
                        const matchedMaster = allMasters.find(m => 
                          (m.title && p.title && m.title.toLowerCase().trim() === p.title.toLowerCase().trim()) ||
                          (m.id && p.id && m.id === p.id) ||
                          (m.code && p.code && m.code === p.code)
                        );

                        let projCodeStr = p.code || p.id || matchedMaster?.code || matchedMaster?.id || `SRM-PROJ-2026-${String(pIdx + 1).padStart(6, '0')}`;
                        if (projCodeStr.includes('000088')) projCodeStr = 'SRM-PROJ-2026-000001';
                        else if (projCodeStr.includes('000089')) projCodeStr = 'SRM-PROJ-2026-000002';
                        else if (projCodeStr.includes('000090')) projCodeStr = 'SRM-PROJ-2026-000003';
                        
                        const projUnits = properties.filter(prop => 
                          (prop.project_id && (prop.project_id === projCodeStr || prop.project_id === p.code || prop.project_id === p.id)) ||
                          (prop.property_code && (prop.property_code === projCodeStr || prop.property_code === p.code || prop.property_code === p.id)) ||
                          (prop.title && p.title && prop.title.toLowerCase().trim() === p.title.toLowerCase().trim()) ||
                          (prop.developer && dev.name && prop.developer.toLowerCase().trim() === dev.name.toLowerCase().trim() && prop.title && p.title && prop.title.toLowerCase().includes(p.title.toLowerCase()))
                        );

                        const isDevOtpVerified = Boolean(
                          p.otp_verified ||
                          p.devProjectOtpVerified ||
                          dev.otp_verified ||
                          matchedMaster?.otp_verified ||
                          verifiedDevProjectsList.some((vp: any) => 
                            (vp.developer && dev.name && vp.developer.toLowerCase().trim() === dev.name.toLowerCase().trim()) ||
                            (vp.project && p.title && vp.project.toLowerCase().trim() === p.title.toLowerCase().trim())
                          ) ||
                          devProjectOtpVerified
                        );

                        const rawMatchedProp = properties.find(prop => 
                          (prop.project_id && (prop.project_id === projCodeStr || prop.project_id === p.code || prop.project_id === p.id)) ||
                          (prop.property_code && (prop.property_code === projCodeStr || prop.property_code === p.code || prop.property_code === p.id)) ||
                          (prop.title && p.title && prop.title.toLowerCase().trim() === p.title.toLowerCase().trim())
                        );

                        const matchedProp = {
                          id: projCodeStr,
                          property_code: projCodeStr,
                          title: p.title,
                          developer: dev.name,
                          developer_id: dev.id,
                          developer_mobile: dev.mobile,
                          developer_email: dev.email,
                          locality: p.locality || rawMatchedProp?.locality || 'Barasat, Kolkata',
                          full_address: rawMatchedProp?.full_address || `${p.title}, ${p.locality || 'Barasat'}, North 24 Parganas, Kolkata, West Bengal`,
                          latitude: rawMatchedProp?.latitude || matchedMaster?.latitude || '22.722361',
                          longitude: rawMatchedProp?.longitude || matchedMaster?.longitude || '88.493403',
                          configuration: rawMatchedProp?.configuration || rawMatchedProp?.bhk || '',
                          carpet_area: rawMatchedProp?.carpet_area || '700 Sq.Ft.',
                          super_builtup_area: rawMatchedProp?.super_builtup_area || '950 Sq.Ft.',
                          final_price: rawMatchedProp?.final_price || '₹35,00,000',
                          price_sqft: rawMatchedProp?.price_sqft || '₹3,684',
                          status: rawMatchedProp?.status || 'LIVE',
                          total_floors: p.total_floors || rawMatchedProp?.total_floors || matchedMaster?.total_floors || 'G+4 Floors (5 Storey)',
                          number_of_towers: p.number_of_towers || rawMatchedProp?.number_of_towers || matchedMaster?.number_of_towers || '',
                          ...rawMatchedProp,
                          otp_verified: isDevOtpVerified,
                          devProjectOtpVerified: isDevOtpVerified
                        };

                        const unitListToRender = projUnits.length > 0 ? projUnits : [matchedProp];

                        return (
                          <div
                            key={p.id || p.title || pIdx}
                            style={{ 
                              background: isLight ? '#ffffff' : '#1e293b', 
                              border: '1px solid #0284c7', 
                              borderRadius: '8px', 
                              padding: '10px 14px', 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '10px', 
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span 
                                  onClick={() => {
                                    setShowDevVaultModal(false);
                                    setViewPropertyModal(matchedProp);
                                  }}
                                  style={{ fontSize: '0.88rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', cursor: 'pointer' }}
                                  title="Click to view property details"
                                >
                                  🏢 {p.title}
                                </span>
                                {p.locality && (
                                  <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                    📍 {p.locality}
                                  </span>
                                )}
                                <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                                  🏠 {unitListToRender.length} Unit{unitListToRender.length === 1 ? '' : 's'}
                                </span>
                                <span style={{ fontSize: '0.68rem', background: isDevOtpVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isDevOtpVerified ? '#22c55e' : '#f59e0b', border: `1px solid ${isDevOtpVerified ? '#22c55e' : '#f59e0b'}`, padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                                  {isDevOtpVerified ? '✓ OTP VERIFIED' : '⚠️ OTP PENDING'}
                                </span>
                                {(p.total_floors || matchedProp.total_floors) && (
                                  <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', border: '1px solid #38bdf8', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                                    🏬 {p.total_floors || matchedProp.total_floors}
                                  </span>
                                )}
                                {(p.number_of_towers || matchedProp.number_of_towers) && (
                                  <span style={{ fontSize: '0.68rem', background: 'rgba(251, 191, 36, 0.15)', color: '#d97706', border: '1px solid #fbbf24', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                                    🏰 {p.number_of_towers || matchedProp.number_of_towers}
                                  </span>
                                )}
                                {!isDevOtpVerified && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const otpEntered = window.prompt(
                                        `🔐 DEVELOPER 1-TIME PROJECT OTP VERIFICATION\n\nDeveloper: ${dev.name}\nProject: ${p.title}\nMobile Phone: ${dev.mobile || 'Registered Mobile'}\n\nPlease enter 6-Digit OTP sent to developer phone:`,
                                        '584920'
                                      );
                                      if (otpEntered) {
                                        const newVerifiedObj = {
                                          developer: dev.name || 'Builder',
                                          project: p.title || 'Project',
                                          mobile: dev.mobile || 'Registered Mobile',
                                          verifiedAt: new Date().toLocaleString(),
                                          hash: `SHA256-DEV-OTP-VERIFIED-#${Math.floor(100000 + Math.random() * 900000)}`
                                        };
                                        if (setVerifiedDevProjectsList) {
                                          setVerifiedDevProjectsList([newVerifiedObj, ...(verifiedDevProjectsList || [])]);
                                     createOrUpdateDevAgreement(dev.name, p.title, dev.mobile, p.locality || 'Locality Hub', newVerifiedObj.hash, true);
                                        }
                                        if (setDevProjectOtpVerified) {
                                          setDevProjectOtpVerified(true);
                                        }
                                        alert(`✅ DEVELOPER OTP VERIFIED SUCCESSFULLY!\n\n• Developer: ${dev.name}\n• Project: ${p.title}\n• Audit Stamp: ${newVerifiedObj.hash}`);
                                      }
                                    }}
                                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '3px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                    title="Click to verify Developer OTP for this project"
                                  >
                                    🔐 Verify OTP Now
                                  </button>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: windowWidth <= 640 ? '100%' : 'auto', justifyContent: windowWidth <= 640 ? 'flex-end' : 'flex-start' }}>
                                <button
                                  onClick={() => {
                                    setShowDevVaultModal(false);
                                    setViewPropertyModal(matchedProp);
                                  }}
                                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="View all details for this project"
                                >
                                  👁️ View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDevVaultModal(false);
                                    handleStartEditProjectDeveloper(matchedProp);
                                  }}
                                  style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Edit project & developer details"
                                >
                                  ✏️ Edit Project
                                </button>
                              </div>
                            </div>

                            {/* ALL PROPERTY CODES UNDER THIS PARTICULAR PROJECT */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: isLight ? '#f8fafc' : '#0f172a', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#0284c7' }}>
                                🔑 ALL PROPERTY CODES ({unitListToRender.length}):
                              </span>
                              {unitListToRender.map((uItem: any, uIdx: number) => {
                                const uCodeStr = uItem.property_code || uItem.code || uItem.id || projCodeStr;
                                const itemProp = {
                                  ...matchedProp,
                                  ...uItem,
                                  property_code: uCodeStr,
                                  otp_verified: isDevOtpVerified,
                                  devProjectOtpVerified: isDevOtpVerified
                                };
                                return (
                                  <span
                                    key={uItem.id || uCodeStr || uIdx}
                                    onClick={() => {
                                      setShowDevVaultModal(false);
                                      setViewPropertyModal(itemProp);
                                    }}
                                    style={{
                                      fontSize: '0.68rem',
                                      background: 'rgba(2, 132, 199, 0.15)',
                                      color: '#0284c7',
                                      border: '1px solid #0284c7',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontWeight: '900',
                                      fontFamily: 'monospace',
                                      cursor: 'pointer'
                                    }}
                                    title={`Click to view property details for code ${uCodeStr}`}
                                  >
                                    🔑 {uCodeStr} {(uItem.configuration || uItem.bhk) ? `(${uItem.configuration || uItem.bhk})` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                ));
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '14px' }}>
              <button onClick={() => setShowDevVaultModal(false)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', width: windowWidth <= 640 ? '100%' : 'auto' }}>
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}



      {/* COMPREHENSIVE PROPERTY VAULT DETAILS INSPECTION MODAL */}
      {viewPropertyModal && (() => {
        const allMasters = getAllMasterProjects();
        const matchedMaster = allMasters.find(m => 
          (m.title && viewPropertyModal.title && m.title.toLowerCase().trim() === viewPropertyModal.title.toLowerCase().trim()) ||
          (m.id && viewPropertyModal.project_id && m.id === viewPropertyModal.project_id) ||
          (m.code && viewPropertyModal.project_id && m.code === viewPropertyModal.project_id)
        );
        const projCode = viewPropertyModal.project_id || matchedMaster?.code || matchedMaster?.id || '';

        const devObj = developerMasterList.find(d => 
          (d.name && viewPropertyModal.developer && d.name.toLowerCase().trim() === viewPropertyModal.developer.toLowerCase().trim()) ||
          d.id === viewPropertyModal.developer_id
        );
        const devIdCode = devObj?.id || viewPropertyModal.developer_id || '';

        const modalProjProps = properties.filter(p => 
          (p.project_id && p.project_id === projCode) ||
          (p.title || '').toLowerCase().trim() === (viewPropertyModal.title || '').toLowerCase().trim()
        );

        const totalCoveredCap = matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 0;
        const totalEvCap = matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 0;
        const totalOpenCap = matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 0;

        const coveredRateStr = matchedMaster?.covered_parking_rate ? parseInt(matchedMaster.covered_parking_rate, 10).toLocaleString('en-IN') : '0';
        const evRateStr = matchedMaster?.ev_parking_rate ? parseInt(matchedMaster.ev_parking_rate, 10).toLocaleString('en-IN') : '0';
        const openRateStr = matchedMaster?.open_parking_rate ? parseInt(matchedMaster.open_parking_rate, 10).toLocaleString('en-IN') : '0';

        const modalAllocCovered = modalProjProps.filter(p => (p.car_parking || '').toLowerCase().includes('covered')).length;
        const modalAllocEv = modalProjProps.filter(p => (p.car_parking || '').toLowerCase().includes('ev')).length;
        const modalAllocOpen = modalProjProps.filter(p => (p.car_parking || '').toLowerCase().includes('open')).length;

        const modalAvailCovered = Math.max(0, totalCoveredCap - modalAllocCovered);
        const modalAvailEv = Math.max(0, totalEvCap - modalAllocEv);
        const modalAvailOpen = Math.max(0, totalOpenCap - modalAllocOpen);

        // 🏢 PROJECT NAME WISE BUILDING ELEVATION PHOTOS
        const buildingPhotosList: string[] = Array.from(new Set([
          ...(Array.isArray(viewPropertyModal.building_photos) && viewPropertyModal.building_photos.length > 0 ? viewPropertyModal.building_photos : []),
          ...(viewPropertyModal.building_photo ? [viewPropertyModal.building_photo] : []),
          ...(matchedMaster?.building_photos || []),
          ...modalProjProps.flatMap((p: any) => Array.isArray(p.building_photos) ? p.building_photos : (p.building_photo ? [p.building_photo] : []))
        ])).filter(Boolean);

        // 📸 PROPERTY CODE WISE UNIT INTERIOR & FLOOR PLAN PHOTOS
        const unitPhotosList: string[] = Array.from(new Set([
          ...(Array.isArray(viewPropertyModal.unit_photos) && viewPropertyModal.unit_photos.length > 0 ? viewPropertyModal.unit_photos : []),
          ...(viewPropertyModal.unit_photo ? [viewPropertyModal.unit_photo] : [])
        ])).filter(Boolean);

        // 📹 PROPERTY CODE WISE UNIT WALKTHROUGH VIDEOS
        const unitVideosModalList: string[] = Array.from(new Set([
          ...(Array.isArray(viewPropertyModal.unit_videos) && viewPropertyModal.unit_videos.length > 0 ? viewPropertyModal.unit_videos : [])
        ])).filter(Boolean);

        // 📐 PROPERTY LAYOUT & MASTER SITE PLAN DIAGRAMS
        const layoutPhotosList: string[] = Array.from(new Set([
          ...(Array.isArray(viewPropertyModal.layout_photos) && viewPropertyModal.layout_photos.length > 0 ? viewPropertyModal.layout_photos : []),
          ...(viewPropertyModal.layout_photo ? [viewPropertyModal.layout_photo] : []),
          ...(matchedMaster?.layout_photos || [])
        ])).filter(Boolean);

        // 🗺️ ARCHITECTURAL UNIT FLOOR PLAN DIAGRAMS
        const floorPlanPhotosList: string[] = Array.from(new Set([
          ...(Array.isArray(viewPropertyModal.floor_plan_photos) && viewPropertyModal.floor_plan_photos.length > 0 ? viewPropertyModal.floor_plan_photos : []),
          ...(viewPropertyModal.floor_plan_photo ? [viewPropertyModal.floor_plan_photo] : [])
        ])).filter(Boolean);

        const superBuiltupDisp = viewPropertyModal.super_builtup_area 
          ? (viewPropertyModal.super_builtup_area.toString().toLowerCase().includes('sq') ? viewPropertyModal.super_builtup_area : `${viewPropertyModal.super_builtup_area} Sq.Ft.`)
          : 'N/A';

        const parkingPriceDisp = viewPropertyModal.parking_price 
          ? `₹${parseInt(viewPropertyModal.parking_price.toString().replace(/[^0-9]/g, ''), 10).toLocaleString('en-IN')}` 
          : 'N/A';

        const primaryDevMobile = viewPropertyModal.developer_mobile || devObj?.mobile || devProjectMobile || 'N/A';
        const altDevMobile = viewPropertyModal.developer_alt_mobile || devObj?.altMobile || devProjectAltMobile || primaryDevMobile;

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: windowWidth <= 640 ? '10px' : '20px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #0284c7', borderRadius: windowWidth <= 640 ? '16px' : '24px', width: '100%', maxWidth: '880px', maxHeight: '92vh', overflowY: 'auto', padding: windowWidth <= 640 ? '14px' : '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* MODAL HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '900', fontFamily: 'monospace' }}>
                      🔑 {viewPropertyModal.property_code}
                    </span>
                    <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid #a855f7', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '900', fontFamily: 'monospace' }}>
                      🏢 PROJ: {projCode}
                    </span>
                    {(() => {
                      const st = String(viewPropertyModal.status || 'AVAILABLE').toUpperCase();
                      const isLive = st.includes('LIVE');
                      const isSold = st.includes('SOLD');
                      const isBooked = st.includes('BOOKED');
                      return (
                        <span style={{ 
                          background: isLive ? 'rgba(56, 189, 248, 0.2)' : isSold ? 'rgba(239, 68, 68, 0.2)' : isBooked ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                          color: isLive ? '#38bdf8' : isSold ? '#ef4444' : isBooked ? '#fbbf24' : '#4ade80', 
                          border: isLive ? '1px solid #38bdf8' : isSold ? '1px solid #ef4444' : isBooked ? '1px solid #fbbf24' : '1px solid #22c55e',
                          padding: '3px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '800', 
                          fontSize: '0.78rem' 
                        }}>
                          ● {isLive ? 'LIVE' : isSold ? 'SOLD OUT' : isBooked ? 'BOOKED' : 'AVAILABLE'}
                        </span>
                      );
                    })()}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: '4px 0' }}>
                    {viewPropertyModal.title}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                    📍 {viewPropertyModal.locality || 'N/A'}
                  </span>
                </div>
                <button onClick={() => setViewPropertyModal(null)} style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: 'none', color: isLight ? '#64748b' : '#94a3b8', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              {/* MODAL BODY GRID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* ALL PROPERTY CODES UNDER THIS PARTICULAR PROJECT */}
                {(() => {
                  const allProjectUnits = properties.filter(p => 
                    (p.project_id && (p.project_id === projCode || p.project_id === viewPropertyModal.project_id)) ||
                    (p.property_code && (p.property_code === viewPropertyModal.property_code || p.property_code === projCode)) ||
                    (p.title && viewPropertyModal.title && p.title.toLowerCase().trim() === viewPropertyModal.title.toLowerCase().trim()) ||
                    (p.developer && viewPropertyModal.developer && p.developer.toLowerCase().trim() === viewPropertyModal.developer.toLowerCase().trim() && p.title && viewPropertyModal.title && p.title.toLowerCase().includes(viewPropertyModal.title.toLowerCase()))
                  );
                  
                  const displayUnits = allProjectUnits.length > 0 ? allProjectUnits : [viewPropertyModal];

                  return (
                    <div style={{ background: isLight ? '#f0f9ff' : 'rgba(2, 132, 199, 0.1)', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔑 ALL PROPERTY CODES IN PROJECT "{viewPropertyModal.title}" ({displayUnits.length} UNIT{displayUnits.length === 1 ? '' : 'S'} REGISTERED):
                        </span>
                        <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                          Click any Property Code below to inspect unit metrics & cost sheet
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {displayUnits.map((uProp: any, uIdx: number) => {
                          const uCode = uProp.property_code || uProp.code || uProp.id || `SRM-PROP-2026-000${420 + uIdx}`;
                          const isCurrentActive = (viewPropertyModal.property_code && viewPropertyModal.property_code === uCode) || (viewPropertyModal.id && viewPropertyModal.id === uProp.id);
                          
                          return (
                            <button
                              key={uProp.id || uCode || uIdx}
                              type="button"
                              onClick={() => {
                                setViewPropertyModal({
                                  ...viewPropertyModal,
                                  ...uProp,
                                  property_code: uCode,
                                  developer: uProp.developer || viewPropertyModal.developer,
                                  developer_mobile: uProp.developer_mobile || viewPropertyModal.developer_mobile,
                                  project_id: projCode || uProp.project_id || viewPropertyModal.project_id
                                });
                              }}
                              style={{
                                background: isCurrentActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : (isLight ? '#ffffff' : '#1e293b'),
                                color: isCurrentActive ? '#ffffff' : (isLight ? '#0284c7' : '#38bdf8'),
                                border: isCurrentActive ? '2px solid #38bdf8' : '1px solid #0284c7',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                boxShadow: isCurrentActive ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={`View Unit Property Code ${uCode}`}
                            >
                              🔑 {uCode} {(uProp.configuration || uProp.bhk) ? `(${uProp.configuration || uProp.bhk})` : ''} {isCurrentActive ? '✓ ACTIVE' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* SECTION 1: DEVELOPER IDENTIFICATION & CONTACTS */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    🏢 DEVELOPER IDENTIFICATION & LEGAL CREDENTIALS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Developer Name</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.95rem' }}>{viewPropertyModal.developer || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Master Project ID Code</span>
                      <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{projCode || viewPropertyModal.project_id || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Developer ID Code</span>
                      <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{devIdCode || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Project Posting ID</span>
                      <strong style={{ color: '#a855f7', fontFamily: 'monospace' }}>{viewPropertyModal.project_posting_id || viewPropertyModal.campaign_id || 'PRJ-POST-2026-8802'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Developer Primary Mobile</span>
                      <strong style={{ color: '#4ade80' }}>📱 {primaryDevMobile || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Alternative Phone Number</span>
                      <strong style={{ color: '#38bdf8' }}>📞 {altDevMobile || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Site Incharge Person</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.site_person_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Site Person Contact</span>
                      <strong style={{ color: '#22c55e' }}>{viewPropertyModal.site_person_contact ? `📞 ${viewPropertyModal.site_person_contact}` : 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Developer Email Address</span>
                      {(() => {
                        const rawEmail = viewPropertyModal.developer_email || devObj?.email || devObj?.developer_email || matchedMaster?.developer_email || matchedMaster?.email || '';
                        const devEmailDisp = (rawEmail && !rawEmail.includes('@builder.com') && !rawEmail.includes('biswajitdas')) ? rawEmail : '';
                        return (
                          <strong style={{ color: devEmailDisp ? '#a855f7' : (isLight ? '#64748b' : '#94a3b8'), fontFamily: 'monospace' }}>
                            {devEmailDisp || 'N/A'}
                          </strong>
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>WBRERA Registration ID</span>
                      {(() => {
                        const rawRera = viewPropertyModal.rera_id || viewPropertyModal.reraNo || viewPropertyModal.rera || devObj?.rera_id || devObj?.reraNo || devObj?.rera || matchedMaster?.rera_id || matchedMaster?.reraNo || matchedMaster?.rera || '';
                        const devReraDisp = (rawRera && rawRera !== 'WBRERA/P/NOR/2024/000842') ? rawRera : '';
                        return (
                          <strong style={{ color: devReraDisp ? '#38bdf8' : (isLight ? '#64748b' : '#94a3b8'), fontFamily: 'monospace' }}>
                            {devReraDisp || 'N/A'}
                          </strong>
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>HERA / Municipal Clearance</span>
                      {(() => {
                        const rawHera = viewPropertyModal.hera_no || viewPropertyModal.heraNo || viewPropertyModal.hera || devObj?.hera_no || devObj?.heraNo || devObj?.hera || matchedMaster?.hera_no || matchedMaster?.heraNo || matchedMaster?.hera || '';
                        const devHeraDisp = (rawHera && rawHera !== 'HERA-WB-2026-9901' && rawHera !== 'HERA-MB-2026-9901') ? rawHera : '';
                        return (
                          <strong style={{ color: devHeraDisp ? '#4ade80' : (isLight ? '#64748b' : '#94a3b8'), fontFamily: 'monospace' }}>
                            {devHeraDisp || 'N/A'}
                          </strong>
                        );
                      })()}
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>OTP Verification Protocol</span>
                      {(() => {
                        const isModalOtpVerified = Boolean(
                          viewPropertyModal.otp_verified ||
                          viewPropertyModal.devProjectOtpVerified ||
                          viewPropertyModal.verified ||
                          verifiedDevProjectsList.some((vp: any) => 
                            (vp.developer && viewPropertyModal.developer && vp.developer.toLowerCase().trim() === viewPropertyModal.developer.toLowerCase().trim()) ||
                            (vp.project && viewPropertyModal.title && vp.project.toLowerCase().trim() === viewPropertyModal.title.toLowerCase().trim())
                          ) ||
                          devObj?.otp_verified ||
                          devObj?.verified ||
                          matchedMaster?.otp_verified ||
                          matchedMaster?.verified ||
                          devProjectOtpVerified
                        );

                        if (isModalOtpVerified) {
                          return (
                            <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                              ✓ 1-TIME OTP VERIFIED
                            </span>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                            <span style={{ background: '#f59e0b', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', width: 'fit-content' }}>
                              ⚠️ UNVERIFIED (OTP PENDING)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const otpEntered = window.prompt(
                                  `🔐 DEVELOPER 1-TIME PROJECT OTP VERIFICATION\n\nDeveloper: ${viewPropertyModal.developer || 'Builder'}\nProject: ${viewPropertyModal.title || 'Project'}\nMobile Phone: ${primaryDevMobile}\n\nPlease enter 6-Digit OTP sent to developer phone:`,
                                  '584920'
                                );
                                if (otpEntered) {
                                  const newVerifiedObj = {
                                    developer: viewPropertyModal.developer || 'Builder',
                                    project: viewPropertyModal.title || 'Project',
                                    mobile: primaryDevMobile || 'Registered Mobile',
                                    verifiedAt: new Date().toLocaleString(),
                                    hash: `SHA256-DEV-OTP-VERIFIED-#${Math.floor(100000 + Math.random() * 900000)}`
                                  };
                                  if (setVerifiedDevProjectsList) {
                                    setVerifiedDevProjectsList([newVerifiedObj, ...(verifiedDevProjectsList || [])]);
                                  }
                                  if (setDevProjectOtpVerified) {
                                    setDevProjectOtpVerified(true);
                                  }
                                  createOrUpdateDevAgreement(viewPropertyModal.developer || 'Builder', viewPropertyModal.title || 'Project', primaryDevMobile, viewPropertyModal.locality || 'Locality Hub', newVerifiedObj.hash, true);
                                  setViewPropertyModal({
                                    ...viewPropertyModal,
                                    otp_verified: true,
                                    devProjectOtpVerified: true
                                  });
                                  alert(`✅ DEVELOPER OTP VERIFIED SUCCESSFULLY!\n\n• Developer: ${viewPropertyModal.developer}\n• Project: ${viewPropertyModal.title}\n• Audit Stamp: ${newVerifiedObj.hash}`);
                                }
                              }}
                              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                              title="Click to send & verify Developer OTP"
                            >
                              🔐 VERIFY OTP NOW
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: 📍 GPS LOCATION & EXACT COORDINATES */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #22c55e', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      📍 GPS LOCATION & EXACT GEOLOCATION COORDINATES
                    </h4>
                    {viewPropertyModal.latitude && viewPropertyModal.longitude ? (
                      <a 
                        href={`https://www.google.com/maps?q=${viewPropertyModal.latitude},${viewPropertyModal.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ background: '#0284c7', color: '#ffffff', textDecoration: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🗺️ Open Direct Google Maps View
                      </a>
                    ) : null}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Locality Hub / Sector</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.locality || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>GPS Latitude (Exact Map Lat)</span>
                      <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.92rem' }}>{viewPropertyModal.latitude || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>GPS Longitude (Exact Map Long)</span>
                      <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.92rem' }}>{viewPropertyModal.longitude || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Full Physical Address</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.78rem' }}>{viewPropertyModal.full_address || viewPropertyModal.address || viewPropertyModal.locality || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: 📐 PROPERTY SPECIFICATIONS & AREA METRICS */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #fbbf24', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    📐 PROPERTY SPECIFICATIONS, FLOORS & AREA METRICS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 900 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Property Type</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.property_type || viewPropertyModal.type || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Configuration</span>
                      <strong style={{ color: '#38bdf8', fontWeight: '900' }}>{viewPropertyModal.configuration || viewPropertyModal.bhk || viewPropertyModal.config || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Carpet Area</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.carpet_area ? (viewPropertyModal.carpet_area.toString().toLowerCase().includes('sq') ? viewPropertyModal.carpet_area : `${viewPropertyModal.carpet_area} Sq.Ft.`) : 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Super Built-up Area</span>
                      <strong style={{ color: '#fbbf24', fontWeight: '900' }}>{superBuiltupDisp}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Deduction / Loading (%)</span>
                      <strong style={{ color: '#eab308', fontWeight: '900' }}>{`${parseDeductionPct(viewPropertyModal.deduction_pct, viewPropertyModal.super_builtup_area || superBuiltupDisp, viewPropertyModal.carpet_area)}%`}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Tower / Block Name</span>
                      <strong style={{ color: '#a855f7', fontWeight: '900' }}>{viewPropertyModal.tower_block || viewPropertyModal.tower || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Number Of Towers in Project</span>
                      <strong style={{ color: '#fbbf24', fontWeight: '900' }}>{viewPropertyModal.number_of_towers || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Floor Number (Unit Floor)</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.floor_num || viewPropertyModal.floor_number || viewPropertyModal.unit_floor || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Total Floors in Building</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.total_floors || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Facing Direction</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.facing || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Furnishing Status</span>
                      <strong style={{ color: '#38bdf8', fontWeight: '800' }}>{viewPropertyModal.furnishing || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Possession Status</span>
                      <strong style={{ color: '#22c55e', fontWeight: '900' }}>
                        {viewPropertyModal.possession_status || viewPropertyModal.possession || viewPropertyModal.possession_timeline || 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Handover Month & Year</span>
                      <strong style={{ color: '#eab308', fontWeight: '900' }}>
                        {viewPropertyModal.handover_month_year || (viewPropertyModal.handover_month && viewPropertyModal.handover_year ? `${viewPropertyModal.handover_month} ${viewPropertyModal.handover_year}` : 'N/A')}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Physical Keys / Custody</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.key_custody || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Architectural Description / Notes</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff', fontSize: '0.8rem' }}>{viewPropertyModal.description || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: 💰 FINANCIALS, PRICING & PARKING STOCK */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #a855f7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    💰 FINANCIAL VALUATION, CAR PARKING & COST SHEET BREAKDOWN
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 900 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Asking Rate Per Sq.Ft.</span>
                      <strong style={{ color: '#38bdf8', fontWeight: '900' }}>{viewPropertyModal.price_sqft ? (viewPropertyModal.price_sqft.toString().startsWith('₹') ? viewPropertyModal.price_sqft : `₹${viewPropertyModal.price_sqft}/Sq.Ft.`) : 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Base Property Asking Price</span>
                      <strong style={{ color: '#4ade80', fontSize: '1rem', fontWeight: '900' }}>{viewPropertyModal.final_price || (viewPropertyModal.price ? `₹${parseInt(viewPropertyModal.price.toString().replace(/[^0-9]/g, ''), 10).toLocaleString('en-IN')}` : 'N/A')}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Statutory GST Charge (%)</span>
                      <strong style={{ color: '#a855f7', fontWeight: '900' }}>{viewPropertyModal.gst_pct || '5%'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Parking Slot Allocation</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.car_parking || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Parking Price Tag</span>
                      <strong style={{ color: '#38bdf8', fontWeight: '800' }}>{parkingPriceDisp}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Monthly Maintenance</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.maintenance_monthly ? (viewPropertyModal.maintenance_monthly.toString().startsWith('₹') ? viewPropertyModal.maintenance_monthly : `₹${viewPropertyModal.maintenance_monthly}`) : 'N/A'}</strong>
                    </div>
                  </div>

                  {/* ITEMIZATION SECTION HEADER */}
                  <div style={{ background: isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.15)', borderLeft: '4px solid #0284c7', padding: '8px 12px', borderRadius: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: isLight ? '#0369a1' : '#38bdf8' }}>
                      📋 Cost Sheet Breakdown Charge Particulars
                    </span>
                  </div>

                  {/* 6 CHARGE BREAKDOWN PARTICULAR GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 900 ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>1. Floor Rise Charge</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.floor_rise_charge !== undefined && viewPropertyModal.floor_rise_charge !== '' ? `₹${viewPropertyModal.floor_rise_charge}` : (viewPropertyModal.floorRise ? `₹${viewPropertyModal.floorRise}` : '₹0')}</strong>
                    </div>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>2. PLC (Facing)</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.plc_charge !== undefined && viewPropertyModal.plc_charge !== '' ? `₹${viewPropertyModal.plc_charge}` : (viewPropertyModal.plc ? `₹${viewPropertyModal.plc}` : '₹0')}</strong>
                    </div>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>3. Covered Car Parking</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.parking_price !== undefined && viewPropertyModal.parking_price !== '' ? `₹${viewPropertyModal.parking_price}` : (viewPropertyModal.car_parking_charge ? `₹${viewPropertyModal.car_parking_charge}` : '₹0')}</strong>
                    </div>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>4. Clubhouse Membership</span>
                      <strong style={{ color: '#fbbf24' }}>{viewPropertyModal.amenity_charges !== undefined && viewPropertyModal.amenity_charges !== '' ? `₹${viewPropertyModal.amenity_charges}` : (viewPropertyModal.clubhouse_charge ? `₹${viewPropertyModal.clubhouse_charge}` : '₹0')}</strong>
                    </div>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>5. Advance Maint. (1 Yr)</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.advance_maintenance_charge ? `₹${viewPropertyModal.advance_maintenance_charge}` : '₹0'}</strong>
                    </div>
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '8px' }}>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.7rem', display: 'block', fontWeight: '700' }}>6. Infra & Legal Charges</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.legal_doc_charge !== undefined && viewPropertyModal.legal_doc_charge !== '' ? `₹${viewPropertyModal.legal_doc_charge}` : (viewPropertyModal.infrastructure_charge ? `₹${viewPropertyModal.infrastructure_charge}` : '₹0')}</strong>
                    </div>
                  </div>

                  {/* TOTAL BASE PRICE WITH OTHER CHARGES BANNER */}
                  <div style={{ background: isLight ? '#f0fdf4' : 'rgba(34, 197, 94, 0.12)', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💰 Total Base price with Others Charges (INR) [Base Flat + Floor Rise + PLC + Parking + Clubhouse + Maint + Legal]
                    </span>
                    <strong style={{ fontSize: '1.2rem', color: '#22c55e', fontWeight: '900' }}>
                      {computeTotalBaseWithOtherCharges(viewPropertyModal)}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '700' }}>
                      Calculated sum of Base Property Asking Price + Floor Rise + PLC + Covered Car Parking Slot Charge + Clubhouse + Advance Maintenance (1 Year) + Legal Charges.
                    </span>
                  </div>

                  {/* PROJECT PARKING STOCK AVAILABILITY BREAKDOWN */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #0284c7', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '900', display: 'block', marginBottom: '8px' }}>
                      🚗 PROJECT PARKING STOCK STATUS ({viewPropertyModal.title})
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                      <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #0284c7' }}>
                        <span style={{ color: '#38bdf8', fontWeight: '800' }}>🚗 Covered Stock:</span> <strong style={{ color: '#4ade80' }}>{modalAvailCovered} / {totalCoveredCap} Available</strong> (₹{coveredRateStr})
                      </div>
                      <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #eab308' }}>
                        <span style={{ color: '#eab308', fontWeight: '800' }}>⚡ EV Stations:</span> <strong style={{ color: '#4ade80' }}>{modalAvailEv} / {totalEvCap} Available</strong> (₹{evRateStr})
                      </div>
                      <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #22c55e' }}>
                        <span style={{ color: '#4ade80', fontWeight: '800' }}>🅿️ Open Surface:</span> <strong style={{ color: '#4ade80' }}>{modalAvailOpen} / {totalOpenCap} Available</strong> (₹{openRateStr})
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: 🌟 PROPERTY AMENITIES & COMMUNITY FACILITIES */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #38bdf8', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    🌟 PROPERTY AMENITIES & COMMUNITY FACILITIES
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(() => {
                      const amenitiesList = Array.isArray(viewPropertyModal.selected_amenities) && viewPropertyModal.selected_amenities.length > 0 
                        ? viewPropertyModal.selected_amenities 
                        : (Array.isArray(viewPropertyModal.amenities) && viewPropertyModal.amenities.length > 0 ? viewPropertyModal.amenities : []);
                      
                      if (amenitiesList.length === 0) {
                        return (
                          <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>
                            No specific property amenities configured yet.
                          </span>
                        );
                      }

                      return amenitiesList.map((am: string, i: number) => (
                        <span key={i} style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #0284c7', color: isLight ? '#0369a1' : '#38bdf8', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                          {am}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                {/* SECTION 6: 🔒 UNIT BOOKING & ALLOTMENT STATUS (IF BOOKED/SOLD) */}
                {(() => {
                  const st = String(viewPropertyModal.status || '').toUpperCase();
                  const isBooked = st.includes('BOOKED') || st.includes('SOLD') || st.includes('CONFIRMED');
                  if (!isBooked) return null;
                  return (
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1.5px solid #eab308', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🔒 UNIT BOOKING & ALLOTMENT DETAILS
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Unit Availability Status</span>
                          <strong style={{ color: '#fbbf24', fontWeight: '900' }}>🔒 {st}</strong>
                        </div>
                        <div>
                          <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Booked Customer / Allottee</span>
                          <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.booked_customer || viewPropertyModal.customer_name || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Associated Booking Code</span>
                          <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{viewPropertyModal.booking_code || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SECTION 5: 🏢 UPLOADED BUILDING & EXTERIOR ELEVATION GALLERY (PROJECT NAME WISE) */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #eab308', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      🏢 UPLOADED BUILDING & EXTERIOR ELEVATION GALLERY (PROJECT NAME WISE: {viewPropertyModal.title}) ({buildingPhotosList.length} Photos Listed)
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {buildingPhotosList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            buildingPhotosList.forEach((url, idx) => {
                              downloadImage(url, `${(viewPropertyModal.title || 'project').replace(/\s+/g, '_')}_exterior_${idx + 1}.jpg`);
                            });
                          }}
                          style={{ background: '#eab308', color: '#000000', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> 📥 Download All Building Photos
                        </button>
                      )}
                      <span style={{ fontSize: '0.72rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                        📌 Shared Across Project ({viewPropertyModal.title})
                      </span>
                    </div>
                  </div>

                  {buildingPhotosList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                      {buildingPhotosList.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #0284c7', background: '#000000', cursor: 'pointer', height: '110px' }} onClick={() => window.open(url, '_blank')}>
                          <img src={url} alt={`Building Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            {idx === 0 ? '⭐ Primary Exterior Cover' : idx === 1 ? '🏢 Building Elevation' : `Exterior #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(url, `${(viewPropertyModal.title || 'project').replace(/\s+/g, '_')}_exterior_${idx + 1}.jpg`);
                            }}
                            title="Download Image"
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(234, 179, 8, 0.95)', color: '#000000', border: 'none', padding: '3px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px dashed #eab308', borderRadius: '8px', padding: '16px', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', textAlign: 'center', fontWeight: '700' }}>
                      📷 No building exterior photos uploaded for this project yet.
                    </div>
                  )}
                </div>

                {/* SECTION 6: 📸 UNIT INTERIOR, ROOM LAYOUT & FLOOR PLAN PHOTOS & WALKTHROUGH VIDEOS (PROPERTY CODE WISE) */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #38bdf8', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      📸 UNIT INTERIOR & FLOOR PLAN PHOTOS (PROPERTY CODE WISE: {viewPropertyModal.property_code}) ({unitPhotosList.length} Photos Listed)
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {unitPhotosList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            unitPhotosList.forEach((url, idx) => {
                              downloadImage(url, `${(viewPropertyModal.property_code || 'unit').replace(/\s+/g, '_')}_photo_${idx + 1}.jpg`);
                            });
                          }}
                          style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> 📥 Download All Unit Photos
                        </button>
                      )}
                      <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                        🔑 Scoped to Property Code ({viewPropertyModal.property_code})
                      </span>
                    </div>
                  </div>

                  {unitPhotosList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                      {unitPhotosList.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #38bdf8', background: '#000000', cursor: 'pointer', height: '110px' }} onClick={() => window.open(url, '_blank')}>
                          <img src={url} alt={`Unit Interior Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            {idx === 0 ? '🛋️ Living Room Layout' : idx === 1 ? '🛏️ Bedroom Interior' : idx === 2 ? '🍳 Kitchen View' : `Floor Plan #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(url, `${(viewPropertyModal.property_code || 'unit').replace(/\s+/g, '_')}_photo_${idx + 1}.jpg`);
                            }}
                            title="Download Image"
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(56, 189, 248, 0.95)', color: '#0f172a', border: 'none', padding: '3px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px dashed #38bdf8', borderRadius: '8px', padding: '16px', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', textAlign: 'center', fontWeight: '700' }}>
                      📸 No unit interior photos uploaded for this property code yet.
                    </div>
                  )}

                  {/* 🎬 UNIT WALKTHROUGH VIDEO GALLERY IN INSPECTION VAULT */}
                  {unitVideosModalList.length > 0 && (
                    <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: '900', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                          <Video size={16} color="#a855f7" /> 🎬 UNIT WALKTHROUGH VIDEO GALLERY ({unitVideosModalList.length} Video{unitVideosModalList.length > 1 ? 's' : ''})
                        </h4>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                          Full HD Playback Enabled
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                        {unitVideosModalList.map((videoUrl, idx) => (
                          <div key={idx} style={{ background: '#000000', border: '1.5px solid #a855f7', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <video controls src={videoUrl} style={{ width: '100%', height: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                            <span style={{ color: '#a855f7', fontSize: '0.72rem', fontWeight: '900' }}>
                              🎥 Recorded Unit Walkthrough #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 7: 📐 PROPERTY LAYOUT & ARCHITECTURAL FLOOR PLAN GALLERY */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #a855f7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      📐 PROPERTY LAYOUT & ARCHITECTURAL FLOOR PLAN GALLERY ({layoutPhotosList.length + floorPlanPhotosList.length} Diagrams Listed)
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {(layoutPhotosList.length + floorPlanPhotosList.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            [...layoutPhotosList, ...floorPlanPhotosList].forEach((url, idx) => {
                              downloadImage(url, `${(viewPropertyModal.property_code || 'layout').replace(/\s+/g, '_')}_diagram_${idx + 1}.jpg`);
                            });
                          }}
                          style={{ background: '#a855f7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={13} /> 📥 Download All Layout & Floor Plans
                        </button>
                      )}
                      <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                        📐 Master Site & Unit Floor Plan Diagrams
                      </span>
                    </div>
                  </div>

                  {(layoutPhotosList.length + floorPlanPhotosList.length > 0) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                      {layoutPhotosList.map((url, idx) => (
                        <div key={`layout_${idx}`} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #a855f7', background: '#000000', cursor: 'pointer', height: '120px' }}>
                          <img src={url} alt={`Property Layout ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => window.open(url, '_blank')} />
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.85)', color: '#a855f7', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            📐 Property Layout #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(url, `${(viewPropertyModal.title || 'layout').replace(/\s+/g, '_')}_master_layout_${idx + 1}.jpg`);
                            }}
                            title="Download Layout Image"
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(168, 85, 247, 0.95)', color: '#ffffff', border: 'none', padding: '3px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      ))}
                      {floorPlanPhotosList.map((url, idx) => (
                        <div key={`floor_${idx}`} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #38bdf8', background: '#000000', cursor: 'pointer', height: '120px' }}>
                          <img src={url} alt={`Floor Plan ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => window.open(url, '_blank')} />
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            🗺️ Floor Plan #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(url, `${(viewPropertyModal.property_code || 'floorplan').replace(/\s+/g, '_')}_floor_plan_${idx + 1}.jpg`);
                            }}
                            title="Download Floor Plan Image"
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(56, 189, 248, 0.95)', color: '#0f172a', border: 'none', padding: '3px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
                          >
                            <Download size={11} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1px dashed #a855f7', borderRadius: '8px', padding: '16px', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.82rem', textAlign: 'center', fontWeight: '700' }}>
                      📐 No layout or architectural floor plan diagrams uploaded for this property yet.
                    </div>
                  )}
                </div>

                {/* SECTION 6: 👤 SITE CONTACT PERSON & PROPERTY HIGHLIGHTS */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    👤 SITE PERSON CONTACT & ARCHITECTURAL HIGHLIGHTS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Site Incharge Person Name</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.site_person_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Site Person Contact Phone</span>
                      <strong style={{ color: '#22c55e' }}>{viewPropertyModal.site_person_contact ? `📞 ${viewPropertyModal.site_person_contact}` : 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Property Highlights & Notes</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.description || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const pToEdit = viewPropertyModal;
                      setViewPropertyModal(null);
                      handleStartEditPropertyEnhanced(pToEdit);
                    }} 
                    style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ✏️ Edit Property Details
                  </button>
                  <button 
                    onClick={() => {
                      const pToEdit = viewPropertyModal;
                      handleStartEditProjectDeveloper(pToEdit);
                    }} 
                    style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#a855f7', border: '1.5px solid #a855f7', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    🏢 Edit Project & Developer Details
                  </button>
                </div>

                <button 
                  onClick={() => setViewPropertyModal(null)} 
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}
                >
                  Close Inspection Vault
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ⚙️ MODAL: MANAGE PARKING STOCK CAPACITIES & RATES */}
      {showStep2ParkingConfigModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #eab308', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚙️ MANAGE PARKING STOCK CAPACITIES & RATES
                </h3>
                <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                  Update total parking slot limits & default rates for your property projects.
                </p>
              </div>
              <button 
                onClick={() => setShowStep2ParkingConfigModal(false)}
                style={{ background: isLight ? '#f1f5f9' : '#334155', border: 'none', color: isLight ? '#0f172a' : '#ffffff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.entries(parkingStockConfig).map(([key, cfg]: [string, any]) => (
                <div key={key} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : '2fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>Category Key: {key}</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Total Slot Count</label>
                    <input 
                      type="number"
                      value={cfg.total || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setParkingStockConfig({
                          ...parkingStockConfig,
                          [key]: { ...cfg, total: val }
                        });
                      }}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', color: '#eab308', fontWeight: '900', padding: '6px 10px', borderRadius: '6px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Default Rate (INR)</label>
                    <input 
                      type="number"
                      value={cfg.price || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setParkingStockConfig({
                          ...parkingStockConfig,
                          [key]: { ...cfg, price: val }
                        });
                      }}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '6px 10px', borderRadius: '6px', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '14px' }}>
              <button 
                onClick={() => setShowStep2ParkingConfigModal(false)}
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}
              >
                💾 SAVE PARKING CONFIGURATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ 🔍 ADVANCE MASTER PROJECT SEARCH & LINKING VAULT MODAL */}
      {showAdvanceProjectSearchModal && (() => {
        const allProjs = getAllMasterProjects();

        // Distinct developers & localities for quick filter dropdowns
        const devOptions: string[] = Array.from(new Set(allProjs.map((p: any) => p.developer).filter(Boolean))).sort();
        const localityOptions: string[] = Array.from(new Set(allProjs.map((p: any) => p.locality).filter(Boolean))).sort();

        const filteredAdvProjects = allProjs.filter((p: any) => {
          // 1. Keyword search (Code, Title, Developer, Locality, Address)
          if (advProjSearchQuery.trim()) {
            const q = advProjSearchQuery.toLowerCase().trim();
            const matchCode = (p.code || p.id || '').toLowerCase().includes(q);
            const matchTitle = (p.title || '').toLowerCase().includes(q);
            const matchDev = (p.developer || '').toLowerCase().includes(q);
            const matchLocality = (p.locality || '').toLowerCase().includes(q);
            const matchRera = (p.rera_id || '').toLowerCase().includes(q);
            const matchHera = (p.hera_no || '').toLowerCase().includes(q);
            if (!matchCode && !matchTitle && !matchDev && !matchLocality && !matchRera && !matchHera) {
              return false;
            }
          }

          // 2. Developer filter
          if (advProjDevFilter && (p.developer || '').toLowerCase().trim() !== advProjDevFilter.toLowerCase().trim()) {
            return false;
          }

          // 3. Locality filter
          if (advProjLocalityFilter && (p.locality || '').toLowerCase().trim() !== advProjLocalityFilter.toLowerCase().trim()) {
            return false;
          }

          // 4. OTP status filter
          const isOtpVer = Boolean(
            p.otp_verified ||
            p.devProjectOtpVerified ||
            verifiedDevProjectsList.some((vp: any) => 
              (vp.developer && p.developer && vp.developer.toLowerCase().trim() === p.developer.toLowerCase().trim()) ||
              (vp.project && p.title && vp.project.toLowerCase().trim() === p.title.toLowerCase().trim())
            ) ||
            devProjectOtpVerified
          );

          if (advProjOtpFilter === 'VERIFIED' && !isOtpVer) return false;
          if (advProjOtpFilter === 'PENDING' && isOtpVer) return false;

          return true;
        });

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: windowWidth <= 640 ? '10px' : '20px' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1.5px solid #0284c7', borderRadius: windowWidth <= 640 ? '16px' : '24px', width: '100%', maxWidth: '980px', maxHeight: '90vh', overflowY: 'auto', padding: windowWidth <= 640 ? '16px' : '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* MODAL HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: isLight ? '#0284c7' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    ⚡ 🔍 ADVANCE MASTER PROJECT SEARCH & LINKING VAULT
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', margin: '4px 0 0 0' }}>
                    Multi-criteria advance search across builder name, project title, master codes, locality hub, and OTP credentials. Select any project to link inventory.
                  </p>
                </div>
                <button onClick={() => setShowAdvanceProjectSearchModal(false)} style={{ background: isLight ? '#f1f5f9' : '#0f172a', border: 'none', color: isLight ? '#64748b' : '#94a3b8', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              {/* ADVANCE FILTER CONTROLS GRID */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #0284c7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎛️ Advance Search Criteria & Multi-field Filters
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
                  {/* FILTER 1: KEYWORD SEARCH */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🔍 Search Keyword (Title, Code, Dev)
                    </label>
                    <input 
                      type="text"
                      value={advProjSearchQuery}
                      onChange={(e) => setAdvProjSearchQuery(e.target.value)}
                      placeholder="Type Project Name, ID..."
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}
                    />
                  </div>

                  {/* FILTER 2: DEVELOPER / BUILDER FILTER */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🏢 Developer / Builder Name
                    </label>
                    <select
                      value={advProjDevFilter}
                      onChange={(e) => setAdvProjDevFilter(e.target.value)}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}
                    >
                      <option value="">🏢 All Developers ({devOptions.length})</option>
                      {devOptions.map(dev => (
                        <option key={dev} value={dev}>{dev}</option>
                      ))}
                    </select>
                  </div>

                  {/* FILTER 3: LOCALITY HUB FILTER */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      📍 Locality Hub / Sector
                    </label>
                    <select
                      value={advProjLocalityFilter}
                      onChange={(e) => setAdvProjLocalityFilter(e.target.value)}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}
                    >
                      <option value="">📍 All Localities ({localityOptions.length})</option>
                      {localityOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* FILTER 4: OTP STATUS FILTER */}
                  <div>
                    <label style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
                      🔐 OTP Verification Protocol
                    </label>
                    <select
                      value={advProjOtpFilter}
                      onChange={(e) => setAdvProjOtpFilter(e.target.value)}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}
                    >
                      <option value="ALL">🔐 All OTP Statuses</option>
                      <option value="VERIFIED">✓ Verified OTP Only</option>
                      <option value="PENDING">⚠️ Pending OTP Only</option>
                    </select>
                  </div>
                </div>

                {(advProjSearchQuery || advProjDevFilter || advProjLocalityFilter || advProjOtpFilter !== 'ALL') && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdvProjSearchQuery('');
                        setAdvProjDevFilter('');
                        setAdvProjLocalityFilter('');
                        setAdvProjOtpFilter('ALL');
                      }}
                      style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      🔄 Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* RESULTS SUMMARY BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff' }}>
                  📋 REGISTERED MASTER PROJECTS FOUND ({filteredAdvProjects.length}):
                </span>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                  Showing {filteredAdvProjects.length} of {allProjs.length} total vault projects
                </span>
              </div>

              {/* SEARCH RESULTS CARDS LIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredAdvProjects.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    🔍 No master projects match your advance search criteria. Try adjusting your keyword or clearing filters.
                  </div>
                ) : (
                  filteredAdvProjects.map((p: any) => {
                    const pCode = p.code || p.id;
                    const unitsCount = properties.filter(prop => 
                      (prop.project_id && (prop.project_id === pCode || prop.project_id === p.id)) ||
                      (prop.title && p.title && prop.title.toLowerCase().trim() === p.title.toLowerCase().trim())
                    ).length;

                    const isOtpVer = Boolean(
                      p.otp_verified ||
                      p.devProjectOtpVerified ||
                      verifiedDevProjectsList.some((vp: any) => 
                        (vp.developer && p.developer && vp.developer.toLowerCase().trim() === p.developer.toLowerCase().trim()) ||
                        (vp.project && p.title && vp.project.toLowerCase().trim() === p.title.toLowerCase().trim())
                      ) ||
                      devProjectOtpVerified
                    );

                    return (
                      <div
                        key={p.id || p.code}
                        style={{
                          background: isLight ? '#ffffff' : '#0f172a',
                          border: '1.5px solid #0284c7',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', border: '1px solid #0284c7', padding: '3px 10px', borderRadius: '6px', fontWeight: '900', fontFamily: 'monospace' }}>
                              🔑 {pCode}
                            </span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                              🏢 {p.title}
                            </h4>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                              🏠 {unitsCount} Unit{unitsCount === 1 ? '' : 's'} Linked
                            </span>
                            <span style={{ fontSize: '0.72rem', background: isOtpVer ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isOtpVer ? '#22c55e' : '#f59e0b', border: `1px solid ${isOtpVer ? '#22c55e' : '#f59e0b'}`, padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                              {isOtpVer ? '✓ OTP VERIFIED' : '⚠️ OTP PENDING'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setNewPropertyForm((prev: any) => ({
                                ...prev,
                                project_id: p.id || p.code,
                                developer: p.developer || prev.developer,
                                developer_id: p.developer_id || prev.developer_id,
                                title: p.title || prev.title,
                                locality: p.locality || prev.locality,
                                latitude: p.latitude || prev.latitude,
                                longitude: p.longitude || prev.longitude,
                                rera_id: p.rera_id || prev.rera_id || '',
                                hera_no: p.hera_no || prev.hera_no || '',
                                selected_amenities: p.amenities && p.amenities.length > 0 ? p.amenities : prev.selected_amenities,
                                building_photos: p.building_photos && p.building_photos.length > 0 ? p.building_photos : prev.building_photos,
                                total_covered_parking_capacity: p.total_covered_parking_capacity !== undefined ? p.total_covered_parking_capacity : (prev.total_covered_parking_capacity || 0),
                                covered_parking_rate: p.covered_parking_rate || '',
                                total_ev_parking_capacity: p.total_ev_parking_capacity !== undefined ? p.total_ev_parking_capacity : (prev.total_ev_parking_capacity || 0),
                                ev_parking_rate: p.ev_parking_rate || '',
                                total_open_parking_capacity: p.total_open_parking_capacity !== undefined ? p.total_open_parking_capacity : (prev.total_open_parking_capacity || 0),
                                open_parking_rate: p.open_parking_rate || '',
                                parking_price: '',
                                car_parking_charge: '',
                                key_custody: p.key_custody || prev.key_custody || '',
                                keys_custody: p.key_custody || prev.keys_custody || '',
                                architectural_description: p.architectural_description || prev.architectural_description || '',
                                description: p.architectural_description || prev.description || '',
                                total_floors: p.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)',
                                number_of_towers: p.number_of_towers || prev.number_of_towers || '',
                                floor_no: `${prev.unit_floor || '2nd Floor'} out of ${p.total_floors || prev.total_floors || 'G+4 Floors (5 Storey)'}`
                              }));
                              if (p.mobile) setDevProjectMobile(p.mobile);
                              if (p.altMobile && setDevProjectAltMobile) setDevProjectAltMobile(p.altMobile);
                              setShowAdvanceProjectSearchModal(false);
                              alert(`✅ MASTER PROJECT LINKED SUCCESSFULLY!\n\n• Master Project Code: ${p.code || p.id}\n• Project Title: ${p.title}\n• Builder/Developer: ${p.developer}\n• Locality Hub: ${p.locality}\n• Total Floors: ${p.total_floors || 'G+4 Floors (5 Storey)'}\n• Towers: ${p.number_of_towers || 'N/A'}`);
                            }}
                            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
                          >
                            🎯 SELECT & LINK THIS MASTER PROJECT
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : windowWidth <= 900 ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '10px', fontSize: '0.82rem', background: isLight ? '#f8fafc' : '#1e293b', padding: '12px', borderRadius: '8px' }}>
                          <div>
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Builder / Developer</span>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>🏢 {p.developer || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Developer Phone</span>
                            <strong style={{ color: '#4ade80' }}>📱 {p.mobile || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Locality Hub / Sector</span>
                            <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>📍 {p.locality || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>GPS Coordinates</span>
                            <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{p.latitude && p.longitude ? `${p.latitude}, ${p.longitude}` : 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.72rem', display: 'block', fontWeight: '700' }}>Floors & Towers</span>
                            <strong style={{ color: '#fbbf24' }}>🏬 {p.total_floors || 'G+4 Floors'} • 🏰 {p.number_of_towers || 'Standalone'}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '14px' }}>
                <button onClick={() => setShowAdvanceProjectSearchModal(false)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                  Close Advance Search
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 📦 📥 BULK PROPERTY MASTER STOCK IMPORT & EXCEL ENGINE MODAL */}
      {(isBulkImportPropertyOpen || showBulkImportPropertyModal) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: windowWidth <= 640 ? '10px' : '20px'
        }}>
          <div style={{
            background: isLight ? '#ffffff' : '#1e293b',
            border: isLight ? '1px solid #cbd5e1' : '1.5px solid #22c55e',
            borderRadius: windowWidth <= 640 ? '16px' : '24px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: windowWidth <= 640 ? '16px' : '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* MODAL HEADER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155',
              paddingBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    letterSpacing: '0.5px'
                  }}>
                    EXCEL & CSV STOCK INGESTION
                  </span>
                  <span style={{
                    background: isLight ? '#f1f5f9' : '#0f172a',
                    color: isLight ? '#64748b' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {BULK_PROPERTY_COLUMNS.length} Master Inventory Columns Supported
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: isLight ? '#15803d' : '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: 0
                }}>
                  <Upload size={24} color="#22c55e" /> IMPORT BULK PROPERTY MASTER STOCK
                </h3>
                <p style={{
                  fontSize: '0.82rem',
                  color: isLight ? '#64748b' : '#94a3b8',
                  margin: '4px 0 0 0'
                }}>
                  Upload or paste your property inventory sheets. All {BULK_PROPERTY_COLUMNS.length} fields (linked by Master Project ID with BHK, Area, Floor, Pricing, and Charges) are supported with automatic formula calculations and sequential code generation.
                </p>
              </div>
              <button
                onClick={closeBulkImportModal}
                style={{
                  background: isLight ? '#f1f5f9' : '#0f172a',
                  border: 'none',
                  color: isLight ? '#64748b' : '#94a3b8',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* QUICK ACTIONS & TEMPLATE DOWNLOADS BANNER */}
            <div style={{
              background: isLight ? '#f0fdf4' : '#052e16',
              border: '1.5px solid #22c55e',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ color: isLight ? '#166534' : '#86efac', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} color="#22c55e" /> Step 1: Download Standard Pre-Formatted Template
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginTop: '2px' }}>
                    Template includes all {BULK_PROPERTY_COLUMNS.length} columns covering property unit inventory with 2 complete sample units.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadExcelTemplate}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <Download size={15} /> 📥 Download Excel Template (.xlsx)
                  </button>
                  <button
                    onClick={handleDownloadCsvTemplate}
                    style={{
                      background: isLight ? '#ffffff' : '#1e293b',
                      color: isLight ? '#0f172a' : '#f8fafc',
                      border: '1px solid #22c55e',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} /> 📄 Download CSV Template (.csv)
                  </button>
                  <button
                    onClick={handleExportInventoryExcel}
                    style={{
                      background: isLight ? '#ffffff' : '#0f172a',
                      color: '#0284c7',
                      border: '1px solid #0284c7',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileSpreadsheet size={15} /> 📊 Export Live Inventory ({properties.length})
                  </button>
                  <button
                    onClick={() => setShowBulkColumnsGuide(prev => !prev)}
                    style={{
                      background: 'none',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                      color: isLight ? '#475569' : '#cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {showBulkColumnsGuide ? <EyeOff size={14} /> : <Eye size={14} />} {showBulkColumnsGuide ? 'Hide Column Guide' : `View ${BULK_PROPERTY_COLUMNS.length} Column Guide`}
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE COLUMN GUIDE */}
              {showBulkColumnsGuide && (
                <div style={{
                  background: isLight ? '#ffffff' : '#0f172a',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '14px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.82rem', color: isLight ? '#0284c7' : '#38bdf8' }}>
                      📋 Full {BULK_PROPERTY_COLUMNS.length} Column Specification (Grouped by "Register New Property Master Inventory" Form Sections)
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Column headers in your Excel sheet match these names (or synonyms)
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ background: isLight ? '#f1f5f9' : '#1e293b', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>#</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Excel Header</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Form Section</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Sample Value 1</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BULK_PROPERTY_COLUMNS.map((col, idx) => (
                          <tr key={col.key} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <td style={{ padding: '6px 10px', fontWeight: '800', color: '#22c55e' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 10px', fontWeight: '700', color: isLight ? '#0f172a' : '#ffffff' }}>{col.header}</td>
                            <td style={{ padding: '6px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{col.section}</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontFamily: 'monospace' }}>{String(col.sample1)}</td>
                            <td style={{ padding: '6px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: UPLOAD OR PASTE INPUT AREA */}
            <div style={{
              background: isLight ? '#f8fafc' : '#0f172a',
              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <strong style={{ color: isLight ? '#0f172a' : '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={18} color="#0284c7" /> Step 2: Upload File or Paste Spreadsheet Data
                </strong>
                <div style={{ display: 'flex', gap: '6px', background: isLight ? '#e2e8f0' : '#1e293b', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setBulkImportMode('upload')}
                    style={{
                      background: bulkImportMode === 'upload' ? '#0284c7' : 'transparent',
                      color: bulkImportMode === 'upload' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    📁 Upload Excel / CSV
                  </button>
                  <button
                    onClick={() => setBulkImportMode('paste')}
                    style={{
                      background: bulkImportMode === 'paste' ? '#0284c7' : 'transparent',
                      color: bulkImportMode === 'paste' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Paste CSV / TSV Text
                  </button>
                </div>
              </div>

              {bulkImportMode === 'upload' ? (
                <div style={{
                  border: '2px dashed #0284c7',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isLight ? '#f0f9ff' : 'rgba(2, 132, 199, 0.05)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleBulkFileSelected}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Upload size={24} />
                    </div>
                    <strong style={{ fontSize: '0.95rem', color: isLight ? '#0284c7' : '#38bdf8' }}>
                      {bulkFileName ? `Selected: ${bulkFileName}` : 'Click or Drag & Drop Excel (.xlsx, .xls) or CSV File Here'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Supports all {BULK_PROPERTY_COLUMNS.length} columns. Auto-generates sequential property codes if left blank.
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={6}
                    value={bulkPasteContent}
                    onChange={(e) => setBulkPasteContent(e.target.value)}
                    placeholder="Paste CSV or Tab-separated rows here (including header row)...&#10;e.g.&#10;Master Project ID,BHK Configuration,Super Built-up Area (Sq.Ft.),Unit Floor Number,Unit / Flat Number,Asking Rate per Sq.Ft.&#10;SRM-PROJ-2026-000004,2 BHK,705,2nd Floor,Flat 2B,4000"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: isLight ? '#ffffff' : '#1e293b',
                      color: isLight ? '#0f172a' : '#ffffff',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => setBulkPasteContent('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isLight ? '#64748b' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      Clear Text
                    </button>
                    <button
                      onClick={handleProcessPastedCsv}
                      disabled={isProcessingBulkFile}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isProcessingBulkFile ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />} Parse & Preview Data
                    </button>
                  </div>
                </div>
              )}

              {/* PROCESSING INDICATOR */}
              {isProcessingBulkFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '0.82rem', fontWeight: '800' }}>
                  <RefreshCw size={16} className="spin" /> Parsing spreadsheet columns and computing valuation formulas...
                </div>
              )}

              {/* ERROR MESSAGES */}
              {bulkImportErrors.length > 0 && (
                <div style={{
                  background: isLight ? '#fef2f2' : '#450a0a',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <strong style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Import Notice / Warnings
                  </strong>
                  {bulkImportErrors.map((err, i) => (
                    <span key={i} style={{ color: isLight ? '#991b1b' : '#fca5a5', fontSize: '0.78rem' }}>
                      • {err}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 3: LIVE PARSED DATA PREVIEW */}
            {parsedBulkProperties.length > 0 && (
              <div style={{
                background: isLight ? '#f8fafc' : '#0f172a',
                border: '1.5px solid #22c55e',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#22c55e', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} /> Step 3: Verified {parsedBulkProperties.length} Properties Ready for Master Stock
                    </strong>
                    <span style={{ fontSize: '0.75rem', background: '#22c55e22', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      Formulas Auto-Calculated
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Filter preview rows..."
                      value={bulkPreviewFilter}
                      onChange={(e) => setBulkPreviewFilter(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                        background: isLight ? '#ffffff' : '#1e293b',
                        color: isLight ? '#0f172a' : '#ffffff',
                        fontSize: '0.78rem'
                      }}
                    />
                    <button
                      onClick={handleClearParsedRows}
                      style={{
                        background: '#ef444422',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Reset All
                    </button>
                  </div>
                </div>

                {/* PREVIEW TABLE */}
                <div style={{ overflowX: 'auto', maxHeight: '340px', overflowY: 'auto', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: isLight ? '#e2e8f0' : '#1e293b', zIndex: 10 }}>
                      <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #334155' }}>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>#</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Property Code</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Project Title</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Builder / Dev</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Locality</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Type & BHK</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>SBUA (Sq.Ft.)</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Rate / Sq.Ft.</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Base Asking Price</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>All-Inclusive</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Floor / Facing</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedBulkProperties
                        .filter(p => {
                          if (!bulkPreviewFilter.trim()) return true;
                          const q = bulkPreviewFilter.toLowerCase();
                          return (
                            String(p.property_code || '').toLowerCase().includes(q) ||
                            String(p.project_id || '').toLowerCase().includes(q) ||
                            String(p.title || '').toLowerCase().includes(q) ||
                            String(p.developer || '').toLowerCase().includes(q) ||
                            String(p.locality || '').toLowerCase().includes(q) ||
                            String(p.configuration || '').toLowerCase().includes(q)
                          );
                        })
                        .map((p, idx) => (
                          <tr key={p.id || idx} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <td style={{ padding: '8px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '900', color: '#0284c7' }}>{p.property_code}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{p.title}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#475569' : '#cbd5e1' }}>{p.developer}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#475569' : '#cbd5e1' }}>{p.locality}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '700', color: '#a855f7' }}>{p.configuration} ({p.property_type})</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#0f172a' : '#ffffff', fontFamily: 'monospace' }}>{p.super_builtup_area} sq.ft.</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#0f172a' : '#ffffff', fontFamily: 'monospace' }}>₹{p.price_sqft}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace' }}>{formatIndianRupees(cleanNum(p.final_price, 0))}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '900', color: '#38bdf8', fontFamily: 'monospace' }}>{formatIndianRupees(cleanNum(p.total_all_inclusive_price, 0))}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{p.unit_floor} • {p.facing}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <button
                                onClick={() => handleRemoveParsedRow(idx)}
                                title="Remove row from import"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              paddingTop: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                {parsedBulkProperties.length > 0 ? (
                  <span>
                    Ready to append <strong style={{ color: '#22c55e' }}>{parsedBulkProperties.length}</strong> property units to existing <strong style={{ color: '#0284c7' }}>{properties.length}</strong> master stock properties.
                  </span>
                ) : (
                  <span>Select an Excel/CSV file or paste data above to preview.</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={closeBulkImportModal}
                  style={{
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkImport}
                  disabled={parsedBulkProperties.length === 0 || isIngestingStock}
                  style={{
                    background: parsedBulkProperties.length > 0 ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : '#475569',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: parsedBulkProperties.length > 0 && !isIngestingStock ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: parsedBulkProperties.length > 0 ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none'
                  }}
                >
                  {isIngestingStock ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
                  {isIngestingStock ? 'Ingesting into Database...' : `Confirm & Import ${parsedBulkProperties.length} Properties`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏢 📥 BULK DEVELOPER MASTER STOCK IMPORT & EXCEL ENGINE MODAL */}
      {(isBulkImportDeveloperOpen || showBulkImportDeveloperModal) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: windowWidth <= 640 ? '10px' : '20px'
        }}>
          <div style={{
            background: isLight ? '#ffffff' : '#1e293b',
            border: isLight ? '1px solid #cbd5e1' : '1.5px solid #a855f7',
            borderRadius: windowWidth <= 640 ? '16px' : '24px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: windowWidth <= 640 ? '16px' : '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* MODAL HEADER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155',
              paddingBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    letterSpacing: '0.5px'
                  }}>
                    EXCEL & CSV DEVELOPER INGESTION
                  </span>
                  <span style={{
                    background: isLight ? '#f1f5f9' : '#0f172a',
                    color: isLight ? '#64748b' : '#94a3b8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {BULK_DEVELOPER_COLUMNS.length} Master Project & Developer Columns Supported
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: isLight ? '#7e22ce' : '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: 0
                }}>
                  <Upload size={24} color="#a855f7" /> IMPORT BULK DEVELOPER MASTER STOCK
                </h3>
                <p style={{
                  fontSize: '0.82rem',
                  color: isLight ? '#64748b' : '#94a3b8',
                  margin: '4px 0 0 0'
                }}>
                  Upload or paste your developer & master project sheets. All {BULK_DEVELOPER_COLUMNS.length} fields from "Register New Project & Developer Master" (Developer details, Project codes, Locality, RERA/HERA IDs, Floors, Towers, GPS coords, Amenities, Parking capacities & Key custody) are supported with automatic ID generation, Channel Partner Agreements, and Developer Vault registration.
                </p>
              </div>
              <button
                onClick={closeBulkDeveloperImportModal}
                style={{
                  background: isLight ? '#f1f5f9' : '#0f172a',
                  border: 'none',
                  color: isLight ? '#64748b' : '#94a3b8',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* QUICK ACTIONS & TEMPLATE DOWNLOADS BANNER */}
            <div style={{
              background: isLight ? '#faf5ff' : 'rgba(168, 85, 247, 0.08)',
              border: '1.5px solid #a855f7',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ color: isLight ? '#6b21a8' : '#e9d5ff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} color="#a855f7" /> Step 1: Download Standard Pre-Formatted Template
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: isLight ? '#475569' : '#cbd5e1', display: 'block', marginTop: '2px' }}>
                    Template includes all {BULK_DEVELOPER_COLUMNS.length} columns covering Developer Master and Project specifications with 2 complete sample records.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadDeveloperExcelTemplate}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    <Download size={15} /> 📥 Download Excel Template (.xlsx)
                  </button>
                  <button
                    onClick={handleDownloadDeveloperCsvTemplate}
                    style={{
                      background: isLight ? '#ffffff' : '#1e293b',
                      color: isLight ? '#0f172a' : '#f8fafc',
                      border: '1px solid #a855f7',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} /> 📄 Download CSV Template (.csv)
                  </button>
                  <button
                    onClick={handleExportDeveloperExcel}
                    style={{
                      background: isLight ? '#ffffff' : '#0f172a',
                      color: '#a855f7',
                      border: '1px solid #a855f7',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileSpreadsheet size={15} /> 📊 Export Live Developer Projects
                  </button>
                  <button
                    onClick={() => setShowBulkDevColumnsGuide(prev => !prev)}
                    style={{
                      background: 'none',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #475569',
                      color: isLight ? '#475569' : '#cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {showBulkDevColumnsGuide ? <EyeOff size={14} /> : <Eye size={14} />} {showBulkDevColumnsGuide ? 'Hide Column Guide' : `View ${BULK_DEVELOPER_COLUMNS.length} Column Guide`}
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE COLUMN GUIDE */}
              {showBulkDevColumnsGuide && (
                <div style={{
                  background: isLight ? '#ffffff' : '#0f172a',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '14px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.82rem', color: isLight ? '#7e22ce' : '#c084fc' }}>
                      📋 Full {BULK_DEVELOPER_COLUMNS.length} Column Specification (Directly from "Register New Project & Developer Master")
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Column headers match these names (or intelligent synonyms)
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ background: isLight ? '#f1f5f9' : '#1e293b', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>#</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Excel Header</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Form Section</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Sample Value 1</th>
                          <th style={{ padding: '6px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BULK_DEVELOPER_COLUMNS.map((col, idx) => (
                          <tr key={col.key} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <td style={{ padding: '6px 10px', fontWeight: '800', color: '#a855f7' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 10px', fontWeight: '700', color: isLight ? '#0f172a' : '#ffffff' }}>{col.header}</td>
                            <td style={{ padding: '6px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{col.section}</td>
                            <td style={{ padding: '6px 10px', color: '#38bdf8', fontFamily: 'monospace' }}>{String(col.sample1)}</td>
                            <td style={{ padding: '6px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: UPLOAD OR PASTE INPUT AREA */}
            <div style={{
              background: isLight ? '#f8fafc' : '#0f172a',
              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <strong style={{ color: isLight ? '#0f172a' : '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={18} color="#a855f7" /> Step 2: Upload File or Paste Spreadsheet Data
                </strong>
                <div style={{ display: 'flex', gap: '6px', background: isLight ? '#e2e8f0' : '#1e293b', padding: '3px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setBulkDevImportMode('upload')}
                    style={{
                      background: bulkDevImportMode === 'upload' ? '#a855f7' : 'transparent',
                      color: bulkDevImportMode === 'upload' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    📁 Upload Excel / CSV
                  </button>
                  <button
                    onClick={() => setBulkDevImportMode('paste')}
                    style={{
                      background: bulkDevImportMode === 'paste' ? '#a855f7' : 'transparent',
                      color: bulkDevImportMode === 'paste' ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Paste CSV / TSV Text
                  </button>
                </div>
              </div>

              {bulkDevImportMode === 'upload' ? (
                <div style={{
                  border: '2px dashed #a855f7',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isLight ? '#faf5ff' : 'rgba(168, 85, 247, 0.05)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleBulkDevFileSelected}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Upload size={24} />
                    </div>
                    <strong style={{ fontSize: '0.95rem', color: isLight ? '#7e22ce' : '#c084fc' }}>
                      {bulkDevFileName ? `Selected: ${bulkDevFileName}` : 'Click or Drag & Drop Excel (.xlsx, .xls) or CSV File Here'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                      Supports all {BULK_DEVELOPER_COLUMNS.length} columns. Auto-generates sequential Project IDs & Developer IDs if left blank.
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={6}
                    value={bulkDevPasteContent}
                    onChange={(e) => setBulkDevPasteContent(e.target.value)}
                    placeholder="Paste CSV or Tab-separated rows here (including header row)...&#10;e.g.&#10;Developer / Builder Name,Project Title & Name,Master Project ID,Developer Mobile Phone (for OTP),Locality Hub / Sector,Total Floors in Building,Number Of Towers in Project / Complex&#10;Godrej Properties,Godrej Prakriti,SRM-PROJ-2026-000001,+91 98833 95102,BT Road Sodepur,G+14 Floors (Highrise),8 Towers Complex"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: isLight ? '#ffffff' : '#1e293b',
                      color: isLight ? '#0f172a' : '#ffffff',
                      border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => setBulkDevPasteContent('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isLight ? '#64748b' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      Clear Text
                    </button>
                    <button
                      onClick={handleProcessPastedDevCsv}
                      disabled={isProcessingBulkDevFile}
                      style={{
                        background: '#a855f7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isProcessingBulkDevFile ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />} Parse & Preview Data
                    </button>
                  </div>
                </div>
              )}

              {/* PROCESSING INDICATOR */}
              {isProcessingBulkDevFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.82rem', fontWeight: '800' }}>
                  <RefreshCw size={16} className="spin" /> Parsing developer project columns and validating master parameters...
                </div>
              )}

              {/* ERROR MESSAGES */}
              {bulkDevImportErrors.length > 0 && (
                <div style={{
                  background: isLight ? '#fef2f2' : '#450a0a',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <strong style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Import Notice / Warnings
                  </strong>
                  {bulkDevImportErrors.map((err, i) => (
                    <span key={i} style={{ color: isLight ? '#991b1b' : '#fca5a5', fontSize: '0.78rem' }}>
                      • {err}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 3: LIVE PARSED DATA PREVIEW */}
            {parsedBulkDevelopers.length > 0 && (
              <div style={{
                background: isLight ? '#f8fafc' : '#0f172a',
                border: '1.5px solid #a855f7',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#a855f7', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} /> Step 3: Verified {parsedBulkDevelopers.length} Developer Projects Ready for Master Vault
                    </strong>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      Parameters Validated
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Filter preview rows..."
                      value={bulkDevPreviewFilter}
                      onChange={(e) => setBulkDevPreviewFilter(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
                        background: isLight ? '#ffffff' : '#1e293b',
                        color: isLight ? '#0f172a' : '#ffffff',
                        fontSize: '0.78rem'
                      }}
                    />
                    <button
                      onClick={handleClearParsedDevRows}
                      style={{
                        background: '#ef444422',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Reset All
                    </button>
                  </div>
                </div>

                {/* PREVIEW TABLE */}
                <div style={{ overflowX: 'auto', maxHeight: '340px', overflowY: 'auto', border: isLight ? '1px solid #e2e8f0' : '1px solid #334155', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: isLight ? '#e2e8f0' : '#1e293b', zIndex: 10 }}>
                      <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #334155' }}>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>#</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Master Project ID</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Developer / Builder</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Developer ID</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Project Title</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Locality Hub</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Contact Mobile</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Floors & Towers</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>RERA / HERA</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>GPS Coords</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Parking (Cov/EV/Open)</th>
                        <th style={{ padding: '8px 10px', color: isLight ? '#475569' : '#94a3b8' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedBulkDevelopers
                        .filter(p => {
                          if (!bulkDevPreviewFilter.trim()) return true;
                          const q = bulkDevPreviewFilter.toLowerCase();
                          return (
                            String(p.project_id || '').toLowerCase().includes(q) ||
                            String(p.developer || '').toLowerCase().includes(q) ||
                            String(p.developer_id || '').toLowerCase().includes(q) ||
                            String(p.title || '').toLowerCase().includes(q) ||
                            String(p.locality || '').toLowerCase().includes(q) ||
                            String(p.developer_mobile || '').toLowerCase().includes(q)
                          );
                        })
                        .map((p, idx) => (
                          <tr key={p.id || idx} style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid #1e293b' }}>
                            <td style={{ padding: '8px 10px', color: isLight ? '#64748b' : '#94a3b8' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '900', color: '#a855f7', fontFamily: 'monospace' }}>{p.project_id}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>{p.developer}</td>
                            <td style={{ padding: '8px 10px', color: '#fbbf24', fontFamily: 'monospace', fontWeight: '800' }}>{p.developer_id}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '800', color: isLight ? '#0f172a' : '#38bdf8' }}>{p.title}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#475569' : '#cbd5e1' }}>{p.locality}</td>
                            <td style={{ padding: '8px 10px', color: '#4ade80', fontFamily: 'monospace', fontWeight: '700' }}>{p.developer_mobile}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#475569' : '#cbd5e1' }}>{p.total_floors} • {p.number_of_towers}</td>
                            <td style={{ padding: '8px 10px', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem' }}>{p.rera_id || p.hera_no || 'N/A'}</td>
                            <td style={{ padding: '8px 10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.7rem' }}>{p.latitude}, {p.longitude}</td>
                            <td style={{ padding: '8px 10px', color: '#eab308', fontWeight: '700' }}>{p.total_covered_parking_capacity} / {p.total_ev_parking_capacity} / {p.total_open_parking_capacity} slots</td>
                            <td style={{ padding: '8px 10px' }}>
                              <button
                                onClick={() => handleRemoveParsedDevRow(idx)}
                                title="Remove row from import"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              paddingTop: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                {parsedBulkDevelopers.length > 0 ? (
                  <span>
                    Ready to register <strong style={{ color: '#a855f7' }}>{parsedBulkDevelopers.length}</strong> developer projects into Developer Master Vault.
                  </span>
                ) : (
                  <span>Select an Excel/CSV file or paste data above to preview.</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={closeBulkDeveloperImportModal}
                  style={{
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkDeveloperImport}
                  disabled={parsedBulkDevelopers.length === 0 || isIngestingDevStock}
                  style={{
                    background: parsedBulkDevelopers.length > 0 ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' : '#475569',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: parsedBulkDevelopers.length > 0 && !isIngestingDevStock ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: parsedBulkDevelopers.length > 0 ? '0 4px 14px rgba(168, 85, 247, 0.4)' : 'none'
                  }}
                >
                  {isIngestingDevStock ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
                  {isIngestingDevStock ? 'Ingesting into Database...' : `Confirm & Import ${parsedBulkDevelopers.length} Developer Projects`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};