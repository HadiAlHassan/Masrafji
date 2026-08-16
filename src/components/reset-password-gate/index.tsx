import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { describePasswordProblem } from '@/lib/auth-recovery';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

import { styles } from './reset-password-gate.styles';

type ResetPasswordGateProps = {
  linkError: string | null;
  onDone: () => void;
};

export function ResetPasswordGate({ linkError, onDone }: ResetPasswordGateProps) {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const disabled = submitting || !isSupabaseConfigured || Boolean(linkError) || done;

  async function handleSubmit() {
    if (!supabase) {
      setMessage('Supabase is not configured. Add environment variables and restart Expo.');
      return;
    }

    const problem = describePasswordProblem(password, confirmation);

    if (problem) {
      setMessage(problem);
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setDone(true);
      setPassword('');
      setConfirmation('');
      setMessage('Password updated. You are signed in with the new password.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update the password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Masrafji
            </ThemedText>
            <ThemedText type="subtitle">Set a new password</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {linkError
                ? 'This reset link cannot be used.'
                : 'Choose a password with at least 6 characters.'}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.formCard}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              editable={!disabled}
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
              accessibilityLabel="New password"
            />
            <TextInput
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="Confirm new password"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              editable={!disabled}
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
              accessibilityLabel="Confirm new password"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Update password"
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed || disabled ? 0.65 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                {submitting ? 'Working…' : 'Update password'}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel={done ? 'Continue to the app' : 'Cancel password reset'}
              style={styles.secondaryButton}>
              <ThemedText type="smallBold">{done ? 'Continue' : 'Cancel'}</ThemedText>
            </Pressable>
          </ThemedView>

          {(message ?? linkError) && (
            <ThemedView type="backgroundElement" style={styles.notice}>
              <ThemedText type="small" themeColor="textSecondary">
                {message ?? linkError}
              </ThemedText>
            </ThemedView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
