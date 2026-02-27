require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ Peringatan: SUPABASE_URL dan SUPABASE_SERVICE_KEY belum di-set di .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSV(filePath, separator = ';') {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ separator }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

function cleanKeys(obj) {
    const cleaned = {};
    for (const key in obj) {
        const cleanKey = key.replace(/^\uFEFF/, '').replace(/^"/, '').replace(/"$/, '').trim();
        cleaned[cleanKey] = obj[key] ? obj[key].replace(/^"/, '').replace(/"$/, '').trim() : null;
    }
    return cleaned;
}

async function seedDatabase() {
    console.log("🚀 Memulai proses migrasi data CSV ke Supabase...");

    try {
        // --------------------------------------------------------------------------------
        // 0. LEAGUE STATUS (CSE Analysis - Liga ESS)
        // --------------------------------------------------------------------------------
        const leagueMap = {};
        const leaguePath = path.join(__dirname, 'CSV', 'CSE Analysis - Liga ESS.csv');
        if (fs.existsSync(leaguePath)) {
            console.log("\n📂 Membaca CSE Analysis - Liga ESS.csv...");
            const rawLeagueRecords = await parseCSV(leaguePath, ',');
            const leagueRecords = rawLeagueRecords.map(cleanKeys);
            for (const r of leagueRecords) {
                if (r['Short branch name']) {
                    const siteCode = r['Short branch name'].split(' - ')[0].trim();
                    // Secara eksplisit HANYA mengambil predikat toko dari kolom "LIGA 2026" (paling ujung)
                    leagueMap[siteCode] = r['LIGA 2026'] || 'Rising Star';
                }
            }
            console.log(`✅ Berhasil memetakan status Liga untuk ${Object.keys(leagueMap).length} toko.`);
        } else {
            console.log("⚠️ File CSE Analysis - Liga ESS.csv tidak ditemukan.");
        }

        // --------------------------------------------------------------------------------
        // 1. MASTER SITES (Region, Branch, Store)
        // --------------------------------------------------------------------------------
        const masterSitesPath = path.join(__dirname, 'CSV', 'Master Site Morrigan.csv');
        if (fs.existsSync(masterSitesPath)) {
            console.log("\n📂 Membaca Master Site Morrigan.csv...");
            const rawRecords = await parseCSV(masterSitesPath);
            const records = rawRecords.map(cleanKeys);
            console.log(`✅ Berhasil membaca ${records.length} baris data Master Site.`);

            // -- 1.A REGIONS --
            const regionNames = [...new Set(records.map(r => r.Region).filter(Boolean))];
            console.log(`Menyiapkan ${regionNames.length} Regions...`);
            for (const rName of regionNames) {
                await supabase.from('regions').upsert({ name: rName }, { onConflict: 'name' });
            }
            const { data: regionsDB } = await supabase.from('regions').select('*');
            const regionMap = {};
            regionsDB.forEach(r => regionMap[r.name] = r.id);

            // -- 1.B BRANCHES --
            const branchSet = new Set();
            const branchesToUpsert = [];
            for (const r of records) {
                if (r.Branch && r.Region && !branchSet.has(r.Branch)) {
                    branchSet.add(r.Branch);
                    branchesToUpsert.push({ name: r.Branch, region_id: regionMap[r.Region] });
                }
            }
            console.log(`Menyiapkan ${branchesToUpsert.length} Branches...`);
            for (const branch of branchesToUpsert) {
                await supabase.from('branches').upsert(branch, { onConflict: 'name' });
            }
            const { data: branchesDB } = await supabase.from('branches').select('*');
            const branchMap = {};
            branchesDB.forEach(b => branchMap[b.name] = b.id);

            // -- 1.C STORES --
            const storesToUpsert = [];
            for (const r of records) {
                if (r['Site Code'] && r['Site Name'] && r.Branch) {
                    const siteCodeClean = r['Site Code'].toString().trim();
                    let assignedLeague = leagueMap[siteCodeClean] || 'Rising Star';

                    if (assignedLeague.toUpperCase() === 'GOLD') assignedLeague = 'Gold League';
                    else if (assignedLeague.toUpperCase() === 'SILVER') assignedLeague = 'Silver League';
                    else if (assignedLeague.toUpperCase() === 'BRONZE') assignedLeague = 'Bronze League';
                    else assignedLeague = 'Rising Star';

                    storesToUpsert.push({
                        store_code: siteCodeClean,
                        name: r['Site Name'],
                        branch_id: branchMap[r.Branch],
                        league_status: assignedLeague,
                        is_active: r['Site Name'] !== 'Closed'
                    });
                }
            }
            console.log(`Menyiapkan ${storesToUpsert.length} Stores...`);
            // Lakukan upsert batch per 100 row
            for (let i = 0; i < storesToUpsert.length; i += 100) {
                await supabase.from('stores').upsert(storesToUpsert.slice(i, i + 100), { onConflict: 'store_code' });
            }
            console.log('✅ Semua Master Data Hierarki berhasil masuk!');
        } else {
            console.log("⚠️ File Master Site Morrigan.csv tidak ditemukan.");
        }

        // --------------------------------------------------------------------------------
        // 2. QUALITATIVE AI DATA -> ACTION PLANS
        // --------------------------------------------------------------------------------
        const aiPath = path.join(__dirname, 'Master_Qualitative_AI_Categorized.csv');
        if (fs.existsSync(aiPath)) {
            console.log("\n📂 Membaca Master_Qualitative_AI_Categorized.csv...");
            const rawAiRecords = await parseCSV(aiPath);
            const aiRecords = rawAiRecords.map(cleanKeys);
            console.log(`✅ Berhasil membaca ${aiRecords.length} baris data Sentinel AI.`);

            const { data: storesDB } = await supabase.from('stores').select('id, store_code');
            const storeCodeMap = {};
            storesDB.forEach(s => storeCodeMap[s.store_code] = s.id);

            const actionPlansToInsert = [];
            for (const ai of aiRecords) {
                if (ai.SiteCode && storeCodeMap[ai.SiteCode] && ai.Feedback && ai.Categories) {
                    actionPlansToInsert.push({
                        store_id: storeCodeMap[ai.SiteCode],
                        plan_type: 'Qualitative',
                        journey_name: ai.Categories,
                        ai_sentiment_quote: ai.Feedback,
                        status: 'Requires Action'
                    });
                }
            }

            if (actionPlansToInsert.length > 0) {
                console.log(`Menginjeksi ${actionPlansToInsert.length} Action Plans Kualitatif dari AI...`);
                // Supabase allows bulk inserts
                await supabase.from('action_plans').insert(actionPlansToInsert);
                console.log('✅ AI Action Plans berhasil masuk!');
            }

        } else {
            console.log("⚠️ File Master_Qualitative_AI_Categorized.csv tidak ditemukan.");
        }

        console.log("\n🎉 PROSES SEEDING SELESAI!");

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat seeding:", error);
    }
}

seedDatabase();
