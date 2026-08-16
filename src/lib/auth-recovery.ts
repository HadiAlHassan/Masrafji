import * as Linking from 'expo-linking';

export const RecoveryPath = 'reset-password';

export type RecoveryTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RecoveryLinkError = {
  message: string;
};

export type RecoveryLink =
  | { type: 'tokens'; tokens: RecoveryTokens }
  | { type: 'error'; error: RecoveryLinkError }
  | null;

/**
 * The redirect target Supabase appends its recovery tokens to. Must be listed in the
 * Supabase dashboard under Authentication -> URL Configuration -> Redirect URLs.
 */
export function createRecoveryRedirectUrl() {
  return Linking.createURL(RecoveryPath);
}

function parseParams(source: string) {
  const params = new URLSearchParams(source);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
    error: params.get('error'),
    errorCode: params.get('error_code'),
    errorDescription: params.get('error_description'),
  };
}

/**
 * Supabase returns recovery tokens in the URL fragment (`#access_token=...`), which
 * `Linking.parse` does not expose, so both the fragment and the query string are read.
 */
export function parseRecoveryLink(url: string | null | undefined): RecoveryLink {
  if (!url) {
    return null;
  }

  const parsed = Linking.parse(url);
  const isRecoveryPath = (parsed.path ?? '').replace(/^\/+|\/+$/g, '') === RecoveryPath;

  const fragmentIndex = url.indexOf('#');
  const fragment = fragmentIndex === -1 ? '' : url.slice(fragmentIndex + 1);
  const queryIndex = url.indexOf('?');
  const query =
    queryIndex === -1
      ? ''
      : url.slice(queryIndex + 1, fragmentIndex === -1 ? undefined : fragmentIndex);

  const fromFragment = parseParams(fragment);
  const fromQuery = parseParams(query);

  const accessToken = fromFragment.accessToken ?? fromQuery.accessToken;
  const refreshToken = fromFragment.refreshToken ?? fromQuery.refreshToken;
  const type = fromFragment.type ?? fromQuery.type;
  const error = fromFragment.error ?? fromQuery.error;
  const errorCode = fromFragment.errorCode ?? fromQuery.errorCode;
  const errorDescription = fromFragment.errorDescription ?? fromQuery.errorDescription;

  if (error || errorCode) {
    if (!isRecoveryPath) {
      return null;
    }

    return {
      type: 'error',
      error: {
        message: errorDescription ?? 'This reset link is no longer valid. Request a new one.',
      },
    };
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  if (type !== 'recovery' && !isRecoveryPath) {
    return null;
  }

  return { type: 'tokens', tokens: { accessToken, refreshToken } };
}

export function describePasswordProblem(password: string, confirmation: string) {
  if (password.length < 6) {
    return 'Use a password with at least 6 characters.';
  }

  if (password !== confirmation) {
    return 'Passwords do not match.';
  }

  return null;
}
