# Sprint 2: Regional Level Analysis Portal

## Goal Description
Membangun halaman kedua "Regional Level Analysis" pada Eigerindo Service Signature (ESS) Analysis Portal. Halaman ini adalah senjata utama bagi *Head of Region* untuk memantau kesehatan cabang-cabang dan toko-toko yang berada murni di bawah wilayah kekuasaan mereka.

---

## Aturan Tampilan Berdasarkan RBAC (Role-Based Access Control)
- **Superadmin & Admin (Level Nasional)**: Akan melihat sebuah **Fancy Dropdown "Select Region"** di pojok atas layar. Mereka bisa bebas beralih antar Region 1 hingga 5, dan seluruh matriks halaman akan menyesuaikan seketika (*hot-reload*).
- **Regional Head (Tingkat Regional)**: Dropdown pilihan Region akan **terkunci (Disabled)** atau **tersembunyi (Hidden)**. Sistem otomatis mengikat antarmuka layar mereka eksklusif ke Region milik mereka sendiri (Misal: Hanya melihat data "REGION 3").

---

## Fitur Utama & Layout Halaman

### 1. The Regional Pulse (Status Kesehatan Region)
Empat *Cards* utama di bagian atas penyaji status sekilas:
- **Regional ESS Index**: Nilai Rata-rata Pelayanan semua permanen toko di Region tersebut untuk *Wave* yang aktif (eks. Toko Bazaar awalan ID `9`).
- **Gap to National Average**: Perbandingan / selisih nilai rata-rata Region ini terhadap Rata-rata Nasional (memiliki indikator warna hijau (+), merah (-), menandakan kompetisi psikologis).
- **The Winners Circle**: Persentase toko di Region ini yang masuk zona ekselen (Skor > 90).
- **Red Flag Stores**: Jumlah toko pendarahan (Skor < 80) di area Region ini.

### 2. Branch Contribution Matrix (Kontribusi Cabang)
Grafik batang komparatif (*Grouped Bar Chart* atau *Radar Chart*) yang sumbu datanya berisi seluruh Cabang (*Branch*) di bawah Region tersebut.
- *Visual Value*: Mengidentifikasi Cabang mana yang merusak / mendongkrak skor rata-rata Region secara drastis.

### 3. The Regional Journeys (Analisis Seluruh Journey)
Seluruh 11 Journey (A sampai K) akan ditampilkan dalam bentuk jejeran *Cards* berserta grafiknya secara lengkap sesuai dengan **Universal Color-Coding System**:
- 🟢 **Hijau (Green)**: Skor aman.
- 🟡 **Kuning (Yellow)**: Peringatan awal (Skor Regional berada di bawah rata-rata Nasional).
- 🔴 **Merah (Red)**: Kondisi kritis/pendarahan serius.
- **Interaktivitas Regional**: Saat sebuah Card diklik, Card akan memunculkan *Modal*/*Pop-up* komprehensif yang berisi:
  - **Grafik Tren Detail**: *Trendline* historis skala Regional (*Time Machine Dropdown/Wave*).
  - **Branch Breakdown**: Grafik perbandingan skor untuk *Journey* tersebut antar **CABANG** di Region itu (contoh: Jatim 1 vs Jatim 2).
  - **Granular Item Analysis**: Menampilkan persentase keberhasilan (*Yes*) dari tiap pertanyaan spesifik di dalam *Journey* tersebut untuk level Regional, sehingga Kepala Region tahu pasti SOP spesifik mana yang paling banyak dilanggar.

### 4. The Local Leaderboards (The Top 5)
Mengusung desain tab elegan serupa Executive (Tanpa "Bottom List" yang merusak moral). Menyajikan 2 papan peringkat mutlak, diukur dari yang Terbaik (Highest Index):
- 🏆 **Top 5 Branches in Region**: Daftar 5 Cabang operasional paling ekselen di Region ini.
- 🏆 **Top 5 Stores in Region**: Daftar 5 Toko pahlawan kualitas pelayanan murni di Region ini (Pengecualian mutlak toko Bazaar).

---

## Kebutuhan Database & API (Backend Logic)
Endpoint API (Node.js) `/api/regional-summary` disiapkan untuk mematuhi DDL *Row Level Security* Supabase:
1. **Kueri Data Otomatis Membaca Token JWT**: Jika token JWT yang masuk adalah *regional* wilayah 2, SQL di Backend hanya mengeksekusi hitungan `WHERE region = 'REGION 2'`.
2. **[GET] /api/regional/pulse**: Mengembalikan agregat rerata skor Region dan Gap dengan rerata Nasional.
3. **[GET] /api/regional/branch-contribution**: Mem-parsing rerata setiap *Branch* yang secara hierarki menempel pada Region yang di-*request*.

---

## Mode Pelaksanaan (Sprint 2)
Sprint ini akan dieksekusi setelah arsitektur pondasi utama Supabase dan integrasi logika dasar *Sprint 1* dikembangkan dan disahkan di ekosistem \`ess-backend\` dan \`ess-frontend\`.
