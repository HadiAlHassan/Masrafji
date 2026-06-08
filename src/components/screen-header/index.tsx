import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./screen-header.styles";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  onAddPress?: () => void;
  addAccessibilityLabel?: string;
};

export function ScreenHeader({
  eyebrow,
  title,
  onAddPress,
  addAccessibilityLabel = "Add transaction",
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <ThemedText type="small" themeColor="textSecondary">
          {eyebrow}
        </ThemedText>
        <ThemedText type="subtitle">{title}</ThemedText>
      </View>

      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel={addAccessibilityLabel}
          style={styles.addButton}>
          <Ionicons name="add" size={30} color="#ffffff" />
        </Pressable>
      )}
    </View>
  );
}
