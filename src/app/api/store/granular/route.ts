import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.warn("Falling back to mock data for /api/store/granular (No Auth)");
        return NextResponse.json(getMockGranularData());
    }

    try {
        // 1. Dapatkan store_id milik user
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('store_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !profile.store_id) {
            console.error("[API/granular] Error or missing store_id:", profileError || profile);
            return NextResponse.json(getMockGranularData());
        }

        // 2. Ambil action plans yang spesifik untuk toko user
        const { data: plans } = await supabase
            .from('action_plans')
            .select('*')
            .eq('store_id', profile.store_id)
            .order('due_date', { ascending: true });

        if (!plans || plans.length === 0) {
            return NextResponse.json(getMockGranularData());
        }

        // 3. Transform data DB menjadi format antarmuka React
        const formattedPlans = plans.map(p => ({
            id: p.id,
            type: p.plan_type.toLowerCase() === 'qualitative' ? 'qualitative' : 'quantitative',
            journey: p.journey_name,
            journeyScore: null, // Asumsi dari mock awal: score spesifik tidak disimpan di row action_plan, jika butuh bisa dijoin dengan wave_evaluations
            status: p.status,
            dueDate: p.due_date,
            historicalTag: determineHistoricalTag(p.failed_items_history), // Butuh fungsi helper DB jika history kompleks
            failedItems: extractFailedItems(p.failed_items_history),
            qualitativeContext: p.ai_sentiment_quote,

            // Kolom Isian Store Head + Feedback Cabang
            rca: p.rca_description || "",
            commitment: p.action_strategy || "",
            pic: p.pic_name || "",
            blocker: p.blocker_text,
            evidenceUrl: p.evidence_url,
            branchFeedback: extractLatestRejection(p.rejection_reason_history)
        }));

        return NextResponse.json({ actionPlans: formattedPlans });

    } catch (error) {
        console.error("Database Error in /api/store/granular:", error);
        return NextResponse.json(getMockGranularData());
    }
}

// ---- Helpers untuk Parsing Kolom JSONB Supabase ---- //

function extractFailedItems(historyJson: any): string[] {
    if (!historyJson || !Array.isArray(historyJson)) return [];
    // Misal JSONB isinya: [{"itemName": "Toko kotor..."}]
    return historyJson.map(h => typeof h === 'string' ? h : (h.itemName || "Unknown item"));
}

function determineHistoricalTag(historyJson: any): string {
    if (!historyJson) return "New Failed";
    // Logika Mock Sementara, aslinya membaca field spesifik dari JSONB
    return "Action Required";
}

function extractLatestRejection(rejectionJson: any): string | undefined {
    if (!rejectionJson || !Array.isArray(rejectionJson) || rejectionJson.length === 0) return undefined;
    // Asumsi rejection array format: [{ date, message }]
    const latest = rejectionJson[rejectionJson.length - 1];
    return latest.message || undefined;
}

// ---------------------------------------------------- //

function getMockGranularData() {
    return {
        actionPlans: [
            {
                id: 'AP-1001',
                type: 'quantitative',
                journey: 'E. Needs Analysis (MOCK)',
                journeyScore: 60,
                status: 'Requires Action',
                dueDate: '2025-02-28',
                historicalTag: 'Recurring Failed',
                failedItems: [
                    "Retail Assistant tidak menawarkan produk tambahan yang relevan.",
                    "Retail Assistant tidak menanyakan kebutuhan spesifik pelanggan."
                ],
                qualitativeContext: null,
                rca: "",
                commitment: "",
                pic: "",
                blocker: null,
                evidenceUrl: null
            },
            {
                id: 'AP-1002',
                type: 'quantitative',
                journey: 'D. Product Knowledge',
                journeyScore: 75,
                status: 'Waiting for Approval',
                dueDate: '2025-02-28',
                historicalTag: 'Inconsistent',
                failedItems: [
                    "Retail Assistant ragu saat menjelaskan fitur teknis Carrier 60L."
                ],
                qualitativeContext: null,
                rca: "Staff baru bernama Riko belum ikut training Product Knowledge bulanan.",
                commitment: "Mengikutkan Riko di sesi training online besok pagi jam 09:00.",
                pic: "Riko (Staff)",
                blocker: null,
                evidenceUrl: "https://drive.google.com/example-link"
            },
            {
                id: 'AP-1004',
                type: 'qualitative',
                journey: 'AI Sentinel: Pelayanan Darurat',
                journeyScore: null,
                status: 'Requires Action',
                dueDate: '2025-02-21',
                historicalTag: 'AI Sentiment Alert',
                failedItems: [],
                qualitativeContext: "[DEVELOPMENT MOCK] Supabase offline/no auth. Data ini dimuat dari mock file internal.",
                rca: "",
                commitment: "",
                pic: "",
                blocker: null,
                evidenceUrl: null
            }
        ]
    };
}
