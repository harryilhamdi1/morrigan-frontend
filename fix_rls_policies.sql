-- ==============================================================================
-- FIX: MISSING RLS SELECT POLICIES
-- Menambahkan kembalian baca (SELECT) untuk tabel-tabel utama agar Dasbor bisa memuat data
-- ==============================================================================

-- 1. Tabel User Profiles: Izinkan semua user yang sudah login (authenticated) untuk membaca profil
CREATE POLICY "Allow authenticated read for user_profiles" 
    ON user_profiles FOR SELECT 
    TO authenticated 
    USING (true);

-- 2. Tabel Stores: Izinkan semua user login untuk melihat data toko
CREATE POLICY "Allow authenticated read for stores" 
    ON stores FOR SELECT 
    TO authenticated 
    USING (true);

-- 3. Tabel Wave Evaluations: Izinkan semua user login melihat nilai/skor Wave
CREATE POLICY "Allow authenticated read for wave_evaluations" 
    ON wave_evaluations FOR SELECT 
    TO authenticated 
    USING (true);

-- Catatan: action_plans sudah memiliki policy SELECT di db_schema_v1, 
-- namun sebelumnya gagal berjalan karena policy action_plans bergantung pada user_profiles.
-- Kini dengan terbukanya user_profiles, grafik action_plans akan otomatis muncul!
