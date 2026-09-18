import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const sanitizeUrl = (url) => {
  if (!url) return '';
  return url.trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '');
};

const cleanUrl = sanitizeUrl(rawUrl);
const cleanAnonKey = rawAnonKey.trim();

export const supabase = (cleanUrl && cleanAnonKey)
  ? createClient(cleanUrl, cleanAnonKey)
  : null;
