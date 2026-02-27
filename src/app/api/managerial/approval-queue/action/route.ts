import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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
        const currentHistory = Array.isArray(currentPlan.historical_tracking)
            ? currentPlan.historical_tracking
            : [];

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
        console.error("Failed to update action plan:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
