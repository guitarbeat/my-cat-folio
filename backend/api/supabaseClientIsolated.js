/**
 * @module supabaseClientIsolated
 * @description Completely isolated Supabase client with no external dependencies
 */

// Inline the Supabase client creation to avoid any import issues
let supabase = null;

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Dynamically import Supabase only when needed
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      if (!window.__supabaseClient) {
        window.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      }
      supabase = window.__supabaseClient;
    } else {
      console.warn('Missing Supabase environment variables. Supabase features are disabled.');
    }
  }).catch(error => {
    console.error('Failed to load Supabase:', error);
  });
}

export { supabase };
