import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Simulasi data radar kepatuhan makro tingkat Nasional

    const mockComplianceData = {
        kpi: {
            averageResolutionTime: 4.2, // Hari
            resolutionTrend: '-0.8', // Lebih cepat 0.8 hari dibanding kuartal lalu
            nationalCompletionRate: 88.5, // Persen AP selesai
            totalActiveOverdue: 142 // Total nunggak se-Indonesia
        },
        // Data untuk Pie Chart (Proporsi Turtle Badges / Keterlambatan antar Region)
        turtlePenaltiesByRegion: [
            { name: 'Jawa & Bali', infractions: 45, fill: '#ef4444' }, // Rose 500
            { name: 'Sumatera', infractions: 82, fill: '#f97316' },    // Orange 500
            { name: 'Kalimantan', infractions: 12, fill: '#eab308' },  // Yellow 500
            { name: 'Sulawesi & Maluku', infractions: 28, fill: '#0ea5e9' }, // Sky 500
            { name: 'Papua', infractions: 5, fill: '#8b5cf6' }        // Violet 500
        ],
        // Tren Penyelesaian dari Kuartal ke Kuartal
        quarterlyResolutionTrend: [
            { quarter: 'Q1', target: 90, actual: 82 },
            { quarter: 'Q2', target: 90, actual: 85 },
            { quarter: 'Q3', target: 90, actual: 81 },
            { quarter: 'Q4', target: 90, actual: 88.5 }
        ]
    };

    return NextResponse.json(mockComplianceData);
}
