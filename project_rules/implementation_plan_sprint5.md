# Sprint 5: Action Plan Monitoring Portal

## Goal Description
Setelah *Store Head* menerima rapor dari Portal Analisis (Sprints 1-4), temuan-temuan negatif tersebut melahirkan **Improvement Focus**. Pada minggu pertama (*Week 1*), *Store Head* wajib menerjemahkan *Improvement Focus* ini menjadi sebuah rumusan **Action Plan**. Target dari *Action Plan* ini adalah memastikan perbaikan/implementasi telah diwujudkan secara nyata sebelum *Wave Mystery Shopper* periode berikutnya tiba (misal: di kuartal/tahun 2026 berikutnya).

Portal Eksekusi ini menggantikan tabel *Excel* tradisional dengan antarmuka bergaya *Mission Board* yang modern.

## Aturan Tampilan Berdasarkan RBAC
- **Store Head**: Hanya dapat melihat Kartu *Improvement Focus* untuk tokonya sendiri. Wajib mengisi formulir RCA (Root Cause Analysis), membuat *planning* solusi, menentukan PIC, dan melampirkan bukti selesai sebelum *Wave* selanjutnya.
- **Branch/Regional/Admin/Superadmin**: Memiliki tampilan *Overview* agregat (Berapa % Action Plan di wilayah mereka yang *Overdue*). Mampu men-*drill-down* ke tingkat toko untuk menyetujui (Approve) atau menolak (Reject) *Action Plan*.

---

## Layout Halaman: The Store Mission Board
Halaman tingkat Toko dirancang seperti antarmuka aplikasi manajemen tugas (misal: Trello/Asana) khusus untuk iPad/HP. Tata letak dibagi menjadi Header Global dan 2 Kolom Utama.

### 1. Global Header: The Week-Picker & All Time View
Karena pengisian *Action Plan* diwajibkan setiap minggu, navigasi utama menggunakan **Horizontal Week Selector**:
- **UI**: Serangkaian *chips* atau tombol melintang secara horizontal (Misal: `[W1 Feb '25]`, `[W2 Feb '25]`, `[W3 Feb '25 - ACTIVE]`, dan `[ALL TIME]`).
- **Fungsi Mingguan**: Store Head langsung tertuju pada minggu berjalan untuk membereskan PR (*Pekerjaan Rumah*) mereka. Jika mereka menekan minggu lalu yang belum tuntas, status minggu tersebut tertulis merah `(OVERDUE)`.
- **Constraint**: *Action Plan* yang turun dari sistem tidak bisa diedit silang-minggu. Evaluasi *Mystery Shopper* minggu 1 hanya bisa dijawab di *Action Plan* minggu 1.
- **All Time Implementation (Historical Archive)**: Jika tombol `[ALL TIME]` diklik, halaman berubah wujud menjadi "Buku Sejarah" toko. *Execution Zone* akan mengunci (*Lock*) secara visual (karena tidak ada aksi baru yang bisa di- *submit* di *All Time*), namun *Store Head* bisa menggunakan fitur pencarian (*Search Bar*) untuk melihat ribuan rekam jejak masalah dan tindakan korektif yang telah mereka selesaikan selama toko itu berdiri.

### 2. Kolom Kiri: "The Accountability Widget" (25% Layar)
Rapor kecil berisi *gamification* positif untuk memacu kedisiplinan eksekusi:
- **SLA Compliance Gauge**: *Speedometer* melingkar menunjukkan persentase *"On-Time Resolution"* (Berapa % tugas diselesaikan sebelum *deadline* di kuartal ini).
  - 🔴 Merah (<80%)
  - 🟡 Kuning (80-95%)
  - 🟢 Hijau (>95%)
- **Current Streak / Resolved Counter**: "Telah menyelesaikan 15 Temuan berturut-turut sesuai SLA."
- **Badges**: Jika performa stabil, tampilkan lambang 🥇 *Gold League*. Jika toko baru, tampilkan 🌟 *Rising Star*.
- **The "Motivational" Penalty (Late Submission Lock)**: Sistem memegang *Hard Deadline* nasional (Misal: Maksimal hari Selasa 23:59 setiap minggunya). Jika *Store Head* terlambat mengajukan form:
  - Antarmuka *Execution Zone* akan **terkunci otomatis (LOCKED)**.
  - Toko layar mendapatkan *"Motivational Card"* (sebuah animasi/kartu peringatan satiris yang ramah tapi menusuk, misal: 🐢 *Turtle Badge - "Oops, keretanya sudah lewat!"*).
  - Untuk *memulihkan (unlock)* form tersebut, Store Head terkena penalti *UX*: Mereka diwajibkan mengetik setidaknya 50 karakter di kolom wajib baru berbunyi **"Alasan Keterlambatan Pengisian Action Plan"** sebelum bisa melanjutkan mengisi RCA/Eksekusi normal. Alasan ini akan tercatat selamanya di sejarah audit toko tersebut.

### 3. Kolom Kanan: "The Improvement Focus Cards Feed" (75% Layar)
Masalah tidak disajikan dalam baris tabel, melainkan dipaparkan dalam **Improvement Focus Cards** (kartu temuan) yang dikirim dari portal analisis Sprints 1-4. 

**A. Context Header (Pembedahan Diagnosa Dasar)**
Desain UI kartu (Card) diformat seringkas mungkin tanpa belitan visual remah-remah, langsung *to the point* menyajikan wawasan analitis (*Insight*):

*Untuk Tipe Quantitative (Berdasarkan Hasil Survei 5 Wave Terakhir):*
- **Header Utama**: `[Nama Journey yang Bermasalah]` (Contoh: *B. Sambutan Hangat Ketika Masuk ke Dalam Outlet*).
- **List Item yang Bermasalah**: Rincian sub-pertanyaan yang gagal, yang otomatis direkap dan diklasifikasikan status dosanya dalam rentang **5 Wave terakhir**:
  - 🔴 **Recurring Failed**: *(Item: "Retail Assistant melakukan kontak mata")* - Gagal terus menerus.
  - 🟡 **Inconsistent**: *(Item: "Retail Assistant tersenyum 1 jari")* - Kadang dinilai baik, kadang buruk.
  - 🟠 **Just Failed This Wave**: *(Item: "Retail Assistant menghampiri pelanggan")* - Baru bocor di periode ini.

*Untuk Tipe Qualitative (Berdasarkan Analisa AI Gemini Flash):*
- **Header Utama**: `[Topik Keluhan AI Sentiment]` (Contoh: *Pelayanan Kasir Lambat*).
- **Bukti Otentik**: Menampilkan *highlight* kutipan murni (*Voc/Quotes*) dari pelanggan yang telah dikurasi oleh AI di latar belakang.

**C. The Execution Zone (Siklus Hidup Action Plan 12 Minggu)**
Formulir ini adalah "Nyawa" dari Action Plan. Karena penilaian fisik (*Wave*) hanya turun sekitar 3 bulan sekali, **ke-6 Kartu Action Plan ini akan menempel menetap di Dashboard Store Head selama ~12 Minggu penuh**.

*Skenario 1: Tahap Perencanaan Lanjut (Week 1 Action Planning)*
Pada minggu pertama dimulainya sebuah *Wave*, form berfokus pada penguraian masalah dan penentuan target awal:
1. **Root Cause Analysis (RCA)**: Dropdown 5M (Manpower, Machine, Method, Material, Others) + Kolom Penjelasan tentang mengapa temuan ini terjadi.
2. **Commitment Planning**: Rencana detail perbaikan.
3. **Assign PIC**: Dropdown karyawan toko yang bertanggung jawab membereskan temuan tersebut.
4. **Target Resolusi (Due Date)**: Tanggal merah dengan *Countdown Timer* ⏳ menuju *Wave Mystery Shopper* berikutnya.
5. **Upload Evidence (Media/Video)**: Tombol wajib unggah *Progress/Before-After* foto atau video langsung ke **Google Drive**.

*Skenario 2: Implementation & Follow-Up (Minggu 2 s/d Minggu 12)*
Pada minggu kedua dan seterusnya, form RCA **dikunci/disembunyikan** (Sistem mengasumsikan akar masalah sudah diketahui dan disetujui). Fokus mingguan merubah haluan untuk memaksa tingkat konsistensi toko:
1. **Implementation Update**: "Apa tindak lanjut dari komitmen RCA minggu lalu?" (Kolom Teks resubmit mingguan).
2. **Blocker/Kendala Eksekusi**: "Di minggu ini, hambatan apa yang membuat perbaikan tidak maksimal?" (Dropdown: Kurang Budget, Approval Regional Lama, Menunggu Vendor). Data *Blocker* di minggu-minggu berjalan inilah yang menjadi asupan paling krusial untuk dibaca oleh AI Gemini Pro di ranah Executive.
3. **Upload Evidence (Google Drive)**: Wajib memotret/menyertakan bukti foto kondisi *Journey* tersebut SECARA AKTUAL di minggu ini guna memastikan masalah tidak kumat.

*(Khusus Toko Baru / Rising Star)*
Toko *Rising Star* digenerate **5 Action Plan Default**. Karena belum ada data survei, sistem akan menarik 5 *Journey* dengan nilai rata-rata Nasional paling rendah. Teks instruksinya berbunyi: *"Journey ini adalah titik kelemahan terbanyak se-EIGER Nasional. Buat Action Plan standar ini untuk memastikan persiapan operasional Anda sempurna menyambut Wave perdana Anda."*

*Skenario 3: Revision Required (Conversational Action Thread)*
Jika solusi ditolak (REJECTED) oleh *Branch Head* atau *HCBP*, form eksekusi akan berubah antarmukanya menjadi **Tampilan Chat/Percakapan (Thread)**:
- **The Feedback Bubble**: Penolakan dari atasan tidak sekadar mengubah status kartu, melainkan muncul sebagai *"Chat Bubble"* di dalam kartu (Contoh: *"Foto bukti kurang terang, tolong foto ulang area plafonnya" - Budi, Branch Head*).
- **The Reply Box**: *Store Head* bisa membalas langsung di dalam *thread* tersebut layaknya membalas pesan WhatsApp, melampirkan foto baru, dan menekan *Re-Submit*. Ini menciptakan sejarah penyelesaian (*Resolution History*) yang kronologis dan transparan.

**D. Submit & Status Tabs**
Saat disubmit, kartu mengecil (pindah dari panggung utama) dan masuk ke sistem navigasi *tab*:
- 🔥 Requires Action (Tugas berjalan)
- ⏳ Waiting for Approval (Menunggu ACC Cabang/Regional)
- ✅ Resolved (Disetujui dan Selesai)
- 🔁 Rejected (Solusi ditolak atasan, wajib direvisi)
## Workflow Persetujuan (Branch Head & HCBP Level)
Untuk menghindari *micromanagement*, sistem *approval* (persetujuan) dibagi menjadi dua lapisan fungsional yang berbeda tujuannya:

### 1. Lapisan Operasional: The Branch Head "Approval Inbox"
*Branch Head* (Kepala Cabang) bertugas sebagai pemeriksa pertama (*First-Line Reviewer*). Desain UI untuk mereka difokuskan pada kecepatan (*rapid review*):
- **UI Konsep (The Inbox Feed)**: *Branch Head* tidak melihat tabel, melainkan daftar *Action Cards* yang bersiklus ("Swipe/Click to Approve").
- **Contextual Split-View**: Saat melihat 1 kartu pengajuan dari *Store*, sisi kiri layar menampilkan bukti pelanggaran awal (*AI Sentiment Quote* atau *Survey Photo*), sementara sisi kanan menampilkan solusi *Store Head* (RCA, Komitmen, Bukti Foto Eksekusi).
- **One-Click Rejection dengan Mandatory Feedback**: Jika solusi dianggap asal-asalan, *Branch Head* klik REJECT. Sistem akan memaksa mereka memilih alasan penolakan cepat (*Quick Replies*):
  - [RCA tidak relevan]
  - [Foto bukti perbaikan kurang jelas]
  - [Batas waktu terlalu lama]
  - [Lainnya: Ketik alasan...]
- Kartu yang di-reject otomatis kembali ke dasbor *Store Head* dengan status warna merah menyala 🔁 REVISION REQUIRED.

### 2. Lapisan Pengawasan Eksekutif: The HCBP "Final Approval Queue"
Setelah *Action Plan* disetujui (ACC) oleh *Branch Head* secara taktis di Lapisan 1, *Card* tersebut **tidak langsung berstatus `Resolved`**. Kartu akan melompat ke Lapisan 2, yakni antrean *Inboks* milik **HCBP Nasional/Regional** untuk persetujuan akhir.
- **Tujuan**: Memastikan standar solusi cabang sejalan dengan panduan *Company Policy* dan tidak ada aksi yang melanggar SOP.
- **UI Konsep (Macro Approval Dash)**: HCBP memiliki *dashboard* persetujuan yang dikelompokkan berdasarkan Cabang/Regional, memungkinkan *Bulk Review* (tinjauan massal) atau inspeksi satu per satu.
- **Hak Veto (The HCBP Reject)**: Jika HCBP merasa solusi yang sudah di-ACC Cabang ternyata keliru atau berisiko, HCBP dapat menekan tombol **VETO REJECT**. 
- **Efek Pantulan**: Kartu yang di-*Reject* oleh HCBP akan langsung diturunkan kembali ke *Store* (berstatus 🔁 `REVISION REQUIRED BY HCBP`) dengan tembusan notifikasi kepada *Branch Head* agar mereka juga belajar dari koreksi tersebut.
- **The Golden Stamp**: Hanya setelah HCBP menekan tombol **APPROVE** barulah *Action Card* tersebut berstatus ✅ `RESOLVED` secara permanen tertutup di database.
