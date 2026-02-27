# REFERENCE: The Action Plan Anatomy & Rules (Morrigan Report V2)

Dokumen ini adalah SATU-SATUNYA SUMBER KEBENARAN (Single Source of Truth) untuk *Business Logic* dari fitur "Action Plan / Improvement Focus" yang akan muncul di *Dashboard Store Head*. (Berlaku untuk Sprint 4 & Sprint 5).

---

## 1. THE 11 JOURNEYS (Quantitative Triggers)
Survei *Mystery Shopper* Nasional dibagi secara hierarkis ke dalam **11 Pilar Utama yang disebut "Journey" (Kolom A s/d K)**. 
Setiap *Journey* membawahi banyak *items* (sub-pertanyaan).

Daftar 11 Journey adalah sebagai berikut:
- **[A]** Tampilan Tampak Depan Outlet
- **[B]** Sambutan Hangat Ketika Masuk ke Dalam Outlet
- **[C]** Suasana & Kenyamanan Outlet
- **[D]** Penampilan Retail Assistant
- **[E]** Pelayanan Penjualan & Pengetahuan Produk
- **[F]** Pengalaman Mencoba Produk
- **[G]** Rekomendasi untuk Membeli Produk
- **[H]** Pembelian Produk & Pembayaran di Kasir
- **[I]** Penampilan Kasir
- **[J]** Toilet (Khusus Store yang memiliki toilet)
- **[K]** Salam Perpisahan oleh Retail Asisstant

---

## 2. GENERATION LOGIC (Dinamis: Reward & Punishment)

### QUANTITATIVE (Dari Nilai Survei):
- **Triggger**: Sebuah Kartu Action Plan akan digenerate JIKA BILA skor salah satu *Journey* (A-K) berada di bawah batas **Target Nasional ( < 90 )**.
- **No-Cap Punishment**: Tidak ada batasan 5 kartu. Jika ada toko *destroyer* yang skor 11 *Journeys*-nya hancur semua (misal nilainya 40-70 semua), maka sistem akan menghukum Store Head dengan merilis **11 Action Plan Card**.
- **The Perfect Exemption**: Jika ada toko yang skor *Journey*-nya sempurna 100, toko tersebut dibebaskan dari kewajiban membuat *Action Plan* untuk *Journey* tersebut (Reward).

### QUALITATIVE (Dari AI Sentiment Voice of Customer):
- **Trigger**: AI Gemini Flash (Sprint 3) mendeteksi adanya ulasan bernada **"Negatif"** dari data mentah (*Master_Qualitative_AI_Categorized.csv*).
- **Single Voice Rule**: Sekalipun pelanggan berkeluh-kesah soal 5 hal berbeda, AI hanya diizinkan menerbitkan **Maksimal 1 Kartu Action Plan Qualitative** (yakni keluhan dengan sentimen frekuensi terbanyak / *highest urgency*) agar layar toko tidak banjir AP Sentimen.
- **The Positive Exemption**: Jika seluruh pelanggan memberikan *feedback* 100% Positif/Netral, kartu Qualitative ini **Ditiadakan (Hangus = 0 Card)**.

### RISING STAR (Toko Baru):
- **Trigger**: Toko terdaftar di Master CSV namun tidak memiliki rekam jejak penilaian survei *Mystery Shopper* di satupun Wave sebelumnya.
- **Rule (The National Benchmark)**: Toko ini dipaksa mendapatkan **5 Action Plan Kuantitatif** (sebagai pemanasan operasional). Ke-5 *Action Plan* ini BUKAN diambil dari nilai survei mereka (karena nilainya kosong), melainkan **mengadopsi 5 Journey Terburuk secara Nasional**.
- **Perbedaan Tampilan Kartu**: Kartu *Action Plan* untuk Rising Star **TIDAK memiliki List Item Bermasalah** (*Recurring/Inconsistent*), melainkan hanya berisi Header *Journey*, karena mereka belum pernah disurvei. Teks deskripsinya berbunyi: *"Journey ini adalah titik kelemahan operasional terbesar se-Nasional. Buat Action Plan untuk memastikan toko baru Anda kebal terhadap isu ini."*

---

## 3. UI/UX: THE CARD ANATOMY (Format Kartu)
Bagaimana bentuk kartu ini saat muncul di HP/Tablet *Store Head*? Kartu sengaja didesain **Sangat Minimalis dan "To The Point" (Insight-Driven)**, bukan *checklist* kuli.

### THE QUANTITATIVE CARD (Journey Level)
> **[C. Suasana & Kenyamanan Outlet]**
>
> 🔴 **Recurring Failed (Masalah Mengakar)**
> - *Produk apparel yang dipajang terlihat kusut*
>
> 🟡 **Inconsistent (SOP Labil di 5 Wave Terakhir)**
> - *Lantai berdebu / kotor*
>
> 🟠 **Just Failed This Wave (Bocor Baru Musim Ini)**
> - *Suhu di dalam outlet terasa panas*

*(Store Head mengisi 1 RCA dan 1 Solusi komprehensif, ditujukan untuk menyembuhkan seluruh "Journey C" tersebut, bukan jawaban satu per satu per item).*

### THE QUALITATIVE CARD (AI Sentiment)
> **[Service/Attitude - Pelayanan Kasir]**
>
> 📝 **Voice of Customer (Bukti AI)**
> *"Kasirnya jutek banget pas ditanya stok tas gunung, trus balikin kembaliannya dilempar ke meja."*

*(Store Head mengisi 1 RCA dan 1 Solusi Komprehensif khusus memperbaiki attitude kasir berdasarkan bukti empiris AI ini).*
