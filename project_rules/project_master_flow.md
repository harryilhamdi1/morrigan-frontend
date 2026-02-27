# The Master Project Flow: Morrigan Report V2 (Sprints 1-8)

Aplikasi **Morrigan Report V2** bukan sekadar *dashboard* analitik biasa, melainkan sebuah **Sistem Saraf Operasional Terpusat (Central Nervous System)** untuk jaringan ritel EIGER. Sistem ini menghubungkan 345 Toko, 21 Cabang, 5 Region, hingga C-Level Nasional melalui dua pilar utama:
1. **Pilar Kuantitatif (Sprints 1-4)**: *Dashboard Overview* berbasis skor angka (Top-Down).
2. **Pilar Kualitatif (Sprints 5-8)**: *Action Plan Execution & AI Map-Reduce* berbasis keluhan teks (Bottom-Up).

Berikut adalah detail isi halaman, cara kerja, dan *output* dari masing-masing tingkat hierarki:

---

## BAGIAN I: THE QUANTITATIVE DASHBOARDS (Top-Down Overview)
Fokus pada metrik angka, *Customer Satisfaction Score (CSAT/ESS)*, *Net Promoter Score (NPS)*, dan analisis tren komparatif.

### Sprint 1: Executive Portal (National Level)
- **Pengguna**: C-Level, Top Management Nasional.
- **Isi Halaman**:
  - **The Indonesia Heatmap**: Peta interaktif yang mewarnai 5 Region (Merah/Kuning/Hijau) berdasarkan rata-rata *Score* mereka.
  - **National High-Level Metrics**: Skor kepuasan kumulatif (ESS), *Mystery Shopper Score*, dan matriks perjalanan *(Journeys)*: *Service, Facility, Cleanliness, People, Transaction Process*.
- **Cara Kerja**: Data direkap dari seluruh 345 toko secara absolut. Eksekutif memantau apakah bulan ini kinerja EIGER seantero Nusantara naik atau turun.
- **Output**: Kesadaran makro mengenai kesehatan *Customer Experience* Nasional.

### Sprint 2: Regional Portal (Cross-Branch Scope)
- **Pengguna**: Regional Director (Membawahi ~4-5 Cabang).
- **Isi Halaman**: 
  - **Branch Leaderboard**: Tabel klasemen Cabang mana yang ESS-nya melampaui target, dan mana yang anjlok ke zona merah.
  - **Regional Trends**: Pergerakan skor dari bulan ke bulan khusus di region tersebut.
- **Cara Kerja**: Direktur membandingkan (*head-to-head*) Cabang di bawahnya untuk melihat siapa yang menarik skor Regional turun.
- **Output**: Identifikasi "Cabang Pesakitan" yang menggerus rata-rata skor Regional.

### Sprint 3: Branch Portal (Cross-Store Scope)
- **Pengguna**: Branch Head / Area Manager (Membawahi ~16 Toko).
- **Isi Halaman**:
  - **The Store Scatter Plot**: Grafik pencar (Kuadran 1 sampai 4) yang memetakan kinerja ~16 toko. Di mana letak toko yang "Omzet Tinggi, tapi ESS Rendah" (*Top Right Quadrant*).
  - **Local Outliers**: Daftar 3 toko terbaik dan 3 terburuk di Cabang tersebut.
- **Cara Kerja**: *Branch Head* secara visual mencari toko yang tidak normal (skornya tiba-tiba *drop* tajam dari bulan sebelumnya).
- **Output**: Keputusan taktis untuk melakukan kunjungan toko (*Store Visit/Gemba*) ke lokasi yang bermasalah.

### Sprint 4: Store Portal (Micro Scope)
- **Pengguna**: Store Head (Kepala Toko).
- **Isi Halaman**:
  - **The Store Pulse**: Detak jantung toko (Skor rata-rata toko ini saja).
  - **Detailed Scorecard**: Pemecahan rinci dari ke-5 aspek *Journey* (misal: "Mengapa nilai *Facility* kita hanya 60? Karena sub-kategori 'AC/Kenyamanan' jeblok").
- **Cara Kerja**: Kepala toko melihat rapor angka spesifik tokonya di gelombang (*wave*) saat ini dibandingkan kuartal lalu.
- **Output**: Kesadaran absolut *(self-awareness)* staf toko terhadap kelemahan spesifik lokasinya.

---

## BAGIAN II: THE QUALITATIVE ACTION PLAN & AI ENGINE (Bottom-Up Execution)
Setelah puas melihat "Angka Rapor Jelek" di Sprints 1-4, sistem memaksa pimpinan untuk "Melakukan Perbaikan" (*Action*) atas keluhan teks dari pelanggan di Sprints 5-8. Di sinilah **AI Map-Reduce Engine** bekerja keras.

### Sprint 5: Store Mission Board (Pondasi Eksekusi)
- **Pengguna**: Store Head.
- **Isi Halaman**:
  - **The Week-Picker**: Navigasi untuk mengunci tugas per minggu (termasuk mode `[ALL TIME]` untuk Arsip Historis).
  - **Accountability Widget**: *Gamification* kepatuhan (SLA *Gauge*, *Streak*, dan hukuman *Turtle Badge* jika tak setor PR / *Overdue*).
  - **The Action Cards Feed**: Tumpukan masalah tekstual (Misal: *"Lantai toilet bau pesing"*).
- **Cara Kerja**: *Store Head* WAJIB mengisi RCA (*Root Cause Analysis*), Rencana Solusi, Nama Karyawan Penanggung Jawab (*PIC*), Tenggat Waktu, dan mengunggah Foto Bukti Kerja. Saat disubmit, kartu naik ke tingkat Cabang.
- **Output**: Teks komitmen perbaikan dan foto operasional nyata dari lantai toko.

### Sprint 6: Branch & HCBP Approval Portal (Filter & ValidasI)
- **Pengguna**: Branch Head (Layer 1) & HCBP Nasional (Layer 2 Veto).
- **Isi Halaman**:
  - **Tactical Statistics Cards**: Angka antrean, yang lambat, rasio "Turtle Badges".
  - **Tactical AI Briefing**: Rangkuman AI lapis pertama *"Taktikal Area Manager"* (Menyoroti masalah repetitif di cabangnya dan toko yang paling lemot).
  - **Rapid Approval Feed**: Fitur *Inbox* masuk per *Journey* (*Theme-Based Triage*), mode kiri-kanan (Masalah vs Solusi Toko), dan fitur *Bulk Pushback/Mass Reject* untuk mempercepat *Approval*.
- **Cara Kerja**: 
  - *Branch Head* menilai apakah janji solusi dari Toko masuk akal. Jika ya $\rightarrow$ Klik *Approve*. Jika tidak $\rightarrow$ *Reject* (kembali diformalkan ke Toko).
  - *HCBP* memegang panel makro **Submission Discipline Index** dan men- *VETO* persetujuan *Branch Head* jika terbukti melanggar SOP Korporasi EIGER.
- **Output**: Filter birokrasi yang cepat, membersihkan omong kosong *(bullshit RCA)* dari tingkat toko.

### Sprint 7: Regional Control Tower (Cross-Branch Intelligence)
- **Pengguna**: Regional Director.
- **Isi Halaman**:
  - Tidak ada tombol *Approve/Reject* harian.
  - **The Regional AI Intelligence**: Rangkuman AI lapis kedua (*Executive Advisor*). Membaca ringkasan dari 5 Cabang menjadi 1 narasi. AI mendeteksi *Cross-Branch Systemic Issues* (Masalah yang sama di 3 Cabang sekaligus), menjembreng *Best Practices*, dan mendorong Rekomendasi Alokasi Sumber Daya (*Policy Intervention*).
  - **Branch Health Roster**: Klasemen disiplin Cabang. Jika Direktur melihat ada Cabang dengan banyak "Penalti Turtle Badge", Direktur bisa menekan **Deep-Dive Mode** untuk masuk melihat *Inbox* tingkat Cabang secara *Read-Only*.
- **Cara Kerja**: Direktur Regional mengubah cara bermain dari Reaktif menjadi Preventif (Melihat pola "api" sebelum menjadi "kebakaran hutan").
- **Output**: Surat tegoran / *Coaching* strategis ke Branch Head tertentu, rotasi sumber daya silang-cabang.

### Sprint 8: National Executive Command Center (Puncak Pembuat Kebijakan)
- **Pengguna**: C-Level, Top Management.
- **Isi Halaman**:
  - Sangat minimalis. Tidak ada grafik "receh". Memakai pemilih waktu makro (`[Q1]`, `[YTD]`, `[ALL TIME]`).
  - **National Executive Briefing (AI Step 3)**: AI sebagai *Chief Strategy Advisor* mensintesis lumpur data dari 5 Regional menjadi 3 laporan krusial:
    1. 🚨 *Systemic National Risks* (Misal: Kasir 'freeze' di sekujur Indonesia = *Revenue Loss* = Audit vendor pusat).
    2. 🏢 *Corporate Policy Interventions* (SOP Seragam tidak layak = Ganti vendor kain fabrikasi).
  - **The Ultimate Drill-Down (God Mode)**: Klik Peta Nasional $\rightarrow$ Sumatera $\rightarrow$ Cabang Medan $\rightarrow$ Toko Deli Park $\rightarrow$ Tembus melihat foto toilet kotor yang diunggah staf dua hari lalu (100% *Read-Only*).
- **Cara Kerja**: Pemantauan murni eksekutif berbasis "Sistemik vs Taktikal" dan investasi *CAPEX/OPEX*. Laporan di-*generate* *cached* bulanan/kuartalan.
- **Output**: Perubahan aturan korporat (SOP Nasional) dan injeksi Capital Expenditure yang terjustifikasi oleh jeritan 345 toko EIGER.

---

### ARSITEKTUR BACKEND (Di Balik Layar)
Seluruh aliran megah di atas diorkestrasi oleh 2 struktur fundamental yang murah tapi mematikan:
1. **Supabase & RLS (Row Level Security)**: Data dikerangkeng di tingkat *database*. Toko A 100% tidak bisa membaca kartu Toko B. *Branch Head X* hanya bisa menarik data toko di naungannya. Aplikasi tidak akan bocor/tersendat (*Zero Data-Bleed*).
2. **The LLM Caching System & Dual-Engine AI Hierarchy (Flash & Pro)**: 
   Sistem ini mempekerjakan AI secara berlapis (Map-Reduce) dikombinasikan dengan sentuhan manusia (*Human in the Loop*):
   - **Tingkat Cabang (Gemini 1.5 Flash)**: Membaca teks mentahan RCA/Solusi/Bloker dari *Action Plan* seluruh toko di Cabang, lalu men- *translate*-nya menjadi ringkasan (Insights) Cabang. **Human Loop**: *Branch Head* wajib menulis "Additional Comments" mingguan merespons *Insight* ini. (HCBP juga bisa memberikan veto/feedback).
   - **Tingkat Regional (Gemini 1.5 Pro)**: Membaca *Branch Insights* (hasil Flash) **DIKALI** *Additional Comments* dari para *Branch Head* di bawahnya $\rightarrow$ Disintesis menjadi *Regional Executive Summary* yang apik. **Human Loop**: *Regional Director* wajib memberikan "Relevant Feedback" atas kesimpulan tersebut.
   - **Tingkat Nasional (Gemini 1.5 Pro)**: Membaca *Regional Insights* **DIKALI** *Feedback* dari *Regional Director* $\rightarrow$ Menjadi **Master Strategic Initiatives (Executive Deck)** untuk C-Level. **Tidak ada Human Loop**: C-Level tidak wajib memberi komentar, cukup mengonsumsi presentasi.
   - Rangkuman AI (*Map-Reduce*) digodok lewat fungsi CRON secara asinkron lalu disimpan ke dalam Supabase. Saat puluhan Eksekutif me-_refresh_ layar bersamaan, sistem hanya membaca _String Text Cache_ dari *database* (Nol latensi, Nol Biaya Ekstra API *real-time*).
