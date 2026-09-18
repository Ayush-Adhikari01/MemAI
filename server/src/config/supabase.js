import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

// Sanitize URL: strip any trailing /rest/v1/, /auth/v1/, or slashes
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl) return '';
  return rawUrl.trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '');
};

const cleanUrl = sanitizeUrl(config.supabase.url);
const cleanServiceKey = config.supabase.serviceRoleKey?.trim();
const cleanAnonKey = config.supabase.anonKey?.trim();

if (cleanUrl && cleanServiceKey) {
  supabaseAdminClient = createClient(cleanUrl, cleanServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

if (cleanUrl && cleanAnonKey) {
  supabaseClient = createClient(cleanUrl, cleanAnonKey);
}

export const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    console.warn('⚠️ Supabase Admin Client not initialized. Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  return supabaseAdminClient;
};

export const getSupabase = () => {
  return supabaseClient;
};
