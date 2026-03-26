
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function checkRLS() {
  const tables = ['profiles', 'problems', 'verifications', 'comments', 'notifications']
  
  for (const table of tables) {
    console.log(`--- Checking Table: ${table} ---`)
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`Error selecting from ${table}:`, error.message)
    } else {
      console.log(`Success selecting from ${table}. Result count:`, data.length)
    }
  }
}

checkRLS()
