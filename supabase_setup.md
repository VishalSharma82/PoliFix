# Supabase Setup for Data Storage

To set up Supabase for data storage in this project, you need to configure both the database (tables) and the storage (buckets for files/images).

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and create an account or sign in.
2. Click **"New Project"**.
3. Choose your organization, provide a project name (e.g., "Environment Friendly"), and set a strong database password.
4. Select a region close to your user base.
5. Click **"Create new project"**.

## 2. Get API Keys
1. Once your project is created, go to **Settings** (gear icon on the left sidebar).
2. Go to **API**.
3. Copy the **Project URL** and the **anon public key**.
4. Add these to your project's `.env.local` or `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   ```

## 3. Database Setup (Tables)
Based on your application, you likely need a table to store problems or reports.

1. Go to **SQL Editor** in your Supabase dashboard.
2. Click **New Query** and run the following SQL (adjust based on your exact schema needs):

```sql
-- Example Table for 'problems'
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id), -- If using Supabase Auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Create policies (Example: anyone can read, authenticated users can insert)
CREATE POLICY "Anyone can view problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert problems" ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 4. Storage Setup (Buckets for Images/Files)
If you need to store files (like images of reported problems), set up Supabase Storage:

1. Go to **Storage** from the left sidebar.
2. Click **New Bucket**.
3. Name it (e.g., `problem-images`).
4. **Important**: If you want anyone to see these images, mark the bucket as **Public**.
5. Set up **Policies** for the bucket so users can upload files:
   - Click **Policies** on the left menu (under Storage).
   - Click **New Policy** for your bucket.
   - Example Policy: Under `INSERT`, choose `Target roles: authenticated` and `USING expression: true`.

## 5. Environment Variables in the Codebase
Make sure the Supabase client in your codebase (`lib/supabase.ts` or similar) uses these environment variables:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Once this is set up, your application will be able to read and write to Supabase Database and Storage!
