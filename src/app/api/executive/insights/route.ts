import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    try {
        // Verify role is executive-level
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['HCBP', 'Superadmin', 'Regional Director'].includes(profile.role)) {
            return NextResponse.json({ error: 'Akses ditolak. Hanya manajemen tingkat atas yang bisa mengakses halaman ini.' }, { status: 403 });
        }

        // 1. Get counts for meta
        const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
        const { count: branchCount } = await supabase.from('branches').select('*', { count: 'exact', head: true });
        const { count: regionCount } = await supabase.from('regions').select('*', { count: 'exact', head: true });

        // 2. Get all action plans for analysis
        const { data: allPlans } = await supabase
            .from('action_plans')
            .select('store_id, journey_name, status, rca_description, blocker_text, stores(name, branch_id, branches(name, region_id, regions(name)))');

        // Analyze systemic risks
        const journeyFailCount: Record<string, { count: number; stores: Set<string>; regions: Set<string> }> = {};
        const blockerPatterns: Record<string, number> = {};

        allPlans?.forEach(p => {
            if (p.status === 'Requires Action' || p.status === 'Revision Required') {
                const jKey = p.journey_name.substring(0, 40);
                if (!journeyFailCount[jKey]) journeyFailCount[jKey] = { count: 0, stores: new Set(), regions: new Set() };
                journeyFailCount[jKey].count++;
                journeyFailCount[jKey].stores.add(p.store_id);
                const regionName = (p.stores as any)?.branches?.regions?.name;
                if (regionName) journeyFailCount[jKey].regions.add(regionName);
            }
            if (p.blocker_text) {
                const key = p.blocker_text.substring(0, 50);
                blockerPatterns[key] = (blockerPatterns[key] || 0) + 1;
            }
        });

        // Build systemic risks
        const systemicRisks = Object.entries(journeyFailCount)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 2)
            .map(([journey, data], idx) => ({
                id: `sr-${idx + 1}`,
                title: `Masalah Sistemik: ${journey}`,
                description: `${data.count} toko dari ${data.stores.size} lokasi unik di ${data.regions.size} Region masih memiliki Action Plan aktif untuk area ini. Pola kegagalan berulang terdeteksi secara nasional.`,
                businessImpact: `Mempengaruhi ${Math.round((data.stores.size / (storeCount || 1)) * 100)}% dari total outlet EIGER.`,
                recommendation: 'Evaluasi SOP terkait di tingkat korporat dan pertimbangkan intervensi anggaran (CAPEX) untuk perbaikan infrastruktur.'
            }));

        // Build policy interventions from blockers
        const policyInterventions = Object.entries(blockerPatterns)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 1)
            .map(([blocker, count], idx) => ({
                id: `pi-${idx + 1}`,
                title: `Hambatan Operasional Berulang`,
                description: `"${blocker}" dilaporkan sebagai kendala oleh ${count} Action Plans di berbagai wilayah.`,
                actionRequired: 'Tim HCBP Pusat perlu meninjau ulang kebijakan operasional terkait dan memfasilitasi penyelesaian kendala ini.'
            }));

        // Build best practices from resolved stores
        const resolvedByRegion: Record<string, number> = {};
        allPlans?.forEach(p => {
            if (p.status === 'Resolved') {
                const regionName = (p.stores as any)?.branches?.regions?.name || 'Unknown';
                resolvedByRegion[regionName] = (resolvedByRegion[regionName] || 0) + 1;
            }
        });

        const bestPractices = Object.entries(resolvedByRegion)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 1)
            .map(([region, count]) => ({
                id: 'bp-1',
                subject: `${region} (Eksekutor Terbaik)`,
                description: `Region ini telah menyelesaikan ${count} Action Plan, menunjukkan disiplin eksekusi tertinggi di seluruh jaringan EIGER.`,
                rewardSuggestion: 'Kandidasi \'Best Region Executive Award\'.'
            }));

        return NextResponse.json({
            meta: {
                persona: 'Chief Strategy Advisor (Gemini Pro)',
                analysisPeriod: 'Data Action Plan Aktif',
                analyzedRegions: regionCount || 0,
                analyzedBranches: branchCount || 0,
                analyzedStores: storeCount || 0
            },
            systemicRisks,
            policyInterventions,
            bestPractices
        });

    } catch (error) {
        console.error("Database Error in /api/executive/insights:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}
