import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  throw new Error('Missing or invalid Supabase URL. Please check your environment variables.')
}

if (!supabaseKey || supabaseKey === 'public-anon-key') {
  throw new Error('Missing or invalid Supabase Publishable Key. Please check your environment variables.')
}

export const supabase = createClient<Database>(supabaseUrl.trim(), supabaseKey.trim())
