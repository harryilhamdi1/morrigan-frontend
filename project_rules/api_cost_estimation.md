# API Cost Estimation: Dual-Engine AI (Gemini Flash & Pro)

Berdasarkan data operasional aktual dari file `Master Site Morrigan.csv`, struktur hierarki ritel EIGER saat ini terdiri dari:
- **Toko (Store)**: 341 entitas
- **Cabang (Branch)**: 20 entitas
- **Regional (Region)**: 5 entitas
- **Nasional**: 1 entitas

Mengacu pada arsitektur *Map-Reduce* dengan eksekusi *CRON Job* **1 kali seminggu** (4 minggu/bulan) dari Senin sampai Sabtu, berikut adalah estimasi biaya per bulan untuk keseluruhan sistem aksi *Morrigan Action Plan*.

## PARAMETER REVISI (DYNAMIC ACTION PLAN RULES)
Berdasarkan *business rule* final, kuantitas *Action Plan* tidak lagi dipatok di angka 6 per toko. Sistem bersifat dinamis (*Reward & Punishment*):
1. **Quantitative (Punishment Rule)**: Tidak ada batas maksimal. Semua *Journey* (A s/d K) yang skornya jeblok di bawah Target Nasional (< 90) **wajib diselesaikan dengan Action Plan**. Jika ada toko yang gagal di seluruh 11 *Journeys*, toko tersebut "dihukum" 11 *Action Plan* kuantitatif. Toko yang sempurna (skor 100) dibebaskan (0 AP).
2. **Qualitative (Single Voice Rule)**: Adanya ulasan (*voice of customer*) negatif yang disarikan oleh AI dari file `Master_Qualitative_AI_Categorized.csv`. Dibatasi hanya **maksimal 1 Feedback** terbesar per toko. Jika ulasan 100% positif, form AP ditiadakan.
3. **Rising Star (Toko Baru)**: Karena belum memiliki skor evaluasi, sistem memaksa mereka mengerjakan **5 Action Plan Default** yang diambil dari 5 *Journey* dengan rata-rata Nasional terburuk (sebagai simulasi/latihan kepatuhan).

*(Skenario Terburuk / Worst Case Budgeting)*: Untuk kalkulasi batas aman anggaran API, kita mengasumsikan malapetaka: seluruh **341 toko** se-Indonesia gagal total di seluruh 11 *Journeys* ditambah mendapat 1 Komplain AI setiap minggunya. **Total Maksimal = 12 Action Plan sangat tebal per toko per minggu**.

---

## 1. TINGKAT CABANG (Map-Reduce Step 1)
- **Model yang digunakan**: **Gemini 1.5 Flash 8B**
- **Tugas AI**: Membaca 12 form RCA, Solusi, PIC, dan Blocker dari masing-masing toko.
- **Asumsi Token/Cabang (Per Minggu)**: 
  - 1 Toko (12 Action Plan Maksimal) = ~500 token teks.
  - *Input Cabang* (Rata-rata 17 Toko) = 17 $\times$ 500 = ~8,500 token.
  - *Output* (Ringkasan Cabang) = ~350 token.
- **Total Token Sebulan (20 Cabang, 4 Minggu)**: 
  - *Input*: 8,500 $\times$ 20 $\times$ 4 = 680,000 token/bulan.
  - *Output*: 350 $\times$ 20 $\times$ 4 = 28,000 token/bulan.
- **Biaya Gemini Flash 8B (Harga Publik)**:
  - Input: $0.0375 / 1 Juta Token = Rp 600
  - Output: $0.1500 / 1 Juta Token = Rp 2,400
- **Total Biaya Lapis Cabang**: ($0.0375 \times 0.68) + ($0.1500 \times 0.028) $\approx$ **$0.029 per bulan (Rp 464 / Bulan)**.

---

## 2. TINGKAT REGIONAL (Map-Reduce Step 2)
- **Model yang digunakan**: **Gemini 1.5 Pro**
- **Asumsi Token/Regional (Per Minggu)**: 
  - *Input* (Teks Flash dari ~4 cabang + Komentar Manajer): ~2,500 token.
  - *Output* (Strategic Regional Summary): ~400 token.
- **Total Token Sebulan (5 Region, 4 Minggu)**: 
  - *Input*: 2,500 $\times$ 5 $\times$ 4 = 50,000 token/bulan.
  - *Output*: 400 $\times$ 5 $\times$ 4 = 8,000 token/bulan.
- **Biaya Gemini 1.5 Pro (Harga Publik)**:
  - Input: $1.25 / 1 Juta Token = Rp 20,000
  - Output: $5.00 / 1 Juta Token = Rp 80,000
- **Total Biaya Lapis Regional**: ($1.25 \times 0.05) + ($5.00 \times 0.008) $\approx$ **$0.102 per bulan (Rp 1,632 / Bulan)**.

---

## 3. TINGKAT NASIONAL (Map-Reduce Step 3)
- **Model yang digunakan**: **Gemini 1.5 Pro**
- **Asumsi Token/Nasional (Per Minggu)**: 
  - *Input* (Teks Pro dari 5 Region + Feedback): ~3,500 token.
  - *Output* (The Executive Deck): ~500 token.
- **Total Token Sebulan (1 Nasional, 4 Minggu)**: 
  - *Input*: 3,500 $\times$ 1 $\times$ 4 = 14,000 token/bulan.
  - *Output*: 500 $\times$ 1 $\times$ 4 = 2,000 token/bulan.
- **Total Biaya Lapis Nasional**: ($1.25 \times 0.014) + ($5.00 \times 0.002) $\approx$ **$0.027 per bulan (Rp 432 / Bulan)**.

---

## KESIMPULAN BIAYA (GRAND TOTAL - SKENARIO KIEMAT 12 ACTION PLAN)

- Lapis 1 (Flash): $0.029
- Lapis 2 (Pro): $0.102
- Lapis 3 (Pro): $0.027
- **TOTAL API COST:** **$0.158 per Bulan (Kurang lebih Rp 2.500,- / Bulan)**

**Mengapa Sangat Murah?**
1. **Map-Reduce Architecture**: AI tidak membaca ulang teks dari lantai dasar. AI Regional murni hanya membaca kesimpulan Cabang. Semakin ke atas piramida, *text input*-nya semakin sedikit tapi bernilai strategis tinggi.
2. **Asynchronous Execution (CRON)**: AI dieksekusi diam-diam di malam hari. Saat 300 Manajer menekan tombol *refresh* esok paginya, aplikasi tidak pernah membakar token API baru $\rightarrow$ mereka hanya me-*load* teks biasa dari SUPABASE *database cache* (Biaya Web Database standar).
3. **The Dual-Engine Approach**: Data massal (jumlah 341 cabang) digerus menggunakan model Flash yang harganya amat sangat murah (hanya belasan perak Rupiah), sementara daya *reasoning* mahal (Pro) difokuskan hanya pada puncak data.

*(Catatan: Perhitungan ini memakai skema Pay-as-you-go standar GCP. Asumsi 1 USD = Rp 16.000).*
