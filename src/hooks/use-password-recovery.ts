import { useCallback, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';

import { parseRecoveryLink } from '@/lib/auth-recovery';
import { supabase } from '@/lib/supabase';

type RecoveryState = {
  active: boolean;
  error: string | null;
};

const initialState: RecoveryState = { active: false, error: null };

/**
 * Watches for Supabase recovery deep links and puts the app into password-reset mode.
 *
 * Sessions are restored manually because the Supabase client runs with
 * `detectSessionInUrl: false` on native.
 */
export function usePasswordRecovery() {
  const [state, setState] = useState<RecoveryState>(initialState);
  const handledUrls = useRef(new Set<string>());
  const linkingUrl = Linking.useLinkingURL();

  const handleUrl = useCallback(async (url: string | null) => {
    if (!url || handledUrls.current.has(url)) {
      return;
    }

    const link = parseRecoveryLink(url);

    if (!link) {
      return;
    }

    handledUrls.current.add(url);

    if (link.type === 'error') {
      setState({ active: true, error: link.error.message });
      return;
    }

    if (!supabase) {
      setState({
        active: true,
        error: 'Supabase is not configured. Add environment variables and restart Expo.',
      });
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: link.tokens.accessToken,
      refresh_token: link.tokens.refreshToken,
    });

    setState({
      active: true,
      error: error ? error.message : null,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    Linking.getInitialURL().then((url) => {
      if (!cancelled) {
        void handleUrl(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [handleUrl]);

  useEffect(() => {
    void handleUrl(linkingUrl);
  }, [handleUrl, linkingUrl]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setState({ active: true, error: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const dismiss = useCallback(() => {
    setState(initialState);
  }, []);

  return { recovering: state.active, recoveryError: state.error, dismissRecovery: dismiss };
}
