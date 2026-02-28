import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import Papa from 'papaparse';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// =============================================
// SECTION ITEM CODES (from scoring_logic_vFinal.js)
// =============================================
const SECTION_ITEMS: Record<string, { codes: number[], exclude: number[] }> = {
    'A': { codes: [759166, 759167, 759168, 759169, 759170, 759171], exclude: [] },
    'B': { codes: [759174, 759175, 759176, 759177, 759178, 759179], exclude: [] },
    'C': { codes: [759181, 759182, 759183, 759184, 759185, 759186, 759187, 759188, 759189, 759190, 759191, 759192], exclude: [] },
    'D': { codes: [759194, 759195, 759196, 759197, 759198, 759199, 759200, 759201], exclude: [] },
    'E': { codes: [759204, 759206, 759207, 759208, 759209, 759210, 759212, 759213, 759214, 759215], exclude: [] },
    'F': { codes: [759220, 759221, 759222, 759223, 759224, 759225, 759226, 759227, 759228], exclude: [759221] },
    'G': { codes: [759231, 759233, 759211, 759569, 759235, 759236, 759237, 759243, 759239], exclude: [759211] },
    'H': { codes: [759247, 759248, 759249, 759250, 759251, 759252, 759253, 759254, 759255, 759256, 759257, 759258, 759259, 759260, 759261, 759267, 759262, 759263, 759265, 759266], exclude: [] },
    'I': { codes: [759270, 759271, 759272, 759273, 759274, 759275, 759276, 759277], exclude: [] },
    'J': { codes: [759280, 759281, 759282, 759283, 759284], exclude: [759282, 759283] },
    'K': { codes: [759287, 759288, 759289], exclude: [] }
};

// Section full names from Scorecard
const SECTION_NAMES: Record<string, string> = {
    'A': 'A. Tampilan Tampak Depan Outlet',
    'B': 'B. Sambutan Hangat Ketika Masuk ke Dalam Outlet',
    'C': 'C. Suasana & Kenyamanan Outlet',
    'D': 'D. Penampilan Retail Assistant',
    'E': 'E. Pelayanan Penjualan & Pengetahuan Produk',
    'F': 'F. Pengalaman Mencoba Produk',
    'G': 'G. Rekomendasi untuk Membeli Produk',
    'H': 'H. Pembelian Produk & Pembayaran di Kasir',
    'I': 'I. Penampilan Kasir',
    'J': 'J. Toilet',
    'K': 'K. Salam Perpisahan oleh Retail Assistant'
};

const SECTION_WEIGHTS: Record<string, number> = {
    'A': 4, 'B': 9, 'C': 8, 'D': 5, 'E': 20,
    'F': 11, 'G': 15, 'H': 14, 'I': 5, 'J': 4, 'K': 5
};

const NATIONAL_TARGET = 90; // Journey score below this triggers an Action Plan

function parseItemScore(val: string | null | undefined): number | null {
    if (!val) return null;
    const s = String(val);
    if (s.includes('(1/1)') || s.includes('100.00')) return 1;
    if (s.includes('(0/1)') || s.includes('0.00')) return 0;
    return null;
}

// =============================================
// MAIN SEEDER
// =============================================
async function seedWaves() {
    try {
        // 1. Load store mapping from Supabase (store_code -> store_id)
        console.log('📦 Loading store mapping from Supabase...');
        const { data: stores, error: storeErr } = await supabase.from('stores').select('id, store_code, name');
        if (storeErr) throw storeErr;
        const storeMap = new Map<string, { id: string, name: string }>();
        stores?.forEach(s => storeMap.set(s.store_code, { id: s.id, name: s.name }));
        console.log(`  Found ${storeMap.size} stores in database.`);

        // 2. Define waves to process (latest first)
        const wavesToProcess = [
            { file: 'Wave 1 2024.csv', name: 'Wave 1 2024' },
            { file: 'Wave 2 2024.csv', name: 'Wave 2 2024' },
            { file: 'Wave 3 2024.csv', name: 'Wave 3 2024' },
            { file: 'Wave 1 2025.csv', name: 'Wave 1 2025' },
            { file: 'Wave 2 2025.csv', name: 'Wave 2 2025' },
        ];

        let totalWaveEvals = 0;
        let totalActionPlans = 0;

        for (const wave of wavesToProcess) {
            console.log(`\n🌊 Processing: ${wave.name}...`);
            const csvPath = resolve(process.cwd(), 'CSV', wave.file);

            if (!fs.existsSync(csvPath)) {
                console.warn(`  ⚠️ File not found: ${wave.file}, skipping.`);
                continue;
            }

            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const parsed = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                delimiter: ';',
                transformHeader: (h: string) => h.trim()
            });
            const records = parsed.data as any[];
            const headers = Object.keys(records[0] || {});

            // Helper to find column by item code
            const getCol = (code: number) => headers.find(h => h.includes(`(${code})`) && !h.endsWith('Text') && !h.endsWith('mi)'));

            console.log(`  Parsed ${records.length} store records from CSV.`);

            let waveInsertCount = 0;
            let apInsertCount = 0;

            for (const record of records) {
                // Find store by site code
                const siteCode = (record['Site Code'] || record['Site_Code'] || '').trim();
                if (!siteCode) continue;

                const storeInfo = storeMap.get(siteCode);
                if (!storeInfo) continue; // Skip stores not in our DB

                const sectionScores: Record<string, number | null> = {};
                const failedItems: Record<string, { code: number, item: string }[]> = {};

                // Find header keys for sections
                const secH: Record<string, string> = {};
                headers.forEach(h => {
                    const ht = h.trim();
                    if (ht.startsWith('(Section) A.')) secH['A'] = h;
                    else if (ht.startsWith('(Section) B.')) secH['B'] = h;
                    else if (ht.startsWith('(Section) C.')) secH['C'] = h;
                    else if (ht.startsWith('(Section) D.')) secH['D'] = h;
                    else if (ht.startsWith('(Section) E.')) secH['E'] = h;
                    else if (ht.startsWith('(Section) F.')) secH['F'] = h;
                    else if (ht.startsWith('(Section) G.')) secH['G'] = h;
                    else if (ht.startsWith('(Section) H.')) secH['H'] = h;
                    else if (ht.startsWith('(Section) I.')) secH['I'] = h;
                    else if (ht.startsWith('(Section) J.')) secH['J'] = h;
                    else if (ht.startsWith('(Section) K.')) secH['K'] = h;
                });

                for (const [letter, config] of Object.entries(SECTION_ITEMS)) {
                    // Extract granular failed items (kept for detailed tracking)
                    const failed: { code: number, item: string }[] = [];
                    for (const code of config.codes) {
                        if (config.exclude.includes(code)) continue;
                        const col = getCol(code);
                        if (!col) continue;
                        const val = record[col];
                        const score = parseItemScore(val);
                        if (score === 0) {
                            const itemName = col.replace(/^\(\d+\)\s*/, '').substring(0, 120);
                            failed.push({ code, item: itemName });
                        }
                    }
                    if (failed.length > 0) failedItems[letter] = failed;

                    // Fetch the exact score from the Section columns (F-P)
                    sectionScores[letter] = null;
                    if (secH[letter]) {
                        const csvStr = record[secH[letter]];
                        if (csvStr && String(csvStr).trim() !== '') {
                            const parseVal = parseFloat(String(csvStr).replace(',', '.'));
                            if (!isNaN(parseVal)) {
                                sectionScores[letter] = parseVal;
                            }
                        }
                    }
                }

                // Strictly use the Final Score column (Q)
                let totalScore = 0;
                const finalScoreKey = headers.find(h => h === 'Final Score' || h.trim() === 'Final Score');
                if (finalScoreKey && record[finalScoreKey]) {
                    const csvVal = parseFloat(String(record[finalScoreKey]).replace(',', '.'));
                    if (!isNaN(csvVal)) totalScore = csvVal;
                }

                // Build granular_failed_items JSONB
                const granularFailedItems: any[] = [];
                for (const [letter, items] of Object.entries(failedItems)) {
                    items.forEach(item => {
                        granularFailedItems.push({
                            section: letter,
                            sectionName: SECTION_NAMES[letter],
                            code: item.code,
                            item: item.item,
                            score: 0
                        });
                    });
                }

                // Insert wave_evaluation
                const { data: waveData, error: waveErr } = await supabase.from('wave_evaluations').upsert({
                    store_id: storeInfo.id,
                    wave_name: wave.name,
                    total_score: parseFloat(totalScore.toFixed(2)),
                    score_a: sectionScores['A'] !== null ? parseFloat((sectionScores['A'] as number).toFixed(2)) : null,
                    score_b: sectionScores['B'] !== null ? parseFloat((sectionScores['B'] as number).toFixed(2)) : null,
                    score_c: sectionScores['C'] !== null ? parseFloat((sectionScores['C'] as number).toFixed(2)) : null,
                    score_d: sectionScores['D'] !== null ? parseFloat((sectionScores['D'] as number).toFixed(2)) : null,
                    score_e: sectionScores['E'] !== null ? parseFloat((sectionScores['E'] as number).toFixed(2)) : null,
                    score_f: sectionScores['F'] !== null ? parseFloat((sectionScores['F'] as number).toFixed(2)) : null,
                    score_g: sectionScores['G'] !== null ? parseFloat((sectionScores['G'] as number).toFixed(2)) : null,
                    score_h: sectionScores['H'] !== null ? parseFloat((sectionScores['H'] as number).toFixed(2)) : null,
                    score_i: sectionScores['I'] !== null ? parseFloat((sectionScores['I'] as number).toFixed(2)) : null,
                    score_j: sectionScores['J'] !== null ? parseFloat((sectionScores['J'] as number).toFixed(2)) : null,
                    score_k: sectionScores['K'] !== null ? parseFloat((sectionScores['K'] as number).toFixed(2)) : null,
                    granular_failed_items: granularFailedItems.length > 0 ? granularFailedItems : null,
                }, { onConflict: 'store_id,wave_name' }).select('id').single();

                if (waveErr) {
                    console.warn(`  ⚠️ Wave eval error for ${siteCode}: ${waveErr.message}`);
                    continue;
                }
                waveInsertCount++;

                // Generate Action Plans for the LATEST wave only (Wave 2 2025)
                if (wave.name === 'Wave 2 2025' && waveData) {
                    for (const [letter, score] of Object.entries(sectionScores)) {
                        if (score === null) continue;
                        if (score >= NATIONAL_TARGET) continue; // Pass: no AP needed
                        if (score === 100) continue; // Perfect score

                        const items = failedItems[letter] || [];
                        const failedHistory = items.map(item => ({
                            code: item.code,
                            item: item.item,
                            status: 'Just Failed This Wave'
                        }));

                        const { error: apErr } = await supabase.from('action_plans').insert({
                            store_id: storeInfo.id,
                            wave_id: waveData.id,
                            plan_type: 'Quantitative',
                            journey_name: SECTION_NAMES[letter],
                            failed_items_history: failedHistory,
                            status: 'Requires Action',
                        });

                        if (apErr) {
                            console.warn(`  ⚠️ AP error for ${siteCode} ${letter}: ${apErr.message}`);
                        } else {
                            apInsertCount++;
                        }
                    }
                }
            }

            totalWaveEvals += waveInsertCount;
            totalActionPlans += apInsertCount;
            console.log(`  ✅ Inserted ${waveInsertCount} wave evaluations, ${apInsertCount} action plans.`);
        }

        console.log(`\n=============================================`);
        console.log(`🎉 WAVE SEEDING COMPLETE!`);
        console.log(`   Total Wave Evaluations: ${totalWaveEvals}`);
        console.log(`   Total Action Plans: ${totalActionPlans}`);
        console.log(`=============================================\n`);

    } catch (err) {
        console.error('❌ WAVE SEED ERROR:', err);
    }
}

seedWaves();
