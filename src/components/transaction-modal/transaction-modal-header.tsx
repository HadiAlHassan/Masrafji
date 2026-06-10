import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./transaction-modal.styles";

type TransactionModalHeaderProps = {
  isEditing: boolean;
  onClose: () => void;
};

export function TransactionModalHeader({
  isEditing,
  onClose,
}: TransactionModalHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.sheetHeader}>
      <View>
        <ThemedText type="small" themeColor="textSecondary">
          {isEditing ? "Edit transaction" : "New transaction"}
        </ThemedText>
        <ThemedText type="subtitle">
          {isEditing ? "Update cashflow" : "Add cashflow"}
        </ThemedText>
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close add transaction modal"
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}
