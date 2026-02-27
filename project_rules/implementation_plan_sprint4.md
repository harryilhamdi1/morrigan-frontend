# Sprint 4: Store Level Analysis Portal

## Goal Description
Membangun halaman pamungkas "Store Level Analysis" pada Eigerindo Service Signature (ESS) Analysis Portal. Halaman ini didesain khusus bagi para **Store Head** (Kepala Toko) sebagai rapor performa pribadi. Pada level *ground-zero* ini, data tidak lagi diagregasi, melainkan dibedah hingga ke akar kualitatif (teks komentar) dan kuantitatif (Yes/No) per pertanyaan survei.

---

## Standarisasi Visualisasi Data (All Tiers)
Sesuai persetujuan desain, *Dashboard* di semua level (Executive, Regional, Branch, Store) akan mengadopsi standarisasi komponen grafik yang berfokus pada estetika *Modern & Premium*:
- **Smooth Spline Charts**: Grafik garis lengkung sempurna (bukan patah/sudut tajam).
- **Subtle Area Gradients**: *Fill* semi-transparan di bawah garis grafik.
- **Hollow Data Markers**: Titik data berbentuk lingkaran kosong (putih dengan *border* warna grafik) untuk mempertegas nilai per periode/Wave.
- **Clean Axes & Typograhy**: Sumbu tanpa garis *grid* vertikal yang terlalu padat, font yang jelas dan elegan.

---

## Aturan Tampilan Berdasarkan RBAC (Role-Based Access Control)
- **Top & Mid Management (Superadmin, Admin, Regional, Branch)**: 
  - Saat masuk ke halaman khusus Toko (Store Level Analysis), Manajemen Atas **tidak** langsung melihat dashboard grafik, melainkan disajikan sebuah **Advanced Store Directory (Tabel Induk)**.
  - Tabel ini memungkinkan pimpinan untuk melakukan pencarian instan (*Advanced Search* mumpuni berdasarkan Nama Toko atau Kode).
  - Menampilkan kelengkapan identitas toko: Nama, Kode, Region, Branch, dan **Klasifikasi ESS League** (Liga performa toko).
- **Store Head (Tingkat Toko)**: 
  - Langsung di-redirect dan Terkunci mutlak (*Disabled*) ke dalam halaman *Dashboard Detail Toko* miliknya sendiri. *Store Head* hanya diizinkan melihat data kualitatif/kuantitatif dan menorehkan *Action Plan* pada Toko mereka sendiri.

---

## Fitur Pra-Dashboard Khusus Admin: The Store Directory & ESS Leagues
Sebelum menyelami grafik 1 toko spesifik, Admin dapat meramban seluruh daftar ritel Eiger. Fitur kunci dari tabel ini meliputi:

### 1. Klasifikasi ESS League (Gamifikasi Performa)
Mengacu pada data CSV Liga ESS, tabel ini secara visual mengelompokkan setiap toko ke dalam 4 kasta/prestise:
- 🥇 **Gold League**: Klub elit pertokoan Eiger yang skornya konsisten tinggi (Kriteria sesuai *National Facility List*).
- 🥈 **Silver League**: Ritel dengan kinerja standar menengah-atas.
- 🥉 **Bronze League**: Toko di level dasar/bawah yang butuh intervensi agresif.
- 🌟 **Rising Star**: Status *default* untuk **Toko Baru**. Label ini disematkan pada toko yang eksis di data ritel *MPP Tracking National Facility List*, namun belum pernah memiliki rekam jejak penilaian (skor histori kosong) di *Wave* ESS mana pun. Toko ini akan menerima **5 Action Plan Default** berdasarkan 5 *Journey* terburuk secara Nasional sebagai latihan kepatuhan.

### 2. Smart Filtering & Exclusions
- **Closed Store Exclusion**: Saat sistem menarik data untuk tabel ini atau grafik agregasi, toko yang memiliki keterangan 'Closed' (Tutup Permanen) pada metrik *Wave Scoring* otomatis dihilangkan (*excluded*). Tujuannya agar toko yang "mati" tidak merusak perhitungan *Baseline* maupun *Leaderboard* di masa depan.

---

## Fitur Utama & Layout Halaman

### 1. The Store Pulse (Top Level - Macro Insights)
Tingkat teratas difokuskan pada pergerakan makro dan komparasi posisi toko terhadap seluruh rantai Eiger:
- **Global Wave Dropdown**: Filter utama untuk memilih rentang *Wave* yang sedang dianalisis.
- **Wave-over-Wave Movement Graph**: Grafik utama menggunakan *Smooth Spline Chart* yang memetakan Skor Toko melintasi waktu. Dilengkapi dengan **Dotted Lines (Garis Putus-Putus)** sebagai representasi *Average National*, *Average Regional*, dan *Average Branch*. Dotted lines ini interaktif dan bisa disetting visualisasinya via dropdown.
- **Journey Spider Chart**: Grafik jaring laba-laba (*Radar Chart*) yang memetakan skor toko secara utuh di ke-11 Journey (A s/d K) dengan *Legend* yang jelas. Ini memberikan siluet kekuatan dan kelemahan toko secara kilat.
- **Future-Proof Improvement Focus Trigger**: Jika ada ulasan kualitatif negatif di toko ini, *Mandatory Improvement Focus Alert* (Banner Merah) HANYA akan muncul jika *Global Wave Dropdown* yang aktif adalah periode/Wave terbaru (misal: "Wave 2 2025"). Untuk *Wave-Wave* historis ke belakang, alert ini dimatikan otomatis. Banner berbunyi: *"⚠️ [URGENT] Anda memiliki 1 Ulasan Pelanggan Negatif. Harap buat Action Plan dari Improvement Focus Anda sebelum Batas Waktu."*

### 2. The Color-Coded Journey Cards (Mid Level - Segmented Insights)
Berisi 11 *Card* yang mewakili masing-masing Journey (A sampai K). Konsep visual standar ini diterapkan berulang dari Nasional hingga Toko:
- Setiap *card* menampilkan nilai dan grafik (*sparkline*) dari *journey* bersangkutan.
- **Strict Color Coding**:
  - 🟢 **Hijau (Green)**: Skor baik dan dominan.
  - 🟡 **Kuning (Yellow)**: Peringatan (Skor *Journey* tersebut berada di bawah Rata-Rata Nasional).
  - 🔴 **Merah (Red)**: Kondisi kritis/pendarahan (gagal total).

### 3. Business Rules: Pemicu Action Plan Dinamis (Reward & Punishment)
Jumlah kartu *Action Plan* yang dijejalkan ke *Store Head* bersifat dinamis sesuai performa mereka:
1. **Aturan Kuantitatif (No Cap Punishment)**: Tidak dibatasi maksimal 5. Seluruh *Journeys* yang skornya anjlok di bawah Target Nasional ( < 90 ) wajib dijawab dengan *Action Plan*. Toko yang kelewatan hancur di seluruh 11 pilar akan menerima "Hukuman" 11 *Action Plan* kuantitatif. Sebaliknya, toko teladan yang lolos target hanya mengeksekusi sedikt AP. *Journey* dengan nilai mutlak 100 tidak akan diturunkan menjadi AP.
2. **Aturan Kualitatif (Single Voice)**: Jika ada komplain di Voice of Customer, sistem hanya mengutip **1 Action Plan Sentimen Terbesar** dari file algoritma analisis `Master_Qualitative_AI_Categorized.csv`. Jika *customer feedback* terdeteksi netral/positif semua, Action Plan tahap ini **Ditiadakan** (0).

### 4. The Detailed Modal (Bottom Level - Actionable Items)
Menggali lebih dalam (Drill-down) ke akar masalah. Saat *Journey Card* (Misal: Fasilitas) diklik, sebuah **Modal Komprehensif** akan muncul, yang terbagi dalam dua tipe **Improvement Focus** yang sangat jelas:

**Tipe: Quantitative (Berdasarkan Skor Journey)**
Format kartu survei sengaja dibuat sangat *to-the-point* untuk memudahkan pemahaman *Store Head*:
- **Header Tunggal**: `[Nama Journey yang Bermasalah]` (Contoh: *C. Suasana & Kenyamanan Outlet*).
- **Daftar Item Bermasalah**: Di bawah *header*, sistem mendaftar butir-butir pertanyaan survei (item) di dalam *Journey* tersebut yang menyumbang nilai merah. Item ini langsung secara cerdas disortir/dikelompokkan berdasarkan sejarah kegagalannya **dalam 5 Wave (evaluasi) terakhir**:
  - 🔴 **Recurring Failed**: Item yang konstan gagal di rentetan *Wave* sebelumnya (Masalah Mengakar).
  - � **Inconsistent**: Item yang kadang lolos (Skor 1), kadang gagal (Skor 0) tak menentu di 5 *Wave* terakhir (SOP Labil).
  - � **Just Failed This Wave**: Item yang biasanya selalu hijau, tapi mendadak gagal khusus di gelombang penilaian kali ini (Masalah Baru).

**Tipe: Qualitative (Berdasarkan Sentimen Berbasis AI)**
- **Header**: `[Kategori Kualitatif]` (Contoh: Facility, Cleanliness, Service)
- **Bukti Teks (Qualitative Evidence)**: Teks keluhan spesifik dari *Voice of Customer* yang telah disaring oleh AI akan disematkan membentang di dalam modal ini. Jika keluhan pelanggan berkaitan dengan item *Quantitative* yang gagal, teks keluhan akan ditempelkan tepat di bawah item survei tersebut sebagai konteks nyata.

---

## Kebutuhan Database & API (Backend Logic)
Endpoint `/api/store-detail` memiliki kueri spesifik berparameter tunggal (`siteId`):
1. **[GET] /api/store/summary**: Menarik rapor lengkap 1 entitas beserta ranking cabangnya.
2. **[GET] /api/store/granular**: Menganalisa riwayat data JSONB (`granular_failed_items`) untuk melahirkan tag historis (Recurring/New Incident) dan menyatukannya dengan teks komentar JSONB (`qualitative_feedback`).
