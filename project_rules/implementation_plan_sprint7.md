# Sprint 7: Regional Action Plan Portal (Cross-Branch Intelligence)

## Goal Description
Setelah menyelesaikan *Action Plan Workflow* untuk *Store Head* (Sprint 5) dan *Branch Head / HCBP* (Sprint 6), **Sprint 7** difokuskan eksklusif pada **Regional Director**. Tujuannya bukan untuk melakukan *micro-approval* harian, melainkan untuk melihat kepatuhan cabang-cabang di seluruh Region mereka secara *head-to-head*, mendeteksi krisis *supply/manpower* regional, dan mengevaluasi efektivitas solusi yang ditawarkan cabang.

---

## 1. Arsitektur Halaman Regional (The Regional Action Plan Portal)
Halaman ini dirancang sebagai *Control Tower* tingkat menengah. Objektif utamanya adalah **Perbandingan (Comparison) dan Eskalasi Tak Terduga**.

### A. Global Header: The Week-Picker & All Time View
Persis seperti level di bawahnya, *Regional Director* mengendalikan ruang pandang analitiknya dengan memutar navigasi **Dropdwon / Selector** mulai dari `[W1 Feb '25]` hingga ke mode **[ALL TIME / YTD]**.
- **All Time Implementation**: Mengubah layar *Branch Health Roster* (Tabel Komparasi Cabang) menjadi rapor tahunan berjalan (*Year-to-Date*). Direktur Regional langsung bisa menilai Cabang mana yang merupakan "Top Performer" dan mana yang langganan masuk "Discipline Index Penalty" selama rentang waktu operasional. Intelijen AI akan otomatis beralih menampilkan *Macro Trend Analysis* historis. 

### B. The Regional AI Intelligence (Map-Reduce Step 2)
Ini adalah implementasi **Map-Reduce Tahap 2 (Branch to Region)** menggunakan model penalaran tingkat atas **(Gemini 1.5 Pro)**. AI tidak lagi membaca formulir toko satu per satu. AI murni membaca dua hal dari *semua Branch* di Region tersebut:
1. *AI Branch Insights* yang digenerate oleh Gemini Flash sebelumnya.
2. *Additional Comments / Feedback* yang ditulis oleh para *Branch Head* secara manual minggu itu.

AI Pro menyimpulkan kedua entitas data tersebut menjadi satu **Executive Summary Apik** untuk Regional:
- **AI Persona & Gaya Bahasa**: *"Executive Advisor"*. Nada bicaranya lugas, berbasis data (*data-driven*), dan berorientasi pada risiko bisnis.
- **The Regional Head "Feedback" Loop**: Setelah *Regional Director* membaca *Insight* apik yang di-*generate* Gemini Pro ini, Direktur **diwajibkan untuk meninggalkan Feedback/Komentar Relevan** terhadap temuan *Branch-Branch* di bawahnya. Komentar ini akan ditarik ke puncak piramida Nasional.
- **Database Caching**: Hasil ekstraksi disimpan di Supabase (`ai_regional_summaries`), di-*generate* 1x via CRON.
- **Output Visual**: *Widget* naratif interaktif dengan tiga *tab* kecil:
  1. ⚡ **Cross-Branch Systemic Issues**: (Contoh: *"Peringatan: 3 dari 5 Cabang (Jabar, Jateng, Jatim) mencatat pelonjakan 400% komplain antrean kasir. Investigasi RCA mereka seragam: Sistem POS versi terbaru sering 'freeze' saat weekend."* - Ini menyadarkan Region bahwa ini masalah IT Nasional, bukan staf kasir).
  2. 🏆 **Regional Best Practices**: (Contoh: *"Cabang Banten berhasil menekan komplain toilet kotor hingga 0% minggu ini berkat rotasi shift facility setiap 2 jam. Direkomendasikan untuk di-duplikasi ke Cabang lain."*)
  3. 💡 **Resource & Policy Intervention**: AI memberikan rekomendasi pengalokasian sumber daya. (Contoh: *"Mengingat rentetan kegagalan SOP seragam di area Sulawesi, merekomendasikan intervensi training Grooming ulang minggu depan."*)

### C. The Tactical Statistics Cards (Regional Scope)
*Card* metrik makro yang diletakkan di bawah navigasi minggu:
1. **Total Assigned Areas**: Total tugas seluruh region minggu ini.
2. 🐢 **Slowest Branch Queue**: Cabang dengan antrean persetujuan (Menunggu *Branch Head*) paling banyak.
3. 🔴 **Total Overdue**: Total *Action Plan* yang menembus tenggat waktu.
4. ✅ **Regional Resolution Rate**: Kepatuhan penyelesaian seluruh Region.

### D. The Branch Performance Radar (Bottom Section)
*Regional Director* tidak memiliki *Action Cards Approval Feed* (karena tugas *Approve/Reject* ada di *Branch* dan *HCBP*). Sebagai gantinya, panggung utama mereka adalah **Tabel/Grid Komparasi Cabang**:
- **UI Konsep (Branch Health Roster)**: Menampilkan nama setiap Cabang di Region mereka, lengkap dengan metrik:
  - Jumlah *Action Plan* Selesai vs Tertunda.
  - Jumlah "Turtle Badges" (Indeks Kedisiplinan Keterlambatan Pengajuan Toko).
- **Drill-Down Capability (Deep Dive)**: Jika *Regional Director* melihat Cabang Surabaya penuh merah, mereka dapat mengeklik nama "Cabang Surabaya", dan sistem akan meminjamkan antarmuka *Branch Inbox* (seperti di Sprint 6) kepada Direktur dengan mode *READ ONLY*. Direktur dapat memeriksa RCA apa saja yang diputus Cabang tersebut sehingga angkanya jelek.
