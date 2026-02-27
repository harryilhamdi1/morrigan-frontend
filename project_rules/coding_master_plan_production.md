# TECHNICAL CODING MASTER PLAN (PRODUCTION & DEPLOYMENT)
**Project: Morrigan Report V2**

Dokumen ini adalah *"Roadmap"* kelanjutan (Sekuel) dari *Coding Master Plan MVP* sebelumnya. Setelah fondasi UI, simulasi Mock API, dan mesin AI (Phase 1-6) berdiri utuh, fase ini bertugas **mengubah MVP menjadi aplikasi Production-Ready** yang hidup dengan pergerakan data *real-time* ke Supabase dan *Live Deployment*.

---

## 🔌 PHASE 7: DATABASE WIRING & REAL-TIME INTEGRATION
Membongkar *Mock API* dan menyambungkan *Frontend Components* langsung ke *PostgreSQL* Supabase.

1. **[ ] Supabase Client Setup**:
   - Membangun `src/lib/supabase/client.ts` dan `server.ts` untuk manajemen *session* standar Next.js App Router.
2. **[ ] Auth Hook-Up (Login & RBAC)**:
   - Menghubungkan halaman Login (`/login`) ke Supabase Auth.
   - Membuat `middleware.ts` untuk menendang pengguna yang belum login, serta memblokir *Store Head* agar tidak bisa meretas masuk ke URL `/dashboard/region`.
3. **[ ] Wiring Phase 3 (Store Portal)**:
   - Memodifikasi `/api/store/summary` dan `/api/store/granular` untuk menjalankan kueri SQL nyata (menghitung rata-rata *Journey Score* dari tabel `wave_evaluations`).
   - Fitur **Insert Action Plan**: Menyambungkan *Action Plan Modal* (Minggu 1) agar berhasil melakukan `INSERT` baris baru ke tabel `action_plans`.
4. **[ ] Wiring Phase 4 (Managerial Portal)**:
   - Memodifikasi `/api/managerial/approval-queue` untuk menarik data *Action Plan* yang bersumber dari ID Cabang otentik sang *Branch Head*.
   - Fitur **Approval System**: Menyambungkan tombol "Approve" dan "Reject" untuk mengubah status kolom `status` di Supabase.

---

## 🧪 PHASE 8: END-TO-END (E2E) TESTING & UAT
Melakukan "Stres Test" komprehensif pada *User Journey* dari mata rantai paling bawah hingga ke puncak.

1. **[ ] Scenario 1: The Turtle Penalty Test**:
   - *Login* sebagai anak Toko.
   - Sengaja menahan *submit Action Plan* hingga 14 hari.
   - Memverifikasi apakah *Accountability Widget* mendeteksi keterlambatan dan secara reaktif menghidupkan paksaan 50-karakter di form mitigasi.
2. **[ ] Scenario 2: The Conversational Reject Thread**:
   - *Login* sebagai Branch Head.
   - Mengetik *Quick Replies* penolakan yang pedas di Inbox Approval.
   - *Login* kembali sebagai Toko untuk memastikan efek *Chat Bubble* merah dari atasan muncul di layar mereka.
3. **[ ] Scenario 3: CRON Map-Reduce Execution**:
   - Menjalankan Skrip AI Level 1, 2, 3 secara berurutan.
   - Membuka Executive Deck untuk melihat apakah chart *Compliance Radar* berganti bentuk sesuai data mentah yang baru disuntikkan.

---

## 🚀 PHASE 9: LIVE DEPLOYMENT & PRODUCTION CONFIG
Mengangkasa ke environment *Live* yang sesungguhnya.

1. **[ ] Environment Variables Config**:
   - Setup rahasia *Production Variables* (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) di platform *hosting*.
2. **[ ] Vercel Deployment**:
   - Menghubungkan *Repository GitHub* ini ke infrastruktur *Vercel*.
   - Konfigurasi *Build Settings* (`npm run build`).
3. **[ ] Vercel Cron Jobs Setup**:
   - Menambahkan file `vercel.json` untuk menjadwalkan 3 Skrip AI (Level 1, 2, 3) agar menyala otomatis setiap hari Minggu malam pukul 23:00 WIB, mensintesis data satu negara saat Eksekutif tertidur lelap.
4. **[ ] Domain Handoff**:
   - Menautkan *Custom Domain* (misal: `morrigan.eiger.com`) dan rilis ke jajaran direksi.
