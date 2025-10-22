/**
 * @module supabaseClientSimple
 * @description Simple Supabase client without any dependencies to avoid circular imports
 */

import { createClient } from '@supabase/supabase-js';

// Environment configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the Supabase client if the required environment variables are present
let supabase = null;
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Missing Supabase environment variables. Supabase features are disabled.'
    );
  }
} else {
  // Ensure a single Supabase client instance in browser
  if (typeof window !== 'undefined') {
    if (!window.__supabaseClient) {
      window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    supabase = window.__supabaseClient;
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };
