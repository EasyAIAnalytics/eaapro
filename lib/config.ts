import { createClient } from '@supabase/supabase-js';

export const supabase = createClient('https://rzsqovubnecodrewyeus.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6c3FvdnVibmVjb2RyZXd5ZXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTkzMTAsImV4cCI6MjA2ODA3NTMxMH0.VRWDBhxprSBirVneBro4KDHVjFzKfsCpzJ9IhXRmpI4');
// Replace with your actual Supabase project URL and anon key

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to build API endpoints
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}${cleanEndpoint}`;
}; 