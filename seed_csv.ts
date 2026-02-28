import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import Papa from 'papaparse';

// Load .env relative to the project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const DEFAULT_PASSWORD = 'password123';

async function clearDatabase() {
    console.log('🧹 Clearing existing data (bottom-up order to respect FK constraints)...');

    // Delete child tables first
    const { error: e1 } = await supabase.from('action_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e1) console.warn('  action_plans clear:', e1.message);
    else console.log('  ✅ action_plans cleared');

    const { error: e2 } = await supabase.from('wave_evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e2) console.warn('  wave_evaluations clear:', e2.message);
    else console.log('  ✅ wave_evaluations cleared');

    const { error: e3 } = await supabase.from('user_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e3) console.warn('  user_profiles clear:', e3.message);
    else console.log('  ✅ user_profiles cleared');

    const { error: e4 } = await supabase.from('stores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e4) console.warn('  stores clear:', e4.message);
    else console.log('  ✅ stores cleared');

    const { error: e5 } = await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e5) console.warn('  branches clear:', e5.message);
    else console.log('  ✅ branches cleared');

    const { error: e6 } = await supabase.from('regions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (e6) console.warn('  regions clear:', e6.message);
    else console.log('  ✅ regions cleared');

    // Clean up auth users
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (users && users.users.length > 0) {
        console.log(`🧹 Deleting ${users.users.length} auth users...`);
        for (const u of users.users) {
            await supabase.auth.admin.deleteUser(u.id);
        }
    }
    console.log('🧹 Database cleared successfully!');
}

async function seedFromCsv() {
    try {
        await clearDatabase();

        console.log('🌱 Parsing CSV Files...');
        const storeCsvPath = resolve(process.cwd(), 'CSV/Retail MPP Tracking (National) - For Supabase User Management (Store).csv');
        const mgmtCsvPath = resolve(process.cwd(), 'CSV/Retail MPP Tracking (National) - For Supabase User Management (Management and HCBP).csv');

        const storeFile = fs.readFileSync(storeCsvPath, 'utf8');
        const mgmtFile = fs.readFileSync(mgmtCsvPath, 'utf8');

        // Note: Papa parse headers
        // Store CSV headers: User ID,Site Code,Display Name,Rank,Role,City,Province,Role,Region,Branch
        const parsedStore = Papa.parse(storeFile, { header: true, skipEmptyLines: true });
        // Mgmt CSV headers: User ID,Display Name,Rank,Role
        const parsedMgmt = Papa.parse(mgmtFile, { header: true, skipEmptyLines: true });

        const storeData = parsedStore.data as any[];
        const mgmtData = parsedMgmt.data as any[];

        // 1. Build Dictionary of Regions and Branches to prevent duplicate inserts
        console.log('🌍 Building Regions & Branches Hierarchy...');
        const regionsSet = new Set<string>();
        const branchesMap = new Map<string, string>(); // branchName -> regionName

        // Extract from Store CSV
        for (const row of storeData) {
            if (row['Region']) regionsSet.add(row['Region'].trim());
            if (row['Branch'] && row['Region']) {
                branchesMap.set(row['Branch'].trim(), row['Region'].trim());
            }
        }

        // Insert Regions
        const regionIdMap = new Map<string, string>(); // name -> id
        for (const region of regionsSet) {
            const { data, error } = await supabase.from('regions').insert({ name: region }).select('id').single();
            if (error) throw new Error(`Region ${region} error: ${error.message}`);
            regionIdMap.set(region, data.id);
        }

        // Insert Branches
        const branchIdMap = new Map<string, string>(); // name -> id
        for (const [branch, regionName] of branchesMap.entries()) {
            const regionId = regionIdMap.get(regionName);
            if (!regionId) continue;
            const { data, error } = await supabase.from('branches').insert({ name: branch, region_id: regionId }).select('id').single();
            if (error) throw new Error(`Branch ${branch} error: ${error.message}`);
            branchIdMap.set(branch, data.id);
        }

        // 2. Insert Stores
        console.log('🏪 Inserting Stores...');
        const storeIdMap = new Map<string, string>(); // site code -> id
        for (const row of storeData) {
            const siteCode = row['Site Code']?.trim();
            const branchName = row['Branch']?.trim();
            const displayName = row['Display Name']?.trim();

            if (!siteCode || !branchName) continue;

            const branchId = branchIdMap.get(branchName);
            if (!branchId) continue;

            const { data, error } = await supabase.from('stores').insert({
                branch_id: branchId,
                store_code: siteCode,
                name: displayName,
                league_status: 'Rising Star'
            }).select('id').single();

            if (error) throw new Error(`Store ${siteCode} error: ${error.message}`);
            storeIdMap.set(siteCode, data.id);
        }

        // 3. Create Users
        console.log('👤 Creating Auth Users & Profiles...');

        // Helper function for user creation
        const createUser = async (userId: string, fullName: string, roleMap: string, storeId?: string, branchId?: string, regionId?: string) => {
            const email = `${userId.toLowerCase().replace(/\s+/g, '_')}@eiger.com`;

            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password: DEFAULT_PASSWORD,
                email_confirm: true
            });

            if (authError) {
                console.error(`Auth Error for ${email}:`, authError.message);
                return;
            }

            const profile: any = {
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: roleMap,
            };

            if (storeId) profile.store_id = storeId;
            if (branchId) profile.branch_id = branchId;
            if (regionId) profile.region_id = regionId;

            const { error: profileError } = await supabase.from('user_profiles').insert(profile);
            if (profileError) {
                console.error(`Profile Error for ${email}:`, profileError.message);
            }
        };

        // Mgmt Users
        for (const row of mgmtData) {
            const userId = row['User ID']?.trim();
            const fullName = row['Display Name']?.trim();
            const csvRole = row['Role']?.toLowerCase()?.trim();

            if (!userId) continue;

            let dbRole = 'HCBP';
            let branchId, regionId;

            if (csvRole === 'superadmin') dbRole = 'Superadmin';
            else if (csvRole === 'admin') dbRole = 'HCBP';
            else if (csvRole === 'regional') {
                dbRole = 'Regional Director';
                // Try to find region Id (e.g. region_1 -> REGION 1)
                const regionMatches = Array.from(regionIdMap.keys()).filter(r => r.toLowerCase().includes(userId.replace('_', ' ')));
                if (regionMatches.length > 0) regionId = regionIdMap.get(regionMatches[0]);
            }
            else if (csvRole === 'branch') {
                dbRole = 'Branch Head';
                // Try to find branch Id (e.g. dki_1 -> DKI 1)
                const bSearch = userId.replace('_', ' ').toLowerCase();
                const branchMatches = Array.from(branchIdMap.keys()).filter(b => b.toLowerCase().includes(bSearch));
                if (branchMatches.length > 0) branchId = branchIdMap.get(branchMatches[0]);
            }

            await createUser(userId, fullName, dbRole, undefined, branchId, regionId);
        }

        // Store Users
        for (const row of storeData) {
            const userId = row['User ID']?.trim();
            const fullName = row['Display Name']?.trim();
            const siteCode = row['Site Code']?.trim();

            if (!userId || !siteCode) continue;

            const storeId = storeIdMap.get(siteCode);
            await createUser(userId, fullName, 'Store Head', storeId);
        }

        console.log('✅ CSV Parse and Seed Completed Successfully!');
        console.log(`Default Password for all users: ${DEFAULT_PASSWORD}`);

    } catch (err) {
        console.error('❌ CSV SEED ERROR:', err);
    }
}

seedFromCsv();
