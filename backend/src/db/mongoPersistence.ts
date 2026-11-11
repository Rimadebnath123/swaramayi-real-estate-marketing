import mongoose from 'mongoose';

// Flexible options schema for all collections
const options = { timestamps: true, strict: false };

// Mongoose Schemas & Models
export const UserSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const PropertySchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const CustomerSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const LeadSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const BookingSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const InvoiceSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const AgreementSchema = new mongoose.Schema({ id: { type: String, unique: true, sparse: true } }, options);
export const SiteVisitSchema = new mongoose.Schema({ id: { type: String, unique: true, sparse: true } }, options);
export const BrokerageSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const FollowupSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const TeamSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const BranchSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);

export const CostSheetSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const MatchingRequestSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const ProjectVisitAgreementSchema = new mongoose.Schema({ id: { type: String, unique: true, sparse: true } }, options);
export const SourcingRequestSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const DeveloperSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const RatingInviteSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const RecycleBinSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const FileSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);
export const AgencyBankDetailSchema = new mongoose.Schema({ id: { type: String, unique: true } }, options);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const PropertyModel = mongoose.models.Property || mongoose.model('Property', PropertySchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const LeadModel = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
export const AgreementModel = mongoose.models.Agreement || mongoose.model('Agreement', AgreementSchema);
export const SiteVisitModel = mongoose.models.SiteVisit || mongoose.model('SiteVisit', SiteVisitSchema);
export const BrokerageModel = mongoose.models.Brokerage || mongoose.model('Brokerage', BrokerageSchema);
export const FollowupModel = mongoose.models.Followup || mongoose.model('Followup', FollowupSchema);
export const TeamModel = mongoose.models.Team || mongoose.model('Team', TeamSchema);
export const BranchModel = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
export const CostSheetModel = mongoose.models.CostSheet || mongoose.model('CostSheet', CostSheetSchema);
export const MatchingRequestModel = mongoose.models.MatchingRequest || mongoose.model('MatchingRequest', MatchingRequestSchema);
export const ProjectVisitAgreementModel = mongoose.models.ProjectVisitAgreement || mongoose.model('ProjectVisitAgreement', ProjectVisitAgreementSchema);
export const SourcingRequestModel = mongoose.models.SourcingRequest || mongoose.model('SourcingRequest', SourcingRequestSchema);
export const DeveloperModel = mongoose.models.Developer || mongoose.model('Developer', DeveloperSchema);
export const RatingInviteModel = mongoose.models.RatingInvite || mongoose.model('RatingInvite', RatingInviteSchema);
export const RecycleBinModel = mongoose.models.RecycleBin || mongoose.model('RecycleBin', RecycleBinSchema);
export const FileModel = mongoose.models.File || mongoose.model('File', FileSchema);
export const AgencyBankDetailModel = mongoose.models.AgencyBankDetail || mongoose.model('AgencyBankDetail', AgencyBankDetailSchema, 'agency_bank_details');

// Helper function to sync array of records into a model (handles permanent deletions)
async function syncCollection(model: mongoose.Model<any>, records: any[]) {
  if (!records || !Array.isArray(records)) {
    return;
  }

  try {
    if (records.length === 0) {
      return;
    }

    // Extract valid record identifiers specific to model primary keys
    const recordConditions: any[] = [];

    records.forEach((r: any) => {
      if (r._id && mongoose.Types.ObjectId.isValid(String(r._id))) recordConditions.push({ _id: r._id });
      if (r.id) recordConditions.push({ id: String(r.id) });
      if (r.code) recordConditions.push({ code: String(r.code) });
      if (r.project_id) recordConditions.push({ project_id: String(r.project_id) });
      if (r.invoice_number) recordConditions.push({ invoice_number: String(r.invoice_number) });
      if (r.booking_code) recordConditions.push({ booking_code: String(r.booking_code) });
      if (r.agreement_code) recordConditions.push({ agreement_code: String(r.agreement_code) });
      if (r.customer_number && model.modelName === 'Customer') recordConditions.push({ customer_number: String(r.customer_number) });
      if (r.property_code && model.modelName === 'Property') recordConditions.push({ property_code: String(r.property_code) });
      if (r.lead_number && model.modelName === 'Lead') recordConditions.push({ lead_number: String(r.lead_number) });
      if (r.costSheetId) recordConditions.push({ costSheetId: String(r.costSheetId) });
      if (r.projectVisitAgreementId) recordConditions.push({ projectVisitAgreementId: String(r.projectVisitAgreementId) });
      if (r.pvaId) recordConditions.push({ pvaId: String(r.pvaId) });
      if (r.visitId) recordConditions.push({ visitId: String(r.visitId) });
      if (r.visitScheduleId) recordConditions.push({ visitScheduleId: String(r.visitScheduleId) });
      if (r.visitPlanId) recordConditions.push({ visitPlanId: String(r.visitPlanId) });
      if (r.planId) recordConditions.push({ planId: String(r.planId) });
      if (r.requestId) recordConditions.push({ requestId: String(r.requestId) });
      if (r.selectionId) recordConditions.push({ selectionId: String(r.selectionId) });
      if (r.team_name && model.modelName === 'Team') recordConditions.push({ team_name: String(r.team_name) });
      if (r.branch_name && model.modelName === 'Branch') recordConditions.push({ branch_name: String(r.branch_name) });
      if (r.name && (model.modelName === 'User' || model.modelName === 'Developer')) recordConditions.push({ name: String(r.name) });
    });


    // Upsert remaining active records
    const ops = records.map(rec => {
      let filter: any;
      if (model.modelName === 'CostSheet' && (rec.costSheetId || rec.id)) {
        filter = { costSheetId: String(rec.costSheetId || rec.id) };
      } else if (model.modelName === 'Customer' && rec.customer_number) {
        filter = { customer_number: String(rec.customer_number) };
      } else if (model.modelName === 'Lead' && rec.lead_number) {
        filter = { lead_number: String(rec.lead_number) };
      } else if (model.modelName === 'Property' && rec.property_code) {
        filter = { property_code: String(rec.property_code) };
      } else if (model.modelName === 'Booking') {
        filter = rec.id ? { $or: [{ id: String(rec.id) }, { booking_code: String(rec.booking_code) }] } : { booking_code: String(rec.booking_code) };
      } else if (model.modelName === 'Invoice' && rec.invoice_number) {
        filter = { invoice_number: String(rec.invoice_number) };
      } else if (model.modelName === 'Agreement' && (rec.agreement_code || rec.id)) {
        filter = { $or: [{ agreement_code: String(rec.agreement_code || rec.id) }, { id: String(rec.id || rec.agreement_code) }] };
      } else if (model.modelName === 'ProjectVisitAgreement' && (rec.projectVisitAgreementId || rec.id)) {
        filter = { $or: [{ projectVisitAgreementId: String(rec.projectVisitAgreementId || rec.id) }, { id: String(rec.id || rec.projectVisitAgreementId) }] };
      } else if (model.modelName === 'SiteVisit') {
        const vKey = rec.visitId || rec.visitScheduleId || rec.site_visit_code || rec.id;
        filter = vKey
          ? { $or: [{ visitId: String(vKey) }, { visitScheduleId: String(vKey) }, { id: String(vKey) }] }
          : (rec._id ? { _id: rec._id } : rec);
      } else if (rec.id) {
        filter = { id: String(rec.id) };
      } else {
        filter = rec.visitId ? { visitId: rec.visitId }
          : (rec.visitScheduleId ? { visitScheduleId: rec.visitScheduleId }
          : (rec.costSheetId ? { costSheetId: rec.costSheetId }
          : (rec.name ? { name: rec.name } : rec)));
      }
      
      const toSet = { ...rec };
      delete toSet._id;
      delete toSet.__v;
      if (model.modelName === 'User') {
        delete toSet.avatar; // Keep only profileImage; never store duplicate avatar field
      }
      if (model.modelName === 'CostSheet' && !toSet.id && toSet.costSheetId) {
        toSet.id = String(toSet.costSheetId);
      }
      if (model.modelName === 'SiteVisit') {
        const vKey = rec.visitId || rec.visitScheduleId || rec.site_visit_code || rec.id || `VISIT-${Date.now()}`;
        if (!toSet.id) toSet.id = String(vKey);
        if (!toSet.visitId) toSet.visitId = String(vKey);
        if (!toSet.visitScheduleId) toSet.visitScheduleId = String(vKey);
      }
      if (model.modelName === 'Agreement') {
        if (!toSet.id) toSet.id = String(toSet.agreement_code || `AGR-${Date.now()}`);
        if (!toSet.agreement_code) toSet.agreement_code = String(toSet.id);
      }
      if (model.modelName === 'ProjectVisitAgreement') {
        if (!toSet.id) toSet.id = String(toSet.projectVisitAgreementId || `PVA-${Date.now()}`);
        if (!toSet.projectVisitAgreementId) toSet.projectVisitAgreementId = String(toSet.id);
      }

      return {
        updateOne: {
          filter,
          update: { $set: toSet },
          upsert: true
        }
      };
    });

    if (ops.length > 0) {
      await model.bulkWrite(ops, { ordered: false });
    }

    if (model.modelName === 'Customer') {
      try {
        const allCustDocs = await model.find({});
        const seenCustNums = new Set<string>();
        const toDelete: any[] = [];
        for (const doc of allCustDocs) {
          const num = doc.customer_number;
          if (num) {
            if (seenCustNums.has(num)) {
              toDelete.push(doc._id);
            } else {
              seenCustNums.add(num);
            }
          }
        }
        if (toDelete.length > 0) {
          await model.deleteMany({ _id: { $in: toDelete } });
        }
      } catch (e) {}
    }
  } catch (err: any) {
    console.warn(`MongoDB Sync Note [${model.modelName}]:`, err.message);
  }
}

// Sync memory data to MongoDB Atlas
export async function syncToMongoDB(data: any) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    if (Array.isArray(data.users)) {
      if (data.users.length === 0) {
        await UserModel.deleteMany({
          id: { $ne: 'USR-01' },
          username: { $nin: ['admin', 'Avishek Das (Super Admin)'] }
        }).catch(() => {});
      } else {
        const activeIds = data.users.map((u: any) => String(u.id || '')).filter(Boolean);
        const activeUsernames = data.users.map((u: any) => String(u.username || '')).filter(Boolean);
        const activeEmails = data.users.map((u: any) => String(u.email || '')).filter(Boolean);
        await UserModel.deleteMany({
          $and: [
            { id: { $nin: activeIds } },
            { username: { $nin: activeUsernames } },
            { email: { $nin: activeEmails } },
            { id: { $ne: 'USR-01' } },
            { username: { $nin: ['admin', 'Avishek Das (Super Admin)'] } }
          ]
        }).catch(() => {});
      }
      await syncCollection(UserModel, data.users);
    }
    if (Array.isArray(data.properties) && data.properties.length > 0) {
      await syncCollection(PropertyModel, data.properties);
    }
    if (Array.isArray(data.customers)) {
      if (data.customers.length === 0) {
        await CustomerModel.deleteMany({});
      } else {
        const activeCustNums = data.customers.map((c: any) => String(c.customer_number || c.customerNumber || c.id || '')).filter(Boolean);
        const activeCustIds = data.customers.map((c: any) => String(c.id || c._id || '')).filter(Boolean);
        await CustomerModel.deleteMany({
          $and: [
            { customer_number: { $nin: activeCustNums } },
            { id: { $nin: [...activeCustNums, ...activeCustIds] } }
          ]
        }).catch(() => {});
      }
      await syncCollection(CustomerModel, data.customers);
    }
    if (Array.isArray(data.leads)) {
      if (data.leads.length === 0) {
        await LeadModel.deleteMany({});
      } else {
        const activeLeadNums = data.leads.map((l: any) => String(l.lead_number || l.id || '')).filter(Boolean);
        await LeadModel.deleteMany({
          lead_number: { $nin: activeLeadNums },
          id: { $nin: activeLeadNums }
        }).catch(() => {});
      }
      await syncCollection(LeadModel, data.leads);
    }
    if (Array.isArray(data.bookings)) {
      if (data.bookings.length === 0) {
        await BookingModel.deleteMany({});
      } else {
        const activeBkgCodes = data.bookings.map((b: any) => String(b.booking_code || b.id || '')).filter(Boolean);
        const activeBkgIds = data.bookings.map((b: any) => String(b.id || b.booking_code || '')).filter(Boolean);
        await BookingModel.deleteMany({
          $and: [
            { booking_code: { $nin: activeBkgCodes } },
            { id: { $nin: activeBkgIds } }
          ]
        }).catch(() => {});
      }
      await syncCollection(BookingModel, data.bookings);
    }
    if (Array.isArray(data.invoices)) await syncCollection(InvoiceModel, data.invoices);
    if (Array.isArray(data.agency_bank_details) || Array.isArray(data.bank_details)) {
      const bList = data.agency_bank_details || data.bank_details;
      await syncCollection(AgencyBankDetailModel, bList);
    }
    if (Array.isArray(data.agreements)) {
      if (data.agreements.length === 0) {
        await AgreementModel.deleteMany({});
      } else {
        const activeCodes = data.agreements.map((a: any) => String(a.agreement_code || a.id || '')).filter(Boolean);
        const activeIds = data.agreements.map((a: any) => String(a.id || a.agreement_code || '')).filter(Boolean);
        await AgreementModel.deleteMany({
          $and: [
            { agreement_code: { $nin: activeCodes } },
            { id: { $nin: activeIds } }
          ]
        }).catch(() => {});
      }
      await syncCollection(AgreementModel, data.agreements);
    }
    const siteVisitsList = Array.isArray(data.site_visits)
      ? data.site_visits
      : (Array.isArray(data.scheduledVisits)
        ? data.scheduledVisits
        : (Array.isArray(data.scheduled_visits) ? data.scheduled_visits : null));

    if (Array.isArray(siteVisitsList)) {
      if (siteVisitsList.length === 0) {
        await SiteVisitModel.deleteMany({});
      } else {
        const activeVisitIds = siteVisitsList
          .map((v: any) => String(v.visitId || v.visitScheduleId || v.site_visit_code || v.id || ''))
          .filter(Boolean);
        if (activeVisitIds.length > 0) {
          await SiteVisitModel.deleteMany({
            $and: [
              { visitId: { $nin: activeVisitIds } },
              { visitScheduleId: { $nin: activeVisitIds } },
              { id: { $nin: activeVisitIds } }
            ]
          }).catch(() => {});
        }
      }
      await syncCollection(SiteVisitModel, siteVisitsList);
    }
    if (Array.isArray(data.brokerage_records)) await syncCollection(BrokerageModel, data.brokerage_records);
    if (Array.isArray(data.followups)) await syncCollection(FollowupModel, data.followups);
    if (Array.isArray(data.teams)) await syncCollection(TeamModel, data.teams);
    if (Array.isArray(data.branches)) await syncCollection(BranchModel, data.branches);
    if (Array.isArray(data.cost_sheets)) await syncCollection(CostSheetModel, data.cost_sheets);
    if (Array.isArray(data.matching_requests)) {
      if (data.matching_requests.length === 0) {
        await MatchingRequestModel.deleteMany({});
      } else {
        const activeReqIds = data.matching_requests.map((r: any) => String(r.requestId || r.id || '')).filter(Boolean);
        const activeCustNums = data.matching_requests.map((r: any) => String(r.customerNumber || r.customer_number || '')).filter(Boolean);
        await MatchingRequestModel.deleteMany({
          $and: [
            { requestId: { $nin: activeReqIds } },
            { id: { $nin: activeReqIds } },
            ...(activeCustNums.length > 0 ? [{ customerNumber: { $nin: activeCustNums } }] : [])
          ]
        }).catch(() => {});
      }
      await syncCollection(MatchingRequestModel, data.matching_requests);
    }
    const pvaList = Array.isArray(data.pva_agreements) ? data.pva_agreements : (Array.isArray(data.project_visit_agreements) ? data.project_visit_agreements : null);
    if (Array.isArray(pvaList)) {
      if (pvaList.length === 0) {
        await ProjectVisitAgreementModel.deleteMany({});
      } else {
        const activePvaIds = pvaList.map((p: any) => String(p.projectVisitAgreementId || p.id || '')).filter(Boolean);
        const activeIds = pvaList.map((p: any) => String(p.id || p.projectVisitAgreementId || '')).filter(Boolean);
        await ProjectVisitAgreementModel.deleteMany({
          $and: [
            { projectVisitAgreementId: { $nin: activePvaIds } },
            { id: { $nin: activeIds } }
          ]
        }).catch(() => {});
      }
      await syncCollection(ProjectVisitAgreementModel, pvaList);
    }
    if (Array.isArray(data.sourcing_requests)) await syncCollection(SourcingRequestModel, data.sourcing_requests);
    if (Array.isArray(data.developers)) {
      if (data.developers.length === 0) {
        await DeveloperModel.deleteMany({});
      } else {
        const activeDevIds = data.developers.map((d: any) => String(d.id || '')).filter(Boolean);
        const activeDevNames = data.developers.map((d: any) => String(d.name || '')).filter(Boolean);
        await DeveloperModel.deleteMany({
          id: { $nin: activeDevIds },
          name: { $nin: activeDevNames }
        }).catch(() => {});
      }
      await syncCollection(DeveloperModel, data.developers);
    }
    if (Array.isArray(data.rating_invites)) await syncCollection(RatingInviteModel, data.rating_invites);
    if (Array.isArray(data.files)) {
      if (data.files.length === 0) {
        await FileModel.deleteMany({});
      } else {
        const currentIds = data.files.map((f: any) => String(f.id || f._id)).filter(Boolean);
        await FileModel.deleteMany({ id: { $nin: currentIds } });
        await syncCollection(FileModel, data.files);
      }
    }
    if (Array.isArray(data.recycled_items)) {
      if (data.recycled_items.length === 0) {
        await RecycleBinModel.deleteMany({});
      } else {
        const currentIds = data.recycled_items.map((r: any) => String(r.id)).filter(Boolean);
        await RecycleBinModel.deleteMany({ id: { $nin: currentIds } });
        await syncCollection(RecycleBinModel, data.recycled_items);
      }
    }

    const syncedKeys = Object.keys(data || {}).filter(k => Array.isArray(data[k]));
    console.log(`⚡ MongoDB Atlas Live Sync Complete (${syncedKeys.length > 0 ? syncedKeys.join(', ') : 'records'})`);
  } catch (e: any) {
    console.error('MongoDB Live Sync Error:', e.message);
  }
}

// Load existing data from MongoDB Atlas into memory store
export async function loadDataFromMongoDB() {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  try {
    const [
      mongoUsers,
      mongoProperties,
      mongoCustomers,
      mongoLeads,
      mongoBookings,
      mongoInvoices,
      mongoAgreements,
      mongoSiteVisits,
      mongoBrokerage,
      mongoFollowups,
      mongoTeams,
      mongoBranches,
      mongoCostSheets,
      mongoMatchingRequests,
      mongoPvaAgreements,
      mongoSourcingRequests,
      mongoDevelopers,
      mongoRatingInvites,
      mongoRecycledItems,
      mongoFiles,
      mongoAgencyBankDetails
    ] = await Promise.all([
      UserModel.find({}).lean(),
      PropertyModel.find({}).lean(),
      CustomerModel.find({}).lean(),
      LeadModel.find({}).lean(),
      BookingModel.find({}).lean(),
      InvoiceModel.find({}).lean(),
      AgreementModel.find({}).lean(),
      SiteVisitModel.find({}).lean(),
      BrokerageModel.find({}).lean(),
      FollowupModel.find({}).lean(),
      TeamModel.find({}).lean(),
      BranchModel.find({}).lean(),
      CostSheetModel.find({}).lean(),
      MatchingRequestModel.find({}).lean(),
      ProjectVisitAgreementModel.find({}).lean(),
      SourcingRequestModel.find({}).lean(),
      DeveloperModel.find({}).lean(),
      RatingInviteModel.find({}).lean(),
      RecycleBinModel.find({}).lean(),
      FileModel.find({}).lean(),
      AgencyBankDetailModel.find({}).lean()
    ]);

    console.log(`📥 Loaded existing data from MongoDB Atlas: ${mongoUsers.length} users, ${mongoTeams.length} teams, ${mongoBranches.length} branches, ${mongoProperties.length} properties, ${mongoCustomers.length} customers, ${mongoDevelopers.length} developers, ${mongoRatingInvites.length} rating invites`);

    // Dynamic validator to identify corrupted or explicitly flagged test records without hardcoded names
    const isTestRecord = (rec: any) => {
      if (!rec || typeof rec !== 'object') return true;
      // Dynamically flag records explicitly marked as test or demo
      if (rec.is_test === true || rec.is_demo === true || rec.is_dummy === true || rec.test_record === true) {
        return true;
      }
      const name = (rec.name || rec.full_name || rec.customer_name || '').toString().trim();
      const mob = (rec.mobile || rec.phone || '').toString().trim();
      const num = (rec.customer_number || rec.lead_number || rec.id || rec.customer_id || '').toString().trim();
      // Corrupt or blank records lacking any name, phone, or identification
      if (!name && !mob && !num) return true;
      return false;
    };

    const sanitizedCustomers = mongoCustomers.filter(c => !isTestRecord(c));
    const sanitizedLeads = mongoLeads.filter(l => !isTestRecord(l));

    // Dynamically delete corrupted/flagged test customer records by their database identifiers
    if (mongoCustomers.length > sanitizedCustomers.length) {
      const purgeCustIds: any[] = [];
      const purgeCustCustomIds: string[] = [];
      mongoCustomers.forEach((c: any) => {
        if (isTestRecord(c)) {
          if (c._id) purgeCustIds.push(c._id);
          if (c.id) purgeCustCustomIds.push(String(c.id));
          if (c.customer_number) purgeCustCustomIds.push(String(c.customer_number));
        }
      });
      const conditions: any[] = [];
      if (purgeCustIds.length > 0) conditions.push({ _id: { $in: purgeCustIds } });
      if (purgeCustCustomIds.length > 0) {
        conditions.push({ id: { $in: purgeCustCustomIds } });
        conditions.push({ customer_number: { $in: purgeCustCustomIds } });
      }
      if (conditions.length > 0) {
        CustomerModel.deleteMany({ $or: conditions }).catch(() => {});
      }
    }

    // Dynamically delete corrupted/flagged test lead records by their database identifiers
    if (mongoLeads.length > sanitizedLeads.length) {
      const purgeLeadIds: any[] = [];
      const purgeLeadCustomIds: string[] = [];
      mongoLeads.forEach((l: any) => {
        if (isTestRecord(l)) {
          if (l._id) purgeLeadIds.push(l._id);
          if (l.id) purgeLeadCustomIds.push(String(l.id));
          if (l.lead_number) purgeLeadCustomIds.push(String(l.lead_number));
        }
      });
      const conditions: any[] = [];
      if (purgeLeadIds.length > 0) conditions.push({ _id: { $in: purgeLeadIds } });
      if (purgeLeadCustomIds.length > 0) {
        conditions.push({ id: { $in: purgeLeadCustomIds } });
        conditions.push({ lead_number: { $in: purgeLeadCustomIds } });
      }
      if (conditions.length > 0) {
        LeadModel.deleteMany({ $or: conditions }).catch(() => {});
      }
    }

    // Exclude any properties that have been moved to the recycle bin
    const recycledPropCodes = new Set<string>();
    (mongoRecycledItems || []).forEach((r: any) => {
      if (r.id) recycledPropCodes.add(String(r.id).toLowerCase().trim());
      const orig = r.originalData || {};
      if (orig.property_code) recycledPropCodes.add(String(orig.property_code).toLowerCase().trim());
      if (orig.code) recycledPropCodes.add(String(orig.code).toLowerCase().trim());
      if (orig.id) recycledPropCodes.add(String(orig.id).toLowerCase().trim());
      if (r.property_code) recycledPropCodes.add(String(r.property_code).toLowerCase().trim());
      if (r.code) recycledPropCodes.add(String(r.code).toLowerCase().trim());
    });

    const activeMongoProperties = mongoProperties.filter((p: any) => {
      const pCode = String(p.property_code || p.code || '').toLowerCase().trim();
      const pId = String(p.id || p._id || '').toLowerCase().trim();
      if (pCode && recycledPropCodes.has(pCode)) return false;
      if (pId && recycledPropCodes.has(pId)) return false;
      return true;
    });

    // Clean up soft-deleted properties from PropertyModel collection if they are in recycle bin
    if (recycledPropCodes.size > 0) {
      const codesArr = Array.from(recycledPropCodes);
      PropertyModel.deleteMany({
        $or: [
          { property_code: { $in: codesArr.map(c => new RegExp(`^${c}$`, 'i')) } },
          { id: { $in: codesArr.map(c => new RegExp(`^${c}$`, 'i')) } }
        ]
      }).catch(() => {});
    }

    return {
      users: mongoUsers,
      properties: activeMongoProperties,
      customers: sanitizedCustomers,
      leads: sanitizedLeads,
      bookings: mongoBookings,
      invoices: mongoInvoices,
      agreements: mongoAgreements,
      site_visits: mongoSiteVisits,
      brokerage_records: mongoBrokerage,
      followups: mongoFollowups,
      teams: mongoTeams,
      branches: mongoBranches,
      cost_sheets: mongoCostSheets,
      matching_requests: mongoMatchingRequests,
      pva_agreements: mongoPvaAgreements,
      sourcing_requests: mongoSourcingRequests,
      developers: mongoDevelopers,
      rating_invites: mongoRatingInvites,
      recycled_items: mongoRecycledItems,
      files: mongoFiles,
      agency_bank_details: mongoAgencyBankDetails || [],
      bank_details: mongoAgencyBankDetails || []
    };
  } catch (e: any) {
    console.warn('MongoDB Data Loading Warning:', e.message);
    return null;
  }
}
