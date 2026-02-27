# Sprint 3: Branch Level Analysis Portal

## Goal Description
Membangun halaman ketiga "Branch Level Analysis" pada Eigerindo Service Signature (ESS) Analysis Portal. Halaman ini didesain khusus bagi para **Head of Branch** (Kepala Cabang) sebagai "Panglima Lapangan" yang bersentuhan langsung dengan operasi dan nasib toko-toko (Store Heads) di bawah kendalinya.

---

## Aturan Tampilan Berdasarkan RBAC (Role-Based Access Control)
- **Admin & Regional Head (Level Atas)**: Akan melihat **Fancy Dropdown "Select Branch"**. (Regional Head hanya akan melihat pilihan Branch yang ada di wilayahnya). Saat dipilih, metrik langsung beradaptasi (*hot-reload*).
- **Head of Branch (Tingkat Cabang)**: Dropdown pilihan Branch akan **terkunci (Disabled)**. Sistem otomatis mengikat antarmuka layar secara eksklusif ke Cabang miliknya (Misal: Hanya melihat data "DKI 1").

---

## Fitur Utama & Layout Halaman

### 1. The Branch Pulse (Status Kesehatan Cabang)
- **Branch ESS Index**: Rata-rata nilai pelayanan khusus toko-toko di Cabang ini.
- **Gap to Regional Average**: Menunjukkan deviasi skor Cabang ini dibandingkan dengan rata-rata Region induknya (Seberapa jauh Cabang ini tertinggal atau memimpin di area Regional-nya).
- **The Winners Circle**: Persentase toko di Cabang ini dengan skor > 90.
- **Red Flag Stores**: Jumlah toko dengan skor < 80. Ini peringatan keras langsung bagi Head of Branch.

### 2. Store Contribution & Movement (Pergerakan Toko)
Karena skala cabang memanajemen entitas toko secara langsung, visualisasi di sini lebih ke arah *Scatter Plot* atau *Bar Chart* yang memetakan performa tiap toko:
- Sumbu data adalah **Store (Toko-toko di Branch tersebut)**.
- *Visual Value*: Sangat tajam untuk melihat dari 15 toko di sebuah cabang, 3 toko mana yang paling parah dan menarik nilai rata-rata cabang ke bawah.

### 3. The Branch Journeys (Analisis Seluruh Journey)
Seluruh 11 Journey (A sampai K) ditampilkan dalam bentuk jejeran *Cards* beserta grafiknya, mematuhi **Universal Color-Coding System**:
- 🟢 **Hijau (Green)**: Skor aman.
- 🟡 **Kuning (Yellow)**: Peringatan awal (Skor Cabang berada di bawah rata-rata Nasional).
- 🔴 **Merah (Red)**: Kondisi kritis.
- **Drill-Down Matrix Level Toko**: Saat sebuah *Journey* diklik, modal/pop-up komprehensif akan muncul berisi:
  - **Grafik Tren Detail**: *Trendline* historis spesifik untuk Cabang tersebut (*Time Machine Dropdown/Wave*).
  - **Store Breakdown**: Grafik perbandingan skor *Journey* antar **TOKO (Store)** di bawah cabang tersebut. *(Contoh: Nilai Fitting Room Toko A vs Toko B vs Toko C di DKI 1)*.
  - **Granular Item Analysis**: Menampilkan persentase kesuksesan (*Yes*) pada setiap butir pertanyaan spesifik di dalam *Journey* tersebut. Membekali Kepala Cabang dengan bukti konkrit saat melakukan evaluasi ke Kepala Toko (contoh: *"Berdasarkan data, 60% pelanggan di cabang kita lupa ditanya soal member EIGER Adventure Club"*).

### 4. The Actionable Outliers (Toko Terbaik & Yang Perlu Dibina)
Tingkat cabang adalah *ground-zero* untuk eksekusi, sehingga data terendah **WAJIB** ditampilkan agar bisa dilakukan tindakan (*Action Plan* / *Coaching*):
- 🏆 **Top 5 Stores in Branch**: Toko-toko teladan di cabang ini.
- 🚨 **Bottom 5 Stores in Branch**: Lima toko dengan rapor merah terbanyak di cabang ini yang *wajib* disidak atau diinstruksikan membuat *Action Plan* minggu ini. (Tidak mengecualikan toko Bazaar jika Bazaar masuk dalam scope Branch, namun secara *default* disarankan tetap mengecualikan awalan '9' jika Bazaar dikelola terpisah).

---

## Kebutuhan Database & API (Backend Logic)
Endpoint API (Node.js) `/api/branch-summary` disiapkan patuh RLS Supabase:
1. **Kueri Data Berbasis JWT**: Eksekusi hitungan `WHERE branch = 'DKI 1'`.
2. **[GET] /api/branch/pulse**: Mengembalikan agregat rerata skor Branch dan selisih (gap) dengan rerata Region.
3. **[GET] /api/branch/store-contribution**: Mengembalikan list skor aktual tiap toko di bawah Branch tersebut.
