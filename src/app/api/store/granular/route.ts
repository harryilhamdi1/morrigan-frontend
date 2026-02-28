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
        // 1. Dapatkan store_id milik user
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('store_id, role')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profil pengguna tidak ditemukan.' }, { status: 403 });
        }

        // Support admin/branch viewing specific store
        const url = new URL(request.url);
        let storeId = profile.store_id;
        if (!storeId && ['Branch Head', 'Regional Director', 'HCBP', 'Superadmin'].includes(profile.role)) {
            storeId = url.searchParams.get('storeId');
        }

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID tidak ditemukan.' }, { status: 404 });
        }

        // 2. Ambil action plans yang spesifik untuk toko user
        const { data: plans } = await supabase
            .from('action_plans')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (!plans || plans.length === 0) {
            return NextResponse.json({ actionPlans: [] });
        }

        // 3. Transform data DB menjadi format antarmuka React
        const formattedPlans = plans.map(p => ({
            id: p.id,
            type: p.plan_type.toLowerCase() === 'qualitative' ? 'qualitative' : 'quantitative',
            journey: p.journey_name,
            journeyScore: null,
            status: p.status,
            dueDate: p.due_date,
            historicalTag: determineHistoricalTag(p.failed_items_history),
            failedItems: extractFailedItems(p.failed_items_history),
            qualitativeContext: p.ai_sentiment_quote,

            // Kolom Isian Store Head + Feedback Cabang
            rca: p.rca_description || "",
            rcaCategory: p.rca_category || "",
            commitment: p.action_strategy || "",
            pic: p.pic_name || "",
            blocker: p.blocker_text,
            evidenceUrl: p.evidence_url,
            rejectionHistory: p.rejection_reason_history || [],
            branchFeedback: extractLatestRejection(p.rejection_reason_history)
        }));

        return NextResponse.json({ actionPlans: formattedPlans });

    } catch (error) {
        console.error("Database Error in /api/store/granular:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}

// ---- Helpers untuk Parsing Kolom JSONB Supabase ---- //

function extractFailedItems(historyJson: any): { item: string; status: string }[] {
    if (!historyJson || !Array.isArray(historyJson)) return [];
    return historyJson.map(h => ({
        item: typeof h === 'string' ? h : (h.item || h.itemName || "Unknown item"),
        status: h.status || 'Just Failed This Wave'
    }));
}

function determineHistoricalTag(historyJson: any): string {
    if (!historyJson || !Array.isArray(historyJson) || historyJson.length === 0) return "Just Failed This Wave";
    // Check if any items are recurring
    const hasRecurring = historyJson.some((h: any) => h.status === 'Recurring Failed');
    const hasInconsistent = historyJson.some((h: any) => h.status === 'Inconsistent');
    if (hasRecurring) return "Recurring Failed";
    if (hasInconsistent) return "Inconsistent";
    return "Just Failed This Wave";
}

function extractLatestRejection(rejectionJson: any): string | undefined {
    if (!rejectionJson || !Array.isArray(rejectionJson) || rejectionJson.length === 0) return undefined;
    const latest = rejectionJson[rejectionJson.length - 1];
    return latest.message || undefined;
}
