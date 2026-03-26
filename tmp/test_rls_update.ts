
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

async function testUpdate() {
  console.log("--- Testing Reputation Update ---")
  
  // This script runs with ANON key, same as the browser
  // We need a valid user ID to test. I'll pick one from the profiles table.
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, reputation_points').limit(1)
  
  if (!profiles || profiles.length === 0) {
    console.log("No profiles found to test.")
    return
  }

  const testUser = profiles[0]
  console.log(`Testing with user: ${testUser.full_name} (${testUser.id})`)
  console.log(`Current points: ${testUser.reputation_points}`)

  const { data, error } = await supabase
    .from('profiles')
    .update({ reputation_points: (testUser.reputation_points || 0) + 1 })
    .eq('id', testUser.id)
    .select()

  if (error) {
    console.log("UPDATE FAILED:", error.message)
    if (error.message.includes("policy")) {
        console.log("CONFIRMED: RLS policy is blocking updates.")
    }
  } else {
    console.log("UPDATE SUCCESSFUL! New points:", data[0]?.reputation_points)
  }
}

testUpdate()
