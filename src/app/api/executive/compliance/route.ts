import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REGION_COLORS: Record<string, string> = {
    'REGION 1': '#ef4444',
    'REGION 2': '#f97316',
    'REGION 3': '#eab308',
    'REGION 4': '#0ea5e9',
    'REGION 5': '#8b5cf6'
};

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    try {
        // Verify role
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['HCBP', 'Superadmin', 'Regional Director'].includes(profile.role)) {
            return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
        }

        // 1. Get all action plans with region data
        const { data: allPlans } = await supabase
            .from('action_plans')
            .select('status, due_date, created_at, updated_at, stores(branch_id, branches(region_id, regions(name)))');

        const now = new Date();
        let totalActive = 0;
        let totalResolved = 0;
        let totalOverdue = 0;
        let totalResolutionDays = 0;
        const overdueByRegion: Record<string, number> = {};

        allPlans?.forEach(p => {
            const regionName = (p.stores as any)?.branches?.regions?.name || 'Unknown';

            if (p.status === 'Resolved') {
                totalResolved++;
                // Calculate resolution time
                const created = new Date(p.created_at);
                const resolved = new Date(p.updated_at);
                const days = Math.max(0, (resolved.getTime() - created.getTime()) / (1000 * 3600 * 24));
                totalResolutionDays += days;
            } else {
                totalActive++;
                if (p.due_date && new Date(p.due_date) < now) {
                    totalOverdue++;
                    overdueByRegion[regionName] = (overdueByRegion[regionName] || 0) + 1;
                }
            }
        });

        const totalPlans = (allPlans?.length || 0);
        const completionRate = totalPlans > 0 ? parseFloat(((totalResolved / totalPlans) * 100).toFixed(1)) : 0;
        const avgResolutionTime = totalResolved > 0 ? parseFloat((totalResolutionDays / totalResolved).toFixed(1)) : 0;

        // 2. Build turtle penalties by region
        const { data: regions } = await supabase.from('regions').select('name');
        const turtlePenaltiesByRegion = (regions || []).map(r => ({
            name: r.name,
            infractions: overdueByRegion[r.name] || 0,
            fill: REGION_COLORS[r.name] || '#6b7280'
        }));

        return NextResponse.json({
            kpi: {
                averageResolutionTime: avgResolutionTime,
                resolutionTrend: 'N/A',
                nationalCompletionRate: completionRate,
                totalActiveOverdue: totalOverdue
            },
            turtlePenaltiesByRegion,
            quarterlyResolutionTrend: [] // Akan terisi setelah akumulasi data kuartalan
        });

    } catch (error) {
        console.error("Database Error in /api/executive/compliance:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}
