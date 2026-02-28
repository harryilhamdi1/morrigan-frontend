import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkData() {
    console.log("=== SUPABASE DATA AUDIT (Service Role) ===\n");

    const { count: regionCount } = await supabase.from('regions').select('*', { count: 'exact', head: true });
    console.log(`Regions count: ${regionCount}`);

    const { count: branchCount } = await supabase.from('branches').select('*', { count: 'exact', head: true });
    console.log(`Branches count: ${branchCount}`);

    const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    console.log(`Stores count: ${storeCount}`);

    const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
    console.log(`User Profiles count: ${userCount}`);

    const { count: waveCount } = await supabase.from('wave_evaluations').select('*', { count: 'exact', head: true });
    console.log(`Wave Evaluations count: ${waveCount}`);

    const { count: apCount } = await supabase.from('action_plans').select('*', { count: 'exact', head: true });
    console.log(`Action Plans count: ${apCount}`);

    // Show sample users
    const { data: users } = await supabase.from('user_profiles').select('email, full_name, role').limit(10);
    console.log("\n=== SAMPLE USERS (First 10) ===");
    users?.forEach(u => console.log(`  ${u.role} | ${u.full_name} | ${u.email}`));

    // Show regions
    const { data: regions } = await supabase.from('regions').select('name');
    console.log("\n=== REGIONS ===");
    regions?.forEach(r => console.log(`  ${r.name}`));
}

checkData();
