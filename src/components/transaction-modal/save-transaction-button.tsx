import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { isSupabaseConfigured } from "@/lib/supabase";

import { styles } from "./transaction-modal.styles";

type SaveTransactionButtonProps = {
  saving: boolean;
  onPress: () => void;
};

export function SaveTransactionButton({
  saving,
  onPress,
}: SaveTransactionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={saving || !isSupabaseConfigured}
      accessibilityRole="button"
      accessibilityLabel="Save transaction"
      style={({ pressed }) => [
        styles.saveButton,
        { opacity: pressed || saving || !isSupabaseConfigured ? 0.65 : 1 },
      ]}
    >
      <ThemedText type="smallBold" style={styles.saveButtonText}>
        {saving ? "Saving…" : "Save transaction"}
      </ThemedText>
    </Pressable>
  );
}
