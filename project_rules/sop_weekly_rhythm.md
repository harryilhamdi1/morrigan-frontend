# The Weekly Operational Rhythm: Morrigan Report V2

Sistem *Action Plan* yang canggih membutuhkan "Ritual Operasional" (Jadwal Tetap) dari Senin hingga Minggu agar puluhan lapis manajer tidak kebingungan kapan mereka harus menginput, kapan AI bekerja, dan kapan Eksekutif membaca laporan.

Berikut adalah desain *Best Practice* untuk siklus operasional mingguan (Skenario: Laporan *Mystery Shopper* / Evaluasi diluncurkan di akhir pekan):

---

## JADWAL SINKRONISASI NASIONAL (THE WEEKLY TIMELINE)

### SENIN: Hari Penemuan & Perbaikan Berkelanjutan (Store Submission Day)
- **09:00 WIB**: Sistem memberi notifikasi *Push/Email* ke ke seluruh 345 *Store Head*.
- **Tugas Store Head**: Berbeda alurnya tergantung dari posisi *Wave* kalender:
  - **(KHUSUS MINGGU KE-1 WAVE BARU)**: *Store Head* menerima 6 *Improvement Focus* baru. Mereka wajib meracik fondasi **Action Plan** awal (Mengisi RCA, Target Solusi, PIC, dan Due Date).
  - **(MINGGU KE-2 HINGGA KE-12)**: *Store Head* tidak mengetik ulang masalah. Mereka diwajibkan melakukan **Consistency Update** (Unggah foto bukti terbaru bahwa toko masih kondusif minggu ini) atau melaporkan **Execution Blocker** (Mengapa perbaikan mandek).
- **23:59 WIB**: ⏳ *HARD DEADLINE*! Ini adalah batas akhir penyerahan (*Submission*) mingguan baik untuk pembuatan baru maupun *update* progres.

### SELASA: Hari Penalti & Penilaian Cabang (Approval Day)
- **00:01 WIB**: *Store Head* yang belum *submit* form (baik form Week-1 maupun form Update mingguan) akan menerima hukuman **Turtle Badge** 🐢. Halaman eksekusinya TERKUNCI. Mereka wajib mengetik alasan keterlambatan kepada *Branch Head* sebelum fitur *Submit* terbuka lagi.
- **Tugas Branch Head**: Sepanjang hari Selasa, *Branch Head* mereviu form yang masuk. 
  - Jika solusi RCA (Week 1) atau progres fotonya *(Week 2-12)* tidak masuk akal $\rightarrow$ Klik **REJECT**. Ini memicu **Conversational Thread** (obrolan masuk akal: "Foto toiletnya masih kotor, bersihkan lagi!").
  - *Store Head* membalas di hari yang sama dengan unggahan foto baru.
  - Jika sudah memuaskan $\rightarrow$ Klik **APPROVE**.
- **17:00 WIB**: Semua kartu di Cabang idealnya sudah di-ACC *Branch Head* dan meluncur naik ke Pusat (HCBP).

### RABU: Hari Kepatuhan Pusat (HCBP Veto Day)
- **Tugas HCBP**: HCBP Nasional menyortir *Action Cards* yang sudah di-ACC oleh *Branch Head* se-Nusantara. 
- Jika ada *Branch Head* yang sembarangan *Approve* solusi yang menyalahi SOP EIGER (Misal: Toko A mengizinkan kasir tidak pakai seragam gara-gara AC rusak), HCBP menekan tombol **VETO REJECT**. 
- Fitur *Chat Bubble* ungu muda muncul, Toko & Cabang mendapat tegoran terarsip, dan Toko diwajibkan mencari solusi lain (revisi).
- **23:59 WIB**: Batas HCBP menyelesaikan pengecapan **RESOLVED** untuk Action Plan minggu itu. File siap untuk "dimakan" oleh AI.

---

### KAMIS: Hari Keajaiban AI (The Map-Reduce & Branch Wrap-up)
*Kita sengaja menjadwalkan AI menyala di Kamis Subuh, agar data Operasional (Senin-Rabu) sudah matang/tidak direvisi lagi.*
- **02:00 WIB (CRON JOB 1)**: Gemini 1.5 Flash menyala (± 3 Menit). AI ini menelan 345 teks RCA & Solusi Toko yang di-*Submit* di hari Senin. 
- **02:05 WIB**: Gemini Flash mengeluarkan **Branch Insights** (Kesimpulan Cabang).
- **09:00 WIB**: *Branch Head* membuka portalnya (Sprint 6). Mereka membaca hasil saringan Gemini Flash untuk area mereka.
- **Tugas Branch Head (The Human Loop)**: Sebelum pulang kantor jam 17:00 WIB, *Branch Head* WAJIB memberikan **"Additional Comments"** atas wawasan AI tersebut (Misal: "Memang vendor AC di area saya sedang pailit, mohon atensi Region").

### JUM'AT: Hari Strategis Regional (The Macro Loop)
- **02:00 WIB (CRON JOB 2)**: Gemini 1.5 Pro menyala. AI ini menelan (*Branch Insights* + Komentar para *Branch Head* dari hari Kamis). AI ini meracik **Regional Insights**.
- **09:00 WIB**: *Regional Director* membuka Portal Regional (Sprint 7). Mereka melihat kesimpulan Gemini Pro yang mendeteksi "Kekacauan sistemik vendor AC di 3 Cabang sekaligus".
- **Tugas Regional Director (The Human Loop)**: Meninggalkan **"Relevant Feedback"** yang berbobot strategis (Misal: "Saya merekomendasikan pencabutan kontrak Vendor A dan kita cari vendor sentral dari Jakarta").

### SABTU & MINGGU: C-Level Weekend Desk (The Executive Command)
- **Sabtu 02:00 WIB (CRON JOB 3)**: Eksekusi Puncak! Gemini 1.5 Pro menyala untuk terakhir kalinya. Menelan (*Regional Insights* + Feedback keras dari *Regional Director* di hari Jumat).
- **Sabtu 02:05 WIB**: **The National Executive Deck** selesai digodok dan tersimpan abadi di dalam Supabase secara *Cached*.
- **Senin Pagi (Minggu Depan)**: Jajaran C-Level *Top Management* masuk kerja, membuka Portal Nasional (Sprint 8). Dalam 1 layar polos, mereka langsung membaca rekomendasi bulat untuk *Corporate Policy Change*: "Berdasarkan rantaian insiden di Region Sumatera, kita harus memutus kontrak Vendor A secara Nasional." Anggaran CAPEX dicairkan secara terjustifikasi.

---

## BAGAIMANA FEEDBACK FLOW INI TERJADI? (Skenario Ringkas)
1. **Chat Bubble (Tingkat Bawah - Micro)**: Sinkron (*Real-time*). Terjadi murni antara **Toko $\leftrightarrow$ Branch $\leftrightarrow$ HCBP** di hari Selasa & Rabu melalui fitur ketikan percakapan di dalam *Action Card*. Bertujuan untuk me- *Reject* dan merevisi teknis operasional langsung.
2. **Comment Injection (Tingkat Tinggi - Macro)**: Asinkron (*AI Map-Reduce*). Terjadi di atas hari Kamis. Manajer (Branch & Regional) **tidak berdebat** / berbalas ketikan. Mereka hanya "Menitipkan" satu paragraf Komentar Penilaian (*Assessment Comment*) untuk dibaca dan disimpulkan oleh Gemini Pro yang membawa pesan itu semakin tinggi ke puncak CEO.
