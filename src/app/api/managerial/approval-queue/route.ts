import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // JIKA TIDAK ADA SESI (Fallback ke Mock Data)
    if (authError || !user) {
        console.warn("Falling back to mock data for /api/managerial/approval-queue (No Auth)");
        return NextResponse.json(getMockApprovalQueue());
    }

    try {
        // 1. Dapatkan Branch ID dari Manager ini
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('branch_id, role')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.branch_id) {
            return NextResponse.json({ error: "User is not assigned to a branch." }, { status: 403 });
        }

        const branchId = profile.branch_id;

        // 2. Ambil Store IDs yang ada di dalam Branch ini
        const { data: storesObj, error: storeError } = await supabase
            .from('stores')
            .select('id, store_code, name')
            .eq('branch_id', branchId);

        if (storeError) throw storeError;

        const storeMap = new Map();
        storesObj.forEach(s => storeMap.set(s.id, { storeCode: s.store_code, name: s.name }));
        const storeIds = storesObj.map((s: any) => s.id);

        if (storeIds.length === 0) {
            return NextResponse.json({ summary: { totalPending: 0, oldestSubmission: 'N/A' }, queue: [] });
        }

        // 3. Ambil Action Plans "Waiting for Approval" dari toko-toko di atas
        const { data: plans } = await supabase
            .from('action_plans')
            .select('*')
            .in('store_id', storeIds)
            .eq('status', 'Waiting for Approval')
            .order('updated_at', { ascending: true }); // Yang paling lama nongkrong di atas

        if (!plans || plans.length === 0) {
            return NextResponse.json({ summary: { totalPending: 0, oldestSubmission: 'N/A' }, queue: [] });
        }

        // Hitung umur submission paling tua
        const oldestDate = new Date(plans[0].updated_at);
        const daysAgo = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 3600 * 24));
        const oldestSubmissionStr = daysAgo === 0 ? 'Today' : `${daysAgo} Days Ago`;

        // 4. Format Output untuk UI
        const formattedQueue = plans.map(p => {
            const parsedItems = extractFailedItems(p.failed_items_history);
            return {
                id: p.id,
                storeName: storeMap.get(p.store_id)?.name || 'Unknown Store',
                storeCode: storeMap.get(p.store_id)?.storeCode || 'Unknown Code',
                journey: p.journey_name,
                failedItems: parsedItems.length > 0 ? parsedItems : [],
                originalSentiment: p.ai_sentiment_quote || null,
                rca: p.rca_description || '',
                pic: p.pic_name || '',
                commitment: p.action_strategy || '',
                evidenceUrl: p.evidence_url || null,
                submittedAt: p.updated_at,
                status: p.status
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
        return NextResponse.json(getMockApprovalQueue());
    }
}

// ---- Helpers ----
function extractFailedItems(historyJson: any): string[] {
    if (!historyJson || !Array.isArray(historyJson)) return [];
    return historyJson.map(h => typeof h === 'string' ? h : (h.itemName || "Unknown item"));
}

function getMockApprovalQueue() {
    return {
        summary: {
            totalPending: 12,
            oldestSubmission: '2 Days Ago'
        },
        queue: [
            {
                id: 'AQ-001',
                storeName: 'Eiger BIP (Mock)',
                storeCode: 'BIP01',
                journey: 'A. Facility & Cleanliness',
                failedItems: ['Kaca etalase utama berdebu.'],
                originalSentiment: null,
                rca: 'Jadwal lap sore terlewat karena shift kurang 1 orang (sakit).',
                pic: 'Rendi',
                commitment: 'Mengepel dan membersihkan kaca seketika sebelum tutup.',
                evidenceUrl: 'https://drive.google.com/contoh-foto-kaca-bersih.jpg',
                submittedAt: '2025-02-14T10:30:00Z',
                status: 'Waiting for Approval'
            },
            {
                id: 'AQ-002',
                storeName: 'Eiger Cihampelas (Mock)',
                storeCode: 'CH02',
                journey: 'AI Sentinel: Layanan Pelanggan',
                failedItems: [],
                originalSentiment: '"Pelayan cemberut dan main HP terus di kasir padahal saya mau bayar."',
                rca: 'Kasir baru sedang mengecek instruksi promo di grup WhatsApp, bukan main HP sengaja.',
                pic: 'Susi',
                commitment: 'Melarang penggunaan HP di meja kasir. Dibuatkan grup khusus promo tertulis di briefing pagi.',
                evidenceUrl: null,
                submittedAt: '2025-02-13T16:45:00Z',
                status: 'Waiting for Approval'
            },
            {
                id: 'AQ-003',
                storeName: 'Eiger PVJ (Mock)',
                storeCode: 'PVJ03',
                journey: 'E. Needs Analysis',
                failedItems: ['Tidak menanyakan jenis petualangan pelanggan.'],
                originalSentiment: null,
                rca: 'Customer buru-buru jadi kita ga sempet nanya.',
                pic: 'Deni',
                commitment: 'Pokoknya nanti nanya.',
                evidenceUrl: null,
                submittedAt: '2025-02-12T09:00:00Z',
                status: 'Waiting for Approval'
            }
        ]
    };
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
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Fetch current plan to append history
        const { data: currentPlan, error: fetchError } = await supabase
            .from('action_plans')
            .select('historical_tracking')
            .eq('id', actionPlanId)
            .single();

        if (fetchError || !currentPlan) {
            return NextResponse.json({ error: "Action Plan not found" }, { status: 404 });
        }

        const newStatus = action === 'approve' ? 'Approved' : 'Revision Required';
        const currentHistory = currentPlan.historical_tracking || [];

        const newHistoryLog = {
            status: newStatus,
            notes: action === 'reject' ? rejectReason : 'Approved by Management',
            timestamp: new Date().toISOString(),
            actor_id: user.id
        };

        const { error: updateError } = await supabase
            .from('action_plans')
            .update({
                status: newStatus,
                historical_tracking: [...currentHistory, newHistoryLog],
                updated_at: new Date().toISOString()
            })
            .eq('id', actionPlanId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, newStatus });

    } catch (error: any) {
        console.error("Failed to PATCH action plan:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
