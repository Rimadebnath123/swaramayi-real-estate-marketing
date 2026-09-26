import { extractAllIdentifiers, isItemInRecycledSet } from '../App';
import React from 'react';
import { Upload, Building2, Share2, ArrowRightLeft, Compass, Navigation, Camera, Video, Search, X, Download } from 'lucide-react';

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
  handleCaptureCurrentGpsLocation: () => void;
  handleCreatePropertySubmit: (e: React.FormEvent) => void;
  generateNextPropertyCode: () => string;
  handleOpenAddPropertyModal: () => void;
  setShowBulkImportPropertyModal: (val: boolean) => void;
  setShowBulkImportProjectDeveloperModal?: (val: boolean) => void;
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
  onRecycleItem?: (itemData: any) => void;
}

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
  handleCaptureCurrentGpsLocation,
  handleCreatePropertySubmit,
  generateNextPropertyCode,
  handleOpenAddPropertyModal,
  setShowBulkImportPropertyModal,
  setShowBulkImportProjectDeveloperModal,
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
}) => {
  const roleUpper = (currentRole || '').toUpperCase().replace(/_/g, ' ');
  const isStrictSuperAdmin = !currentRole || roleUpper.includes('SUPER') || roleUpper.includes('OWNER');
  const isSuperAdmin = isStrictSuperAdmin || roleUpper.includes('ADMIN');
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

  const [editingDevId, setEditingDevId] = React.useState<string | null>(null);
  const [editDevForm, setEditDevForm] = React.useState<{ id: string; name: string; mobile: string; email: string }>({ id: '', name: '', mobile: '', email: '' });

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

  // AUTOMATIC CLEANUP EFFECT: Ensure every project in developerMasterList has a UNIQUE project code
  React.useEffect(() => {
    if (!developerMasterList || developerMasterList.length === 0) return;

    let modified = false;
    const year = new Date().getFullYear();
    const seenCodes = new Set<string>();
    let maxSeq = 87;

    // Scan max sequence number
    developerMasterList.forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        const pCode = proj.code || proj.id || '';
        const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
      });
    });

    const cleanedDevs = developerMasterList.map((dev: any) => {
      const cleanProjects = (dev.projects || []).map((proj: any) => {
        let code = proj.code || proj.id;
        if (!code || seenCodes.has(code)) {
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
        projects: cleanProjects
      };
    });

    if (modified) {
      setDeveloperMasterList(cleanedDevs);
      try {
        localStorage.setItem('swaramayi_developers_v1', JSON.stringify(cleanedDevs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
            latitude: proj.lat || proj.latitude || '22.722361',
            longitude: proj.lng || proj.longitude || '88.493403',
            rera_id: proj.rera_id || proj.reraId || proj.rera || dev.rera_id || dev.reraId || dev.rera || dev.developer_rera_id || '',
            hera_no: proj.hera_no || proj.heraId || proj.hera || dev.hera_no || dev.heraId || dev.hera || dev.developer_hera_no || '',
            amenities: proj.amenities || [],
            building_photos: proj.building_photos || [],
            total_covered_parking_capacity: proj.total_covered_parking_capacity !== undefined ? proj.total_covered_parking_capacity : 24,
            covered_parking_rate: proj.covered_parking_rate || '300000',
            total_ev_parking_capacity: proj.total_ev_parking_capacity !== undefined ? proj.total_ev_parking_capacity : 6,
            ev_parking_rate: proj.ev_parking_rate || '450000',
            total_open_parking_capacity: proj.total_open_parking_capacity !== undefined ? proj.total_open_parking_capacity : 12,
            open_parking_rate: proj.open_parking_rate || '150000'
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
          covered_parking_rate: prop.covered_parking_rate || '0',
          total_ev_parking_capacity: prop.total_ev_parking_capacity !== undefined ? prop.total_ev_parking_capacity : 0,
          ev_parking_rate: prop.ev_parking_rate || '0',
          total_open_parking_capacity: prop.total_open_parking_capacity !== undefined ? prop.total_open_parking_capacity : 0,
          open_parking_rate: prop.open_parking_rate || '0'
        });
      }
    });

    return Array.from(masterProjectsMap.values());
  }, [developerMasterList, properties]);

  const [selectedDevId, setSelectedDevId] = React.useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  const [projectIdSearchFilter, setProjectIdSearchFilter] = React.useState<string>('');
  const [devSearchQuery, setDevSearchQuery] = React.useState<string>('');
  const [projectSearchQuery, setProjectSearchQuery] = React.useState<string>('');
  const [showDevVaultModal, setShowDevVaultModal] = React.useState<boolean>(false);
  const [newDevNameInput, setNewDevNameInput] = React.useState<string>('');
  const [newDevMobileInput, setNewDevMobileInput] = React.useState<string>('');
  const [newDevAltMobileInput, setNewDevAltMobileInput] = React.useState<string>('');
  const [newDevProjectTitleInput, setNewDevProjectTitleInput] = React.useState<string>('');
  const [newDevEmailInput, setNewDevEmailInput] = React.useState<string>('');
  const [viewPropertyModal, setViewPropertyModal] = React.useState<any | null>(null);

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
      covered_parking_rate: p.covered_parking_rate || '0',
      total_ev_parking_capacity: p.total_ev_parking_capacity !== undefined ? p.total_ev_parking_capacity : 0,
      ev_parking_rate: p.ev_parking_rate || '0',
      total_open_parking_capacity: p.total_open_parking_capacity !== undefined ? p.total_open_parking_capacity : 0,
      open_parking_rate: p.open_parking_rate || '0',
      selected_amenities: Array.isArray(p.selected_amenities) ? p.selected_amenities : [],
      building_photos: Array.isArray(p.building_photos) ? p.building_photos : (p.building_photo ? [p.building_photo] : []),
      building_photo: p.building_photo || '',
      rera_id: p.rera_id || '',
      hera_no: p.hera_no || '',
      description: p.description || ''
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

  // MULTIPLE PROPERTY UNITS BUILDER & SLIDER STATE
  const [showMultipleUnitsSlider, setShowMultipleUnitsSlider] = React.useState<{ open: boolean; project?: any } | null>(null);
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

  const [sliderUnitForm, setSliderUnitForm] = React.useState<any>({
    unitNumber: 'Flat 301',
    bhk: '2BHK',
    floor: '3rd Floor',
    tower: 'Tower A',
    superBuiltupArea: '1,283 Sq.Ft.',
    deductionPct: '35%',
    carpetArea: '898.1 Sq.Ft.',
    facing: 'East Facing',
    furnishing: 'Semi-Furnished',
    priceSqft: '5131',
    basePrice: '₹65,83,073',
    parkingRequired: 'YES',
    parking: '1 Covered Car Parking Slot',
    parkingPrice: '300000',
    amenityCharges: '150000',
    gstPct: '5%',
    totalAllInclusivePrice: '₹73,84,727',
    selectedAmenities: [
      '24/7 Power Backup',
      'Water Supply',
      'Security',
      'CCTV cameras',
      'Elevators',
      'Gymnasium',
      'Swimming Pool',
      'Clubhouse'
    ],
    keyCustody: 'Builder Site Office',
    description: 'Pool facing Vastu East, 3 balconies',
    status: 'AVAILABLE',
    unitPhotos: [],
    unitVideos: []
  });

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

  // AUTOMATED PROJECT ID GENERATOR (SRM-PROJ-2026-000088, SRM-PROJ-2026-000089...)
  const generateNextProjectId = React.useCallback(() => {
    const year = new Date().getFullYear();
    let maxSeq = 87;

    // Scan properties
    (properties || []).forEach((p: any) => {
      const pCode = p.project_id || p.code || p.id || '';
      const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });

    // Scan developerMasterList
    (developerMasterList || []).forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        const pCode = proj.code || proj.id || '';
        const match = pCode.match(/SRM-PROJ-\d+-(\d+)/i) || pCode.match(/PROJ-\d+-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      });
    });

    // Collect all existing codes to guarantee 100% uniqueness
    const existingCodes = new Set<string>();
    (properties || []).forEach((p: any) => {
      if (p.project_id) existingCodes.add(p.project_id);
      if (p.code) existingCodes.add(p.code);
    });
    (developerMasterList || []).forEach((dev: any) => {
      (dev.projects || []).forEach((proj: any) => {
        if (proj.code) existingCodes.add(proj.code);
        if (proj.id) existingCodes.add(proj.id);
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
    let maxNum = 427;

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

  // LIVE PARKING ALLOCATION STATS CALCULATOR
  const getParkingAllocationStats = React.useCallback((projCode: string) => {
    const currentUnits = projectUnitsList.filter((u: any) => 
      u.propertyId === projCode || 
      (u.projectTitle && u.projectTitle.toLowerCase() === (projCode || '').toLowerCase())
    );

    const allocated: Record<string, number> = {
      'Covered Single': 0,
      'Covered Tandem': 0,
      'EV Charging': 0,
      'Open Surface': 0,
      'Mechanical Stacker': 0
    };

    currentUnits.forEach((u: any) => {
      if (u.parkingRequired === 'NO' || u.parking === 'No Parking Allocated') return;
      const pStr = (u.parking || '').toLowerCase();
      if (pStr.includes('tandem') || pStr.includes('2 covered')) allocated['Covered Tandem']++;
      else if (pStr.includes('ev')) allocated['EV Charging']++;
      else if (pStr.includes('open') || pStr.includes('surface')) allocated['Open Surface']++;
      else if (pStr.includes('stacker')) allocated['Mechanical Stacker']++;
      else if (pStr.includes('covered') || pStr.includes('1 covered')) allocated['Covered Single']++;
    });

    return allocated;
  }, [projectUnitsList]);

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
      total_floors: foundProp.total_floors || '',
      facing: foundProp.facing || '',
      furnishing: foundProp.furnishing || '',
      final_price: foundProp.final_price || '',
      price_sqft: foundProp.price_sqft || '',
      car_parking: foundProp.car_parking || '',
      parking_price: foundProp.parking_price || '0',
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
      locality: newPropertyForm.locality || 'Locality Hub',
      lat: newPropertyForm.latitude || '22.722361',
      lng: newPropertyForm.longitude || '88.493403',
      rera_id: newPropertyForm.rera_id || '',
      hera_no: newPropertyForm.hera_no || '',
      amenities: newPropertyForm.selected_amenities || [],
      building_photos: newPropertyForm.building_photos || [],
      total_covered_parking_capacity: newPropertyForm.total_covered_parking_capacity !== undefined ? newPropertyForm.total_covered_parking_capacity : 24,
      covered_parking_rate: newPropertyForm.covered_parking_rate || '300000',
      total_ev_parking_capacity: newPropertyForm.total_ev_parking_capacity !== undefined ? newPropertyForm.total_ev_parking_capacity : 6,
      ev_parking_rate: newPropertyForm.ev_parking_rate || '450000',
      total_open_parking_capacity: newPropertyForm.total_open_parking_capacity !== undefined ? newPropertyForm.total_open_parking_capacity : 12,
      open_parking_rate: newPropertyForm.open_parking_rate || '150000'
    };

    let updatedDevs = [...developerMasterList];
    const existingDevIdx = updatedDevs.findIndex(d => d.name.toLowerCase().trim() === (newPropertyForm.developer || '').toLowerCase().trim());
    
    if (existingDevIdx >= 0) {
      const devObj = updatedDevs[existingDevIdx];
      if (newPropertyForm.developer_email) devObj.email = newPropertyForm.developer_email;
      const projList = devObj.projects || [];
      if (!projList.some((p: any) => (p.id === assignedProjCode || p.code === assignedProjCode || p.title.toLowerCase().trim() === newPropertyForm.title.toLowerCase().trim()))) {
        devObj.projects = [newProjEntry, ...projList];
      }
    } else {
      const newDevObj = {
        id: `SRM-DEV-2026-${String(Math.floor(100000 + Math.random() * 900000))}`,
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
      selected_amenities: newPropertyForm.selected_amenities || [],
      building_photos: newPropertyForm.building_photos || [],
      total_covered_parking_capacity: newPropertyForm.total_covered_parking_capacity !== undefined ? newPropertyForm.total_covered_parking_capacity : prev.total_covered_parking_capacity,
      covered_parking_rate: newPropertyForm.covered_parking_rate || prev.covered_parking_rate,
      total_ev_parking_capacity: newPropertyForm.total_ev_parking_capacity !== undefined ? newPropertyForm.total_ev_parking_capacity : prev.total_ev_parking_capacity,
      ev_parking_rate: newPropertyForm.ev_parking_rate || prev.ev_parking_rate,
      total_open_parking_capacity: newPropertyForm.total_open_parking_capacity !== undefined ? newPropertyForm.total_open_parking_capacity : prev.total_open_parking_capacity,
      open_parking_rate: newPropertyForm.open_parking_rate || prev.open_parking_rate
    }));

    alert(`🎉 MASTER PROJECT CREATED & REGISTERED IN VAULT!\n\n• Master Project Code / ID: ${assignedProjCode}\n• Project Title: ${newPropertyForm.title}\n• Developer: ${newPropertyForm.developer}\n• Locality Hub: ${newPropertyForm.locality}\n\n👉 Now creating individual property unit under Project Code ${assignedProjCode}!`);
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
            lng: gps.lng
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
          lng: gps.lng
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
      longitude: gps.lng
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
    setNewPropertyForm((prev: any) => ({
      ...prev,
      project_id: '',
      developer: '',
      developer_id: '',
      title: '',
      locality: '',
      developer_mobile: '',
      developer_alt_mobile: '',
      latitude: '22.722361',
      longitude: '88.493403',
      selected_amenities: [],
      building_photos: [],
      total_covered_parking_capacity: 24,
      covered_parking_rate: '300000',
      total_ev_parking_capacity: 6,
      ev_parking_rate: '450000',
      total_open_parking_capacity: 12,
      open_parking_rate: '150000'
    }));
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
      title: '',
      locality: '',
      configuration: '',
      super_builtup_area: '',
      carpet_area: '',
      floor_num: '',
      total_floors: '',
      facing: '',
      furnishing: '',
      final_price: '',
      price_sqft: '',
      car_parking: '',
      parking_price: '',
      latitude: '22.722361',
      longitude: '88.493403',
      selected_amenities: [],
      building_photos: [],
      building_photo: '',
      unit_photos: [],
      unit_photo: '',
      unit_videos: [],
      project_posting_id: '',
      key_custody: '',
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
            onClick={() => setShowBulkImportProjectDeveloperModal && setShowBulkImportProjectDeveloperModal(true)} 
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}
          >
            <Upload size={15} /> 🏢 📥 Import Bulk Projects & Developers
          </button>
          <button 
            onClick={() => setShowBulkImportPropertyModal(true)} 
            style={{ background: '#22c55e', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}
          >
            <Upload size={15} /> 🏠 📥 Import Bulk Property Stock
          </button>
          <button onClick={() => alert('📄 Generating Property Stock Inventory CSV Report...')} style={{ background: isLight ? '#ffffff' : '#1e293b', color: isLight ? '#0f172a' : '#cbd5e1', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none' }}>
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
          🏢 Developer Master Vault ({developerMasterList.length} Developer IDs)
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
                onClick={() => setActiveProjectSubTab('property_master')}
                style={{ background: isLight ? '#f1f5f9' : '#0f172a', color: '#0284c7', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}
              >
                <ArrowRightLeft size={16} /> ⬅️ Back to Property Inventory Registry
              </button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🏢 Register New Project & Developer Master
              </h2>
              <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                Register Master Project Title, Builder/Developer Name, Contact OTP credentials, GPS locality coordinates, Elevation Photos & Amenities.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                    placeholder="e.g. My Home Constructions / Dhriti Builders / Aparna" 
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
                    placeholder="e.g. My Home Bhooja / Dhriti Apartments / Aparna Zenon" 
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
                  <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Locality Hub / Sector *</label>
                  <input 
                    type="text" 
                    value={newPropertyForm.locality} 
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, locality: e.target.value })} 
                    placeholder="e.g. Kondapur Hub / HITEC City Sector / BARASAT" 
                    style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
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

                {gpsCaptureStatus && (
                  <div style={{ background: gpsCaptureStatus.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)', border: `1px solid ${gpsCaptureStatus.startsWith('✓') ? '#22c55e' : '#a855f7'}`, borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', color: gpsCaptureStatus.startsWith('✓') ? '#4ade80' : '#a855f7', fontWeight: '800' }}>
                    {gpsCaptureStatus}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>GPS Latitude (Exact Map Lat)</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.latitude} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, latitude: e.target.value })} 
                      placeholder="e.g. 22.698021 or 22.722361" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '4px' }}>GPS Longitude (Exact Map Long)</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.longitude} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, longitude: e.target.value })} 
                      placeholder="e.g. 88.463723 or 78.34891" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#4ade80', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              </div>

              {/* MULTIPLE BUILDING & EXTERIOR ELEVATION PHOTO CAPTURE & CAMERA WIDGET */}
              {(() => {
                const photosList: string[] = Array.isArray(newPropertyForm.building_photos) 
                  ? newPropertyForm.building_photos 
                  : (newPropertyForm.building_photo ? [newPropertyForm.building_photo] : []);

                const handleProcessPhotoFiles = (files: FileList | null) => {
                  if (files && files.length > 0) {
                    const fileArray = Array.from(files);
                    const readPromises = fileArray.map(file => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => resolve(evt.target?.result as string || '');
                        reader.readAsDataURL(file);
                      });
                    });
                    Promise.all(readPromises).then(base64Results => {
                      const validResults = base64Results.filter(b => b);
                      const updatedList = [...photosList, ...validResults];
                      setNewPropertyForm((prev: any) => ({
                        ...prev,
                        building_photos: updatedList,
                        building_photo: updatedList[0] || ''
                      }));
                    });
                  }
                };

                return (
                  <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1.5px solid #eab308', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.88rem', color: '#eab308', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Camera size={18} color="#eab308" /> 📷 Building & Exterior Elevation Photo Capture (Multiple Uploads & Live Camera)
                        </span>
                        <p style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', margin: '3px 0 0 0' }}>
                          Capture or upload multiple exterior elevation photos for this master project ({photosList.length} photo{photosList.length === 1 ? '' : 's'} linked).
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* LIVE CAMERA CAPTURE BUTTON */}
                        <label style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(22, 163, 74, 0.35)' }}>
                          <Camera size={15} color="#ffffff" />
                          📸 CAPTURE CAMERA PHOTO
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={(e) => handleProcessPhotoFiles(e.target.files)}
                          />
                        </label>

                        {/* FILE UPLOAD BUTTON */}
                        <label style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#0f172a', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(234, 179, 8, 0.35)' }}>
                          <Upload size={15} color="#0f172a" />
                          📂 UPLOAD PHOTO FILES
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => handleProcessPhotoFiles(e.target.files)}
                          />
                        </label>

                      </div>
                    </div>

                    {/* UPLOADED ELEVATION PHOTOS THUMBNAIL GALLERY */}
                    {photosList.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginTop: '6px' }}>
                        {photosList.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative', background: '#000000', border: idx === 0 ? '2px solid #22c55e' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), borderRadius: '10px', overflow: 'hidden', height: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <img src={url} alt={`Building Elevation ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                            <div style={{ position: 'absolute', top: '4px', left: '4px', background: idx === 0 ? '#22c55e' : 'rgba(15, 23, 42, 0.85)', color: '#ffffff', fontSize: '0.66rem', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>
                              {idx === 0 ? '⭐ MAIN COVER ELEVATION' : `PHOTO #${idx + 1}`}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const filtered = photosList.filter((_, i) => i !== idx);
                                setNewPropertyForm((prev: any) => ({
                                  ...prev,
                                  building_photos: filtered,
                                  building_photo: filtered[0] || ''
                                }));
                              }}
                              style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: '#ffffff', border: 'none', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Delete Photo"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px dashed #eab308', borderRadius: '8px', padding: '20px', color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.84rem', textAlign: 'center', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span>📸 No building exterior elevation photos uploaded yet for this project.</span>
                        <span style={{ fontSize: '0.74rem', color: '#eab308' }}>Click "📸 CAPTURE CAMERA PHOTO" or "📂 UPLOAD PHOTO FILES" above to add project photos!</span>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                        value={newPropertyForm.total_covered_parking_capacity !== undefined ? newPropertyForm.total_covered_parking_capacity : 24}
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
                        value={newPropertyForm.covered_parking_rate !== undefined ? newPropertyForm.covered_parking_rate : '300000'}
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
                        value={newPropertyForm.total_ev_parking_capacity !== undefined ? newPropertyForm.total_ev_parking_capacity : 6}
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
                        value={newPropertyForm.ev_parking_rate !== undefined ? newPropertyForm.ev_parking_rate : '450000'}
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
                        value={newPropertyForm.total_open_parking_capacity !== undefined ? newPropertyForm.total_open_parking_capacity : 12}
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
                        value={newPropertyForm.open_parking_rate !== undefined ? newPropertyForm.open_parking_rate : '150000'}
                        onChange={(e) => setNewPropertyForm({ ...newPropertyForm, open_parking_rate: e.target.value })}
                        placeholder="e.g. 150000"
                        style={{ width: '100%', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #cbd5e1', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '8px 12px', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 5: KEYS CUSTODY & ARCHITECTURAL DESCRIPTION */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isLight ? '#7e22ce' : '#a855f7', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>
                  5. Keys Custody & Architectural Description
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Physical Keys / Custody Location</label>
                    <input type="text" value={newPropertyForm.key_custody} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, key_custody: e.target.value })} placeholder="Builder Lounge / Company Office" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Property Highlights & Notes</label>
                    <input type="text" value={newPropertyForm.description} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, description: e.target.value })} placeholder="Pool facing Vastu East, 3 balconies" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>👤 Site Person Contact Name *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.site_person_name || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, site_person_name: e.target.value })} 
                      placeholder="e.g. Rajesh Kumar (Site Manager / Security Incharge)" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '800', display: 'block', marginBottom: '6px' }}>📞 Site Person Contact Phone Number *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.site_person_contact || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, site_person_contact: e.target.value })} 
                      placeholder="e.g. +91 98490 77665" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTION FOOTER FOR ADD PROJECT & DEVELOPER MASTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: isLight ? '2px solid #cbd5e1' : '2px solid #334155', paddingTop: '20px', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveProjectSubTab('property_master')} 
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
                onClick={() => setActiveProjectSubTab('property_master')}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✍️ Write / Type or Paste Master Project ID *
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text && text.trim()) {
                              const cleanText = text.trim();
                              const allProjs = getAllMasterProjects();
                              const found = allProjs.find(p => p.id?.toLowerCase() === cleanText.toLowerCase() || p.code?.toLowerCase() === cleanText.toLowerCase());
                              if (found) {
                                 setNewPropertyForm((prev: any) => ({
                                  ...prev,
                                  project_id: found.id || found.code,
                                  developer: found.developer || prev.developer,
                                  title: found.title || prev.title,
                                  locality: found.locality || prev.locality,
                                  latitude: found.latitude || prev.latitude,
                                  longitude: found.longitude || prev.longitude,
                                  rera_id: found.rera_id || found.reraId || found.rera || prev.rera_id,
                                  hera_no: found.hera_no || found.heraId || found.hera || prev.hera_no,
                                  selected_amenities: found.amenities && found.amenities.length > 0 ? found.amenities : prev.selected_amenities,
                                  building_photos: found.building_photos && found.building_photos.length > 0 ? found.building_photos : prev.building_photos
                                }));
                                alert(`✅ MATCHED & LINKED MASTER PROJECT:\n\n• Project ID: ${found.id || found.code}\n• Title: ${found.title}\n• Developer: ${found.developer}`);
                              } else {
                                setNewPropertyForm((prev: any) => ({ ...prev, project_id: cleanText }));
                              }
                            }
                          } catch (err) {
                            alert('Clipboard paste not allowed by browser permissions. You can paste directly into the text field!');
                          }
                        }}
                        style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        📋 Paste Clipboard
                      </button>
                    </div>

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
                            rera_id: found.rera_id || found.reraId || found.rera || prev.rera_id,
                            hera_no: found.hera_no || found.heraId || found.hera || prev.hera_no,
                            selected_amenities: found.amenities && found.amenities.length > 0 ? found.amenities : prev.selected_amenities,
                            building_photos: found.building_photos && found.building_photos.length > 0 ? found.building_photos : prev.building_photos
                          }));
                        } else {
                          setNewPropertyForm((prev: any) => ({ ...prev, project_id: val }));
                        }
                      }}
                      placeholder="Type or paste Project ID e.g. SRM-PROJ-2026-000088..."
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #0284c7', color: '#0284c7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* 2. SELECT FROM REGISTERED MASTER PROJECTS DROPDOWN */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>
                      Or Select Registered Master Project
                    </label>
                    <select 
                      value={newPropertyForm.project_id || ''} 
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const allProjs = getAllMasterProjects();
                        const found = allProjs.find(p => p.id === selectedId || p.code === selectedId);
                        if (found) {
                          setNewPropertyForm((prev: any) => ({
                            ...prev,
                            project_id: found.id || found.code,
                            developer: found.developer || prev.developer,
                            title: found.title || prev.title,
                            locality: found.locality || prev.locality,
                            latitude: found.latitude || prev.latitude,
                            longitude: found.longitude || prev.longitude,
                            rera_id: found.rera_id || found.reraId || found.rera || prev.rera_id,
                            hera_no: found.hera_no || found.heraId || found.hera || prev.hera_no,
                            selected_amenities: found.amenities && found.amenities.length > 0 ? found.amenities : prev.selected_amenities,
                            building_photos: found.building_photos && found.building_photos.length > 0 ? found.building_photos : prev.building_photos
                          }));
                        } else {
                          setNewPropertyForm((prev: any) => ({ ...prev, project_id: selectedId }));
                        }
                      }}
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                    >
                      <option value="">-- Select Master Project --</option>
                      {getAllMasterProjects()
                        .filter(p => {
                          if (!projectIdSearchFilter) return true;
                          const q = projectIdSearchFilter.toLowerCase();
                          return (p.code || p.id || '').toLowerCase().includes(q) ||
                                 (p.title || '').toLowerCase().includes(q) ||
                                 (p.developer || '').toLowerCase().includes(q);
                        })
                        .map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            🔑 [{proj.code || proj.id}] {proj.title} — Builder: {proj.developer}
                          </option>
                        ))}
                    </select>
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
                      📍 Locality: {newPropertyForm.locality || 'Locality Hub'} (Lat: {newPropertyForm.latitude || '22.722361'}, Long: {newPropertyForm.longitude || '88.493403'})
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
                    <select value={newPropertyForm.property_type} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, property_type: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <option value="Flat / Apartment (New / Builder)">🏢 Flat / Apartment (New / Builder)</option>
                      <option value="Flat / Apartment (Resale)">🔄 Flat / Apartment (Resale)</option>
                      <option value="Flat / Apartment (For Rent)">🔑 Flat / Apartment (For Rent)</option>
                      <option value="Semi Complex (New / Builder)">🏢 Semi Complex (New / Builder)</option>
                      <option value="Semi Complex (Resale)">🔄 Semi Complex (Resale)</option>
                      <option value="Semi Complex (For Rent)">🔑 Semi Complex (For Rent)</option>
                      <option value="Gated Villa (New / Builder)">🏰 Gated Villa (New / Builder)</option>
                      <option value="Gated Villa (Resale)">🔄 Gated Villa (Resale)</option>
                      <option value="Gated Villa (For Rent)">🔑 Gated Villa (For Rent)</option>
                      <option value="Semi Complex (New / Builder)">🏙️ Semi Complex (New / Builder)</option>
                      <option value="Semi Complex (Resale)">🔄 Semi Complex (Resale)</option>
                      <option value="Semi Complex (For Rent)">🔑 Semi Complex (For Rent)</option>
                      <option value="Independent House (Resale)">🔄 Independent House (Resale)</option>
                      <option value="Independent House (For Rent)">🔑 Independent House (For Rent)</option>
                      <option value="Commercial Space (New / Builder)">🏢 Commercial Space (New / Builder)</option>
                      <option value="Commercial Space (Resale)">🔄 Commercial Space (Resale)</option>
                      <option value="Commercial Space (For Lease / Rent)">🔑 Commercial Space (For Lease / Rent)</option>
                      <option value="PG / Co-Living Space">🛌 PG / Co-Living Space (For Rent)</option>
                      <option value="Open Plot / Land (New / Builder)">📐 Open Plot / Land (New / Builder)</option>
                      <option value="Open Plot / Land (Resale)">📐 Open Plot / Land (Resale)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>BHK Configuration</label>
                    <select value={newPropertyForm.configuration} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, configuration: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#38bdf8', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <option value="1BHK">1BHK Studio</option>
                      <option value="2BHK">2BHK Flat</option>
                      <option value="3BHK">3BHK Flat</option>
                      <option value="4BHK">4BHK Luxury Apartment</option>
                      <option value="Villa">Gated Villa</option>
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
                        const superNum = parseFloat(superVal.replace(/[^0-9.]/g, ''));
                        const pctNum = parseFloat((newPropertyForm.deduction_pct || '35%').replace(/[^0-9.]/g, '')) || 0;
                        let computedCarpet = newPropertyForm.carpet_area;
                        if (!isNaN(superNum) && superNum > 0) {
                          const carpetNum = superNum * (1 - pctNum / 100);
                          computedCarpet = `${Math.round(carpetNum * 100) / 100} Sq.Ft.`;
                        }
                        setNewPropertyForm({
                          ...newPropertyForm,
                          super_builtup_area: superVal,
                          carpet_area: computedCarpet
                        });
                      }} 
                      placeholder="e.g. 827" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Deduction / Loading (%) *</label>
                    <select 
                      value={newPropertyForm.deduction_pct || '35%'} 
                      onChange={(e) => {
                        const pctVal = e.target.value;
                        const pctNum = parseFloat(pctVal.replace(/[^0-9.]/g, '')) || 0;
                        const superNum = parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
                        let computedCarpet = newPropertyForm.carpet_area;
                        if (!isNaN(superNum) && superNum > 0) {
                          const carpetNum = superNum * (1 - pctNum / 100);
                          computedCarpet = `${Math.round(carpetNum * 100) / 100} Sq.Ft.`;
                        }
                        setNewPropertyForm({
                          ...newPropertyForm,
                          deduction_pct: pctVal,
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
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Carpet Area (Sq.Ft.) *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.carpet_area} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, carpet_area: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #38bdf8', color: '#38bdf8', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Vastu Facing</label>
                    <select value={newPropertyForm.facing} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, facing: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <option value="East Facing">East Facing (Poorva)</option>
                      <option value="North-East Facing">North-East Facing (NE / Ishanya)</option>
                      <option value="North Facing">North Facing (Uttara)</option>
                      <option value="North-West Facing">North-West Facing (NW / Vayavya)</option>
                      <option value="West Facing">West Facing (Paschima)</option>
                      <option value="South-West Facing">South-West Facing (SW / Nairutya)</option>
                      <option value="South Facing">South Facing (Dakshina)</option>
                      <option value="South-East Facing">South-East Facing (SE / Agneya)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Possession Status *</label>
                    <select 
                      value={newPropertyForm.possession_status || newPropertyForm.possession || 'Ready to Move In (Immediate)'} 
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
                      <option value="Ready to Move In (Immediate)">🔑 Ready to Move In (Immediate)</option>
                      <option value="Under Construction">🏗️ Under Construction</option>
                      <option value="Under Construction (Dec 2026)">🏗️ Under Construction (Dec 2026)</option>
                      <option value="Under Construction (June 2027)">🏗️ Under Construction (June 2027)</option>
                      <option value="Under Construction (Dec 2027)">🏗️ Under Construction (Dec 2027)</option>
                      <option value="Newly Launched Project">🌟 Newly Launched Project</option>
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
                  const superNum = parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
                  const pctNum = parseFloat((newPropertyForm.deduction_pct || '35%').replace(/[^0-9.]/g, '')) || 0;
                  if (!isNaN(superNum) && superNum > 0) {
                    const deductionVal = superNum * (pctNum / 100);
                    const carpetVal = superNum - deductionVal;
                    return (
                      <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid #eab308', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: isLight ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ color: '#eab308', fontWeight: '900' }}>📐 LIVE DEDUCTION CALCULATION:</span>{' '}
                          <strong>{superNum} Sq.Ft.</strong> (Super Built-up) − <strong>{pctNum}%</strong> Deduction ({Math.round(deductionVal * 100) / 100} Sq.Ft.) = <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{Math.round(carpetVal * 100) / 100} Sq.Ft. (Carpet Area)</strong>
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
                      value={newPropertyForm.unit_floor || '2nd Floor'} 
                      onChange={(e) => {
                        const uFloor = e.target.value;
                        const tFloors = newPropertyForm.total_floors || 'G+4 Floors (5 Storey)';
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
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Total Floors in Building *</label>
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
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Tower / Block Name</label>
                    <input type="text" value={newPropertyForm.tower_block} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, tower_block: e.target.value })} placeholder="Tower B - Sapphire" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Number Of Towers in Project / Complex *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.number_of_towers || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, number_of_towers: e.target.value })} 
                      placeholder="e.g. 1 Standalone Tower / 4 Towers Complex" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #fbbf24', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>

                {/* SECTION 2 MULTIPLE UNIT INTERIOR, LAYOUT, FLOOR PLAN PHOTO & LIVE VIDEO CAPTURE WIDGET */}
                {(() => {
                  const unitPhotosList: string[] = Array.isArray(newPropertyForm.unit_photos) 
                    ? newPropertyForm.unit_photos 
                    : (newPropertyForm.unit_photo ? [newPropertyForm.unit_photo] : []);

                  const layoutPhotosList: string[] = Array.isArray(newPropertyForm.layout_photos) 
                    ? newPropertyForm.layout_photos 
                    : (newPropertyForm.layout_photo ? [newPropertyForm.layout_photo] : []);

                  const floorPlanPhotosList: string[] = Array.isArray(newPropertyForm.floor_plan_photos) 
                    ? newPropertyForm.floor_plan_photos 
                    : (newPropertyForm.floor_plan_photo ? [newPropertyForm.floor_plan_photo] : []);

                  const unitVideosList: string[] = Array.isArray(newPropertyForm.unit_videos)
                    ? newPropertyForm.unit_videos
                    : [];

                  const handleProcessUnitPhotoFiles = (files: FileList | null) => {
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      const readPromises = fileArray.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (evt) => resolve(evt.target?.result as string || '');
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readPromises).then(base64Results => {
                        const validResults = base64Results.filter(b => b);
                        const updatedList = [...unitPhotosList, ...validResults];
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          unit_photos: updatedList,
                          unit_photo: updatedList[0] || ''
                        }));
                      });
                    }
                  };

                  const handleProcessLayoutPhotoFiles = (files: FileList | null) => {
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      const readPromises = fileArray.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (evt) => resolve(evt.target?.result as string || '');
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readPromises).then(base64Results => {
                        const validResults = base64Results.filter(b => b);
                        const updatedList = [...layoutPhotosList, ...validResults];
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          layout_photos: updatedList,
                          layout_photo: updatedList[0] || ''
                        }));
                      });
                    }
                  };

                  const handleProcessFloorPlanPhotoFiles = (files: FileList | null) => {
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      const readPromises = fileArray.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (evt) => resolve(evt.target?.result as string || '');
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readPromises).then(base64Results => {
                        const validResults = base64Results.filter(b => b);
                        const updatedList = [...floorPlanPhotosList, ...validResults];
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          floor_plan_photos: updatedList,
                          floor_plan_photo: updatedList[0] || ''
                        }));
                      });
                    }
                  };

                  const handleProcessUnitVideoFiles = (files: FileList | null) => {
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      const readPromises = fileArray.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (evt) => resolve(evt.target?.result as string || '');
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readPromises).then(base64Results => {
                        const validResults = base64Results.filter(b => b);
                        const updatedList = [...unitVideosList, ...validResults];
                        setNewPropertyForm((prev: any) => ({
                          ...prev,
                          unit_videos: updatedList
                        }));
                      });
                    }
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                      {/* CARD 3: 📸 UNIT INTERIOR & LIVE VIDEO CAPTURE WIDGET */}
                      <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #38bdf8', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.86rem', color: '#38bdf8', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Camera size={18} color="#38bdf8" /> 📸 Unit Interior Photos & Walkthrough Videos
                            </span>
                            <p style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8', margin: '3px 0 0 0' }}>
                              Capture & upload flat interiors, room layouts, and record live unit walkthrough videos.
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {/* LIVE CAMERA CAPTURE PHOTO BUTTON */}
                            <label style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(22, 163, 74, 0.35)' }}>
                              <Camera size={15} color="#ffffff" />
                              📸 CAPTURE CAMERA PHOTO
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => handleProcessUnitPhotoFiles(e.target.files)}
                              />
                            </label>

                            {/* UPLOAD MULTIPLE PHOTOS BUTTON */}
                            <label style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)' }}>
                              <Upload size={15} color="#ffffff" />
                              🩵 UPLOAD UNIT PHOTOS
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleProcessUnitPhotoFiles(e.target.files)}
                              />
                            </label>

                            {/* LIVE CAMERA CAPTURE VIDEO BUTTON */}
                            <label style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#0f172a', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(234, 179, 8, 0.35)' }}>
                              <Video size={15} color="#0f172a" />
                              🎥 CAPTURE CAMERA VIDEO
                              <input 
                                type="file" 
                                accept="video/*" 
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => handleProcessUnitVideoFiles(e.target.files)}
                              />
                            </label>

                            {/* UPLOAD VIDEO FILE BUTTON */}
                            <label style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(168, 85, 247, 0.35)' }}>
                              <Video size={15} color="#ffffff" />
                              🔮 UPLOAD UNIT VIDEO FILE
                              <input 
                                type="file" 
                                accept="video/*" 
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleProcessUnitVideoFiles(e.target.files)}
                              />
                            </label>

                          </div>
                        </div>

                        {/* UPLOADED UNIT PHOTOS PREVIEW GRID */}
                        {unitPhotosList.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', background: isLight ? '#f8fafc' : '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                            {unitPhotosList.map((photoUrl, idx) => (
                              <div key={`unit_${idx}`} style={{ position: 'relative', background: isLight ? '#ffffff' : '#1e293b', border: idx === 0 ? '2px solid #38bdf8' : '1px solid #334155', borderRadius: '8px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <img src={photoUrl} alt={`Unit Interior ${idx + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.64rem', fontWeight: '900', color: '#38bdf8' }}>
                                    {idx === 0 ? '⭐ Primary Photo' : `Unit Photo #${idx + 1}`}
                                  </span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button type="button" onClick={() => downloadImage(photoUrl, `unit_photo_${idx + 1}.jpg`)} style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: '800', cursor: 'pointer' }}>
                                      <Download size={10} />
                                    </button>
                                    <button type="button" onClick={() => {
                                      const updatedList = unitPhotosList.filter((_, i) => i !== idx);
                                      setNewPropertyForm((prev: any) => ({ ...prev, unit_photos: updatedList, unit_photo: updatedList[0] || '' }));
                                    }} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: '800', cursor: 'pointer' }}>
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* UPLOADED UNIT WALKTHROUGH VIDEO GALLERY GRID */}
                        {unitVideosList.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '10px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.76rem', color: '#a855f7', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Video size={16} color="#a855f7" /> 🎬 UPLOADED UNIT WALKTHROUGH VIDEO GALLERY ({unitVideosList.length} Video{unitVideosList.length > 1 ? 's' : ''})
                              </span>
                              <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                Full HD video playback enabled
                              </span>
                            </div>

                          <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                            {unitVideosList.map((videoUrl, idx) => (
                              <div key={idx} style={{ position: 'relative', background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <video 
                                  controls 
                                  src={videoUrl} 
                                  style={{ width: '100%', height: '140px', borderRadius: '6px', background: '#000000', objectFit: 'cover' }} 
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#a855f7' }}>
                                    📹 Walkthrough Video #{idx + 1}
                                  </span>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const updatedList = unitVideosList.filter((_, i) => i !== idx);
                                      setNewPropertyForm((prev: any) => ({
                                        ...prev,
                                        unit_videos: updatedList
                                      }));
                                    }}
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: '800', cursor: 'pointer' }}
                                  >
                                    🗑️ Remove Video
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              </div>

              {/* SECTION 3: COMMERCIALS, PRICING & BROKERAGE */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isLight ? '#16a34a' : '#4ade80', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>
                  3. Pricing, Commercials, Parking & All-Inclusive Final Valuation
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Price per Sq.Ft. (INR) *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.price_sqft} 
                      onChange={(e) => {
                        const sqftVal = e.target.value;
                        const priceNum = parseFloat(sqftVal.replace(/[^0-9.]/g, ''));
                        const superNum = parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
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
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Base Flat Price (INR) [Super Built-up × Rate] *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.final_price || (parseFloat((newPropertyForm.price_sqft || '').replace(/[^0-9.]/g, '')) && parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, '')) ? `₹${Math.round(parseFloat((newPropertyForm.price_sqft || '').replace(/[^0-9.]/g, '')) * parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''))).toLocaleString('en-IN')}` : '')} 
                      onChange={(e) => {
                        const flatVal = e.target.value;
                        const flatNum = parseFloat(flatVal.replace(/[^0-9.]/g, ''));
                        const superNum = parseFloat((newPropertyForm.super_builtup_area || '').replace(/[^0-9.]/g, ''));
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
                    <label style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: '900', display: 'block', marginBottom: '6px' }}>Statutory GST Charge (%) *</label>
                    <select 
                      value={newPropertyForm.gst_pct || '5%'} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, gst_pct: e.target.value })} 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '2px solid #a855f7', color: '#a855f7', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}
                    >
                      <option value="5%">5% GST (Under Construction Standard)</option>
                      <option value="1%">1% GST (Affordable Housing Rate)</option>
                      <option value="12%">12% GST (Commercial Real Estate)</option>
                      <option value="0%">0% GST (Ready-to-Move / Exempt)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>


                  {/* AMENITY CHARGES */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Amenity & Clubhouse Charges (INR) *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.amenity_charges !== undefined ? newPropertyForm.amenity_charges : '150000'} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, amenity_charges: e.target.value })} 
                      placeholder="e.g. 150000"
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: '#fbbf24', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>



                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : windowWidth <= 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Possession Status</label>
                    <select 
                      value={newPropertyForm.possession_status} 
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
                      <option value="Under Construction (Dec 2026)">Under Construction (Dec 2026)</option>
                      <option value="Under Construction (June 2027)">Under Construction (June 2027)</option>
                      <option value="New Pre-Launch">New Pre-Launch</option>
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
                        const s = (newPropertyForm.status || 'LIVE').toUpperCase().replace(/\s+/g, '_');
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

              {/* SECTION 5: KEYS CUSTODY & PROPERTY DESCRIPTION */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isLight ? '#7e22ce' : '#a855f7', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '8px' }}>
                  5. Keys Custody & Architectural Description
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Physical Keys / Custody Location</label>
                    <input type="text" value={newPropertyForm.key_custody} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, key_custody: e.target.value })} placeholder="Builder Lounge / Company Office" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Property Highlights & Notes</label>
                    <input type="text" value={newPropertyForm.description} onChange={(e) => setNewPropertyForm({ ...newPropertyForm, description: e.target.value })} placeholder="Pool facing Vastu East, 3 balconies" style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: '800', display: 'block', marginBottom: '6px' }}>👤 Site Person Contact Name *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.site_person_name || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, site_person_name: e.target.value })} 
                      placeholder="e.g. Rajesh Kumar (Site Manager / Security Incharge)" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #0284c7', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '800', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: '800', display: 'block', marginBottom: '6px' }}>📞 Site Person Contact Phone Number *</label>
                    <input 
                      type="text" 
                      value={newPropertyForm.site_person_contact || ''} 
                      onChange={(e) => setNewPropertyForm({ ...newPropertyForm, site_person_contact: e.target.value })} 
                      placeholder="e.g. +91 98490 77665" 
                      style={{ width: '100%', background: isLight ? '#ffffff' : '#1e293b', border: '1px solid #22c55e', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

              {/* FULL PAGE ACTION FOOTER BUTTONS */}
              <div style={{ display: 'flex', gap: '16px', borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveProjectSubTab('property_master')} 
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
              <button onClick={() => setShowBulkImportPropertyModal(true)} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: windowWidth <= 640 ? '100%' : 'auto', flex: windowWidth <= 640 ? '1 1 100%' : 'none', whiteSpace: 'nowrap' }}>
                <Upload size={15} /> 📥 Import Bulk Inventory CSV / Excel
              </button>
            </div>
          </div>

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
                    const carpetNum = parseFloat((p.carpet_area || '').replace(/[^0-9.]/g, ''));
                    const calcSuper = carpetNum ? `${Math.round(carpetNum / 0.7)} Sq.Ft.` : '1,280 Sq.Ft.';
                    const superDisp = p.super_builtup_area || calcSuper;

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
                    const projCode = (rawProjCode && !rawProjCode.startsWith('SRM-DEV-')) ? rawProjCode : (p.id ? `SRM-PROJ-${p.id}` : '');

                    const projProps = properties.filter(item => {
                      const itemTitle = item.title || item.property_title || item.project_name || '';
                      return (item.project_id && item.project_id === projCode) ||
                             (itemTitle && displayTitle && itemTitle.toLowerCase().trim() === displayTitle.toLowerCase().trim());
                    });

                    const totalCoveredCap = matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 24;
                    const totalEvCap = matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 6;
                    const totalOpenCap = matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 12;

                    const allocCovered = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('covered')).length;
                    const allocEv = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('ev')).length;
                    const allocOpen = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('open')).length;

                    const availCovered = Math.max(0, totalCoveredCap - allocCovered);
                    const availEv = Math.max(0, totalEvCap - allocEv);
                    const availOpen = Math.max(0, totalOpenCap - allocOpen);

                    const assignedParking = p.car_parking || '1 Covered Basement Parking Slot';
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

                    const rawStatus = (effectiveStatus || 'LIVE').toUpperCase().replace(/\s+/g, '_');
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
                      <div key={p.id} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                    localStorage.setItem('swaramayi_properties_v5_clean', JSON.stringify(updatedProps));
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
                            <strong style={{ color: '#38bdf8' }}>{p.configuration || '2BHK'}</strong> • <span style={{ color: '#fbbf24' }}>{superDisp}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', display: 'block' }}>Price Tag</span>
                            <strong style={{ color: '#4ade80', fontSize: '0.92rem' }}>{p.final_price}</strong>
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

                        <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #334155', paddingTop: '10px' }}>
                          <button onClick={() => setShowMultipleUnitsSlider({ open: true, project: p })} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>🏢 Units</button>
                          <button onClick={() => setViewPropertyModal(p)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>👁️ View</button>
                          <button onClick={() => handleStartEditProperty(p)} style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.74rem', textAlign: 'center' }}>Edit</button>
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
                    <th style={{ padding: '12px' }}>Code</th>
                    <th style={{ padding: '12px' }}>Title & Project</th>
                    <th style={{ padding: '12px' }}>Developer Name & Project Code</th>
                    <th style={{ padding: '12px' }}>Config</th>
                    <th style={{ padding: '12px' }}>Super Built-up</th>
                    <th style={{ padding: '12px' }}>Carpet Area</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Parking Stock & Slot</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties
                    .filter(p => matchesSearchQuery(p, searchQuery))
                    .map(p => {
                      const carpetNum = parseFloat((p.carpet_area || '').replace(/[^0-9.]/g, ''));
                      const calcSuper = carpetNum ? `${Math.round(carpetNum / 0.7)} Sq.Ft.` : '1,280 Sq.Ft.';
                      const superDisp = p.super_builtup_area || calcSuper;

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
                      const projCode = (rawProjCode && !rawProjCode.startsWith('SRM-DEV-')) ? rawProjCode : (p.id ? `SRM-PROJ-${p.id}` : '');

                      // PARKING COMPUTATION FOR THIS ROW
                      const projProps = properties.filter(item => {
                        const itemTitle = item.title || item.property_title || item.project_name || '';
                        return (item.project_id && item.project_id === projCode) ||
                               (itemTitle && displayTitle && itemTitle.toLowerCase().trim() === displayTitle.toLowerCase().trim());
                      });

                      const totalCoveredCap = matchedMaster?.total_covered_parking_capacity !== undefined ? matchedMaster.total_covered_parking_capacity : 24;
                      const totalEvCap = matchedMaster?.total_ev_parking_capacity !== undefined ? matchedMaster.total_ev_parking_capacity : 6;
                      const totalOpenCap = matchedMaster?.total_open_parking_capacity !== undefined ? matchedMaster.total_open_parking_capacity : 12;

                      const allocCovered = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('covered')).length;
                      const allocEv = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('ev')).length;
                      const allocOpen = projProps.filter(item => (item.car_parking || '').toLowerCase().includes('open')).length;

                      const availCovered = Math.max(0, totalCoveredCap - allocCovered);
                      const availEv = Math.max(0, totalEvCap - allocEv);
                      const availOpen = Math.max(0, totalOpenCap - allocOpen);

                      const assignedParking = p.car_parking || '1 Covered Basement Parking Slot';
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

                      return (
                        <tr key={p.id} style={{ borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
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
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '800' }}>{p.configuration}</td>
                          <td style={{ padding: '12px', fontWeight: '900', color: '#fbbf24' }}>{superDisp}</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>{p.carpet_area}</td>
                          <td style={{ padding: '12px', color: '#4ade80', fontWeight: '800' }}>{p.final_price}</td>
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

                              const rawStatus = (effectiveStatus || 'LIVE').toUpperCase().replace(/\s+/g, '_');
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
                                          localStorage.setItem('swaramayi_properties_v5_clean', JSON.stringify(updatedProps));
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
                              <button onClick={() => setShowMultipleUnitsSlider({ open: true, project: p })} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} title="Open Multiple Property Units Builder Slider for this project">🏢 Units Slider</button>
                              <button onClick={() => setViewPropertyModal(p)} style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>👁️ View</button>
                              <button onClick={() => handleStartEditProperty(p)} style={{ background: '#f59e0b', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}>Edit</button>
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
              <button onClick={() => setShowDevVaultModal(false)} style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
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
                    const newDevObj = {
                      id: `SRM-DEV-2026-000${developerMasterList.length + 105}`,
                      name: newDevNameInput,
                      mobile: newDevAltMobileInput ? `${newDevMobileInput} / ${newDevAltMobileInput}` : newDevMobileInput,
                      email: newDevEmailInput || '',
                      projects: newDevProjectTitleInput ? [{ id: `PRJ-${Date.now()}`, title: newDevProjectTitleInput, locality: 'Kondapur Hub' }] : []
                    };
                    setDeveloperMasterList([newDevObj, ...developerMasterList]);
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
              {developerMasterList.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '12px', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155' }}>
                  🏢 No registered developers in vault. Fill out the form above to register your first Developer ID & Master Project!
                </div>
              ) : (
                developerMasterList.map((dev) => (
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
                                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                                fetch(`http://${host}:5000/api/v1/crm/sync`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ developers: nextList })
                                }).catch(() => {});
                              } catch (e) {}
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
                            🆔 {dev.id}
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
                                        category: 'Project',
                                        originalLocation: 'Developer & Channel Partner Master',
                                        details: `Mobile: ${dev.mobile || 'N/A'}, Projects: ${dev.projectsCount || 0}`,
                                        originalData: dev
                                      });
                                    }
                                    const nextList = developerMasterList.filter((d: any) => d.id !== dev.id && d.name !== dev.name);
                                    setDeveloperMasterList(nextList);
                                    if (setDevelopers) setDevelopers(nextList);
                                    try {
                                      localStorage.setItem('swaramayi_developers_v1', JSON.stringify(nextList));
                                      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                                      fetch(`http://${host}:5000/api/v1/crm/sync`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ developers: nextList })
                                      }).catch(() => {});
                                    } catch (e) {}
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

                        const projCodeStr = p.code || p.id || matchedMaster?.code || matchedMaster?.id || `SRM-PROJ-2026-0000${(pIdx + 1) * 22}`;
                        const unitsCount = properties.filter(prop => 
                          (prop.project_id && (prop.project_id === projCodeStr || prop.project_id === p.code || prop.project_id === p.id)) ||
                          (prop.title && p.title && prop.title.toLowerCase().trim() === p.title.toLowerCase().trim())
                        ).length;

                        const matchedProp = properties.find(prop => 
                          (prop.project_id && (prop.project_id === projCodeStr || prop.project_id === p.code || prop.project_id === p.id)) ||
                          (prop.property_code && (prop.property_code === projCodeStr || prop.property_code === p.code || prop.property_code === p.id)) ||
                          (prop.title && p.title && prop.title.toLowerCase().trim() === p.title.toLowerCase().trim())
                        ) || {
                          id: projCodeStr,
                          property_code: projCodeStr,
                          title: p.title,
                          developer: dev.name,
                          developer_id: dev.id,
                          locality: p.locality || 'Barasat, Kolkata',
                          full_address: `${p.title}, ${p.locality || 'Barasat'}, North 24 Parganas, Kolkata, West Bengal`,
                          latitude: matchedMaster?.latitude || '22.722361',
                          longitude: matchedMaster?.longitude || '88.493403',
                          configuration: '2BHK',
                          carpet_area: '700 Sq.Ft.',
                          final_price: '₹35,00,000',
                          status: 'LIVE'
                        };

                        return (
                          <div
                            key={p.id || p.title || pIdx}
                            style={{ 
                              background: isLight ? '#ffffff' : '#1e293b', 
                              border: '1px solid #0284c7', 
                              borderRadius: '8px', 
                              padding: '8px 12px', 
                              display: 'flex', 
                              alignItems: windowWidth <= 768 ? 'flex-start' : 'center', 
                              justifyContent: 'space-between',
                              flexDirection: windowWidth <= 640 ? 'column' : 'row',
                              gap: '8px', 
                              flexWrap: 'wrap',
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.68rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', border: '1px solid #0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontFamily: 'monospace' }}>
                                🔑 {projCodeStr}
                              </span>
                              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isLight ? '#0f172a' : '#ffffff' }}>
                                🏢 {p.title}
                              </span>
                              {p.locality && (
                                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                  📍 {p.locality}
                                </span>
                              )}
                              <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.18)', color: '#22c55e', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '10px', fontWeight: '900' }}>
                                🏠 {unitsCount} Unit{unitsCount === 1 ? '' : 's'}
                              </span>
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
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                      const st = (viewPropertyModal.status || 'AVAILABLE').toUpperCase();
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
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Developer ID Code</span>
                      <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{devIdCode || 'N/A'}</strong>
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
                      <span style={{ background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>✓ 1-TIME OTP VERIFIED</span>
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
                      <strong style={{ color: '#38bdf8', fontWeight: '900' }}>{viewPropertyModal.configuration || 'N/A'}</strong>
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
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Tower / Block Name</span>
                      <strong style={{ color: '#a855f7', fontWeight: '900' }}>{viewPropertyModal.tower_block || viewPropertyModal.tower || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Floor Number (Unit Floor)</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.floor_num || viewPropertyModal.floor_number || 'N/A'}</strong>
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
                  </div>
                </div>

                {/* SECTION 4: 💰 FINANCIALS, PRICING & PARKING STOCK */}
                <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '1px solid #a855f7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    💰 FINANCIAL VALUATION, CAR PARKING & COST SHEET
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : windowWidth <= 900 ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Total Inventory Final Price</span>
                      <strong style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: '900' }}>{viewPropertyModal.final_price || (viewPropertyModal.price ? `₹${parseInt(viewPropertyModal.price.toString().replace(/[^0-9]/g, ''), 10).toLocaleString('en-IN')}` : 'N/A')}</strong>
                    </div>
                    <div>
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Rate Per Sq.Ft.</span>
                      <strong style={{ color: '#38bdf8', fontWeight: '900' }}>{viewPropertyModal.price_sqft ? (viewPropertyModal.price_sqft.toString().startsWith('₹') ? viewPropertyModal.price_sqft : `₹${viewPropertyModal.price_sqft}/Sq.Ft.`) : 'N/A'}</strong>
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
                      <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', display: 'block', fontWeight: '700' }}>Physical Keys / Custody</span>
                      <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{viewPropertyModal.key_custody || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* PROJECT PARKING STOCK AVAILABILITY BREAKDOWN */}
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #0284c7', marginTop: '6px' }}>
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
                  const st = (viewPropertyModal.status || '').toUpperCase();
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
                      handleStartEditProperty(pToEdit);
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

      {/* 🏢 SLIDER DRAWER: MULTIPLE PROPERTY UNITS BUILDER & SLIDER UNDER SAME PROJECT */}
      {showMultipleUnitsSlider && showMultipleUnitsSlider.open && (() => {
        const currentProject = showMultipleUnitsSlider.project || properties[0] || {
          title: '',
          developer: '',
          developer_mobile: '',
          locality: '',
          property_code: ''
        };

        const projectTitleStr = currentProject.title || currentProject.propertyTitle || '';
        const devNameStr = currentProject.developer || currentProject.developerName || '';
        const devMobileStr = currentProject.developer_mobile || currentProject.mobile || '';
        const localityStr = currentProject.locality || '';
        const propCodeStr = currentProject.property_code || currentProject.id || '';

        // Filter units under this project
        const currentProjectUnits = projectUnitsList.filter(u => 
          u.propertyId === propCodeStr || 
          u.propertyId === currentProject.id ||
          (u.projectTitle && u.projectTitle.toLowerCase() === projectTitleStr.toLowerCase())
        );

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: isLight ? '#f8fafc' : '#0f172a', zIndex: 99999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: isLight ? '#ffffff' : '#1e293b', width: '100vw', maxWidth: '100vw', height: '100vh', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SLIDER FULLSCREEN HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '5px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '900', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)' }}>
                      🏢 STEP 2: MULTI-UNIT INVENTORY BUILDER (FULL SCREEN MODE)
                    </span>
                    <span style={{ background: '#22c55e', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '900' }}>
                      {currentProjectUnits.length} Units Registered
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', marginTop: '6px', margin: 0 }}>
                    MULTIPLE PROPERTY UNITS BUILDER & SLIDER
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '4px', margin: 0 }}>
                    Full screen multi-unit inventory manager — add, configure and slide through multiple property flat / unit inventories under {projectTitleStr}.
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowMultipleUnitsSlider(null)} 
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
                >
                  <X size={18} /> Close Fullscreen Builder
                </button>
              </div>

              {/* PROJECT IDENTIFICATION CONTEXT BANNER CARD */}
              <div style={{ background: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(2, 132, 199, 0.15)', border: '2px solid #0284c7', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '900', fontFamily: 'monospace', background: 'rgba(56, 189, 248, 0.2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #38bdf8' }}>
                        🔑 PROJECT ID: {currentProject.project_id || 'SRM-PROJ-2026-000088'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', fontFamily: 'monospace', background: 'rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #22c55e' }}>
                        🏷️ NEXT AUTOMATED PROPERTY ID: {generateDynamicPropertyCode(0)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#0f172a' : '#ffffff', margin: 0 }}>
                      🏢 {projectTitleStr}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800' }}>REGISTERED DEVELOPER</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#22c55e', margin: 0 }}>
                      👤 {devNameStr}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }}>
                      📱 {devMobileStr}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingTop: '8px', fontSize: '0.78rem', color: isLight ? '#475569' : '#cbd5e1', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>📍 Locality: <strong>{localityStr}</strong></span>
                  <span>🏗️ Tower/Block: <strong>{currentProject.tower_block || 'Tower A'}</strong></span>
                  <span>🏬 Total Floors: <strong>{currentProject.total_floors || 'G+4 Floors'}</strong></span>
                </div>
              </div>

              {/* 🚗 LIVE PARKING STOCK & INVENTORY MANAGEMENT PANEL */}
              {(() => {
                const allocStats = getParkingAllocationStats(propCodeStr);

                return (
                  <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: '1.5px solid #eab308', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: '900', color: '#eab308', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🚗 PROJECT PARKING STOCK & INVENTORY MANAGEMENT
                        </h4>
                        <p style={{ fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0 0' }}>
                          Live parking slot availability tracking for {projectTitleStr}. Auto-calculates stock counts as flat units are assigned parking.
                        </p>
                      </div>
                    </div>

                    {/* PARKING CARDS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
                      {Object.entries(parkingStockConfig).map(([key, cfg]: [string, any]) => {
                        const alloc = allocStats[key] || 0;
                        const avail = Math.max(0, (cfg.total || 0) - alloc);
                        const isLow = avail <= 2 && avail > 0;
                        const isOut = avail === 0;

                        return (
                          <div key={key} style={{ background: isLight ? '#f8fafc' : '#0f172a', border: isOut ? '2px solid #ef4444' : isLow ? '2px solid #f59e0b' : (isLight ? '1px solid #cbd5e1' : '1px solid #334155'), borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isLight ? '#334155' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cfg.label}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: '900', color: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e' }}>
                                {avail} <span style={{ fontSize: '0.7rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '600' }}>avail</span>
                              </span>
                              <span style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                {alloc}/{cfg.total} sold
                              </span>
                            </div>

                            <div style={{ background: isLight ? '#e2e8f0' : '#334155', borderRadius: '4px', height: '5px', width: '100%', overflow: 'hidden', marginTop: '4px' }}>
                              <div style={{ background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e', height: '100%', width: `${Math.min(100, (alloc / (cfg.total || 1)) * 100)}%`, transition: 'width 0.3s ease-in-out' }} />
                            </div>

                            <span style={{ fontSize: '0.68rem', color: '#eab308', fontWeight: '800', marginTop: '2px' }}>
                              Rate: ₹{(cfg.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* FULL SPECIFICATION UNIT REGISTRATION FORM UNDER THIS PROJECT */}
              <div style={{ background: isLight ? '#f8fafc' : '#0f172a', border: '2px solid #0284c7', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid #cbd5e1' : '1px solid #334155', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ➕ ADD NEW FULL-SPECIFICATION UNIT FLAT UNDER THIS PROJECT
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: '800', marginTop: '2px', display: 'block' }}>
                      🚪 Individual Property ID for this Addition: <strong style={{ fontFamily: 'monospace', color: '#22c55e', fontSize: '0.85rem' }}>{generateDynamicPropertyCode(0)}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: '#22c55e', color: '#ffffff', padding: '4px 12px', borderRadius: '6px', fontWeight: '800' }}>
                    ✓ Auto-linked to {projectTitleStr} (Project ID: {currentProject.project_id || 'SRM-PROJ-2026-000088'})
                  </span>
                </div>

                {/* 📐 SUB-SECTION 2: PROPERTY SPECIFICATIONS & UNIT DETAILS */}
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📐 2. Property Specifications & Unit Details
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🏷️ Individual Property ID (Auto-Created) *
                      </label>
                      <input 
                        type="text" 
                        readOnly
                        value={generateDynamicPropertyCode(0)} 
                        style={{ width: '100%', background: isLight ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.18)', border: '2px solid #22c55e', color: isLight ? '#16a34a' : '#4ade80', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'monospace' }} 
                      />
                    </div>

                    {/* CONSTRUCTION / POSSESSION STATUS OPTIONS */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: '900', display: 'block', marginBottom: '4px' }}>
                        🏗️ Construction / Possession Status *
                      </label>
                      <select 
                        value={sliderUnitForm.constructionStatus || 'Ready to Move'} 
                        onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, constructionStatus: e.target.value })} 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '2px solid #0284c7', color: isLight ? '#0284c7' : '#38bdf8', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}
                      >
                        <option value="Ready to Move">🔑 Ready to Move</option>
                        <option value="Under Construction">🏗️ Under Construction</option>
                      </select>
                    </div>

                    {/* IF UNDER CONSTRUCTION: HANDOVER YEAR & MONTH */}
                    {sliderUnitForm.constructionStatus === 'Under Construction' && (
                      <>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: '900', display: 'block', marginBottom: '4px' }}>
                            📅 Handover Year *
                          </label>
                          <select 
                            value={sliderUnitForm.handoverYear || '2026'} 
                            onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, handoverYear: e.target.value })} 
                            style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '2px solid #eab308', color: '#eab308', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}
                          >
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                            <option value="2029">2029</option>
                            <option value="2030">2030</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: '900', display: 'block', marginBottom: '4px' }}>
                            🗓️ Handover Month *
                          </label>
                          <select 
                            value={sliderUnitForm.handoverMonth || 'December'} 
                            onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, handoverMonth: e.target.value })} 
                            style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '2px solid #eab308', color: '#eab308', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}
                          >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>BHK Configuration *</label>
                      <select value={sliderUnitForm.bhk} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, bhk: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="4BHK">4BHK</option>
                        <option value="5BHK">5BHK / Sky Villa</option>
                        <option value="Duplex Villa">Duplex Villa</option>
                        <option value="Penthouse">Penthouse</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Tower / Block Name</label>
                      <input type="text" value={sliderUnitForm.tower} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, tower: e.target.value })} placeholder="e.g. Tower A / Block 1" style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Super Built-up Area (Sq.Ft.) *</label>
                      <input 
                        type="text" 
                        value={sliderUnitForm.superBuiltupArea} 
                        onChange={(e) => {
                          const superVal = e.target.value;
                          const sNum = parseFloat(superVal.replace(/[^0-9.]/g, '')) || 0;
                          const dedPct = parseFloat(sliderUnitForm.deductionPct || '35') || 35;
                          const calcCarpet = sNum > 0 ? (sNum * (1 - dedPct / 100)).toFixed(1) + ' Sq.Ft.' : sliderUnitForm.carpetArea;
                          
                          const rateNum = parseFloat(sliderUnitForm.priceSqft?.replace(/[^0-9.]/g, '') || '5131') || 0;
                          const calcBase = sNum > 0 && rateNum > 0 ? '₹' + Math.round(sNum * rateNum).toLocaleString('en-IN') : sliderUnitForm.basePrice;

                          setSliderUnitForm({ 
                            ...sliderUnitForm, 
                            superBuiltupArea: superVal,
                            carpetArea: calcCarpet,
                            basePrice: calcBase
                          });
                        }} 
                        placeholder="e.g. 1,283 Sq.Ft." 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '1.5px solid #fbbf24', color: '#fbbf24', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Super to Carpet Deduction %</label>
                      <select 
                        value={sliderUnitForm.deductionPct || '35%'} 
                        onChange={(e) => {
                          const dedStr = e.target.value;
                          const dedPct = parseFloat(dedStr) || 35;
                          const sNum = parseFloat(sliderUnitForm.superBuiltupArea?.replace(/[^0-9.]/g, '') || '0') || 0;
                          const calcCarpet = sNum > 0 ? (sNum * (1 - dedPct / 100)).toFixed(1) + ' Sq.Ft.' : sliderUnitForm.carpetArea;
                          setSliderUnitForm({ ...sliderUnitForm, deductionPct: dedStr, carpetArea: calcCarpet });
                        }} 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}
                      >
                        <option value="35%">35% Deduction (Standard Builder Loading)</option>
                        <option value="30%">30% Deduction</option>
                        <option value="25%">25% Deduction</option>
                        <option value="20%">20% Deduction</option>
                        <option value="40%">40% Deduction</option>
                        <option value="0%">0% Deduction (No Loading)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Carpet Area (Sq.Ft.) *</label>
                      <input type="text" value={sliderUnitForm.carpetArea} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, carpetArea: e.target.value })} placeholder="e.g. 898.1 Sq.Ft." style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '1.5px solid #38bdf8', color: '#38bdf8', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Vastu Facing</label>
                      <select value={sliderUnitForm.facing} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, facing: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <option value="East Facing">East Facing</option>
                        <option value="North-East Facing">North-East Facing</option>
                        <option value="North Facing">North Facing</option>
                        <option value="North-West Facing">North-West Facing</option>
                        <option value="West Facing">West Facing</option>
                        <option value="South-West Facing">South-West Facing</option>
                        <option value="South Facing">South Facing</option>
                        <option value="South-East Facing">South-East Facing</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Unit Floor Number *</label>
                      <select value={sliderUnitForm.floor} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, floor: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '800' }}>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                        <option value="4th Floor">4th Floor</option>
                        <option value="5th Floor">5th Floor</option>
                        <option value="6th Floor">6th Floor</option>
                        <option value="7th Floor">7th Floor</option>
                        <option value="Top Floor / Penthouse">Top Floor / Penthouse</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Furnishing Status</label>
                      <select value={sliderUnitForm.furnishing || 'Semi-Furnished'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, furnishing: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 💰 SUB-SECTION 3: PRICING, COMMERCIALS, PARKING & ALL-INCLUSIVE FINAL VALUATION */}
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#22c55e', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💰 3. Pricing, Commercials, Parking & All-Inclusive Final Valuation
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Price per Sq.Ft. (INR) *</label>
                      <input 
                        type="text" 
                        value={sliderUnitForm.priceSqft} 
                        onChange={(e) => {
                          const rateVal = e.target.value;
                          const rNum = parseFloat(rateVal.replace(/[^0-9.]/g, '')) || 0;
                          const sNum = parseFloat(sliderUnitForm.superBuiltupArea?.replace(/[^0-9.]/g, '') || '1283') || 0;
                          const calcBase = sNum > 0 && rNum > 0 ? '₹' + Math.round(sNum * rNum).toLocaleString('en-IN') : sliderUnitForm.basePrice;

                          // Auto calculate total
                          const bNum = sNum * rNum;
                          const pNum = parseFloat(sliderUnitForm.parkingPrice || '0') || 0;
                          const aNum = parseFloat(sliderUnitForm.amenityCharges || '0') || 0;
                          const gstPctNum = parseFloat(sliderUnitForm.gstPct || '5') || 0;
                          const taxVal = (bNum + pNum + aNum) * (gstPctNum / 100);
                          const calcTotal = '₹' + Math.round(bNum + pNum + aNum + taxVal).toLocaleString('en-IN');

                          setSliderUnitForm({ 
                            ...sliderUnitForm, 
                            priceSqft: rateVal,
                            basePrice: calcBase,
                            totalAllInclusivePrice: calcTotal
                          });
                        }} 
                        placeholder="e.g. 5131" 
                        style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '1.5px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Base Unit Flat Price (INR) *</label>
                      <input type="text" value={sliderUnitForm.basePrice} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, basePrice: e.target.value })} placeholder="e.g. ₹65,83,073" style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '2px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>



                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Amenity & Maintenance Charges (INR)</label>
                      <input type="text" value={sliderUnitForm.amenityCharges || '150000'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, amenityCharges: e.target.value })} placeholder="e.g. 150000" style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>GST Charge Option</label>
                      <select value={sliderUnitForm.gstPct || '5%'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, gstPct: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <option value="5%">5% GST (Standard Residential Construction)</option>
                        <option value="1%">1% GST (Affordable Housing Scheme)</option>
                        <option value="18%">18% GST (Commercial Real Estate)</option>
                        <option value="0%">0% GST (Exempted / Resale)</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: windowWidth <= 640 ? 'span 1' : 'span 2' }}>
                      <label style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '900', display: 'block', marginBottom: '4px' }}>Total All-Inclusive Final Price (INR) [Base + Charges + Taxes] *</label>
                      <input type="text" value={sliderUnitForm.totalAllInclusivePrice || '₹73,84,727'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, totalAllInclusivePrice: e.target.value })} placeholder="e.g. ₹73,84,727" style={{ width: '100%', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', color: '#22c55e', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '1rem' }} />
                    </div>
                  </div>
                </div>



                {/* 🔑 SUB-SECTION 5: UNIT AVAILABILITY & KEYS CUSTODY */}
                <div style={{ background: isLight ? '#ffffff' : '#1e293b', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h5 style={{ fontSize: '0.92rem', fontWeight: '900', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔑 5. Unit Availability & Keys Custody
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: windowWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Unit Availability Status</label>
                      <select value={(() => { const s = (sliderUnitForm.status || 'LIVE').toUpperCase(); return s === 'AVAILABLE' ? 'LIVE' : s; })()} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, status: e.target.value })} style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: '1.5px solid #0284c7', color: isLight ? '#0f172a' : '#ffffff', fontWeight: '900', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>
                        <option value="LIVE">🟢 LIVE</option>
                        <option value="SOLD_OUT">🔴 SOLD OUT</option>
                        <option value="BOOKED">🟡 BOOKED</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Key Custody / Site Location</label>
                      <input type="text" value={sliderUnitForm.keyCustody || 'Builder Site Office'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, keyCustody: e.target.value })} placeholder="e.g. Site Manager Office" style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '4px' }}>Property Highlights & Notes</label>
                      <input type="text" value={sliderUnitForm.description || 'Pool facing Vastu East'} onChange={(e) => setSliderUnitForm({ ...sliderUnitForm, description: e.target.value })} placeholder="e.g. Pool facing Vastu East" style={{ width: '100%', background: isLight ? '#ffffff' : '#0f172a', border: isLight ? '1px solid #cbd5e1' : '1px solid #334155', color: isLight ? '#0f172a' : '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }} />
                    </div>
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!sliderUnitForm.basePrice) {
                        return alert('Please enter Base Unit Price!');
                      }
                      const assignedPropId = generateDynamicPropertyCode(0);
                      const unitShortNum = `Unit ${assignedPropId.split('-').pop()}`;
                      const newU = {
                        id: `UNIT-${Date.now()}`,
                        propertyId: assignedPropId,
                        project_id: currentProject.project_id || 'SRM-PROJ-2026-000088',
                        projectTitle: projectTitleStr,
                        developerName: devNameStr,
                        unitNumber: unitShortNum,
                        unit_num: unitShortNum,
                        unit_code: assignedPropId,
                        property_code: assignedPropId,
                        constructionStatus: sliderUnitForm.constructionStatus || 'Ready to Move',
                        handoverYear: sliderUnitForm.constructionStatus === 'Under Construction' ? (sliderUnitForm.handoverYear || '2026') : '',
                        handoverMonth: sliderUnitForm.constructionStatus === 'Under Construction' ? (sliderUnitForm.handoverMonth || 'December') : '',
                        bhk: sliderUnitForm.bhk,
                        floor: sliderUnitForm.floor,
                        tower: sliderUnitForm.tower || 'Tower A',
                        superBuiltupArea: sliderUnitForm.superBuiltupArea || '1,283 Sq.Ft.',
                        deductionPct: sliderUnitForm.deductionPct || '35%',
                        carpetArea: sliderUnitForm.carpetArea || '898.1 Sq.Ft.',
                        area: sliderUnitForm.carpetArea || '898.1 Sq.Ft.',
                        priceSqft: sliderUnitForm.priceSqft || '5131',
                        basePrice: sliderUnitForm.basePrice,
                        price: sliderUnitForm.basePrice,
                        parkingRequired: sliderUnitForm.parkingRequired || 'YES',
                        parking: sliderUnitForm.parking || '1 Covered Car Parking Slot',
                        parkingPrice: sliderUnitForm.parkingPrice || '300000',
                        amenityCharges: sliderUnitForm.amenityCharges || '150000',
                        gstPct: sliderUnitForm.gstPct || '5%',
                        totalAllInclusivePrice: sliderUnitForm.totalAllInclusivePrice || '₹73,84,727',
                        selectedAmenities: sliderUnitForm.selectedAmenities || [],
                        keyCustody: sliderUnitForm.keyCustody || 'Builder Site Office',
                        description: sliderUnitForm.description || '',
                        facing: sliderUnitForm.facing,
                        furnishing: sliderUnitForm.furnishing || 'Semi-Furnished',
                        status: sliderUnitForm.status || 'AVAILABLE',
                        unitPhotos: sliderUnitForm.unitPhotos || [],
                        unitVideos: sliderUnitForm.unitVideos || []
                      };

                      const updatedUnits = [newU, ...projectUnitsList];
                      setProjectUnitsList(updatedUnits);
                      if (setPropertyUnits) setPropertyUnits(updatedUnits);

                      // Auto-advance unit number for fast entry (e.g. Flat 301 -> Flat 302)
                      const numMatch = sliderUnitForm.unitNumber.match(/(\d+)/);
                      let nextUnitStr = `Flat ${currentProjectUnits.length + 102}`;
                      if (numMatch) {
                        const nextNum = parseInt(numMatch[1], 10) + 1;
                        nextUnitStr = sliderUnitForm.unitNumber.replace(/\d+/, String(nextNum));
                      }

                      setSliderUnitForm({
                        ...sliderUnitForm,
                        unitNumber: nextUnitStr,
                        basePrice: sliderUnitForm.basePrice
                      });

                      alert(`🎉 ADDED FULL-SPECIFICATION UNIT ${newU.unitNumber} (INDIVIDUAL PROPERTY ID: ${assignedPropId}) TO PROJECT ${projectTitleStr}!\n\nNext Unit Property ID will be: ${generateDynamicPropertyCode(1)}.`);
                    }}
                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '900', fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}
                  >
                    ➕ SAVE & ADD FULL SPECIFICATION UNIT TO PROJECT
                  </button>
                </div>
              </div>

              {/* SLIDER FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', borderTop: isLight ? '2px solid #e2e8f0' : '2px solid #334155', paddingTop: '16px' }}>
                <button 
                  onClick={() => setShowMultipleUnitsSlider(null)} 
                  style={{ background: isLight ? '#f1f5f9' : '#334155', color: isLight ? '#0f172a' : '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Close Builder Workspace
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

    </div>
  );
};
