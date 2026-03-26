
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

async function checkData() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name, reputation_points').limit(5)
  const { data: problems, error: prError } = await supabase.from('problems').select('id, title, confirmed_count').limit(5)
  const { data: verifications, error: vError } = await supabase.from('verifications').select('*').limit(5)
  const { data: comments, error: cError } = await supabase.from('comments').select('*').limit(5)
  const { data: notifications, error: nError } = await supabase.from('notifications').select('*').limit(5)

  console.log("Profiles count:", profiles?.length, "| Error:", pError?.message)
  console.log("Problems count:", problems?.length, "| Error:", prError?.message)
  console.log("Verifications count:", verifications?.length, "| Error:", vError?.message)
  console.log("Comments count:", comments?.length, "| Error:", cError?.message)
  console.log("Notifications count:", notifications?.length, "| Error:", nError?.message)

  if (profiles) console.log("Profiles Sample:", profiles)
  if (problems) console.log("Problems Sample:", problems)
}

checkData()
