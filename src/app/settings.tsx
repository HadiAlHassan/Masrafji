import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsCard } from "@/components/settings-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useTheme } from "@/hooks/use-theme";
import { createRecoveryRedirectUrl } from "@/lib/auth-recovery";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

import { styles } from "@/screens/settings/settings-screen.styles";

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { session } = useAuthSession();
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleSignOut() {
    await supabase?.auth.signOut();
  }

  async function handleSendPasswordReset() {
    const email = session?.user.email;

    if (!supabase || !email) {
      setResetMessage("Sign in with an email address to reset the password.");
      return;
    }

    try {
      setSendingReset(true);
      setResetMessage(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: createRecoveryRedirectUrl(),
      });

      if (error) {
        throw error;
      }

      setResetMessage(`Reset link sent to ${email}.`);
    } catch (error) {
      setResetMessage(
        error instanceof Error ? error.message : "Could not send the reset link.",
      );
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInset={{
          top: safeAreaInsets.top,
          bottom: safeAreaInsets.bottom + BottomTabInset,
        }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + Spacing.three,
            paddingBottom:
              safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="small" themeColor="textSecondary">
            Masrafji
          </ThemedText>
          <ThemedText type="subtitle">Settings</ThemedText>
        </View>

        <SettingsCard
          icon="person-outline"
          title="Account"
          description={session?.user.email ?? "Not signed in"}
        />

        <SettingsCard
          icon={isSupabaseConfigured ? "cloud-done-outline" : "warning-outline"}
          iconColor={isSupabaseConfigured ? "#16a34a" : "#f59e0b"}
          title="Sync"
          description={
            isSupabaseConfigured
              ? "Transactions sync with Supabase."
              : "Supabase environment variables are missing."
          }
        />

        <SettingsCard
          icon="wallet-outline"
          title="Wallets"
          description="USD and LBP are tracked separately."
        />

        {session && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Password</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              We email a reset link to {session.user.email ?? "your account"}.
            </ThemedText>
            <Pressable
              onPress={handleSendPasswordReset}
              disabled={sendingReset || !isSupabaseConfigured}
              accessibilityRole="button"
              accessibilityLabel="Send password reset link"
              style={({ pressed }) => [
                styles.outlineButton,
                {
                  borderColor: theme.backgroundSelected,
                  opacity:
                    pressed || sendingReset || !isSupabaseConfigured ? 0.65 : 1,
                },
              ]}
            >
              <ThemedText type="smallBold">
                {sendingReset ? "Sending…" : "Send reset link"}
              </ThemedText>
            </Pressable>
            {resetMessage && (
              <ThemedText type="small" themeColor="textSecondary">
                {resetMessage}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {session && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Session</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Sign out from this device.
            </ThemedText>
            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              style={styles.signOutButton}
            >
              <ThemedText type="smallBold" style={styles.signOutText}>
                Sign out
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}
