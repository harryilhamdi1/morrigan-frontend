-- ==============================================================================
-- STRUKTUR DATABASE (SUPABASE POSTGRESQL) - MORRIGAN REPORT V2
-- ==============================================================================

-- Mengaktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. HIERARKI RITEL (Region, Branch, Store)
-- ==========================================

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    store_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    league_status VARCHAR(50) DEFAULT 'Rising Star', -- Gold, Silver, Bronze, Rising Star
    is_active BOOLEAN DEFAULT true, -- Untuk handle "Closed Store Exclusion"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. USERS & RBAC (Role-Based Access Control)
-- ==========================================
-- Tabel ini idealnya berelasi 1-to-1 dengan bawaan auth.users di Supabase
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'Store Head', 'Branch Head', 'Regional Director', 'HCBP', 'Superadmin'
    
    -- Foreign keys untuk afiliasi wilayah (nullable karena tergantung role)
    store_id UUID REFERENCES stores(id),
    branch_id UUID REFERENCES branches(id),
    region_id UUID REFERENCES regions(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. WAVE EVALUATIONS (Hasil Mystery Shopper)
-- ==========================================
CREATE TABLE wave_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    wave_name VARCHAR(100) NOT NULL, -- Misal: "Wave 1 2024"
    
    -- Metrik Keseluruhan
    total_score DECIMAL(5,2),
    
    -- Nilai per Journey (A s/d K)
    score_a DECIMAL(5,2),
    score_b DECIMAL(5,2),
    score_c DECIMAL(5,2),
    score_d DECIMAL(5,2),
    score_e DECIMAL(5,2),
    score_f DECIMAL(5,2),
    score_g DECIMAL(5,2),
    score_h DECIMAL(5,2),
    score_i DECIMAL(5,2),
    score_j DECIMAL(5,2),
    score_k DECIMAL(5,2),
    
    -- JSONB untuk menyimpan granular failed items (Item 1-72 yang nilainya 0)
    granular_failed_items JSONB, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, wave_name) -- Satu toko hanya punya 1 rapor per Wave
);

-- ==========================================
-- 4. ACTION PLANS (The Mission Board)
-- ==========================================
-- Menyimpan both Quantitative & Qualitative Action Plans
CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    wave_id UUID REFERENCES wave_evaluations(id) ON DELETE CASCADE,
    
    -- Tipe Card
    plan_type VARCHAR(20) NOT NULL, -- 'Quantitative' atau 'Qualitative'
    journey_name VARCHAR(255) NOT NULL, -- Header Card (Misal: "C. Suasana & Kenyamanan", atau AI Topic)
    
    -- Bukti Pelanggaran (The Context)
    failed_items_history JSONB, -- Array of items & 5-wave history (Recurring, Inconsistent, New)
    ai_sentiment_quote TEXT, -- Kutipan keluhan Voc murni (Hanya untuk Qualitative)
    
    -- The Execution Zone (Input by Store Head)
    rca_category VARCHAR(50), -- 5M: Manpower, Machine, Method, Material, Others
    rca_description TEXT, -- Akar Masalah
    action_strategy TEXT, -- Solusi Konkret
    pic_name VARCHAR(100),
    due_date DATE,
    evidence_url TEXT, -- Link ke Google Drive
    blocker_text TEXT, -- Update halangan (Week 2-12)
    
    -- Workflow Status
    status VARCHAR(50) DEFAULT 'Requires Action', -- 'Requires Action', 'Waiting for Approval', 'Resolved', 'Revision Required', 'Revision Required by HCBP'
    
    -- Chat/Conversational Thread (Komentar dari Atasan jika Reject)
    rejection_reason_history JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Mengunci tabel agar tidak bisa dibaca/ubah sembarangan via API publik

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wave_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- RLS: ACTION PLANS
-- ------------------------------------------
-- 1. Store Head: Hanya bisa melihat & update Action Plan tokonya sendiri
CREATE POLICY "Store Head can view their own action plans"
    ON action_plans FOR SELECT
    USING (store_id IN (SELECT store_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Store Head can update their own action plans"
    ON action_plans FOR UPDATE
    USING (store_id IN (SELECT store_id FROM user_profiles WHERE id = auth.uid()));

-- 2. Branch Head: Bisa melihat & update (approve/reject) action plans di bawah cabangnya
CREATE POLICY "Branch Head can view branch action plans"
    ON action_plans FOR SELECT
    USING (store_id IN (
        SELECT id FROM stores WHERE branch_id IN (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    ));

CREATE POLICY "Branch Head can update branch action plans"
    ON action_plans FOR UPDATE
    USING (store_id IN (
        SELECT id FROM stores WHERE branch_id IN (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    ));

-- 3. HCBP & Superadmin: Bisa melihat & update SELURUH action plans
CREATE POLICY "HCBP and Superadmin can view and update all action plans"
    ON action_plans FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('HCBP', 'Superadmin')
    ));
