import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://avishekdas075_db_user:11to1FBkkfSvKsse@cluster0.fathkrm.mongodb.net/swaramayi_crm?retryWrites=true&w=majority';

async function main() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoURI);
  console.log('✅ Connected to MongoDB Atlas!');

  if (!mongoose.connection.db) {
    console.log('DB connection object undefined');
    return;
  }

  const db = mongoose.connection.db;

  const targetCollections = [
    'customers',
    'properties',
    'leads',
    'matchingrequests',
    'costsheets',
    'sitevisits',
    'projectvisitagreements',
    'invoices',
    'bookings',
    'agreements',
    'followups',
    'brokerages',
    'sourcingrequests',
    'developers',
    'ratinginvites'
  ];

  console.log('🧹 Wiping all data collections in MongoDB Atlas...');
  for (const colName of targetCollections) {
    try {
      const exists = await db.listCollections({ name: colName }).hasNext();
      if (exists) {
        const res = await db.collection(colName).deleteMany({});
        console.log(`🗑️ Cleared ${res.deletedCount} documents from '${colName}'`);
      }
    } catch (err) {
      console.error(`Error clearing ${colName}:`, err);
    }
  }

  // Ensure users collection contains ONLY 1 Super Admin user
  const superAdminUser = {
    id: 'USR-01',
    username: 'Avishek Das (Super Admin)',
    full_name: 'Avishek Das',
    email: 'admin@swaramayi.com',
    password: 'Swaramayi@2026',
    mobile: '+91 98490 00001',
    role: 'SUPER_ADMIN',
    designation: 'Managing Director & Founder',
    branch_name: 'Head Office (Kolkata)',
    department: 'Executive Board',
    team_name: 'Corporate Leadership Squad',
    manager_name: 'Self',
    is_active: true,
    user_status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00.000Z'
  };

  const usersColExists = await db.listCollections({ name: 'users' }).hasNext();
  if (usersColExists) {
    await db.collection('users').deleteMany({});
    await db.collection('users').insertOne(superAdminUser);
    console.log('👑 Users collection reset: Left ONLY 1 Super Admin user (Avishek Das)');
  }

  console.log('\n--- ALL MONGODB ATLAS COLLECTIONS STATUS AFTER RESET ---');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`Collection '${c.name}': ${count} docs`);
  }

  await mongoose.disconnect();
  console.log('✅ MongoDB Atlas Data Reset Complete!');
}

main().catch(console.error);
