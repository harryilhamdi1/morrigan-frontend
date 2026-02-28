import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();

    // Pastikan user sudah login
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    try {
        // 1. Ambil Profil User untuk mengetahui Store ID mereka
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('store_id, role, branch_id, region_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profil pengguna tidak ditemukan.' }, { status: 403 });
        }

        // Jika user bukan Store Head, kita perlu handle secara berbeda
        // Untuk saat ini, ambil store_id dari query params jika user bukan Store Head
        const url = new URL(request.url);
        let storeId = profile.store_id;

        if (!storeId && ['Branch Head', 'Regional Director', 'HCBP', 'Superadmin'].includes(profile.role)) {
            storeId = url.searchParams.get('storeId');
        }

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID tidak ditemukan. Akun Anda tidak terhubung ke toko manapun.' }, { status: 404 });
        }

        // 2. Ambil informasi toko
        const { data: storeInfo } = await supabase
            .from('stores')
            .select('id, name, store_code, league_status, branch_id, branches(name, region_id, regions(name))')
            .eq('id', storeId)
            .single();

        // 3. Ambil Historis Wave Evaluations Toko ini (5 Wave Terakhir)
        const { data: waves } = await supabase
            .from('wave_evaluations')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (!waves || waves.length === 0) {
            return NextResponse.json({
                store: {
                    id: storeId,
                    name: storeInfo?.name || 'Toko Tidak Dikenal',
                    code: storeInfo?.store_code || '---',
                    league: storeInfo?.league_status || 'Rising Star',
                    region: (storeInfo?.branches as any)?.regions?.name || '-',
                    branch: (storeInfo?.branches as any)?.name || '-'
                },
                waveHistory: [],
                radarData: [],
                activeAlert: {
                    hasUrgentFeedback: false,
                    message: "ℹ️ Belum ada data evaluasi Wave untuk toko ini. Data akan tersedia setelah Mystery Shopper mengevaluasi."
                }
            });
        }

        // Urutkan waves secara kronologis (terlama ke terbaru) untuk chart
        const sortedWaves = waves.reverse();

        // 4. Hitung rata-rata nasional dan cabang secara real
        const latestWaveName = sortedWaves[sortedWaves.length - 1].wave_name;

        const { data: nationalAvgs } = await supabase
            .from('wave_evaluations')
            .select('total_score')
            .eq('wave_name', latestWaveName);

        const avgNational = nationalAvgs && nationalAvgs.length > 0
            ? parseFloat((nationalAvgs.reduce((sum: number, w: any) => sum + parseFloat(w.total_score || 0), 0) / nationalAvgs.length).toFixed(2))
            : 0;

        const { data: branchStores } = await supabase
            .from('stores')
            .select('id')
            .eq('branch_id', storeInfo?.branch_id || '');

        const branchStoreIds = branchStores?.map((s: any) => s.id) || [];

        const { data: branchAvgs } = branchStoreIds.length > 0
            ? await supabase
                .from('wave_evaluations')
                .select('total_score')
                .eq('wave_name', latestWaveName)
                .in('store_id', branchStoreIds)
            : { data: null };

        const avgBranch = branchAvgs && branchAvgs.length > 0
            ? parseFloat((branchAvgs.reduce((sum: number, w: any) => sum + parseFloat(w.total_score || 0), 0) / branchAvgs.length).toFixed(2))
            : 0;

        // 5. Format data untuk Recharts (Wave History Spline)
        const waveHistory = sortedWaves.map((w: any) => ({
            name: w.wave_name,
            storeScore: parseFloat(w.total_score || 0),
            avgNational,
            avgBranch
        }));

        // 6. Ambil Wave Terbaru untuk Radar Chart
        const latestWave = sortedWaves[sortedWaves.length - 1];
        const radarData = [
            { subject: 'A. Tampilan Depan', A: parseFloat(latestWave.score_a || 0), fullMark: 100 },
            { subject: 'B. Sambutan', A: parseFloat(latestWave.score_b || 0), fullMark: 100 },
            { subject: 'C. Suasana', A: parseFloat(latestWave.score_c || 0), fullMark: 100 },
            { subject: 'D. Penampilan', A: parseFloat(latestWave.score_d || 0), fullMark: 100 },
            { subject: 'E. Pelayanan', A: parseFloat(latestWave.score_e || 0), fullMark: 100 },
            { subject: 'F. Fitting Room', A: parseFloat(latestWave.score_f || 0), fullMark: 100 },
            { subject: 'G. Rekomendasi', A: parseFloat(latestWave.score_g || 0), fullMark: 100 },
            { subject: 'H. Kasir', A: parseFloat(latestWave.score_h || 0), fullMark: 100 },
            { subject: 'I. Penampilan Kasir', A: parseFloat(latestWave.score_i || 0), fullMark: 100 },
            { subject: 'J. Toilet', A: parseFloat(latestWave.score_j || 0), fullMark: 100 },
            { subject: 'K. Salam Perpisahan', A: parseFloat(latestWave.score_k || 0), fullMark: 100 },
        ];

        // 7. Cek Action Plans yang Nunggak (Active Alerts)
        const { count: overdueCount } = await supabase
            .from('action_plans')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('status', 'Requires Action');

        return NextResponse.json({
            store: {
                id: storeId,
                name: storeInfo?.name || 'Toko Tidak Dikenal',
                code: storeInfo?.store_code || '---',
                league: storeInfo?.league_status || 'Rising Star',
                region: (storeInfo?.branches as any)?.regions?.name || '-',
                branch: (storeInfo?.branches as any)?.name || '-'
            },
            waveHistory,
            radarData,
            activeAlert: {
                hasUrgentFeedback: (overdueCount || 0) > 0,
                message: (overdueCount || 0) > 0
                    ? `⚠️ [URGENT] Anda memiliki ${overdueCount} Action Plan yang harus diselesaikan. Segera selesaikan untuk menghindari Turtle Badge.`
                    : "✅ Semua Action Plan berjalan On-Track."
            }
        });

    } catch (error) {
        console.error("Database Error in /api/store/summary:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}
