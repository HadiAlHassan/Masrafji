import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createRecoveryRedirectUrl } from '@/lib/auth-recovery';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './auth-gate.styles';

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

const titles: Record<AuthMode, string> = {
  'sign-in': 'Sign in',
  'sign-up': 'Create account',
  'forgot-password': 'Reset password',
};

const subtitles: Record<AuthMode, string> = {
  'sign-in': 'Secure your wallet and transactions.',
  'sign-up': 'Secure your wallet and transactions.',
  'forgot-password': 'We email you a link to choose a new password.',
};

const submitLabels: Record<AuthMode, string> = {
  'sign-in': 'Sign in',
  'sign-up': 'Create account',
  'forgot-password': 'Send reset link',
};

export function AuthGate() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isForgotPassword = mode === 'forgot-password';

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
  }

  async function handleAuthSubmit() {
    const normalizedEmail = email.trim();

    if (!supabase) {
      setMessage('Supabase is not configured. Add environment variables and restart Expo.');
      return;
    }

    if (!normalizedEmail) {
      setMessage('Use a valid email address.');
      return;
    }

    if (!isForgotPassword && password.length < 6) {
      setMessage('Use a valid email and a password with at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: createRecoveryRedirectUrl(),
        });

        if (error) {
          throw error;
        }

        setMessage('If that email has an account, a reset link is on its way.');
        return;
      }

      const { error } =
        mode === 'sign-in'
          ? await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            })
          : await supabase.auth.signUp({
              email: normalizedEmail,
              password,
            });

      if (error) {
        throw error;
      }

      if (mode === 'sign-up') {
        setMessage('Account created. Check email confirmation settings if sign-in does not start.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.authContainer}>
          <ThemedView style={styles.authHeader}>
            <ThemedText type="small" themeColor="textSecondary">
              Masrafji
            </ThemedText>
            <ThemedText type="subtitle">{titles[mode]}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subtitles[mode]}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.formCard}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
              accessibilityLabel="Email"
            />
            {!isForgotPassword && (
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry
                style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
                accessibilityLabel="Password"
              />
            )}

            <Pressable
              onPress={handleAuthSubmit}
              disabled={submitting || !isSupabaseConfigured}
              accessibilityRole="button"
              accessibilityLabel={submitLabels[mode]}
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed || submitting || !isSupabaseConfigured ? 0.65 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                {submitting ? 'Working…' : submitLabels[mode]}
              </ThemedText>
            </Pressable>

            {mode === 'sign-in' && (
              <Pressable
                onPress={() => changeMode('forgot-password')}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                style={styles.secondaryButton}>
                <ThemedText type="smallBold">Forgot password?</ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={() => changeMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              accessibilityRole="button"
              accessibilityLabel={
                mode === 'sign-in' ? 'Switch to create account' : 'Switch to sign in'
              }
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">
                {mode === 'sign-in'
                  ? 'Need an account? Sign up'
                  : 'Already have an account? Sign in'}
              </ThemedText>
            </Pressable>
          </ThemedView>

          {message && (
            <ThemedView type="backgroundElement" style={styles.notice}>
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            </ThemedView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
