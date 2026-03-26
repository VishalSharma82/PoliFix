import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: Supabase URL or Key is missing in environment variables. Backend will fail.');
}

// Fallback to dummy values to prevent crash during initialization on Vercel
// The actual requests will fail with 401/400 but the server stays up to report it
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseKey || 'placeholder', 
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    }
);
