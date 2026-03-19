
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error, status, statusText } = await supabase.from('profiles').select('*').order('reputation_points', { ascending: false }).limit(5)
  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2))
    console.error("Status:", status, statusText)
  } else {
    console.log("Query successful! Results:", data.length)
  }
}

checkSchema()
