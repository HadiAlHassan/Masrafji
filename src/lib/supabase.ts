import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { AppState } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * Static web rendering evaluates this module in Node, where `localStorage` does not
 * exist, so the adapter is only passed when the global is actually available.
 */
const authStorage = typeof localStorage === 'undefined' ? undefined : localStorage;

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabasePublishableKey as string, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: Boolean(authStorage),
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;

if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
