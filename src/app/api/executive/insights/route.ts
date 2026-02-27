import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Simulasi output intelijen tingkat tertinggi dari Gemini 1.5 Pro (Map-Reduce Level 3)

    const mockNationalInsights = {
        meta: {
            persona: 'Chief Strategy Advisor (Gemini Pro)',
            analysisPeriod: 'Q1, 2025 (YTD)',
            analyzedRegions: 5,
            analyzedBranches: 32,
            analyzedStores: 412
        },
        systemicRisks: [
            {
                id: 'sr-1',
                title: 'National Infrastructure Failure: POS System v2.4',
                description: 'Terdapat korelasi kuat (85%) antara tingginya komplain antrean panjang kasir di seluruh Region Jawa, Sumatera, dan Sulawesi dengan instabilitas sistem POS v2.4 saat beban puncak akhir pekan.',
                businessImpact: 'Estimasi kerugian revenue ~Rp 4.2 Miliar/bulan akibat batal transaksi.',
                recommendation: 'Lakukan audit teknis segera terhadap Vendor IT penyedia POS. Pertimbangkan rollback ke sistem v2.3 atau percepat patch v2.5.'
            },
            {
                id: 'sr-2',
                title: 'Manpower Supply Chain Crisis',
                description: 'Keterlambatan pemenuhan HC (Headcount) staf toko baru di Region Indonesia Timur (Bali Nusra & Sulawesi) mencapai rata-rata 45 hari. Keterbatasan staf memicu kelelahan dan lonjakan komplain Service.',
                businessImpact: 'Penurunan indeks kepuasan di bawah batas aman C-SAT (Critical).',
                recommendation: 'HCBP Pusat perlu mendelegasikan sebagian wewenang rekrutmen awal (screening) ke tingkat Cabang khusus wilayah Timur.'
            }
        ],
        policyInterventions: [
            {
                id: 'pi-1',
                title: 'Revisi SOP Material Seragam Karyawan',
                description: 'Pelanggaran grooming staf meningkat 300% karena cuaca ekstrem kuartal ini. Banyak staf memodifikasi seragam karena material "Heavy Canvas" dianggap tidak breathable.',
                actionRequired: 'R&D Product Development diharap meninjau ulang material "Dry-Fit Tactical" untuk seragam operasional harian.'
            }
        ],
        bestPractices: [
            {
                id: 'bp-1',
                subject: 'Region Jawa Barat (Turnaround of the Quarter)',
                description: 'Mengimplementasikan "15-Minute Daily Standup" yang secara efektif menurunkan rasio komplain facility sebesar 60% dalam skala Region tanpa tambahan anggaran cleaning service.',
                rewardSuggestion: 'Kandidasi \'Best Region Executive Award Q1\'.'
            }
        ]
    };

    return NextResponse.json(mockNationalInsights);
}
