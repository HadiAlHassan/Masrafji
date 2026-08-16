import { RecoveryPath } from '@/lib/auth-recovery';

/**
 * Supabase recovery links point at `/reset-password`, which has no route file because
 * `src/app` is the native tab set and any route added here becomes a tab.
 *
 * The recovery URL is read separately by `usePasswordRecovery`, so the path is rewritten
 * to the home route to keep Expo Router from falling through to `+not-found`.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes(RecoveryPath)) {
      return '/';
    }

    return path;
  } catch {
    return path;
  }
}
