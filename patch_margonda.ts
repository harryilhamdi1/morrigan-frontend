import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

async function patchMargonda() {
    console.log('🔧 Repopulating Margonda Data for Demos...');

    // Find Margonda Store
    const { data: stores, error: sErr } = await supabase.from('stores').select('id, name').ilike('name', '%Margonda Depok%');
    if (sErr || !stores || stores.length === 0) {
        console.log("Could not find Margonda Store");
        return;
    }
    const storeMargonda = stores[0];

    // Wipe existing mock waves for this store just in case
    await supabase.from('wave_evaluations').delete().eq('store_id', storeMargonda.id);
    await supabase.from('action_plans').delete().eq('store_id', storeMargonda.id);

    // Insert Waves
    console.log('📊 Creating Wave Evaluations...');
    const { data: waves, error: wErr } = await supabase.from('wave_evaluations').insert([
        { store_id: storeMargonda.id, wave_name: 'Wave 3 2024', total_score: 84, score_a: 90, score_e: 50 },
        { store_id: storeMargonda.id, wave_name: 'Wave 4 2024', total_score: 91, score_a: 95, score_e: 55 },
        { store_id: storeMargonda.id, wave_name: 'Wave 1 2025', total_score: 96, score_a: 100, score_b: 85, score_c: 90, score_d: 75, score_e: 60, score_f: 80, score_g: 100, score_h: 88, score_i: 95, score_j: 100, score_k: 100 }
    ]).select();
    if (wErr) throw wErr;
    const latestWave = waves[2];

    // Insert Actions
    console.log('🎯 Creating Action Plans...');
    const now = new Date();
    const pastOverdue = new Date(now);
    pastOverdue.setDate(pastOverdue.getDate() - 5);

    const futureDue = new Date(now);
    futureDue.setDate(futureDue.getDate() + 7);

    await supabase.from('action_plans').insert([
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

    console.log('🎉 Done repo-patching Margonda!');
}

patchMargonda();
