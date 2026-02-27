# TECHNICAL CODING MASTER PLAN (MINI SPRINTS)
**Project: Morrigan Report V2**

Dokumen ini adalah *"Roadmap"* teknikal eksklusif untuk panduan urutan penulisan kode (*coding*) *Full-Stack* dari kerangka konseptual yang sudah kita setujui di `project_rules`. Kode akan digarap secara bertahap agar tidak terjadi *"God File"* dan bebas *bug*.

---

## 🏗️ PHASE 1: DATABASE & BACKEND INIT (Supabase)
Fase ini berfokus pada pembangunan struktur *Relational Database*, proteksi *Row Level Security* (RBAC), dan *mock data*.

1. **[ ] Database Schema (SQL)**: 
   - Tabel `stores` (id, branch_id, region_id, league_status).
   - Tabel `branches` & `regions` (hierarchy).
   - Tabel `users` (id, role, store_id/branch_id/region_id).
   - Tabel `wave_evaluations` (scores untuk Journey A-K, score keseluruhan).
   - Tabel `action_plans` (store_id, wave_id, journey_name, status, rca, pic, due_date, evidence_url, blocker_text, ai_sentiment_quote).
2. **[ ] RBAC & RLS (Row Level Security)**:
   - Membuat kebijakan SQL: `Store Head` cuma bisa akses baris (row) miliknya. `Branch` bisa baca baris miliknya dan cabang di bawahnya.
3. **[ ] Data Seeding (CSV Migration)**:
   - Membuat *script* Node.js/Python kecil untuk memasukkan `Master Site Morrigan.csv`, `Scorecard.csv`, dan `Master_Qualitative_AI_Categorized.csv` ke tabel Supabase.

---

## 💻 PHASE 2: FRONTEND SCAFFOLDING (React/Next.js/Vite)
Pembangunan fondasi antarmuka dan *Theming* berstandar premium.

1. **[ ] Boilerplate Setup**: Inisialisasi Vite + React + TypeScript.
2. **[ ] Tailwind CSS & UI Libraries**: Instalasi Tailwind, konfigurasi warna (*color tokens*), *Glassmorphism utilities*, dan integrasi komponen *headless* (Radix UI / Shadcn UI) untuk estetika *modern*.
3. **[ ] Global Layout & Navigation**: 
   - `Sidebar` cerdas yang dinamis pembagian menunya berdasarkan peran (*RBAC*).
   - `Header` (*Breadcrumbs*, *User Profile*, *Global Wave Picker*).
4. **[ ] Authentication Flow**: Halaman *Login* dengan *Supabase Auth*.

---

## 🛡️ PHASE 3: THE ACTION PLAN PORTAL (Store Level - Sprint 4 & 5)
Jantung dari operasional toko. Membangun layar eksekusi *Store Head*.

1. **[ ] Data Fetching & Algorithm Execution**: 
   - Hook untuk menarik data *Wave* Toko.
   - Fungsi algoritma *Reward & Punishment* (No Cap Punishment untuk < 90, 5 default AP untuk Rising Star, 1 Limit AP untuk AI Qualitative).
2. **[ ] Store Mission Board UI**:
   - Komponen **Week-Selector** (Tab Minggu 1 s.d Minggu 12).
   - Komponen **Accountability Widget** (SLA *Gauge*, The Turtle Badge Penalty).
3. **[ ] The Action Cards**:
   - Mendandani *Card* minimalis: Header *Journey* + Riwayat 5 *Wave* (*Recurring, Inconsistent, Just Failed*).
4. **[ ] Execution Form (Week 1 vs Week 2-12)**:
   - Logika form pintar: Menampilkan RCA+Solusi di Minggu 1 (bisa diedit), dan mengubahnya jadi *read-only* di Minggu 2 yang mewajibkan foto BUKTI + Dropdown *Blocker*.
5. **[ ] Google Drive Upload Integration**: Komponen unggah foto bukti langsung ke *G-Drive*.

---

## 🏛️ PHASE 4: THE MANAGERIAL PORTAL (Branch & Region - Sprint 6 & 7)
Membangun dasbor untuk Pimpinan lapis menengah.

1. **[ ] The Approval UI (Branch Head)**: 
   - Tampilan *Card Swipe/Inbox* untuk menyortir (Approve/Reject) formulir toko.
   - Integrasi **Conversational Chat Bubble** (Store Head vs Branch Head).
   - Fitur **Veto HCBP Nasional**.
2. **[ ] Mid-Level AI Insights Viewer**:
   - Layar khusus menampilkan rangkuman Gemini Flash (*Branch Insights*).
   - Form untuk *Branch Head / Regional Director* mengetik *Strategic Comment* / *Feedback*.

---

## 🚀 PHASE 5: THE EXECUTIVE DECK (C-Level - Sprint 1, 2, 8)
Visualisasi makro berstandar perusahaan multinasional.

1. **[ ] Global Analytics Dashboard**:
   - Komponen *Smooth Spline Charts* dan *Spider Charts* menggunakan perpustakaan grafik modern (Recharts/Chart.js).
   - Visualisasi Rata-Rata Nasional vs Cabang vs Region.
2. **[ ] ESS League Leaderboard**: Visual *Gold, Silver, Bronze* dan daftar toko terbaik/terburuk.
3. **[ ] National AI Strategic Summary**: Layar tunggal untuk CEO mereviu rekomendasi *Company Policy Change*.

---

## 🧠 PHASE 6: THE AI AUTOMATION ENGINES (Backend CRON)
Pembuatan "Otak" *Map-Reduce* berjenjang (Jadwal Kamis - Minggu).

1. **[ ] AI Level 1 (Store to Branch)**: Skrip Python/Node.js integrasi Gemini 1.5 Flash B8 untuk menelan RCA+Blocker milik toko dan mengeluarkan kesimpulan tingkat Cabang.
2. **[ ] AI Level 2 (Branch to Region)**: Skrip Gemini 1.5 Pro meracik rangkuman Cabang + Komentar Pimpinan.
3. **[ ] AI Level 3 (Region to National)**: Skrip final Gemini 1.5 Pro mengolah Dek C-Level.
4. **[ ] Deployment & Scheduling**: Pemasangan skrip ini ke dalam penjadwalan otomatis (*CRON Job* mingguan).
