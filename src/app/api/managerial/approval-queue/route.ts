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
        // 1. Dapatkan profil user
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('branch_id, region_id, role')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profil pengguna tidak ditemukan.' }, { status: 403 });
        }

        // Determine which stores to fetch based on user role
        let storeIds: string[] = [];
        let storeMap = new Map<string, { storeCode: string; name: string }>();

        if (profile.role === 'Branch Head' && profile.branch_id) {
            const { data: storesObj } = await supabase
                .from('stores')
                .select('id, store_code, name')
                .eq('branch_id', profile.branch_id);
            storesObj?.forEach(s => { storeMap.set(s.id, { storeCode: s.store_code, name: s.name }); });
            storeIds = storesObj?.map(s => s.id) || [];
        } else if (profile.role === 'Regional Director' && profile.region_id) {
            const { data: branches } = await supabase
                .from('branches')
                .select('id')
                .eq('region_id', profile.region_id);
            const branchIds = branches?.map(b => b.id) || [];
            if (branchIds.length > 0) {
                const { data: storesObj } = await supabase
                    .from('stores')
                    .select('id, store_code, name')
                    .in('branch_id', branchIds);
                storesObj?.forEach(s => { storeMap.set(s.id, { storeCode: s.store_code, name: s.name }); });
                storeIds = storesObj?.map(s => s.id) || [];
            }
        } else if (['HCBP', 'Superadmin'].includes(profile.role)) {
            const { data: storesObj } = await supabase
                .from('stores')
                .select('id, store_code, name');
            storesObj?.forEach(s => { storeMap.set(s.id, { storeCode: s.store_code, name: s.name }); });
            storeIds = storesObj?.map(s => s.id) || [];
        } else {
            return NextResponse.json({ error: 'Akun Anda tidak memiliki akses ke Approval Queue.' }, { status: 403 });
        }

        if (storeIds.length === 0) {
            return NextResponse.json({ summary: { totalPending: 0, oldestSubmission: 'N/A' }, queue: [] });
        }

        // 2. Ambil Action Plans "Waiting for Approval" dari toko-toko di bawah wewenang user
        const { data: plans } = await supabase
            .from('action_plans')
            .select('*')
            .in('store_id', storeIds)
            .eq('status', 'Waiting for Approval')
            .order('updated_at', { ascending: true });

        if (!plans || plans.length === 0) {
            return NextResponse.json({ summary: { totalPending: 0, oldestSubmission: 'N/A' }, queue: [] });
        }

        // Hitung umur submission paling tua
        const oldestDate = new Date(plans[0].updated_at);
        const daysAgo = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 3600 * 24));
        const oldestSubmissionStr = daysAgo === 0 ? 'Hari Ini' : `${daysAgo} Hari Lalu`;

        // 3. Format Output untuk UI
        const formattedQueue = plans.map(p => {
            const parsedItems = extractFailedItems(p.failed_items_history);
            return {
                id: p.id,
                storeName: storeMap.get(p.store_id)?.name || 'Unknown Store',
                storeCode: storeMap.get(p.store_id)?.storeCode || '---',
                journey: p.journey_name,
                failedItems: parsedItems,
                originalSentiment: p.ai_sentiment_quote || null,
                rca: p.rca_description || '',
                rcaCategory: p.rca_category || '',
                pic: p.pic_name || '',
                commitment: p.action_strategy || '',
                evidenceUrl: p.evidence_url || null,
                submittedAt: p.updated_at,
                status: p.status,
                rejectionHistory: p.rejection_reason_history || []
            };
        });

        return NextResponse.json({
            summary: {
                totalPending: plans.length,
                oldestSubmission: oldestSubmissionStr
            },
            queue: formattedQueue
        });

    } catch (error) {
        console.error("Database Error in /api/managerial/approval-queue:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}

// ---- Helpers ----
function extractFailedItems(historyJson: any): { item: string; status: string }[] {
    if (!historyJson || !Array.isArray(historyJson)) return [];
    return historyJson.map(h => ({
        item: typeof h === 'string' ? h : (h.item || h.itemName || "Unknown item"),
        status: h.status || 'Just Failed This Wave'
    }));
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { actionPlanId, action, rejectReason } = body;

        if (!actionPlanId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: "Payload tidak valid. Gunakan action: 'approve' atau 'reject'." }, { status: 400 });
        }

        // Fetch current plan to append rejection history
        const { data: currentPlan, error: fetchError } = await supabase
            .from('action_plans')
            .select('rejection_reason_history, status')
            .eq('id', actionPlanId)
            .single();

        if (fetchError || !currentPlan) {
            return NextResponse.json({ error: "Action Plan tidak ditemukan." }, { status: 404 });
        }

        // Get actor name
        const { data: actorProfile } = await supabase
            .from('user_profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();

        const actorName = actorProfile?.full_name || 'Unknown';
        const actorRole = actorProfile?.role || 'Unknown';
        const newStatus = action === 'approve' ? 'Resolved' : 'Revision Required';
        const currentHistory = currentPlan.rejection_reason_history || [];

        const updatePayload: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        if (action === 'reject') {
            const newRejectionEntry = {
                message: rejectReason || 'Ditolak oleh manajemen.',
                actor: actorName,
                role: actorRole,
                timestamp: new Date().toISOString()
            };
            updatePayload.rejection_reason_history = [...currentHistory, newRejectionEntry];
        }

        const { error: updateError } = await supabase
            .from('action_plans')
            .update(updatePayload)
            .eq('id', actionPlanId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, newStatus });

    } catch (error: any) {
        console.error("Failed to PATCH action plan:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
