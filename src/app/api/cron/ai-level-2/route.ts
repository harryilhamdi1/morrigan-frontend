import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function GET(request: Request) {
    if (API_KEY === 'MISSING_API_KEY') {
        return NextResponse.json({
            error: "GEMINI_API_KEY is restricted. Set key to run AI Level 2."
        }, { status: 401 });
    }

    try {
        // Simulasi Penarikan Data (Data Fetching Level 2: Menggabungkan 5 Branch Insight + Feedback Branch Head)
        const mockBranchData = `
            Branch Jakarta Selatan:
            - Insight AI: EDC Sering error.
            - Komentar Pimpinan: "Sudah lapor IT Pusat belum ada tanggapan."

            Branch Bandung:
            - Insight AI: Seragam staf tidak seragam karena stok habis.
            - Komentar Pimpinan: "Vendor seragam telat kirim 1 bulan."

            Branch Surabaya:
            - Insight AI: Keluhan pelanggan soal lambatnya pelayanan kasir saat weekend.
            - Komentar Pimpinan: "Kami usul penambahan HC part-time weekend."
        `;

        // Konfigurasi Model (Pro 1.5 untuk sentimen komentar manusia + sintesis abstrak)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: `Anda adalah Regional Executive Advisor. 
Tugas Anda adalah membaca komposit Branch Insights dari 5-10 cabang beserta *feedback* subjektif pimpinan cabang.
Jangan fokus pada kasus individual, tapi temukan pola sistemik komunal (Systemic Failure).

Format output JSON murni tanpa markdown:
{
  "macroBottlenecks": [{"title":"...","description":"...","severity":"High/Medium"}],
  "praise": [{"title":"...","description":"..."}],
  "threatRadar": [{"title":"...","description":"..."}]
}
`
        });

        console.log("[CRON Lvl-2] Executing Gemini 1.5 Pro Map-Reduce (Branch to Region)...");
        const prompt = `Synthesize these Branch-level reports into a Regional Summary:\n${mockBranchData}`;

        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedReport = JSON.parse(cleanedText);

        return NextResponse.json({
            status: "success",
            message: "Level 2 Map-Reduce (Branch to Region) executed.",
            model_used: "gemini-1.5-pro",
            insight_result: parsedReport
        });

    } catch (error: any) {
        console.error("CRON Lvl-2 Error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
