import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const serviceKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbHV5dG9teWNtcW96bWNkbnp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDU5OTc2MywiZXhwIjoyMDU2MTc1NzYzfQ.Hph3CyDwi0VtnUiNOGtb1-XoFMmq4-LeHu3nbhIijOI'


// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Create a Supabase client with admin privileges
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Test function to verify connection
export const testSupabaseConnection = async () => {
  try {
    // First, check if environment variables are properly loaded
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables are missing');
      return { 
        success: false, 
        error: { message: 'Environment variables not properly loaded' } 
      };
    }
    
    // Try to make a simple query to verify connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1).catch(err => {
      return { data: null, error: err };
    });
    
    if (error) {
      // This error might be expected if the table doesn't exist
      // Let's try a different approach to test the connection
      const { data: healthData, error: healthError } = await supabase.rpc('get_service_status');
      
      if (healthError) {
        console.error('Supabase connection error:', healthError);
        return { success: false, error: healthError };
      }
      
      console.log('Supabase connection successful!');
      return { success: true, data: healthData };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return { success: false, error: err };
  }
};

// Log connection details (without sensitive info)
console.log('Supabase client initialized with URL:', supabaseUrl ? 'URL provided' : 'URL missing');