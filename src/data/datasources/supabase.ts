import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { env } from '@/core/config/env';

import { storage } from './storage';

export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Only refresh the session while the app is in the foreground
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
