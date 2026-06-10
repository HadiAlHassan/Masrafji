import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { ExpenseCategory } from "@/lib/database.types";
import { transactionCategoryDetails } from "@/lib/transaction-helpers";

import { styles } from "./transaction-modal.styles";

type CategorySelectorButtonProps = {
  category: ExpenseCategory;
  onPress: () => void;
};

export function CategorySelectorButton({
  category,
  onPress,
}: CategorySelectorButtonProps) {
  const theme = useTheme();
  const categoryDetails = transactionCategoryDetails[category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Category ${categoryDetails.label}`}
      style={[
        styles.categorySelector,
        { borderColor: theme.backgroundSelected },
      ]}
    >
      <View style={styles.categorySelectorContent}>
        <Ionicons name={categoryDetails.icon} size={22} color={theme.text} />
        <View>
          <ThemedText type="small" themeColor="textSecondary">
            Category
          </ThemedText>
          <ThemedText type="smallBold">{categoryDetails.label}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}
