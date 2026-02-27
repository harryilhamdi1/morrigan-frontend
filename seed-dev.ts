import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env relative to the project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// CRITICAL: We need the Service Role Key to bypass RLS for seeding, not the Anon Key!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    console.error('Make sure you have both set up in your .env file for the seeder to bypass RLS.');
    process.exit(1);
}

// Create a Supabase client with the Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function clearDatabase() {
    console.log('🧹 Clearing existing data (Cascade deletes will handle child records)...');
    await supabase.from('regions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // We also need to manually clean up auth users as they don't cascade easily from public tables
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (users && users.users.length > 0) {
        console.log(`🧹 Deleting ${users.users.length} auth users...`);
        for (const u of users.users) {
            await supabase.auth.admin.deleteUser(u.id);
        }
    }
}

async function seed() {
    try {
        await clearDatabase();
        console.log('🌱 Starting Seed Process with MPP Data...');

        // 1. Create Regions
        const { data: regions, error: rErr } = await supabase.from('regions').insert([
            { name: 'REGION 1' },
            { name: 'REGION 2' }
        ]).select();
        if (rErr) throw rErr;
        const [region1, region2] = regions;

        // 2. Create Branches
        const { data: branches, error: bErr } = await supabase.from('branches').insert([
            { name: 'DKI 4', region_id: region1.id },
            { name: 'DKI 3', region_id: region1.id },
            { name: 'JAWA BARAT 2', region_id: region2.id },
            { name: 'JAWA BARAT 1', region_id: region2.id }
        ]).select();
        if (bErr) throw bErr;
        const [branchDki4, branchDki3, branchJb2, branchJb1] = branches;

        // 3. Create Stores
        const { data: stores, error: sErr } = await supabase.from('stores').insert([
            { name: '2019 - EIGER Adventure Flagship Store Margonda Depok', store_code: '2019', branch_id: branchDki4.id, league_status: 'Gold League' },
            { name: '2065 - EIGER Adventure Store Juanda Ciputat Tangerang', store_code: '2065', branch_id: branchDki3.id, league_status: 'Silver League' },
            { name: '2002 - EIGER Adventure Flagship Store Sumatera Bandung', store_code: '2002', branch_id: branchJb2.id, league_status: 'Rising Star' },
            { name: '2004 - EIGER Adventure Flagship Store Cihampelas Bandung', store_code: '2004', branch_id: branchJb1.id, league_status: 'Gold League' }
        ]).select();
        if (sErr) throw sErr;
        const [storeMargonda, storeCiputat, storeSumatera, storeCihampelas] = stores;

        // 4. Create Users (Auth & Profiles)
        console.log('👤 Creating Test Users (Password: eiger123)...');
        const testUsers = [
            { email: 'lorenzo.margonda@eiger.com', name: 'LORENZO PAULUS JR (Store Head)', role: 'Store Head', store_id: storeMargonda.id },
            { email: 'leonardo.dki4@eiger.com', name: 'LEONARDO HARLIM (Branch Head)', role: 'Branch Head', branch_id: branchDki4.id },
            { email: 'wisnu.reg1@eiger.com', name: 'WISNU ADHITYA FIRMANDA (Regional Director)', role: 'Regional Director', region_id: region1.id },
            { email: 'c.level@eiger.com', name: 'Bpk. Ronny (CEO)', role: 'Superadmin' }
        ];

        for (const tu of testUsers) {
            // Create Auth User
            const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
                email: tu.email,
                password: 'eiger123',
                email_confirm: true
            });
            if (authErr) throw authErr;

            // Create Profile Mapping
            const profilePayload: any = {
                id: authData.user.id,
                email: tu.email,
                full_name: tu.name,
                role: tu.role
            };
            if (tu.store_id) profilePayload.store_id = tu.store_id;
            if (tu.branch_id) profilePayload.branch_id = tu.branch_id;
            if (tu.region_id) profilePayload.region_id = tu.region_id;

            const { error: pErr } = await supabase.from('user_profiles').insert(profilePayload);
            if (pErr) throw pErr;
        }

        // 5. Create Wave Evaluations for Margonda
        console.log('📊 Creating Wave Evaluations...');
        const { data: waves, error: wErr } = await supabase.from('wave_evaluations').insert([
            { store_id: storeMargonda.id, wave_name: 'Wave 3 2024', total_score: 84, score_a: 90, score_e: 50 },
            { store_id: storeMargonda.id, wave_name: 'Wave 4 2024', total_score: 91, score_a: 95, score_e: 55 },
            { store_id: storeMargonda.id, wave_name: 'Wave 1 2025', total_score: 96, score_a: 100, score_b: 85, score_c: 90, score_d: 75, score_e: 60, score_f: 80, score_g: 100, score_h: 88, score_i: 95, score_j: 100, score_k: 100 }
        ]).select();
        if (wErr) throw wErr;
        const latestWave = waves[2]; // Wave 1 2025

        // 6. Create Action Plans (Mission Board items) for Margonda
        console.log('🎯 Creating Action Plans...');
        const now = new Date();
        const pastOverdue = new Date(now);
        pastOverdue.setDate(pastOverdue.getDate() - 5); // 5 days late

        const futureDue = new Date(now);
        futureDue.setDate(futureDue.getDate() + 7); // 7 days from now

        const { error: apErr } = await supabase.from('action_plans').insert([
            {
                store_id: storeMargonda.id,
                wave_id: latestWave.id,
                plan_type: 'Quantitative',
                journey_name: 'E. Needs Analysis',
                status: 'Requires Action',
                due_date: pastOverdue.toISOString(), // TURTLE PENALTY SCENARIO
                failed_items_history: ["Retail Assistant tidak menawarkan produk tambahan yang relevan."]
            },
            {
                store_id: storeMargonda.id,
                wave_id: latestWave.id,
                plan_type: 'Quantitative',
                journey_name: 'D. Product Knowledge',
                status: 'Waiting for Approval',
                due_date: futureDue.toISOString(),
                failed_items_history: ["Retail Assistant ragu saat menjelaskan spesifikasi teknis."],
                rca_description: "Staf baru Riko belum ikut training bulanan.",
                action_strategy: "Training online besok pagi jam 09:00.",
                pic_name: "Riko"
            }
        ]);
        if (apErr) throw apErr;

        console.log('✅ Seed completed successfully!');
        console.log('Login with: lorenzo.margonda@eiger.com | Password: eiger123');

    } catch (err) {
        console.error('❌ SEED ERROR:', err);
    }
}

seed();
