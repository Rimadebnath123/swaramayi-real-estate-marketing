import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbStore, loadData, saveData, generateID, PropertyRecord, CustomerRecord } from '../db/database.js';
import { syncToMongoDB } from '../db/mongoPersistence.js';

// Helper to generate a URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Helper to check if a property is marked as SOLD / SOLD_OUT in CRM
function isSoldProperty(p: any): boolean {
  const s = String(p.status || p.availability_status || p.property_status || '').toUpperCase();
  return (
    s === 'SOLD' || 
    s === 'SOLD_OUT' || 
    s === 'SOLD OUT' || 
    p.isSold === true || 
    p.is_sold === true
  );
}

function parsePriceString(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) || val <= 0 ? 0 : val;

  const str = String(val).trim();
  if (!str) return 0;

  if (/lakh/i.test(str)) {
    const cleanStr = str.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }

  if (/cr|crore/i.test(str)) {
    const cleanStr = str.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }

  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseAreaString(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) || val <= 0 ? 0 : val;
  const str = String(val).trim();
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function extractPropertyImages(p: any, title: string, id: string): string[] {
  const candidates: string[] = [];

  const addCandidate = (val: any) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(item => addCandidate(item));
    } else if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
        if (!candidates.includes(trimmed)) {
          candidates.push(trimmed);
        }
      }
    }
  };

  addCandidate(p.images);
  addCandidate(p.image);
  addCandidate(p.building_photos);
  addCandidate(p.building_photo);
  addCandidate(p.unit_photos);
  addCandidate(p.photos);
  addCandidate(p.photo);
  addCandidate(p.cover_image);
  addCandidate(p.image_url);
  addCandidate(p.imageUrl);
  addCandidate(p.thumbnail);
  addCandidate(p.picture);
  addCandidate(p.media);

  if (candidates.length > 0) {
    return candidates;
  }

  const defaultImagesSet = [
    [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    ],
    [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
    ]
  ];

  let hash = 0;
  const str = id || title || 'default';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const setIndex = Math.abs(hash) % defaultImagesSet.length;
  return defaultImagesSet[setIndex];
}

// Normalize Property for Public Website Response
function formatPublicProperty(p: any) {
  const title = p.property_title || p.title || `Property ${p.property_code || p.id}`;
  const slug = p.slug || slugify(`${title}-${p.property_code || p.id}`);
  const titleLower = title.toLowerCase();

  let crmCode = p.property_code || p.id;
  let crmDev = p.developer_name || p.developer || 'Swaramayi Developers';
  let crmPrice = parsePriceString(p.final_estimated_price) || parsePriceString(p.base_price) || parsePriceString(p.price);
  let crmSuperArea = parseAreaString(p.built_up_area_sqft) || parseAreaString(p.areaSqft) || parseAreaString(p.area);
  let crmCarpetArea = parseAreaString(p.carpet_area_sqft) || parseAreaString(p.carpetArea);
  let crmBeds = p.bedrooms || (p.configuration ? parseInt(p.configuration) || 3 : 3);
  let crmConfig = p.configuration || `${crmBeds}BHK`;
  let crmLocality = p.locality || p.location || 'Barasat, Kolkata';
  let crmAddress = p.location_address || p.full_address || 'Jessore Road, Barasat, North 24 Parganas, Kolkata, West Bengal - 700124';
  let crmCity = p.city || 'Kolkata';

  crmCode = p.property_code || p.code || p.id || crmCode;
  crmDev = p.developer || p.developer_name || p.builder_name || p.developer_company || crmDev;
  if (p.final_price || p.asking_price || p.price) {
    crmPrice = parsePriceString(p.final_price || p.asking_price || p.price);
  }
  const parsedSuper = parseFloat(String(p.super_builtup_area || '').replace(/[^0-9.]/g, ''));
  if (!isNaN(parsedSuper) && parsedSuper > 0) crmSuperArea = parsedSuper;
  const parsedCarpet = parseFloat(String(p.carpet_area || '').replace(/[^0-9.]/g, ''));
  if (!isNaN(parsedCarpet) && parsedCarpet > 0) crmCarpetArea = parsedCarpet;
  if (p.configuration) crmConfig = p.configuration;
  if (p.locality || p.location) crmLocality = p.locality || p.location;

  const price = crmPrice > 0 ? crmPrice : 3000000;
  const area = crmSuperArea > 0 ? crmSuperArea : (crmCarpetArea > 0 ? crmCarpetArea : 1200);
  const explicitSqftRate = parsePriceString(p.pricePerSqft) || parsePriceString(p.price_per_sqft);
  const pricePerSqft = explicitSqftRate > 0 ? explicitSqftRate : (area > 0 && price > 0 ? Math.round(price / area) : 0);

  const statusRaw = String(p.status || p.availability_status || p.property_status || 'LIVE').toUpperCase();
  let constructionStatus = 'LIVE / AVAILABLE';
  if (statusRaw === 'LIVE' || statusRaw === 'AVAILABLE' || statusRaw.includes('LIVE') || statusRaw.includes('READY') || statusRaw === 'READY_TO_MOVE') {
    constructionStatus = 'LIVE / AVAILABLE';
  } else if (statusRaw.includes('UNDER') || statusRaw === 'UNDER_CONSTRUCTION') {
    constructionStatus = 'Under Construction';
  } else if (statusRaw.includes('BOOKED')) {
    constructionStatus = 'Booked';
  } else if (statusRaw.includes('HOLD')) {
    constructionStatus = 'Hold / Reserved';
  } else if (statusRaw.includes('SOLD')) {
    constructionStatus = 'Sold Out';
  } else if (p.constructionStatus) {
    constructionStatus = p.constructionStatus;
  }

  const isSold = isSoldProperty(p);
  const images = extractPropertyImages(p, title, crmCode);

  return {
    ...p,
    id: p.id,
    _id: p.id,
    property_code: crmCode,
    title,
    property_title: title,
    slug,
    description: (p.description && p.description.trim().length > 15 && p.description.trim().toLowerCase() !== title.toLowerCase()) 
      ? p.description 
      : `${crmConfig} ${p.property_type || p.propertyType || 'Apartment'} with modern amenities, excellent ventilation, and prime location connectivity in ${crmLocality}, ${crmCity}.`,
    category: (String(p.category || p.transaction_type || 'Buy').toLowerCase().includes('rent')) ? 'Rent' : 'Buy',
    propertyType: p.propertyType || p.property_type || 'Apartment',
    property_type: p.property_type || p.propertyType || 'Apartment',
    listingType: p.listingType || p.transaction_type || 'Sale',
    price,
    base_price: price,
    final_estimated_price: price,
    pricePerSqft,
    city: crmCity,
    location: crmLocality,
    locality: crmLocality,
    location_address: crmAddress,
    full_address: crmAddress,
    society: p.society || p.project_name || title,
    developer: crmDev,
    developer_name: crmDev,
    project_name: p.project_name || title,
    bedrooms: crmBeds,
    configuration: crmConfig,
    bathrooms: p.bathrooms || 2,
    balconies: p.balconies || 1,
    areaSqft: area,
    superBuiltupArea: crmSuperArea,
    carpetArea: crmCarpetArea,
    carpet_area_sqft: crmCarpetArea,
    built_up_area_sqft: crmSuperArea,
    floor: p.floor !== undefined && p.floor !== null && p.floor !== '' ? p.floor : (p.floor_number || p.unit_floor || ''),
    totalFloors: p.total_floors || p.total_floors_in_building || p.total_floor || '',
    possessionStatus: p.possession_status || p.possession_date || 'Ready to Move In',
    facing: p.facing || 'East',
    furnishing: p.furnishing || p.furnishing_status || 'Semi-Furnished',
    parking: p.parking || (p.parking_spaces ? `${p.parking_spaces} Space` : 'Covered'),
    constructionStatus,
    reraApproved: p.reraApproved !== undefined ? p.reraApproved : true,
    reraNumber: p.reraNumber || 'WBRERA/2026/00192',
    amenities: p.amenities || ['24x7 Security', 'Power Backup', 'Car Parking', 'Gymnasium', 'Swimming Pool', 'Clubhouse'],
    images,
    image: images[0],
    building_photo: images[0],
    cover_image: images[0],
    featured: Boolean(p.featured),
    verified: p.verified !== undefined ? p.verified : true,
    published: p.published !== undefined ? p.published : true,
    isSold,
    availability_status: isSold ? 'SOLD' : (p.availability_status || p.status || 'AVAILABLE'),
    views: (p.views || 0) + 1,
    created_at: p.created_at || new Date().toISOString(),
    assignedAdvisor: (() => {
      const pTitleLower = (title || p.title || p.property_title || p.project_name || '').toLowerCase();
      const pCodeLower = String(p.property_code || p.id || '').toLowerCase();

      // Find user who has this property assigned in CRM (or assigned_employee_id/name)
      const u = (dbStore.data.users || []).find((usr: any) => {
        if (p.assigned_employee_id && (usr.id === p.assigned_employee_id || String(usr.id) === String(p.assigned_employee_id))) return true;
        if (p.assigned_employee_name && (usr.full_name === p.assigned_employee_name || usr.username === p.assigned_employee_name)) return true;
        
        const userProps: any[] = usr.assigned_properties || usr.assignedProperties || [];
        if (Array.isArray(userProps)) {
          return userProps.some((ap: any) => {
            const apStr = String(ap || '').toLowerCase();
            return apStr && (
              apStr === pCodeLower ||
              pTitleLower.includes(apStr) ||
              apStr.includes(pTitleLower) ||
              (pTitleLower.includes('shibalay') && apStr.includes('shibalay')) ||
              (pTitleLower.includes('dhriti') && apStr.includes('dhriti')) ||
              (pTitleLower.includes('gajapati') && apStr.includes('gajapati'))
            );
          });
        }
        return false;
      });

      let name = u?.full_name || u?.username || p.assigned_employee_name;
      let role = u?.role || (u as any)?.designation || 'Sales Management';
      let phone = u?.mobile || (u as any)?.phone || '8668767887';
      let email = u?.email || 'punita13.pr@gmail.com';
      let img = (u as any)?.avatar || (u as any)?.profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
      let rating = (u as any)?.rating || 4.8;

      if (!name) {
        name = 'punita Roy chowdhury';
        role = 'TELECALLER';
        phone = '8668767887';
        email = 'punita13.pr@gmail.com';
        img = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
        rating = 4.8;
      }

      return {
        id: u?.id || 'USR-02',
        name,
        full_name: name,
        role,
        designation: role,
        phone,
        mobile: phone,
        email,
        profileImage: img,
        image: img,
        rating
      };
    })(),
    agent: (() => {
      const u = (dbStore.data.users || []).find((usr: any) => 
        (p.assigned_employee_id && (usr.id === p.assigned_employee_id || String(usr.id) === String(p.assigned_employee_id))) ||
        (p.assigned_employee_name && (usr.full_name === p.assigned_employee_name || usr.username === p.assigned_employee_name))
      );
      let name = u?.full_name || p.assigned_employee_name;
      let role = u?.role || 'Property Advisor';
      let phone = '8902130791';
      let email = 'avishek@swaramayi.info';
      let img = (u as any)?.avatar || (u as any)?.profileImage;
      let rating = (u as any)?.rating;

      const tLower = title.toLowerCase();
      const codeLower = String(p.property_code || p.id || '').toLowerCase();

      if (!name) {
        if (tLower.includes('shibalay') || codeLower.includes('425') || codeLower.includes('shibalay')) {
          name = 'Abinash Roy';
          role = 'Admin';
          phone = '8902130791';
          email = 'avishek@swaramayi.info';
          img = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80';
          rating = rating || 4.7;
        } else if (tLower.includes('dhriti') || codeLower.includes('427') || codeLower.includes('423') || codeLower.includes('dhriti')) {
          name = 'Punita Roy';
          role = 'Sales Management';
          phone = '8902130791';
          email = 'avishek@swaramayi.info';
          img = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
          rating = rating || 4.8;
        } else if (tLower.includes('gajapati') || codeLower.includes('422')) {
          name = 'Punita Roy';
          role = 'Sales Management';
          phone = '8902130791';
          email = 'avishek@swaramayi.info';
          img = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
          rating = rating || 4.8;
        } else {
          name = 'Punita Roy';
          role = 'Sales Management';
          phone = '8902130791';
          email = 'avishek@swaramayi.info';
          img = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
          rating = rating || 4.8;
        }
      }

      if (!rating) {
        rating = (name && name.toLowerCase().includes('abinash')) ? 4.7 : 4.8;
      }

      if (!img) {
        img = (name && name.toLowerCase().includes('punita')) 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80';
      }

      return {
        name,
        role,
        designation: role,
        phone,
        mobile: phone,
        email,
        profileImage: img,
        image: img,
        rating: Number(rating) || 4.8
      };
    })(),
  };
}

// 1. Get Public Properties List (Active properties only - excludes SOLD OUT)
export async function getPublicProperties(req: Request, res: Response) {
  loadData();
  const { 
    search, type, propertyType, category, listingType, city, location, locality,
    minPrice, maxPrice, bedrooms, featured, recent, isSold, status
  } = req.query;

  const wantsSold = 
    isSold === 'true' || 
    String(isSold) === 'true' || 
    String(status || '').toLowerCase().includes('sold');

  let properties: any[] = [];

  if (wantsSold) {
    const explicitlySold = dbStore.data.properties.filter(p => !p.is_deleted && isSoldProperty(p));
    const bookedPropIds = new Set((dbStore.data.bookings || []).map((b: any) => b.property_code || b.property_id || b.unit_id).filter(Boolean));
    const bookingSold = dbStore.data.properties.filter(p => !p.is_deleted && bookedPropIds.has(p.property_code || p.id));
    
    const combinedSoldMap = new Map<string, any>();
    [...explicitlySold, ...bookingSold].forEach(p => combinedSoldMap.set(p.id || p.property_code, p));
    properties = Array.from(combinedSoldMap.values());
  } else {
    properties = dbStore.data.properties.filter(p => !p.is_deleted && !isSoldProperty(p));
  }

  // Formatting & Mapping
  let publicList = properties.map(p => {
    const formatted = formatPublicProperty(p);
    if (wantsSold) {
      formatted.isSold = true;
      formatted.availability_status = 'SOLD';
      formatted.constructionStatus = 'Sold Out';
    }
    return formatted;
  });

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    publicList = publicList.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.property_code.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.project_name && p.project_name.toLowerCase().includes(q))
    );
  }

  if (type || propertyType) {
    const filterType = ((type || propertyType) as string).trim().toLowerCase();
    publicList = publicList.filter(p => {
      const pt = (p.propertyType || p.property_type || '').toLowerCase();
      if (pt === filterType) return true;
      if (pt.includes(filterType) || filterType.includes(pt)) return true;

      const isApartmentFilter = filterType.includes('apartment') || filterType.includes('flat');
      const isApartmentProperty = pt.includes('apartment') || pt.includes('flat') || pt.includes('residence') || pt.includes('bhk');
      if (isApartmentFilter && isApartmentProperty) return true;

      const isVillaFilter = filterType.includes('villa') || filterType.includes('house');
      const isVillaProperty = pt.includes('villa') || pt.includes('house') || pt.includes('bungalow') || pt.includes('duplex');
      if (isVillaFilter && isVillaProperty) return true;

      const isCommercialFilter = filterType.includes('commercial') || filterType.includes('office') || filterType.includes('shop');
      const isCommercialProperty = pt.includes('commercial') || pt.includes('office') || pt.includes('shop') || pt.includes('retail');
      if (isCommercialFilter && isCommercialProperty) return true;

      const isPlotFilter = filterType.includes('plot') || filterType.includes('land');
      const isPlotProperty = pt.includes('plot') || pt.includes('land');
      if (isPlotFilter && isPlotProperty) return true;

      return false;
    });
  }

  if (category) {
    const catFilter = (category as string).trim().toLowerCase();
    publicList = publicList.filter(p => {
      const pCat = (p.category || p.listingType || p.transaction_type || '').toLowerCase();
      if (catFilter === 'buy' || catFilter === 'sale') {
        return !pCat || pCat === 'buy' || pCat === 'sale' || pCat.includes('buy') || pCat.includes('sale');
      }
      if (catFilter === 'rent') {
        return pCat.includes('rent') || pCat.includes('lease');
      }
      if (catFilter === 'commercial') {
        const pt = (p.propertyType || p.property_type || '').toLowerCase();
        return pCat.includes('commercial') || pt.includes('commercial') || pt.includes('office') || pt.includes('shop');
      }
      return pCat === catFilter || pCat.includes(catFilter);
    });
  }

  if (city) {
    publicList = publicList.filter(p => p.city.toLowerCase().includes((city as string).toLowerCase()));
  }

  if (location || locality) {
    const loc = (location || locality) as string;
    publicList = publicList.filter(p => p.location.toLowerCase().includes(loc.toLowerCase()));
  }

  if (minPrice) {
    publicList = publicList.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    publicList = publicList.filter(p => p.price <= Number(maxPrice));
  }

  if (bedrooms) {
    publicList = publicList.filter(p => p.bedrooms >= Number(bedrooms));
  }

  if (featured === 'true' || String(featured) === 'true') {
    publicList = publicList.filter(p => p.featured);
  }

  return res.json({
    status: 'success',
    success: true,
    count: publicList.length,
    total: publicList.length,
    data: publicList
  });
}

// 2. Get Featured Properties (Active properties only)
export async function getPublicFeaturedProperties(req: Request, res: Response) {
  loadData();
  const properties = dbStore.data.properties
    .filter(p => !p.is_deleted && !isSoldProperty(p))
    .map(formatPublicProperty);
    
  const featured = properties.filter(p => p.featured);
  const result = featured.length > 0 ? featured : properties.slice(0, 6);

  return res.json({
    status: 'success',
    success: true,
    count: result.length,
    data: result
  });
}

// 3. Get Recent Properties (Active properties only)
export async function getPublicRecentProperties(req: Request, res: Response) {
  loadData();
  const properties = dbStore.data.properties
    .filter(p => !p.is_deleted && !isSoldProperty(p))
    .map(formatPublicProperty)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json({
    status: 'success',
    success: true,
    count: properties.length,
    data: properties.slice(0, 10)
  });
}

// 3b. Get Dynamic Sold Properties from CRM Database & Bookings
export async function getPublicSoldProperties(req: Request, res: Response) {
  loadData();
  
  // 1. Get properties explicitly marked as SOLD or SOLD_OUT in CRM
  let soldProperties = dbStore.data.properties
    .filter(p => !p.is_deleted && isSoldProperty(p))
    .map(formatPublicProperty);

  // 2. Cross-reference with Bookings table in CRM (dbStore.data.bookings)
  if (dbStore.data.bookings && dbStore.data.bookings.length > 0) {
    const bookedPropIds = new Set(dbStore.data.bookings.map((b: any) => b.property_code || b.property_id || b.unit_id).filter(Boolean));
    dbStore.data.properties.forEach(p => {
      if (!p.is_deleted && bookedPropIds.has(p.property_code || p.id)) {
        if (!soldProperties.some(sp => sp.id === p.id || sp.property_code === p.property_code)) {
          const formatted = formatPublicProperty(p);
          formatted.isSold = true;
          formatted.availability_status = 'SOLD';
          soldProperties.push(formatted);
        }
      }
    });
  }

  // Ensure all returned properties are flagged as sold
  const result = soldProperties.map(sp => ({
    ...sp,
    isSold: true,
    availability_status: 'SOLD',
    constructionStatus: 'Sold Out'
  }));

  // Dynamic Stats from CRM Data
  const totalSold = Math.max(result.length, dbStore.data.bookings?.length || 0);
  const totalVolume = result.reduce((sum, p) => sum + (p.price || 0), 0) + (dbStore.data.bookings?.reduce((sum: number, b: any) => sum + (b.agreement_value || b.booking_amount || 0), 0) || 0);
  const totalVolumeCr = Math.max(Math.round((totalVolume / 10000000) * 10) / 10, totalSold > 0 ? 5 : 0);

  return res.json({
    status: 'success',
    success: true,
    count: result.length,
    stats: {
      totalSold: totalSold > 0 ? totalSold : 150,
      totalVolumeCr: totalVolumeCr > 0 ? totalVolumeCr : 250,
      verifiedPct: 100,
      satisfactionPct: 98
    },
    data: result
  });
}

// 4. Get Single Public Property by Slug or ID
export async function getPublicPropertyBySlug(req: Request, res: Response) {
  loadData();
  const { slug } = req.params;

  const properties = dbStore.data.properties.filter(p => !p.is_deleted).map(formatPublicProperty);
  const property = properties.find(p => 
    p.slug === slug || 
    p.id === slug || 
    p.property_code === slug || 
    slugify(p.title) === slug
  );

  if (!property) {
    return res.status(404).json({
      status: 'error',
      success: false,
      message: 'Property not found'
    });
  }

  return res.json({
    status: 'success',
    success: true,
    data: property
  });
}

// 5. Get Public Projects List
// 5. Get Public Projects List
export async function getPublicProjects(req: Request, res: Response) {
  loadData();
  const propertyProjects: any[] = [];
  const seenProjects = new Set<string>();

  dbStore.data.properties
    .filter(p => !p.is_deleted && !isSoldProperty(p))
    .forEach((p: any) => {
      const projName = p.project_name || p.property_title || p.title || 'Swaramayi Project';
      const nameKey = projName.toLowerCase().trim();
      if (!seenProjects.has(nameKey)) {
        seenProjects.add(nameKey);
        const images = extractPropertyImages(p, projName, p.property_code || p.id);
        const priceMin = p.final_estimated_price || p.base_price || 2080000;
        const priceMax = Math.round(priceMin * 1.25);
        
        let crmLocality = p.locality || p.location || 'Kolkata';

        propertyProjects.push({
          id: p.id,
          _id: p.id,
          name: projName,
          title: projName,
          slug: slugify(projName),
          description: p.description || `${p.configuration || '3BHK'} residential apartment with modern amenities in ${crmLocality}, Kolkata.`,
          developer: p.developer_name || p.developer || 'Swaramayi Real Estate Marketing',
          city: p.city || 'Kolkata',
          location: crmLocality,
          locality: crmLocality,
          location_address: p.location_address || 'Jessore Road, Barasat, North 24 Parganas, Kolkata, West Bengal - 700124',
          priceMin,
          priceMax,
          propertyTypes: [p.property_type || p.propertyType || 'Apartment'],
          bhkOptions: [p.configuration || '3BHK'],
          constructionStatus: p.constructionStatus || 'Under Construction',
          possessionStatus: p.possession_date || '2026 - 2028',
          reraApproved: true,
          reraNumber: 'WBRERA/2026/00192',
          amenities: p.amenities || ['Club House', 'Swimming Pool', 'Gymnasium', '24x7 Security'],
          images,
          image: images[0],
          featured: true,
          published: true
        });
      }
    });

  return res.json({
    status: 'success',
    success: true,
    count: propertyProjects.length,
    data: propertyProjects
  });
}

// 6. Get Single Project by Slug or ID
export async function getPublicProjectBySlug(req: Request, res: Response) {
  loadData();
  const { slug } = req.params;
  const projectsRes = await getPublicProjectsData();
  const project = projectsRes.find((pr: any) => pr.slug === slug || pr.id === slug || slugify(pr.name) === slug);

  if (!project) {
    return res.status(404).json({
      status: 'error',
      success: false,
      message: 'Project not found'
    });
  }

  return res.json({
    status: 'success',
    success: true,
    data: project
  });
}

async function getPublicProjectsData() {
  loadData();
  const seen = new Set();
  return dbStore.data.properties
    .filter(p => !p.is_deleted && !isSoldProperty(p))
    .map((p: any) => {
      const name = p.project_name || p.property_title || p.title || 'Swaramayi Project';
      const nameKey = name.toLowerCase().trim();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        const images = extractPropertyImages(p, name, p.property_code || p.id);
        let crmLocality = p.locality || p.location || 'Kolkata';
        return {
          id: p.id,
          _id: p.id,
          name,
          title: name,
          slug: slugify(name),
          description: p.description || `${p.configuration || '3BHK'} residential apartment with modern amenities in ${crmLocality}, Kolkata.`,
          developer: p.developer_name || 'Swaramayi Real Estate',
          city: p.city || 'Kolkata',
          location: crmLocality,
          locality: crmLocality,
          priceMin: p.final_estimated_price || p.base_price || 2080000,
          priceMax: Math.round((p.final_estimated_price || p.base_price || 2080000) * 1.25),
          amenities: ['Security', 'Gym', 'Parking'],
          images,
          image: images[0]
        };
      }
      return null;
    })
    .filter(Boolean);
}

// 7. Submit Public Contact / Property Enquiry -> Creates Enquiry & Lead in CRM
export async function submitPublicEnquiry(req: Request, res: Response) {
  const { name, email, phone, message, subject, bhk, propertyType, propertyInterested, propertyTitle, preferredVisitDate, preferredVisitTime } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: 'Name and phone number are required.'
    });
  }

  loadData();

  const customerNum = generateID('SRM-CUS');
  const leadNum = generateID('SRM-LEAD');
  const reqSubject = subject || 'Property Consultation';
  const reqBhk = bhk || '3 BHK';
  const reqType = propertyType || 'Apartment';
  const reqSource = propertyTitle ? 'Website Property Enquiry Form' : 'Website Contact Form';

  const newCustomer: CustomerRecord = {
    id: uuidv4(),
    customer_number: customerNum,
    full_name: name,
    email: email || '',
    mobile: phone,
    city: 'Kolkata',
    bhk: reqBhk,
    bhk_preference: reqBhk,
    propertyType: reqType,
    property_type: reqType,
    source: reqSource,
    priority: 'HOT',
    status: 'New',
    customer_status: 'NEW_LEAD',
    quality_score: 90,
    remarks: message ? `[Subject: ${reqSubject} | Requirement: ${reqBhk} | ${reqType}] ${message}` : `Website Enquiry [Subject: ${reqSubject} | ${reqBhk} ${reqType}]`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  };

  dbStore.data.customers.unshift(newCustomer);

  // Lead record in CRM leads table
  const newLead = {
    id: uuidv4(),
    lead_number: leadNum,
    customer_number: customerNum,
    full_name: name,
    phone,
    email,
    subject: reqSubject,
    bhk: reqBhk,
    bhk_preference: reqBhk,
    propertyType: reqType,
    property_type: reqType,
    message: message || `[Subject: ${reqSubject}] Enquiry for ${reqBhk} ${reqType}`,
    property_title: propertyTitle || `${reqBhk} ${reqType}`,
    property_id: propertyInterested || '',
    preferred_visit_date: preferredVisitDate || '',
    preferred_visit_time: preferredVisitTime || '',
    source: reqSource,
    status: 'NEW_INQUIRY',
    assigned_employee_name: 'Unassigned (Web Lead)',
    created_at: new Date().toISOString()
  };

  if (!dbStore.data.leads) dbStore.data.leads = [];
  dbStore.data.leads.unshift(newLead);

  saveData();

  return res.status(201).json({
    status: 'success',
    success: true,
    message: 'Thank you for your enquiry! Our real estate specialist will contact you shortly.',
    data: {
      customer_number: customerNum,
      lead_number: leadNum
    }
  });
}

// 8. Schedule Site Visit from Website -> Creates SiteVisit & Lead in CRM
export async function schedulePublicSiteVisit(req: Request, res: Response) {
  const { name, email, phone, propertyId, propertyTitle, preferredVisitDate, preferredVisitTime, notes } = req.body;

  if (!name || !phone || !preferredVisitDate) {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: 'Name, phone, and preferred visit date are required.'
    });
  }

  loadData();

  const customerNum = generateID('SRM-CUS');
  const siteVisitCode = generateID('SRM-SV');
  const leadNum = generateID('SRM-LEAD');

  // Customer Master
  const newCustomer: CustomerRecord = {
    id: uuidv4(),
    customer_number: customerNum,
    full_name: name,
    email: email || '',
    mobile: phone,
    city: 'Kolkata',
    source: 'Website Site Visit Request',
    priority: 'HOT',
    status: 'Site Visit Scheduled',
    customer_status: 'SCHEDULED_VISIT',
    quality_score: 95,
    remarks: `Site Visit requested for ${propertyTitle || 'Property'} on ${preferredVisitDate} ${preferredVisitTime || ''}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  };

  dbStore.data.customers.unshift(newCustomer);

  // Site Visit Record
  const newSiteVisit = {
    id: uuidv4(),
    site_visit_code: siteVisitCode,
    customer_number: customerNum,
    customer_name: name,
    property_title: propertyTitle || 'Property Visit',
    sales_executive: 'Unassigned (Web Booking)',
    scheduled_date: preferredVisitDate,
    scheduled_time: preferredVisitTime || '11:00 AM',
    visit_status: 'SCHEDULED',
    feedback_notes: notes || 'Booked directly via public website',
    created_at: new Date().toISOString()
  };

  dbStore.data.site_visits.unshift(newSiteVisit);

  // Lead Record
  const newLead = {
    id: uuidv4(),
    lead_number: leadNum,
    customer_number: customerNum,
    full_name: name,
    phone,
    email,
    source: 'Website Site Visit Request',
    status: 'SITE_VISIT_SCHEDULED',
    created_at: new Date().toISOString()
  };

  if (!dbStore.data.leads) dbStore.data.leads = [];
  dbStore.data.leads.unshift(newLead);

  saveData();

  return res.status(201).json({
    status: 'success',
    success: true,
    message: 'Site visit scheduled successfully! We look forward to showing you the property.',
    data: {
      site_visit_code: siteVisitCode,
      customer_number: customerNum,
      scheduled_date: preferredVisitDate
    }
  });
}

// 9. Get Public Locations / Cities
export async function getPublicLocations(req: Request, res: Response) {
  loadData();
  const citiesSet = new Set<string>(['Kolkata', 'Hyderabad', 'Bangalore', 'Mumbai']);
  const locationsSet = new Set<string>([
    'Alipore', 'Anwar Shah Road', 'Ashok Nagar Road', 'Ballygunge', 'Bamangachhi', 
    'Bansdroni', 'Barasat', 'Behala', 'Bhawanipur', 'Bidhan Nagar Road', 'Bira', 
    'Birati', 'Bisharpara Kodaliya', 'Chetla', 'Dattapukur', 'Dhakuria', 'Dum Dum', 
    'Dum Dum Cantonment', 'Dum Dum Junction', 'Durganagar', 'EM Bypass', 'Garia', 
    'Gariahat', 'Golf Green', 'Guma', 'Hazra', 'Howrah', 'Hridaypur', 'Jadavpur', 
    'Jodhpur Park', 'Kalighat', 'Kasba', 'Kudghat', 'Lake Gardens', 'Lansdowne', 
    'Madhyamgram', 'Mukundapur', 'Naktala', 'Netaji Nagar', 'New Alipore', 
    'New Barrackpore', 'New Town', 'Prince Anwar Shah Road', 'Rajarhat', 
    'Rashbehari Avenue', 'Regent Park', 'Ruby', 'Salt Lake', 'Santoshpur', 
    'Sarat Bose Road', 'Sealdah', 'Tollygunge'
  ]);

  dbStore.data.properties.forEach(p => {
    if (p.city) citiesSet.add(p.city);
    if (p.locality) locationsSet.add(p.locality);
  });

  const cities = Array.from(citiesSet);
  const locations = Array.from(locationsSet);

  return res.json({
    status: 'success',
    success: true,
    data: {
      cities,
      locations
    }
  });
}

export async function getPublicLocationBySlug(req: Request, res: Response) {
  loadData();
  const { slug } = req.params;
  const nameFromSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const matchingProperties = dbStore.data.properties
    .filter(p => !p.is_deleted && !isSoldProperty(p))
    .map(formatPublicProperty)
    .filter(p => 
      p.location.toLowerCase().includes(nameFromSlug.toLowerCase()) ||
      p.locality.toLowerCase().includes(nameFromSlug.toLowerCase()) ||
      p.city.toLowerCase().includes(nameFromSlug.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(nameFromSlug.toLowerCase()))
    );

  const locationObj = {
    id: slug,
    name: nameFromSlug,
    slug: slug,
    description: `Explore premium residential properties, luxury apartments, and commercial real estate in ${nameFromSlug}, Kolkata.`,
    connectivity: `Convenient access to metro, major arteries, buses and railway hubs in ${nameFromSlug}.`,
    schools: `Top reputed schools, colleges and academic institutions in and around ${nameFromSlug}.`,
    hospitals: `Super-specialty medical centers and multi-specialty hospitals accessible from ${nameFromSlug}.`,
    shopping: `Shopping malls, local bazaars, hypermarkets and lifestyle destinations in ${nameFromSlug}.`
  };

  return res.json({
    status: 'success',
    success: true,
    data: {
      location: locationObj,
      properties: matchingProperties
    }
  });
}

export async function getPublicCities(req: Request, res: Response) {
  loadData();
  const cities = Array.from(new Set(dbStore.data.properties.map(p => p.city).filter(Boolean)));
  return res.json({
    status: 'success',
    success: true,
    data: cities.length > 0 ? cities : ['Kolkata', 'Hyderabad', 'Bangalore', 'Mumbai']
  });
}

export async function getPublicSocieties(req: Request, res: Response) {
  loadData();
  const societies = Array.from(new Set(dbStore.data.properties.map(p => p.project_name || (p as any).society).filter(Boolean)));
  return res.json({
    status: 'success',
    success: true,
    data: societies
  });
}

export async function getPublicPhases(req: Request, res: Response) {
  return res.json({
    status: 'success',
    success: true,
    data: ['Phase 1', 'Phase 2', 'Phase 3']
  });
}

const demoResourceFiles = [
  {
    id: 'FILE-001',
    title: 'Swarnamayi Corporate Portfolio & Services 2026',
    category: 'Corporate Profile',
    description: 'Complete overview of Swarnamayi Real Estate Marketing, verified project portfolios, property advisory protocols, and client track record across Kolkata.',
    fileSize: 'PDF • 4.2 MB',
    filePath: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'
  }
];

export async function getPublicFiles(req: Request, res: Response) {
  loadData();
  const dbFiles = (dbStore.data as any).files || [];
  const filesList = dbFiles.length > 0 ? dbFiles : demoResourceFiles;

  return res.json({
    status: 'success',
    success: true,
    count: filesList.length,
    data: filesList
  });
}

export async function getPublicAgents(req: Request, res: Response) {
  loadData();
  const agents = dbStore.data.users.map((u, idx) => ({
    id: u.id,
    name: u.full_name || u.username,
    email: u.email,
    phone: u.mobile,
    role: u.role,
    rating: (u as any)?.rating || (u.full_name?.toLowerCase().includes('abinash') || u.username?.toLowerCase().includes('abinash') ? 4.7 : 4.8)
  }));
  return res.json({
    status: 'success',
    success: true,
    data: agents
  });
}

const defaultRatingInvites = [
  {
    id: 'SRM-RAT-INV-1789203161327-821',
    date: 'Sep 12, 2026',
    customerName: 'akash das',
    customerMobile: '+91 7676500366',
    customerPhone: '+91 7676500366',
    advisorName: 'Abinash Roy',
    propertyTitle: 'SHIBALAY',
    rating: 4,
    feedbackText: 'good',
    comment: 'good',
    status: 'VERIFIED_AND_RATED',
    deliveryChannel: 'WHATSAPP',
    created_at: '2026-09-12T12:00:00.000Z'
  },
  {
    id: 'SRM-RATING-521664',
    date: 'Sep 12, 2026',
    customerName: 'Priya Das',
    customerMobile: '+91 7870500387',
    customerPhone: '+91 7870500387',
    advisorName: 'Punita Roy',
    propertyTitle: 'GAJAPATI APARTMENT',
    rating: 5,
    feedbackText: 'Very good consultation!',
    comment: 'Very good consultation!',
    status: 'VERIFIED_AND_RATED',
    deliveryChannel: 'WHATSAPP',
    created_at: '2026-09-12T12:00:00.000Z'
  }
];

export async function getPublicAdvisorRatings(req: Request, res: Response) {
  loadData();
  if (!(dbStore.data as any).rating_invites) {
    (dbStore.data as any).rating_invites = defaultRatingInvites;
    saveData();
  }

  let invites: any[] = (dbStore.data as any).rating_invites || [];

  // Filter out unwanted/test duplicate entries like gfhj / 5677456775
  invites = invites.filter((item: any) => {
    const cName = String(item.customerName || '').toLowerCase();
    const cMob = String(item.customerMobile || item.customerPhone || '');
    return !cName.includes('gfhj') && !cMob.includes('5677456775');
  });

  (dbStore.data as any).rating_invites = invites;

  // Recalculate user ratings
  if (Array.isArray(dbStore.data.users)) {
    dbStore.data.users.forEach((u: any) => {
      const uName = (u.full_name || u.username || '').toLowerCase();
      const uReviews = invites.filter((i: any) => {
        const advName = (i.advisorName || '').toLowerCase();
        return (advName.includes(uName) || uName.includes(advName)) && 
          i.rating !== null && i.rating !== undefined && !isNaN(Number(i.rating));
      });
      if (uReviews.length > 0) {
        const avg = uReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / uReviews.length;
        u.rating = Number(avg.toFixed(1));
      } else {
        if (uName.includes('punita')) u.rating = 5.0;
        else if (uName.includes('abinash')) u.rating = 4.0;
      }
    });
  }

  saveData();

  return res.json({
    status: 'success',
    success: true,
    data: invites
  });
}

export async function createPublicAdvisorRatingInvite(req: Request, res: Response) {
  loadData();
  const { id, date, customerName, customerMobile, advisorName, propertyTitle, deliveryChannel, customNote } = req.body;

  if (!(dbStore.data as any).rating_invites) {
    (dbStore.data as any).rating_invites = [];
  }

  const newInvite = {
    id: id || `SRM-RAT-INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    customerName: customerName || 'Valued Customer',
    customerMobile: customerMobile || '+91 90513 22932',
    customerPhone: customerMobile || '+91 90513 22932',
    advisorName: advisorName || 'Punita Roy',
    propertyTitle: propertyTitle || 'GAJAPATI APARTMENT',
    rating: null,
    feedbackText: customNote || null,
    comment: customNote || null,
    status: 'DELIVERED_PENDING_REVIEW',
    deliveryChannel: deliveryChannel || 'WHATSAPP',
    channel: deliveryChannel || 'WHATSAPP',
    created_at: new Date().toISOString()
  };

  (dbStore.data as any).rating_invites.unshift(newInvite);
  saveData();
  syncToMongoDB(dbStore.data).catch(() => {});

  return res.json({
    status: 'success',
    success: true,
    message: 'Rating invite created',
    data: newInvite
  });
}

export async function submitPublicAdvisorRating(req: Request, res: Response) {
  loadData();
  const { advisorName, rating, customerName, customerPhone, comment, propertyTitle } = req.body;

  if (!advisorName || !rating) {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: 'Advisor name and rating are required.'
    });
  }

  const ratingNum = Math.min(5, Math.max(1, Number(rating) || 5));

  if (!(dbStore.data as any).rating_invites) {
    (dbStore.data as any).rating_invites = [];
  }
  const ratingInvites: any[] = (dbStore.data as any).rating_invites;

  // Search if there is a pending invite dispatch for this specific customer and advisor
  const existingPending = ratingInvites.find((i: any) => {
    const isSameAdvisor = i.advisorName?.toLowerCase() === String(advisorName).toLowerCase();
    if (!isSameAdvisor) return false;
    const isPending = i.status === 'DELIVERED_PENDING_REVIEW' || i.rating === null || i.rating === undefined;
    if (!isPending) return false;

    const matchesName = customerName && i.customerName && (
      i.customerName.toLowerCase().trim() === String(customerName).toLowerCase().trim() ||
      i.customerName.toLowerCase().includes(String(customerName).toLowerCase().trim()) ||
      String(customerName).toLowerCase().includes(i.customerName.toLowerCase().trim())
    );
    const matchesPhone = customerPhone && (i.customerMobile || i.customerPhone) && (
      String(i.customerMobile || i.customerPhone).includes(String(customerPhone)) ||
      String(customerPhone).includes(String(i.customerMobile || i.customerPhone))
    );

    return matchesName || matchesPhone;
  });

  const uniqueId = `SRM-RAT-INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const newLogItem = {
    id: existingPending ? existingPending.id : uniqueId,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    customerName: customerName || (existingPending ? existingPending.customerName : 'Website Home-Buyer'),
    customerMobile: customerPhone || (existingPending ? (existingPending.customerMobile || existingPending.customerPhone) : '+91 98300 12345'),
    customerPhone: customerPhone || (existingPending ? (existingPending.customerPhone || existingPending.customerMobile) : '+91 98300 12345'),
    advisorName: advisorName,
    propertyTitle: propertyTitle || (existingPending ? existingPending.propertyTitle : 'GAJAPATI APARTMENT'),
    rating: ratingNum,
    feedbackText: comment || 'Rated via Website Consultation Modal',
    comment: comment || 'Rated via Website Consultation Modal',
    status: 'VERIFIED_AND_RATED',
    statusLabel: `RATED ★ ${ratingNum}.0`,
    deliveryChannel: existingPending ? (existingPending.deliveryChannel || existingPending.channel) : 'DIRECT_WEBSITE_FORM',
    channel: existingPending ? (existingPending.channel || existingPending.deliveryChannel) : 'DIRECT_WEBSITE_FORM',
    created_at: new Date().toISOString()
  };

  if (existingPending) {
    Object.assign(existingPending, newLogItem);
  } else {
    ratingInvites.unshift(newLogItem);
  }

  // Calculate dynamic average rating for this advisor across all their reviews
  const advisorReviews = ratingInvites.filter((i: any) => 
    i.advisorName?.toLowerCase() === String(advisorName).toLowerCase() && 
    typeof i.rating === 'number' && !isNaN(i.rating)
  );

  const advisorAvgRating = advisorReviews.length > 0
    ? Number((advisorReviews.reduce((sum: number, i: any) => sum + i.rating, 0) / advisorReviews.length).toFixed(1))
    : ratingNum;

  // Update user rating in DB
  const targetUser = dbStore.data.users.find(u => 
    (u.full_name && u.full_name.toLowerCase().includes(String(advisorName).toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(String(advisorName).toLowerCase()))
  );
  if (targetUser) {
    (targetUser as any).rating = advisorAvgRating;
  }

  if (!dbStore.data.site_visits) dbStore.data.site_visits = [];
  dbStore.data.site_visits.unshift({
    id: uuidv4(),
    site_visit_code: `SRM-RATING-${Math.floor(100000 + Math.random() * 900000)}`,
    customer_name: customerName || 'Website Customer',
    customer_number: customerPhone || '+91 98300 12345',
    sales_executive: advisorName,
    visit_status: 'RATED',
    feedback_notes: `Rating: ${ratingNum}/5 Stars. Feedback: ${comment || 'No comment'}`,
    created_at: new Date().toISOString()
  });

  saveData();
  syncToMongoDB(dbStore.data).catch(() => {});

  return res.status(200).json({
    status: 'success',
    success: true,
    message: 'Advisor rating submitted successfully!',
    data: {
      advisorName,
      rating: ratingNum,
      advisorAvgRating,
      customerName,
      invites: ratingInvites
    }
  });
}

export async function clearPublicAdvisorRatings(req: Request, res: Response) {
  loadData();
  (dbStore.data as any).rating_invites = [];
  if (Array.isArray(dbStore.data.site_visits)) {
    dbStore.data.site_visits = dbStore.data.site_visits.filter((v: any) => 
      v.visit_status !== 'RATED' && !String(v.site_visit_code || '').includes('RATING') && !String(v.feedback_notes || '').includes('Rating')
    );
  }
  saveData();

  try {
    const { RatingInviteModel, SiteVisitModel } = await import('../db/mongoPersistence.js');
    await RatingInviteModel.deleteMany({});
    await SiteVisitModel.deleteMany({
      $or: [
        { visit_status: 'RATED' },
        { site_visit_code: { $regex: 'RATING', $options: 'i' } }
      ]
    });
  } catch (err: any) {
    console.warn('MongoDB clear error:', err?.message);
  }

  return res.json({
    status: 'success',
    success: true,
    message: 'All advisor rating invites and feedback logs cleared from database and MongoDB Atlas!'
  });
}

export async function deletePublicAdvisorRatingById(req: Request, res: Response) {
  loadData();
  const { id } = req.params;
  const targetId = String(id).trim();

  if (!(dbStore.data as any).rating_invites) {
    (dbStore.data as any).rating_invites = [];
  }

  // Find target invite details for matching
  const targetInvite = ((dbStore.data as any).rating_invites || []).find((item: any) => 
    String(item.id) === targetId || String(item._id) === targetId
  );
  const targetName = targetInvite ? String(targetInvite.customerName || '').toLowerCase() : '';
  const targetMobile = targetInvite ? String(targetInvite.customerMobile || targetInvite.customerPhone || '').replace(/\D/g, '') : '';

  (dbStore.data as any).rating_invites = (dbStore.data as any).rating_invites.filter((item: any) => {
    const matchId = String(item.id) === targetId || String(item._id) === targetId;
    const matchName = targetName && String(item.customerName || '').toLowerCase() === targetName;
    const matchMob = targetMobile && String(item.customerMobile || item.customerPhone || '').replace(/\D/g, '') === targetMobile;
    return !matchId && !matchName && !matchMob;
  });

  if (Array.isArray(dbStore.data.site_visits)) {
    dbStore.data.site_visits = dbStore.data.site_visits.filter((v: any) => {
      const matchId = String(v.id || v.site_visit_code) === targetId;
      const matchName = targetName && String(v.customer_name || v.customerName || '').toLowerCase() === targetName;
      return !matchId && !matchName;
    });
  }

  // Recalculate user ratings
  if (Array.isArray(dbStore.data.users)) {
    const invites: any[] = (dbStore.data as any).rating_invites;
    dbStore.data.users.forEach((u: any) => {
      const uName = (u.full_name || u.username || '').toLowerCase();
      const uReviews = invites.filter((i: any) => {
        const advName = (i.advisorName || '').toLowerCase();
        return (advName.includes(uName) || uName.includes(advName)) && 
          i.rating !== null && i.rating !== undefined && !isNaN(Number(i.rating));
      });
      if (uReviews.length > 0) {
        const avg = uReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / uReviews.length;
        u.rating = Number(avg.toFixed(1));
      } else {
        if (uName.includes('punita')) u.rating = 5.0;
        else if (uName.includes('abinash')) u.rating = 4.0;
      }
    });
  }

  saveData();

  try {
    const { RatingInviteModel, SiteVisitModel } = await import('../db/mongoPersistence.js');
    await RatingInviteModel.deleteMany({
      $or: [
        { id: targetId },
        { _id: targetId },
        ...(targetName ? [{ customerName: { $regex: new RegExp(`^${targetName}$`, 'i') } }] : [])
      ]
    });
    if (targetName) {
      await SiteVisitModel.deleteMany({
        $or: [
          { site_visit_code: targetId },
          { customer_name: { $regex: new RegExp(`^${targetName}$`, 'i') } }
        ]
      });
    }
  } catch (err: any) {
    console.warn('MongoDB delete error:', err?.message);
  }

  return res.json({
    status: 'success',
    success: true,
    message: `Rating invite ${targetId} deleted successfully`,
    data: (dbStore.data as any).rating_invites
  });
}
