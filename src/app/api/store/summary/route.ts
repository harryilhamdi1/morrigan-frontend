import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();

    // Pastikan user sudah login
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // JIKA TIDAK ADA SESI / GAGAL KONEK DB (Fallback ke Mock Data untuk Development)
    if (authError || !user) {
        console.warn("No active Supabase session found, falling back to mock data for /api/store/summary");
        return NextResponse.json(getMockData());
    }

    try {
        // 1. Ambil Profil User untuk mengetahui Store ID mereka
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('store_id, role, stores(name, store_code, league_status), branches(name), regions(name)')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("[API/summary] Error fetching profile for", user.id, ":", profileError);
        }

        if (!profile || !profile.store_id) {
            console.error("[API/summary] User profile missing or no store_id:", profile);
            console.warn("Falling back to mock data instead of 403 to prevent UI crash.");
            return NextResponse.json(getMockData());
        }

        const storeId = profile.store_id;
        const storeInfo = profile.stores as any;

        // 2. Ambil Historis Wave Evaluations Toko ini (5 Wave Terakhir)
        const { data: waves } = await supabase
            .from('wave_evaluations')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false })
            .limit(5);

        // Jika DB kosong, fallback ke mock
        if (!waves || waves.length === 0) {
            return NextResponse.json(getMockData());
        }

        // Urutkan waves secara kronologis (terlama ke terbaru) untuk chart
        const sortedWaves = waves.reverse();

        // 3. Format data untuk Recharts (Wave History Spline)
        const waveHistory = sortedWaves.map((w: any) => ({
            name: w.wave_name,
            storeScore: parseFloat(w.total_score || 0),
            avgNational: 80, // Idealnya ini di-query dari agregat nasional
            avgBranch: 82    // Idealnya ini di-query dari agregat cabang
        }));

        // 4. Ambil Wave Terbaru untuk Radar Chart
        const latestWave = sortedWaves[sortedWaves.length - 1];
        const radarData = [
            { subject: 'A. Facility', A: parseFloat(latestWave.score_a || 0), fullMark: 100 },
            { subject: 'B. Welcome', A: parseFloat(latestWave.score_b || 0), fullMark: 100 },
            { subject: 'C. Atmosphere', A: parseFloat(latestWave.score_c || 0), fullMark: 100 },
            { subject: 'D. Product Knowledge', A: parseFloat(latestWave.score_d || 0), fullMark: 100 },
            { subject: 'E. Needs Analysis', A: parseFloat(latestWave.score_e || 0), fullMark: 100 },
            { subject: 'F. Cross Selling', A: parseFloat(latestWave.score_f || 0), fullMark: 100 },
            { subject: 'G. Objection', A: parseFloat(latestWave.score_g || 0), fullMark: 100 },
            { subject: 'H. Closing', A: parseFloat(latestWave.score_h || 0), fullMark: 100 },
            { subject: 'I. Cashier', A: parseFloat(latestWave.score_i || 0), fullMark: 100 },
            { subject: 'J. Farewell', A: parseFloat(latestWave.score_j || 0), fullMark: 100 },
            { subject: 'K. Grooming', A: parseFloat(latestWave.score_k || 0), fullMark: 100 },
        ];

        // 5. Cek Action Plans yang Nunggak (Active Alerts)
        const { count: overdueCount } = await supabase
            .from('action_plans')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('status', 'Requires Action')
            .lt('due_date', new Date().toISOString());

        return NextResponse.json({
            store: {
                id: storeId,
                name: storeInfo?.name || 'Unknown Store',
                code: storeInfo?.store_code || '---',
                league: storeInfo?.league_status || 'Unranked',
                region: (profile.regions as any)?.name || 'Unknown',
                branch: (profile.branches as any)?.name || 'Unknown'
            },
            waveHistory,
            radarData,
            activeAlert: {
                hasUrgentFeedback: (overdueCount || 0) > 0,
                message: (overdueCount || 0) > 0
                    ? `⚠️ [URGENT] Anda memiliki ${overdueCount} Action Plan Overdue. Segera selesaikan untuk menghindari Turtle Badge pencatatan otomatis.`
                    : "✅ Semua Action Plan berjalan On-Track."
            }
        });

    } catch (error) {
        console.error("Database Error in /api/store/summary:", error);
        return NextResponse.json(getMockData());
    }
}

// Fungsi Fallback jika Supabase belum di-seed atau tidak ada Sesi
function getMockData() {
    return {
        store: {
            id: 'S001',
            name: 'Eiger Store Bandung Indah Plaza (Mock)',
            code: 'BIP01',
            league: 'Gold League',
            region: 'Jawa Barat',
            branch: 'Bandung Raya'
        },
        waveHistory: [
            { name: 'Wave 1 2024', storeScore: 82, avgNational: 78, avgBranch: 80 },
            { name: 'Wave 2 2024', storeScore: 85, avgNational: 79, avgBranch: 81 },
            { name: 'Wave 3 2024', storeScore: 84, avgNational: 80, avgBranch: 82 },
            { name: 'Wave 4 2024', storeScore: 91, avgNational: 81, avgBranch: 84 },
            { name: 'Wave 1 2025', storeScore: 96, avgNational: 82, avgBranch: 86 },
        ],
        radarData: [
            { subject: 'A. Facility', A: 100, fullMark: 100 },
            { subject: 'B. Welcome', A: 85, fullMark: 100 },
            { subject: 'C. Atmosphere', A: 90, fullMark: 100 },
            { subject: 'D. Product Knowledge', A: 75, fullMark: 100 },
            { subject: 'E. Needs Analysis', A: 60, fullMark: 100 },
            { subject: 'F. Cross Selling', A: 80, fullMark: 100 },
            { subject: 'G. Objection', A: 100, fullMark: 100 },
            { subject: 'H. Closing', A: 88, fullMark: 100 },
            { subject: 'I. Cashier', A: 95, fullMark: 100 },
            { subject: 'J. Farewell', A: 100, fullMark: 100 },
            { subject: 'K. Grooming', A: 100, fullMark: 100 },
        ],
        activeAlert: {
            hasUrgentFeedback: true,
            message: "⚠️ [URGENT DEVELOPMENT MOCK] Supabase connection failed or unauthenticated. Showing offline mock data."
        }
    };
}
