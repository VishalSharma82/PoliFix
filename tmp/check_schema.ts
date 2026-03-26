
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

async function checkProfilesSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.error("Error fetching profiles:", error.message)
    if (error.message.includes("column \"bio\" does not exist")) {
        console.log("CONFIRMED: Column 'bio' is missing.")
    }
  } else {
    console.log("Profiles columns:", Object.keys(data[0] || {}))
  }
}

checkProfilesSchema()
