import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini SDK. 
// Fallback key ditaruh untuk safety saat run local tanpa .env (meskipun idealnya selalu pakai .env)
const API_KEY = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function GET(request: Request) {
    // 1. Validasi API Key
    if (API_KEY === 'MISSING_API_KEY') {
        return NextResponse.json({
            error: "GEMINI_API_KEY is not defined in the environment.",
            instruction: "Please set your GEMINI_API_KEY in the .env file to run this CRON job.",
            mock_behavior: "Script is successfully structured but blocked by missing credentials."
        }, { status: 401 });
    }

    try {
        // 2. Simulasi Penarikan Data (Data Fetching Level 1: Puluhan Store Action Plans dalam 1 Cabang)
        // Di skenario nyata, ini akan me-query Supabase: SELECT * FROM action_plans WHERE branch_id = XYZ
        const mockStoreRCAs = `
            Store A (Journey: Facility): "Mesin EDC lambat merespon kartu saat jam sibuk, antrean panjang."
            Store B (Journey: Grooming): "Staf baru belum paham standar seragam perusahaan."
            Store C (Journey: Service): "Pelanggan komplain kasir kurang tanggap karena harus melayani online order bersamaan."
            Store D (Journey: Facility): "Sinyal internet mesin kasir putus-nyambung dari ISP."
            Store E (Journey: HC): "Banyak staf sakit karena pergantian cuaca ekstrem, shift kebobolan."
            Store F (Journey: Facility): "EDC Bank BCA error sejak kemarin."
        `;

        // 3. Konfigurasi Model (Flash 1.5 sangat cocok untuk tugas map-reduce cepat volume besar)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `Anda adalah seorang Tactical Area Manager. 
Tugas Anda adalah membaca laporan Root Cause Analysis (RCA) mingguan dari puluhan operator toko di satu cabang.
Kelompokkan komplain yang serupa. Ekstrak menjadi 3 area fokus utama:
1. Top Bottlenecks (Masalah paling krusial yang mengganggu operasi)
2. Praise & Recognitions (Hal-hal baik/heroik yang terjadi, jika ada)
3. Threat Radar (Risiko yang bisa membesar minggu depan jika tidak ditangani)

Format output harus berupa representasi valid JSON (tanpa tag markdown) dengan struktur:
{
  "topBottlenecks": [{"title":"...","description":"..."}],
  "praise": [{"title":"...","description":"..."}],
  "threatRadar": [{"title":"...","description":"..."}]
}
Gunakan bahasa operasional ritel korporat yang tegas dan taktis.
`
        });

        // 4. Eksekusi Inferencing AI
        const prompt = `Analisa kumpulan data RCA toko-toko berikut dan generate Tactical Briefing:\n${mockStoreRCAs}`;

        console.log("[CRON Lvl-1] Executing Gemini 1.5 Flash Map-Reduce...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Bersihkan output jika AI menyelipkan tag markdown
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parsing JSON mentah dari Gemini
        const parsedReport = JSON.parse(cleanedText);

        // 5. Simpan Hasilnya kembali ke Database
        // Di skenario nyata: await supabase.from('branch_insights').insert(parsedReport)

        return NextResponse.json({
            status: "success",
            message: "Level 1 Map-Reduce (Store to Branch) executed.",
            model_used: "gemini-1.5-flash",
            simulated_database_save: true,
            insight_result: parsedReport
        });

    } catch (error: any) {
        console.error("CRON Lvl-1 Error:", error);
        return NextResponse.json({
            status: "error",
            message: error.message || "Failed to generate AI insights."
        }, { status: 500 });
    }
}
