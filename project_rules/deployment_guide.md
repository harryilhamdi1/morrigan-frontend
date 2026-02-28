# Morrigan Report V2 - Deployment Guide

## 1. Frontend (Vercel)
The frontend is a Next.js (App Router) full-stack application that handles the UI, routing, SSR, and most API processes (Supabase queries, AI map-reduce cron jobs).

**Repository**: `https://github.com/harryilhamdi1/morrigan-frontend`

### Deployment Steps:
1. Go to **Vercel Dashboard** -> Add New Project.
2. Import the `morrigan-frontend` repository from GitHub.
3. Keep the default Build Settings (Framework: Next.js).
4. **Environment Variables**: Add the following keys manually:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Your Supabase Anon Key)
   - `SUPABASE_SERVICE_KEY` = (Your Supabase Service Role Key)
   - `GEMINI_API_KEY` = (Google Gemini API Key for AI Insights)
5. Click **Deploy**.

## 2. Backend (Hostinger)
The standalone Node.js (Express.js) backend is used specifically for heavy processes that bypass Vercel's 15-second serverless timeout limit (e.g., streaming large photo uploads to Google Drive or batch parsing 10,000+ row CSV files).

**Repository**: `https://github.com/harryilhamdi1/morrigan-backend`

### Deployment Steps:
1. Go to **Hostinger hPanel** -> Advanced -> **Node.js**.
2. Create a new Node.js Application. Set **Entry file** to `index.js`.
3. Go to the **GIT** tab and sync the `morrigan-backend` repository.
4. **Environment Variables**: Add the following in the dashboard or via a `.env` file in the File Manager:
   - `PORT=3000` (Optional/Default)
   - `SUPABASE_URL` = (Your Supabase URL)
   - `SUPABASE_SERVICE_KEY` = (Your Supabase Service Role Key)
5. Upload the `google-credentials.json` file manually to the root folder via File Manager (since it's ignored by Git).
6. Click **NPM Install**, then **Start Application**.
