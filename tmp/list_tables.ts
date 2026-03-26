
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

async function listTables() {
  // We can try to select from information_schema
  const { data, error } = await supabase.rpc('get_tables_info')
  
  if (error) {
    // If RPC doesn't exist, try common tables
    const tables = ['profiles', 'problems', 'verifications', 'comments', 'notifications']
    for (const table of tables) {
        const { error: tError } = await supabase.from(table).select('*').limit(1)
        if (tError) {
          console.log(`Table '${table}' error:`, tError.message)
        } else {
          console.log(`Table '${table}' EXISTS.`)
        }
    }
  } else {
    console.log("Tables info:", data)
  }
}

listTables()
