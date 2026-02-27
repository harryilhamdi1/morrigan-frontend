# GLOBAL CODING GUIDELINES & ARCHITECTURE RULES
**Project: Morrigan Report V2**

Dokumen ini memuat aturan absolut (Golden Rules) yang harus dipatuhi oleh AI selama fase *development* (pemrograman) aplikasi ini. Aturan ini ditegaskan langsung oleh *Project Owner* sebelum mengetik baris kode pertama.

## 1. UI/UX & BAHASA (The Face of The App)
- **Bahasa Utama**: Seluruh *interface* (UI) mulai dari tombol, tabel, notifikasi, hingga peringatan harus menggunakan **Bahasa Indonesia** yang baku, profesional, dan operasional (mudah dipahami orang lapangan).
- **Aesthetic Standard**: Tampilan wajib *clean, modern, dan professional*. Dilarang keras membuat UI yang terlihat seperti "aplikasi murahan" atau *template admin* jadul. Wajib menggunakan desain *premium* (contoh: *glassmorphism*, *smooth gradients*, *subtle shadows*, gaya *dashboard* sekelas Vercel/Linear).

## 2. CODE ARCHITECTURE (The Skeleton)
- **No God Objects**: Dilarang membuat "God File" (satu *file* raksasa yang menangani UI, state, dan API sekaligus). 
- **Modularity**: Logika harus dipecah secara cerdas (*code intelligently*). Pisahkan komponen presentasional (*dumb components*) dari komponen logika (*smart components* / *hooks*).
- **Scalability & Troubleshooting**: Kode wajib modular, menggunakan struktur *folder* yang rapi (Misal berbasis Fitur atau *Atomic Design*), sehingga mudah di-*scale* di masa depan dan sangat gampang di-*troubleshoot* jika terjadi *bug*.

## 3. SECURITY & LOGIC (The Vault)
- **RBAC (Role-Based Access Control) Enforcement**: Sistem *Role-Based Access Control* harus diterapkan secara disiplin di setiap level:
  - Di *Frontend*: Sembunyikan tombol/menu yang tidak sesuai dengan *Role*.
  - Di *Backend* (API/DB): Pastikan ada verifikasi/ *middleware* yang mengecek *Role* sebelum mengembalikan atau mengubah data. 
  - (Seorang Store Head A tidak boleh bisa mengintip Action Plan Store B via manipulasi URL/API).
