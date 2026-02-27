# Sprint 6: Branch & Executive Action Plan Portal (Approval & AI Hub)

## Goal Description
Setelah mengembangkan pilar eksekusi tingkat terbawah (Toko) di Sprint 5, Sprint 6 berfokus pada **Pilar Manajemen menengah-atas (Branch Head & HCBP)**. Objektif utamanya adalah membangun *Approval Workflow* dua lapis yang efisien dan mengintegrasikan **AI Map-Reduce Summarization Engine** agar pimpinan tidak tenggelam dalam lautan formulir *Action Plan* mentah.

---

## 1. Arsitektur Halaman Cabang (The Branch Head Portal)
Berbeda dengan *Store Head* yang fokus pada *input* detail, layar *Branch Head* didesain untuk **analisis strategis dan kecepatan persetujuan (Speed & Insight)**. 

### A. Global Header: The Week-Picker & All Time View
Persis seperti level Toko, *Branch Head* memutar kendali operasional menggunakan *Global Week-Picker* (Misal: `[W1 Feb '25]`) yang dilengkapi dengan opsi **[ALL TIME]**. 
- **Time-Locked AI & Feed**: Mengganti minggu di *widget* ini otomatis akan me-*refresh* laporan intelijen AI dan antrean persetujuan (Approval Feed) menjadi spesifik untuk minggu tersebut.
- **All Time Implementation (Managerial Ledger)**: Saat *Branch Head* memilih `[ALL TIME]`:
  - **Approval Feed** berubah menjadi *Read-Only Ledger*. Pimpinan bisa melacak kapan tepatnya sebuah kartu disetujui 6 bulan lalu dan siapa yang *Approve*.
  - **Tactical Stats Cards** melebur angka mingguannya menjadi *Lifetime Compliance Rate* (Persentase kedisiplinan total sepanjang tahun).
  - **AI Briefing Adaptation**: AI tidak akan membaca puluhan ribu masalah secara *real-time*. Sistem akan otomatis mengambil baris *database* dari tabel `ai_quarterly_summaries` (Dihasilkan rutin setiap tutup kuartal) yang menyajikan narasi makro: *"Masalah Paling Mengakar Sepanjang Tahun"*.

- **AI Trigger Logic (Gemini 1.5 Flash)**: 
  - *Map-Reduce Step 1*: Model **Gemini Flash** digunakan di tingkat Cabang. Tugas AI di sini adalah murni mentranslasikan teks *input Action Plan* (RCA dan Solusi) yang diketik oleh puluhan *Store Head* di semua toko di bawah Cabang tersebut, menjadi rancangan *Insights* Cabang.
  - **Automated (CRON Job)**: AI dijadwalkan merangkum Action Plan ratusan toko secara otomatis satu minggu sekali ke dalam Supabase (`ai_branch_summaries`).
  - **The Branch Head "Weekly Comments" loop**: Setelah AI (Flash) memproduksi *Insights* dari seluruh toko, dan *Branch Head* membaca rincian *Feedback/Veto* dari HCBP (bila ada potensi pelanggaran SOP), maka *Branch Head* **diwajibkan untuk memberikan Additional Comments (Komentar Tambahan)** setiap minggunya atas ringkasan aksi tokonya tersebut. Komentar ini kelak akan menjadi *"makanan"* AI bagi tingkat Regional.
- **Batasan Akses**: Pimpinan Cabang hanya mengonsumsi data *AI Insights* dari database statis mingguan, menjaga performa tetap ringan mutlak.
- **AI Persona**: *"Taktikal Area Manager"*.
- **Data Sumber (RAG) untuk AI Flash**: Teks murni hasil ketikan para *Store Head* dari formulir Action Plan (Root Cause, Blocker, Solusi) di cabang tersebut.
- **Output Visual**: *Widget* naratif interaktif yang terbagi dalam tiga *tab* kecil:
  1. ⚡ **Top 3 Operational Bottlenecks**: (Contoh: "70% toko Anda di Region DKI lambat merespons perbaikan AC karena menunggu vendor pusat").
  2. 🏆 **Praise & Progress**: Keberhasilan signifikan dari minggu kemarin.
  3. 🎯 **The Hotspot Radar (Top Offenders)**: *Widget* cepat yang menyoroti 3 Toko di cabangnya yang paling banyak menumpuk *Action Plan* secara historis tetapi paling lama *resolve*-nya. Ini membantu *Branch Head* tahu toko mana yang butuh dikunjungi secara fisik (*Store Visit/Gemba*).

### B. The Rapid Approval Feed (Bottom Section)
Setelah membaca *Tactical AI Briefing*, *Branch Head* turun ke bawah untuk menyortir *Action Cards* yang berstatus `WAITING FOR APPROVAL`. Sistem ini menolak gaya "Tabel Excel centang-semua" dan menerapkan sistem mirip *Inbox Review*:
- **Theme-Based Triage (Filter by Journey)**: Daripada mencampur aduk masalah, *Branch Head* bisa mengklik *filter* *"Tampilkan khusus masalah Facility"*. Mode otak mereka akan fokus hanya mengevaluasi tentang AC rusak, plafon bocor, dsb. sebelum pindah ke *mood* evaluasi *Service*.
- **Split-View Mode**: 
  - *Panel Kiri*: Menampilkan "Dosa Asli" (Bukti sentimen pelanggan atau foto *mystery shopper*).
  - *Panel Kanan*: Menampilkan "Pengakuan/Janji" Toko (RCA yang mereka buat, solusi, PIC, *Due Date*, dan foto Google Drive bahwa lantai sudah dipel).
- **Aksi Presisi & The Chat Thread**:
  - Tombol 🟢 **APPROVE**: Kartu meluncur ke atas menuju meja HCBP.
  - Tombol 🔴 **REJECT (Conversational Mode)**: Sekali klik wajib membuka *Quick Replies dropdown* (Contoh: "Foto bukti tidak jelas", "Target selesai terlalu lama", dsb) atau mengetik balasan manual. Pesan *Reject* ini akan langsung membentuk **Chat Bubble** di dalam *Action Card*. Kartu mental kembali ke *Store Head* dengan status revisi. Jika *Store Head* membalas, pesan mereka akan muncul memanjang seperti *thread* percakapan (*WhatsApp style*), sehingga *Branch Head* bisa membaca rekam jejak diskusi ("Tolak -> Revisi -> Tolak -> Revisi").
  - **Bulk Pushback (Mass Reject)**: Jika ada 5 toko mengajukan solusi *"Beli sapu baru"* padahal Cabang baru mengirim sapu, *Branch Head* bisa me-*select* 5 kartu dan menekan *Mass Reject* dengan satu *Quick Reply* serentak: *"Gunakan pasokan sapu dari Cabang hari ini"*. Balasan serentak ini otomatis menetas sebagai pesan *Chat Bubble* di kelima toko tersebut.

---

## 2. Arsitektur Halaman Pengawasan (The HCBP Executive Portal)
Di sisi HCBP Nasional, UI berfokus pada Makro & Intervensi Kritis (*Helicopter View* implementasi *Map-Reduce Step 3*).

### A. The National AI Executive Summary
- **AI Persona**: *"Executive Advisor"*.
- Laporan dari ke-5 Region disintesis menjadi 1 halaman strategis yang menghubungkan benang merah dari ribuan evaluasi cabang menjadi **Business Impact** dan rekomendasi kebijakan untuk C-Level EIGER.
- Tersemat tabel khusus **"Red Flag Audit Required"** agar eskalasi tingkat bawah tidak terdistorsi (*smooth out*) saat sampai ke atas.

### B. The Veto & Compliance Queue
- **Macro Compliance Dash (Submission Discipline Index)**: HCBP memiliki *dashboard* rekapitulasi kepatuhan operasional untuk mengukur disiplin cabang. Dashboard ini memvisualisasikan data tentang *Branch* mana yang berkinerja paling lincah (*agile*), dan *Branch* mana yang mengoleksi *Turtle Badges (Motivational Cards)* sehingga perlu diberikan pembinaan *coaching* akibat sering lambat mengajukan *Action Plan*.
- Tidak ada puluhan ribu antrean kartu untuk HCBP. Mereka hanya melihat kartu yang sudah di-ACC Cabang (menunggu cap sah *Final Approve*).
- **Hak Veto (The HCBP Reject & Chat Thread)**: Jika HCBP merasa solusi yang sudah di-ACC Cabang ternyata keliru, HCBP dapat menekan tombol **VETO REJECT**. 
  - Penolakan tertinggi ini akan menetas sebagai *Chat Bubble* berwarna mencolok (Misal: 🟣 Merah Tua/Ungu) di dalam *Action Card*.
  - Pesan peringatan HCBP ini dapat dibaca langsung oleh *Store Head* dan *Branch Head* secara transparan melalui *Conversation Thread* tersebut.
  - Kartu langsung turun kembali ke *Store* (berstatus 🔁 `REVISION REQUIRED BY HCBP`) tanpa perlu membuat kartu baru. Merangkai diskusi vertikal: "Toko -> Cabang (ACC) -> HCBP (Tolak/Revisi) -> Toko".
