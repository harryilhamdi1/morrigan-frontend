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

async function patchWave() {
    console.log('🔧 Patching wave_evaluations...');

    const { data: waves, error } = await supabase.from('wave_evaluations').select('id, wave_name');

    if (error) {
        console.error('Error fetching waves:', error);
        return;
    }

    for (const wave of waves) {
        const { error: updateErr } = await supabase.from('wave_evaluations')
            .update({
                score_a: 100,
                score_b: 85,
                score_c: 90,
                score_d: 75,
                score_e: 60,
                score_f: 80,
                score_g: 100,
                score_h: 88,
                score_i: 95,
                score_j: 100,
                score_k: 100
            })
            .eq('id', wave.id);

        if (updateErr) {
            console.error(`Failed to update wave ${wave.id}:`, updateErr);
        } else {
            console.log(`✅ Patched wave ${wave.wave_name} (${wave.id})`);
        }
    }

    console.log('🎉 Done patching!');
}

patchWave();
