import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsCard } from "@/components/settings-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

import { styles } from "./settings.styles";

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { session } = useAuthSession();

  async function handleSignOut() {
    await supabase?.auth.signOut();
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
