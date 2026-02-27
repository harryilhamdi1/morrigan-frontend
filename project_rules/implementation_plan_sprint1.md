# Sprint 1: Executive Analysis (National) Portal

## Goal Description
Membangun halaman utama "Executive Analysis (National)" pada Eigerindo Service Signature (ESS) Analysis Portal. Halaman ini berfungsi sebagai "Helicopter View" bagi jajaran Eksekutif/Direksi untuk memantau performa pelayanan seluruh toko Eiger secara garis besar, cepat, dan presisi. Kita akan mendesain, memprogram, menguji, dan mengevaluasi modul ini dalam satu putaran _Sprint_ yang utuh.

---

## Fitur Utama & Layout Halaman

### 1. The "Heartbeat" (Angka Kritis Instan)
Di bagian paling atas layar, terdapat *Cards* raksasa yang langsung menjawab pertanyaan utama manajemen:
- **ESS National Index**: Skor rerata nasional bulan/Wave ini (Misal: 87.5 / 100).
- **Compliance Gap**: Selisih dari target perusahaan (90).
- **The Winners Circle**: Persentase toko (dari total misal 250 toko) yang berhasil mencetak skor ekselen (> 90).
- **Red Flag Stores**: Jumlah "toko pendarahan" yang skornya di bawah batas toleransi (< 80).

### 2. The National Journeys (Analisis Seluruh Journey)
Seluruh 11 Journey (A sampai K) akan ditampilkan secara lengkap dalam deretan *Cards*:
- Setiap *Card* menampilkan *sparkline* atau grafik mini yang menunjukkan pergerakan skor *journey* tersebut secara sekilas beserta nilainya.
- **Universal Color-Coding System**: Selaras dari tingkat Nasional hingga Toko, setiap *card* akan diberi warna khusus:
  - 🟢 **Hijau (Green)**: Skor aman dan dominan.
  - 🟡 **Kuning (Yellow)**: Peringatan awal (Skor Nasional di bawah target perusahaan).
  - 🔴 **Merah (Red)**: Kondisi kritis/pendarahan serius.
- **Interaktivitas Nasional**: Saat sebuah *Card* diklik, *Card* akan terekspansi menjadi *Modal/Panel* detail yang berisi:
  - **Grafik Tren Detail**: *Trendline* historis dari waktu ke waktu (*Time Machine Dropdown/Wave*).
  - **Regional Breakdown**: Grafik perbandingan skor *Journey* tersebut antar **Regional** (contoh: membandingkan kebersihan Region 1 vs Region 2).
  - **Granular Item Analysis**: Tabel bar horizontal persentase jawaban "Yes" untuk setiap butir pertanyaan spesifik.

### 2.5 The Voice of Customer (Qualitative Insight)
Menampilkan data umpan balik kualitatif yang didorong oleh AI untuk memberikan konteks ("Why") pada angka ("What"):
- **The Treemap**: Peta kotak bersarang yang membagi proporsi 5 kategori keluhan (*Service, Facility, Cleanliness, People, Transaction Process*). Ukuran kotak berbanding lurus dengan jumlah keluhan. Jika 1 komentar mencakup *Service* dan *Facility*, nilainya ditambahkan proporsional ke dua area tersebut. Ini menggantikan desain *bar chart* yang kaku.
- **The Highlight Reel**: Menampilkan 3-5 kalimat komplain/pujian aktual pelanggan untuk memberikan empati langsung dari lapangan kepada pimpinan.

### 3. The "Time Machine" (Tren Makro Nasional)
Grafik Garis (*Interactive Line Chart*) lebar penuh (**YTD/YoY Comparison**).
- **Sumbu X**: Menampilkan 5 waktu Wave secara berurutan (*W1'24, W2'24, W3'24, W1'25, W2'25*).
- **Sumbu Y**: Skor Nasional berjalan.
- **Nilai Bisnis**: Eksekutif bisa tahu pola musiman. Apakah pelayanan toko Eiger selalu turun saat *peak season*? Di sinilah polanya terlihat nyata.

- Tabel *Leaderboard* sederhana atau *Heatmap*.
- Mengurutkan 5 Region (Region 1 sampai Region 5) dari yang **Terbaik (Top Performer)** sampai yang **Terburuk (Bottom Performer)**. 

---

## Kebutuhan Database & API (Backend Logic)
Untuk menyajikan data secepat kilat (instan) ke *Dashboard* Eksekutif, Endpoint Node.js kita (`/api/executive-summary`) perlu memproses *aggregation query* di Supabase:
1. **[GET] /api/executive/heartbeat**: Menghitung rata-rata nasional dan jumlah toko di zona merah/hijau untuk *Wave* yang aktif.
2. **[GET] /api/executive/pain-points**: Menarik rata-rata skor per *Journey* (A s/d K), lalu melakukan *sorting ascending* (terkecil ke terbesar) dan mengambil 3 *Journey* terbawah. Data yang dikembalikan juga memuat rekam jejak (*history*) *Wave* sebelumnya.
3. **[GET] /api/executive/regional-breakdown**: Memecah rata-rata skor dari 1 *Journey* spesifik (yang sedang diklik di "Pain Points") berdasarkan masing-masing Region.

---

## Mode Pelaksanaan (Sprint 1)
1. **Tahap 1**: Menyiapkan Database Schema di Supabase (Tabel `waves`, `master_sites`, `evaluations`) sesuai kerangka dokumen evaluasi.
2. **Tahap 2**: Mengembangkan algoritma Parser / API Backend dengan *Node.js* di *repository* `ess-backend`.
3. **Tahap 3**: Mengembangkan antarmuka *Frontend Executive Dashboard* dengan *Next.js/React* (mendesain elemen-elemen Cards Grafik, Modal Panel, Dropdown mewah, dll) di *repository* `ess-frontend`.
4. **Tahap 4**: Pengujian integrasi (*Sanity Check*) antara UI dan Data CSV.

### 4. The Battleground (Peta & Papan Peringkat Top 5)
Layer ini akan berevolusi menjadi dua komponen visual yang saling melengkapi:
- **Interactive Indonesia Heatmap**: Sebuah peta geografis Indonesia interaktif. Peta ini akan merender intensitas warna (merah/hijau) di setiap *Province* (Provinsi) berdasarkan agregasi nilai rata-rata toko di provinsi tersebut. (*Data mapping Provinsi didapat dari relasi tabel `master_sites` yang di-inject dari Retail MPP Tracking*).
- **The "Best of the Best" Leaderboards**: Menampilkan 3 pilar peringkat eksklusif yang hanya menyorot 5 entitas terbaik (**Top 5**), sehingga tidak memakan tempat terlalu panjang di layar Eksekutif:
  - **Top 5 Regional**
  - **Top 5 Branch**
  - **Top 5 Store**
* **Aturan Khusus Eksekutif**: Segala bentuk agregasi nilai dan *leaderboard* mutlak **MENGECUALIKAN "Toko Bazaar"** (Toko yang *Site ID / Store Code*-nya diawali dengan angka **9**, misalnya `9018`, `9007`, `9021`). Toko-toko temporer ini tidak boleh mengganggu perhitungan rerata performa retail permanen Eiger.
