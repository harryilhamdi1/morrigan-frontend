import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function GET(request: Request) {
    if (API_KEY === 'MISSING_API_KEY') {
        return NextResponse.json({
            error: "GEMINI_API_KEY is restricted. Set key to run AI Level 3."
        }, { status: 401 });
    }

    try {
        // Simulasi Penarikan Data (Data Fetching Level 3: Insight Regional + Komentar Direktur Regional)
        const mockRegionalData = `
            Region Jawa:
            - Macro Failures: Keterlambatan Vendor Seragam (30%), Error POS/EDC (70%).
            - Direktur Comment: "Isu Vendor sudah sistemik, butuh intervensi HQ (Headquarters)."
            
            Region Sumatera:
            - Macro Failures: Kekurangan HC (Headcount) staf baru. Proses rekrutmen pusat bottleneck.
            - Direktur Comment: "Kewenangan rekrutmen harus desentralisasi."
        `;

        // Konfigurasi Model (Pro 1.5 untuk Executive Decision Making)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: `Anda adalah "Chief Strategy Advisor" untuk level Direktur/C-Level Nasional.
Sintesis data Regional ini ke dalam Executive Deck.
Berikan "Corporate Policy Interventions" yang jelas (perubahan kebijakan SOP/Vendor) berdasar isu struktural.

Format output JSON murni tanpa markdown:
{
  "systemicRisks": [{"title":"...","description":"...", "businessImpact":"...", "recommendation":"..."}],
  "policyInterventions": [{"title":"...","description":"...", "actionRequired":"..."}],
  "bestPractices": [{"subject":"...","description":"...", "rewardSuggestion":"..."}]
}
`
        });

        console.log("[CRON Lvl-3] Executing Final Gemini 1.5 Pro Map-Reduce (Region to National)...");
        const prompt = `Sintesis Laporan Nasional berbasis Regional berikut:\n${mockRegionalData}`;

        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedReport = JSON.parse(cleanedText);

        return NextResponse.json({
            status: "success",
            message: "Level 3 Map-Reduce (Region to National) executed.",
            model_used: "gemini-1.5-pro",
            insight_result: parsedReport
        });

    } catch (error: any) {
        console.error("CRON Lvl-3 Error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
