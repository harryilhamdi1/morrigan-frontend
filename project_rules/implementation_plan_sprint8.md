# Sprint 8: National Action Plan Portal (Executive Command Center)

## Goal Description
Setelah alur eksekusi (*Store*), persetujuan teknis/kebijakan (*Branch* & HCBP), dan pengawasan lintas-cabang (*Regional*) selesai di Sprints 5-7, **Sprint 8** adalah puncak piramida: **Portal C-Level dan Top Management Nasional**. 
Fokus di level Nasional murni pada **Sintesis Strategis, Risiko Reputasi Brand, dan Intervensi Infrastruktur (CAPEX/OPEX)**. Eksekutif pusat tidak melakukan *approval* kartu sama sekali, mereka menyerap intisari data untuk mengubah kebijakan perusahaan.

---

## 1. Arsitektur Halaman Nasional (The Executive Command Center)
Halaman ini dirancang sangat minimalis, membuang semua detail "receh", dan hanya menampilkan angka (*hard metrics*) serta narasi strategis (*soft metrics*) bernilai tinggi.

### A. Global Header: The Time-Picker & All Time View
Eksekutif Nasional jarang memantau secara mingguan. Pilihan waktu (*Time-Picker*) mereka dirancang untuk skala makro: `[Wave 1 2025]`, `[Q1 2025]`, atau opsi absolut **[ALL TIME / YTD]**.
- **All Time Implementation**: Saat mode `ALL TIME` dihidupkan, grafik kepatuhan hierarki (*Submission Discipline Index*) menunjukkan tren pelonjakan atau kejatuhan disiplin Nasional dari awal program diluncurkan. Laporan akhir AI berfungsi sebagai **Post-Mortem Assessment Tahunan**: Mengevaluasi apakah ratusan ribu perbaikan *Action Plan* yang terjadi dalam setahun terakhir benar-benar memperbaiki angka *Revenue/Score* perusahaan atau hanya ilusi birokrasi semata.

### B. The National Executive Briefing (Map-Reduce Step 3)
Ini adalah tahap akhir ekskavasi AI **(Region to National)** menggunakan model tingkat puncak **(Gemini 1.5 Pro)**. AI membaca dua *layer* dari 5 Region di Indonesia:
1. *AI Regional Insights* yang digenerate oleh Gemini Pro tingkat bawahnya.
2. *Feedback / Komentar Relevan* dari para *Regional Director*.

AI mensintesis seluruh data ini menjadi satu **Master Executive Deck** Nasional.
- **AI Persona & Gaya Bahasa**: *"Chief Strategy Advisor"*. Nada bicara sangat korporat, berorientasi pada profitabilitas, *Brand Image*, dan kepatuhan hukum (*Compliance*). Bahasanya memuat *Risk Assessment* dan *Policy Impact*.
- **No Feedback Loop Required**: Karena level Nasional ditujukan untuk C-Level dan Top Management secara absolut, **tidak disediakan/tidak diwajibkan fitur form *feedback*** di halaman ini. Halaman ini murni berfungsi sebagai *Executive Deck* konsumsi semata.
- **Database Caching**: Tersimpan di Supabase (`ai_national_summaries`). Mengingat bobot datanya sangat makro, *generate* ini dijalankan via CRON. Tersedia akses *Manual Override* bagi Superadmin.
- **Output Visual**: *Widget* naratif tingkat tinggi dengan 3 *Tab* Utama:
  1. 🚨 **Systemic National Risks**: AI menyimpulkan masalah yang seragam di seluruh Indonesia. *(Contoh: "Sistem Kasir (POS) di Jawa, Sumatera, dan Sulawesi dilaporkan sering 'freeze'. Ini bukan masalah SDM, melainkan kendala infrastruktur IT Nasional yang menahan laju transaksi (Revenue Loss). Rekomendasi: Audit vendor POS pusat.")*
  2. 🏢 **Corporate Policy Interventions**: Rekomendasi perubahan SOP. *(Contoh: "Banyak cabang memodifikasi standar seragam karena material saat ini dinilai terlalu panas oleh karyawan lapangan. Rekomendasi: HCBP Nasional perlu meninjau ulang material seragam untuk iklim tropis.")*
  3. 🥇 **National Best Practices & Star Regions**: Wilayah yang sukses melakukan *turnaround* resolusi terbanyak, layak diberikan *Reward* korporat.

### C. The Executive Compliance Radar (Macro Dashboards)
Eksekutif tidak membaca *Action Card* warga toko, tapi mereka disuguhi **Indikator Kesehatan Hierarki (*Hierarchy Health Indicator*)**:
1. **Submission Discipline Index (Nasional)**: Grafik pai/bar yang membandingkan persentase kedisiplinan 5 Region (Mana Region yang paling banyak *Turtle Badges* alias telat *submit*).
2. **Resolution SLA Time (Nasional)**: Rata-rata waktu yang dibutuhkan perusahaan (dari Toko lapor sampai HCBP ketok palu *Resolved*) secara nasional. (Misal: *Average Resolution Time: 4 Hari*).

### D. The Ultimate Drill-Down (God Mode)
Meskipun Eksekutif hanya disuguhi grafik makro, UI memiliki kebebasan navigasi menembus (*piercing*) hingga ke titik terbawah:
- Jika C-Level melihat sentimen "Pelayanan Kasir" anjlok parah di Region Sumatera, mereka bisa mengklik grafik bar Sumatera tersebut $\rightarrow$ Muncul popup pembedahan *Branch* di Sumatera $\rightarrow$ Klik *Branch* $\rightarrow$ Muncul daftar *Store* $\rightarrow$ Klik *Store* $\rightarrow$ Muncul wujud asli **Action Card** beserta fotonya.
- Sifat navigasi ini **STRICTLY READ-ONLY**. Hanya untuk memuaskan rasa penasaran (*Root Cause Verification/Gemba*) pada level tertinggi, tanpa merusak atau mengubah wewenang persetujuan di level Cabang/HCBP.
